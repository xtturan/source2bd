import type { Marketplace, ProductSummary, SearchResult } from "./types";

/**
 * Durable search cache.
 *
 * Every keyword search a shopper runs is stored in the database, so the next
 * person asking for the same thing gets an instant answer with no provider
 * cost, and the homepage can show real listings people actually looked for.
 */

const FRESH_MS = 7 * 24 * 60 * 60 * 1000;

function key(query: string, marketplace: Marketplace, page: number) {
  return { query: query.trim().toLowerCase(), marketplace, page };
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function readSearchCache(
  query: string,
  marketplace: Marketplace,
  page: number,
): Promise<SearchResult | null> {
  const k = key(query, marketplace, page);
  if (!k.query) return null;
  try {
    const db = await admin();
    const { data, error } = await db
      .from("search_cache")
      .select("results, updated_at")
      .eq("query", k.query)
      .eq("marketplace", k.marketplace)
      .eq("page", k.page)
      .maybeSingle();
    if (error || !data) return null;
    if (Date.now() - new Date(data.updated_at as string).getTime() > FRESH_MS) return null;
    const items = data.results as unknown as ProductSummary[];
    if (!Array.isArray(items) || !items.length) return null;
    void bumpHits(k.query, k.marketplace, k.page);
    return { items, page };
  } catch (err) {
    console.error("search cache read failed", err);
    return null;
  }
}

async function bumpHits(query: string, marketplace: Marketplace, page: number) {
  try {
    const db = await admin();
    const { data } = await db
      .from("search_cache")
      .select("hits")
      .eq("query", query)
      .eq("marketplace", marketplace)
      .eq("page", page)
      .maybeSingle();
    if (!data) return;
    await db
      .from("search_cache")
      .update({ hits: (data.hits as number) + 1 })
      .eq("query", query)
      .eq("marketplace", marketplace)
      .eq("page", page);
  } catch {
    /* counting is best effort */
  }
}

export async function writeSearchCache(
  query: string,
  marketplace: Marketplace,
  page: number,
  result: SearchResult,
) {
  const k = key(query, marketplace, page);
  if (!k.query || !result.items.length) return;
  try {
    const db = await admin();
    await db.from("search_cache").upsert(
      {
        query: k.query,
        marketplace: k.marketplace,
        page: k.page,
        results: result.items as unknown as never,
        item_count: result.items.length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "query,marketplace,page" },
    );
  } catch (err) {
    console.error("search cache write failed", err);
  }
}

export type ShowcaseRow = { query: string; items: ProductSummary[] };

export type CatalogueItem = ProductSummary & { query: string };

/**
 * Everything we have ever cached, flattened for the browsable catalogue.
 * De-duplicated by marketplace + id so the same product never repeats.
 */
export async function readCatalogue(limit = 600): Promise<CatalogueItem[]> {
  try {
    const db = await admin();
    const { data, error } = await db
      .from("search_cache")
      .select("query, results")
      .gt("item_count", 0)
      .order("hits", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(120);
    if (error || !data) return [];
    const seen = new Set<string>();
    const out: CatalogueItem[] = [];
    for (const row of data) {
      const query = row.query as string;
      const items = row.results as unknown as ProductSummary[];
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        if (!item?.id) continue;
        const k = `${item.marketplace}-${item.id}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push({ ...item, query });
        if (out.length >= limit) return out;
      }
    }
    return out;
  } catch (err) {
    console.error("catalogue read failed", err);
    return [];
  }
}

/** Most searched keywords with their saved listings, for the homepage. */
export async function readShowcase(limit = 4): Promise<ShowcaseRow[]> {
  try {
    const db = await admin();
    const { data, error } = await db
      .from("search_cache")
      .select("query, results")
      .eq("page", 1)
      .gt("item_count", 3)
      .order("hits", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(limit * 3);
    if (error || !data) return [];
    const seen = new Set<string>();
    const rows: ShowcaseRow[] = [];
    for (const row of data) {
      const q = row.query as string;
      if (seen.has(q)) continue;
      seen.add(q);
      const items = row.results as unknown as ProductSummary[];
      if (!Array.isArray(items) || items.length < 4) continue;
      rows.push({ query: q, items: items.slice(0, 4) });
      if (rows.length >= limit) break;
    }
    return rows;
  } catch (err) {
    console.error("showcase read failed", err);
    return [];
  }
}