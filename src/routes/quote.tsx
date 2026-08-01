import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container, Section, SectionHeading, Card } from "@/components/s2b/primitives";
import { ButtonAnchor, WhatsAppIcon } from "@/components/s2b/button";
import { services, siteConfig } from "@/config/site";
import { serviceQuote } from "@/lib/whatsapp";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "Get a cargo and sourcing quote | Source2BD" },
      {
        name: "description",
        content:
          "Tell us the lane, the weight or volume and your delivery city. The form builds a complete WhatsApp message so our desk can price it in one reply.",
      },
      { property: "og:title", content: "Get a Source2BD quote" },
      {
        property: "og:description",
        content: "Build a complete quote request in under a minute and send it straight to WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuotePage,
});

const inputClass =
  "mt-1.5 h-11 w-full rounded-[12px] border border-input bg-background/60 px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent";

function QuotePage() {
  const [mode, setMode] = useState(services[0]!.title);
  const [weight, setWeight] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const href = serviceQuote({ mode, weight, city, notes });

  return (
    <Section>
      <Container className="grid gap-12 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <SectionHeading
            eyebrow="Quote request"
            title="Give us four details and we can price it"
            titleBn="চারটি তথ্য দিলেই কোট পাবেন"
            intro="Nothing is stored on a server here. The form assembles a message and hands it to WhatsApp, so you keep the record in your own chat."
          />

          <form className="mt-10 grid gap-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="mode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Service
              </label>
              <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)} className={inputClass}>
                {services.map((s) => (
                  <option key={s.key} value={s.title} className="bg-background">
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="weight" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Approx weight or volume
                </label>
                <input
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="45 kg, or 0.8 CBM"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery city in Bangladesh
                </label>
                <input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dhaka"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                What are you shipping
              </label>
              <textarea
                id="notes"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Product links, carton count, target date, anything else that helps"
                className="mt-1.5 w-full rounded-[12px] border border-input bg-background/60 p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>

            <ButtonAnchor href={href} target="_blank" rel="noopener noreferrer" variant="green" size="lg">
              <WhatsAppIcon /> Send this to WhatsApp
            </ButtonAnchor>
          </form>
        </div>

        <Card className="h-fit p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
            What we send back
          </h2>
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            {[
              "Supplier or retail cost, with tier pricing where it applies",
              "Freight by the lane that suits your volume, not the one we prefer",
              "A duty exposure indication so the landed number is not a surprise",
              "A realistic transit window, stated as an estimate",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-border pt-5 text-xs text-muted-foreground">
            Desk hours {siteConfig.hours}. Messages outside those hours are answered the next working
            morning.
          </p>
        </Card>
      </Container>
    </Section>
  );
}
