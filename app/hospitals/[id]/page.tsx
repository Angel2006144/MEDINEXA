import { notFound } from "next/navigation";
import { db, avg } from "@/lib/db";
import BookingForm from "@/components/BookingForm";
import ReviewForm from "@/components/ReviewForm";
import SaveButton from "@/components/SaveButton";
import { getSession } from "@/lib/session";
export const dynamic = "force-dynamic";
export default async function Hospital({ params, searchParams }: { params: { id: string }; searchParams: { dept?: string; book?: string } }) {
  const h = await db.hospital.findUnique({ where: { slug: params.id }, include: {
    reviews: { orderBy: { createdAt: "desc" } }, services: true,
    departments: { include: { department: true } }, facilities: { include: { facility: true } },
    doctors: { include: { department: true, reviews: { select: { rating: true } } } } } });
  if (!h) notFound();
  const sess = getSession();
  const saved = sess ? !!(await db.savedHospital.findUnique({ where: { userId_hospitalId: { userId: sess.uid, hospitalId: h.id } } })) : false;
  const doctors = h.doctors.filter(d => !searchParams.dept || d.department.name === searchParams.dept);
  const dist = [5, 4, 3, 2, 1].map(n => [n, h.reviews.filter(r => r.rating === n).length]);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  return (<div className="mx-auto max-w-6xl space-y-10 px-5 py-10">
    <header className="glass p-6">
      <p className="text-xs text-amber-300">Sample/demo data — not verified</p>
      <div className="flex items-start justify-between gap-3"><h1 className="font-display text-3xl font-bold">{h.name}</h1><SaveButton hospitalId={h.id} initial={saved} /></div>
      <p className="mt-2 text-cyan-200">★ {avg(h.reviews).toFixed(1)} <span className="text-slate-400">({h.reviews.length} reviews)</span></p>
      <p className="mt-3 text-sm text-slate-300">{h.address} · {h.phone} · Emergency {h.emergencyPhone}{h.hasAmbulance && " · Ambulance"}</p>
      <p className="mt-3 max-w-2xl text-sm text-slate-300">{h.description}</p>
    </header>
    <section><h2 className="mb-4 font-display text-xl">Facilities</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{h.facilities.map(f => <div key={f.facilityId} className={`glass p-4 text-sm ${f.isNew || f.isFeatured ? "!border-fuchsia-400/60" : ""}`}>{f.facility.name}{(f.isNew || f.isFeatured) && <span className="ml-2 text-xs text-fuchsia-300">{f.isNew ? "New" : "Featured"}</span>}</div>)}</div></section>
    <section><h2 className="mb-4 font-display text-xl">Departments</h2>
      <div className="flex flex-wrap gap-3">
        <a href="?" className="glass px-4 py-2 text-sm">All</a>
        {h.departments.map(d => <a key={d.departmentId} href={`?dept=${encodeURIComponent(d.department.name)}`} className={`glass px-4 py-2 text-sm ${searchParams.dept === d.department.name ? "!border-cyan-300" : ""}`}>{d.department.name}</a>)}</div></section>
    <section><h2 className="mb-4 font-display text-xl">Doctors</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{doctors.map(d => <div key={d.id} className="glass hov p-5">
        <h3 className="font-semibold"><a href={`/doctors/${d.id}`}>{d.name}</a></h3><p className="text-sm text-cyan-200">{d.specialization}</p>
        <p className="mt-2 text-xs text-slate-300">{d.experienceYears} yrs · ★ {avg(d.reviews).toFixed(1)} ({d.reviews.length}) · {d.availability}</p>
        <p className="mt-3 text-xs text-amber-300">Demo doctor — chat is simulated</p>
        <a href={`?book=${d.id}#book`} className="btn btn-primary mt-3 inline-block !px-4 !py-2 text-sm">Book appointment</a>
        {d.chatEnabled && <a href={`/chat?doctor=${d.id}`} className="btn btn-ghost ml-2 mt-3 inline-block !px-4 !py-2 text-sm">Chat</a>}</div>)}
        {doctors.length === 0 && <p className="text-slate-300">No doctors in this department.</p>}</div></section>
    <section><h2 className="mb-4 font-display text-xl">Services</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{h.services.map(s => <div key={s.id} className="glass p-4 text-sm"><p>{s.name}</p><p className="mt-1 text-xs text-slate-400">{s.price ? `From ₹${s.price} (sample)` : "Price on request"}</p></div>)}</div></section>
    <section id="book"><h2 className="mb-4 font-display text-xl">Book a doctor or service</h2>
      <BookingForm hospitalId={h.id} initialDoctorId={searchParams.book}
        doctors={h.doctors.map(d => ({ id: d.id, label: `${d.name} — ${d.specialization}` }))}
        services={h.services.map(s => ({ id: s.id, label: s.name }))} /></section>
    <section><h2 className="mb-4 font-display text-xl">Reviews</h2>
      <div className="glass mb-4 max-w-sm space-y-1 p-4 text-sm">{dist.map(([n, c]) => <div key={n} className="flex items-center gap-2"><span className="w-8">{n}★</span><div className="h-2 flex-1 rounded bg-white/10"><div className="h-2 rounded bg-cyan-300" style={{ width: `${(c / Math.max(h.reviews.length, 1)) * 100}%` }} /></div><span className="w-6 text-right text-slate-400">{c}</span></div>)}</div>
      <div className="grid gap-4 sm:grid-cols-2">{h.reviews.slice(0, 6).map(r => <div key={r.id} className="glass p-4 text-sm"><p>★ {r.rating} · {r.displayName} {r.isDemo && <span className="text-xs text-amber-300">(demo)</span>}</p><p className="mt-2 text-slate-300">{r.text}</p></div>)}</div></section>
    <section><ReviewForm hospitalId={h.id} /></section>
    <section><h2 className="mb-4 font-display text-xl">Map</h2>
      <div className="glass overflow-hidden p-2">{key
        ? <iframe title={`Map of ${h.name}`} className="h-80 w-full rounded-xl" loading="lazy" src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${h.lat},${h.lng}`} />
        : <p className="p-6 text-sm text-slate-300">Map unavailable. Set NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY.</p>}
        <a className="btn btn-primary m-3 inline-block !py-2 text-sm" target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`}>Get directions</a></div></section>
  </div>);
}
