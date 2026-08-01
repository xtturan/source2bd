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
    case "aliexpress":
      return env("APIFY_ALIEXPRESS_ACTOR");
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

  const auth = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const started = await fetch(
    `${API}/acts/${encodeURIComponent(actorId)}/runs?memory=4096&timeout=120`,
    {
    method: "POST",
    headers: auth,
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(20_000),
    },
  );

  if (!started.ok) {
    const body = await started.text();
    console.error(`Apify actor ${actorId} failed to start [${started.status}]: ${body}`);
    if (started.status === 402)
      throw new ProviderUnavailableError(
        "The live sourcing credit for this month is used up. WhatsApp us and we will pull the listing by hand.",
      );
    if (started.status === 429)
      throw new ProviderUnavailableError("Live search is busy right now. Try again in a minute.");
    throw new ProviderUnavailableError("Live marketplace search failed. Use WhatsApp for now.");
  }

  const run = ((await started.json()) as { data?: { id?: string; defaultDatasetId?: string } }).data;
  if (!run?.id || !run.defaultDatasetId) {
    throw new ProviderUnavailableError("Live marketplace search failed. Use WhatsApp for now.");
  }

  // Read the dataset while the run is still going: the actor writes items
  // incrementally, so we can return as soon as enough rows have landed
  // instead of waiting for the run to finish.
  const itemsUrl = `${API}/datasets/${run.defaultDatasetId}/items?limit=${limit}&clean=true`;
  const deadline = Date.now() + 100_000;
  let items: T[] = [];
  let finished = false;
  let wait = 700;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, wait));
    wait = Math.min(wait + 300, 2000);

    const [itemsRes, statusRes] = await Promise.all([
      fetch(itemsUrl, { headers: auth, signal: AbortSignal.timeout(15_000) }),
      fetch(`${API}/actor-runs/${run.id}?fields=status`, {
        headers: auth,
        signal: AbortSignal.timeout(10_000),
      }),
    ]);

    if (itemsRes.ok) {
      const json = (await itemsRes.json()) as unknown;
      if (Array.isArray(json)) items = json as T[];
    }

    const status = statusRes.ok
      ? ((await statusRes.json()) as { data?: { status?: string } }).data?.status
      : undefined;
    finished = status === "SUCCEEDED" || status === "FAILED" || status === "ABORTED";

    if (items.length >= limit || finished) break;
  }

  // Enough rows already: stop the run so it does not burn credit in the background.
  if (!finished && items.length) {
    void fetch(`${API}/actor-runs/${run.id}/abort`, { method: "POST", headers: auth }).catch(
      () => {},
    );
  }

  return items;
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
    provider === "1688"
      ? "1688"
      : provider === "alibaba"
        ? "alibaba"
        : provider === "aliexpress"
          ? "aliexpress"
          : "global";
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

/* ---------- generic mapper for alibaba / aliexpress / amazon actors ---------- */

function pick(raw: Raw, keys: string[]) {
  for (const k of keys) {
    const v = str(raw[k]);
    if (v) return v;
  }
  return undefined;
}
function pickNum(raw: Raw, keys: string[]) {
  for (const k of keys) {
    const v = num(raw[k]);
    if (v) return v;
  }
  return undefined;
}

function mapGeneric(raw: Raw, marketplace: Marketplace): ProductDetail | null {
  const title = pick(raw, ["title", "name", "productTitle", "product_title", "original_title"]);
  const productUrl = pick(raw, ["url", "productUrl", "product_url", "detailUrl", "link"]);
  const id =
    pick(raw, ["id", "productId", "product_id", "asin", "offerId", "itemId"]) ??
    (productUrl ? /(\d{6,}|[A-Z0-9]{10})/.exec(productUrl)?.[1] : undefined);
  if (!title || !productUrl || !id) return null;

  const images = strList(raw["images"]);
  const imageUrl =
    pick(raw, ["image", "imageUrl", "image_url", "thumbnail", "mainImage"]) ?? images[0];
  const lo = pickNum(raw, ["priceMin", "price_min", "price", "minPrice", "currentPrice"]);
  const hi = pickNum(raw, ["priceMax", "price_max", "maxPrice", "originalPrice"]);

  return {
    id,
    marketplace,
    title,
    priceMin: lo && hi ? Math.min(lo, hi) : (lo ?? hi),
    priceMax: lo && hi ? Math.max(lo, hi) : undefined,
    currency: marketplace === "1688" ? "CNY" : "USD",
    moq: pickNum(raw, ["moq", "minOrderQuantity", "min_order_quantity"]),
    imageUrl,
    shopName: pick(raw, ["shopName", "shop_name", "seller", "sellerName", "supplier", "brand"]),
    city: pick(raw, ["country", "location", "city"]),
    productUrl,
    ordersHint: pick(raw, ["soldDisplay", "orders", "sold", "reviewsCount"]),
    images: images.length ? images : imageUrl ? [imageUrl] : [],
    description: pick(raw, ["description", "descriptionText"]),
  };
}

function inputFor(marketplace: Marketplace, query: string, page: number, limit: number): unknown {
  switch (marketplace) {
    case "1688":
      return { keywords: [query], maxResults: limit };
    case "alibaba":
      return { keywords: [query], maxResults: limit, page };
    case "aliexpress":
      return { keyword: query, search: query, maxItems: limit, page };
    case "amazon":
      return { keywords: [query], keyword: query, maxItems: limit, maxResults: limit, page };
    default:
      return { keywords: [query], maxResults: limit };
  }
}

async function searchOne(
  marketplace: Marketplace,
  query: string,
  page: number,
  limit: number,
): Promise<ProductSummary[]> {
  const actor = actorFor(marketplace);
  if (!actor) return (await mockProvider.search(query, { marketplace, page })).items.slice(0, limit);
  const raw = await runActor<Raw>(actor, inputFor(marketplace, query, page, limit), limit);
  const map = marketplace === "1688" ? map1688 : (r: Raw) => mapGeneric(r, marketplace);
  return raw
    .map(map)
    .filter((x): x is ProductDetail => !!x)
    .map(toSummary);
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
      const marketplace = opts?.marketplace ?? "global";
      const page = opts?.page ?? 1;

      // "All origins": fan out to every marketplace in parallel and interleave
      // the results so the grid shows a spread of 24 listings, not one source.
      if (marketplace === "global") {
        const per = Math.ceil(PAGE_SIZE / FANOUT_ORIGINS.length);
        const settled = await Promise.allSettled(
          FANOUT_ORIGINS.map((m) => searchOne(m, query, page, per)),
        );
        const buckets = settled.map((r) => (r.status === "fulfilled" ? r.value : []));
        settled.forEach((r, i) => {
          if (r.status === "rejected")
            console.error(`origin ${FANOUT_ORIGINS[i]} search failed`, r.reason);
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
      const actor = actorFor(marketplace);
      if (!actor) return mockProvider.getById(id, marketplace);
      const raw = await runActor<Raw>(actor, { offerIds: [id] }, 1);
      const first = raw[0];
      const detail = first ? map1688(first) : null;
      return detail ? ((await translateProducts([detail]))[0] ?? detail) : null;
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
      const detail = first ? map1688(first) : null;
      return detail ? ((await translateProducts([detail]))[0] ?? detail) : null;
    },

    async searchByImage(imageUrl, opts) {
      const actor = env("APIFY_IMAGE_ACTOR");
      if (!actor) {
        return mockProvider.searchByImage
          ? mockProvider.searchByImage(imageUrl, opts)
          : { items: [] };
      }
      const marketplace = opts?.marketplace ?? "global";
      const provider =
        marketplace === "alibaba"
          ? "alibaba"
          : marketplace === "aliexpress"
            ? "aliexpress"
            : marketplace === "1688"
              ? "1688"
              : "global";
      const raw = await runActor<Raw>(
        actor,
        { provider, destination: provider, imageUrls: [imageUrl], imageUrl, maxProducts: PAGE_SIZE },
        PAGE_SIZE,
      );
      const mapped = raw.map(mapImageItem).filter((x): x is ProductDetail => !!x).map(toSummary);
      return { items: await translateProducts(mapped) };
    },
  };
}
