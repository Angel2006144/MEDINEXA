import Link from "next/link";
import { db, avg } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Hospitals({ searchParams }: { searchParams: { q?: string; dept?: string; er?: string } }) {
  const { q, dept, er } = searchParams;
  let hospitals, depts;
  try {
    depts = await db.department.findMany({ orderBy: { name: "asc" } });
    hospitals = await db.hospital.findMany({
      where: {
        ...(q && { OR: [{ name: { contains: q, mode: "insensitive" } }, { doctors: { some: { name: { contains: q, mode: "insensitive" } } } }, { facilities: { some: { facility: { name: { contains: q, mode: "insensitive" } } } } }] }),
        ...(dept && { departments: { some: { department: { name: dept } } } }),
        ...(er && { open24x7: true }),
      },
      include: { reviews: { select: { rating: true } }, departments: { include: { department: true }, take: 4 }, facilities: { include: { facility: true }, take: 4 } },
      orderBy: { name: "asc" }, take: 30,
    });
  } catch { return <p className="mx-auto max-w-6xl p-10 text-slate-300">Can't reach the database. Check DATABASE_URL and run the seed script.</p>; }
  return (<div className="mx-auto max-w-6xl px-5 py-10">
    <h1 className="font-display text-3xl font-bold">Hospitals in Thrissur</h1>
    <form className="mt-6 flex flex-wrap gap-3">
      <input name="q" defaultValue={q} placeholder="Search hospital, doctor or facility" className="glass min-w-60 flex-1 bg-transparent px-4 py-3 outline-none focus:border-cyan-300" />
      <select name="dept" defaultValue={dept} className="glass bg-navy px-4 py-3"><option value="">All departments</option>{depts.map(d => <option key={d.id}>{d.name}</option>)}</select>
      <label className="glass flex items-center gap-2 px-4 py-3 text-sm"><input type="checkbox" name="er" value="1" defaultChecked={!!er} />24/7 only</label>
      <button className="btn btn-primary">Search</button>
    </form>
    {hospitals.length === 0 && <p className="mt-10 text-slate-300">No hospitals match. Clear a filter and try again.</p>}
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {hospitals.map(h => (<article key={h.id} className="glass hov flex flex-col p-5">
        <div className="flex items-start justify-between gap-2"><h2 className="font-semibold">{h.name}</h2>{h.open24x7 && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-300">24/7</span>}</div>
        <p className="mt-1 text-xs text-slate-400">{h.city} · Demo data</p>
        <p className="mt-3 text-sm text-cyan-200">★ {avg(h.reviews).toFixed(1)} <span className="text-slate-400">({h.reviews.length} reviews)</span></p>
        <p className="mt-3 text-xs text-slate-300">{h.departments.map(d => d.department.name).join(", ")}</p>
        <p className="mt-1 text-xs text-slate-400">{h.facilities.map(f => f.facility.name).join(", ")}</p>
        <div className="mt-auto flex gap-3 pt-5">
          <Link href={`/hospitals/${h.slug}`} className="btn btn-primary !px-4 !py-2 text-sm">View hospital</Link>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" className="btn btn-ghost !px-4 !py-2 text-sm">Directions</a>
        </div></article>))}
    </div></div>);
}
