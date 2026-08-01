import type { ProductDetail, ProductProvider, ProductSource, SearchResult } from "./types";
import { parseProductUrl } from "./mock-provider";

/**
 * JustOneAPI (justoneapi.com) provider — 1688 wholesale product data.
 *
 * Register at justoneapi.com, grab the free-trial token from the dashboard,
 * then set:
 *   PRODUCT_PROVIDER=justone
 *   JUSTONE_API_TOKEN=...
 *   JUSTONE_BASE_URL=https://api.justoneapi.com
 *
 * TODO: confirm the exact endpoint paths against the dashboard docs — the
 * paths below follow their documented shape but may need adjusting.
 */
export function createJustOneProvider(): ProductProvider {
  const token = process.env["JUSTONE_API_TOKEN"] ?? "";
  const baseUrl = process.env["JUSTONE_BASE_URL"] ?? "https://api.justoneapi.com";

  async function call<T>(path: string, params: Record<string, string>): Promise<T> {
    if (!token) throw new Error("JUSTONE_API_TOKEN is not set");
    const url = new URL(path, baseUrl);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    if (res.status === 401 || res.status === 403)
      throw new Error("JustOneAPI rejected the token (401/403). Check JUSTONE_API_TOKEN.");
    if (res.status === 429) throw new Error("JustOneAPI rate limit hit. Retry shortly.");
    if (!res.ok) throw new Error(`JustOneAPI error ${res.status}: ${await res.text()}`);

    return (await res.json()) as T;
  }

  return {
    name: "justone",
    async search(query: string, page = 1): Promise<SearchResult> {
      // TODO: map the real response shape to ProductSummary[]
      await call("/1688/item_search", { q: query, page: String(page) });
      return { items: [], page };
    },
    async getById(id: string, _source: ProductSource = "1688"): Promise<ProductDetail | null> {
      // TODO: map the real response shape to ProductDetail
      await call("/1688/item_detail", { num_iid: id });
      return null;
    },
    async getByUrl(url: string): Promise<ProductDetail | null> {
      const parsed = parseProductUrl(url);
      if (!parsed) return null;
      return this.getById(parsed.id, parsed.source);
    },
  };
}