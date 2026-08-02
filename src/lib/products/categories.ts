import type { ProductSummary } from "./types";

/**
 * Catalogue buckets. New shoppers browse these like an e-commerce shop;
 * experienced sourcers keep using the keyword/photo/link tools.
 * A product lands in a bucket by matching plain keywords in its title
 * (or in the search that produced it) — no AI, no cost.
 */
export type CategoryKey =
  | "light"
  | "electronics"
  | "phone"
  | "home"
  | "kitchen"
  | "fashion"
  | "beauty"
  | "kids"
  | "tools"
  | "packaging"
  | "other";

export const categories: {
  key: CategoryKey;
  bn: string;
  en: string;
  emoji: string;
  words: string[];
}[] = [
  {
    key: "light",
    bn: "লাইট",
    en: "Lights",
    emoji: "💡",
    words: ["light", "lamp", "led", "bulb", "torch", "chandelier", "neon", "lantern"],
  },
  {
    key: "electronics",
    bn: "ইলেকট্রনিক্স",
    en: "Electronics",
    emoji: "🔌",
    words: ["speaker", "camera", "earphone", "headphone", "watch", "tv", "audio", "electronic", "drone", "keyboard", "mouse", "monitor"],
  },
  {
    key: "phone",
    bn: "মোবাইল সামগ্রী",
    en: "Phone gear",
    emoji: "📱",
    words: ["phone", "mobile", "charger", "cable", "usb", "power bank", "case", "holder", "screen protector", "adapter"],
  },
  {
    key: "home",
    bn: "ঘরের জিনিস",
    en: "Home",
    emoji: "🏠",
    words: ["home", "sofa", "chair", "table", "curtain", "carpet", "storage", "furniture", "decor", "clock", "mirror", "bed"],
  },
  {
    key: "kitchen",
    bn: "রান্নাঘর",
    en: "Kitchen",
    emoji: "🍳",
    words: ["kitchen", "pan", "pot", "cook", "knife", "bottle", "mug", "cup", "plate", "blender", "food", "spoon"],
  },
  {
    key: "fashion",
    bn: "পোশাক ও ব্যাগ",
    en: "Clothing & bags",
    emoji: "👜",
    words: ["shirt", "dress", "bag", "shoe", "jacket", "cloth", "fashion", "hoodie", "sock", "belt", "wallet", "cap", "hat", "saree", "jeans"],
  },
  {
    key: "beauty",
    bn: "প্রসাধনী",
    en: "Beauty",
    emoji: "💄",
    words: ["beauty", "makeup", "cosmetic", "hair", "skin", "cream", "perfume", "nail", "lipstick", "brush"],
  },
  {
    key: "kids",
    bn: "খেলনা ও শিশু",
    en: "Toys & kids",
    emoji: "🧸",
    words: ["toy", "kid", "baby", "child", "game", "puzzle", "doll", "school", "student"],
  },
  {
    key: "tools",
    bn: "যন্ত্রপাতি",
    en: "Tools & machines",
    emoji: "🛠️",
    words: ["tool", "machine", "drill", "motor", "pump", "welding", "hardware", "screw", "wrench", "cutter", "industrial"],
  },
  {
    key: "packaging",
    bn: "প্যাকেজিং",
    en: "Packaging",
    emoji: "📦",
    words: ["box", "packaging", "carton", "sticker", "label", "bag pack", "wrap", "tape", "pouch"],
  },
  { key: "other", bn: "অন্যান্য", en: "Everything else", emoji: "🧭", words: [] },
];

export function categoryOf(text: string): CategoryKey {
  const s = text.toLowerCase();
  for (const c of categories) {
    if (c.words.some((w) => s.includes(w))) return c.key;
  }
  return "other";
}

export function categoryOfProduct(product: ProductSummary, query = ""): CategoryKey {
  const own = categoryOf(product.title ?? "");
  if (own !== "other") return own;
  return categoryOf(query);
}

export function categoryLabel(key: CategoryKey) {
  return categories.find((c) => c.key === key) ?? categories[categories.length - 1]!;
}