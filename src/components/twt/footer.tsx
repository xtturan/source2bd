import { Link } from "@tanstack/react-router";
import { MapPin, Clock, Phone, MessageCircle } from "lucide-react";
import { services, siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { TwtLogo } from "./logo";
import { Container } from "./primitives";

const company = [
  { to: "/about", label: "About TWT" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/track", label: "Track a shipment" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
] as const;

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <TwtLogo invert />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            A China → Bangladesh cargo desk and buying agent for importers who want straight
            answers, not a rate card full of asterisks.
          </p>
          <p className="font-bn mt-3 text-sm text-white/50">
            লিংক পাঠান · হোয়াটসঅ্যাপে কোট নিন
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.key}>
                <Link
                  to="/services"
                  hash={s.key}
                  className="text-white/75 transition-colors hover:text-green"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {company.map((c) => (
              <li key={c.to}>
                <Link to={c.to} className="text-white/75 transition-colors hover:text-green">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
            Talk to us
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-green" />
              <span>{siteConfig.officeLine2}</span>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-green" />
              <span>{siteConfig.hours}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-green" />
              <a href={telLink} className="font-semibold text-white hover:text-green">
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-green" />
              <a
                href={generalInquiry()}
                target="_blank"
                rel="noreferrer noopener"
                className="font-semibold text-white hover:text-green"
              >
                WhatsApp us
              </a>
            </li>
          </ul>
          <div className="mt-6 h-24 overflow-hidden rounded-xl border border-white/10 bg-navy-700 grid-lines">
            <div className="flex h-full items-center justify-center text-xs text-white/50">
              Chawkbazar, Dhaka — map
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Legal goods only — we do not handle
            prohibited, counterfeit or restricted items.
          </p>
          <p>
            1688 and Alibaba are third-party marketplace names used for reference only. TWT
            International is not affiliated with Alibaba Group.
          </p>
        </Container>
      </div>

      <div className="h-16 md:hidden" />
    </footer>
  );
}