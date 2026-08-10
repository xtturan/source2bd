import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  // Gutters grow with the viewport instead of jumping at one breakpoint.
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-[clamp(1rem,4vw,2.5rem)]", className)}
      {...props}
    />
  );
}

export function Section({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-[clamp(3rem,7vw,6.5rem)]", className)} {...props} />;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent",
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-accent" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  titleBn,
  intro,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  titleBn?: string;
  intro?: ReactNode;
  className?: string;
  /** Use "h1" when this heading is the page's single main heading. */
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Tag className="mt-4 text-[clamp(1.6rem,4.4vw,2.6rem)] font-extrabold leading-[1.08]">
        {title}
      </Tag>
      {titleBn ? <p className="font-bn mt-2 text-base text-muted-foreground">{titleBn}</p> : null}
      {intro ? (
        <p className="mt-4 max-w-[62ch] text-[clamp(0.95rem,1.4vw,1.125rem)] leading-relaxed text-muted-foreground">
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
  tone?: "neutral" | "green" | "signal" | "outline";
}) {
  const tones = {
    neutral: "bg-foreground/[0.05] text-muted-foreground ring-1 ring-inset ring-border",
    green: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/25",
    signal: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/25",
    outline: "ring-1 ring-inset ring-border text-foreground/80",
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
  return <div className={cn("panel matte rounded-[18px]", className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[12px] bg-foreground/[0.07]", className)} />;
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
    <div className="matte rounded-[18px] border border-dashed border-border px-6 py-14 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  // Values are sometimes a short fact rather than a number; keep both readable.
  const long = value.length > 12;
  return (
    <div className="panel matte rounded-[18px] px-4 py-5 sm:px-5 sm:py-6">
      <div
        className={
          long
            ? "text-[clamp(0.95rem,1.6vw,1.15rem)] font-extrabold leading-snug tracking-tight"
            : "tnum text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-tight"
        }
      >
        {value}
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug">{label}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}
