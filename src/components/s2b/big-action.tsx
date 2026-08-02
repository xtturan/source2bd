import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Low literacy first tiles. A large picture icon carries the meaning,
 * the Bangla line is the primary label and the English line is support.
 * Everything is at least 88px tall so it is easy to hit with a thumb.
 */

const tile =
  "group flex min-h-[92px] w-full items-center gap-3 rounded-[18px] p-4 sm:gap-4 text-left transition-transform duration-150 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-5";

const tones = {
  accent: "bg-accent text-accent-foreground shadow-[var(--shadow-2)]",
  ink: "bg-foreground text-background shadow-[var(--shadow-2)]",
  paper: "panel matte hover:-translate-y-0.5",
} as const;

export type BigActionTone = keyof typeof tones;

function Body({
  icon,
  bn,
  en,
  tone,
}: {
  icon: ReactNode;
  bn: string;
  en: string;
  tone: BigActionTone;
}) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-[16px] sm:h-14 sm:w-14 lg:h-16 lg:w-16",
          tone === "paper" ? "bg-accent/12 text-accent" : "bg-white/15",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="font-bn block text-[clamp(1.05rem,1.5vw,1.35rem)] font-bold leading-tight">{bn}</span>
        <span
          className={cn(
            "mt-0.5 block text-[13px] font-medium leading-snug",
            tone === "paper" ? "text-muted-foreground" : "opacity-80",
          )}
        >
          {en}
        </span>
      </span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="ml-auto hidden h-6 w-6 shrink-0 opacity-50 sm:block transition-transform duration-150 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </>
  );
}

export function BigActionLink({
  icon,
  bn,
  en,
  tone = "paper",
  className,
  ...props
}: { icon: ReactNode; bn: string; en: string; tone?: BigActionTone } & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(tile, tones[tone], className)} aria-label={en} {...props}>
      <Body icon={icon} bn={bn} en={en} tone={tone} />
    </Link>
  );
}

export function BigActionAnchor({
  icon,
  bn,
  en,
  tone = "paper",
  className,
  ...props
}: { icon: ReactNode; bn: string; en: string; tone?: BigActionTone } & ComponentProps<"a">) {
  return (
    <a className={cn(tile, tones[tone], className)} aria-label={en} {...props}>
      <Body icon={icon} bn={bn} en={en} tone={tone} />
    </a>
  );
}

export function BigActionButton({
  icon,
  bn,
  en,
  tone = "paper",
  className,
  ...props
}: { icon: ReactNode; bn: string; en: string; tone?: BigActionTone } & ComponentProps<"button">) {
  return (
    <button type="button" className={cn(tile, tones[tone], className)} aria-label={en} {...props}>
      <Body icon={icon} bn={bn} en={en} tone={tone} />
    </button>
  );
}

/** Simple stroke pictograms, drawn large so meaning reads without text. */
const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconSearch({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </svg>
  );
}

export function IconCamera({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.2-2h8.2l1.2 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.6" />
    </svg>
  );
}

export function IconLink({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.5 7" />
      <path d="M14 10a4 4 0 0 0-5.7 0L5.5 12.8a4 4 0 0 0 5.7 5.7L12.5 17" />
    </svg>
  );
}

export function IconBox({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <path d="M3.5 7.8 12 3.5l8.5 4.3v8.4L12 20.5l-8.5-4.3z" />
      <path d="M3.5 7.8 12 12.2l8.5-4.4M12 12.2v8.3" />
    </svg>
  );
}

export function IconPhone({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <path d="M6.5 3.5h3l1.4 3.6-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
    </svg>
  );
}

export function IconHome({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M6 10v9.5h12V10" />
    </svg>
  );
}

export function IconTruck({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <path d="M2.5 7h11v9h-11z" />
      <path d="M13.5 10.5H17l3.5 3v2.5h-7z" />
      <circle cx="6.5" cy="18" r="1.8" />
      <circle cx="16.5" cy="18" r="1.8" />
    </svg>
  );
}

export function IconMic({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...strokeProps} aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
    </svg>
  );
}