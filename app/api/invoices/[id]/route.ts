import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idx = (db.invoices as any[]).findIndex((i) => i.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
  const inv = (db.invoices as any[])[idx];
  if (inv.status === "paid") {
    return NextResponse.json({ error: "لا يمكن حذف فاتورة مدفوعة" }, { status: 400 });
  }
  (db.invoices as any[]).splice(idx, 1);
  return NextResponse.json({ success: true, message: `تم حذف الفاتورة ${inv.invoiceNumber}` });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const idx = (db.invoices as any[]).findIndex((i) => i.id === params.id);
    if (idx === -1) return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    const old = (db.invoices as any[])[idx];
    if (body.status === "paid" && old.status !== "paid") {
      body.paidAt = new Date().toISOString();
    }
    (db.invoices as any[])[idx] = { ...old, ...body, id: old.id, invoiceNumber: old.invoiceNumber, createdAt: old.createdAt };
    return NextResponse.json({ success: true, invoice: (db.invoices as any[])[idx] });
  } catch {
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}
