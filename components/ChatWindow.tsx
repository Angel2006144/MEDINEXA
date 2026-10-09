"use client";
import { useEffect, useRef, useState } from "react";
type M = { id: string; sender: string; body: string; createdAt: string };
export default function ChatWindow({ doctorId, name, specialization, online, initial }: { doctorId: string; name: string; specialization: string; online: boolean; initial: M[] }) {
  const [msgs, setMsgs] = useState<M[]>(initial), [text, setText] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim()) return; setBusy(true); setErr("");
    try { const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doctorId, body: text }) }); const j = await r.json();
      if (!r.ok) setErr(j.error); else { setMsgs(m => [...m, ...j.messages]); setText(""); } } catch { setErr("Network error. Message not sent."); }
    setBusy(false);
  }
  return (<div className="glass mx-auto flex h-[70vh] max-w-2xl flex-col overflow-hidden">
    <div className="flex items-center gap-3 border-b border-cyan-400/15 p-4">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 font-bold text-navy">{name.replace("Dr. ", "")[0]}</div>
      <div><p className="font-semibold">{name}</p><p className="text-xs text-slate-400">{specialization} · <span className={online ? "text-emerald-300" : "text-slate-500"}>{online ? "Online" : "Offline"}</span></p></div>
      <span className="ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">Demo consultation</span></div>
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {msgs.length === 0 && <p className="text-center text-sm text-slate-400">Say hello. This is a simulated chat; do not share sensitive details.</p>}
      {msgs.map(m => <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : ""}`}><div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.sender === "user" ? "bg-cyan-400/20" : "bg-white/10"}`}>{m.body}<p className="mt-1 text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p></div></div>)}
      <div ref={end} /></div>
    {err && <p role="alert" className="px-4 text-sm text-rose-300">{err}</p>}
    <form onSubmit={send} className="flex gap-2 border-t border-cyan-400/15 p-3">
      <input value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder="Type a message" aria-label="Message" className="flex-1 rounded-full bg-white/5 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-cyan-300" />
      <button disabled={busy} className="btn btn-primary !px-5 !py-2 text-sm disabled:opacity-50">Send</button></form></div>);
}
