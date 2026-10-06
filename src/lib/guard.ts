import "server-only";
import { createHash } from "crypto";
import { store } from "./store";

/** Max signups per IP in the window. Generous: families and offices share IPs. */
const RATE_LIMIT = 8;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export function clientIp(h: Headers) {
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}

/** We never store raw IPs (NDPA): only a salted hash, good enough for rate limiting. */
export function hashIp(ip: string) {
  if (!ip) return undefined;
  const salt = process.env.IP_HASH_SALT ?? process.env.ADMIN_PASSWORD ?? "greenmart";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export async function overRateLimit(ipHash: string | undefined) {
  if (!ipHash) return false;
  return (await store.recentFromIp(ipHash, new Date(Date.now() - RATE_WINDOW_MS))) >= RATE_LIMIT;
}

/** Cloudflare Turnstile. Skipped (returns true) until TURNSTILE_SECRET_KEY is set. */
export async function verifyTurnstile(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, ...(ip && { remoteip: ip }) }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
