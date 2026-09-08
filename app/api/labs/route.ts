import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const patientId = req.nextUrl.searchParams.get("patientId");
  let list = db.labTests;
  if (status) list = list.filter((t) => t.status === status);
  if (patientId) list = list.filter((t) => t.patientId === patientId);
  const enriched = list.map((t) => ({
    ...t,
    patient: db.patients.find((p) => p.id === t.patientId),
    doctor: db.doctors.find((d) => d.id === t.doctorId),
  }));
  return NextResponse.json({ labTests: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.doctorId || !body.testType) {
      return NextResponse.json({ error: "بيانات الفحص ناقصة" }, { status: 400 });
    }
    const test = {
      id: db.generateId("LAB"),
      requestedAt: new Date().toISOString(),
      status: "pending" as const,
      ...body,
    };
    db.labTests.push(test);
    return NextResponse.json({ success: true, labTest: test }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل طلب الفحص" }, { status: 500 });
  }
}
