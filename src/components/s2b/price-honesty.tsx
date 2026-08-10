import { Container, Section } from "./primitives";
import { costExample } from "@/config/site";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * One honest picture of what a landed price is made of. Numbers are an
 * illustration held in config, never a quote.
 */
export function PriceHonesty({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useLang();
  const total = costExample.parts.reduce((s, p) => s + p.taka, 0);

  const body = (
    <div className={cn("panel matte rounded-[18px] p-5", className)}>
      <h2 className="font-bn text-[clamp(1.15rem,4.5vw,1.5rem)] font-extrabold">
        {t("মার্কেট দাম ≠ বাসায় পৌঁছানোর দাম", "Market price is not the door price")}
      </h2>
      <p className="font-bn mt-2 text-[15px] font-semibold text-muted-foreground">
        {t(
          "একটি উদাহরণ, শুধু বোঝানোর জন্য। আপনার পণ্যের আসল হিসাব আমরা WhatsApp-এ আলাদা করে দেব।",
          "An illustration only. We break down your own item separately on WhatsApp.",
        )}
      </p>

      <ul className="mt-4 space-y-2">
        {costExample.parts.map((p) => (
          <li key={p.en} className="flex items-center gap-3">
            <span className="font-bn w-[42%] shrink-0 text-[15px] font-bold">{t(p.bn, p.en)}</span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-foreground/8">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${Math.round((p.taka / total) * 100)}%` }}
              />
            </span>
            <span className="tnum w-[22%] shrink-0 text-right text-[14px] font-bold">৳{p.taka.toLocaleString("en-US")}</span>
          </li>
        ))}
      </ul>

      <p className="font-bn mt-4 text-[15px] font-bold">
        {t("উদাহরণে মোট", "Example total")}{" "}
        <span className="tnum text-accent">৳{total.toLocaleString("en-US")}</span>
      </p>
      <p className="font-bn mt-1 text-[13px] font-semibold text-muted-foreground">
        {t(
          "ক্লিয়ারেন্স ও ট্যাক্স পণ্যের ধরন অনুযায়ী বদলায়। দাম দেখে রাজি হলে তবেই পেমেন্ট।",
          "Clearance and duty depend on the product class. You pay only after you accept the quote.",
        )}
      </p>
    </div>
  );

  if (compact) return body;
  return (
    <Section className="py-10 sm:py-14">
      <Container>{body}</Container>
    </Section>
  );
}
