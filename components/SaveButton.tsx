"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function SaveButton({ hospitalId, initial }: { hospitalId: string; initial: boolean }) {
  const [saved, setSaved] = useState(initial), r = useRouter();
  async function t() { const res = await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hospitalId }) });
    if (res.status === 401) return r.push("/login"); if (res.ok) setSaved((await res.json()).saved); }
  return <button onClick={t} aria-pressed={saved} className="btn btn-ghost !px-4 !py-2 text-sm">{saved ? "Saved ✓" : "Save hospital"}</button>;
}
