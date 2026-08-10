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
      { title: "অর্ডার স্ট্যাটাস · আপনার মাল কোথায় | Source2BD" },
      {
        name: "description",
        content:
          "আপনার মালের অবস্থা হোয়াটসঅ্যাপে জেনে নিন। ফোন নম্বর আর অর্ডারের তারিখ দিন, আমাদের ডেস্ক দেখে জানিয়ে দেবে।",
      },
      { property: "og:title", content: "অর্ডার স্ট্যাটাস · Source2BD" },
      { property: "og:description", content: "হোয়াটসঅ্যাপে আপনার মালের অবস্থা জেনে নিন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/track" }],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { t } = useLang();
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState("");
  const [item, setItem] = useState("");
  const [city, setCity] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const message = [
    t("অর্ডারের অবস্থা জানতে চাই।", "I want a status update on my order."),
    `${t("ফোন", "Phone")}: ${phone.trim()}`,
    when.trim() ? `${t("অর্ডারের সময়", "Ordered around")}: ${when.trim()}` : "",
    item.trim() ? `${t("পণ্য বা দোকান", "Item or shop")}: ${item.trim()}` : "",
    city.trim() ? `${t("শহর", "City")}: ${city.trim()}` : "",
    code.trim() ? `${t("আমাদের দেওয়া ট্র্যাক নম্বর", "Reference we gave you")}: ${code.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Section className="py-8">
      <Container className="max-w-xl">
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold">
          {t("অর্ডার স্ট্যাটাস", "Order status")}
        </h1>
        <p className="font-bn mt-3 text-[17px] font-semibold leading-relaxed text-muted-foreground">
          {t(
            "আমাদের কোনো স্বয়ংক্রিয় কুরিয়ার ট্র্যাকিং নেই। আপনার মাল এখন কোথায়, সেটা আমাদের ডেস্ক নিজে দেখে হোয়াটসঅ্যাপে জানিয়ে দেয়। নিচের তথ্যগুলো দিলে সবচেয়ে দ্রুত উত্তর পাবেন।",
            "We do not run automated courier tracking. Our desk checks your shipment by hand and replies on WhatsApp. Fill this in and you get the fastest answer.",
          )}
        </p>

        <Field
          id="phone"
          label={t("আপনার ফোন নম্বর", "Your phone number")}
          hint={t("যে নম্বরে অর্ডার করেছিলেন", "The number you ordered with")}
          value={phone}
          onChange={(v) => {
            setPhone(v);
            setError(false);
          }}
          placeholder="01XXXXXXXXX"
          inputMode="tel"
          required
        />
        <Field
          id="when"
          label={t("কবে অর্ডার করেছিলেন", "When did you order")}
          hint={t("তারিখ বা আনুমানিক সপ্তাহ", "A date or roughly which week")}
          value={when}
          onChange={setWhen}
          placeholder={t("যেমন: গত সপ্তাহে", "e.g. last week")}
        />
        <Field
          id="item"
          label={t("পণ্য বা দোকানের নাম", "Item or shop name")}
          hint={t("না জানলে খালি রাখুন", "Leave empty if unsure")}
          value={item}
          onChange={setItem}
          placeholder={t("যেমন: লেড লাইট", "e.g. led light")}
        />
        <Field
          id="city"
          label={t("শহর", "City")}
          hint={t("ডেলিভারির শহর", "Delivery city")}
          value={city}
          onChange={setCity}
          placeholder={t("যেমন: ঢাকা", "e.g. Dhaka")}
        />
        <Field
          id="code"
          label={t("যদি আমাদের দেওয়া ট্র্যাক নম্বর থাকে", "If we gave you a reference number")}
          hint={t("না থাকলে দরকার নেই", "Not needed if you do not have one")}
          value={code}
          onChange={setCode}
          placeholder="S2B-2026-00123"
        />

        {error ? (
          <p role="alert" className="font-bn mt-3 text-[15px] font-bold text-signal">
            {t("আগে আপনার ফোন নম্বর লিখুন।", "Please write your phone number first.")}
          </p>
        ) : null}

        <a
          href={trackingInquiry(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!phone.trim()) {
              e.preventDefault();
              setError(true);
            }
          }}
          className="font-bn mt-5 flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-wa text-xl font-bold text-wa-foreground"
        >
          <WhatsAppIcon className="h-6 w-6" />
          {t("হোয়াটসঅ্যাপে অবস্থা জানুন", "Get the status on WhatsApp")}
        </a>

        <p className="font-bn mt-3 text-[16px] font-semibold text-muted-foreground">
          {t(
            "অফিস সময়ে সাধারণত একই দিনে উত্তর দেই। ছুটির দিনে একটু দেরি হতে পারে।",
            "We normally reply the same working day. It can take longer on holidays.",
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

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  inputMode,
  required,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode?: "tel" | "text";
  required?: boolean;
}) {
  return (
    <div className="mt-5">
      <label htmlFor={id} className="font-bn block text-[17px] font-bold">
        {label}
        {required ? <span className="text-signal"> *</span> : null}
      </label>
      <p className="font-bn mt-0.5 text-[13px] font-semibold text-muted-foreground">{hint}</p>
      <input
        id={id}
        value={value}
        inputMode={inputMode ?? "text"}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="font-bn mt-2 h-14 w-full rounded-[16px] border border-input bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
    </div>
  );
}
