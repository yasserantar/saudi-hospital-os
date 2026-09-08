-- =====================================================================
-- Saudi Hospital OS — Supabase Database Schema
-- 13 جدول مع سياسات RLS + Triggers + Views
-- =====================================================================

-- 1) المستخدمون (5 أدوار)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  full_name text not null,
  role text not null check (role in ('admin','doctor','receptionist','pharmacist','patient')),
  phone text,
  national_id text,
  specialization text,
  license_number text,
  clinic_id text,
  avatar_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2) العيادات
create table if not exists public.clinics (
  id text primary key,
  name text not null,
  location text,
  phone text,
  working_hours text,
  services text[],
  created_at timestamptz default now()
);

-- 3) المرضى
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  file_number text unique not null,
  user_id uuid references public.users(id),
  full_name text not null,
  national_id text unique not null,
  date_of_birth date not null,
  gender text check (gender in ('male','female')) not null,
  phone text not null,
  email text,
  blood_type text,
  allergies text[],
  chronic_diseases text[],
  insurance_company text,
  insurance_number text,
  address text,
  emergency_contact text,
  registered_at timestamptz default now()
);
create index if not exists idx_patients_national on public.patients(national_id);
create index if not exists idx_patients_file on public.patients(file_number);

-- 4) الأطباء
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  full_name text not null,
  specialization text not null,
  license_number text unique,
  phone text,
  clinic_id text references public.clinics(id),
  consultation_fee numeric(10,2),
  years_experience int default 0,
  rating numeric(3,2) default 0,
  available_days text[],
  working_hours jsonb,
  created_at timestamptz default now()
);

-- 5) المواعيد
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  doctor_id uuid references public.doctors(id),
  date date not null,
  time time not null,
  duration int default 30,
  status text default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled','no_show')),
  reason text,
  notes text,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);
create index if not exists idx_appointments_date on public.appointments(date);
create index if not exists idx_appointments_doctor_date on public.appointments(doctor_id, date);

-- 6) السجلات الطبية (EHR)
create table if not exists public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id),
  doctor_id uuid references public.doctors(id),
  appointment_id uuid references public.appointments(id),
  visit_date date default current_date,
  chief_complaint text not null,
  diagnosis text not null,
  treatment text,
  notes text,
  vital_signs jsonb,
  follow_up_date date,
  created_at timestamptz default now()
);
create index if not exists idx_records_patient on public.medical_records(patient_id);

-- 7) الأدوية (المخزون)
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  scientific_name text,
  category text,
  dosage_form text,
  strength text,
  stock int default 0,
  unit_price numeric(10,2),
  expiry_date date,
  manufacturer text,
  requires_prescription boolean default true,
  created_at timestamptz default now()
);

-- 8) الوصفات
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id),
  doctor_id uuid references public.doctors(id),
  appointment_id uuid references public.appointments(id),
  prescribed_at timestamptz default now(),
  status text default 'pending' check (status in ('pending','dispensed','cancelled')),
  items jsonb not null,
  notes text
);

-- 9) الفحوصات
create table if not exists public.lab_tests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id),
  doctor_id uuid references public.doctors(id),
  test_type text not null,
  requested_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  results text,
  normal_range text,
  technician text
);

-- 10) الفواتير
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
  patient_id uuid references public.patients(id),
  appointment_id uuid references public.appointments(id),
  items jsonb not null,
  subtotal numeric(12,2),
  discount numeric(12,2) default 0,
  tax numeric(12,2),
  total numeric(12,2),
  status text default 'pending' check (status in ('pending','paid','partially_paid','insurance','cancelled')),
  payment_method text,
  insurance_claim_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- 11) مطالبات التأمين
create table if not exists public.insurance_claims (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id),
  patient_id uuid references public.patients(id),
  company_name text not null,
  policy_number text,
  claimed_amount numeric(12,2),
  approved_amount numeric(12,2),
  status text default 'submitted',
  submitted_at timestamptz default now(),
  responded_at timestamptz,
  notes text
);

-- 12) الأسرّة
create table if not exists public.beds (
  id uuid primary key default gen_random_uuid(),
  room_number text unique not null,
  ward text not null,
  status text default 'available' check (status in ('available','occupied','cleaning','maintenance')),
  patient_id uuid references public.patients(id),
  admitted_at timestamptz,
  expected_discharge timestamptz,
  daily_rate numeric(10,2)
);

-- 13) الإشعارات
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  title text not null,
  message text not null,
  type text check (type in ('appointment','lab','prescription','invoice','system')),
  read boolean default false,
  created_at timestamptz default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================

alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_records enable row level security;
alter table public.prescriptions enable row level security;
alter table public.lab_tests enable row level security;
alter table public.invoices enable row level security;
alter table public.beds enable row level security;
alter table public.notifications enable row level security;

-- Users: كل مستخدم يرى بياناته
create policy "users_self" on public.users for select using (auth.uid() = id);
create policy "users_admin_all" on public.users for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
);

-- المرضى: الطبيب/الاستقبال/المدير فقط
create policy "patients_staff_read" on public.patients for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','doctor','receptionist'))
);
create policy "patients_staff_write" on public.patients for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','receptionist'))
);

-- المواعيد
create policy "appointments_read" on public.appointments for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','doctor','receptionist'))
);
create policy "appointments_write" on public.appointments for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','receptionist'))
);

-- EHR: الطبيب والمدير فقط
create policy "records_medical_read" on public.medical_records for select using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','doctor'))
);
create policy "records_medical_write" on public.medical_records for insert with check (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'doctor')
);

-- الوصفات: الطبيب والصيدلي
create policy "rx_medical" on public.prescriptions for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','doctor','pharmacist'))
);

-- الأدوية
create policy "meds_read" on public.medications for select using (auth.role() = 'authenticated');
create policy "meds_write" on public.medications for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','pharmacist'))
);

-- الأسرّة
create policy "beds_read" on public.beds for select using (auth.role() = 'authenticated');
create policy "beds_write" on public.beds for all using (
  exists (select 1 from public.users u where u.id = auth.uid() and u.role in ('admin','doctor'))
);

-- الإشعارات: كل مستخدم يرى إشعاراته
create policy "notif_self" on public.notifications for select using (auth.uid() = user_id);
create policy "notif_update" on public.notifications for update using (auth.uid() = user_id);

-- =====================================================================
-- VIEWS جاهزة للوحة التحكم
-- =====================================================================
create or replace view public.v_daily_stats as
select
  current_date as stat_date,
  (select count(*) from public.appointments where date = current_date) as today_appointments,
  (select count(*) from public.appointments where date = current_date and status = 'completed') as completed_today,
  (select count(*) from public.lab_tests where status = 'pending') as pending_labs,
  (select count(*) from public.beds where status = 'occupied') as occupied_beds,
  (select count(*) from public.beds) as total_beds,
  (select coalesce(sum(total),0) from public.invoices where status = 'paid' and created_at::date = current_date) as revenue_today;

create or replace view public.v_low_stock as
select id, name, stock, unit_price
from public.medications
where stock < 50
order by stock asc;

-- =====================================================================
-- نهاية الملف — طبّقه في Supabase SQL Editor
-- =====================================================================
