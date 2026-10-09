import Link from "next/link";
const links = [["/about","About"],["/hospitals","Hospitals"],["/departments","Departments"],["/facilities","Facilities"],["/doctors","Doctors"],["/map","Map"],["/scanner","Scanner"],["/chat","Chat"]];
export default function Nav() {
  return (<><header className="sticky top-0 z-40 border-b border-cyan-400/10 bg-navy/70 backdrop-blur-xl">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
      <Link href="/" className="font-display text-xl font-bold tracking-widest text-cyan-300">MEDINEXA</Link>
      <ul className="hidden gap-7 text-sm md:flex">{links.map(([h, l]) => <li key={h}><Link href={h} className="text-slate-300 hover:text-cyan-300">{l}</Link></li>)}</ul>
      <Link href="/login" className="btn btn-ghost !px-5 !py-2 text-sm">Log in</Link>
    </nav></header>
  <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-cyan-400/15 bg-navy/90 py-3 text-xs backdrop-blur-xl md:hidden">
    {[["/hospitals", "Hospitals"], ["/doctors", "Doctors"], ["/map", "Map"], ["/scanner", "Scan"], ["/chat", "Chat"]].map(([h, l]) => <Link key={h} href={h} className="px-2 py-1 text-slate-300">{l}</Link>)}</nav></>);
}
