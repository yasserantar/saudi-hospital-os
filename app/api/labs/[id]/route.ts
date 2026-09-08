import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = db.labTests.findIndex((l) => l.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "التحليل غير موجود" }, { status: 404 });
  const lab = db.labTests[idx];
  db.labTests.splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف التحليل ${lab.id}` });
}
