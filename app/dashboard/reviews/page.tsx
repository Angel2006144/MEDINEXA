import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
export default async function MyReviews() {
  const u = await requireRole(["PATIENT", "DOCTOR", "HOSPITAL_ADMIN", "SUPER_ADMIN"]);
  const r = await db.review.findMany({ where: { userId: u.id }, include: { hospital: true, doctor: true }, orderBy: { createdAt: "desc" } });
  return (<div><h1 className="font-display text-2xl">My reviews</h1>{r.length === 0 && <p className="mt-4 text-sm text-slate-400">You haven't reviewed anything yet. Open a hospital or doctor to write one.</p>}
    <div className="mt-4 space-y-3">{r.map(x => <div key={x.id} className="glass p-4 text-sm"><p>★ {x.rating} · {x.hospital?.name ?? x.doctor?.name}</p><p className="mt-1 text-slate-300">{x.text}</p></div>)}</div></div>);
}
