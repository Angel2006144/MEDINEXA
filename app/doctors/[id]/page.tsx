import Link from "next/link";
import { notFound } from "next/navigation";
import { db, avg } from "@/lib/db";
import ReviewForm from "@/components/ReviewForm";
export const dynamic = "force-dynamic";
export default async function Doctor({ params }: { params: { id: string } }) {
  const d = await db.doctor.findUnique({ where: { id: params.id }, include: { hospital: true, department: true, reviews: { orderBy: { createdAt: "desc" } } } });
  if (!d) notFound();
  return (<div className="mx-auto max-w-3xl space-y-6 px-5 py-10">
    <div className="glass p-6"><p className="text-xs text-amber-300">Sample/demo doctor profile</p>
      <h1 className="font-display text-3xl">{d.name}</h1><p className="text-cyan-200">{d.specialization} · {d.department.name}</p>
      <p className="mt-2 text-sm text-slate-300">★ {avg(d.reviews).toFixed(1)} ({d.reviews.length}) · {d.experienceYears} years · {d.qualifications} · {d.languages.join(", ")}</p>
      <p className="mt-2 text-sm text-slate-300">{d.bio}</p><p className="mt-2 text-sm">Available: {d.availability}{d.consultationFee ? ` · Fee ₹${d.consultationFee} (sample)` : ""}</p>
      <p className="mt-2 text-sm"><Link href={`/hospitals/${d.hospital.slug}`} className="text-cyan-300 underline">{d.hospital.name}</Link></p>
      <div className="mt-5 flex gap-3"><Link href={`/hospitals/${d.hospital.slug}?book=${d.id}#book`} className="btn btn-primary !py-2 text-sm">Book appointment</Link>
        {d.chatEnabled && <Link href={`/chat?doctor=${d.id}`} className="btn btn-ghost !py-2 text-sm">Chat with doctor</Link>}</div></div>
    <ReviewForm doctorId={d.id} />
    <div className="grid gap-3">{d.reviews.slice(0, 6).map(r => <div key={r.id} className="glass p-4 text-sm">★ {r.rating} · {r.displayName}{r.isDemo && " (demo)"}<p className="mt-1 text-slate-300">{r.text}</p></div>)}</div></div>);
}
