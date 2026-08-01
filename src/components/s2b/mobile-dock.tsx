import { Link } from "@tanstack/react-router";
import { generalInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "./button";

// Bangla is the primary label, English sits underneath, icons carry the meaning.
const items = [
  { to: "/", bn: "হোম", en: "Home", icon: "M3 11.5 12 4l9 7.5M6 10v9h12v-9" },
  { to: "/sourcing", bn: "খুঁজুন", en: "Search", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4" },
  { to: "/services", bn: "সার্ভিস", en: "Services", icon: "M3 8h13l5 4-5 4H3z" },
  {
    to: "/track",
    bn: "ট্র্যাক",
    en: "Track",
    icon: "M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  },
] as const;

export function MobileDock() {
  return (
    <>
      <a
        href={generalInquiry()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-3),inset_0_1px_0_rgb(255_255_255/0.3)] transition-transform duration-150 hover:-translate-y-0.5 lg:bottom-8 lg:right-8"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      <nav
        className="glass fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Quick"
      >
        <div className="grid grid-cols-5">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              aria-label={i.en}
              className="flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 py-2 text-muted-foreground [&.active]:text-accent"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d={i.icon} />
              </svg>
              <span className="font-bn text-[12px] font-bold leading-none">{i.bn}</span>
            </Link>
          ))}
          <a
            href={`tel:${siteConfig.phoneTel}`}
            aria-label={`Call ${siteConfig.phoneDisplay}`}
            className="flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 py-2 text-accent"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6.5 3.5h3l1.4 3.6-2 1.4a12 12 0 0 0 5.6 5.6l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
            </svg>
            <span className="font-bn text-[12px] font-bold leading-none">ফোন</span>
          </a>
        </div>
      </nav>
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  );
}
