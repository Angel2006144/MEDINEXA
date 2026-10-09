import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hash } from "@/lib/password";
import { attach } from "@/lib/session";
import { limited, ip } from "@/lib/ratelimit";
export async function POST(req: Request) {
  if (limited("reg" + ip(req), 5, 3600_000)) return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 });
  const p = z.object({ name: z.string().min(2).max(60), email: z.string().email().max(120), password: z.string().min(8).max(100) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Enter a name, a valid email and a password of 8+ characters." }, { status: 400 });
  try {
    const email = p.data.email.toLowerCase();
    if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const u = await db.user.create({ data: { email, name: p.data.name.replace(/[<>]/g, "").trim(), passwordHash: hash(p.data.password), role: "PATIENT" } });
    return attach(NextResponse.json({ ok: true }, { status: 201 }), u);
  } catch { return NextResponse.json({ error: "Sign-up unavailable right now." }, { status: 503 }); }
}
