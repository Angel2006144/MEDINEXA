import { PrismaClient } from "@prisma/client";
const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;
export const avg = (r: { rating: number }[]) => (r.length ? r.reduce((a, b) => a + b.rating, 0) / r.length : 0);
