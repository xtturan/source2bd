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
  }),
  validateSearch: (search: Record<string, unknown>): { cat: string; q: string } => ({
    cat: typeof search["cat"] === "string" ? search["cat"] : "",
    q: typeof search["q"] === "string" ? search["q"] : "",
  }),
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
  const items = Route.useLoaderData();
  const { cat, q } = Route.useSearch();
  const { t } = useLang();
  const [text, setText] = useState(q);

  const tagged = useMemo(
    () => items.map((p) => ({ p, key: categoryOfProduct(p, p.query) })),
    [items],
  );

  const counts = useMemo(() => {
    const m = new Map<CategoryKey, number>();
    for (const row of tagged) m.set(row.key, (m.get(row.key) ?? 0) + 1);
    return m;
  }, [tagged]);

  const needle = text.trim().toLowerCase();
  const shown = tagged
    .filter((row) => (cat ? row.key === cat : true))
    .filter((row) =>
      needle ? `${row.p.title} ${row.p.query}`.toLowerCase().includes(needle) : true,
    )
    .slice(0, 240);

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
            search={{ cat: "", q: "" }}
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
                search={{ cat: c.key, q: "" }}
                className={cn(
                  "font-bn flex min-h-[48px] items-center gap-2 rounded-full px-4 text-[14px] font-bold",
                  cat === c.key ? "bg-foreground text-background" : "panel matte text-muted-foreground",
                )}
              >
                <span aria-hidden>{c.emoji}</span>
                {t(c.bn, c.en)} ({counts.get(c.key)})
              </Link>
            ))}
        </div>

        {shown.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {shown.map(({ p }) => (
              <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
            ))}
          </div>
        ) : (
          <div className="panel matte mt-6 rounded-[18px] p-5">
            <p className="font-bn text-[16px] font-bold">
              {t("এখানে এখনো কিছু নেই।", "Nothing here yet.")}
            </p>
            <Link
              to="/sourcing"
              className="font-bn mt-3 inline-flex min-h-[56px] items-center rounded-[14px] bg-foreground px-5 text-[15px] font-bold text-background"
            >
              {t("নাম লিখে খুঁজুন", "Search by name")}
            </Link>
          </div>
        )}
      </Container>
    </Section>
  );
}