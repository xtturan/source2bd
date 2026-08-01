import type {
  Marketplace,
  ProductDetail,
  ProductProvider,
  ProductSummary,
  SearchResult,
} from "./types";
import { parseProductUrl } from "./mock-provider";

/**
 * Apify provider stub.
 *
 * Apify runs one Actor per marketplace. Set the token plus the Actor ids you
 * want live, then flip PRODUCT_PROVIDER=apify. Without a token every call
 * throws a friendly error and the UI falls back to the WhatsApp desk.
 */

const GATEWAY = "https://api.apify.com/v2";

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
    default:
      return env("APIFY_1688_ACTOR");
  }
}

async function runActor<T>(actorId: string, input: unknown): Promise<T[]> {
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
    `${GATEWAY}/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${token}&limit=24`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
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

  return (await res.json()) as T[];
}

type RawItem = Record<string, unknown>;

function str(v: unknown) {
  return typeof v === "string" ? v : undefined;
}
function num(v: unknown) {
  return typeof v === "number" ? v : typeof v === "string" ? Number(v) || undefined : undefined;
}

function mapItem(raw: RawItem, marketplace: Marketplace): ProductSummary | null {
  const productUrl = str(raw["url"]) ?? str(raw["productUrl"]) ?? str(raw["link"]);
  const title = str(raw["title"]) ?? str(raw["name"]);
  if (!productUrl || !title) return null;
  const id = str(raw["id"]) ?? parseProductUrl(productUrl)?.id ?? productUrl;
  return {
    id,
    marketplace,
    title,
    priceMin: num(raw["priceMin"]) ?? num(raw["price"]),
    priceMax: num(raw["priceMax"]) ?? num(raw["price"]),
    currency: marketplace === "1688" ? "CNY" : "USD",
    moq: num(raw["moq"]),
    imageUrl: str(raw["image"]) ?? str(raw["imageUrl"]) ?? str(raw["thumbnail"]),
    shopName: str(raw["shopName"]) ?? str(raw["seller"]),
    productUrl,
  };
}

export function createApifyProvider(): ProductProvider {
  return {
    name: "apify",

    async search(query, opts): Promise<SearchResult> {
      const marketplace = opts?.marketplace ?? "1688";
      const page = opts?.page ?? 1;
      const raw = await runActor<RawItem>(actorFor(marketplace), {
        keyword: query,
        query,
        page,
        maxItems: 24,
      });
      return {
        items: raw.map((r) => mapItem(r, marketplace)).filter((x): x is ProductSummary => !!x),
        page,
      };
    },

    async getById(id, marketplace = "1688"): Promise<ProductDetail | null> {
      const raw = await runActor<RawItem>(actorFor(marketplace), { productIds: [id], id });
      const first = raw[0];
      if (!first) return null;
      const summary = mapItem(first, marketplace);
      if (!summary) return null;
      return { ...summary, images: summary.imageUrl ? [summary.imageUrl] : [] };
    },

    async getByUrl(url): Promise<ProductDetail | null> {
      const parsed = parseProductUrl(url);
      const marketplace = parsed?.marketplace ?? "global";
      const raw = await runActor<RawItem>(actorFor(marketplace), { startUrls: [{ url }], url });
      const first = raw[0];
      if (!first) return null;
      const summary = mapItem(first, marketplace);
      if (!summary) return null;
      return { ...summary, images: summary.imageUrl ? [summary.imageUrl] : [] };
    },

    async searchByImage(imageUrl, opts) {
      const marketplace = opts?.marketplace ?? "1688";
      const raw = await runActor<RawItem>(env("APIFY_IMAGE_ACTOR"), { imageUrl, marketplace });
      return {
        items: raw.map((r) => mapItem(r, marketplace)).filter((x): x is ProductSummary => !!x),
      };
    },
  };
}
