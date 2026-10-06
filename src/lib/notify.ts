import "server-only";
import type { SignupRecord } from "./waitlist";

/**
 * Welcome messages. Each channel is off until its env vars are set:
 * - Email:    RESEND_API_KEY + RESEND_FROM (e.g. "GreenMart <hello@greenmart.ng>")
 * - WhatsApp: TERMII_API_KEY + TERMII_SENDER_ID + WHATSAPP_ENABLED=1
 * Failures are logged, never thrown: a signup must not fail because a message did.
 */

const GROUP_LINE = {
  farmer: "We'll help you sell straight from your farm and keep more of every naira.",
  seller: "We'll open your store to buyers across the city.",
  buyer: "Fresh food from the farm, straight to your door.",
} as const;

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function message(rec: SignupRecord, position: number) {
  const first = rec.name.split(" ")[0];
  const link = `${siteUrl()}/?ref=${rec.referralCode}`;
  return { first, link, position, line: GROUP_LINE[rec.group] };
}

async function sendEmail(rec: SignupRecord, position: number) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from || !rec.email) return;
  const m = message(rec, position);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: rec.email,
      subject: "You're on the GreenMart list",
      text: `Hi ${m.first},\n\nYou're #${m.position} on the GreenMart waitlist. ${m.line}\n\nEvery friend who joins with your link moves you up 5 places:\n${m.link}\n\nWe'll tell you the moment we open.\n\nThe GreenMart team`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;color:#2e2118">
  <h1 style="color:#1f4d2b;font-size:28px;margin:0 0 12px">You're on the list, ${escapeHtml(m.first)}.</h1>
  <p style="font-size:16px">Your spot: <strong>#${m.position}</strong>. ${m.line}</p>
  <p style="font-size:16px">Every friend who joins with your link moves you up 5 places.</p>
  <p><a href="${m.link}" style="display:inline-block;background:#1f4d2b;color:#f3ecd9;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Your invite link</a></p>
  <p style="font-size:14px;color:#4a3627">${m.link}</p>
  <p style="font-size:14px;color:#4a3627">We'll tell you the moment we open. Reply to opt out of updates.</p>
</div>`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendWhatsApp(rec: SignupRecord, position: number) {
  const key = process.env.TERMII_API_KEY;
  const from = process.env.TERMII_SENDER_ID;
  if (process.env.WHATSAPP_ENABLED !== "1" || !key || !from || !rec.phone) return;
  const m = message(rec, position);
  const res = await fetch(`${process.env.TERMII_BASE_URL ?? "https://api.ng.termii.com"}/api/sms/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      to: rec.phone.replace(/^\+/, ""),
      from,
      channel: "whatsapp",
      type: "plain",
      sms: `Hi ${m.first}, you're #${m.position} on the GreenMart waitlist. ${m.line} Share your link to move up 5 places per friend: ${m.link}`,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Termii ${res.status}: ${await res.text()}`);
}

export async function sendWelcome(rec: SignupRecord, position: number) {
  const results = await Promise.allSettled([sendEmail(rec, position), sendWhatsApp(rec, position)]);
  for (const r of results) if (r.status === "rejected") console.error("[welcome]", r.reason);
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
