import type { ProductProvider } from "./types";
import { mockProvider } from "./mock-provider";
import { createApifyProvider } from "./apify-provider.server";
import { createParseProvider } from "./parse-provider.server";

/** PRODUCT_PROVIDER=parse (live, default) | apify (legacy) | mock (zero cost). */
export function getProductProvider(): ProductProvider {
  const name = (process.env["PRODUCT_PROVIDER"] ?? "parse").toLowerCase();
  if (name === "parse") return createParseProvider();
  if (name === "apify") return createApifyProvider();
  return mockProvider;
}

export const providerFallbackMessage =
  "Live marketplace lookup is paused. Send the link, keyword or photo to our WhatsApp desk and we will quote it by hand today.";
