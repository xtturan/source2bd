import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Plane,
  Ship,
  Package,
  Warehouse,
  ShoppingBag,
  Briefcase,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";
import { Container, Section, SectionHeading, Badge, Card } from "@/components/s2b/primitives";
import { ExternalButton, LinkButton } from "@/components/s2b/button";
import { ProductCard } from "@/components/s2b/product-card";
import { siteConfig, services, type ServiceKey } from "@/config/site";
import { generalInquiry } from "@/lib/whatsapp";
import { featuredProducts } from "@/lib/products/mock-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TWT International — China to Bangladesh cargo & sourcing" },
      {
        name: "description",
        content:
          "Air, sea, courier and hand carry cargo from China to Bangladesh, plus 1688 and Alibaba buying agent support. WhatsApp quotes from our Chawkbazar desk.",
      },
      {
        property: "og:title",
        content: "TWT International — China to Bangladesh cargo & sourcing",
      },
      {
        property: "og:description",
        content:
          "Freight, consolidation and sourcing from Guangzhou, Yiwu and Shenzhen to Dhaka and Chattogram.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const serviceIcons: Record<ServiceKey, typeof Plane> = {
  "hand-carry": Briefcase,
  "air-freight": Plane,
  "sea-freight": Ship,
  courier: Package,
  warehouse: Warehouse,
  "buying-agent": ShoppingBag,
};

function HomePage() {
  const featured = featuredProducts(8);

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden bg-navy text-white">
        <div className="grid-lines absolute inset-0 opacity-60" aria-hidden />
        <Container className="relative py-20 sm:py-28">
          <div className="max-w-3xl">
            <Badge tone="outline">
              <span className="size-1.5 rounded-full bg-green" /> Guangzhou · Yiwu · Shenzhen →
              Dhaka · Chattogram
            </Badge>
            <h1 className="mt-6 text-4xl font-bold leading-[1.03] sm:text-6xl">
              China to Bangladesh cargo, handled end to end.
            </h1>
            <p className="font-bn mt-4 text-lg text-white/70">
              চীন থেকে বাংলাদেশ · কার্গো ও সোর্সিং
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
              Air, sea, courier and hand carry lanes plus a real buying agent for 1688 and Alibaba.
              You send the link or the carton list — we come back on WhatsApp with a straight
              answer on mode, timing and what documents you need.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ExternalButton href={generalInquiry()} size="lg">
                <MessageCircle className="size-5" /> WhatsApp {siteConfig.phoneDisplay}
              </ExternalButton>
              <LinkButton to="/sourcing" variant="white" size="lg">
                Try the sourcing tool <ArrowRight className="size-4" />
              </LinkButton>
            </div>
            <div className="mt-10 grid gap-4 text-sm text-white/65 sm:grid-cols-3">
              <p className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-green" /> Legal goods only, always
              </p>
              <p className="flex items-center gap-2">
                <Clock className="size-4 text-green" /> {siteConfig.hours}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-green" /> {siteConfig.office}
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Services */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="What we move"
            title="Six lanes, one WhatsApp thread"
            titleBn="ছয়টি সার্ভিস · এক জায়গায়"
            intro="Pick the mode that matches your cargo. Not sure? Send weight and carton size and we'll tell you which lane is actually cheaper."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = serviceIcons[service.key];
              return (
                <Card key={service.key} className="lift flex flex-col p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-navy">{service.title}</h3>
                  <p className="font-bn text-sm text-steel">{service.titleBn}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">{service.short}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-green">
                    {service.eta}
                  </p>
                  <Link
                    to="/services"
                    hash={service.key}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-green"
                  >
                    Details <ArrowRight className="size-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Sourcing teaser */}
      <Section tone="charcoal">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              invert
              eyebrow="Buying agent"
              title="Found it on 1688 but can't read the page?"
              titleBn="লিংক পাঠান · আমরা বাকিটা দেখছি"
              intro="Paste the link into our sourcing tool. We read the Chinese listing, confirm MOQ and tier pricing with the supplier, and reply with a realistic Bangladesh-landed path — freight mode, rough timing and the documents you'll need."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/sourcing" size="lg">
                Open sourcing tool
              </LinkButton>
              <ExternalButton href={generalInquiry()} variant="outline" size="lg">
                <MessageCircle className="size-5" /> Send a link on WhatsApp
              </ExternalButton>
            </div>
          </div>
          <ul className="space-y-4">
            {[
              "Search by English keyword — we handle the Chinese side",
              "Paste any 1688 or Alibaba product URL",
              "MOQ and quantity tiers confirmed with the supplier",
              "Consolidate five suppliers into one freight bill",
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/80"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-green" />
                {line}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Featured products */}
      <Section tone="muted">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Demo catalogue"
              title="Products people ask us about"
              intro="Sample listings from the Chinese wholesale market. Prices are marketplace CNY only — your BD figure comes after we price the freight."
            />
            <LinkButton to="/sourcing" variant="outline">
              Browse all <ArrowRight className="size-4" />
            </LinkButton>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Four steps, no guesswork"
            titleBn="চারটি ধাপ"
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                t: "Send the details",
                d: "Link, photo or carton list on WhatsApp. Quantity and delivery city help us answer faster.",
              },
              {
                t: "We quote the path",
                d: "Mode, rough transit window, what documents apply. No hidden line items sprung later.",
              },
              {
                t: "Buy & consolidate",
                d: "Goods land at our China warehouse. We check counts, repack and combine suppliers.",
              },
              {
                t: "Delivered in BD",
                d: "Clearance handled, then delivery to your Dhaka or Chattogram address.",
              },
            ].map((step, i) => (
              <li key={step.t} className="border-t-2 border-green pt-5">
                <span className="font-display text-sm font-bold text-green">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-bold text-navy">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{step.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <LinkButton to="/how-it-works" variant="outline">
              Read the full process <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section tone="navy" className="py-20">
        <Container className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Tell us what you're shipping.</h2>
            <p className="font-bn mt-2 text-white/70">আজই মেসেজ দিন</p>
            <p className="mt-3 max-w-xl text-white/70">
              {siteConfig.office} · {siteConfig.hours}. We only handle legal, permitted goods.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ExternalButton href={generalInquiry()} size="lg">
              <MessageCircle className="size-5" /> WhatsApp us
            </ExternalButton>
            <LinkButton to="/quote" variant="white" size="lg">
              Request a quote
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}