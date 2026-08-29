import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { ProductCard } from "@/components/s2b/product-card";
import { catalogueProducts } from "@/lib/products/queries.functions";
import type { CatalogueItem } from "@/lib/products/search-cache.server";
import { categories, categoryOfProduct, type CategoryKey } from "@/lib/products/categories";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "ক্যাটালগ · আগে খোঁজা পণ্য | Source2BD" },
      {
        name: "description",
        content:
          "১৬৮৮, তাওবাও ও আলিবাবা থেকে আগে খোঁজা পণ্যগুলো ক্যাটাগরি ধরে দেখুন। পছন্দ হলে WhatsApp-এ বাংলাদেশ পর্যন্ত পুরো দাম জেনে নিন।",
      },
      { property: "og:title", content: "ক্যাটালগ · আগে খোঁজা পণ্য | Source2BD" },
      { property: "og:description", content: "ক্যাটাগরি ধরে পণ্য দেখুন, শিপিংসহ দাম জেনে নিন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/catalog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Source2BD catalogue",
          url: "https://source2bd.com/catalog",
          description:
            "Products already sourced from 1688, Taobao and Alibaba, grouped by category for Bangladeshi buyers.",
          isPartOf: { "@type": "WebSite", name: "Source2BD", url: "https://source2bd.com" },
        }),
      },
    ],
  }),
  validateSearch: (
    search: Record<string, unknown>,
  ): { cat?: string; q?: string; sort?: string } => {
    const out: { cat?: string; q?: string; sort?: string } = {};
    if (typeof search["cat"] === "string" && search["cat"]) out.cat = search["cat"];
    if (typeof search["q"] === "string" && search["q"]) out.q = search["q"];
    if (search["sort"] === "price-asc" || search["sort"] === "price-desc")
      out.sort = search["sort"];
    return out;
  },
  loader: async (): Promise<CatalogueItem[]> => {
    try {
      return await catalogueProducts();
    } catch {
      return [];
    }
  },
  errorComponent: ({ error }) => (
    <Section>
      <Container>
        <p role="alert" className="font-bn text-[16px] font-semibold">
          {error.message}
        </p>
      </Container>
    </Section>
  ),
  notFoundComponent: () => (
    <Section>
      <Container>
        <p className="font-bn text-[16px] font-semibold">কিছু পাওয়া যায়নি।</p>
      </Container>
    </Section>
  ),
  component: CatalogPage,
});

function CatalogPage() {
  const items = Route.useLoaderData() as CatalogueItem[];
  const { cat = "", q = "", sort = "" } = Route.useSearch();
  const { t } = useLang();
  const [text, setText] = useState(q);
  const [visibleCount, setVisibleCount] = useState(240);

  const tagged = useMemo<{ p: CatalogueItem; key: CategoryKey }[]>(
    () => items.map((p: CatalogueItem) => ({ p, key: categoryOfProduct(p, p.query) })),
    [items],
  );

  const counts = useMemo(() => {
    const m = new Map<CategoryKey, number>();
    for (const row of tagged) m.set(row.key, (m.get(row.key) ?? 0) + 1);
    return m;
  }, [tagged]);

  const needle = text.trim().toLowerCase();
  const matched: { p: CatalogueItem; key: CategoryKey }[] = tagged
    .filter((row: { key: CategoryKey }) => (cat ? row.key === cat : true))
    .filter((row: { p: CatalogueItem }) =>
      needle ? `${row.p.title} ${row.p.query}`.toLowerCase().includes(needle) : true,
    );

  // With no category chosen, interleave categories so one popular keyword
  // cannot turn the whole grid into a single-product-type wall.
  const shown = useMemo(() => {
    let out: { p: CatalogueItem; key: CategoryKey }[];
    if (sort === "price-asc" || sort === "price-desc") {
      const price = (p: CatalogueItem) => p.priceMin ?? p.priceMax ?? Number.MAX_SAFE_INTEGER;
      const sorted = [...matched].sort((a, b) => {
        const diff = price(a.p) - price(b.p);
        return sort === "price-asc" ? diff : -diff;
      });
      out = sort === "price-asc" ? sorted : sorted.reverse();
    } else if (cat) {
      out = matched.slice(0, 240);
    } else {
      const buckets = new Map<CategoryKey, { p: CatalogueItem; key: CategoryKey }[]>();
      for (const row of matched) {
        const list = buckets.get(row.key) ?? [];
        list.push(row);
        buckets.set(row.key, list);
      }
      const inter: { p: CatalogueItem; key: CategoryKey }[] = [];
      let added = true;
      while (added && inter.length < 240) {
        added = false;
        for (const list of buckets.values()) {
          const next = list.shift();
          if (!next) continue;
          inter.push(next);
          added = true;
          if (inter.length >= 240) break;
        }
      }
      out = inter;
    }
    return out.slice(0, visibleCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagged, cat, needle, sort, visibleCount]);

  return (
    <Section className="py-6 sm:py-10">
      <Container>
        <h1 className="font-bn text-[clamp(1.5rem,6vw,2.2rem)] font-extrabold leading-tight">
          {t("ক্যাটালগ · আগে খোঁজা পণ্য", "Catalogue of past searches")}
        </h1>
        <p className="font-bn mt-2 max-w-[52ch] text-[16px] font-semibold text-muted-foreground">
          {t(
            "কী আনবেন বুঝতে পারছেন না? ক্যাটাগরি ধরে দেখুন। দাম চীনের দোকানের, বাংলাদেশ পর্যন্ত পুরো দাম WhatsApp-এ বলে দেব।",
            "Not sure what to import? Browse by category. Prices are seller prices in China; we quote the full Bangladesh price on WhatsApp.",
          )}
        </p>

        <label className="mt-5 block">
          <span className="sr-only">{t("ক্যাটালগে খুঁজুন", "Search the catalogue")}</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("এখানে লিখে ছেঁকে নিন", "Type to filter")}
            className="panel matte font-bn h-14 w-full rounded-[16px] px-4 text-[16px] font-semibold outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/catalog"
            search={{}}
            className={cn(
              "font-bn flex min-h-[48px] items-center gap-2 rounded-full px-4 text-[14px] font-bold",
              cat ? "panel matte text-muted-foreground" : "bg-foreground text-background",
            )}
          >
            {t("সব", "All")} ({tagged.length})
          </Link>
          {categories
            .filter((c) => (counts.get(c.key) ?? 0) > 0)
            .map((c) => (
              <Link
                key={c.key}
                to="/catalog"
                search={{ cat: c.key }}
                className={cn(
                  "font-bn flex min-h-[48px] items-center gap-2 rounded-full px-4 text-[14px] font-bold",
                  cat === c.key
                    ? "bg-foreground text-background"
                    : "panel matte text-muted-foreground",
                )}
              >
                <span aria-hidden>{c.emoji}</span>
                {t(c.bn, c.en)} ({counts.get(c.key)})
              </Link>
            ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-bn text-[14px] font-bold text-muted-foreground">
            {t("সাজান:", "Sort:")}
          </span>
          {(
            [
              ["", "জনপ্রিয়", "Popular"],
              ["price-asc", "কম দাম আগে", "Price low-high"],
              ["price-desc", "বেশি দাম আগে", "Price high-low"],
            ] as const
          ).map(([value, bn, en]) => (
            <Link
              key={value || "popular"}
              to="/catalog"
              search={{ cat: cat || undefined, q: q || undefined, sort: value || undefined }}
              className={cn(
                "font-bn flex min-h-[44px] items-center rounded-full px-4 text-[14px] font-bold",
                sort === value
                  ? "bg-foreground text-background"
                  : "panel matte text-muted-foreground",
              )}
            >
              {t(bn, en)}
            </Link>
          ))}
        </div>

        {shown.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {shown.map(({ p }: { p: CatalogueItem }) => (
              <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
            ))}
          </div>
        ) : (
          <div className="panel matte mt-6 rounded-[18px] p-5">
            <p className="font-bn text-[16px] font-bold">
              {needle || cat
                ? t(
                    "এই খোঁজে কিছু নেই। অন্য শব্দ চেষ্টা করুন।",
                    "Nothing matches that. Try another word.",
                  )
                : t(
                    "ক্যাটালগে এখনো জিনিস ওঠেনি। সরাসরি খুঁজে দেখুন:",
                    "Nothing in the catalogue yet. Search directly:",
                  )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["led light", "phone cover", "shoes", "watch", "bag", "kitchen items"].map(
                (term) => (
                  <Link
                    key={term}
                    to="/sourcing"
                    search={{ q: term, mode: "search" } as never}
                    className="font-bn flex min-h-[48px] items-center rounded-full border border-border bg-paper px-4 text-[14px] font-bold"
                  >
                    {term}
                  </Link>
                ),
              )}
            </div>
            <Link
              to="/sourcing"
              className="font-bn mt-4 inline-flex min-h-[56px] items-center rounded-[14px] bg-foreground px-5 text-[15px] font-bold text-background"
            >
              {t("নাম লিখে খুঁজুন", "Search by name")}
            </Link>
          </div>
        )}

        {matched.length > shown.length ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + 240)}
              className="font-bn flex min-h-[56px] items-center rounded-[14px] border border-border bg-paper px-6 text-[15px] font-bold"
            >
              {t("আরও দেখুন", "Load more")}
            </button>
            <p className="text-[13px] text-muted-foreground">
              {shown.length} / {matched.length}
            </p>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
