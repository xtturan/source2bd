import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { SEED_CATALOG_QUERIES } from "./seed";

/**
 * Admin catalogue seeding.
 *
 * Runs curated seed queries through the exact same pipeline a shopper search
 * uses (canonical query -> search cache read -> provider -> cache write), so
 * the warmed rows are identical to organic ones: same key format, same
 * product_cache rows, same homepage rail and catalogue sources.
 *
 * Sequential on purpose: the provider is a flat-priced paid API and the
 * site-wide credit fuse protects the budget. Only queries with no fresh cache
 * row are fetched, so re-running the seeder is cheap and idempotent.
 */

type SupabaseLike = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
};

async function assertAdmin(context: { supabase: SupabaseLike; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("FORBIDDEN");
}

export interface SeedReport {
  done: string[];
  skipped: string[];
  failed: { query: string; reason: string }[];
  items: number;
}

export const seedCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ dryRun: z.boolean().default(false) }).parse(d))
  .handler(async ({ context, data }): Promise<SeedReport> => {
    await assertAdmin(context as unknown as { supabase: SupabaseLike; userId: string });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { canonicalQuery } = await import("./bn-keywords");
    const { readSearchCache, writeSearchCache } = await import("./search-cache.server");
    const { writeProductSummariesCache } = await import("./product-cache.server");

    const report: SeedReport = { done: [], skipped: [], failed: [], items: 0 };

    for (const raw of SEED_CATALOG_QUERIES) {
      const q = canonicalQuery(raw);
      if (!q) continue;

      // Fresh row already present? Skip without spending provider credit.
      const existing = await readSearchCache(q, "1688", 1).catch(() => null);
      if (existing) {
        report.skipped.push(q);
        continue;
      }
      if (data.dryRun) {
        report.done.push(q);
        continue;
      }

      try {
        const { getProductProvider } = await import("./provider.server");
        const fresh = await getProductProvider().search(q, { marketplace: "1688", page: 1 });
        if (fresh.items.length) {
          await Promise.all([
            writeSearchCache(q, "1688", 1, fresh),
            writeProductSummariesCache(fresh.items),
          ]);
          report.items += fresh.items.length;
          report.done.push(q);
        } else {
          report.skipped.push(q);
        }
      } catch (err) {
        report.failed.push({ query: q, reason: err instanceof Error ? err.message : String(err) });
      }
    }

    return report;
  });
