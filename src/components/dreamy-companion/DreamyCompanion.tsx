"use client";

// The companion: Dreamy as the student's scout, in one dock (9 Oct 2026,
// Chandu: "right now its a just a sticker in random places with no real
// engagement or presence"). One home, bottom-right; he scouts, brings
// things back, and reacts. He never has a second copy on screen, never
// covers content, and only speaks through the store in lib/dreamyCompanion
// (which carries the restraint rules). Meant to be mounted once in the
// student shell; the lab mounts it over a fake Home first.
//
// Art: the existing v2 stickers in public/images/dreamy/v2, one per mood,
// all layered in one element and cross-faded so a mood change never
// flashes a loading image. Motion is framer-motion so prefers-reduced-motion
// (and the lab's preview of it, via MotionConfig) turns everything still.

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Bookmark, ChevronRight, Eye, FileCheck2, FolderOpen, Play, Rocket, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { dreamyDismiss, dreamyPromptNext, useDreamy, type DreamyAction, type DreamyActionIcon, type DreamyMood, type DreamyPayload } from "@/lib/dreamyCompanion";

// mood -> sticker. Alert for waiting (he has news and is holding it),
// curious for scouting (looking around), party for proud, puzzle for
// puzzled, happy at rest.
const POSE: Record<DreamyMood, string> = {
  idle: "/images/dreamy/v2/dreamy-happy.webp",
  scouting: "/images/dreamy/v2/dreamy-curious.webp",
  waiting: "/images/dreamy/v2/dreamy-alert.webp",
  proud: "/images/dreamy/v2/dreamy-party.webp",
  puzzled: "/images/dreamy/v2/dreamy-puzzle.webp",
};
const MOODS = Object.keys(POSE) as DreamyMood[];

const ACTION_ICON: Record<DreamyActionIcon, typeof Eye> = { open: FolderOpen, save: Bookmark, look: Eye, play: Play, review: FileCheck2, start: Rocket };

const SPRING = { type: "spring" as const, stiffness: 320, damping: 28 };

/** The lab's "reduced motion preview". framer's useReducedMotion reads only
 *  the OS setting (MotionConfig's reducedMotion does not reach it), so the
 *  companion combines both: the student's real setting, or this preview. */
export const DreamyReducedMotion = createContext(false);
function useReduced(): boolean {
  const system = useReducedMotion();
  const preview = useContext(DreamyReducedMotion);
  return !!system || preview;
}

// The Build flow's own Dreamy-local confetti (build/ui.tsx LocalBurst),
// copied rather than imported so the companion stays free of the Build
// flow's module. Same vectors, same four house colours, same keyframe
// (globals.css dreamy-burst): a celebration anchored to the character,
// never a screen-wide wash.
const BURST = Array.from({ length: 10 }, (_, i) => {
  const angle = (-95 + i * 21) * (Math.PI / 180);
  const distance = 46 + (i % 3) * 16;
  return {
    bx: `${Math.round(Math.cos(angle) * distance)}px`,
    by: `${Math.round(Math.sin(angle) * distance)}px`,
    br: `${i % 2 === 0 ? 200 : -160}deg`,
    delay: `${(i % 4) * 0.03}s`,
    color: ["var(--color-brand-400)", "var(--color-accent-purple)", "var(--color-world-arts-media-sport)", "var(--color-world-business-money-office)"][i % 4],
  };
});

function Burst({ nonce }: { nonce: number }) {
  const reduced = useReduced();
  if (nonce === 0 || reduced) return null;
  return (
    <span key={nonce} aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {BURST.map((p, i) => (
        <span
          key={i}
          className="absolute top-1/3 left-1/2 h-1.5 w-1.5 rounded-[2px] animate-[dreamy-burst_0.7s_ease-out_forwards]"
          style={{ background: p.color, ["--bx" as string]: p.bx, ["--by" as string]: p.by, ["--br" as string]: p.br, animationDelay: p.delay }}
        />
      ))}
    </span>
  );
}

/** The Glossary game's typewriter (GlossaryLabGameExperience.tsx), copied:
 *  one line types at 60 cps, a tap finishes it, reduced motion shows it
 *  whole. */
function useTypewriter(text: string, cps = 60) {
  const reduce = useReduced();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new line restarts the typing from its first character
    setN(reduce ? text.length : 0);
    if (reduce) return;
    let i = 0;
    const id = window.setInterval(() => { i += 1; setN(i); if (i >= text.length) window.clearInterval(id); }, 1000 / cps);
    return () => window.clearInterval(id);
  }, [text, cps, reduce]);
  const done = n >= text.length;
  return { shown: text.slice(0, n), done, finish: () => setN(text.length) };
}

const surface: CSSProperties = {
  background: "color-mix(in srgb, var(--card) 94%, transparent)",
  borderColor: "var(--glass-border)",
  color: "var(--foreground)",
  boxShadow: "0 18px 44px -22px rgba(0, 0, 0, 0.55)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  fontFamily: "var(--font-body)",
};

/** The one line he says. Types in beside him, stays until dismissed or
 *  tapped (a tap mid-type finishes it; a tap once typed dismisses it). */
function Bubble({ line, onTalking, onDismiss }: { line: string; onTalking: (talking: boolean) => void; onDismiss: () => void }) {
  const { shown, done, finish } = useTypewriter(line);
  useEffect(() => { onTalking(!done); }, [done, onTalking]);
  return (
    <motion.div
      key={line}
      role="status"
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.16 } }}
      transition={SPRING}
      className="pointer-events-auto relative w-fit max-w-full"
    >
      {/* the tail: toward Dreamy, right of the bubble on desktop, under its
          right end on phones */}
      <span aria-hidden className="absolute -bottom-[6px] right-[22px] h-3 w-3 rotate-45 rounded-[2px] border-r border-b sm:top-1/2 sm:-right-[6px] sm:bottom-auto sm:-translate-y-1/2 sm:border-t sm:border-b-0" style={{ background: surface.background, borderColor: "var(--glass-border)" }} />
      <div
        className="relative flex items-start gap-[8px] rounded-[var(--radius-lg)] border py-[10px] pr-[8px] pl-[14px]"
        style={surface}
        onClick={() => { if (!done) finish(); else onDismiss(); }}
      >
        {/* the whole line holds the bubble's size from the start (the
            Glossary's "reserve" idea), so it does not grow as it types */}
        <p className="relative min-w-0 py-[3px] text-[14px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
          <span className="sr-only">{line}</span>
          <span aria-hidden className="invisible">{line}</span>
          <span aria-hidden className="absolute inset-x-0 top-[3px]">{shown}{!done && <span className="ml-[1px] inline-block h-[14px] w-[2px] translate-y-[2px] animate-pulse rounded-full" style={{ background: "var(--primary)" }} />}</span>
        </p>
        <IconTip label="Dismiss">
          <button type="button" aria-label="Dismiss" onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="dm-quiet flex size-[28px] flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <X className="h-[14px] w-[14px]" aria-hidden />
          </button>
        </IconTip>
      </div>
    </motion.div>
  );
}

/** What he brought back: a poster (a career) or a row (an opportunity),
 *  with its one action. */
function BroughtCard({ payload, showDismiss, onDone }: { payload: DreamyPayload; showDismiss: boolean; onDone: () => void }) {
  const poster = payload.kind === "poster";
  const accent = payload.accent ?? "var(--primary)";
  const act = () => { payload.action.onSelect?.(); onDone(); };
  const button = "dm-solid inline-flex h-[32px] cursor-pointer items-center gap-[6px] rounded-full px-[14px] text-[12.5px] font-semibold";
  const buttonStyle: CSSProperties = { background: "var(--primary)", color: "var(--primary-foreground)" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.16 } }}
      transition={{ ...SPRING, delay: 0.08 }}
      className="pointer-events-auto relative flex w-[292px] max-w-full gap-[12px] overflow-hidden rounded-[var(--radius-lg)] border p-[12px] sm:w-[276px]"
      style={surface}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: accent }} />
      {/* a poster fills its frame; a row's image is usually a logo, so it
          sits whole on a white tile instead of being cropped to a square */}
      <div className={`relative flex-none overflow-hidden ${poster ? "h-[88px] w-[62px] rounded-[8px]" : "h-[48px] w-[48px] rounded-[10px] border"}`} style={poster ? { background: `color-mix(in srgb, ${accent} 18%, var(--card))` } : { background: "#ffffff", borderColor: "var(--glass-border)" }}>
        {payload.image && <Image src={payload.image} alt="" fill sizes="88px" className={poster ? "object-cover" : "object-contain p-[5px]"} draggable={false} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <p className="line-clamp-2 text-[14.5px] leading-[18px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{payload.title}</p>
        {payload.subtitle && <p className="line-clamp-2 text-[12px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{payload.subtitle}</p>}
        <div className="mt-auto flex items-center justify-between gap-[8px] pt-[8px]">
          {payload.action.href && !payload.action.onSelect ? (
            <Link href={payload.action.href} onClick={onDone} className={button} style={buttonStyle}>{payload.action.label}<ChevronRight className="h-[13px] w-[13px]" aria-hidden /></Link>
          ) : (
            <button type="button" onClick={act} className={button} style={buttonStyle}>{payload.action.label}<ChevronRight className="h-[13px] w-[13px]" aria-hidden /></button>
          )}
          {showDismiss && (
            <IconTip label="Dismiss">
              <button type="button" aria-label="Dismiss" onClick={onDone} className="dm-quiet flex size-[28px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                <X className="h-[14px] w-[14px]" aria-hidden />
              </button>
            </IconTip>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Tap Dreamy: "What I'd do next", up to three rows and "Not now". With
 *  nothing to offer he says one calm line and the sheet closes itself.
 *  role=dialog + aria-modal, so HistoryHost gives it a Back step. */
function NextSheet({ actions, queued, onClose, labelId }: { actions: DreamyAction[]; queued: number; onClose: () => void; labelId: string }) {
  const reduced = useReduced();
  const firstRef = useRef<HTMLElement | null>(null);
  const empty = actions.length === 0 && queued === 0;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    document.addEventListener("keydown", onKey, true);
    firstRef.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);
  useEffect(() => {
    if (!empty) return;
    const t = window.setTimeout(onClose, 2200);
    return () => window.clearTimeout(t);
  }, [empty, onClose]);
  const row = "dm-quiet flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] px-[12px] py-[10px] text-left";
  const rows: ReactNode = empty ? (
    <p className="px-[12px] py-[14px] text-[14px] leading-[20px] font-medium" style={{ color: "var(--muted-foreground)" }}>Nothing waiting. Go explore.</p>
  ) : (
    <ul className="flex flex-col gap-[2px]">
      {actions.map((a, i) => {
        const Icon = ACTION_ICON[a.icon ?? "open"];
        const inner = (
          <>
            <span className="flex size-[36px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}><Icon className="h-[16px] w-[16px]" aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] leading-[18px] font-semibold">{a.label}</span>
              {a.hint && <span className="block truncate text-[12px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{a.hint}</span>}
            </span>
            <ChevronRight className="h-[16px] w-[16px] flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
          </>
        );
        const pick = () => { a.onSelect?.(); dreamyDismiss(); onClose(); };
        return (
          <li key={a.id}>
            {a.href && !a.onSelect ? (
              <Link ref={i === 0 ? (el) => { firstRef.current = el; } : undefined} href={a.href} onClick={() => { dreamyDismiss(); onClose(); }} className={row}>{inner}</Link>
            ) : (
              <button ref={i === 0 ? (el) => { firstRef.current = el; } : undefined} type="button" onClick={pick} className={row}>{inner}</button>
            )}
          </li>
        );
      })}
      {actions.length === 0 && queued > 0 && (
        <li>
          <button ref={(el) => { firstRef.current = el; }} type="button" onClick={() => { dreamyPromptNext(); onClose(); }} className={row}>
            <span className="flex size-[36px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}><Eye className="h-[16px] w-[16px]" aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] leading-[18px] font-semibold">Show me what you found</span>
              <span className="block truncate text-[12px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{queued === 1 ? "1 find waiting" : `${queued} finds waiting`}</span>
            </span>
            <ChevronRight className="h-[16px] w-[16px] flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
          </button>
        </li>
      )}
    </ul>
  );
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.14 } }}
      className="pointer-events-auto absolute inset-0 z-[5] flex items-end justify-end px-[16px] sm:px-[24px]"
      style={{ background: "color-mix(in srgb, var(--background) 42%, transparent)", paddingBottom: "calc(var(--dc-tab, 0px) + env(safe-area-inset-bottom, 0px) + 16px + 72px + 12px)" }}
      onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.14 } }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="w-full rounded-[var(--radius-xl)] border p-[10px] sm:w-[340px]"
        style={surface}
        onClick={empty ? onClose : undefined}
      >
        <div className="flex items-center justify-between gap-[12px] px-[12px] pt-[8px] pb-[6px]">
          <h2 id={labelId} className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>What I&apos;d Do Next</h2>
          <IconTip label="Close">
            <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              <X className="h-[16px] w-[16px]" aria-hidden />
            </button>
          </IconTip>
        </div>
        {rows}
        {!empty && (
          <button type="button" onClick={onClose} className="dm-quiet mt-[4px] flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[12px] py-[10px] text-[13.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Not now
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Pose motion per mood. Idle breathes (4s); scouting looks side to side;
 *  waiting holds with a small lift; proud jumps twice then breathes;
 *  puzzled tilts and sways. Reduced motion: still, in the mood's rest pose. */
function poseAnimation(mood: DreamyMood, reduced: boolean, calm: boolean) {
  if (reduced) return { animate: { x: 0, y: 0, rotate: mood === "puzzled" ? -7 : 0, scale: 1 }, transition: { duration: 0.2 } };
  switch (mood) {
    case "scouting":
      return { animate: { x: [0, 7, 7, -6, -6, 0], rotate: [0, 5, 5, -5, -5, 0], y: 0, scale: 1 }, transition: { duration: 3.4, times: [0, 0.2, 0.42, 0.62, 0.84, 1], repeat: Infinity, ease: "easeInOut" as const } };
    case "waiting":
      return { animate: { y: [0, -3, 0], x: 0, rotate: 0, scale: 1 }, transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" as const } };
    case "proud":
      return calm
        ? { animate: { y: [0, -3, 0], scale: [1, 1.03, 1], x: 0, rotate: 0 }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const } }
        : { animate: { y: [0, -14, 0, -9, 0], rotate: [0, -5, 0, 4, 0], scale: [1, 1.1, 1, 1.05, 1], x: 0 }, transition: { duration: 1.3, ease: "easeOut" as const } };
    case "puzzled":
      return { animate: { rotate: [-7, -4, -7], x: 0, y: 0, scale: 1 }, transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const } };
    default:
      return { animate: { y: [0, -3, 0], scale: [1, 1.03, 1], x: 0, rotate: 0 }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const } };
  }
}

export function DreamyCompanion({ anchor = "fixed" }: {
  /** fixed: the real shell (bottom-right of the viewport, above the phone
   *  tab bar). stage: inside a positioned box, for the lab. */
  anchor?: "fixed" | "stage";
}) {
  const s = useDreamy();
  const reduced = useReduced();
  const [sheet, setSheet] = useState(false);
  const [talking, setTalking] = useState(false);
  // proud: the jump plays once per burst, then he breathes in the party
  // pose. calmAt remembers which burst has already settled.
  const [calmAt, setCalmAt] = useState(-1);
  const calm = s.mood === "proud" && calmAt === s.burstNonce;
  const dockControls = useAnimationControls();
  const dreamyRef = useRef<HTMLButtonElement | null>(null);
  const labelId = useId();
  useEffect(() => {
    if (s.mood !== "proud") return;
    const nonce = s.burstNonce;
    const t = window.setTimeout(() => setCalmAt(nonce), 1400);
    return () => window.clearTimeout(t);
  }, [s.mood, s.burstNonce]);

  // Bringing something: he slides in from off-screen right with the card
  // and sets it down beside the dock (the For You nudge, extended to a
  // character). Only the dock moves; he is never duplicated for an exit.
  const payloadId = s.payload ? s.current?.id : null;
  useEffect(() => {
    if (!payloadId) return;
    if (reduced) { dockControls.set({ x: 0, opacity: 1 }); return; }
    dockControls.set({ x: 160, opacity: 0.6 });
    dockControls.start({ x: 0, opacity: 1, transition: { type: "spring", stiffness: 240, damping: 26 } });
  }, [payloadId, reduced, dockControls]);

  const closeSheet = useCallback(() => {
    setSheet(false);
    dreamyRef.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (!sheet || anchor !== "fixed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [sheet, anchor]);

  const pose = poseAnimation(s.mood, reduced, calm);
  const showBadge = s.mood === "waiting" || s.queue.length > 0;
  const label = s.actions.length ? `Dreamy. ${s.actions.length === 1 ? "One thing" : `${s.actions.length} things`} I'd do next` : "Dreamy. What I'd do next";

  return (
    <div
      className={`${anchor === "fixed" ? "fixed [--dc-tab:50px] md:[--dc-tab:58px] lg:[--dc-tab:0px]" : "absolute [--dc-tab:0px]"} pointer-events-none inset-0 z-[60]`}
      style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
    >
      <AnimatePresence>{sheet && <NextSheet key="sheet" actions={s.actions} queued={s.queue.length} onClose={closeSheet} labelId={labelId} />}</AnimatePresence>
      {/* the dock: never wider than 360px, never over the tab bar */}
      <motion.div
        animate={dockControls}
        className="absolute right-[16px] flex max-w-[360px] flex-col items-end gap-[10px] sm:right-[24px] sm:flex-row sm:items-end sm:gap-[12px]"
        style={{ bottom: "calc(var(--dc-tab, 0px) + env(safe-area-inset-bottom, 0px) + 16px)" }}
      >
        {/* the column beside him: 276px on desktop so the whole dock
            (column + 12px gap + his 72px) stays inside 360px */}
        <div className="flex max-w-[min(320px,calc(100vw-32px))] flex-col items-end gap-[10px] sm:max-w-[276px]">
          <AnimatePresence mode="popLayout">
            {s.payload && <BroughtCard key={`card:${s.current?.id}`} payload={s.payload} showDismiss={!s.line} onDone={dreamyDismiss} />}
          </AnimatePresence>
          <AnimatePresence mode="popLayout">
            {s.line && <Bubble key={`line:${s.current?.id ?? s.line}`} line={s.line} onTalking={setTalking} onDismiss={dreamyDismiss} />}
          </AnimatePresence>
        </div>
        <button
          ref={dreamyRef}
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={sheet}
          onClick={() => setSheet(true)}
          className="pointer-events-auto relative size-[72px] flex-none cursor-pointer rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ outlineColor: "var(--accent-subtle)" }}
        >
          <motion.span className="absolute inset-[8px] block" animate={pose.animate} transition={pose.transition} whileHover={reduced ? undefined : { scale: 1.06 }} whileTap={{ scale: 0.96 }}>
            {/* a quick bob while a line types: his "talking" */}
            <motion.span className="absolute inset-0 block" animate={talking && !reduced ? { scaleY: [1, 1.04, 1], y: [0, -1, 0] } : { scaleY: 1, y: 0 }} transition={talking ? { duration: 0.32, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }} style={{ transformOrigin: "50% 100%", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.28))" }}>
              {MOODS.map((m) => (
                <Image key={m} src={POSE[m]} alt="" fill sizes="56px" priority={m === "idle"} draggable={false} className="object-contain transition-opacity duration-200" style={{ opacity: s.mood === m ? 1 : 0 }} />
              ))}
            </motion.span>
          </motion.span>
          <Burst nonce={s.burstNonce} />
          {/* the dock's badge: he is holding something for you */}
          <AnimatePresence>
            {showBadge && (
              <motion.span
                key="badge"
                aria-hidden
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-[8px] right-[8px] flex size-[16px] items-center justify-center rounded-full"
                style={{ background: "var(--background)" }}
              >
                <motion.span className="block size-[10px] rounded-full" style={{ background: "var(--primary)" }} animate={reduced ? { scale: 1 } : { scale: [1, 1.25, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    </div>
  );
}
