import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { Container } from "./primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "./button";
import { navLinks, siteConfig } from "@/config/site";
import { generalInquiry } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-200",
        scrolled ? "glass border-x-0 border-t-0 shadow-none" : "border-b border-transparent",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label={`${siteConfig.name} home`}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-[12px] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/6 hover:text-foreground [&.active]:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink to="/quote" variant="glass" size="sm">
            Get a quote
          </ButtonLink>
          <ButtonAnchor
            href={generalInquiry()}
            target="_blank"
            rel="noopener noreferrer"
            variant="green"
            size="sm"
          >
            <WhatsAppIcon />
            WhatsApp
          </ButtonAnchor>
        </div>

        <button
          type="button"
          className="glass flex h-10 w-10 items-center justify-center rounded-[12px] lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </Container>

      {open ? (
        <div className="glass border-x-0 lg:hidden">
          <Container className="grid gap-1 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-[12px] px-3 py-3 text-sm font-semibold text-muted-foreground hover:bg-foreground/6 hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <ButtonLink to="/quote" variant="signal" className="mt-2" onClick={() => setOpen(false)}>
              Get a quote
            </ButtonLink>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
