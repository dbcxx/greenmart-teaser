"use client";

import { useEffect, useRef } from "react";

// Deterministic PRNG so server and client render the same field.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Blade = { d: string; fill: string; mobile: boolean };

const W = 1440;
const H = 600;

function makeBlades(count: number, seed: number, minH: number, maxH: number, palette: string[]): Blade[] {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const x = (i / count) * W + r() * (W / count) * 2 - W / count;
    const w = 4 + r() * 7;
    const h = minH + r() * (maxH - minH);
    const bend = (r() - 0.5) * h * 0.45;
    const d = `M${x - w},${H} Q${x - w * 0.3 + bend / 2},${H - h * 0.6} ${x + bend},${H - h} Q${x + w * 0.3 + bend / 2},${H - h * 0.6} ${x + w},${H} Z`;
    return { d, fill: palette[Math.floor(r() * palette.length)], mobile: i % 5 < 2 };
  });
}

const LAYERS = [
  { id: "back", blades: makeBlades(110, 7, 120, 260, ["#2f7a3a", "#3c8a3f"]), sway: "sway sway-slow", opacity: 0.75 },
  { id: "mid", blades: makeBlades(100, 23, 150, 320, ["#4f9a3c", "#5ea640", "#2f7a3a"]), sway: "sway", opacity: 0.9 },
  { id: "front", blades: makeBlades(90, 41, 90, 220, ["#7cb342", "#6aa83e", "#1f4d2b"]), sway: "sway sway-slow", opacity: 1 },
];

const CROPS = [
  { x: 220, kind: "maize" },
  { x: 520, kind: "tomato" },
  { x: 900, kind: "maize" },
  { x: 1180, kind: "pepper" },
  { x: 1340, kind: "maize" },
] as const;

function Crop({ x, kind }: { x: number; kind: (typeof CROPS)[number]["kind"] }) {
  if (kind === "maize") {
    return (
      <g className="crop" data-x={x}>
        <path d={`M${x},${H} L${x},${H - 380}`} stroke="#4f8a2e" strokeWidth="7" />
        <path d={`M${x},${H - 140} q-70,-40 -110,10 q60,-10 110,-30`} fill="#5ea640" />
        <path d={`M${x},${H - 220} q70,-50 120,0 q-65,-15 -120,-10`} fill="#4f9a3c" />
        <path d={`M${x},${H - 300} q-60,-40 -95,0 q50,-12 95,-15`} fill="#6aa83e" />
        <ellipse cx={x + 14} cy={H - 250} rx="11" ry="34" fill="#e8b64c" />
        <path d={`M${x},${H - 380} l-14,-40 M${x},${H - 380} l12,-44 M${x},${H - 380} l0,-48`} stroke="#c9a14a" strokeWidth="3" />
      </g>
    );
  }
  const fruit = kind === "tomato" ? "#d8432f" : "#e85d24";
  return (
    <g className="crop" data-x={x}>
      <path d={`M${x},${H} C${x - 10},${H - 90} ${x + 12},${H - 160} ${x},${H - 230}`} stroke="#3e7a2e" strokeWidth="6" fill="none" />
      <path d={`M${x},${H - 120} q-55,-30 -80,10 q40,-5 80,-10`} fill="#4f9a3c" />
      <path d={`M${x},${H - 180} q55,-35 85,5 q-45,-8 -85,-5`} fill="#5ea640" />
      <circle cx={x - 26} cy={H - 140} r="15" fill={fruit} />
      <circle cx={x + 24} cy={H - 196} r="13" fill={fruit} />
      <circle cx={x + 6} cy={H - 100} r="12" fill={fruit} />
    </g>
  );
}

const WORD = "Greenmart".split("");

export default function FieldIntro() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
        (c) => {
          const q = gsap.utils.selector(root);
          if (c.conditions?.still) {
            gsap.set(q(".seed"), { autoAlpha: 0 });
            return;
          }

          gsap.set(q(".blade"), { scaleY: 0, transformOrigin: "50% 100%" });
          gsap.set(q(".crop"), { scaleY: 0, transformOrigin: "50% 100%" });
          gsap.set(q(".letter"), { yPercent: 110 });
          gsap.set(q(".tagline"), { autoAlpha: 0, y: 16 });
          gsap.set(q(".seed"), { y: -260, autoAlpha: 0 });
          gsap.set(q(".sky"), { backgroundColor: "#3a2a22" });
          gsap.set(q(".sun"), { y: () => window.innerHeight * 0.95 });

          // Seeds fall on load, before any scroll.
          gsap.to(q(".seed"), { y: 0, autoAlpha: 1, duration: 0.9, ease: "power2.in", stagger: 0.12, delay: 0.3 });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
          });

          tl.to(q(".hint"), { autoAlpha: 0, duration: 0.05 }, 0.02)
            .to(q(".seed"), { autoAlpha: 0, duration: 0.05 }, 0.1)
            // Sprout: 10–35%
            .to(q(".blade-back"), { scaleY: 1, duration: 0.2, stagger: { amount: 0.08, from: "start" } }, 0.1)
            .to(q(".blade-mid"), { scaleY: 1, duration: 0.2, stagger: { amount: 0.08, from: "start" } }, 0.14)
            .to(q(".blade-front"), { scaleY: 1, duration: 0.2, stagger: { amount: 0.08, from: "start" } }, 0.18)
            // Field: 35–60%
            .to(q(".sky"), { backgroundColor: "#f0a35e", duration: 0.12 }, 0.3)
            .to(q(".sky"), { backgroundColor: "#cfe5ee", duration: 0.14 }, 0.44)
            .to(q(".sun"), { y: 0, duration: 0.26, ease: "none" }, 0.32)
            .to(q(".crop"), { scaleY: 1, duration: 0.18, stagger: 0.03 }, 0.38)
            // Brand: 60–80%
            .to(q(".letter"), { yPercent: 0, duration: 0.12, stagger: 0.012, ease: "power3.out" }, 0.6)
            .to(q(".tagline"), { autoAlpha: 1, y: 0, duration: 0.08 }, 0.74)
            .to({}, { duration: 0.2 }, 0.8);
        },
      );
      ctx = mm;
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section ref={root} aria-label="GreenMart intro" className="relative h-[400vh]">
      <div className="sky sticky top-0 h-svh overflow-hidden bg-sky">
        <div className="sun absolute left-[8%] top-[7%] size-20 rounded-full bg-[#ffd27a] md:size-28" aria-hidden />

        <div className="absolute inset-x-0 top-[18%] z-10 px-6 text-center md:top-[16%]">
          <h1 className="font-display text-[clamp(3.5rem,13vw,10rem)] font-extrabold leading-[0.9] tracking-tight text-forest">
            <span className="sr-only">Greenmart</span>
            <span aria-hidden className="inline-flex overflow-hidden pb-2">
              {WORD.map((l, i) => (
                <span key={i} className="letter inline-block">
                  {l}
                </span>
              ))}
            </span>
          </h1>
          <p className="tagline mx-auto mt-4 max-w-md text-lg text-forest md:text-xl">
            Get food products from your favourite farm store. Coming soon.
          </p>
        </div>

        <svg
          className="absolute inset-x-0 bottom-[14%] h-[62%] w-full"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMax slice"
          aria-hidden
        >
          {LAYERS.slice(0, 2).map((layer) => (
            <g key={layer.id} className={layer.sway} style={{ transformBox: "fill-box" }} opacity={layer.opacity}>
              {layer.blades.map((b, i) => (
                <path key={i} d={b.d} fill={b.fill} className={`blade blade-${layer.id} ${b.mobile ? "" : "max-md:hidden"}`} />
              ))}
            </g>
          ))}
          {CROPS.map((c) => (
            <Crop key={c.x} {...c} />
          ))}
          <g className={LAYERS[2].sway} style={{ transformBox: "fill-box" }}>
            {LAYERS[2].blades.map((b, i) => (
              <path key={i} d={b.d} fill={b.fill} className={`blade blade-front ${b.mobile ? "" : "max-md:hidden"}`} />
            ))}
          </g>
        </svg>

        <div className="absolute inset-x-0 bottom-0 h-[15%] bg-soil" aria-hidden>
          <div className="h-3 bg-loam" />
          {[14, 31, 48, 66, 83].map((x) => (
            <span key={x} className="seed absolute top-1 h-2.5 w-4 rounded-full bg-[#c9a14a]" style={{ left: `${x}%` }} />
          ))}
        </div>

        <p className="hint nudge absolute inset-x-0 bottom-[17%] z-10 text-center text-sm font-medium text-husk">
          Scroll to grow
        </p>

        <a
          href="#join"
          className="absolute right-4 top-4 z-20 rounded-full bg-husk/90 px-4 py-2 text-sm font-semibold text-forest hover:bg-husk"
        >
          Skip intro
        </a>
      </div>
    </section>
  );
}
