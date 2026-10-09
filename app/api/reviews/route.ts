import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { limited } from "@/lib/ratelimit";
const B = z.object({ rating: z.number().int().min(1).max(5), text: z.string().min(10).max(600), category: z.string().max(30).optional(), hospitalId: z.string().optional(), doctorId: z.string().optional() })
  .refine(b => !!b.hospitalId !== !!b.doctorId, { message: "Review a hospital or a doctor." });
export async function POST(req: Request) {
  const s = getSession(); if (!s) return NextResponse.json({ error: "Log in to write a review." }, { status: 401 });
  if (limited("rev" + s.uid, 5, 3600_000)) return NextResponse.json({ error: "Review limit reached. Try again later." }, { status: 429 });
  const p = B.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Review must be 10–600 characters." }, { status: 400 });
  const b = p.data;
  try {
    const ok = b.hospitalId ? await db.hospital.findUnique({ where: { id: b.hospitalId } }) : await db.doctor.findUnique({ where: { id: b.doctorId! } });
    if (!ok) return NextResponse.json({ error: "Not found." }, { status: 404 });
    await db.review.create({ data: { rating: b.rating, text: b.text.replace(/[<>]/g, "").trim(), category: b.category, hospitalId: b.hospitalId, doctorId: b.doctorId, userId: s.uid, displayName: s.name, isDemo: false } });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not save your review." }, { status: 503 }); }
}
