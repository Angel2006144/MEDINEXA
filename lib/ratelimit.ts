// In-memory limiter (per server instance). Replace with Upstash/Redis for Vercel/multi-instance production.
const m = new Map<string, number[]>();
export const limited = (key: string, max: number, ms: number) => { const n = Date.now(); const h = (m.get(key) ?? []).filter(t => n - t < ms); h.push(n); m.set(key, h); return h.length > max; };
export const ip = (r: Request) => r.headers.get("x-forwarded-for") ?? "local";
