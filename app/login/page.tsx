
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const r = useRouter(); const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr(""); const d = new object.fromEntries(new FormData(e.currentTarget)as any);
    try { const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: d.get("email"), password: d.get("password") }) });
      if (res.ok) { r.push("/dashboard"); r.refresh(); } else setErr((await res.json()).error); } catch { setErr("Network error."); }
    setBusy(false);
  }
  const f = "glass w-full bg-transparent px-4 py-3 text-sm outline-none focus:border-cyan-300";
  return (<div className="grid min-h-[80vh] place-items-center px-5"><form onSubmit={go} className="glass w-full max-w-sm space-y-4 p-8 shadow-[0_0_60px_rgba(168,85,247,.2)]">
    <h1 className="font-display text-2xl">Log in</h1>
    <input name="email" type="email" required placeholder="Email" autoComplete="email" className={f} />
    <input name="password" type="password" required placeholder="Password" autoComplete="current-password" className={f} />
    <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" defaultChecked /> Remember me</label>
    {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}
    <button disabled={busy} className="btn btn-primary w-full disabled:opacity-50">{busy ? "Logging in…" : "Log in"}</button>
    <p className="text-sm"><a href="/register" className="text-cyan-300 underline">Create account</a></p>
    <p className="text-xs text-slate-400">Demo account: patient@medinexa.demo / demo1234 (created by the seed script). Password reset is not built yet.</p></form></div>);
}
