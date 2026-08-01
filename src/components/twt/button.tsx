import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "signal" | "navy" | "green" | "ghost" | "outline" | "white";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  signal:
    "bg-signal text-white shadow-[var(--shadow-lift)] ring-1 ring-inset ring-white/15 hover:bg-signal-600 hover:-translate-y-0.5",
  navy: "bg-navy text-white ring-1 ring-inset ring-white/10 hover:bg-navy-700 hover:-translate-y-0.5",
  green: "bg-green text-white ring-1 ring-inset ring-white/15 hover:bg-green-600 hover:-translate-y-0.5",
  outline:
    "border border-navy/12 bg-white/55 text-navy backdrop-blur-md hover:border-navy/25 hover:bg-white/80",
  white:
    "bg-white/85 text-navy backdrop-blur-md ring-1 ring-inset ring-white/40 hover:bg-white hover:-translate-y-0.5",
  ghost: "text-navy hover:bg-navy/6",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(
  variant: ButtonVariant = "signal",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "signal",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "signal",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function ExternalButton({
  variant = "signal",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<"a"> & { variant?: ButtonVariant; size?: ButtonSize; children: ReactNode }) {
  return (
    <a
      className={buttonClass(variant, size, className)}
      target="_blank"
      rel="noreferrer noopener"
      {...props}
    >
      {children}
    </a>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy">{label}</span>
      {hint ? <span className="ml-2 text-xs text-steel">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
      {error ? <span className="mt-1 block text-xs font-medium text-signal">{error}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-navy placeholder:text-steel/60 focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(inputClass, "appearance-none pr-10", className)} {...props} />;
}