import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Container, Section, SectionHeading, Badge, Card } from "@/components/twt/primitives";
import { ExternalButton, LinkButton } from "@/components/twt/button";
import { generalInquiry } from "@/lib/whatsapp";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How our China to Bangladesh shipping works — TWT International" },
      {
        name: "description",
        content:
          "From WhatsApp enquiry to Dhaka delivery: sourcing, China warehouse consolidation, freight mode selection, customs documents and last-mile delivery explained.",
      },
      { property: "og:title", content: "How it works — TWT International" },
      {
        property: "og:description",
        content: "The full China → Bangladesh process, step by step, with no surprise line items.",
      },
      { property: "og:url", content: "/how-it-works" },
    ],
    links: [{ rel: "canonical", href: "/how-it-works" }],
  }),
  component: HowItWorksPage,
});

const steps = [
  {
    t: "You send the enquiry",
    bn: "আপনি মেসেজ দেন",
    d: "A 1688 link, a product photo, or a carton list on WhatsApp. Tell us quantity and your delivery city — those two things decide most of the answer.",
    detail: ["Product link or clear photo", "Target quantity", "Dhaka / Chattogram / other city"],
  },
  {
    t: "We confirm with the supplier",
    bn: "সাপ্লায়ারের সাথে যাচাই",
    d: "For sourcing jobs we read the Chinese listing, verify the MOQ and quantity tiers, and check the supplier actually has stock before you pay anything.",
    detail: ["MOQ and tier pricing", "Stock and lead time", "Alternative suppliers if better"],
  },
  {
    t: "Freight mode and quote",
    bn: "মোড ও কোট",
    d: "Air is priced on the higher of actual or volumetric weight; sea is priced on CBM. We tell you which one is cheaper for your specific cartons instead of defaulting to one.",
    detail: ["Actual vs volumetric weight", "Rough transit window", "Applicable documents"],
  },
  {
    t: "China warehouse & consolidation",
    bn: "কনসোলিডেশন",
    d: "Your parcels arrive at our China warehouse. We check counts against your list, repack weak cartons and combine multiple suppliers into one shipment.",
    detail: ["Count verification", "Repack and reinforce", "One freight bill, not five"],
  },
  {
    t: "Shipping and clearance",
    bn: "শিপিং ও ক্লিয়ারেন্স",
    d: "Cargo moves on the agreed lane. Documentation is prepared for Bangladesh customs — commercial consignments need consignee details and correct product descriptions.",
    detail: ["Correct product description", "Consignee NID / BIN if commercial", "Duty is separate from freight"],
  },
  {
    t: "Delivery in Bangladesh",
    bn: "বাংলাদেশে ডেলিভারি",
    d: "Once cleared, goods move to your address or you collect from our Chawkbazar office. You get an update at each handover, not silence.",
    detail: ["Door delivery or office pickup", "Handover updates", "Support after arrival"],
  },
];

function HowItWorksPage() {
  return (
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">Process</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            From a WhatsApp message to a delivered carton.
          </h1>
          <p className="font-bn mt-3 text-white/70">কীভাবে কাজ করে</p>
        </Container>
      </div>

      <Section>
        <Container>
          <ol className="space-y-6">
            {steps.map((s, i) => (
              <li key={s.t}>
                <Card className="grid gap-6 p-6 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,260px)]">
                  <span className="font-display text-3xl font-bold text-green/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-navy">{s.t}</h2>
                    <p className="font-bn text-sm text-steel">{s.bn}</p>
                    <p className="mt-3 text-sm leading-relaxed text-steel">{s.d}</p>
                  </div>
                  <ul className="space-y-2 rounded-xl bg-[#f6f8fa] p-4 text-sm text-navy">
                    {s.detail.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-green" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="muted" className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Honesty first"
            title="What we will not promise"
            intro="Transit windows are estimates, not guarantees — flights, vessels and customs move on their own schedule. Duty and taxes are set by Bangladesh customs, not by us. And we only handle legal, permitted goods: no restricted, counterfeit or prohibited items, whatever the offer."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ExternalButton href={generalInquiry()} size="lg">
              <MessageCircle className="size-5" /> Start on WhatsApp
            </ExternalButton>
            <LinkButton to="/quote" variant="outline" size="lg">
              Build a quote request
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}