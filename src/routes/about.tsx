import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Card, Stat } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry } from "@/lib/whatsapp";
import { siteConfig, trustStats } from "@/config/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Source2BD, a Dhaka sourcing and cargo desk" },
      {
        name: "description",
        content:
          "Source2BD runs sourcing and freight from one desk in Chawkbazar, Dhaka, covering China, Amazon and global marketplaces for Bangladeshi buyers.",
      },
      { property: "og:title", content: "About Source2BD" },
      { property: "og:description", content: "A Dhaka desk covering sourcing and freight end to end." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Source2BD · a TWT International product"
          title="Built for importers who are tired of guessing"
          titleBn="আমাদের সম্পর্কে"
          intro="Source2BD is the customer-facing sourcing and cargo service of TWT International, a trading and freight house based in Chawkbazar, Dhaka. Most Bangladeshi buyers use one agent for sourcing, another for freight and a third for clearance. Every handover is a place where the price grows and the timeline slips. We keep all three on one desk."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold">Source2BD</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The buyer-facing side. Search 1688, Alibaba and Amazon in plain Bangla, send a photo,
              a name or a link, and get one full Bangladesh door price: product, service fee,
              freight, and duty explained. You pay only after you accept the quote.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-bold">TWT International</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The parent company. Import and export trading, supplier payment support in China,
              air, sea, hand carry and courier freight, C&amp;F and customs coordination with
              licensed agents, warehouse consolidation with QC photos, and door delivery in
              Bangladesh.
            </p>
          </Card>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustStats.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} sub={s.sub} />
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              t: "Multi origin by default",
              b: "China for factory pricing, Amazon for brand items and spares, global stores for everything else. We compare rather than push one lane.",
            },
            {
              t: "Priced in the open",
              b: "Product cost, service fee and freight are three separate numbers. You can check the supplier price yourself on the original listing.",
            },
            {
              t: "Legal cargo only",
              b: `${siteConfig.policy} We would rather lose an order than lose your shipment at the port.`,
            },
          ].map((c) => (
            <Card key={c.t} className="p-6">
              <h2 className="text-lg font-bold">{c.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.b}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-8">
          <h2 className="text-2xl font-extrabold">Where to find us</h2>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            {siteConfig.officeLine2}. Desk hours {siteConfig.hours}. Walk in with a sample or a
            photo and we will price it while you are there.
          </p>
          {siteConfig.tradeLicense || siteConfig.binNumber ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.tradeLicense ? `Trade licence: ${siteConfig.tradeLicense}` : null}
              {siteConfig.tradeLicense && siteConfig.binNumber ? " · " : null}
              {siteConfig.binNumber ? `BIN: ${siteConfig.binNumber}` : null}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={generalInquiry()} target="_blank" rel="noopener noreferrer" variant="green" size="lg">
              <WhatsAppIcon /> Message the desk
            </ButtonAnchor>
            <ButtonLink to="/contact" variant="glass" size="lg">
              Contact details
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
