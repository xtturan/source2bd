import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { navLinks, siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { TwtLogo } from "./logo";
import { ExternalButton } from "./button";
import { Container } from "./primitives";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/85 backdrop-blur-md">
      <div className="hidden bg-navy py-1.5 text-white lg:block">
        <Container className="flex items-center justify-between text-xs">
          <p className="text-white/70">
            {siteConfig.office} · {siteConfig.hours}
          </p>
          <p className="flex items-center gap-4">
            <span className="text-white/70">Legal goods only</span>
            <a href={telLink} className="font-semibold text-white hover:text-green">
              {siteConfig.phoneDisplay}
            </a>
          </p>
        </Container>
      </div>

      <Container className="flex h-[68px] items-center justify-between gap-6">
        <Link to="/" aria-label="TWT International home">
          <TwtLogo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 text-[15px] font-medium text-steel transition-colors hover:bg-navy/5 hover:text-navy"
              activeProps={{ className: "text-navy font-semibold bg-navy/5" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={telLink}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-navy hover:bg-navy/5"
          >
            <Phone className="size-4" />
            {siteConfig.phoneDisplay}
          </a>
          <ExternalButton href={generalInquiry()} variant="signal" size="md">
            <MessageCircle className="size-4" />
            WhatsApp
          </ExternalButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-border text-navy lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-border bg-white lg:hidden">
          <Container className="flex flex-col py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-[15px] font-medium text-navy last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/quote"
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-semibold text-signal"
            >
              Get a quote
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}