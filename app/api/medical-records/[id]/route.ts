import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = (db.medicalRecords as any[]).findIndex((r) => r.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  const rec = (db.medicalRecords as any[])[idx];
  (db.medicalRecords as any[]).splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف السجل الطبي ${rec.id}` });
}
