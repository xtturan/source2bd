import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Card, Badge } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import { services, siteConfig } from "@/config/site";
import { serviceQuote } from "@/lib/whatsapp";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Freight and sourcing services into Bangladesh | Source2BD" },
      {
        name: "description",
        content:
          "Air freight, sea freight, hand carry, courier, warehouse consolidation and sourcing agent work into Dhaka and Chattogram, priced per order.",
      },
      { property: "og:title", content: "Source2BD services" },
      {
        property: "og:description",
        content: "Six lanes into Bangladesh: air, sea, hand carry, courier, consolidation and sourcing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Services"
          title="Every lane we run, with the honest transit window"
          titleBn="আমাদের সব সার্ভিস ও সময়সীমা"
          intro="No lane is best for everything. Read what each one is for, what we need from you, and what it realistically takes."
        />

        <div className="mt-14 space-y-6">
          {services.map((s) => (
            <Card key={s.key} id={s.key} className="scroll-mt-24 p-6 sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr]">
                <div>
                  <h2 className="text-2xl font-extrabold">{s.title}</h2>
                  <p className="font-bn mt-1 text-sm text-muted-foreground">{s.titleBn}</p>
                  <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-muted-foreground">
                    {s.short}
                  </p>
                  <Badge tone="green" className="mt-5">
                    {s.eta}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Use it when
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                    {s.whenToUse.map((i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Have this ready
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                    {s.prepare.map((i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
                        {i}
                      </li>
                    ))}
                  </ul>
                  <ButtonAnchor
                    href={serviceQuote({ mode: s.title })}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="green"
                    className="mt-6 w-full"
                  >
                    <WhatsAppIcon /> Quote {s.title.toLowerCase()}
                  </ButtonAnchor>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-10 p-6 text-sm text-muted-foreground">
          {siteConfig.policy} Transit windows are estimates based on normal conditions and are not a
          guarantee. Duty and clearance charges are set by Bangladesh Customs, not by us.
        </Card>

        <div className="mt-10">
          <ButtonLink to="/quote" size="lg">
            Get a written quote
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
