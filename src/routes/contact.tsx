import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ · Source2BD চকবাজার, ঢাকা" },
      {
        name: "description",
        content: `WhatsApp ${siteConfig.phoneDisplay} নম্বরে মেসেজ দিন বা ফোন করুন। ঢাকার চকবাজারে আমাদের অফিস।`,
      },
      { property: "og:title", content: "যোগাযোগ · Source2BD" },
      { property: "og:description", content: "WhatsApp, ফোন আর চকবাজারের অফিস।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://source2bd.lovable.app/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLang();
  return (
    <Section className="pt-8">
      <Container className="max-w-[720px]">
        <h1 className="font-bn text-[clamp(1.6rem,6vw,2.4rem)] font-extrabold leading-tight">
          {t("সরাসরি কথা বলুন", "Talk to us directly")}
        </h1>
        <p className="font-bn mt-2 text-[17px] font-semibold text-muted-foreground">
          {t("একটাই নম্বর · দাম, অর্ডার, ডেলিভারি সব এখানেই", "One number for prices, orders and delivery")}
        </p>

        <div className="mt-6 grid gap-3">
          <a
            href={generalInquiry()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[68px] flex-col items-center justify-center rounded-[18px] bg-wa text-wa-foreground"
          >
            <span className="font-bn flex items-center gap-2 text-[19px] font-bold">
              <WhatsAppIcon className="h-6 w-6" />
              {t("WhatsApp-এ মেসেজ দিন", "Message on WhatsApp")}
            </span>
            <span className="tnum text-[13px] font-semibold opacity-90">{siteConfig.phoneDisplay}</span>
          </a>
          <a
            href={telLink}
            className="panel matte flex min-h-[68px] flex-col items-center justify-center rounded-[18px]"
          >
            <span className="font-bn text-[19px] font-bold">{t("ফোন করুন", "Call us")}</span>
            <span className="tnum text-[13px] font-semibold text-muted-foreground">{siteConfig.phoneDisplay}</span>
          </a>
        </div>

        <div className="panel matte mt-4 rounded-[18px] p-5">
          <p className="font-bn text-[15px] font-bold">{t("অফিস", "Office")}</p>
          <p className="font-bn mt-1 text-[16px] font-semibold text-muted-foreground">{siteConfig.officeLine2}</p>
          <p className="font-bn mt-4 text-[15px] font-bold">{t("সময়", "Hours")}</p>
          <p className="font-bn mt-1 text-[16px] font-semibold text-muted-foreground">{siteConfig.hours}</p>
        </div>

        <div className="panel matte mt-4 rounded-[18px] p-5">
          <p className="font-bn text-[15px] font-bold">
            {t("মেসেজে এই ৪টা জিনিস লিখলে দাম দ্রুত পাবেন", "Send these 4 things for a faster price")}
          </p>
          <ul className="mt-3 space-y-2">
            {[
              t("পণ্যের ছবি, লিংক বা নাম", "Photo, link or name of the item"),
              t("কয়টা লাগবে", "How many you need"),
              t("কোন শহরে পাঠাব", "Your delivery city"),
              t("কবে লাগবে", "When you need it"),
            ].map((line) => (
              <li key={line} className="font-bn flex gap-2 text-[16px] font-semibold text-muted-foreground">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
