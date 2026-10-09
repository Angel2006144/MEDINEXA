"use client";
import { useRef, useState } from "react";
type Med = { name: string; dosage: string | null; frequency: string | null; duration: string | null; instructions: string | null };
type R = { patientName: string | null; date: string | null; doctorName: string | null; medicines: Med[]; notes: string | null; uncertain: string[] };
const toText = (r: R) => [`Patient: ${r.patientName ?? "not detected"}`, `Date: ${r.date ?? "not detected"}`, `Doctor: ${r.doctorName ?? "not detected"}`, ...r.medicines.map(m => `- ${m.name} | dose: ${m.dosage ?? "n/a"} | frequency: ${m.frequency ?? "n/a"} | duration: ${m.duration ?? "n/a"} | notes: ${m.instructions ?? "n/a"}`), r.notes ? `Notes: ${r.notes}` : "", r.uncertain.length ? `Uncertain: ${r.uncertain.join("; ")}` : ""].filter(Boolean).join("\n");
export default function PrescriptionScanner() {
  const up = useRef<HTMLInputElement>(null), cam = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null), [raw, setRaw] = useState(""), [res, setRes] = useState<R | null>(null), [err, setErr] = useState(""), [busy, setBusy] = useState("");
  const pick = (f?: File) => { if (f) { setFile(f); setRaw(""); setRes(null); setErr(""); } };
  async function call(url: string, init: RequestInit, label: string) { setBusy(label); setErr(""); try { const r = await fetch(url, init); const j = await r.json(); if (!r.ok) { setErr(j.error); return null; } return j; } catch { setErr("Network error. Try again."); return null; } finally { setBusy(""); } }
  const scan = async () => { const fd = new FormData(); fd.append("file", file!); const j = await call("/api/prescriptions/ocr", { method: "POST", body: fd }, "Reading image…"); if (j) setRaw(j.rawText); };
  const std = async () => { const j = await call("/api/prescriptions/standardize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawText: raw }) }, "Standardizing…"); if (j) setRes(j.result); };
  const dl = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([raw], { type: "text/plain" })); a.download = "extracted-prescription.txt"; a.click(); };
  return (<div className="glass space-y-5 p-6">
    <p className="rounded-lg bg-amber-400/10 p-3 text-xs text-amber-200">This tool only extracts and standardizes text. It does not diagnose, prescribe or change doses. Always verify against the original prescription with a qualified professional.</p>
    <div className="flex flex-wrap gap-3">
      <button onClick={() => cam.current?.click()} className="btn btn-primary !py-2 text-sm">Scan using camera</button>
      <button onClick={() => up.current?.click()} className="btn btn-ghost !py-2 text-sm">{file ? "Upload another prescription" : "Upload prescription"}</button>
      <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={e => pick(e.target.files?.[0])} />
      <input ref={up} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => pick(e.target.files?.[0])} /></div>
    {file && <><img src={URL.createObjectURL(file)} alt="Prescription preview" className="max-h-80 rounded-xl" />
      <button disabled={!!busy} onClick={scan} className="btn btn-primary !py-2 text-sm disabled:opacity-50">Scan prescription</button></>}
    {busy && <p className="text-sm text-cyan-200">{busy}</p>}
    {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}
    {raw && <div><h2 className="font-semibold">Extracted text (original)</h2><pre className="mt-2 whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-xs">{raw}</pre>
      <div className="mt-3 flex flex-wrap gap-3"><button disabled={!!busy} onClick={std} className="btn btn-primary !py-2 text-sm">Standardize to English</button><button onClick={dl} className="btn btn-ghost !py-2 text-sm">Download extracted text</button></div></div>}
    {res && <div className="space-y-2 text-sm"><h2 className="font-semibold">Standardized (verify before use)</h2>
      <p>Patient: {res.patientName ?? "not detected"} · Date: {res.date ?? "not detected"} · Doctor: {res.doctorName ?? "not detected"}</p>
      <ul className="space-y-2">{res.medicines.map((m, i) => <li key={i} className="rounded-xl bg-white/5 p-3"><b>{m.name}</b><br />Dosage: {m.dosage ?? "—"} · Frequency: {m.frequency ?? "—"} · Duration: {m.duration ?? "—"}<br />Instructions: {m.instructions ?? "—"}</li>)}</ul>
      {res.uncertain.length > 0 && <p className="text-amber-300">Uncertain: {res.uncertain.join("; ")}</p>}
      <button onClick={() => navigator.clipboard.writeText(toText(res))} className="btn btn-ghost !py-2 text-sm">Copy standardized text</button></div>}
  </div>);
}
