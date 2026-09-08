"use client";
import { useEffect, useState } from "react";
import { Pill, Plus, Check, Trash2 } from "lucide-react";
import Modal, { Field } from "@/components/Modal";
import { Empty } from "./Patients";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function Prescriptions({ user }: { user: any }) {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => fetch("/api/prescriptions").then(r => r.json()).then(d => setList(d.prescriptions || []));
  useEffect(() => {
    load();
    fetch("/api/medications").then(r => r.json()).then(d => setMeds(d.medications || []));
    fetch("/api/patients").then(r => r.json()).then(d => setPatients(d.patients || []));
  }, []);

  const addItem = () => setItems([...items, { medicationId: "", dosage: "", frequency: "", duration: "" }]);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const enrichedItems = items.map((it) => ({ ...it, medicationName: meds.find((m) => m.id === it.medicationId)?.name || "" }));
    const res = await fetch("/api/prescriptions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: fd.get("patientId"), doctorId: "D-1", items: enrichedItems, notes: fd.get("notes") }),
    });
    setLoading(false);
    if (res.ok) { setShowForm(false); setItems([]); load(); }
  };

  const deleteRx = async (id: string) => {
    if (!confirm(t.common.confirmDeleteMsg)) return;
    const res = await fetch(`/api/prescriptions/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const statusBadge = (s: string) => {
    const map: any = { pending: { label: t.rx.status.pending, cls: "badge-warning" }, dispensed: { label: t.rx.status.dispensed, cls: "badge-success" }, cancelled: { label: t.rx.status.cancelled, cls: "badge-danger" } };
    return <span className={map[s]?.cls}>{map[s]?.label}</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.rx.title}</h1>
          <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.rx.subtitle}</p>
        </div>
        {user?.role !== "pharmacist" && (
          <button onClick={() => setShowForm(true)} className="btn-teal flex items-center gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t.rx.new}</span>
          </button>
        )}
      </div>

      {list.length === 0 ? <Empty /> : (
        <div className="space-y-3">
          {list.map((rx) => (
            <div key={rx.id} className="glass-card p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{rx.patient?.fullName}</h3>
                  <p className="text-xs sm:text-sm text-teal-400">{rx.doctor?.fullName}</p>
                  <p className="text-xs text-white/50 mt-1 arabic-num">{new Date(rx.prescribedAt).toLocaleString("ar-SA")}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(rx.status)}
                  <button onClick={() => deleteRx(rx.id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg" title={t.common.delete}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 mb-3">
                {rx.items.map((it: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs sm:text-sm bg-white/5 rounded-lg p-2">
                    <Pill className="w-3 h-3 sm:w-4 sm:h-4 text-teal-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{it.medicationName}</p>
                      <p className="text-xs text-white/60">{it.dosage} • {it.frequency} • {it.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
              {rx.notes && <p className="text-xs text-white/50 mb-3">📝 {rx.notes}</p>}
              {user?.role === "pharmacist" && rx.status === "pending" && (
                <button className="btn-teal text-xs sm:text-sm flex items-center gap-1 min-h-[40px]">
                  <Check className="w-4 h-4" /> {t.rx.dispense}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={t.rx.new}>
          <form onSubmit={submit} className="space-y-3">
            <Field label={`${t.appointments.patient} *`}>
              <select name="patientId" required className="input-glass">
                <option value="">{t.appointments.selectPatient}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </Field>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-white/60">{t.rx.medications}</label>
                <button type="button" onClick={addItem} className="btn-glass text-xs">{t.rx.addMed}</button>
              </div>
              {items.map((it, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 mb-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <select value={it.medicationId} onChange={(e) => { const n = [...items]; n[i].medicationId = e.target.value; setItems(n); }} className="input-glass sm:col-span-2">
                    <option value="">{t.rx.selectMed}</option>
                    {meds.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input placeholder={t.rx.dosage} value={it.dosage} onChange={(e) => { const n = [...items]; n[i].dosage = e.target.value; setItems(n); }} className="input-glass arabic-num" dir="ltr" />
                  <input placeholder={t.rx.frequency} value={it.frequency} onChange={(e) => { const n = [...items]; n[i].frequency = e.target.value; setItems(n); }} className="input-glass" />
                </div>
              ))}
              <Field label={t.rx.duration}><input placeholder={t.rx.durationPh} onChange={(e) => { const n = [...items]; n.forEach((x: any) => x.duration = e.target.value); setItems([...n]); }} className="input-glass mt-2" /></Field>
            </div>
            <Field label={t.rx.notes}><textarea name="notes" rows={2} className="input-glass" /></Field>
            <button type="submit" disabled={loading || items.length === 0} className="btn-teal w-full min-h-[44px]">{loading ? t.rx.saving : t.common.save}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
