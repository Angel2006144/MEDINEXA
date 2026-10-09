import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
export type Session = { uid: string; role: string; name: string };
const secret = () => { const s = process.env.NEXTAUTH_SECRET; if (!s && process.env.NODE_ENV === "production") throw new Error("NEXTAUTH_SECRET missing"); return s || "dev-only-secret"; };
const mac = (b: string) => createHmac("sha256", secret()).update(b).digest("base64url");
export const sign = (p: Session) => { const b = Buffer.from(JSON.stringify({ ...p, exp: Date.now() + 6048e5 })).toString("base64url"); return `${b}.${mac(b)}`; };
export function getSession(): Session | null {
  const c = cookies().get("mx_session")?.value; if (!c) return null;
  const [b, s] = c.split("."); if (!b || !s) return null;
  const e = mac(b); if (e.length !== s.length || !timingSafeEqual(Buffer.from(e), Buffer.from(s))) return null;
  const p = JSON.parse(Buffer.from(b, "base64url").toString()); return p.exp > Date.now() ? p : null;
}
import type { NextResponse } from "next/server";
export const attach = (res: NextResponse, u: { id: string; role: string; name: string }) => {
  res.cookies.set("mx_session", sign({ uid: u.id, role: u.role, name: u.name }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 }); return res; };
