import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * TWT mark: a green globe with a leaf stroke, feeding a delivery node.
 * The parent company line rides under the wordmark so the brand chain is
 * visible on every page without a second logo.
 */
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
      <svg viewBox="0 0 32 32" className="h-9 w-9 shrink-0" aria-hidden>
        <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="9" fill="#0a2540" />
        <circle cx="15" cy="16" r="8" fill="none" stroke="#1fa64a" strokeWidth="2.2" />
        <path d="M7 16h16" stroke="#1fa64a" strokeWidth="1.6" opacity="0.7" />
        <path d="M15 8c3.6 3.6 3.6 12.4 0 16-3.6-3.6-3.6-12.4 0-16z" fill="none" stroke="#1fa64a" strokeWidth="1.6" opacity="0.7" />
        <circle cx="24" cy="23" r="3.2" fill="#1fa64a" />
      </svg>
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[17px] font-extrabold tracking-[-0.04em]">
            Source<span className="text-accent">2</span>BD
          </span>
          {parentLine ? (
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              by {siteConfig.parent}
            </span>
          ) : null}
        </span>
      )}
    </span>
  );
}
