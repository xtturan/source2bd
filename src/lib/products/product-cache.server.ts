import type { Marketplace, ProductDetail, ProductSummary } from "./types";

/**
 * Durable product-detail cache.
 *
 * A product page should cost the marketplace API at most once. After that it
 * is served straight from our own database, for every visitor, on every
 * server instance — unlike the in-memory cache, which dies with the worker.
 */

/**
 * Product pages never auto-refresh from a paid provider. Marketplace data can
 * drift, but serving a labelled cached snapshot is safer than letting crawlers
 * turn age into paid cache misses. Fresh data is obtained through a deliberate
 * signed-in search/link lookup instead.
 */
const EVICT_MS = 180 * 24 * 60 * 60 * 1000;

let lastPrune = 0;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function readProductCache(
  marketplace: Marketplace,
  id: string,
): Promise<ProductDetail | null> {
  try {
    const db = await admin();
    const { data, error } = await db
      .from("product_cache")
      .select("payload, updated_at, hits")
      .eq("marketplace", marketplace)
      .eq("product_id", id)
      .maybeSingle();
    if (error || !data) return null;
    void db
      .from("product_cache")
      .update({ hits: ((data.hits as number) ?? 0) + 1 })
      .eq("marketplace", marketplace)
      .eq("product_id", id);
    return data.payload as unknown as ProductDetail;
  } catch (err) {
    console.error("product cache read failed", err);
    return null;
  }
}

export async function readProductCacheByUrl(url: string): Promise<ProductDetail | null> {
  try {
    const db = await admin();
    const { data, error } = await db
      .from("product_cache")
      .select("payload, updated_at")
      .eq("source_url", url)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data.payload as unknown as ProductDetail;
  } catch (err) {
    console.error("product cache url read failed", err);
    return null;
  }
}

export async function writeProductCache(detail: ProductDetail | null, sourceUrl?: string) {
  if (!detail?.id) return;
  try {
    const db = await admin();
    await db.from("product_cache").upsert(
      {
        marketplace: detail.marketplace,
        product_id: detail.id,
        source_url: sourceUrl ?? detail.productUrl ?? null,
        payload: detail as unknown as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "marketplace,product_id" },
    );
    void pruneProductCache();
  } catch (err) {
    console.error("product cache write failed", err);
  }
}

/**
 * Prime product pages from search results. A summary is enough to render a
 * useful, quoteable page and prevents every catalogue click from becoming a
 * second paid detail request. A full detail fetch can overwrite it later.
 */
export async function writeProductSummariesCache(items: ProductSummary[]) {
  const rows = items
    .filter((item) => item?.id && item.marketplace)
    .map((item) => ({
      marketplace: item.marketplace,
      product_id: item.id,
      source_url: item.productUrl || null,
      payload: { ...item, images: item.imageUrl ? [item.imageUrl] : [] } as unknown as never,
      updated_at: new Date().toISOString(),
    }));
  if (!rows.length) return;
  try {
    const db = await admin();
    await db.from("product_cache").upsert(rows, {
      onConflict: "marketplace,product_id",
      // Never replace a richer detail record with a search-result summary.
      ignoreDuplicates: true,
    });
    void pruneProductCache();
  } catch (err) {
    console.error("product summary cache write failed", err);
  }
}

export async function pruneProductCache() {
  if (Date.now() - lastPrune < 60 * 60 * 1000) return;
  lastPrune = Date.now();
  try {
    const db = await admin();
    await db
      .from("product_cache")
      .delete()
      .lt("updated_at", new Date(Date.now() - EVICT_MS).toISOString());
  } catch (err) {
    console.error("product cache prune failed", err);
  }
}
