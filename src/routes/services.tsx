import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { services, simpleServices, siteConfig } from "@/config/site";
import { serviceQuote, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "সার্ভিস · হ্যান্ড ক্যারি, এয়ার, সি, কুরিয়ার | Source2BD" },
      {
        name: "description",
        content:
          "হ্যান্ড ক্যারি, এয়ার, জাহাজ, কুরিয়ার, গুদাম আর এজেন্ট সার্ভিস। কার জন্য কোনটা আর কতদিন লাগে, সহজ বাংলায়।",
      },
      { property: "og:title", content: "সার্ভিস · Source2BD" },
      { property: "og:description", content: "কোন সার্ভিস আপনার জন্য আর কতদিন লাগে, সহজ বাংলায়।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.lovable.app/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Section className="py-8">
      <Container>
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold">
          {t("সার্ভিস", "Services")}
        </h1>
        <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
          {t("যেটা আপনার দরকার সেটায় চাপ দিন।", "Tap the one you need.")}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {simpleServices.map((s) => {
            const detail = services.find((d) => d.key === s.key);
            const isOpen = open === s.key;
            return (
              <div key={s.key} id={s.key} className="panel matte scroll-mt-24 rounded-[18px] p-5">
                <span className="grid h-14 w-14 place-items-center rounded-[16px] bg-accent/12 text-accent" aria-hidden>
                  <BoxGlyph />
                </span>
                <h2 className="font-bn mt-3 text-[20px] font-extrabold">{t(s.bn, s.en)}</h2>
                <p className="font-bn mt-1 text-[15px] font-semibold text-muted-foreground">
                  {t(s.forBn, s.forEn)}
                </p>
                <p className="font-bn mt-1 text-[15px] font-bold text-accent">{t(s.timeBn, s.timeEn)}</p>

                <a
                  href={serviceQuote({ mode: lang === "bn" ? s.bn : s.en })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bn mt-4 flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-wa text-[17px] font-bold text-wa-foreground"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t("বাংলাদেশ পর্যন্ত পুরো দাম জানুন", "Get the full Bangladesh price")}
                </a>

                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : s.key)}
                  aria-expanded={isOpen}
                  className="font-bn mt-3 text-[15px] font-bold text-muted-foreground underline"
                >
                  {isOpen ? t("বন্ধ করুন", "Close") : t("আরও জানুন", "Read more")}
                </button>

                {isOpen ? (
                  <div className={cn("mt-3 text-[15px] leading-relaxed text-muted-foreground", lang === "bn" && "font-bn")}>
                    {lang === "bn" ? (
                      <p>
                        {t(
                          "আপনার পণ্যের ছবি বা লিংক দিন, কয়টা লাগবে আর কোন শহরে যাবে বলুন। আমরা পুরো খরচ হিসাব করে জানাব।",
                          "",
                        )}
                      </p>
                    ) : (
                      <p>{detail?.short}</p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="panel matte mt-6 rounded-[18px] p-5">
          <p className="font-bn text-[15px] font-semibold text-muted-foreground">
            {t(siteConfig.policyBn, siteConfig.policy)}
          </p>
          <a
            href={telLink}
            className="font-bn mt-4 flex min-h-[60px] items-center justify-center rounded-full bg-foreground text-lg font-bold text-background"
          >
            {t("বুঝতে সমস্যা হলে ফোন করুন", "Call us if this is confusing")}
          </a>
        </div>
      </Container>
    </Section>
  );
}

function BoxGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3.5 7.8 12 3.5l8.5 4.3v8.4L12 20.5l-8.5-4.3z" />
      <path d="M3.5 7.8 12 12.2l8.5-4.4M12 12.2v8.3" />
    </svg>
  );
}
