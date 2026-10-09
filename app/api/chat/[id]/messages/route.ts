import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = getSession(); if (!s) return NextResponse.json({ error: "Log in to view chats." }, { status: 401 });
  const c = await db.chat.findUnique({ where: { id: params.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!c || c.userId !== s.uid) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ messages: c.messages });
}
