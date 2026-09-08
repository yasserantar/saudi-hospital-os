import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const patientId = req.nextUrl.searchParams.get("patientId");
  let list = db.invoices;
  if (status) list = list.filter((i) => i.status === status);
  if (patientId) list = list.filter((i) => i.patientId === patientId);
  const enriched = list.map((i) => ({
    ...i,
    patient: db.patients.find((p) => p.id === i.patientId),
  }));
  return NextResponse.json({ invoices: enriched });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.patientId || !body.items?.length) {
      return NextResponse.json({ error: "بيانات الفاتورة ناقصة" }, { status: 400 });
    }
    // دعم schemas متعددة: {quantity, unitPrice} أو {total}
    const normalizedItems = body.items.map((i: any) => {
      const quantity = i.quantity || 1;
      const unitPrice = i.unitPrice || i.total || 0;
      return { ...i, quantity, unitPrice, total: quantity * unitPrice };
    });
    const subtotal = normalizedItems.reduce((s: number, i: any) => s + i.total, 0);
    const discount = body.discount || 0;
    const tax = Math.round((subtotal - discount) * 0.15); // VAT 15%
    const total = subtotal - discount + tax;
    const invoice = {
      id: db.generateId("INV"),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(db.invoices.length + 1).padStart(3, "0")}`,
      patientId: body.patientId,
      items: normalizedItems,
      paymentMethod: body.paymentMethod || "cash",
      subtotal, discount, tax, total,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };
    db.invoices.push(invoice);
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل إنشاء الفاتورة" }, { status: 500 });
  }
}
