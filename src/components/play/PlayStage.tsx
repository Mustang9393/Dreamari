"use client";

// Play v2's desktop "game select" stage (8 Oct 2026). Chandu: "play cards
// growing was a known issue, Joshua wanted us to do a TV style interaction
// on desktop. I agree it doesn't work... do something more exciting? maybe
// a carousel style?" The TV rows grew a card under the mouse, so the thing
// you meant to click slid away (Zack Akil's first note on the review call:
// fine on a remote, an anti-pattern for a mouse). This keeps the cinematic
// focus Joshua wanted and moves it to deliberate turns, the way a console's
// game select works (PS5, Switch):
// - the chosen game sits big in the centre, the rest angle away behind it;
// - it turns only on a click, a swipe/drag, the arrow keys, the arrows or a
//   sideways trackpad scroll; hovering never moves anything;
// - the whole stage takes on the focused game's world: its art fills the
//   background and crossfades on every turn;
// - a panel beside it says what you are about to play, with Play and the
//   trailer, so starting a game is a separate, clear action;
// - a soft tick and a glow on each turn; no auto-rotate, the student is
//   choosing. Coming-soon games sit in the ring dimmed, with a lock.
// Phones and tablets keep the card deck and rail (PlayHub's FeaturedRow).

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Film, Lock, Play, Zap } from "lucide-react";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { careerButtonInk } from "@/components/actions-lab/CareerHeaderActions";
import { SparkBar } from "@/components/flow/SparkBar";
import { progressSnapshot, readRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import { playSelect } from "./sound";
import type { Simulation } from "./types";

type SoonCareer = { careerId: string; title: string; world: string; cover: string };
export type StageCandidate = { kind: "sim"; id: string; sim: Simulation } | { kind: "soon"; id: string; soon: SoonCareer };

const CARD_W = 300;
const CARD_H = 420;
// where each card sits by its distance from the centre: x offset (px), turn
// (deg), scale, opacity. Past the third slot cards wait out of sight.
const SLOTS = [
  { x: 0, rot: 0, scale: 1, op: 1 },
  { x: 205, rot: -34, scale: 0.8, op: 0.9 },
  { x: 330, rot: -44, scale: 0.62, op: 0.5 },
  { x: 410, rot: -50, scale: 0.5, op: 0 },
];
const SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;
// the art's fade: in from the top and bottom, and strongest behind the ring
const STAGE_MASK = "linear-gradient(180deg, transparent 0%, #000 22%, #000 70%, transparent 100%), linear-gradient(90deg, rgba(0,0,0,.5) 0%, #000 45%, #000 88%, transparent 100%)";

const info = (c: StageCandidate) =>
  c.kind === "sim" ? { title: c.sim.title, world: c.sim.world, cover: c.sim.cover } : { title: c.soon.title, world: c.soon.world, cover: c.soon.cover };

export function PlayStage({ candidates, focusId, onTrailer }: { candidates: StageCandidate[]; focusId?: string; onTrailer: (sim: Simulation) => void }) {
  const n = candidates.length;
  const reduced = useReducedMotion();
  const [active, setActive] = useState(() => Math.max(0, candidates.findIndex((c) => c.id === focusId)));
  const stage = useRef<HTMLDivElement>(null);
  const turn = useCallback((to: number) => {
    setActive((cur) => {
      const next = ((to % n) + n) % n;
      if (next !== cur) playSelect();
      return next;
    });
  }, [n]);
  const step = useCallback((d: number) => setActive((cur) => {
    const next = (((cur + d) % n) + n) % n;
    if (next !== cur) playSelect();
    return next;
  }), [n]);

  // the shortest way round the ring, so the first game sits beside the last
  const offset = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  // arrow keys while the stage is on screen and nothing is being typed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      const r = stage.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > window.innerHeight) return;
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  // a sideways trackpad scroll turns it; an up/down scroll still scrolls the page
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let acc = 0;
    let quiet = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      if (quiet) return;
      acc += e.deltaX;
      if (Math.abs(acc) > 60) {
        step(acc > 0 ? 1 : -1);
        acc = 0;
        quiet = window.setTimeout(() => { quiet = 0; }, 380);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [step]);

  // drag or swipe across the stage turns it; a drag never counts as a click
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, moved: false }; };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.x) > 70) {
      step(e.clientX < d.x ? 1 : -1);
      drag.current = { x: e.clientX, moved: true };
    }
  };
  const onPointerUp = () => { window.setTimeout(() => { drag.current = null; }, 0); };
  const dragged = () => drag.current?.moved === true;

  const current = candidates[active];
  if (!current) return null;
  const now = info(current);
  const accent = WORLD_COLORS[now.world] ?? "var(--primary)";

  return (
    <div
      className="relative isolate overflow-hidden lg:mx-[calc(50%-50vw/var(--vz,1))]"
      style={{ height: "clamp(520px, calc(66dvh / var(--vz, 1)), 660px)" }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Career simulations"
    >
      {/* The room takes on the focused game: its art, darkened, fills the
         stage and crossfades on every turn. One image layer at a time, no
         blur filter, so it stays smooth on a Chromebook. */}
      <AnimatePresence initial={false}>
        <motion.div key={current.id} aria-hidden className="absolute inset-0 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.6, ease: "easeOut" }}>
          {/* faded out at every edge with a mask, not painted over in the
             page colour, so it melts into the backdrop with no visible
             band where it starts or ends */}
          <span className="absolute inset-0" style={{ WebkitMaskImage: STAGE_MASK, maskImage: STAGE_MASK, WebkitMaskComposite: "source-in", maskComposite: "intersect" }}>
            <Image src={now.cover} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: "50% 30%", transform: "scale(1.06)", opacity: 0.55 }} />
            <span className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(3,6,16,.78) 0%, rgba(3,6,16,.55) 38%, rgba(3,6,16,.15) 70%, rgba(3,6,16,.4) 100%)" }} />
            <span className="absolute inset-0" style={{ background: `radial-gradient(55% 65% at 70% 50%, color-mix(in srgb, ${accent} 24%, transparent), transparent 70%)` }} />
          </span>
        </motion.div>
      </AnimatePresence>

      <div className="mx-auto grid h-full w-full max-w-[1440px] grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-[var(--space-6)] px-[var(--space-14)]">
        <StagePanel candidate={current} onTrailer={onTrailer} />

        {/* the ring */}
        <div
          ref={stage}
          className="relative h-full touch-pan-y select-none"
          style={{ perspective: 1400 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {candidates.map((c, i) => {
            const d = offset(i);
            const slot = SLOTS[Math.min(Math.abs(d), SLOTS.length - 1)];
            const sign = Math.sign(d);
            const centre = d === 0;
            const card = info(c);
            return (
              <motion.div
                key={c.id}
                className="absolute top-1/2 left-1/2"
                style={{ width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2, zIndex: 10 - Math.abs(d), transformStyle: "preserve-3d", pointerEvents: slot.op === 0 ? "none" : "auto" }}
                initial={false}
                animate={{ x: sign * slot.x, rotateY: reduced ? 0 : sign * slot.rot, scale: slot.scale, opacity: slot.op }}
                transition={reduced ? { duration: 0 } : SPRING}
              >
                <StageCard
                  candidate={c}
                  title={card.title}
                  world={card.world}
                  cover={card.cover}
                  centre={centre}
                  pulseKey={centre ? active : -1}
                  onPick={() => { if (!dragged()) turn(i); }}
                  blocked={dragged}
                />
              </motion.div>
            );
          })}

          {n > 1 && (
            <>
              <button type="button" onClick={() => step(-1)} aria-label="Previous game" className="dm-quiet absolute top-1/2 left-0 z-30 flex size-[48px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[8px]" style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next game" className="dm-quiet absolute top-1/2 right-0 z-30 flex size-[48px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[8px]" style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
              <div className="absolute bottom-[18px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-[7px]" role="tablist" aria-label="Choose a game">
                {candidates.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={info(c).title}
                    onClick={() => turn(i)}
                    className="h-[8px] cursor-pointer rounded-full transition-[width,background-color] duration-300"
                    style={{ width: i === active ? 26 : 8, background: i === active ? accent : "color-mix(in srgb, var(--foreground) 30%, transparent)" }}
                  />
                ))}
              </div>
            </>
          )}
          <p className="sr-only" aria-live="polite">{now.title}{current.kind === "soon" ? ", coming soon" : ""}</p>
        </div>
      </div>
    </div>
  );
}

function StageCard({ candidate, title, world, cover, centre, pulseKey, onPick, blocked }: {
  candidate: StageCandidate; title: string; world: string; cover: string; centre: boolean; pulseKey: number; onPick: () => void; blocked: () => boolean;
}) {
  const accent = WORLD_COLORS[world] ?? "var(--primary)";
  const soon = candidate.kind === "soon";
  const face = (
    <>
      <Image src={cover} alt="" fill sizes="300px" className="object-cover" style={{ filter: soon ? "saturate(.55) brightness(.8)" : undefined }} />
      {/* the right side stays clear for the play badge on the centre card */}
      <span className={`absolute inset-x-0 bottom-0 flex flex-col gap-[4px] pt-[48px] pb-[18px] pl-[18px] ${centre && !soon ? "pr-[86px]" : "pr-[18px]"}`} style={{ backgroundImage: "var(--poster-scrim)" }}>
        <span className="text-[22px] leading-[1.1] font-extrabold uppercase" style={{ ...posterTitleFont(world), color: "var(--poster-title)" }}>{title}</span>
        <span className="text-[11px] font-semibold tracking-[0.6px] uppercase" style={{ color: accent }}>{world}</span>
      </span>
      {soon && (
        <span className="absolute top-[12px] left-[12px] flex items-center gap-[5px] rounded-full px-[9px] py-[3px] text-[11px] font-bold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
          <Lock className="h-[12px] w-[12px]" aria-hidden /> Coming soon
        </span>
      )}
    </>
  );
  const frame = "relative block h-full w-full overflow-hidden rounded-[var(--radius-lg)] border";
  const frameStyle = { borderColor: centre ? `color-mix(in srgb, ${accent} 70%, white)` : "var(--color-glass-border-raised)", boxShadow: centre ? `0 30px 80px -30px color-mix(in srgb, ${accent} 70%, transparent), 0 18px 40px rgba(0,0,0,.45)` : "0 18px 40px rgba(0,0,0,.4)" };
  return (
    <div className="relative h-full w-full">
      {/* a short glow on the card each time it turns to the front */}
      {centre && (
        <motion.span
          key={pulseKey}
          aria-hidden
          className="pointer-events-none absolute -inset-[3px] rounded-[calc(var(--radius-lg)+3px)]"
          style={{ boxShadow: `0 0 0 3px ${accent}, 0 0 46px 6px color-mix(in srgb, ${accent} 60%, transparent)` }}
          initial={{ opacity: 0.95 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}
      {centre && candidate.kind === "sim" ? (
        <Link href={`/play/${candidate.sim.id}`} className={`${frame} cursor-pointer`} style={frameStyle} onClick={(e) => { if (blocked()) e.preventDefault(); }} draggable={false}>
          {face}
          <span className="sr-only">Play {title}</span>
          <span aria-hidden className="absolute right-[16px] bottom-[16px] flex size-[56px] items-center justify-center rounded-full border backdrop-blur-[6px]" style={{ background: "rgba(0,0,0,0.45)", borderColor: "rgba(255,255,255,0.45)" }}>
            <Play className="ml-[3px] h-[24px] w-[24px]" fill="#fff" style={{ color: "#fff" }} />
          </span>
        </Link>
      ) : (
        <button type="button" onClick={onPick} className={`${frame} ${centre ? "cursor-default" : "cursor-pointer"} text-left`} style={frameStyle} aria-label={centre ? `${title}, coming soon` : `Show ${title}`} draggable={false}>
          {face}
        </button>
      )}
    </div>
  );
}

/** What you are about to play: the series, the title, the level ladder, and
 *  the actions. Starting the game lives here (and on the centre card), never
 *  on a side card, so turning the ring can't launch a game by accident. */
function StagePanel({ candidate, onTrailer }: { candidate: StageCandidate; onTrailer: (sim: Simulation) => void }) {
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const { title, world } = info(candidate);
  const accent = WORLD_COLORS[world] ?? "var(--primary)";
  const ink = careerButtonInk(world);
  const sim = candidate.kind === "sim" ? candidate.sim : null;
  const first = sim?.levels[0];
  const run = sim && first ? readRun(progress, sim.id, first.saveSlot ?? first.n) : null;
  const resumable = sim && first && run && run.index > 0 && run.index < first.beats.length ? run : null;
  const pct = resumable && first ? Math.round((resumable.index / first.beats.length) * 100) : 0;
  const ladder = useMemo(() => (sim ? [...sim.levels.map((l) => ({ role: l.role, built: true })), ...sim.upcoming.map((role) => ({ role, built: false }))] : []), [sim]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={candidate.id}
        className="relative z-20 flex flex-col gap-[var(--space-4)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-[13px] font-bold tracking-[0.14em] uppercase" style={{ color: accent }}>
          {sim ? "Day in the Life" : "Coming soon"}
        </span>
        <h3 className="text-[clamp(40px,calc(4.2vw/var(--vz,1)),64px)] leading-[0.98] font-extrabold uppercase" style={{ ...posterTitleFont(world), color: "var(--foreground)" }}>
          {title}
        </h3>
        <span className="text-[13px] font-semibold tracking-[0.6px] uppercase" style={{ color: "var(--muted-foreground)" }}>{world}</span>

        {sim && first ? (
          <>
            {/* the job ladder you climb in this game: built levels lit,
                the ones still being made dimmed */}
            <ol className="flex flex-wrap items-center gap-[6px] text-[13px] font-semibold" aria-label="Levels">
              {ladder.map((step, i) => (
                <li key={step.role} className="flex items-center gap-[6px]">
                  {i > 0 && <ChevronRight className="h-[14px] w-[14px]" style={{ color: "var(--muted-foreground)" }} aria-hidden />}
                  <span className="rounded-full border px-[10px] py-[3px]" style={step.built ? { borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`, color: "var(--foreground)", background: `color-mix(in srgb, ${accent} 14%, transparent)` } : { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                    {step.role}
                  </span>
                </li>
              ))}
            </ol>
            {resumable && (
              <span className="flex max-w-[360px] flex-col gap-[6px]">
                <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Level {first.n} · {pct}% done</span>
                <SparkBar percent={pct} height={5} track="color-mix(in srgb, var(--foreground) 18%, transparent)" fill={accent} glow={accent} />
              </span>
            )}
            <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-3)]">
              <Link href={`/play/${sim.id}`} className="dm-solid flex min-h-[56px] cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[28px] text-[17px] font-bold" style={{ background: accent, color: ink, boxShadow: `0 16px 34px -14px color-mix(in srgb, ${accent} 85%, transparent)`, fontFamily: "var(--font-display)" }}>
                <Play className="h-[18px] w-[18px]" fill="currentColor" aria-hidden /> {resumable ? "Continue" : "Play"}
              </Link>
              {sim.trailer && (
                <button type="button" onClick={() => onTrailer(sim)} className="dm-quiet flex min-h-[48px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[18px] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 50%, transparent)", color: "var(--foreground)" }}>
                  <Film className="h-[16px] w-[16px]" aria-hidden /> Watch trailer
                </button>
              )}
              {first.expressCut && first.expressCut.length > 0 && (
                <Link href={`/play/${sim.id}?mode=express`} className="dm-quiet flex min-h-[48px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[18px] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 50%, transparent)", color: "var(--foreground)" }}>
                  <Zap className="h-[16px] w-[16px]" aria-hidden /> Express mode
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="max-w-[420px] text-[15px] leading-[1.5]" style={{ color: "var(--muted-foreground)" }}>We are building this one. Learn about the job while you wait.</p>
            <div className="mt-[var(--space-2)] flex">
              <Link href={`/career/${candidate.id}`} className="dm-quiet flex min-h-[52px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[22px] text-[15px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`, background: `color-mix(in srgb, ${accent} 12%, transparent)`, color: "var(--foreground)" }}>
                Explore the career <ChevronRight className="h-[16px] w-[16px]" aria-hidden />
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
