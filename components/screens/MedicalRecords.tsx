"use client";
import { useEffect, useState } from "react";
import { Plus, FileText, Heart, Thermometer, Activity, Trash2 } from "lucide-react";
import Modal, { Field } from "@/components/Modal";
import { Empty } from "./Patients";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function MedicalRecords({ user }: { user: any }) {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/medical-records").then(r => r.json()).then(d => setList(d.records || []));
    fetch("/api/patients").then(r => r.json()).then(d => setPatients(d.patients || []));
  }, []);

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const body = {
      patientId: fd.get("patientId"), doctorId: "D-1",
      chiefComplaint: fd.get("chiefComplaint"), diagnosis: fd.get("diagnosis"),
      treatment: fd.get("treatment"), notes: fd.get("notes"),
      followUpDate: fd.get("followUpDate"),
      vitalSigns: {
        bloodPressure: fd.get("bloodPressure"), heartRate: +(fd.get("heartRate") || 0),
        temperature: +(fd.get("temperature") || 0), weight: +(fd.get("weight") || 0), height: +(fd.get("height") || 0),
      },
    };
    const res = await fetch("/api/medical-records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) { setShowForm(false); fetch("/api/medical-records").then(r => r.json()).then(d => setList(d.records || [])); }
  };

  const deleteRec = async (id: string) => {
    if (!confirm(t.common.confirmDeleteMsg)) return;
    const res = await fetch(`/api/medical-records/${id}`, { method: "DELETE" });
    if (res.ok) fetch("/api/medical-records").then(r => r.json()).then(d => setList(d.records || []));
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.records.title}</h1>
          <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.records.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-teal flex items-center gap-2 min-h-[44px]">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t.records.add}</span>
        </button>
      </div>

      {list.length === 0 ? <Empty /> : (
        <div className="space-y-3">
          {list.map((r) => (
            <div key={r.id} className="glass-card p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-sm sm:text-base">{r.patient?.fullName}</h3>
                  <p className="text-xs sm:text-sm text-teal-400">{r.doctor?.fullName} — {r.visitDate}</p>
                </div>
              </div>

              {r.vitalSigns && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                  {r.vitalSigns.bloodPressure && <Vital icon={<Heart className="w-3 h-3 sm:w-4 sm:h-4" />} label={t.records.vitals.bp} value={r.vitalSigns.bloodPressure} />}
                  {r.vitalSigns.heartRate > 0 && <Vital icon={<Activity className="w-3 h-3 sm:w-4 sm:h-4" />} label={t.records.vitals.hr} value={`${r.vitalSigns.heartRate}`} />}
                  {r.vitalSigns.temperature > 0 && <Vital icon={<Thermometer className="w-3 h-3 sm:w-4 sm:h-4" />} label={t.records.vitals.temp} value={`${r.vitalSigns.temperature}°`} />}
                  {r.vitalSigns.weight > 0 && <Vital label={t.records.vitals.weight} value={`${r.vitalSigns.weight} كغ`} />}
                  {r.vitalSigns.height > 0 && <Vital label={t.records.vitals.height} value={`${r.vitalSigns.height} سم`} />}
                </div>
              )}

              <div className="space-y-2 text-xs sm:text-sm">
                <div><b className="text-teal-400">{t.records.complaint}:</b> {r.chiefComplaint}</div>
                <div><b className="text-teal-400">{t.records.diagnosis}:</b> {r.diagnosis}</div>
                <div><b className="text-teal-400">{t.records.treatment}:</b> {r.treatment}</div>
                {r.notes && <div className="text-white/60"><b>{t.records.notes}:</b> {r.notes}</div>}
                {r.followUpDate && <div className="text-amber-400 text-xs">📅 {t.patients.followUp}: {r.followUpDate}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={t.records.newRecord}>
          <form onSubmit={submit} className="space-y-3">
            <Field label={`${t.appointments.patient} *`}>
              <select name="patientId" required className="input-glass">
                <option value="">{t.appointments.selectPatient}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </Field>
            <Field label={`${t.records.complaint} *`}><input name="chiefComplaint" required className="input-glass" /></Field>
            <Field label={`${t.records.diagnosis} *`}><input name="diagnosis" required className="input-glass" /></Field>
            <Field label={`${t.records.treatment} *`}><textarea name="treatment" required rows={2} className="input-glass" /></Field>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Field label={t.records.bloodPressure}><input name="bloodPressure" className="input-glass arabic-num" dir="ltr" placeholder={t.records.bloodPressurePh} /></Field>
              <Field label={t.records.heartRate}><input name="heartRate" type="number" className="input-glass arabic-num" dir="ltr" /></Field>
              <Field label={t.records.temperature}><input name="temperature" type="number" step="0.1" className="input-glass arabic-num" dir="ltr" /></Field>
              <Field label={t.records.weight}><input name="weight" type="number" className="input-glass arabic-num" dir="ltr" /></Field>
              <Field label={t.records.height}><input name="height" type="number" className="input-glass arabic-num" dir="ltr" /></Field>
              <Field label={t.records.followUpDate}><input name="followUpDate" type="date" className="input-glass arabic-num" dir="ltr" /></Field>
            </div>
            <Field label={t.records.notes}><textarea name="notes" rows={2} className="input-glass" /></Field>
            <button type="submit" disabled={loading} className="btn-teal w-full min-h-[44px]">{loading ? t.records.saving : t.common.save}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Vital({ icon, label, value }: any) {
  return (
    <div className="bg-white/5 rounded-lg p-2 text-center">
      <div className="flex justify-center text-teal-400 mb-1">{icon}</div>
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-xs sm:text-sm font-bold arabic-num">{value}</p>
    </div>
  );
}
