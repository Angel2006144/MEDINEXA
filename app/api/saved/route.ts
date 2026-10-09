import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export async function POST(req: Request) {
  const s = getSession(); if (!s) return NextResponse.json({ error: "Log in to save hospitals." }, { status: 401 });
  const p = z.object({ hospitalId: z.string().min(1) }).safeParse(await req.json().catch(() => null)); if (!p.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const key = { userId_hospitalId: { userId: s.uid, hospitalId: p.data.hospitalId } };
  try { const ex = await db.savedHospital.findUnique({ where: key });
    if (ex) await db.savedHospital.delete({ where: key }); else await db.savedHospital.create({ data: { userId: s.uid, hospitalId: p.data.hospitalId } });
    return NextResponse.json({ saved: !ex }); } catch { return NextResponse.json({ error: "Could not update saved hospitals." }, { status: 503 }); }
}
