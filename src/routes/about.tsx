import { createFileRoute } from "@tanstack/react-router";
import { Container, Section, Card } from "@/components/s2b/primitives";
import { ButtonAnchor, ButtonLink, WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";

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
  const { t } = useLang();

  const pillars = [
    {
      bn: "সব দেশ থেকে, একই ডেস্কে",
      en: "Multi origin by default",
      bodyBn:
        "চীন থেকে ফ্যাক্টরি দাম, অ্যামাজন থেকে ব্র্যান্ড পণ্য ও পার্টস, আর দরকার হলে অন্য যেকোনো দোকান। আমরা তুলনা করে দেখাই, একটাই লাইন ধরে ঠেলি না।",
      bodyEn:
        "China for factory pricing, Amazon for brand items and spares, global stores for everything else. We compare rather than push one lane.",
    },
    {
      bn: "দাম খোলা খাতায়",
      en: "Priced in the open",
      bodyBn:
        "পণ্যের দাম, আমাদের সার্ভিস ফি আর ফ্রেইট — তিনটা আলাদা সংখ্যা। মূল লিংকে গিয়ে সাপ্লায়ারের দাম আপনি নিজেই মিলিয়ে দেখতে পারেন।",
      bodyEn:
        "Product cost, service fee and freight are three separate numbers. You can check the supplier price yourself on the original listing.",
    },
    {
      bn: "শুধু বৈধ পণ্য",
      en: "Legal cargo only",
      bodyBn: `${siteConfig.policyBn} অর্ডার হারানো ভালো, বন্দরে মাল আটকে যাওয়ার চেয়ে।`,
      bodyEn: `${siteConfig.policy} We would rather lose an order than lose your shipment at the port.`,
    },
  ];

  return (
    <Section className="py-8">
      <Container>
        <p className="font-bn text-[14px] font-bold uppercase tracking-[0.12em] text-accent">
          {t(siteConfig.parentLineBn, siteConfig.parentLineEn)}
        </p>
        <h1 className="font-bn mt-2 text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold leading-tight">
          {t("আমাদের সম্পর্কে", "About us")}
        </h1>
        <p className="font-bn mt-3 max-w-[62ch] text-[17px] font-semibold leading-relaxed text-muted-foreground">
          {t(
            "বেশিরভাগ ক্রেতা সোর্সিংয়ের জন্য এক এজেন্ট, শিপিংয়ের জন্য আরেকজন, আর ক্লিয়ারেন্সের জন্য তৃতীয় একজন ধরেন। প্রতিটা হাতবদলে দাম বাড়ে আর সময় পিছায়। আমরা তিনটাই এক ডেস্কে রাখি।",
            "Most Bangladeshi buyers use one agent for sourcing, another for freight and a third for clearance. Every handover is a place where the price grows and the timeline slips. We keep all three on one desk.",
          )}
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-bn text-[20px] font-extrabold">Source2BD</h2>
            <p className="font-bn mt-1 text-[14px] font-bold text-accent">
              {t("ক্রেতার দিক", "The buyer-facing side")}
            </p>
            <p className="font-bn mt-3 text-[16px] font-semibold leading-relaxed text-muted-foreground">
              {t(
                "১৬৮৮, আলিবাবা আর অ্যামাজনে সহজ বাংলায় খুঁজুন। ছবি, নাম বা লিংক পাঠান — বাংলাদেশে পৌঁছানো পর্যন্ত একটাই দাম পাবেন: পণ্যের দাম, সার্ভিস ফি, ফ্রেইট আর ট্যাক্স আলাদা করে বোঝানো। দাম পছন্দ হলে তবেই টাকা দেবেন।",
                "Search 1688, Alibaba and Amazon in plain Bangla, send a photo, a name or a link, and get one full Bangladesh door price: product, service fee, freight and duty explained. You pay only after you accept the quote.",
              )}
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="font-bn text-[20px] font-extrabold">{siteConfig.parent}</h2>
            <p className="font-bn mt-1 text-[14px] font-bold text-accent">
              {t("মূল প্রতিষ্ঠান", "The parent company")}
            </p>
            <p className="font-bn mt-3 text-[16px] font-semibold leading-relaxed text-muted-foreground">
              {t(
                "আমদানি-রপ্তানি ট্রেডিং, চীনে সাপ্লায়ারকে পেমেন্ট করার ব্যবস্থা, এয়ার-সি-হ্যান্ড ক্যারি-কুরিয়ার ফ্রেইট, লাইসেন্সধারী এজেন্টের সাথে সি অ্যান্ড এফ ও কাস্টমস সমন্বয়, গুদামে মাল একত্র করা ও ছবি দেখানো, আর বাংলাদেশে ডোর ডেলিভারি।",
                "Import and export trading, supplier payment support in China, air, sea, hand carry and courier freight, C&F and customs coordination with licensed agents, warehouse consolidation with QC photos, and door delivery in Bangladesh.",
              )}
            </p>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((c) => (
            <Card key={c.en} className="p-6">
              <h2 className="font-bn text-[18px] font-extrabold">{t(c.bn, c.en)}</h2>
              <p className="font-bn mt-3 text-[16px] font-semibold leading-relaxed text-muted-foreground">
                {t(c.bodyBn, c.bodyEn)}
              </p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 sm:p-8">
          <h2 className="font-bn text-[clamp(1.2rem,4.5vw,1.6rem)] font-extrabold">
            {t("আমাদের কোথায় পাবেন", "Where to find us")}
          </h2>
          <p className="font-bn mt-3 max-w-[62ch] text-[16px] font-semibold leading-relaxed text-muted-foreground">
            {t(
              `${siteConfig.officeBn}। ডেস্ক খোলা থাকে ${siteConfig.hoursBn}। ফোন ${siteConfig.phoneDisplay}। নমুনা বা ছবি নিয়ে সরাসরি চলে আসতে পারেন, সামনে বসেই দাম হিসাব করে দেব।`,
              `${siteConfig.officeLine2}. Desk hours ${siteConfig.hours}. Phone ${siteConfig.phoneDisplay}. Walk in with a sample or a photo and we will price it while you are there.`,
            )}
          </p>
          {siteConfig.tradeLicense || siteConfig.binNumber ? (
            <p className="mt-3 text-[15px] font-semibold text-muted-foreground">
              {siteConfig.tradeLicense ? `Trade licence: ${siteConfig.tradeLicense}` : null}
              {siteConfig.tradeLicense && siteConfig.binNumber ? " · " : null}
              {siteConfig.binNumber ? `BIN: ${siteConfig.binNumber}` : null}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonAnchor href={generalInquiry()} target="_blank" rel="noopener noreferrer" variant="green" size="lg">
              <WhatsAppIcon /> {t("হোয়াটসঅ্যাপে মেসেজ দিন", "Message the desk")}
            </ButtonAnchor>
            <ButtonAnchor href={telLink} variant="glass" size="lg">
              {t("ফোন করুন", "Call us")}
            </ButtonAnchor>
            <ButtonLink to="/contact" variant="glass" size="lg">
              {t("যোগাযোগ", "Contact details")}
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
