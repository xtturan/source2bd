import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { Container } from "./primitives";
import { WhatsAppIcon } from "./button";
import { siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";

const columns = [
  {
    bn: "সার্ভিস",
    en: "Product",
    links: [
      { to: "/sourcing", bn: "খুঁজুন", en: "Sourcing" },
      { to: "/catalog", bn: "ক্যাটালগ", en: "Catalogue" },
      { to: "/quote", bn: "শিপিংসহ দাম", en: "Get a quote" },
      { to: "/track", bn: "অর্ডার স্ট্যাটাস", en: "Order status" },
    ],
  },
  {
    bn: "কোম্পানি",
    en: "Company",
    links: [
      { to: "/about", bn: "আমরা কারা", en: "About TWT and Source2BD" },
      { to: "/services", bn: "সব সার্ভিস", en: "Services" },
      { to: "/guides", bn: "গাইড", en: "Guides" },
      { to: "/contact", bn: "যোগাযোগ", en: "Contact" },
    ],
  },
  {
    bn: "আইন ও নীতি",
    en: "Legal",
    links: [
      { to: "/privacy", bn: "প্রাইভেসি", en: "Privacy" },
      { to: "/terms", bn: "শর্তাবলী", en: "Terms" },
      { to: "/refunds", bn: "টাকা ফেরত", en: "Refunds" },
      { to: "/prohibited", bn: "নিষিদ্ধ পণ্য", en: "Prohibited goods" },
    ],
  },
] as const;

/** Trust block: real office, real phone, real parent company, honest payment line. */
export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-12 border-t border-border bg-paper/60">
      <Container className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))]">
        <div>
          <Logo />
          <p className="font-bn mt-3 max-w-[38ch] text-[15px] font-semibold leading-relaxed text-muted-foreground">
            {t(
              "যেকোনো দেশ থেকে পণ্য এনে বাংলাদেশে পৌঁছে দিই। ছবি বা লিংক পাঠালেই হবে।",
              "We buy from anywhere in the world and deliver it in Bangladesh. A photo or a link is enough.",
            )}
          </p>

          <div className="mt-5 grid gap-3 sm:max-w-sm">
            <a
              href={generalInquiry()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bn flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-wa text-[17px] font-bold text-wa-foreground"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {t("হোয়াটসঅ্যাপ", "WhatsApp")} {siteConfig.phoneDisplay}
            </a>
            <a
              href={telLink}
              className="font-bn flex min-h-[56px] items-center justify-center rounded-full bg-primary text-[17px] font-bold text-primary-foreground"
            >
              {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
            </a>
          </div>

          <ul className="font-bn mt-5 space-y-1.5 text-[15px] font-semibold text-muted-foreground">
            <li>
              <a href={siteConfig.mapUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline">
                {t(siteConfig.officeBn, siteConfig.office)}
              </a>
            </li>
            <li>{t(siteConfig.hoursBn, siteConfig.hours)}</li>
            <li className="font-bold text-foreground">{t(siteConfig.policyBn, siteConfig.policy)}</li>
            <li>{t("দাম দেখে আপনি রাজি হলে তবেই পেমেন্ট।", "You pay only after you see the price and agree.")}</li>
          </ul>
        </div>

        {columns.map((col) => (
          <nav key={col.en} aria-label={t(col.bn, col.en)}>
            <p className="font-bn text-[13px] font-extrabold uppercase tracking-[0.08em] text-foreground">
              {t(col.bn, col.en)}
            </p>
            <ul className="font-bn mt-3 space-y-2 text-[15px] font-semibold text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-foreground">
                    {t(l.bn, l.en)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name} · {t("একটি", "a")} {siteConfig.parent}{" "}
            {t("প্রতিষ্ঠান", "product")}
          </p>
          <Link to="/more" className="hover:text-foreground">
            {t("সব পেজ", "All pages")}
          </Link>
        </Container>
      </div>
    </footer>
  );
}
