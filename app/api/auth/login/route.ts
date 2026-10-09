import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verify } from "@/lib/password";
import { sign } from "@/lib/session";
import { limited, ip } from "@/lib/ratelimit";
export async function POST(req: Request) {
  if (limited("login" + ip(req), 10, 600_000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const p = z.object({ email: z.string().email().max(120), password: z.string().min(1).max(100) }).safeParse(await req.json().catch(() => null));
  const bad = NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  if (!p.success) return bad;
  try {
    const u = await db.user.findUnique({ where: { email: p.data.email.toLowerCase() } });
    if (!u?.passwordHash || !verify(p.data.password, u.passwordHash)) return bad;
    const res = NextResponse.json({ ok: true });
    res.cookies.set("mx_session", sign({ uid: u.id, role: u.role, name: u.name }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
    return res;
  } catch { return NextResponse.json({ error: "Login unavailable right now." }, { status: 503 }); }
}
