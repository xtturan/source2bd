import { Link } from "@tanstack/react-router";
import type { ProductSummary } from "@/lib/products/types";
import { marketplaceLabels } from "@/lib/products/types";
import { bdtLabel } from "@/lib/products/pricing";
import { productQuote } from "@/lib/whatsapp";
import { productImage } from "@/lib/images";
import { Badge } from "./primitives";
import { WhatsAppIcon } from "./button";

function priceLabel(p: ProductSummary) {
  return bdtLabel(p.priceMin, p.priceMax, p.currency);
}

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="panel matte lift group flex flex-col overflow-hidden rounded-[18px]">
      <Link
        to="/product/$marketplace/$id"
        params={{ marketplace: product.marketplace, id: product.id }}
        className="relative block aspect-square overflow-hidden bg-stone-1"
      >
        {product.imageUrl ? (
          <img
            src={productImage(product.imageUrl)}
            referrerPolicy="no-referrer"
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.04]"
          />
        ) : null}
        <span className="absolute left-3 top-3">
          <Badge tone="outline" className="bg-paper/80 backdrop-blur-md">
            {marketplaceLabels[product.marketplace]}
          </Badge>
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          to="/product/$marketplace/$id"
          params={{ marketplace: product.marketplace, id: product.id }}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-accent"
        >
          {product.title}
        </Link>

        <div className="tnum text-lg font-extrabold tracking-tight">{priceLabel(product)}</div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {product.moq ? <span>MOQ {product.moq}</span> : null}
          {product.city ? <span>{product.city}</span> : null}
          {product.ordersHint ? <span>{product.ordersHint}</span> : null}
        </div>

        <a
          href={productQuote({
            title: product.title,
            productUrl: product.productUrl,
            priceMin: product.priceMin,
            priceMax: product.priceMax,
            moq: product.moq,
            currency: product.currency,
            marketplace: marketplaceLabels[product.marketplace],
          })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ask the price on WhatsApp"
          className="mt-auto inline-flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[14px] bg-accent px-3 py-2 text-accent-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.24)] transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <span className="font-bn flex items-center gap-2 text-base font-bold leading-none">
            <WhatsAppIcon className="h-5 w-5" />
            দাম জানুন
          </span>
          <span className="text-[11px] font-semibold opacity-85">Ask price on WhatsApp</span>
        </a>
      </div>
    </article>
  );
}
