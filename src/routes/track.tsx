import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Search } from "lucide-react";
import { Container, Section, Badge, Card } from "@/components/twt/primitives";
import { ExternalButton, Input } from "@/components/twt/button";
import { trackingInquiry } from "@/lib/whatsapp";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track your China to Bangladesh shipment — TWT International" },
      {
        name: "description",
        content:
          "Enter your TWT booking or tracking reference and we'll check the status on WhatsApp — warehouse receipt, departure, arrival and clearance.",
      },
      { property: "og:title", content: "Track a shipment — TWT International" },
      {
        property: "og:description",
        content: "Send your reference and get a live status update from our team.",
      },
      { property: "og:url", content: "/track" },
    ],
    links: [{ rel: "canonical", href: "/track" }],
  }),
  component: TrackPage,
});

const stages = [
  { t: "Booked", d: "We've confirmed the mode, quantity and destination with you." },
  { t: "Received in China", d: "Cartons arrived at our warehouse and counts were checked." },
  { t: "Consolidated & departed", d: "Repacked, loaded and on the agreed air or sea lane." },
  { t: "Arrived in Bangladesh", d: "Landed at DAC or Chattogram, awaiting clearance." },
  { t: "Cleared & delivering", d: "Customs done, moving to your address or office pickup." },
];

function TrackPage() {
  const [ref, setRef] = useState("");
  const clean = ref.trim().slice(0, 40);

  return (
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">Tracking</Badge>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Where is my cargo right now?
          </h1>
          <p className="font-bn mt-3 text-white/70">শিপমেন্ট ট্র্যাক করুন</p>
        </Container>
      </div>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <p className="text-[15px] leading-relaxed text-steel">
              We don't run an automated portal — a real person checks your consignment against the
              warehouse and carrier records. Send your reference and we'll reply with the current
              stage and what happens next.
            </p>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                window.open(trackingInquiry(clean), "_blank", "noopener,noreferrer");
              }}
            >
              <Input
                value={ref}
                maxLength={40}
                onChange={(e) => setRef(e.target.value)}
                placeholder="Booking / tracking reference"
                aria-label="Tracking reference"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-signal px-6 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-signal-600"
              >
                <Search className="size-4" /> Check status
              </button>
            </form>
            <p className="mt-3 text-xs text-steel">
              No reference yet? Send the supplier tracking number instead — we can usually match it.
            </p>
            <div className="mt-6">
              <ExternalButton href={trackingInquiry("")} variant="outline">
                <MessageCircle className="size-4" /> Ask without a reference
              </ExternalButton>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-steel">
              Shipment stages
            </h2>
            <ol className="mt-5 space-y-5">
              {stages.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-navy">{s.t}</p>
                    <p className="mt-1 text-sm text-steel">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </Container>
      </Section>
    </>
  );
}