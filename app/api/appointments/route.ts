import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { DOCTOR_SLOTS, SERVICE_SLOTS } from "@/lib/slots";

// In-memory limiter: fine for local/demo. Use Upstash/Redis on Vercel (serverless instances don't share memory).
const hits = new Map<string, number[]>();
const limited = (ip: string) => { const now = Date.now(); const h = (hits.get(ip) ?? []).filter(t => now - t < 600_000); h.push(now); hits.set(ip, h); return h.length > 5; };
const clean = (s: string) => s.replace(/[<>]/g, "").trim();

const Body = z.object({
  hospitalId: z.string().min(1), doctorId: z.string().optional(), serviceId: z.string().optional(),
  patientName: z.string().min(2).max(80), phone: z.string().regex(/^[+\d][\d\s-]{7,15}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), slot: z.string(), reason: z.string().max(300).optional(),
}).refine(b => !!b.doctorId !== !!b.serviceId, { message: "Choose either a doctor or a service" });

export async function POST(req: Request) {
  if (limited(req.headers.get("x-forwarded-for") ?? "local")) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Invalid booking details" }, { status: 400 });
  const b = p.data;
  const date = new Date(`${b.date}T00:00:00.000Z`);
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
  if (isNaN(+date) || date < today || +date > +today + 60 * 864e5) return NextResponse.json({ error: "Pick a date within the next 60 days." }, { status: 400 });
  if (!(b.doctorId ? DOCTOR_SLOTS : SERVICE_SLOTS).includes(b.slot)) return NextResponse.json({ error: "Invalid time slot." }, { status: 400 });
  try {
    const target = b.doctorId
      ? await db.doctor.findFirst({ where: { id: b.doctorId, hospitalId: b.hospitalId } })
      : await db.service.findFirst({ where: { id: b.serviceId, hospitalId: b.hospitalId } });
    if (!target) return NextResponse.json({ error: "Doctor or service not found at this hospital." }, { status: 404 });
    if (b.doctorId) {
      const taken = await db.appointment.findFirst({ where: { doctorId: b.doctorId, date, slot: b.slot, status: { not: "CANCELLED" } } });
      if (taken) return NextResponse.json({ error: "That slot is already booked. Choose another time." }, { status: 409 });
    }
    const a = await db.appointment.create({ data: {
      reference: "MX-" + randomBytes(4).toString("hex").toUpperCase(), hospitalId: b.hospitalId, doctorId: b.doctorId, serviceId: b.serviceId,
      patientName: clean(b.patientName), phone: b.phone, userId: getSession()?.uid, date, slot: b.slot, reason: b.reason ? clean(b.reason) : null } });
    return NextResponse.json({ reference: a.reference, status: a.status, isDemo: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "Booking is unavailable right now. Try again shortly." }, { status: 503 }); }
}
