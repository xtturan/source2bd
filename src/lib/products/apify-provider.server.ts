import type {
  Marketplace,
  ProductDetail,
  ProductProvider,
  ProductSummary,
  SearchResult,
} from "./types";
import { PAGE_SIZE } from "./types";
import { mockProvider, parseProductUrl } from "./mock-provider";

/**
 * Apify provider.
 *
 * Live actors:
 *   APIFY_1688_ACTOR   zen-studio~1688-wholesale-scraper  (keyword + offerId)
 *   APIFY_IMAGE_ACTOR  devcake~scraper-by-image           (reverse image: 1688 / alibaba / aliexpress)
 *
 * Marketplaces without a configured actor fall back to the demo catalogue so
 * the desk still has something to quote from.
 */

const API = "https://api.apify.com/v2";

export class ProviderUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderUnavailableError";
  }
}

function env(key: string) {
  return process.env[key]?.trim() || "";
}

function actorFor(marketplace: Marketplace | undefined) {
  switch (marketplace) {
    case "amazon":
      return env("APIFY_AMAZON_ACTOR");
    case "alibaba":
      return env("APIFY_ALIBABA_ACTOR");
    case "1688":
      return env("APIFY_1688_ACTOR");
    default:
      return env("APIFY_1688_ACTOR");
  }
}

async function runActor<T>(actorId: string, input: unknown, limit = 12): Promise<T[]> {
  const token = env("APIFY_TOKEN");
  if (!token) {
    throw new ProviderUnavailableError(
      "Live marketplace search is not switched on yet. Send the link or photo on WhatsApp and we will quote it manually.",
    );
  }
  if (!actorId) {
    throw new ProviderUnavailableError(
      "No Apify Actor is configured for that marketplace yet. Our desk can still quote it on WhatsApp.",
    );
  }

  const res = await fetch(
    `${API}/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?limit=${limit}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(120_000),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`Apify actor ${actorId} failed [${res.status}]: ${body}`);
    if (res.status === 402)
      throw new ProviderUnavailableError(
        "The live sourcing credit for this month is used up. WhatsApp us and we will pull the listing by hand.",
      );
    if (res.status === 429)
      throw new ProviderUnavailableError("Live search is busy right now. Try again in a minute.");
    throw new ProviderUnavailableError("Live marketplace search failed. Use WhatsApp for now.");
  }

  const json = (await res.json()) as unknown;
  return Array.isArray(json) ? (json as T[]) : [];
}

type Raw = Record<string, unknown>;

function str(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function num(v: unknown) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }
  return undefined;
}
function obj(v: unknown): Raw {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {};
}
function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/* ---------- zen-studio~1688-wholesale-scraper ---------- */

function map1688(raw: Raw): ProductDetail | null {
  const id = str(raw["offerId"]) ?? str(raw["id"]);
  const title = str(raw["title"]);
  const productUrl =
    str(raw["detailUrl"]) ?? (id ? `https://detail.1688.com/offer/${id}.html` : undefined);
  if (!id || !title || !productUrl) return null;

  const price = obj(raw["price"]);
  const supplier = obj(raw["supplier"]);
  const images = strList(raw["images"]);

  const tiersRaw = Array.isArray(raw["quantityPrices"]) ? (raw["quantityPrices"] as Raw[]) : [];
  const priceTiers = tiersRaw
    .map((t) => ({ minQty: num(t["quantityMin"]) ?? 0, price: num(t["price"]) ?? 0 }))
    .filter((t) => t.minQty > 0 && t.price > 0)
    .sort((a, b) => a.minQty - b.minQty);

  const attributes: { label: string; value: string }[] = [];
  const company = str(supplier["companyName"]);
  if (company) attributes.push({ label: "Supplier", value: company });
  const bizType = str(supplier["bizType"]);
  if (bizType) attributes.push({ label: "Business type", value: bizType });
  const tpYear = num(supplier["tpYear"]);
  if (tpYear) attributes.push({ label: "Years on 1688", value: `${tpYear}` });
  const sold = str(raw["soldDisplay"]);
  if (sold) attributes.push({ label: "Sold", value: sold });
  const repurchase = num(raw["repurchaseRate"]);
  if (repurchase) attributes.push({ label: "Repurchase rate", value: `${Math.round(repurchase * 100)}%` });

  const city = [str(raw["province"]), str(raw["city"])].filter(Boolean).join(" ");

  return {
    id,
    marketplace: "1688",
    title,
    priceMin: num(price["min"]) ?? priceTiers.at(-1)?.price,
    priceMax: num(price["max"]) ?? priceTiers[0]?.price,
    currency: "CNY",
    moq: priceTiers[0]?.minQty,
    imageUrl: images[0],
    shopName: company,
    city: city || undefined,
    productUrl,
    ordersHint: sold,
    images: images.length ? images : [],
    priceTiers: priceTiers.length ? priceTiers : undefined,
    attributes: attributes.length ? attributes : undefined,
    description: str(raw["descriptionText"]) ?? str(raw["description"]),
  };
}

/* ---------- devcake~scraper-by-image ---------- */

function mapImageItem(raw: Raw): ProductDetail | null {
  const id = str(raw["product_id"]);
  const title = str(raw["title"]) ?? str(raw["original_title"]);
  const productUrl = str(raw["product_url"]);
  if (!id || !title || !productUrl) return null;

  const provider = str(raw["provider"]);
  const marketplace: Marketplace =
    provider === "1688" ? "1688" : provider === "alibaba" ? "alibaba" : "global";
  const images = strList(raw["images"]);
  const lo = num(raw["price_min"]);
  const hi = num(raw["price_max"]);

  return {
    id,
    marketplace,
    title,
    priceMin: lo && hi ? Math.min(lo, hi) : (lo ?? hi),
    priceMax: lo && hi ? Math.max(lo, hi) : (hi ?? lo),
    currency: str(raw["currency_code"]) === "USD" ? "USD" : marketplace === "1688" ? "CNY" : "USD",
    moq: num(raw["moq"]),
    imageUrl: str(raw["image_url"]) ?? images[0],
    shopName: str(raw["shop_name"]),
    city: str(raw["country"]),
    productUrl,
    ordersHint: num(raw["sold_count"]) ? `${num(raw["sold_count"])} sold` : undefined,
    images: images.length ? images : str(raw["image_url"]) ? [str(raw["image_url"])!] : [],
    description: str(raw["description"]),
  };
}

function toSummary(d: ProductDetail): ProductSummary {
  const { images: _images, priceTiers: _t, attributes: _a, description: _d, ...rest } = d;
  return rest;
}

function offerIdFromUrl(url: string) {
  return (
    /\/offer\/(\d+)\.html/.exec(url)?.[1] ??
    /[?&]offerId=(\d+)/.exec(url)?.[1] ??
    /(\d{9,})/.exec(url)?.[1]
  );
}

export function createApifyProvider(): ProductProvider {
  return {
    name: "apify",

    async search(query, opts): Promise<SearchResult> {
      const marketplace = opts?.marketplace ?? "1688";
      const page = opts?.page ?? 1;
      const actor = actorFor(marketplace);

      // No live actor for this marketplace yet: serve the demo catalogue.
      if (!actor) return mockProvider.search(query, opts);

      if (marketplace === "1688" || marketplace === "global") {
        const raw = await runActor<Raw>(actor, { keywords: [query], maxResults: PAGE_SIZE }, PAGE_SIZE);
        return {
          items: raw
            .map(map1688)
            .filter((x): x is ProductDetail => !!x)
            .map(toSummary),
          page,
        };
      }

      const raw = await runActor<Raw>(actor, { keyword: query, query, page, maxItems: PAGE_SIZE }, PAGE_SIZE);
      return {
        items: raw
          .map(map1688)
          .filter((x): x is ProductDetail => !!x)
          .map(toSummary),
        page,
      };
    },

    async getById(id, marketplace = "1688"): Promise<ProductDetail | null> {
      const actor = actorFor(marketplace);
      if (!actor) return mockProvider.getById(id, marketplace);
      const raw = await runActor<Raw>(actor, { offerIds: [id] }, 1);
      const first = raw[0];
      return first ? map1688(first) : null;
    },

    async getByUrl(url): Promise<ProductDetail | null> {
      const parsed = parseProductUrl(url);
      const marketplace = parsed?.marketplace ?? "1688";
      const actor = actorFor(marketplace);
      if (!actor) return mockProvider.getByUrl(url);
      const id = parsed?.id ?? offerIdFromUrl(url);
      if (!id) return null;
      const raw = await runActor<Raw>(actor, { offerIds: [id] }, 1);
      const first = raw[0];
      return first ? map1688(first) : null;
    },

    async searchByImage(imageUrl, opts) {
      const actor = env("APIFY_IMAGE_ACTOR");
      if (!actor) {
        return mockProvider.searchByImage
          ? mockProvider.searchByImage(imageUrl, opts)
          : { items: [] };
      }
      const marketplace = opts?.marketplace ?? "1688";
      const provider = marketplace === "alibaba" ? "alibaba" : marketplace === "1688" ? "1688" : "aliexpress";
      const raw = await runActor<Raw>(
        actor,
        { provider, imageUrls: [imageUrl], maxProducts: 30 },
        PAGE_SIZE,
      );
      return {
        items: raw
          .map(mapImageItem)
          .filter((x): x is ProductDetail => !!x)
          .map(toSummary),
      };
    },
  };
}
