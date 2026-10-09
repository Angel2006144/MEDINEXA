import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
export default async function Profile() {
  const u = await requireRole(["PATIENT", "DOCTOR", "HOSPITAL_ADMIN", "SUPER_ADMIN"]);
  const [saved, appts] = await Promise.all([db.savedHospital.findMany({ where: { userId: u.id }, include: { hospital: true } }),
    db.appointment.findMany({ where: { userId: u.id }, include: { hospital: true, doctor: true, service: true }, orderBy: { createdAt: "desc" }, take: 20 })]);
  return (<div className="space-y-8"><div><h1 className="font-display text-2xl">{u.name}</h1><p className="text-sm text-slate-400">{u.email} · {u.role}</p></div>
    <section><h2 className="mb-3 font-semibold">Saved hospitals</h2>{saved.length === 0 && <p className="text-sm text-slate-400">Nothing saved yet.</p>}
      <div className="flex flex-wrap gap-3">{saved.map(x => <Link key={x.hospitalId} href={`/hospitals/${x.hospital.slug}`} className="glass px-4 py-2 text-sm">{x.hospital.name}</Link>)}</div></section>
    <section><h2 className="mb-3 font-semibold">My bookings</h2>{appts.length === 0 && <p className="text-sm text-slate-400">No bookings yet.</p>}
      <div className="space-y-2">{appts.map(a => <Link key={a.id} href={`/booking/${a.reference}`} className="glass block p-3 text-sm">{a.reference} · {a.hospital.name} · {a.doctor?.name ?? a.service?.name} · {a.date.toISOString().slice(0, 10)} {a.slot} · {a.status}</Link>)}</div></section></div>);
}
