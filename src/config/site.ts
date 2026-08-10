export const siteConfig = {
  name: "Source2BD",
  legalName: "Source2BD",
  /** Parent company. Source2BD is its customer facing sourcing product. */
  parent: "TWT International",
  parentLineBn: "TWT International-এর সোর্সিং ও কার্গো সার্ভিস",
  parentLineEn: "The sourcing and cargo service of TWT International",
  tagline: "Source anything, from anywhere, land it in Bangladesh",
  taglineBn: "যেকোনো দেশ থেকে সোর্সিং · বাংলাদেশে ডেলিভারি",
  url: "https://source2bd.com",
  whatsappNumber: "8801752457930",
  phoneDisplay: "01752-457930",
  phoneTel: "+8801752457930",
  email: "hello@source2bd.com",
  office: "Chawkbazar Office, Dhaka",
  officeLine2: "Chawkbazar, Dhaka, Bangladesh",
  landmark: "Chawkbazar, Dhaka",
  landmarkBn: "চকবাজার, ঢাকা",
  /** Owner fills this later, e.g. "beside X market, 2nd floor". Empty = hidden. */
  landmarkDetail: "",
  landmarkDetailBn: "",
  /** Set to a real Google Maps place embed URL only when a real pin exists. Empty = no map. */
  mapEmbedUrl: "https://www.google.com/maps?q=Chawkbazar+Dhaka&output=embed",
  /** Owner supplied registration numbers. Leave empty until confirmed, never invent. */
  tradeLicense: "",
  binNumber: "",
  hours: "Sat to Thu, 10:00 to 20:00 Bangladesh time",
  originCities: ["Guangzhou", "Yiwu", "Shenzhen", "US warehouse"],
  destinationCities: ["Dhaka", "Chattogram"],
  policy: "Legal goods only. We do not handle restricted, counterfeit or prohibited items.",
  policyBn: "শুধু বৈধ পণ্য আনি। নকল বা নিষিদ্ধ কিছু আমরা আনি না।",
  hoursBn: "শনি থেকে বৃহস্পতি, সকাল ১০টা থেকে রাত ৮টা",
  officeBn: "চকবাজার, ঢাকা",
  mapUrl: "https://maps.google.com/?q=Chawkbazar+Dhaka",
} as const;

/**
 * Illustrative landed-cost split shown on the home, quote and product pages.
 * These are teaching numbers, not a price list. Edit here only.
 */
export const costExample = {
  label: "10 kg LED light order, air freight",
  parts: [
    { bn: "পণ্যের দাম", en: "Product cost", taka: 12000 },
    { bn: "আমাদের সার্ভিস", en: "Our service fee", taka: 1400 },
    { bn: "ফ্রেইট (এয়ার)", en: "Freight (air)", taka: 6500 },
    { bn: "ক্লিয়ারেন্স ও ট্যাক্স (আনুমানিক)", en: "Clearance and duty (estimate)", taka: 3100 },
  ],
} as const;

/**
 * The full TWT International suite, written for shop owners and importers.
 * Honest scope only: no customs-clearance claims we cannot back.
 */
export const b2bServices = [
  {
    key: "sourcing-agent",
    bn: "সোর্সিং এজেন্ট (১৬৮৮ / আলিবাবা / অ্যামাজন)",
    en: "Sourcing agent (1688 / Alibaba / Amazon)",
    timeBn: "কোট ২–২৪ ঘণ্টায়",
    timeEn: "Quote in 2–24 hours",
    pointsBn: [
      "নাম, ছবি বা লিংক থেকে সাপ্লায়ার খুঁজে দেই",
      "একই পণ্যের কয়েকটি দাম তুলনা করে দেখাই",
      "সাপ্লায়ারের সাথে চীনা ভাষায় দরদাম করি",
    ],
    pointsEn: [
      "We find the supplier from a name, photo or link",
      "We compare several offers for the same item",
      "We negotiate with the supplier in Chinese",
    ],
  },
  {
    key: "payment-support",
    bn: "চীনে পেমেন্ট সাপোর্ট",
    en: "China payment support",
    timeBn: "একই দিনে",
    timeEn: "Same day",
    pointsBn: [
      "আপনার হয়ে সাপ্লায়ারকে বৈধ পথে পরিশোধ করি",
      "প্রতিটি পেমেন্টের রসিদ আপনাকে দেই",
      "শুধু বৈধ পণ্যের অর্ডারে প্রযোজ্য",
    ],
    pointsEn: [
      "We settle the supplier invoice on your behalf through legal channels",
      "You receive a receipt for every payment",
      "Applies to legal goods only",
    ],
  },
  {
    key: "freight",
    bn: "ফ্রেইট — এয়ার, সি, হ্যান্ড ক্যারি, কুরিয়ার",
    en: "Freight — air, sea, hand carry, courier",
    timeBn: "৪–৪৫ দিন, লাইন অনুযায়ী",
    timeEn: "4–45 days depending on the lane",
    pointsBn: [
      "ওজন ও ভলিউম দেখে সবচেয়ে সস্তা লাইন বেছে দেই",
      "প্রতি কেজি বা প্রতি সিবিএম রেট আগেই জানাই",
      "জরুরি হলে হ্যান্ড ক্যারি",
    ],
    pointsEn: [
      "We pick the cheapest lane for your weight and volume",
      "Per kg or per CBM rate is quoted upfront",
      "Hand carry when it is urgent",
    ],
  },
  {
    key: "cnf",
    bn: "সি অ্যান্ড এফ ও কাস্টমস সমন্বয়",
    en: "C&F and customs coordination",
    timeBn: "পোর্টে ২–৭ দিন",
    timeEn: "2–7 days at port",
    pointsBn: [
      "লাইসেন্সধারী সি অ্যান্ড এফ এজেন্টের সাথে কাজ করি",
      "কাগজপত্র ও এইচএস কোড গুছিয়ে দেই",
      "ডিউটি সরকারি হারে, আমরা কিছু যোগ করি না",
    ],
    pointsEn: [
      "We work with licensed C&F agents",
      "Documents and HS codes prepared for you",
      "Duty at government rates, we add nothing on top",
    ],
  },
  {
    key: "warehouse-qc",
    bn: "গুদামে একত্র করা ও কিউসি ছবি",
    en: "Warehouse consolidation and QC photos",
    timeBn: "ফ্রি স্টোরেজ ১৫ দিন",
    timeEn: "15 days free storage",
    pointsBn: [
      "কয়েক সাপ্লায়ারের মাল এক কার্টনে",
      "পাঠানোর আগে ছবি ও ভিডিও",
      "ভাঙা বা ভুল মাল আগেই ধরা পড়ে",
    ],
    pointsEn: [
      "Several suppliers packed into one carton",
      "Photos and video before dispatch",
      "Damaged or wrong items caught before shipping",
    ],
  },
  {
    key: "door-delivery",
    bn: "বাংলাদেশে ডোর ডেলিভারি",
    en: "Door delivery in Bangladesh",
    timeBn: "ক্লিয়ারেন্সের পর ১–৩ দিন",
    timeEn: "1–3 days after clearance",
    pointsBn: [
      "ঢাকা, চট্টগ্রামসহ সারা দেশে",
      "কুরিয়ার বা ট্রাক, পরিমাণ অনুযায়ী",
      "ডেলিভারির আগে ফোনে জানানো হয়",
    ],
    pointsEn: [
      "Dhaka, Chattogram and nationwide",
      "Courier or truck depending on volume",
      "We call before delivery",
    ],
  },
] as const;

export const navLinks = [
  { to: "/sourcing", label: "Sourcing", bn: "খুঁজুন" },
  { to: "/quote", label: "Full price", bn: "শিপিংসহ দাম" },
  { to: "/services", label: "Services", bn: "সার্ভিস" },
  { to: "/how-it-works", label: "How it works", bn: "কীভাবে কাজ করে" },
  { to: "/track", label: "Track", bn: "ট্র্যাক" },
  { to: "/faq", label: "Questions", bn: "প্রশ্ন" },
  { to: "/contact", label: "Contact", bn: "যোগাযোগ" },
] as const;

/** Common delivery cities, Bangla first, for the quote form dropdown. */
export const bdCities = [
  "ঢাকা",
  "চট্টগ্রাম",
  "খুলনা",
  "রাজশাহী",
  "সিলেট",
  "বরিশাল",
  "রংপুর",
  "ময়মনসিংহ",
  "কুমিল্লা",
  "নারায়ণগঞ্জ",
  "গাজীপুর",
  "যশোর",
  "বগুড়া",
  "কক্সবাজার",
  "অন্যান্য",
] as const;

/** Picture buttons on the home page. Each opens the search with a keyword. */
export const quickCategories = [
  { bn: "লাইট", en: "Lights", q: "led light" },
  { bn: "ফোন কভার", en: "Phone cases", q: "phone case" },
  { bn: "জুতো", en: "Shoes", q: "shoes" },
  { bn: "মেশিন", en: "Machines", q: "small machine" },
] as const;

/** Short Bangla service tiles. Long English copy lives in EN mode only. */
export const simpleServices = [
  {
    key: "hand-carry",
    bn: "হ্যান্ড ক্যারি",
    en: "Hand carry",
    forBn: "খুব জরুরি ছোট পণ্য",
    forEn: "Urgent small parcels",
    timeBn: "৩ থেকে ৬ দিন",
    timeEn: "3 to 6 days",
  },
  {
    key: "air-freight",
    bn: "এয়ার",
    en: "Air",
    forBn: "মাঝারি ওজনের মাল, দ্রুত চাই",
    forEn: "Medium weight, fast",
    timeBn: "৭ থেকে ১২ দিন",
    timeEn: "7 to 12 days",
  },
  {
    key: "sea-freight",
    bn: "সি (জাহাজ)",
    en: "Sea",
    forBn: "অনেক বেশি বা ভারী মাল",
    forEn: "Big or heavy loads",
    timeBn: "২৫ থেকে ৪৫ দিন",
    timeEn: "25 to 45 days",
  },
  {
    key: "courier",
    bn: "কুরিয়ার",
    en: "Courier",
    forBn: "এক দুই কার্টন, ট্রায়াল অর্ডার",
    forEn: "One or two cartons",
    timeBn: "৫ থেকে ১০ দিন",
    timeEn: "5 to 10 days",
  },
  {
    key: "warehouse",
    bn: "গুদাম",
    en: "Warehouse",
    forBn: "কয়েক দোকানের মাল এক বাক্সে",
    forEn: "Many sellers, one box",
    timeBn: "মাল আসা পর্যন্ত ফ্রি রাখা",
    timeEn: "Free short holding",
  },
  {
    key: "sourcing-agent",
    bn: "এজেন্ট",
    en: "Buying agent",
    forBn: "পণ্য খুঁজে দেওয়া ও দরদাম",
    forEn: "We find and bargain",
    timeBn: "সাধারণত একই দিনে উত্তর",
    timeEn: "Usually same day reply",
  },
] as const;

/** Eight short questions, Bangla first. */
export const simpleFaqs = [
  {
    qBn: "ইংরেজি না জানলে হবে?",
    qEn: "What if I do not know English?",
    aBn: "হবে। শুধু ছবি বা লিংক পাঠান। আমরা বাংলায় কথা বলি।",
    aEn: "Yes. Just send a photo or a link. We reply in Bangla.",
  },
  {
    qBn: "শুধু ছবি দিলে হবে?",
    qEn: "Is a photo enough?",
    aBn: "হ্যাঁ। এক পণ্যের পরিষ্কার ছবি দিন। আমরা খুঁজে বের করি।",
    aEn: "Yes. One clear photo of the item is enough for us to find it.",
  },
  {
    qBn: "দামে কী কী থাকে?",
    qEn: "What is inside the price?",
    aBn: "পণ্যের দাম, আমাদের সার্ভিস চার্জ, আর আনার খরচ। তিনটাই আলাদা করে বলি।",
    aEn: "Product cost, our service fee and freight. We show all three separately.",
  },
  {
    qBn: "কতদিন লাগে?",
    qEn: "How long does it take?",
    aBn: "জরুরি হলে ৩ থেকে ৬ দিন। সাধারণ বিমানে ৭ থেকে ১২ দিন। জাহাজে ২৫ থেকে ৪৫ দিন।",
    aEn: "Hand carry 3 to 6 days, air 7 to 12 days, sea 25 to 45 days.",
  },
  {
    qBn: "কাস্টমস বা ট্যাক্স কে দেয়?",
    qEn: "Who pays customs?",
    aBn: "কাগজপত্র আমরা করি। সরকার যে ট্যাক্স ধরে সেটা দামের সাথে আগেই জানিয়ে দিই।",
    aEn: "We handle the paperwork. Government duty is told to you before you agree.",
  },
  {
    qBn: "টাকা কখন দিতে হয়?",
    qEn: "When do I pay?",
    aBn: "দাম দেখে আপনি রাজি হলে তবেই টাকা। আগে কিছু দিতে হয় না।",
    aEn: "Only after you see the price and agree. Nothing before that.",
  },
  {
    qBn: "কোন পণ্য আনা যায় না?",
    qEn: "What can you not bring?",
    aBn: "নকল ব্র্যান্ড, অস্ত্র, নিষিদ্ধ কেমিক্যাল বা লাইসেন্স লাগে এমন কিছু আমরা আনি না।",
    aEn: "No counterfeits, weapons, restricted chemicals or licensed goods.",
  },
  {
    qBn: "অফিস কোথায়?",
    qEn: "Where is the office?",
    aBn: "চকবাজার, ঢাকা। শনি থেকে বৃহস্পতি, সকাল ১০টা থেকে রাত ৮টা।",
    aEn: "Chawkbazar, Dhaka. Saturday to Thursday, 10:00 to 20:00.",
  },
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

/**
 * Honest claims only. These describe what we offer, not measured metrics.
 * Never add order counts, review counts or SLA numbers we do not track.
 */
export const trustStats = [
  { value: "1688 · Alibaba · Amazon", label: "markets we buy from", sub: "and any global store on request" },
  { value: "Air · Sea · Courier · Hand carry", label: "freight options", sub: "we pick the cheapest for your load" },
  { value: "Legal goods only", label: "what we will carry", sub: "no counterfeit, no restricted items" },
  { value: "Dhaka · Chattogram", label: "delivery hubs", sub: "nationwide door delivery from there" },
];
