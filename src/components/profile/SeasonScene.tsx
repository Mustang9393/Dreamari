import { useState, type CSSProperties, type SVGProps } from "react";
import { Snowflake } from "lucide-react";
import "./season-scene.css";

type Season = "fall" | "winter" | "spring";
// Preserve the established two-tone seasonal palette in both consumers.
export const SEASON_STYLE = {
  fall: { tint: "#e2842a", tint2: "#c2410c" },
  winter: { tint: "#3b82f6", tint2: "#6366f1" },
  spring: { tint: "#f472b6", tint2: "#db2777" },
};

type Mark = "maple" | "leaf" | "snow" | "crystal" | "blossom" | "petal";

// Lightweight vector fallback for a failed image request. All six painted
// sprites are bundled; normal rendering never depends on missing assets.
function LeafMarkA(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M12 2C16 6 18 10.5 17 15.5C16.2 19.6 13.4 22 12 22C10.6 22 7.8 19.6 7 15.5C6 10.5 8 6 12 2Z" fill="currentColor" />
      <path d="M12 4.5V20.5" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M12 8.5L8.8 11M12 8.5L15.2 11M12 13L9.2 15.3M12 13L14.8 15.3" stroke="rgba(0,0,0,0.24)" strokeWidth="0.7" strokeLinecap="round" />
    </svg>
  );
}
function LeafMarkB(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path d="M12 3C14.6 4.7 17.6 5.9 18.6 9C19.6 12 18 14 16 14.2C17 16.3 16.6 18.7 14.4 19.6C13.4 20 12.5 19.6 12 19C11.5 19.6 10.6 20 9.6 19.6C7.4 18.7 7 16.3 8 14.2C6 14 4.4 12 5.4 9C6.4 5.9 9.4 4.7 12 3Z" fill="currentColor" />
      <path d="M12 5.5V19" stroke="rgba(0,0,0,0.26)" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}
function SakuraMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="12" cy="6.6" rx="2.5" ry="3.9" fill="currentColor" transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
const FALLBACK: Record<Mark, (props: SVGProps<SVGSVGElement>) => React.ReactNode> = {
  maple: LeafMarkA,
  leaf: LeafMarkB,
  snow: (props) => <Snowflake {...(props as React.SVGProps<SVGSVGElement>)} />,
  crystal: (props) => <Snowflake {...(props as React.SVGProps<SVGSVGElement>)} />,
  blossom: SakuraMark,
  petal: SakuraMark,
};

// Six bundled, alpha-preserving watercolor sprites. Keep the native image
// element for repeated tiny sprites; fallback is only for a network failure.
function SeasonMark({ kind, tint }: { kind: Mark; tint: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    const Fallback = FALLBACK[kind];
    return <Fallback className="block h-full w-full" style={{ color: tint }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/images/seasons/watercolor/${kind}.webp`} width={256} height={256} alt="" draggable={false} decoding="async" onError={() => setBroken(true)} />;
}

// Art-directed resting arrangements: right-weighted, with a quiet lane for
// the count/chevron. Tuple = kind, right offset, top, size, angle, opacity.
type Placement = [Mark, number, number, number, number, number];
const ARRANGEMENTS: Record<Season, Placement[]> = {
  fall: [["maple", 65, 32, 55, -24, .88], ["leaf", 16, 67, 36, 32, .64], ["leaf", 126, 57, 25, -48, .44], ["maple", -17, 80, 33, 20, .35]],
  winter: [["snow", 62, 37, 47, 12, .83], ["snow", 125, 69, 28, -9, .48], ["crystal", 15, 76, 22, 0, .66], ["snow", -14, 100, 30, 22, .36], ["crystal", 105, 108, 14, 20, .3]],
  spring: [["blossom", 68, 37, 51, 18, .88], ["petal", 127, 61, 28, -30, .57], ["petal", 22, 75, 26, 42, .63], ["blossom", -17, 105, 36, -15, .36], ["petal", 106, 108, 19, 65, .32]],
};

// Stable, irregular flight profiles avoid repeated four-mark cycles and
// hydration-time randomness. Widely separated starting phases and alternating
// lanes leave breathing room; each leaf has an independent orientation/gust.
const FALL_FLIGHTS = [
  { mark: 0, right: 58, size: 37, angle: -72, turn: 23, sway: 9, duration: 16.7, phase: .08, gust: 5.9 },
  { mark: 1, right: 151, size: 27, angle: 104, turn: -41, sway: -17, duration: 21.3, phase: .57, gust: 8.3 },
  { mark: 0, right: 101, size: 29, angle: 161, turn: -32, sway: 13, duration: 19.1, phase: .29, gust: 7.1 },
  { mark: 1, right: 176, size: 22, angle: -19, turn: 47, sway: -8, duration: 24.7, phase: .88, gust: 9.7 },
  { mark: 0, right: 77, size: 24, angle: 43, turn: -19, sway: -12, duration: 22.9, phase: .72, gust: 6.7 },
  { mark: 1, right: 130, size: 32, angle: -137, turn: 31, sway: 18, duration: 18.3, phase: .43, gust: 10.1 },
];

export function SeasonScene({ seasonId, className = "", fadeToHeader = false }: { seasonId: Season; className?: string; fadeToHeader?: boolean }) {
  const { tint, tint2 } = SEASON_STYLE[seasonId];
  const arrangement = ARRANGEMENTS[seasonId];
  return <div aria-hidden="true" data-season={seasonId} className={`dm-season-scene ${fadeToHeader ? "dm-season-scene--accordion" : ""} ${className}`} style={{ "--season-tint": tint, "--season-tint2": tint2 } as CSSProperties}>
    <div className="dm-season-wash" />
    <div className="dm-season-art">
      <div className="dm-season-rest">
        {arrangement.map(([kind, right, top, size, angle, opacity], i) => <span key={i} className="dm-season-mark" style={{ right, top, width: size, height: size, opacity, transform: `rotate(${angle}deg)` }}><SeasonMark kind={kind} tint={tint} /></span>)}
      </div>
      <div className="dm-season-flow">
        {Array.from({ length: seasonId === "fall" ? FALL_FLIGHTS.length : seasonId === "winter" ? 10 : 8 }, (_, i) => {
          const flight = seasonId === "fall" ? FALL_FLIGHTS[i] : undefined;
          const [kind, , , size, angle, opacity] = arrangement[flight?.mark ?? i % arrangement.length];
          const depth = i % 3;
          const duration = flight?.duration ?? (seasonId === "winter" ? 14 : 12) + depth * 1.7 + i * .31;
          return <span key={i} className="dm-season-drop" style={{
            right: flight?.right ?? 48 + ((i * 37 + (seasonId === "spring" ? 26 : 0)) % 117),
            width: flight?.size ?? size * (depth === 2 ? .55 : .85), height: flight?.size ?? size * (depth === 2 ? .55 : .85),
            "--duration": `${duration}s`, "--phase": `${-duration * (flight?.phase ?? ((i * .237 + .11) % 1))}s`,
            "--gust-duration": flight ? `${flight.gust}s` : undefined,
            "--sway": `${flight?.sway ?? (i % 2 ? -1 : 1) * (seasonId === "winter" ? 7 : 14)}px`,
            "--angle": `${flight?.angle ?? angle}deg`, "--turn": `${flight?.turn ?? (seasonId === "winter" ? 16 : i % 2 ? -28 : 34)}deg`,
            "--alpha": opacity * (depth === 2 ? .65 : 1),
            // Depth of field, not distortion: the furthest layer (smallest,
            // most transparent already) also blurs, the nearest stays
            // crisp -- reads as depth without touching the art's own shape.
            "--blur": depth === 2 ? "0.45px" : "0px",
          } as CSSProperties}><span className="dm-season-sway"><span className="dm-season-turn"><SeasonMark kind={kind} tint={tint} /></span></span></span>;
        })}
      </div>
    </div>
  </div>;
}
