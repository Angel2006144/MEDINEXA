"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
export default function QrScanner() {
  const v = useRef<HTMLVideoElement>(null), c = useRef<HTMLCanvasElement>(null), stream = useRef<MediaStream | null>(null), raf = useRef(0);
  const router = useRouter(); const [on, setOn] = useState(false), [err, setErr] = useState("");
  const stop = () => { cancelAnimationFrame(raf.current); stream.current?.getTracks().forEach(t => t.stop()); setOn(false); };
  useEffect(() => stop, []);
  async function resolve(text: string) {
    const token = text.trim().split("/").filter(Boolean).pop() ?? "";
    const r = await fetch("/api/qr/resolve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (r.ok) { stop(); router.push((await r.json()).redirect); } else setErr("This QR code isn't a valid MedInexa code.");
  }
  async function start() {
    setErr("");
    try { stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); } catch { setErr("Camera access was denied or is unavailable. Allow camera permission in your browser settings."); return; }
    setOn(true); await new Promise(r => setTimeout(r, 50)); const video = v.current!; video.srcObject = stream.current; await video.play();
    let busy = false;
    const tick = () => { if (video.videoWidth && !busy) { const cv = c.current!, x = cv.getContext("2d", { willReadFrequently: true })!; cv.width = video.videoWidth; cv.height = video.videoHeight; x.drawImage(video, 0, 0);
      const code = jsQR(x.getImageData(0, 0, cv.width, cv.height).data, cv.width, cv.height); if (code) { busy = true; resolve(code.data).finally(() => setTimeout(() => (busy = false), 1500)); } }
      raf.current = requestAnimationFrame(tick); };
    tick();
  }
  return (<div className="glass space-y-4 p-6">
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-cyan-400/40 bg-black/40">
      <video ref={v} playsInline muted className="h-full w-full object-cover" /><canvas ref={c} hidden />
      {on && <div className="absolute inset-x-0 h-0.5 bg-cyan-300 shadow-[0_0_16px_#22d3ee]" style={{ animation: "scan 2.2s ease-in-out infinite alternate" }} />}
      {!on && <p className="absolute inset-0 grid place-items-center text-sm text-slate-400">Camera is off</p>}</div>
    <div className="flex justify-center gap-3">{on ? <button onClick={stop} className="btn btn-ghost !py-2 text-sm">Stop camera</button> : <button onClick={start} className="btn btn-primary !py-2 text-sm">Start QR scanner</button>}</div>
    {err && <p role="alert" className="text-center text-sm text-rose-300">{err}</p>}</div>);
}
