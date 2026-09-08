import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");
  const doctorId = req.nextUrl.searchParams.get("doctorId");
  let list = db.medicalRecords;
  if (patientId) list = list.filter((r) => r.patientId === patientId);
  if (doctorId) list = list.filter((r) => r.doctorId === doctorId);
  const enriched = list.map((r) => ({
    ...r,
    patient: db.patients.find((p) => p.id === r.patientId),
    doctor: db.doctors.find((d) => d.id === r.doctorId),
  }));
  return NextResponse.json({ records: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.doctorId || !body.diagnosis) {
      return NextResponse.json({ error: "بيانات السجل ناقصة" }, { status: 400 });
    }
    const record = {
      id: db.generateId("MR"),
      visitDate: new Date().toISOString(),
      ...body,
    };
    db.medicalRecords.push(record);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل حفظ السجل" }, { status: 500 });
  }
}
