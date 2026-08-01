import { siteConfig } from "@/config/site";

const MAX = 1200;

function clean(input: string, limit = 160) {
  return input.replace(/\s+/g, " ").trim().slice(0, limit);
}

export function waLink(text: string) {
  const body = text.trim().slice(0, MAX);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(body)}`;
}

export const telLink = `tel:${siteConfig.phoneTel}`;

export function generalInquiry(topic?: string) {
  return waLink(
    [
      `Assalamu alaikum, ${siteConfig.name}.`,
      topic ? `I want to ask about: ${clean(topic)}` : "I want to ask about sourcing and cargo into Bangladesh.",
      "আমি বিদেশ থেকে বাংলাদেশে পণ্য আনতে চাই।",
    ].join("\n"),
  );
}

export function serviceQuote(input: {
  mode: string;
  weight?: string | undefined;
  city?: string | undefined;
  notes?: string | undefined;
}) {
  return waLink(
    [
      `Assalamu alaikum, ${siteConfig.name}.`,
      `Service: ${clean(input.mode, 60)}`,
      input.weight ? `Approx weight / volume: ${clean(input.weight, 60)}` : null,
      input.city ? `Delivery city (BD): ${clean(input.city, 60)}` : null,
      input.notes ? `Notes: ${clean(input.notes, 400)}` : null,
      "কোট জানতে চাই।",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export function productQuote(input: {
  title: string;
  productUrl: string;
  priceMin?: number | undefined;
  priceMax?: number | undefined;
  moq?: number | undefined;
  qty?: number | string | undefined;
  city?: string | undefined;
  currency?: "CNY" | "USD" | undefined;
  marketplace?: string | undefined;
}) {
  const cur = input.currency ?? "CNY";
  const price =
    input.priceMin != null
      ? input.priceMax != null && input.priceMax !== input.priceMin
        ? `${cur} ${input.priceMin} to ${input.priceMax}`
        : `${cur} ${input.priceMin}`
      : "Not listed";

  return waLink(
    [
      `Assalamu alaikum, ${siteConfig.name}.`,
      `Marketplace: ${input.marketplace ?? "not specified"}`,
      `Product: ${clean(input.title, 180)}`,
      `Link: ${clean(input.productUrl, 300)}`,
      `Listed price: ${price}`,
      `MOQ: ${input.moq ?? "not listed"}`,
      `Desired qty: ${input.qty ? clean(String(input.qty), 40) : "to be confirmed"}`,
      `BD delivery city: ${input.city ? clean(input.city, 60) : "to be confirmed"}`,
      "এই প্রোডাক্টের BD quote চাই।",
    ].join("\n"),
  );
}

export function trackingInquiry(code: string) {
  return waLink(
    [
      `Assalamu alaikum, ${siteConfig.name}.`,
      `Shipment code: ${clean(code, 60)}`,
      "আমার শিপমেন্টের আপডেট জানতে চাই।",
    ].join("\n"),
  );
}