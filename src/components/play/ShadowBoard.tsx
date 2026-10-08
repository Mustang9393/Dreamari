"use client";

// The toolbox's shadow foam (6 Oct 2026). Every hangar drawer is lined with
// dense foam cut to each tool's outline over a bright layer, so a missing
// tool shows as a bright tool-shaped hole; "account for tools" before
// closing up is a required step, because a wrench left inside a wing is how
// aircraft are lost. Chandu: "make sure the slots fit the tools and the
// tools are realistic", then "it doesn't really react or anything so I
// don't understand the interactivity of it".
//
// So the student DOES the count. Tap each tool and it is checked in (a
// stamp, a click, the count climbs). The one slot that is a bright hole
// cannot be checked: tapping it says where the tool is, and it comes back
// from the aircraft into its cut-out with a clank. Twelve of twelve, the
// chip turns green and `onDone` fires, which is what lets the card move on.
//
// The fit is guaranteed by construction: a slot IS the tool's own outline,
// drawn once as the hole (bright layer, shadowed edge, a finger notch) and
// once as the tool (steel and rubber) a hair inside it.
//
// A world-UI instrument (see WorldUi.tsx and docs/handoff/specs/world-ui.md):
// `tools` names the drawer's set, `missing` which are out. Any trade with a
// toolbox reuses it with its own list.

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { playCorrect, playSelect, playTorqueClick } from "./sound";
import { Device } from "./WorldUi";

import { AMT_TOOLS } from "./amtTools";
export { AMT_TOOLS };

const STEEL = "url(#sb-steel)";
const DARK = "url(#sb-dark)";
const RUBBER = "url(#sb-rubber)";
const RED = "url(#sb-red)";
const BRIGHT = "#ff8a1f";
const GOOD = "#3df58a";

/** Each tool, drawn at the origin pointing right, as a list of primitives.
 *  Drawn twice: as the hole (every primitive, 1.5 units larger) and as the
 *  tool (each primitive in its own material). */
type Prim = { el: React.ReactNode; hole: React.ReactNode };
const rect = (x: number, y: number, w: number, h: number, r: number, fill: string): Prim => ({
  el: <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />,
  hole: <rect x={x - 1.5} y={y - 1.5} width={w + 3} height={h + 3} rx={r + 1.5} />,
});
const circ = (cx: number, cy: number, r: number, fill: string): Prim => ({
  el: <circle cx={cx} cy={cy} r={r} fill={fill} />,
  hole: <circle cx={cx} cy={cy} r={r + 1.5} />,
});
const poly = (pts: string, fill: string): Prim => ({
  el: <polygon points={pts} fill={fill} />,
  hole: <polygon points={pts} stroke="inherit" strokeWidth="3" strokeLinejoin="round" />,
});
const path = (d: string, fill: string): Prim => ({
  el: <path d={d} fill={fill} />,
  hole: <path d={d} stroke="inherit" strokeWidth="3" strokeLinejoin="round" />,
});
/** A thin highlight line along a steel part, for the tool face only. */
const shine = (x: number, y: number, w: number): Prim => ({
  el: <rect x={x} y={y} width={w} height="1.6" rx="0.8" fill="rgba(255,255,255,0.55)" />,
  hole: null,
});

/** Tool drawings keyed by name. Sizes in viewBox units (640 wide board). */
const TOOLS: Record<string, { w: number; h: number; prims: Prim[] }> = {
  "Torque wrench": {
    w: 254, h: 34,
    prims: [
      circ(17, 17, 17, STEEL), circ(17, 17, 5, DARK),
      rect(32, 11, 118, 12, 5, STEEL), shine(40, 13, 100),
      rect(150, 8, 18, 18, 3, DARK),
      rect(168, 5, 80, 24, 10, RUBBER), shine(176, 9, 62),
      rect(246, 7, 8, 20, 3, DARK),
    ],
  },
  Flashlight: {
    w: 100, h: 22,
    prims: [rect(0, 2, 20, 18, 5, DARK), rect(18, 5, 74, 12, 5, DARK), shine(24, 7, 60), rect(90, 3, 10, 16, 4, DARK)],
  },
  "Inspection mirror": {
    w: 110, h: 34,
    prims: [circ(17, 17, 17, STEEL), circ(17, 17, 13, "url(#sb-glass)"), rect(32, 14, 14, 6, 2, STEEL), rect(44, 13, 36, 8, 3, STEEL), shine(46, 14.5, 30), rect(78, 11, 32, 12, 5, RUBBER)],
  },
  "Combination wrench": {
    w: 176, h: 36,
    prims: [
      path("M18 2 C8 2 0 10 0 20 C0 30 8 36 18 36 L30 36 L30 26 L14 26 C12 26 12 14 14 14 L30 14 L30 2 Z", STEEL),
      rect(28, 13, 118, 10, 4, STEEL), shine(34, 15, 104),
      circ(160, 18, 16, STEEL), circ(160, 18, 7, DARK),
    ],
  },
  Ratchet: {
    w: 160, h: 28,
    prims: [circ(14, 14, 14, STEEL), rect(9, 9, 10, 10, 1.5, DARK), rect(26, 9, 60, 10, 4, STEEL), shine(30, 11, 50), rect(84, 6, 60, 16, 7, RUBBER), rect(142, 8, 18, 12, 4, STEEL)],
  },
  Sockets: {
    w: 78, h: 28,
    prims: [circ(12, 14, 12, STEEL), circ(12, 14, 5, DARK), circ(38, 14, 11, STEEL), circ(38, 14, 4.5, DARK), circ(64, 14, 10, STEEL), circ(64, 14, 4, DARK)],
  },
  "Flat screwdriver": {
    w: 136, h: 20,
    prims: [rect(0, 1, 62, 18, 7, RUBBER), shine(8, 4, 44), rect(60, 8, 68, 4, 1.5, STEEL), rect(126, 6, 10, 8, 1, STEEL)],
  },
  "Phillips screwdriver": {
    w: 130, h: 20,
    prims: [rect(0, 1, 58, 18, 7, RED), shine(8, 4, 40), rect(56, 8, 66, 4, 1.5, STEEL), poly("120,7 130,10 120,13", STEEL)],
  },
  "Needle-nose pliers": {
    w: 130, h: 30,
    prims: [
      poly("0,13 46,10 46,15 2,16", STEEL), poly("0,17 46,15 46,20 2,14", STEEL),
      circ(50, 15, 8, STEEL),
      path("M54 9 C80 2 118 0 128 4 C132 7 128 11 120 11 L58 14 Z", RUBBER),
      path("M54 21 C80 28 118 30 128 26 C132 23 128 19 120 19 L58 16 Z", RED),
    ],
  },
  "Safety-wire pliers": {
    w: 170, h: 34,
    prims: [
      poly("0,15 40,12 40,18 2,19", STEEL), poly("0,19 40,18 40,22 2,15", STEEL),
      circ(44, 17, 9, STEEL),
      path("M50 11 C76 4 108 2 118 6 C122 9 118 13 110 13 L54 16 Z", STEEL),
      path("M50 23 C76 30 108 32 118 28 C122 25 118 21 110 21 L54 18 Z", STEEL),
      rect(116, 15, 40, 4, 1.5, STEEL), circ(160, 17, 7, DARK),
    ],
  },
  "Diagonal cutters": {
    w: 120, h: 32,
    prims: [
      path("M0 10 C10 4 24 6 32 12 L32 20 L14 18 Z", STEEL), path("M0 22 C10 28 24 26 32 20 L32 12 L14 14 Z", STEEL),
      circ(36, 16, 8, STEEL),
      path("M40 10 C70 2 110 0 118 5 C122 8 118 12 110 12 L44 15 Z", RED),
      path("M40 22 C70 30 110 32 118 27 C122 24 118 20 110 20 L44 17 Z", RED),
    ],
  },
  "Feeler gauge": {
    w: 90, h: 30,
    prims: [
      rect(0, 9, 38, 12, 4, STEEL), circ(8, 15, 2.5, DARK),
      poly("34,13 88,2 90,6 38,17", STEEL), poly("34,15 88,12 90,16 38,19", STEEL), poly("34,17 88,24 90,28 38,21", STEEL),
    ],
  },
};

/** Where each tool sits on the 640 x 180 board (top-left of its box). */
const LAYOUT: Record<string, { x: number; y: number }> = {
  "Torque wrench": { x: 18, y: 12 },
  "Inspection mirror": { x: 290, y: 12 },
  Flashlight: { x: 416, y: 18 },
  "Feeler gauge": { x: 532, y: 14 },
  "Combination wrench": { x: 18, y: 66 },
  Ratchet: { x: 214, y: 70 },
  Sockets: { x: 392, y: 70 },
  "Flat screwdriver": { x: 486, y: 74 },
  "Phillips screwdriver": { x: 18, y: 128 },
  "Needle-nose pliers": { x: 164, y: 123 },
  "Safety-wire pliers": { x: 310, y: 121 },
  "Diagonal cutters": { x: 494, y: 122 },
};

function ToolShape({ name, as }: { name: string; as: "hole" | "tool" }) {
  const def = TOOLS[name] ?? { w: 80, h: 20, prims: [rect(0, 0, 80, 20, 6, STEEL)] };
  return <>{def.prims.map((p, i) => <g key={i}>{as === "hole" ? p.hole : p.el}</g>)}</>;
}

export function ShadowBoard({
  tools = AMT_TOOLS,
  missing = [],
  returned = false,
  interactive = false,
  title = "Drawer 2",
  accent,
  onDone,
}: {
  tools?: string[];
  missing?: string[];
  /** Non-interactive use (a rank's side panel): true puts the missing tools back. */
  returned?: boolean;
  /** The student taps each tool to count it; the missing one comes back
   *  when its empty slot is tapped. `onDone` fires at a full count. */
  interactive?: boolean;
  title?: string;
  accent: string;
  onDone?: () => void;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [back, setBack] = useState<Set<string>>(new Set(returned ? missing : []));
  const [asked, setAsked] = useState<string | null>(null);
  // The tool the keyboard is on, for a drawn focus ring: an SVG group has
  // no reliable browser outline (Chrome draws one, others do not), so the
  // ring is part of the drawing. Keyboard focus only (9 Oct 2026).
  const [focused, setFocused] = useState<string | null>(null);
  const total = tools.length;
  const out = missing.filter((m) => !back.has(m));
  const counted = interactive ? checked.size : total - out.length;
  const complete = interactive ? counted === total : out.length === 0;
  const doneFired = useRef(false);
  useEffect(() => {
    if (!interactive && returned && back.size !== missing.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors the prop into the one place the drawing reads
      setBack(new Set(missing));
      playTorqueClick();
    }
  }, [returned, interactive, missing, back.size]);
  useEffect(() => {
    if (complete && !doneFired.current) {
      doneFired.current = true;
      if (interactive) playCorrect();
      onDone?.();
    }
  }, [complete, interactive, onDone]);

  const tap = (name: string) => {
    if (!interactive) return;
    if (out.includes(name)) {
      // The empty slot: say where it is, then it comes home.
      if (asked === name) return;
      playSelect();
      setAsked(name);
      window.setTimeout(() => {
        setBack((prev) => new Set(prev).add(name));
        setChecked((prev) => new Set(prev).add(name));
        setAsked(null);
        playTorqueClick();
      }, 1100);
      return;
    }
    if (checked.has(name)) return;
    playSelect();
    setChecked((prev) => new Set(prev).add(name));
  };

  return (
    <Device
      label={out.length ? `Tool drawer: ${counted} of ${total} counted, ${out.join(", ")} missing` : `Tool drawer: all ${total} tools accounted for`}
      left={<><span aria-hidden className="h-[7px] w-[7px] flex-none rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} /><span className="truncate">{title} · Tool count</span></>}
      right={
        complete ? (
          <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 18 }} className="inline-flex h-[20px] items-center gap-[4px] rounded-[5px] px-[7px] text-[9.5px] leading-none font-extrabold tracking-[0.12em] uppercase" style={{ background: GOOD, color: "#05070f" }}>
            <Check className="h-[10px] w-[10px]" strokeWidth={3} aria-hidden /> {total} / {total} · All accounted for
          </motion.span>
        ) : (
          <span className="inline-flex h-[20px] items-center gap-[6px] rounded-[5px] px-[7px] text-[9.5px] leading-none font-extrabold tracking-[0.12em] uppercase" style={{ background: "rgba(255,255,255,0.08)", color: "#fff", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{counted} / {total}</span>
            {out.length > 0 && <motion.span style={{ color: BRIGHT }} animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.9, repeat: Infinity }}>· {out.length} missing</motion.span>}
          </span>
        )
      }
    >
      <div className="relative">
        <svg viewBox="0 0 640 180" className="block h-auto w-full" aria-hidden={!interactive}>
          <defs>
            <linearGradient id="sb-steel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#eef1f5" /><stop offset="0.45" stopColor="#b5bcc6" /><stop offset="0.55" stopColor="#7a828e" /><stop offset="1" stopColor="#c9cfd7" />
            </linearGradient>
            <linearGradient id="sb-dark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4a4f57" /><stop offset="0.5" stopColor="#1f2227" /><stop offset="1" stopColor="#3a3f47" />
            </linearGradient>
            <linearGradient id="sb-rubber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffb84d" /><stop offset="0.5" stopColor="#f08a12" /><stop offset="1" stopColor="#a85a08" />
            </linearGradient>
            <linearGradient id="sb-red" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e2655a" /><stop offset="0.5" stopColor="#b8362b" /><stop offset="1" stopColor="#7a1f17" />
            </linearGradient>
            <radialGradient id="sb-glass" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#dbe9f7" /><stop offset="1" stopColor="#6f8aa8" />
            </radialGradient>
            <linearGradient id="sb-foamtop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#34383e" /><stop offset="1" stopColor="#26292e" />
            </linearGradient>
            <pattern id="sb-foam" width="5" height="5" patternUnits="userSpaceOnUse">
              <rect width="5" height="5" fill="transparent" />
              <circle cx="1.2" cy="1.2" r="0.7" fill="rgba(0,0,0,0.38)" />
              <circle cx="3.6" cy="3.4" r="0.5" fill="rgba(255,255,255,0.05)" />
            </pattern>
            <filter id="sb-inset" x="-10%" y="-10%" width="120%" height="130%">
              <feOffset dx="0" dy="2.2" />
              <feGaussianBlur stdDeviation="1.8" result="b" />
              <feComposite in="SourceGraphic" in2="b" operator="arithmetic" k2="-1" k3="1" result="inset" />
              <feFlood floodColor="rgba(0,0,0,0.8)" />
              <feComposite in2="inset" operator="in" />
              <feComposite in2="SourceGraphic" operator="over" />
            </filter>
            <filter id="sb-glow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
          {/* the drawer: steel rim, the foam, its texture, the edge light */}
          <rect x="0" y="0" width="640" height="180" rx="10" fill="#101216" />
          <rect x="0" y="0" width="640" height="180" rx="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <rect x="6" y="6" width="628" height="168" rx="7" fill="url(#sb-foamtop)" />
          <rect x="6" y="6" width="628" height="168" rx="7" fill="url(#sb-foam)" />
          <rect x="6" y="6" width="628" height="168" rx="7" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" />
          <rect x="7" y="7" width="626" height="1" fill="rgba(255,255,255,0.07)" />
          {tools.map((name) => {
            const at = LAYOUT[name] ?? { x: 20, y: 20 };
            const isOut = out.includes(name);
            const isChecked = checked.has(name);
            const def = TOOLS[name] ?? { w: 80, h: 20 };
            const asking = asked === name;
            return (
              <g
                key={name}
                transform={`translate(${at.x} ${at.y})`}
                onClick={() => tap(name)}
                style={{ cursor: interactive && !isChecked ? "pointer" : "default", outline: "none" }}
                role={interactive ? "button" : undefined}
                aria-label={interactive ? (isOut ? `${name}, missing` : isChecked ? `${name}, counted` : `Count ${name}`) : undefined}
                // Stays in the tab order once counted (aria-disabled, not
                // removed): dropping tabindex on the focused tool threw
                // focus back to the page and the next Tab started over.
                tabIndex={interactive ? 0 : undefined}
                aria-disabled={interactive && isChecked && !isOut ? true : undefined}
                // stopPropagation: the dialogue box under this card listens on
                // window for Enter and Space to press the card's button, and
                // a focused SVG group is not a <button> it knows to skip, so
                // counting a tool used to skip the whole card.
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); tap(name); } }}
                onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setFocused(name); }}
                onBlur={() => setFocused((current) => (current === name ? null : current))}
              >
                {focused === name && <rect x={-6} y={-6} width={def.w + 12} height={def.h + 22} rx={6} fill="none" stroke="#fff" strokeWidth={2} />}
                {/* the bright glow under an empty slot */}
                {isOut && <g fill={BRIGHT} opacity="0.55" filter="url(#sb-glow)"><ToolShape name={name} as="hole" /></g>}
                {/* the cut-out: the layer under the foam, shadowed at its edge */}
                <g fill={isOut ? BRIGHT : "#0f1114"} stroke={isOut ? BRIGHT : "#0f1114"} filter="url(#sb-inset)" style={{ transition: "fill 0.4s, stroke 0.4s" }}>
                  <ToolShape name={name} as="hole" />
                </g>
                {/* the finger notch cut into the foam under each slot */}
                <ellipse cx={def.w / 2} cy={def.h / 2 + 3} rx="9" ry="5" fill={isOut ? "#c96a12" : "#0b0d10"} opacity="0.9" />
                {isOut && (
                  <motion.g fill="none" stroke="#fff" strokeWidth="1.2" animate={{ opacity: [0.85, 0.25, 0.85] }} transition={{ duration: 1.1, repeat: Infinity }}>
                    <ToolShape name={name} as="hole" />
                  </motion.g>
                )}
                {!isOut && (
                  <motion.g
                    initial={missing.includes(name) ? { y: -70, opacity: 0, rotate: -5 } : false}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  >
                    <ToolShape name={name} as="tool" />
                  </motion.g>
                )}
                {/* checked in: a green stamp over the slot */}
                {isChecked && !isOut && (
                  <motion.g initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 18 }} style={{ transformOrigin: `${def.w - 10}px ${def.h / 2}px` }}>
                    <circle cx={def.w - 10} cy={def.h / 2} r="9" fill={GOOD} />
                    <path d={`M${def.w - 14.5} ${def.h / 2} l3 3 l6 -6.5`} fill="none" stroke="#05070f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.g>
                )}
                {/* the stencilled name under the slot */}
                <text x={def.w / 2} y={def.h + 11} textAnchor="middle" fill={isOut ? BRIGHT : isChecked ? GOOD : "rgba(255,255,255,0.34)"} style={{ fontSize: 6.5, fontWeight: 800, letterSpacing: "0.16em", fontFamily: "var(--font-display)", transition: "fill 0.3s" }}>
                  {name.toUpperCase()}
                </text>
                {asking && (
                  <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <rect x={def.w / 2 - 62} y={def.h + 15} width="124" height="18" rx="4" fill="#fff" />
                    <text x={def.w / 2} y={def.h + 27} textAnchor="middle" fill="#05070f" style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.1em", fontFamily: "var(--font-display)" }}>NOT HERE · STILL ON THE AIRCRAFT</text>
                  </motion.g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {interactive && (
        <p className="m-0 text-[12px] font-bold" style={{ color: complete ? GOOD : "rgba(255,255,255,0.6)" }} aria-live="polite">
          {complete ? "Every tool is back. The panel can close." : out.length && counted === total - out.length ? "One slot is empty. Tap it." : "Tap each tool to count it in."}
        </p>
      )}
    </Device>
  );
}
