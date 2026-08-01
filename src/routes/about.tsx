import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Container, Section, SectionHeading, Badge, Card } from "@/components/twt/primitives";
import { ExternalButton } from "@/components/twt/button";
import { siteConfig } from "@/config/site";
import { generalInquiry } from "@/lib/whatsapp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About TWT International — Dhaka cargo & sourcing desk" },
      {
        name: "description",
        content:
          "TWT International is a Chawkbazar-based China to Bangladesh freight and buying agent team moving cargo from Guangzhou, Yiwu and Shenzhen to Dhaka and Chattogram.",
      },
      { property: "og:title", content: "About TWT International" },
      {
        property: "og:description",
        content: "Who we are, how we work, and what we refuse to ship.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">About</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            A cargo desk that answers, not a call centre.
          </h1>
          <p className="font-bn mt-3 text-white/70">আমাদের সম্পর্কে</p>
        </Container>
      </div>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-[15px] leading-relaxed text-steel">
            <p>
              {siteConfig.name} moves goods from the Chinese wholesale markets into Bangladesh:
              Guangzhou, Yiwu and Shenzhen out; Dhaka and Chattogram in. We run air, sea, courier
              and hand carry lanes, hold and consolidate cargo at our China warehouse, and act as a
              buying agent for importers who can't read a 1688 listing.
            </p>
            <p>
              Most of our customers are small and mid-size traders who've been burned by vague
              quotes. So we do the boring things properly: tell you whether air or sea is actually
              cheaper for your cartons, verify counts before shipping, and separate freight from
              duty instead of hiding one inside the other.
            </p>
            <p>
              Everything runs through one WhatsApp thread from our {siteConfig.office}. You talk to
              the same people from quote to delivery.
            </p>
            <div className="pt-2">
              <ExternalButton href={generalInquiry()} size="lg">
                <MessageCircle className="size-5" /> Talk to us
              </ExternalButton>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { t: "Origin cities", d: siteConfig.originCities.join(" · ") },
              { t: "Destinations", d: siteConfig.destinationCities.join(" · ") },
              { t: "Office", d: siteConfig.officeLine2 },
              { t: "Hours", d: siteConfig.hours },
            ].map((s) => (
              <Card key={s.t} className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-green">{s.t}</p>
                <p className="mt-2 font-semibold text-navy">{s.d}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted" className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Our line in the sand"
            title="Legal goods only"
            intro="We do not move restricted, prohibited or counterfeit items, and we do not under-declare shipments to reduce duty. If a consignment can't be shipped honestly, we'd rather lose the job."
          />
        </Container>
      </Section>
    </>
  );
}