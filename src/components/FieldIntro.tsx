"use client";

import { useEffect, useRef, useState } from "react";
import { H, LAYERS, W } from "@/lib/field";
import { trackScene } from "@/lib/analytics";
import { markIntroReady, onSplashDone } from "@/lib/splash";
import { Customer, Farmer, HomeScene, Rider, ShopScene } from "./story/art";

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

// Field layers fill the first of three panels in the world strip. The sway runs on the
// <svg> element itself (not an inner <g>) so the compositor moves it without repainting blades.
const SVG_BOX = "absolute left-0 bottom-[14%] h-[62%] w-1/3";

function Layer({ id, className }: { id: (typeof LAYERS)[number]["id"]; className: string }) {
  const layer = LAYERS.find((l) => l.id === id)!;
  return (
    <svg className={`${SVG_BOX} ${layer.sway} ${className}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden>
      <g opacity={layer.opacity}>
        {layer.blades.map((b, i) => (
          <path key={i} d={b.d} fill={b.fill} className={`blade blade-${id} ${b.mobile ? "" : "max-md:hidden"}`} />
        ))}
      </g>
    </svg>
  );
}

/** Story chapters. `at` is the timeline time where each starts; the last ends at END. */
const CHAPTERS = [
  { label: "Grow", at: 0 },
  { label: "Harvest", at: 4.1 },
  { label: "Pickup", at: 5.6 },
  { label: "Store", at: 8.0 },
  { label: "Delivery", at: 9.6 },
  { label: "Your door", at: 11.1 },
] as const;
const END = 13.1;

/** What GreenMart is, told one beat at a time (chapters 2–6). */
const CAPTIONS = [
  { kicker: "Straight from the farm", line: "Farmers list what they harvest on GreenMart, at prices they set." },
  { kicker: "Fast pickup", line: "A GreenMart dispatch rider collects at the farm gate. Farmers get paid fast." },
  { kicker: "Your favourite farm store", line: "Local stores restock straight from farms. No middlemen, fairer prices." },
  { kicker: "Fast delivery", line: "Order in the app and a rider brings it over. You can follow the ride on your phone." },
  { kicker: "At your door", line: "Fresh food arrives the same day, from a store near you or straight from the farmer." },
];

const CLOUDS = [
  { x: 6, y: 12, w: 9 },
  { x: 24, y: 20, w: 6 },
  { x: 41, y: 9, w: 8 },
  { x: 58, y: 18, w: 7 },
  { x: 76, y: 11, w: 9 },
  { x: 92, y: 22, w: 6 },
];

/**
 * The opening story: seeds → grass → morning → crops → wordmark, then the food's
 * journey: farm → GreenMart dispatch bike → partner store → your door.
 *
 * Desktop (md+): pinned and locked to scroll, with Lenis smoothing the scroll itself
 * (no scrub lag). Mobile: one 100svh screen that autoplays. Reduced motion: final frame.
 * Everything moving is transform/opacity on composited layers.
 */
export default function FieldIntro() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});
  const jump = useRef<(i: number) => void>(() => {});
  const [chapter, setChapter] = useState(0);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("lenis"),
      ]);
      if (cancelled || !root.current || !stage.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      const el = root.current;
      const view = stage.current;

      const mm = gsap.matchMedia();
      mm.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (c) => {
          const { desktop, still } = c.conditions as Record<string, boolean>;
          const q = gsap.utils.selector(el);
          // Only animate what's on screen: phones hide 3 of every 5 blades.
          const shown = (sel: string) => q(sel).filter((n) => getComputedStyle(n).display !== "none");
          trackScene("soil");

          // Panel width and the size unit --u, read live so resizes stay right.
          const P = () => view.clientWidth;
          const U = () => (q(".u-probe")[0] as HTMLElement).offsetWidth;

          gsap.set(q(".blade, .crop"), { scaleY: 0, transformOrigin: "50% 100%" });
          gsap.set(q(".letter"), { yPercent: 110 });
          gsap.set(q(".tagline, .cue"), { autoAlpha: 0, y: 16 });
          gsap.set(q(".seed"), { y: "-45vh", autoAlpha: 0 });
          gsap.set(q(".sky-dawn, .sky-day, .cust-box, .cap, .speed, .scrim, .clouds"), { autoAlpha: 0 });
          // A scrubbed timeline doesn't render its time-0 sets until the first scroll, so park the bike off-screen now.
          gsap.set(q(".rider"), { x: -1.1 * U() });
          gsap.set(q(".cap"), { y: 12 });
          gsap.set(q(".tom, .stock"), { scale: 0, transformOrigin: "50% 100%" });
          gsap.set(q(".sun"), { y: "80vh" });
          gsap.set(q(".wheel"), { transformOrigin: "50% 50%" });
          gsap.set(q(".rider-box"), { transformOrigin: "50% 100%" });
          gsap.set(q(".wave-arm"), { transformOrigin: "84px 90px" });
          gsap.set(q(".bar-fill"), { scaleX: 0, transformOrigin: "0 50%" });
          el.dataset.intro = "ready";

          // Desktop: Lenis smooths the scroll, and the timeline follows it 1:1.
          let lenis: InstanceType<typeof Lenis> | undefined;
          let raf: ((t: number) => void) | undefined;
          if (desktop) {
            lenis = new Lenis({ lerp: 0.09, anchors: true });
            lenis.on("scroll", ScrollTrigger.update);
            raf = (t: number) => lenis!.raf(t * 1000);
            gsap.ticker.add(raf);
            gsap.ticker.lagSmoothing(0);
            lenis.stop();
          }

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            // Mobile waits for the splash; desktop is driven by scroll (locked until the splash lifts).
            paused: !desktop,
            onUpdate() {
              const t = this.time();
              let i = 0;
              while (i < CHAPTERS.length - 1 && t >= CHAPTERS[i + 1].at) i++;
              setChapter((prev) => (prev === i ? prev : i));
            },
            ...(desktop
              ? { scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } }
              : { delay: 0.15 }),
          });

          // Progress bar: each segment fills across its chapter.
          CHAPTERS.forEach((ch, i) => {
            const next = CHAPTERS[i + 1]?.at ?? END;
            tl.to(q(".bar-fill")[i], { scaleX: 1, duration: next - ch.at, ease: "none" }, ch.at);
          });

          const grow = () => ({ scaleY: 1, duration: 1.1, ease: "power3.out", stagger: { amount: 0.5, from: "random" as const } });
          const roll = (turns: number, d: number) => ({ rotation: `+=${360 * turns}`, duration: d, ease: "power1.inOut" });
          const cap = (i: number, at: number, out?: number) => {
            tl.to(q(".cap")[i], { autoAlpha: 1, y: 0, duration: 0.4 }, at);
            if (out !== undefined) tl.to(q(".cap")[i], { autoAlpha: 0, y: -12, duration: 0.3 }, out);
          };
          // A fast run: speed lines on, lean forward, wheels spin, then settle.
          const ride = (x: () => number, at: number, d: number, pan?: number) => {
            tl.to(q(".rider"), { x, duration: d, ease: "power2.inOut" }, at)
              .to(q(".rider .wheel"), roll(d * 5, d), at)
              .to(q(".speed"), { autoAlpha: 1, duration: 0.2 }, at + 0.1)
              .to(q(".speed"), { autoAlpha: 0, duration: 0.25 }, at + d - 0.3)
              .to(q(".rider"), { rotation: -3, duration: 0.25, ease: "sine.out" }, at)
              .to(q(".rider"), { rotation: 0, duration: 0.35, ease: "sine.inOut" }, at + d - 0.35);
            if (pan !== undefined) {
              tl.to(q(".world"), { x: () => -pan * P(), duration: d, ease: "power2.inOut" }, at).to(
                q(".clouds"),
                { x: () => -0.35 * pan * P(), duration: d, ease: "power2.inOut" },
                at,
              );
            }
          };

          // 1. Grow (0–3.6)
          let seeds: ReturnType<typeof gsap.to> | undefined;
          if (desktop) {
            seeds = gsap.to(q(".seed"), { y: 0, autoAlpha: 1, duration: 0.7, ease: "power2.in", stagger: 0.08, delay: 0.15, paused: true });
            tl.to(q(".hint"), { autoAlpha: 0, duration: 0.2 }, 0.05);
          } else {
            tl.to(q(".seed"), { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.in", stagger: 0.06 }, 0);
          }
          tl.call(() => trackScene("sprout"), [], 0.85)
            .to(q(".seed"), { autoAlpha: 0, scale: 0.4, duration: 0.35 }, 0.85)
            .to(shown(".blade-back"), grow(), 0.85)
            .to(shown(".blade-mid"), grow(), 0.97)
            .to(shown(".blade-front"), grow(), 1.09)
            .to(q(".sky-dawn, .clouds"), { autoAlpha: 1, duration: 0.9, ease: "sine.inOut" }, 0.75)
            .to(q(".sun"), { y: 0, duration: 1.8 }, 0.75)
            .call(() => trackScene("field"), [], 1.7)
            .to(q(".sky-day"), { autoAlpha: 1, duration: 1, ease: "sine.inOut" }, 1.7)
            .to(q(".crop"), { scaleY: 1, duration: 0.9, ease: "back.out(1.2)", stagger: 0.07 }, 1.9)
            .call(() => trackScene("brand"), [], 2.5)
            .to(q(".letter"), { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.04 }, 2.5)
            .to(q(".tagline"), { autoAlpha: 1, y: 0, duration: 0.6 }, 3.0);

          // 2. Harvest (4.1–5.6)
          tl.to(q(".brand"), { autoAlpha: 0, yPercent: -25, duration: 0.5, ease: "power2.in" }, 4.1)
            .call(() => trackScene("harvest"), [], 4.3)
            .fromTo(q(".farmer"), { x: () => -0.6 * U(), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: "power1.out" }, 4.3)
            .to(q(".tom"), { scale: 1, duration: 0.3, ease: "back.out(2)", stagger: 0.08 }, 5.0);
          cap(0, 4.4, 5.6);

          // 3. Pickup: the bike zips in, loads, and rides to the store (5.6–8.0)
          tl.set(q(".rider"), { x: () => -1.1 * U() }, 0);
          ride(() => 0.5 * P() - 0.31 * U(), 5.7, 0.8);
          tl.call(() => trackScene("pickup"), [], 5.8)
            .to(q(".head-basket"), { autoAlpha: 0, y: -12, duration: 0.3 }, 6.5)
            .fromTo(q(".rider-box"), { scale: 1 }, { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1 }, 6.6);
          ride(() => 1.5 * P() - 0.8 * U(), 6.9, 1.1, 1);
          cap(1, 5.8, 7.8);

          // 4. Store: drop off, shelves fill, collect a customer's order (8.0–9.6)
          tl.call(() => trackScene("store"), [], 8.0)
            .to(q(".stock"), { scale: 1, duration: 0.4, ease: "back.out(1.6)" }, 8.3)
            .fromTo(q(".rider-box"), { scale: 1 }, { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1 }, 9.0);
          cap(2, 8.0, 9.4);

          // 5. Delivery: fast run to your gate (9.6–11.1)
          tl.call(() => trackScene("delivery"), [], 9.6);
          ride(() => 2.5 * P() - 0.73 * U(), 9.7, 1.2, 2);
          cap(3, 9.6, 10.9);

          // 6. Your door: handoff, wave, brand returns (11.1–13.1)
          tl.call(() => trackScene("delivered"), [], 11.1)
            .to(q(".rider-box"), { autoAlpha: 0, duration: 0.25 }, 11.2)
            .to(q(".cust-box"), { autoAlpha: 1, duration: 0.25 }, 11.3)
            .fromTo(q(".wave-arm"), { rotation: 0 }, { rotation: -18, duration: 0.2, repeat: 3, yoyo: true, ease: "sine.inOut" }, 11.4)
            .to(q(".scrim"), { autoAlpha: 1, duration: 0.6, ease: "sine.inOut" }, 12.2)
            .fromTo(q(".brand"), { autoAlpha: 0, yPercent: 10 }, { autoAlpha: 1, yPercent: 0, duration: 0.6 }, 12.3)
            .to(q(".cue"), { autoAlpha: 1, y: 0, duration: 0.5 }, 12.6)
            .to({}, { duration: END - 13.1 }, 13.1);
          cap(4, 11.1, 12.2);

          if (still) {
            tl.progress(1);
            markIntroReady();
            return;
          }

          if (desktop) {
            const st = tl.scrollTrigger!;
            jump.current = (i) => lenis?.scrollTo(st.start + (CHAPTERS[i].at / tl.duration()) * (st.end - st.start), { duration: 1.4 });
            skip.current = () => {};
          } else {
            jump.current = (i) => tl.seek(CHAPTERS[i].at + 0.01).play();
            skip.current = () => tl.progress(1);
          }

          // Leaving the hero: the wordmark drifts up and fades.
          gsap.to(q(".brand-drift"), {
            yPercent: -30,
            autoAlpha: 0.3,
            ease: "none",
            scrollTrigger: { trigger: el, start: desktop ? "bottom bottom" : "top top", end: "bottom top", scrub: true },
          });

          // Everything is set: let the splash lift, then start the story.
          markIntroReady();
          const off = onSplashDone(() => {
            if (desktop) {
              lenis?.start();
              seeds?.play();
            } else {
              tl.play();
            }
          });

          return () => {
            off();
            if (raf) gsap.ticker.remove(raf);
            gsap.ticker.lagSmoothing(500, 33);
            lenis?.destroy();
          };
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
    <section
      ref={root}
      aria-label="What GreenMart does: food from the farm to your door"
      data-intro="pending"
      className="intro relative h-svh min-h-[540px] md:h-[750vh]"
    >
      <div
        ref={stage}
        className="relative h-svh min-h-[540px] overflow-hidden bg-[#3a2a22] [--u:min(54vw,46svh)] [contain:paint] md:sticky md:top-0 md:[--u:min(42vw,46svh)]"
      >
        <div className="u-probe pointer-events-none invisible absolute h-0 w-[var(--u)]" aria-hidden />
        <div className="sky-dawn absolute inset-0 bg-gradient-to-b from-[#e98a4f] via-dawn to-[#f6c98c]" aria-hidden />
        <div className="sky-day absolute inset-0 bg-gradient-to-b from-[#a9d3e6] via-sky to-[#eaf3e6]" aria-hidden />
        <div className="sun absolute left-[6%] top-[5%] size-12 rounded-full bg-[#ffd27a] shadow-[0_0_80px_20px_#ffd27a66] will-change-transform md:left-[8%] md:top-[9%] md:size-28" aria-hidden />

        <div className="clouds absolute inset-y-0 left-0 w-[300%] will-change-transform" aria-hidden>
          {CLOUDS.map((c) => (
            <span
              key={c.x}
              className="absolute h-[5%] rounded-full bg-white/80"
              style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%` }}
            />
          ))}
        </div>

        {/* The world: farm | store | home, each one viewport wide. */}
        <div className="world absolute inset-y-0 left-0 w-[300%] will-change-transform" aria-hidden>
          <Layer id="back" className="layer-back" />
          <Layer id="mid" className="layer-mid" />
          <svg className={`${SVG_BOX} layer-crops`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden>
            {CROPS.map((c) => (
              <Crop key={c.x} {...c} />
            ))}
          </svg>
          <Layer id="front" className="layer-front" />

          <ShopScene className="absolute bottom-[14%] left-1/3 h-[64%] w-1/3" />
          <HomeScene className="absolute bottom-[14%] left-2/3 h-[44%] w-1/3 md:h-[58%]" />

          {/* Ground: farm soil, a laterite stretch, then tarred road with Lagos kerbs. */}
          <div
            className="absolute inset-x-0 bottom-0 h-[15%]"
            style={{ background: "linear-gradient(90deg, #2e2118 0 30.5%, #9c4a2c 32.5% 34.5%, #3d3d3f 36.5%)" }}
          >
            <div className="h-3 w-1/3 bg-loam" />
            <div
              className="absolute left-[35%] right-0 top-0 h-2.5"
              style={{ background: "repeating-linear-gradient(90deg, #1d1d1d 0 26px, #f0c419 26px 52px)" }}
            />
            <div
              className="absolute left-[36%] right-0 top-[55%] h-1"
              style={{ background: "repeating-linear-gradient(90deg, #f3ecd9cc 0 40px, transparent 40px 90px)" }}
            />
            {[14, 31, 48, 66, 83].map((x) => (
              <span key={x} className="seed absolute top-1 h-2.5 w-4 rounded-full bg-[#c9a14a]" style={{ left: `${x / 3}%` }} />
            ))}
          </div>

          <Farmer
            className="farmer absolute"
            style={{ left: "calc(100% / 6 - var(--u) * 0.55)", bottom: "calc(15% - var(--u) * 0.02)", height: "calc(var(--u) * 0.52)", width: "calc(var(--u) * 0.52 * 120 / 290)" }}
          />
          <Customer
            className="absolute"
            style={{ left: "calc(250% / 3 + var(--u) * 0.05)", bottom: "calc(15% - var(--u) * 0.02)", height: "calc(var(--u) * 0.5)", width: "calc(var(--u) * 0.5 * 120 / 280)" }}
          />
          <Rider
            className="rider absolute left-0 will-change-transform"
            style={{ bottom: "calc(15% - var(--u) * 0.1)", width: "calc(var(--u) * 0.75)", height: "calc(var(--u) * 0.75 * 170 / 280)", transformOrigin: "60% 95%" }}
          />
        </div>

        {/* Morning haze so the returning wordmark reads cleanly over the house. */}
        <div className="scrim pointer-events-none absolute inset-x-0 top-0 h-[62%] bg-gradient-to-b from-[#cfe5ee] via-[#cfe5ee]/85 to-transparent" aria-hidden />

        <div className="brand-drift absolute inset-x-0 top-[17%] z-10 px-6 text-center will-change-transform">
          <div className="brand">
            <h1 className="font-display text-[clamp(3.5rem,13vw,10rem)] font-extrabold leading-[0.9] tracking-tight text-forest">
              <span className="sr-only">Greenmart</span>
              <span aria-hidden className="inline-flex overflow-hidden pb-2">
                {WORD.map((l, i) => (
                  <span key={i} className="letter inline-block will-change-transform">
                    {l}
                  </span>
                ))}
              </span>
            </h1>
            <p className="tagline mx-auto mt-4 max-w-md text-lg text-forest md:text-xl">
              Get food products from your favourite farm store. Coming soon.
            </p>
          </div>
        </div>

        {/* One caption at a time. Screen readers get them all as a list. */}
        <ol className="absolute inset-x-0 top-[13%] z-10 grid place-items-center px-5 md:top-[16%]">
          {CAPTIONS.map((c) => (
            <li key={c.kicker} className="cap max-w-md rounded-2xl bg-husk/95 px-5 py-4 shadow-lg will-change-transform [grid-area:1/1] md:max-w-lg md:px-6">
              <span className="text-xs font-semibold text-field md:text-sm">{c.kicker}</span>
              <span className="mt-1 block font-display text-lg font-bold leading-snug text-forest md:text-2xl">{c.line}</span>
            </li>
          ))}
        </ol>

        {/* Story progress: fills with scroll (desktop) or playback (mobile). Tap a chapter to jump. */}
        <nav
          aria-label="Story chapters"
          className="absolute inset-x-4 top-3 z-20 md:inset-x-auto md:left-1/2 md:top-5 md:w-[min(680px,62vw)] md:-translate-x-1/2 md:rounded-full md:bg-husk/85 md:px-5 md:py-2.5 md:shadow-sm"
        >
          <ol className="flex gap-1.5 md:gap-3">
            {CHAPTERS.map((ch, i) => (
              <li key={ch.label} className="flex-1">
                <button
                  type="button"
                  onClick={() => jump.current(i)}
                  aria-label={`Jump to ${ch.label}`}
                  aria-current={chapter === i ? "step" : undefined}
                  className="group block w-full py-1.5 text-left"
                >
                  <span className="block h-1 overflow-hidden rounded-full bg-white/45 md:bg-forest/15">
                    <span className="bar-fill block h-full w-full rounded-full bg-sprout will-change-transform md:bg-field" />
                  </span>
                  <span
                    className={`mt-1.5 hidden text-xs font-semibold transition-colors md:block ${
                      chapter === i ? "text-forest" : "text-forest/45 group-hover:text-forest/75"
                    }`}
                  >
                    {ch.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <p className="hint nudge absolute inset-x-0 bottom-[17%] z-10 hidden text-center text-sm font-medium text-husk md:block">
          Scroll to grow
        </p>

        <a
          href="#join"
          className="cue absolute inset-x-0 bottom-[4%] z-10 mx-auto flex w-fit flex-col items-center gap-1 text-sm font-semibold text-husk"
        >
          Join the waitlist
          <svg className="nudge" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <a
          href="#join"
          onClick={() => skip.current()}
          className="absolute right-4 top-9 z-20 rounded-full bg-husk/90 px-4 py-2 text-sm font-semibold text-forest hover:bg-husk md:top-5"
        >
          Skip intro
        </a>
      </div>
    </section>
  );
}
