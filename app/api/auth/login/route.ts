import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// دالة تجزئة متطابقة مع register
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password + "saudi_hospital_salt_2026");
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = ((h << 5) - h + password.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(16, "0");
}

function makeToken(userId: string, role: string) {
  return Buffer.from(JSON.stringify({ userId, role, ts: Date.now() })).toString("base64");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    // محاولة جديدة: كلمة المرور مشفّرة
    const passwordHash = await hashPassword(password);
    const isMatch = user.password === passwordHash;

    // توافق عكسي: كلمات المرور القديمة غير المشفّرة (admin123, doctor123, إلخ)
    const isLegacyMatch = !user.password.includes(":") && user.password === password;

    if (!isMatch && !isLegacyMatch) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    // تحديث كلمة المرور القديمة إلى مشفّرة (مرة واحدة)
    if (isLegacyMatch && !isMatch) {
      user.password = passwordHash;
    }

    return NextResponse.json({
      token: makeToken(user.id, user.role),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        specialization: user.specialization,
      },
    });
  } catch {
    return NextResponse.json({ error: "فشل تسجيل الدخول" }, { status: 500 });
  }
}
