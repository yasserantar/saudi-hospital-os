import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    beds: db.beds,
    summary: {
      total: db.beds.length,
      available: db.beds.filter((b) => b.status === "available").length,
      occupied: db.beds.filter((b) => b.status === "occupied").length,
      cleaning: db.beds.filter((b) => b.status === "cleaning").length,
      maintenance: db.beds.filter((b) => b.status === "maintenance").length,
      occupancyRate: Math.round((db.beds.filter((b) => b.status === "occupied").length / db.beds.length) * 100),
    },
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const { bedId, status, patientId } = await req.json();
    const idx = db.beds.findIndex((b) => b.id === bedId);
    if (idx === -1) return NextResponse.json({ error: "السرير غير موجود" }, { status: 404 });
    db.beds[idx] = {
      ...db.beds[idx],
      status,
      patientId: patientId || undefined,
      admittedAt: status === "occupied" ? new Date().toISOString() : db.beds[idx].admittedAt,
    };
    return NextResponse.json({ success: true, bed: db.beds[idx] });
  } catch {
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}
