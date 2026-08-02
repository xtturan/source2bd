import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section, SectionHeading, Card } from "@/components/s2b/primitives";
import { guides } from "@/lib/content/guides";
import { siteConfig } from "@/config/site";

const url = `${siteConfig.url}/guides`;

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "গাইড ও পরামর্শ | Source2BD" },
      {
        name: "description",
        content:
          "চায়না থেকে বাংলাদেশে পণ্য আনা, শিপিং খরচ, 1688 এজেন্ট ও ইমপোর্ট ব্যবসা নিয়ে Source2BD-এর সহজ বাংলা গাইডগুলো এক জায়গায়।",
      },
      { property: "og:title", content: "গাইড ও পরামর্শ | Source2BD" },
      {
        property: "og:description",
        content: "চায়না থেকে বাংলাদেশে ইমপোর্ট নিয়ে সহজ বাংলা গাইড।",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Guides"
          title="গাইড ও পরামর্শ"
          titleBn="নতুন হলে এখান থেকে শুরু করুন"
          intro="চায়না থেকে বাংলাদেশে পণ্য আনার প্রতিটি ধাপ সহজ বাংলায় লেখা। পড়তে সমস্যা হলে সরাসরি WhatsApp-এ মেসেজ দিন।"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <Card key={g.slug} className="p-6">
              <h2 className="font-bn text-[19px] font-bold leading-snug">
                <Link to="/guides/$slug" params={{ slug: g.slug }} className="hover:underline">
                  {g.title}
                </Link>
              </h2>
              <p className="font-bn mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {g.intro.slice(0, 130)}…
              </p>
              <Link
                to="/guides/$slug"
                params={{ slug: g.slug }}
                className="font-bn mt-4 inline-block text-[15px] font-bold text-accent underline"
              >
                পড়ুন
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
