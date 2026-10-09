"use client";
import { useEffect, useRef } from "react";
export default function CursorGlow() {
  const dot = useRef<HTMLDivElement>(null), halo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer:fine)").matches) return;
    let x = 0, y = 0, hx = 0, hy = 0, raf = 0;
    const move = (e: MouseEvent) => { x = e.clientX; y = e.clientY; const el = (e.target as HTMLElement).closest("a,button"); halo.current?.style.setProperty("--s", el ? "1.8" : "1"); };
    const loop = () => { hx += (x - hx) * 0.15; hy += (y - hy) * 0.15;
      if (dot.current) dot.current.style.transform = `translate(${x - 4}px,${y - 4}px)`;
      if (halo.current) halo.current.style.transform = `translate(${hx - 120}px,${hy - 120}px) scale(var(--s,1))`;
      raf = requestAnimationFrame(loop); };
    addEventListener("mousemove", move); loop();
    return () => { removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);
  return (<>
    <div ref={halo} aria-hidden className="pointer-events-none fixed left-0 top-0 z-0 h-60 w-60 rounded-full transition-[scale] duration-300" style={{ background: "radial-gradient(circle,rgba(34,211,238,.16),transparent 65%)" }} />
    <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-50 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#22d3ee]" />
  </>);
}
