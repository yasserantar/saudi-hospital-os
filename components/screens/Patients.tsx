"use client";
import { useEffect, useState } from "react";
import { Search, Plus, UserPlus, Pencil, Trash2, X, Check } from "lucide-react";
import Modal, { Field, Mini, Section } from "@/components/Modal";
import { useI18n } from "@/lib/i18n/I18nContext";
import { useMediaQuery, breakpoints } from "@/hooks/useMediaQuery";

export default function Patients() {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [confirmDel, setConfirmDel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const isMobile = useMediaQuery(breakpoints.mobile);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => fetch(`/api/patients?q=${search}`).then(r => r.json()).then(d => setList(d.patients || []));
  useEffect(() => { load(); }, [search]);

  const viewDetails = async (id: string) => {
    const res = await fetch(`/api/patients/${id}`).then(r => r.json());
    setSelected(res);
  };

  const deletePatient = async (id: string) => {
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      showToast("success", data.message || t.common.deleted);
      setConfirmDel(null);
      load();
    } else {
      showToast("error", data.error);
    }
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const body = {
      fullName: fd.get("fullName"), nationalId: fd.get("nationalId"), dateOfBirth: fd.get("dateOfBirth"),
      gender: fd.get("gender"), phone: fd.get("phone"), email: fd.get("email"), bloodType: fd.get("bloodType"),
      address: fd.get("address"), insuranceCompany: fd.get("insuranceCompany"), insuranceNumber: fd.get("insuranceNumber"),
      allergies: fd.get("allergies")?.toString().split(",").map((s: string) => s.trim()).filter(Boolean) || [],
      chronicDiseases: fd.get("chronicDiseases")?.toString().split(",").map((s: string) => s.trim()).filter(Boolean) || [],
    };
    const url = editing ? `/api/patients/${editing.id}` : "/api/patients";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setShowForm(false);
      setEditing(null);
      load();
      showToast("success", editing ? t.common.updated : t.common.success);
    } else {
      showToast("error", data.error);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.patients.title}</h1>
          <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.patients.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-teal flex items-center gap-2 min-h-[44px]">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t.patients.registerNew}</span>
        </button>
      </div>

      <div className="glass-card p-3 sm:p-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-white/40 shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.patients.searchPlaceholder} className="bg-transparent flex-1 outline-none text-sm" />
      </div>

      {/* Mobile: Cards / Desktop: Grid */}
      <div className={isMobile ? "space-y-3" : "grid md:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {list.map((p) => (
          <div key={p.id} className="glass-card glass-card-hover p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-400/10 flex items-center justify-center text-teal-400 font-bold text-base sm:text-lg shrink-0">
                {p.fullName[0]}
              </div>
              <span className="badge-info arabic-num text-xs">{p.fileNumber}</span>
            </div>
            <h3 className="font-bold mb-1 text-sm sm:text-base">{p.fullName}</h3>
            <p className="text-xs text-white/50 mb-2 arabic-num" dir="ltr">{p.nationalId}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {p.bloodType && <span className="badge-info text-xs">{p.bloodType}</span>}
              {p.allergies?.length > 0 && <span className="badge-danger text-xs">{p.allergies.length} {t.patients.allergies}</span>}
              {p.insuranceCompany && <span className="badge-success text-xs">{p.insuranceCompany}</span>}
            </div>
            <div className="text-xs text-white/60 arabic-num mb-3">{p.phone}</div>
            <button onClick={() => viewDetails(p.id)} className="btn-glass w-full text-xs min-h-[40px] mb-2">{t.patients.viewFile}</button>
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); setEditing(p); setShowForm(true); }} className="btn-glass flex-1 flex items-center justify-center gap-1 text-xs min-h-[40px] hover:bg-blue-500/20">
                <Pencil className="w-3.5 h-3.5" /> <span>{t.common.edit}</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setConfirmDel(p); }} className="btn-glass flex-1 flex items-center justify-center gap-1 text-xs min-h-[40px] hover:bg-red-500/20 text-red-400">
                <Trash2 className="w-3.5 h-3.5" /> <span>{t.common.delete}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <Modal onClose={() => { setShowForm(false); setEditing(null); }} title={editing ? t.common.edit : t.patients.registerNew}>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={`${t.auth.fullName} *`}><input name="fullName" required defaultValue={editing?.fullName || ""} className="input-glass" /></Field>
            <Field label={t.patients.form.nationalIdReq}><input name="nationalId" required defaultValue={editing?.nationalId || ""} className="input-glass arabic-num" dir="ltr" /></Field>
            <Field label={t.patients.form.dob}><input name="dateOfBirth" type="date" required defaultValue={editing?.dateOfBirth || ""} className="input-glass arabic-num" dir="ltr" /></Field>
            <Field label={t.patients.form.gender}>
              <select name="gender" required defaultValue={editing?.gender || "male"} className="input-glass">
                <option value="male">{t.patients.form.male}</option>
                <option value="female">{t.patients.form.female}</option>
              </select>
            </Field>
            <Field label={`${t.auth.phone} *`}><input name="phone" required defaultValue={editing?.phone || ""} className="input-glass arabic-num" dir="ltr" placeholder={t.auth.placeholderPhone} /></Field>
            <Field label={t.auth.email}><input name="email" type="email" defaultValue={editing?.email || ""} className="input-glass" dir="ltr" /></Field>
            <Field label={t.patients.bloodType}>
              <select name="bloodType" defaultValue={editing?.bloodType || ""} className="input-glass">
                <option value="">—</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </Field>
            <Field label={t.patients.form.address}><input name="address" defaultValue={editing?.address || ""} className="input-glass" /></Field>
            <Field label={t.patients.form.insuranceCompany}><input name="insuranceCompany" defaultValue={editing?.insuranceCompany || ""} className="input-glass" /></Field>
            <Field label={t.patients.form.policyNumber}><input name="insuranceNumber" defaultValue={editing?.insuranceNumber || ""} className="input-glass arabic-num" dir="ltr" /></Field>
            <Field label={t.patients.form.allergies}><input name="allergies" defaultValue={editing?.allergies?.join(", ") || ""} className="input-glass" placeholder={t.patients.form.allergiesPlaceholder} /></Field>
            <Field label={t.patients.form.chronic}><input name="chronicDiseases" defaultValue={editing?.chronicDiseases?.join(", ") || ""} className="input-glass" placeholder={t.patients.form.chronicPlaceholder} /></Field>
            <button type="submit" disabled={loading} className="btn-teal sm:col-span-2 min-h-[44px]">{loading ? t.patients.form.saving : editing ? t.common.saveChanges : t.patients.form.save}</button>
          </form>
        </Modal>
      )}

      {confirmDel && (
        <Modal onClose={() => setConfirmDel(null)} title={t.common.confirmDelete}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <Trash2 className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <p className="font-bold mb-1">{t.common.confirmDeleteMsg}</p>
                <p className="text-sm text-white/70">{confirmDel.fullName}</p>
                <p className="text-xs text-white/50 mt-1">سيتم حذف جميع المواعيد والوصفات والسجلات والتحاليل والفواتير المرتبطة.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="btn-glass flex-1 min-h-[44px] flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> {t.common.cancel}
              </button>
              <button onClick={() => deletePatient(confirmDel.id)} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-xl transition-all border border-red-500/30">
                <Trash2 className="w-4 h-4" /> {t.common.confirmDeleteBtn}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl animate-slide-up flex items-center gap-2 min-w-[280px] ${toast.type === "success" ? "bg-green-500/20 border border-green-500/40 text-green-300" : "bg-red-500/20 border border-red-500/40 text-red-300"}`}>
          {toast.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.msg}</span>
        </div>
      )}

      {selected && (
        <Modal onClose={() => setSelected(null)} title={selected.patient.fullName}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <Mini label={t.patients.fileNumber} value={selected.patient.fileNumber} />
              <Mini label={t.patients.nationalId} value={selected.patient.nationalId} />
              <Mini label={t.patients.bloodType} value={selected.patient.bloodType || "—"} />
              <Mini label={t.patients.phone} value={selected.patient.phone} />
              <Mini label={t.patients.insurance} value={selected.patient.insuranceCompany || "—"} />
              <Mini label={t.patients.policy} value={selected.patient.insuranceNumber || "—"} />
            </div>

            <Section title={t.patients.records}>
              {selected.records.length === 0 ? <Empty /> : selected.records.map((r: any) => (
                <div key={r.id} className="bg-white/5 rounded-lg p-3 mb-2 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-teal-400 arabic-num">{r.visitDate}</span>
                    <span className="text-xs text-white/50">{r.doctor?.fullName}</span>
                  </div>
                  <p><b>{t.records.diagnosis}:</b> {r.diagnosis}</p>
                  <p className="text-white/70"><b>{t.records.treatment}:</b> {r.treatment}</p>
                </div>
              ))}
            </Section>

            <Section title={t.patients.prescriptions}>
              {selected.prescriptions.length === 0 ? <Empty /> : selected.prescriptions.map((rx: any) => (
                <div key={rx.id} className="bg-white/5 rounded-lg p-3 mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="badge-info">{rx.status === "pending" ? t.rx.status.pending : rx.status === "dispensed" ? t.rx.status.dispensed : t.rx.status.cancelled}</span>
                    <span className="text-xs arabic-num text-white/50">{new Date(rx.prescribedAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                  <ul className="text-sm">
                    {rx.items.map((it: any, i: number) => (
                      <li key={i}>• {it.medicationName} — {it.dosage} {it.frequency} {t.rx.duration} {it.duration}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Section>

            <Section title={t.patients.labTests}>
              {selected.labTests.length === 0 ? <Empty /> : selected.labTests.map((tt: any) => (
                <div key={tt.id} className="bg-white/5 rounded-lg p-3 mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="badge-info">{tt.testType}</span>
                    <span className={`badge-${tt.status === "completed" ? "success" : "warning"}`}>
                      {tt.status === "completed" ? t.labs.status.completed : t.labs.status.inProgress}
                    </span>
                  </div>
                  {tt.results && <p className="text-sm text-white/70">{tt.results}</p>}
                </div>
              ))}
            </Section>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Empty() {
  const { t } = useI18n();
  return <p className="text-sm text-white/40 text-center py-2">{t.common.noData}</p>;
}
