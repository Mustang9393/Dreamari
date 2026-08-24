"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Briefcase, ChevronLeft, ChevronRight, FileText, RotateCcw, Trophy, Volume2, VolumeX, X } from "lucide-react";

import { WORLD_COLORS } from "@/components/app/worlds";
import { BossOverlay, CardBody, ChoiceBody, MatchBody, RapidBody, useTypewriter, type Resolve } from "./interactions";
import { clearRun, progressSnapshot, readRun, saveRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import { mutedSnapshot, playSelect, playSweep, serverMutedSnapshot, setMuted, subscribeMuted } from "./sound";
import { ADVANCE_AT, BAND_COLOR, SCORED_BEATS, START_REPUTATION, applyScore, bandFor, endingFor } from "./scoring";
import { TIER_HEADLINE, TIER_SCORE, type Beat, type DreamyPose, type Level, type Simulation, type Tier } from "./types";

// The player. A dialogue box over a full-bleed scene, the way a visual novel
// works: the art is the room, the box is the voice, and the choices are the
// only thing you can do. Everything about WHAT happens lives in the level data;
// this file only knows how a beat is staged and how reputation moves.

type Phase = "beat" | "feedback" | "ending";

type Result = { tier: Tier; why: string; delta: number };

export function SimulationPlayer({ simulation, level }: { simulation: Simulation; level: Level }) {
  // AUTOSAVE. Storage is read as an external store, and the run is DERIVED from
  // it rather than seeded into useState: a state initialiser runs during
  // hydration, when useSyncExternalStore still reports the server snapshot, so
  // seeding silently threw the save away and every resume started at beat one.
  // Deriving means the saved run appears as soon as the store hydrates.
  const saved = readRun(useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot), simulation.id, level.n);
  const resumable = saved && saved.index > 0 && saved.index < level.beats.length ? saved : null;
  const base = resumable
    ? { index: resumable.index, reputation: resumable.reputation, scored: resumable.scored }
    : { index: 0, reputation: START_REPUTATION, scored: 0 };

  /** null until the player does something; then it owns the run. */
  const [run, setRun] = useState<{ index: number; reputation: number; scored: number } | null>(null);
  const live = run ?? base;
  const { index, reputation, scored } = live;
  const patchRun = (change: Partial<typeof base>) => setRun((current) => ({ ...(current ?? base), ...change }));
  // Showing the resumed state exactly while the save is still what is on screen.
  const resumed = run === null && resumable !== null;

  const [phase, setPhase] = useState<Phase>("beat");
  const [locked, setLocked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

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
      // Hold on the board before the card: long enough to see what you picked
      // land, and longer on a miss so the revealed right answer is readable
      // before the explanation covers it.
      const hold = tier === "wrong" || tier === "risky" ? 1150 : 420;
      window.setTimeout(() => {
        patchRun({ reputation: applyScore(reputation, tier), scored: scored + 1 });
        setResult({ tier, why, delta });
        setPhase("feedback");
      }, hold);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, reputation, scored],
  );

  const advance = useCallback(() => {
    setLocked(null);
    setResult(null);
    if (index + 1 >= level.beats.length) {
      // The run is over: an ending should never be resumed into.
      clearRun(simulation.id, level.n);
      setPhase("ending");
      return;
    }
    setPhase("beat");
    patchRun({ index: index + 1 });
    saveRun({ gameId: simulation.id, level: level.n, index: index + 1, reputation, scored });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, level.beats.length, level.n, simulation.id, reputation, scored]);

  const restart = () => {
    // "Reputation resets to 50 and the level restarts from screen 1" -- the
    // rules tab. A fresh run must not inherit the old save.
    clearRun(simulation.id, level.n);
    setRun({ index: 0, reputation: START_REPUTATION, scored: 0 });
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
      {/* ONE plane with a slow zoom. The two-plane parallax is gone: the
         background plate still contains the characters that were lifted out of
         it, so any relative motion dragged a ghost of them out from behind the
         cutout, and no fill I tried (diffusion, colour propagation, horizontal
         cloning) erased them cleanly enough to ship. A soft push is the effect
         that survives that honestly. If character-free plates ever arrive from
         the artist, real parallax is a small change. */}
      <div aria-hidden={!scene.alt} className="pointer-events-none relative order-2 min-h-0 w-full flex-1 overflow-hidden sm:absolute sm:inset-0 sm:order-none">
        <div className="absolute inset-0 motion-safe:animate-[play-camera_26s_ease-in-out_infinite]">
          <SceneLayers src={scene.src} alt={scene.alt} />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={{
          // Light touch on purpose. The art is the point and the copy already
          // sits in its own boxes, so the scrim only has to keep the HUD
          // readable at the top and soften the box's edge at the bottom.
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--background) 62%, transparent) 0%, transparent 16%, transparent 58%, color-mix(in srgb, var(--background) 72%, transparent) 88%, var(--background) 100%)",
        }}
      />
      {/* Phones: darken only the top strip behind the HUD, and fade the panel's
         bottom edge into the stage so it is a scene, not a pasted rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 sm:hidden"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--background) 68%, transparent) 0%, transparent 15%, transparent 66%, var(--background) 100%)",
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
        <div className="relative z-10 order-3 flex min-h-0 flex-1 items-end justify-center px-3 pb-3 sm:order-none sm:px-5 sm:pb-5">
          <EndingCard ending={ending} reputation={reputation} band={band} simulation={simulation} onReplay={restart} />
        </div>
      ) : (
        // Keyed on the beat: a new beat is a fresh mount, which is what gives
        // the countdown its starting value without an effect resetting state.
        <BeatStage
          key={beat.id}
          beat={beat}
          accent={accent}
          cast={level.cast}
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

      {/* Says so, rather than silently dropping them mid-level. */}
      {resumed && phase === "beat" && (
        <div className="absolute inset-x-0 top-[74px] z-30 flex justify-center px-3">
          <span
            className="flex items-center gap-[10px] rounded-full border px-[14px] py-[7px] text-[12.5px] font-bold backdrop-blur-[10px] motion-safe:animate-[play-sheet-up_0.4s_ease-out_both]"
            style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
          >
            Picked up where you left off
            <button type="button" onClick={restart} className="dm-quiet cursor-pointer underline" style={{ color: "var(--muted-foreground)" }}>
              Start over
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

/** The scene, on phones.
 *
 *  The frame is CONTAINED so nobody in it gets cropped out. The space that
 *  leaves is not filled with anything: the picture simply DISSOLVES into the
 *  page's own dark, losing focus as it goes. A magnified blurred copy behind it
 *  (the previous attempt) put a grey haze on screen and read as a second image;
 *  the reference is a photo with no boundary at all, melting into flat colour.
 *
 *  Three layers, sharp on top: each is masked with a long vertical falloff, and
 *  the further out a layer reaches the blurrier it is, so focus and opacity fade
 *  together. Nothing is opaque behind them, which is what keeps it clean.
 *
 *  Desktop is wide enough to cover without losing anyone, so it stays one sharp
 *  layer with no masking at all.
 */
const SCENE_FADE = [
  // blur, and the vertical band this layer occupies as a share of the height
  { blur: 22, stop: 0.02, full: 0.1 },
  { blur: 9, stop: 0.08, full: 0.2 },
  { blur: 0, stop: 0.16, full: 0.34 },
] as const;

/** Long, symmetric vertical falloff: transparent at the very edge, solid by
 *  `full`, and the same coming back up. */
function fadeMask(stop: number, full: number): string {
  const a = (stop * 100).toFixed(1);
  const b = (full * 100).toFixed(1);
  return `linear-gradient(to bottom, transparent ${a}%, #000 ${b}%, #000 ${(100 - Number(b)).toFixed(1)}%, transparent ${(100 - Number(a)).toFixed(1)}%)`;
}

function SceneLayers({ src, alt }: { src: string; alt: string }) {
  return (
    <>
      {SCENE_FADE.map((band) => (
        <Image
          key={`${src}-${band.blur}`}
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden
          className="object-contain object-center sm:hidden"
          style={{
            filter: band.blur ? `blur(${band.blur}px)` : undefined,
            maskImage: fadeMask(band.stop, band.full),
            WebkitMaskImage: fadeMask(band.stop, band.full),
          }}
        />
      ))}
      {/* Desktop: one sharp cover layer, nothing stacked, nothing masked. */}
      <Image
        key={src}
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="hidden object-cover object-center motion-safe:animate-[play-scene-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both] sm:block"
      />
    </>
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
  cast,
  reputation,
  locked,
  paused,
  onResolve,
  onNext,
}: {
  beat: Beat;
  accent: string;
  cast?: Record<string, string>;
  reputation: number;
  locked: string | null;
  paused: boolean;
  onResolve: Resolve;
  onNext: () => void;
}) {
  // RPG pacing: read the situation first, advance when YOU are ready, and only
  // then does the question and its options appear. The situation stays on
  // screen underneath, because several beats cannot be answered without it.
  // Cards and the review beat are not staged -- their "setup" is a label like
  // "Intern • Week 1", not a paragraph to read.
  // Dreamy narrates. "Narrator" was a separate voice on screen even though it
  // is the same guide talking, so it speaks as Dreamy with Dreamy's face.
  const narrated = beat.speaker === "Dreamy" || beat.speaker === "Narrator";
  const speaker = narrated ? "Dreamy" : beat.speaker;
  const portrait = speaker ? cast?.[speaker] : undefined;
  const stageable = Boolean(beat.setup) && (beat.kind === "choice" || beat.kind === "match" || beat.kind === "rapid");
  const [revealed, setRevealed] = useState(!stageable);

  const seconds = "timer" in beat && typeof beat.timer === "number" ? beat.timer : 0;
  const [remaining, setRemaining] = useState(seconds);
  // The clock survives a pause (the feedback card) by remembering where it got
  // to, rather than restarting the beat's full allowance.
  const remainingRef = useRef(seconds);
  const settled = useRef(false);

  useEffect(() => {
    // A timed beat must not burn its clock while the player is still reading
    // the situation. The timer starts when the question does.
    if (!seconds || paused || locked || !revealed) return;
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
  }, [seconds, paused, locked, revealed, beat, onResolve]);

  return (
    <>
      {seconds > 0 && !paused && revealed && <Clock remaining={remaining} total={seconds} />}
      <div className="relative z-10 order-3 flex min-h-0 flex-none items-end justify-center px-3 pb-3 sm:order-none sm:flex-1 sm:px-5 sm:pb-5">
        {/* Dreamy is positioned OVER the box's top edge rather than stacked
           above it. In the flow it claimed its own ~84px row on a phone, which
           is the black gap that opened up between the art and the question. */}
        <div className="relative flex w-full max-w-[620px] flex-col">
          {narrated && <Dreamy pose={beat.pose ?? "happy"} />}
          {beat.kind === "choice" && beat.layout === "boss" ? (
            <DialogueBox speaker={speaker} portrait={portrait} setup={beat.setup} accent={accent} gold held={!revealed} onAdvance={() => setRevealed(true)}>
              <BossOverlay beat={beat} onResolve={onResolve} locked={locked} />
            </DialogueBox>
          ) : (
            <DialogueBox
              speaker={speaker}
              portrait={portrait}
              setup={beat.setup}
              accent={accent}
              tone={"tone" in beat ? beat.tone : undefined}
              held={!revealed}
              onAdvance={() => setRevealed(true)}
            >
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

/** Dreamy, standing beside the box it is speaking from. Nearest plane, so it
 *  moves most against the scene; idles with a slow float; the pose comes from
 *  the beat rather than being one permanent face. Sits on the RIGHT so it never
 *  collides with the speaker plate on the left. */
function Dreamy({ pose }: { pose: DreamyPose }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-[10px] bottom-[calc(100%-26px)] z-20 sm:right-[18px] sm:bottom-[calc(100%-32px)]"
    >
      {/* A gentle hover, not the ambient cloud drift: that one travels 24px and
         made Dreamy look detached from the line it is speaking. */}
      <span className="block motion-safe:animate-[play-hover_4.4s_ease-in-out_infinite]">
        <Image
          key={pose}
          src={`/images/dreamy/v2/dreamy-${pose}.png`}
          alt=""
          width={144}
          height={144}
          className="h-[96px] w-[96px] drop-shadow-[0_12px_26px_rgba(0,0,0,0.6)] motion-safe:animate-[play-sheet-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both] sm:h-[128px] sm:w-[128px]"
        />
      </span>
    </div>
  );
}

// -------------------------------------------------------------- the dialogue

function DialogueBox({
  speaker,
  portrait,
  setup,
  accent,
  tone,
  gold,
  held,
  onAdvance,
  children,
}: {
  speaker?: string;
  /** Face for the speaker, when this level's cast has one. */
  portrait?: string;
  setup?: string;
  accent: string;
  tone?: "normal" | "conflict" | "alarm";
  gold?: boolean;
  /** true while the player is still reading: the question stays hidden. */
  held?: boolean;
  onAdvance?: () => void;
  children: React.ReactNode;
}) {
  const line = setup ?? "";
  const { visible, done, skip } = useTypewriter(line);

  // One gesture does the obvious thing: finish the line if it is still typing,
  // otherwise open the question. Tap the box, or press space / enter / right.
  const step = useCallback(() => {
    if (!done) {
      skip();
      return;
    }
    if (held && onAdvance) {
      playSelect();
      onAdvance();
    }
  }, [done, held, onAdvance, skip]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter" || event.key === "ArrowRight" || event.key.toLowerCase() === "a") {
        // Never hijack a key the player is aiming at a button.
        if (document.activeElement instanceof HTMLButtonElement) return;
        event.preventDefault();
        step();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);
  const edge = gold
    ? "var(--world-business-money-office)"
    : tone === "alarm"
      ? "var(--destructive)"
      : tone === "conflict"
        ? "var(--world-building-construction)"
        : "var(--color-glass-border-raised)";

  return (
    <div className="relative">
      {/* A speaker with a portrait gets a Nintendo-style row inside the box
         instead of a floating name tag, so the line reads as something a person
         in the scene said rather than as narration about them. */}
      {speaker && !portrait && (
        <span
          className="absolute -top-[13px] left-[14px] z-10 rounded-full px-[12px] py-[4px] text-[12px] font-extrabold tracking-[0.08em] uppercase"
          style={{ background: accent, color: "#05070f", fontFamily: "var(--font-display)" }}
        >
          {speaker}
        </span>
      )}
      <div
        onClick={step}
        className="flex max-h-[76dvh] flex-col gap-[var(--space-3)] overflow-y-auto rounded-[20px] border-2 px-[16px] pt-[20px] pb-[16px] backdrop-blur-[22px] sm:px-[20px] sm:pt-[22px] [scrollbar-width:thin]"
        style={{ background: "color-mix(in srgb, var(--background) 86%, transparent)", borderColor: edge }}
      >
        {/* HIERARCHY: the situation is a bold subheading, ruled off from the
           question and its options below. They were one undifferentiated stack
           of text, so a player could not tell the setup from the thing they had
           to answer. */}
        {line && (
          <div className="flex items-start gap-[12px]">
            {portrait && (
              <span
                aria-hidden
                className="mt-[2px] flex-none overflow-hidden rounded-[14px] border-2"
                style={{ borderColor: accent, background: "color-mix(in srgb, var(--background) 60%, transparent)" }}
              >
                <Image src={portrait} alt="" width={112} height={112} className="h-[52px] w-[52px] object-cover object-top sm:h-[62px] sm:w-[62px]" />
              </span>
            )}
            <span className="min-w-0 flex-1">
              {portrait && speaker && (
                <span className="mb-[3px] block text-[12px] font-extrabold tracking-[0.1em] uppercase" style={{ color: accent, fontFamily: "var(--font-display)" }}>
                  {speaker}
                </span>
              )}
              <p className="m-0 text-[16px] leading-[24px] font-bold sm:text-[17px] sm:leading-[26px]" style={{ color: "var(--foreground)" }}>
                {visible}
                {!done && <span className="ml-[2px] inline-block h-[16px] w-[7px] translate-y-[2px] animate-pulse" style={{ background: accent }} aria-hidden />}
              </p>
            </span>
          </div>
        )}
        {done && held && (
          <button
            type="button"
            onClick={step}
            className="flex cursor-pointer items-center gap-[8px] self-start text-[13px] font-extrabold tracking-[0.06em] uppercase motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]"
            style={{ color: accent }}
          >
            Continue
            <ChevronRight className="h-[16px] w-[16px] motion-safe:animate-[play-nudge_1.1s_ease-in-out_infinite]" aria-hidden />
            <span className="sr-only">or press space</span>
          </button>
        )}
        {done && !held && (
          <>
            {line && <span aria-hidden className="-mx-[16px] border-t sm:-mx-[20px]" style={{ borderColor: "var(--color-glass-border-raised)" }} />}
            <div className="motion-safe:animate-[fade-slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">{children}</div>
          </>
        )}
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
          <span className="block truncate text-[13px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)" }}>
            {simulation.title}
          </span>
          <span className="block truncate text-[11.5px] font-bold tracking-[0.1em] uppercase" style={{ color: accent }}>
            Level {level.n} · {level.role}
          </span>
        </span>
        <MuteToggle />
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

/** Sound on/off, one tap, always visible. This gets played in classrooms; a
 *  game you cannot silence in one tap is a game you do not open at school. */
function MuteToggle() {
  const muted = useSyncExternalStore(subscribeMuted, mutedSnapshot, serverMutedSnapshot);
  return (
    <button
      type="button"
      onClick={() => {
        const next = !muted;
        setMuted(next);
        if (!next) playSelect();
      }}
      aria-pressed={muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
      style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: muted ? "var(--muted-foreground)" : "var(--foreground)" }}
    >
      {muted ? <VolumeX className="h-[17px] w-[17px]" aria-hidden /> : <Volume2 className="h-[17px] w-[17px]" aria-hidden />}
    </button>
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
  useEffect(() => {
    if (ending.advances) playSweep();
  }, [ending.advances]);
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
