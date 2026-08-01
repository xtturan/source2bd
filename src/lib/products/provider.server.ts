import type { ProductProvider } from "./types";
import { mockProvider } from "./mock-provider";
import { createApifyProvider } from "./apify-provider.server";

/** PRODUCT_PROVIDER=mock (default, zero cost) | apify (live marketplaces). */
export function getProductProvider(): ProductProvider {
  const name = (process.env["PRODUCT_PROVIDER"] ?? "mock").toLowerCase();
  if (name === "apify") return createApifyProvider();
  return mockProvider;
}

export const providerFallbackMessage =
  "Live marketplace lookup is paused. Send the link, keyword or photo to our WhatsApp desk and we will quote it by hand today.";
