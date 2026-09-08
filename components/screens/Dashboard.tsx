"use client";
import { useEffect, useState } from "react";
import { Users, Stethoscope, Calendar, FileText, Pill, FlaskConical, Receipt, Bed, TrendingUp, Activity, Heart, Sparkles, UserPlus, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import { CardSkeleton } from "@/components/Skeleton";

export default function Dashboard({ user }: { user: any }) {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
    const t = setInterval(() => fetch("/api/dashboard").then(r => r.json()).then(setData), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  const k = data.kpis;
  const cards = [
    { label: t.dashboard.kpi.totalPatients, value: k.totalPatients, icon: Users, color: "from-teal-400/20 to-teal-600/5" },
    { label: t.dashboard.kpi.doctors, value: k.totalDoctors, icon: Stethoscope, color: "from-blue-400/20 to-blue-600/5" },
    { label: t.dashboard.kpi.todayAppointments, value: k.todayAppointments, icon: Calendar, color: "from-purple-400/20 to-purple-600/5" },
    { label: t.dashboard.kpi.pendingLabs, value: k.pendingLabTests, icon: FlaskConical, color: "from-amber-400/20 to-amber-600/5" },
    { label: t.dashboard.kpi.pendingRx, value: k.pendingPrescriptions, icon: Pill, color: "from-rose-400/20 to-rose-600/5" },
    { label: t.dashboard.kpi.bedOccupancy, value: `${k.bedOccupancy}%`, icon: Bed, color: "from-emerald-400/20 to-emerald-600/5" },
    { label: t.dashboard.kpi.revenue, value: `${k.totalRevenue.toLocaleString("ar-SA")} ر.س`, icon: TrendingUp, color: "from-yellow-400/20 to-yellow-600/5" },
    { label: t.dashboard.kpi.pendingInvoices, value: k.pendingInvoices, icon: Receipt, color: "from-pink-400/20 to-pink-600/5" },
  ];

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return t.dashboard.morning;
    if (h < 17) return t.dashboard.afternoon;
    return t.dashboard.evening;
  };

  const roleLabel = (role: string) => {
    const map: any = { admin: t.auth.roleAdmin, doctor: t.auth.roleDoctor, receptionist: t.auth.roleReceptionist, pharmacist: t.auth.rolePharmacist, patient: t.auth.rolePatient };
    return map[role] || role;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Welcome bar */}
      <div className="glass-card p-4 sm:p-6 bg-gradient-to-br from-teal-400/15 to-teal-600/5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-teal-400 font-bold">{greeting()} • {roleLabel(user.role)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{t.dashboard.welcomePrefix}، {user.fullName.split(" ")[0]} 👋</h1>
            <p className="text-white/50 text-xs sm:text-sm mt-1">{t.dashboard.liveUpdate}: {currentTime.toLocaleTimeString("ar-SA")}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">{t.dashboard.liveBadge}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`glass-card glass-card-hover p-4 sm:p-5 bg-gradient-to-br ${c.color}`}>
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-teal-400/10 flex items-center justify-center text-teal-400">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black arabic-num">{c.value}</p>
              <p className="text-xs text-white/50 mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue Chart */}
        <div className="glass-card p-4 sm:p-6 lg:col-span-2">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" /> {t.dashboard.revenueChart}
          </h3>
          <div className="flex items-end gap-1.5 sm:gap-2 h-32 sm:h-40">
            {data.revenueByMonth.map((m: any, i: number) => {
              const max = Math.max(...data.revenueByMonth.map((x: any) => x.amount));
              const h = (m.amount / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end">
                  <span className="text-[10px] sm:text-xs text-white/60 arabic-num mb-1">{(m.amount / 1000).toFixed(0)}k</span>
                  <div className="w-full bg-teal-gradient rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }} />
                  <span className="text-[10px] sm:text-xs text-white/50 mt-1">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity */}
        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" /> {t.dashboard.liveActivity}
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ms-auto" />
          </h3>
          <div className="space-y-2 max-h-44 overflow-y-auto">
            <ActivityItem icon={<UserPlus className="w-3 h-3" />} text={t.dashboard.activity.newUser} time="الآن" />
            <ActivityItem icon={<Calendar className="w-3 h-3" />} text={`${k.todayAppointments} ${t.dashboard.activity.todayAppts}`} time="اليوم" />
            <ActivityItem icon={<Pill className="w-3 h-3" />} text={`${k.pendingPrescriptions} ${t.dashboard.activity.pendingRx}`} time="اليوم" />
            <ActivityItem icon={<FlaskConical className="w-3 h-3" />} text={`${k.pendingLabTests} ${t.dashboard.activity.pendingLabs}`} time="اليوم" />
            <ActivityItem icon={<Heart className="w-3 h-3" />} text={`${k.bedOccupancy}% ${t.dashboard.activity.bedRate}`} time="حي" />
            <ActivityItem icon={<Receipt className="w-3 h-3" />} text={`${k.totalRevenue.toLocaleString("ar-SA")} ${t.dashboard.activity.revenue}`} time="إجمالي" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Appointment Status */}
        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" /> {t.dashboard.appointmentDist}
          </h3>
          <div className="space-y-3">
            {Object.entries(data.appointmentsByStatus).map(([key, val]: any) => {
              const labels: any = { scheduled: t.appointments.status.scheduled, confirmed: t.appointments.status.confirmed, completed: t.appointments.status.completed, cancelled: t.appointments.status.cancelled };
              const colors: any = { scheduled: "bg-blue-400", confirmed: "bg-teal-400", completed: "bg-emerald-400", cancelled: "bg-rose-400" };
              const total = Object.values(data.appointmentsByStatus).reduce((s: number, v: any) => s + v, 0) || 1;
              const pct = (val / total) * 100;
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{labels[key]}</span>
                    <span className="arabic-num text-white/60">{val}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${colors[key]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health */}
        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" /> {t.dashboard.systemHealth}
          </h3>
          <div className="space-y-3">
            <SystemHealth label={t.dashboard.health.database} status="operational" detail={`${k.totalPatients + k.totalDoctors} ${t.dashboard.health.records}`} />
            <SystemHealth label={t.dashboard.health.apis} status="operational" detail="14 " />
            <SystemHealth label={t.dashboard.health.appointments} status="operational" detail={`${k.pendingAppointments} ${t.dashboard.health.waiting}`} />
            <SystemHealth label={t.dashboard.health.pharmacy} status={k.lowStockMeds > 0 ? "warning" : "operational"} detail={k.lowStockMeds > 0 ? `${k.lowStockMeds} ${t.dashboard.alerts.lowStock}` : t.dashboard.status.healthy} />
            <SystemHealth label={t.dashboard.health.billing} status="operational" detail={`${k.pendingInvoices} ${t.dashboard.health.pendingInvoices}`} />
          </div>
        </div>
      </div>

      {k.lowStockMeds > 0 && (
        <div className="glass-card p-3 sm:p-4 border-amber-400/30 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{k.lowStockMeds}</span>
            <span className="text-xs sm:text-sm">{t.dashboard.alerts.lowStock}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityItem({ icon, text, time }: any) {
  return (
    <div className="flex items-start gap-2 text-xs sm:text-sm bg-white/5 rounded-lg p-2 hover:bg-white/10 transition">
      <div className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-white/80">{text}</p>
      </div>
      <span className="text-[10px] sm:text-xs text-white/40 shrink-0">{time}</span>
    </div>
  );
}

function SystemHealth({ label, status, detail }: { label: string; status: "operational" | "warning"; detail: string }) {
  const ok = status === "operational";
  return (
    <div className="flex items-center justify-between text-xs sm:text-sm bg-white/5 rounded-lg p-2.5 sm:p-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${ok ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`} />
        <span className="truncate">{label}</span>
      </div>
      <span className={`text-[10px] sm:text-xs shrink-0 ms-2 ${ok ? "text-emerald-400" : "text-amber-400"}`}>{detail}</span>
    </div>
  );
}
