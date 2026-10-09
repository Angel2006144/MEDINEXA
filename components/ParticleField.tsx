"use client";
import { useEffect, useRef } from "react";
export default function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!, x = cv.getContext("2d")!;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let w = 0, h = 0, raf = 0, mx = -999, my = -999; const dpr = Math.min(devicePixelRatio || 1, 2);
    const cols = ["34,211,238", "168,85,247", "232,121,249", "96,165,250"];
    const P = Array.from({ length: matchMedia("(max-width:640px)").matches ? 45 : 95 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.4, vx: (Math.random() - 0.5) * 0.00012, vy: -Math.random() * 0.00018 - 0.00004, c: cols[Math.floor(Math.random() * 4)], t: Math.random() * 6.28 }));
    const size = () => { w = cv.clientWidth; h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const mm = (e: MouseEvent) => { const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; };
    const draw = () => {
      x.clearRect(0, 0, w, h);
      for (const p of P) {
        p.x += p.vx; p.y += p.vy; p.t += 0.02; if (p.y < -0.02) p.y = 1.02; if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0;
        let px = p.x * w, py = p.y * h; const dx = px - mx, dy = py - my, d = Math.hypot(dx, dy);
        if (d < 120) { px += (dx / d) * (120 - d) * 0.25; py += (dy / d) * (120 - d) * 0.25; }
        x.beginPath(); x.fillStyle = `rgba(${p.c},${0.35 + 0.35 * Math.sin(p.t)})`; x.shadowColor = `rgb(${p.c})`; x.shadowBlur = 10; x.arc(px, py, p.r, 0, 6.283); x.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    size(); draw(); addEventListener("resize", size); addEventListener("mousemove", mm);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("mousemove", mm); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
