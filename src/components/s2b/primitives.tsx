import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)} {...props} />;
}

export function Section({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <section className={cn("py-20 sm:py-28", className)} {...props} />;
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
}: {
  eyebrow?: string;
  title: ReactNode;
  titleBn?: string;
  intro?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] sm:text-4xl lg:text-[2.6rem]">
        {title}
      </h2>
      {titleBn ? <p className="font-bn mt-2 text-base text-muted-foreground">{titleBn}</p> : null}
      {intro ? (
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
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
    neutral: "bg-foreground/6 text-muted-foreground ring-1 ring-inset ring-border",
    green: "bg-accent/12 text-accent ring-1 ring-inset ring-accent/25",
    signal: "bg-signal/14 text-[#ff6b81] ring-1 ring-inset ring-signal/30",
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
  return <div className={cn("glass matte rounded-[18px]", className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[12px] bg-foreground/8", className)} />;
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
  return (
    <div className="glass matte rounded-[18px] px-5 py-6">
      <div className="tnum text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-semibold">{label}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}
