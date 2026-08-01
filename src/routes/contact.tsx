import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Card } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the Source2BD desk in Dhaka" },
      {
        name: "description",
        content: `Reach Source2BD on WhatsApp at ${siteConfig.phoneDisplay}, call the same number, or visit the Chawkbazar office in Dhaka.`,
      },
      { property: "og:title", content: "Contact Source2BD" },
      { property: "og:description", content: "WhatsApp, phone and our Chawkbazar office in Dhaka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Section>
      <Container className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="One number, one desk, no call centre"
            titleBn="সরাসরি যোগাযোগ করুন"
            intro="WhatsApp is the fastest route. The same number handles quotes, order updates and complaints, so you never repeat your story to a second person."
          />

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={generalInquiry()} target="_blank" rel="noopener noreferrer" variant="green" size="lg">
              <WhatsAppIcon /> WhatsApp {siteConfig.phoneDisplay}
            </ButtonAnchor>
            <ButtonAnchor href={telLink} variant="glass" size="lg">
              Call {siteConfig.phoneDisplay}
            </ButtonAnchor>
          </div>

          <dl className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="border-t border-border pt-4">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Office</dt>
              <dd className="mt-1.5 text-sm font-medium">{siteConfig.officeLine2}</dd>
            </div>
            <div className="border-t border-border pt-4">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Desk hours</dt>
              <dd className="mt-1.5 text-sm font-medium">{siteConfig.hours}</dd>
            </div>
            <div className="border-t border-border pt-4">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Origins covered</dt>
              <dd className="mt-1.5 text-sm font-medium">{siteConfig.originCities.join(", ")}</dd>
            </div>
            <div className="border-t border-border pt-4">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Delivery hubs</dt>
              <dd className="mt-1.5 text-sm font-medium">{siteConfig.destinationCities.join(", ")}</dd>
            </div>
          </dl>
        </div>

        <Card className="h-fit p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Make the first message count
          </h2>
          <ul className="mt-5 space-y-4 text-sm text-muted-foreground">
            {[
              "Product link, photo or clear description",
              "Quantity you plan to order",
              "Delivery city in Bangladesh",
              "Any deadline you are working to",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <ButtonLink to="/quote" variant="glass" className="mt-6 w-full">
            Use the quote form instead
          </ButtonLink>
        </Card>
      </Container>
    </Section>
  );
}
