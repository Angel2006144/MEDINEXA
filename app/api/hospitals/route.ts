import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
const Q = z.object({ q: z.string().max(80).optional(), dept: z.string().max(60).optional(), page: z.coerce.number().int().min(1).default(1) });
export async function GET(req: Request) {
  const p = Q.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!p.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  try {
    const { q, dept, page } = p.data;
    const data = await db.hospital.findMany({
      where: { ...(q && { name: { contains: q, mode: "insensitive" } }), ...(dept && { departments: { some: { department: { name: dept } } } }) },
      select: { id: true, slug: true, name: true, address: true, lat: true, lng: true, open24x7: true }, skip: (page - 1) * 12, take: 12 });
    return NextResponse.json({ data, isDemo: true });
  } catch { return NextResponse.json({ error: "Service unavailable" }, { status: 503 }); }
}
