import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import {
  SearchGlyph,
  LinkGlyph,
  CameraGlyph,
  TagGlyph,
  TruckGlyph,
  CheckGlyph,
  BoxGlyph,
  PhoneGlyph,
} from "@/components/s2b/glyphs";
import { VoiceButton } from "@/components/s2b/voice-button";
import { QuotaBar } from "@/components/s2b/quota-bar";
import { ProductCard } from "@/components/s2b/product-card";
import { PriceHonesty } from "@/components/s2b/price-honesty";
import { catalogueProducts } from "@/lib/products/queries.functions";
import type { CatalogueItem } from "@/lib/products/search-cache.server";
import { categories, categoryOfProduct, type CategoryKey } from "@/lib/products/categories";
import { isProhibitedTitle } from "@/lib/products/title";
import { quickCategories, siteConfig } from "@/config/site";
import { generalInquiry, linkInquiry, photoInquiry, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import deskQuote from "@/assets/desk-quote.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Source2BD, ছবি বা লিংক পাঠান, বাসায় পৌঁছে দেব" },
      {
        name: "description",
        content: `চীন বা যেকোনো দেশ থেকে পণ্য আনুন। ছবি বা লিংক পাঠান, আমরা বাংলাদেশে পৌঁছানোর পুরো দাম বলে দেব। ফোন ${siteConfig.phoneDisplay}, চকবাজার ঢাকা।`,
      },
      { property: "og:title", content: "Source2BD, ছবি বা লিংক পাঠান, বাসায় পৌঁছে দেব" },
      {
        property: "og:description",
        content: "ছবি বা লিংক পাঠান, দাম বলে দেব, বাসায় পৌঁছে দেব। কোনো ইংরেজি জানার দরকার নেই।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/" }],
  }),
  component: HomePage,
  loader: async (): Promise<CatalogueItem[]> => {
    try {
      return await catalogueProducts();
    } catch {
      return [];
    }
  },
});

function HomePage() {
  const items = Route.useLoaderData() as CatalogueItem[];
  return (
    <>
      <FirstScreen />
      <ThreeSteps />
      <Categories />
      <CategoryRails items={items} />
      <TrustRow />
      <PriceHonesty />
      <HowToSend />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* First viewport: one headline, one subline, three giant actions.     */
/* ------------------------------------------------------------------ */

function FirstScreen() {
  const { t } = useLang();
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState(false);

  function sendLink() {
    const value = url.trim();
    if (!value) {
      setUrlError(true);
      return;
    }
    setUrlError(false);
    window.open(linkInquiry(value), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="relative overflow-hidden bg-primary py-12 text-center text-primary-foreground sm:py-20 lg:py-24">
      <Container>
      <div className="mx-auto max-w-3xl">
        <p className="font-bn mb-4 text-[13px] font-bold text-primary-foreground/70">
          {t(siteConfig.parentLineBn, siteConfig.parentLineEn)}
        </p>
        <h1 className="font-bn text-[clamp(2rem,6vw,3.8rem)] font-extrabold leading-[1.14]">
          {t("চীন থেকে পণ্য খুঁজুন", "Find products from China")}
          <span className="mt-1 block text-accent">
            {t("সহজে, বাংলায়", "simply, in your language")}
          </span>
        </h1>
        <p className="font-bn mx-auto mt-4 max-w-2xl text-[clamp(1rem,2vw,1.2rem)] font-semibold text-primary-foreground/72">
          {t("নাম লিখুন, ছবি বা লিংক দিন। আমরা দাম থেকে বাংলাদেশে ডেলিভারি পর্যন্ত সব দেখব।", "Search by name, photo, or link. We handle everything through delivery in Bangladesh.")}
        </p>
      </div>

      <HeroSearch />

      {/* Link and photo remain reachable, but quiet: text row, not competing
          cards. The search box above is the one obvious action. */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[15px] font-bold">
        <button
          type="button"
          onClick={() => setLinkOpen((v) => !v)}
          aria-expanded={linkOpen}
          className="font-bn flex items-center gap-2 text-primary-foreground/75 underline decoration-primary-foreground/30 underline-offset-4"
        >
          <LinkGlyph className="h-4.5 w-4.5" />
          {t("লিংক দিয়ে খুঁজবেন?", "Have a link instead?")}
        </button>
        <Link
          to="/sourcing"
          search={{ mode: "photo" }}
          className="font-bn flex items-center gap-2 text-primary-foreground/75 underline decoration-primary-foreground/30 underline-offset-4"
        >
          <CameraGlyph className="h-4.5 w-4.5" />
          {t("ছবি দিয়ে খুঁজবেন?", "Search with a photo?")}
        </Link>
      </div>

      <QuotaBar className="mx-auto mt-5 max-w-3xl text-left" />

      {linkOpen ? (
        <div className="mx-auto mt-4 max-w-3xl rounded-[14px] border border-primary-foreground/20 bg-primary-foreground/10 p-4 text-left backdrop-blur-sm">
          <label htmlFor="home-link" className="font-bn block text-base font-bold">
            {t("পণ্যের লিংক পেস্ট করুন", "Paste the product link")}
          </label>
          <input
            id="home-link"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError(false);
            }}
            inputMode="url"
            placeholder="https://detail.1688.com/..."
            className="mt-2 h-14 w-full rounded-[10px] border border-primary-foreground/20 bg-paper px-4 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {urlError ? (
            <p className="font-bn mt-2 text-sm font-bold text-accent">
              {t("লিংকটি বসান, তারপর চাপুন", "Paste a link first, then press")}
            </p>
          ) : null}
          <button
            type="button"
            onClick={sendLink}
            className="mt-3 flex min-h-[56px] w-full flex-col items-center justify-center rounded-[10px] bg-wa text-wa-foreground"
          >
            <span className="font-bn flex items-center gap-2 text-[17px] font-bold leading-tight">
              <WhatsAppIcon className="h-5 w-5" />
              {t("বাংলাদেশ পর্যন্ত পুরো দাম জানুন", "Get the full Bangladesh price")}
            </span>
            <span className="font-bn text-[11px] font-semibold opacity-90">
              {t("শিপিং চার্জসহ · WhatsApp-এ", "Shipping included · on WhatsApp")}
            </span>
          </button>
        </div>
      ) : null}

      <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3">
        <a
          href={generalInquiry()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bn flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] border border-primary-foreground/20 bg-primary-foreground/10 text-[15px] font-bold"
        >
          <WhatsAppIcon className="h-5 w-5 text-wa" />
          {t("WhatsApp-এ পাঠান", "Message us")}
        </a>
        <a
          href={telLink}
          className="font-bn flex min-h-[48px] items-center justify-center rounded-[10px] border border-primary-foreground/20 bg-primary-foreground/10 text-[15px] font-bold"
        >
          {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
        </a>
      </div>
      </Container>
    </section>
  );
}

const POPULAR = [
  { q: "led light", bn: "💡 লেড লাইট" },
  { q: "phone cover", bn: "📱 ফোন কভার" },
  { q: "shoes", bn: "👟 জুতা" },
  { q: "watch", bn: "⌚ ঘড়ি" },
  { q: "bag", bn: "👜 ব্যাগ" },
  { q: "kitchen items", bn: "🍳 রান্নাঘর" },
];

/** The one thing a first-time visitor should see: a search box, on screen one. */
function HeroSearch() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <form
      className="mx-auto mt-7 grid max-w-4xl gap-2 rounded-[16px] border border-primary-foreground/20 bg-primary-foreground/10 p-2 shadow-[var(--shadow-3)] backdrop-blur-sm sm:mt-9 sm:grid-cols-[minmax(0,1fr)_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        void navigate({ to: "/sourcing", search: q ? { q, mode: "search" } : { mode: "search" } });
      }}
    >
      <label htmlFor="hero-q" className="sr-only">
        {t("পণ্যের নাম লিখুন", "Type a product name")}
      </label>
      <div className="relative">
        <input
          id="hero-q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          enterKeyHint="search"
          placeholder={t(
            "কী লাগবে? যেমন: লেড লাইট, ফোন কভার",
            "What do you need? e.g. led light, phone cover",
          )}
          className="font-bn h-16 w-full min-w-0 rounded-[11px] border border-primary-foreground/15 bg-paper pr-[68px] pl-5 text-[17px] font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent sm:h-[68px] sm:text-[18px]"
        />
        <div className="absolute top-1/2 right-3.5 -translate-y-1/2">
          <VoiceButton
            inline
            onFinal={(text) => {
              setValue(text);
              void navigate({ to: "/sourcing", search: { q: text, mode: "search" } });
            }}
            onInterim={(text) => setValue(text)}
          />
        </div>
      </div>
      <button
        type="submit"
        className="font-bn flex h-16 items-center justify-center gap-2 rounded-[11px] bg-accent px-8 text-[18px] font-black text-accent-foreground shadow-[var(--shadow-2)] transition-transform duration-150 hover:bg-clay-600 active:scale-[0.98] sm:h-[68px]"
      >
        <SearchGlyph className="h-6 w-6" />
        {t("খুঁজুন", "Search")}
      </button>

      {/* Tapping beats typing for most of our visitors. */}
      <div className="flex flex-wrap justify-center gap-2 pt-1 sm:col-span-2">
        {POPULAR.map((chip) => (
          <Link
            key={chip.q}
            to="/sourcing"
            search={{ q: chip.q, mode: "search" }}
            className="font-bn rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-[14px] font-semibold text-primary-foreground/80 hover:bg-primary-foreground/15"
          >
            {t(chip.bn, chip.q)}
          </Link>
        ))}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

function ThreeSteps() {
  const { t } = useLang();
  const steps = [
    { n: "১", bn: "নাম, ছবি বা লিংক দিন", en: "Send a photo or link", icon: <CameraGlyph /> },
    { n: "২", bn: "শিপিংসহ পুরো দাম বলি", en: "We tell you the price", icon: <TagGlyph /> },
    { n: "৩", bn: "বাসায় ডেলিভারি", en: "Delivered to your home", icon: <TruckGlyph /> },
  ];
  return (
    <Section className="border-b border-border bg-secondary py-12 sm:py-16">
      <Container>
        <h2 className="font-bn text-center text-[clamp(1.6rem,5vw,2.5rem)] font-extrabold text-primary">
          {t("৩ ধাপে কাজ", "Three simple steps")}
        </h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {steps.map((s) => (
            <li
              key={s.en}
              className="panel flex items-center gap-4 rounded-[14px] p-5 sm:min-h-[210px] sm:flex-col sm:items-center sm:justify-center sm:text-center"
            >
              <span
                className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent/12 text-accent"
                aria-hidden
              >
                {s.icon}
              </span>
              <span>
                <span className="font-bn block text-sm font-bold text-accent">
                  {t(s.n, `Step ${s.n}`)}
                </span>
                <span className="font-bn mt-1 block text-[17px] font-bold leading-snug">
                  {t(s.bn, s.en)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

function TrustRow() {
  const { t } = useLang();
  const items = [
    { bn: "চকবাজার, ঢাকায় অফিস", en: "Office in Chawkbazar, Dhaka" },
    { bn: "সত্যিকারের ফোন নম্বর", en: "A real phone number" },
    { bn: "আজকেই উত্তর পাবেন", en: "We answer the same day" },
    { bn: "শুধু বৈধ পণ্য আনি", en: "Legal goods only" },
  ];
  return (
    <Section className="border-y border-border bg-secondary py-10">
      <Container>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((i) => (
            <li key={i.en} className="flex items-start gap-2.5 rounded-[12px] border border-border bg-paper p-4">
              <CheckGlyph />
              <span className="font-bn text-[15px] font-bold leading-snug">{t(i.bn, i.en)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function Categories() {
  const { t } = useLang();
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <h2 className="font-bn text-center text-[clamp(1.6rem,5vw,2.5rem)] font-extrabold text-primary">
          {t("কী আনতে চান?", "What do you want to bring in?")}
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {quickCategories.map((c) => (
            <Link
              key={c.q}
              to="/sourcing"
              search={{ q: c.q } as never}
              className="panel flex min-h-[132px] flex-col items-center justify-center gap-3 rounded-[14px] p-4 text-center transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[var(--shadow-3)]"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-full bg-accent/12 text-accent"
                aria-hidden
              >
                <BoxGlyph />
              </span>
              <span className="font-bn text-[16px] font-bold">{t(c.bn, c.en)}</span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/**
 * One rail per category that actually has stock, so the home page reads as a
 * multi-category shop rather than whatever keyword was searched most.
 * Empty categories are hidden and no single category can take over.
 */
function CategoryRails({ items }: { items: CatalogueItem[] }) {
  const { t } = useLang();

  const rails = useMemo(() => {
    const buckets = new Map<CategoryKey, CatalogueItem[]>();
    for (const p of items) {
      if (!p.title || isProhibitedTitle(p.title)) continue;
      const key = categoryOfProduct(p, p.query);
      if (key === "other") continue;
      const list = buckets.get(key) ?? [];
      if (list.length < 8) list.push(p);
      buckets.set(key, list);
    }
    return categories
      .filter((c) => (buckets.get(c.key)?.length ?? 0) >= 4)
      .slice(0, 6)
      .map((c) => ({ category: c, products: buckets.get(c.key)!.slice(0, 8) }));
  }, [items]);

  if (!rails.length) return null;

  return (
    <Section className="border-t border-border bg-secondary py-12 sm:py-16">
      <Container>
        <h2 className="font-bn text-[clamp(1.6rem,5vw,2.5rem)] font-extrabold text-primary">
          {t("ক্যাটাগরি ধরে দেখুন", "Browse by category")}
        </h2>
        <p className="font-bn mt-2 max-w-[46ch] text-[15px] font-semibold text-muted-foreground">
          {t(
            "এগুলো চীনের দোকানের দাম। বাংলাদেশে পৌঁছানোর পুরো দাম আলাদা, আমরা বলে দেব।",
            "These are seller prices in China. The full Bangladesh door price is separate and we quote it for you.",
          )}
        </p>

        <div className="mt-5 space-y-10">
          {rails.map(({ category, products }) => (
            <div key={category.key}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bn text-[18px] font-extrabold">
                  <span aria-hidden className="mr-1.5">
                    {category.emoji}
                  </span>
                  {t(category.bn, category.en)}
                </h3>
                <Link
                  to="/catalog"
                  search={{ cat: category.key }}
                  className="font-bn min-h-[44px] shrink-0 content-center text-[15px] font-bold text-accent"
                >
                  {t("আরও দেখুন", "See more")}
                </Link>
              </div>
               <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {products.map((p) => (
                  <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/catalog"
          search={{}}
          className="font-bn mt-8 flex min-h-[56px] items-center justify-center gap-3 rounded-[10px] bg-primary px-5 text-[16px] font-bold text-primary-foreground"
        >
          <span>{t("সব ক্যাটাগরি ও পণ্য দেখুন", "Browse every category and product")}</span>
          <span aria-hidden className="text-accent">
            →
          </span>
        </Link>
      </Container>
    </Section>
  );
}

function HowToSend() {
  const { t } = useLang();
  return (
    <Section className="py-12 sm:py-16">
      <Container>
        <div className="panel overflow-hidden rounded-[16px]">
          <img
            src={deskQuote}
            alt={t("পণ্যের ছবি ও কার্টন", "A product listing beside packed cartons")}
            width={1408}
            height={1008}
            loading="lazy"
            className="h-[clamp(160px,34vw,300px)] w-full object-cover"
          />
          <div className="p-5 sm:p-8">
            <h2 className="font-bn text-[clamp(1.4rem,5vw,2rem)] font-extrabold">
              {t("এভাবে পাঠাবেন", "This is how you send it")}
            </h2>
            <p className="font-bn mt-2 max-w-[44ch] text-[16px] font-semibold text-muted-foreground">
              {t(
                "হোয়াটসঅ্যাপে ছবি দিন, শহরের নাম লিখুন, কয়টা লাগবে বলুন। এটুকুই।",
                "Send the photo on WhatsApp, write your city and how many you need. That is all.",
              )}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a
                href={photoInquiry()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bn flex min-h-[56px] items-center justify-center gap-2 rounded-[10px] bg-wa text-lg font-bold text-wa-foreground"
              >
                <WhatsAppIcon className="h-6 w-6" />
                {t("হোয়াটসঅ্যাপে পাঠান", "Send on WhatsApp")}
              </a>
              <a
                href={telLink}
                className="font-bn flex min-h-[56px] items-center justify-center gap-2 rounded-[10px] bg-primary text-lg font-bold text-primary-foreground"
              >
                <PhoneGlyph className="h-6 w-6" />
                {siteConfig.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
