import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = (db.appointments as any[]).findIndex((a) => a.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "الموعد غير موجود" }, { status: 404 });
  const appt = (db.appointments as any[])[idx];
  (db.appointments as any[]).splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف الموعد ${appt.id}` });
}
