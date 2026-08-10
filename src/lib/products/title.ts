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

/** True when the listing markets itself as a counterfeit. Hide these. */
export function isProhibitedTitle(title: string): boolean {
  const low = title.toLowerCase();
  return BANNED.some((w) => low.includes(w.toLowerCase()));
}

/**
 * Short, readable card title: drop counterfeit and SEO-spam words, collapse
 * separators, keep the first meaningful phrase and cap the length.
 */
export function cleanTitle(title: string, max = 58): string {
  let out = title.replace(/\s+/g, " ").trim();

  for (const w of [...BANNED, ...NOISE]) {
    out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ");
  }

  out = out
    .replace(/[|/·、，,]+/g, " ")
    .replace(/\s*[-–—]\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!out) out = title.trim();

  if (out.length > max) {
    const cut = out.slice(0, max);
    const space = cut.lastIndexOf(" ");
    out = (space > max * 0.6 ? cut.slice(0, space) : cut).trim() + "…";
  }

  return out.charAt(0).toUpperCase() + out.slice(1);
}
