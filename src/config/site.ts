export const siteConfig = {
  name: "Source2BD",
  legalName: "Source2BD Sourcing and Cargo",
  tagline: "Source anything, from anywhere, land it in Bangladesh",
  taglineBn: "যেকোনো দেশ থেকে সোর্সিং · বাংলাদেশে ডেলিভারি",
  url: "https://source2bd.lovable.app",
  whatsappNumber: "8801752457930",
  phoneDisplay: "01752-457930",
  phoneTel: "+8801752457930",
  email: "hello@source2bd.com",
  office: "Chawkbazar Office, Dhaka",
  officeLine2: "Chawkbazar, Dhaka, Bangladesh",
  hours: "Sat to Thu, 10:00 to 20:00 Bangladesh time",
  originCities: ["Guangzhou", "Yiwu", "Shenzhen", "US warehouse"],
  destinationCities: ["Dhaka", "Chattogram"],
  policy: "Legal goods only. We do not handle restricted, counterfeit or prohibited items.",
} as const;

export const navLinks = [
  { to: "/sourcing", label: "Sourcing" },
  { to: "/services", label: "Services" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/track", label: "Track" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export type OriginKey = "china" | "amazon" | "global";

export interface OriginDef {
  key: OriginKey;
  label: string;
  labelBn: string;
  marketplaces: string;
  blurb: string;
  lanes: string;
  eta: string;
}

export const origins: OriginDef[] = [
  {
    key: "china",
    label: "China",
    labelBn: "চীন",
    marketplaces: "1688 and Alibaba",
    blurb:
      "Factory pricing, MOQ negotiation and multi supplier consolidation out of Guangzhou, Yiwu and Shenzhen.",
    lanes: "Air, sea and hand carry",
    eta: "7 to 45 days depending on lane",
  },
  {
    key: "amazon",
    label: "Amazon",
    labelBn: "অ্যামাজন",
    marketplaces: "Amazon US and UK",
    blurb:
      "Brand items and spares you cannot buy locally. We purchase on your behalf and forward from our US receiving address.",
    lanes: "Air freight and courier",
    eta: "10 to 18 days to Dhaka",
  },
  {
    key: "global",
    label: "Global",
    labelBn: "গ্লোবাল",
    marketplaces: "Any store with a link",
    blurb:
      "Paste any product link from any country. If a store will ship to a forwarder, our desk can build you a landed path.",
    lanes: "Case by case",
    eta: "Quoted per order",
  },
];

export type ServiceKey =
  | "sourcing-agent"
  | "air-freight"
  | "sea-freight"
  | "hand-carry"
  | "courier"
  | "warehouse";

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
    key: "sourcing-agent",
    title: "Sourcing agent",
    titleBn: "সোর্সিং এজেন্ট",
    short:
      "Send a keyword, a photo or a link from 1688, Alibaba, Amazon or any global store. We read the listing, confirm MOQ and tier pricing, and reply with a realistic Bangladesh landed path.",
    whenToUse: [
      "You found a product but cannot read the listing",
      "You need MOQ and tier pricing confirmed",
      "You want one supplier compared against three others",
    ],
    prepare: ["Product link or a clear photo", "Target quantity", "Delivery city in Bangladesh"],
    eta: "Most quotes answered the same working day",
  },
  {
    title: "Air freight",
    key: "air-freight",
    titleBn: "এয়ার ফ্রেইট",
    short:
      "The standard fast lane into Dhaka for commercial cargo. Charged on the higher of actual or volumetric weight, and we tell you which one applies before you commit.",
    whenToUse: ["20 kg to a few hundred kg", "Restock runs where sea is too slow", "Seasonal goods with a deadline"],
    prepare: [
      "Carton dimensions and gross weight",
      "Product description, legal goods only",
      "Consignee name, phone, NID or BIN if commercial",
    ],
    eta: "Typically 7 to 12 days door to door",
  },
  {
    key: "sea-freight",
    title: "Sea freight",
    titleBn: "সি ফ্রেইট",
    short:
      "The economical bulk lane to Chattogram port and inland ICD. Slower and far cheaper per kg, which is the right call for furniture, packaging and machinery.",
    whenToUse: ["Volume above 200 kg or 1 CBM", "Heavy, low value per kg goods", "Planned restock with 4 to 8 weeks of runway"],
    prepare: ["Total CBM estimate and carton count", "HS code guess or a clear description", "Port preference, Chattogram or ICD"],
    eta: "Estimate 25 to 45 days port to door, not a guarantee",
  },
  {
    key: "hand-carry",
    title: "Hand carry",
    titleBn: "হ্যান্ড ক্যারি",
    short:
      "Priority personal cargo, samples and urgent small parcels flown with a traveller. The fastest route out of China when a delay costs you the order.",
    whenToUse: ["Samples your buyer needs this week", "High value small items", "Under 30 kg where air paperwork is overkill"],
    prepare: ["Exact piece count and weight", "Invoice or supplier chat screenshot", "Dhaka pickup or delivery address"],
    eta: "Typically 3 to 6 days, subject to flights",
  },
  {
    key: "courier",
    title: "Courier and parcel",
    titleBn: "কুরিয়ার · পার্সেল",
    short:
      "Small commercial parcels on courier lanes with simple documentation. Good for a one carton test order before you scale a supplier.",
    whenToUse: ["One to three cartons", "Trial orders from a new supplier", "Documents and small accessories"],
    prepare: ["Carton weight", "Product photos", "Receiver phone number"],
    eta: "Typically 5 to 10 days",
  },
  {
    key: "warehouse",
    title: "Warehouse and consolidation",
    titleBn: "ওয়্যারহাউজ · কনসলিডেশন",
    short:
      "Buy from five suppliers, ship one box. We receive at our China and US addresses, check counts, repack and consolidate so you pay one freight bill instead of five.",
    whenToUse: ["Multiple suppliers in one order cycle", "You want carton counts verified before shipping", "Cutting per parcel freight overhead"],
    prepare: ["Supplier tracking numbers", "Item list with expected quantities", "Preferred ship mode once consolidated"],
    eta: "Free short term holding while your parcels arrive",
  },
];

export const trustStats = [
  { value: "4", label: "origin lanes live", sub: "China, US, EU, regional" },
  { value: "1 day", label: "median quote time", sub: "on working days" },
  { value: "0", label: "restricted goods handled", sub: "legal cargo only" },
  { value: "2", label: "BD delivery hubs", sub: "Dhaka and Chattogram" },
];
