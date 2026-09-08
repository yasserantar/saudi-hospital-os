import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    name: "Saudi Hospital OS",
    version: "1.0.0",
    status: "operational",
    timestamp: new Date().toISOString(),
    modules: [
      { path: "/api/auth/login", desc: "Authentication" },
      { path: "/api/patients", desc: "Patients CRUD" },
      { path: "/api/doctors", desc: "Doctors management" },
      { path: "/api/appointments", desc: "Appointments" },
      { path: "/api/medical-records", desc: "EHR (Electronic Health Records)" },
      { path: "/api/prescriptions", desc: "Prescriptions" },
      { path: "/api/medications", desc: "Pharmacy inventory" },
      { path: "/api/labs", desc: "Lab tests" },
      { path: "/api/invoices", desc: "Invoicing & billing" },
      { path: "/api/beds", desc: "Bed management" },
      { path: "/api/dashboard", desc: "Dashboard KPIs" },
      { path: "/api/notifications", desc: "Internal notifications" },
      { path: "/api/clinics", desc: "Clinics directory" },
    ],
  });
}
