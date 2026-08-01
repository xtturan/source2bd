import { cn } from "@/lib/utils";

/** Geometric mark: two stacked lanes converging into a Bangladesh delivery node. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8.5" fill="#0a2540" stroke="rgb(148 163 184 / 0.28)" strokeWidth="1.5" />
        <path d="M6 11h11.5a5 5 0 0 1 0 10H6" stroke="#f6f7f9" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M6 21h6" stroke="#1fa64a" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="23.5" cy="21" r="3" fill="#c41e3a" />
      </svg>
      {compact ? null : (
        <span className="font-display text-[17px] font-extrabold tracking-tight">
          Source<span className="text-accent">2</span>BD
        </span>
      )}
    </span>
  );
}
