import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, Card } from "@/components/s2b/primitives";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "গোপনীয়তা নীতি · Privacy policy | Source2BD" },
      {
        name: "description",
        content:
          "Source2BD কী তথ্য রাখে: অ্যাকাউন্ট, সার্চ রেকর্ড, ছবি, শিপমেন্টের কাগজ। কেন রাখে, কতদিন রাখে, কার সাথে শেয়ার করে।",
      },
      { property: "og:title", content: "গোপনীয়তা নীতি · Source2BD" },
      { property: "og:description", content: "আমরা কী তথ্য রাখি, সহজ বাংলায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/privacy" }],
  }),
  component: PrivacyPage,
});

/**
 * This page must match what the code actually does: accounts, search quota,
 * cached searches, photo uploads and abuse logging all exist in the backend.
 */
const sections = [
  {
    tBn: "অ্যাকাউন্ট খুললে কী রাখি",
    tEn: "What we store when you create an account",
    bBn: "আপনার ইমেইল বা ফোন নম্বর, একটি এনক্রিপ্টেড পাসওয়ার্ড এবং লগইন সেশন। এই সাইটে অ্যাকাউন্ট বাধ্যতামূলক নয়; ছবি বা লিংক পাঠিয়ে হোয়াটসঅ্যাপেই অর্ডার করা যায়।",
    bEn: "Your email or phone number, an encrypted password and a login session. An account is not required: you can order entirely over WhatsApp with a photo or a link.",
  },
  {
    tBn: "সার্চ ও ব্যবহারের রেকর্ড",
    tEn: "Search and usage records",
    bBn: "লাইভ সার্চ ব্যয়বহুল, তাই প্রতিটি সার্চের কীওয়ার্ড ও ফলাফল আমাদের ডেটাবেসে জমা হয় এবং পরের বার সবার জন্য দ্রুত দেখানো হয়। প্রতি অ্যাকাউন্টের দৈনিক সার্চ সংখ্যাও গোনা হয়, কারণ দিনে ৩০টি সার্চের সীমা আছে।",
    bEn: "Live searches cost money, so the keyword and the results of every search are saved in our database and reused for everyone. We also count how many searches each account runs per day, because the daily limit is 30.",
  },
  {
    tBn: "অপব্যবহার ঠেকানোর লগ",
    tEn: "Abuse prevention logs",
    bBn: "স্বয়ংক্রিয় স্ক্রিপ্ট ও কোটা ফাঁকি ঠেকাতে আমরা অনুরোধের সময়, আইপি ঠিকানা ও ডিভাইস শনাক্তকারী রাখি। একই ডিভাইস থেকে সর্বোচ্চ ২টি অ্যাকাউন্ট খোলা যায়।",
    bEn: "To stop scripts and quota abuse we log request times, IP addresses and a device identifier. A single device may create at most 2 accounts.",
  },
  {
    tBn: "ছবি দিয়ে খোঁজা",
    tEn: "Photo search",
    bBn: "ছবি দিয়ে খুঁজলে ছবিটি আমাদের স্টোরেজে জমা হয় এবং মিল খুঁজতে মার্কেটপ্লেস সার্চ সেবার কাছে পাঠানো হয়। ছবি ব্যক্তিগত থাকে, বাইরের কেউ দেখতে পায় না।",
    bEn: "A photo search uploads your image to our private storage and sends it to the marketplace image-search service to find matches. The bucket is private; the public cannot read it.",
  },
  {
    tBn: "হোয়াটসঅ্যাপে যা লেখেন",
    tEn: "What you send on WhatsApp",
    bBn: "কোটেশন, ট্র্যাক ও সোর্সিং ফর্মগুলো আপনার ব্রাউজারেই মেসেজ বানায় এবং হোয়াটসঅ্যাপে হস্তান্তর করে। ওই কথোপকথন হোয়াটসঅ্যাপে থাকে, এই ওয়েবসাইটে সংরক্ষিত হয় না।",
    bEn: "The quote, status and sourcing forms build the message in your browser and hand it to WhatsApp. That conversation lives in WhatsApp; this website does not store it.",
  },
  {
    tBn: "গ্রাহক হলে যা রাখি",
    tEn: "What we hold once you become a customer",
    bBn: "মাল আনতে যা লাগে: নাম, ফোন, ডেলিভারি ঠিকানা, পণ্যের বিবরণ, ইনভয়েস এবং কাস্টমস চাইলে প্রাপকের পরিচয়পত্র।",
    bEn: "Whatever it takes to move your cargo: name, phone, delivery address, product descriptions, invoices and consignee identification where customs requires it.",
  },
  {
    tBn: "কার সাথে শেয়ার করি",
    tEn: "Who we share it with",
    bBn: "শুধু যাদের ছাড়া চালান শেষ হয় না: সাপ্লায়ার, ফ্রেইট ক্যারিয়ার, আমাদের সি অ্যান্ড এফ এজেন্ট ও বাংলাদেশ কাস্টমস। আমরা কারো কাছে তথ্য বিক্রি বা ভাড়া দেই না।",
    bEn: "Only the parties that must have it to complete your shipment: suppliers, freight carriers, our C&F agent and Bangladesh Customs. We never sell or rent data.",
  },
  {
    tBn: "কতদিন রাখি",
    tEn: "How long we keep it",
    bBn: "সার্চ ক্যাশ ৪৫ দিন পর মুছে যায়। অপব্যবহারের লগ স্বল্পমেয়াদি। শিপমেন্ট ও কাস্টমস রেকর্ড বাংলাদেশি বাণিজ্যিক ও কর আইনে যতদিন রাখা বাধ্যতামূলক ততদিন থাকে, তারপর মুছে ফেলা হয়।",
    bEn: "Cached searches are deleted after 45 days. Abuse logs are short-lived. Shipment and customs records are kept for the period Bangladeshi commercial and tax rules require, then removed.",
  },
  {
    tBn: "আপনার অনুরোধ",
    tEn: "Your requests",
    bBn: `আপনার সম্পর্কে কী আছে জানতে, ভুল সংশোধন করতে বা অ্যাকাউন্ট ও তথ্য মুছে ফেলতে ${siteConfig.phoneDisplay} নম্বরে হোয়াটসঅ্যাপে লিখুন। আইন অনুযায়ী রাখা বাধ্যতামূলক রেকর্ড ছাড়া বাকিটা মুছে দেওয়া হবে।`,
    bEn: `Message ${siteConfig.phoneDisplay} on WhatsApp to ask what we hold, correct it, or delete your account and data. We remove everything except records we are legally required to keep.`,
  },
];

function PrivacyPage() {
  const { t } = useLang();
  return (
    <Section>
      <Container>
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold leading-tight">
          {t("গোপনীয়তা নীতি", "Privacy policy")}
        </h1>
        <p className="font-bn mt-3 max-w-[60ch] text-[16px] font-semibold leading-relaxed text-muted-foreground">
          {t(
            "আমরা যা রাখি শুধু সেটাই এখানে লেখা আছে। অ্যাকাউন্ট ছাড়াও পুরো সেবা ব্যবহার করা যায়।",
            "This page lists only what we actually keep. The whole service also works without an account.",
          )}
        </p>
        <div className="mt-12 grid max-w-3xl gap-4">
          {sections.map((s) => (
            <Card key={s.tEn} className="p-6">
              <h2 className="font-bn text-[17px] font-bold">{t(s.tBn, s.tEn)}</h2>
              <p className="font-bn mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
                {t(s.bBn, s.bEn)}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
