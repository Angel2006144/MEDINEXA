import { redirect } from "next/navigation";
import { getSession } from "./session";
import { db } from "./db";
// Authorizes against the DATABASE role (not the cookie), so role changes take effect immediately.
export async function requireRole(roles: string[]) {
  const s = getSession(); if (!s) redirect("/login");
  const u = await db.user.findUnique({ where: { id: s.uid } }); if (!u) redirect("/login");
  if (!roles.includes(u.role)) redirect("/dashboard");
  return u;
}
