"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ar } from "./ar";
import { en } from "./en";

export type Locale = "ar" | "en";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof ar;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // استرجاع اللغة المحفوظة
    const saved = localStorage.getItem("hospital-locale") as Locale;
    if (saved && (saved === "ar" || saved === "en")) {
      setLocaleState(saved);
    } else {
      // كشف لغة المتصفح
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("en")) setLocaleState("en");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isRTL = locale === "ar";
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    localStorage.setItem("hospital-locale", locale);
  }, [locale, mounted]);

  const setLocale = (l: Locale) => setLocaleState(l);
  const t = locale === "ar" ? ar : en;
  const isRTL = locale === "ar";

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

// دالة مختصرة للحصول على الترجمة
export function useT() {
  return useI18n().t;
}
