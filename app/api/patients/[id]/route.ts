import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const patient = db.patients.find((p) => p.id === params.id);
  if (!patient) return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
  const appointments = db.appointments.filter((a) => a.patientId === params.id);
  const prescriptions = db.prescriptions.filter((r) => r.patientId === params.id);
  const records = db.medicalRecords.filter((r) => r.patientId === params.id);
  const labs = db.labTests.filter((l) => l.patientId === params.id);
  const invoices = db.invoices.filter((i) => i.patientId === params.id);
  return NextResponse.json({ patient, appointments, prescriptions, records, labs, invoices });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const idx = db.patients.findIndex((p) => p.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });
    // منع تكرار nationalId
    if (body.nationalId && body.nationalId !== db.patients[idx].nationalId) {
      if (db.patients.find((p) => p.nationalId === body.nationalId)) {
        return NextResponse.json({ error: "رقم الهوية مستخدم لمريض آخر" }, { status: 409 });
      }
    }
    db.patients[idx] = { ...db.patients[idx], ...body, id: db.patients[idx].id, fileNumber: db.patients[idx].fileNumber, registeredAt: db.patients[idx].registeredAt };
    return NextResponse.json({ success: true, patient: db.patients[idx] });
  } catch {
    return NextResponse.json({ error: "فشل تحديث المريض" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = db.patients.findIndex((p) => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "المريض غير موجود" }, { status: 404 });

  const patientName = db.patients[idx].fullName;
  const patientId = db.patients[idx].id;

  // حذف المريض + كل البيانات المرتبطة به (cascade)
  const deletedAppointments = db.appointments.filter((a) => a.patientId === patientId).length;
  const deletedPrescriptions = db.prescriptions.filter((r) => r.patientId === patientId).length;
  const deletedRecords = db.medicalRecords.filter((r) => r.patientId === patientId).length;
  const deletedLabs = db.labTests.filter((l) => l.patientId === patientId).length;
  const deletedInvoices = db.invoices.filter((i) => i.patientId === patientId).length;

  db.appointments = db.appointments.filter((a) => a.patientId !== patientId);
  db.prescriptions = db.prescriptions.filter((r) => r.patientId !== patientId);
  db.medicalRecords = db.medicalRecords.filter((r) => r.patientId !== patientId);
  db.labTests = db.labTests.filter((l) => l.patientId !== patientId);
  db.invoices = db.invoices.filter((i) => i.patientId !== patientId);
  db.beds.forEach((b) => { if (b.patientId === patientId) { b.status = "cleaning"; b.patientId = undefined; } });
  db.patients.splice(idx, 1);

  db.notifications.push({
    id: db.generateId("NTF"),
    userId: "U-1",
    title: "تم حذف مريض",
    message: `تم حذف المريض ${patientName} مع ${deletedAppointments + deletedPrescriptions + deletedRecords + deletedLabs + deletedInvoices} سجل مرتبط`,
    type: "system",
    read: false,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    message: `تم حذف المريض ${patientName} وكل بياناته`,
    deleted: { appointments: deletedAppointments, prescriptions: deletedPrescriptions, records: deletedRecords, labs: deletedLabs, invoices: deletedInvoices }
  });
}
