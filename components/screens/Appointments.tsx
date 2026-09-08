"use client";
import { useEffect, useState } from "react";
import { Plus, Calendar, Clock, Trash2 } from "lucide-react";
import Modal, { Field } from "@/components/Modal";
import { Empty } from "./Patients";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function Appointments() {
  const { t } = useI18n();
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [list, setList] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => fetch(`/api/appointments?date=${date}`).then(r => r.json()).then(d => setList(d.appointments || []));
  useEffect(() => {
    load();
    fetch("/api/patients").then(r => r.json()).then(d => setPatients(d.patients || []));
    fetch("/api/doctors").then(r => r.json()).then(d => setDoctors(d.doctors || []));
  }, [date]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  };

  const deleteAppt = async (id: string) => {
    if (!confirm(t.common.confirmDeleteMsg)) return;
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    if (res.ok) load();
  };

  const submit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    const res = await fetch("/api/appointments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: fd.get("patientId"), doctorId: fd.get("doctorId"),
        date: fd.get("date"), time: fd.get("time"), reason: fd.get("reason"), createdBy: "reception",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) { setShowForm(false); load(); }
    else alert(data.error);
  };

  const statusBadge = (s: string) => {
    const map: any = {
      scheduled: { label: t.appointments.status.scheduled, cls: "badge-info" },
      confirmed: { label: t.appointments.status.confirmed, cls: "badge-success" },
      completed: { label: t.appointments.status.completed, cls: "badge-success" },
      cancelled: { label: t.appointments.status.cancelled, cls: "badge-danger" },
      no_show: { label: t.appointments.status.noShow, cls: "badge-warning" },
    };
    return <span className={map[s]?.cls}>{map[s]?.label}</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.appointments.title}</h1>
          <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.appointments.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-glass arabic-num w-auto min-h-[44px]" dir="ltr" />
          <button onClick={() => setShowForm(true)} className="btn-teal flex items-center gap-2 min-h-[44px]">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t.appointments.newAppointment}</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? <Empty /> : (
        <div className="space-y-2">
          {list.sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
            <div key={a.id} className="glass-card glass-card-hover p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="bg-teal-gradient text-royal-900 px-3 sm:px-4 py-2 rounded-lg font-bold arabic-num text-center shrink-0">
                    <Clock className="w-3 h-3 inline sm:hidden" /><br className="sm:hidden" />
                    <span className="text-sm sm:text-base">{a.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm sm:text-base truncate">{a.patient?.fullName}</p>
                    <p className="text-xs sm:text-sm text-teal-400 truncate">{a.doctor?.fullName} — {a.doctor?.specialization}</p>
                    <p className="text-xs text-white/50 mt-1 truncate">{a.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(a.status)}
                  {a.status === "scheduled" && (
                    <button onClick={() => updateStatus(a.id, "confirmed")} className="btn-glass text-xs min-h-[36px]">{t.appointments.confirm}</button>
                  )}
                  {a.status === "confirmed" && (
                    <button onClick={() => updateStatus(a.id, "completed")} className="btn-glass text-xs min-h-[36px]">{t.appointments.complete}</button>
                  )}
                  {a.status !== "cancelled" && a.status !== "completed" && (
                    <button onClick={() => updateStatus(a.id, "cancelled")} className="text-xs text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg min-h-[36px]">{t.appointments.cancel}</button>
                  )}
                  <button onClick={() => deleteAppt(a.id)} className="text-xs text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center" title={t.common.delete}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={t.appointments.newAppointment}>
          <form onSubmit={submit} className="space-y-3">
            <Field label={`${t.appointments.patient} *`}>
              <select name="patientId" required className="input-glass">
                <option value="">{t.appointments.selectPatient}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.fileNumber})</option>)}
              </select>
            </Field>
            <Field label={`${t.appointments.doctor} *`}>
              <select name="doctorId" required className="input-glass">
                <option value="">{t.appointments.selectDoctor}</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.fullName} — {d.specialization}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={`${t.appointments.date} *`}><input name="date" type="date" required className="input-glass arabic-num" dir="ltr" defaultValue={date} /></Field>
              <Field label={`${t.appointments.time} *`}><input name="time" type="time" required className="input-glass arabic-num" dir="ltr" /></Field>
            </div>
            <Field label={t.appointments.reason}><input name="reason" className="input-glass" placeholder={t.appointments.reasonPlaceholder} /></Field>
            <button type="submit" disabled={loading} className="btn-teal w-full min-h-[44px]">{loading ? t.appointments.booking : t.appointments.booked}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
