import type { Metadata } from "next";
import { filterFrom, isAdmin } from "@/lib/admin-auth";
import { store } from "@/lib/store";
import { CATEGORIES, GROUPS, NG_STATES } from "@/lib/waitlist";
import LoginForm from "./LoginForm";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Waitlist admin · GreenMart", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const LABEL = { farmer: "Farmers", seller: "Sellers", buyer: "Buyers" } as const;
const select = "rounded-lg border border-forest/30 bg-white px-3 py-2 text-sm";

export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!process.env.ADMIN_PASSWORD) {
    return <p className="mx-auto mt-24 max-w-sm text-center">Set <code>ADMIN_PASSWORD</code> to turn on the admin page.</p>;
  }
  if (!(await isAdmin())) return <LoginForm />;

  const filter = filterFrom(await searchParams);
  const [rows, counts] = await Promise.all([store.list(filter), store.counts()]);
  const qs = new URLSearchParams(Object.entries(filter).filter(([, v]) => v) as [string, string][]).toString();
  const total = counts.farmer + counts.seller + counts.buyer;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-forest">Waitlist</h1>
          <p className="mt-1 text-soil/75">
            {total.toLocaleString("en-NG")} total ·{" "}
            {GROUPS.map((g) => `${counts[g].toLocaleString("en-NG")} ${LABEL[g].toLowerCase()}`).join(" · ")}
          </p>
        </div>
        <form action={logout}>
          <button className="text-sm font-semibold text-forest underline">Sign out</button>
        </form>
      </div>

      <form className="mt-8 flex flex-wrap items-center gap-3" method="get">
        <select name="group" defaultValue={filter.group ?? ""} className={select} aria-label="Group">
          <option value="">All groups</option>
          {GROUPS.map((g) => <option key={g} value={g}>{LABEL[g]}</option>)}
        </select>
        <select name="state" defaultValue={filter.state ?? ""} className={select} aria-label="State">
          <option value="">All states</option>
          {NG_STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="category" defaultValue={filter.category ?? ""} className={select} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-husk hover:bg-field">Filter</button>
        {qs && <a href="/admin" className="text-sm text-forest underline">Clear</a>}
        <a href={`/admin/export${qs ? `?${qs}` : ""}`} className="ml-auto rounded-full border-2 border-forest px-5 py-2 text-sm font-semibold text-forest hover:bg-forest hover:text-husk">
          Export CSV ({rows.length})
        </a>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/70">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-forest/15 text-soil/70">
            <tr>
              {["Joined", "Group", "Name", "Phone", "Email", "State", "LGA / city", "Grows / sells", "Scale", "Business", "Online", "Referrals", "Source"].map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={13} className="px-3 py-10 text-center text-soil/60">No signups match.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-forest/10 last:border-0 align-top">
                <td className="whitespace-nowrap px-3 py-2.5 text-soil/70">{new Date(r.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" })}</td>
                <td className="px-3 py-2.5 capitalize">{r.group}</td>
                <td className="px-3 py-2.5 font-medium">{r.name}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{r.phone || "—"}</td>
                <td className="px-3 py-2.5">{r.email || "—"}</td>
                <td className="px-3 py-2.5">{r.state}</td>
                <td className="px-3 py-2.5">{r.lgaOrCity}</td>
                <td className="px-3 py-2.5">{"categories" in r ? r.categories.join(", ") : "—"}</td>
                <td className="whitespace-nowrap px-3 py-2.5">{r.scale}</td>
                <td className="px-3 py-2.5">{("businessName" in r && r.businessName) || "—"}</td>
                <td className="px-3 py-2.5 capitalize">{"sellsOnline" in r ? r.sellsOnline : "—"}</td>
                <td className="px-3 py-2.5 tabular-nums">{r.referralCount}</td>
                <td className="px-3 py-2.5 text-soil/70">{[r.utmSource, r.utmCampaign, r.referredBy && `ref ${r.referredBy}`].filter(Boolean).join(" · ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
