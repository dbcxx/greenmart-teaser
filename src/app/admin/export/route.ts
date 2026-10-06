import { filterFrom, isAdmin } from "@/lib/admin-auth";
import { store } from "@/lib/store";
import type { SignupRecord } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

const COLUMNS: [string, (r: SignupRecord) => unknown][] = [
  ["id", (r) => r.id],
  ["group", (r) => r.group],
  ["name", (r) => r.name],
  ["phone", (r) => r.phone],
  ["email", (r) => r.email],
  ["state", (r) => r.state],
  ["lga_or_city", (r) => r.lgaOrCity],
  ["categories", (r) => ("categories" in r ? r.categories.join("; ") : "")],
  ["scale", (r) => r.scale],
  ["business_name", (r) => ("businessName" in r ? r.businessName : "")],
  ["sells_online", (r) => ("sellsOnline" in r ? r.sellsOnline : "")],
  ["referral_code", (r) => r.referralCode],
  ["referred_by", (r) => r.referredBy],
  ["referral_count", (r) => r.referralCount],
  ["utm_source", (r) => r.utmSource],
  ["utm_campaign", (r) => r.utmCampaign],
  ["consent", (r) => (r.consent ? "yes" : "no")],
  ["created_at", (r) => r.createdAt],
];

function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  // Stop spreadsheet formula injection, but leave +234 phone numbers alone.
  if (/^[=+\-@\t\r]/.test(s) && !/^\+\d+$/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const filter = filterFrom(new URL(req.url).searchParams);
  const rows = await store.list(filter);
  const csv = [COLUMNS.map(([h]) => h).join(","), ...rows.map((r) => COLUMNS.map(([, f]) => cell(f(r))).join(","))].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  const name = ["greenmart-waitlist", filter.group, filter.state, filter.category, stamp].filter(Boolean).join("-").replace(/[^\w-]+/g, "_");
  return new Response("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
