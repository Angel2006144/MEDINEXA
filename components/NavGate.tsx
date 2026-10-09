"use client";
import { usePathname } from "next/navigation";
// Hides the app navigation on the cinematic landing page.
export default function NavGate({ children }: { children: React.ReactNode }) { return usePathname() === "/" ? null : <>{children}</>; }
