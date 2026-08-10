import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "রিফান্ড ও ক্ষতিপূরণ নীতি | Source2BD" },
      {
        name: "description",
        content:
          "কখন টাকা ফেরত পাবেন, কখন পাবেন না, ভাঙা বা ভুল পণ্য এলে কী করবেন এবং দাবি করার সময়সীমা।",
      },
      { property: "og:title", content: "Refund and claims policy · Source2BD" },
      { property: "og:description", content: "When money is refunded, what is not covered, and how to claim." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/refunds" }],
  }),
  component: RefundsPage,
});

const covered = [
  {
    bn: "সাপ্লায়ার মাল পাঠায়নি",
    en: "Supplier never shipped",
    bBn: "পণ্য কেনার পর সাপ্লায়ার পাঠাতে না পারলে আমরা তাদের কাছ থেকে টাকা আদায় করে আপনাকে পুরো পণ্যমূল্য ফেরত দিই।",
    bEn: "If the supplier fails to ship after purchase, we recover the amount and refund the full product cost to you.",
  },
  {
    bn: "সম্পূর্ণ ভুল পণ্য এসেছে",
    en: "Completely wrong item",
    bBn: "অর্ডারের সাথে না মেলা পণ্য এলে ছবি দেখানোর পর হয় সঠিক পণ্য পাঠানো হয়, নয়তো পণ্যমূল্য ফেরত।",
    bEn: "If the item does not match the order, after photo proof we either send the correct item or refund the product cost.",
  },
  {
    bn: "ট্রানজিটে হারানো চালান",
    en: "Shipment lost in transit",
    bBn: "আমাদের হেফাজতে থাকা অবস্থায় চালান হারিয়ে গেলে পণ্যমূল্য ও ফ্রেইট ফেরত দেওয়া হয়।",
    bEn: "If a shipment is lost while in our custody, the product cost and freight are refunded.",
  },
  {
    bn: "আমাদের হিসাবের ভুল",
    en: "Our billing mistake",
    bBn: "ওজন, ফ্রেইট বা সার্ভিস চার্জে আমাদের ভুল হলে অতিরিক্ত টাকা সাথে সাথে ফেরত।",
    bEn: "Any overcharge on weight, freight or service fee is returned immediately.",
  },
];

const notCovered = [
  {
    bn: "মত বদলানো",
    en: "Change of mind",
    bBn: "সাপ্লায়ারকে অর্ডার দেওয়ার পর মত বদলালে পণ্যমূল্য ফেরতযোগ্য নয়, কারণ মাল ইতিমধ্যে কেনা হয়ে গেছে।",
    bEn: "Once the supplier order is placed the goods are already bought, so a change of mind is not refundable.",
  },
  {
    bn: "রঙ বা মানের সামান্য পার্থক্য",
    en: "Small colour or finish differences",
    bBn: "মার্কেটপ্লেসের ছবির সাথে সামান্য রঙ, প্রিন্ট বা ফিনিশের পার্থক্য স্বাভাবিক, এতে রিফান্ড হয় না।",
    bEn: "Minor differences in colour, print or finish from marketplace photos are normal and not refundable.",
  },
  {
    bn: "কাস্টমস আটকে দিলে",
    en: "Customs seizure",
    bBn: "গ্রাহকের চাওয়া পণ্য নিষিদ্ধ শ্রেণিতে পড়ায় কাস্টমস আটকালে পণ্যমূল্য ফেরতযোগ্য নয়।",
    bEn: "If goods requested by the customer fall in a restricted class and customs seizes them, the cost is not refundable.",
  },
  {
    bn: "দেরি",
    en: "Delay",
    bBn: "সময় বাড়লে ফ্রেইটের অংশ নিয়ে আলোচনা করা যায়, তবে দেরির জন্য আলাদা ক্ষতিপূরণ নেই।",
    bEn: "Freight can be discussed if transit runs long, but delay itself carries no separate compensation.",
  },
];

const steps = [
  {
    bn: "মাল খোলার সময় ভিডিও করুন",
    en: "Film the unboxing",
    bBn: "প্যাকেট না খুলে আগে ভিডিও চালু করুন। দাবি করার সময় এটিই সবচেয়ে শক্ত প্রমাণ।",
    bEn: "Start recording before you open the parcel. This is the strongest evidence for a claim.",
  },
  {
    bn: "৪৮ ঘণ্টার মধ্যে জানান",
    en: "Report within 48 hours",
    bBn: "ডেলিভারির ৪৮ ঘণ্টার মধ্যে WhatsApp-এ ছবি, ভিডিও আর অর্ডার নম্বর পাঠান।",
    bEn: "Send photos, video and your order number on WhatsApp within 48 hours of delivery.",
  },
  {
    bn: "৭ কর্মদিবসে সিদ্ধান্ত",
    en: "Decision in 7 working days",
    bBn: "আমরা সাপ্লায়ার ও ক্যারিয়ারের সাথে যাচাই করে ৭ কর্মদিবসের মধ্যে সিদ্ধান্ত জানাই।",
    bEn: "We verify with the supplier and carrier and give a decision within 7 working days.",
  },
  {
    bn: "১০ দিনে টাকা ফেরত",
    en: "Money back in 10 days",
    bBn: "অনুমোদিত রিফান্ড bKash, নগদ বা ব্যাংকে ১০ কর্মদিবসের মধ্যে পাঠানো হয়।",
    bEn: "Approved refunds are sent to bKash, Nagad or bank within 10 working days.",
  },
];

function Group({ title, items }: { title: string; items: typeof covered }) {
  const { t } = useLang();
  return (
    <>
      <h2 className="font-bn mt-8 text-[clamp(1.15rem,4vw,1.4rem)] font-extrabold">{title}</h2>
      <ul className="mt-3 grid gap-3">
        {items.map((c) => (
          <li key={c.en} className="panel matte rounded-[18px] p-5">
            <p className="font-bn text-[17px] font-bold">{t(c.bn, c.en)}</p>
            <p className="font-bn mt-2 text-[16px] font-semibold leading-relaxed text-muted-foreground">
              {t(c.bBn, c.bEn)}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

function RefundsPage() {
  const { t } = useLang();
  return (
    <Section className="pt-8">
      <Container className="max-w-[760px]">
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold leading-tight">
          {t("টাকা ফেরত ও ক্ষতিপূরণ", "Refunds and claims")}
        </h1>
        <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
          {t(
            "সহজ কথায় লেখা, যাতে পরে কোনো তর্ক না হয়।",
            "Written plainly so there is nothing to argue about later.",
          )}
        </p>

        <Group title={t("যেসব ক্ষেত্রে টাকা ফেরত পাবেন", "What we refund")} items={covered} />
        <Group title={t("যেসব ক্ষেত্রে ফেরত হয় না", "What we do not refund")} items={notCovered} />
        <Group title={t("দাবি করার নিয়ম", "How to make a claim")} items={steps} />

        <a
          href={generalInquiry()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bn mt-8 flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-wa text-[17px] font-bold text-wa-foreground"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("দাবি জানাতে WhatsApp করুন", "Start a claim on WhatsApp")} {siteConfig.phoneDisplay}
        </a>

        <p className="font-bn mt-4 text-[15px] font-semibold text-muted-foreground">
          <Link to="/terms" className="text-accent underline">
            {t("শর্তাবলী দেখুন", "Read the terms of service")}
          </Link>
        </p>
      </Container>
    </Section>
  );
}
