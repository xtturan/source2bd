import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Check, ClipboardList } from "lucide-react";
import { Container, Section, SectionHeading, Badge } from "@/components/twt/primitives";
import { ExternalButton } from "@/components/twt/button";
import { services } from "@/config/site";
import { serviceQuote, generalInquiry } from "@/lib/whatsapp";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Cargo services China to Bangladesh — TWT International" },
      {
        name: "description",
        content:
          "Hand carry, air freight, sea freight, courier, China warehouse consolidation and 1688 buying agent services for Bangladesh importers.",
      },
      { property: "og:title", content: "Cargo services — TWT International" },
      {
        property: "og:description",
        content: "Six China → Bangladesh lanes: hand carry, air, sea, courier, warehouse, sourcing.",
      },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">Services</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Pick the lane that fits your cargo, not the other way round.
          </h1>
          <p className="font-bn mt-3 text-white/70">আমাদের সার্ভিসসমূহ</p>
        </Container>
      </div>

      <Section>
        <Container className="space-y-16">
          {services.map((service, i) => (
            <div
              key={service.key}
              id={service.key}
              className="scroll-mt-24 grid gap-10 border-t border-border pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
            >
              <div>
                <span className="font-display text-sm font-bold text-green">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{service.title}</h2>
                <p className="font-bn mt-1 text-steel">{service.titleBn}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-steel">{service.short}</p>
                <p className="mt-5 inline-flex rounded-full bg-green/10 px-3 py-1.5 text-xs font-semibold text-green-600">
                  {service.eta}
                </p>
                <div className="mt-6">
                  <ExternalButton href={serviceQuote({ mode: service.title })}>
                    <MessageCircle className="size-4" /> Quote this service
                  </ExternalButton>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-steel">
                    When to use it
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {service.whenToUse.map((line) => (
                      <li key={line} className="flex gap-2.5 text-sm text-navy">
                        <Check className="mt-0.5 size-4 shrink-0 text-green" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-[#f8fafb] p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-steel">
                    What to prepare
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {service.prepare.map((line) => (
                      <li key={line} className="flex gap-2.5 text-sm text-navy">
                        <ClipboardList className="mt-0.5 size-4 shrink-0 text-navy/40" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </Container>
      </Section>

      <Section tone="muted" className="py-16">
        <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <SectionHeading
            title="Still not sure which mode is cheaper?"
            intro="Send weight and carton dimensions. We'll compare air against sea for your actual shipment before you commit."
          />
          <ExternalButton href={generalInquiry()} size="lg">
            <MessageCircle className="size-5" /> Ask on WhatsApp
          </ExternalButton>
        </Container>
      </Section>
    </>
  );
}