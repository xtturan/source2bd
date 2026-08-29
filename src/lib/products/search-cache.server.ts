import type { Marketplace, ProductSummary, SearchResult } from "./types";

/**
 * Durable search cache.
 *
 * Every keyword search a shopper runs is stored in the database, so the next
 * person asking for the same thing gets an instant answer with no provider
 * cost, and the homepage can show real listings people actually looked for.
 */

/** Prices move, so a cached search stops being served after this. */
const FRESH_MS = 3 * 24 * 60 * 60 * 1000;
/** Rows older than this are deleted outright, keeping the table small. */
const EVICT_MS = 45 * 24 * 60 * 60 * 1000;
/** Hard ceiling on stored rows; the least useful ones go first. */
const MAX_ROWS = 4000;

let lastPrune = 0;

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
    void pruneSearchCache();
  } catch (err) {
    console.error("search cache write failed", err);
  }
}

/**
 * Eviction: runs at most once an hour, after a write. Drops anything past the
 * retention window, then trims the table back to MAX_ROWS by removing the
 * coldest (fewest hits, oldest) rows.
 */
export async function pruneSearchCache() {
  if (Date.now() - lastPrune < 60 * 60 * 1000) return;
  lastPrune = Date.now();
  try {
    const db = await admin();
    const cutoff = new Date(Date.now() - EVICT_MS).toISOString();
    await db.from("search_cache").delete().lt("updated_at", cutoff);

    const { count } = await db.from("search_cache").select("id", { count: "exact", head: true });
    if (!count || count <= MAX_ROWS) return;

    const { data } = await db
      .from("search_cache")
      .select("id")
      .order("hits", { ascending: true })
      .order("updated_at", { ascending: true })
      .limit(count - MAX_ROWS);
    const ids = (data ?? []).map((r) => r.id as string);
    if (ids.length) await db.from("search_cache").delete().in("id", ids);
  } catch (err) {
    console.error("search cache prune failed", err);
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
/**
 * Free, login-free keyword lookup over what we have already paid for.
 * Guests and first-time visitors see products instantly instead of a wall.
 */
export async function readCachedMatches(q: string, limit = 24): Promise<CatalogueItem[]> {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const words = needle.split(/\s+/).filter((w) => w.length > 1);
  try {
    const db = await admin();
    const { data, error } = await db
      .from("search_cache")
      .select("query, results")
      .gt("item_count", 0)
      .order("hits", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(160);
    if (error || !data) return [];

    const seen = new Set<string>();
    const scored: { score: number; item: CatalogueItem }[] = [];
    for (const row of data) {
      const query = ((row.query as string) ?? "").toLowerCase();
      const items = row.results as unknown as ProductSummary[];
      if (!Array.isArray(items)) continue;
      const queryScore = query === needle ? 6 : query.includes(needle) ? 4 : 0;
      for (const item of items) {
        if (!item?.id) continue;
        const k = `${item.marketplace}-${item.id}`;
        if (seen.has(k)) continue;
        const title = (item.title ?? "").toLowerCase();
        let score = queryScore;
        if (title.includes(needle)) score += 5;
        for (const w of words) {
          if (title.includes(w)) score += 2;
          else if (query.includes(w)) score += 1;
        }
        if (score <= 0) continue;
        seen.add(k);
        scored.push({ score, item: { ...item, query: row.query as string } });
      }
    }
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.item);
  } catch (err) {
    console.error("cached match read failed", err);
    return [];
  }
}

/**
 * Autocomplete suggestions: the most-searched cached queries matching what
 * the shopper has typed so far. Free (cache-only), prefix OR substring
 * matched, capped small so the datalist stays scannable.
 */
export async function readSuggestedQueries(q: string, limit = 6): Promise<string[]> {
  const needle = q.trim().toLowerCase();
  if (needle.length < 2) return [];
  try {
    const db = await admin();
    const { data, error } = await db
      .from("search_cache")
      .select("query, hits")
      .gt("item_count", 0)
      .order("hits", { ascending: false })
      .limit(120);
    if (error || !data) return [];
    const seen = new Set<string>();
    const out: { q: string; hits: number }[] = [];
    for (const row of data) {
      const query = ((row.query as string) ?? "").toLowerCase();
      if (!query || seen.has(query)) continue;
      if (query === needle) continue; // already exactly what they typed
      if (!query.includes(needle)) continue;
      seen.add(query);
      out.push({ q: row.query as string, hits: (row.hits as number) ?? 0 });
      if (out.length >= limit) break;
    }
    return out.map((s) => s.q);
  } catch (err) {
    console.error("suggestion read failed", err);
    return [];
  }
}
