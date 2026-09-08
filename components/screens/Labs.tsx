"use client";
import { useEffect, useState } from "react";
import { FlaskConical, Plus, Trash2 } from "lucide-react";
import Modal, { Field } from "@/components/Modal";
import { Empty } from "./Patients";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function Labs() {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const load = () => fetch("/api/labs").then(r => r.json()).then(d => setList(d.labTests || []));
  useEffect(() => {
    load();
    fetch("/api/patients").then(r => r.json()).then(d => setPatients(d.patients || []));
  }, []);

  const submit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await fetch("/api/labs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      patientId: fd.get("patientId"), doctorId: "D-1", testType: fd.get("testType"),
    })});
    setShowForm(false); load();
  };

  const deleteLab = async (id: string) => {
    if (!confirm(t.common.confirmDeleteMsg)) return;
    const res = await fetch(`/api/labs/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const statusBadge = (s: string) => {
    const map: any = { pending: { l: t.labs.status.pending, c: "badge-warning" }, in_progress: { l: t.labs.status.inProgress, c: "badge-info" }, completed: { l: t.labs.status.completed, c: "badge-success" }, cancelled: { l: t.labs.status.cancelled, c: "badge-danger" } };
    return <span className={map[s]?.c}>{map[s]?.l}</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.labs.title}</h1>
          <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.labs.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-teal flex items-center gap-2 min-h-[44px]">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t.labs.new}</span>
        </button>
      </div>

      {list.length === 0 ? <Empty /> : (
        <div className="space-y-3">
          {list.map((tt) => (
            <div key={tt.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{tt.testType}</h3>
                  <p className="text-xs sm:text-sm text-white/60">{tt.patient?.fullName} • {tt.doctor?.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(tt.status)}
                  <button onClick={() => deleteLab(tt.id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg" title={t.common.delete}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {tt.results && (
                <div className="bg-white/5 rounded-lg p-3 mt-2">
                  <p className="text-xs text-teal-400 mb-1">{t.labs.results}:</p>
                  <p className="text-xs sm:text-sm">{tt.results}</p>
                  {tt.normalRange && <p className="text-xs text-white/50 mt-1">{t.labs.normalRange}: {tt.normalRange}</p>}
                </div>
              )}
              <p className="text-xs text-white/40 mt-2 arabic-num">{new Date(tt.requestedAt).toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={t.labs.newRequest}>
          <form onSubmit={submit} className="space-y-3">
            <Field label={`${t.appointments.patient} *`}>
              <select name="patientId" required className="input-glass">
                <option value="">{t.labs.select}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </Field>
            <Field label={`${t.labs.testType} *`}>
              <select name="testType" required className="input-glass">
                <option value="">{t.labs.select}</option>
                <option>صورة دم كاملة (CBC)</option><option>سكر صائم (FBS)</option><option>سكر تراكمي (HbA1c)</option>
                <option>وظائف كلى (KFT)</option><option>وظائف كبد (LFT)</option><option>دهون الدم (Lipid Profile)</option>
                <option>هرمونات الغدة الدرقية (TSH)</option><option>بول عام (Urinalysis)</option>
              </select>
            </Field>
            <button type="submit" className="btn-teal w-full min-h-[44px]">{t.labs.new}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
