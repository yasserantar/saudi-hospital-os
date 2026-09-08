"use client";
import { useEffect, useState } from "react";
import { Pill, AlertTriangle, Package, DollarSign } from "lucide-react";
import { Empty } from "./Patients";
import { useI18n } from "@/lib/i18n/I18nContext";
import { useMediaQuery, breakpoints } from "@/hooks/useMediaQuery";

export default function Pharmacy() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("");
  const isMobile = useMediaQuery(breakpoints.mobile);

  useEffect(() => { fetch("/api/medications").then(r => r.json()).then(setData); }, []);

  if (!data) return <div className="text-center text-white/40 py-20">{t.common.loading}</div>;

  const filtered = data.medications.filter((m: any) => !filter || m.name.includes(filter) || m.scientificName.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black">{t.pharmacy.title}</h1>
        <p className="text-white/50 text-xs sm:text-sm">{data.total} {t.pharmacy.subtitle} • {t.pharmacy.inventoryValue}: {data.inventoryValue.toLocaleString("ar-SA")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-teal-400/20 to-teal-600/5">
          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 mb-2" />
          <p className="text-xl sm:text-2xl font-black arabic-num">{data.total}</p>
          <p className="text-xs text-white/60">{t.pharmacy.totalItems}</p>
        </div>
        <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-amber-400/20 to-amber-600/5">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-2" />
          <p className="text-xl sm:text-2xl font-black arabic-num">{data.lowStock.length}</p>
          <p className="text-xs text-white/60">{t.pharmacy.lowStock}</p>
        </div>
        <div className="glass-card p-4 sm:p-5 bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 col-span-2 md:col-span-1">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 mb-2" />
          <p className="text-xl sm:text-2xl font-black arabic-num">{(data.inventoryValue / 1000).toFixed(1)}k</p>
          <p className="text-xs text-white/60">{t.pharmacy.inventoryValue}</p>
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="glass-card p-3 sm:p-4 border-amber-400/30 bg-amber-500/5">
          <p className="font-bold text-amber-400 mb-2 flex items-center gap-2 text-sm"><AlertTriangle className="w-4 h-4" /> {t.pharmacy.alertTitle}</p>
          <div className="flex flex-wrap gap-2">
            {data.lowStock.map((m: any) => <span key={m.id} className="badge-warning text-xs">{m.name} ({m.stock})</span>)}
          </div>
        </div>
      )}

      <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t.pharmacy.searchPh} className="input-glass" />

      {/* Mobile: Cards / Desktop: Table */}
      {isMobile ? (
        <div className="space-y-2">
          {filtered.map((m: any) => (
            <div key={m.id} className="glass-card p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{m.name}</p>
                  <p className="text-xs text-white/60">{m.scientificName}</p>
                </div>
                <span className="badge-info text-xs shrink-0">{m.category}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-white/50">{t.pharmacy.table.stock}: </span><span className={`font-bold arabic-num ${m.stock < 50 ? "text-amber-400" : "text-emerald-400"}`}>{m.stock}</span></div>
                <div><span className="text-white/50">{t.pharmacy.table.price}: </span><span className="font-bold arabic-num">{m.unitPrice}</span></div>
                <div><span className="text-white/50">{t.pharmacy.table.expiry}: </span><span className="arabic-num">{m.expiryDate.substring(0, 7)}</span></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto glass-card p-3 sm:p-4">
          <table className="w-full text-sm">
            <thead className="text-white/50 text-xs border-b border-white/10">
              <tr>
                <th className="text-start p-3">{t.pharmacy.table.name}</th>
                <th className="text-start p-3">{t.pharmacy.table.scientific}</th>
                <th className="text-start p-3">{t.pharmacy.table.category}</th>
                <th className="text-start p-3 arabic-num">{t.pharmacy.table.stock}</th>
                <th className="text-start p-3 arabic-num">{t.pharmacy.table.price}</th>
                <th className="text-start p-3 arabic-num">{t.pharmacy.table.expiry}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 font-bold">{m.name}</td>
                  <td className="p-3 text-white/60">{m.scientificName}</td>
                  <td className="p-3"><span className="badge-info">{m.category}</span></td>
                  <td className={`p-3 arabic-num ${m.stock < 50 ? "text-amber-400" : "text-emerald-400"}`}>{m.stock}</td>
                  <td className="p-3 arabic-num">{m.unitPrice} {t.billing.sar}</td>
                  <td className="p-3 text-white/60 arabic-num">{m.expiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <Empty />}
        </div>
      )}
    </div>
  );
}
