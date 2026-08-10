import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Container } from "@/components/s2b/primitives";
import { WhatsAppIcon } from "@/components/s2b/button";
import { generalInquiry } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "পাসওয়ার্ড রিসেট | Source2BD" },
      {
        name: "description",
        content: "Reset your Source2BD password with an email link, or ask us on WhatsApp if you signed up by phone.",
      },
      { property: "og:title", content: "Reset your Source2BD password" },
      { property: "og:description", content: "Send yourself a reset link and choose a new password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

const inputCls =
  "mt-1 h-14 w-full rounded-2xl border border-foreground/12 bg-background px-4 text-[16px] text-foreground outline-none focus:border-accent";

function ResetPasswordPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase drops the user here with a recovery session in the URL hash.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) setRecovery(true);
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setError(t("সঠিক ইমেইল দিন", "Enter a valid email"));
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(clean, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর", "Password must be at least 6 characters"));
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) setError(err.message);
    else navigate({ to: "/account", replace: true });
  }

  return (
    <Container className="py-[clamp(1.5rem,5vw,4rem)]">
      <div className="mx-auto w-full max-w-[440px]">
        <h1 className="font-bn text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold leading-tight">
          {recovery ? t("নতুন পাসওয়ার্ড দিন", "Set a new password") : t("পাসওয়ার্ড ভুলে গেছেন?", "Forgot your password?")}
        </h1>

        {recovery ? (
          <form onSubmit={savePassword} className="mt-5 space-y-4">
            <label className="block">
              <span className="font-bn text-[14px] font-bold">{t("নতুন পাসওয়ার্ড (৬ অক্ষর)", "New password (6 characters)")}</span>
              <input
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete="new-password"
                minLength={6}
                className={inputCls}
                required
              />
            </label>
            {error ? (
              <p className="font-bn rounded-2xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="font-bn h-16 w-full rounded-2xl bg-wa text-[17px] font-extrabold text-wa-foreground disabled:opacity-60"
            >
              {busy ? t("অপেক্ষা করুন…", "Please wait…") : t("পাসওয়ার্ড সেভ করুন", "Save password")}
            </button>
          </form>
        ) : sent ? (
          <p className="font-bn mt-5 rounded-2xl bg-wa/10 px-4 py-4 text-[16px] font-semibold text-foreground">
            {t(
              "ইমেইলে একটি লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে নতুন পাসওয়ার্ড দিন। স্প্যাম ফোল্ডারও দেখুন।",
              "We sent a link to your email. Open it to choose a new password. Check the spam folder too.",
            )}
          </p>
        ) : (
          <>
            <p className="font-bn mt-2 text-[15px] text-muted-foreground">
              {t(
                "ইমেইল দিয়ে অ্যাকাউন্ট খুলে থাকলে নিচে ইমেইল লিখুন।",
                "If you signed up with an email address, enter it below.",
              )}
            </p>
            <form onSubmit={sendLink} className="mt-5 space-y-4">
              <label className="block">
                <span className="font-bn text-[14px] font-bold">{t("ইমেইল", "Email")}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  autoComplete="email"
                  placeholder="you@email.com"
                  className={inputCls}
                  required
                />
              </label>
              {error ? (
                <p className="font-bn rounded-2xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="font-bn h-16 w-full rounded-2xl bg-foreground text-[17px] font-extrabold text-background disabled:opacity-60"
              >
                {busy ? t("পাঠানো হচ্ছে…", "Sending…") : t("রিসেট লিংক পাঠান", "Send reset link")}
              </button>
            </form>

            <div className="panel matte mt-6 rounded-[18px] p-5">
              <p className="font-bn text-[15px] font-bold">
                {t("মোবাইল নম্বর দিয়ে অ্যাকাউন্ট খুলেছেন?", "Signed up with a phone number?")}
              </p>
              <p className="font-bn mt-1 text-[15px] font-semibold text-muted-foreground">
                {t(
                  "নম্বরের অ্যাকাউন্টে ইমেইল নেই, তাই আমাদের WhatsApp করুন। পরিচয় মিলিয়ে আমরা পাসওয়ার্ড রিসেট করে দেব।",
                  "Phone accounts have no mailbox, so message us on WhatsApp. We verify you and reset the password.",
                )}
              </p>
              <a
                href={generalInquiry()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bn mt-4 flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-wa text-[16px] font-bold text-wa-foreground"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t("WhatsApp", "WhatsApp")} {siteConfig.phoneDisplay}
              </a>
            </div>
          </>
        )}

        <Link to="/auth" className="font-bn mt-5 inline-block text-[14px] font-bold text-accent">
          {t("← লগইন পাতায় ফিরুন", "← Back to log in")}
        </Link>
      </div>
    </Container>
  );
}
