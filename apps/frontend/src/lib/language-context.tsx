"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import en from "../translations/en";
import bn from "../translations/bn";
import type { TranslationKey } from "../translations/en";

export type Language = "en" | "bn";

const STORAGE_KEY = "shohojrin-lang";

const translations = { en, bn } as const;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, varsOrFallback?: Record<string, string | number> | string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with "en" to match server render, then hydrate from localStorage
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "bn" || stored === "en") {
      setLanguageState(stored);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, varsOrFallback?: Record<string, string | number> | string): string => {
      let str = translations[language][key] ?? translations.en[key] ?? (typeof varsOrFallback === "string" ? varsOrFallback : key);
      if (varsOrFallback && typeof varsOrFallback === "object") {
        for (const [k, v] of Object.entries(varsOrFallback)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return str;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return ctx;
}

/** Whether the language provider has mounted (for hydration-safe rendering). */
export function useLanguageMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
