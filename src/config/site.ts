export const siteConfig = {
  name: "TWT International",
  tagline: "China → Bangladesh cargo & buying agent",
  taglineBn: "চীন থেকে বাংলাদেশ · কার্গো ও বায়িং এজেন্ট",
  url: "",
  whatsappNumber: "8801752457930",
  phoneDisplay: "01752-457930",
  phoneTel: "+8801752457930",
  office: "Chawkbazar Office, Dhaka",
  officeLine2: "Chawkbazar, Dhaka, Bangladesh",
  hours: "Sat–Thu, 10:00–20:00 (Bangladesh time)",
  originCities: ["Guangzhou", "Yiwu", "Shenzhen"],
  destinationCities: ["Dhaka", "Chattogram"],
} as const;

export const navLinks = [
  { to: "/services", label: "Services" },
  { to: "/sourcing", label: "Sourcing" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/track", label: "Track" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export type ServiceKey =
  | "hand-carry"
  | "air-freight"
  | "sea-freight"
  | "courier"
  | "warehouse"
  | "buying-agent";

export interface ServiceDef {
  key: ServiceKey;
  title: string;
  titleBn: string;
  short: string;
  whenToUse: string[];
  prepare: string[];
  eta: string;
}

export const services: ServiceDef[] = [
  {
    key: "hand-carry",
    title: "Hand Carry",
    titleBn: "হ্যান্ড ক্যারি",
    short:
      "Priority personal cargo, samples and urgent small parcels flown with a traveller. Fastest route out of China when a delay costs you an order.",
    whenToUse: [
      "Samples your buyer needs this week",
      "High-value small items (phone parts, chips, jewellery findings)",
      "Under ~30 kg where air freight paperwork is overkill",
    ],
    prepare: [
      "Exact piece count and weight",
      "Invoice or supplier chat screenshot",
      "Dhaka pickup or delivery address",
    ],
    eta: "Typically 3–6 days, subject to flight availability",
  },
  {
    key: "air-freight",
    title: "Air Freight",
    titleBn: "এয়ার ফ্রেইট",
    short:
      "The standard fast path China → DAC for commercial cargo. Charged on the higher of actual or volumetric weight — we tell you which one applies before you commit.",
    whenToUse: [
      "20 kg to a few hundred kg",
      "Restock runs where sea is too slow",
      "Seasonal goods with a deadline",
    ],
    prepare: [
      "Carton dimensions and gross weight",
      "Product description (legal goods only)",
      "Consignee name, phone, NID/BIN if commercial",
    ],
    eta: "Typically 7–12 days door-to-door",
  },
  {
    key: "sea-freight",
    title: "Sea Freight",
    titleBn: "সি ফ্রেইট",
    short:
      "The economical bulk lane to Chattogram port and inland ICD. Slower, far cheaper per kg — the right call for furniture, packaging, machinery and anything heavy.",
    whenToUse: [
      "Volume above ~200 kg or 1 CBM",
      "Heavy, low-value-per-kg goods",
      "Planned restock with 4–8 weeks of runway",
    ],
    prepare: [
      "Total CBM estimate and carton count",
      "HS code guess or clear product description",
      "Port preference: Chattogram or ICD",
    ],
    eta: "Estimate 25–45 days port-to-door; not a guarantee",
  },
  {
    key: "courier",
    title: "Courier / Parcel",
    titleBn: "কুরিয়ার / পার্সেল",
    short:
      "Small commercial parcels moved on courier lanes with simple documentation. Good for one-carton test orders before you scale a supplier.",
    whenToUse: [
      "1–3 cartons",
      "Trial orders from a new supplier",
      "Documents and small accessories",
    ],
    prepare: ["Carton weight", "Product photos", "Receiver phone number"],
    eta: "Typically 5–10 days",
  },
  {
    key: "warehouse",
    title: "China Warehouse & Consolidation",
    titleBn: "চায়না ওয়্যারহাউজ",
    short:
      "Buy from five suppliers, ship one box. We receive at our China warehouse, check counts, repack, and consolidate so you pay one freight bill instead of five.",
    whenToUse: [
      "Multiple 1688 suppliers in one order cycle",
      "You want carton counts verified before shipping",
      "Reducing per-parcel freight overhead",
    ],
    prepare: [
      "Supplier tracking numbers",
      "Item list with expected quantities",
      "Preferred ship mode once consolidated",
    ],
    eta: "Free short-term holding while your parcels arrive",
  },
  {
    key: "buying-agent",
    title: "Buying Agent · 1688 & Alibaba sourcing",
    titleBn: "বায়িং এজেন্ট · সোর্সিং",
    short:
      "Send a keyword or paste a 1688 / Alibaba link. We read the Chinese listing, check MOQ and tiers, and come back on WhatsApp with a realistic BD-landed path.",
    whenToUse: [
      "You found a product but can't read the listing",
      "You need MOQ and tier pricing confirmed",
      "You want a supplier compared against alternatives",
    ],
    prepare: [
      "Product link or clear photo",
      "Target quantity",
      "Delivery city in Bangladesh",
    ],
    eta: "Most quotes answered the same working day",
  },
];