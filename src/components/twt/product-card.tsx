import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { ProductSummary } from "@/lib/products/types";
import { productQuote } from "@/lib/whatsapp";
import { Badge } from "./primitives";

export function priceLabel(p: { priceMin?: number | undefined; priceMax?: number | undefined }) {
  if (p.priceMin == null) return "Price on request";
  if (p.priceMax != null && p.priceMax !== p.priceMin)
    return `¥${p.priceMin} – ¥${p.priceMax}`;
  return `¥${p.priceMin}`;
}

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="lift group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-lift)]">
      <Link
        to="/product/$source/$id"
        params={{ source: product.source, id: product.id }}
        className="relative block aspect-square overflow-hidden bg-[#f1f4f7]"
      >
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3">
          <Badge tone="navy">{product.source}</Badge>
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/product/$source/$id"
          params={{ source: product.source, id: product.id }}
          className="line-clamp-2 text-[15px] font-semibold leading-snug text-navy hover:text-green"
        >
          {product.title}
        </Link>
        {product.titleBn ? (
          <p className="font-bn mt-1 line-clamp-1 text-xs text-steel">{product.titleBn}</p>
        ) : null}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-navy">{priceLabel(product)}</span>
          <span className="text-xs text-steel">CNY</span>
        </div>
        <p className="mt-1 text-xs text-steel">
          MOQ {product.moq ?? "—"} · {product.shopName ?? "Verified supplier"}
          {product.city ? ` · ${product.city}` : ""}
        </p>

        <div className="mt-4 flex gap-2 pt-1">
          <Link
            to="/product/$source/$id"
            params={{ source: product.source, id: product.id }}
            className="flex-1 rounded-xl border border-navy/15 py-2.5 text-center text-sm font-semibold text-navy transition-colors hover:border-navy/40 hover:bg-[#f6f8fa]"
          >
            View
          </Link>
          <a
            href={productQuote({
              title: product.title,
              productUrl: product.productUrl,
              priceMin: product.priceMin,
              priceMax: product.priceMax,
              moq: product.moq,
            })}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-signal py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-600"
          >
            <MessageCircle className="size-4" />
            Quote
          </a>
        </div>
      </div>
    </article>
  );
}