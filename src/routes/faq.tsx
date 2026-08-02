import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Card } from "@/components/s2b/primitives";
import { ButtonAnchor, WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

const faqs = [
  {
    q: "Can you really source from outside China?",
    a: "Yes. China is the biggest lane because factory pricing wins on most categories, but we also buy from Amazon US and any store that will ship to a forwarding address. Send the link and we will tell you which origin lands cheaper.",
  },
  {
    q: "How do you charge?",
    a: "Product cost at what the supplier charges, a service fee on the purchase, and freight priced by lane. Nothing is hidden inside an inflated product price. You see the three numbers separately.",
  },
  {
    q: "Do you handle customs duty?",
    a: "We prepare the documentation and handle clearance. Duty is assessed by Bangladesh Customs on the declared value and HS code, so we give you an exposure estimate up front, never a promise to reduce it.",
  },
  {
    q: "What is the minimum order?",
    a: "There is no minimum on our side. Supplier MOQ still applies on 1688 and Alibaba, and we always confirm it before you commit. A single Amazon item is fine.",
  },
  {
    q: "How long does delivery take?",
    a: "Hand carry runs 3 to 6 days, air freight 7 to 12, courier 5 to 10 and sea 25 to 45. These are estimates under normal conditions, not guarantees.",
  },
  {
    q: "Is my payment protected?",
    a: "We pay the supplier only after you approve the quote, and we photograph carton counts on arrival at our warehouse before anything ships. Any shortfall is raised with the supplier while the goods are still in our hands.",
  },
  {
    q: "What will you not ship?",
    a: `${siteConfig.policy} That includes counterfeit branded goods, restricted chemicals, weapons parts and anything requiring a licence we do not hold.`,
  },
  {
    q: "Are the product listings on this site live?",
    a: "The catalogue runs on demo data by default so the site costs nothing to browse. Live marketplace lookup switches on behind the same interface when a provider key is configured.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Sourcing and cargo FAQ | Source2BD" },
      {
        name: "description",
        content:
          "Pricing, customs duty, minimum orders, transit times, payment protection and what we refuse to ship, answered plainly.",
      },
      { property: "og:title", content: "Source2BD FAQ" },
      { property: "og:description", content: "Straight answers on pricing, duty, MOQ and transit times." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="FAQ"
          title="The questions people ask before the first order"
          titleBn="সাধারণ জিজ্ঞাসা"
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {faqs.map((f) => (
            <Card key={f.q} className="p-6">
              <h2 className="text-base font-bold leading-snug">{f.q}</h2>
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10">
          <ButtonAnchor href={generalInquiry()} target="_blank" rel="noopener noreferrer" variant="green" size="lg">
            <WhatsAppIcon /> Ask something else
          </ButtonAnchor>
        </div>
      </Container>
    </Section>
  );
}
