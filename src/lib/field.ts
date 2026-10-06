/** Grass field geometry, shared by the intro and the OG image. */

// Deterministic PRNG so server and client render the same field.
export function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export type Blade = { d: string; fill: string; mobile: boolean };

export const W = 1440;
export const H = 600;

export function makeBlades(count: number, seed: number, minH: number, maxH: number, palette: string[]): Blade[] {
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

export const LAYERS = [
  { id: "back", blades: makeBlades(110, 7, 120, 260, ["#2f7a3a", "#3c8a3f"]), sway: "sway sway-slow", opacity: 0.75 },
  { id: "mid", blades: makeBlades(100, 23, 150, 320, ["#4f9a3c", "#5ea640", "#2f7a3a"]), sway: "sway", opacity: 0.9 },
  { id: "front", blades: makeBlades(90, 41, 90, 220, ["#7cb342", "#6aa83e", "#1f4d2b"]), sway: "sway sway-slow", opacity: 1 },
];
