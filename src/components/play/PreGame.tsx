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
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, CircleHelp, Coins, HeartPulse, Landmark, Lock, Play, Store, TrendingUp, Users, Wallet, X } from "lucide-react";
import Image from "next/image";

import { CheckBody } from "./interactions";
import { playCorrect, playFlip, playSelect, playSweep } from "./sound";
import type { Level, PreGame, Simulation } from "./types";

export type PreGameMode = "start" | "howto" | "lesson" | "handoff";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;

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
  const lessonScreens = useMemo(() => preGame.lesson?.screens ?? [], [preGame.lesson]);
  // Copy that follows the career: the points a decision is worth, and what
  // "start" means here (an internship, a first shift...).
  const points = level.points ?? 5;
  const startLabel = preGame.startLabel ?? `Start Level ${level.n}`;
  const ladder = preGame.ladder.length ? preGame.ladder : [...simulation.levels.map((l) => l.role), ...simulation.upcoming];

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
  const afterHowTo = useCallback(() => (preGame.lesson ? go("lesson") : toStory()), [go, preGame.lesson, toStory]);

  const total = mode === "howto" ? 3 : mode === "lesson" ? lessonScreens.length : 0;
  const next = useCallback(() => {
    if (mode === "howto") {
      if (step < 2) { playFlip(); setStep((s) => s + 1); } else afterHowTo();
    } else if (mode === "lesson") {
      if (step < lessonScreens.length - 1) { playFlip(); setStep((s) => s + 1); } else toStory();
    }
  }, [mode, step, lessonScreens.length, afterHowTo, toStory]);
  const back = useCallback(() => {
    if (step > 0) { playFlip(); setStep((s) => s - 1); } else if (mode !== "start") go(inRun ? mode : "start");
  }, [step, mode, go, inRun]);

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

  const lastLessonCheck = mode === "lesson" && lessonScreens[step]?.kind === "check";

  return (
    <div className="fixed inset-0 z-[65] flex flex-col" role="dialog" aria-label={mode === "howto" ? "How to Play" : mode === "lesson" ? preGame.lesson?.title : `${simulation.title} start`}>
      {/* A dark, lit stage over the blurred office: game-like, and the room
         is still there behind it, so this reads as the doorway to the job. */}
      {/* A lesson screen can carry its own picture (RN v2: the patient room),
         sharp behind a say/diagram screen and blurred behind the check. */}
      {mode === "lesson" && lessonScreens[step]?.image && (
        <div aria-hidden className="absolute inset-0">
          <Image key={lessonScreens[step].image} src={lessonScreens[step].image!} alt="" fill sizes="100vw" className="object-cover motion-safe:animate-[fade-slide-up_0.5s_ease-out_both]" style={{ filter: lessonScreens[step].kind === "check" ? "blur(10px) brightness(0.6)" : "brightness(0.85)" }} />
        </div>
      )}
      <div aria-hidden className="absolute inset-0" style={{ background: mode === "lesson" && lessonScreens[step]?.image ? "linear-gradient(to bottom, color-mix(in srgb, var(--background) 55%, transparent) 0%, color-mix(in srgb, var(--background) 25%, transparent) 40%, color-mix(in srgb, var(--background) 88%, transparent) 100%)" : `radial-gradient(70% 60% at 50% 38%, color-mix(in srgb, ${accent} 16%, transparent), transparent 70%), color-mix(in srgb, var(--background) 82%, transparent)`, backdropFilter: mode === "lesson" && lessonScreens[step]?.image ? undefined : "blur(18px)", WebkitBackdropFilter: mode === "lesson" && lessonScreens[step]?.image ? undefined : "blur(18px)" }} />

      {mode !== "handoff" && (
        <header className="relative z-10 flex items-center justify-between gap-[12px] px-[16px] pt-[16px] sm:px-[24px] sm:pt-[20px]">
          <span className="flex min-w-0 items-center gap-[10px]">
            {mode !== "start" && (
              <button type="button" onClick={back} aria-label="Back" className="dm-quiet flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}>
                <ChevronLeft className="h-[18px] w-[18px]" aria-hidden />
              </button>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[11.5px] font-extrabold tracking-[0.14em] uppercase" style={{ color: accent }}>
                {mode === "start" ? simulation.title : mode === "howto" ? "How to Play" : preGame.lesson?.title}
              </span>
              {total > 0 && (
                <span className="mt-[6px] flex gap-[5px]" aria-label={`${step + 1} of ${total}`}>
                  {Array.from({ length: total }, (_, i) => (
                    <span key={i} className="h-[4px] rounded-full transition-[width,background] duration-300" style={{ width: i === step ? 26 : 12, background: i <= step ? accent : "var(--color-glass-border-raised)" }} />
                  ))}
                </span>
              )}
            </span>
          </span>
          <button
            type="button"
            onClick={() => { playSelect(); if (mode === "start") onClose(); else if (inRun) onClose(); else go("handoff"); }}
            className="dm-quiet flex flex-none cursor-pointer items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[13px] font-bold"
            style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
          >
            {mode === "start" ? (inRun ? "Close" : "Skip") : inRun ? "Back to the game" : (preGame.skipLabel ?? "Skip to the internship")}
            {mode === "start" || inRun ? <X className="h-[14px] w-[14px]" aria-hidden /> : <ArrowRight className="h-[14px] w-[14px]" aria-hidden />}
          </button>
        </header>
      )}

      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-[16px] py-[16px] sm:px-[24px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${step}`}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[640px]"
          >
            {mode === "start" && <StartCard inRun={inRun} simulation={simulation} level={level} accent={accent} hasLesson={Boolean(preGame.lesson)} lessonTitle={preGame.lesson?.title} onStart={() => { playSelect(); if (inRun) onClose(); else go("handoff"); }} onHowTo={() => go("howto")} onLesson={() => go("lesson")} />}
            {mode === "howto" && step === 0 && <MissionScreen ladder={ladder} accent={accent} />}
            {mode === "howto" && step === 1 && <ReputationScreen accent={accent} points={points} />}
            {mode === "howto" && step === 2 && <SkillsScreen skills={preGame.skills} total={preGame.skillTotal} accent={accent} points={points} />}
            {mode === "lesson" && lessonScreens[step] && <LessonScreen screen={lessonScreens[step]} accent={accent} startLabel={startLabel} onDone={toStory} />}
            {mode === "handoff" && <Handoff level={level} accent={accent} line={preGame.handoffLine} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {(mode === "howto" || (mode === "lesson" && !lastLessonCheck)) && (
        <footer className="relative z-10 flex justify-center px-[16px] pb-[20px] sm:pb-[28px]">
          <button
            type="button"
            onClick={() => { playSelect(); next(); }}
            className="dm-solid flex w-full max-w-[640px] cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[14px] text-[15.5px] font-semibold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {mode === "howto" && step === 2
              ? preGame.lesson ? `Next: ${preGame.lesson.title}` : inRun ? "Back to the game" : startLabel
              : mode === "lesson" ? (lessonScreens[step]?.cta ?? "Next") : "Next"}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </footer>
      )}
    </div>
  );
}

function StartCard({ inRun, simulation, level, accent, hasLesson, lessonTitle, onStart, onHowTo, onLesson }: { inRun: boolean; simulation: Simulation; level: Level; accent: string; hasLesson: boolean; lessonTitle?: string; onStart: () => void; onHowTo: () => void; onLesson: () => void }) {
  return (
    <div className="flex flex-col items-center gap-[14px] text-center">
      <span className="rounded-full px-[12px] py-[4px] text-[11.5px] font-extrabold tracking-[0.16em] uppercase" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>
        Level {level.n} · {level.role}
      </span>
      <h2 className="text-[34px] leading-[1.05] font-extrabold sm:text-[46px]" style={DISPLAY}>{level.title}</h2>
      <p className="max-w-[44ch] text-[16px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--foreground) 80%, transparent)" }}>{level.blurb}</p>
      <button
        type="button"
        onClick={onStart}
        className="dm-solid mt-[8px] flex w-full max-w-[380px] cursor-pointer items-center justify-center gap-[10px] rounded-[var(--radius-md)] px-[18px] py-[15px] text-[16px] font-bold"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)", boxShadow: `0 16px 40px -16px color-mix(in srgb, var(--primary) 80%, transparent)` }}
      >
        <Play className="h-[17px] w-[17px]" fill="currentColor" aria-hidden />
        {inRun ? "Back to the game" : `Start Level ${level.n}`}
      </button>
      <div className="flex w-full max-w-[380px] gap-[10px]">
        <OptionalButton icon={<CircleHelp className="h-[17px] w-[17px]" aria-hidden />} label="How to Play" sub="3 quick screens" accent={accent} onClick={onHowTo} />
        {hasLesson && <OptionalButton icon={<BookOpen className="h-[17px] w-[17px]" aria-hidden />} label={lessonTitle ?? "Mini lesson"} sub="1 minute" accent={accent} onClick={onLesson} />}
      </div>
      <p className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Both are optional. You can open them any time from the ? in the game.</p>
      <span className="sr-only">{simulation.title}</span>
    </div>
  );
}

function OptionalButton({ icon, label, sub, accent, onClick }: { icon: React.ReactNode; label: string; sub: string; accent: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dm-quiet flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-[4px] rounded-[var(--radius-md)] border px-[10px] py-[12px] text-center"
      style={{ borderColor: `color-mix(in srgb, ${accent} 35%, var(--color-glass-border-raised))`, background: "color-mix(in srgb, var(--card) 70%, transparent)" }}
    >
      <span style={{ color: accent }}>{icon}</span>
      <span className="text-[14px] leading-tight font-bold" style={{ color: "var(--foreground)" }}>{label}</span>
      <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{sub}</span>
    </button>
  );
}

function ScreenHead({ eyebrow, title, line, accent }: { eyebrow: string; title: string; line: string; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-[8px] text-center">
      <span className="text-[11.5px] font-extrabold tracking-[0.2em] uppercase" style={{ color: accent }}>{eyebrow}</span>
      <h2 className="text-[30px] leading-[1.08] font-extrabold sm:text-[38px]" style={DISPLAY}>{title}</h2>
      <p className="max-w-[42ch] text-[16px] leading-relaxed sm:text-[17px]" style={{ color: "color-mix(in srgb, var(--foreground) 82%, transparent)" }}>{line}</p>
    </div>
  );
}

/** How to Play 1: the career is a climb. The rungs stack bottom-up; a token
 *  marked YOU sits on the first and keeps reaching for the next. */
function MissionScreen({ ladder, accent }: { ladder: string[]; accent: string }) {
  const rungs = ladder.slice(0, 6);
  return (
    <div className="flex flex-col items-center gap-[22px]">
      <ScreenHead eyebrow="Your mission" title="Earn the next role." line="Every level is a new job in this career. Do it well and you move up to the next one." accent={accent} />
      <ol className="relative m-0 flex w-full max-w-[340px] list-none flex-col-reverse gap-[8px] p-0">
        <span aria-hidden className="absolute top-[18px] bottom-[18px] left-[19px] w-[2px] rounded-full" style={{ background: "var(--color-glass-border-raised)" }} />
        {rungs.map((role, index) => {
          const here = index === 0;
          const nextUp = index === 1;
          return (
            <motion.li
              key={role}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + index * 0.08, duration: 0.3 }}
              className="relative flex items-center gap-[12px] rounded-[12px] border px-[10px] py-[8px]"
              style={{
                borderColor: here || nextUp ? `color-mix(in srgb, ${accent} ${here ? 70 : 35}%, transparent)` : "transparent",
                background: here ? `color-mix(in srgb, ${accent} 14%, transparent)` : "transparent",
              }}
            >
              <span className="relative z-[1] flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full" style={{ background: here ? accent : nextUp ? "var(--card)" : "var(--background)", border: `2px solid ${here || nextUp ? accent : "var(--color-glass-border-raised)"}` }}>
                {!here && !nextUp && <Lock className="h-[10px] w-[10px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />}
              </span>
              <span className="flex-1 text-left text-[15px] font-bold" style={{ color: here || nextUp ? "var(--foreground)" : "var(--muted-foreground)" }}>
                Level {index + 1} · {role}
              </span>
              {here && <span className="rounded-full px-[9px] py-[2px] text-[10.5px] font-extrabold tracking-[0.1em] uppercase" style={{ background: accent, color: "#05070f" }}>You</span>}
              {nextUp && (
                <motion.span
                  className="flex items-center gap-[4px] text-[11px] font-extrabold tracking-[0.08em] uppercase"
                  style={{ color: accent }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  Next
                </motion.span>
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

/** How to Play 2: the score, shown moving (+6 then -6), then the three
 *  places it can land. */
function ReputationScreen({ accent, points }: { accent: string; points: number }) {
  const [value, setValue] = useState(50);
  const [chip, setChip] = useState<number | null>(null);
  useEffect(() => {
    const seq: [number, number][] = [[50 + points, points], [50, -points]];
    let i = 0;
    const tick = () => {
      const [v, d] = seq[i % seq.length];
      setChip(d);
      window.setTimeout(() => setValue(v), 450);
      i += 1;
    };
    const first = window.setTimeout(tick, 700);
    const loop = window.setInterval(tick, 2200);
    return () => { window.clearTimeout(first); window.clearInterval(loop); };
  }, [points]);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const rows = [
    { range: "85+", label: "Advance", note: "You earn the next role.", color: "var(--color-feedback-success)" },
    { range: "40–84", label: "Retry", note: "No offer. Replay the level.", color: "var(--world-business-money-office)" },
    { range: "0–39", label: "Terminated", note: "The job ends here.", color: "var(--destructive)" },
  ];
  return (
    <div className="flex flex-col items-center gap-[20px]">
      <ScreenHead eyebrow="Reputation" title="Your choices move your score." line="Good decisions raise it. Bad ones lower it. At the end, your score decides what happens next." accent={accent} />
      <span className="relative flex h-[112px] w-[112px] items-center justify-center">
        <svg viewBox="0 0 112 112" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="56" cy="56" r={radius} fill="none" stroke="var(--color-glass-border-raised)" strokeWidth="7" />
          <circle cx="56" cy="56" r={radius} fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
        </svg>
        <span className="text-[34px] font-extrabold tabular-nums" style={{ ...DISPLAY, color: accent }}>{value}</span>
        <AnimatePresence>
          {chip !== null && (
            <motion.span
              key={`${chip}-${value}`}
              initial={{ opacity: 0, y: 30, scale: 1.1 }}
              animate={{ opacity: [0, 1, 1, 0], y: [30, 0, -18, -26] }}
              transition={{ duration: 1.1, times: [0, 0.25, 0.7, 1] }}
              className="absolute -top-[6px] -right-[30px] rounded-full px-[10px] py-[3px] text-[14px] font-extrabold tabular-nums"
              style={{ background: chip > 0 ? "var(--color-feedback-success)" : "var(--world-building-construction)", color: "#05070f" }}
            >
              {chip > 0 ? `+${chip}` : chip}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <div className="flex w-full max-w-[420px] flex-col gap-[8px]">
        {rows.map((row, index) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center gap-[12px] rounded-[12px] border px-[14px] py-[10px]"
            style={{ borderColor: `color-mix(in srgb, ${row.color} 45%, transparent)`, background: `color-mix(in srgb, ${row.color} 9%, transparent)` }}
          >
            <span className="w-[54px] flex-none text-[15px] font-extrabold tabular-nums" style={{ color: row.color }}>{row.range}</span>
            <span className="min-w-0 text-left">
              <span className="block text-[14.5px] font-extrabold uppercase" style={{ color: "var(--foreground)" }}>{row.label}</span>
              <span className="block text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{row.note}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** How to Play 3: a decision lands and its skills tick in, the way every
 *  verdict in the game shows them. */
function SkillsScreen({ skills, total, accent, points }: { skills: string[]; total: number; accent: string; points: number }) {
  return (
    <div className="flex flex-col items-center gap-[20px]">
      <ScreenHead eyebrow="Career skills" title="Build real skills." line="Every decision practices a skill people use in this job. After each one, you will see which skills you built." accent={accent} />
      <div className="w-full max-w-[420px] rounded-[var(--radius-lg)] border-2 px-[16px] py-[14px] text-left" style={{ borderColor: "var(--color-feedback-success)", background: "color-mix(in srgb, var(--background) 88%, transparent)" }}>
        <p className="flex items-center justify-between">
          <span className="text-[18px] font-extrabold" style={{ ...DISPLAY, color: "var(--color-feedback-success)" }}>Strong move!</span>
          <span className="text-[13px] font-extrabold" style={{ color: "var(--color-feedback-success)" }}>+{points} Reputation</span>
        </p>
        <div className="mt-[10px] flex flex-wrap gap-[6px]">
          {skills.slice(0, 4).map((skill, index) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.25, type: "spring", stiffness: 420, damping: 18 }}
              onAnimationComplete={index === 0 ? () => playCorrect() : undefined}
              className="flex items-center gap-[5px] rounded-[var(--radius-md)] border px-[10px] py-[4px] text-[12.5px] font-bold"
              style={{ borderColor: `color-mix(in srgb, ${accent} 45%, transparent)`, color: "var(--foreground)", background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
            >
              <Check className="h-[12px] w-[12px]" aria-hidden style={{ color: accent }} />
              {skill}
            </motion.span>
          ))}
        </div>
      </div>
      <p className="text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        {total} career skills to build across the game.
      </p>
    </div>
  );
}

const DIAGRAM_ICON = { store: Store, gap: Wallet, bank: Landmark, grow: TrendingUp, investors: Users } as const;

function LessonScreen({ screen, accent, startLabel, onDone }: { screen: NonNullable<PreGame["lesson"]>["screens"][number]; accent: string; startLabel: string; onDone: () => void }) {
  if (screen.kind === "say") {
    const SayIcon = screen.icon === "care" ? HeartPulse : Landmark;
    return (
      <div className="flex flex-col items-center gap-[18px] text-center">
        <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px]" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>
          <SayIcon className="h-[34px] w-[34px]" aria-hidden />
        </span>
        <h2 className="text-[30px] leading-[1.1] font-extrabold sm:text-[38px]" style={DISPLAY}>{screen.heading}</h2>
        <p className="max-w-[36ch] text-[18px] leading-relaxed font-semibold sm:text-[20px]" style={{ color: "color-mix(in srgb, var(--foreground) 86%, transparent)" }}>{screen.body}</p>
      </div>
    );
  }
  if (screen.kind === "diagram") {
    // "Use the visual diagram here so the copy stays light": four panels,
    // landing in turn, joined by arrows; the money gap is the one panel in a
    // warning colour, because it is the problem the bank solves.
    return (
      <div className="flex flex-col items-center gap-[20px]">
        <h2 className="text-center text-[30px] leading-[1.1] font-extrabold sm:text-[36px]" style={DISPLAY}>{screen.heading}</h2>
        <ol className="m-0 grid w-full list-none grid-cols-2 gap-[10px] p-0 sm:flex sm:items-stretch sm:gap-0">
          {screen.steps.map((step, index) => {
            const Icon = DIAGRAM_ICON[step.icon];
            const tint = step.icon === "gap" ? "var(--destructive)" : step.icon === "grow" ? "var(--color-feedback-success)" : accent;
            return (
              <li key={step.text} className="flex min-w-0 items-stretch sm:flex-1">
                <motion.span
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex min-w-0 flex-1 flex-col items-center gap-[10px] rounded-[14px] border px-[10px] py-[14px] text-center"
                  style={{ borderColor: `color-mix(in srgb, ${tint} 40%, transparent)`, background: `color-mix(in srgb, ${tint} 10%, transparent)` }}
                >
                  <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${tint} 22%, transparent)`, color: tint }}>
                    <Icon className="h-[22px] w-[22px]" aria-hidden />
                  </span>
                  <span className="text-[14px] leading-[18px] font-semibold" style={{ color: "var(--foreground)" }}>{step.text}</span>
                </motion.span>
                {index < screen.steps.length - 1 && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 + index * 0.35 }} className="mx-[2px] hidden flex-none self-center sm:block" aria-hidden>
                    {index === 1 ? <Coins className="h-[18px] w-[18px]" style={{ color: "var(--muted-foreground)" }} /> : <ChevronRight className="h-[18px] w-[18px]" style={{ color: "var(--muted-foreground)" }} />}
                  </motion.span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
  // The quick check: the game's own drag-to-answer, unscored, unlimited tries,
  // and its button is the hand-off into the story.
  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="text-center text-[28px] leading-[1.1] font-extrabold sm:text-[34px]" style={DISPLAY}>{screen.heading}</h2>
      <div className="rounded-[var(--radius-lg)] border px-[16px] py-[16px] sm:px-[22px]" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 86%, transparent)" }}>
        <CheckBody
          beat={{
            kind: "check",
            id: "pregame-check",
            method: "drag",
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
