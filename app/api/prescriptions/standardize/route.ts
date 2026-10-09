import { NextResponse } from "next/server";
import { z } from "zod";
import { standardize } from "@/lib/ocr";
export async function POST(req: Request) {
  const p = z.object({ rawText: z.string().min(1).max(8000) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid text." }, { status: 400 });
  try { return NextResponse.json({ result: await standardize(p.data.rawText) }); }
  catch (e) { const nc = (e as Error).message === "not_configured";
    return NextResponse.json({ error: nc ? "AI service is not configured. Set OPENAI_API_KEY." : "Could not standardize the text." }, { status: nc ? 501 : 502 }); }
}
