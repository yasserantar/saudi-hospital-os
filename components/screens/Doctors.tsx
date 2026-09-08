"use client";
import { useEffect, useState } from "react";
import { Stethoscope, Star, Award, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function Doctors() {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { fetch("/api/doctors").then(r => r.json()).then(d => setList(d.doctors || [])); }, []);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black">{t.doctors.title}</h1>
        <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.doctors.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {list.map((d) => (
          <div key={d.id} className="glass-card glass-card-hover p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-teal-gradient flex items-center justify-center text-royal-900 text-lg sm:text-xl font-black shrink-0 shadow-teal">
                {d.fullName.split(" ").slice(-2)[0][0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg truncate">{d.fullName}</h3>
                <p className="text-xs sm:text-sm text-teal-400">{d.specialization}</p>
                <p className="text-xs text-white/50 mt-1 arabic-num" dir="ltr">{t.doctors.license}: {d.licenseNumber}</p>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3 text-xs">
                  <div className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {d.rating}</div>
                  <div className="flex items-center gap-1 text-white/60"><Award className="w-3 h-3" /> {d.yearsExperience} {t.doctors.experience}</div>
                  <div className="flex items-center gap-1 text-white/60"><Clock className="w-3 h-3" /> {d.workingHours.from} - {d.workingHours.to}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-xs text-white/50">{t.doctors.consultationFee}</p>
                <p className="font-bold text-teal-400 arabic-num">{d.consultationFee} ر.س</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <p className="text-xs text-white/50">{t.doctors.workDays}</p>
                <p className="font-bold arabic-num">{d.availableDays.length} {t.doctors.days}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
