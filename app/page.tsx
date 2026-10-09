import Image from "next/image";
import Link from "next/link";
import ParticleField from "@/components/ParticleField";
import Parallax from "@/components/Parallax";
import MagneticLink from "@/components/MagneticLink";
const feats = [
  ["/map", "Map", "Every hospital on its own live map", "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"],
  ["/scanner", "Scanner", "Prescription OCR and QR codes", "M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16"],
  ["/chat", "Chat", "Message doctors (demo mode)", "M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"],
];
export default function Landing() {
  return (<Parallax className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_70%_30%,#0b1240_0%,#050816_62%)]">
    <div className="ray" aria-hidden />
    <ParticleField />
    <header className="relative z-20 flex items-center justify-between px-6 py-5">
      <span className="font-display text-xs tracking-[.4em] text-cyan-300/80">MEDINEXA</span>
      <MagneticLink href="/about" className="btn btn-ghost !px-6 !py-2 text-sm">Enter MedInexa</MagneticLink>
    </header>
    <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-4 px-6 pt-2 lg:min-h-[70vh] lg:grid-cols-[1.1fr_.9fr]">
      <div style={{ transform: "translate3d(calc(var(--mx,0)*-8px),calc(var(--my,0)*-6px),0)" }}>
        <h1 aria-label="MEDINEXA" className="font-display text-[clamp(3rem,11vw,8rem)] font-black leading-none">
          {"MEDINEXA".split("").map((c, i) => <span key={i} aria-hidden className="letter" style={{ "--i": i } as React.CSSProperties}>{c}</span>)}
        </h1>
        <p className="rise mt-4 text-lg tracking-[.12em] text-cyan-200 sm:text-xl" style={{ animationDelay: ".9s" }}>Connecting Care, Empowering Health</p>
        <p className="rise mt-6 max-w-md text-slate-300" style={{ animationDelay: "1.1s" }}>Discover hospitals, connect with doctors, explore healthcare facilities, and access intelligent digital health tools — all in one connected platform.</p>
        <div className="rise mt-8 flex flex-wrap gap-4" style={{ animationDelay: "1.3s" }}>
          <MagneticLink href="/about" className="btn btn-primary">Explore MedInexa</MagneticLink>
          <MagneticLink href="/hospitals" className="btn btn-ghost">Explore hospitals</MagneticLink>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-sm lg:max-w-md" style={{ transform: "translate3d(calc(var(--mx,0)*16px),calc(var(--my,0)*12px),0)" }}>
        <div className="glow-pulse absolute inset-[10%] rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-fuchsia-500/30 blur-3xl" aria-hidden />
        <Image src="/hero.png" alt="Glowing neon caduceus medical symbol" width={548} height={806} priority className="hero-art relative h-auto w-full" />
      </div>
    </div>
    <div className="relative z-10 mx-auto grid max-w-6xl gap-4 px-6 pb-10 pt-6 sm:grid-cols-3">
      {feats.map(([h, t, d, path], i) => (
        <Link key={h} href={h} className="glass rise flex items-center gap-4 p-5" style={{ animationDelay: `${1.5 + i * 0.14}s` }}>
          <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={path} /></svg>
          <span><b className="block">{t}</b><span className="text-sm text-slate-400">{d}</span></span>
        </Link>))}
    </div>
  </Parallax>);
}
