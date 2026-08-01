import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MessageCircle, Store, MapPin, Package } from "lucide-react";
import { Container, Section, Badge, SectionHeading } from "@/components/s2b/primitives";
import { ExternalButton, Input } from "@/components/s2b/button";
import { ProductCard, priceLabel } from "@/components/s2b/product-card";
import { productQuote } from "@/lib/whatsapp";
import type { ProductDetail, ProductSummary } from "@/lib/products/types";

type ProductPayload = { item: ProductDetail; related: ProductSummary[] };

const inputSchema = z.object({
  id: z.string().min(1).max(64),
  source: z.enum(["1688", "alibaba"]),
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ProductPayload | null> => {
    const { getProductProvider } = await import("@/lib/products/provider.server");
    const { relatedProducts } = await import("@/lib/products/mock-provider");
    const item = await getProductProvider().getById(data.id, data.source);
    if (!item) return null;
    return { item, related: relatedProducts(data.id) };
  });

export const Route = createFileRoute("/product/$source/$id")({
  loader: async ({ params }) => {
    const source = params.source === "alibaba" ? "alibaba" : "1688";
    const result = (await getProduct({ data: { id: params.id, source } })) as
      | ProductPayload
      | null;
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Listing unavailable — TWT International" }, { name: "robots", content: "noindex" }],
      };
    const t = `${loaderData.item.title} — BD quote | TWT International`;
    const d = `${priceLabel(loaderData.item)} CNY, MOQ ${loaderData.item.moq ?? "—"}. Get a China → Bangladesh landed path quote on WhatsApp.`;
    return {
      meta: [
        { title: t.slice(0, 90) },
        { name: "description", content: d.slice(0, 158) },
        { property: "og:title", content: t.slice(0, 90) },
        { property: "og:description", content: d.slice(0, 158) },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { item, related } = Route.useLoaderData() as ProductPayload;
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState("");
  const [city, setCity] = useState("");

  const quoteHref = productQuote({
    title: item.title,
    productUrl: item.productUrl,
    priceMin: item.priceMin,
    priceMax: item.priceMax,
    moq: item.moq,
    qty: qty || undefined,
    city: city || undefined,
  });

  return (
    <>
      <Section className="pb-12 pt-10">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-navy/8 bg-navy/5">
              <img
                src={item.images[active] ?? item.imageUrl}
                alt={item.title}
                className="aspect-square w-full object-cover"
              />
            </div>
            {item.images.length > 1 ? (
              <div className="mt-3 flex gap-3">
                {item.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`size-16 overflow-hidden rounded-xl border-2 transition-colors ${i === active ? "border-green" : "border-navy/8"}`}
                  >
                    <img src={src} alt="" loading="lazy" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="navy">{item.source}</Badge>
              {item.category ? <Badge>{item.category}</Badge> : null}
              {item.ordersHint ? <Badge tone="green">{item.ordersHint}</Badge> : null}
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-snug text-navy sm:text-3xl">
              {item.title}
            </h1>
            {item.titleBn ? (
              <p className="font-bn mt-2 text-steel">{item.titleBn}</p>
            ) : null}

            <div className="mt-5 matte rounded-2xl border border-navy/8 bg-mist/60 p-5 backdrop-blur-md">
              <p className="font-display text-3xl font-bold text-navy">{priceLabel(item)}</p>
              <p className="mt-1 text-sm text-steel">
                CNY marketplace price · MOQ {item.moq ?? "—"} pcs
              </p>
              <p className="mt-3 text-xs leading-relaxed text-steel">
                This is the Chinese listing price only. Your final BDT figure comes after weight,
                volume and shipping mode are confirmed.
              </p>
            </div>

            {item.priceTiers?.length ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-steel">
                  Quantity tiers
                </h2>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {item.priceTiers.map((t) => (
                    <div key={t.minQty} className="rounded-xl border border-navy/8 p-3 text-center">
                      <p className="text-xs text-steel">{t.minQty}+ pcs</p>
                      <p className="mt-1 font-display text-lg font-bold text-navy">¥{t.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Input
                value={qty}
                maxLength={20}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Quantity you want"
                aria-label="Desired quantity"
              />
              <Input
                value={city}
                maxLength={60}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Delivery city in BD"
                aria-label="Delivery city"
              />
            </div>

            <ExternalButton href={quoteHref} size="lg" className="mt-4 w-full">
              <MessageCircle className="size-5" /> Get BD quote on WhatsApp
            </ExternalButton>

            <div className="mt-5 space-y-2 text-sm text-steel">
              {item.shopName ? (
                <p className="flex items-center gap-2">
                  <Store className="size-4 text-green" /> {item.shopName}
                </p>
              ) : null}
              {item.city ? (
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-green" /> Ships from {item.city}
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <Package className="size-4 text-green" /> Consolidation available at our China
                warehouse
              </p>
            </div>

            {item.attributes?.length ? (
              <dl className="mt-6 divide-y divide-navy/8 rounded-2xl border border-navy/8">
                {item.attributes.map((a) => (
                  <div key={a.label} className="flex gap-4 px-4 py-3 text-sm">
                    <dt className="w-36 shrink-0 text-steel">{a.label}</dt>
                    <dd className="font-medium text-navy">{a.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {item.description ? (
              <p className="mt-6 text-sm leading-relaxed text-steel">{item.description}</p>
            ) : null}
          </div>
        </Container>
      </Section>

      {related.length ? (
        <Section tone="muted" className="py-16">
          <Container>
            <SectionHeading eyebrow="Also moving" title="Related listings" />
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-navy/8 bg-white/80 p-3 backdrop-blur-xl md:hidden">
        <a
          href={quoteHref}
          target="_blank"
          rel="noreferrer noopener"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-signal font-semibold text-white"
        >
          <MessageCircle className="size-5" /> Get BD Quote
        </a>
      </div>
    </>
  );
}