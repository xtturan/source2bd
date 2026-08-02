import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { bdCities, siteConfig } from "@/config/site";
import { quoteRequest, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "দাম জানুন · কয়েকটা তথ্য দিলেই হবে | Source2BD" },
      {
        name: "description",
        content:
          "নাম, মোবাইল আর শহর দিন। কীভাবে পণ্য দেখাবেন বেছে নিন। হোয়াটসঅ্যাপে পাঠালেই আমরা বাংলাদেশে পৌঁছানোর দাম বলে দেব।",
      },
      { property: "og:title", content: "দাম জানুন · Source2BD" },
      { property: "og:description", content: "কয়েকটা তথ্য দিন, হোয়াটসঅ্যাপে দাম পেয়ে যান।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotePage,
});

const field =
  "mt-2 h-14 w-full rounded-[14px] border border-input bg-background/70 px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent";

function QuotePage() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [how, setHow] = useState<"photo" | "link" | "text">("photo");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const howLabel = {
    photo: t("ছবি দেব", "I will send a photo"),
    link: t("লিংক দেব", "I will send a link"),
    text: t("লিখে বলব", "I will describe it"),
  }[how];

  function send() {
    if (!phone.trim() || !city.trim()) {
      setError(t("মোবাইল নম্বর আর শহর দিন", "Please give your mobile number and city"));
      return;
    }
    setError(null);
    window.open(
      quoteRequest({ name, phone, city, how: howLabel, qty, notes }),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <Section className="py-8">
      <Container className="max-w-2xl">
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold leading-tight">
          {t("দাম জানুন", "Get a price")}
        </h1>
        <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
          {t("কয়েকটা তথ্য দিন, আমরা হোয়াটসঅ্যাপে দাম বলে দেব।", "Give a few details and we reply on WhatsApp.")}
        </p>

        <form className="mt-6 grid gap-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="name" className="font-bn text-[16px] font-bold">
              {t("আপনার নাম", "Your name")}
            </label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          </div>

          <div>
            <label htmlFor="phone" className="font-bn text-[16px] font-bold">
              {t("মোবাইল নম্বর", "Mobile number")}
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              className={cn(field, "tnum")}
            />
          </div>

          <div>
            <label htmlFor="city" className="font-bn text-[16px] font-bold">
              {t("কোন শহর", "Which city")}
            </label>
            <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className={field}>
              <option value="">{t("বেছে নিন", "Choose")}</option>
              {bdCities.map((c) => (
                <option key={c} value={c} className="bg-background">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="font-bn text-[16px] font-bold">{t("কীভাবে পণ্য দেখাবেন", "How will you show the item")}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(
                [
                  ["photo", t("ছবি", "Photo")],
                  ["link", t("লিংক", "Link")],
                  ["text", t("লিখে বলব", "Describe")],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setHow(key)}
                  aria-pressed={how === key}
                  className={cn(
                    "font-bn min-h-[56px] rounded-[14px] text-[16px] font-bold",
                    how === key ? "bg-foreground text-background" : "border border-border text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="qty" className="font-bn text-[16px] font-bold">
              {t("কয়টা লাগবে", "How many")}
            </label>
            <input
              id="qty"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputMode="numeric"
              className={cn(field, "tnum")}
            />
          </div>

          <div>
            <label htmlFor="notes" className="font-bn text-[16px] font-bold">
              {t("আরও কিছু বলার আছে", "Anything else")}
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 w-full rounded-[14px] border border-input bg-background/70 p-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          {error ? <p className="font-bn text-[16px] font-bold text-accent">{error}</p> : null}

          <button
            type="button"
            onClick={send}
            className="font-bn flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-wa text-xl font-bold text-wa-foreground"
          >
            <WhatsAppIcon className="h-6 w-6" />
            {t("হোয়াটসঅ্যাপে পাঠান", "Send on WhatsApp")}
          </button>

          <a
            href={telLink}
            className="font-bn flex min-h-[60px] items-center justify-center rounded-full bg-foreground text-lg font-bold text-background"
          >
            {t("অথবা ফোন করুন", "Or call")} {siteConfig.phoneDisplay}
          </a>
        </form>
      </Container>
    </Section>
  );
}
