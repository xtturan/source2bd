import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { siteConfig } from "@/config/site";
import { telLink, trackingInquiry } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "ট্র্যাক · আপনার মাল কোথায় | Source2BD" },
      {
        name: "description",
        content:
          "ট্র্যাকিং নম্বর দিন, আমরা বলে দেব আপনার মাল এখন কোথায়। নম্বর না থাকলেও হোয়াটসঅ্যাপে জানালে আমরা খুঁজে দেব।",
      },
      { property: "og:title", content: "ট্র্যাক · Source2BD" },
      { property: "og:description", content: "আপনার মাল এখন কোথায়, জেনে নিন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.lovable.app/track" }],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { t } = useLang();
  const [code, setCode] = useState("");

  return (
    <Section className="py-8">
      <Container className="max-w-xl">
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold">
          {t("আপনার মাল কোথায়", "Where is your shipment")}
        </h1>

        <label htmlFor="code" className="font-bn mt-6 block text-[18px] font-bold">
          {t("ট্র্যাকিং নম্বর", "Tracking number")}
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="S2B-2026-00123"
          className="tnum mt-2 h-16 w-full rounded-[16px] border border-input bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />

        <a
          href={trackingInquiry(code || t("নম্বর জানি না", "I do not know my number"))}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bn mt-4 flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-wa text-xl font-bold text-wa-foreground"
        >
          <WhatsAppIcon className="h-6 w-6" />
          {t("খুঁজুন", "Find it")}
        </a>

        <p className="font-bn mt-3 text-[16px] font-semibold text-muted-foreground">
          {t(
            "নম্বর না পেলে চিন্তা নেই। কবে টাকা দিয়েছেন বা দোকানের নাম বললেই আমরা খুঁজে বলব।",
            "No number is fine. Tell us the date you paid or the seller name and we will find it.",
          )}
        </p>

        <a
          href={telLink}
          className="font-bn mt-4 flex min-h-[60px] items-center justify-center rounded-full bg-foreground text-lg font-bold text-background"
        >
          {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
        </a>
      </Container>
    </Section>
  );
}
