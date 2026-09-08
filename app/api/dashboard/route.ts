import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    kpis: {
      totalPatients: db.patients.length,
      totalDoctors: db.doctors.length,
      totalClinics: db.clinics.length,
      todayAppointments: db.appointments.filter((a) => a.date === today).length,
      pendingAppointments: db.appointments.filter((a) => a.status === "scheduled").length,
      completedAppointments: db.appointments.filter((a) => a.status === "completed").length,
      pendingLabTests: db.labTests.filter((t) => t.status === "pending" || t.status === "in_progress").length,
      pendingPrescriptions: db.prescriptions.filter((r) => r.status === "pending").length,
      bedOccupancy: Math.round((db.beds.filter((b) => b.status === "occupied").length / db.beds.length) * 100),
      totalRevenue: db.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
      pendingInvoices: db.invoices.filter((i) => i.status === "pending").length,
      lowStockMeds: db.medications.filter((m) => m.stock < 50).length,
    },
    revenueByMonth: [
      { month: "يناير", amount: 125000 },
      { month: "فبراير", amount: 142000 },
      { month: "مارس", amount: 168000 },
      { month: "أبريل", amount: 155000 },
      { month: "مايو", amount: 189000 },
      { month: "يونيو", amount: 215000 },
    ],
    appointmentsByStatus: {
      scheduled: db.appointments.filter((a) => a.status === "scheduled").length,
      confirmed: db.appointments.filter((a) => a.status === "confirmed").length,
      completed: db.appointments.filter((a) => a.status === "completed").length,
      cancelled: db.appointments.filter((a) => a.status === "cancelled").length,
    },
  });
}
