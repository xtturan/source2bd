import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Container, Section, SectionHeading, Badge, EmptyState, Skeleton, Card } from "@/components/s2b/primitives";
import { Button, ButtonAnchor, WhatsAppIcon } from "@/components/s2b/button";
import { ProductCard } from "@/components/s2b/product-card";
import { IconMic, IconSearch } from "@/components/s2b/big-action";
import { searchProducts, productByUrl, productsByPhoto } from "@/lib/products/queries.functions";
import type { Marketplace, ProductDetail, ProductSummary } from "@/lib/products/types";
import { currencySymbol, marketplaceLabels } from "@/lib/products/types";
import { generalInquiry, productQuote } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sourcing")({
  head: () => ({
    meta: [
      { title: "Sourcing desk, search 1688, Alibaba and Amazon | Source2BD" },
      {
        name: "description",
        content:
          "Search the demo catalogue or paste a 1688, Alibaba or Amazon link. Source2BD reads the listing and returns a Bangladesh landed quote on WhatsApp.",
      },
      { property: "og:title", content: "Source2BD sourcing desk" },
      {
        property: "og:description",
        content: "Search or paste any marketplace link and get a Dhaka landed quote on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SourcingPage,
  validateSearch: (s: Record<string, unknown>): { q?: string; mode?: Mode } => {
    const out: { q?: string; mode?: Mode } = {};
    if (typeof s["q"] === "string" && s["q"].trim()) out.q = s["q"].slice(0, 120);
    if (s["mode"] === "photo" || s["mode"] === "link" || s["mode"] === "search")
      out.mode = s["mode"];
    return out;
  },
});

const markets: { key: Marketplace; label: string }[] = [
  { key: "1688", label: "1688" },
  { key: "taobao", label: "Taobao" },
  { key: "global", label: "All origins" },
  { key: "alibaba", label: "Alibaba" },
  { key: "aliexpress", label: "AliExpress" },
];

type Mode = "search" | "link" | "photo";

function SourcingPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<Mode>(initialMode ?? "search");

  return (
    <>
      <Section className="pb-10">
        <Container>
          <SectionHeading
            title={
              <span className="font-bn">
                পণ্য খুঁজুন, লিংক দিন,
                <br />
                অথবা ছবি পাঠান
              </span>
            }
            titleBn=""
            intro="Type the product name in English or Banglish, or just press the microphone and say it."
          />

          <div className="glass matte mt-10 rounded-[18px] p-2">
            <div role="tablist" aria-label="Sourcing method" className="grid grid-cols-3 gap-1">
              {(
                [
                  ["search", "পণ্য খুঁজুন", "Search"],
                  ["link", "লিংক দিন", "Paste link"],
                  ["photo", "ছবি পাঠান", "Send photo"],
                ] as const
              ).map(([key, bn, en]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={mode === key}
                  aria-label={en}
                  onClick={() => setMode(key)}
                  className={cn(
                    "flex min-h-[60px] flex-col items-center justify-center gap-0.5 rounded-[12px] px-1 transition-colors duration-150",
                    mode === key
                      ? "bg-foreground/10 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="font-bn text-base font-bold leading-none">{bn}</span>
                  <span className="text-[11px] font-semibold opacity-70">{en}</span>
                </button>
              ))}
            </div>

            <div className="p-4 pt-5 sm:p-6">
              {mode === "search" ? <SearchPanel /> : null}
              {mode === "link" ? <LinkPanel /> : null}
              {mode === "photo" ? <PhotoPanel /> : null}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function SearchPanel() {
  return <SearchPanelInner />;
}

function LiveProgress({ label }: { label: string }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  // Eases toward 95% over ~35s so the bar always feels alive without lying about completion.
  const pct = Math.min(95, Math.round(95 * (1 - Math.exp(-sec / 12))));
  return (
    <div
      className="rounded-[12px] border border-border bg-background/60 px-4 py-3 text-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
        <span className="font-medium">{label}</span>
        <span className="tnum ml-auto text-muted-foreground">
          {sec}s elapsed, usually 15 to 30 seconds
        </span>
      </div>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Searching the marketplace for the closest matching products.
      </p>
    </div>
  );
}

function SearchPanelInner() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [marketplace, setMarketplace] = useState<Marketplace>("1688");
  const [items, setItems] = useState<ProductSummary[] | null>(null);
  const search = useServerFn(searchProducts);
  const [listening, setListening] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);

  useEffect(() => {
    setVoiceReady(
      typeof window !== "undefined" &&
        Boolean(
          (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ??
            (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition,
        ),
    );
  }, []);

  const mutation = useMutation({
    mutationFn: (vars: { q: string; marketplace: Marketplace }) =>
      search({ data: { q: vars.q, marketplace: vars.marketplace, page: 1 } }),
    onSuccess: (res) => setItems(res.items),
  });

  const run = mutation.mutate;
  // Deep links from the homepage showcase land here with a keyword ready.
  useEffect(() => {
    if (initialQ) run({ q: initialQ, marketplace: "1688" });
  }, [initialQ, run]);

  // Speaking is easier than spelling. Falls back silently when unsupported.
  function startVoice() {
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "bn-BD";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const text = String(e.results?.[0]?.[0]?.transcript ?? "").trim();
      if (!text) return;
      setQ(text);
      mutation.mutate({ q: text, marketplace });
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  return (
    <div>
      <p className="font-bn mb-3 text-lg font-bold">পণ্যের নাম লিখুন বা বলুন</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate({ q, marketplace });
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="q">
          Product keyword
        </label>
        <div className="relative flex-1">
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="led light, phone case, kitchen rack"
            className="h-14 w-full rounded-[14px] border border-input bg-background/60 pl-4 pr-14 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
          />
          {voiceReady ? (
            <button
              type="button"
              onClick={startVoice}
              aria-label="Speak the product name"
              className={cn(
                "absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full transition-colors",
                listening ? "animate-pulse bg-accent text-accent-foreground" : "bg-foreground/8 text-foreground",
              )}
            >
              <IconMic className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <Button type="submit" size="lg" disabled={mutation.isPending} className="h-14 text-base">
          <IconSearch className="h-5 w-5" />
          {mutation.isPending ? "Searching" : "Search"}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-bn text-sm text-muted-foreground">যেমন:</span>
        {["led light", "phone case", "kitchen rack", "school bag"].map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQ(ex);
              mutation.mutate({ q: ex, marketplace });
            }}
            className="min-h-[40px] rounded-full bg-foreground/6 px-4 text-sm font-semibold hover:bg-foreground/10"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {markets.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMarketplace(m.key);
              mutation.mutate({ q, marketplace: m.key });
            }}
            className={cn(
              "min-h-[44px] rounded-full px-4 text-sm font-semibold transition-colors",
              marketplace === m.key
                ? "bg-accent text-accent-foreground"
                : "ring-1 ring-inset ring-border text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {mutation.isPending ? (
          <div>
            <LiveProgress label="Pulling live listings from the marketplace" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          </div>
        ) : mutation.isError ? (
          <EmptyState
            title="Search did not come back"
            body="Live lookup is paused or busy. Our desk can still find this by hand today."
            action={
              <ButtonAnchor href={generalInquiry(q)} target="_blank" rel="noopener noreferrer" variant="green">
                <WhatsAppIcon /> Ask on WhatsApp
              </ButtonAnchor>
            }
          />
        ) : items && items.length === 0 ? (
          <EmptyState
            title="Nothing matched that keyword"
            body="The demo catalogue is small on purpose. Send the keyword to our desk and we will search the live marketplaces for you."
            action={
              <ButtonAnchor href={generalInquiry(q)} target="_blank" rel="noopener noreferrer" variant="green">
                <WhatsAppIcon /> Send keyword
              </ButtonAnchor>
            }
          />
        ) : items ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{items.length} demo listings</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Start with a keyword, or switch to a marketplace chip to browse that origin.
          </p>
        )}
      </div>
    </div>
  );
}

function LinkPanel() {
  const [url, setUrl] = useState("");
  const [item, setItem] = useState<ProductDetail | null>(null);
  const byUrl = useServerFn(productByUrl);

  const mutation = useMutation({
    mutationFn: (u: string) => byUrl({ data: { url: u } }),
    onSuccess: (res) => setItem(res),
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(url);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="url">
          Product link
        </label>
        <input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://detail.1688.com/offer/... or amazon.com/dp/..."
          className="h-12 flex-1 rounded-[12px] border border-input bg-background/60 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
        />
        <Button type="submit" size="lg" disabled={mutation.isPending || url.trim().length < 8}>
          {mutation.isPending ? "Reading" : "Read link"}
        </Button>
      </form>

      <p className="mt-3 text-xs text-muted-foreground">
        Works with 1688, Alibaba and Amazon product URLs. Any other store still reaches our desk.
      </p>

      <div className="mt-8">
        {mutation.isPending ? (
          <div>
            <LiveProgress label="Reading the listing from the marketplace" />
            <Skeleton className="mt-4 h-56" />
          </div>
        ) : null}

        {mutation.isError ? (
          <EmptyState
            title="Could not read that link"
            body="Shortened and app shared links often hide the listing id. Send it on WhatsApp and we will open it directly."
            action={
              <ButtonAnchor href={generalInquiry(url)} target="_blank" rel="noopener noreferrer" variant="green">
                <WhatsAppIcon /> Send the link
              </ButtonAnchor>
            }
          />
        ) : null}

        {item ? <LinkResult item={item} /> : null}
      </div>
    </div>
  );
}

function LinkResult({ item }: { item: ProductDetail }) {
  const sym = currencySymbol(item.currency);
  return (
    <Card className="flex flex-col gap-5 p-5 sm:flex-row">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-40 w-40 shrink-0 rounded-[12px] object-cover"
          loading="lazy"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <Badge tone="green">{marketplaceLabels[item.marketplace]}</Badge>
        <h3 className="mt-3 text-lg font-bold leading-snug">{item.title}</h3>
        <p className="tnum mt-2 text-xl font-extrabold">
          {item.priceMin != null ? `${sym}${item.priceMin}` : "Price on request"}
          {item.priceMax != null && item.priceMax !== item.priceMin ? ` to ${sym}${item.priceMax}` : ""}
        </p>
        {item.moq ? <p className="mt-1 text-sm text-muted-foreground">MOQ {item.moq}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonAnchor
            href={productQuote({
              title: item.title,
              productUrl: item.productUrl,
              priceMin: item.priceMin,
              priceMax: item.priceMax,
              moq: item.moq,
              currency: item.currency,
              marketplace: marketplaceLabels[item.marketplace],
            })}
            target="_blank"
            rel="noopener noreferrer"
            variant="green"
          >
            <WhatsAppIcon /> Quote this on WhatsApp
          </ButtonAnchor>
          {item.manualQuoteOnly ? null : (
            <Link
              to="/product/$marketplace/$id"
              params={{ marketplace: item.marketplace, id: item.id }}
              className="glass inline-flex h-11 items-center justify-center rounded-[12px] px-5 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5"
            >
              Open full listing
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

function PhotoPanel() {
  const [preview, setPreview] = useState<string | null>(null);
  const [marketplace, setMarketplace] = useState<"1688" | "taobao">("1688");
  const [items, setItems] = useState<ProductSummary[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const byPhoto = useServerFn(productsByPhoto);

  const mutation = useMutation({
    mutationFn: (vars: { image: string; marketplace: "1688" | "taobao" }) =>
      byPhoto({ data: vars }),
    onSuccess: (res) => setItems(res.items),
  });

  // Phone cameras produce 4MB+ files, so shrink to a 1024px JPEG before upload.
  async function pickFile(file: File) {
    setFileError(null);
    setItems(null);
    if (!file.type.startsWith("image/")) {
      setFileError("Choose a photo file (JPG, PNG or WEBP).");
      return;
    }
    try {
      const dataUrl = await shrinkImage(file);
      setPreview(dataUrl);
      mutation.mutate({ image: dataUrl, marketplace });
    } catch {
      setFileError("We could not read that photo. Try another one.");
    }
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="min-w-0">
          <p className="font-bn text-base font-bold sm:text-lg">
            পণ্যের ছবি দিন, মিল থাকা পণ্য দেখুন
          </p>
          <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
            Take or upload one clear photo. We match it against the China marketplaces and show the
            closest listings with a taka price.
          </p>

          <label className="mt-5 flex min-h-[168px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-border bg-background/50 px-5 py-8 text-center transition-colors hover:border-accent/60">
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
              <img
                src={preview}
                alt="Your uploaded product"
                className="max-h-40 w-auto rounded-[12px] object-contain"
              />
            ) : (
              <IconCamera className="h-10 w-10 text-accent" />
            )}
            <span className="font-bn text-base font-bold">
              {preview ? "অন্য ছবি দিন" : "ছবি তুলুন বা আপলোড করুন"}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {preview ? "Change photo" : "Take or upload a photo"}
            </span>
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {([
              { key: "1688", label: "1688" },
              { key: "taobao", label: "Taobao" },
            ] as const).map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  setMarketplace(m.key);
                  if (preview) mutation.mutate({ image: preview, marketplace: m.key });
                }}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-semibold transition-colors",
                  marketplace === m.key
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {fileError ? (
            <p className="mt-3 text-sm font-semibold text-accent">{fileError}</p>
          ) : null}
        </div>

        <Card className="min-w-0 p-5">
          <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-sm">
            Photo checklist
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {[
              "One item per photo, plain background",
              "Include the label or model number if there is one",
              "Add a coin or hand for scale on small parts",
              "Tell us the quantity you plan to order",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <ButtonAnchor
            href={generalInquiry("I want to send a product photo for sourcing")}
            target="_blank"
            rel="noopener noreferrer"
            variant="green"
            className="mt-5 w-full"
          >
            <WhatsAppIcon /> Send it on WhatsApp
          </ButtonAnchor>
        </Card>
      </div>

      <div className="mt-8">
        {mutation.isPending ? (
          <>
            <LiveProgress label="Matching your photo with marketplace listings" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          </>
        ) : null}

        {mutation.isError ? (
          <EmptyState
            title="Photo search did not come back"
            body="Send the photo to our desk on WhatsApp and we will match it by hand today."
            action={
              <ButtonAnchor
                href={generalInquiry("Photo search failed, here is my product photo")}
                target="_blank"
                rel="noopener noreferrer"
                variant="green"
              >
                <WhatsAppIcon /> Send on WhatsApp
              </ButtonAnchor>
            }
          />
        ) : null}

        {items && !mutation.isPending ? (
          items.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No close match found"
              body="Try a photo with a plain background, or send it to our desk and we will search by hand."
              action={
                <ButtonAnchor
                  href={generalInquiry("Photo search found nothing, please help me source this")}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="green"
                >
                  <WhatsAppIcon /> Send on WhatsApp
                </ButtonAnchor>
              }
            />
          )
        ) : null}
      </div>
    </div>
  );
}

/** Downscales a camera photo to a 1024px JPEG so the upload stays small. */
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

function IconCamera({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}
