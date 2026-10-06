import { ImageResponse } from "next/og";
import { H, LAYERS, W } from "@/lib/field";

export const alt = "GreenMart: the wordmark rising out of a field of grass";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Bricolage Grotesque, subset to the glyphs we draw. Falls back to the default
// font if Google Fonts is unreachable at build time.
async function loadFont(text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return undefined;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return undefined;
  }
}

const MAIZE = [180, 820, 1080];
const FRUIT = [
  { x: 470, c: "#d8432f" },
  { x: 1300, c: "#e85d24" },
];

export default async function Image() {
  const word = "Greenmart";
  const tagline = "Fresh from the farm. Coming soon.";
  const font = await loadFont(word + tagline);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", background: "#cfe5ee" }}>
        <div style={{ position: "absolute", left: 80, top: 56, width: 110, height: 110, borderRadius: 999, background: "#ffd27a" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 70, zIndex: 2 }}>
          <div style={{ fontFamily: "Bricolage", fontSize: 176, fontWeight: 800, color: "#1f4d2b", letterSpacing: -6, lineHeight: 1 }}>{word}</div>
          <div style={{ fontFamily: "Bricolage", fontSize: 36, color: "#1f4d2b", marginTop: 14 }}>{tagline}</div>
        </div>
        <svg
          width={1200}
          height={330}
          viewBox={`0 ${H - 330} ${W} 330`}
          preserveAspectRatio="xMidYMax slice"
          style={{ position: "absolute", left: 0, bottom: 70 }}
        >
          {LAYERS.slice(0, 2).map((layer) => (
            <g key={layer.id} opacity={layer.opacity}>
              {layer.blades.map((b, i) => (
                <path key={i} d={b.d} fill={b.fill} />
              ))}
            </g>
          ))}
          {MAIZE.map((x) => (
            <g key={x}>
              <path d={`M${x},${H} L${x},${H - 300}`} stroke="#4f8a2e" strokeWidth={7} />
              <path d={`M${x},${H - 140} q-70,-40 -110,10 q60,-10 110,-30`} fill="#5ea640" />
              <path d={`M${x},${H - 220} q70,-50 120,0 q-65,-15 -120,-10`} fill="#4f9a3c" />
              <ellipse cx={x + 14} cy={H - 230} rx={11} ry={34} fill="#e8b64c" />
            </g>
          ))}
          {FRUIT.map(({ x, c }) => (
            <g key={x}>
              <path d={`M${x},${H} C${x - 10},${H - 90} ${x + 12},${H - 160} ${x},${H - 230}`} stroke="#3e7a2e" strokeWidth={6} fill="none" />
              <path d={`M${x},${H - 120} q-55,-30 -80,10 q40,-5 80,-10`} fill="#4f9a3c" />
              <circle cx={x - 26} cy={H - 140} r={15} fill={c} />
              <circle cx={x + 24} cy={H - 196} r={13} fill={c} />
            </g>
          ))}
          {LAYERS[2].blades.map((b, i) => (
            <path key={i} d={b.d} fill={b.fill} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 72, display: "flex", flexDirection: "column", background: "#2e2118" }}>
          <div style={{ height: 10, background: "#4a3627" }} />
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Bricolage", data: font, weight: 800, style: "normal" }] : undefined },
  );
}
