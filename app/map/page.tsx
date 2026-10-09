import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function MapPage({ searchParams }: { searchParams: { h?: string } }) {
  const all = await db.hospital.findMany({ select: { slug: true, name: true, lat: true, lng: true, address: true }, orderBy: { name: "asc" } });
  const h = all.find(x => x.slug === searchParams.h) ?? all[0]; const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  if (!h) return <p className="p-10">No hospitals yet. Run the seed script.</p>;
  return (<div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-[260px_1fr]">
    <ul className="glass max-h-[70vh] space-y-1 overflow-y-auto p-3 text-sm">{all.map(x => <li key={x.slug}><Link href={`?h=${x.slug}`} className={`block rounded-lg px-3 py-2 hover:bg-white/10 ${x.slug === h.slug ? "bg-cyan-400/15" : ""}`}>{x.name}</Link></li>)}</ul>
    <div className="glass p-2"><p className="p-3 text-sm">{h.name} — {h.address}</p>
      {key ? <iframe title={`Map of ${h.name}`} className="h-[60vh] w-full rounded-xl" loading="lazy" src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${h.lat},${h.lng}`} /> : <p className="p-6 text-sm text-slate-300">Map unavailable. Set NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY.</p>}
      <a className="btn btn-primary m-3 inline-block !py-2 text-sm" target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}>Get directions</a></div></div>);
}
