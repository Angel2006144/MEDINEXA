import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
const ROLES = ["SUPER_ADMIN", "HOSPITAL_ADMIN"];
export default async function Manage({ searchParams }: { searchParams: { h?: string } }) {
  const u = await requireRole(ROLES);
  const hospitals = await db.hospital.findMany({ where: u.role === "SUPER_ADMIN" ? {} : { id: u.hospitalId ?? "none" }, orderBy: { name: "asc" } });
  const h = hospitals.find(x => x.slug === searchParams.h) ?? hospitals[0];
  if (!h) return <p className="text-slate-300">No hospital is assigned to your account.</p>;
  const [appts, reviews] = await Promise.all([
    db.appointment.findMany({ where: { hospitalId: h.id }, include: { doctor: true, service: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.review.findMany({ where: { OR: [{ hospitalId: h.id }, { doctor: { hospitalId: h.id } }] }, orderBy: { createdAt: "desc" }, take: 30 })]);
  const inScope = (me: { role: string; hospitalId: string | null }, hid?: string | null) => me.role === "SUPER_ADMIN" || (!!hid && hid === me.hospitalId);
  async function setStatus(fd: FormData) { "use server";
    const me = await requireRole(ROLES); const st = String(fd.get("status"));
    if (!["CONFIRMED", "CANCELLED", "COMPLETED"].includes(st)) return;
    const a = await db.appointment.findUnique({ where: { id: String(fd.get("id")) } }); if (!a || !inScope(me, a.hospitalId)) return;
    await db.appointment.update({ where: { id: a.id }, data: { status: st as "CONFIRMED" } }); revalidatePath("/dashboard/manage"); }
  async function delReview(fd: FormData) { "use server";
    const me = await requireRole(ROLES);
    const r = await db.review.findUnique({ where: { id: String(fd.get("id")) }, include: { doctor: true } }); if (!r || !inScope(me, r.hospitalId ?? r.doctor?.hospitalId)) return;
    await db.review.delete({ where: { id: r.id } }); revalidatePath("/dashboard/manage"); }
  async function saveInfo(fd: FormData) { "use server";
    const me = await requireRole(ROLES); const id = String(fd.get("id")); if (!inScope(me, id)) return;
    await db.hospital.update({ where: { id }, data: { description: String(fd.get("description")).slice(0, 2000), phone: String(fd.get("phone")).slice(0, 30), openingHours: String(fd.get("hours")).slice(0, 120) } }); revalidatePath("/dashboard/manage"); }
  const inp = "glass w-full bg-transparent px-3 py-2 text-sm";
  return (<div className="space-y-10"><h1 className="font-display text-2xl">Manage: {h.name}</h1>
    {hospitals.length > 1 && <div className="flex flex-wrap gap-2">{hospitals.map(x => <Link key={x.id} href={`?h=${x.slug}`} className="glass px-3 py-1 text-xs">{x.name}</Link>)}</div>}
    <section><h2 className="mb-3 font-semibold">Hospital information</h2>
      <form action={saveInfo} className="max-w-xl space-y-3"><input type="hidden" name="id" value={h.id} />
        <textarea name="description" defaultValue={h.description} rows={3} className={inp} /><input name="phone" defaultValue={h.phone} className={inp} /><input name="hours" defaultValue={h.openingHours} className={inp} />
        <button className="btn btn-primary !py-2 text-sm">Save changes</button></form></section>
    <section><h2 className="mb-3 font-semibold">Appointments</h2>{appts.length === 0 && <p className="text-sm text-slate-400">No appointments yet.</p>}
      <div className="space-y-2">{appts.map(a => <form key={a.id} action={setStatus} className="glass flex flex-wrap items-center gap-3 p-3 text-sm"><input type="hidden" name="id" value={a.id} />
        <span>{a.reference} · {a.patientName} · {a.doctor?.name ?? a.service?.name} · {a.date.toISOString().slice(0, 10)} {a.slot} · <b>{a.status}</b></span>
        <select name="status" defaultValue="CONFIRMED" className="rounded bg-navy px-2 py-1"><option>CONFIRMED</option><option>CANCELLED</option><option>COMPLETED</option></select><button className="btn btn-ghost !px-3 !py-1 text-xs">Update</button></form>)}</div></section>
    <section><h2 className="mb-3 font-semibold">Reviews</h2>
      <div className="space-y-2">{reviews.map(r => <form key={r.id} action={delReview} className="glass flex items-center justify-between gap-3 p-3 text-sm"><input type="hidden" name="id" value={r.id} /><span>★ {r.rating} · {r.displayName}{r.isDemo && " (demo)"}: {r.text}</span><button className="btn btn-ghost !px-3 !py-1 text-xs text-rose-300">Delete</button></form>)}</div></section></div>);
}
