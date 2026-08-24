"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Briefcase, ChevronLeft, FileText, RotateCcw, Trophy, X } from "lucide-react";

import { WORLD_COLORS } from "@/components/app/worlds";
import { BossOverlay, CardBody, ChoiceBody, MatchBody, RapidBody, useTypewriter, type Resolve } from "./interactions";
import { ADVANCE_AT, BAND_COLOR, SCORED_BEATS, START_REPUTATION, applyScore, bandFor, endingFor } from "./scoring";
import { TIER_HEADLINE, TIER_SCORE, type Beat, type Level, type Simulation, type Tier } from "./types";

// The player. A dialogue box over a full-bleed scene, the way a visual novel
// works: the art is the room, the box is the voice, and the choices are the
// only thing you can do. Everything about WHAT happens lives in the level data;
// this file only knows how a beat is staged and how reputation moves.

type Phase = "beat" | "feedback" | "ending";

type Result = { tier: Tier; why: string; delta: number };

export function SimulationPlayer({ simulation, level }: { simulation: Simulation; level: Level }) {
  const [index, setIndex] = useState(0);
  const [reputation, setReputation] = useState(START_REPUTATION);
  const [phase, setPhase] = useState<Phase>("beat");
  const [locked, setLocked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [scored, setScored] = useState(0);

  const beat = level.beats[index];
  const accent = WORLD_COLORS[simulation.world] ?? "var(--primary)";

  // Art is sticky: a beat without its own scene keeps the last one, so the
  // unillustrated beats feel like they happen in the same room.
  const scene = sceneFor(level, index);

  const resolve = useCallback<Resolve>(
    (tier, why, id) => {
      if (locked) return;
      setLocked(id ?? "resolved");
      const delta = TIER_SCORE[tier];
      // A short beat on the locked option before the card, so the player sees
      // what they picked land.
      window.setTimeout(() => {
        setReputation((current) => applyScore(current, tier));
        setScored((current) => current + 1);
        setResult({ tier, why, delta });
        setPhase("feedback");
      }, 340);
    },
    [locked],
  );

  const advance = useCallback(() => {
    setLocked(null);
    setResult(null);
    if (index + 1 >= level.beats.length) {
      setPhase("ending");
      return;
    }
    setPhase("beat");
    setIndex(index + 1);
  }, [index, level.beats.length]);

  const restart = () => {
    setIndex(0);
    setReputation(START_REPUTATION);
    setScored(0);
    setLocked(null);
    setResult(null);
    setPhase("beat");
  };

  const band = bandFor(reputation);
  const ending = endingFor(level.endings, reputation);

  return (
    <div
      className="marketing-v2 themeable relative flex h-dvh w-full flex-col overflow-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
    >
      {/* ---- the scene ----
           The art is landscape. Filling a portrait phone with it crops two
           thirds of the picture away, so on phones it becomes an art panel
           across the top and the whole frame is visible; from sm up it goes
           full-bleed behind everything. */}
      <div aria-hidden={!scene.alt} className="pointer-events-none absolute inset-x-0 top-0 h-[38dvh] sm:inset-0 sm:h-auto">
        <Image
          key={scene.src}
          src={scene.src}
          alt={scene.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top sm:object-center motion-safe:animate-[play-scene-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both]"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--background) 78%, transparent) 0%, color-mix(in srgb, var(--background) 28%, transparent) 26%, color-mix(in srgb, var(--background) 72%, transparent) 62%, var(--background) 100%)",
        }}
      />
      {/* Phones: darken only the top strip behind the HUD, and fade the panel's
         bottom edge into the stage so it is a scene, not a pasted rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[38dvh] sm:hidden"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--background) 82%, transparent) 0%, transparent 22%, transparent 68%, var(--background) 100%)",
        }}
      />

      <Hud
        simulation={simulation}
        level={level}
        reputation={reputation}
        band={band}
        scored={scored}
        delta={phase === "feedback" ? (result?.delta ?? null) : null}
        accent={accent}
      />

      {phase === "ending" ? (
        <div className="relative z-10 flex min-h-0 flex-1 items-end justify-center px-3 pb-3 sm:px-5 sm:pb-5">
          <EndingCard ending={ending} reputation={reputation} band={band} simulation={simulation} onReplay={restart} />
        </div>
      ) : (
        // Keyed on the beat: a new beat is a fresh mount, which is what gives
        // the countdown its starting value without an effect resetting state.
        <BeatStage
          key={beat.id}
          beat={beat}
          accent={accent}
          reputation={reputation}
          locked={locked}
          paused={phase !== "beat"}
          onResolve={resolve}
          onNext={advance}
        />
      )}

      {phase === "feedback" && result && (
        <FeedbackSheet beat={beat} result={result} reputation={reputation} onNext={advance} />
      )}
    </div>
  );
}

/** Walks back from the current beat to the last one that carried art. */
function sceneFor(level: Level, index: number): { src: string; alt: string } {
  for (let i = index; i >= 0; i -= 1) {
    const candidate = level.beats[i];
    if (candidate.art) return { src: candidate.art, alt: candidate.artAlt ?? "" };
  }
  return { src: level.cover, alt: "" };
}

/** The stage for one beat, mounted fresh per beat. It owns the shared
 *  countdown, which is why the clock needs no reset: the component simply
 *  starts again. Timing out scores as Wrong, never Risky, because a slow
 *  reader is not the same as someone who invented numbers. */
function BeatStage({
  beat,
  accent,
  reputation,
  locked,
  paused,
  onResolve,
  onNext,
}: {
  beat: Beat;
  accent: string;
  reputation: number;
  locked: string | null;
  paused: boolean;
  onResolve: Resolve;
  onNext: () => void;
}) {
  const seconds = "timer" in beat && typeof beat.timer === "number" ? beat.timer : 0;
  const [remaining, setRemaining] = useState(seconds);
  // The clock survives a pause (the feedback card) by remembering where it got
  // to, rather than restarting the beat's full allowance.
  const remainingRef = useRef(seconds);
  const settled = useRef(false);

  useEffect(() => {
    if (!seconds || paused || locked) return;
    const deadline = Date.now() + remainingRef.current * 1000;
    const tick = window.setInterval(() => {
      const left = Math.max(0, (deadline - Date.now()) / 1000);
      setRemaining(left);
      remainingRef.current = left;
      if (left > 0) return;
      window.clearInterval(tick);
      if (settled.current) return;
      settled.current = true;
      if (beat.kind === "choice") {
        const fallback = beat.choices.find((choice) => choice.tier === "wrong") ?? beat.choices[0];
        onResolve("wrong", "Time ran out. In a real week, silence is its own answer.", fallback.id);
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [seconds, paused, locked, beat, onResolve]);

  return (
    <>
      {seconds > 0 && !paused && <Clock remaining={remaining} total={seconds} />}
      <div className="relative z-10 flex min-h-0 flex-1 items-end justify-center px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="flex w-full max-w-[620px] flex-col gap-[10px]">
          {beat.kind === "choice" && beat.layout === "boss" ? (
            <DialogueBox speaker={beat.speaker} setup={beat.setup} accent={accent} gold>
              <BossOverlay beat={beat} onResolve={onResolve} locked={locked} />
            </DialogueBox>
          ) : (
            <DialogueBox speaker={beat.speaker} setup={beat.setup} accent={accent} tone={"tone" in beat ? beat.tone : undefined}>
              <BeatBody beat={beat} reputation={reputation} locked={locked} remaining={remaining} onResolve={onResolve} onNext={onNext} />
            </DialogueBox>
          )}
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ the body

function BeatBody({
  beat,
  reputation,
  locked,
  remaining,
  onResolve,
  onNext,
}: {
  beat: Beat;
  reputation: number;
  locked: string | null;
  remaining: number;
  onResolve: Resolve;
  onNext: () => void;
}) {
  if (beat.kind === "card") return <CardBody beat={beat} onNext={onNext} reputation={reputation} />;
  if (beat.kind === "choice") return <ChoiceBody beat={beat} onResolve={onResolve} locked={locked} />;
  if (beat.kind === "match") return <MatchBody beat={beat} onResolve={onResolve} />;
  if (beat.kind === "rapid") return <RapidBody beat={beat} onResolve={onResolve} remaining={remaining} />;
  return <ReviewBody title={beat.title} body={beat.body} onNext={onNext} />;
}

/** The Final Review beat: a held breath before the ending. */
function ReviewBody({ title, body, onNext }: { title: string; body: string; onNext: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <p className="text-[19px] leading-[1.2] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </p>
      <p className="text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        {body}
      </p>
      {ready ? (
        <button
          type="button"
          onClick={onNext}
          className="dm-solid w-full cursor-pointer rounded-full px-[18px] py-[13px] text-[16px] font-extrabold motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          See the decision
        </button>
      ) : (
        <p className="flex items-center gap-[8px] text-[14px] font-bold" style={{ color: "var(--accent-subtle)" }}>
          <span className="flex gap-[4px]" aria-hidden>
            {[0, 1, 2, 3].map((dot) => (
              <span
                key={dot}
                className="h-[7px] w-[7px] rounded-full motion-safe:animate-[play-pulse_1.1s_ease-in-out_infinite]"
                style={{ background: "var(--accent-subtle)", animationDelay: `${dot * 140}ms` }}
              />
            ))}
          </span>
          Decision pending
        </p>
      )}
    </div>
  );
}

// -------------------------------------------------------------- the dialogue

function DialogueBox({
  speaker,
  setup,
  accent,
  tone,
  gold,
  children,
}: {
  speaker?: string;
  setup?: string;
  accent: string;
  tone?: "normal" | "conflict" | "alarm";
  gold?: boolean;
  children: React.ReactNode;
}) {
  const line = setup ?? "";
  const { visible, done, skip } = useTypewriter(line);
  const edge = gold
    ? "var(--world-business-money-office)"
    : tone === "alarm"
      ? "var(--destructive)"
      : tone === "conflict"
        ? "var(--world-building-construction)"
        : "var(--color-glass-border-raised)";

  return (
    <div className="relative">
      {speaker && (
        <span
          className="absolute -top-[13px] left-[14px] z-10 rounded-full px-[12px] py-[4px] text-[12px] font-extrabold tracking-[0.08em] uppercase"
          style={{ background: accent, color: "#05070f", fontFamily: "var(--font-display)" }}
        >
          {speaker}
        </span>
      )}
      <div
        onClick={() => !done && skip()}
        className="flex max-h-[76dvh] flex-col gap-[var(--space-3)] overflow-y-auto rounded-[20px] border-2 px-[16px] pt-[20px] pb-[16px] backdrop-blur-[22px] sm:px-[20px] sm:pt-[22px] [scrollbar-width:thin]"
        style={{ background: "color-mix(in srgb, var(--background) 86%, transparent)", borderColor: edge }}
      >
        {line && (
          <p className="text-[15.5px] leading-relaxed font-medium sm:text-[16.5px]" style={{ color: "var(--foreground)" }}>
            {visible}
            {!done && <span className="ml-[2px] inline-block h-[15px] w-[7px] translate-y-[2px] animate-pulse" style={{ background: accent }} aria-hidden />}
          </p>
        )}
        {done && <div className="motion-safe:animate-[fade-slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">{children}</div>}
      </div>
    </div>
  );
}

// -------------------------------------------------------------------- the HUD

function Hud({
  simulation,
  level,
  reputation,
  band,
  scored,
  delta,
  accent,
}: {
  simulation: Simulation;
  level: Level;
  reputation: number;
  band: ReturnType<typeof bandFor>;
  scored: number;
  delta: number | null;
  accent: string;
}) {
  return (
    <header className="relative z-20 flex flex-none flex-col gap-[8px] px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="flex items-center gap-[var(--space-3)]">
        <Link
          href="/play"
          aria-label="Leave the simulation"
          className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
          style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
        >
          <ChevronLeft className="h-[19px] w-[19px]" aria-hidden />
        </Link>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            {simulation.title}
          </span>
          <span className="block truncate text-[11.5px] font-bold tracking-[0.1em] uppercase" style={{ color: accent }}>
            Level {level.n} · {level.role}
          </span>
        </span>
        <span className="relative flex flex-none items-baseline gap-[5px]">
          <span className="text-[19px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: BAND_COLOR[band] }}>
            {reputation}
          </span>
          <span className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
            {band}
          </span>
          {delta !== null && delta !== 0 && (
            <span
              key={reputation}
              className="absolute -top-[16px] right-0 text-[14px] font-extrabold tabular-nums motion-safe:animate-[play-float_1.4s_ease-out_forwards]"
              style={{ color: delta > 0 ? "var(--color-feedback-success)" : "var(--destructive)" }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-[7px]">
        <span className="relative h-[6px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-glass-border-raised)" }}>
          <span
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${reputation}%`, background: `linear-gradient(90deg, ${accent}, ${BAND_COLOR[band]})` }}
          />
        </span>
        <span className="flex flex-none items-center gap-[3px]" aria-label={`${scored} of ${SCORED_BEATS} decisions made`}>
          {Array.from({ length: SCORED_BEATS }, (_, dot) => (
            <span
              key={dot}
              className="h-[5px] w-[5px] rounded-full transition-colors duration-300"
              style={{ background: dot < scored ? accent : "var(--color-glass-border-raised)" }}
            />
          ))}
        </span>
      </div>
    </header>
  );
}

function Clock({ remaining, total }: { remaining: number; total: number }) {
  const fraction = Math.max(0, remaining / total);
  const urgent = fraction < 0.34;
  return (
    <div className="relative z-20 mt-[6px] flex flex-none items-center gap-[8px] px-3 sm:px-5">
      <span className="h-[4px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--color-glass-border-raised)" }}>
        <span
          className="block h-full rounded-full transition-[width] duration-100 ease-linear"
          style={{ width: `${fraction * 100}%`, background: urgent ? "var(--destructive)" : "var(--world-business-money-office)" }}
        />
      </span>
      <span
        className="text-[12px] font-extrabold tabular-nums"
        style={{ color: urgent ? "var(--destructive)" : "var(--muted-foreground)" }}
      >
        {Math.ceil(remaining)}s
      </span>
    </div>
  );
}

// --------------------------------------------------------------- the feedback

function FeedbackSheet({ beat, result, reputation, onNext }: { beat: Beat; result: Result; reputation: number; onNext: () => void }) {
  const good = result.delta > 0;
  const color = good ? "var(--color-feedback-success)" : result.delta <= -6 ? "var(--destructive)" : "var(--world-building-construction)";
  const body = "feedback" in beat ? beat.feedback : "";
  const cta = "feedbackCta" in beat ? beat.feedbackCta : "Continue";
  const skills = "skills" in beat ? beat.skills : [];

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center px-3 pb-3 sm:px-5 sm:pb-5" style={{ background: "color-mix(in srgb, var(--background) 55%, transparent)" }}>
      <div
        className="flex w-full max-w-[620px] flex-col gap-[var(--space-3)] rounded-[20px] border-2 px-[18px] py-[18px] backdrop-blur-[22px] motion-safe:animate-[play-sheet-up_0.44s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{ background: "color-mix(in srgb, var(--background) 92%, transparent)", borderColor: color }}
      >
        <p className="flex items-baseline justify-between gap-[var(--space-3)]">
          <span className="text-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color }}>
            {TIER_HEADLINE[result.tier]}
          </span>
          <span className="text-[14px] font-extrabold tabular-nums" style={{ color }}>
            {result.delta > 0 ? `+${result.delta}` : result.delta} · {reputation}
          </span>
        </p>
        <p className="text-[15.5px] leading-relaxed font-semibold" style={{ color: "var(--foreground)" }}>
          {result.why}
        </p>
        {body && (
          <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {body}
          </p>
        )}
        {skills.length > 0 && (
          <p className="flex flex-wrap gap-[6px]">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold"
                style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--muted-foreground)" }}
              >
                {skill}
              </span>
            ))}
          </p>
        )}
        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="dm-solid w-full cursor-pointer rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the ending

function EndingCard({
  ending,
  reputation,
  band,
  simulation,
  onReplay,
}: {
  ending: ReturnType<typeof endingFor>;
  reputation: number;
  band: ReturnType<typeof bandFor>;
  simulation: Simulation;
  onReplay: () => void;
}) {
  const Icon = ending.advances ? Trophy : reputation >= 60 ? Briefcase : FileText;
  return (
    <div
      className="mb-[6dvh] flex w-full max-w-[560px] flex-col items-center gap-[var(--space-3)] rounded-[22px] border-2 px-[20px] py-[24px] text-center backdrop-blur-[22px] motion-safe:animate-[play-sheet-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{ background: "color-mix(in srgb, var(--background) 92%, transparent)", borderColor: BAND_COLOR[band] }}
    >
      <span className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px]" style={{ background: BAND_COLOR[band], color: "#05070f" }}>
        <Icon className="h-[28px] w-[28px]" aria-hidden />
      </span>
      <p className="text-[15px] font-extrabold tabular-nums" style={{ color: BAND_COLOR[band] }}>
        {reputation} · {band}
      </p>
      <h2 className="text-[26px] leading-[1.1] font-extrabold sm:text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        {ending.headline}
      </h2>
      <p className="text-[15.5px] leading-relaxed" style={{ color: "var(--foreground)" }}>
        {ending.message}
      </p>
      <p className="text-[14px] leading-relaxed font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {ending.subline}
      </p>
      <div className="mt-[var(--space-1)] flex w-full flex-col gap-[8px]">
        {ending.advances ? (
          <span
            className="flex w-full items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold opacity-55"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            aria-disabled
          >
            {ending.primary}
            <ArrowRight className="h-[17px] w-[17px]" aria-hidden />
          </span>
        ) : (
          <button
            type="button"
            onClick={onReplay}
            className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <RotateCcw className="h-[16px] w-[16px]" aria-hidden />
            {ending.primary}
          </button>
        )}
        {ending.advances && (
          <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            The Analyst level is next. It is not built yet.
          </p>
        )}
        <Link
          href="/play"
          className="dm-quiet flex w-full cursor-pointer items-center justify-center gap-[7px] rounded-full border px-[18px] py-[12px] text-[15px] font-bold"
          style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
        >
          <X className="h-[15px] w-[15px]" aria-hidden />
          Back to Games
        </Link>
      </div>
      <p className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {ADVANCE_AT} and above advances. {simulation.firm} applies the same bar at every level.
      </p>
    </div>
  );
}
