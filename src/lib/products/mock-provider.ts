import { mockProducts } from "./mock-data";
import type {
  Marketplace,
  ProductDetail,
  ProductProvider,
  ProductSummary,
  SearchResult,
} from "./types";
import { PAGE_SIZE } from "./types";

function toSummary(p: ProductDetail): ProductSummary {
  const { images: _images, priceTiers: _t, attributes: _a, description: _d, ...rest } = p;
  return rest;
}

/** Extract a marketplace offer id from a pasted product URL. */
export function parseProductUrl(
  raw: string,
): { id: string; marketplace: Marketplace } | null {
  const url = raw.trim();
  if (!url) return null;

  if (/amazon\.[a-z.]+/i.test(url)) {
    const m = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
    if (m?.[1]) return { id: m[1].toUpperCase(), marketplace: "amazon" };
    return null;
  }

  const marketplace: Marketplace = /aliexpress\.[a-z.]+/i.test(url)
    ? "aliexpress"
    : /alibaba\.com/i.test(url)
      ? "alibaba"
      : "1688";

  const patterns = [
    /offer\/(\d{6,})/i,
    /[?&]offerId=(\d{6,})/i,
    /_(\d{9,})\.html/i,
    /\/(\d{9,})\.html/i,
  ];

  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return { id: m[1], marketplace };
  }
  return null;
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function urlFor(marketplace: Marketplace, id: string) {
  if (marketplace === "amazon") return `https://www.amazon.com/dp/${id}`;
  if (marketplace === "alibaba") return `https://www.alibaba.com/product-detail/${id}.html`;
  return `https://detail.1688.com/offer/${id}.html`;
}

/** Deterministic demo product so a pasted link always renders something useful. */
function syntheticProduct(id: string, marketplace: Marketplace, url?: string): ProductDetail {
  const h = hash(id);
  const base = mockProducts[h % mockProducts.length]!;
  const usd = marketplace === "amazon";
  const priceMin = Number(((usd ? 4 : 1) + (h % 900) / 10).toFixed(2));
  const priceMax = Number((priceMin * (1.4 + ((h >> 3) % 12) / 10)).toFixed(2));
  const moq = usd ? 1 : [2, 5, 10, 20, 50, 100][h % 6]!;
  const seed = `offer-${id}`;

  return {
    id,
    marketplace,
    title: `Imported listing ${id}, ${base.category} line from ${base.city}`,
    titleBn: "পেস্ট করা লিংক থেকে আনা লিস্টিং",
    category: base.category,
    priceMin,
    priceMax,
    currency: usd ? "USD" : "CNY",
    moq,
    imageUrl: `https://picsum.photos/seed/${seed}-1/800/800`,
    images: [1, 2, 3].map((i) => `https://picsum.photos/seed/${seed}-${i}/800/800`),
    shopName: base.shopName,
    city: base.city,
    ordersHint: `${((h % 90) + 5) / 10}k+ ordered`,
    productUrl: url ?? urlFor(marketplace, id),
    priceTiers: [
      { minQty: moq, price: priceMax },
      { minQty: moq * 5, price: Number(((priceMin + priceMax) / 2).toFixed(2)) },
      { minQty: moq * 20, price: priceMin },
    ],
    attributes: [
      { label: "Marketplace", value: marketplace },
      { label: "Listing ID", value: id },
      { label: "Verification", value: "Confirmed manually by our sourcing desk" },
    ],
    description:
      "Listing pulled from your pasted link in demo mode. Our team reads the original listing, confirms MOQ and tier pricing with the supplier, then sends you a Bangladesh landed path on WhatsApp.",
  };
}

function manualQuoteDetail(url: string): ProductDetail {
  const h = hash(url);
  const marketplace: Marketplace = /amazon\./i.test(url)
    ? "amazon"
    : /alibaba\.com/i.test(url)
      ? "alibaba"
      : /1688\./i.test(url)
        ? "1688"
        : "global";
  return {
    id: `manual-${h}`,
    marketplace,
    title: "Manual quote, link received",
    titleBn: "ম্যানুয়াল কোট · লিংক পাওয়া গেছে",
    currency: marketplace === "amazon" ? "USD" : "CNY",
    productUrl: url,
    imageUrl: `https://picsum.photos/seed/manual-${h}/800/800`,
    images: [`https://picsum.photos/seed/manual-${h}/800/800`],
    manualQuoteOnly: true,
    description:
      "We could not read a listing ID from this link, which is normal for shortened or app-shared URLs. Send it on WhatsApp and our team will open it directly and quote you.",
  };
}

function matches(p: ProductDetail, q: string) {
  return [p.title, p.titleBn, p.category, p.shopName, p.city]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export const mockProvider: ProductProvider = {
  name: "mock",

  async search(query, opts): Promise<SearchResult> {
    const page = opts?.page ?? 1;
    const market = opts?.marketplace;
    const q = query.trim().toLowerCase();

    let filtered = mockProducts;
    if (market && market !== "global") filtered = filtered.filter((p) => p.marketplace === market);
    if (q) filtered = filtered.filter((p) => matches(p, q));

    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE).map(toSummary),
      page,
      totalApprox: filtered.length,
    };
  },

  async getById(id, marketplace = "1688"): Promise<ProductDetail | null> {
    const found = mockProducts.find((p) => p.id === id);
    if (found) return found;
    if (/^[A-Z0-9]{6,}$/i.test(id)) return syntheticProduct(id, marketplace);
    return null;
  },

  async getByUrl(url): Promise<ProductDetail | null> {
    const parsed = parseProductUrl(url);
    if (!parsed) return manualQuoteDetail(url);
    const found = mockProducts.find((p) => p.id === parsed.id);
    if (found) return found;
    return syntheticProduct(parsed.id, parsed.marketplace, url);
  },

  /** Demo photo search: deterministic shortlist seeded by the upload reference. */
  async searchByImage(imageUrl, opts) {
    const h = hash(imageUrl);
    const market = opts?.marketplace;
    const pool =
      market && market !== "global"
        ? mockProducts.filter((p) => p.marketplace === market)
        : mockProducts;
    const source = pool.length ? pool : mockProducts;
    const count = 6 + (h % 5);
    const items: ProductSummary[] = [];
    for (let i = 0; i < count; i++) {
      items.push(toSummary(source[(h + i * 7) % source.length]!));
    }
    return { items };
  },
};

export function relatedProducts(id: string, limit = 4) {
  return mockProducts.filter((p) => p.id !== id).slice(0, limit).map(toSummary);
}

export function featuredProducts(limit = 8) {
  return mockProducts.slice(0, limit).map(toSummary);
}

export function productsByCategory(category: string, limit = 8) {
  return mockProducts
    .filter((p) => p.category?.toLowerCase().includes(category.toLowerCase()))
    .slice(0, limit)
    .map(toSummary);
}
