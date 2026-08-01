import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Badge, Card, Stat, Eyebrow } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import { ProductCard } from "@/components/s2b/product-card";
import { featuredProducts } from "@/lib/products/mock-provider";
import { origins, services, siteConfig, trustStats } from "@/config/site";
import { generalInquiry } from "@/lib/whatsapp";
import heroCargo from "@/assets/hero-cargo.jpg";
import deskQuote from "@/assets/desk-quote.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Source2BD, source from anywhere and land it in Bangladesh" },
      {
        name: "description",
        content:
          "Source2BD sources from 1688, Alibaba, Amazon and any global store, then moves it to Dhaka and Chattogram by air, sea, courier or hand carry. WhatsApp quotes same day.",
      },
      { property: "og:title", content: "Source2BD, global sourcing and Bangladesh cargo" },
      {
        property: "og:description",
        content: "One desk for sourcing and freight into Bangladesh. Quotes on WhatsApp, same working day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const products = featuredProducts(8);

  return (
    <>
      <Hero />
      <TrustStrip />
      <OriginRail />
      <FeaturedCatalogue products={products} />
      <ServiceGrid />
      <Process />
      <ClosingCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <Container className="relative grid gap-12 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div className="reveal">
          <Eyebrow>China · Amazon · Global</Eyebrow>
          <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.02] sm:text-5xl lg:text-6xl">
            Source anything.
            <br />
            Land it in{" "}
            <span className="relative whitespace-nowrap text-accent">
              Bangladesh
              <span className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-accent/40" aria-hidden />
            </span>
            .
          </h1>
          <p className="font-bn mt-4 text-lg text-muted-foreground">{siteConfig.taglineBn}</p>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
            One desk buys it, consolidates the cartons and lands them in Dhaka or Chattogram. One
            price, one person on WhatsApp.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/sourcing" size="lg">
              Start sourcing
            </ButtonLink>
            <ButtonAnchor
              href={generalInquiry()}
              target="_blank"
              rel="noopener noreferrer"
              variant="glass"
              size="lg"
            >
              <WhatsAppIcon /> WhatsApp {siteConfig.phoneDisplay}
            </ButtonAnchor>
          </div>
        </div>

        <figure className="relative overflow-hidden rounded-[18px] border border-foreground/8 shadow-[var(--shadow-3)]">
          <img
            src={heroCargo}
            alt="Cartons and crates staged for consolidation in a sunlit warehouse"
            width={1280}
            height={1600}
            className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[520px]"
          />
        </figure>
      </Container>
    </section>
  );
}

function TrustStrip() {
  return (
    <Section className="py-10 sm:py-12">
      <Container>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {trustStats.map((s) => (
            <Stat key={s.label} value={s.value} label={s.label} sub={s.sub} />
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">{siteConfig.policy}</p>
      </Container>
    </Section>
  );
}

function OriginRail() {
  return (
    <Section className="pt-0">
      <Container>
        <SectionHeading
          title="Three origins, one landed price"
          titleBn="তিনটি উৎস · একটাই ল্যান্ডেড প্রাইস"
          intro="Most agents in Dhaka only handle China. We quote the same order across China factory pricing, Amazon retail and any global store, then tell you which one actually lands cheaper."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {origins.map((o) => (
            <Card key={o.key} className="lift flex flex-col p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{o.label}</h3>
                <Badge tone="green">{o.marketplaces}</Badge>
              </div>
              <p className="font-bn mt-1 text-sm text-muted-foreground">{o.labelBn}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{o.blurb}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs">
                <div>
                  <dt className="text-muted-foreground">Lanes</dt>
                  <dd className="mt-1 font-semibold">{o.lanes}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Transit</dt>
                  <dd className="mt-1 font-semibold">{o.eta}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FeaturedCatalogue({ products }: { products: ReturnType<typeof featuredProducts> }) {
  return (
    <Section className="pt-0">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            title="What a quote looks like before you send it"
            intro="These are demo listings running on zero API cost. Every card deep links into a prefilled WhatsApp message so nothing gets retyped."
          />
          <ButtonLink to="/sourcing" variant="glass">
            Open the sourcing desk
          </ButtonLink>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function ServiceGrid() {
  return (
    <Section className="pt-0">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <figure className="overflow-hidden rounded-[18px] border border-foreground/8 shadow-[var(--shadow-2)]">
            <img
              src={deskQuote}
              alt="A phone showing a supplier listing beside taped cartons ready to ship"
              width={1408}
              height={1008}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </figure>
          <SectionHeading
            eyebrow="Services"
            title="Pick the lane that fits the order"
            titleBn="আপনার অর্ডারের জন্য সঠিক লেন"
          />
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.key}
              to="/services"
              hash={s.key}
              className="panel matte lift flex flex-col rounded-[18px] p-6"
            >
              <h3 className="text-lg font-bold">{s.title}</h3>
              <p className="font-bn mt-1 text-sm text-muted-foreground">{s.titleBn}</p>
              <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {s.short}
              </p>
              <span className="mt-6 text-xs font-semibold uppercase tracking-wider text-accent">
                {s.eta}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

const steps = [
  {
    n: "01",
    title: "Send the link, keyword or photo",
    body: "Anything you have. A 1688 offer page, an Amazon ASIN, a screenshot from a competitor, or just a description.",
  },
  {
    n: "02",
    title: "We verify and price it",
    body: "We read the original listing, confirm MOQ and tier pricing with the supplier, and pick the lane that lands cheapest for your quantity.",
  },
  {
    n: "03",
    title: "You approve, we buy",
    body: "Payment to the supplier, receiving at our China or US address, count check and photos before anything moves.",
  },
  {
    n: "04",
    title: "Consolidate and ship",
    body: "Cartons from several suppliers become one shipment. Air, sea, courier or hand carry, with tracking updates on WhatsApp.",
  },
  {
    n: "05",
    title: "Delivered in Bangladesh",
    body: "Clearance handled, then delivery to your door in Dhaka or Chattogram, or pickup at our Chawkbazar office.",
  },
];

function Process() {
  return (
    <Section className="pt-0">
      <Container>
        <div className="inkwell matte rounded-[18px] px-6 py-12 sm:px-12">
          <h2 className="max-w-[18ch] font-display text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">
            Five steps, no black box
          </h2>
          <p className="font-bn mt-3 text-base opacity-70">পাঁচ ধাপ · সম্পূর্ণ স্বচ্ছ</p>
          <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-white/15 pt-4">
                <span className="tnum text-xs font-bold tracking-widest text-accent">{s.n}</span>
                <h3 className="mt-3 text-base font-bold leading-snug">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

function ClosingCta() {
  return (
    <Section className="pt-0">
      <Container>
        <Card className="relative overflow-hidden p-8 sm:p-14">
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Send us one product today and see the difference in the quote.
            </h2>
            <p className="font-bn mt-3 text-base text-muted-foreground">
              আজই একটি পণ্য পাঠান, কোট দেখে সিদ্ধান্ত নিন।
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonAnchor
                href={generalInquiry()}
                target="_blank"
                rel="noopener noreferrer"
                variant="green"
                size="lg"
              >
                <WhatsAppIcon /> WhatsApp the desk
              </ButtonAnchor>
              <ButtonLink to="/quote" variant="glass" size="lg">
                Fill the quote form
              </ButtonLink>
            </div>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
