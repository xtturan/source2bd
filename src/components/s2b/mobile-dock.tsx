import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { WhatsAppIcon } from "./button";
import { siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";

/**
 * Five jobs, always reachable with a thumb. Bangla labels, obvious selected state.
 */
const items = [
  { to: "/", bn: "হোম", en: "Home", icon: "M3 11.5 12 4l9 7.5M6 10v9h12v-9" },
  { to: "/sourcing", bn: "খুঁজুন", en: "Find", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4" },
  { to: "/catalog", bn: "ক্যাটালগ", en: "Catalogue", icon: "M4 5h7v6H4V5Zm9 0h7v6h-7V5ZM4 13h7v6H4v-6Zm9 0h7v6h-7v-6Z" },
  { to: "/quote", bn: "শিপিংসহ দাম", en: "Full price", icon: "M12 3v18M8 7.5h6.5a2.5 2.5 0 0 1 0 5h-5a2.5 2.5 0 0 0 0 5H16" },
  { to: "/more", bn: "আরও", en: "More", icon: "M5 12h.01M12 12h.01M19 12h.01" },
] as const;

export function MobileDock() {
  const { t } = useLang();
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {/* Always reachable: one tap to call, one tap to WhatsApp. */}
        <div className="grid grid-cols-2 gap-px bg-border">
          <a
            href={telLink}
            aria-label={`${t("কল", "Call")} ${siteConfig.phoneDisplay}`}
            className="font-bn flex min-h-[52px] items-center justify-center gap-2 bg-primary text-[16px] font-extrabold text-primary-foreground"
          >
            {t("কল", "Call")}
          </a>
          <a
            href={generalInquiry()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("হোয়াটসঅ্যাপ", "WhatsApp")}
            className="font-bn flex min-h-[52px] items-center justify-center gap-2 bg-wa text-[16px] font-extrabold text-wa-foreground"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {t("হোয়াটসঅ্যাপ", "WhatsApp")}
          </a>
        </div>
        <nav className="glass border-x-0 border-b-0" aria-label={t("প্রধান মেনু", "Main menu")}>
        <div className="grid grid-cols-5">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              activeOptions={{ exact: i.to === "/" }}
              aria-label={t(i.bn, i.en)}
              className="flex min-h-[66px] flex-col items-center justify-center gap-1 px-1 py-2 text-muted-foreground [&.active]:text-accent [&.active]:font-bold"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={i.icon} />
              </svg>
              <span className="font-bn text-[12px] font-bold leading-none">{t(i.bn, i.en)}</span>
            </Link>
          ))}
        </div>
        </nav>
      </div>
      <div className="h-[124px] lg:hidden" aria-hidden />
    </>
  );
}
