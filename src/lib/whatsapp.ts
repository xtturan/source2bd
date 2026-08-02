import { siteConfig } from "@/config/site";

const MAX = 1200;

function clean(input: string, limit = 160) {
  return input.replace(/\s+/g, " ").trim().slice(0, limit);
}

const HELLO = `আসসালামু আলাইকুম ${siteConfig.name},`;
const FULL_PRICE = "বাংলাদেশ পর্যন্ত পুরো দাম (শিপিং চার্জসহ) জানতে চাই।";

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
      topic ? `আমি খুঁজছি: ${clean(topic)}` : "আমি বিদেশ থেকে পণ্য আনতে চাই।",
      FULL_PRICE,
      "শহর: ",
      "পরিমাণ: ",
    ].join("\n"),
  );
}

/** Photo hand off: the user sends the picture inside the chat. */
export function photoInquiry(extra?: { city?: string; qty?: string }) {
  return waLink(
    [
      HELLO,
      "পণ্যের ছবি পাঠাচ্ছি।",
      FULL_PRICE,
      `শহর: ${extra?.city?.trim() ?? ""}`,
      `পরিমাণ: ${extra?.qty?.trim() ?? ""}`,
    ].join("\n"),
  );
}

export function linkInquiry(url: string, extra?: { city?: string; qty?: string }) {
  return waLink(
    [
      HELLO,
      `লিংক: ${clean(url, 300)}`,
      "বাংলাদেশ পর্যন্ত পুরো দাম + শিপিং চার্জ জানতে চাই।",
      `শহর: ${extra?.city?.trim() ?? ""}`,
      `পরিমাণ: ${extra?.qty?.trim() ?? ""}`,
    ].join("\n"),
  );
}

export function voiceInquiry() {
  return waLink([HELLO, "আমি পণ্যের নাম ভয়েসে বলছি।", FULL_PRICE, "শহর: ", "পরিমাণ: "].join("\n"));
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
      input.city ? `শহর: ${clean(input.city, 60)}` : null,
      input.notes ? `আরও: ${clean(input.notes, 400)}` : null,
      FULL_PRICE,
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
      FULL_PRICE,
      input.name?.trim() ? `নাম: ${clean(input.name, 60)}` : null,
      input.phone?.trim() ? `মোবাইল: ${clean(input.phone, 20)}` : null,
      input.city?.trim() ? `শহর: ${clean(input.city, 60)}` : null,
      input.how?.trim() ? `কীভাবে পাঠাব: ${clean(input.how, 40)}` : null,
      input.qty?.trim() ? `পরিমাণ: ${clean(input.qty, 40)}` : null,
      input.notes?.trim() ? `আরও: ${clean(input.notes, 400)}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

/** Product hand off. The market price is never presented as the BD price. */
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
      "আমি এই পণ্যের বাংলাদেশ পর্যন্ত পুরো দাম (শিপিং চার্জসহ) জানতে চাই।",
      `পণ্য: ${clean(input.title, 180)}`,
      `লিংক: ${clean(input.productUrl, 300)}`,
      `পরিমাণ: ${input.qty ? clean(String(input.qty), 40) : ""}`,
      `শহর/জেলা: ${input.city ? clean(input.city, 60) : ""}`,
    ].join("\n"),
  );
}

export function trackingInquiry(code: string) {
  return waLink(
    [HELLO, `ট্র্যাকিং নম্বর: ${clean(code, 60)}`, "আমার পণ্য এখন কোথায় জানতে চাই।"].join("\n"),
  );
}
