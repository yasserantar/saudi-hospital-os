import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = (db.beds as any[]).findIndex((b) => b.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "السرير غير موجود" }, { status: 404 });
  const bed = (db.beds as any[])[idx];
  if (bed.status === "occupied") {
    return NextResponse.json({ error: "لا يمكن حذف سرير مشغول، أطلق المريض أولاً" }, { status: 400 });
  }
  (db.beds as any[]).splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف السرير ${bed.roomNumber}` });
}
