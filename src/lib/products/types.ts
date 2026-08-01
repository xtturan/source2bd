export type ProductSource = "1688" | "alibaba";

export type ProductSummary = {
  id: string;
  source: ProductSource;
  title: string;
  titleBn?: string | undefined;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  currency: "CNY";
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
  search(query: string, page?: number): Promise<SearchResult>;
  getById(id: string, source?: ProductSource): Promise<ProductDetail | null>;
  getByUrl(url: string): Promise<ProductDetail | null>;
}

export const PAGE_SIZE = 12;