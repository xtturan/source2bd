import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ProductDetail, ProductSummary, SearchResult } from "./types";
import type { CatalogueItem, ShowcaseRow } from "./search-cache.server";

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        q: z.string().trim().max(120).default(""),
        marketplace: z.enum(["1688", "taobao", "alibaba", "aliexpress", "amazon", "global"]).default("1688"),
        page: z.number().int().min(1).max(50).default(1),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<SearchResult> => {
    const { getProductProvider } = await import("./provider.server");
    const { cached } = await import("@/lib/api/guard.server");
    const { readSearchCache, writeSearchCache } = await import("./search-cache.server");
    return cached(`fn-search:v5:${data.marketplace}:${data.q}:${data.page}`, async () => {
      const stored = await readSearchCache(data.q, data.marketplace, data.page);
      if (stored) return stored;
      const fresh = await getProductProvider().search(data.q, {
        marketplace: data.marketplace,
        page: data.page,
      });
      await writeSearchCache(data.q, data.marketplace, data.page, fresh);
      return fresh;
    });
  });

/** Popular saved searches, used to fill the homepage with real listings. */
export const showcaseSearches = createServerFn({ method: "GET" }).handler(
  async (): Promise<ShowcaseRow[]> => {
    const { readShowcase } = await import("./search-cache.server");
    return readShowcase(4);
  },
);

/** Every cached product, flattened, for the browsable catalogue. */
export const catalogueProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogueItem[]> => {
    const { readCatalogue } = await import("./search-cache.server");
    return readCatalogue(600);
  },
);

/** Photo search: upload the picture, then match it on the marketplace. */
export const productsByPhoto = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        image: z.string().trim().min(64).max(11_500_000),
        marketplace: z.enum(["1688", "taobao"]).default("1688"),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ items: ProductSummary[] }> => {
    const { searchByPhoto } = await import("./image-search.server");
    const res = await searchByPhoto(data.image, data.marketplace);
    return { items: res.items };
  });

export const productByUrl = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ url: z.string().trim().min(8).max(600) }).parse(d))
  .handler(async ({ data }): Promise<ProductDetail | null> => {
    const { getProductProvider } = await import("./provider.server");
    const { cached } = await import("@/lib/api/guard.server");
    return cached(`fn-url:${data.url}`, () => getProductProvider().getByUrl(data.url));
  });

export const productById = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().trim().min(1).max(64),
        marketplace: z.enum(["1688", "taobao", "alibaba", "aliexpress", "amazon", "global"]),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<ProductDetail | null> => {
    const { getProductProvider } = await import("./provider.server");
    const { cached } = await import("@/lib/api/guard.server");
    return cached(`fn-detail:${data.marketplace}:${data.id}`, () =>
      getProductProvider().getById(data.id, data.marketplace),
    );
  });
