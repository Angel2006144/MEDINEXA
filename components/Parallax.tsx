"use client";
import { useRef } from "react";
// Sets --mx / --my (-1..1) from the pointer; children use them in CSS transforms.
export default function Parallax({ children, className }: { children: React.ReactNode; className?: string }) {
  const r = useRef<HTMLDivElement>(null);
  const set = (a: number, b: number) => { r.current?.style.setProperty("--mx", String(a)); r.current?.style.setProperty("--my", String(b)); };
  return <div ref={r} className={className}
    onMouseMove={e => { const b = r.current!.getBoundingClientRect(); set(((e.clientX - b.left) / b.width - 0.5) * 2, ((e.clientY - b.top) / b.height - 0.5) * 2); }}
    onMouseLeave={() => set(0, 0)}>{children}</div>;
}
