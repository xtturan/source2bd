import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "আরও · সার্ভিস, প্রশ্ন ও যোগাযোগ | Source2BD" },
      {
        name: "description",
        content:
          "Source2BD এর সব সার্ভিস, কীভাবে কাজ করে, সাধারণ প্রশ্ন, অফিসের ঠিকানা ও ভাষা বদলানোর অপশন এক জায়গায়।",
      },
      { property: "og:title", content: "আরও · Source2BD" },
      { property: "og:description", content: "সার্ভিস, প্রশ্ন, যোগাযোগ ও ভাষা এক পাতায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MorePage,
});

const pages = [
  { to: "/services", bn: "সার্ভিস", en: "Services" },
  { to: "/how-it-works", bn: "কীভাবে কাজ করে", en: "How it works" },
  { to: "/faq", bn: "সাধারণ প্রশ্ন", en: "Questions" },
  { to: "/about", bn: "আমরা কারা", en: "About us" },
  { to: "/contact", bn: "যোগাযোগ", en: "Contact" },
  { to: "/privacy", bn: "প্রাইভেসি", en: "Privacy" },
] as const;

function MorePage() {
  const { t, lang, setLang } = useLang();
  return (
    <Section className="py-8">
      <Container>
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.2rem)] font-extrabold">{t("আরও", "More")}</h1>

        <div className="mt-5 grid gap-3">
          <a
            href={generalInquiry()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bn flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-wa text-lg font-bold text-wa-foreground"
          >
            <WhatsAppIcon className="h-6 w-6" />
            {t("হোয়াটসঅ্যাপে লিখুন", "Message on WhatsApp")}
          </a>
          <a
            href={telLink}
            className="font-bn flex min-h-[64px] items-center justify-center rounded-full bg-foreground text-lg font-bold text-background"
          >
            {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
          </a>
        </div>

        <div className="panel matte mt-6 rounded-[18px] p-4">
          <p className="font-bn text-base font-bold">{t("ভাষা", "Language")}</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["bn", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={cn(
                  "font-bn min-h-[56px] rounded-[14px] text-lg font-bold",
                  lang === l ? "bg-foreground text-background" : "border border-border text-muted-foreground",
                )}
              >
                {l === "bn" ? "বাংলা" : "English"}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {pages.map((p) => (
            <li key={p.to}>
              <Link
                to={p.to}
                className="panel matte flex min-h-[64px] items-center justify-between gap-3 rounded-[16px] px-5"
              >
                <span className="font-bn text-[17px] font-bold">{t(p.bn, p.en)}</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-50" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>

        <div className="panel matte mt-6 rounded-[18px] p-5">
          <p className="font-bn text-[16px] font-bold">{t(siteConfig.officeBn, siteConfig.office)}</p>
          <p className="font-bn mt-1 text-[15px] font-semibold text-muted-foreground">
            {t(siteConfig.hoursBn, siteConfig.hours)}
          </p>
          <p className="font-bn mt-1 text-[15px] font-semibold text-muted-foreground">
            {t(siteConfig.policyBn, siteConfig.policy)}
          </p>
        </div>
      </Container>
    </Section>
  );
}
