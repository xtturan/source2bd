import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Phone, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Container, Section, Badge, Card } from "@/components/s2b/primitives";
import { ExternalButton, LinkButton } from "@/components/s2b/button";
import { siteConfig } from "@/config/site";
import { generalInquiry } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact TWT International — Chawkbazar, Dhaka" },
      {
        name: "description",
        content:
          "Reach the TWT International cargo desk on WhatsApp 01752-457930 or visit our Chawkbazar office in Dhaka, open Saturday to Thursday.",
      },
      { property: "og:title", content: "Contact TWT International" },
      {
        property: "og:description",
        content: "WhatsApp 01752-457930 or visit our Chawkbazar office in Dhaka.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <div className="grid-lines bg-navy py-14 text-white">
        <Container>
          <Badge tone="outline">Contact</Badge>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl">
            Talk to the cargo desk.
          </h1>
          <p className="font-bn mt-3 text-white/70">যোগাযোগ করুন</p>
        </Container>
      </div>

      <Section>
        <Container className="grid gap-6 md:grid-cols-2">
          <Card className="p-7">
            <MessageCircle className="size-6 text-green" />
            <h2 className="mt-4 text-xl font-bold text-navy">WhatsApp — fastest</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              Send a product link, photo or carton list. Include quantity and delivery city and
              we'll usually reply the same working day.
            </p>
            <div className="mt-5">
              <ExternalButton href={generalInquiry()}>
                <MessageCircle className="size-4" /> {siteConfig.phoneDisplay}
              </ExternalButton>
            </div>
          </Card>

          <Card className="p-7">
            <Phone className="size-6 text-green" />
            <h2 className="mt-4 text-xl font-bold text-navy">Call us</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              Prefer to talk it through? Ring the same number during office hours.
            </p>
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className="mt-5 inline-flex h-11 items-center rounded-xl border border-navy/15 px-5 font-semibold text-navy hover:bg-white/80"
            >
              {siteConfig.phoneDisplay}
            </a>
          </Card>

          <Card className="p-7">
            <MapPin className="size-6 text-green" />
            <h2 className="mt-4 text-xl font-bold text-navy">Office</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">{siteConfig.officeLine2}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-steel">
              <Clock className="size-4 text-green" /> {siteConfig.hours}
            </p>
          </Card>

          <Card className="p-7">
            <ShieldCheck className="size-6 text-green" />
            <h2 className="mt-4 text-xl font-bold text-navy">Legal goods only</h2>
            <p className="mt-2 text-sm leading-relaxed text-steel">
              We handle permitted, legal cargo. We do not carry restricted, prohibited or
              counterfeit goods, and we do not under-declare shipments to reduce duty.
            </p>
            <div className="mt-5">
              <LinkButton to="/faq" variant="outline">
                Read the FAQ
              </LinkButton>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}