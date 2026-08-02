import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { Container } from "./primitives";
import { WhatsAppIcon } from "./button";
import { siteConfig } from "@/config/site";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { useLang } from "@/lib/i18n";

/** Trust block: real office, real phone, honest payment line. */
export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-12 border-t border-border bg-paper/60">
      <Container className="grid gap-8 py-10 sm:grid-cols-2">
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
              className="font-bn flex min-h-[56px] items-center justify-center rounded-full bg-foreground text-[17px] font-bold text-background"
            >
              {t("ফোন করুন", "Call")} {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>

        <ul className="font-bn space-y-2 text-[15px] font-semibold text-muted-foreground">
          <li>
            <a href={siteConfig.mapUrl} target="_blank" rel="noopener noreferrer" className="text-foreground underline">
              {t(siteConfig.officeBn, siteConfig.office)}
            </a>
          </li>
          <li>{t(siteConfig.hoursBn, siteConfig.hours)}</li>
          <li>{t(siteConfig.policyBn, siteConfig.policy)}</li>
          <li>
            {t(
              "দাম দেখে আপনি রাজি হলে তবেই পেমেন্ট।",
              "You pay only after you see the price and agree.",
            )}
          </li>
          <li className="pt-2">
            <Link to="/guides" className="text-foreground underline">
              {t("গাইড ও পরামর্শ", "Guides")}
            </Link>
          </li>
          <li>
            <Link to="/more" className="text-foreground underline">
              {t("সব পেজ দেখুন", "All pages")}
            </Link>
          </li>
        </ul>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {new Date().getFullYear()} {siteConfig.legalName}
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              {t("প্রাইভেসি", "Privacy")}
            </Link>
            <Link to="/faq" className="hover:text-foreground">
              {t("প্রশ্ন", "Questions")}
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
