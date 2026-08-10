import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলী · Terms of service | Source2BD" },
      {
        name: "description",
        content:
          "Source2BD ব্যবহারের শর্ত: দাম, পেমেন্ট, ডেলিভারি সময়, কাস্টমস, নিষিদ্ধ পণ্য এবং দায়বদ্ধতার সীমা।",
      },
      { property: "og:title", content: "Terms of service · Source2BD" },
      { property: "og:description", content: "Prices, payment, delivery times, customs and limits of liability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/terms" }],
  }),
  component: TermsPage,
});

const clauses = [
  {
    bn: "আমরা কী করি",
    en: "What we do",
    bBn: "আমরা চীন, আমাজন ও অন্যান্য বাজার থেকে আপনার হয়ে পণ্য কিনে বাংলাদেশে পৌঁছে দিই। আমরা প্রস্তুতকারক নই, ক্রয় ও শিপিং এজেন্ট।",
    bEn: "We buy products on your behalf from China, Amazon and other markets and deliver them in Bangladesh. We are a buying and shipping agent, not the manufacturer.",
  },
  {
    bn: "ওয়েবসাইটের দাম",
    en: "Prices shown on the site",
    bBn: "সার্চে যে দাম দেখেন সেটি মার্কেটপ্লেসের দাম থেকে হিসাব করা আনুমানিক দাম। এতে শিপিং, কাস্টমস বা ডেলিভারি ধরা নেই। চূড়ান্ত দাম WhatsApp-এ কোটেশনে দেওয়া হয় এবং সেটিই প্রযোজ্য।",
    bEn: "Prices in search results are estimates derived from marketplace listings. They exclude freight, customs and local delivery. The quotation we send on WhatsApp is the binding price.",
  },
  {
    bn: "অর্ডার ও পেমেন্ট",
    en: "Orders and payment",
    bBn: "আপনি কোটেশনে রাজি হলে অর্ডার শুরু হয়। সাধারণত অগ্রিম পেমেন্টে পণ্য কেনা হয়, বাকি অংশ মাল পৌঁছানোর আগে। পেমেন্টের রসিদ সবসময় নিজের কাছে রাখুন।",
    bEn: "An order starts once you accept the quotation. Goods are normally bought against an advance, with the balance due before delivery. Always keep your payment receipts.",
  },
  {
    bn: "সময়",
    en: "Transit times",
    bBn: "সব সময়সীমা আনুমানিক। কাস্টমস, এয়ারলাইন, শিপিং লাইন, ছুটি বা সাপ্লায়ার দেরির কারণে সময় বদলাতে পারে। দেরির জন্য কোনো ক্ষতিপূরণ দেওয়া হয় না।",
    bEn: "All transit times are estimates. Customs, airlines, shipping lines, holidays or supplier delays can change them. Delays do not create a compensation claim.",
  },
  {
    bn: "কাস্টমস ও ট্যাক্স",
    en: "Customs and duties",
    bBn: "সরকারি শুল্ক ও ভ্যাট পণ্যের ধরন অনুযায়ী নির্ধারিত হয়। কোটেশনে যা বলা হয় তা প্রচলিত হার অনুযায়ী; সরকার হার বদলালে বা কাস্টমস ভিন্ন মূল্যায়ন করলে পার্থক্য গ্রাহককে দিতে হবে।",
    bEn: "Government duty and VAT depend on the product class. Quoted figures follow prevailing rates; if rates change or customs assesses differently, the difference is payable by the customer.",
  },
  {
    bn: "নিষিদ্ধ পণ্য",
    en: "Prohibited goods",
    bBn: "নকল ব্র্যান্ড, অস্ত্র, মাদক, বিপজ্জনক রাসায়নিক, ব্যাটারি-ঝুঁকিপূর্ণ পণ্যসহ বাংলাদেশে নিষিদ্ধ কিছুই আমরা আনি না। এমন অর্ডার বাতিল হবে এবং খরচ ফেরতযোগ্য নয়।",
    bEn: "We do not handle counterfeits, weapons, narcotics, hazardous chemicals or anything restricted in Bangladesh. Such orders are cancelled and costs already incurred are not refundable.",
  },
  {
    bn: "অ্যাকাউন্ট ব্যবহার",
    en: "Account use",
    bBn: "একটি ডিভাইস থেকে সর্বোচ্চ ২টি অ্যাকাউন্ট এবং প্রতি অ্যাকাউন্টে দিনে ৩০টি লাইভ সার্চ। স্বয়ংক্রিয় স্ক্রিপ্ট, স্ক্র্যাপিং বা কোটা ফাঁকি দেওয়ার চেষ্টা করলে অ্যাকাউন্ট বন্ধ করা হবে।",
    bEn: "A device may create up to 2 accounts, and each account gets 30 live searches per day. Automated scripts, scraping or attempts to bypass the quota result in the account being blocked.",
  },
  {
    bn: "দায়বদ্ধতার সীমা",
    en: "Limit of liability",
    bBn: "আমাদের দায় সংশ্লিষ্ট চালানের জন্য আপনার পরিশোধিত সার্ভিস চার্জের মধ্যে সীমিত। ব্যবসায়িক লোকসান, মুনাফা হারানো বা পরোক্ষ ক্ষতির দায় আমরা নিই না।",
    bEn: "Our liability is limited to the service fee you paid for the shipment concerned. We are not liable for lost profit, business loss or indirect damages.",
  },
  {
    bn: "আইন",
    en: "Governing law",
    bBn: "এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত এবং ঢাকার আদালতের এখতিয়ারভুক্ত।",
    bEn: "These terms are governed by the laws of Bangladesh, with the courts of Dhaka having jurisdiction.",
  },
];

function TermsPage() {
  const { t } = useLang();
  return (
    <Section className="pt-8">
      <Container className="max-w-[760px]">
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold leading-tight">
          {t("শর্তাবলী", "Terms of service")}
        </h1>
        <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
          {t(
            `Source2BD ব্যবহার করলে নিচের শর্তগুলো প্রযোজ্য। কিছু বুঝতে সমস্যা হলে ${siteConfig.phoneDisplay} নম্বরে WhatsApp করুন।`,
            `Using Source2BD means these terms apply. If anything is unclear, message ${siteConfig.phoneDisplay} on WhatsApp.`,
          )}
        </p>

        <ol className="mt-6 grid gap-3">
          {clauses.map((c, i) => (
            <li key={c.en} className="panel matte rounded-[18px] p-5">
              <h2 className="font-bn text-[17px] font-bold">
                <span className="tnum mr-2 text-muted-foreground">{i + 1}.</span>
                {t(c.bn, c.en)}
              </h2>
              <p className="font-bn mt-2 text-[16px] font-semibold leading-relaxed text-muted-foreground">
                {t(c.bBn, c.bEn)}
              </p>
            </li>
          ))}
        </ol>

        <p className="font-bn mt-6 text-[15px] font-semibold text-muted-foreground">
          {t("টাকা ফেরতের নিয়ম আলাদা পাতায়:", "Refund rules live on their own page:")}{" "}
          <Link to="/refunds" className="text-accent underline">
            {t("রিফান্ড পলিসি", "Refund policy")}
          </Link>
        </p>
      </Container>
    </Section>
  );
}
