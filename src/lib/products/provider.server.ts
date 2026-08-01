import type { ProductProvider } from "./types";
import { mockProvider } from "./mock-provider";
import { createJustOneProvider } from "./justone-provider.server";
import { createRapidProvider } from "./rapid-provider.server";

export function getProductProvider(): ProductProvider {
  const name = (process.env["PRODUCT_PROVIDER"] ?? "mock").toLowerCase();
  switch (name) {
    case "justone":
      return createJustOneProvider();
    case "rapid1688":
      return createRapidProvider();
    default:
      return mockProvider;
  }
}