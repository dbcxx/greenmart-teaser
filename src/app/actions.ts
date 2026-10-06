"use server";

import { signupSchema } from "@/lib/waitlist";
import { store } from "@/lib/store";

export type JoinResult =
  | { ok: true; position: number; referralCode: string; duplicate: boolean }
  | { ok: false; errors: Record<string, string> };

export async function joinWaitlist(raw: unknown): Promise<JoinResult> {
  // TODO: verify Cloudflare Turnstile token + rate-limit by IP before writing.
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, errors };
  }
  const { record, position, duplicate } = await store.add(parsed.data);
  // TODO: send welcome email (Resend) / WhatsApp message (Termii or Cloud API).
  return { ok: true, position, referralCode: record.referralCode, duplicate };
}
