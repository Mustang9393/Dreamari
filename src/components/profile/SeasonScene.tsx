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

// The three hand-drawn marks the shipped V1 season art used, before this
// watercolor pass -- kept here as the fallback for any watercolor sprite
// that isn't actually on disk yet. Ported as-is from ProfileExperience.tsx
// (this file used to live there) rather than redrawn, so a missing PNG
// degrades to the exact art that was already reviewed and approved, not a
// broken image icon. `currentColor`-filled, tinted via the `color` prop.
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

// Painted transparent assets preserve watercolor pigment and fine natural
// detail -- native img is deliberate for these tiny, repeated alpha
// sprites. Not every kind has a real exported file yet (watercolor art is
// generated outside this repo and dropped in by hand); an <img> whose file
// 404s fires onError, and this falls back to the equivalent V1 SVG mark
// instead of the browser's own broken-image glyph -- per kind, so a
// partial set of real assets (e.g. only "maple" and "snow" delivered so
// far) upgrades automatically as more arrive, with no further code change.
function SeasonMark({ kind, tint }: { kind: Mark; tint: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    const Fallback = FALLBACK[kind];
    return <Fallback className="block h-full w-full" style={{ color: tint }} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/images/seasons/watercolor/${kind}.png`} width={256} height={256} alt="" draggable={false} decoding="async" onError={() => setBroken(true)} />;
}

// Art-directed resting arrangements: right-weighted, with a quiet lane for
// the count/chevron. Tuple = kind, right offset, top, size, angle, opacity.
type Placement = [Mark, number, number, number, number, number];
const ARRANGEMENTS: Record<Season, Placement[]> = {
  fall: [["maple", 65, 32, 55, -24, .88], ["leaf", 16, 67, 36, 32, .64], ["leaf", 126, 57, 25, -48, .44], ["maple", -17, 80, 33, 20, .35]],
  winter: [["snow", 62, 37, 47, 12, .83], ["snow", 125, 69, 28, -9, .48], ["crystal", 15, 76, 22, 0, .66], ["snow", -14, 100, 30, 22, .36], ["crystal", 105, 108, 14, 20, .3]],
  spring: [["blossom", 68, 37, 51, 18, .88], ["petal", 127, 61, 28, -30, .57], ["petal", 22, 75, 26, 42, .63], ["blossom", -17, 105, 36, -15, .36], ["petal", 106, 108, 19, 65, .32]],
};

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
        {Array.from({ length: seasonId === "winter" ? 14 : 10 }, (_, i) => {
          const [kind, , , size, angle, opacity] = arrangement[i % arrangement.length];
          const depth = i % 3;
          const duration = (seasonId === "winter" ? 11 : 8.5) + depth * 2.1 + i * .31;
          return <span key={i} className="dm-season-drop" style={{
            right: 8 + ((i * 47 + (seasonId === "spring" ? 26 : 0)) % 155),
            width: size * (depth === 2 ? .55 : .85), height: size * (depth === 2 ? .55 : .85),
            "--duration": `${duration}s`, "--phase": `${-duration * ((i * .237 + .11) % 1)}s`,
            "--sway": `${(i % 2 ? -1 : 1) * (seasonId === "winter" ? 9 : 22)}px`,
            "--angle": `${angle}deg`, "--turn": `${seasonId === "winter" ? 35 : i % 2 ? -115 : 135}deg`,
            "--alpha": opacity * (depth === 2 ? .65 : 1),
            // Depth of field, not distortion: the furthest layer (smallest,
            // most transparent already) also blurs, the nearest stays
            // crisp -- reads as depth without touching the art's own shape.
            "--blur": depth === 2 ? "1.6px" : depth === 1 ? "0.6px" : "0px",
          } as CSSProperties}><span className="dm-season-sway"><span className="dm-season-turn"><SeasonMark kind={kind} tint={tint} /></span></span></span>;
        })}
      </div>
    </div>
  </div>;
}
