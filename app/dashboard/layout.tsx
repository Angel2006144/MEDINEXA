import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
export default function DashLayout({ children }: { children: React.ReactNode }) {
  const s = getSession(); if (!s) redirect("/login");
  const links = [["/dashboard", "Home"], ["/hospitals", "Hospitals"], ["/doctors", "Doctors"], ["/departments", "Departments"], ["/facilities", "Facilities"], ["/map", "Map"], ["/scanner", "Prescription Scanner"], ["/chat", "Chat"], ["/dashboard/reviews", "Reviews"], ["/dashboard/profile", "Profile"]];
  if (s.role === "SUPER_ADMIN" || s.role === "HOSPITAL_ADMIN") links.push(["/dashboard/manage", "Manage"]);
  if (s.role === "DOCTOR") links.push(["/dashboard/doctor", "Doctor inbox"]);
  return (<div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
    <aside className="glass sticky top-20 hidden h-fit w-56 shrink-0 p-3 md:block"><p className="px-3 py-2 font-display tracking-widest text-cyan-300">MEDINEXA</p>
      <nav className="space-y-1 text-sm">{links.map(([h, l]) => <Link key={h} href={h} className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-cyan-400/10 hover:text-cyan-200">{l}</Link>)}</nav>
      <form action="/api/auth/logout" method="post"><button className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-400/10">Logout</button></form></aside>
    <div className="min-w-0 flex-1">
      <form action="/hospitals" className="mb-6 flex items-center gap-3"><input name="q" aria-label="Search" placeholder="Search hospitals, doctors, facilities" className="glass flex-1 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-cyan-300" />
        <Link href="/scanner?tab=qr" aria-label="QR scanner" className="glass px-3 py-2 text-sm">Scan</Link>
        <Link href="/dashboard/profile" className="glass px-3 py-2 text-sm">{s.name}</Link></form>
      {children}</div></div>);
}
