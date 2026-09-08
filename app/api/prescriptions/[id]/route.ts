import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = (db.prescriptions as any[]).findIndex((r) => r.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "الوصفة غير موجودة" }, { status: 404 });
  const rx = (db.prescriptions as any[])[idx];
  (db.prescriptions as any[]).splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف الوصفة ${rx.id}` });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const idx = (db.prescriptions as any[]).findIndex((r) => r.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "الوصفة غير موجودة" }, { status: 404 });
    (db.prescriptions as any[])[idx] = { ...(db.prescriptions as any[])[idx], ...body, id: (db.prescriptions as any[])[idx].id, prescribedAt: (db.prescriptions as any[])[idx].prescribedAt };
    return NextResponse.json({ success: true, prescription: (db.prescriptions as any[])[idx] });
  } catch {
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}
