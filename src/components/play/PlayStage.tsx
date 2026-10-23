"use client";

// Play v2: the labelled carousel (23 Oct 2026). Third try today; each step
// answered a direct note from Chandu:
// - the 8 Oct game-select ring named the game in a side panel and left the
//   cards bare: "the background changes and the text changes on the left
//   but the images are without the text so older investors etc find it
//   hard to understand or connect the dots";
// - a billboard plus strip: "no this doesnt work... Much more intuitive.
//   Also the images and their transitions into the banners are broken";
// - game cards with a flagship: "they are all valuable so one being
//   highlighted is bad... I did like carousel style but I'm not sure how we
//   can marry the two".
// So the carousel stays and the cards carry their own words:
// - every card is full-bleed art with its name and world on a progressive
//   blur at the bottom, front and sides alike (the words sit on each side
//   card's outer edge, where the front card never covers them), so nothing
//   has to be matched up and nothing else on the page changes when it turns;
// - the front card is bigger only because it is in front, and every game
//   takes the front in turn: it turns itself every 6 seconds (Chandu: "auto
//   rotate them with a pause or mouse hover pause"), and the student can
//   turn it (arrows, swipe, arrow keys, a click on a side card);
// - the cards away from the front are dimmed by a wash of the page colour,
//   not made see-through ("subtly fade the ones not central... not
//   transparency");
// - each card reads "Day in the Life" over its career, and the front one
//   carries the old cards' Express mode and Watch trailer chips;
// - wide cards (Chandu: "the cards can be wider and full bleed imagery
//   with progressive blur");
// - only the front card carries Play. Clicking it grows it into a
//   full-screen game page: the art, the story, the climb, Play and the
//   trailer. The card's own loaded picture fills the box as it grows;
// - "View all" opens the whole catalogue with a world filter.
// Glow is cut right down ("the colored glows might be a bit too much"): no
// halos or coloured shadows; the world colour is a dot, a hairline on the
// front card and the Play button.
// WCAG: the rotation has a visible Pause and also holds under the pointer,
// under keyboard focus, behind the welcome splash, a game page or View all
// and in a hidden tab (2.2.2); it never starts for anyone who reduces
// motion, which also turns off the tilt, the turn and the zoom (2.3.3);
// screen readers hear the turns only while it is held or paused; words never sit on the art (1.4.3);
// each card has one control, the front one a Play link beside it, never one
// inside another (4.1.2); cards out of sight leave the tab order.

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Film, LayoutGrid, Lock, Pause, Play, X, Zap } from "lucide-react";
import { WORLD_COLORS, posterTitleFont } from "@/components/app/worlds";
import { careerButtonInk } from "@/components/career/CareerHeaderActions";
import { Listbox } from "@/components/app/Listbox";
import { SparkBar } from "@/components/flow/SparkBar";
import { progressSnapshot, readRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import { playSelect } from "./sound";
import { simThumb } from "./games";
import type { Simulation } from "./types";

type Store = ReturnType<typeof progressSnapshot>;

export type SoonCareer = { careerId: string; title: string; world: string; cover: string };

// The career's world colour, except a near-grey one (Fixing Machines &
// Engines, #64748b): a slate Play button reads as disabled, so those games
// take the app's blue (8 Oct 2026).
const MUTED_WORLDS = new Set(["Fixing Machines & Engines"]);
const stageAccent = (world: string) => (MUTED_WORLDS.has(world) ? "var(--primary)" : WORLD_COLORS[world] ?? "var(--primary)");
const playInk = (world: string) => (MUTED_WORLDS.has(world) ? "var(--primary-foreground)" : careerButtonInk(world));

/** Where Level 1 stands for this student, if they left it part-way. */
function resumeOf(progress: Store, sim: Simulation) {
  const first = sim.levels[0];
  if (!first) return null;
  const run = readRun(progress, sim.id, first.saveSlot ?? first.n);
  if (!run || run.index <= 0 || run.index >= first.beats.length) return null;
  return { pct: Math.round((run.index / first.beats.length) * 100), level: first.n };
}

/** "Planned: ..." entries in `upcoming` are build notes, not jobs. */
const laterRoles = (sim: Simulation) => sim.upcoming.filter((r) => !/^planned:/i.test(r));

type Rect = { top: number; left: number; width: number; height: number };
// the card art's sizes, shared with the game page so its zoom reuses the
// image the card already loaded
const CARD_SIZES = "(min-width: 640px) 500px, 80vw";

// Where a card sits by its distance from the front: share of the stage's
// half-width, turn (deg), scale, opacity. Every card within two places is
// on screen and readable; past that they wait out of sight.
// `dim` is a wash of the page colour over the card, not transparency, so
// the cards behind never show through (Chandu: "subtly fade the ones not
// central? just subtly, not transparency"). Opacity is only used to park
// the cards out of sight.
const SLOTS = [
  { x: 0, rot: 0, scale: 1, op: 1, dim: 0 },
  { x: 0.62, rot: -12, scale: 0.84, op: 1, dim: 0.28 },
  { x: 1.02, rot: -18, scale: 0.7, op: 1, dim: 0.5 },
  { x: 1.2, rot: -22, scale: 0.6, op: 0, dim: 0.5 },
];
const SPRING = { type: "spring", stiffness: 240, damping: 30, mass: 0.9 } as const;
const ROTATE_MS = 6000;
const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};

export function PlayStage({ simulations, soon, focusId, ready = true, onTrailer }: {
  simulations: Simulation[];
  /** Everything in the works, for View all. */
  soon: SoonCareer[];
  /** ?focus= deep link: that game comes to the front and its page opens. */
  focusId?: string;
  /** false while the welcome splash covers the page: no turning behind it */
  ready?: boolean;
  onTrailer: (sim: Simulation) => void;
}) {
  const progress = useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot);
  const reduced = useReducedMotion();
  const n = simulations.length;
  const [active, setActive] = useState(() => Math.max(0, simulations.findIndex((s) => s.id === focusId || s.careerId === focusId)));
  const [open, setOpen] = useState<{ sim: Simulation; from: Rect | null } | null>(null);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  // Auto-rotate (Chandu: "auto rotate them with a pause or mouse hover
  // pause"). WCAG 2.2.2 is met by the visible Pause beside the arrows;
  // it also holds while the pointer or keyboard focus is on the carousel,
  // while a game page or View all is open and while the tab is hidden, and
  // it never starts for anyone who reduces motion. A manual turn restarts
  // the count so it never turns straight after you did.
  const [rotating, setRotating] = useState(() => !reduced);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [cycle, setCycle] = useState(0);
  const hiddenTab = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  const held = !ready || hover || focusIn || !!open || catalogueOpen || hiddenTab;
  const restart = useCallback(() => setCycle((c) => c + 1), []);
  useEffect(() => {
    if (!rotating || held || n < 2) return;
    const t = window.setTimeout(() => setActive((cur) => (cur + 1) % n), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [rotating, held, n, active, cycle]);
  const stageW = useWidth(stage);

  const turnTo = useCallback((i: number) => {
    setActive((cur) => {
      const next = ((i % n) + n) % n;
      if (next !== cur) playSelect();
      return next;
    });
  }, [n]);
  const step = useCallback((d: number) => setActive((cur) => {
    const next = (((cur + d) % n) + n) % n;
    if (next !== cur) playSelect();
    return next;
  }), [n]);

  const openGame = useCallback((sim: Simulation) => {
    const el = document.querySelector<HTMLElement>(`[data-game-card="${CSS.escape(sim.id)}"]`);
    const r = el?.getBoundingClientRect();
    playSelect();
    setOpen({ sim, from: r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null });
  }, []);
  const closeGame = useCallback(() => {
    const id = open?.sim.id;
    setOpen(null);
    // focus back on the card it opened from (2.4.3)
    if (id) window.setTimeout(() => document.querySelector<HTMLElement>(`[data-game-card="${CSS.escape(id)}"] [data-card-open]`)?.focus({ preventScroll: true }), 0);
  }, [open]);

  // A deep link from elsewhere (Profile's "Play your #1 Career Simulation")
  // lands on that game's page, the content page before playback.
  const deepLinked = useRef(false);
  useEffect(() => {
    if (deepLinked.current || !focusId) return;
    const sim = simulations.find((s) => s.id === focusId || s.careerId === focusId);
    if (!sim) return;
    deepLinked.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time open from the URL
    setOpen({ sim, from: null });
  }, [focusId, simulations]);

  // a sideways trackpad scroll turns it; up/down still scrolls the page
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

  // drag or swipe turns it; a drag never counts as a click
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, moved: false }; };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.x) > 60) {
      step(e.clientX < d.x ? 1 : -1);
      drag.current = { x: e.clientX, moved: true };
    }
  };
  const onPointerUp = () => { window.setTimeout(() => { drag.current = null; }, 0); };
  const dragged = () => drag.current?.moved === true;

  // the shortest way round, so the first game sits beside the last
  const offset = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const current = simulations[active];
  if (!current) return null;
  const total = simulations.length + soon.length;
  // a phone shows the front card and the edges of its neighbours
  // wide cards (Chandu: "the cards can be wider"): up to 500 by 440 on a
  // laptop; a phone shows the front card and the edges of its neighbours
  const cardW = Math.round(Math.min(500, Math.max(240, stageW * 0.72)));
  const cardH = Math.round(cardW * (stageW < 640 ? 1.3 : 0.88)); // portrait on phones, so the words leave room for the art
  const half = Math.min(stageW / 2, cardW * 1.05);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex justify-end sm:-mt-[52px]">
        <button
          type="button"
          onClick={() => setCatalogueOpen(true)}
          aria-haspopup="dialog"
          className="dm-quiet flex min-h-[40px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[14px] text-[14px] font-semibold"
          style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--background) 50%, transparent)", color: "var(--foreground)" }}
        >
          <LayoutGrid className="h-[16px] w-[16px]" aria-hidden /> View all {total}
        </button>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Career simulations"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setFocusIn(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusIn(false); }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          step(e.key === "ArrowRight" ? 1 : -1);
          restart();
        }}
        className="flex flex-col gap-[var(--space-3)]"
      >
        <div
          ref={stage}
          className="relative -mx-5 touch-pan-y overflow-hidden select-none sm:mx-0 sm:overflow-visible"
          style={{ height: cardH + 28, perspective: 1600 }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {simulations.map((sim, i) => {
            const d = offset(i);
            const slot = SLOTS[Math.min(Math.abs(d), SLOTS.length - 1)];
            const sign = Math.sign(d);
            const front = d === 0;
            const hidden = slot.op === 0;
            return (
              <motion.div
                key={sim.id}
                className="absolute top-[12px] left-1/2"
                style={{ width: cardW, marginLeft: -cardW / 2, zIndex: 10 - Math.abs(d), transformStyle: "preserve-3d", pointerEvents: hidden ? "none" : "auto" }}
                initial={false}
                animate={{ x: sign * slot.x * half, rotateY: reduced ? 0 : sign * slot.rot, scale: slot.scale, opacity: slot.op }}
                transition={reduced ? { duration: 0 } : SPRING}
                aria-hidden={hidden || undefined}
                inert={hidden || undefined}
              >
                <CarouselCard
                  sim={sim}
                  front={front}
                  // mirrored only where the side cards fit on screen; on
                  // narrower screens they are peeks at the edge
                  side={stageW >= 1100 ? sign : 0}
                  resume={resumeOf(progress, sim)}
                  height={cardH}
                  dim={slot.dim}
                  onTrailer={onTrailer}
                  onPick={() => { if (dragged()) return; if (front) openGame(sim); else turnTo(i); }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* under the carousel: one pill holding the arrows and the count
            (Chandu, first "keep the arrows where they are actually but more
            prominent", then "a little too big and cluttered"), a thin bar
            for the next turn, and a quiet Pause beside it */}
        {n > 1 && (
          <div className="flex items-center justify-center gap-[var(--space-3)]">
            <div className="flex items-center gap-[2px] rounded-full border p-[3px]" style={{ borderColor: "color-mix(in srgb, var(--foreground) 22%, transparent)", background: "color-mix(in srgb, var(--foreground) 6%, var(--background))" }}>
              <StageArrow dir={-1} onClick={() => { step(-1); restart(); }} />
              <span className="flex min-w-[52px] flex-col items-center gap-[4px]" aria-hidden>
                <span className="text-[13px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{active + 1} / {n}</span>
                <span className="block h-[2px] w-[32px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 16%, transparent)" }}>
                  {/* the count restarts after a hold, so the bar does too */}
                  {rotating && !held && <span key={`${active}-${cycle}`} className="dm-rotate-bar block h-full rounded-full" style={{ background: "var(--foreground)", animationDuration: `${ROTATE_MS}ms` }} />}
                </span>
              </span>
              <StageArrow dir={1} onClick={() => { step(1); restart(); }} />
            </div>
            <button
              type="button"
              onClick={() => setRotating((r) => !r)}
              className="dm-link flex min-h-[40px] cursor-pointer items-center gap-[6px] px-[6px] text-[13px] font-semibold"
              style={{ color: "var(--muted-foreground)" }}
            >
              {rotating ? <Pause className="h-[13px] w-[13px]" aria-hidden /> : <Play className="h-[13px] w-[13px]" aria-hidden />}
              {rotating ? "Pause" : "Resume"}
              <span className="sr-only"> rotation</span>
            </button>
          </div>
        )}
        <p className="sr-only" aria-live={rotating && !held ? "off" : "polite"}>{current.title}, {active + 1} of {n}</p>
      </div>

      {open && <GamePage sim={open.sim} from={open.from} sizes={CARD_SIZES} progress={progress} onClose={closeGame} onTrailer={onTrailer} />}

      {catalogueOpen && (
        <CatalogueDialog
          simulations={simulations}
          soon={soon}
          progress={progress}
          onClose={() => setCatalogueOpen(false)}
          onPick={(sim) => {
            setCatalogueOpen(false);
            turnTo(simulations.indexOf(sim));
            setOpen({ sim, from: null });
          }}
        />
      )}
    </div>
  );
}

function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [w, setW] = useState(960);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

function StageArrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  const Icon = dir < 0 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir < 0 ? "Previous game" : "Next game"}
      className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full"
      style={{ color: "var(--foreground)" }}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

/** One game in the carousel: its art fills the card, and its name and world
 *  sit at the bottom on a progressive blur of that same art (Chandu, 23 Oct
 *  2026: "the cards can be wider and full bleed imagery with progressive
 *  blur"). The blur is a pre-blurred copy of the picture faded in from the
 *  bottom, not a live backdrop-filter: the card moves when the carousel
 *  turns, and blurring a moving layer every frame is what lagged the
 *  Glossary Lab on Chromebooks. A dark wash under the words keeps them at
 *  4.5:1 whatever the art. The front card also carries Play; clicking a
 *  side card brings it to the front, clicking the front one opens it. */
function CarouselCard({ sim, front, side, resume, height, dim, onPick, onTrailer }: {
  sim: Simulation;
  onTrailer: (sim: Simulation) => void;
  front: boolean;
  /** -1 left of the front card, 1 right of it: the words sit on the card's
   *  outer edge, the part the front card never covers. */
  side: number;
  resume: { pct: number } | null;
  height: number;
  /** how far the page-colour wash dims this card (0 in front) */
  dim: number;
  onPick: () => void;
}) {
  const { src, focus } = simThumb(sim);
  const accent = stageAccent(sim.world);
  const long = sim.title.length > 18;
  const first = sim.levels[0];
  const fade = "linear-gradient(0deg, #000 0%, #000 34%, transparent 62%)";
  return (
    <article
      data-game-card={sim.id}
      className="group relative isolate overflow-hidden rounded-[var(--radius-lg)] border"
      style={{
        height,
        background: "var(--scrim-deep, #070b18)",
        borderColor: front ? `color-mix(in srgb, ${accent} 55%, var(--glass-border))` : "var(--glass-border)",
        boxShadow: "0 18px 40px -18px rgba(0,0,0,0.55)",
      }}
    >
      <span aria-hidden className="absolute inset-0 -z-10">
        <Image src={src} alt="" fill sizes={CARD_SIZES} draggable={false} className="object-cover" style={{ objectPosition: focus }} />
        {/* the progressive blur: the same picture, blurred once, shown only
            toward the bottom */}
        <span className="absolute inset-0 overflow-hidden" style={{ WebkitMaskImage: fade, maskImage: fade }}>
          <Image src={src} alt="" fill sizes={CARD_SIZES} draggable={false} className="scale-[1.12] object-cover" style={{ objectPosition: focus, filter: "blur(18px) saturate(1.1)" }} />
        </span>
        <span className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgb(var(--scrim-rgb, 4 7 18) / calc(0.78 * var(--scrim-gain, 1))) 0%, rgb(var(--scrim-rgb, 4 7 18) / calc(0.5 * var(--scrim-gain, 1))) 30%, transparent 56%)" }} />
        {resume && (
          <span className="absolute inset-x-0 bottom-0 h-[4px]" style={{ background: "rgba(0,0,0,0.45)" }}>
            <span className="block h-full" style={{ width: `${resume.pct}%`, background: accent }} />
          </span>
        )}
      </span>
      <div className={`absolute inset-x-0 bottom-0 flex flex-col gap-[6px] px-5 pb-5 ${side > 0 ? "items-end text-right" : ""}`}>
        {/* the series name above the career, as on every other Play card
            ("Day in the Life: <career>", CEO, 4 Sept) */}
        <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--scrim-ink-soft, rgba(255,255,255,0.85))" }}>Day in the Life</span>
        <h3 className={`${long ? "text-[22px]" : "text-[28px]"} leading-[1.05] font-extrabold text-balance uppercase`} style={{ ...posterTitleFont(sim.world), color: "var(--scrim-ink, #fff)" }}>
          {/* the card's one control: its hit area covers the whole card */}
          <button
            type="button"
            data-card-open
            onClick={onPick}
            tabIndex={front ? 0 : -1}
            aria-label={front ? `Open ${sim.title}` : `Show ${sim.title}`}
            draggable={false}
            className={`cursor-pointer uppercase after:absolute ${side > 0 ? "text-right" : "text-left"} after:inset-0 after:z-0 after:content-['']`}
            style={{ font: "inherit", letterSpacing: "inherit" }}
          >
            {sim.title}
          </button>
        </h3>
        <span className="flex items-center gap-[7px] text-[12px] leading-[16px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--scrim-ink-soft, rgba(255,255,255,0.85))" }}>
          <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: accent }} />
          {sim.world}
        </span>
        {front && (
          <div className="relative z-10 mt-[6px] flex items-center gap-[var(--space-3)]">
            <PlayLink sim={sim} resume={!!resume} size="sm" />
            <span aria-hidden className="flex items-center gap-[4px] text-[13px] font-semibold" style={{ color: "var(--scrim-ink-soft, rgba(255,255,255,0.85))" }}>
              Details <ChevronRight className="h-[14px] w-[14px]" />
            </span>
          </div>
        )}
      </div>
      {/* the old cards' chips, top right on the front card: Express mode
          and "Watch trailer", the full verb phrase (a chip reading just
          "Trailer" made the card sound like it WAS a trailer). No backdrop
          blur: the card moves when the carousel turns. */}
      {front && (first?.expressCut?.length || sim.trailer) ? (
        <span className="absolute top-[12px] right-[12px] z-10 flex items-center gap-[6px]">
          {first?.expressCut && first.expressCut.length > 0 && (
            <Link href={`/play/${sim.id}?mode=express`} className="dm-quiet flex min-h-[34px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[13px] text-[12px] font-semibold" style={{ background: "rgb(var(--scrim-rgb, 0 0 0) / calc(0.78 * var(--scrim-glass-gain, 1)))", borderColor: "var(--scrim-chip-edge, rgba(255,255,255,0.35))", color: "var(--scrim-ink, #FFFFFF)" }}>
              <Zap className="h-[13px] w-[13px]" aria-hidden /> Express mode
            </Link>
          )}
          {sim.trailer && (
            <button type="button" onClick={() => onTrailer(sim)} className="dm-quiet flex min-h-[34px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[13px] text-[12px] font-semibold" style={{ background: "rgb(var(--scrim-rgb, 0 0 0) / calc(0.78 * var(--scrim-glass-gain, 1)))", borderColor: "var(--scrim-chip-edge, rgba(255,255,255,0.35))", color: "var(--scrim-ink, #FFFFFF)" }}>
              <Film className="h-[13px] w-[13px]" aria-hidden /> Watch trailer
            </button>
          )}
        </span>
      ) : null}
      {/* the wash: over art and words alike, below the card's own control */}
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-[5]" style={{ background: "var(--background)" }} initial={false} animate={{ opacity: dim }} transition={{ duration: 0.35, ease: "easeOut" }} />
    </article>
  );
}

function PlayLink({ sim, resume, size }: { sim: Simulation; resume: boolean; size: "lg" | "sm" }) {
  const accent = stageAccent(sim.world);
  return (
    <Link
      href={`/play/${sim.id}`}
      className={`dm-solid flex cursor-pointer items-center rounded-[var(--radius-md)] font-bold ${size === "lg" ? "min-h-[52px] gap-[10px] px-[26px] text-[17px]" : "min-h-[40px] gap-[8px] px-[16px] text-[14px]"}`}
      style={{ background: accent, color: playInk(sim.world), fontFamily: "var(--font-display)" }}
    >
      <Play className={size === "lg" ? "h-[18px] w-[18px]" : "h-[14px] w-[14px]"} fill="currentColor" aria-hidden /> {resume ? "Continue" : "Play"}
      <span className="sr-only"> {sim.title}</span>
    </Link>
  );
}

/** The full-screen game page. It grows out of the card that opened it (the
 *  card's own box, animated to the screen), then the words fade up. */
function GamePage({ sim, from, sizes, progress, onClose, onTrailer }: {
  sim: Simulation;
  from: Rect | null;
  sizes?: string;
  progress: Store;
  onClose: () => void;
  onTrailer: (sim: Simulation) => void;
}) {
  const reduced = useReducedMotion();
  const titleId = useId();
  const { src, focus } = simThumb(sim);
  const accent = stageAccent(sim.world);
  const first = sim.levels[0];
  const resume = resumeOf(progress, sim);
  const later = laterRoles(sim);
  const [closing, setClosing] = useState(false);
  const [settled, setSettled] = useState(false);

  const close = useCallback(() => setClosing(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // the trailer sits above this page and handles its own Escape
      if (e.key !== "Escape" || e.defaultPrevented || document.querySelector('[role="dialog"][aria-label="Trailer"]')) return;
      close();
    };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); html.style.overflow = prev; };
  }, [close]);

  const vw = typeof window === "undefined" ? 0 : window.innerWidth;
  const vh = typeof window === "undefined" ? 0 : window.innerHeight;
  const startBox = from && !reduced ? { top: from.top, left: from.left, width: from.width, height: from.height, borderRadius: 20 } : { top: 0, left: 0, width: vw, height: vh, borderRadius: 0 };
  const full = { top: 0, left: 0, width: vw, height: vh, borderRadius: 0 };
  const zoom = !!from && !reduced;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="marketing-v2 themeable fixed z-[70] overflow-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
      initial={{ ...startBox, opacity: zoom ? 1 : 0 }}
      animate={closing ? { ...startBox, opacity: zoom ? 0.0 : 0 } : { ...full, opacity: 1 }}
      transition={{ duration: zoom ? 0.42 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => { if (closing) onClose(); else setSettled(true); }}
    >
      {/* the card's own picture, already loaded, fills the box while it
         grows, so the zoom reads as the card opening; it fades once the
         page's full-size art is up underneath */}
      {zoom && (
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-10 block" initial={{ opacity: 1 }} animate={{ opacity: settled && !closing ? 0 : 1 }} transition={{ duration: 0.35 }}>
          <Image src={src} alt="" fill sizes={sizes ?? CARD_SIZES} className="object-cover" style={{ objectPosition: focus }} />
        </motion.span>
      )}
      <div className="dm-scroll h-full overflow-y-auto">
        {/* the art, full width, fading into the page below it */}
        <div className="relative h-[min(62dvh,640px)] min-h-[280px] w-full overflow-hidden">
          <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: focus }} />
          <span aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 50%, var(--background) 96%)" }} />
          <button
            type="button"
            onClick={close}
            aria-label="Close game page"
            className="dm-quiet absolute top-[max(16px,env(safe-area-inset-top))] left-4 flex min-h-[44px] cursor-pointer items-center gap-[8px] rounded-full border px-[16px] text-[14px] font-semibold sm:left-8"
            style={{ background: "rgba(3,6,16,0.6)", borderColor: "rgba(255,255,255,0.28)", color: "#fff" }}
          >
            <ArrowLeft className="h-[16px] w-[16px]" aria-hidden /> Back
          </button>
        </div>

        <motion.div
          className="relative mx-auto -mt-[36px] flex w-full max-w-[880px] flex-col gap-[var(--space-4)] px-5 pb-[120px] sm:px-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: closing ? 0 : 1, y: 0 }}
          transition={{ duration: 0.3, delay: closing ? 0 : zoom ? 0.24 : 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="flex items-center gap-[8px] text-[13px] leading-[16px] font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
            <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: accent }} />
            Career simulation · {sim.world}
          </span>
          <h2 id={titleId} className="text-[clamp(36px,calc(5vw/var(--vz,1)),68px)] leading-[1] font-extrabold text-balance uppercase" style={{ ...posterTitleFont(sim.world), color: "var(--foreground)" }}>
            {sim.title}
          </h2>
          {first && <p className="max-w-[60ch] text-[17px] leading-[1.55]" style={{ color: "var(--muted-foreground)" }}>{first.blurb}</p>}

          {resume && first && (
            <span className="flex max-w-[360px] flex-col gap-[6px]">
              <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Level {resume.level} · {resume.pct}% done</span>
              <SparkBar percent={resume.pct} height={5} track="color-mix(in srgb, var(--foreground) 18%, transparent)" fill={accent} glow="transparent" />
            </span>
          )}

          <div className="flex flex-wrap items-center gap-[var(--space-3)]">
            <PlayLink sim={sim} resume={!!resume} size="lg" />
            {sim.trailer && (
              <button type="button" onClick={() => onTrailer(sim)} className="dm-quiet flex min-h-[52px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] border px-[20px] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
                <Film className="h-[16px] w-[16px]" aria-hidden /> Watch trailer
              </button>
            )}
            {first?.expressCut && first.expressCut.length > 0 && (
              <Link href={`/play/${sim.id}?mode=express`} className="dm-link flex min-h-[44px] cursor-pointer items-center gap-[6px] text-[15px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                <Zap className="h-[15px] w-[15px]" aria-hidden /> Short on time? Express mode
              </Link>
            )}
          </div>

          {/* the climb: one line per level, built ones first */}
          <section aria-labelledby={`${titleId}-levels`} className="mt-[var(--space-4)] flex flex-col gap-[var(--space-2)]">
            <h3 id={`${titleId}-levels`} className="text-[18px] leading-[24px] font-bold" style={{ color: "var(--foreground)" }}>The climb</h3>
            <ol className="flex flex-col">
              {sim.levels.map((l) => (
                <li key={l.n} className="flex items-center gap-[var(--space-3)] border-t py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
                  <span className="w-[64px] flex-none text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Level {l.n}</span>
                  <span className="flex-1 text-[15px] font-semibold" style={{ color: "var(--foreground)" }}>{l.role}</span>
                  <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Ready</span>
                </li>
              ))}
              {later.map((role, i) => (
                <li key={role} className="flex items-center gap-[var(--space-3)] border-t py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
                  <span className="w-[64px] flex-none text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Level {sim.levels.length + i + 1}</span>
                  <span className="flex-1 text-[15px]" style={{ color: "var(--muted-foreground)" }}>{role}</span>
                  <span className="flex items-center gap-[6px] text-[13px]" style={{ color: "var(--muted-foreground)" }}><Lock className="h-[12px] w-[12px]" aria-hidden /> Coming later</span>
                </li>
              ))}
            </ol>
          </section>
        </motion.div>
      </div>
    </motion.div>,
    document.body,
  );
}

const ALL_WORLDS = "all";

/** The whole catalogue in one grid: what is ready to play, then what is in
 *  the works, filtered by world. A ready game opens its game page, the
 *  same as its card; a game in the works opens its career page, and says
 *  so on the tile. */
function CatalogueDialog({ simulations, soon, progress, onClose, onPick }: {
  simulations: Simulation[];
  soon: SoonCareer[];
  progress: Store;
  onClose: () => void;
  onPick: (sim: Simulation) => void;
}) {
  const [world, setWorld] = useState(ALL_WORLDS);
  const titleId = useId();
  const worlds = useMemo(() => [...new Set([...simulations.map((s) => s.world), ...soon.map((s) => s.world)])].sort(), [simulations, soon]);
  const ready = simulations.filter((s) => world === ALL_WORLDS || s.world === world);
  const later = soon.filter((s) => world === ALL_WORLDS || s.world === world);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !e.defaultPrevented) onClose(); };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); html.style.overflow = prev; };
  }, [onClose]);

  // portalled to the body: the page's reveal animation leaves a transform
  // on <main>, which would pin a fixed layer to main instead of the screen
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[100] flex items-stretch justify-center sm:items-center sm:p-6" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
      <button type="button" tabIndex={-1} aria-hidden className="absolute inset-0 cursor-default" style={{ background: "rgba(3,6,16,0.72)" }} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="dm-pop-in relative flex max-h-full w-full max-w-[1100px] flex-col overflow-hidden border sm:h-[min(860px,100%)] sm:rounded-[var(--radius-lg)]"
        style={{ background: "linear-gradient(var(--card), var(--card)), var(--background)", borderColor: "var(--glass-border)", boxShadow: "0 40px 100px -30px rgba(0,0,0,0.7)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)] border-b px-5 py-4 sm:px-6" style={{ borderColor: "var(--glass-border)" }}>
          <h2 id={titleId} className="text-[20px] leading-[26px] font-bold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>All career simulations</h2>
          <div className="flex items-center gap-[var(--space-2)]">
            <Listbox
              value={world}
              onChange={setWorld}
              ariaLabel="Filter by world"
              options={[{ value: ALL_WORLDS, label: "All worlds" }, ...worlds.map((w) => ({ value: w, label: w }))]}
              className="flex min-h-[40px] min-w-[248px] items-center justify-between gap-[8px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold"
              style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "transparent" }}
            />
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
              <X className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </div>
        </div>

        <div className="dm-scroll flex flex-col gap-[var(--space-6)] overflow-y-auto px-5 py-5 sm:px-6">
          {ready.length === 0 && later.length === 0 && (
            <p className="py-10 text-center text-[15px]" style={{ color: "var(--muted-foreground)" }}>No games in this world yet. Try All worlds.</p>
          )}
          {ready.length > 0 && (
            <CatalogueGroup label="Ready to play" count={ready.length}>
              {ready.map((sim) => {
                const { src, focus } = simThumb(sim);
                const resume = resumeOf(progress, sim);
                return (
                  <li key={sim.id}>
                    <button type="button" onClick={() => onPick(sim)} className="group flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)] text-left">
                      <CatalogueArt src={src} focus={focus} />
                      <CatalogueText title={sim.title} meta={resume ? `Continue · ${resume.pct}%` : sim.world} />
                    </button>
                  </li>
                );
              })}
            </CatalogueGroup>
          )}
          {later.length > 0 && (
            <CatalogueGroup label="In the works" count={later.length}>
              {later.map((s) => (
                <li key={s.careerId}>
                  <Link href={`/career/${s.careerId}`} className="group flex w-full cursor-pointer flex-col gap-[8px] rounded-[var(--radius-md)]">
                    <CatalogueArt src={s.cover} locked />
                    <CatalogueText title={s.title} meta="Coming soon · See the career" />
                  </Link>
                </li>
              ))}
            </CatalogueGroup>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CatalogueGroup({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[var(--space-3)]">
      <h3 className="text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
        {label} <span style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>· {count}</span>
      </h3>
      <ul className="grid grid-cols-2 gap-x-[var(--space-3)] gap-y-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4">{children}</ul>
    </section>
  );
}

function CatalogueArt({ src, focus, locked = false }: { src: string; focus?: string; locked?: boolean }) {
  return (
    <span className="relative block aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-md)] border" style={{ borderColor: "var(--glass-border)" }}>
      <Image src={src} alt="" fill sizes="(min-width: 1024px) 260px, 45vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" style={{ objectPosition: focus, filter: locked ? "saturate(.6) brightness(.8)" : undefined }} />
      {locked && (
        <span aria-hidden className="absolute top-[8px] left-[8px] flex size-[28px] items-center justify-center rounded-full" style={{ background: "rgba(3,6,16,0.6)", color: "#fff" }}>
          <Lock className="h-[13px] w-[13px]" />
        </span>
      )}
    </span>
  );
}

function CatalogueText({ title, meta }: { title: string; meta: string }) {
  return (
    <span className="flex flex-col gap-[2px] px-[2px]">
      <span className="line-clamp-2 text-[14px] leading-[18px] font-semibold" style={{ color: "var(--foreground)" }}>{title}</span>
      <span className="text-[12px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{meta}</span>
    </span>
  );
}
