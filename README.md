# Saudi Hospital OS 🏥

> نظام إدارة مستشفى سعودي شامل — مواعيد، سجلات طبية، وصفات، فوترة، تأمين، أسرّة، صيدلية.

## ✨ الوحدات الـ 13

| # | الوحدة | الوصف |
|---|--------|-------|
| 1 | 🔐 Auth + Roles | 5 أدوار: admin/doctor/receptionist/pharmacist/patient |
| 2 | 👥 المرضى | تسجيل + بحث + بروفايل كامل (EHR) |
| 3 | 🩺 الأطباء | تخصصات + جداول + تقييمات |
| 4 | 📅 المواعيد | حجز + تعارض + 5 حالات |
| 5 | 📋 السجلات الطبية | تشخيص + علامات حيوية + متابعة |
| 6 | 💊 الوصفات | متعدد الأدوية + صرف صيدلي |
| 7 | 🏪 الصيدلية | مخزون + تنبيهات صلاحية + قيمة |
| 8 | 🧪 المختبر | طلبات + نتائج + حالات |
| 9 | 💳 الفوترة | VAT 15% + خصم + دفع |
| 10 | 🛏️ الأسرّة | 4 أقسام + إشغال |
| 11 | 🏥 العيادات | 5 عيادات + خدمات |
| 12 | 📊 لوحة تحكم | KPIs + رسوم بيانية |
| 13 | 🔔 إشعارات | داخلية حسب الدور |

## 🚀 التشغيل

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve production
```

## 🔑 حسابات تجريبية

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| مدير النظام | admin@hospital.sa | admin123 |
| طبيب | doctor@hospital.sa | doctor123 |
| استقبال | reception@hospital.sa | reception123 |
| صيدلي | pharma@hospital.sa | pharma123 |

## 🗄️ Supabase Setup

1. أنشئ مشروع على [supabase.com](https://supabase.com)
2. SQL Editor → الصق محتوى `supabase/schema.sql`
3. `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_KEY
```

## 🌐 النشر

- **Vercel**: `vercel --prod`
- **GitHub**: دفع الكود على `yasserantar/saudi-hospital-os`

## 🛠️ التقنيات

Next.js 14.2 • TypeScript 5.5 • Tailwind CSS 3.4 • Edge Runtime • Cairo Font

## 📜 الترخيص

MIT © 2026 Up2U World Agency

🇸🇦 صُنع بفخر في المملكة العربية السعودية
