"use client";

import { useEffect, useState } from "react";
import { INTRO_READY, SPLASH_DONE } from "@/lib/splash";

/** Shown at least this long so it never just flickers. */
const MIN_MS = 1100;
/** Leave by now even if the intro never reports ready (slow network, script error). */
const MAX_MS = 4000;
/** Matches the .splash transition in globals.css. */
const EXIT_MS = 800;

/**
 * Branded splash, server-rendered so it's the very first paint. Its entrance is
 * pure CSS, so it animates before any JS loads. It lifts away once the intro is
 * ready, then tells the intro to start.
 */
export default function Splash() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("splash-lock");
    const timers: ReturnType<typeof setTimeout>[] = [];
    let started = false;

    const leave = () => {
      if (started) return;
      started = true;
      timers.push(
        setTimeout(() => {
          setLeaving(true);
          timers.push(
            setTimeout(() => {
              setGone(true);
              html.classList.remove("splash-lock");
              html.dataset.splash = "done";
              window.dispatchEvent(new Event(SPLASH_DONE));
            }, EXIT_MS),
          );
        }, Math.max(0, MIN_MS - performance.now())),
      );
    };

    if (html.dataset.intro === "ready") leave();
    else window.addEventListener(INTRO_READY, leave);
    timers.push(setTimeout(leave, Math.max(0, MAX_MS - performance.now())));

    return () => {
      window.removeEventListener(INTRO_READY, leave);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      className={`splash fixed inset-0 z-[100] flex flex-col items-center justify-center bg-forest text-husk ${leaving ? "splash-leave" : ""}`}
      role="status"
      aria-label="Loading GreenMart"
    >
      <svg className="splash-sprout h-16 w-16 md:h-20 md:w-20" viewBox="0 0 64 64" aria-hidden>
        <path className="splash-stem" d="M32 58 C32 46 31 38 32 28" stroke="#7cb342" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path className="splash-leaf splash-leaf-l" d="M31 34 C20 34 12 26 12 16 C23 16 31 23 31 34 Z" fill="#7cb342" />
        <path className="splash-leaf splash-leaf-r" d="M33 28 C33 16 41 8 53 8 C53 20 45 28 33 28 Z" fill="#9ccc5a" />
      </svg>
      <p className="splash-word mt-4 font-display text-5xl font-extrabold tracking-tight md:text-7xl">Greenmart</p>
      <p className="splash-tag mt-2 text-sm text-sprout md:text-base">Fresh from the farm</p>
      <div className="absolute bottom-[12%] h-1 w-40 overflow-hidden rounded-full bg-husk/15" aria-hidden>
        <span className="splash-bar block h-full w-1/2 rounded-full bg-sprout" />
      </div>
    </div>
  );
}
