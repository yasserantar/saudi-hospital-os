import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";
  const list = db.patients.filter((p) =>
    !q || p.fullName.toLowerCase().includes(q) || p.nationalId.includes(q) || p.fileNumber.toLowerCase().includes(q)
  );
  return NextResponse.json({ patients: list, total: list.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.fullName || !body.nationalId || !body.phone) {
      return NextResponse.json({ error: "الاسم ورقم الهوية والجوال مطلوبة" }, { status: 400 });
    }
    if (db.patients.find((p) => p.nationalId === body.nationalId)) {
      return NextResponse.json({ error: "المريض مسجل مسبقاً بهذا الرقم" }, { status: 409 });
    }
    const id = db.generateId("P");
    const fileNumber = `MRN-${100000 + db.patients.length + 1}`;
    const patient = {
      id, fileNumber, ...body,
      allergies: body.allergies || [], chronicDiseases: body.chronicDiseases || [],
      registeredAt: new Date().toISOString(),
    };
    db.patients.push(patient);
    return NextResponse.json({ success: true, patient }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل تسجيل المريض" }, { status: 500 });
  }
}
