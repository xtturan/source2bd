import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Search } from "lucide-react";
import { generalInquiry, telLink } from "@/lib/whatsapp";

export function MobileDock() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-navy/8 bg-white/70 backdrop-blur-xl backdrop-saturate-150 md:hidden">
      <div className="grid grid-cols-3">
        <a
          href={telLink}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-navy"
        >
          <Phone className="size-5" />
          Call
        </a>
        <a
          href={generalInquiry()}
          target="_blank"
          rel="noreferrer noopener"
          className="flex flex-col items-center gap-1 bg-signal py-2.5 text-[11px] font-semibold text-white"
        >
          <MessageCircle className="size-5" />
          WhatsApp
        </a>
        <Link
          to="/sourcing"
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-navy"
        >
          <Search className="size-5" />
          Sourcing
        </Link>
      </div>
    </div>
  );
}

export function WhatsAppFloat() {
  return (
    <a
      href={generalInquiry()}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 hidden size-14 items-center justify-center rounded-full bg-green text-white ring-1 ring-inset ring-white/20 shadow-[var(--shadow-lift-lg)] transition-transform duration-150 hover:-translate-y-0.5 md:inline-flex"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}