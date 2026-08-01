import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, Badge } from "@/components/twt/primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & terms — TWT International" },
      {
        name: "description",
        content:
          "How TWT International handles the details you send us, what our quotes cover, and the limits on transit estimates, duty and prohibited goods.",
      },
      { property: "og:title", content: "Privacy & terms — TWT International" },
      {
        property: "og:description",
        content: "Data handling, quote scope, and our legal goods policy.",
      },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    t: "What this site collects",
    b: "Nothing is stored on this website. The quote and tracking forms simply pre-write a WhatsApp message on your device — you choose whether to send it. We hold no account, no visitor database and no payment details here.",
  },
  {
    t: "What you share on WhatsApp",
    b: "Once you message us, we keep the details needed to run your shipment: name, phone, delivery address, product descriptions, quantities and any documents you send. We use them to quote, ship and clear your cargo, and share them only with the carriers, warehouse staff and customs agents involved in that shipment.",
  },
  {
    t: "Product data on this site",
    b: "Listings shown in the sourcing tool are demonstration data representing typical Chinese wholesale products. Prices, MOQ and supplier names are illustrative. Always confirm live figures with us before ordering.",
  },
  {
    t: "Quotes and estimates",
    b: "Transit times are estimates based on normal conditions, not guarantees. Flights, vessels and customs inspections can shift schedules. Freight quotes are valid for the described cargo — if actual weight, volume or contents differ, the quote is recalculated.",
  },
  {
    t: "Duty and taxes",
    b: "Duty and VAT are assessed by Bangladesh customs based on the goods and their declared value. These are the importer's responsibility and are separate from our freight charges. We do not under-declare shipments.",
  },
  {
    t: "Prohibited goods",
    b: "We carry legal, permitted goods only. Restricted, prohibited, counterfeit or otherwise unlawful items are refused, and any such cargo discovered in a consignment is reported and surrendered to the relevant authority.",
  },
];

function PrivacyPage() {
  return (
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">Legal</Badge>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Privacy & terms
          </h1>
        </Container>
      </div>

      <Section>
        <Container className="max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s.t}>
              <h2 className="text-xl font-bold text-navy">{s.t}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-steel">{s.b}</p>
            </div>
          ))}
          <p className="border-t border-border pt-8 text-sm text-steel">
            Questions about any of this? Call {siteConfig.phoneDisplay} or visit{" "}
            {siteConfig.officeLine2}.
          </p>
        </Container>
      </Section>
    </>
  );
}