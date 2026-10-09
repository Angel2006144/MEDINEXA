// OCR + standardization service layer. Isolated from hospital logic. Swap the provider here only.
// SAFETY: transcribe/standardize only. Never diagnose, prescribe, recommend or change doses.
const KEY = process.env.OPENAI_API_KEY;
export const ocrConfigured = !!KEY;
async function ai(messages: unknown[], json = false): Promise<string> {
  const r = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0, messages, ...(json && { response_format: { type: "json_object" } }) }) });
  if (!r.ok) throw new Error("ai_failed");
  return (await r.json()).choices[0].message.content as string;
}
export async function extractText(buf: Buffer, mime: string) {
  if (!KEY) throw new Error("not_configured");
  return ai([{ role: "system", content: "Transcribe ALL text in this prescription image exactly as written. Do not correct, interpret, translate or add anything. Mark unreadable parts as [unclear]. Output plain text only." },
    { role: "user", content: [{ type: "image_url", image_url: { url: `data:${mime};base64,${buf.toString("base64")}` } }] }]);
}
export async function standardize(raw: string) {
  if (!KEY) throw new Error("not_configured");
  const out = await ai([{ role: "system", content: `You reformat OCR text of a prescription into standardized English JSON. Rules: use ONLY information present in the text; use null for anything missing; never guess, infer, correct or change dosage, frequency or duration; never diagnose, recommend or suggest medicines; keep [unclear] markers and list uncertain items in "uncertain". Schema: {"patientName":string|null,"date":string|null,"doctorName":string|null,"medicines":[{"name":string,"dosage":string|null,"frequency":string|null,"duration":string|null,"instructions":string|null}],"notes":string|null,"uncertain":string[]}` },
    { role: "user", content: raw }], true);
  return JSON.parse(out);
}
