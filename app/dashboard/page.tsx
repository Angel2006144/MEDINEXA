import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
export default function Dashboard() {
  const s = getSession(); if (!s) redirect("/login");
  const tiles = [["/hospitals", "Hospitals", "Search and compare"], ["/doctors", "Doctors", "Find by specialty"], ["/map", "Map", "Locate hospitals"], ["/scanner", "Scanner", "Prescription and QR"], ["/chat", "Chat", "Your demo chats"]];
  return (<div className="mx-auto max-w-6xl px-5 py-10">
    <div className="flex items-center justify-between"><h1 className="font-display text-3xl">Welcome, {s.name}</h1>
      </div>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{tiles.map(([h, t, d]) => <Link key={h} href={h} className="glass p-6"><h2 className="font-semibold text-cyan-200">{t}</h2><p className="mt-1 text-sm text-slate-300">{d}</p></Link>)}</div></div>);
}
