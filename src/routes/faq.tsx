import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { simpleFaqs, siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "সাধারণ প্রশ্ন · ইংরেজি না জানলেও হবে | Source2BD" },
      {
        name: "description",
        content:
          "ইংরেজি না জানলে কী হবে, শুধু ছবি দিলে চলবে কি না, দামে কী থাকে, কতদিন লাগে, ট্যাক্স কে দেয় আর অফিস কোথায়, সহজ বাংলায় উত্তর।",
      },
      { property: "og:title", content: "সাধারণ প্রশ্ন · Source2BD" },
      { property: "og:description", content: "আটটি সাধারণ প্রশ্নের সহজ বাংলা উত্তর।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: simpleFaqs.map((f) => ({
            "@type": "Question",
            name: f.qBn,
            acceptedAnswer: { "@type": "Answer", text: f.aBn },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useLang();
  return (
    <Section className="py-8">
      <Container>
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold">
          {t("সাধারণ প্রশ্ন", "Common questions")}
        </h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {simpleFaqs.map((f) => (
            <div key={f.qEn} className="panel matte rounded-[18px] p-5">
              <h2 className="font-bn text-[18px] font-extrabold leading-snug">{t(f.qBn, f.qEn)}</h2>
              <p className="font-bn mt-2 text-[16px] font-medium leading-relaxed text-muted-foreground">
                {t(f.aBn, f.aEn)}
              </p>
              <a
                href={generalInquiry(f.qEn)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bn mt-3 inline-flex items-center gap-2 text-[15px] font-bold text-wa"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {t("আরও জানতে হোয়াটসঅ্যাপ", "Ask more on WhatsApp")}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={generalInquiry()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bn flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-wa text-lg font-bold text-wa-foreground"
          >
            <WhatsAppIcon className="h-6 w-6" />
            {t("অন্য প্রশ্ন আছে", "I have another question")}
          </a>
          <a
            href={telLink}
            className="font-bn flex min-h-[64px] items-center justify-center rounded-full bg-foreground text-lg font-bold text-background"
          >
            {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
          </a>
        </div>
      </Container>
    </Section>
  );
}
