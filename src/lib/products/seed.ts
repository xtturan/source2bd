/**
 * Catalogue seed queries.
 *
 * A brand-new install has an empty search_cache, which means an empty
 * catalogue, empty homepage rails and category chips that all show (0).
 * The admin "Seed catalogue" action runs these queries through the normal
 * provider pipeline once, so real cached listings exist for shoppers before
 * the first organic search happens.
 *
 * Bangla is listed first because that is what the shop actually advertises;
 * the English form is the canonical cache key after bn-keywords rewrite, so
 * seeding the English query warms the same row a Bangla shopper later hits.
 */

export const SEED_CATALOG_QUERIES: string[] = [
  // light
  "led light",
  "led strip light",
  // electronics
  "wireless earbuds",
  "bluetooth speaker",
  "power bank",
  "smart watch",
  // phone
  "phone case",
  "screen protector",
  "phone charger",
  // home
  "storage box",
  "led mirror",
  "water bottle",
  // kitchen
  "faucet filter",
  "lunch box",
  // fashion
  "women bag",
  "saree",
  // beauty
  "makeup brush set",
  "perfume",
  // kids
  "kids toy",
  // tools
  "screwdriver set",
  // packaging
  "zip lock bag",
  // Bangla forms shoppers actually type — these canonicalize to the rows above
  "লেড লাইট",
  "ফোন কভার",
  "ওয়্যারলেস ইয়ারবাড",
  "মহিলাদের ব্যাগ",
  "শাড়ি",
  "বাচ্চাদের খেলনা",
  "রান্নাঘরের জিনিস",
  "ঘরের জিনিসপত্র",
  "ফোনের চার্জার",
  "স্কুলের ব্যাগ",
];
