import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ProductDetail, ProductSummary, SearchResult } from "./types";
import type { CatalogueItem, ShowcaseRow } from "./search-cache.server";

/** Shape the UI reads to render "আজকের বাকি খোঁজা: X/30". */
export interface QuotaInfo {
  searchLimit: number;
  remainingSearches: number;
  resetAt: string;
}

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        q: z.string().trim().max(100).default(""),
        marketplace: z.enum(["1688", "taobao", "alibaba", "aliexpress", "amazon", "global"]).default("1688"),
        page: z.number().int().min(1).max(50).default(1),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<SearchResult & Partial<QuotaInfo>> => {
    const { getProductProvider } = await import("./provider.server");
    const { cached } = await import("@/lib/api/guard.server");
    const { readSearchCache, writeSearchCache } = await import("./search-cache.server");
    const { writeProductSummariesCache } = await import("./product-cache.server");
    const { consumeQuota, readQuota } = await import("@/lib/api/quota.server");

    let quota: { limit: number; remaining: number; resetAt: string } | null = null;

    const result = await cached(`fn-search:v5:${data.marketplace}:${data.q}:${data.page}`, async () => {
      const stored = await readSearchCache(data.q, data.marketplace, data.page);
      // Cache hit never burns the daily allowance.
      if (stored) return stored;
      quota = await consumeQuota("search", 1, `${data.marketplace}: ${data.q}`);
      try {
        const fresh = await getProductProvider().search(data.q, {
          marketplace: data.marketplace,
          page: data.page,
        });
        await Promise.all([
          writeSearchCache(data.q, data.marketplace, data.page, fresh),
          writeProductSummariesCache(fresh.items),
        ]);
        return fresh;
      } catch (err) {
        const { noteIncident } = await import("@/lib/api/error-log.server");
        noteIncident("search.keyword", err, `${data.marketplace} · "${data.q}" · page ${data.page}`);
        throw err;
      }
    });

    const state = quota ?? (await readQuota("search"));
    return {
      ...result,
      ...(state
        ? {
            searchLimit: state.limit,
            remainingSearches: state.remaining,
            resetAt: state.resetAt,
          }
        : {}),
    };
  });

/** Today's remaining allowance, for the counter next to the search box. */
export const myQuota = createServerFn({ method: "GET" }).handler(
  async (): Promise<QuotaInfo | null> => {
    const { readQuota } = await import("@/lib/api/quota.server");
    const state = await readQuota("search");
    if (!state) return null;
    return {
      searchLimit: state.limit,
      remainingSearches: state.remaining,
      resetAt: state.resetAt,
    };
  },
);

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

/** Photo search: shares the same 30/day pot as keyword search. */
export const productsByPhoto = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        image: z
          .string()
          .trim()
          .min(64)
          // ~5MB binary once base64 is decoded.
          .max(7_000_000)
          .regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, "unsupported image type"),
        marketplace: z.enum(["1688", "taobao"]).default("1688"),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ items: ProductSummary[] } & Partial<QuotaInfo>> => {
    const { searchByPhoto } = await import("./image-search.server");
    const { consumeQuota } = await import("@/lib/api/quota.server");
    const state = await consumeQuota("search", 1, `photo: ${data.marketplace}`);
    let res: Awaited<ReturnType<typeof searchByPhoto>>;
    try {
      res = await searchByPhoto(data.image, data.marketplace);
    } catch (err) {
      const { noteIncident } = await import("@/lib/api/error-log.server");
      noteIncident("search.photo", err, data.marketplace);
      throw err;
    }
    return {
      items: res.items,
      searchLimit: state.limit,
      remainingSearches: state.remaining,
      resetAt: state.resetAt,
    };
  });

export const productByUrl = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ url: z.string().trim().min(8).max(2048) }).parse(d))
  .handler(async ({ data }): Promise<ProductDetail | null> => {
    const { getProductProvider } = await import("./provider.server");
    const { cached } = await import("@/lib/api/guard.server");
    const { consumeQuota } = await import("@/lib/api/quota.server");
    const { assertSafeUrl } = await import("@/lib/api/url-guard.server");
    const { readProductCacheByUrl, writeProductCache } = await import("./product-cache.server");
    const safe = assertSafeUrl(data.url);
    return cached(`fn-url:${safe}`, async () => {
      // Served from our own database: no provider call, no daily allowance spent.
      const stored = await readProductCacheByUrl(safe);
      if (stored) return stored;
      await consumeQuota("link", 1, safe);
      const fresh = await getProductProvider().getByUrl(safe);
      await writeProductCache(fresh, safe);
      return fresh;
    });
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
    const { consumeQuota } = await import("@/lib/api/quota.server");
    const { readProductCache, writeProductCache } = await import("./product-cache.server");
    return cached(`fn-detail:${data.marketplace}:${data.id}`, async () => {
      const stored = await readProductCache(data.marketplace, data.id);
      if (stored) return stored;
      await consumeQuota("detail", 1, `${data.marketplace}: ${data.id}`);
      const fresh = await getProductProvider().getById(data.id, data.marketplace);
      await writeProductCache(fresh);
      return fresh;
    });
  });
