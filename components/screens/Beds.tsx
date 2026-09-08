"use client";
import { useEffect, useState } from "react";
import { Bed, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function Beds() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const load = () => fetch("/api/beds").then(r => r.json()).then(setData);
  useEffect(() => { load(); }, []);

  const changeStatus = async (bedId: string, status: string) => {
    await fetch("/api/beds", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bedId, status }) });
    load(); setSelected(null);
  };

  const deleteBed = async (id: string) => {
    if (!confirm(t.common.confirmDeleteMsg)) return;
    const res = await fetch(`/api/beds/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) { load(); setSelected(null); }
    else alert(data.error);
  };

  if (!data) return <div className="text-center text-white/40 py-20">{t.common.loading}</div>;

  const { summary, beds } = data;
  const wards = [...new Set(beds.map((b: any) => b.ward))];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black">{t.beds.title}</h1>
        <p className="text-white/50 text-xs sm:text-sm">{summary.total} {t.beds.subtitle} • {t.beds.occupancyRate} {summary.occupancyRate}%</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
        <div className="glass-card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-black text-emerald-400 arabic-num">{summary.available}</p><p className="text-xs text-white/50 mt-1">{t.beds.available}</p></div>
        <div className="glass-card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-black text-rose-400 arabic-num">{summary.occupied}</p><p className="text-xs text-white/50 mt-1">{t.beds.occupied}</p></div>
        <div className="glass-card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-black text-amber-400 arabic-num">{summary.cleaning}</p><p className="text-xs text-white/50 mt-1">{t.beds.cleaning}</p></div>
        <div className="glass-card p-3 sm:p-4 text-center"><p className="text-2xl sm:text-3xl font-black text-blue-400 arabic-num">{summary.maintenance}</p><p className="text-xs text-white/50 mt-1">{t.beds.maintenance}</p></div>
        <div className="glass-card p-3 sm:p-4 text-center bg-gradient-to-br from-teal-400/20 to-teal-600/5 col-span-2 md:col-span-1">
          <p className="text-2xl sm:text-3xl font-black text-teal-400 arabic-num">{summary.occupancyRate}%</p>
          <p className="text-xs text-white/50 mt-1">{t.beds.occupancyRate}</p>
        </div>
      </div>

      {wards.map((ward: any) => (
        <div key={ward}>
          <h3 className="font-bold text-teal-400 mb-3 text-sm sm:text-base">{ward}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {beds.filter((b: any) => b.ward === ward).map((b: any) => (
              <button key={b.id} onClick={() => setSelected(b)} className={`glass-card glass-card-hover p-3 sm:p-4 text-center ${b.status === "occupied" ? "border-rose-400/40" : b.status === "available" ? "border-emerald-400/40" : b.status === "cleaning" ? "border-amber-400/40" : "border-blue-400/40"}`}>
                <Bed className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${b.status === "occupied" ? "text-rose-400" : b.status === "available" ? "text-emerald-400" : b.status === "cleaning" ? "text-amber-400" : "text-blue-400"}`} />
                <p className="font-bold arabic-num text-sm">{b.roomNumber}</p>
                <p className="text-xs text-white/50 mt-1">{b.status === "occupied" ? t.beds.occupied : b.status === "available" ? t.beds.available : b.status === "cleaning" ? t.beds.cleaning : t.beds.maintenance}</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {selected && (
        <Modal onClose={() => setSelected(null)} title={`${t.beds.title} - ${selected.roomNumber}`}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-white/50">{t.beds.ward}</p><p className="font-bold text-sm">{selected.ward}</p></div>
              <div className="bg-white/5 rounded-lg p-3"><p className="text-xs text-white/50">{t.beds.dailyRate}</p><p className="font-bold text-teal-400 arabic-num text-sm">{selected.dailyRate} {t.billing.sar}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => changeStatus(selected.id, "available")} className="btn-teal text-sm min-h-[40px]">{t.beds.actions.free}</button>
              <button onClick={() => changeStatus(selected.id, "cleaning")} className="btn-glass text-sm min-h-[40px]">{t.beds.actions.clean}</button>
              <button onClick={() => changeStatus(selected.id, "maintenance")} className="btn-glass text-sm min-h-[40px]">{t.beds.actions.maintain}</button>
              <button onClick={() => changeStatus(selected.id, "occupied")} className="btn-glass text-sm min-h-[40px]">{t.beds.actions.admit}</button>
            </div>
            {selected.status !== "occupied" && (
              <button onClick={() => deleteBed(selected.id)} className="w-full min-h-[40px] flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl transition-all border border-red-500/30">
                <Trash2 className="w-4 h-4" /> {t.common.delete}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
