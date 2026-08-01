import type { ProductDetail, ProductProvider, ProductSource, SearchResult } from "./types";
import { parseProductUrl } from "./mock-provider";

/**
 * Thin RapidAPI 1688 adapter stub.
 * Set RAPIDAPI_KEY + RAPIDAPI_HOST and PRODUCT_PROVIDER=rapid1688.
 * TODO: map endpoints and response shapes for the specific RapidAPI listing you subscribe to.
 */
export function createRapidProvider(): ProductProvider {
  const key = process.env["RAPIDAPI_KEY"] ?? "";
  const host = process.env["RAPIDAPI_HOST"] ?? "";

  async function call<T>(path: string, params: Record<string, string>): Promise<T> {
    if (!key || !host) throw new Error("RAPIDAPI_KEY / RAPIDAPI_HOST are not set");
    const url = new URL(path, `https://${host}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, {
      headers: { "x-rapidapi-key": key, "x-rapidapi-host": host },
    });
    if (!res.ok) throw new Error(`RapidAPI error ${res.status}`);
    return (await res.json()) as T;
  }

  return {
    name: "rapid1688",
    async search(query: string, page = 1): Promise<SearchResult> {
      await call("/search", { keyword: query, page: String(page) });
      return { items: [], page };
    },
    async getById(id: string, _source: ProductSource = "1688"): Promise<ProductDetail | null> {
      await call("/detail", { itemId: id });
      return null;
    },
    async getByUrl(url: string): Promise<ProductDetail | null> {
      const parsed = parseProductUrl(url);
      return parsed ? this.getById(parsed.id, parsed.source) : null;
    },
  };
}