import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "কীভাবে কাজ করে · ৫ ধাপ | Source2BD" },
      {
        name: "description",
        content:
          "ছবি বা লিংক পাঠানো থেকে বাসায় ডেলিভারি পর্যন্ত পাঁচটি ধাপ, ছবি আর সহজ বাংলায় ব্যাখ্যা করা।",
      },
      { property: "og:title", content: "কীভাবে কাজ করে · Source2BD" },
      { property: "og:description", content: "ছবি পাঠানো থেকে বাসায় ডেলিভারি, পাঁচ ধাপে।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { bn: "ছবি বা লিংক পাঠান", en: "Send a photo or a link", icon: "camera" },
  { bn: "আমরা পণ্যটা দেখে দাম হিসাব করি", en: "We check the item and work out the cost", icon: "search" },
  { bn: "পুরো দাম বলি, আপনি রাজি হলে টাকা", en: "We tell you the full price, you pay only if you agree", icon: "tag" },
  { bn: "আমরা কিনে এক বাক্সে পাঠাই", en: "We buy it and ship it in one box", icon: "box" },
  { bn: "বাসায় বা অফিসে ডেলিভারি", en: "Delivered to your home or our office", icon: "truck" },
] as const;

const paths: Record<string, string> = {
  camera: "M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z",
  search: "M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM20 20l-4.2-4.2",
  tag: "M3.5 12.5 12 4h7.5v7.5L11 20z",
  box: "M3.5 7.8 12 3.5l8.5 4.3v8.4L12 20.5l-8.5-4.3z",
  truck: "M2.5 7h11v9h-11zM13.5 10.5H17l3.5 3v2.5h-7z",
};

function HowItWorks() {
  const { t } = useLang();
  return (
    <Section className="py-8">
      <Container>
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold">
          {t("কীভাবে কাজ করে", "How it works")}
        </h1>

        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.en} className="panel matte flex items-center gap-4 rounded-[18px] p-5">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] bg-accent/12 text-accent" aria-hidden>
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={paths[s.icon]!} />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="font-bn block text-[14px] font-bold text-accent">
                  {t(["১", "২", "৩", "৪", "৫"][i]!, `Step ${i + 1}`)}
                </span>
                <span className="font-bn mt-1 block text-[17px] font-bold leading-snug">{t(s.bn, s.en)}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="panel matte mt-6 rounded-[18px] p-5">
          <p className="font-bn text-[16px] font-semibold text-muted-foreground">
            {t(siteConfig.policyBn, siteConfig.policy)}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a
              href={generalInquiry()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bn flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-wa text-lg font-bold text-wa-foreground"
            >
              <WhatsAppIcon className="h-6 w-6" />
              {t("শুরু করুন", "Start now")}
            </a>
            <a
              href={telLink}
              className="font-bn flex min-h-[60px] items-center justify-center rounded-full bg-foreground text-lg font-bold text-background"
            >
              {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
