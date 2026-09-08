"use client";
import { useEffect, useState } from "react";
import { Building2, Phone, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function Clinics() {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { fetch("/api/clinics").then(r => r.json()).then(d => setList(d.clinics || [])); }, []);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black">{t.clinics.title}</h1>
        <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.clinics.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {list.map((c) => (
          <div key={c.id} className="glass-card glass-card-hover p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-gradient flex items-center justify-center text-royal-900 shadow-teal shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base">{c.name}</h3>
                <p className="text-xs text-white/60">{c.location}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-white/60"><Phone className="w-3 h-3 text-teal-400 shrink-0" /><span className="arabic-num truncate" dir="ltr">{c.phone}</span></div>
              <div className="flex items-center gap-2 text-white/60"><Clock className="w-3 h-3 text-teal-400 shrink-0" /><span>{c.workingHours}</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-teal-400 mb-2">{t.clinics.services}:</p>
              <div className="flex flex-wrap gap-1">
                {c.services.map((s: string, i: number) => <span key={i} className="badge-info text-xs">{s}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
