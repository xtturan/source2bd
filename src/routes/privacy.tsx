import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Card } from "@/components/s2b/primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy and data practices | Source2BD" },
      {
        name: "description",
        content:
          "What Source2BD collects, what stays in your own WhatsApp chat, and how shipment information is handled.",
      },
      { property: "og:title", content: "Source2BD privacy" },
      { property: "og:description", content: "How we handle your data, in plain language." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    t: "What this website stores",
    b: "Nothing. The quote, tracking and sourcing forms build a message in your browser and hand it to WhatsApp. There is no account, no database write and no marketing list on this site.",
  },
  {
    t: "What we hold once you become a customer",
    b: "The details needed to move your cargo: name, phone, delivery address, product descriptions, invoices and consignee identification where customs requires it.",
  },
  {
    t: "Who we share it with",
    b: "Only the parties that must have it to complete your shipment: suppliers, freight carriers, our clearing agent and Bangladesh Customs. We do not sell or rent data to anyone.",
  },
  {
    t: "How long we keep it",
    b: "Shipment and customs records are kept for the period required by Bangladeshi commercial and tax rules, then removed.",
  },
  {
    t: "Your requests",
    b: `Message ${siteConfig.phoneDisplay} on WhatsApp to ask what we hold about you, to correct it, or to ask for deletion where no legal retention rule applies.`,
  },
];

function PrivacyPage() {
  return (
    <Section>
      <Container>
        <SectionHeading eyebrow="Privacy" title="Short, because we collect very little" />
        <div className="mt-12 grid max-w-3xl gap-4">
          {sections.map((s) => (
            <Card key={s.t} className="p-6">
              <h2 className="text-base font-bold">{s.t}</h2>
              <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{s.b}</p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
