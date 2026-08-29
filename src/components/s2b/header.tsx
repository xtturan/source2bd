import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { Container } from "./primitives";
import { WhatsAppIcon } from "./button";
import { siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/session";
import { QuotaChip } from "./quota-bar";

/** Minimal header: logo, nav, language, WhatsApp, phone. Nothing else competes. */
const navLinks = [
  { to: "/sourcing", bn: "খুঁজুন", en: "Find" },
  { to: "/catalog", bn: "ক্যাটালগ", en: "Catalogue" },
  { to: "/guides", bn: "গাইড", en: "Guides" },
  { to: "/track", bn: "অর্ডার স্ট্যাটাস", en: "Order status" },
] as const;

export function Header() {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useSession();

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
      <Container className="flex h-16 items-center gap-2 sm:gap-3">
        <Link
          to="/"
          className="mr-auto rounded-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t("হোম", "Home")}
        >
          <Logo />
        </Link>

        <nav aria-label={t("প্রধান মেনু", "Main menu")} className="mr-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="font-bn flex min-h-[44px] items-center rounded-full px-4 text-[15px] font-bold text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground [&.active]:text-accent"
                >
                  {t(l.bn, l.en)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className="flex h-11 items-center rounded-full bg-foreground/[0.06] p-1 text-sm font-bold"
          role="group"
          aria-label={t("ভাষা", "Language")}
        >
          {(["bn", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={cn(
                "h-9 rounded-full px-3 transition-colors",
                l === "bn" ? "font-bn" : "",
                lang === l ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              {l === "bn" ? "বাংলা" : "EN"}
            </button>
          ))}
        </div>

        <QuotaChip />

        <Link
          to={user ? "/account" : "/auth"}
          aria-label={user ? t("আমার অ্যাকাউন্ট", "My account") : t("লগইন", "Log in")}
          className="font-bn grid h-12 min-w-12 place-items-center rounded-full border border-foreground/12 px-3 text-[14px] font-bold text-foreground"
        >
          {user ? (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          ) : (
            t("লগইন", "Log in")
          )}
        </Link>

        <a
          href={generalInquiry()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("হোয়াটসঅ্যাপে লিখুন", "Message on WhatsApp")}
          className="grid h-12 w-12 place-items-center rounded-full bg-wa text-wa-foreground shadow-[var(--shadow-1)]"
        >
          <WhatsAppIcon className="h-6 w-6" />
        </a>

        <a
          href={telLink}
          aria-label={`${t("ফোন করুন", "Call")} ${siteConfig.phoneDisplay}`}
          className="grid h-12 w-12 place-items-center rounded-full bg-foreground text-background shadow-[var(--shadow-1)]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6.5 3.5h3l1.4 3.6-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
          </svg>
        </a>
      </Container>
    </header>
  );
}
