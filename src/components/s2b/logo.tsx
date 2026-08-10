import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Source2BD "bridge seal": navy tile, green ring (the global market) sitting
 * on a single green bar (the Bangladesh delivery line). Flat, two shapes,
 * two brand colours, so it survives down to 16px in a browser tab.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={cn("h-9 w-9 shrink-0", className)} role="img" aria-label="Source2BD">
      <rect width="512" height="512" rx="112" fill="#0A2540" />
      <circle cx="256" cy="206" r="118" fill="none" stroke="#1FA64A" strokeWidth="52" />
      <rect x="98" y="382" width="316" height="50" rx="25" fill="#1FA64A" />
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
