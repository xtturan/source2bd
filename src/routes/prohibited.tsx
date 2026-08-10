import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/prohibited")({
  head: () => ({
    meta: [
      { title: "নিষিদ্ধ পণ্য · যা আমরা আনি না | Source2BD" },
      {
        name: "description",
        content:
          "Source2BD শুধু বৈধ পণ্য আনে। নকল ব্র্যান্ড, অস্ত্র, মাদক, বিপজ্জনক রাসায়নিক ও নিষিদ্ধ পণ্যের তালিকা দেখুন।",
      },
      { property: "og:title", content: "Prohibited goods · Source2BD" },
      { property: "og:description", content: "Legal goods only. Here is exactly what we refuse to carry." },
      { property: "og:url", content: "https://source2bd.com/prohibited" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/prohibited" }],
  }),
  component: ProhibitedPage,
});

const banned = [
  { bn: "নকল ব্র্যান্ডের পণ্য", en: "Counterfeit or replica branded goods" },
  { bn: "অস্ত্র, গোলাবারুদ ও তার যন্ত্রাংশ", en: "Weapons, ammunition and their parts" },
  { bn: "মাদক ও নেশাজাতীয় দ্রব্য", en: "Narcotics and intoxicants" },
  { bn: "বিপজ্জনক রাসায়নিক ও দাহ্য পদার্থ", en: "Hazardous chemicals and flammables" },
  { bn: "লাইসেন্স ছাড়া ওষুধ ও মেডিকেল ডিভাইস", en: "Medicines and medical devices without a licence" },
  { bn: "অশ্লীল বা ধর্মীয় অনুভূতিতে আঘাত করে এমন সামগ্রী", en: "Obscene or religiously offensive material" },
  { bn: "বন্যপ্রাণী, চামড়া, হাতির দাঁত জাতীয় পণ্য", en: "Wildlife products, ivory and protected skins" },
  { bn: "লাইভ ব্যাটারি বা পাওয়ার ব্যাংক নিয়মবহির্ভূত পরিমাণে", en: "Loose batteries or power banks beyond carrier limits" },
  { bn: "টাকা, স্বর্ণ, মূল্যবান পাথর", en: "Currency, gold and precious stones" },
  { bn: "বাংলাদেশ কাস্টমসের নিষিদ্ধ তালিকার যেকোনো পণ্য", en: "Anything on the Bangladesh Customs prohibited list" },
];

function ProhibitedPage() {
  const { t } = useLang();
  return (
    <Section className="pt-8">
      <Container className="max-w-[760px]">
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold leading-tight">
          {t("যেসব পণ্য আমরা আনি না", "Goods we do not carry")}
        </h1>
        <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
          {t(
            "Source2BD শুধু বৈধ পণ্য আনে। নিচের কোনো পণ্যের অনুরোধ আমরা গ্রহণ করি না, টাকা দিলেও না।",
            "Source2BD moves legal goods only. We decline every request below, whatever the offer.",
          )}
        </p>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {banned.map((b) => (
            <li key={b.en} className="panel matte flex items-start gap-3 rounded-[16px] p-4">
              <span
                aria-hidden
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-destructive/12 text-destructive"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </span>
              <span className="font-bn text-[16px] font-semibold leading-snug">{t(b.bn, b.en)}</span>
            </li>
          ))}
        </ul>

        <div className="panel matte mt-6 rounded-[18px] p-5">
          <p className="font-bn text-[16px] font-semibold leading-relaxed text-muted-foreground">
            {t(
              "আপনার পণ্য এই তালিকায় আছে কি না নিশ্চিত না হলে আগে জিজ্ঞেস করুন। অর্ডার দেওয়ার পর কাস্টমস আটকালে খরচ ফেরত হয় না।",
              "If you are unsure whether an item falls in this list, ask before ordering. Costs are not refundable if customs seizes prohibited goods.",
            )}
          </p>
          <a
            href={generalInquiry()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bn mt-4 flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-wa text-[16px] font-bold text-wa-foreground"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t("জিজ্ঞেস করুন", "Ask us")} {siteConfig.phoneDisplay}
          </a>
        </div>

        <p className="font-bn mt-4 text-[15px] font-semibold text-muted-foreground">
          <Link to="/terms" className="text-accent underline">
            {t("শর্তাবলী", "Terms of service")}
          </Link>
          {" · "}
          <Link to="/refunds" className="text-accent underline">
            {t("রিফান্ড নীতি", "Refund policy")}
          </Link>
        </p>
      </Container>
    </Section>
  );
}
