"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Register() {
  const r = useRouter(); const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr(""); const d = Object.fromEntries(new FormData(e.currentTarget));
    try { const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (res.ok) { r.push("/dashboard"); r.refresh(); } else setErr((await res.json()).error); } catch { setErr("Network error."); }
    setBusy(false);
  }
  const f = "glass w-full bg-transparent px-4 py-3 text-sm outline-none focus:border-cyan-300";
  return (<div className="grid min-h-[80vh] place-items-center px-5"><form onSubmit={go} className="glass w-full max-w-sm space-y-4 p-8">
    <h1 className="font-display text-2xl">Create account</h1>
    <input name="name" required minLength={2} placeholder="Full name" className={f} />
    <input name="email" type="email" required placeholder="Email" className={f} />
    <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)" className={f} />
    {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}
    <button disabled={busy} className="btn btn-primary w-full disabled:opacity-50">{busy ? "Creating…" : "Create account"}</button></form></div>);
}
