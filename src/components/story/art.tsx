/**
 * Flat illustrations for the delivery story: farm → dispatch bike → partner store → your gate.
 * Shapes only, no raster images. Class names (.tom, .bed-basket, .wheel, …) are
 * animation hooks used by FieldIntro.
 */

const SKIN = "#5a3825";
const SKIN_2 = "#6b4430";
const DISPLAY = { fontFamily: "var(--font-display), system-ui, sans-serif" };

/** A woman in buba, iro and gele, in a 120×258 box (feet at y≈258). Callers position her. */
function Woman({ top, wrap, gele, children }: { top: string; wrap: string; gele: string; children?: React.ReactNode }) {
  return (
    <g>
      <rect x="46" y="225" width="10" height="30" fill={SKIN} />
      <rect x="64" y="225" width="10" height="30" fill={SKIN} />
      <rect x="42" y="252" width="16" height="6" rx="3" fill="#3b2a1e" />
      <rect x="62" y="252" width="16" height="6" rx="3" fill="#3b2a1e" />
      <path d="M34,140 L86,140 L92,232 L28,232 Z" fill={wrap} />
      <path d="M33,165 L87,165 M31,190 L89,190 M30,214 L90,214" stroke="#1f4d2b" strokeWidth="5" />
      <path d="M36,80 Q60,70 84,80 L88,145 L32,145 Z" fill={top} />
      <rect x="54" y="60" width="12" height="16" fill={SKIN} />
      <circle cx="60" cy="50" r="16" fill={SKIN} />
      <path d="M40,48 Q36,22 60,24 Q86,22 82,48 Q70,36 60,38 Q50,36 40,48 Z" fill={gele} />
      <path d="M78,30 q14,-8 18,6 q-10,-3 -18,6 Z" fill={gele} />
      {children}
    </g>
  );
}

export function Farmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 -30 120 290" aria-hidden>
      <g>
        <Woman top="#7a3b8f" wrap="#e8792b" gele="#e8b64c">
          {/* arm up, steadying the basket */}
          <path d="M84,86 L96,56 L88,22" stroke={SKIN} strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M36,86 L28,132" stroke={SKIN} strokeWidth="8" strokeLinecap="round" />
          <g className="head-basket">
            {/* tomatoes and tatashe pile up as she harvests */}
            <circle className="tom" cx="42" cy="0" r="8" fill="#d8432f" />
            <circle className="tom" cx="56" cy="-5" r="9" fill="#e85d24" />
            <circle className="tom" cx="71" cy="-3" r="8" fill="#d8432f" />
            <circle className="tom" cx="82" cy="1" r="7" fill="#c8331f" />
            <circle className="tom" cx="63" cy="-15" r="8" fill="#d8432f" />
            <circle className="tom" cx="49" cy="-12" r="7" fill="#e85d24" />
            <path d="M26,4 L94,4 L84,26 L36,26 Z" fill="#c9a14a" />
            <path d="M30,11 L90,11 M33,18 L87,18 M46,4 L48,26 M60,4 L60,26 M74,4 L72,26" stroke="#a8803a" strokeWidth="2" />
          </g>
        </Woman>
      </g>
    </svg>
  );
}

export function Customer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 -10 120 280" aria-hidden>
      <rect x="46" y="190" width="12" height="62" fill="#2c4a7a" />
      <rect x="62" y="190" width="12" height="62" fill="#2c4a7a" />
      <rect x="40" y="250" width="20" height="8" rx="4" fill="#f3ecd9" />
      <rect x="60" y="250" width="20" height="8" rx="4" fill="#f3ecd9" />
      <path d="M36,84 Q60,74 84,84 L86,196 L34,196 Z" fill="#f0c419" />
      <rect x="54" y="62" width="12" height="16" fill={SKIN_2} />
      <circle cx="60" cy="50" r="16" fill={SKIN_2} />
      <circle cx="60" cy="30" r="14" fill="#1d1410" />
      <path d="M44,46 Q44,30 60,30 Q76,30 76,46 Q68,38 60,38 Q52,38 44,46 Z" fill="#1d1410" />
      <path d="M36,90 L28,140" stroke={SKIN_2} strokeWidth="8" strokeLinecap="round" />
      <g className="wave-arm">
        <path d="M84,90 L100,62 L104,34" stroke={SKIN_2} strokeWidth="8" strokeLinecap="round" fill="none" />
      </g>
      <g className="cust-box">
        <path d="M30,140 L40,128" stroke={SKIN_2} strokeWidth="8" strokeLinecap="round" />
        <rect x="34" y="112" width="52" height="40" rx="4" fill="#1f4d2b" />
        <path d="M60,124 q8,-6 12,2 q-8,4 -12,-2 Z" fill="#7cb342" />
        <rect x="42" y="138" width="36" height="5" rx="2" fill="#f3ecd9" opacity="0.8" />
      </g>
    </svg>
  );
}

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g className="wheel">
      <circle cx={cx} cy={cy} r={r} fill="#1d1d1d" />
      <circle cx={cx} cy={cy} r={r * 0.48} fill="#9aa3a8" />
      <path d={`M${cx - r * 0.45},${cy} L${cx + r * 0.45},${cy} M${cx},${cy - r * 0.45} L${cx},${cy + r * 0.45}`} stroke="#5b6266" strokeWidth="3" />
    </g>
  );
}

function Crate({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="12" cy="2" r="8" fill="#d8432f" />
      <circle cx="26" cy="0" r="8" fill="#e85d24" />
      <circle cx="40" cy="3" r="8" fill="#d8432f" />
      <rect x="0" y="4" width="52" height="30" fill="#b07a3e" />
      <path d="M0,14 L52,14 M0,24 L52,24" stroke="#8a5a2b" strokeWidth="3" />
    </g>
  );
}

/** GreenMart dispatch rider on a Bajaj-style bike, facing right. `.speed` lines show while riding. */
export function Rider({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="-60 0 280 170" aria-hidden>
      <g className="speed" stroke="#f3ecd9" strokeWidth="4" strokeLinecap="round" opacity="0.9">
        <path d="M-56,70 L4,70" />
        <path d="M-40,92 L8,92" />
        <path d="M-58,114 L0,114" />
        <path d="M-30,136 L10,136" />
      </g>
      <ellipse cx="110" cy="164" rx="100" ry="5" fill="#000" opacity="0.18" />
      <g className="rider-box">
        <rect x="16" y="54" width="58" height="46" rx="5" fill="#1f4d2b" />
        <path d="M45,68 q10,-8 15,3 q-10,5 -15,-3 Z" fill="#7cb342" />
        <text x="45" y="90" fontSize="10" fontWeight="800" fill="#f3ecd9" textAnchor="middle" style={DISPLAY}>GreenMart</text>
      </g>
      <path d="M45,140 L95,112 L150,110 L178,140" stroke="#1d1d1d" strokeWidth="6" fill="none" />
      <rect x="64" y="98" width="46" height="9" rx="4" fill="#1d1d1d" />
      <path d="M104,98 Q128,86 152,96 L150,112 L106,114 Z" fill="#c0392b" />
      <rect x="96" y="114" width="40" height="18" rx="3" fill="#555" />
      <path d="M100,132 L40,134" stroke="#888" strokeWidth="4" />
      <path d="M162,70 L178,140" stroke="#777" strokeWidth="5" />
      <path d="M150,96 L164,70 L172,68" stroke="#1d1d1d" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="170" cy="80" r="6" fill="#ffd27a" />
      <path d="M96,100 L120,120 L116,146" stroke="#2c4a7a" strokeWidth="10" fill="none" strokeLinejoin="round" />
      <rect x="108" y="142" width="18" height="7" rx="3" fill="#1d1d1d" />
      <path d="M90,100 L102,52 L126,52 L122,100 Z" fill="#f0a35e" />
      <path d="M94,80 L124,80" stroke="#f3ecd9" strokeWidth="4" />
      <path d="M120,62 L160,72" stroke={SKIN_2} strokeWidth="7" strokeLinecap="round" />
      <circle cx="116" cy="38" r="12" fill={SKIN_2} />
      <path d="M100,40 Q100,18 118,18 Q136,18 134,40 Z" fill="#1f4d2b" />
      <path d="M124,28 L136,30 L134,40 L122,38 Z" fill="#cfe5ee" />
      <Wheel cx={45} cy={140} r={24} />
      <Wheel cx={178} cy={140} r={24} />
    </svg>
  );
}

/* ---------- Scenes. viewBox 0 0 1440 600, ground at y=600; keep key content near x=720. ---------- */

function Basin({ x, fill }: { x: number; fill: string }) {
  return (
    <g>
      <circle cx={x - 12} cy={472} r="10" fill={fill} />
      <circle cx={x + 6} cy={468} r="11" fill={fill} />
      <circle cx={x + 16} cy={476} r="9" fill={fill} />
      <path d={`M${x - 32},476 L${x + 32},476 L${x + 22},498 L${x - 22},498 Z`} fill="#f4f4f2" />
      <path d={`M${x - 32},476 L${x + 32},476`} stroke="#2c6fb7" strokeWidth="4" />
    </g>
  );
}

function Palm({ x, h }: { x: number; h: number }) {
  return (
    <g>
      <path d={`M${x},600 Q${x + 14},${600 - h / 2} ${x + 6},${600 - h}`} stroke="#7a5230" strokeWidth="12" fill="none" />
      {[-70, -30, 10, 50, 90, 140].map((a) => (
        <path
          key={a}
          d={`M${x + 6},${600 - h} q${Math.cos((a * Math.PI) / 180) * 50},${-30 + Math.abs(a) / 3} ${Math.cos((a * Math.PI) / 180) * 95},${20 + Math.abs(a) / 2}`}
          stroke="#3e7a2e"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export function ShopScene({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {/* electric pole + wires */}
      <path d="M190,600 L190,170 M160,190 L220,190" stroke="#6b5a4a" strokeWidth="8" />
      <path d="M0,200 Q95,230 190,192 Q700,240 1240,190 Q1340,225 1440,205" stroke="#2e2118" strokeWidth="2" fill="none" />
      {/* POS kiosk next door */}
      <path d="M280,330 Q370,280 460,330 Z" fill="#f0c419" />
      <path d="M310,318 Q330,300 350,296 L370,330 Z M390,296 Q412,300 430,318 L410,330 Z" fill="#1f4d2b" />
      <path d="M370,330 L370,600" stroke="#555" strokeWidth="5" />
      <rect x="300" y="470" width="140" height="130" fill="#2c6fb7" />
      <text x="370" y="530" fontSize="40" fontWeight="800" fill="#fff" textAnchor="middle" style={DISPLAY}>POS</text>
      <text x="370" y="560" fontSize="13" fill="#fff" textAnchor="middle">Transfer · Withdrawal · Airtime</text>
      {/* main shop */}
      <rect x="540" y="250" width="390" height="350" fill="#efe3c8" />
      <path d="M520,252 L950,252 L928,212 L542,212 Z" fill="#8e979c" />
      <path d="M560,214 L556,250 M600,214 L598,250 M640,214 L640,250 M680,214 L680,250 M720,214 L720,250 M760,214 L760,250 M800,214 L800,250 M840,214 L842,250 M880,214 L884,250 M920,214 L926,250" stroke="#7b8489" strokeWidth="3" />
      <path d="M700,214 l20,30 M860,216 l10,20" stroke="#a0623a" strokeWidth="4" opacity="0.6" />
      <rect x="558" y="264" width="354" height="74" rx="6" fill="#1f4d2b" />
      <text x="735" y="300" fontSize="25" fontWeight="800" fill="#f3ecd9" textAnchor="middle" style={DISPLAY}>FRESH FARM FOODSTUFF</text>
      <text x="735" y="325" fontSize="14" fill="#7cb342" textAnchor="middle">GreenMart partner store · Rice · Beans · Garri</text>
      <rect x="570" y="360" width="120" height="240" fill="#4a3627" />
      <path d="M580,410 L680,410 M580,460 L680,460 M580,510 L680,510" stroke="#6b4e38" strokeWidth="5" />
      {[590, 612, 634, 656].map((x, i) => (
        <rect key={x} x={x} y={386 + (i % 2) * 4} width="16" height="22" fill={["#d8432f", "#f0c419", "#2c6fb7", "#7cb342"][i]} />
      ))}
      {[590, 618, 646].map((x, i) => (
        <rect key={x} x={x} y={434} width="22" height="24" fill={["#f3ecd9", "#e85d24", "#f3ecd9"][i]} />
      ))}
      <rect x="710" y="360" width="200" height="110" fill="#4a3627" />
      <path d="M710,400 L910,400 M710,435 L910,435" stroke="#6b4e38" strokeWidth="4" />
      {/* store owner behind the table */}
      <g transform="translate(786 366) scale(0.9)">
        <Woman top="#2c6fb7" wrap="#7cb342" gele="#d8432f">
          <path d="M36,86 L22,120 M84,86 L98,120" stroke={SKIN} strokeWidth="8" strokeLinecap="round" />
        </Woman>
      </g>
      {/* table of enamel basins */}
      <rect x="712" y="496" width="230" height="12" fill="#8a5a2b" />
      <path d="M724,508 L724,600 M930,508 L930,600" stroke="#8a5a2b" strokeWidth="8" />
      <Basin x={752} fill="#d8432f" />
      <Basin x={826} fill="#e85d24" />
      <Basin x={900} fill="#d8432f" />
      {/* yam tubers and rice bags */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={980 + (i % 2) * 30} cy={585 - Math.floor(i / 2) * 18} rx="34" ry="10" fill="#7a5230" transform={`rotate(-8 ${980 + (i % 2) * 30} ${585 - Math.floor(i / 2) * 18})`} />
      ))}
      <rect x="1050" y="540" width="56" height="60" rx="8" fill="#f4f4f2" />
      <rect x="1060" y="556" width="36" height="14" fill="#d8432f" />
      <rect x="1064" y="490" width="50" height="54" rx="8" fill="#f4f4f2" />
      <rect x="1072" y="505" width="34" height="12" fill="#2f7a3a" />
      {/* the delivery: crates stacked by the table */}
      <g className="stock">
        <Crate x={600} y={568} />
        <Crate x={640} y={534} />
        <Crate x={660} y={568} />
      </g>
      {/* neighbour */}
      <rect x="1140" y="200" width="300" height="400" fill="#b9d3c9" />
      <rect x="1170" y="240" width="70" height="60" fill="#cfe5ee" />
      <rect x="1290" y="240" width="70" height="60" fill="#cfe5ee" />
      <path d="M1180,240 L1180,300 M1195,240 L1195,300 M1210,240 L1210,300 M1225,240 L1225,300 M1300,240 L1300,300 M1315,240 L1315,300 M1330,240 L1330,300 M1345,240 L1345,300" stroke="#555" strokeWidth="2" />
      <Palm x={1110} h={300} />
    </svg>
  );
}

export function HomeScene({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {/* duplex behind the fence */}
      <path d="M380,170 L720,90 L1060,170 Z" fill="#b5543a" />
      <rect x="420" y="168" width="600" height="240" fill="#f6e7cf" />
      {[470, 620, 760, 910].map((x) => (
        <g key={x}>
          <rect x={x} y="210" width="70" height="70" fill="#cfe5ee" />
          {/* burglar-proof bars */}
          <path d={`M${x + 14},210 L${x + 14},280 M${x + 28},210 L${x + 28},280 M${x + 42},210 L${x + 42},280 M${x + 56},210 L${x + 56},280 M${x},245 L${x + 70},245`} stroke="#333" strokeWidth="3" />
        </g>
      ))}
      {/* water tank on a stand */}
      <path d="M1100,600 L1112,250 M1180,600 L1168,250 M1106,420 L1174,420 M1104,500 L1176,500" stroke="#6b6b6b" strokeWidth="7" />
      <rect x="1094" y="160" width="92" height="94" rx="14" fill="#1d1d1d" />
      <path d="M1094,190 L1186,190 M1094,222 L1186,222" stroke="#333" strokeWidth="4" />
      <Palm x={250} h={340} />
      <Palm x={1260} h={280} />
      {/* fence wall with spikes */}
      <rect x="300" y="380" width="840" height="220" fill="#efe3c8" />
      <rect x="296" y="368" width="848" height="14" fill="#1f4d2b" />
      <path d={Array.from({ length: 42 }, (_, i) => `M${304 + i * 20},368 l6,-14 l6,14`).join(" ")} fill="#333" />
      {/* black gate */}
      <rect x="610" y="360" width="220" height="240" fill="#1d1d1d" />
      <path d={Array.from({ length: 10 }, (_, i) => `M${626 + i * 21},376 L${626 + i * 21},590`).join(" ")} stroke="#3a3a3a" strokeWidth="6" />
      <path d="M720,360 L720,600" stroke="#000" strokeWidth="4" />
      <rect x="532" y="420" width="60" height="34" rx="4" fill="#f4f4f2" />
      <text x="562" y="443" fontSize="16" fontWeight="800" fill="#1f4d2b" textAnchor="middle">No. 14</text>
      <path d="M340,600 q20,-50 50,-40 q10,-30 40,-10 q30,-20 40,20 q20,0 20,30 Z" fill="#4f9a3c" />
    </svg>
  );
}
