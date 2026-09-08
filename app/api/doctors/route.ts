import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "معرف الطبيب مطلوب" }, { status: 400 });
  const idx = db.doctors.findIndex((d) => d.id === id);
  if (idx === -1) return NextResponse.json({ error: "الطبيب غير موجود" }, { status: 404 });
  const linkedAppts = db.appointments.filter((a) => a.doctorId === id).length;
  const linkedRx = db.prescriptions.filter((r) => r.doctorId === id).length;
  if (linkedAppts > 0 || linkedRx > 0) {
    return NextResponse.json({ error: `لا يمكن الحذف: ${linkedAppts} موعد و ${linkedRx} وصفة مرتبطة` }, { status: 400 });
  }
  const doctor = db.doctors[idx];
  db.doctors.splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف الطبيب ${doctor.fullName}` });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.fullName || !body.specialty) {
      return NextResponse.json({ error: "اسم الطبيب والتخصص مطلوبان" }, { status: 400 });
    }
    const doctor = {
      id: db.generateId("D"),
      ...body,
      rating: body.rating || 4.5,
      patientsCount: body.patientsCount || 0,
      active: body.active ?? true,
      createdAt: new Date().toISOString(),
    };
    db.doctors.push(doctor);
    return NextResponse.json({ success: true, doctor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل إضافة الطبيب" }, { status: 500 });
  }
}
