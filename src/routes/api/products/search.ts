import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProductProvider, providerFallbackMessage } from "@/lib/products/provider.server";
import { cached, rateLimited, tooMany } from "@/lib/api/guard.server";
import { consumeQuota, QuotaError, DAILY_LIMIT, nextDhakaMidnight } from "@/lib/api/quota.server";

const schema = z.object({
  q: z.string().trim().max(120).default(""),
  marketplace: z.enum(["1688", "taobao", "alibaba", "aliexpress", "amazon", "global"]).default("1688"),
  page: z.coerce.number().int().min(1).max(50).default(1),
});

export const Route = createFileRoute("/api/products/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (rateLimited(request)) return tooMany();
        const url = new URL(request.url);
        const parsed = schema.safeParse({
          q: url.searchParams.get("q") ?? "",
          marketplace: url.searchParams.get("marketplace") ?? "1688",
          page: url.searchParams.get("page") ?? 1,
        });
        if (!parsed.success) return Response.json({ error: "Invalid query" }, { status: 400 });

        const { q, marketplace, page } = parsed.data;
        try {
          const data = await cached(`search:${marketplace}:${q}:${page}`, async () => {
            await consumeQuota(1);
            return getProductProvider().search(q, { marketplace, page });
          });
          return Response.json(data);
        } catch (err) {
          if (err instanceof QuotaError) {
            return Response.json(
              {
                ok: false,
                code: "DAILY_SEARCH_LIMIT",
                limit: DAILY_LIMIT,
                remaining: 0,
                resetAt: nextDhakaMidnight(),
              },
              { status: 429 },
            );
          }
          console.error("search failed", err);
          return Response.json({ error: providerFallbackMessage }, { status: 502 });
        }
      },
    },
  },
});
