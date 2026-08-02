import type {
  Marketplace,
  ProductDetail,
  ProductProvider,
  ProductSummary,
  SearchResult,
} from "./types";
import { FANOUT_ORIGINS, PAGE_SIZE } from "./types";
import { mockProvider, parseProductUrl } from "./mock-provider";
import { createParseProvider } from "./parse-provider.server";

/**
 * Elim provider (openapi.elim.asia).
 *
 * Covers 1688 (their `alibaba` platform) and Taobao with one flat priced call
 * per request. Rows already carry `titleEn` / `nameEn`, so no LLM translation
 * pass is needed and keyword search works straight from English.
 *
 * Origins Elim does not serve (alibaba.com, AliExpress, Amazon) fall through
 * to the parse.bot provider so the desk keeps the same coverage.
 */

const BASE = "https://openapi.elim.asia";

export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

type Raw = Record<string, unknown>;

function env(key: string) {
  return process.env[key]?.trim() || "";
}

async function call(path: string, body: Raw, timeoutMs = 45_000): Promise<Raw> {
  const key = env("ELIM_API_KEY");
  if (!key) {
    throw new ProviderUnavailableError(
      "Live marketplace search is not switched on yet. Send the link or photo on WhatsApp and we will quote it manually.",
    );
  }

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`elim ${path} failed [${res.status}]: ${text.slice(0, 400)}`);
    if (res.status === 401)
      throw new ProviderUnavailableError("Live search key was rejected. WhatsApp us and we will quote by hand.");
    if (res.status === 402)
      throw new ProviderUnavailableError(
        "The live sourcing credit is used up. WhatsApp us and we will pull the listing by hand.",
      );
    if (res.status === 429)
      throw new ProviderUnavailableError("Live search is busy right now. Try again in a minute.");
    throw new ProviderUnavailableError("Live marketplace search failed. Use WhatsApp for now.");
  }

  const json = (await res.json()) as Raw;
  if (json["success"] === false) {
    console.error(`elim ${path} returned an error`, json["message"]);
    throw new ProviderUnavailableError("Live marketplace search failed. Use WhatsApp for now.");
  }
  return json;
}

/* ---------- helpers ---------- */

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
function obj(v: unknown): Raw {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {};
}
function list(v: unknown): Raw[] {
  return Array.isArray(v) ? v.filter((x): x is Raw => !!x && typeof x === "object") : [];
}
function strings(v: unknown): string[] {
  return Array.isArray(v) ? v.map((x) => str(x)).filter((x): x is string => !!x) : [];
}

/** English title when Elim supplies one, Chinese only as a last resort. */
function english(raw: Raw, ...keys: string[]) {
  for (const k of keys) {
    const v = str(raw[`${k}En`]) ?? str(raw[k]);
    if (v) return v;
  }
  return undefined;
}

/** Our marketplace keys mapped to Elim platform names. */
function platformFor(m: Marketplace) {
  return m === "taobao" ? "taobao" : "alibaba";
}

function offerUrl(m: Marketplace, id: string) {
  return m === "taobao"
    ? `https://item.taobao.com/item.htm?id=${id}`
    : `https://detail.1688.com/offer/${id}.html`;
}

function toSummary(d: ProductDetail): ProductSummary {
  const { images: _i, priceTiers: _t, attributes: _a, description: _d, ...rest } = d;
  return rest;
}

function stripHtml(v: string | undefined) {
  if (!v) return undefined;
  const text = v.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text || undefined;
}

/* ---------- mappers ---------- */

function mapItem(market: Marketplace, raw: Raw): ProductDetail | null {
  const id = str(raw["id"]);
  const title = english(raw, "title");
  if (!id || !title) return null;
  const image = str(raw["img_url"]);
  const sold = num(raw["sales_volume"]);

  return {
    id,
    marketplace: market,
    title,
    priceMin: num(raw["promotion_price"]) ?? num(raw["price"]),
    priceMax: num(raw["price"]),
    currency: "CNY",
    imageUrl: image,
    shopName: english(raw, "shop_name"),
    productUrl: str(raw["link"]) ?? offerUrl(market, id),
    ordersHint: sold ? `${sold.toLocaleString("en-US")} sold` : undefined,
    images: image ? [image] : [],
  };
}

function mapDetail(market: Marketplace, raw: Raw, id: string): ProductDetail | null {
  const title = english(raw, "title");
  const images = strings(raw["img_urls"]);
  if (!title && !images.length) return null;

  const tiers = list(raw["price_range"])
    .map((t) => ({
      minQty: num(t["moq"]) ?? 1,
      price: num(t["promotion_price"]) ?? num(t["price"]) ?? 0,
    }))
    .filter((t) => t.price > 0)
    .sort((a, b) => a.minQty - b.minQty);

  const skuPrices = list(raw["skus"])
    .map((s) => num(s["promotion_price"]) ?? num(s["price"]))
    .filter((n): n is number => !!n);
  const prices = skuPrices.length ? skuPrices : tiers.map((t) => t.price);

  const attributes = list(raw["attributes"])
    .map((a) => ({ label: english(a, "name") ?? "", value: english(a, "value") ?? "" }))
    .filter((a) => a.label && a.value)
    .slice(0, 14);

  const gallery = [
    ...new Set([
      ...images,
      ...list(raw["skus"])
        .map((s) => str(s["img_url"]))
        .filter((x): x is string => !!x),
    ]),
  ];

  const sold = num(raw["sold"]);
  const base = num(raw["promotion_price"]) ?? num(raw["price"]);

  return {
    id,
    marketplace: market,
    title: title ?? `${market === "taobao" ? "Taobao" : "1688"} offer ${id}`,
    priceMin: prices.length ? Math.min(...prices) : base,
    priceMax: prices.length ? Math.max(...prices) : num(raw["price"]),
    currency: "CNY",
    moq: num(raw["moq"]),
    imageUrl: gallery[0],
    shopName: english(raw, "shop_name"),
    productUrl: offerUrl(market, id),
    ordersHint: sold ? `${sold.toLocaleString("en-US")} sold` : undefined,
    images: gallery,
    priceTiers: tiers.length > 1 ? tiers : undefined,
    attributes: attributes.length ? attributes : undefined,
    description: stripHtml(str(raw["description"]))?.slice(0, 600),
  };
}

/* ---------- calls ---------- */

const STOP = new Set(["the", "a", "an", "for", "and", "with", "of", "to", "in", "on"]);

function tokens(q: string) {
  return q
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fff]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/**
 * Elim returns loosely matched rows, so a search for "red light" can bury the
 * red ones under generic lamps. Re-rank on how well the English title covers
 * the typed keywords before we cut the page down.
 */
function rankByQuery(items: ProductSummary[], query: string): ProductSummary[] {
  const words = tokens(query);
  if (!words.length) return items;
  const phrase = words.join(" ");

  const ranked = items
    .map((item, index) => {
      const title = item.title.toLowerCase();
      let score = 0;
      for (const w of words) if (title.includes(w)) score += 10;
      if (words.every((w) => title.includes(w))) score += 15;
      if (title.includes(phrase)) score += 20;
      return { item, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
  const strong = ranked.filter((x) => words.every((word) => x.item.title.toLowerCase().includes(word)));
  const rest = ranked.filter((x) => !words.every((word) => x.item.title.toLowerCase().includes(word)));
  return [...strong, ...rest].map((x) => x.item);
}

async function searchElim(
  market: Marketplace,
  query: string,
  page: number,
  size: number,
): Promise<ProductSummary[]> {
  // Over-fetch so the re-rank has room to pull the on-keyword rows up.
  const fetchSize = query.trim() ? Math.min(size * 2, 50) : size;
  const data = await call("/v1/products/search", {
    // Elim handles the Chinese translation on their side, so send the typed
    // keyword exactly as written.
    q: query.trim(),
    platform: platformFor(market),
    page,
    size: fetchSize,
    lang: "en",
  });
  const mapped = list(data["items"])
    .map((row) => mapItem(market, row))
    .filter((x): x is ProductDetail => !!x)
    .map(toSummary);
  return rankByQuery(mapped, query).slice(0, size);
}

async function detailElim(market: Marketplace, id: string): Promise<ProductDetail | null> {
  const data = await call("/v1/products/find", { id, platform: platformFor(market), lang: "en" });
  return mapDetail(market, data, id);
}

function offerIdFromUrl(url: string) {
  return (
    /\/offer\/(\d+)\.html/.exec(url)?.[1] ??
    /[?&]offerId=(\d+)/.exec(url)?.[1] ??
    /(\d{9,})/.exec(url)?.[1]
  );
}

export function createElimProvider(): ProductProvider {
  // Origins Elim does not cover keep running on the existing hosted scrapers.
  const fallback = createParseProvider();

  return {
    name: "elim",

    async search(query, opts): Promise<SearchResult> {
      const marketplace = opts?.marketplace ?? "1688";
      const page = opts?.page ?? 1;

      if (marketplace === "global") {
        const native = FANOUT_ORIGINS.filter(
          (m): m is "1688" | "taobao" => m === "1688" || m === "taobao",
        );
        const others = FANOUT_ORIGINS.filter(
          (m) => m !== "1688" && m !== "taobao" && m !== "global",
        );
        const per = Math.ceil(PAGE_SIZE / (native.length + others.length));
        const settled = await Promise.allSettled([
          ...native.map((m) => searchElim(m, query, page, per)),
          ...others.map(async (m) => (await fallback.search(query, { marketplace: m, page })).items),
        ]);
        const buckets = settled.map((r) => (r.status === "fulfilled" ? r.value : []));
        settled.forEach((r) => {
          if (r.status === "rejected") console.error("origin search failed", r.reason);
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
        return { items: items.slice(0, PAGE_SIZE), page };
      }

      if (marketplace !== "1688" && marketplace !== "taobao")
        return fallback.search(query, { marketplace, page });
      return { items: await searchElim(marketplace, query, page, PAGE_SIZE), page };
    },

    async getById(id, marketplace = "1688"): Promise<ProductDetail | null> {
      if (marketplace !== "1688" && marketplace !== "taobao" && marketplace !== "global")
        return fallback.getById(id, marketplace);
      try {
        return (await detailElim(marketplace === "global" ? "1688" : marketplace, id)) ?? (await mockProvider.getById(id, marketplace));
      } catch (err) {
        console.error("elim detail failed", err);
        return mockProvider.getById(id, marketplace);
      }
    },

    async getByUrl(url): Promise<ProductDetail | null> {
      const parsed = parseProductUrl(url);
      const market =
        parsed?.marketplace && parsed.marketplace !== "global" ? parsed.marketplace : "1688";
      if (market !== "1688" && market !== "taobao") return fallback.getByUrl(url);
      const id = parsed?.id ?? offerIdFromUrl(url);
      if (!id) return mockProvider.getByUrl(url);
      try {
        return (await detailElim(market, id)) ?? (await mockProvider.getByUrl(url));
      } catch (err) {
        console.error("elim by-url failed", err);
        return mockProvider.getByUrl(url);
      }
    },

    async searchByImage(imageUrl) {
      try {
        const data = await call("/v1/products/search-img", {
          img_url: imageUrl,
          platform: "alibaba",
          page: 1,
          size: PAGE_SIZE,
          lang: "en",
        });
        const items = list(data["items"])
          .map((row) => mapItem("1688", row))
          .filter((x): x is ProductDetail => !!x)
          .slice(0, PAGE_SIZE)
          .map(toSummary);
        if (items.length) return { items };
      } catch (err) {
        console.error("elim image search failed", err);
      }
      return fallback.searchByImage ? fallback.searchByImage(imageUrl) : { items: [] };
    },
  };
}