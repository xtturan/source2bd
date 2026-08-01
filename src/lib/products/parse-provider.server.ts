import type {
  Marketplace,
  ProductDetail,
  ProductProvider,
  ProductSummary,
  SearchResult,
} from "./types";
import { FANOUT_ORIGINS, PAGE_SIZE } from "./types";
import { mockProvider, parseProductUrl } from "./mock-provider";
import { translateProducts } from "./translate.server";

/**
 * parse.bot provider.
 *
 * Every marketplace is a hosted REST endpoint, pay per call, no actor runs to
 * babysit. Searches return in roughly 6 to 12 seconds.
 */

const BASE = "https://api.parse.bot/scraper";

export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

function env(key: string) {
  return process.env[key]?.trim() || "";
}

const DEFAULT_SCRAPERS: Record<Exclude<Marketplace, "global">, string> = {
  "1688": "aa6e2b5e-7963-46f5-a6c2-e326775ceae4",
  alibaba: "ba2822dd-f985-4faa-8d3b-81d795bda2a7",
  aliexpress: "f989ff95-1fce-426d-935d-2b3787e3f343",
  amazon: "e1dc349c-16b6-498a-a7e6-2462aef5b5b4",
};

function scraperFor(marketplace: Exclude<Marketplace, "global">) {
  switch (marketplace) {
    case "alibaba":
      return env("PARSE_ALIBABA_SCRAPER") || DEFAULT_SCRAPERS.alibaba;
    case "aliexpress":
      return env("PARSE_ALIEXPRESS_SCRAPER") || DEFAULT_SCRAPERS.aliexpress;
    case "amazon":
      return env("PARSE_AMAZON_SCRAPER") || DEFAULT_SCRAPERS.amazon;
    default:
      return env("PARSE_1688_SCRAPER") || DEFAULT_SCRAPERS["1688"];
  }
}

type Raw = Record<string, unknown>;

async function call(
  scraperId: string,
  endpoint: string,
  params: Record<string, string | number | undefined>,
  timeoutMs = 60_000,
): Promise<unknown> {
  const key = env("PARSE_API_KEY");
  if (!key) {
    throw new ProviderUnavailableError(
      "Live marketplace search is not switched on yet. Send the link or photo on WhatsApp and we will quote it manually.",
    );
  }

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }

  const res = await fetch(`${BASE}/${scraperId}/${endpoint}?${qs.toString()}`, {
    headers: { "X-API-Key": key },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`parse.bot ${endpoint} failed [${res.status}]: ${body.slice(0, 400)}`);
    if (res.status === 402)
      throw new ProviderUnavailableError(
        "The live sourcing credit is used up. WhatsApp us and we will pull the listing by hand.",
      );
    if (res.status === 429)
      throw new ProviderUnavailableError("Live search is busy right now. Try again in a minute.");
    throw new ProviderUnavailableError("Live marketplace search failed. Use WhatsApp for now.");
  }

  const json = (await res.json()) as { status?: string; data?: unknown; error?: unknown };
  if (json.status && json.status !== "success") {
    console.error(`parse.bot ${endpoint} returned ${json.status}`, json.error);
    throw new ProviderUnavailableError("Live marketplace search failed. Use WhatsApp for now.");
  }
  return json.data ?? json;
}

/* ---------- small helpers ---------- */

function str(v: unknown) {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return undefined;
}
function num(v: unknown) {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
}
function qty(v: unknown) {
  const n = num(v);
  return n && n >= 1 ? Math.round(n) : undefined;
}

function obj(v: unknown): Raw {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {};
}
function rows(v: unknown, ...keys: string[]): Raw[] {
  const box = obj(v);
  for (const k of keys) {
    const arr = box[k];
    if (Array.isArray(arr)) return arr.filter((x): x is Raw => !!x && typeof x === "object");
  }
  return Array.isArray(v) ? (v as Raw[]) : [];
}
function absUrl(u: string | undefined) {
  if (!u) return undefined;
  return u.startsWith("//") ? `https:${u}` : u;
}
/** Pulls the numbers out of strings such as "$0.72-1.60" or "US $6.57". */
function priceRange(raw: string | undefined) {
  if (!raw) return {};
  const nums = raw
    .replace(/,/g, "")
    .match(/\d+(?:\.\d+)?/g)
    ?.map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!nums?.length) return {};
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return { priceMin: lo, priceMax: hi > lo ? hi : undefined };
}

/* ---------- mappers ---------- */

function map1688(raw: Raw): ProductDetail | null {
  const id = str(raw["offerId"]) ?? str(raw["offer_id"]);
  const title = str(raw["title"]);
  if (!id || !title) return null;
  const image = absUrl(str(raw["imageUrl"]));
  const price = num(raw["price"]);
  const city = [str(raw["province"]), str(raw["city"])].filter(Boolean).join(" ");
  const booked = str(raw["bookedCount"]);

  return {
    id,
    marketplace: "1688",
    title,
    priceMin: price,
    currency: "CNY",
    imageUrl: image,
    shopName: str(raw["sellerName"]) ?? str(raw["shopName"]) ?? str(raw["loginId"]),
    city: city || undefined,
    productUrl: str(raw["url"]) ?? `https://detail.1688.com/offer/${id}.html`,
    ordersHint: booked && booked !== "0" ? `${booked} sold` : undefined,
    images: image ? [image] : [],
  };
}

function mapAlibaba(raw: Raw): ProductDetail | null {
  const id = str(raw["product_id"]);
  const title = str(raw["title"]);
  if (!id || !title) return null;
  const image = absUrl(str(raw["image_url"]));
  const moqText = str(raw["min_order"]);

  return {
    id,
    marketplace: "alibaba",
    title,
    ...priceRange(str(raw["price"])),
    currency: "USD",
    moq: qty(moqText),
    imageUrl: image,
    shopName: str(raw["company_name"]),
    city: str(raw["country_code"]),
    productUrl:
      absUrl(str(raw["product_url"])) ??
      `https://www.alibaba.com/product-detail/x_${id}.html`,
    ordersHint: str(raw["sold_orders"]),
    images: image ? [image] : [],
    attributes: moqText ? [{ label: "Min. order", value: moqText }] : undefined,
  };
}

function mapAliExpress(raw: Raw): ProductDetail | null {
  const id = str(raw["product_id"]);
  const title = str(raw["title"]) ?? str(raw["name"]);
  if (!id || !title) return null;
  const image = absUrl(str(raw["thumbnail_url"]) ?? str(raw["image_url"]));

  return {
    id,
    marketplace: "aliexpress",
    title,
    priceMin: num(raw["price"]),
    currency: "USD",
    imageUrl: image,
    shopName: str(raw["seller_name"]),
    productUrl: str(raw["product_url"]) ?? `https://www.aliexpress.com/item/${id}.html`,
    ordersHint: str(raw["orders_desc"]),
    images: image ? [image] : [],
  };
}

function mapAmazon(raw: Raw): ProductDetail | null {
  const id = str(raw["asin"]);
  const title = str(raw["title"]);
  if (!id || !title) return null;
  const image = absUrl(str(raw["image"]));
  const rating = str(raw["rating"]);

  return {
    id,
    marketplace: "amazon",
    title,
    ...priceRange(str(raw["price"])),
    currency: "USD",
    moq: 1,
    imageUrl: image,
    productUrl: str(raw["product_url"]) ?? `https://www.amazon.com/dp/${id}`,
    ordersHint: rating ? `${rating} stars` : undefined,
    images: image ? [image] : [],
  };
}

function mapperFor(marketplace: Exclude<Marketplace, "global">) {
  switch (marketplace) {
    case "alibaba":
      return mapAlibaba;
    case "aliexpress":
      return mapAliExpress;
    case "amazon":
      return mapAmazon;
    default:
      return map1688;
  }
}

function listKeys(marketplace: Exclude<Marketplace, "global">) {
  return marketplace === "1688" ? ["items"] : ["products", "items"];
}

function toSummary(d: ProductDetail): ProductSummary {
  const { images: _i, priceTiers: _t, attributes: _a, description: _d, ...rest } = d;
  return rest;
}

async function searchOne(
  marketplace: Exclude<Marketplace, "global">,
  query: string,
  page: number,
  limit: number,
): Promise<ProductSummary[]> {
  const data = await call(scraperFor(marketplace), "search_products", { query, page });
  const map = mapperFor(marketplace);
  return rows(data, ...listKeys(marketplace))
    .map(map)
    .filter((x): x is ProductDetail => !!x)
    .slice(0, limit)
    .map(toSummary);
}

/* ---------- detail lookups ---------- */

async function detail1688(id: string): Promise<ProductDetail | null> {
  const data = obj(await call(scraperFor("1688"), "get_product_detail", { offer_id: id }));
  const model = obj(obj(data["skuModel"])["skuSelectorBizModel"]);
  const trade = obj(model["tradeModel"]);
  const gallery = Array.isArray(model["mainImageList"])
    ? (model["mainImageList"] as Raw[])
        .map((im) => absUrl(str(im["fullPathImageURI"]) ?? str(im["imageURI"])))
        .filter((x): x is string => !!x)
    : [];
  const infoMap = obj(model["skuInfoMap"]);
  const prices = Object.values(infoMap)
    .map((v) => num(obj(v)["price"]))
    .filter((n): n is number => !!n);
  const title = str(data["title"]) ?? str(model["offerTitle"]);
  if (!title && !gallery.length) return null;

  return {
    id,
    marketplace: "1688",
    title: title ?? `1688 offer ${id}`,
    priceMin: prices.length ? Math.min(...prices) : undefined,
    priceMax: prices.length ? Math.max(...prices) : undefined,
    currency: "CNY",
    moq: num(trade["minOrderQuantity"]),
    imageUrl: gallery[0],
    productUrl: `https://detail.1688.com/offer/${id}.html`,
    ordersHint: str(trade["saleCount"]) ? `${str(trade["saleCount"])} sold` : undefined,
    images: gallery,
  };
}

async function detailAlibaba(id: string): Promise<ProductDetail | null> {
  const data = obj(await call(scraperFor("alibaba"), "get_product", { product_id: id }));
  const title = str(data["title"]);
  if (!title) return null;
  const images = (Array.isArray(data["image_urls"]) ? (data["image_urls"] as unknown[]) : [])
    .map((u) => absUrl(str(u)))
    .filter((x): x is string => !!x);
  const tiers = rows(data["price_tiers"])
    .map((t) => ({ minQty: num(t["min_quantity"]) ?? 0, price: num(t["unit_price"] ?? t["price"]) ?? 0 }))
    .filter((t) => t.minQty > 0 && t.price > 0);
  const moqText = str(data["moq"]);

  return {
    id,
    marketplace: "alibaba",
    title,
    ...priceRange(str(data["price_display"])),
    currency: "USD",
    moq: qty(moqText) ?? tiers[0]?.minQty,
    imageUrl: images[0],
    shopName: str(data["supplier_name"]),
    productUrl:
      absUrl(str(data["product_url"])) ?? `https://www.alibaba.com/product-detail/x_${id}.html`,
    images,
    priceTiers: tiers.length ? tiers : undefined,
    attributes: moqText ? [{ label: "Min. order", value: moqText }] : undefined,
  };
}

async function detailAliExpress(id: string): Promise<ProductDetail | null> {
  const data = obj(await call(scraperFor("aliexpress"), "get_product_details", { product_id: id }));
  const title = str(data["name"]);
  if (!title) return null;
  const images = (Array.isArray(data["images"]) ? (data["images"] as unknown[]) : [])
    .map((u) => absUrl(str(u)))
    .filter((x): x is string => !!x);
  return {
    id,
    marketplace: "aliexpress",
    title,
    currency: "USD",
    imageUrl: images[0],
    productUrl: str(data["aliexpress_url"]) ?? `https://www.aliexpress.com/item/${id}.html`,
    images,
  };
}

async function detailAmazon(id: string): Promise<ProductDetail | null> {
  const data = obj(await call(scraperFor("amazon"), "get_product_details", { asin: id }));
  const title = str(data["title"]);
  if (!title) return null;
  const images = (Array.isArray(data["images"]) ? (data["images"] as unknown[]) : [])
    .map((u) => absUrl(str(u)))
    .filter((x): x is string => !!x);
  const specs = obj(data["specifications"]);
  const attributes = Object.entries(specs)
    .map(([label, value]) => ({ label, value: str(value) ?? "" }))
    .filter((a) => a.value)
    .slice(0, 12);
  const bullets = Array.isArray(data["description"])
    ? (data["description"] as unknown[]).map((b) => str(b)).filter(Boolean).join("\n")
    : str(data["description"]);

  return {
    id,
    marketplace: "amazon",
    title,
    ...priceRange(str(data["price"])),
    currency: "USD",
    moq: 1,
    imageUrl: images[0],
    shopName: str(data["brand"]),
    productUrl: `https://www.amazon.com/dp/${id}`,
    ordersHint: str(data["rating"]),
    images,
    attributes: attributes.length ? attributes : undefined,
    description: bullets,
  };
}

async function detailFor(
  marketplace: Exclude<Marketplace, "global">,
  id: string,
): Promise<ProductDetail | null> {
  switch (marketplace) {
    case "alibaba":
      return detailAlibaba(id);
    case "aliexpress":
      return detailAliExpress(id);
    case "amazon":
      return detailAmazon(id);
    default:
      return detail1688(id);
  }
}

export function createParseProvider(): ProductProvider {
  return {
    name: "parse",

    async search(query, opts): Promise<SearchResult> {
      const marketplace = opts?.marketplace ?? "global";
      const page = opts?.page ?? 1;

      if (marketplace === "global") {
        const origins = FANOUT_ORIGINS.filter(
          (m): m is Exclude<Marketplace, "global"> => m !== "global",
        );
        const per = Math.ceil(PAGE_SIZE / origins.length);
        const settled = await Promise.allSettled(
          origins.map((m) => searchOne(m, query, page, per)),
        );
        const buckets = settled.map((r) => (r.status === "fulfilled" ? r.value : []));
        settled.forEach((r, i) => {
          if (r.status === "rejected") console.error(`origin ${origins[i]} search failed`, r.reason);
        });

        const items: ProductSummary[] = [];
        for (let i = 0; items.length < PAGE_SIZE; i++) {
          const row = buckets.map((b) => b[i]).filter((x): x is ProductSummary => !!x);
          if (!row.length) break;
          items.push(...row);
        }
        if (!items.length) {
          throw new ProviderUnavailableError(
            "Live marketplace search did not come back. Send the keyword on WhatsApp and we will source it by hand.",
          );
        }
        return { items: await translateProducts(items.slice(0, PAGE_SIZE)), page };
      }

      const single = await searchOne(marketplace, query, page, PAGE_SIZE);
      return { items: await translateProducts(single), page };
    },

    async getById(id, marketplace = "1688"): Promise<ProductDetail | null> {
      const target = marketplace === "global" ? "1688" : marketplace;
      try {
        const detail = await detailFor(target, id);
        if (!detail) return mockProvider.getById(id, marketplace);
        return (await translateProducts([detail]))[0] ?? detail;
      } catch (err) {
        console.error("parse detail failed", err);
        return mockProvider.getById(id, marketplace);
      }
    },

    async getByUrl(url): Promise<ProductDetail | null> {
      const parsed = parseProductUrl(url);
      if (!parsed) return mockProvider.getByUrl(url);
      const target = parsed.marketplace === "global" ? "1688" : parsed.marketplace;
      try {
        const detail = await detailFor(target, parsed.id);
        if (!detail) return mockProvider.getByUrl(url);
        return (await translateProducts([detail]))[0] ?? detail;
      } catch (err) {
        console.error("parse by-url failed", err);
        return mockProvider.getByUrl(url);
      }
    },

    /** Reverse image search is 1688 only on parse.bot today. */
    async searchByImage(imageUrl) {
      const data = await call(scraperFor("1688"), "search_by_image", {
        image_url: imageUrl,
        page: 1,
      });
      const items = rows(data, "items")
        .map(map1688)
        .filter((x): x is ProductDetail => !!x)
        .slice(0, PAGE_SIZE)
        .map(toSummary);
      if (!items.length) {
        return mockProvider.searchByImage ? mockProvider.searchByImage(imageUrl) : { items: [] };
      }
      return { items: await translateProducts(items) };
    },
  };
}