"use client";

// The Glossary Game's Levels button and level map (Joshua, Slack, 27 Sept
// 2026: "a small Levels button/icon... near the sound controls... three
// ascending bars, similar to a signal-strength icon... make it immediately
// clear that the game goes much deeper than the current beginner terms...
// see the names of the upcoming levels, even if those levels are still
// locked").
//
// How it got here, all 27 Sept 2026, direct feedback each step: a dropdown,
// then a modal ("more graphic"), then no sentences ("DO NOT MAKE THE MODAL
// SO TEXT HEAVY... THINK OF VIDEO GAMES"), then one path instead of three
// side-by-side columns, which read as three equal lists rather than a
// climb. Tiers became chapters of the Dream Sneakers story with the
// difficulty as the signal-bars icon ("chapters instead of difficulty level
// and the difficulty be a signal for the chapters"), labelled Beginner /
// Intermediate / Advanced rather than Chapter 1/2/3 ("instead of chapter
// 1,2,3, say beginner intermediate etc in the modals").
//
// Each Glossary background version has its own layout, not just colours
// ("the pattern, style, everything can differ"): v1 a friendly board-game
// path, v2 CRT a pixel tile grid, v3 dots the constellation (the reference
// Chandu liked most: glowing nodes on a thin line, a hexagon marker on the
// selected node), v4 synthwave neon chapter "episode" cards. The
// constellation started on v1 and dots had a plain transit line; swapped
// because "the dots version deserves the constellation one more... the
// dots seem very basic and normal right now when everything else has a
// different layout".
//
// Shared by all four: a HUD bar (career, LEVELS, a segmented progress bar
// with "1/17"), every level's name with the company value it unlocks, and
// details only on demand: tapping a level fills the HUD card at the bottom
// with its words. It shows the path; it does not start other levels, since
// only level 1 is authored.

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChartNoAxesColumnIncreasing, Lock, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { Portal } from "@/components/profile/CareerReport";
import type { PlayBgVersion } from "@/components/play/PlayVersionChip";
import type { GlossaryCareer, GlossaryChapter, GlossaryLevel } from "./data";
import { glossaryProgressSnapshot, readLesson, serverGlossaryProgressSnapshot, subscribeGlossaryProgress } from "./progress";

type Status = "done" | "current" | "locked";

// ---------------------------------------------------------------- skins ----
// One skin per Glossary background version, built from the colours and
// shapes that version already uses on the game screen, so the map feels
// like part of whichever game the student is in.

type Skin = {
  /** heading / number / label face */
  display: string;
  upper: boolean;
  /** CRT's pixel face runs wide, so its type steps down */
  scale: number;
  panel: CSSProperties;
  radius: number;
  mapBg: CSSProperties;
  overlay: ReactNode;
  ink: string;
  muted: string;
  lit: string;
  done: string;
  future: string;
  dash?: string;
  lineWidth: number;
  node: "orb" | "pixel" | "hex";
  layout: "board" | "stars" | "tiles" | "episodes";
  gate: CSSProperties;
  titleShadow?: string;
};

function skinFor(version: PlayBgVersion, accent: string): Skin {
  if (version === "v2") {
    const magenta = "#ff3daa";
    return {
      display: '"Press Start 2P", "Courier New", monospace', upper: true, scale: 0.72, radius: 0,
      panel: { background: "#050805", border: `2px solid ${magenta}99`, boxShadow: `0 0 0 1px #00e7ff33, 0 30px 80px -20px rgba(0,0,0,0.8), 0 0 40px -10px ${magenta}66` },
      mapBg: { background: "radial-gradient(70% 55% at 18% 12%, rgba(255,0,170,0.14) 0%, transparent 65%), radial-gradient(65% 50% at 85% 88%, rgba(0,231,255,0.12) 0%, transparent 65%), #050805" },
      overlay: <span aria-hidden className="pointer-events-none absolute inset-0 z-[3]" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.35) 51%)", backgroundSize: "100% 4px" }} />,
      ink: "#ffffff", muted: "rgba(255,255,255,0.55)", lit: accent, done: "#00e7ff", future: `${magenta}80`, dash: "3 5", lineWidth: 2,
      node: "pixel", layout: "tiles",
      gate: { background: "#050805", border: `2px solid ${magenta}`, borderRadius: 0, boxShadow: `4px 4px 0 ${magenta}55` },
    };
  }
  if (version === "v3") {
    return {
      display: "var(--font-body)", upper: false, scale: 1, radius: 22,
      panel: { background: "#0b0b0c", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 90px -24px rgba(0,0,0,0.8)" },
      mapBg: { backgroundColor: "#0b0b0c", backgroundImage: `radial-gradient(60% 30% at 20% 18%, color-mix(in srgb, ${accent} 10%, transparent), transparent 70%), radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1.3px)`, backgroundSize: "100% 100%, 18px 18px" },
      overlay: null,
      ink: "#f4f4f5", muted: "rgba(244,244,245,0.5)", lit: accent, done: "#ffffff", future: "rgba(255,255,255,0.24)", lineWidth: 1.2,
      node: "orb", layout: "stars",
      gate: { background: "#0b0b0c", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999 },
    };
  }
  if (version === "v4") {
    const amber = "oklch(0.8 0.17 75)";
    const pink = "#ff4fd8";
    return {
      display: "var(--font-display)", upper: true, scale: 1, radius: 22,
      panel: { background: "linear-gradient(180deg, oklch(0.16 0.07 292) 0%, #0d0a14 55%)", border: `1px solid ${pink}55`, boxShadow: `0 40px 90px -24px rgba(0,0,0,0.8), 0 0 50px -16px ${pink}66` },
      mapBg: { backgroundColor: "transparent", backgroundImage: "repeating-linear-gradient(90deg, oklch(0.78 0.18 75 / 0.09) 0 1px, transparent 1px 48px), repeating-linear-gradient(180deg, oklch(0.78 0.18 75 / 0.09) 0 1px, transparent 1px 48px)" },
      overlay: null,
      ink: "#fff5e6", muted: "rgba(255,245,230,0.55)", lit: amber, done: pink, future: `${pink}66`, dash: "6 6", lineWidth: 2,
      node: "hex", layout: "episodes",
      gate: { background: "#130d24", border: `1px solid ${amber}`, borderRadius: 999, boxShadow: `0 0 14px -2px ${amber}` },
      titleShadow: `0 0 18px ${pink}aa`,
    };
  }
  return {
    display: "var(--font-display)", upper: false, scale: 1, radius: 24,
    panel: { background: "#0d0b1a", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 90px -24px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)" },
    mapBg: { background: "radial-gradient(55% 35% at 15% 12%, rgba(190,60,140,0.22), transparent 70%), radial-gradient(50% 35% at 90% 55%, rgba(90,90,230,0.2), transparent 70%), radial-gradient(1.3px 1.3px at 20% 30%, rgba(255,255,255,0.7), transparent), radial-gradient(1.1px 1.1px at 70% 18%, rgba(255,255,255,0.55), transparent), radial-gradient(1.2px 1.2px at 88% 78%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 35% 85%, rgba(255,255,255,0.5), transparent), #0d0b1a" },
    overlay: null,
    ink: "#ffffff", muted: "rgba(255,255,255,0.55)", lit: accent, done: "#ffffff", future: "rgba(255,255,255,0.22)", lineWidth: 1.5,
    node: "orb", layout: "board",
    gate: { background: "rgba(13,11,26,0.9)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" },
  };
}

/** The button's own icon, drawn so a tier can light 1, 2 or 3 bars. */
function SignalBars({ lit, color, size = 18, square = false }: { lit: number; color: string; size?: number; square?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={2 + i * 5.5} y={12 - i * 4.5} width={3.5} height={4 + i * 4.5} rx={square ? 0 : 1.2} fill={i < lit ? color : "rgba(255,255,255,0.2)"} />
      ))}
    </svg>
  );
}

function Coin({ value, skin, dim }: { value: string; skin: Skin; dim?: boolean }) {
  const gold = "#f5c451";
  return (
    <span className="flex items-center gap-1 font-extrabold tabular-nums" style={{ color: gold, opacity: dim ? 0.6 : 1, fontFamily: skin.display, fontSize: 11.5 * skin.scale }}>
      <span aria-hidden className="flex size-[13px] flex-none items-center justify-center text-[8px] font-black" style={{ borderRadius: skin.node === "pixel" ? 0 : 999, background: skin.node === "pixel" ? gold : `radial-gradient(circle at 35% 30%, #ffe8a3, ${gold} 60%, #b8862a)`, color: "#5a3d0a", boxShadow: skin.node === "pixel" ? "2px 2px 0 #7a5410" : "inset 0 -1px 0 rgba(0,0,0,0.25)", fontFamily: "var(--font-body)" }}>$</span>
      {value}
    </span>
  );
}

const HEX = "polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0% 50%)";

/** One node, drawn in the active skin. `selected` adds the marker ring. */
function Node({ level, status, skin, selected }: { level: GlossaryLevel; status: Status; skin: Skin; selected: boolean }) {
  const reduce = useReducedMotion();
  const size = status === "current" ? 46 : 38;
  const content = status === "done" ? <Check style={{ width: 16, height: 16 }} strokeWidth={3.5} aria-hidden /> : status === "locked" ? <Lock style={{ width: 13, height: 13 }} aria-hidden /> : <span style={{ fontFamily: skin.display, fontSize: 15 * skin.scale }}>{level.number}</span>;
  const color = status === "current" ? skin.lit : status === "done" ? skin.done : skin.future;
  const pulse = status === "current" && !reduce;
  let face: ReactNode;
  if (skin.node === "pixel") {
    face = (
      <span className="flex items-center justify-center font-black" style={{ width: size, height: size, background: status === "locked" ? "#1a1a1a" : color, color: status === "locked" ? "rgba(255,255,255,0.5)" : "#050805", border: `2px solid ${status === "locked" ? "rgba(255,255,255,0.25)" : "#050805"}`, boxShadow: `4px 4px 0 ${status === "locked" ? "rgba(255,61,170,0.35)" : "rgba(0,0,0,0.7)"}` }}>{content}</span>
    );
  } else if (skin.node === "hex") {
    face = (
      <span style={{ filter: status === "locked" ? undefined : `drop-shadow(0 0 8px ${color})` }}>
        <span className="flex items-center justify-center font-black" style={{ width: size * 1.1, height: size, clipPath: HEX, background: status === "locked" ? `linear-gradient(180deg, #2a1d44, #150f26)` : `linear-gradient(180deg, color-mix(in srgb, ${color} 70%, white), ${color})`, color: status === "locked" ? skin.muted : "#1a0f2e" }}>{content}</span>
      </span>
    );
  } else {
    face = (
      <span className="flex items-center justify-center rounded-full font-black" style={{ width: size, height: size, background: status === "locked" ? "radial-gradient(circle at 40% 35%, #2b2640, #15121f)" : `radial-gradient(circle at 38% 32%, #ffffff, ${color} 55%, color-mix(in srgb, ${color} 60%, black))`, color: status === "locked" ? skin.muted : "#1a1030", border: status === "locked" ? "1px solid rgba(255,255,255,0.18)" : "none", boxShadow: status === "locked" ? "none" : `0 0 16px ${color}, 0 0 32px color-mix(in srgb, ${color} 50%, transparent)` }}>{content}</span>
    );
  }
  return (
    <span className="relative flex items-center justify-center" style={{ width: 58, height: 58 }}>
      {pulse && (
        <motion.span
          aria-hidden
          className="absolute"
          style={{ width: size + 10, height: size + 10, border: `2px solid ${skin.lit}`, borderRadius: skin.node === "pixel" ? 0 : skin.node === "hex" ? 0 : 999, clipPath: skin.node === "hex" ? HEX : undefined }}
          animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      {selected && (
        // The favourite reference's marker: a hexagon (a square in CRT)
        // drawn around the node the HUD card is describing.
        <motion.svg aria-hidden className="absolute" width={60} height={60} viewBox="0 0 60 60" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1, rotate: skin.node === "pixel" || reduce ? 0 : 360 }} transition={{ opacity: { duration: 0.2 }, scale: { type: "spring", stiffness: 400, damping: 22 }, rotate: { duration: 16, repeat: Infinity, ease: "linear" } }}>
          {skin.node === "pixel"
            ? <rect x={3} y={3} width={54} height={54} fill="none" stroke={skin.ink} strokeWidth={2} strokeDasharray="6 4" />
            : <polygon points="30,3 53,16.5 53,43.5 30,57 7,43.5 7,16.5" fill="none" stroke={skin.ink} strokeOpacity={0.85} strokeWidth={1.5} strokeDasharray="10 4" />}
        </motion.svg>
      )}
      {face}
    </span>
  );
}

// ------------------------------------------------------------------ map ----

type Row = { level: GlossaryLevel; status: Status };
type Chap = GlossaryChapter & { rows: Row[] };
type MapProps = { chapters: Chap[]; skin: Skin; selected: number; onSelect: (n: number) => void };
const rowLabel = (r: Row) => `Level ${r.level.number}, ${r.level.title}, unlocks ${r.level.unlocks}${r.status === "locked" ? ", locked" : r.status === "done" ? ", completed" : ", playing now"}`;

// ---- v3 dots: the constellation path (Chandu's favourite reference) ----

const ROW = 84;
const GATE = 70;
/** The winding path: node x as a fraction of the map width. */
const WAVE = [0.2, 0.5, 0.8, 0.5];

/** Deterministic twinkle positions (no Math.random: the map re-renders). */
const TWINKLES = Array.from({ length: 22 }, (_, k) => ({ x: (k * 37 + 11) % 100, y: (k * 53 + 7) % 100, d: (k % 7) * 0.6, s: k % 3 === 0 ? 2 : 1.3 }));

function StarMap({ chapters, skin, selected, onSelect }: MapProps) {
  const reduce = useReducedMotion();
  const placed: (Row & { x: number; y: number })[] = [];
  const gates: (Chap & { y: number })[] = [];
  let y = 8;
  let i = 0;
  for (const c of chapters) {
    gates.push({ ...c, y: y + GATE / 2 });
    y += GATE;
    for (const r of c.rows) {
      placed.push({ ...r, x: WAVE[i % WAVE.length], y: y + ROW / 2 });
      y += ROW;
      i += 1;
    }
  }
  const height = y + 12;
  const cur = placed.findIndex((p) => p.status === "current");
  return (
    <div className="relative mx-auto w-full max-w-[480px]" style={{ height }}>
      {/* a sparse field of stars that breathe, behind everything */}
      {!reduce && TWINKLES.map((t, k) => (
        <motion.span key={k} aria-hidden className="absolute rounded-full bg-white" style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.s, height: t.s }} animate={{ opacity: [0.15, 0.8, 0.15] }} transition={{ duration: 3.2, delay: t.d, repeat: Infinity, ease: "easeInOut" }} />
      ))}
      <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {placed.slice(1).map((p, k) => {
          const a = placed[k];
          const litSeg = a.status !== "locked" && p.status !== "locked";
          return <line key={p.level.number} x1={a.x * 100} y1={a.y} x2={p.x * 100} y2={p.y} vectorEffect="non-scaling-stroke" stroke={litSeg ? skin.lit : skin.future} strokeWidth={skin.lineWidth} strokeLinecap="round" style={litSeg ? { filter: `drop-shadow(0 0 3px ${skin.lit})` } : undefined} />;
        })}
        {/* the way forward: light travelling from the current star to the next */}
        {cur >= 0 && cur < placed.length - 1 && !reduce && (
          <motion.line x1={placed[cur].x * 100} y1={placed[cur].y} x2={placed[cur + 1].x * 100} y2={placed[cur + 1].y} vectorEffect="non-scaling-stroke" stroke={skin.lit} strokeWidth={2} strokeLinecap="round" strokeDasharray="6 22" animate={{ strokeDashoffset: [0, -28] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} />
        )}
      </svg>
      {gates.map((g) => (
        <div key={g.number} className="absolute inset-x-2 z-[1] flex -translate-y-1/2 items-center gap-3" style={{ top: g.y }}>
          <span aria-hidden className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.16))" }} />
          <span className="flex items-center gap-2.5 px-4 py-2" style={skin.gate}>
            <SignalBars lit={g.number} color={skin.lit} size={16} />
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: skin.muted }}>{g.tier}</span>
              <span className="text-[13.5px] font-extrabold whitespace-nowrap" style={{ fontFamily: skin.display }}>{g.name}</span>
            </span>
          </span>
          <span aria-hidden className="h-px flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(255,255,255,0.16))" }} />
        </div>
      ))}
      {placed.map((p, k) => {
        const right = p.x <= 0.5;
        const on = selected === p.level.number;
        return (
          <motion.div key={p.level.number} className="group absolute z-[2]" style={{ left: `${p.x * 100}%`, top: p.y }} initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + k * 0.03, type: "spring", stiffness: 380, damping: 24 }}>
            <motion.button type="button" data-level={p.level.number} onClick={() => onSelect(p.level.number)} aria-pressed={on} aria-label={rowLabel(p)} whileHover={reduce ? undefined : { scale: 1.08 }} whileTap={reduce ? undefined : { scale: 0.92 }} className="absolute top-0 left-0 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full">
              <Node level={p.level} status={p.status} skin={skin} selected={on} />
            </motion.button>
            <button type="button" tabIndex={-1} onClick={() => onSelect(p.level.number)} className={`absolute top-0 flex -translate-y-1/2 cursor-pointer flex-col gap-[3px] transition-opacity duration-200 ${right ? "left-[34px] items-start text-left" : "right-[34px] items-end text-right"} ${p.status === "locked" && !on ? "opacity-75 group-hover:opacity-100" : ""}`} style={{ width: p.x === 0.5 ? "min(150px, 38vw)" : "min(170px, 44vw)" }}>
              <span className="text-[12.5px] leading-[1.25] font-bold" style={{ color: on || p.status !== "locked" ? skin.ink : skin.muted, textShadow: "0 1px 10px rgba(0,0,0,0.8)" }}>{p.level.title}</span>
              <Coin value={p.level.unlocks} skin={skin} dim={p.status === "locked" && !on} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---- v2 CRT: a pixel "select level" tile grid ----

function PixelGrid({ chapters, skin, selected, onSelect }: MapProps) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col gap-6 px-5 py-5">
      {chapters.map((c) => (
        <section key={c.number} className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5 border-b-2 pb-2" style={{ borderColor: "#ff3daa66" }}>
            <SignalBars lit={c.number} color={skin.lit} size={16} square />
            <span className="text-[10px] leading-[1.4] uppercase" style={{ fontFamily: skin.display }}>{c.tier} <span style={{ color: skin.muted }}>{c.name}</span></span>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {c.rows.map((r, k) => {
              const on = selected === r.level.number;
              const color = r.status === "current" ? skin.lit : r.status === "done" ? skin.done : "#1a1a1a";
              return (
                <motion.button
                  key={r.level.number}
                  type="button"
                  data-level={r.level.number}
                  onClick={() => onSelect(r.level.number)}
                  aria-pressed={on}
                  aria-label={rowLabel(r)}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + k * 0.03, duration: 0.2, ease: "linear" }}
                  className="flex cursor-pointer flex-col items-center gap-2.5"
                >
                  <span className="relative flex aspect-square w-full items-center justify-center" style={{ background: color, color: r.status === "locked" ? "rgba(255,255,255,0.45)" : "#050805", border: `2px solid ${r.status === "locked" ? "rgba(255,255,255,0.22)" : "#050805"}`, boxShadow: `4px 4px 0 ${r.status === "locked" ? "rgba(255,61,170,0.3)" : "rgba(0,0,0,0.75)"}${r.status === "current" ? `, 0 0 18px ${skin.lit}` : ""}`, outline: on ? `2px dashed ${skin.ink}` : undefined, outlineOffset: 4 }}>
                    {r.status === "locked" ? <Lock style={{ width: 14, height: 14 }} aria-hidden /> : r.status === "done" ? <Check style={{ width: 16, height: 16 }} strokeWidth={3.5} aria-hidden /> : <span style={{ fontFamily: skin.display, fontSize: 14 }}>{r.level.number}</span>}
                  </span>
                  <span className="text-[7.5px] tabular-nums" style={{ fontFamily: skin.display, color: r.status === "locked" ? "#f5c45199" : "#f5c451" }}>{r.level.unlocks}</span>
                </motion.button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---- v1: a friendly board-game path (the shipped default's cosy look) ----
// Big pressable buttons on an S-curve with dotted steps between them, a
// bobbing "Playing" bubble over the current level, and a ribbon banner per
// difficulty: the cosy mobile-game level map, which suits v1's Dreamy-and-
// glass style better than the sci-fi constellation (that went to v3 dots,
// where points joined by lines is literally the backdrop).

const RIBBON = 116;
const STEP = 104;

function BoardPath({ chapters, skin, selected, onSelect }: MapProps) {
  const reduce = useReducedMotion();
  const nodes: (Row & { x: number; y: number })[] = [];
  const ribbons: (Chap & { y: number; open: boolean })[] = [];
  let y = 12;
  let i = 0;
  for (const c of chapters) {
    ribbons.push({ ...c, y, open: c.rows.some((r) => r.status !== "locked") });
    y += RIBBON;
    for (const r of c.rows) {
      nodes.push({ ...r, x: 0.5 + Math.sin(i * 0.9) * 0.26, y: y + STEP / 2 });
      y += STEP;
      i += 1;
    }
  }
  const height = y + 8;
  const edge = (c: string) => `color-mix(in srgb, ${c} 60%, black)`;
  const cur = nodes.findIndex((n) => n.status === "current");
  return (
    <div className="relative mx-auto w-full max-w-[440px]" style={{ height }}>
      <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {nodes.slice(1).map((n, k) => {
          const a = nodes[k];
          if (a.level.tier !== n.level.tier) return null;
          const litSeg = a.status !== "locked" && n.status !== "locked";
          return <line key={n.level.number} x1={a.x * 100} y1={a.y} x2={n.x * 100} y2={n.y} vectorEffect="non-scaling-stroke" stroke={litSeg ? skin.lit : "rgba(255,255,255,0.2)"} strokeWidth={6} strokeDasharray="0 12" strokeLinecap="round" />;
        })}
        {/* the next step: dots marching from the current level to the next */}
        {cur >= 0 && cur < nodes.length - 1 && nodes[cur + 1].level.tier === nodes[cur].level.tier && !reduce && (
          <motion.line x1={nodes[cur].x * 100} y1={nodes[cur].y} x2={nodes[cur + 1].x * 100} y2={nodes[cur + 1].y} vectorEffect="non-scaling-stroke" stroke={skin.lit} strokeWidth={6} strokeDasharray="0 12" strokeLinecap="round" animate={{ strokeDashoffset: [0, -24], opacity: [0.9, 0.5, 0.9] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
        )}
      </svg>
      {ribbons.map((rb) => (
        <div
          key={rb.number}
          className="absolute inset-x-4 z-[1] flex items-center gap-3 overflow-hidden rounded-[18px] px-4"
          style={{ top: rb.y, height: 74, background: rb.open ? `linear-gradient(135deg, ${skin.lit}, color-mix(in srgb, ${skin.lit} 70%, #b0306a))` : "rgba(255,255,255,0.06)", boxShadow: rb.open ? `0 5px 0 ${edge(skin.lit)}` : "0 5px 0 rgba(0,0,0,0.35)", border: rb.open ? "none" : "1px solid rgba(255,255,255,0.1)" }}
        >
          <span className="flex size-10 flex-none items-center justify-center rounded-[12px]" style={{ background: rb.open ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.06)" }}>
            <SignalBars lit={rb.number} color={rb.open ? "#1a1030" : skin.lit} size={20} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase" style={{ color: rb.open ? "rgba(26,16,48,0.7)" : skin.muted }}>{rb.tier}</span>
            <span className="truncate text-[18px] font-black" style={{ fontFamily: skin.display, color: rb.open ? "#1a1030" : skin.ink }}>{rb.name}</span>
          </span>
          {!rb.open && <Lock className="h-4 w-4 flex-none" style={{ color: skin.muted }} aria-label="Locked" />}
          {/* a sheen that sweeps the open banner now and then */}
          {rb.open && !reduce && (
            <motion.span aria-hidden className="pointer-events-none absolute inset-y-0 w-1/3" style={{ background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.4), transparent)" }} initial={{ left: "-40%" }} animate={{ left: "140%" }} transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" }} />
          )}
        </div>
      ))}
      {nodes.map((n, k) => {
        const right = n.x <= 0.5;
        const on = selected === n.level.number;
        const face = n.status === "current" ? skin.lit : n.status === "done" ? "#5ad07a" : "#2b2640";
        const size = n.status === "current" ? 68 : 58;
        return (
          <motion.div key={n.level.number} className="absolute z-[2]" style={{ left: `${n.x * 100}%`, top: n.y }} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + k * 0.03, type: "spring", stiffness: 360, damping: 24 }}>
            {n.status === "current" && (
              <motion.span
                aria-hidden
                className="absolute left-0 z-[3] rounded-[10px] px-2.5 py-1 text-[11px] font-black tracking-[0.08em] whitespace-nowrap uppercase"
                style={{ top: -size / 2 - 36, x: "-50%", background: "#ffffff", color: "#1a1030", boxShadow: "0 3px 0 rgba(0,0,0,0.25)" }}
                animate={reduce ? undefined : { y: [0, -4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                Playing
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent" style={{ borderTopColor: "#ffffff" }} />
              </motion.span>
            )}
            {/* the current level breathes: a soft ring expanding off it */}
            {n.status === "current" && !reduce && (
              <motion.span aria-hidden className="absolute rounded-full" style={{ width: size, height: size, left: -size / 2, top: -size / 2, border: `3px solid ${face}` }} animate={{ scale: [1, 1.45], opacity: [0.6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
            )}
            <motion.button
              type="button"
              data-level={n.level.number}
              onClick={() => onSelect(n.level.number)}
              aria-pressed={on}
              aria-label={rowLabel(n)}
              // Pressable, like a physical game button: lifts on hover and
              // sinks onto its own edge when pressed.
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { y: 4 }}
              transition={{ type: "spring", stiffness: 600, damping: 26 }}
              className="absolute flex cursor-pointer items-center justify-center rounded-full"
              style={{
                width: size,
                height: size,
                left: -size / 2,
                top: -size / 2,
                background: n.status === "locked" ? face : `radial-gradient(circle at 35% 28%, color-mix(in srgb, ${face} 55%, white), ${face} 62%)`,
                boxShadow: `0 6px 0 ${n.status === "locked" ? "#16131f" : edge(face)}${on ? ", 0 0 0 4px rgba(255,255,255,0.9)" : ""}${n.status === "current" ? `, 0 0 26px color-mix(in srgb, ${face} 60%, transparent)` : ""}`,
                color: n.status === "locked" ? "rgba(255,255,255,0.4)" : "#1a1030",
              }}
            >
              {n.status === "locked" ? <Lock style={{ width: 20, height: 20 }} aria-hidden /> : n.status === "done" ? <Check style={{ width: 26, height: 26 }} strokeWidth={3.5} aria-hidden /> : <span className="text-[24px] font-black" style={{ fontFamily: skin.display, textShadow: "0 1px 0 rgba(255,255,255,0.45)" }}>{n.level.number}</span>}
            </motion.button>
            <button type="button" tabIndex={-1} onClick={() => onSelect(n.level.number)} className={`absolute top-0 flex -translate-y-1/2 cursor-pointer flex-col gap-[3px] ${right ? "items-start text-left" : "items-end text-right"}`} style={{ [right ? "left" : "right"]: size / 2 + 12, width: "min(150px, 34vw)" }}>
              <span className="text-[13px] leading-[1.25] font-bold" style={{ color: on || n.status !== "locked" ? skin.ink : skin.muted, textShadow: "0 1px 10px rgba(0,0,0,0.8)" }}>{n.level.title}</span>
              <Coin value={n.level.unlocks} skin={skin} dim={n.status === "locked" && !on} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ---- v4 synthwave: neon chapter "episode" cards ----

function EpisodeCards({ chapters, skin, selected, onSelect }: MapProps) {
  const reduce = useReducedMotion();
  const pink = "#ff4fd8";
  return (
    <div className="dm-scroll flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-5 py-5">
      {chapters.map((c, ci) => {
        const unlocked = c.rows.some((r) => r.status !== "locked");
        return (
          <motion.section
            key={c.number}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + ci * 0.1, type: "spring", stiffness: 260, damping: 24 }}
            className="relative flex min-w-[236px] flex-1 snap-start flex-col overflow-hidden rounded-[18px] border"
            style={{ borderColor: unlocked ? skin.lit : `${pink}66`, background: "linear-gradient(180deg, rgba(40,20,70,0.85) 0%, rgba(13,10,20,0.95) 100%)", boxShadow: unlocked ? `0 0 26px -6px ${skin.lit}` : `0 0 18px -8px ${pink}` }}
          >
            <div className="relative flex flex-col items-center gap-2 px-4 pt-5 pb-4 text-center" style={{ background: `linear-gradient(180deg, ${unlocked ? "oklch(0.8 0.17 75 / 0.22)" : "rgba(255,79,216,0.14)"}, transparent)` }}>
              <SignalBars lit={c.number} color={skin.lit} size={22} />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: skin.muted }}>{c.tier}</span>
              <span className="text-[19px] leading-[1.1] font-black uppercase italic" style={{ fontFamily: skin.display, textShadow: skin.titleShadow }}>{c.name}</span>
              {!unlocked && <span className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border" style={{ borderColor: `${pink}99`, boxShadow: `0 0 12px ${pink}88`, color: pink }}><Lock className="h-3.5 w-3.5" aria-label="Locked chapter" /></span>}
            </div>
            <ol className="flex flex-col gap-1 px-3 pb-4">
              {c.rows.map((r) => {
                const on = selected === r.level.number;
                return (
                  <li key={r.level.number}>
                    <button type="button" data-level={r.level.number} onClick={() => onSelect(r.level.number)} aria-pressed={on} aria-label={rowLabel(r)} className="dm-quiet flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left" style={on ? { background: "rgba(255,79,216,0.14)", boxShadow: `inset 0 0 0 1px ${pink}88` } : undefined}>
                      <span style={{ filter: r.status === "locked" ? undefined : `drop-shadow(0 0 6px ${r.status === "done" ? skin.done : skin.lit})` }}>
                        <span className="flex h-[26px] w-[29px] items-center justify-center text-[11px] font-black" style={{ clipPath: HEX, background: r.status === "locked" ? "#2a1d44" : r.status === "done" ? skin.done : skin.lit, color: r.status === "locked" ? skin.muted : "#1a0f2e" }}>
                          {r.status === "locked" ? <Lock style={{ width: 11, height: 11 }} aria-hidden /> : r.status === "done" ? <Check style={{ width: 12, height: 12 }} strokeWidth={3.5} aria-hidden /> : r.level.number}
                        </span>
                      </span>
                      <span className="line-clamp-2 min-w-0 flex-1 text-[12.5px] leading-[15px] font-semibold" style={{ color: r.status === "locked" ? skin.muted : skin.ink }}>{r.level.title}</span>
                      <Coin value={r.level.unlocks} skin={skin} dim={r.status === "locked"} />
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.section>
        );
      })}
    </div>
  );
}

export function LevelsMenu({ career, currentLesson, accent, bgVersion }: { career: GlossaryCareer; currentLesson: number; accent: string; bgVersion: PlayBgVersion }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number>(currentLesson);
  const reduce = useReducedMotion();
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const store = useSyncExternalStore(subscribeGlossaryProgress, glossaryProgressSnapshot, serverGlossaryProgressSnapshot);

  const close = () => { setOpen(false); buttonRef.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const total = career.levels.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); return; }
      // Arrow keys step through the levels, like a game's level select.
      const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      setSelected((n) => Math.min(total, Math.max(1, n + step)));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, career.levels.length]);
  useEffect(() => {
    if (!open) return;
    document.querySelector(`[data-level="${selected}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [selected, open, reduce]);

  if (career.levels.length === 0) return null;
  const skin = skinFor(bgVersion, accent);
  const status = (level: GlossaryLevel): Status => {
    const lesson = career.lessons.find((l) => l.lessonNumber === level.number);
    if (lesson && readLesson(store, career.careerSlug, lesson.id)?.completed) return "done";
    if (level.number === currentLesson) return "current";
    return "locked";
  };
  const chapters: Chap[] = career.chapters.map((c) => ({ ...c, rows: career.levels.filter((l) => l.tier === c.tier).map((level) => ({ level, status: status(level) })) })).filter((c) => c.rows.length > 0);
  const placed = chapters.flatMap((c) => c.rows);
  const reached = Math.max(currentLesson, ...placed.filter((p) => p.status === "done").map((p) => p.level.number + 1));
  const sel = placed.find((p) => p.level.number === selected) ?? placed[0];
  const mapProps: MapProps = { chapters, skin, selected, onSelect: setSelected };
  const up = (s: string) => (skin.upper ? s.toUpperCase() : s);

  return (
    <>
      <IconTip label="Levels" off={open}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => { setSelected(currentLesson); setOpen(true); }}
          aria-label="Levels"
          aria-haspopup="dialog"
          className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
        >
          <ChartNoAxesColumnIncreasing className="h-[17px] w-[17px]" strokeWidth={2.5} aria-hidden />
        </button>
      </IconTip>
      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <button type="button" aria-label="Close levels" tabIndex={-1} onClick={close} className="absolute inset-0 cursor-default" style={{ background: "rgba(3,5,15,0.7)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={`relative flex h-[min(90dvh,820px)] w-full flex-col overflow-hidden ${skin.node === "hex" ? "max-w-[860px]" : skin.node === "pixel" ? "max-w-[620px]" : "max-w-[560px]"}`}
                style={{ ...skin.panel, borderRadius: skin.radius, color: skin.ink }}
              >
                {skin.overlay}
                {/* ---- HUD bar ---- */}
                <div className="relative z-[2] flex flex-none flex-col gap-3 px-5 pt-5 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-bold tracking-[0.14em] uppercase" style={{ color: skin.muted, fontFamily: skin.scale < 1 ? skin.display : "var(--font-body)", fontSize: 11 * (skin.scale < 1 ? 0.8 : 1) }}>{career.careerTitle}</span>
                      <h2 id={titleId} className="leading-[1] font-black tracking-[0.04em] uppercase" style={{ fontFamily: skin.display, fontSize: 30 * skin.scale, textShadow: skin.titleShadow }}>Levels</h2>
                    </div>
                    <IconTip label="Close">
                      <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="dm-quiet flex size-10 cursor-pointer items-center justify-center border" style={{ borderRadius: skin.node === "pixel" ? 0 : 999, borderColor: "rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.05)", color: skin.ink }}>
                        <X className="h-[18px] w-[18px]" aria-hidden />
                      </button>
                    </IconTip>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-1 gap-[6px]" aria-hidden>
                      {chapters.map((c) => {
                        const tl = c.rows;
                        return (
                          <div key={c.number} className="flex gap-[3px]" style={{ flexGrow: tl.length, flexBasis: 0 }}>
                            {tl.map((p) => (
                              <motion.span
                                key={p.level.number}
                                className="h-[9px] flex-1"
                                initial={reduce ? false : { opacity: 0, scaleY: 0.2 }}
                                animate={{ opacity: 1, scaleY: 1 }}
                                transition={{ delay: 0.12 + (p.level.number - 1) * 0.025, duration: 0.3 }}
                                style={{ borderRadius: skin.node === "pixel" ? 0 : 3, background: p.status === "done" ? skin.done : p.status === "current" ? skin.lit : "rgba(255,255,255,0.13)", boxShadow: p.status === "current" ? `0 0 12px ${skin.lit}` : undefined }}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    <span className="flex-none font-black tabular-nums" style={{ fontFamily: skin.display, fontSize: 15 * skin.scale }} aria-label={`Level ${reached} of ${career.levels.length}`}>
                      {reached}<span style={{ color: skin.muted }}>/{career.levels.length}</span>
                    </span>
                  </div>
                </div>

                {/* ---- the map: a different pattern per background version ---- */}
                <div className="dm-scroll relative z-[1] min-h-0 flex-1 overflow-y-auto" style={skin.mapBg}>
                  {skin.layout === "board" ? <BoardPath {...mapProps} /> : skin.layout === "stars" ? <StarMap {...mapProps} /> : skin.layout === "tiles" ? <PixelGrid {...mapProps} /> : <EpisodeCards {...mapProps} />}
                </div>

                {/* ---- HUD card: the selected level, details on demand ---- */}
                {sel && (
                  <div className="relative z-[2] flex-none overflow-hidden border-t px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.25)" }} aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={sel.level.number} className="flex items-start gap-3" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }} transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}>
                      <span className="flex size-10 flex-none items-center justify-center font-black" style={{ clipPath: skin.node === "pixel" ? undefined : HEX, width: 44, background: sel.status === "locked" ? "rgba(255,255,255,0.1)" : sel.status === "done" ? skin.done : skin.lit, color: sel.status === "locked" ? skin.muted : "#12091f", fontFamily: skin.display, fontSize: 15 * skin.scale }}>
                        {sel.level.number}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate font-extrabold" style={{ fontFamily: skin.display, fontSize: 15 * skin.scale }}>{up(sel.level.title)}</p>
                          <span className="flex flex-none items-center gap-1 font-bold uppercase" style={{ fontSize: 10.5 * (skin.scale < 1 ? 0.8 : 1), fontFamily: skin.scale < 1 ? skin.display : "var(--font-body)", letterSpacing: "0.08em", color: sel.status === "current" ? skin.lit : skin.muted }}>
                            {sel.status === "locked" ? <><Lock className="h-3 w-3" aria-hidden /> Locked</> : sel.status === "done" ? <><Check className="h-3 w-3" aria-hidden /> Done</> : "Playing"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sel.level.words.map((w) => (
                            <span key={w} className="px-2 py-[2px] font-semibold" style={{ borderRadius: skin.node === "pixel" ? 0 : 999, border: "1px solid rgba(255,255,255,0.16)", fontSize: 11 * (skin.scale < 1 ? 0.8 : 1), fontFamily: skin.scale < 1 ? skin.display : "var(--font-body)" }}>{w}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
