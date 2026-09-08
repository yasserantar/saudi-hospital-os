import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  let list = db.notifications;
  if (userId) list = list.filter((n) => n.userId === userId);
  return NextResponse.json({ notifications: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
}
