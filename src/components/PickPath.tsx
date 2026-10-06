"use client";

import { useRef, useState } from "react";
import type { Group } from "@/lib/waitlist";
import { track } from "@/lib/analytics";
import WaitlistForm from "./WaitlistForm";

const PATHS: { group: Group; title: string; pitch: string; perk: string }[] = [
  { group: "farmer", title: "I'm a farmer", pitch: "Sell straight from your farm. Keep more of every naira.", perk: "First 100 farmers pay zero commission for 3 months." },
  { group: "seller", title: "I'm a seller", pitch: "Open your store to buyers across the city.", perk: "Early sellers get a featured spot at launch." },
  { group: "buyer", title: "I'm a buyer", pitch: "Fresh from the farm, straight to your door.", perk: "First 500 buyers get free delivery on their first order." },
];

export default function PickPath({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [active, setActive] = useState<Group | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function pick(g: Group) {
    setActive(g);
    track("Path picked", { group: g });
    // On phones the cards stack, so the form opens below the fold. Bring it up.
    requestAnimationFrame(() => {
      const el = formRef.current;
      if (el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
        el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      }
    });
  }

  return (
    <section id="join" className="scroll-mt-4 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-4xl font-bold text-forest md:text-5xl">Get in before we open.</h2>
        <p className="mt-3 max-w-xl text-lg text-soil/80">Pick the one that fits you. It takes under a minute.</p>

        <div className="mt-10 grid gap-4 md:grid-cols-3" role="group" aria-label="Choose how you'll use GreenMart">
          {PATHS.map((p) => {
            const on = active === p.group;
            return (
              <button
                key={p.group}
                type="button"
                aria-pressed={on}
                aria-controls="waitlist-form"
                onClick={() => pick(p.group)}
                className={`rounded-2xl border-2 p-6 text-left transition-colors ${
                  on ? "border-forest bg-forest text-husk" : "border-forest/20 bg-white/60 hover:border-forest"
                }`}
              >
                <span className="font-display text-2xl font-bold">{p.title}</span>
                <span className="mt-2 block">{p.pitch}</span>
                <span className={`mt-4 block text-sm ${on ? "text-sprout" : "text-field"}`}>{p.perk}</span>
              </button>
            );
          })}
        </div>

        <div id="waitlist-form" ref={formRef} className="mt-10 scroll-mt-4">
          {active ? <WaitlistForm key={active} group={active} turnstileSiteKey={turnstileSiteKey} /> : null}
        </div>
      </div>
    </section>
  );
}
