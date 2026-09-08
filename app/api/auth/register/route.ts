import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// تشفير بسيط (في الإنتاج: bcrypt)
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

// تحقق قوة كلمة المرور
function passwordStrength(p: string): { ok: boolean; score: number; msg: string } {
  if (p.length < 8) return { ok: false, score: 0, msg: "كلمة المرور قصيرة جداً (8 أحرف على الأقل)" };
  if (p.length < 10) return { ok: true, score: 2, msg: "مقبولة" };
  const hasNum = /\d/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
  const score = (hasNum ? 1 : 0) + (hasUpper ? 1 : 0) + (hasSpecial ? 1 : 0) + 1;
  return { ok: score >= 2, score, msg: score >= 4 ? "قوية" : score >= 3 ? "جيدة" : "مقبولة" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, role, phone } = body;

    // التحقق من البيانات الأساسية
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "الاسم والبريد وكلمة المرور حقول مطلوبة" },
        { status: 400 }
      );
    }

    // تحقق قوة كلمة المرور
    const pwCheck = passwordStrength(password);
    if (!pwCheck.ok) {
      return NextResponse.json(
        { error: pwCheck.msg },
        { status: 400 }
      );
    }

    // تحقق صيغة البريد
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صالح" },
        { status: 400 }
      );
    }

    // تحقق عدم تكرار الإيميل
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد مسجل مسبقاً. جرّب تسجيل الدخول" },
        { status: 409 }
      );
    }

    // الدور الافتراضي = patient إذا لم يحدد
    const userRole = role || "patient";
    const allowedRoles = ["patient", "doctor", "receptionist", "pharmacist"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "الدور المحدد غير مسموح" },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const passwordHash = await hashPassword(password);

    // إنشاء المستخدم
    const userId = `U-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password: passwordHash, // مخزّن مشفّر
      fullName,
      role: userRole,
      phone: phone || undefined,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    // إذا كان مريض → إنشاء ملف مريض تلقائياً
    if (userRole === "patient") {
      const patientId = `P-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      const fileNumber = `MRN-${100000 + db.patients.length + 1}`;
      db.patients.push({
        id: patientId,
        fileNumber,
        userId,
        fullName,
        nationalId: `TEMP-${userId}`, // رقم مؤقت يُحدّث لاحقاً
        dateOfBirth: "1990-01-01", // يُحدّث لاحقاً
        gender: "male",
        phone: phone || "+966500000000",
        email,
        registeredAt: new Date().toISOString(),
      });
    }

    // إشعار ترحيبي
    db.notifications.push({
      id: `NTF-${Date.now().toString(36).toUpperCase()}`,
      userId,
      title: "مرحباً بك في Saudi Hospital OS",
      message: `أهلاً ${fullName}! حسابك تم إنشاؤه بنجاح كـ${userRole === "patient" ? "مريض" : userRole === "doctor" ? "طبيب" : userRole === "receptionist" ? "موظف استقبال" : "صيدلي"}.`,
      type: "system",
      read: false,
      createdAt: new Date().toISOString(),
    });

    // إرجاع token فوري + بيانات المستخدم
    return NextResponse.json(
      {
        success: true,
        message: "تم إنشاء الحساب بنجاح! يمكنك الدخول الآن",
        token: makeToken(userId, userRole),
        user: {
          id: userId,
          email: newUser.email,
          fullName,
          role: userRole,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "فشل التسجيل. حاول مرة أخرى" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: "Saudi Hospital OS — Public Registration",
    method: "POST",
    requiredFields: ["fullName", "email", "password"],
    optionalFields: ["phone", "role"],
    allowedRoles: ["patient", "doctor", "receptionist", "pharmacist"],
    passwordRules: "8 أحرف على الأقل + أرقام أو حروف كبيرة أو رموز",
  });
}
