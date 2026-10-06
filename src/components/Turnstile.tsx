"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | undefined;

function load() {
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = undefined;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

/** Loads Cloudflare's script only when a form opens, so it stays off the first paint. */
export default function Turnstile({ siteKey, onToken }: { siteKey: string; onToken: (t: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let id: string | undefined;
    let gone = false;
    load()
      .then(() => {
        if (gone || !el.current || !window.turnstile) return;
        id = window.turnstile.render(el.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(""),
        });
      })
      .catch(() => {});
    return () => {
      gone = true;
      if (id) window.turnstile?.remove(id);
    };
  }, [siteKey]);

  return <div ref={el} className="md:col-span-2 empty:hidden" />;
}
