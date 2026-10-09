import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import ChatWindow from "@/components/ChatWindow";
export const dynamic = "force-dynamic";
export default async function Chat({ searchParams }: { searchParams: { doctor?: string } }) {
  const s = getSession(); if (!s) redirect("/login");
  if (searchParams.doctor) {
    const d = await db.doctor.findUnique({ where: { id: searchParams.doctor } });
    if (!d) return <p className="p-10">Doctor not found.</p>;
    const c = await db.chat.findFirst({ where: { userId: s.uid, doctorId: d.id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
    return <div className="px-4 py-8"><ChatWindow doctorId={d.id} name={d.name} specialization={d.specialization} online={d.online}
      initial={(c?.messages ?? []).map(m => ({ id: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt.toISOString() }))} /></div>;
  }
  const chats = await db.chat.findMany({ where: { userId: s.uid }, include: { doctor: { include: { hospital: true } } }, orderBy: { updatedAt: "desc" } });
  return (<div className="mx-auto max-w-2xl px-5 py-10"><h1 className="font-display text-2xl">Your chats</h1>
    {chats.length === 0 && <p className="mt-6 text-slate-300">No chats yet. Open a hospital, pick a doctor and choose Chat.</p>}
    <div className="mt-6 space-y-3">{chats.map(c => <Link key={c.id} href={`/chat?doctor=${c.doctorId}`} className="glass block p-4 text-sm">{c.doctor.name} · {c.doctor.hospital.name}</Link>)}</div></div>);
}
