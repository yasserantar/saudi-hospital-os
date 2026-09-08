// قاعدة بيانات المستشفى — In-memory للتجربة، قابلة للربط مع Supabase/PostgreSQL
// جميع البيانات تجريبية ومحلية، بدون أي بيانات حقيقية.

export type UserRole = "admin" | "doctor" | "receptionist" | "pharmacist" | "patient";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
export type InvoiceStatus = "pending" | "paid" | "partially_paid" | "insurance" | "cancelled";
export type BedStatus = "available" | "occupied" | "cleaning" | "maintenance";

export interface User {
  id: string;
  email: string;
  password: string; // في الإنتاج: bcrypt
  fullName: string;
  role: UserRole;
  phone?: string;
  nationalId?: string;
  specialization?: string;
  licenseNumber?: string;
  clinicId?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  fileNumber: string; // رقم الملف
  userId?: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: "male" | "female";
  phone: string;
  email?: string;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  insuranceCompany?: string;
  insuranceNumber?: string;
  address?: string;
  emergencyContact?: string;
  registeredAt: string;
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  clinicId: string;
  consultationFee: number;
  yearsExperience: number;
  rating: number;
  availableDays: string[]; // ['sunday','monday',...]
  workingHours: { from: string; to: string };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  followUpDate?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  prescribedAt: string;
  status: "pending" | "dispensed" | "cancelled";
  items: PrescriptionItem[];
  notes?: string;
}

export interface PrescriptionItem {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Medication {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  dosageForm: string; // tablet, syrup, injection
  strength: string;
  stock: number;
  unitPrice: number;
  expiryDate: string;
  manufacturer?: string;
  requiresPrescription: boolean;
}

export interface LabTest {
  id: string;
  patientId: string;
  doctorId: string;
  testType: string;
  requestedAt: string;
  completedAt?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  results?: string;
  normalRange?: string;
  technician?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  appointmentId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod?: "cash" | "card" | "insurance" | "transfer";
  insuranceClaimId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: "consultation" | "lab" | "medication" | "procedure" | "room";
}

export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  patientId: string;
  companyName: string;
  policyNumber: string;
  claimedAmount: number;
  approvedAmount?: number;
  status: "submitted" | "reviewing" | "approved" | "rejected" | "paid";
  submittedAt: string;
  respondedAt?: string;
  notes?: string;
}

export interface Bed {
  id: string;
  roomNumber: string;
  ward: string; // ICU, General, Pediatric, Maternity
  status: BedStatus;
  patientId?: string;
  admittedAt?: string;
  expectedDischarge?: string;
  dailyRate: number;
}

export interface Clinic {
  id: string;
  name: string;
  location: string;
  phone: string;
  workingHours: string;
  services: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "appointment" | "lab" | "prescription" | "invoice" | "system";
  read: boolean;
  createdAt: string;
}

// ===================== قاعدة البيانات =====================
// Singleton in-memory. في الإنتاج: استبدل بـ Supabase/PostgreSQL.

class HospitalDB {
  users: User[] = [];
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  appointments: Appointment[] = [];
  medicalRecords: MedicalRecord[] = [];
  prescriptions: Prescription[] = [];
  medications: Medication[] = [];
  labTests: LabTest[] = [];
  invoices: Invoice[] = [];
  insuranceClaims: InsuranceClaim[] = [];
  beds: Bed[] = [];
  clinics: Clinic[] = [];
  notifications: Notification[] = [];
  initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.seed();
  }

  private genId(prefix: string) {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }

  private seed() {
    // عيادات
    this.clinics.push(
      { id: "C-1", name: "العيادة العامة", location: "الدور الأول", phone: "+966112345001", workingHours: "8:00 - 22:00", services: ["كشف عام", "متابعة", "تحاليل"] },
      { id: "C-2", name: "عيادة القلب", location: "الدور الثاني", phone: "+966112345002", workingHours: "9:00 - 17:00", services: ["ECG", "Echo", "استشارة"] },
      { id: "C-3", name: "عيادة الأطفال", location: "الدور الأول", phone: "+966112345003", workingHours: "8:00 - 20:00", services: ["تطعيمات", "كشف", "متابعة"] },
      { id: "C-4", name: "المختبر", location: "الدور الأرضي", phone: "+966112345004", workingHours: "24/7", services: ["تحاليل دم", "أشعة", "بكتيريا"] },
      { id: "C-5", name: "الصيدلية", location: "الدور الأرضي", phone: "+966112345005", workingHours: "24/7", services: ["صرف أدوية", "استشارة دوائية"] },
    );

    // مستخدمون (موظفون)
    this.users.push(
      { id: "U-1", email: "admin@hospital.sa", password: "admin123", fullName: "د. عبدالله الإداري", role: "admin", phone: "+966501111111", createdAt: new Date().toISOString() },
      { id: "U-2", email: "doctor@hospital.sa", password: "doctor123", fullName: "د. سارة القحطاني", role: "doctor", phone: "+966502222222", specialization: "طب باطني", licenseNumber: "MOH-12345", clinicId: "C-1", createdAt: new Date().toISOString() },
      { id: "U-3", email: "doctor2@hospital.sa", password: "doctor123", fullName: "د. محمد الزهراني", role: "doctor", phone: "+966503333333", specialization: "أمراض قلب", licenseNumber: "MOH-67890", clinicId: "C-2", createdAt: new Date().toISOString() },
      { id: "U-4", email: "reception@hospital.sa", password: "reception123", fullName: "أحمد موظف الاستقبال", role: "receptionist", phone: "+966504444444", createdAt: new Date().toISOString() },
      { id: "U-5", email: "pharma@hospital.sa", password: "pharma123", fullName: "خالد الصيدلي", role: "pharmacist", phone: "+966505555555", createdAt: new Date().toISOString() },
      { id: "U-6", email: "patient@hospital.sa", password: "patient123", fullName: "محمد المريض", role: "patient", phone: "+966506666666", nationalId: "1098765432", createdAt: new Date().toISOString() },
    );

    // أطباء
    this.doctors.push(
      { id: "D-1", userId: "U-2", fullName: "د. سارة القحطاني", specialization: "طب باطني", licenseNumber: "MOH-12345", phone: "+966502222222", clinicId: "C-1", consultationFee: 200, yearsExperience: 12, rating: 4.8, availableDays: ["sunday","monday","tuesday","wednesday"], workingHours: { from: "09:00", to: "17:00" } },
      { id: "D-2", userId: "U-3", fullName: "د. محمد الزهراني", specialization: "أمراض قلب", licenseNumber: "MOH-67890", phone: "+966503333333", clinicId: "C-2", consultationFee: 350, yearsExperience: 18, rating: 4.9, availableDays: ["sunday","tuesday","thursday"], workingHours: { from: "10:00", to: "16:00" } },
    );

    // مرضى
    this.patients.push(
      { id: "P-1", fileNumber: "MRN-100001", userId: "U-6", fullName: "محمد عبدالله الأحمدي", nationalId: "1098765432", dateOfBirth: "1985-05-15", gender: "male", phone: "+966506666666", email: "mohammed@example.sa", bloodType: "O+", allergies: ["البنسلين"], chronicDiseases: ["ضغط"], insuranceCompany: "بوبا", insuranceNumber: "BPA-998877", address: "الرياض", emergencyContact: "+966507777777", registeredAt: new Date().toISOString() },
      { id: "P-2", fileNumber: "MRN-100002", fullName: "فاطمة أحمد الزهراني", nationalId: "1023456789", dateOfBirth: "1992-08-22", gender: "female", phone: "+966507777888", bloodType: "A+", allergies: [], chronicDiseases: ["سكري"], insuranceCompany: "التعاونية", insuranceNumber: "TAW-12345", registeredAt: new Date().toISOString() },
      { id: "P-3", fileNumber: "MRN-100003", fullName: "خالد سعيد القحطاني", nationalId: "1034567890", dateOfBirth: "1978-03-10", gender: "male", phone: "+966508888999", bloodType: "B+", allergies: ["المكسرات"], chronicDiseases: [], registeredAt: new Date().toISOString() },
    );

    // أدوية
    this.medications.push(
      { id: "M-1", name: "باراسيتامول 500mg", scientificName: "Paracetamol", category: "مسكنات", dosageForm: "أقراص", strength: "500mg", stock: 500, unitPrice: 2, expiryDate: "2027-12-31", manufacturer: "جميل", requiresPrescription: false },
      { id: "M-2", name: "أموكسيسيلين 500mg", scientificName: "Amoxicillin", category: "مضادات حيوية", dosageForm: "كبسولات", strength: "500mg", stock: 200, unitPrice: 5, expiryDate: "2027-06-30", manufacturer: "السعودية", requiresPrescription: true },
      { id: "M-3", name: "ميتفورمين 850mg", scientificName: "Metformin", category: "سكري", dosageForm: "أقراص", strength: "850mg", stock: 350, unitPrice: 3, expiryDate: "2028-01-15", manufacturer: "الحكمة", requiresPrescription: true },
      { id: "M-4", name: "أتورفاستاتين 20mg", scientificName: "Atorvastatin", category: "كوليسترول", dosageForm: "أقراص", strength: "20mg", stock: 180, unitPrice: 8, expiryDate: "2027-09-20", manufacturer: "فارما", requiresPrescription: true },
      { id: "M-5", name: "لوزارتان 50mg", scientificName: "Losartan", category: "ضغط", dosageForm: "أقراص", strength: "50mg", stock: 250, unitPrice: 6, expiryDate: "2028-02-28", manufacturer: "سبيماكو", requiresPrescription: true },
      { id: "M-6", name: "إيبوبروفين 400mg", scientificName: "Ibuprofen", category: "مسكنات", dosageForm: "أقراص", strength: "400mg", stock: 400, unitPrice: 3, expiryDate: "2027-11-30", manufacturer: "البحري", requiresPrescription: false },
    );

    // مواعيد
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    this.appointments.push(
      { id: this.genId("APT"), patientId: "P-1", doctorId: "D-1", date: today.toISOString().split("T")[0], time: "10:00", duration: 30, status: "confirmed", reason: "متابعة ضغط", createdBy: "U-4", createdAt: new Date().toISOString() },
      { id: this.genId("APT"), patientId: "P-2", doctorId: "D-2", date: today.toISOString().split("T")[0], time: "14:00", duration: 45, status: "scheduled", reason: "استشارة قلب", createdBy: "U-4", createdAt: new Date().toISOString() },
      { id: this.genId("APT"), patientId: "P-3", doctorId: "D-1", date: tomorrow.toISOString().split("T")[0], time: "11:30", duration: 30, status: "scheduled", reason: "كشف عام", createdBy: "U-4", createdAt: new Date().toISOString() },
    );

    // فحوصات مخبرية
    this.labTests.push(
      { id: this.genId("LAB"), patientId: "P-1", doctorId: "D-1", testType: "صورة دم كاملة (CBC)", requestedAt: new Date().toISOString(), status: "completed", results: "Hemoglobin: 14.2 g/dL — طبيعي", normalRange: "13.5-17.5 g/dL", completedAt: new Date().toISOString(), technician: "أحمد فني المختبر" },
      { id: this.genId("LAB"), patientId: "P-2", doctorId: "D-2", testType: "سكر صائم (FBS)", requestedAt: new Date().toISOString(), status: "in_progress" },
    );

    // وصفات
    this.prescriptions.push({
      id: this.genId("RX"), patientId: "P-1", doctorId: "D-1", prescribedAt: new Date().toISOString(), status: "pending",
      items: [
        { medicationId: "M-5", medicationName: "لوزارتان 50mg", dosage: "قرص واحد", frequency: "مرة يومياً", duration: "30 يوم" },
        { medicationId: "M-4", medicationName: "أتورفاستاتين 20mg", dosage: "قرص واحد", frequency: "ليلاً", duration: "30 يوم" },
      ],
      notes: "متابعة بعد شهر مع قياس الضغط",
    });

    // سجلات طبية
    this.medicalRecords.push({
      id: this.genId("MR"), patientId: "P-1", doctorId: "D-1", visitDate: new Date().toISOString().split("T")[0],
      chiefComplaint: "صداع متكرر ودوخة",
      diagnosis: "ارتفاع ضغط الدم - المرحلة 1",
      treatment: "لوزارتان 50mg + أتورفاستاتين 20mg + حمية قليلة الملح",
      vitalSigns: { bloodPressure: "145/95", heartRate: 82, temperature: 36.8, weight: 85, height: 175 },
      followUpDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
    });

    // فواتير
    this.invoices.push({
      id: this.genId("INV"), invoiceNumber: "INV-2026-001", patientId: "P-1", appointmentId: this.appointments[0].id,
      items: [{ description: "استشارة طب باطني", quantity: 1, unitPrice: 200, total: 200, type: "consultation" }],
      subtotal: 200, discount: 0, tax: 30, total: 230, status: "paid", paymentMethod: "card", createdAt: new Date().toISOString(), paidAt: new Date().toISOString(),
    });

    // مطالبات تأمين
    this.insuranceClaims.push({
      id: this.genId("CLM"), invoiceId: this.invoices[0].id, patientId: "P-1",
      companyName: "بوبا", policyNumber: "BPA-998877", claimedAmount: 230, approvedAmount: 200,
      status: "paid", submittedAt: new Date().toISOString(), respondedAt: new Date().toISOString(),
      notes: "تمت الموافقة على 200 ر.س",
    });

    // أسرّة
    ["ICU-A1","ICU-A2","ICU-B1","GEN-101","GEN-102","GEN-103","GEN-104","PED-201","PED-202","MAT-301"].forEach((room, i) => {
      const ward = room.startsWith("ICU") ? "العناية المركزة" : room.startsWith("PED") ? "أطفال" : room.startsWith("MAT") ? "ولادة" : "عام";
      const rate = room.startsWith("ICU") ? 1500 : room.startsWith("MAT") ? 1200 : room.startsWith("PED") ? 600 : 400;
      this.beds.push({
        id: this.genId("BED"), roomNumber: room, ward, status: i < 3 ? "occupied" : i === 3 ? "cleaning" : "available",
        patientId: i < 3 ? this.patients[i % 3].id : undefined,
        admittedAt: i < 3 ? new Date().toISOString() : undefined,
        dailyRate: rate,
      });
    });

    // إشعارات
    this.notifications.push(
      { id: this.genId("NTF"), userId: "U-2", title: "موعد جديد", message: "لديك موعد مع المريض محمد الأحمدي اليوم الساعة 10:00", type: "appointment", read: false, createdAt: new Date().toISOString() },
      { id: this.genId("NTF"), userId: "U-4", title: "وصفة طبية جاهزة", message: "وصفة جديدة بانتظار الصرف في الصيدلية", type: "prescription", read: false, createdAt: new Date().toISOString() },
    );
  }

  // === Helper methods ===
  generateId(prefix: string) { return this.genId(prefix); }
}

declare global {
  // eslint-disable-next-line no-var
  var __hospitalDB: HospitalDB | undefined;
}

export const db: HospitalDB = globalThis.__hospitalDB ?? (globalThis.__hospitalDB = new HospitalDB());
db.init();
