import { siteConfig } from "@/config/site";

const MAX = 1200;

function clean(input: string, limit = 160) {
  return input.replace(/\s+/g, " ").trim().slice(0, limit);
}

const HELLO = `আসসালামু আলাইকুম, ${siteConfig.name}।`;

export function waLink(text: string) {
  const body = text.trim().slice(0, MAX);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(body)}`;
}

export const telLink = `tel:${siteConfig.phoneTel}`;

/** Plain Bangla opener used by every generic help button. */
export function generalInquiry(topic?: string) {
  return waLink(
    [
      HELLO,
      topic ? `বিষয়: ${clean(topic)}` : "আমি বিদেশ থেকে পণ্য আনতে চাই।",
      "বাংলাদেশে পৌঁছানোর পুরো দাম জানতে চাই।",
    ].join("\n"),
  );
}

/** Photo hand off: the user sends the picture inside the chat. */
export function photoInquiry(extra?: { city?: string; qty?: string }) {
  return waLink(
    [
      HELLO,
      "আমি পণ্যের ছবি পাঠাচ্ছি।",
      "বাংলাদেশে পৌঁছানোর দাম জানতে চাই।",
      `শহর: ${extra?.city?.trim() || "___"}`,
      `কয়টা লাগবে: ${extra?.qty?.trim() || "___"}`,
    ].join("\n"),
  );
}

export function linkInquiry(url: string, extra?: { city?: string; qty?: string }) {
  return waLink(
    [
      HELLO,
      "এই পণ্যের দাম জানতে চাই।",
      `লিংক: ${clean(url, 300)}`,
      `শহর: ${extra?.city?.trim() || "___"}`,
      `কয়টা লাগবে: ${extra?.qty?.trim() || "___"}`,
    ].join("\n"),
  );
}

export function voiceInquiry() {
  return waLink([HELLO, "আমি পণ্যের নাম বলব।", "একটু ভয়েস মেসেজ পাঠাচ্ছি।"].join("\n"));
}

export function serviceQuote(input: {
  mode: string;
  weight?: string | undefined;
  city?: string | undefined;
  notes?: string | undefined;
}) {
  return waLink(
    [
      HELLO,
      `সার্ভিস: ${clean(input.mode, 60)}`,
      input.weight ? `কত ভারী: ${clean(input.weight, 60)}` : null,
      input.city ? `কোন শহর: ${clean(input.city, 60)}` : null,
      input.notes ? `আরও: ${clean(input.notes, 400)}` : null,
      "দাম জানতে চাই।",
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/** Full quote form hand off. */
export function quoteRequest(input: {
  name?: string;
  phone?: string;
  city?: string;
  how?: string;
  qty?: string;
  notes?: string;
}) {
  return waLink(
    [
      HELLO,
      "আমি দাম জানতে চাই।",
      input.name?.trim() ? `নাম: ${clean(input.name, 60)}` : null,
      input.phone?.trim() ? `মোবাইল: ${clean(input.phone, 20)}` : null,
      input.city?.trim() ? `শহর: ${clean(input.city, 60)}` : null,
      input.how?.trim() ? `কীভাবে পাঠাব: ${clean(input.how, 40)}` : null,
      input.qty?.trim() ? `কয়টা লাগবে: ${clean(input.qty, 40)}` : null,
      input.notes?.trim() ? `আরও: ${clean(input.notes, 400)}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/** Product card hand off. The China price is never presented as the BD price. */
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
  return waLink(
    [
      HELLO,
      "এই পণ্যটি আনতে চাই।",
      `পণ্য: ${clean(input.title, 180)}`,
      `লিংক: ${clean(input.productUrl, 300)}`,
      `কয়টা লাগবে: ${input.qty ? clean(String(input.qty), 40) : "___"}`,
      `শহর: ${input.city ? clean(input.city, 60) : "___"}`,
      "বাংলাদেশে পৌঁছানোর পুরো দাম জানতে চাই।",
    ].join("\n"),
  );
}

export function trackingInquiry(code: string) {
  return waLink(
    [
      HELLO,
      `ট্র্যাকিং নম্বর: ${clean(code, 60)}`,
      "আমার পণ্য এখন কোথায় জানতে চাই।",
    ].join("\n"),
  );
}
