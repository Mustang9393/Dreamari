"use client";

// The optional run-up before a career simulation (5 Oct 2026; brief: "before
// Level 1 of every game begins, an optional How to Play button... move the
// instructional learning outside of the simulation itself... 3 quick
// optional screens, skippable, clear, and game-like"; then the career's own
// optional mini lesson; then "transition clearly into the actual
// simulation").
//
// Never a gate (Chandu: "for demo purposes the how to play and optional mini
// games don't gatekeep the career simulation... open, replay all of them
// whenever I want and skip whatever I want"): the start card starts the
// level in one tap, every screen has Skip, and the game's own ? menu reopens
// any part of this at any time without touching the run.
//
// How to Play is the same three screens for every career, filled from that
// career's ladder and skills, so it can become the standard.

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, ChevronLeft, CircleHelp, HeartPulse, Landmark, Lock, Play, Store, TrendingUp, Users, Wallet, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { IconTip } from "@/components/app/IconTip";
import { CheckBody } from "./interactions";
import { SKILL_MEANING } from "./skills";
import { playCorrect, playFlip, playSelect, playSweep, playWrong } from "./sound";
import type { Level, PreGame, Simulation } from "./types";

export type PreGameMode = "start" | "howto" | "lesson" | "handoff";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

// The cinematic redesign (5 Oct 2026; Chandu, with four reference shots:
// "use the same copy from these images, and also redesign the UI... the
// screenshots have better spacing and more immersive cinematic screens...
// don't copy it, but let's improve the design"). Every screen now plays over
// the career's own cover art (sharp on the title screen, blurred and dimmed
// behind the teaching screens, with a slow push-in), one big uppercase title
// per screen, generous spacing, and the button sits right under its content
// instead of pinned to the bottom edge.

/** One glass panel recipe for every visual on these screens. */
const GLASS = {
  background: "linear-gradient(180deg, color-mix(in srgb, var(--card) 74%, transparent), color-mix(in srgb, var(--card) 54%, transparent))",
  border: "1px solid color-mix(in srgb, var(--foreground) 12%, transparent)",
  boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--foreground) 8%, transparent), 0 30px 80px -40px rgba(0,0,0,0.8)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
} as const;

const MUTED = "color-mix(in srgb, var(--foreground) 64%, transparent)";

export function PreGameFlow({
  simulation,
  level,
  preGame,
  accent,
  initial,
  inRun,
  onClose,
  onStart,
}: {
  simulation: Simulation;
  level: Level;
  preGame: PreGame;
  accent: string;
  initial: PreGameMode;
  /** Opened from the ? menu mid-run: closing returns to the run, and the
   *  hand-off card is skipped (the story is already under way). */
  inRun: boolean;
  onClose: () => void;
  /** Leaves the run-up and starts (or resumes) the level. */
  onStart: () => void;
}) {
  const [mode, setMode] = useState<PreGameMode>(initial);
  const [step, setStep] = useState(0);
  const reduceMotion = useReducedMotion();
  const lessonScreens = useMemo(() => preGame.lesson?.screens ?? [], [preGame.lesson]);
  // Copy that follows the career: the points a decision is worth, and what
  // "start" means here (an internship, a first shift...).
  const points = level.points ?? 5;
  const startLabel = preGame.startLabel ?? `Start Level ${level.n}`;
  const ladder = preGame.ladder.length ? preGame.ladder : [...simulation.levels.map((l) => l.role), ...simulation.upcoming];
  // The three places a run can land, ranges read off the level's own
  // endings so the screen can never disagree with the scoring.
  const tiers = useMemo(() => {
    const endings = [...level.endings].sort((a, b) => b.min - a.min);
    const colors = ["var(--color-feedback-success)", "var(--world-business-money-office)", "var(--destructive)"];
    const fallback = [{ label: "Level up" }, { label: "Retry" }, { label: "Terminated" }];
    return endings.slice(0, 3).map((ending, index) => ({
      range: index === 0 ? `${ending.min}+` : `${ending.min}–${endings[index - 1].min - 1}`,
      ...(preGame.tiers?.[index] ?? fallback[index]),
      color: colors[index],
    }));
  }, [level.endings, preGame.tiers]);

  const go = useCallback((next: PreGameMode) => {
    playFlip();
    setStep(0);
    setMode(next);
  }, []);
  // Leaving the run-up for the story: the hand-off card first when starting
  // fresh, straight back into the run when it was opened mid-run.
  const toStory = useCallback(() => {
    if (inRun) {
      onClose();
      return;
    }
    go("handoff");
  }, [go, inRun, onClose]);

  const total = mode === "howto" ? 3 : mode === "lesson" ? lessonScreens.length : 0;
  const next = useCallback(() => {
    if (mode === "howto") {
      // The mini lesson "appears after How to Play and before the
      // simulation begins" (IB 101 doc); Skip still jumps straight in.
      if (step < 2) { playFlip(); setStep((s) => s + 1); } else if (preGame.lesson && !inRun) go("lesson"); else toStory();
    } else if (mode === "lesson") {
      if (step < lessonScreens.length - 1) { playFlip(); setStep((s) => s + 1); } else toStory();
    }
  }, [mode, step, lessonScreens.length, toStory, preGame.lesson, inRun, go]);
  const back = useCallback(() => {
    if (step > 0) { playFlip(); setStep((s) => s - 1); } else if (mode !== "start") go("start");
  }, [step, mode, go]);
  const skip = useCallback(() => { playSelect(); if (inRun) onClose(); else go("handoff"); }, [go, inRun, onClose]);

  // The hand-off plays once, then the story begins.
  useEffect(() => {
    if (mode !== "handoff") return;
    playSweep();
    const timer = window.setTimeout(onStart, 2100);
    return () => window.clearTimeout(timer);
  }, [mode, onStart]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); if (inRun) onClose(); else go("handoff"); }
      if (mode === "howto" || (mode === "lesson" && lessonScreens[step]?.kind !== "check")) {
        if (event.key === "ArrowRight" || event.key === "Enter") { event.preventDefault(); next(); }
        if (event.key === "ArrowLeft") { event.preventDefault(); back(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, step, next, back, go, inRun, onClose, lessonScreens]);

  const screen = mode === "lesson" ? lessonScreens[step] : undefined;
  const photo = screen?.image;
  const backdrop = photo ?? simulation.cover;
  // Sharp art on the title screen and behind a lesson's own photo; the
  // teaching screens blur and dim it so the copy always wins.
  const filter = mode === "start"
    ? "brightness(0.78) saturate(1.05)"
    : photo && screen?.kind !== "check"
      ? "blur(2px) brightness(0.55)"
      : "blur(18px) brightness(0.42) saturate(1.2)";
  const ctaLabel = mode === "howto"
    ? step === 2 ? (inRun ? "Back to the game" : preGame.lesson ? "Next" : (preGame.howToCta ?? startLabel)) : "Next"
    : (screen?.cta ?? "Next");

  return (
    <div
      className="fixed inset-0 z-[65] flex flex-col overflow-hidden [overflow:clip]"
      // The run-up wears the career's world colour, never the app blue
      // (Chandu, 5 Oct 2026: "use the career world specific colors for the
      // CTA etc, not the blue anywhere"). Re-pointing --primary here also
      // recolours the shared quick-check button inside the lesson.
      style={{ background: "var(--background)", ["--primary" as string]: accent, ["--primary-foreground" as string]: "var(--background)" }}
      role="dialog" aria-label={mode === "howto" ? "How to Play" : mode === "lesson" ? preGame.lesson?.title : `${simulation.title} start`}>
      <AnimatePresence initial={false}>
        <motion.div key={backdrop} aria-hidden className="absolute inset-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <motion.div
            className="absolute inset-0"
            initial={{ scale: reduceMotion ? 1.06 : 1.14 }}
            animate={{ scale: 1.06 }}
            transition={{ duration: reduceMotion ? 0 : 18, ease: "easeOut" }}
          >
            <Image src={backdrop} alt="" fill priority sizes="100vw" className="object-cover" style={{ filter, transition: "filter 0.7s ease" }} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      {/* Grade: the title screen fades to the page from below so its words
         sit on solid ground; the teaching screens get the career's glow at
         the top and a vignette that pulls the eye to the centre. */}
      <div
        aria-hidden
        className="absolute inset-0 transition-[background] duration-700"
        style={{
          background: mode === "start"
            ? "linear-gradient(to top, var(--background) 0%, color-mix(in srgb, var(--background) 94%, transparent) 26%, color-mix(in srgb, var(--background) 45%, transparent) 56%, transparent 78%), linear-gradient(to bottom, color-mix(in srgb, var(--background) 55%, transparent), transparent 22%)"
            : `radial-gradient(60% 45% at 50% 22%, color-mix(in srgb, ${accent} 16%, transparent), transparent 72%), radial-gradient(130% 95% at 50% 42%, transparent 50%, color-mix(in srgb, var(--background) 92%, transparent) 100%), color-mix(in srgb, var(--background) 34%, transparent)`,
        }}
      />

      {mode === "start" && (
        <header className="relative z-10 flex px-[16px] pt-[16px] sm:px-[28px] sm:pt-[24px]">
          {inRun ? (
            <button type="button" onClick={() => { playSelect(); onClose(); }} className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-full px-[16px] py-[9px] text-[13px] font-bold" style={{ ...GLASS, color: "var(--foreground)" }}>
              <X className="h-[14px] w-[14px]" aria-hidden /> Close
            </button>
          ) : (
            <Link href="/play" className="dm-quiet flex items-center gap-[6px] rounded-full px-[16px] py-[9px] text-[13px] font-bold" style={{ ...GLASS, color: "var(--foreground)" }}>
              <ChevronLeft className="h-[15px] w-[15px]" aria-hidden /> Back
            </Link>
          )}
        </header>
      )}
      {total > 0 && (
        <header className="relative z-10 mx-auto flex w-full max-w-[780px] items-center gap-[14px] px-[16px] pt-[18px] sm:px-[24px] sm:pt-[30px]">
          <IconTip label="Back">
            <button type="button" onClick={back} aria-label="Back" className="dm-quiet flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full" style={{ ...GLASS, color: "var(--foreground)" }}>
              <ChevronLeft className="h-[18px] w-[18px]" aria-hidden />
            </button>
          </IconTip>
          <div className="min-w-0 flex-1">
            <div className="h-[6px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 14%, transparent)" }} role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1} aria-label={`Screen ${step + 1} of ${total}`}>
              <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${((step + 1) / total) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 60%, transparent), ${accent})`, boxShadow: `0 0 14px color-mix(in srgb, ${accent} 70%, transparent)` }} />
            </div>
          </div>
          <span className="flex-none text-[12.5px] font-extrabold tabular-nums" style={{ color: MUTED }}>{step + 1}/{total}</span>
          <button type="button" onClick={skip} className="dm-quiet flex-none cursor-pointer rounded-full px-[10px] py-[6px] text-[12px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "var(--foreground)" }}>
            {inRun ? "Close" : "Skip"}
          </button>
        </header>
      )}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-[16px] sm:px-[24px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${step}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.38, ease: EASE }}
            className={`mx-auto w-full max-w-[780px] ${mode === "start" ? "mt-auto pt-[24px] pb-[clamp(28px,8vh,80px)]" : "my-auto py-[clamp(24px,5vh,56px)]"}`}
          >
            {mode === "start" && <StartCard inRun={inRun} simulation={simulation} level={level} preGame={preGame} accent={accent} startLabel={startLabel} onStart={() => { playSelect(); if (inRun) onClose(); else go("handoff"); }} onHowTo={() => go("howto")} onLesson={() => go("lesson")} />}
            {mode === "howto" && step === 0 && <MissionScreen ladder={ladder} accent={accent} />}
            {mode === "howto" && step === 1 && <ReputationScreen points={points} tiers={tiers} />}
            {mode === "howto" && step === 2 && <SkillsScreen skills={preGame.skills} accent={accent} />}
            {mode === "lesson" && screen && <LessonScreen screen={screen} accent={accent} startLabel={startLabel} onDone={toStory} />}
            {mode === "handoff" && <Handoff level={level} accent={accent} line={preGame.handoffLine} />}
            {(mode === "howto" || (mode === "lesson" && screen?.kind !== "check")) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4, ease: EASE }} className="mt-[clamp(28px,5vh,44px)] flex flex-col items-center gap-[14px]">
                <Cta label={ctaLabel} onClick={() => { playSelect(); next(); }} />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** The one primary button: gradient, a slow sheen, label in caps. */
function Cta({ label, onClick, icon = "arrow" }: { label: string; onClick: () => void; icon?: "arrow" | "play" }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="dm-solid group relative flex w-full max-w-[440px] cursor-pointer items-center justify-center gap-[10px] overflow-hidden rounded-[16px] px-[22px] py-[17px] text-[14.5px] font-extrabold tracking-[0.14em] uppercase"
      style={{
        background: "linear-gradient(100deg, var(--primary), color-mix(in srgb, var(--primary) 64%, white))",
        color: "var(--primary-foreground)",
        boxShadow: "0 20px 50px -20px color-mix(in srgb, var(--primary) 90%, transparent), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      {icon === "play" && <Play className="h-[15px] w-[15px]" fill="currentColor" aria-hidden />}
      {label}
      {icon === "arrow" && <ArrowRight className="h-[16px] w-[16px] transition-transform duration-200 group-hover:translate-x-[3px]" aria-hidden />}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-20deg] motion-safe:animate-[next-step-sheen_3.6s_ease-in-out_infinite]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }} />
    </motion.button>
  );
}

/** The title screen: the career's art full-bleed, the role, the career's
 *  name, one start button. Nothing else to read (Chandu, 5 Oct 2026: "do we
 *  need so much copy on the Investment Banker screen?"); How to Play and
 *  the mini lesson sit underneath as two quiet links. */
function StartCard({ inRun, simulation, level, preGame, accent, startLabel, onStart, onHowTo, onLesson }: { inRun: boolean; simulation: Simulation; level: Level; preGame: PreGame; accent: string; startLabel: string; onStart: () => void; onHowTo: () => void; onLesson: () => void }) {
  const rise = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6, ease: EASE } });
  return (
    <div className="flex w-full flex-col items-center text-center">
      <motion.span {...rise(0.1)} className="text-[13px] font-extrabold tracking-[0.34em] uppercase" style={{ color: accent }}>
        {level.role}
      </motion.span>
      <motion.h1 {...rise(0.18)} className="mt-[10px] text-[clamp(46px,11vw,104px)] leading-[0.92] font-extrabold tracking-[-0.02em]" style={{ ...DISPLAY, textShadow: "0 12px 60px rgba(0,0,0,0.55)" }}>
        {simulation.title}
      </motion.h1>
      <motion.div {...rise(0.3)} className="mt-[34px] flex w-full max-w-[440px] flex-col items-center gap-[14px]">
        <Cta label={inRun ? "Back to the game" : startLabel} icon="play" onClick={onStart} />
        <div className="flex items-center gap-[6px]">
          <QuietLink icon={<CircleHelp className="h-[15px] w-[15px]" aria-hidden />} label="How to Play" accent={accent} onClick={onHowTo} />
          {preGame.lesson && (
            <>
              <span aria-hidden className="h-[4px] w-[4px] rounded-full" style={{ background: MUTED }} />
              <QuietLink icon={<BookOpen className="h-[15px] w-[15px]" aria-hidden />} label={preGame.lesson.title} accent={accent} onClick={onLesson} />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function QuietLink({ icon, label, accent, onClick }: { icon: React.ReactNode; label: string; accent: string; onClick: () => void }) {
  return (
    <button type="button" onClick={() => { playSelect(); onClick(); }} className="dm-quiet flex cursor-pointer items-center gap-[7px] rounded-full px-[12px] py-[8px] text-[13.5px] font-bold" style={{ color: "color-mix(in srgb, var(--foreground) 82%, transparent)" }}>
      <span style={{ color: accent }}>{icon}</span>
      {label}
    </button>
  );
}

/** One title and one line per screen: the visual does the explaining.
 *  (Chandu, 5 Oct 2026: "reduce copy, anything redundant, there's too much
 *  to read on each screen... you're copying the reference images instead
 *  of innovation.") */
function ScreenHead({ title, line }: { title: string; line: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.h2
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="text-[clamp(40px,9vw,72px)] leading-[0.95] font-extrabold tracking-[-0.02em]"
        style={{ ...DISPLAY, textShadow: "0 8px 50px rgba(0,0,0,0.5)" }}
      >
        {title}
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-[14px] max-w-[34ch] text-[17px] leading-snug font-semibold sm:text-[19px]" style={{ color: "color-mix(in srgb, var(--foreground) 78%, transparent)" }}>
        {line}
      </motion.p>
    </div>
  );
}

/** How to Play 1: the career as a track. You stand on the first stop, the
 *  next one is lit, the line between you fills in. No captions: the lock
 *  and the light say "locked" and "next". */
function MissionScreen({ ladder, accent }: { ladder: string[]; accent: string }) {
  const rungs = ladder.slice(0, 4);
  const n = rungs.length;
  return (
    <div className="flex flex-col items-center gap-[clamp(28px,5vh,44px)]">
      <ScreenHead title="Your mission" line="Each level is a new job. Earn the next one." />
      <motion.ol
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
        className="relative m-0 grid w-full max-w-[680px] list-none rounded-[26px] px-[10px] pt-[26px] pb-[22px] sm:px-[24px] sm:pt-[32px] sm:pb-[26px]"
        style={{ ...GLASS, gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        <span aria-hidden className="absolute top-[49px] h-[2px] sm:top-[59px]" style={{ left: `calc(${50 / n}% + 4px)`, right: `calc(${50 / n}% + 4px)`, background: "repeating-linear-gradient(90deg, color-mix(in srgb, var(--foreground) 22%, transparent) 0 6px, transparent 6px 12px)" }} />
        <motion.span
          aria-hidden
          className="absolute top-[48px] h-[4px] rounded-full sm:top-[58px]"
          style={{ left: `calc(${50 / n}% + 4px)`, background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 35%, transparent))`, boxShadow: `0 0 16px color-mix(in srgb, ${accent} 70%, transparent)` }}
          initial={{ width: 0 }}
          animate={{ width: `calc(${100 / n}% - 8px)` }}
          transition={{ delay: 0.7, duration: 1, ease: EASE }}
        />
        {rungs.map((role, index) => {
          const here = index === 0;
          const nextUp = index === 1;
          return (
            <motion.li key={role} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1, duration: 0.45, ease: EASE }} className="relative flex flex-col items-center gap-[10px] px-[3px] text-center">
              <motion.span
                className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full sm:h-[54px] sm:w-[54px]"
                animate={nextUp ? { y: [0, -3, 0] } : undefined}
                transition={nextUp ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 1.6 } : undefined}
                style={
                  here
                    ? { background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${accent} 55%, white), ${accent})`, color: "var(--background)", boxShadow: `0 0 0 5px color-mix(in srgb, ${accent} 18%, transparent), 0 0 34px color-mix(in srgb, ${accent} 60%, transparent)` }
                    : nextUp
                      ? { background: "color-mix(in srgb, var(--card) 90%, transparent)", border: `2px solid color-mix(in srgb, ${accent} 60%, transparent)`, color: accent }
                      : { background: "color-mix(in srgb, var(--foreground) 5%, transparent)", border: "1px solid color-mix(in srgb, var(--foreground) 14%, transparent)", color: MUTED }
                }
              >
                {here && (
                  <motion.span aria-hidden className="absolute inset-0 rounded-full border-2" style={{ borderColor: accent }} animate={{ scale: [1, 1.5], opacity: [0.7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
                )}
                {here ? <span className="text-[13px] font-extrabold tracking-[0.06em] uppercase" style={DISPLAY}>You</span> : <Lock className="h-[15px] w-[15px] sm:h-[17px] sm:w-[17px]" aria-hidden />}
              </motion.span>
              <span className="text-[11.5px] leading-tight font-extrabold tracking-[0.06em] uppercase sm:text-[13px]" style={{ color: here || nextUp ? "var(--foreground)" : MUTED }}>{role}</span>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}

/** How to Play 2: you try it. Two buttons move a live meter; the number
 *  takes the colour of the outcome it would land you in, and that outcome's
 *  name lights up on the track. Showing beats telling: no tiles to read. */
function ReputationScreen({ points, tiers }: { points: number; tiers: { range: string; label: string; color: string }[] }) {
  const [value, setValue] = useState(50);
  const [delta, setDelta] = useState<{ n: number; key: number } | null>(null);
  const nudge = useCallback((n: number, sound = true) => {
    setValue((v) => Math.max(0, Math.min(100, v + n)));
    setDelta((d) => ({ n, key: (d?.key ?? 0) + 1 }));
    if (sound) { if (n > 0) playCorrect(); else playWrong(); }
  }, []);
  // Opens with one good call already landing, so the meter is alive before
  // the student touches it.
  useEffect(() => {
    const timer = window.setTimeout(() => nudge(points, false), 900);
    return () => window.clearTimeout(timer);
  }, [nudge, points]);
  const floors = tiers.map((tier) => parseInt(tier.range, 10));
  const top = floors[0] ?? 85;
  const mid = floors[1] ?? 40;
  const zone = value >= top ? 0 : value >= mid ? 1 : 2;
  const color = tiers[zone]?.color ?? "var(--primary)";
  const zones = [
    { tier: 2, from: 0, to: mid },
    { tier: 1, from: mid, to: top },
    { tier: 0, from: top, to: 100 },
  ];
  return (
    <div className="flex flex-col items-center gap-[clamp(28px,5vh,44px)]">
      <ScreenHead title="Reputation" line="Every choice moves it. Try it." />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: EASE }} className="w-full max-w-[600px] rounded-[26px] px-[18px] pt-[22px] pb-[20px] sm:px-[28px] sm:pt-[26px]" style={GLASS}>
        <div className="relative flex items-end justify-center gap-[12px]">
          <motion.span key={value} initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 16 }} className="text-[64px] leading-none font-extrabold tabular-nums sm:text-[76px]" style={{ ...DISPLAY, color, transition: "color 0.35s", textShadow: `0 0 40px color-mix(in srgb, ${color} 45%, transparent)` }}>
            {value}
          </motion.span>
          <AnimatePresence>
            {delta && (
              <motion.span
                key={delta.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: [0, 1, 1, 0], y: [12, 0, -6, -14] }}
                transition={{ duration: 1.3, times: [0, 0.2, 0.7, 1] }}
                className="absolute top-[2px] left-[calc(50%+56px)] rounded-full px-[10px] py-[2px] text-[15px] font-extrabold tabular-nums sm:left-[calc(50%+66px)]"
                style={{ background: delta.n > 0 ? "var(--color-feedback-success)" : "var(--destructive)", color: "var(--background)" }}
              >
                {delta.n > 0 ? `+${delta.n}` : delta.n}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="relative mt-[22px] h-[12px]">
          <div className="absolute inset-0 flex overflow-hidden rounded-full">
            {zones.map((z) => (
              <span key={z.tier} style={{ width: `${z.to - z.from}%`, background: `color-mix(in srgb, ${tiers[z.tier]?.color} ${zone === z.tier ? 30 : 14}%, transparent)`, transition: "background 0.35s" }} />
            ))}
          </div>
          <motion.div className="absolute inset-y-0 left-0 rounded-full" animate={{ width: `${value}%` }} transition={{ duration: 0.6, ease: EASE }} style={{ background: `linear-gradient(90deg, color-mix(in srgb, ${color} 55%, transparent), ${color})`, boxShadow: `0 0 18px color-mix(in srgb, ${color} 65%, transparent)`, transition: "background 0.35s, box-shadow 0.35s" }} />
          {[mid, top].map((floor) => (
            <span key={floor} aria-hidden className="absolute -top-[4px] -bottom-[4px] w-[2px] rounded-full" style={{ left: `${floor}%`, background: "color-mix(in srgb, var(--foreground) 40%, transparent)" }} />
          ))}
        </div>
        {/* Each outcome named under its own stretch of the track, lit when
           the meter is in it. */}
        <div className="relative mt-[12px] h-[34px]">
          {zones.map((z) => (
            <span
              key={z.tier}
              // The end labels pin to the track's ends so a long name
              // ("Bag Secured", "Off orientation") never clips on a phone.
              className={`absolute top-0 flex flex-col leading-tight whitespace-nowrap ${z.tier === 2 ? "left-0 items-start text-left" : z.tier === 0 ? "right-0 items-end text-right" : "-translate-x-1/2 items-center text-center"}`}
              style={{ left: z.tier === 1 ? `${(z.from + z.to) / 2}%` : undefined, opacity: zone === z.tier ? 1 : 0.45, transition: "opacity 0.35s" }}
            >
              <span className="text-[10.5px] font-extrabold tracking-[0.12em] uppercase sm:text-[11.5px]" style={{ color: tiers[z.tier]?.color }}>{tiers[z.tier]?.label}</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: MUTED }}>{tiers[z.tier]?.range}</span>
            </span>
          ))}
        </div>
        <div className="mt-[16px] grid grid-cols-2 gap-[10px]">
          <button type="button" onClick={() => nudge(-points)} className="dm-quiet cursor-pointer rounded-[14px] px-[12px] py-[13px] text-[14px] font-extrabold" style={{ background: "color-mix(in srgb, var(--destructive) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--destructive) 40%, transparent)", color: "var(--foreground)" }}>
            Bad call <span className="tabular-nums" style={{ color: "var(--destructive)" }}>&minus;{points}</span>
          </button>
          <button type="button" onClick={() => nudge(points)} className="dm-quiet cursor-pointer rounded-[14px] px-[12px] py-[13px] text-[14px] font-extrabold" style={{ background: "color-mix(in srgb, var(--color-feedback-success) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--color-feedback-success) 40%, transparent)", color: "var(--foreground)" }}>
            Good call <span className="tabular-nums" style={{ color: "var(--color-feedback-success)" }}>+{points}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** How to Play 3: a few of the job's skills as chips; tapping one says what
 *  it means (every skill chip in the game is decodable). */
function SkillsScreen({ skills, accent }: { skills: string[]; accent: string }) {
  const shown = skills.slice(0, 3);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-[clamp(26px,4.5vh,40px)]">
      <ScreenHead title="Real skills" line="Every choice trains one. Tap a skill to see it." />
      <div className="flex w-full max-w-[640px] flex-col items-center gap-[18px]">
        <div className="flex flex-wrap justify-center gap-[10px]">
          {shown.map((skill, index) => {
            const active = open === skill;
            return (
              <motion.button
                key={skill}
                type="button"
                aria-pressed={active}
                onClick={() => { playSelect(); setOpen(active ? null : skill); }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + index * 0.14, type: "spring", stiffness: 420, damping: 18 }}
                className="dm-quiet cursor-pointer rounded-full px-[18px] py-[11px] text-[12px] font-extrabold tracking-[0.12em] uppercase sm:text-[12.5px]"
                style={active
                  ? { background: `color-mix(in srgb, ${accent} 24%, var(--card))`, border: `1px solid ${accent}`, color: "var(--foreground)", boxShadow: `0 0 24px -6px color-mix(in srgb, ${accent} 70%, transparent)` }
                  : { ...GLASS, color: "var(--foreground)" }}
              >
                {skill}
              </motion.button>
            );
          })}
        </div>
        {/* Space held for the meaning so the button below never jumps. */}
        <div className="flex min-h-[52px] w-full max-w-[460px] items-start justify-center text-center">
          <AnimatePresence mode="wait">
            {open && (
              <motion.p key={open} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="text-[16px] leading-snug font-semibold" style={{ color: "var(--foreground)" }}>
                {SKILL_MEANING[open] ?? ""}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const DIAGRAM_ICON = { store: Store, gap: Wallet, bank: Landmark, grow: TrendingUp, investors: Users } as const;

function LessonHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="text-center text-[clamp(32px,6.4vw,54px)] leading-[1.02] font-extrabold tracking-[-0.01em]" style={{ ...DISPLAY, textShadow: "0 8px 50px rgba(0,0,0,0.5)" }}>
      {children}
    </motion.h2>
  );
}

function LessonScreen({ screen, accent, startLabel, onDone }: { screen: NonNullable<PreGame["lesson"]>["screens"][number]; accent: string; startLabel: string; onDone: () => void }) {
  if (screen.kind === "say") {
    const SayIcon = screen.icon === "care" ? HeartPulse : Landmark;
    return (
      // Over a lesson's own photo the copy sits on a glass panel: bare text
      // over a bright room read badly (direct feedback, 5 Oct 2026: "the
      // legibility is bad").
      <div className={`mx-auto flex max-w-[640px] flex-col items-center gap-[20px] text-center ${screen.image ? "rounded-[28px] px-[22px] py-[30px] sm:px-[40px] sm:py-[40px]" : ""}`} style={screen.image ? GLASS : undefined}>
        <motion.span initial={{ opacity: 0, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px]" style={{ background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${accent} 36%, transparent), color-mix(in srgb, ${accent} 12%, transparent))`, border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`, color: accent, boxShadow: `0 0 40px -8px color-mix(in srgb, ${accent} 60%, transparent)` }}>
          <SayIcon className="h-[34px] w-[34px]" aria-hidden />
        </motion.span>
        <LessonHeading>{screen.heading}</LessonHeading>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="max-w-[36ch] text-[18px] leading-relaxed font-semibold sm:text-[20px]" style={{ color: "color-mix(in srgb, var(--foreground) 86%, transparent)" }}>{screen.body}</motion.p>
      </div>
    );
  }
  if (screen.kind === "diagram") {
    // "Use the visual diagram here so the copy stays light." The doc's one
    // sentence, in its own four pieces, builds down a money path: each piece
    // lands in turn, joined by a line a coin of light keeps travelling down,
    // so the reader sees the money move from the investors to the stores.
    // The money gap is the one step in a warning colour (it is the problem
    // the bank solves) and the result lands in green. Redesigned 5 Oct 2026
    // ("the example UI can also be different, I'm not sure I like that it's
    // the best version it can be"): the old 2x2 tile grid read as four
    // unrelated facts and broke the sentence apart.
    return (
      <div className="flex flex-col items-center gap-[clamp(22px,4vh,34px)]">
        <LessonHeading>{screen.heading}</LessonHeading>
        <div className="w-full max-w-[560px] rounded-[26px] px-[18px] py-[22px] sm:px-[30px] sm:py-[28px]" style={GLASS}>
          <ol className="m-0 flex list-none flex-col p-0">
            {screen.steps.map((step, index) => {
              const Icon = DIAGRAM_ICON[step.icon];
              const tint = step.icon === "gap" ? "var(--destructive)" : step.icon === "grow" ? "var(--color-feedback-success)" : accent;
              const last = index === screen.steps.length - 1;
              const landAt = 0.25 + index * 0.6;
              return (
                <motion.li key={step.text} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: landAt, duration: 0.5, ease: EASE }} className={`relative flex items-center gap-[16px] ${last ? "" : "pb-[22px]"}`}>
                  {!last && (
                    <span aria-hidden className="absolute top-[52px] bottom-[2px] left-[25px] w-[2px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }}>
                      <motion.span className="absolute left-0 h-[12px] w-full rounded-full" style={{ background: accent, boxShadow: `0 0 10px ${accent}` }} initial={{ top: "-12px" }} animate={{ top: ["-12px", "100%"] }} transition={{ delay: landAt + 0.6, duration: 1.2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }} />
                    </span>
                  )}
                  <span
                    className="relative flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[17px]"
                    style={{
                      background: `color-mix(in srgb, ${tint} 16%, transparent)`,
                      border: step.icon === "gap" ? `1.5px dashed color-mix(in srgb, ${tint} 70%, transparent)` : `1px solid color-mix(in srgb, ${tint} 45%, transparent)`,
                      color: tint,
                      boxShadow: last ? `0 0 30px -4px color-mix(in srgb, ${tint} 70%, transparent)` : undefined,
                    }}
                  >
                    <Icon className="h-[23px] w-[23px]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-[17px] leading-snug font-semibold sm:text-[19px]" style={{ color: step.icon === "grow" || step.icon === "gap" ? tint : "var(--foreground)" }}>
                    {step.text}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }
  // The quick check: the game's own answer interaction, unscored, unlimited
  // tries, and its button is the hand-off into the story.
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-[20px]">
      <LessonHeading>{screen.heading}</LessonHeading>
      <div className="rounded-[24px] px-[16px] py-[18px] sm:px-[24px]" style={GLASS}>
        <CheckBody
          beat={{
            kind: "check",
            id: "pregame-check",
            method: screen.method ?? "drag",
            question: screen.question,
            options: screen.options.map((option) => ({ ...option, why: option.why ?? "" })),
            cta: screen.cta ?? startLabel,
          }}
          onNext={onDone}
        />
      </div>
    </div>
  );
}

/** The clear hand-off into the story: the level's own title card, then the
 *  first screen. */
function Handoff({ level, accent, line = "Your internship starts now." }: { level: Level; accent: string; line?: string }) {
  return (
    <div className="flex flex-col items-center gap-[12px] py-[10vh] text-center">
      <motion.span initial={{ opacity: 0, letterSpacing: "0.5em" }} animate={{ opacity: 1, letterSpacing: "0.22em" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="text-[13px] font-extrabold uppercase" style={{ color: accent }}>
        Level {level.n} · {level.role}
      </motion.span>
      <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }} className="text-[40px] leading-[1.05] font-extrabold sm:text-[56px]" style={DISPLAY}>
        {level.title}
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-[17px] font-semibold" style={{ color: "color-mix(in srgb, var(--foreground) 80%, transparent)" }}>
        {line}
      </motion.p>
      <motion.span aria-hidden initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 1.5, ease: "easeInOut" }} className="mt-[10px] block h-[3px] w-[180px] origin-left rounded-full" style={{ background: accent }} />
    </div>
  );
}
