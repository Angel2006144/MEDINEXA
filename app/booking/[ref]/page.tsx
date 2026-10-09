import { notFound } from "next/navigation";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Booking({ params }: { params: { ref: string } }) {
  const a = await db.appointment.findUnique({ where: { reference: params.ref }, include: { hospital: true, doctor: true, service: true } });
  if (!a) notFound();
  return (<div className="mx-auto max-w-xl px-5 py-12"><div className="glass space-y-2 p-6 text-sm">
    <h1 className="font-display text-2xl">Booking {a.reference}</h1>
    <p className="text-cyan-200">Status: {a.status}</p>
    <p>{a.hospital.name}</p><p>{a.doctor ? `${a.doctor.name} (${a.doctor.specialization})` : a.service?.name}</p>
    <p>{a.date.toISOString().slice(0, 10)} at {a.slot}</p>
    <p className="text-xs text-amber-300">Demo booking — not confirmed with any real hospital.</p></div></div>);
}
