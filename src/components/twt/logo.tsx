import { cn } from "@/lib/utils";

export function TwtLogo({
  className,
  invert = false,
  showWordmark = true,
}: {
  className?: string;
  invert?: boolean;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 48 48"
        width="38"
        height="38"
        role="img"
        aria-label="TWT International mark"
        className="shrink-0"
      >
        <circle cx="24" cy="24" r="24" fill="#0A2540" />
        <circle cx="24" cy="24" r="14.5" fill="none" stroke="#1FA64A" strokeWidth="2" />
        <ellipse
          cx="24"
          cy="24"
          rx="6.5"
          ry="14.5"
          fill="none"
          stroke="#1FA64A"
          strokeWidth="1.5"
          opacity="0.65"
        />
        <path d="M9.5 24h29" stroke="#1FA64A" strokeWidth="1.5" opacity="0.65" />
        <path
          d="M13 31c7.5 1.5 14-2.5 17-9.5 1 8-4 15-11.5 15.5-2.5.2-4.5-2.5-5.5-6z"
          fill="#1FA64A"
        />
        <path d="M31 12.5 18 27.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {showWordmark ? (
        <span className="leading-none">
          <span
            className={cn(
              "block font-display text-[17px] font-extrabold tracking-tight",
              invert ? "text-white" : "text-navy",
            )}
          >
            TWT International
          </span>
          <span
            className={cn(
              "mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em]",
              invert ? "text-white/50" : "text-steel",
            )}
          >
            China → Bangladesh cargo
          </span>
        </span>
      ) : null}
    </span>
  );
}