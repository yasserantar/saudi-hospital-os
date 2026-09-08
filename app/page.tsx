"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Stethoscope, Calendar, FileText, Pill, FlaskConical,
  Receipt, Bed, Building2, LogOut, Heart, Menu, X, Bell, Activity,
} from "lucide-react";
import Dashboard from "@/components/screens/Dashboard";
import Patients from "@/components/screens/Patients";
import Doctors from "@/components/screens/Doctors";
import Appointments from "@/components/screens/Appointments";
import MedicalRecords from "@/components/screens/MedicalRecords";
import Prescriptions from "@/components/screens/Prescriptions";
import Pharmacy from "@/components/screens/Pharmacy";
import Labs from "@/components/screens/Labs";
import Billing from "@/components/screens/Billing";
import Beds from "@/components/screens/Beds";
import Clinics from "@/components/screens/Clinics";
import Login from "@/components/Login";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/I18nContext";
import { useMediaQuery, breakpoints } from "@/hooks/useMediaQuery";

type Screen = "dashboard" | "patients" | "doctors" | "appointments" | "records" | "prescriptions" | "pharmacy" | "labs" | "billing" | "beds" | "clinics";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { t, locale } = useI18n();
  const isMobile = useMediaQuery(breakpoints.mobile);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications?userId=${user.id}`).then(r => r.json()).then(d => {
        setUnread(d.notifications?.filter((n: any) => !n.read).length || 0);
      }).catch(() => {});
    }
  }, [user, screen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [screen]);

  if (!user) return <Login onLogin={setUser} />;

  const NAV = [
    { id: "dashboard", label: t.nav.dashboard, icon: LayoutDashboard, roles: ["admin","doctor","receptionist"] },
    { id: "patients", label: t.nav.patients, icon: Users, roles: ["admin","doctor","receptionist"] },
    { id: "appointments", label: t.nav.appointments, icon: Calendar, roles: ["admin","doctor","receptionist"] },
    { id: "doctors", label: t.nav.doctors, icon: Stethoscope, roles: ["admin","receptionist"] },
    { id: "records", label: t.nav.records, icon: FileText, roles: ["admin","doctor"] },
    { id: "prescriptions", label: t.nav.prescriptions, icon: Pill, roles: ["admin","doctor","pharmacist"] },
    { id: "labs", label: t.nav.labs, icon: FlaskConical, roles: ["admin","doctor"] },
    { id: "pharmacy", label: t.nav.pharmacy, icon: Pill, roles: ["admin","pharmacist"] },
    { id: "billing", label: t.nav.billing, icon: Receipt, roles: ["admin","receptionist"] },
    { id: "beds", label: t.nav.beds, icon: Bed, roles: ["admin","doctor"] },
    { id: "clinics", label: t.nav.clinics, icon: Building2, roles: ["admin","doctor","receptionist"] },
  ];
  const allowedNav = NAV.filter((n) => n.roles.includes(user.role));
  const roleLabel = (r: string) => {
    const map: any = { admin: t.auth.roleAdmin, doctor: t.auth.roleDoctor, receptionist: t.auth.roleReceptionist, pharmacist: t.auth.rolePharmacist, patient: t.auth.rolePatient };
    return map[r] || r;
  };

  return (
    <div className="min-h-screen flex bg-royal-900">
      {/* ===== MOBILE OVERLAY ===== */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`
        fixed lg:sticky top-0 h-screen flex flex-col border-white/5 bg-royal-800/95 backdrop-blur-xl z-50
        transition-transform duration-300 ease-in-out
        w-72 lg:w-64 shrink-0
        ${isMobile ? (sidebarOpen ? "translate-x-0" : (locale === "ar" ? "translate-x-full" : "-translate-x-full")) : ""}
        ${locale === "ar" ? "border-l" : "border-r"}
      `}>
        <div className="p-4 lg:p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-teal-gradient flex items-center justify-center shadow-teal">
              <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-royal-900" />
            </div>
            <div>
              <h1 className="font-bold text-white leading-none text-sm lg:text-base">Saudi Hospital</h1>
              <p className="text-xs text-teal-400 mt-0.5">OS</p>
            </div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            const active = screen === item.id;
            return (
              <button key={item.id} onClick={() => setScreen(item.id as Screen)}
                className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm transition-all min-h-[44px] ${
                  active ? "bg-teal-400/10 text-teal-400 border border-teal-400/30" : "text-white/70 hover:bg-white/5"
                }`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-start">{item.label}</span>
                {item.id === "dashboard" && unread > 0 && (
                  <span className="bg-rose-500 text-white text-xs px-1.5 rounded-full arabic-num">{unread}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="glass-card p-3 mb-2">
            <p className="text-xs text-white/50">{t.nav.user}</p>
            <p className="text-sm font-bold truncate">{user.fullName}</p>
            <p className="text-xs text-teal-400">{roleLabel(user.role)}</p>
          </div>
          <button onClick={() => setUser(null)} className="btn-glass w-full text-sm flex items-center justify-center gap-2 min-h-[44px]">
            <LogOut className="w-4 h-4" /> {t.auth.logout}
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar (Mobile + Desktop) */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-royal-900/80 border-b border-white/5 safe-top">
          <div className="flex items-center justify-between p-3 lg:p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden lg:block">
                <h2 className="font-bold text-white">{allowedNav.find(n => n.id === screen)?.label}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Live indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-bold">{t.common.online}</span>
              </div>

              {/* Notifications */}
              <button className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <Bell className="w-4 h-4 text-white/70" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center text-white arabic-num">{unread}</span>
                )}
              </button>

              {/* Language Switcher */}
              <LanguageSwitcher compact />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 lg:p-6 pb-safe-bottom">
          {screen === "dashboard" && <Dashboard user={user} />}
          {screen === "patients" && <Patients />}
          {screen === "doctors" && <Doctors />}
          {screen === "appointments" && <Appointments />}
          {screen === "records" && <MedicalRecords user={user} />}
          {screen === "prescriptions" && <Prescriptions user={user} />}
          {screen === "pharmacy" && <Pharmacy />}
          {screen === "labs" && <Labs />}
          {screen === "billing" && <Billing />}
          {screen === "beds" && <Beds />}
          {screen === "clinics" && <Clinics />}
        </div>
      </main>
    </div>
  );
}
