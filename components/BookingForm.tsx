"use client";
import { useState } from "react";
import Link from "next/link";
import { DOCTOR_SLOTS, SERVICE_SLOTS } from "@/lib/slots";
type Opt = { id: string; label: string };
export default function BookingForm({ hospitalId, doctors, services, initialDoctorId }: { hospitalId: string; doctors: Opt[]; services: Opt[]; initialDoctorId?: string }) {
  const [mode, setMode] = useState<"doctor" | "service">(initialDoctorId || !services.length ? "doctor" : "doctor");
  const [targetId, setTargetId] = useState(initialDoctorId ?? "");
  const [f, setF] = useState({ patientName: "", phone: "", date: "", slot: "", reason: "" });
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [ref, setRef] = useState("");
  const slots = mode === "doctor" ? DOCTOR_SLOTS : SERVICE_SLOTS;
  const opts = mode === "doctor" ? doctors : services;
  const field = "glass w-full bg-transparent px-4 py-3 text-sm outline-none focus:border-cyan-300";
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId, ...(mode === "doctor" ? { doctorId: targetId } : { serviceId: targetId }), ...f, reason: f.reason || undefined }) });
      const j = await r.json();
      if (!r.ok) setErr(j.error ?? "Booking failed."); else setRef(j.reference);
    } catch { setErr("Network error. Check your connection and try again."); }
    setBusy(false);
  }
  if (ref) return (<div className="glass p-6"><p className="font-display text-lg text-cyan-200">Request received</p>
    <p className="mt-2 text-sm">Reference: <b>{ref}</b></p>
    <p className="mt-2 text-xs text-amber-300">Demo booking — not confirmed with any real hospital.</p>
    <Link href={`/booking/${ref}`} className="btn btn-ghost mt-4 !py-2 text-sm">View booking status</Link></div>);
  return (<form onSubmit={submit} className="glass grid max-w-2xl gap-4 p-6">
    <div className="flex gap-3">{(["doctor", "service"] as const).map(m => <button type="button" key={m} onClick={() => { setMode(m); setTargetId(""); setF({ ...f, slot: "" }); }}
      className={`btn !px-5 !py-2 text-sm ${mode === m ? "btn-primary" : "btn-ghost"}`}>{m === "doctor" ? "Doctor" : "Service"}</button>)}</div>
    <select required value={targetId} onChange={e => setTargetId(e.target.value)} className={`${field} bg-navy`} aria-label={`Select ${mode}`}>
      <option value="">Select a {mode}</option>{opts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
    <div className="grid gap-4 sm:grid-cols-2">
      <input required type="date" min={new Date().toISOString().slice(0, 10)} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className={field} aria-label="Date" />
      <select required value={f.slot} onChange={e => setF({ ...f, slot: e.target.value })} className={`${field} bg-navy`} aria-label="Time slot"><option value="">Select time</option>{slots.map(s => <option key={s}>{s}</option>)}</select>
      <input required minLength={2} maxLength={80} placeholder="Patient name" value={f.patientName} onChange={e => setF({ ...f, patientName: e.target.value })} className={field} />
      <input required type="tel" placeholder="Phone (+91…)" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className={field} />
    </div>
    <textarea maxLength={300} placeholder="Reason for visit (optional)" value={f.reason} onChange={e => setF({ ...f, reason: e.target.value })} className={field} rows={3} />
    {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}
    <button disabled={busy} className="btn btn-primary w-fit disabled:opacity-50">{busy ? "Booking…" : "Request booking"}</button>
    <p className="text-xs text-slate-400">Demo mode: requests are stored but not sent to hospitals. Do not use for emergencies — call the hospital's emergency number.</p>
  </form>);
}
