import { NextResponse } from "next/server";
import { extractText } from "@/lib/ocr";
export const runtime = "nodejs";
const sniff = (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 ? "image/jpeg" : b.subarray(1, 4).toString() === "PNG" ? "image/png" : b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" ? "image/webp" : null;
export async function POST(req: Request) {
  const f = (await req.formData().catch(() => null))?.get("file");
  if (!(f instanceof File)) return NextResponse.json({ error: "No image uploaded." }, { status: 400 });
  if (f.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image is larger than 4 MB." }, { status: 413 });
  const buf = Buffer.from(await f.arrayBuffer()); const mime = sniff(buf);
  if (!mime) return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 415 });
  try { return NextResponse.json({ rawText: await extractText(buf, mime) }); }
  catch (e) { const nc = (e as Error).message === "not_configured";
    return NextResponse.json({ error: nc ? "OCR is not configured. Set OPENAI_API_KEY." : "Could not read this image. Try a clearer photo." }, { status: nc ? 501 : 502 }); }
}
