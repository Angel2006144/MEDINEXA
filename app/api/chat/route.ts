import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export async function POST(req: Request) {
  const s = getSession(); if (!s) return NextResponse.json({ error: "Log in to chat." }, { status: 401 });
  const p = z.object({ doctorId: z.string().min(1), body: z.string().min(1).max(1000) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Message must be 1–1000 characters." }, { status: 400 });
  try {
    const doc = await db.doctor.findUnique({ where: { id: p.data.doctorId } });
    if (!doc || !doc.chatEnabled) return NextResponse.json({ error: "Chat is unavailable for this doctor." }, { status: 404 });
    const chat = (await db.chat.findFirst({ where: { userId: s.uid, doctorId: doc.id } })) ?? (await db.chat.create({ data: { userId: s.uid, doctorId: doc.id } }));
    const u = await db.message.create({ data: { chatId: chat.id, sender: "user", body: p.data.body.replace(/[<>]/g, "").trim() } });
    // Demo responder. Replace with real-time doctor delivery (WebSocket/Pusher) when real doctor accounts exist.
    const d = await db.message.create({ data: { chatId: chat.id, sender: "doctor", body: "Demo consultation: no real doctor is connected. Please contact the hospital directly for medical advice, and call emergency services in an emergency." } });
    return NextResponse.json({ messages: [u, d] });
  } catch { return NextResponse.json({ error: "Chat is unavailable right now." }, { status: 503 }); }
}
