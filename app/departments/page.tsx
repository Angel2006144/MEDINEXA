import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Departments() {
  const d = await db.department.findMany({ include: { _count: { select: { hospitals: true, doctors: true } } }, orderBy: { name: "asc" } });
  return (<div className="mx-auto max-w-6xl px-5 py-10"><h1 className="font-display text-3xl">Departments</h1>
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{d.map(x => <Link key={x.id} href={`/hospitals?dept=${encodeURIComponent(x.name)}`} className="glass p-5"><p className="font-semibold text-cyan-200">{x.name}</p><p className="mt-1 text-xs text-slate-400">{x._count.hospitals} hospitals · {x._count.doctors} doctors</p></Link>)}</div></div>);
}
