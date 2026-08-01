import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section, SectionHeading, Card } from "@/components/s2b/primitives";
import { ButtonAnchor, WhatsAppIcon } from "@/components/s2b/button";
import { trackingInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track your shipment | Source2BD" },
      {
        name: "description",
        content:
          "Send your Source2BD shipment code and our desk replies with the current leg, location and expected delivery window in Bangladesh.",
      },
      { property: "og:title", content: "Track a Source2BD shipment" },
      { property: "og:description", content: "Send your shipment code and get a live status from the desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

const legs = [
  { label: "Supplier pickup", body: "Goods collected and received at our origin warehouse." },
  { label: "Consolidation", body: "Counted, repacked and merged with your other cartons." },
  { label: "In transit", body: "Booked on the air, sea or courier lane with a reference number." },
  { label: "Customs", body: "Documentation submitted, duty assessed and settled." },
  { label: "Last mile", body: "Out for delivery in Dhaka or Chattogram, or ready for pickup." },
];

function TrackPage() {
  const [code, setCode] = useState("");

  return (
    <Section>
      <Container className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="Tracking"
            title="Shipment updates come from a person, not a dead portal"
            titleBn="শিপমেন্ট আপডেট জানুন"
            intro="We do not pretend to run a live carrier API. Send the code and the person handling your cargo answers with where it actually is."
          />

          <form className="mt-10 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="code" className="sr-only">
              Shipment code
            </label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="S2B-2026-00123"
              className="tnum h-12 flex-1 rounded-[11px] border border-input bg-background/60 px-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
            />
            <ButtonAnchor
              href={trackingInquiry(code || "not sure of my code")}
              target="_blank"
              rel="noopener noreferrer"
              variant="green"
              size="lg"
            >
              <WhatsAppIcon /> Check status
            </ButtonAnchor>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            Do not have a code? Send the supplier name or the date you paid, that is usually enough.
          </p>
        </div>

        <Card className="h-fit p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
            The five legs we report on
          </h2>
          <ol className="mt-5 space-y-5">
            {legs.map((l, i) => (
              <li key={l.label} className="flex gap-4">
                <span className="tnum mt-0.5 text-xs font-bold text-signal">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-sm font-semibold">{l.label}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{l.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-border pt-5 text-xs text-muted-foreground">
            Desk hours {siteConfig.hours}.
          </p>
        </Card>
      </Container>
    </Section>
  );
}
