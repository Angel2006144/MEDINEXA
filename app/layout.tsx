import "./globals.css";
import { Orbitron, Manrope } from "next/font/google";
import CursorGlow from "@/components/CursorGlow";
import Nav from "@/components/Nav";
import NavGate from "@/components/NavGate";
const display = Orbitron({ subsets: ["latin"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });
export const metadata = { title: "MEDINEXA — Connecting Care, Empowering Health", description: "Hospital and doctor discovery for Thrissur, Kerala." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${display.variable} ${body.variable}`}><body>
    <CursorGlow /><NavGate><Nav /></NavGate><main className="relative z-10">{children}</main>
    <footer className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-10 text-xs text-slate-400">Sample/demo data. MEDINEXA does not diagnose or prescribe. Prescription tools only extract and standardize text.</footer>
  </body></html>);
}
