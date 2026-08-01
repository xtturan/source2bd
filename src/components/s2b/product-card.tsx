import { Link } from "@tanstack/react-router";
import type { ProductSummary } from "@/lib/products/types";
import { currencySymbol, marketplaceLabels } from "@/lib/products/types";
import { productQuote } from "@/lib/whatsapp";
import { Badge } from "./primitives";
import { WhatsAppIcon } from "./button";

function priceLabel(p: ProductSummary) {
  const sym = currencySymbol(p.currency);
  if (p.priceMin == null) return "Ask for price";
  if (p.priceMax != null && p.priceMax !== p.priceMin)
    return `${sym}${p.priceMin} to ${sym}${p.priceMax}`;
  return `${sym}${p.priceMin}`;
}

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="glass matte lift group flex flex-col overflow-hidden rounded-[15px]">
      <Link
        to="/product/$marketplace/$id"
        params={{ marketplace: product.marketplace, id: product.id }}
        className="relative block aspect-square overflow-hidden bg-foreground/5"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.04]"
          />
        ) : null}
        <span className="absolute left-3 top-3">
          <Badge tone="outline" className="bg-background/70 backdrop-blur-md">
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
          className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-[11px] bg-accent text-sm font-semibold text-accent-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.28)] transition-transform duration-150 hover:-translate-y-0.5"
        >
          <WhatsAppIcon />
          Quote on WhatsApp
        </a>
      </div>
    </article>
  );
}
