import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...props} />;
}

export function Section({
  className,
  tone = "light",
  ...props
}: HTMLAttributes<HTMLElement> & { tone?: "light" | "muted" | "navy" | "charcoal" }) {
  const tones = {
    light: "text-navy",
    muted: "bg-mist/70 text-navy",
    navy: "bg-navy text-white",
    charcoal: "bg-charcoal text-white",
  } as const;
  return (
    <section className={cn("py-16 sm:py-24", tones[tone], className)} {...props} />
  );
}

export function Eyebrow({
  children,
  className,
  tone = "green",
}: {
  children: ReactNode;
  className?: string;
  tone?: "green" | "steel" | "white";
}) {
  const tones = {
    green: "text-green",
    steel: "text-steel",
    white: "text-white/60",
  } as const;
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  titleBn,
  intro,
  invert = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  titleBn?: string;
  intro?: ReactNode;
  invert?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow tone={invert ? "white" : "green"}>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          "mt-3 text-3xl font-bold leading-[1.08] sm:text-4xl lg:text-[2.75rem]",
          invert ? "text-white" : "text-navy",
        )}
      >
        {title}
      </h2>
      {titleBn ? (
        <p className={cn("font-bn mt-2 text-base", invert ? "text-white/70" : "text-steel")}>
          {titleBn}
        </p>
      ) : null}
      {intro ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            invert ? "text-white/70" : "text-steel",
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "green" | "navy" | "signal" | "outline";
}) {
  const tones = {
    neutral: "bg-navy/6 text-steel ring-1 ring-inset ring-navy/8",
    green: "bg-green/10 text-green-600 ring-1 ring-inset ring-green/15",
    navy: "bg-navy text-white",
    signal: "bg-signal/10 text-signal ring-1 ring-inset ring-signal/15",
    outline: "border border-white/15 text-white/80 backdrop-blur-sm",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass matte rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-navy/8", className)} />;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="matte rounded-2xl border border-dashed border-navy/12 bg-white/50 px-6 py-14 text-center backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-steel">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}