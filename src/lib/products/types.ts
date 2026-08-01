export type Marketplace = "1688" | "alibaba" | "aliexpress" | "amazon" | "global";

export const marketplaceLabels: Record<Marketplace, string> = {
  "1688": "1688",
  alibaba: "Alibaba",
  aliexpress: "AliExpress",
  amazon: "Amazon",
  global: "Global",
};

export type ProductSummary = {
  id: string;
  marketplace: Marketplace;
  title: string;
  titleBn?: string | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  currency: "CNY" | "USD";
  moq?: number | undefined;
  imageUrl?: string | undefined;
  shopName?: string | undefined;
  city?: string | undefined;
  productUrl: string;
  ordersHint?: string | undefined;
  category?: string | undefined;
};

export type ProductDetail = ProductSummary & {
  images: string[];
  priceTiers?: { minQty: number; price: number }[] | undefined;
  attributes?: { label: string; value: string }[] | undefined;
  description?: string | undefined;
  manualQuoteOnly?: boolean | undefined;
};

export interface SearchResult {
  items: ProductSummary[];
  page: number;
  totalApprox?: number | undefined;
}

export interface ProductProvider {
  name: string;
  search(
    query: string,
    opts?: { marketplace?: Marketplace; page?: number },
  ): Promise<SearchResult>;
  getById(id: string, marketplace?: Marketplace): Promise<ProductDetail | null>;
  getByUrl(url: string): Promise<ProductDetail | null>;
  searchByImage?(
    imageUrl: string,
    opts?: { marketplace?: Marketplace },
  ): Promise<{ items: ProductSummary[] }>;
}

export const PAGE_SIZE = 24;

/**
 * Origins fanned out in parallel when the shopper picks "All origins".
 * Amazon is off: it burns credit fast and rarely fits the cargo use case.
 */
export const FANOUT_ORIGINS: Marketplace[] = ["1688", "alibaba", "aliexpress"];

export function isMarketplace(v: string): v is Marketplace {
  return (
    v === "1688" ||
    v === "alibaba" ||
    v === "aliexpress" ||
    v === "amazon" ||
    v === "global"
  );
}

export function currencySymbol(c: "CNY" | "USD") {
  return c === "USD" ? "$" : "CNY ";
}
