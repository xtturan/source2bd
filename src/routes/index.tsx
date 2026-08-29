import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
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
        content:
          `চীন বা যেকোনো দেশ থেকে পণ্য আনুন। ছবি বা লিংক পাঠান, আমরা বাংলাদেশে পৌঁছানোর পুরো দাম বলে দেব। ফোন ${siteConfig.phoneDisplay}, চকবাজার ঢাকা।`,
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
      <TrustRow />
      <PriceHonesty />
      <Categories />
      <CategoryRails items={items} />
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
    <Container className="pb-8 pt-4 sm:pt-6">
      <h1 className="font-bn max-w-[16ch] text-[clamp(1.7rem,7vw,2.9rem)] font-extrabold leading-[1.2]">
        {t("ছবি বা লিংক পাঠান", "Send a photo or a link")}
        <br />
        <span className="text-accent">
          {t("বাংলাদেশে পৌঁছানোর পুরো দাম বলব", "we tell you the full Bangladesh door price")}
        </span>
      </h1>
      <p className="font-bn mt-3 text-[clamp(1rem,4vw,1.2rem)] font-semibold text-muted-foreground">
        {t("শিপিং চার্জসহ · কোনো ইংরেজি জানার দরকার নেই", "Shipping included. No English needed.")}
      </p>
      <p className="font-bn mt-2 text-[13px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {t(siteConfig.parentLineBn, siteConfig.parentLineEn)}
      </p>

      <HeroSearch />

      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
        <ActionCard
          as="link"
          to="/sourcing"
          search={{ mode: "search" }}
          tone="accent"
          title={t("নাম লিখে খুঁজুন", "Search by name")}
          sub={t("যেমন: লেড লাইট, ফোন কভার", "e.g. led light, phone cover")}
          icon={<SearchGlyph />}
        />

        <ActionCard
          as="button"
          onClick={() => setLinkOpen((v) => !v)}
          expanded={linkOpen}
          tone="ink"
          title={t("লিংক দিন", "Paste a link")}
          sub={t("১৬৮৮ / অ্যামাজন লিংক", "1688 or Amazon link")}
          icon={<LinkGlyph />}
        />

        <ActionCard
          as="link"
          to="/sourcing"
          search={{ mode: "photo" }}
          tone="paper"
          title={t("ছবি পাঠান", "Send a photo")}
          sub={t("পণ্যের ছবি তুলুন", "Take a picture of the item")}
          icon={<CameraGlyph />}
        />
      </div>

      <QuotaBar className="mt-4" />

      {linkOpen ? (
        <div className="panel matte mt-3 rounded-[18px] p-4">
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
            className="mt-2 h-14 w-full rounded-[14px] border border-input bg-background/70 px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          {urlError ? (
            <p className="font-bn mt-2 text-sm font-bold text-accent">
              {t("লিংকটি বসান, তারপর চাপুন", "Paste a link first, then press")}
            </p>
          ) : null}
          <button
            type="button"
            onClick={sendLink}
            className="mt-3 flex min-h-[60px] w-full flex-col items-center justify-center rounded-full bg-wa text-wa-foreground"
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

      <div className="mt-3 grid grid-cols-2 gap-3">
        <a
          href={generalInquiry()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bn flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-foreground/12 bg-paper text-[15px] font-bold"
        >
          <WhatsAppIcon className="h-5 w-5 text-wa" />
          {t("WhatsApp-এ পাঠান", "Message us")}
        </a>
        <a
          href={telLink}
          className="font-bn flex min-h-[52px] items-center justify-center rounded-full border border-foreground/12 bg-paper text-[15px] font-bold"
        >
          {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
        </a>
      </div>
    </Container>
  );
}

const POPULAR = [
  { q: "led light", bn: "লেড লাইট" },
  { q: "phone cover", bn: "ফোন কভার" },
  { q: "shoes", bn: "জুতা" },
  { q: "watch", bn: "ঘড়ি" },
  { q: "bag", bn: "ব্যাগ" },
  { q: "kitchen items", bn: "রান্নাঘরের জিনিস" },
];

/** The one thing a first-time visitor should see: a search box, on screen one. */
function HeroSearch() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <form
      className="mt-6 grid gap-2 sm:mt-8 sm:grid-cols-[minmax(0,1fr)_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        void navigate({ to: "/sourcing", search: q ? { q, mode: "search" } : { mode: "search" } });
      }}
    >
      <label htmlFor="hero-q" className="sr-only">
        {t("পণ্যের নাম লিখুন", "Type a product name")}
      </label>
      <input
        id="hero-q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        enterKeyHint="search"
        placeholder={t("কী লাগবে? যেমন: লেড লাইট, ফোন কভার", "What do you need? e.g. led light, phone cover")}
        className="font-bn h-16 min-w-0 rounded-[18px] border border-input bg-paper px-5 text-[17px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      <button
        type="submit"
        className="font-bn flex h-16 items-center justify-center gap-2 rounded-[18px] bg-accent px-7 text-[18px] font-bold text-accent-foreground"
      >
        <SearchGlyph />
        {t("খুঁজুন", "Search")}
      </button>

      {/* Tapping beats typing for most of our visitors. */}
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        {POPULAR.map((chip) => (
          <Link
            key={chip.q}
            to="/sourcing"
            search={{ q: chip.q, mode: "search" }}
            className="font-bn rounded-full border border-foreground/12 bg-paper px-4 py-2 text-[15px] font-semibold"
          >
            {t(chip.bn, chip.q)}
          </Link>
        ))}
      </div>
    </form>
  );
}

type ActionProps = {
  title: string;
  sub: string;
  icon: React.ReactNode;
  tone: "accent" | "ink" | "paper";
};

const toneClass = {
  accent: "bg-accent text-accent-foreground",
  ink: "bg-foreground text-background",
  paper: "panel matte",
} as const;

function ActionCard(
  props: ActionProps &
    (
      | { as: "link"; to: string; search?: Record<string, string> }
      | { as: "anchor"; href: string }
      | { as: "button"; onClick: () => void; expanded: boolean }
    ),
) {
  const { title, sub, icon, tone } = props;
  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "grid h-14 w-14 shrink-0 place-items-center rounded-[16px] sm:h-16 sm:w-16",
          tone === "paper" ? "bg-accent/12 text-accent" : "bg-white/15",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="font-bn block text-[clamp(1.15rem,4.5vw,1.4rem)] font-extrabold leading-tight">
          {title}
        </span>
        <span
          className={cn(
            "font-bn mt-1 block text-[14px] font-semibold leading-snug",
            tone === "paper" ? "text-muted-foreground" : "opacity-85",
          )}
        >
          {sub}
        </span>
      </span>
    </>
  );

  const cls = cn(
    "flex min-h-[104px] w-full items-center gap-4 rounded-[20px] p-4 text-left shadow-[var(--shadow-2)] transition-transform duration-150 active:scale-[0.99] sm:min-h-[168px] sm:flex-col sm:items-start sm:justify-center sm:gap-3 sm:p-6",
    toneClass[tone],
  );

  if (props.as === "link") {
    return (
      <Link to={props.to} search={props.search as never} className={cls} aria-label={title}>
        {body}
      </Link>
    );
  }
  if (props.as === "anchor") {
    return (
      <a href={props.href} className={cls} aria-label={title}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" onClick={props.onClick} aria-expanded={props.expanded} className={cls} aria-label={title}>
      {body}
    </button>
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
    <Section className="py-10 sm:py-14">
      <Container>
        <h2 className="font-bn text-[clamp(1.4rem,5vw,2rem)] font-extrabold">
          {t("৩ ধাপে কাজ", "Three simple steps")}
        </h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {steps.map((s) => (
            <li key={s.en} className="panel matte flex items-center gap-4 rounded-[18px] p-5 sm:flex-col sm:items-start">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] bg-accent/12 text-accent" aria-hidden>
                {s.icon}
              </span>
              <span>
                <span className="font-bn block text-sm font-bold text-accent">{t(s.n, `Step ${s.n}`)}</span>
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
    <Section className="py-0">
      <Container>
        <ul className="grid grid-cols-2 gap-3">
          {items.map((i) => (
            <li key={i.en} className="panel matte flex items-start gap-2.5 rounded-[16px] p-4">
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
    <Section className="py-10 sm:py-14">
      <Container>
        <h2 className="font-bn text-[clamp(1.4rem,5vw,2rem)] font-extrabold">
          {t("কী আনতে চান?", "What do you want to bring in?")}
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickCategories.map((c) => (
            <Link
              key={c.q}
              to="/sourcing"
              search={{ q: c.q } as never}
              className="panel matte flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-[18px] p-4 text-center"
            >
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-accent/12 text-accent" aria-hidden>
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
    <Section className="py-0">
      <Container>
        <h2 className="font-bn text-[clamp(1.4rem,5vw,2rem)] font-extrabold">
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
                  <span aria-hidden className="mr-1.5">{category.emoji}</span>
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
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
          className="panel matte font-bn mt-8 flex min-h-[64px] items-center justify-between gap-3 rounded-[18px] px-5 text-[16px] font-bold"
        >
          <span>{t("সব ক্যাটাগরি ও পণ্য দেখুন", "Browse every category and product")}</span>
          <span aria-hidden className="text-accent">→</span>
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
        <div className="panel matte overflow-hidden rounded-[20px]">
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
                className="font-bn flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-wa text-lg font-bold text-wa-foreground"
              >
                <WhatsAppIcon className="h-6 w-6" />
                {t("হোয়াটসঅ্যাপে পাঠান", "Send on WhatsApp")}
              </a>
              <a
                href={telLink}
                className="font-bn flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-foreground text-lg font-bold text-background"
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

/* ---------------------------- glyphs ------------------------------ */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function CameraGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.6" />
    </svg>
  );
}

function SearchGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </svg>
  );
}

function LinkGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.5 7" />
      <path d="M14 10a4 4 0 0 0-5.7 0L5.5 12.8a4 4 0 0 0 5.7 5.7L12.5 17" />
    </svg>
  );
}

function PhoneGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M6.5 3.5h3l1.4 3.6-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
    </svg>
  );
}

function TruckGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M2.5 7h11v9h-11z" />
      <path d="M13.5 10.5H17l3.5 3v2.5h-7z" />
      <circle cx="6.5" cy="18" r="1.8" />
      <circle cx="16.5" cy="18" r="1.8" />
    </svg>
  );
}

function TagGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M3.5 12.5 12 4h7.5v7.5L11 20z" />
      <circle cx="15.5" cy="8.5" r="1.4" />
    </svg>
  );
}

function BoxGlyph({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke} aria-hidden>
      <path d="M3.5 7.8 12 3.5l8.5 4.3v8.4L12 20.5l-8.5-4.3z" />
      <path d="M3.5 7.8 12 12.2l8.5-4.4M12 12.2v8.3" />
    </svg>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-accent" {...stroke} strokeWidth={2.4} aria-hidden>
      <path d="M4 12.5l5 5 11-11" />
    </svg>
  );
}
