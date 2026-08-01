import { cn } from "@/lib/utils";

/** Geometric mark: two stacked lanes converging into a Bangladesh delivery node. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect x="0.6" y="0.6" width="30.8" height="30.8" rx="9" fill="#17171a" />
        <path d="M6 11h11.5a5 5 0 0 1 0 10H6" stroke="#fcfbf9" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M6 21h6" stroke="#fcfbf9" strokeWidth="2.4" strokeLinecap="round" opacity="0.45" />
        <circle cx="23.5" cy="21" r="3" fill="#d9541f" />
      </svg>
      {compact ? null : (
        <span className="font-display text-[17px] font-extrabold tracking-[-0.04em]">
          Source<span className="text-accent">2</span>BD
        </span>
      )}
    </span>
  );
}
