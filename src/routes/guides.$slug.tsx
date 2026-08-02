import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { findGuide, guides } from "@/lib/content/guides";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = findGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ params, loaderData }) => {
    const guide = loaderData?.guide;
    const url = `${siteConfig.url}/guides/${params.slug}`;
    if (!guide) return { meta: [{ title: "Guide | Source2BD" }] };
    return {
      meta: [
        { title: guide.metaTitle },
        { name: "description", content: guide.metaDescription },
        { property: "og:title", content: guide.metaTitle },
        { property: "og:description", content: guide.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "bn_BD" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: guide.metaTitle },
        { name: "twitter:description", content: guide.metaDescription },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.h1,
            description: guide.metaDescription,
            inLanguage: "bn-BD",
            dateModified: guide.updated,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: siteConfig.name },
            publisher: { "@type": "Organization", name: siteConfig.name },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "হোম", item: siteConfig.url },
              { "@type": "ListItem", position: 2, name: "গাইড", item: `${siteConfig.url}/guides` },
              { "@type": "ListItem", position: 3, name: guide.title, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const others = guides.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <Section>
      <Container className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="font-bn text-sm text-muted-foreground">
          <Link to="/" className="underline">
            হোম
          </Link>{" "}
          /{" "}
          <Link to="/guides" className="underline">
            গাইড
          </Link>
        </nav>

        <h1 className="font-bn mt-4 text-[clamp(1.7rem,4.5vw,2.6rem)] font-extrabold leading-[1.12]">
          {guide.h1}
        </h1>
        <p className="font-bn mt-4 text-[17px] leading-relaxed text-muted-foreground">
          {guide.intro}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">সর্বশেষ আপডেট: {guide.updated}</p>

        {guide.sections.map((s) => (
          <div key={s.h2} className="mt-10">
            <h2 className="font-bn text-[clamp(1.2rem,3vw,1.6rem)] font-bold">{s.h2}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 24)} className="font-bn mt-3 text-[17px] leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets ? (
              <ul className="font-bn mt-4 grid gap-2 text-[17px] leading-relaxed">
                {s.bullets.map((b) => (
                  <li key={b.slice(0, 24)} className="flex gap-2">
                    <span aria-hidden className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}

        <div className="mt-12">
          <h2 className="font-bn text-[clamp(1.2rem,3vw,1.6rem)] font-bold">সাধারণ প্রশ্ন</h2>
          <dl className="mt-4 grid gap-4">
            {guide.faqs.map((f) => (
              <div key={f.q} className="rounded-[16px] border border-border p-4">
                <dt className="font-bn text-[17px] font-bold">{f.q}</dt>
                <dd className="font-bn mt-2 text-[16px] leading-relaxed text-muted-foreground">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-3">
          <Link
            to="/sourcing"
            className="font-bn flex min-h-[60px] items-center justify-center rounded-full bg-accent text-[17px] font-bold text-accent-foreground"
          >
            পণ্য খুঁজুন
          </Link>
          <a
            href={generalInquiry()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bn flex min-h-[60px] items-center justify-center gap-2 rounded-full bg-wa text-[17px] font-bold text-wa-foreground"
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp
          </a>
          <a
            href={telLink}
            className="font-bn flex min-h-[60px] items-center justify-center rounded-full bg-foreground text-[17px] font-bold text-background"
          >
            ফোন {siteConfig.phoneDisplay}
          </a>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <h2 className="font-bn text-[17px] font-bold">আরও গাইড</h2>
          <ul className="font-bn mt-3 grid gap-2 text-[16px]">
            {others.map((g) => (
              <li key={g.slug}>
                <Link to="/guides/$slug" params={{ slug: g.slug }} className="underline">
                  {g.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/services" className="underline">
                আমাদের সার্ভিস
              </Link>
            </li>
            <li>
              <Link to="/faq" className="underline">
                সাধারণ প্রশ্ন
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </Section>
  );
}
