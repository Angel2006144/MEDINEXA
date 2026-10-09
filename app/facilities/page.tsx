import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Facilities() {
  const f = await db.facility.findMany({ include: { _count: { select: { hospitals: true } } }, orderBy: { name: "asc" } });
  return (<div className="mx-auto max-w-6xl px-5 py-10"><h1 className="font-display text-3xl">Facilities</h1><p className="mt-2 text-sm text-slate-400">Pick a facility to see hospitals that offer it.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{f.map(x => <Link key={x.id} href={`/hospitals?q=${encodeURIComponent(x.name)}`} className="glass p-5"><p className="font-semibold">{x.name}</p><p className="mt-1 text-xs text-slate-400">{x._count.hospitals} hospitals</p></Link>)}</div></div>);
}
