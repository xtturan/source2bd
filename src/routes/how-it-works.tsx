import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Card } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Source2BD sourcing and shipping works" },
      {
        name: "description",
        content:
          "From a pasted link to a delivered carton in Dhaka: verification, supplier payment, consolidation, freight, clearance and last mile, step by step.",
      },
      { property: "og:title", content: "How Source2BD works" },
      {
        property: "og:description",
        content: "The full path from a product link to a carton delivered in Bangladesh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const stages = [
  {
    n: "01",
    title: "You send the request",
    body: "A link, a keyword, a photo or a spec sheet. Anything that identifies the product. Tell us the quantity you are aiming for and the city it needs to reach.",
    bn: "লিংক, কীওয়ার্ড বা ছবি পাঠান",
  },
  {
    n: "02",
    title: "We verify the listing",
    body: "Our desk opens the original page, reads the Chinese or English detail, confirms MOQ and tier price with the supplier, and flags anything that looks like a reseller markup.",
    bn: "লিস্টিং যাচাই করা হয়",
  },
  {
    n: "03",
    title: "You get a landed estimate",
    body: "Product cost, our service fee, freight by lane, and an indication of duty exposure. If sea beats air for your volume, we say so even when air pays us more.",
    bn: "ল্যান্ডেড কোট পাবেন",
  },
  {
    n: "04",
    title: "Purchase and inbound",
    body: "You approve, we pay the supplier and receive at our China or US address. Cartons are counted and photographed before anything ships.",
    bn: "ক্রয় ও রিসিভ",
  },
  {
    n: "05",
    title: "Consolidation and freight",
    body: "Multiple suppliers become one shipment so you pay one freight bill. We book the lane and share tracking as it moves.",
    bn: "কনসলিডেশন ও শিপিং",
  },
  {
    n: "06",
    title: "Clearance and delivery",
    body: "Customs documentation, duty payment as agreed, then delivery to your address or pickup from our Chawkbazar office.",
    bn: "কাস্টমস ও ডেলিভারি",
  },
];

function HowItWorks() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Process"
          title="What actually happens after you press send"
          titleBn="লিংক পাঠানোর পর কী হয়"
          intro="Sourcing goes wrong in the gaps between people. We keep the whole chain on one desk so nothing is handed off and lost."
        />

        <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((s) => (
            <li key={s.n}>
              <Card className="h-full p-6">
                <span className="tnum text-xs font-bold tracking-widest text-signal">{s.n}</span>
                <h2 className="mt-3 text-lg font-bold leading-snug">{s.title}</h2>
                <p className="font-bn mt-1 text-sm text-muted-foreground">{s.bn}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </Card>
            </li>
          ))}
        </ol>

        <Card className="mt-12 p-8">
          <h2 className="text-2xl font-extrabold">What we will not do</h2>
          <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-muted-foreground">
            {siteConfig.policy} We will not undervalue an invoice, mislabel cargo, or move
            counterfeit branded goods. If an order needs that to work, it is not an order we can
            take, and we will tell you on day one rather than at the port.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={generalInquiry()} target="_blank" rel="noopener noreferrer" variant="green" size="lg">
              <WhatsAppIcon /> Ask a question
            </ButtonAnchor>
            <ButtonLink to="/sourcing" variant="glass" size="lg">
              Try the sourcing desk
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
