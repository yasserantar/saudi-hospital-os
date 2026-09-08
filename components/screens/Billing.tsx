"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import Modal, { Field } from "@/components/Modal";
import { Empty } from "./Patients";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function Billing() {
  const { t } = useI18n();
  const [list, setList] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [items] = useState([{ description: "استشارة", quantity: 1, unitPrice: 200, total: 200, type: "consultation" }]);

  const load = () => fetch("/api/invoices").then(r => r.json()).then(d => setList(d.invoices || []));
  useEffect(() => {
    load();
    fetch("/api/patients").then(r => r.json()).then(d => setPatients(d.patients || []));
  }, []);

  const submit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      patientId: fd.get("patientId"), items, discount: +(fd.get("discount") || 0), status: "pending", paymentMethod: fd.get("paymentMethod"),
    })});
    if (res.ok) { setShowForm(false); load(); }
  };

  const deleteInv = async (id: string) => {
    if (!confirm(t.common.confirmDeleteMsg)) return;
    const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) load();
    else alert(data.error);
  };

  const markPaid = async (id: string) => {
    const res = await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "paid" }) });
    if (res.ok) load();
  };

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.15);
  const total = subtotal + tax;

  const statusBadge = (s: string) => {
    const map: any = { pending: { l: t.billing.status.pending, c: "badge-warning" }, paid: { l: t.billing.status.paid, c: "badge-success" }, insurance: { l: t.billing.status.insurance, c: "badge-info" }, cancelled: { l: t.billing.status.cancelled, c: "badge-danger" } };
    return <span className={map[s]?.c}>{map[s]?.l}</span>;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">{t.billing.title}</h1>
          <p className="text-white/50 text-xs sm:text-sm">{list.length} {t.billing.subtitle}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-teal flex items-center gap-2 min-h-[44px]">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">{t.billing.new}</span>
        </button>
      </div>

      {list.length === 0 ? <Empty /> : (
        <div className="space-y-2">
          {list.map((inv) => (
            <div key={inv.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold arabic-num text-sm sm:text-base">{inv.invoiceNumber}</h3>
                    {statusBadge(inv.status)}
                  </div>
                  <p className="text-xs sm:text-sm text-white/60">{inv.patient?.fullName}</p>
                  <p className="text-xs text-white/40 arabic-num">{new Date(inv.createdAt).toLocaleString("ar-SA")}</p>
                </div>
                <div className="text-start sm:text-end">
                  <p className="text-xl sm:text-2xl font-black text-teal-400 arabic-num">{inv.total.toLocaleString("ar-SA")}</p>
                  <p className="text-xs text-white/50">{t.billing.sar}</p>
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    {inv.status === "pending" && (
                      <button onClick={() => markPaid(inv.id)} className="text-xs text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded min-h-[28px] flex items-center gap-1" title={t.billing.markPaid}>
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => deleteInv(inv.id)} className="text-xs text-red-400 hover:bg-red-500/10 p-1 rounded" title={t.common.delete}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-xs">
                <span className="text-white/60">{t.billing.subtotal}: <b className="text-white arabic-num">{inv.subtotal}</b></span>
                <span className="text-white/60">{t.billing.discount}: <b className="text-white arabic-num">{inv.discount}</b></span>
                <span className="text-white/60">{t.billing.tax}: <b className="text-white arabic-num">{inv.tax}</b></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={t.billing.new}>
          <form onSubmit={submit} className="space-y-3">
            <Field label={`${t.appointments.patient} *`}>
              <select name="patientId" required className="input-glass">
                <option value="">{t.labs.select}</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </Field>
            <Field label={t.billing.paymentMethod}>
              <select name="paymentMethod" className="input-glass">
                <option value="cash">{t.billing.cash}</option>
                <option value="card">{t.billing.card}</option>
                <option value="insurance">{t.billing.insurance}</option>
                <option value="transfer">{t.billing.transfer}</option>
              </select>
            </Field>
            <Field label={t.billing.discount}><input name="discount" type="number" defaultValue="0" className="input-glass arabic-num" dir="ltr" /></Field>
            <div className="bg-teal-gradient text-royal-900 rounded-xl p-4 shadow-teal">
              <div className="flex justify-between text-sm"><span>{t.billing.subtotal}</span><span className="font-bold arabic-num">{subtotal} {t.billing.sar}</span></div>
              <div className="flex justify-between text-sm"><span>{t.billing.tax}</span><span className="font-bold arabic-num">{tax} {t.billing.sar}</span></div>
              <div className="flex justify-between text-lg pt-2 border-t border-royal-900/20"><b>{t.billing.total}</b><b className="arabic-num">{total} {t.billing.sar}</b></div>
            </div>
            <button type="submit" className="btn-teal w-full min-h-[44px]">{t.billing.issue}</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
