import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Container, Section, Skeleton } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { SearchGlyph, LinkGlyph, CameraGlyph, MicGlyph, BoxGlyph } from "@/components/s2b/glyphs";
import { VoiceButton } from "@/components/s2b/voice-button";
import { ProductCard } from "@/components/s2b/product-card";
import { searchProducts, productByUrl, productsByPhoto, cachedSearch } from "@/lib/products/queries.functions";
import type { Marketplace, ProductSummary } from "@/lib/products/types";
import { generalInquiry, linkInquiry, photoInquiry, telLink, voiceInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { QuotaBar, LimitReached } from "@/components/s2b/quota-bar";

export const Route = createFileRoute("/sourcing")({
  head: () => ({
    meta: [
      { title: "পণ্য খুঁজুন · ছবি বা লিংক দিন | Source2BD" },
      {
        name: "description",
        content:
          "পণ্যের ছবি তুলুন বা ১৬৮৮, আলিবাবা, অ্যামাজনের লিংক দিন। মিল থাকা পণ্য দেখুন, তারপর WhatsApp-এ বাংলাদেশ পর্যন্ত পুরো দাম (শিপিংসহ) জেনে নিন।",
      },
      { property: "og:title", content: "পণ্য খুঁজুন · Source2BD" },
      { property: "og:description", content: "নাম লিখুন, লিংক বা ছবি দিন, বাংলাদেশ পর্যন্ত পুরো দাম জেনে নিন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/sourcing" }],
  }),
  component: SourcingPage,
  validateSearch: (s: Record<string, unknown>): { q?: string; mode?: Mode } => {
    const out: { q?: string; mode?: Mode } = {};
    if (typeof s["q"] === "string" && s["q"].trim()) out.q = s["q"].slice(0, 120);
    if (s["mode"] === "photo" || s["mode"] === "link" || s["mode"] === "search" || s["mode"] === "voice")
      out.mode = s["mode"];
    return out;
  },
});

type Mode = "photo" | "link" | "search" | "voice";

function SourcingPage() {
  const { mode: initialMode, q } = Route.useSearch();
  const { t } = useLang();
  // Typing a name is the real first job. Voice lives inside that panel.
  const [mode, setMode] = useState<Mode>(
    initialMode && initialMode !== "voice" ? initialMode : q ? "search" : (initialMode === "voice" ? "search" : "search"),
  );

  const tabs: { key: Mode; bn: string; en: string; icon: ReactNode }[] = [
    { key: "search", bn: "নাম লিখে খুঁজুন", en: "Search by name", icon: <SearchGlyph className="h-7 w-7" /> },
    { key: "link", bn: "লিংক দিয়ে খুঁজুন", en: "Search by link", icon: <LinkGlyph className="h-7 w-7" /> },
    { key: "photo", bn: "ছবি দিয়ে খুঁজুন", en: "Search by photo", icon: <CameraGlyph className="h-7 w-7" /> },
  ];

  return (
    <Section className="py-6 sm:py-10">
      <Container>
        <h1 className="font-bn text-[clamp(1.5rem,6vw,2.2rem)] font-extrabold leading-tight">
          {t("পণ্য খুঁজুন", "Find your product")}
        </h1>
        <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
          {t(
            "নাম লিখুন বা মাইকে বলুন · লিংক বা ছবিও দিতে পারেন",
            "Type the name or speak it. You can also paste a link or a photo.",
          )}
        </p>

        <div role="tablist" aria-label={t("খোঁজার উপায়", "Search method")} className="mt-5 grid grid-cols-3 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={mode === tab.key}
              onClick={() => setMode(tab.key)}
              className={cn(
                "flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-[16px] px-1 text-center transition-colors",
                mode === tab.key
                  ? "bg-foreground text-background"
                  : "panel matte text-muted-foreground",
              )}
            >
              {tab.icon}
              <span className="font-bn text-[12.5px] font-bold leading-tight">{t(tab.bn, tab.en)}</span>
            </button>
          ))}
        </div>

        <Link
          to="/catalog"
          search={{}}
          className="panel matte font-bn mt-3 flex min-h-[56px] items-center justify-between gap-3 rounded-[16px] px-4 text-[15px] font-bold"
        >
          <span>{t("বুঝতে পারছেন না কী আনবেন? ক্যাটালগ দেখুন", "Not sure what to import? Browse the catalogue")}</span>
          <span aria-hidden className="text-accent">→</span>
        </Link>

        <QuotaBar className="mt-4" />

        <div className="mt-5">
          {mode === "photo" ? <PhotoPanel /> : null}
          {mode === "link" ? <LinkPanel /> : null}
          {mode === "search" || mode === "voice" ? <SearchPanel /> : null}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------- shared ------------------------------ */

function Searching() {
  const { t } = useLang();
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(95, Math.round(95 * (1 - Math.exp(-sec / 12))));
  return (
    <div className="panel matte relative overflow-hidden rounded-[20px] p-6 text-center" role="status" aria-live="polite">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent/20">
        <div 
          className="h-full bg-accent transition-all duration-500" 
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
          <SearchGlyph className="absolute inset-0 m-auto h-6 w-6 text-accent" />
        </div>
        <div>
          <h3 className="font-bn text-xl font-black">{t("খুঁজছি… একটু অপেক্ষা করুন", "Searching... please wait")}</h3>
          <p className="font-bn mt-1 text-[15px] font-bold text-muted-foreground">
            {t("সরাসরি চীন থেকে দাম দেখছি", "Checking prices directly from China")}
          </p>
        </div>
        <span className="tnum rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">{sec}s</span>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-[12px] bg-foreground/5" />
        ))}
      </div>
    </div>
  );
}

/** Every dead end offers WhatsApp and a phone call. Never a technical error. */
/** The daily allowance ran out: say so plainly instead of "search failed". */
function isQuota(err: unknown) {
  return err instanceof Error && err.message.includes("DAILY_SEARCH_LIMIT");
}

function isLoginRequired(err: unknown) {
  return err instanceof Error && err.message.includes("LOGIN_REQUIRED");
}

/** Signed-out users hit the login wall before we ever call upstream. */
function LoginWall() {
  const { t } = useLang();
  return (
    <div className="panel matte rounded-[18px] p-5 text-center">
      <p className="font-bn text-[19px] font-extrabold">
        {t("খুঁজতে আগে লগইন করুন", "Please log in to search")}
      </p>
      <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
        {t("ফোন নম্বর বা ইমেইল দিয়ে ১ মিনিটে অ্যাকাউন্ট খুলুন · দিনে ৩০ বার ফ্রি", "Open an account in a minute with a phone number or email. 30 free searches a day.")}
      </p>
      <Link
        to="/auth"
        className="font-bn mt-4 flex min-h-[58px] items-center justify-center rounded-full bg-foreground text-[17px] font-bold text-background"
      >
        {t("লগইন / রেজিস্টার", "Log in or sign up")}
      </Link>
    </div>
  );
}

/** Results exist from cache; the live upgrade just needs an account. */
function SoftLoginNote({ quota }: { quota?: boolean }) {
  const { t } = useLang();
  return (
    <div className="panel matte mt-4 flex flex-col gap-3 rounded-[18px] p-4 sm:flex-row sm:items-center">
      <p className="font-bn text-[15px] font-semibold text-muted-foreground">
        {quota
          ? t(
              "আজকের নতুন খোঁজার সীমা শেষ। উপরের সংরক্ষিত পণ্য দেখতে পারেন।",
              "Today's live search limit is used up. The saved products above are still available.",
            )
          : t(
              "আরও নতুন পণ্য দেখতে লগইন করুন · দিনে ৩০ বার ফ্রি",
              "Log in to pull fresh listings. 30 free live searches a day.",
            )}
      </p>
      {quota ? null : (
        <Link
          to="/auth"
          className="font-bn flex min-h-[52px] shrink-0 items-center justify-center rounded-full bg-foreground px-6 text-[16px] font-bold text-background sm:ml-auto"
        >
          {t("লগইন / রেজিস্টার", "Log in or sign up")}
        </Link>
      )}
    </div>
  );
}

function HelpBox({
  title,
  waHref,
  onRetry,
}: {
  title: string;
  waHref: string;
  onRetry?: () => void;
}) {
  const { t } = useLang();
  return (
    <div className="panel matte rounded-[18px] p-5 text-center">
      <p className="font-bn text-[18px] font-bold">{title}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="font-bn flex min-h-[60px] items-center justify-center rounded-full bg-accent text-[17px] font-bold text-accent-foreground sm:col-span-2"
          >
            {t("আবার খুঁজুন", "Search again")}
          </button>
        ) : null}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bn flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-wa text-[17px] font-bold text-wa-foreground"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("হোয়াটসঅ্যাপ করুন", "Message us")}
        </a>
        <a
          href={telLink}
          className="font-bn flex min-h-[60px] items-center justify-center rounded-full bg-foreground text-[17px] font-bold text-background"
        >
          {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
        </a>
      </div>
    </div>
  );
}

function MarketDisclaimer() {
  const { t } = useLang();
  return (
    <div className="mb-4 rounded-[16px] border-2 border-accent/30 bg-accent/10 p-4">
      <p className="font-bn text-[16px] font-bold leading-snug">
        {t(
          "এগুলো মার্কেট/সাপ্লায়ার দাম। বাংলাদেশে পৌঁছানোর পুরো দাম আলাদা — শিপিংসহ জানতে সবুজ বাটনে চাপুন। পণ্যে চাপ দিলে বিস্তারিত দেখা যাবে।",
          "These are supplier prices. The Bangladesh total is separate — tap the green button for the shipping-inclusive price. Tap a product for details.",
        )}
      </p>
    </div>
  );
}

function Results({ items }: { items: ProductSummary[] }) {
  return (
    <div>
      <MarketDisclaimer />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- photo ------------------------------ */

function PhotoPanel() {
  const { t } = useLang();
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ProductSummary[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const byPhoto = useServerFn(productsByPhoto);

  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (image: string) => byPhoto({ data: { image, marketplace: "1688" as const } }),
    onSuccess: (res) => {
      setItems(res.items);
      void qc.invalidateQueries({ queryKey: ["my-quota"] });
    },
  });

  async function pickFile(file: File) {
    setFileError(null);
    setItems(null);
    if (!file.type.startsWith("image/")) {
      setFileError(t("এটা ছবি নয়। আরেকটা ছবি দিন।", "That is not a photo. Try another file."));
      return;
    }
    try {
      const dataUrl = await shrinkImage(file);
      setPreview(dataUrl);
      mutation.mutate(dataUrl);
    } catch {
      setFileError(t("ছবিটা পড়া গেল না। আরেকটা দিন।", "We could not read that photo. Try another one."));
    }
  }

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (!file) return;
      e.preventDefault();
      void pickFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = Array.from(e.dataTransfer.files).find((x) => x.type.startsWith("image/"));
          if (f) void pickFile(f);
        }}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed px-5 py-8 text-center transition-colors",
          dragging ? "border-accent bg-accent/10" : "border-foreground/25 bg-paper",
        )}
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void pickFile(f);
            e.target.value = "";
          }}
        />
        {preview ? (
          <img src={preview} alt={t("আপনার ছবি", "Your photo")} className="max-h-44 w-auto rounded-[14px] object-contain" />
        ) : (
          <CameraGlyph className="h-16 w-16 text-accent" />
        )}
        <span className="font-bn max-w-[24ch] text-[18px] font-bold leading-snug">
          {preview
            ? t("অন্য ছবি দিন", "Use another photo")
            : t("পণ্যের ছবি তুলুন বা গ্যালারি থেকে বাছুন", "Take a photo or pick one from your gallery")}
        </span>
      </label>

      {fileError ? <p className="font-bn mt-3 text-[16px] font-bold text-accent">{fileError}</p> : null}

      <a
        href={photoInquiry()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex min-h-[64px] flex-col items-center justify-center rounded-full bg-wa text-wa-foreground"
      >
        <span className="font-bn flex items-center gap-2 text-[18px] font-bold leading-tight">
          <WhatsAppIcon className="h-6 w-6" />
          {t("বাংলাদেশ পর্যন্ত পুরো দাম জানুন", "Get the full Bangladesh price")}
        </span>
        <span className="font-bn text-[12px] font-semibold opacity-90">
          {t("শিপিং চার্জসহ · WhatsApp-এ", "Shipping included · on WhatsApp")}
        </span>
      </a>
      <p className="font-bn mt-2 text-center text-[14px] font-semibold text-foreground/70">
        {t("হোয়াটসঅ্যাপ খুলবে, সেখানে ছবিটা পাঠিয়ে দিন।", "WhatsApp opens, then attach your photo there.")}
      </p>

      <div className="mt-6">
        {mutation.isPending ? <Searching /> : null}
        {mutation.isError ? (
          isLoginRequired(mutation.error) ? (
            <LoginWall />
          ) : isQuota(mutation.error) ? (
            <LimitReached />
          ) : (
            <HelpBox
              title={t("এখন খুঁজে পাওয়া গেল না · ছবিটা WhatsApp-এ পাঠান", "The search did not come back. Send the photo on WhatsApp.")}
              waHref={photoInquiry()}
            />
          )
        ) : null}
        {items && !mutation.isPending ? (
          items.length ? (
            <Results items={items} />
          ) : (
            <HelpBox
              title={t("কিছু পাইনি · ছবিটা WhatsApp-এ পাঠান বা ফোন করুন", "Nothing found. Send the photo on WhatsApp or call us.")}
              waHref={photoInquiry()}
            />
          )
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------ link ------------------------------ */

function LinkPanel() {
  const { t } = useLang();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const byUrl = useServerFn(productByUrl);

  const mutation = useMutation({ mutationFn: (u: string) => byUrl({ data: { url: u } }) });
  const item = mutation.data;

  function send() {
    const value = url.trim();
    if (!value) {
      setError(t("লিংকটি বসান", "Paste a link first"));
      return;
    }
    if (!/^https?:\/\/|\w+\.\w+/.test(value)) {
      // Still let them reach the desk, just warn once.
      setError(t("এটা লিংকের মতো লাগছে না, তবু পাঠাতে পারেন।", "That does not look like a link, but you can still send it."));
    } else {
      setError(null);
    }
    window.open(linkInquiry(value), "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <label htmlFor="url" className="font-bn text-[18px] font-bold">
        {t("পণ্যের লিংক পেস্ট করুন", "Paste the product link")}
      </label>
      <input
        id="url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError(null);
        }}
        inputMode="url"
        placeholder={t("পণ্যের লিংক পেস্ট করুন (১৬৮৮ / অ্যামাজন / অন্য)", "Paste the product link (1688 / Amazon / other)")}
        className="mt-2 h-16 w-full rounded-[16px] border border-input bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />

      {error ? <p className="font-bn mt-3 text-[16px] font-bold text-accent">{error}</p> : null}

      <button
        type="button"
        onClick={send}
        className="mt-4 flex min-h-[64px] w-full flex-col items-center justify-center rounded-full bg-wa text-wa-foreground"
      >
        <span className="font-bn flex items-center gap-2 text-[18px] font-bold leading-tight">
          <WhatsAppIcon className="h-6 w-6" />
          {t("বাংলাদেশ পর্যন্ত পুরো দাম জানুন", "Get the full Bangladesh price")}
        </span>
        <span className="font-bn text-[12px] font-semibold opacity-90">
          {t("শিপিং চার্জসহ · WhatsApp-এ", "Shipping included · on WhatsApp")}
        </span>
      </button>

      <button
        type="button"
        onClick={() => mutation.mutate(url.trim())}
        disabled={url.trim().length < 8 || mutation.isPending}
        className="font-bn mt-3 flex min-h-[56px] w-full items-center justify-center rounded-full border border-foreground/15 bg-paper text-[17px] font-bold disabled:opacity-50"
      >
        {mutation.isPending ? t("দেখছি…", "Loading…") : t("আগে পণ্যটা দেখে নিন", "Preview the product first")}
      </button>

      <div className="mt-6">
        {mutation.isPending ? <Searching /> : null}
        {mutation.isError ? (
          <HelpBox
            title={
              isQuota(mutation.error)
                ? t(
                    "আজকের ৩০টি ফ্রি সার্চ শেষ · লিংকটা WhatsApp-এ পাঠান",
                    "Today's 30 free searches are used up. Send the link on WhatsApp.",
                  )
                : t("লিংকটা পড়া গেল না", "We could not read that link")
            }
            waHref={linkInquiry(url)}
          />
        ) : null}
        {item && !mutation.isPending ? (
          <Results items={[item]} />
        ) : null}
      </div>
    </div>
  );
}

/* ----------------------------- search ----------------------------- */

const markets: { key: Marketplace; label: string }[] = [
  { key: "1688", label: "1688" },
  { key: "taobao", label: "Taobao" },
  { key: "alibaba", label: "Alibaba" },
  { key: "aliexpress", label: "AliExpress" },
];

function SearchPanel() {
  const { t } = useLang();
  const navigate = Route.useNavigate();
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [marketplace, setMarketplace] = useState<Marketplace>("1688");
  const [showOptions, setShowOptions] = useState(false);
  const [items, setItems] = useState<ProductSummary[] | null>(null);
  const [submitted, setSubmitted] = useState(initialQ ?? "");
  const search = useServerFn(searchProducts);
  const cachedFn = useServerFn(cachedSearch);

  // Free, login-free results from what we have already paid for. These paint
  // in well under a second so nobody stares at an empty screen.
  const cachedQuery = useQuery({
    queryKey: ["cached-search", submitted],
    queryFn: () => cachedFn({ data: { q: submitted } }),
    enabled: submitted.trim().length > 1,
    staleTime: 5 * 60 * 1000,
  });
  const cachedItems = (cachedQuery.data ?? []) as ProductSummary[];

  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (vars: { q: string; marketplace: Marketplace }) =>
      search({ data: { q: vars.q, marketplace: vars.marketplace, page: 1, live: true } }),
    onSuccess: (res) => {
      setItems(res.items);
      void qc.invalidateQueries({ queryKey: ["my-quota"] });
    },
  });

  function submit(value: string, market = marketplace) {
    const text = value.trim();
    if (!text) return;
    // Keeps the query in the URL so back navigation restores the last search.
    void navigate({ search: { q: text, mode: "search" }, replace: true });
    setItems(null);
    setSubmitted(text);
    mutation.reset();
  }

  function requestLive() {
    const text = submitted.trim();
    if (!text || mutation.isPending) return;
    mutation.mutate({ q: text, marketplace });
  }

  return (
    <div>
      <label htmlFor="q" className="font-bn text-[18px] font-bold">
        {t("কী লাগবে?", "What do you need?")}
      </label>
      <form
        className="mt-2 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            enterKeyHint="search"
            placeholder={t("কী লাগবে? যেমন: লেড লাইট, ফোন কভার", "What do you need? e.g. led light, phone cover")}
            className="font-bn h-16 min-w-0 flex-1 rounded-[16px] border border-input bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <VoiceButton
            onFinal={(text) => {
              setQ(text);
              submit(text);
            }}
            onInterim={(text) => setQ(text)}
          />
        </div>
        <button
          type="submit"
          disabled={!q.trim()}
          className="font-bn flex min-h-[64px] items-center justify-center gap-2 rounded-full bg-accent text-xl font-bold text-accent-foreground disabled:opacity-60"
        >
          <SearchGlyph className="h-6 w-6" />
          {t("সংরক্ষিত পণ্য খুঁজুন", "Search saved products")}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2" aria-label={t("জনপ্রিয় খোঁজ", "Popular searches")}>
        {["led light", "phone cover", "shoes", "watch", "bag"].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => {
              setQ(term);
              submit(term);
            }}
            className="font-bn min-h-[44px] rounded-full border border-border bg-paper px-4 text-[14px] font-bold"
          >
            {term}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowOptions((v) => !v)}
        aria-expanded={showOptions}
        className="font-bn mt-3 min-h-[48px] text-[15px] font-bold text-foreground/70 underline"
      >
        {t("আরও অপশন", "More options")}
      </button>

      {showOptions ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {markets.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setMarketplace(m.key);
                if (q.trim()) submit(q, m.key);
              }}
              className={cn(
                "min-h-[48px] rounded-full px-5 text-[15px] font-bold transition-colors",
                marketplace === m.key ? "bg-foreground text-background" : "border border-border text-foreground/70",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        {/* Saved products appear immediately; the live search fills in after. */}
        {cachedItems.length && !items ? (
          <div className="mb-5">
            <p className="font-bn text-[15px] font-bold text-muted-foreground">
              {t("সংরক্ষিত পণ্য · এখনই দেখুন", "Saved products, available right now")}
            </p>
            <div className="mt-3">
              <Results items={cachedItems} />
            </div>
          </div>
        ) : null}

        {submitted && !mutation.isPending && !items ? (
          <div className="panel matte mb-5 rounded-[18px] p-4">
            <p className="font-bn text-[16px] font-bold">
              {cachedItems.length
                ? t("আরও নতুন পণ্য দরকার?", "Need newer products?")
                : t("সংরক্ষিত পণ্যে মেলেনি", "No matching saved products")}
            </p>
            <p className="font-bn mt-1 text-[14px] font-semibold text-muted-foreground">
              {t(
                "শুধু নিচের বাটনে চাপলেই লাইভ মার্কেট থেকে নতুন ফলাফল আনা হবে।",
                "A live marketplace search only runs when you press the button below.",
              )}
            </p>
            <button
              type="button"
              onClick={requestLive}
              className="font-bn mt-3 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-[17px] font-bold text-background"
            >
              <SearchGlyph className="h-5 w-5" />
              {t("নতুন পণ্য খুঁজুন", "Search live marketplace")}
            </button>
          </div>
        ) : null}

        {mutation.isPending ? <Searching /> : null}
        {mutation.isError ? (
          isLoginRequired(mutation.error) ? (
            cachedItems.length ? (
              <SoftLoginNote />
            ) : (
              <LoginWall />
            )
          ) : isQuota(mutation.error) ? (
            cachedItems.length ? <SoftLoginNote quota /> : <LimitReached />
          ) : cachedItems.length ? null : (
            <HelpBox
              title={t("এখন খুঁজে পাওয়া গেল না", "Search did not come back")}
              waHref={generalInquiry(q)}
            />
          )
        ) : null}
        {items && !mutation.isPending ? (
          items.length ? (
            <Results items={items} />
          ) : cachedItems.length ? null : (
            <HelpBox
              title={t(
                "কিছু পাইনি · অন্য নাম লিখুন, লিংক দিন, বা WhatsApp করুন",
                "Nothing found. Try another name, paste a link, or message us.",
              )}
              waHref={generalInquiry(q)}
              onRetry={() => {
                setItems(null);
                setQ("");
                document.getElementById("q")?.focus();
              }}
            />
          )
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------ voice ----------------------------- */

type VoiceState = "idle" | "listening" | "processing" | "error" | "unsupported";

/**
 * Mic sits beside the search box and fills the very same input.
 * Every state is spoken out loud in Bangla: idle, listening, heard, failed.
 */
function VoiceSearch({
  onFinal,
  onInterim,
}: {
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
}) {
  const { t } = useLang();
  const [state, setState] = useState<VoiceState>("idle");
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const Ctor =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!Ctor) setState("unsupported");
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  function stop() {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setState("idle");
  }

  async function start(lang = "bn-BD") {
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      setState("unsupported");
      return;
    }
    setError(null);
    setHeard("");
    // Ask for the mic first: inside an iframe/preview the recognizer fails
    // silently unless permission has already been granted.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
    } catch {
      setState("error");
      setError(
        t(
          "মাইক বন্ধ আছে · ব্রাউজারে মাইক অনুমতি দিন অথবা টাইপ করুন",
          "The mic is blocked. Allow microphone access in the browser, or type instead.",
        ),
      );
      return;
    }
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    let finalText = "";
    let fellBack = false;
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setHeard((finalText + interim).trim());
      if (interim.trim()) onInterim((finalText + interim).trim());
    };
    rec.onerror = (e: any) => {
      const code = String(e?.error ?? "");
      if (code === "language-not-supported" && lang !== "en-US") {
        // Some browsers have no Bangla model — retry in English rather than fail.
        fellBack = true;
        recRef.current = null;
        void start("en-US");
        return;
      }
      if (code === "aborted" || code === "no-speech") {
        setState("error");
        setError(t("কিছু শুনতে পাইনি · আবার বলুন", "We did not hear anything. Please try again."));
        return;
      }
      setState("error");
      setError(
        code === "not-allowed" || code === "service-not-allowed"
          ? t("মাইক বন্ধ আছে · সেটিংস থেকে মাইক অন করুন অথবা টাইপ করুন", "The mic is blocked. Turn it on in settings, or type instead.")
          : t("বুঝতে পারিনি · আবার বলুন বা টাইপ করুন", "We did not catch that. Say it again or type it."),
      );
    };
    rec.onend = () => {
      if (fellBack) return;
      recRef.current = null;
      const text = finalText.trim();
      if (text.length >= 2) {
        setState("processing");
        setHeard(text);
        onFinal(text);
        setTimeout(() => setState("idle"), 600);
      } else {
        setState((s) => (s === "error" ? s : "error"));
        setError((prev) => prev ?? t("বুঝতে পারিনি · আবার বলুন বা টাইপ করুন", "We did not catch that. Say it again or type it."));
      }
    };
    setState("listening");
    try {
      rec.start();
    } catch {
      setState("error");
      setError(t("মাইক চালু করা গেল না · টাইপ করুন", "The mic could not start. Please type instead."));
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (state === "listening" ? stop() : void start())}
        aria-pressed={state === "listening"}
        aria-label={state === "listening" ? t("শোনা বন্ধ করুন", "Stop listening") : t("মাইকে বলুন", "Speak")}
        className={cn(
          "grid h-16 w-16 shrink-0 place-items-center rounded-[16px] transition-colors",
          state === "listening"
            ? "animate-pulse bg-accent text-accent-foreground"
            : "bg-foreground text-background",
        )}
      >
        <MicGlyph className="h-8 w-8" />
      </button>

      <div className="col-span-full w-full" aria-live="polite">
        {state === "idle" && !heard ? (
          <p className="font-bn mt-1 text-[14px] font-semibold text-foreground/70">
            {t("মাইক চাপলে ফোন অনুমতি চাইবে · তারপর স্পষ্ট করে বলুন", "Tapping the mic asks for permission, then speak clearly.")}
          </p>
        ) : null}
        {state === "listening" ? (
          <div className="mt-2 rounded-[16px] border-2 border-accent bg-accent/10 p-4">
            <p className="font-bn text-[18px] font-extrabold">{t("শুনছি…", "Listening…")}</p>
            <p className="font-bn mt-1 text-[15px] font-semibold">
              {t("বলুন · শেষ হলে আবার মাইকে চাপুন", "Speak, then tap the mic again when you finish.")}
            </p>
            {heard ? (
              <p className="font-bn mt-3 text-[17px] font-bold">
                {t("আপনি বলছেন:", "You are saying:")} {heard}
              </p>
            ) : null}
            <button
              type="button"
              onClick={stop}
              className="font-bn mt-3 min-h-[48px] rounded-full border border-foreground/20 bg-paper px-5 text-[15px] font-bold"
            >
              {t("বাতিল", "Cancel")}
            </button>
          </div>
        ) : null}
        {state === "processing" && heard ? (
          <p className="font-bn mt-2 text-[15px] font-bold">
            {t("আপনি বলেছেন:", "You said:")} {heard} · {t("লিখেছি · এখন ‘খুঁজুন’ চাপুন", "Filled in. Now press Search.")}
          </p>
        ) : null}
        {state === "error" && error ? (
          <div className="mt-2 rounded-[16px] border-2 border-accent/40 bg-accent/10 p-4">
            <p className="font-bn text-[16px] font-bold">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void start()}
                className="font-bn min-h-[48px] rounded-full bg-foreground px-5 text-[15px] font-bold text-background"
              >
                {t("আবার বলুন", "Speak again")}
              </button>
              <a
                href={voiceInquiry()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bn flex min-h-[48px] items-center gap-2 rounded-full bg-wa px-5 text-[15px] font-bold text-wa-foreground"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {t("WhatsApp-এ বলুন", "Say it on WhatsApp")}
              </a>
              <button
                type="button"
                onClick={() => {
                  setState("idle");
                  setError(null);
                  document.getElementById("q")?.focus();
                }}
                className="font-bn min-h-[48px] rounded-full border border-foreground/20 bg-paper px-5 text-[15px] font-bold"
              >
                {t("টাইপ করুন", "Type instead")}
              </button>
            </div>
          </div>
        ) : null}
        {state === "unsupported" ? (
          <p className="font-bn mt-1 text-[14px] font-semibold text-foreground/70">
            {t("এই ফোনে ভয়েস চলছে না · নাম টাইপ করুন বা WhatsApp-এ বলুন", "Voice is not available on this phone. Type the name or tell us on WhatsApp.")}
          </p>
        ) : null}
      </div>
    </>
  );
}

/* ---------------------------- helpers ----------------------------- */

async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

