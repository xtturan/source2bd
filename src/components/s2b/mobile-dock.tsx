import { Link } from "@tanstack/react-router";
import { generalInquiry } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./button";

const items = [
  { to: "/", label: "Home", icon: "M3 11.5 12 4l9 7.5M6 10v9h12v-9" },
  { to: "/sourcing", label: "Source", icon: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4" },
  { to: "/services", label: "Services", icon: "M3 8h13l5 4-5 4H3z" },
  { to: "/track", label: "Track", icon: "M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" },
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
        <div className="grid grid-cols-4">
          {items.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="flex flex-col items-center gap-1 py-3 text-[11px] font-semibold text-muted-foreground [&.active]:text-accent"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={i.icon} />
              </svg>
              {i.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="h-16 lg:hidden" aria-hidden />
    </>
  );
}
