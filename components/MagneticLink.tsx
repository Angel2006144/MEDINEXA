"use client";
import Link from "next/link";
import { useRef } from "react";
export default function MagneticLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const r = useRef<HTMLAnchorElement>(null);
  return <Link ref={r} href={href} className={className}
    onMouseMove={e => { const b = r.current!.getBoundingClientRect(); r.current!.style.transform = `translate(${(e.clientX - b.left - b.width / 2) * 0.25}px,${(e.clientY - b.top - b.height / 2) * 0.35}px)`; }}
    onMouseLeave={() => { r.current!.style.transform = ""; }}>{children}</Link>;
}
