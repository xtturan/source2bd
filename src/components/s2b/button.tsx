import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "signal" | "green" | "clay" | "glass" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,box-shadow,border-color] duration-150 ease-[cubic-bezier(.2,.8,.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  signal:
    "bg-foreground text-background shadow-[var(--shadow-2)] hover:bg-ink-soft hover:-translate-y-0.5",
  green:
    "bg-wa text-wa-foreground shadow-[var(--shadow-2),inset_0_1px_0_rgb(255_255_255/0.24)] hover:bg-wa-600 hover:-translate-y-0.5",
  clay:
    "bg-accent text-accent-foreground shadow-[var(--shadow-2),inset_0_1px_0_rgb(255_255_255/0.24)] hover:bg-clay-600 hover:-translate-y-0.5",
  glass:
    "bg-paper text-foreground border border-foreground/12 shadow-[var(--shadow-1)] hover:-translate-y-0.5 hover:border-foreground/25",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
  xl: "h-16 px-8 text-lg",
};

type Common = { variant?: ButtonVariant; size?: ButtonSize; className?: string; children: ReactNode };

export function Button({
  variant = "signal",
  size = "md",
  className,
  ...props
}: Common & ComponentProps<"button">) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonLink({
  variant = "signal",
  size = "md",
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function ButtonAnchor({
  variant = "signal",
  size = "md",
  className,
  ...props
}: Common & ComponentProps<"a">) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("h-4 w-4", className)} aria-hidden>
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 4.99L2 22l5.2-1.36a9.9 9.9 0 0 0 4.84 1.24h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2Zm5.83 14.06c-.24.68-1.42 1.32-1.95 1.36-.5.05-.98.23-3.3-.69-2.78-1.1-4.54-3.94-4.68-4.12-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.28.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.23.55.78 1.9.85 2.04.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.28-.12.55.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.25.09 1.6.75 1.87.89.27.14.45.2.52.32.07.11.07.66-.17 1.31Z" />
    </svg>
  );
}
