import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section, Badge, Card } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import { ProductCard } from "@/components/s2b/product-card";
import { productById } from "@/lib/products/queries.functions";
import { relatedProducts } from "@/lib/products/mock-provider";
import type { Marketplace, ProductDetail } from "@/lib/products/types";
import { isMarketplace, marketplaceLabels } from "@/lib/products/types";
import { bdtLabel, formatBdt, toBdt } from "@/lib/products/pricing";
import { productQuote } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { productImage } from "@/lib/images";

export const Route = createFileRoute("/product/$marketplace/$id")({
  loader: async ({ params }): Promise<{ item: ProductDetail }> => {
    const marketplace: Marketplace = isMarketplace(params.marketplace)
      ? params.marketplace
      : "1688";
    const item = await productById({ data: { id: params.id, marketplace } });
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.item.title ?? "Product";
    return {
      meta: [
        { title: `${title.slice(0, 62)} | Source2BD` },
        {
          name: "description",
          content: `Demo listing on Source2BD. Confirm MOQ, tier pricing and a Bangladesh landed path with our WhatsApp desk.`,
        },
        { property: "og:title", content: title.slice(0, 70) },
        {
          property: "og:description",
          content: "Get a Dhaka landed quote for this listing from the Source2BD desk.",
        },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { item } = Route.useLoaderData() as { item: ProductDetail };
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState<string>(String(item.moq ?? 10));
  const [city, setCity] = useState("Dhaka");
  const related = relatedProducts(item.id, 4);

  const quoteHref = productQuote({
    title: item.title,
    productUrl: item.productUrl,
    priceMin: item.priceMin,
    priceMax: item.priceMax,
    moq: item.moq,
    qty,
    city,
    currency: item.currency,
    marketplace: marketplaceLabels[item.marketplace],
  });

  return (
    <Section className="pt-10">
      <Container>
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <ButtonLink to="/sourcing" variant="ghost" size="sm" className="px-0">
            Back to sourcing
          </ButtonLink>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="glass matte overflow-hidden rounded-[18px]">
              <img
                src={productImage(item.images[active] ?? item.imageUrl)}
                referrerPolicy="no-referrer"
                alt={item.title}
                className="aspect-square w-full object-cover"
              />
            </div>
            {item.images.length > 1 ? (
              <div className="mt-3 flex gap-3">
                {item.images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    aria-label={`View image ${i + 1}`}
                    className={
                      "h-20 w-20 overflow-hidden rounded-[12px] border transition-colors " +
                      (i === active ? "border-accent" : "border-border hover:border-foreground/30")
                    }
                  >
                    <img src={productImage(src)} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">{marketplaceLabels[item.marketplace]}</Badge>
              {item.category ? <Badge>{item.category}</Badge> : null}
              <Badge tone="signal">Demo data</Badge>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{item.title}</h1>
            {item.titleBn ? (
              <p className="font-bn mt-2 text-sm text-muted-foreground">{item.titleBn}</p>
            ) : null}

            <p className="tnum mt-5 text-3xl font-extrabold tracking-tight">
              {bdtLabel(item.priceMin, item.priceMax, item.currency, "Price on request")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Taka price of the supplier rate, sourcing service included. Freight, duty and local
              delivery are quoted separately.
            </p>

            {item.priceTiers?.length ? (
              <table className="mt-6 w-full text-sm">
                <caption className="sr-only">Quantity price tiers</caption>
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 font-semibold">Quantity</th>
                    <th className="pb-2 font-semibold">Unit price</th>
                  </tr>
                </thead>
                <tbody className="tnum">
                  {item.priceTiers.map((t) => (
                    <tr key={t.minQty} className="border-t border-border">
                      <td className="py-2.5">{t.minQty}+</td>
                      <td className="py-2.5 font-semibold">
                        {formatBdt(toBdt(t.price, item.currency))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            <Card className="mt-8 p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Build your quote
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="qty" className="text-xs font-semibold text-muted-foreground">
                    Quantity
                  </label>
                  <input
                    id="qty"
                    inputMode="numeric"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="tnum mt-1.5 h-11 w-full rounded-[12px] border border-input bg-background/60 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="text-xs font-semibold text-muted-foreground">
                    Delivery city
                  </label>
                  <input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-[12px] border border-input bg-background/60 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                </div>
              </div>
              <ButtonAnchor
                href={quoteHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="green"
                size="lg"
                className="mt-4 w-full"
              >
                <WhatsAppIcon /> Get this quoted on WhatsApp
              </ButtonAnchor>
              <p className="mt-3 text-xs text-muted-foreground">
                Reply usually within working hours, {siteConfig.hours}.
              </p>
            </Card>

            {item.description ? (
              <p className="mt-8 max-w-[64ch] text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            ) : null}

            {item.attributes?.length ? (
              <dl className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {item.attributes.map((a) => (
                  <div key={a.label} className="border-t border-border pt-3">
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{a.label}</dt>
                    <dd className="mt-1 text-sm font-medium">{a.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>

        {related.length ? (
          <div className="mt-24">
            <h2 className="text-xl font-bold">Similar listings</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
