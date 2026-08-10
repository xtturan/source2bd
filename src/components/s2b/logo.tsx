import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Source2BD mark: navy rounded square, green "S2" monogram. Two flat brand
 * colours, no gradients, no imagery — identical to public/favicon.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cn("h-9 w-9 shrink-0", className)} role="img" aria-label="Source2BD">
      <rect width="512" height="512" rx="112" fill="#0A2540" />
      <g
        fill="none"
        stroke="#1FA64A"
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M212 198c0-28-26-44-58-44s-56 18-56 44c0 54 114 42 114 100 0 28-26 46-58 46-28 0-50-12-58-32" />
        <path d="M290 200c0-30 24-46 54-46 32 0 54 20 54 48 0 52-94 84-108 142h112" />
      </g>
    </svg>
  );
}

/** Mark + wordmark + parent-company line, used in the header and footer. */
export function Logo({
  className,
  compact = false,
  parentLine = true,
}: {
  className?: string;
  compact?: boolean;
  parentLine?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[18px] font-extrabold tracking-[-0.045em]">
            Source<span className="text-primary">2</span>BD
          </span>
          {parentLine ? (
            <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              by {siteConfig.parent}
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}
