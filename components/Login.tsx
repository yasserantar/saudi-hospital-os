"use client";
import { useState } from "react";
import { Heart, Loader2, Shield, UserPlus, LogIn, Check, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n/I18nContext";

type Tab = "login" | "register";

export default function Login({ onLogin }: { onLogin: (u: any) => void }) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login state
  const [email, setEmail] = useState("admin@hospital.sa");
  const [password, setPassword] = useState("admin123");

  // Register state
  const [reg, setReg] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", phone: "", role: "patient",
  });
  const [pwStrength, setPwStrength] = useState({ score: 0, msg: "" });

  const checkPassword = (p: string) => {
    if (p.length < 8) return setPwStrength({ score: 0, msg: t.auth.pwTooShort });
    const hasNum = /\d/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    const score = (hasNum ? 1 : 0) + (hasUpper ? 1 : 0) + (hasSpecial ? 1 : 0) + 1;
    const msgs = ["", t.auth.pwWeak, t.auth.pwFair, t.auth.pwGood, t.auth.pwStrong];
    setPwStrength({ score, msg: msgs[score] || "" });
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.user);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (reg.password !== reg.confirmPassword) { setError(t.errors.passwordMismatch); return; }
    if (pwStrength.score < 2) { setError(t.errors.passwordWeak); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: reg.fullName, email: reg.email, password: reg.password,
          phone: reg.phone, role: reg.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(t.common.success);
      setTimeout(() => onLogin(data.user), 800);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />

      {/* Language Switcher (top right) */}
      <div className="absolute top-4 right-4 ltr:right-4 ltr:left-auto rtl:left-4 rtl:right-auto z-10">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-teal-gradient flex items-center justify-center shadow-teal mb-3 sm:mb-4">
            <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-royal-900" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1">{t.brand.name}</h1>
          <p className="text-sm text-teal-400">{t.brand.tagline}</p>
        </div>

        <div className="flex gap-2 mb-4 glass-card p-1.5">
          <button onClick={() => { setTab("login"); setError(null); setSuccess(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab === "login" ? "bg-teal-gradient text-royal-900 shadow-teal" : "text-white/60 hover:text-white"}`}>
            <LogIn className="w-4 h-4" /> {t.auth.loginTab}
          </button>
          <button onClick={() => { setTab("register"); setError(null); setSuccess(null); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${tab === "register" ? "bg-teal-gradient text-royal-900 shadow-teal" : "text-white/60 hover:text-white"}`}>
            <UserPlus className="w-4 h-4" /> {t.auth.registerTab}
          </button>
        </div>

        <div className="glass-card p-5 sm:p-8">
          {tab === "login" ? (
            <form onSubmit={submitLogin} className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold mb-2">{t.auth.welcome}</h2>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">{t.auth.email}</label>
                <input type="email" className="input-glass" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">{t.auth.password}</label>
                <input type="password" className="input-glass" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-sm text-rose-400">{error}</div>
              )}
              <button type="submit" disabled={loading} className="btn-teal w-full flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.auth.loggingIn}</> : <><LogIn className="w-5 h-5" /> {t.auth.login}</>}
              </button>
              <p className="text-center text-xs text-white/50">
                {t.auth.noAccount} <button type="button" onClick={() => setTab("register")} className="text-teal-400 hover:underline">{t.auth.signUpFree}</button>
              </p>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold mb-1">{t.auth.joinUs}</h2>
              <p className="text-xs text-white/50 mb-4">{t.auth.joinDesc}</p>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">{t.auth.fullName} *</label>
                <input className="input-glass" value={reg.fullName} onChange={(e) => setReg({ ...reg, fullName: e.target.value })} required placeholder={t.auth.placeholderName} />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1.5">{t.auth.email} *</label>
                <input type="email" className="input-glass" dir="ltr" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} required placeholder={t.auth.placeholderEmail} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">{t.auth.password} *</label>
                  <input type="password" className="input-glass" dir="ltr" value={reg.password} onChange={(e) => { setReg({ ...reg, password: e.target.value }); checkPassword(e.target.value); }} required minLength={8} />
                  {reg.password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`flex-1 rounded-full transition-all ${pwStrength.score >= i ? (pwStrength.score >= 3 ? "bg-emerald-400" : pwStrength.score >= 2 ? "bg-amber-400" : "bg-rose-400") : "bg-white/5"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-white/60 whitespace-nowrap">{pwStrength.msg}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">{t.auth.confirmPassword} *</label>
                  <input type="password" className="input-glass" dir="ltr" value={reg.confirmPassword} onChange={(e) => setReg({ ...reg, confirmPassword: e.target.value })} required />
                  {reg.confirmPassword && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs">
                      {reg.password === reg.confirmPassword ? (
                        <><Check className="w-3 h-3 text-emerald-400" /> <span className="text-emerald-400">{t.auth.pwMatch}</span></>
                      ) : (
                        <><X className="w-3 h-3 text-rose-400" /> <span className="text-rose-400">{t.auth.pwMismatch}</span></>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">{t.auth.phone}</label>
                  <input type="tel" className="input-glass arabic-num" dir="ltr" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} placeholder={t.auth.placeholderPhone} />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1.5">{t.auth.role}</label>
                  <select className="input-glass" value={reg.role} onChange={(e) => setReg({ ...reg, role: e.target.value })}>
                    <option value="patient">{t.auth.rolePatient}</option>
                    <option value="doctor">{t.auth.roleDoctor}</option>
                    <option value="receptionist">{t.auth.roleReceptionist}</option>
                    <option value="pharmacist">{t.auth.rolePharmacist}</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-sm text-rose-400">{error}</div>
              )}
              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" /> {success}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-teal w-full flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] mt-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.auth.registering}</> : <><UserPlus className="w-5 h-5" /> {t.auth.register}</>}
              </button>

              <p className="text-center text-xs text-white/50">
                {t.auth.haveAccount} <button type="button" onClick={() => setTab("login")} className="text-teal-400 hover:underline">{t.auth.signIn}</button>
              </p>
            </form>
          )}

          <div className="flex items-center gap-2 text-xs text-white/40 justify-center pt-4 mt-4 border-t border-white/5">
            <Shield className="w-3 h-3" /> {t.auth.secureSession}
          </div>
        </div>

        {tab === "login" && (
          <div className="glass-card p-4 mt-4">
            <p className="text-xs text-teal-400 font-bold mb-2">{t.auth.demoAccounts}:</p>
            <div className="space-y-1 text-xs text-white/60 font-mono" dir="ltr">
              <div>admin@hospital.sa / admin123 <span className="text-teal-400">({t.auth.roleAdmin})</span></div>
              <div>doctor@hospital.sa / doctor123 <span className="text-teal-400">({t.auth.roleDoctor})</span></div>
              <div>reception@hospital.sa / reception123 <span className="text-teal-400">({t.auth.roleReceptionist})</span></div>
              <div>pharma@hospital.sa / pharma123 <span className="text-teal-400">({t.auth.rolePharmacist})</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
