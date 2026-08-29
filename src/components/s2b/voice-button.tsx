import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MicGlyph } from "./glyphs";

type VoiceState = "idle" | "listening" | "processing" | "error" | "unsupported";

export function VoiceButton({
  onFinal,
  onInterim,
  className,
  inline,
}: {
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  className?: string;
  /** Compact icon-only variant that lives INSIDE the search field. */
  inline?: boolean;
}) {
  const { t } = useLang();
  const [state, setState] = useState<VoiceState>("idle");
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!Ctor) setState("unsupported");
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* already stopped */
      }
    };
  }, []);

  function stop() {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setState("idle");
  }

  async function start(lang = "bn-BD") {
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!Ctor) {
      setState("unsupported");
      return;
    }
    setError(null);
    setHeard("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((tr) => tr.stop());
    } catch {
      setState("error");
      setError(
        t(
          "মাইক বন্ধ আছে · ব্রাউজারে মাইক অনুমতি দিন অথবা টাইপ করুন",
          "The mic is blocked. Allow microphone access in the browser, or type instead.",
        ),
      );
      return;
    }
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    let finalText = "";
    let fellBack = false;
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setHeard((finalText + interim).trim());
      if (interim.trim()) onInterim((finalText + interim).trim());
    };
    rec.onerror = (e: any) => {
      const code = String(e?.error ?? "");
      if (code === "language-not-supported" && lang !== "en-US") {
        fellBack = true;
        recRef.current = null;
        void start("en-US");
        return;
      }
      if (code === "aborted" || code === "no-speech") {
        setState("error");
        setError(t("কিছু শুনতে পাইনি · আবার বলুন", "We did not hear anything. Please try again."));
        return;
      }
      setState("error");
      setError(
        code === "not-allowed" || code === "service-not-allowed"
          ? t(
              "মাইক বন্ধ আছে · সেটিংস থেকে মাইক অন করুন অথবা টাইপ করুন",
              "The mic is blocked. Turn it on in settings, or type instead.",
            )
          : t(
              "বুঝতে পারিনি · আবার বলুন বা টাইপ করুন",
              "We did not catch that. Say it again or type it.",
            ),
      );
    };
    rec.onend = () => {
      if (fellBack) return;
      recRef.current = null;
      const text = finalText.trim();
      if (text.length >= 2) {
        setState("processing");
        setHeard(text);
        onFinal(text);
        setTimeout(() => setState("idle"), 600);
      } else {
        setState((s) => (s === "error" ? s : "error"));
        setError(
          (prev) =>
            prev ??
            t(
              "বুঝতে পারিনি · আবার বলুন বা টাইপ করুন",
              "We did not catch that. Say it again or type it.",
            ),
        );
      }
    };
    setState("listening");
    try {
      rec.start();
    } catch {
      setState("error");
      setError(
        t("মাইক চালু করা গেল না · টাইপ করুন", "The mic could not start. Please type instead."),
      );
    }
  }

  if (inline) {
    // No speech recognition in this browser: render nothing rather than a
    // dead button (the field works fine on its own).
    if (state === "unsupported") return null;
    return (
      <button
        type="button"
        onClick={() => (state === "listening" ? stop() : void start())}
        aria-pressed={state === "listening"}
        aria-label={
          state === "listening" ? t("শোনা বন্ধ করুন", "Stop listening") : t("মাইকে বলুন", "Speak")
        }
        className={cn(
          "grid h-12 w-12 place-items-center rounded-full transition-colors",
          state === "listening"
            ? "animate-pulse bg-accent text-accent-foreground"
            : "bg-foreground/8 text-foreground hover:bg-foreground/15",
          className,
        )}
      >
        <MicGlyph className="h-6 w-6" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (state === "listening" ? stop() : void start())}
        aria-pressed={state === "listening"}
        aria-label={
          state === "listening" ? t("শোনা বন্ধ করুন", "Stop listening") : t("মাইকে বলুন", "Speak")
        }
        className={cn(
          "grid h-16 w-16 shrink-0 place-items-center rounded-[16px] transition-colors",
          state === "listening"
            ? "animate-pulse bg-accent text-accent-foreground"
            : "bg-foreground text-background",
          className,
        )}
      >
        <MicGlyph className="h-8 w-8" />
      </button>

      <div className={inline ? "hidden" : "col-span-full w-full"} aria-live="polite">
        {state === "idle" && !heard ? (
          <p className="font-bn mt-1 text-[14px] font-semibold text-foreground/70">
            {t(
              "মাইক চাপলে ফোন অনুমতি চাইবে · তারপর স্পষ্ট করে বলুন",
              "Tapping the mic asks for permission, then speak clearly.",
            )}
          </p>
        ) : null}
        {state === "listening" ? (
          <div className="mt-2 rounded-[16px] border-2 border-accent bg-accent/10 p-4">
            <p className="font-bn text-[18px] font-extrabold">{t("শুনছি…", "Listening…")}</p>
            <p className="font-bn mt-1 text-[15px] font-semibold">
              {t(
                "বলুন · শেষ হলে আবার মাইকে চাপুন",
                "Speak, then tap the mic again when you finish.",
              )}
            </p>
            {heard ? (
              <p className="font-bn mt-3 text-[17px] font-bold">
                {t("আপনি বলছেন:", "You are saying:")} {heard}
              </p>
            ) : null}
            <button
              type="button"
              onClick={stop}
              className="font-bn mt-3 min-h-[48px] rounded-full border border-foreground/20 bg-paper px-5 text-[15px] font-bold"
            >
              {t("বাতিল", "Cancel")}
            </button>
          </div>
        ) : null}
        {state === "processing" && heard ? (
          <p className="font-bn mt-2 text-[15px] font-bold">
            {t("আপনি বলেছেন:", "You said:")} {heard} ·{" "}
            {t("লিখেছি · এখন ‘খুঁজুন’ চাপুন", "Filled in. Now press Search.")}
          </p>
        ) : null}
        {state === "error" && error ? (
          <div className="mt-2 rounded-[16px] border-2 border-accent/40 bg-accent/10 p-4">
            <p className="font-bn text-[16px] font-bold">{error}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void start()}
                className="font-bn min-h-[48px] rounded-full bg-foreground px-5 text-[15px] font-bold text-background"
              >
                {t("আবার বলুন", "Try again")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
