/**
 * Honesty rule: the marketplace number is the supplier price abroad.
 * We show it in its own currency, plus an *approximate* taka figure that is
 * always labelled আনুমানিক. The real Bangladesh total is quoted on WhatsApp.
 */
export const MARKUP = 1.12;

const RATE: Record<"CNY" | "USD", number> = {
  CNY: 17.2,
  USD: 122,
};

export function toBdt(amount: number, currency: "CNY" | "USD") {
  return Math.round(amount * RATE[currency] * MARKUP);
}

export function formatBdt(amount: number) {
  return `\u09F3${amount.toLocaleString("en-US")}`;
}

export function formatMarket(amount: number, currency: "CNY" | "USD") {
  const n = Number.isInteger(amount) ? amount.toLocaleString("en-US") : amount.toFixed(2);
  return currency === "USD" ? `$${n}` : `¥${n}`;
}

/** Supplier price in its own currency, e.g. "¥12 – ¥18". */
export function marketLabel(
  priceMin: number | undefined,
  priceMax: number | undefined,
  currency: "CNY" | "USD",
  fallback = "—",
) {
  if (priceMin == null) return fallback;
  const lo = formatMarket(priceMin, currency);
  if (priceMax != null && priceMax !== priceMin) return `${lo} – ${formatMarket(priceMax, currency)}`;
  return lo;
}

/** Approximate taka figure, e.g. "৳1,240 – ৳2,780". Always shown with আনুমানিক. */
export function bdtLabel(
  priceMin: number | undefined,
  priceMax: number | undefined,
  currency: "CNY" | "USD",
  fallback = "Ask for price",
) {
  if (priceMin == null) return fallback;
  const lo = formatBdt(toBdt(priceMin, currency));
  if (priceMax != null && priceMax !== priceMin) {
    return `${lo} – ${formatBdt(toBdt(priceMax, currency))}`;
  }
  return lo;
}
