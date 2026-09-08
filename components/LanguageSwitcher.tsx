"use client";
import { Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const other = locale === "ar" ? "en" : "ar";
  const otherLabel = other === "ar" ? t.common.arabic : t.common.english;

  return (
    <button
      onClick={() => setLocale(other)}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
        compact ? "bg-white/5 hover:bg-white/10" : "glass-card glass-card-hover"
      } border border-white/10 hover:border-teal-400/40`}
      title={t.common.language}
      aria-label={`Switch to ${otherLabel}`}
    >
      <Globe className={`w-4 h-4 text-teal-400 transition-transform duration-500 ${locale === "en" ? "rotate-180" : ""}`} />
      <span className="text-sm font-bold text-white arabic-num">
        {locale === "ar" ? "EN" : "ع"}
      </span>
      {!compact && (
        <span className="hidden sm:inline text-xs text-white/60">
          {otherLabel}
        </span>
      )}
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
