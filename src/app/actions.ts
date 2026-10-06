"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { signupSchema } from "@/lib/waitlist";
import { store } from "@/lib/store";
import { clientIp, hashIp, overRateLimit, verifyTurnstile } from "@/lib/guard";
import { sendWelcome } from "@/lib/notify";

export type JoinResult =
  | { ok: true; position: number; referralCode: string; duplicate: boolean }
  | { ok: false; errors: Record<string, string> };

export async function joinWaitlist(raw: unknown): Promise<JoinResult> {
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, errors };
  }

  const ip = clientIp(await headers());
  const token = (raw as { turnstileToken?: unknown } | null)?.turnstileToken;
  if (!(await verifyTurnstile(typeof token === "string" ? token : undefined, ip))) {
    return { ok: false, errors: { form: "We couldn't check you're human. Refresh the page and try again." } };
  }

  try {
    const ipHash = hashIp(ip);
    if (await overRateLimit(ipHash)) {
      return { ok: false, errors: { form: "Lots of signups from this connection. Try again in an hour." } };
    }
    const { record, position, duplicate } = await store.add(parsed.data, { ipHash });
    if (!duplicate) after(() => sendWelcome(record, position));
    return { ok: true, position, referralCode: record.referralCode, duplicate };
  } catch (e) {
    console.error("[joinWaitlist]", e);
    return { ok: false, errors: { form: "Something went wrong on our side. Please try again." } };
  }
}
