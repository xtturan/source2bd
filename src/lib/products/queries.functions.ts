import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ProductDetail, SearchResult } from "./types";

const marketplaceSchema = z.enum(["1688", "alibaba", "aliexpress", "amazon", "global"]);

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        q: z.string().trim().max(120).default(""),
        marketplace: marketplaceSchema.default("global"),
        page: z.number().int().min(1).max(50).default(1),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<SearchResult> => {
    const { getProductProvider } = await import("./provider.server");
    const { cached } = await import("@/lib/api/guard.server");
    return cached(`fn-search:${data.marketplace}:${data.q}:${data.page}`, () =>
      getProductProvider().search(data.q, { marketplace: data.marketplace, page: data.page }),
    );
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
    z.object({ id: z.string().trim().min(1).max(64), marketplace: marketplaceSchema }).parse(d),
  )
  .handler(async ({ data }): Promise<ProductDetail | null> => {
    const { getProductProvider } = await import("./provider.server");
    const { cached } = await import("@/lib/api/guard.server");
    return cached(`fn-detail:${data.marketplace}:${data.id}`, () =>
      getProductProvider().getById(data.id, data.marketplace),
    );
  });
