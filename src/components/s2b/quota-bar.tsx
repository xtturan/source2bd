import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { WhatsAppIcon } from "./button";
import { myQuota } from "@/lib/products/queries.functions";
import { useSession } from "@/lib/auth/session";
import { generalInquiry, telLink } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Server is the source of truth; this is display only. */
export function useQuotaState() {
  const { user, loading } = useSession();
  const read = useServerFn(myQuota);
  const query = useQuery({
    queryKey: ["my-quota", user?.id ?? "anon"],
    queryFn: () => read({}),
    enabled: Boolean(user),
    staleTime: 15_000,
  });
  return {
    signedIn: Boolean(user),
    loadingSession: loading,
    quota: query.data ?? null,
    refresh: query.refetch,
  };
}

/** "আজকের বাকি খোঁজা: X/30" plus the login wall when signed out. */
export function QuotaBar({ className }: { className?: string }) {
  const { t } = useLang();
  const { signedIn, loadingSession, quota } = useQuotaState();

  if (loadingSession) return null;

  if (!signedIn) {
    return (
      <div
        className={cn(
          "rounded-[16px] border-2 border-accent/40 bg-accent/10 p-4",
          className,
        )}
      >
        <p className="font-bn text-[16px] font-bold leading-snug">
          {t(
            "সংরক্ষিত পণ্য লগইন ছাড়াই দেখুন · নতুন খোঁজার জন্য লগইন (দিনে ৩০ বার ফ্রি)",
            "Browse saved products without an account. Log in for fresh searches, 30 free a day.",
          )}
        </p>
        <Link
          to="/auth"
          className="font-bn mt-3 flex min-h-[52px] items-center justify-center rounded-full bg-foreground text-[16px] font-bold text-background"
        >
          {t("লগইন / রেজিস্টার", "Log in or sign up")}
        </Link>
      </div>
    );
  }

  if (!quota) return null;
  const low = quota.remainingSearches <= 5;

  return (
    <p
      className={cn(
        "font-bn text-[15px] font-bold",
        low ? "text-accent" : "text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      {t("আজকের বাকি খোঁজা", "Searches left today")}: {quota.remainingSearches}/
      {quota.searchLimit} <span className="font-normal">({t("লেখা ও ছবি একসাথে", "text + photo")})</span>
    </p>
  );
}

/** Shown when the server returns the daily limit error. */
export function LimitReached() {
  return <LimitReachedInner />;
}

/** Compact header pill: "১২/৩০" left today, or a login nudge. */
export function QuotaChip({ className }: { className?: string }) {
  const { t } = useLang();
  const { signedIn, loadingSession, quota } = useQuotaState();

  if (loadingSession || !signedIn || !quota) return null;
  const low = quota.remainingSearches <= 5;

  return (
    <span
      aria-live="polite"
      title={t("আজকের বাকি খোঁজা", "Searches left today")}
      className={cn(
        "font-bn hidden h-11 items-center gap-1 rounded-full border px-3 text-[14px] font-bold sm:inline-flex",
        low
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-foreground/12 text-muted-foreground",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      {quota.remainingSearches}/{quota.searchLimit}
    </span>
  );
}

function LimitReachedInner() {
  const { t } = useLang();
  return (
    <div className="panel matte rounded-[18px] p-5 text-center">
      <p className="font-bn text-[19px] font-extrabold">
        {t("আজকের খোঁজার সীমা শেষ", "Today's search limit is used up")}
      </p>
      <p className="font-bn mt-2 text-[16px] font-semibold text-muted-foreground">
        {t(
          "লেখা ও ছবি মিলিয়ে দিনে ৩০ বার। কাল আবার চেষ্টা করুন, অথবা আমাদের মেসেজ দিন — আমরা দাম বের করে দেব।",
          "30 searches a day, text and photo combined. Try again tomorrow or message us and we will price it for you.",
        )}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <a
          href={generalInquiry()}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bn flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-wa text-[17px] font-bold text-wa-foreground"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("হোয়াটসঅ্যাপ", "WhatsApp")}
        </a>
        <a
          href={telLink}
          className="font-bn flex min-h-[58px] items-center justify-center rounded-full bg-foreground text-[17px] font-bold text-background"
        >
          {t("ফোন", "Call")} {siteConfig.phoneDisplay}
        </a>
        <Link
          to="/"
          className="font-bn flex min-h-[58px] items-center justify-center rounded-full border-2 border-foreground/20 text-[17px] font-bold"
        >
          {t("হোমে যান", "Go home")}
        </Link>
      </div>
    </div>
  );
}
