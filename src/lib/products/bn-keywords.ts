/**
 * Bangla → English keyword mapping.
 *
 * Shoppers type Bangla ("লেড লাইট", "ফোন কভার") but the marketplaces we search
 * (1688 / Taobao, via Elim) match English keywords best. This module rewrites
 * a Bangla query into English before it reaches the provider or the cache,
 * so both paths agree on one canonical key.
 *
 * Design rules:
 * - Phrase-first: multi-word phrases are replaced before single words, longest
 *   first. Phrases must cover all their word orders (e.g. both "ফোন কভার" and
 *   "মোবাইল ফোন কভার"), because leftover words re-map independently and can
 *   duplicate intent words.
 * - Unknown Bangla words pass through untouched; we never return an empty
 *   query (an empty query would hit the provider with a blank keyword).
 * - The result keeps the shopper's original intent words that already matched
 *   (Latin script words are left alone), so mixed input still works.
 */

/** Longest-first phrase dictionary. Keys are lowercase Bangla, values English. */
const BN_PHRASES: Record<string, string> = {
  // household / electrical
  "এলইডি লাইট": "LED light",
  "এল ই ডি লাইট": "LED light",
  "লেড লাইট": "LED light",
  "মোবাইল ফোন কভার": "phone case",
  "ফোন কভার": "phone case",
  "মোবাইল কভার": "phone case",
  "মোবাইলের কভার": "phone case",
  "স্ক্রিন গার্ড": "screen protector",
  "চার্জার ক্যাবল": "charger cable",
  "ফোনের চার্জার": "phone charger",
  "ওয়্যারলেস ইয়ারবাড": "wireless earbuds",
  "ব্লুটুথ ইয়ারফোন": "bluetooth earphone",
  "পাওয়ার ব্যাংক": "power bank",
  "গ্যাজেট": "gadget",
  "ইলেকট্রনিক্স": "electronics",
  "মোবাইল সামগ্রী": "mobile accessories",
  "ঘরের জিনিস": "household items",
  "রান্নাঘর": "kitchen",
  "রান্নাঘরের জিনিস": "kitchen accessories",
  "পোশাক": "clothing",
  "নারীদের ব্যাগ": "women bag",
  "মহিলাদের ব্যাগ": "women bag",
  "শাড়ি": "saree",
  "জুতা": "shoes",
  "ঘড়ি": "wrist watch",
  "সানগ্লাস": "sunglasses",
  "চশমা": "glasses",
  "খেলনা": "toy",
  "বই": "book",
  "স্টেশনারি": "stationery",
  "স্কুলের ব্যাগ": "school bag",
  "ওয়াচ ব্যান্ড": "watch band",
  "মোবাইল হোল্ডার": "phone holder",
  "রিং লাইট": "ring light",
  "স্পিকার": "bluetooth speaker",
  "ফ্যান": "electric fan",
  "হিটার": "heater",
  "ইস্ত্রি": "iron press",
  "বালি": "sand toy",
  "কসমেটিকস": "cosmetics",
  "মেকআপ": "makeup",
  "পারফিউম": "perfume",
  "গয়না": "jewelry",
  "ব্রেসলেট": "bracelet",
  "আংটি": "ring",
  "মোবাইল স্ট্যান্ড": "phone stand",
  "টিভি রিমোট": "tv remote control",
  "এসি রিমোট": "ac remote control",
  "গামিং মাউস": "gaming mouse",
  "কীবোর্ড": "keyboard",
  "ল্যাপটপ ব্যাগ": "laptop bag",
  "টিফিন বক্স": "lunch box",
  "ওয়াটার বোতল": "water bottle",
  "থার্মোস": "thermos flask",
  "হাঁড়ি": "cooking pot",
  "প্যান": "frying pan",
  "ছুরি": "knife",
  "কাঁচি": "scissors",
  "ঝাড়ু": "broom",
  "মপ": "mop",
  "ডাস্টবিন": "trash can",
  "পর্দা": "curtain",
  "বালিশ": "pillow",
  "চাদর": "bed sheet",
  "কম্বল": "blanket",
  "টেবিল কাপড়": "table cloth",
  "স্টোরেজ বক্স": "storage box",
  "আয়না": "mirror",
  "টুথব্রাশ": "toothbrush",
  "শ্যাম্পু": "shampoo",
  "সাবান": "soap",
  "তোয়ালে": "towel",
  "আন্ডারওয়্যার": "underwear",
  "টি-শার্ট": "t-shirt",
  "শার্ট": "shirt",
  "প্যান্ট": "pants",
  "জ্যাকেট": "jacket",
  "টুপি": "cap",
  "মোজা": "socks",
  "বেবি প্রোডাক্টস": "baby products",
  "বেবি ডায়াপার": "baby diaper",
  "ফিশ ট্যাংক": "fish tank",
  "একুরিয়াম": "aquarium",
  "গাছের টব": "plant pot",
  "টুল বক্স": "tool box",
  "স্ক্রু ড্রাইভার": "screwdriver",
  "ড্রিল মেশিন": "electric drill",
};

/** Single-word fallbacks, checked only if no phrase consumed the token. */
const BN_WORDS: Record<string, string> = {
  দাম: "price",
  কম: "cheap",
  ভালো: "good quality",
  সেরা: "best",
  নতুন: "new",
  পুরাতন: "used",
  বড়: "large",
  ছোট: "small",
  কালো: "black",
  সাদা: "white",
  লাল: "red",
  নীল: "blue",
  সবুজ: "green",
  হলুদ: "yellow",
  গোলাপি: "pink",
  মহিলা: "women",
  নারী: "women",
  পুরুষ: "men",
  ছেলে: "boys",
  মেয়ে: "girls",
  বাচ্চা: "kids",
  বেবি: "baby",
  ইয়ারবাড: "earbuds",
  চার্জার: "charger",
  কেবল: "cable",
  ক্যাবল: "cable",
  মোবাইল: "mobile",
  ফোন: "phone",
  ল্যাপটপ: "laptop",
  কম্পিউটার: "computer",
  ব্যাগ: "bag",
  বক্স: "box",
  বোতল: "bottle",
  কাপ: "cup",
  প্লেট: "plate",
  ঘর: "home",
  আসবাব: "furniture",
  খেলনাগুলো: "toys",
  লাইট: "light",
  বাতি: "light",
  পাখি: "fan", // colloquial: পাখা misspelled as পাখি
  পাখা: "fan",
  ঘড়ি: "watch",
  চাবি: "key",
  তালা: "lock",
  পাম্প: "pump",
  মেশিন: "machine",
  মোটর: "motor",
  ব্যাটারি: "battery",
  লেন্স: "lens",
  ক্যামেরা: "camera",
  "সিলিকন": "silicone",
  প্লাস্টিক: "plastic",
  স্টিল: "steel",
  কাচ: "glass",
};

function longestFirst(a: string, b: string) {
  return b.length - a.length;
}

const PHRASE_KEYS = Object.keys(BN_PHRASES).sort(longestFirst);
const WORD_KEYS = Object.keys(BN_WORDS).sort(longestFirst);

/** True when the token contains Bangla script (U+0980–U+09FF). */
function isBangla(text: string) {
  return /[\u0980-\u09FF]/.test(text);
}

/**
 * Rewrite a shopper query into the English keyword form the marketplaces
 * match on. Bangla-free input is returned unchanged (trimmed).
 */
export function toEnglishKeywords(rawQuery: string): string {
  const query = rawQuery.trim().replace(/\s+/g, " ");
  if (!query || !isBangla(query)) return query;

  let out = ` ${query} `;

  // Phrases first, longest first.
  for (const phrase of PHRASE_KEYS) {
    const re = new RegExp(`\\s${phrase}(?=\\s)`, "g");
    if (re.test(out)) out = out.replace(re, ` ${BN_PHRASES[phrase]} `);
  }

  // Remaining Bangla tokens map word-by-word; unknown Bangla words are dropped
  // (a random Bangla string never matches on 1688) but we never drop Latin.
  const tokens = out.split(" ").filter(Boolean);
  const mapped = tokens.map((tok) => {
    if (!isBangla(tok)) return tok;
    const direct = BN_WORDS[tok] ?? BN_PHRASES[tok];
    if (direct) return direct;
    const stem = tok.replace(/[টােিীুূংঃ্যর্খগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহ়২-৯]+$/u, "");
    return BN_WORDS[stem] ?? "";
  });

  const result = mapped.filter(Boolean).join(" ").trim();
  // Never return blank: fall back to the original so the desk still sees intent.
  return result || query;
}

/** Canonical cache/provider key for a query (lowercase, collapsed spaces). */
export function canonicalQuery(rawQuery: string): string {
  return toEnglishKeywords(rawQuery).toLowerCase();
}
