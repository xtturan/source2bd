import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Badge, Card, Stat } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import {
  BigActionAnchor,
  BigActionLink,
  IconBox,
  IconCamera,
  IconPhone,
  IconSearch,
  IconTruck,
} from "@/components/s2b/big-action";
import { ProductCard } from "@/components/s2b/product-card";
import { featuredProducts } from "@/lib/products/mock-provider";
import { showcaseSearches } from "@/lib/products/queries.functions";
import type { ShowcaseRow } from "@/lib/products/search-cache.server";
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
      { property: "og:title", content: "Source2BD, source from anywhere and land it in Bangladesh" },
      {
        property: "og:description",
        content: "Source2BD sources from 1688, Alibaba, Amazon and any global store, then moves it to Dhaka and Chattogram by air, sea, courier or hand carry. WhatsApp quotes same day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
  // Public loader: showcase rows come from the shared search cache.
  loader: async (): Promise<ShowcaseRow[]> => {
    try {
      return await showcaseSearches();
    } catch {
      return [];
    }
  },
});

function HomePage() {
  const showcase = Route.useLoaderData();
  const products = featuredProducts(8);

  return (
    <>
      <Hero />
      <BigChoices />
      <SimpleSteps />
      <TrustStrip />
      <OriginRail />
      {showcase.length ? (
        <ShowcaseCatalogue rows={showcase} />
      ) : (
        <FeaturedCatalogue products={products} />
      )}
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
      <Container className="relative grid gap-10 pb-14 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-16">
        <div className="reveal">
          <h1 className="font-bn text-[2.2rem] font-extrabold leading-[1.15] sm:text-[2.9rem]">
            চীন থেকে পণ্য আনুন,
            <br />
            <span className="text-accent">বাসায় পৌঁছে দেব</span>
          </h1>
          <p className="mt-3 text-lg font-semibold text-muted-foreground">
            Buy from China, Amazon or any shop. We deliver to your door in Bangladesh.
          </p>
          <p className="font-bn mt-4 text-base leading-relaxed text-muted-foreground">
            কোনো ইংরেজি জানার দরকার নেই। শুধু ছবি বা লিংক পাঠান, আমরা দাম বলে দেব।
          </p>
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

/**
 * The first real screen decision. Three picture buttons, Bangla first,
 * so a user who cannot read English still knows where to tap.
 */
function BigChoices() {
  return (
    <Container className="pb-4">
      <p className="font-bn text-center text-xl font-bold">আপনি কী করতে চান?</p>
      <p className="mt-1 text-center text-sm text-muted-foreground">What do you want to do?</p>
      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <BigActionLink
          to="/sourcing"
          tone="accent"
          icon={<IconSearch />}
          bn="পণ্য খুঁজুন"
          en="Search for a product"
        />
        <BigActionAnchor
          href={generalInquiry("I want to send a product photo")}
          target="_blank"
          rel="noopener noreferrer"
          tone="ink"
          icon={<IconCamera />}
          bn="ছবি পাঠান"
          en="Send a photo on WhatsApp"
        />
        <BigActionAnchor
          href={`tel:${siteConfig.phoneTel}`}
          icon={<IconPhone />}
          bn="ফোন করুন"
          en={`Call ${siteConfig.phoneDisplay}`}
        />
      </div>
    </Container>
  );
}

const simpleSteps = [
  {
    bn: "১. ছবি বা লিংক পাঠান",
    en: "Send a photo or a link",
    icon: <IconCamera className="h-9 w-9" />,
  },
  {
    bn: "২. আমরা দাম বলব",
    en: "We tell you the full price",
    icon: <IconBox className="h-9 w-9" />,
  },
  {
    bn: "৩. বাসায় ডেলিভারি",
    en: "We deliver to your door",
    icon: <IconTruck className="h-9 w-9" />,
  },
];

function SimpleSteps() {
  return (
    <Section className="py-12 sm:py-14">
      <Container>
        <ol className="grid gap-3 sm:grid-cols-3">
          {simpleSteps.map((s) => (
            <li key={s.en} className="panel matte flex items-center gap-4 rounded-[18px] p-5">
              <span
                aria-hidden
                className="grid h-14 w-14 shrink-0 place-items-center rounded-[14px] bg-accent/12 text-accent"
              >
                {s.icon}
              </span>
              <span className="min-w-0">
                <span className="font-bn block text-lg font-bold leading-tight">{s.bn}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{s.en}</span>
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
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

/** Real listings pulled from what shoppers already searched on this site. */
function ShowcaseCatalogue({ rows }: { rows: ShowcaseRow[] }) {
  return (
    <Section className="pt-0">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            title="What people are sourcing right now"
            titleBn="এখন যা খোঁজা হচ্ছে"
            intro="Live listings saved from real searches on this site, priced in taka with delivery to Bangladesh. Tap any card to get a WhatsApp quote."
          />
          <ButtonLink to="/sourcing" variant="glass">
            Open the sourcing desk
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-10">
          {rows.map((row) => (
            <div key={row.query}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold capitalize">{row.query}</h3>
                <Link
                  to="/sourcing"
                  search={{ q: row.query }}
                  className="text-xs font-semibold uppercase tracking-wider text-accent"
                >
                  See all results
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {row.items.map((p) => (
                  <ProductCard key={`${p.marketplace}-${p.id}`} product={p} />
                ))}
              </div>
            </div>
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
