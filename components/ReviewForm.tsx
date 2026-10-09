"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function ReviewForm({ hospitalId, doctorId }: { hospitalId?: string; doctorId?: string }) {
  const r = useRouter(); const [rating, setRating] = useState(0), [text, setText] = useState(""), [err, setErr] = useState(""), [done, setDone] = useState(false), [login, setLogin] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!rating) return setErr("Choose a star rating.");
    try { const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, text, hospitalId, doctorId }) });
      if (res.ok) { setDone(true); r.refresh(); } else { if (res.status === 401) setLogin(true); setErr((await res.json()).error); } } catch { setErr("Network error."); }
  }
  if (done) return <p className="glass p-4 text-sm text-emerald-300">Thanks — your review is posted.</p>;
  return (<form onSubmit={submit} className="glass mb-4 max-w-lg space-y-3 p-4">
    <p className="text-sm font-semibold">Write a review</p>
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className={`text-2xl ${n <= rating ? "text-cyan-300" : "text-slate-600"}`}>★</button>)}</div>
    <textarea value={text} onChange={e => setText(e.target.value)} minLength={10} maxLength={600} required rows={3} placeholder="Share your experience (10+ characters)" className="w-full rounded-xl bg-white/5 p-3 text-sm outline-none focus:ring-1 focus:ring-cyan-300" />
    {err && <p role="alert" className="text-sm text-rose-300">{err} {login && <Link href="/login" className="underline">Log in</Link>}</p>}
    <button className="btn btn-primary !py-2 text-sm">Post review</button></form>);
}
