import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
export default async function DoctorInbox() {
  const u = await requireRole(["DOCTOR"]);
  const doc = u.doctorId ? await db.doctor.findUnique({ where: { id: u.doctorId } }) : null;
  if (!doc) return <p className="text-slate-300">No doctor profile is linked to your account.</p>;
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
  const [appts, chats] = await Promise.all([db.appointment.findMany({ where: { doctorId: doc.id, date: { gte: today } }, orderBy: [{ date: "asc" }, { slot: "asc" }], take: 30 }),
    db.chat.findMany({ where: { doctorId: doc.id }, include: { user: true, messages: { orderBy: { createdAt: "desc" }, take: 4 } }, orderBy: { updatedAt: "desc" } })]);
  async function profile(fd: FormData) { "use server"; const me = await requireRole(["DOCTOR"]); if (!me.doctorId) return;
    await db.doctor.update({ where: { id: me.doctorId }, data: { availability: String(fd.get("availability")).slice(0, 120), online: fd.get("online") === "on" } }); revalidatePath("/dashboard/doctor"); }
  async function reply(fd: FormData) { "use server"; const me = await requireRole(["DOCTOR"]); const body = String(fd.get("body")).replace(/[<>]/g, "").trim().slice(0, 1000); if (!body) return;
    const c = await db.chat.findUnique({ where: { id: String(fd.get("chatId")) } }); if (!c || c.doctorId !== me.doctorId) return;
    await db.message.create({ data: { chatId: c.id, sender: "doctor", body } }); revalidatePath("/dashboard/doctor"); }
  return (<div className="space-y-10"><h1 className="font-display text-2xl">{doc.name}</h1>
    <form action={profile} className="glass flex max-w-xl flex-wrap items-center gap-3 p-4 text-sm"><input name="availability" defaultValue={doc.availability} className="flex-1 bg-transparent outline-none" aria-label="Availability" />
      <label className="flex items-center gap-2"><input type="checkbox" name="online" defaultChecked={doc.online} />Online</label><button className="btn btn-primary !px-4 !py-1.5 text-sm">Save</button></form>
    <section><h2 className="mb-3 font-semibold">Upcoming appointments</h2>{appts.length === 0 && <p className="text-sm text-slate-400">None scheduled.</p>}
      <div className="space-y-2">{appts.map(a => <div key={a.id} className="glass p-3 text-sm">{a.date.toISOString().slice(0, 10)} {a.slot} · {a.patientName} · {a.status}</div>)}</div></section>
    <section><h2 className="mb-3 font-semibold">Chat inbox</h2>{chats.length === 0 && <p className="text-sm text-slate-400">No conversations yet.</p>}
      <div className="space-y-4">{chats.map(c => <div key={c.id} className="glass space-y-2 p-4 text-sm"><p className="font-semibold">{c.user.name}</p>
        {[...c.messages].reverse().map(m => <p key={m.id} className={m.sender === "doctor" ? "text-cyan-200" : ""}>{m.sender === "doctor" ? "You" : "Patient"}: {m.body}</p>)}
        <form action={reply} className="flex gap-2"><input type="hidden" name="chatId" value={c.id} /><input name="body" required maxLength={1000} placeholder="Reply" className="flex-1 rounded-full bg-white/5 px-4 py-2 outline-none" /><button className="btn btn-primary !px-4 !py-1.5 text-sm">Send</button></form></div>)}</div></section></div>);
}
