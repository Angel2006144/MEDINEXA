import Link from "next/link";
import { db, avg } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Doctors({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.slice(0, 60);
  const docs = await db.doctor.findMany({ where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { specialization: { contains: q, mode: "insensitive" } }] } : {},
    include: { hospital: true, reviews: { select: { rating: true } } }, orderBy: { name: "asc" }, take: 36 });
  return (<div className="mx-auto max-w-6xl px-5 py-10"><h1 className="font-display text-3xl">Doctors</h1>
    <form className="mt-5 flex gap-3"><input name="q" defaultValue={q} placeholder="Name or specialization (e.g. Neurology)" className="glass flex-1 bg-transparent px-4 py-3 outline-none" /><button className="btn btn-primary">Search</button></form>
    {docs.length === 0 && <p className="mt-8 text-slate-300">No doctors found.</p>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{docs.map(d => <Link key={d.id} href={`/doctors/${d.id}`} className="glass p-5 text-sm"><p className="font-semibold">{d.name}</p><p className="text-cyan-200">{d.specialization}</p><p className="mt-1 text-xs text-slate-400">{d.hospital.name} · ★ {avg(d.reviews).toFixed(1)} · {d.experienceYears} yrs</p></Link>)}</div></div>);
}
