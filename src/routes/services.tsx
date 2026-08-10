import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { b2bServices, services, simpleServices, siteConfig } from "@/config/site";
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
    links: [{ rel: "canonical", href: "https://source2bd.com/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState<string | null>(null);

  /** Three plain bullets per lane. Facts only: what it covers, what it costs you in time, what we need. */
  const bullets: Record<string, { bn: string[]; en: string[] }> = {
    "hand-carry": {
      bn: ["ছোট ও হালকা পণ্য, হাতে করে আনা", "সবচেয়ে দ্রুত, তবে কেজি প্রতি খরচ বেশি", "ছবি বা লিংক আর কয়টা লাগবে জানালেই দাম"],
      en: ["Small, light items carried by hand", "Fastest lane, highest cost per kg", "Send a photo or link plus quantity for a price"],
    },
    "air-freight": {
      bn: ["মাঝারি ওজনের মাল দ্রুত আনার জন্য", "ওজন ও আয়তন — যেটা বেশি সেটার হিসাবে দাম", "গুদামে মাল একত্র করে এক চালানে পাঠানো যায়"],
      en: ["Medium weight loads that cannot wait", "Charged on weight or volume, whichever is higher", "We can consolidate several sellers into one shipment"],
    },
    "sea-freight": {
      bn: ["ভারী বা অনেক বেশি পরিমাণ মালের জন্য", "কেজি প্রতি সবচেয়ে কম খরচ, সময় বেশি লাগে", "সম্পূর্ণ কনটেইনার বা শেয়ার্ড দুটোই হয়"],
      en: ["Heavy or high volume orders", "Cheapest per kg, slowest to arrive", "Full container or shared space, both work"],
    },
    courier: {
      bn: ["এক দুই কার্টন বা ট্রায়াল অর্ডার", "ডোর টু ডোর, ট্র্যাকিং নম্বর দিয়ে দেই", "নমুনা আনার সবচেয়ে সহজ উপায়"],
      en: ["One or two cartons, or a trial order", "Door to door with a tracking number", "The simplest way to bring in samples"],
    },
    warehouse: {
      bn: ["কয়েক দোকানের মাল আমাদের গুদামে জমা হয়", "পাঠানোর আগে ছবি দেখে নিতে পারবেন", "একসাথে পাঠালে ফ্রেইট খরচ কমে"],
      en: ["Goods from several sellers land in our warehouse", "You see photos before anything ships", "Combining orders cuts the freight bill"],
    },
  };
  const fallbackBullets = {
    bn: ["ছবি, লিংক বা নাম পাঠান", "কয়টা লাগবে আর কোন শহরে যাবে বলুন", "পুরো খরচ হিসাব করে জানাব"],
    en: ["Send a photo, link or name", "Tell us quantity and delivery city", "We come back with the full landed cost"],
  };

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
                <p className="font-bn mt-1 text-[15px] font-bold text-accent">{t(s.timeBn, s.timeEn)}</p>
                <ul className="mt-3 space-y-2">
                  {(lang === "bn"
                    ? (bullets[s.key]?.bn ?? fallbackBullets.bn)
                    : (bullets[s.key]?.en ?? fallbackBullets.en)
                  ).map((p) => (
                    <li key={p} className="font-bn flex gap-2 text-[15px] font-semibold text-muted-foreground">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="font-bn mt-3 text-[15px] font-semibold">
                  <span className="text-muted-foreground">{t("কার জন্য:", "Who it is for:")} </span>
                  {t(s.forBn, s.forEn)}
                </p>

                <a
                  href={serviceQuote({ mode: lang === "bn" ? s.bn : s.en })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bn mt-4 flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-wa px-4 text-center text-[17px] font-bold text-wa-foreground"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t("বাংলাদেশ পর্যন্ত পুরো দাম জানুন", "Get the full Bangladesh price")}
                </a>
                {detail?.short && lang === "en" ? (
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : s.key)}
                    aria-expanded={isOpen}
                    className="font-bn mt-3 text-[15px] font-bold text-muted-foreground underline"
                  >
                    {isOpen ? "Close" : "Read more"}
                  </button>
                ) : null}

                {isOpen && lang === "en" ? (
                  <div className={cn("mt-3 text-[15px] leading-relaxed text-muted-foreground")}>
                    <p>{detail?.short}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* B2B lane: the full TWT International suite for shop owners and importers. */}
        <h2 className="font-bn mt-12 text-[clamp(1.3rem,5vw,1.9rem)] font-extrabold">
          {t("ইমপোর্টার ও দোকানদারদের জন্য পুরো সার্ভিস", "The full suite for importers and shop owners")}
        </h2>
        <p className="font-bn mt-2 text-[15px] font-semibold text-muted-foreground">
          {t(
            "TWT International-এর সোর্সিং, পেমেন্ট, ফ্রেইট, সি অ্যান্ড এফ ও ডেলিভারি — এক ডেস্ক থেকে।",
            "Sourcing, payment, freight, C&F and delivery from one TWT International desk.",
          )}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {b2bServices.map((s) => (
            <div key={s.key} id={s.key} className="panel matte scroll-mt-24 rounded-[18px] p-5">
              <h3 className="font-bn text-[18px] font-extrabold">{t(s.bn, s.en)}</h3>
              <p className="font-bn mt-1 text-[14px] font-bold text-accent">{t(s.timeBn, s.timeEn)}</p>
              <ul className="mt-3 space-y-2">
                {(lang === "bn" ? s.pointsBn : s.pointsEn).map((p) => (
                  <li key={p} className="font-bn flex gap-2 text-[15px] font-semibold text-muted-foreground">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <a
                href="/quote"
                className="font-bn mt-4 flex min-h-[52px] items-center justify-center rounded-full bg-primary px-4 text-center text-[16px] font-bold text-primary-foreground"
              >
                {t("দাম চান", "Get a quote")}
              </a>
            </div>
          ))}
        </div>

        <div className="panel matte mt-6 rounded-[18px] p-5">
          <p className="font-bn text-[16px] font-bold">
            {t("চীনে পেমেন্ট কীভাবে হয়", "How payment to China works")}
          </p>
          <p className="font-bn mt-2 text-[15px] font-semibold text-muted-foreground">
            {t(
              "আগে আমরা পুরো দাম হিসাব করে দেই। আপনি দাম মেনে নেওয়ার পরেই আমরা চীনের সাপ্লায়ারকে আপনার হয়ে পেমেন্ট করি। আমরা কোনো ব্যাংক বা মানি এক্সচেঞ্জ সার্ভিস নই — শুধু আপনার অর্ডারের বিল পরিশোধ করি।",
              "We quote first. Once you approve the quote, we pay the Chinese supplier on your behalf for that order. We are not a bank or a money exchange service, we only settle the bill for your order.",
            )}
          </p>
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
