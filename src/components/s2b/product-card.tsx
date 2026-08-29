import { Link } from "@tanstack/react-router";
import type { ProductSummary } from "@/lib/products/types";
import { marketplaceLabels } from "@/lib/products/types";
import { marketLabel, bdtLabel } from "@/lib/products/pricing";
import { productQuote } from "@/lib/whatsapp";
import { productImage } from "@/lib/images";
import { cleanTitle, isProhibitedTitle } from "@/lib/products/title";
import { WhatsAppIcon } from "./button";
import { CheckGlyph } from "./glyphs";
import { useLang } from "@/lib/i18n";

/**
 * Price honesty: the number shown is the supplier price abroad, in its own
 * currency, plus an approximate taka figure. The Bangladesh total is quoted
 * only on WhatsApp. The whole card is a link to the detail page; the green
 * button sits above it so it stays a separate tap target.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const { t } = useLang();
  const taka = bdtLabel(product.priceMin, product.priceMax, product.currency, t("দাম জানতে চাপুন", "Ask for price"));
  const market = product.priceMin != null ? marketLabel(product.priceMin, product.priceMax, product.currency) : null;
  const title = cleanTitle(product.title);

  // Legal goods only: listings that advertise themselves as copies never show.
  if (isProhibitedTitle(product.title)) return null;

  return (
    <article className="panel matte group relative flex flex-col overflow-hidden rounded-[18px] transition-transform duration-150 focus-within:ring-2 focus-within:ring-accent active:scale-[0.995]">
      <div className="relative block aspect-square overflow-hidden bg-stone-1">
        {product.imageUrl ? (
          <img
            src={productImage(product.imageUrl)}
            referrerPolicy="no-referrer"
            alt={title}
            loading="lazy"
            decoding="async"
            width={480}
            height={480}
            className="h-full w-full object-cover"
          />
        ) : null}
        <span className="font-bn absolute left-2 top-2 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-bold text-background">
          {t("মার্কেট/সাপ্লায়ার দাম", "Supplier price")} · {marketplaceLabels[product.marketplace]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link
          to="/product/$marketplace/$id"
          params={{ marketplace: product.marketplace, id: product.id }}
          className="line-clamp-2 break-words text-[15px] font-semibold leading-snug outline-none after:absolute after:inset-0 after:content-['']"
        >
          {title}
        </Link>

        <div>
          <div className="tnum text-[22px] font-black text-accent leading-tight tracking-tight">
            {product.priceMin != null ? <span className="font-bn text-[13px] font-bold text-muted-foreground">{t("আনুমানিক", "approx.")} </span> : null}
            "৳" + {taka}
          </div>
          {market ? (
            <p className="font-bn tnum text-[12px] font-semibold text-muted-foreground">
              {t("মার্কেট দাম", "Market price")} {market}
            </p>
          ) : null}
          <p className="font-bn mt-0.5 text-[12px] font-semibold leading-snug text-foreground/70">
            {t(
              "বাংলাদেশে পৌঁছানোর পুরো দাম আলাদা — শিপিংসহ জানতে চাপুন",
              "Bangladesh total is separate — tap for the shipping-inclusive price",
            )}
          </p>
        </div>

        <span className="font-bn text-[13px] font-bold text-accent underline underline-offset-2">
          {t("বিস্তারিত দেখুন", "See details")}
        </span>

        <a
          href={productQuote({
            title: product.title,
            productUrl: product.productUrl,
            marketplace: marketplaceLabels[product.marketplace],
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-auto flex min-h-[64px] flex-col items-center justify-center rounded-[14px] bg-[#25D366] hover:bg-[#20ba5a] px-2 text-wa-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.24)] transition-transform duration-150 active:scale-[0.98]"
        >
          <span className="font-bn flex items-center gap-2 text-[14px] font-bold leading-tight">
            <WhatsAppIcon className="h-5 w-5" />
            {t("বাংলাদেশ পর্যন্ত পুরো দাম জানুন", "Get the full Bangladesh price")}
          </span>
          <span className="font-bn text-[11px] font-semibold opacity-90">
            {t("শিপিং চার্জসহ · WhatsApp-এ", "Shipping included · on WhatsApp")}
          </span>
        </a>
      </div>
    </article>
  );
}

