"use client";

import { useTranslation, type Language } from "../lib/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const option = (lang: Language, label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(lang)}
      className={`px-1.5 py-0.5 text-xs font-medium rounded-[4px] transition-colors ${
        language === lang ? "text-navy bg-stone-200" : "text-stone-400 hover:text-stone-600"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-0.5 select-none" role="radiogroup" aria-label="Language">
      {option("en", "EN")}
      <span className="text-stone-300 text-xs">|</span>
      {option("bn", "বাং")}
    </div>
  );
}
