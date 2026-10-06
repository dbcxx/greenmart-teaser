"use client";

import { useEffect, useState, useTransition } from "react";
import { joinWaitlist, type JoinResult } from "@/app/actions";
import { CATEGORIES, NG_STATES, type Group } from "@/lib/waitlist";
import { track } from "@/lib/analytics";
import Turnstile from "./Turnstile";

const SCALE: Record<Group, { label: string; options: string[] }> = {
  farmer: { label: "Farm size", options: ["Under 1 plot", "1–5 plots", "1–5 hectares", "Over 5 hectares"] },
  seller: { label: "Store type", options: ["Market stall", "Shop", "Aggregator", "Processor"] },
  buyer: { label: "You're buying for", options: ["Household", "Restaurant", "Caterer"] },
};

const input = "mt-1 w-full rounded-lg border border-forest/30 bg-white px-3 py-2.5 text-base focus:border-forest";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-[#b3261e]">{error}</span>}
    </label>
  );
}

export default function WaitlistForm({ group, turnstileSiteKey }: { group: Group; turnstileSiteKey?: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<JoinResult | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [meta, setMeta] = useState({ referredBy: "", utmSource: "", utmCampaign: "" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setMeta({ referredBy: p.get("ref") ?? "", utmSource: p.get("utm_source") ?? "", utmCampaign: p.get("utm_campaign") ?? "" });
  }, []);

  const errors = result && !result.ok ? result.errors : {};
  const sells = group !== "buyer";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      group,
      name: f.get("name"),
      phone: f.get("phone") ?? "",
      email: f.get("email") ?? "",
      state: f.get("state"),
      lgaOrCity: f.get("lgaOrCity"),
      categories: sells ? f.getAll("categories") : undefined,
      businessName: f.get("businessName") || undefined,
      scale: f.get("scale"),
      sellsOnline: sells ? f.get("sellsOnline") : undefined,
      consent: f.get("consent") === "on",
      ...meta,
      turnstileToken,
    };
    start(async () => {
      const res = await joinWaitlist(payload);
      setResult(res);
      if (res.ok && !res.duplicate) track("Signup", { group, referred: meta.referredBy ? "yes" : "no" });
    });
  }

  if (result?.ok) {
    const link = `${window.location.origin}/?ref=${result.referralCode}`;
    const share = `Join me on GreenMart, fresh food straight from Nigerian farms: ${link}`;
    return (
      <div className="rounded-2xl bg-forest p-8 text-husk" role="status">
        <p className="font-display text-3xl font-bold">
          {result.duplicate ? "You're already on the list." : "You're on the list."}
        </p>
        <p className="mt-2 text-lg">
          Your spot: <strong>#{result.position}</strong>. Every friend who joins moves you up 5 places.
        </p>
        <p className="mt-5 break-all rounded-lg bg-soil/40 px-3 py-2 text-sm">{link}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={`https://wa.me/?text=${encodeURIComponent(share)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-sprout px-5 py-2.5 font-semibold text-soil">
            Share on WhatsApp
          </a>
          <button
            onClick={() =>
              navigator.clipboard?.writeText(link).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              })
            }
            className="rounded-full border border-husk/50 px-5 py-2.5 font-semibold"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-2xl bg-white/70 p-6 md:grid-cols-2 md:p-8">
      <Field label="Full name" error={errors.name}>
        <input name="name" autoComplete="name" className={input} required />
      </Field>
      <Field label={group === "buyer" ? "WhatsApp number (optional)" : "WhatsApp number"} error={errors.phone}>
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" className={input} />
      </Field>
      <Field label={group === "farmer" ? "Email (optional)" : "Email"} error={errors.email}>
        <input name="email" type="email" autoComplete="email" className={input} />
      </Field>
      <Field label="State" error={errors.state}>
        <select name="state" defaultValue="" className={input}>
          <option value="" disabled>Pick your state</option>
          {NG_STATES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label={group === "farmer" ? "LGA" : "City"} error={errors.lgaOrCity}>
        <input name="lgaOrCity" className={input} />
      </Field>
      {sells && (
        <Field label={group === "farmer" ? "Farm name (optional)" : "Business name"} error={errors.businessName}>
          <input name="businessName" autoComplete="organization" className={input} />
        </Field>
      )}
      <Field label={SCALE[group].label} error={errors.scale}>
        <select name="scale" defaultValue="" className={input}>
          <option value="" disabled>Choose one</option>
          {SCALE[group].options.map((o) => <option key={o}>{o}</option>)}
        </select>
      </Field>
      {sells && (
        <fieldset className="md:col-span-2">
          <legend className="text-sm font-medium">{group === "farmer" ? "What do you grow?" : "What do you sell?"}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <label key={c} className="flex cursor-pointer items-center gap-2 rounded-full border border-forest/30 bg-white px-3 py-1.5 text-sm has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-husk">
                <input type="checkbox" name="categories" value={c} className="sr-only" />
                {c}
              </label>
            ))}
          </div>
          {errors.categories && <span className="mt-1 block text-sm text-[#b3261e]">{errors.categories}</span>}
        </fieldset>
      )}
      {sells && (
        <fieldset>
          <legend className="text-sm font-medium">Do you sell online today?</legend>
          <div className="mt-2 flex gap-4">
            {["yes", "no"].map((v) => (
              <label key={v} className="flex items-center gap-2">
                <input type="radio" name="sellsOnline" value={v} defaultChecked={v === "no"} /> {v === "yes" ? "Yes" : "No"}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <label className="flex items-start gap-3 md:col-span-2">
        <input type="checkbox" name="consent" className="mt-1 size-4" />
        <span className="text-sm">Send me launch updates by email or WhatsApp. I can opt out any time.</span>
      </label>
      {errors.consent && <span className="-mt-3 text-sm text-[#b3261e] md:col-span-2">{errors.consent}</span>}
      {turnstileSiteKey && <Turnstile siteKey={turnstileSiteKey} onToken={setTurnstileToken} />}
      {errors.form && (
        <p role="alert" className="rounded-lg bg-[#b3261e]/10 px-3 py-2 text-sm text-[#b3261e] md:col-span-2">
          {errors.form}
        </p>
      )}
      <button type="submit" disabled={pending} className="rounded-full bg-forest px-6 py-3 font-semibold text-husk hover:bg-field disabled:opacity-60 md:col-span-2 md:justify-self-start">
        {pending ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}
