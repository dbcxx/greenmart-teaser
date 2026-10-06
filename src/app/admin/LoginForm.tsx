"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mx-auto mt-24 max-w-sm rounded-2xl bg-white/70 p-8">
      <h1 className="font-display text-3xl font-bold text-forest">Waitlist admin</h1>
      <label className="mt-6 block">
        <span className="text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          className="mt-1 w-full rounded-lg border border-forest/30 bg-white px-3 py-2.5"
        />
      </label>
      {error && <p className="mt-2 text-sm text-[#b3261e]">{error}</p>}
      <button disabled={pending} className="mt-5 rounded-full bg-forest px-6 py-3 font-semibold text-husk hover:bg-field disabled:opacity-60">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
