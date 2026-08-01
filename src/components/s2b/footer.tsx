import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { Container } from "./primitives";
import { siteConfig, services, navLinks } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-[#071526]/70">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
            {siteConfig.tagline}. China, Amazon and global marketplaces, quoted by a real desk in
            Dhaka.
          </p>
          <p className="font-bn mt-3 text-sm text-muted-foreground">{siteConfig.taglineBn}</p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.key}>
                <Link
                  to="/services"
                  hash={s.key}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <a href={generalInquiry()} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                WhatsApp {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={telLink} className="hover:text-foreground">
                Call {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>{siteConfig.office}</li>
            <li>{siteConfig.hours}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {new Date().getFullYear()} {siteConfig.legalName}. {siteConfig.policy}
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/faq" className="hover:text-foreground">
              FAQ
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
