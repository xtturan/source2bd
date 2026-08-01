import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Container, Section, SectionHeading, Badge, EmptyState, Skeleton, Card } from "@/components/s2b/primitives";
import { Button, ButtonAnchor, WhatsAppIcon } from "@/components/s2b/button";
import { ProductCard } from "@/components/s2b/product-card";
import { searchProducts, productByUrl } from "@/lib/products/queries.functions";
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
});

const markets: { key: Marketplace; label: string }[] = [
  { key: "global", label: "All origins" },
  { key: "1688", label: "1688" },
  { key: "alibaba", label: "Alibaba" },
  { key: "amazon", label: "Amazon" },
];

type Mode = "search" | "link" | "photo";

function SourcingPage() {
  const [mode, setMode] = useState<Mode>("search");

  return (
    <>
      <Section className="pb-10">
        <Container>
          <SectionHeading
            eyebrow="Sourcing desk"
            title={
              <>
                Search it, paste it, or show us a photo.
                <br />
                We quote it landed in Bangladesh.
              </>
            }
            titleBn="সার্চ করুন, লিংক দিন, অথবা ছবি পাঠান"
            intro="Demo catalogue is live now at zero API cost. Live marketplace lookup switches on behind the same interface when you enable a provider key."
          />

          <div className="glass matte mt-10 rounded-[18px] p-2">
            <div role="tablist" aria-label="Sourcing method" className="grid grid-cols-3 gap-1">
              {(
                [
                  ["search", "Search catalogue"],
                  ["link", "Paste a link"],
                  ["photo", "Photo search"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={mode === key}
                  onClick={() => setMode(key)}
                  className={cn(
                    "h-11 rounded-[12px] text-sm font-semibold transition-colors duration-150",
                    mode === key
                      ? "bg-foreground/10 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.1)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
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
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-border bg-background/60 px-4 py-3 text-sm">
      <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">
        live scrape, usually 30 to 60 seconds. {sec}s elapsed
      </span>
    </div>
  );
}

function SearchPanelInner() {
  const [q, setQ] = useState("");
  const [marketplace, setMarketplace] = useState<Marketplace>("global");
  const [items, setItems] = useState<ProductSummary[] | null>(null);
  const search = useServerFn(searchProducts);

  const mutation = useMutation({
    mutationFn: (vars: { q: string; marketplace: Marketplace }) =>
      search({ data: { q: vars.q, marketplace: vars.marketplace, page: 1 } }),
    onSuccess: (res) => setItems(res.items),
  });

  return (
    <div>
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
        <input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try led strip, phone case, kitchen rack"
          className="h-12 flex-1 rounded-[12px] border border-input bg-background/60 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? "Searching" : "Search"}
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {markets.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMarketplace(m.key);
              mutation.mutate({ q, marketplace: m.key });
            }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
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
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        {mutation.isPending ? <Skeleton className="h-56" /> : null}

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
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h3 className="text-lg font-bold">Send a photo, get matching suppliers</h3>
        <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
          Take a clear photo of the item on a plain background. Our desk runs it against the China
          marketplaces and comes back with the closest factory listings, MOQ and a landed estimate
          for {siteConfig.destinationCities.join(" and ")}.
        </p>
        <p className="font-bn mt-3 text-sm text-muted-foreground">
          পণ্যের ছবি পাঠান, আমরা সাপ্লায়ার খুঁজে দেব।
        </p>
        <div className="mt-6">
          <ButtonAnchor
            href={generalInquiry("I want to send a product photo for sourcing")}
            target="_blank"
            rel="noopener noreferrer"
            variant="green"
            size="lg"
          >
            <WhatsAppIcon /> Send the photo on WhatsApp
          </ButtonAnchor>
        </div>
      </div>
      <Card className="p-5">
        <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
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
      </Card>
    </div>
  );
}
