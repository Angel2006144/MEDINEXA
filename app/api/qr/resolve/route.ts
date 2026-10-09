import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
export async function POST(req: Request) {
  const b = z.object({ token: z.string().min(8).max(64) }).safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "Invalid QR code" }, { status: 400 });
  const t = await db.shareToken.findUnique({ where: { token: b.data.token } });
  if (!t || (t.expiresAt && t.expiresAt < new Date())) return NextResponse.json({ error: "Invalid or expired QR code" }, { status: 404 });
  const path = t.targetType === "hospital" ? `/hospitals/${t.targetId}` : t.targetType === "doctor" ? `/doctors/${t.targetId}` : "/";
  return NextResponse.json({ redirect: path });
}
