import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { ProductCard } from "@/components/s2b/product-card";
import { productById } from "@/lib/products/queries.functions";
import type { Marketplace, ProductDetail } from "@/lib/products/types";
import { isMarketplace, marketplaceLabels } from "@/lib/products/types";
import { marketLabel, bdtLabel, formatMarket, toBdt, formatBdt } from "@/lib/products/pricing";
import { generalInquiry, productQuote, telLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { productImage } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type LoaderData = { item: ProductDetail | null; marketplace: Marketplace; id: string };

export const Route = createFileRoute("/product/$marketplace/$id")({
  loader: async ({ params }): Promise<LoaderData> => {
    const marketplace: Marketplace = isMarketplace(params.marketplace) ? params.marketplace : "1688";
    try {
      const item = await productById({ data: { id: params.id, marketplace } });
      return { item: item ?? null, marketplace, id: params.id };
    } catch {
      return { item: null, marketplace, id: params.id };
    }
  },
  head: ({ loaderData }) => {
    const title = loaderData?.item?.title ?? "পণ্যের বিস্তারিত";
    const desc =
      "মার্কেটের দাম দেখুন, তারপর WhatsApp-এ বাংলাদেশ পর্যন্ত পুরো দাম (শিপিং চার্জসহ) জেনে নিন।";
    return {
      meta: [
        { title: `${title.slice(0, 58)} | Source2BD` },
        { name: "description", content: desc },
        { property: "og:title", content: title.slice(0, 70) },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { item, marketplace, id } = Route.useLoaderData();
  const { t } = useLang();
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const title = item?.title ?? t("পণ্যটি এখন দেখা যাচ্ছে না", "This product is not loading right now");
  const url = item?.productUrl ?? "";
  const images = item?.images?.length ? item.images : item?.imageUrl ? [item.imageUrl] : [];

  const waHref = item
    ? productQuote({
        title: item.title,
        productUrl: item.productUrl,
        priceMin: item.priceMin,
        priceMax: item.priceMax,
        qty,
        currency: item.currency,
        marketplace: marketplaceLabels[item.marketplace],
      })
    : generalInquiry(`${marketplaceLabels[marketplace]} · ${id}`);

  const description = (item?.description ?? "").replace(/\s+/g, " ").trim();
  const short = description.length > 260 && !expanded ? `${description.slice(0, 260)}…` : description;

  return (
    <Section className="py-5">
      <Container>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="font-bn -ml-1 flex min-h-[48px] items-center gap-2 px-1 text-[16px] font-bold text-muted-foreground"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
          {t("ফলাফলে ফিরে যান", "Back to results")}
        </button>

        <div className="mt-3 grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* gallery */}
          <div>
            <div className="glass matte overflow-hidden rounded-[18px] bg-stone-1">
              {images.length ? (
                <img
                  src={productImage(images[active] ?? images[0]!)}
                  referrerPolicy="no-referrer"
                  alt={title}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="aspect-square w-full" aria-hidden />
              )}
            </div>
            {images.length > 1 ? (
              <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1">
                {images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={t(`ছবি ${i + 1}`, `Image ${i + 1}`)}
                    className={cn(
                      "h-[68px] w-[68px] shrink-0 overflow-hidden rounded-[12px] border-2 transition-colors",
                      i === active ? "border-accent" : "border-transparent",
                    )}
                  >
                    <img src={productImage(src)} alt="" referrerPolicy="no-referrer" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <span className="font-bn inline-block rounded-full bg-foreground/85 px-3 py-1 text-[12px] font-bold text-background">
              {t("মার্কেট/সাপ্লায়ার দাম", "Supplier price")} · {marketplaceLabels[marketplace]}
            </span>

            <h1 className="font-bn mt-3 break-words text-[clamp(1.25rem,5vw,1.8rem)] font-extrabold leading-tight">
              {title}
            </h1>

            {/* price block */}
            <div className="panel matte mt-4 rounded-[18px] p-4">
              <p className="font-bn text-[14px] font-bold text-muted-foreground">
                {t("মার্কেট দাম", "Market price")}
              </p>
              <p className="tnum mt-1 text-[clamp(1.5rem,6vw,2rem)] font-extrabold leading-none">
                {marketLabel(item?.priceMin, item?.priceMax, item?.currency ?? "CNY", t("দাম জিজ্ঞেস করুন", "Ask for price"))}
              </p>
              {item?.priceMin != null ? (
                <p className="font-bn tnum mt-1 text-[15px] font-bold text-muted-foreground">
                  {t("আনুমানিক", "approx.")} {bdtLabel(item.priceMin, item.priceMax, item.currency)}
                </p>
              ) : null}
              <p className="font-bn mt-2 text-[15px] font-bold leading-snug">
                {t(
                  "এটা বিদেশের দোকানের দাম। বাংলাদেশে পৌঁছানোর পুরো দাম আলাদা — শিপিংসহ জানতে নিচে চাপুন।",
                  "This is the seller price abroad. The Bangladesh total is separate — tap below for the shipping-inclusive price.",
                )}
              </p>
            </div>

            {/* quantity */}
            <div className="mt-4 flex items-center gap-4">
              <span className="font-bn text-[16px] font-bold">{t("কয়টা লাগবে", "How many")}</span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t("কমান", "Decrease")}
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  className="h-14 w-14 rounded-full border border-foreground/15 bg-paper text-2xl font-bold"
                >
                  −
                </button>
                <input
                  aria-label={t("পরিমাণ", "Quantity")}
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))}
                  className="tnum h-14 w-20 rounded-[14px] border border-input bg-paper text-center text-lg font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <button
                  type="button"
                  aria-label={t("বাড়ান", "Increase")}
                  onClick={() => setQty((v) => v + 1)}
                  className="h-14 w-14 rounded-full border border-foreground/15 bg-paper text-2xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* attributes */}
            {item?.moq || item?.attributes?.length || item?.shopName ? (
              <dl className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {item?.moq ? (
                  <div className="border-t border-border pt-3">
                    <dt className="font-bn text-[13px] font-bold text-muted-foreground">
                      {t("কমপক্ষে কয়টা কিনতে হয়", "Minimum order")}
                    </dt>
                    <dd className="tnum mt-1 text-[15px] font-bold">{item.moq}</dd>
                  </div>
                ) : null}
                {item?.shopName ? (
                  <div className="border-t border-border pt-3">
                    <dt className="font-bn text-[13px] font-bold text-muted-foreground">{t("দোকান", "Shop")}</dt>
                    <dd className="mt-1 break-words text-[15px] font-medium">{item.shopName}</dd>
                  </div>
                ) : null}
                {(item?.attributes ?? []).slice(0, 8).map((a) => (
                  <div key={a.label} className="border-t border-border pt-3">
                    <dt className="font-bn text-[13px] font-bold text-muted-foreground">{a.label}</dt>
                    <dd className="mt-1 break-words text-[15px] font-medium">{a.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {/* tiers */}
            {item?.priceTiers?.length ? (
              <div className="mt-6">
                <p className="font-bn text-[16px] font-bold">
                  {t("বেশি নিলে দাম কম", "Cheaper when you buy more")}
                </p>
                <table className="mt-2 w-full text-[15px]">
                  <tbody className="tnum">
                    {item.priceTiers.map((tier) => (
                      <tr key={tier.minQty} className="border-t border-border">
                        <td className="py-2.5">{tier.minQty}+</td>
                        <td className="py-2.5 text-right font-bold">
                          {formatMarket(tier.price, item.currency)}{" "}
                          <span className="font-bn text-[13px] font-semibold text-muted-foreground">
                            ({t("আনুমানিক", "approx.")} {formatBdt(toBdt(tier.price, item.currency))})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {/* description */}
            {description ? (
              <div className="mt-6">
                <p className="font-bn text-[16px] font-bold">{t("পণ্যের কথা", "About this item")}</p>
                <p className="mt-2 max-w-[64ch] break-words text-[15px] leading-relaxed text-muted-foreground">
                  {short}
                </p>
                {description.length > 260 ? (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="font-bn mt-2 min-h-[48px] text-[15px] font-bold text-accent underline"
                  >
                    {expanded ? t("কম দেখুন", "Show less") : t("আরও পড়ুন", "Read more")}
                  </button>
                ) : null}
              </div>
            ) : (
              <ul className="font-bn mt-6 space-y-1.5 text-[15px] font-semibold text-muted-foreground">
                <li>• {t("বিদেশ থেকে আনা হবে", "Brought in from abroad")}</li>
                <li>• {t("আমরা কিনে বাংলাদেশে পৌঁছে দেব", "We buy it and deliver in Bangladesh")}</li>
                <li>• {t("দাম জানতে সবুজ বাটনে চাপুন", "Tap the green button for the price")}</li>
              </ul>
            )}

            {!item ? (
              <p className="font-bn mt-6 text-[16px] font-bold">
                {t(
                  "পণ্যের তথ্য আসেনি। WhatsApp-এ বললে আমরা খুঁজে দাম বলে দেব।",
                  "Product details did not load. Ask us on WhatsApp and we will find it.",
                )}
              </p>
            ) : null}

            {url ? (
              <p className="mt-4 break-all text-[12px] text-muted-foreground">{url}</p>
            ) : null}
          </div>
        </div>

        {/* space for the sticky bar + dock */}
        <div className="h-40 lg:h-24" aria-hidden />
      </Container>

      {/* sticky action bar */}
      <div className="fixed inset-x-0 bottom-[76px] z-30 lg:bottom-0">
        <div className="glass border-x-0 border-b-0 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-[900px] items-center gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[60px] flex-1 flex-col items-center justify-center rounded-full bg-wa px-3 text-wa-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.24)] transition-transform duration-150 active:scale-[0.98]"
            >
              <span className="font-bn flex items-center gap-2 text-[16px] font-bold leading-tight">
                <WhatsAppIcon className="h-5 w-5" />
                {t("বাংলাদেশ পর্যন্ত পুরো দাম জানুন", "Get the full Bangladesh price")}
              </span>
              <span className="font-bn text-[11px] font-semibold opacity-90">
                {t("শিপিং চার্জসহ · WhatsApp-এ", "Shipping included · on WhatsApp")}
              </span>
            </a>
            <a
              href={telLink}
              aria-label={`${t("ফোন করুন", "Call")} ${siteConfig.phoneDisplay}`}
              className="font-bn grid min-h-[60px] w-[76px] shrink-0 place-items-center rounded-full bg-foreground text-[15px] font-bold text-background"
            >
              {t("ফোন", "Call")}
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { ProductCard };
