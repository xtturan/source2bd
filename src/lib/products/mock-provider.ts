import { mockProducts } from "./mock-data";
import type {
  ProductDetail,
  ProductProvider,
  ProductSource,
  ProductSummary,
  SearchResult,
} from "./types";
import { PAGE_SIZE } from "./types";

function toSummary(p: ProductDetail): ProductSummary {
  const { images: _images, priceTiers: _t, attributes: _a, description: _d, ...rest } = p;
  return rest;
}

/** Extract a marketplace offer id + source from a pasted URL. */
export function parseProductUrl(
  raw: string,
): { id: string; source: ProductSource } | null {
  const url = raw.trim();
  if (!url) return null;

  const source: ProductSource = /alibaba\.com/i.test(url) ? "alibaba" : "1688";

  const patterns = [
    /offer\/(\d{6,})/i, // detail.1688.com/offer/123.html, m.1688.com/offer/123.html
    /[?&]offerId=(\d{6,})/i,
    /\/(\d{9,})\.html/i, // alibaba.com/product-detail/xxx_123456789.html handled below too
    /_(\d{9,})\.html/i,
  ];

  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return { id: m[1], source };
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

/** Deterministic demo product so a pasted link always renders something useful. */
function syntheticProduct(id: string, source: ProductSource, url?: string): ProductDetail {
  const h = hash(id);
  const base = mockProducts[h % mockProducts.length]!;
  const priceMin = Number((1 + (h % 900) / 10).toFixed(2));
  const priceMax = Number((priceMin * (1.4 + ((h >> 3) % 12) / 10)).toFixed(2));
  const moq = [2, 5, 10, 20, 50, 100][h % 6]!;
  const seed = `offer-${id}`;

  return {
    id,
    source,
    title: `Imported listing ${id} — ${base.category} line from ${base.city}`,
    titleBn: "পেস্ট করা লিংক থেকে আনা লিস্টিং",
    category: base.category,
    priceMin,
    priceMax,
    currency: "CNY",
    moq,
    imageUrl: `https://picsum.photos/seed/${seed}-1/800/800`,
    images: [1, 2, 3].map((i) => `https://picsum.photos/seed/${seed}-${i}/800/800`),
    shopName: base.shopName,
    city: base.city,
    ordersHint: `${((h % 90) + 5) / 10}k+ ordered`,
    productUrl:
      url ??
      (source === "1688"
        ? `https://detail.1688.com/offer/${id}.html`
        : `https://www.alibaba.com/product-detail/${id}.html`),
    priceTiers: [
      { minQty: moq, price: priceMax },
      { minQty: moq * 5, price: Number(((priceMin + priceMax) / 2).toFixed(2)) },
      { minQty: moq * 20, price: priceMin },
    ],
    attributes: [
      { label: "Source", value: source === "1688" ? "1688.com" : "Alibaba.com" },
      { label: "Offer ID", value: id },
      { label: "Verification", value: "Confirmed manually by our China desk" },
    ],
    description:
      "Listing pulled from your pasted link in demo mode. Our team reads the original Chinese listing, confirms MOQ and tier pricing with the supplier, then sends you a BD-landed path on WhatsApp.",
  };
}

function manualQuoteDetail(url: string): ProductDetail {
  const h = hash(url);
  return {
    id: `manual-${h}`,
    source: /alibaba\.com/i.test(url) ? "alibaba" : "1688",
    title: "Manual quote — link received",
    titleBn: "ম্যানুয়াল কোট — লিংক পাওয়া গেছে",
    currency: "CNY",
    productUrl: url,
    imageUrl: `https://picsum.photos/seed/manual-${h}/800/800`,
    images: [`https://picsum.photos/seed/manual-${h}/800/800`],
    manualQuoteOnly: true,
    description:
      "We could not read an offer ID from this link, which is normal for shortened or app-shared URLs. Send it on WhatsApp and our team will open it directly and quote you.",
  };
}

export const mockProvider: ProductProvider = {
  name: "mock",

  async search(query: string, page = 1): Promise<SearchResult> {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? mockProducts.filter((p) =>
          [p.title, p.titleBn, p.category, p.shopName, p.city]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : mockProducts;

    const start = (page - 1) * PAGE_SIZE;
    return {
      items: filtered.slice(start, start + PAGE_SIZE).map(toSummary),
      page,
      totalApprox: filtered.length,
    };
  },

  async getById(id: string, source: ProductSource = "1688"): Promise<ProductDetail | null> {
    const found = mockProducts.find((p) => p.id === id);
    if (found) return found;
    if (/^\d{6,}$/.test(id)) return syntheticProduct(id, source);
    return null;
  },

  async getByUrl(url: string): Promise<ProductDetail | null> {
    const parsed = parseProductUrl(url);
    if (!parsed) return manualQuoteDetail(url);
    const found = mockProducts.find((p) => p.id === parsed.id);
    if (found) return found;
    return syntheticProduct(parsed.id, parsed.source, url);
  },
};

export function relatedProducts(id: string, limit = 4) {
  return mockProducts.filter((p) => p.id !== id).slice(0, limit).map(toSummary);
}

export function featuredProducts(limit = 8) {
  return mockProducts.slice(0, limit).map(toSummary);
}