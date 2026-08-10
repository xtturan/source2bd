/**
 * Marketplace titles arrive as keyword dumps and sometimes carry words that
 * imply counterfeits. We only sell legal goods, so those listings must never
 * be advertised with that language on our surface.
 */
const BANNED = [
  "fake",
  "replica",
  "copycat",
  "copy version",
  "1:1",
  "aaa quality",
  "knockoff",
  "knock off",
  "mirror quality",
  "নকল",
  "高仿",
  "复刻",
  "精仿",
  "A货",
];

const NOISE = [
  "wholesale",
  "wholesales",
  "factory direct",
  "cross-border",
  "cross border",
  "dropshipping",
  "drop shipping",
  "free shipping",
  "hot sale",
  "hot selling",
  "new arrival",
  "in stock",
  "spot goods",
  "source manufacturer",
  "manufacturer direct",
  "amazon",
  "ebay",
  "tiktok",
];

/** Extra keyword-dump filler that marketplace sellers stuff into titles. */
const FILLER = [
  "customized",
  "customizable",
  "custom made",
  "oem",
  "odm",
  "high quality",
  "good quality",
  "top quality",
  "best selling",
  "best seller",
  "trending",
  "popular",
  "cheap",
  "low price",
  "wholesale price",
  "large quantity",
  "small quantity",
  "supply",
  "supplier",
  "trade",
  "export",
  "brand new",
  "genuine",
  "authentic",
  "2023",
  "2024",
  "2025",
  "2026",
  "new style",
  "new design",
  "fashion new",
  "korean version",
  "ins style",
  "internet celebrity",
  "same style",
];

/** True when the listing markets itself as a counterfeit. Hide these. */
export function isProhibitedTitle(title: string): boolean {
  const low = title.toLowerCase();
  return BANNED.some((w) => low.includes(w.toLowerCase()));
}

function stripWords(text: string, words: string[]) {
  let out = text;
  for (const w of words) {
    out = out.replace(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), " ");
  }
  return out;
}

/**
 * Short, readable card title: drop counterfeit and SEO-spam words, collapse
 * separators, drop repeated words, keep the first meaningful phrase and cap
 * the length. Marketplace titles are keyword dumps; this makes them scannable.
 */
export function cleanTitle(title: string, max = 62): string {
  let out = title.replace(/\s+/g, " ").trim();

  // Bracketed marketing blocks are always noise.
  out = out.replace(/[[(【（][^\])】）]*[\])】）]/g, " ");
  out = stripWords(out, [...BANNED, ...NOISE, ...FILLER]);

  out = out
    .replace(/[|/·、，,]+/g, " ")
    .replace(/\s*[-–—]\s*/g, " ")
    .replace(/[!！*#~]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Collapse repeated words ("shoes women shoes" -> "shoes women").
  const seen = new Set<string>();
  const words: string[] = [];
  for (const w of out.split(" ")) {
    const k = w.toLowerCase().replace(/[^a-z0-9\u0980-\u09ff]/g, "");
    if (!w) continue;
    if (k && seen.has(k)) continue;
    if (k) seen.add(k);
    words.push(w);
  }
  // Nine words is enough to name a product; the rest is SEO stuffing.
  out = words.slice(0, 9).join(" ").replace(/^[\s'’"-]+|[\s'’"-]+$/g, "");

  if (!out) out = title.trim();

  if (out.length > max) {
    const cut = out.slice(0, max);
    const space = cut.lastIndexOf(" ");
    out = (space > max * 0.6 ? cut.slice(0, space) : cut).trim() + "…";
  }

  return out.charAt(0).toUpperCase() + out.slice(1);
}
