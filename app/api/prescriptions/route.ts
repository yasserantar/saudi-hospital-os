import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");
  const status = req.nextUrl.searchParams.get("status");
  let list = db.prescriptions;
  if (patientId) list = list.filter((r) => r.patientId === patientId);
  if (status) list = list.filter((r) => r.status === status);
  const enriched = list.map((r) => ({
    ...r,
    patient: db.patients.find((p) => p.id === r.patientId),
    doctor: db.doctors.find((d) => d.id === r.doctorId),
  }));
  return NextResponse.json({ prescriptions: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.doctorId) {
      return NextResponse.json({ error: "بيانات الوصفة ناقصة" }, { status: 400 });
    }
    // دعم schema الواجهة (medications[]) و schema الـ DB (items[])
    const items = body.items || (body.medications || []).map((m: any) => ({
      medicationName: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
    }));
    if (!items.length) {
      return NextResponse.json({ error: "بيانات الوصفة ناقصة" }, { status: 400 });
    }
    const rx = {
      id: db.generateId("RX"),
      patientId: body.patientId,
      doctorId: body.doctorId,
      items,
      notes: body.notes,
      diagnosis: body.diagnosis,
      prescribedAt: new Date().toISOString(),
      status: "pending" as const,
    };
    db.prescriptions.push(rx);
    db.notifications.push({
      id: db.generateId("NTF"),
      userId: "U-5",
      title: "وصفة طبية جديدة",
      message: `وصفة جديدة للمريض ${db.patients.find((p) => p.id === body.patientId)?.fullName}`,
      type: "prescription", read: false,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, prescription: rx }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل حفظ الوصفة" }, { status: 500 });
  }
}
