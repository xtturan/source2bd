import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Source2BD mark: navy rounded square with a geometric chamfered "S" and a
 * green corner cut. Three flat brand colours, no gradients, no imagery —
 * identical to public/favicon.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cn("h-9 w-9 shrink-0", className)} role="img" aria-label="Source2BD">
      <rect width="512" height="512" rx="112" fill="#0A2540" />
      <path fill="#FFFFFF" d="M184 130H272V192H212V225H362V348L328 382H150V320H300V287H150V164Z" />
      <path fill="#1FA64A" d="M272 130H322L362 170V192H272Z" />
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
