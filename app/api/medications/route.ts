import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET() {
  const lowStock = db.medications.filter((m) => m.stock < 50);
  const expiringSoon = db.medications.filter((m) => {
    const exp = new Date(m.expiryDate).getTime();
    return exp - Date.now() < 90 * 24 * 60 * 60 * 1000; // أقل من 90 يوم
  });
  return NextResponse.json({
    medications: db.medications,
    total: db.medications.length,
    lowStock, expiringSoon,
    inventoryValue: db.medications.reduce((sum, m) => sum + m.stock * m.unitPrice, 0),
  });
}
