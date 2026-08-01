import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Container, Section, SectionHeading, Badge } from "@/components/twt/primitives";
import { ExternalButton } from "@/components/twt/button";
import { generalInquiry } from "@/lib/whatsapp";

const faqs = [
  {
    q: "How is air freight priced?",
    a: "On the higher of actual gross weight or volumetric weight. Light but bulky cargo is charged on volume, so send us carton dimensions along with the scale weight and we'll tell you which one applies before you commit.",
  },
  {
    q: "Is the CNY price on 1688 my final cost?",
    a: "No. That's the Chinese marketplace price only. Your landed Bangladesh cost adds freight, handling, duty and taxes, and local delivery. We quote those separately once weight, volume and mode are known.",
  },
  {
    q: "Can you buy from multiple suppliers for me?",
    a: "Yes. That's the point of our China warehouse. Your parcels arrive from different 1688 or Alibaba sellers, we verify counts, repack and consolidate them into one shipment so you pay one freight bill.",
  },
  {
    q: "How long does shipping actually take?",
    a: "Hand carry is typically 3–6 days, courier 5–10, air freight 7–12 door-to-door, and sea 25–45 days port-to-door. These are estimates based on normal conditions, not guarantees — flights, vessels and customs move on their own schedule.",
  },
  {
    q: "Who pays duty and taxes?",
    a: "The importer. Duty and VAT are assessed by Bangladesh customs based on the goods and their declared value. We never quote them as part of freight and we don't under-declare shipments.",
  },
  {
    q: "What goods will you not handle?",
    a: "Anything restricted, prohibited, counterfeit or otherwise illegal to import into Bangladesh. We move legal, permitted goods only — no exceptions, regardless of the margin involved.",
  },
  {
    q: "Do I need a BIN or trade licence?",
    a: "For personal-scale parcels, usually just your NID and phone number. For commercial consignments, customs will want a BIN and correct product descriptions. Tell us which you are up front so the paperwork matches.",
  },
  {
    q: "How do I start?",
    a: `Message our WhatsApp desk on 01752-457930 with the product link or carton list, quantity, and your delivery city. Most quotes are answered the same working day.`,
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "China to Bangladesh shipping FAQ — TWT International" },
      {
        name: "description",
        content:
          "Volumetric weight, landed cost, duty, transit times, consolidation and legal goods policy — common questions about importing from China to Bangladesh.",
      },
      { property: "og:title", content: "Shipping FAQ — TWT International" },
      {
        property: "og:description",
        content: "Straight answers on pricing, duty, timing and what we will not ship.",
      },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
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
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">FAQ</Badge>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            The questions importers actually ask us.
          </h1>
          <p className="font-bn mt-3 text-white/70">সাধারণ জিজ্ঞাসা</p>
        </Container>
      </div>

      <Section>
        <Container className="max-w-3xl">
          <div className="divide-y divide-navy/8 border-y border-navy/8">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-semibold text-navy">
                  {f.q}
                  <span className="text-2xl leading-none text-green transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-steel">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12">
            <SectionHeading
              title="Still stuck on something?"
              intro="Ask us directly — we answer most messages the same working day."
            />
            <div className="mt-6">
              <ExternalButton href={generalInquiry("a question from the FAQ page")} size="lg">
                <MessageCircle className="size-5" /> Ask on WhatsApp
              </ExternalButton>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}