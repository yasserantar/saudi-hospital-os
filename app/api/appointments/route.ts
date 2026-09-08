import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const doctorId = req.nextUrl.searchParams.get("doctorId");
  const patientId = req.nextUrl.searchParams.get("patientId");
  let list = db.appointments;
  if (date) list = list.filter((a) => a.date === date);
  if (doctorId) list = list.filter((a) => a.doctorId === doctorId);
  if (patientId) list = list.filter((a) => a.patientId === patientId);
  // إثراء البيانات
  const enriched = list.map((a) => ({
    ...a,
    patient: db.patients.find((p) => p.id === a.patientId),
    doctor: db.doctors.find((d) => d.id === a.doctorId),
  }));
  return NextResponse.json({ appointments: enriched, total: enriched.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.doctorId || !body.date || !body.time) {
      return NextResponse.json({ error: "بيانات الموعد ناقصة" }, { status: 400 });
    }
    // فحص التعارض
    const conflict = db.appointments.find(
      (a) => a.doctorId === body.doctorId && a.date === body.date && a.time === body.time && a.status !== "cancelled"
    );
    if (conflict) return NextResponse.json({ error: "هذا الموعد محجوز بالفعل" }, { status: 409 });

    const apt = {
      id: db.generateId("APT"),
      ...body,
      duration: body.duration || 30,
      status: "scheduled" as const,
      createdAt: new Date().toISOString(),
    };
    db.appointments.push(apt);
    // إشعار للطبيب
    db.notifications.push({
      id: db.generateId("NTF"),
      userId: db.doctors.find((d) => d.id === body.doctorId)?.userId || "U-2",
      title: "موعد جديد",
      message: `موعد جديد بتاريخ ${body.date} الساعة ${body.time}`,
      type: "appointment", read: false,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, appointment: apt }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل حجز الموعد" }, { status: 500 });
  }
}
