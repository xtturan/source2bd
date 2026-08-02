import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Bangla is the default and the primary language of every customer facing screen.
 * English is an optional toggle for literate users, persisted in localStorage.
 */
export type Lang = "bn" | "en";

const KEY = "s2b-lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (bn: string, en: string) => string };

const LangContext = createContext<Ctx>({ lang: "bn", setLang: () => {}, t: (bn) => bn });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  // Read after hydration so server and client markup match.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved === "en" || saved === "bn") setLangState(saved);
    } catch {
      /* storage blocked, stay on Bangla */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (bn: string, en: string) => (lang === "bn" ? bn : en) }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Shorthand: const t = useT(); t("বাংলা", "English") */
export function useT() {
  return useContext(LangContext).t;
}

/** Bangla text gets the Bengali face automatically. */
export function bnClass(lang: Lang) {
  return lang === "bn" ? "font-bn" : "";
}
