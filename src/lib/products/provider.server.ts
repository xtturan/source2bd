import type { ProductProvider } from "./types";
import { mockProvider } from "./mock-provider";
import { createParseProvider } from "./parse-provider.server";
import { createElimProvider } from "./elim-provider.server";

/** PRODUCT_PROVIDER=elim (live, default) | parse (legacy) | mock (zero cost). */
export function getProductProvider(): ProductProvider {
  const name = (process.env["PRODUCT_PROVIDER"] ?? "elim").toLowerCase();
  if (name === "mock") return mockProvider;
  if (name === "parse") return createParseProvider();
  return createElimProvider();
}

export const providerFallbackMessage =
  "Live marketplace lookup is paused. Send the link, keyword or photo to our WhatsApp desk and we will quote it by hand today.";
