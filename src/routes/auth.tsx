import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Container } from "@/components/s2b/primitives";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { getDeviceId, phoneToEmail, normalisePhone, isValidBdPhone } from "@/lib/auth/device";
import { claimAccount, deviceCapacity } from "@/lib/auth/account.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { title: "অ্যাকাউন্ট খুলুন | Source2BD login and signup" },
      {
        name: "description",
        content:
          "Create a free Source2BD account with your phone number or email and get 30 live product lookups every day.",
      },
      { property: "og:title", content: "Source2BD account, sign up in seconds" },
      {
        property: "og:description",
        content: "Sign up with a Bangladeshi phone number or an email address. No long forms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signup" | "login";
type Method = "phone" | "email";

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signup");
  const [method, setMethod] = useState<Method>("phone");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in, nothing to do here.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (method === "phone" && !isValidBdPhone(identifier)) {
      setError(t("সঠিক মোবাইল নম্বর দিন, যেমন 01712345678", "Enter a valid mobile number, e.g. 01712345678"));
      return;
    }
    if (method === "email" && !/^\S+@\S+\.\S+$/.test(identifier.trim())) {
      setError(t("সঠিক ইমেইল দিন", "Enter a valid email"));
      return;
    }
    if (password.length < 6) {
      setError(t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর", "Password must be at least 6 characters"));
      return;
    }

    const deviceId = getDeviceId();
    const email = method === "phone" ? phoneToEmail(identifier) : identifier.trim().toLowerCase();
    setBusy(true);
    try {
      if (mode === "signup") {
        const cap = await deviceCapacity({ data: { deviceId } });
        if (!cap.allowed) {
          setError(
            t(
              "এই ডিভাইসে সর্বোচ্চ ২টি অ্যাকাউন্ট খোলা যায়। লগইন করুন।",
              "This device already has 2 accounts. Please log in instead.",
            ),
          );
          setBusy(false);
          return;
        }
        const { error: signErr } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signErr) throw signErr;
      }

      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (loginErr) throw loginErr;

      await claimAccount({
        data: {
          deviceId,
          signupMethod: method,
          phone: method === "phone" ? normalisePhone(identifier) : undefined,
          fullName: name.trim() || undefined,
        },
      });
      navigate({ to: "/account", replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      if (raw.includes("DEVICE_ACCOUNT_LIMIT")) {
        await supabase.auth.signOut();
        setError(
          t(
            "এই ডিভাইসে সর্বোচ্চ ২টি অ্যাকাউন্ট খোলা যায়।",
            "A device can create only 2 accounts.",
          ),
        );
      } else if (raw.includes("already registered") || raw.includes("User already")) {
        setError(t("এই নম্বর/ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে। লগইন করুন।", "Account exists already. Please log in."));
      } else if (raw.includes("Invalid login")) {
        setError(t("নম্বর/ইমেইল বা পাসওয়ার্ড ভুল।", "Wrong phone/email or password."));
      } else {
        setError(raw);
      }
      setBusy(false);
    }
  }

  return (
    <Container className="py-[clamp(1.5rem,5vw,4rem)]">
      <div className="mx-auto w-full max-w-[440px]">
        <h1 className="font-bn text-[clamp(1.6rem,5vw,2.2rem)] font-extrabold leading-tight text-foreground">
          {mode === "signup" ? t("নতুন অ্যাকাউন্ট", "Create account") : t("লগইন করুন", "Log in")}
        </h1>
        <p className="font-bn mt-2 text-[15px] text-muted-foreground">
          {t(
            "মোবাইল নম্বর বা ইমেইল, আর একটি পাসওয়ার্ড। ব্যস।",
            "Phone number or email, plus a password. That is all.",
          )}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-foreground/[0.06] p-1">
          {(["signup", "login"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              aria-pressed={mode === m}
              className={cn(
                "font-bn h-12 rounded-xl text-[15px] font-bold transition-colors",
                mode === m ? "bg-foreground text-background" : "text-muted-foreground",
              )}
            >
              {m === "signup" ? t("সাইন আপ", "Sign up") : t("লগইন", "Log in")}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["phone", "email"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMethod(m);
                  setIdentifier("");
                  setError(null);
                }}
                aria-pressed={method === m}
                className={cn(
                  "font-bn h-14 rounded-2xl border text-[15px] font-bold transition-colors",
                  method === m
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-foreground/12 text-muted-foreground",
                )}
              >
                {m === "phone" ? t("মোবাইল নম্বর", "Phone number") : t("ইমেইল", "Email")}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="font-bn text-[14px] font-bold text-foreground">
              {method === "phone" ? t("মোবাইল নম্বর", "Mobile number") : t("ইমেইল", "Email")}
            </span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              inputMode={method === "phone" ? "numeric" : "email"}
              autoComplete={method === "phone" ? "tel" : "email"}
              placeholder={method === "phone" ? "01712345678" : "you@email.com"}
              className="mt-1 h-14 w-full rounded-2xl border border-foreground/12 bg-background px-4 text-[16px] text-foreground outline-none focus:border-accent"
              required
            />
          </label>

          {mode === "signup" ? (
            <label className="block">
              <span className="font-bn text-[14px] font-bold text-foreground">
                {t("আপনার নাম (ইচ্ছা করলে)", "Your name (optional)")}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="mt-1 h-14 w-full rounded-2xl border border-foreground/12 bg-background px-4 text-[16px] text-foreground outline-none focus:border-accent"
              />
            </label>
          ) : null}

          <label className="block">
            <span className="font-bn text-[14px] font-bold text-foreground">
              {t("পাসওয়ার্ড (৬ অক্ষর)", "Password (6 characters)")}
            </span>
            <div className="relative mt-1">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
                className="h-14 w-full rounded-2xl border border-foreground/12 bg-background px-4 pr-20 text-[16px] text-foreground outline-none focus:border-accent"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="font-bn absolute right-2 top-2 h-10 rounded-xl px-3 text-[13px] font-bold text-muted-foreground"
              >
                {show ? t("লুকান", "Hide") : t("দেখুন", "Show")}
              </button>
            </div>
          </label>

          {error ? (
            <p className="font-bn rounded-2xl bg-destructive/10 px-4 py-3 text-[14px] font-semibold text-destructive">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="font-bn h-16 w-full rounded-2xl bg-wa text-[17px] font-extrabold text-wa-foreground shadow-[var(--shadow-1)] disabled:opacity-60"
          >
            {busy
              ? t("অপেক্ষা করুন…", "Please wait…")
              : mode === "signup"
                ? t("অ্যাকাউন্ট খুলুন", "Create account")
                : t("লগইন", "Log in")}
          </button>
        </form>

        <p className="font-bn mt-5 text-[13px] leading-relaxed text-muted-foreground">
          {t(
            "একটি ডিভাইস থেকে সর্বোচ্চ ২টি অ্যাকাউন্ট খোলা যায়। প্রতিটি অ্যাকাউন্ট দিনে ৩০টি লাইভ সার্চ পায়।",
            "One device can create up to 2 accounts. Each account gets 30 live searches per day.",
          )}
        </p>
        <Link to="/reset-password" className="font-bn mt-3 inline-block text-[14px] font-bold text-accent">
          {t("পাসওয়ার্ড ভুলে গেছেন?", "Forgot your password?")}
        </Link>
        <p className="font-bn mt-3 text-[12px] leading-relaxed text-muted-foreground">
          {t("অ্যাকাউন্ট খুললে আপনি", "By creating an account you accept our")}{" "}
          <Link to="/terms" className="underline">
            {t("শর্তাবলী", "terms")}
          </Link>{" "}
          {t("ও", "and")}{" "}
          <Link to="/privacy" className="underline">
            {t("প্রাইভেসি নীতি", "privacy policy")}
          </Link>
          {t(" মেনে নিচ্ছেন।", ".")}
        </p>
        <Link to="/" className="font-bn mt-3 block text-[14px] font-bold text-accent">
          {t("← হোমে ফিরুন", "← Back home")}
        </Link>
      </div>
    </Container>
  );
}
