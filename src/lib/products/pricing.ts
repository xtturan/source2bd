/**
 * Supplier prices come back in CNY or USD. Shoppers in Bangladesh see BDT
 * with the standard 20% sourcing markup applied.
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

/** Price label in BDT, e.g. "৳1,240 to ৳2,780". */
export function bdtLabel(
  priceMin: number | undefined,
  priceMax: number | undefined,
  currency: "CNY" | "USD",
  fallback = "Ask for price",
) {
  if (priceMin == null) return fallback;
  const lo = formatBdt(toBdt(priceMin, currency));
  if (priceMax != null && priceMax !== priceMin) {
    return `${lo} to ${formatBdt(toBdt(priceMax, currency))}`;
  }
  return lo;
}
