import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { GROUPS, type Group } from "./waitlist";
import type { SignupFilter } from "./store";

export const ADMIN_COOKIE = "gm_admin";

/** Session cookie value: an HMAC of the password, so changing it logs everyone out. */
export function sessionToken(password: string) {
  return createHmac("sha256", password).update("greenmart-admin-v1").digest("hex");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return !!value && safeEqual(value, sessionToken(password));
}

export function filterFrom(params: Record<string, string | string[] | undefined> | URLSearchParams): SignupFilter {
  const get = (k: string) => {
    const v = params instanceof URLSearchParams ? params.get(k) : params[k];
    return (Array.isArray(v) ? v[0] : v) || undefined;
  };
  const group = get("group");
  return {
    group: GROUPS.includes(group as Group) ? (group as Group) : undefined,
    state: get("state"),
    category: get("category"),
  };
}
