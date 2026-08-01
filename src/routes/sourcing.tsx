import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, Link2, AlertTriangle, MessageCircle } from "lucide-react";
import { Container, Section, SectionHeading, Badge, Skeleton, EmptyState } from "@/components/twt/primitives";
import { Button, ExternalButton, Input } from "@/components/twt/button";
import { ProductCard, priceLabel } from "@/components/twt/product-card";
import type { ProductDetail, SearchResult } from "@/lib/products/types";
import { productQuote, generalInquiry } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/sourcing")({
  head: () => ({
    meta: [
      { title: "1688 & Alibaba sourcing for Bangladesh — TWT International" },
      {
        name: "description",
        content:
          "Search Chinese wholesale products or paste a 1688 / Alibaba link and get a Bangladesh-landed path quote on WhatsApp from TWT International.",
      },
      { property: "og:title", content: "Sourcing tool — TWT International" },
      {
        property: "og:description",
        content: "Search or paste a 1688 link. Get a BD path quote on WhatsApp.",
      },
      { property: "og:url", content: "/sourcing" },
    ],
    links: [{ rel: "canonical", href: "/sourcing" }],
  }),
  component: SourcingPage,
});

function SourcingPage() {
  const [tab, setTab] = useState<"search" | "link">("search");

  return (
    <>
      <div className="bg-navy py-14 text-white grid-lines">
        <Container>
          <Badge tone="outline">Sourcing desk · demo data</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Paste a 1688 link. Get a BD path quote on WhatsApp.
          </h1>
          <p className="font-bn mt-3 text-white/70">লিংক পাঠান · হোয়াটসঅ্যাপে কোট নিন</p>
          <p className="mt-4 max-w-2xl text-white/70">
            Search our demo catalogue or drop any 1688 / Alibaba product URL. We read the Chinese
            listing, confirm MOQ and tiers with the supplier, then send you a realistic
            China-to-Bangladesh path.
          </p>
        </Container>
      </div>

      <Section className="pt-10">
        <Container>
          <div className="inline-flex rounded-xl border border-navy/10 bg-white/45 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setTab("search")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === "search" ? "bg-white text-navy shadow-[var(--shadow-lift)] ring-1 ring-inset ring-navy/5" : "text-steel"}`}
            >
              <Search className="size-4" /> Search
            </button>
            <button
              type="button"
              onClick={() => setTab("link")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === "link" ? "bg-white text-navy shadow-[var(--shadow-lift)] ring-1 ring-inset ring-navy/5" : "text-steel"}`}
            >
              <Link2 className="size-4" /> Paste link
            </button>
          </div>

          <div className="mt-8">{tab === "search" ? <SearchPanel /> : <LinkPanel />}</div>

          <p className="mt-10 flex items-start gap-2 rounded-xl border border-signal/20 bg-signal/5 p-4 text-sm text-navy">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-signal" />
            <span>
              CNY marketplace price is not your final Bangladesh landed cost. Freight, duty,
              handling and delivery are quoted separately after weight, volume and mode are known.
            </span>
          </p>
        </Container>
      </Section>
    </>
  );
}

function SearchPanel() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["products", "search", query, page],
    queryFn: async (): Promise<SearchResult> => {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}&page=${page}`,
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
  });

  const total = data?.totalApprox ?? 0;
  const pages = Math.max(1, Math.ceil(total / 12));

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(input.trim().slice(0, 120));
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          value={input}
          maxLength={120}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. usb cable, mailer bags, zipper, air fryer"
          aria-label="Search products"
        />
        <Button type="submit" size="lg" className="sm:w-40">
          <Search className="size-4" /> Search
        </Button>
      </form>

      {isError ? (
        <div className="mt-8">
          <EmptyState
            title="Search is unavailable right now"
            body="Our catalogue service didn't respond. Message us on WhatsApp and we'll source it manually."
            action={
              <ExternalButton href={generalInquiry()}>
                <MessageCircle className="size-4" /> WhatsApp us
              </ExternalButton>
            }
          />
        </div>
      ) : isFetching ? (
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-navy/8 bg-white/40 p-4 backdrop-blur-md">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-steel">
            {total} listing{total === 1 ? "" : "s"}
            {query ? ` for “${query}”` : " in the demo catalogue"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {pages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-steel">
                Page {page} of {pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
              >
                Next
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Nothing matched that keyword"
            body="Try a broader English keyword, or send us the Chinese listing link directly — we search 1688 by hand every day."
            action={
              <ExternalButton href={generalInquiry()}>
                <MessageCircle className="size-4" /> Ask on WhatsApp
              </ExternalButton>
            }
          />
        </div>
      )}
    </div>
  );
}

function LinkPanel() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (value: string): Promise<ProductDetail> => {
      const res = await fetch(`/api/products/by-url?url=${encodeURIComponent(value)}`);
      const json = (await res.json()) as { item?: ProductDetail; error?: string };
      if (!res.ok || !json.item) throw new Error(json.error ?? "Could not read that link");
      return json.item;
    },
  });

  const item = mutation.data;

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = url.trim();
          if (!/^https?:\/\/\S+$/.test(value)) {
            setError("Paste the full product URL including https://");
            return;
          }
          setError(null);
          mutation.mutate(value.slice(0, 600));
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Input
          value={url}
          maxLength={600}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://detail.1688.com/offer/681204551903.html"
          aria-label="Product URL"
          inputMode="url"
        />
        <Button type="submit" size="lg" className="sm:w-40" disabled={mutation.isPending}>
          {mutation.isPending ? "Reading…" : "Fetch listing"}
        </Button>
      </form>
      {error ? <p className="mt-2 text-sm font-medium text-signal">{error}</p> : null}
      {mutation.isError ? (
        <p className="mt-2 text-sm font-medium text-signal">
          {(mutation.error as Error).message}
        </p>
      ) : null}

      {mutation.isPending ? (
        <div className="mt-8 grid gap-6 rounded-2xl border border-navy/8 bg-white/40 p-5 backdrop-blur-md sm:grid-cols-[220px_1fr]">
          <Skeleton className="aspect-square w-full" />
          <div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <Skeleton className="mt-6 h-11 w-48" />
          </div>
        </div>
      ) : null}

      {item ? (
        <div className="mt-8 grid gap-6 glass matte rounded-2xl p-5 shadow-[var(--shadow-lift)] sm:grid-cols-[220px_1fr]">
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="aspect-square w-full rounded-xl object-cover"
          />
          <div>
            <Badge tone="green">{item.source}</Badge>
            <h2 className="mt-3 text-xl font-bold text-navy">{item.title}</h2>
            {item.manualQuoteOnly ? (
              <p className="mt-2 text-sm text-steel">{item.description}</p>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold text-navy">
                  {priceLabel(item)} <span className="text-sm font-normal text-steel">CNY</span>
                </p>
                <p className="mt-1 text-sm text-steel">
                  MOQ {item.moq ?? "—"} · {item.shopName ?? "Supplier to be confirmed"}
                </p>
              </>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <ExternalButton
                href={productQuote({
                  title: item.title,
                  productUrl: item.productUrl,
                  priceMin: item.priceMin,
                  priceMax: item.priceMax,
                  moq: item.moq,
                })}
              >
                <MessageCircle className="size-4" /> Get BD quote on WhatsApp
              </ExternalButton>
              {!item.manualQuoteOnly ? (
                <Link
                  to="/product/$source/$id"
                  params={{ source: item.source, id: item.id }}
                  className="inline-flex h-11 items-center rounded-xl border border-navy/15 px-5 text-[15px] font-semibold text-navy hover:bg-white/80"
                >
                  Open full listing
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}