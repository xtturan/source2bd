import type { ProductProvider } from "./types";
import { mockProvider } from "./mock-provider";
import { createParseProvider } from "./parse-provider.server";
import { createElimProvider } from "./elim-provider.server";

/** PRODUCT_PROVIDER=elim (live, default) | parse-legacy (parse.bot only) | mock (zero cost). */
export function getProductProvider(): ProductProvider {
  const name = (process.env["PRODUCT_PROVIDER"] ?? "elim").toLowerCase();
  const provider = name === "mock" ? mockProvider : name === "parse-legacy" ? createParseProvider() : createElimProvider();
  if (name === "mock") return provider;

  const authorize = async () => {
    const { assertLiveLookupAuthorized } = await import("@/lib/api/quota.server");
    await assertLiveLookupAuthorized();
  };

  return {
    async search(query, opts) {
      await authorize();
      return provider.search(query, opts);
    },
    async getById(id, marketplace) {
      await authorize();
      return provider.getById(id, marketplace);
    },
    async getByUrl(url) {
      await authorize();
      return provider.getByUrl(url);
    },
    ...(provider.searchByImage
      ? {
          async searchByImage(imageUrl, opts) {
            await authorize();
            return provider.searchByImage?.(imageUrl, opts) ?? { items: [] };
          },
        }
      : {}),
  };
}

export const providerFallbackMessage =
  "Live marketplace lookup is paused. Send the link, keyword or photo to our WhatsApp desk and we will quote it by hand today.";
