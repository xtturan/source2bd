import type { ProductSummary } from "@/lib/products/types";
import { marketplaceLabels } from "@/lib/products/types";
import { bdtLabel } from "@/lib/products/pricing";
import { productQuote } from "@/lib/whatsapp";
import { productImage } from "@/lib/images";
import { WhatsAppIcon } from "./button";
import { useLang } from "@/lib/i18n";

/**
 * Price honesty: the number shown is the marketplace price only.
 * The label says so in Bangla so nobody reads it as the door price in Bangladesh.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const { t } = useLang();
  const price = bdtLabel(product.priceMin, product.priceMax, product.currency, t("দাম জিজ্ঞেস করুন", "Ask for price"));

  return (
    <article className="panel matte group flex flex-col overflow-hidden rounded-[18px]">
      <div className="relative block aspect-square overflow-hidden bg-stone-1">
        {product.imageUrl ? (
          <img
            src={productImage(product.imageUrl)}
            referrerPolicy="no-referrer"
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
        <span className="font-bn absolute left-2 top-2 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-bold text-background">
          {t("চীনের দাম", "China price")} · {marketplaceLabels[product.marketplace]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug">{product.title}</p>

        <div>
          <div className="tnum text-lg font-extrabold leading-tight tracking-tight">{price}</div>
          <p className="font-bn mt-0.5 text-[12px] font-semibold leading-snug text-muted-foreground">
            {t("এটা দোকানের দাম · বাসায় আনার খরচ আলাদা", "Seller price only, delivery to Bangladesh is extra")}
          </p>
        </div>

        <a
          href={productQuote({
            title: product.title,
            productUrl: product.productUrl,
            marketplace: marketplaceLabels[product.marketplace],
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[14px] bg-wa px-3 text-wa-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.24)] transition-transform duration-150 active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          <span className="font-bn text-[15px] font-bold leading-tight">
            {t("বাংলাদেশের দাম জানুন", "Get the Bangladesh price")}
          </span>
        </a>
      </div>
    </article>
  );
}
