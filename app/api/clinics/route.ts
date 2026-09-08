import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.floor) {
      return NextResponse.json({ error: "اسم العيادة والرقم الدور مطلوبان" }, { status: 400 });
    }
    const clinic = {
      id: db.generateId("CL"),
      ...body,
      active: body.active ?? true,
      createdAt: new Date().toISOString(),
    };
    db.clinics.push(clinic);
    return NextResponse.json({ success: true, clinic }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل إنشاء العيادة" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "معرف العيادة مطلوب" }, { status: 400 });
  const idx = db.clinics.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "العيادة غير موجودة" }, { status: 404 });
  // تحقق من عدم وجود أطباء مرتبطين
  const linkedDoctors = db.doctors.filter((d) => d.clinicId === id).length;
  if (linkedDoctors > 0) {
    return NextResponse.json({ error: `لا يمكن الحذف: ${linkedDoctors} طبيب مرتبط بهذه العيادة` }, { status: 400 });
  }
  const clinic = db.clinics[idx];
  db.clinics.splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف العيادة ${clinic.name}` });
}
