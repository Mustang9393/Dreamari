"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Briefcase, ChevronLeft, ChevronRight, FileText, Home, Music, RotateCcw, Trophy, Volume2, VolumeX, Wrench, X } from "lucide-react";

import { WORLD_COLORS } from "@/components/app/worlds";

import { defaultExpressionFor, expressionFor, PORTRAIT_RATIO } from "./expressions";
import { locationFor } from "./locations";
import { PerformancePlanFlow } from "./PerformancePlanFlow";
import { randomStepOrders, type PipState } from "./performance-plan";
import {
  BossOverlay,
  BucketBody,
  CardBody,
  ChainBody,
  ChoiceBody,
  FlagsBody,
  Keycap,
  MatchBody,
  PickBody,
  RankBody,
  RapidBody,
  SliderBody,
  useTypewriter,
  type Resolve,
} from "./interactions";
import { musicMutedSnapshot, playMusic, serverMusicMutedSnapshot, setMusicMuted, stopMusic, subscribeMusicMuted } from "./music";
import { clearRun, progressSnapshot, readRun, saveRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import {
  mutedSnapshot,
  playCharacterEnter,
  playFocusMoment,
  playSceneChange,
  playSelect,
  playSweep,
  playTick,
  serverMutedSnapshot,
  setMuted,
  subscribeMuted,
} from "./sound";
import { ADVANCE_AT, BAND_COLOR, SCORED_BEATS, START_REPUTATION, STRIKE_TRIGGER, TIER_STRIKES, bandFor, clamp, endingFor } from "./scoring";
import { TIER_HEADLINE, TIER_SCORE, type Beat, type DreamyPose, type Level, type Mood, type Simulation, type Tier } from "./types";

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
    ? { index: resumable.index, scores: (resumable.scores ?? {}) as Record<string, Tier> }
    : { index: 0, scores: {} as Record<string, Tier> };

  /** null until the player does something; then it owns the run. */
  const [run, setRun] = useState<{ index: number; scores: Record<string, Tier> } | null>(null);
  const live = run ?? base;
  const index = live.index;
  // Reputation is DERIVED from the per-beat outcomes rather than carried as a
  // running total. That is what makes a repair round possible: correcting a beat
  // overwrites its entry and the total simply follows. Passing a Performance
  // Plan moves this baseline instead of touching any beat's own score --
  // "reputation is SET to exactly 50, not added to" -- so the derivation
  // stays intact (a repair round afterward still just works) while the
  // number on screen jumps to 50 the instant the plan is passed.
  const [reputationBaseline, setReputationBaseline] = useState(START_REPUTATION);
  const reputation = clamp(reputationBaseline + Object.values(live.scores).reduce((total, tier) => total + TIER_SCORE[tier], 0));
  const scored = Object.keys(live.scores).length;
  const misses = Object.entries(live.scores)
    .filter(([, tier]) => tier === "wrong" || tier === "risky")
    .map(([id]) => id);
  const patchRun = (change: Partial<typeof base>) => setRun((current) => ({ ...(current ?? base), ...change }));
  // Showing the resumed state exactly while the save is still what is on screen.
  const resumed = run === null && resumable !== null;

  /** Ids still to be replayed in a repair round, or null when playing normally. */
  const [repair, setRepair] = useState<string[] | null>(null);

  // THE STRIKE RULE (scoring.ts): a Wrong or Risky answer adds strikes, and
  // the third one triggers a Performance Plan -- see performance-plan.ts.
  // `pipUsed` caps it at once per level ("Frequency: Once per level" --
  // further strikes after that just cost reputation as normal).
  const [strikes, setStrikes] = useState(0);
  const [pipUsed, setPipUsed] = useState(false);
  const [pip, setPip] = useState<PipState | null>(null);

  const [phase, setPhase] = useState<Phase>("beat");
  const [locked, setLocked] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const beat = level.beats[index];
  const accent = WORLD_COLORS[simulation.world] ?? "var(--primary)";

  // Art is sticky: a beat without its own scene keeps the last one, so the
  // unillustrated beats feel like they happen in the same room.
  const scene = sceneFor(level, index, beat);
  const sceneHost = useRef<HTMLDivElement>(null);
  const sceneOffset = useScenePointer();
  // Character height is set in real pixels, not a CSS percentage: a
  // percentage taller than 100% on an absolutely positioned element nested a
  // couple of layers deep resolved inconsistently between what the browser
  // reported for layout (correct) and what it actually painted (as if the
  // percentage were invalid), which is a browser quirk, not a sizing choice
  // -- pixels sidestep it entirely.
  const [sceneHeight, setSceneHeight] = useState(0);
  useEffect(() => {
    const element = sceneHost.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setSceneHeight(entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  // The site-wide "scale to a 1440px baseline" zoom (globals.css) is built
  // for marketing/flow pages that want proportional type and spacing at
  // large sizes. A full-bleed game view doesn't want that: at >=1800x900 the
  // 1.25x body zoom shrank this entire stage into a fraction of the real
  // viewport -- the whole scene, every character, the dialogue box, all of
  // it rendered small in a corner with the rest of the window left black.
  // Canceling the zoom on this element with a matching local `zoom` value
  // does not visually undo it (confirmed: getBoundingClientRect reports the
  // correct full-viewport size, but the actual paint stays shrunk -- a
  // Chromium quirk with compounding zoom under dvh units, not something
  // fixable from inside this subtree). Opting the whole document out of the
  // rule for as long as Play is mounted is the only fix that actually works.
  useEffect(() => {
    document.documentElement.classList.add("play-no-zoom");
    return () => document.documentElement.classList.remove("play-no-zoom");
  }, []);
  // Mirrors BeatStage's own staged/revealed state (see onRevealChange there).
  // While the player is still reading the setup line, the big scene character
  // is the one carrying the speaker; once the interactive controls are up, it
  // steps aside for the dialogue box's small portrait, the same way it always
  // has for cards -- a person standing over the answer options would compete
  // with them, but a person standing next to the line they just said would not.
  const stageable = Boolean(beat.setup) && beat.kind !== "card" && beat.kind !== "review";
  const [revealed, setRevealed] = useState(!stageable);
  // Resets synchronously on a beat change instead of waiting on BeatStage's
  // own mount effect to report back -- that round trip left the FIRST paint
  // of a new beat holding the previous beat's revealed value for one frame,
  // which showed the wrong character (or none) for an instant. This is
  // React's own pattern for resetting derived state when an input changes,
  // adjusted during render rather than in an effect, so the corrected value
  // is what actually paints.
  const [revealedForBeat, setRevealedForBeat] = useState(beat.id);
  if (beat.id !== revealedForBeat) {
    setRevealedForBeat(beat.id);
    setRevealed(!stageable);
  }

  const resolve = useCallback<Resolve>(
    (tier, why, id) => {
      if (locked) return;
      setLocked(id ?? "resolved");
      const delta = TIER_SCORE[tier];
      // Hold on the board before the card: long enough to see what you picked
      // land, and longer on a miss so the revealed right answer is readable
      // before the explanation covers it.
      const hold = tier === "wrong" || tier === "risky" ? 1150 : 420;
      // A repair can rescue a beat but never earn full marks for it: getting it
      // right the first time has to stay worth more than fixing it later.
      const banked: Tier = repair && (tier === "best" || tier === "acceptable") ? "acceptable" : tier;
      // beat.id is in this callback's dependencies on purpose. Without it the
      // memoised closure went stale and filed every score under whichever beat
      // was on screen when the callback was first created -- so the repair round
      // would have replayed the wrong beats. It is stable within a beat, so the
      // countdown that depends on this callback does not restart mid-question.
      const beatId = beat.id;
      const triggerLine = beat.planLineIfFailed;
      // Once a plan has fired this level, further strikes just cost
      // reputation as normal -- "Frequency: Once per level."
      const strikeDelta = pipUsed ? 0 : (TIER_STRIKES[banked] ?? 0);
      window.setTimeout(() => {
        setRun((current) => {
          const from = current ?? base;
          return { ...from, scores: { ...from.scores, [beatId]: banked } };
        });
        if (strikeDelta > 0) {
          const nextStrikes = strikes + strikeDelta;
          setStrikes(nextStrikes);
          if (nextStrikes >= STRIKE_TRIGGER) {
            // "No feedback. Fires the moment the third strike lands" -- the
            // plan preempts this beat's own feedback card entirely rather
            // than following it.
            setPipUsed(true);
            setLocked(null);
            setPip({ triggerLine: triggerLine ?? "", resumeIndex: index + 1, stepOrders: randomStepOrders() });
            return;
          }
        }
        setResult({ tier: banked, why, delta: TIER_SCORE[banked] });
        setPhase("feedback");
      }, hold);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, repair, beat.id, pipUsed, strikes, index],
  );

  const reviewIndex = level.beats.findIndex((entry) => entry.kind === "review");

  const advance = useCallback(() => {
    setLocked(null);
    setResult(null);
    if (repair) {
      // Repair round: walk the queue of missed beats, then go straight to the
      // review rather than replaying the whole level.
      const [, ...rest] = repair;
      const next = rest[0];
      setRepair(rest);
      setPhase("beat");
      const to = next ? level.beats.findIndex((entry) => entry.id === next) : reviewIndex;
      patchRun({ index: to >= 0 ? to : level.beats.length - 1 });
      return;
    }
    if (index + 1 >= level.beats.length) {
      // The run is over: an ending should never be resumed into. Take ownership
      // of the outcomes FIRST -- clearing storage while the run is still being
      // read from it would drop every score on the floor, and the ending is
      // derived from them. A player who closed the app on the final review
      // screen came back and got the worst ending whatever they had earned.
      patchRun({});
      clearRun(simulation.id, level.n);
      setPhase("ending");
      return;
    }
    setPhase("beat");
    patchRun({ index: index + 1 });
    saveRun({ gameId: simulation.id, level: level.n, index: index + 1, scores: live.scores, reputation, scored });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, level.beats, level.n, simulation.id, reputation, scored, repair, reviewIndex]);

  const goBack = useCallback(() => {
    setLocked(null);
    setResult(null);
    setPhase("beat");
    patchRun({ index: Math.max(0, index - 1) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const restart = () => {
    // "Reputation resets to 50 and the level restarts from screen 1" -- the
    // rules tab. A fresh run must not inherit the old save, and that
    // includes strikes and whether a plan already fired this level --
    // otherwise a player who restarts after passing a plan on beat 3 would
    // find themselves unable to ever trigger it again this run.
    clearRun(simulation.id, level.n);
    setRun({ index: 0, scores: {} });
    setRepair(null);
    setLocked(null);
    setResult(null);
    setPhase("beat");
    setStrikes(0);
    setPipUsed(false);
    setReputationBaseline(START_REPUTATION);
  };

  /** Replay only the beats that went wrong. */
  const startRepair = () => {
    if (!misses.length) return;
    const queue = level.beats.filter((entry) => misses.includes(entry.id)).map((entry) => entry.id);
    setRepair(queue);
    setLocked(null);
    setResult(null);
    setPhase("beat");
    const to = level.beats.findIndex((entry) => entry.id === queue[0]);
    patchRun({ index: to });
  };

  const band = bandFor(reputation);
  const ending = endingFor(level.endings, reputation);

  // Music: the Main Song runs for the whole level, switching to the
  // Promotion Song only once an ending actually advances the player --
  // restart()/startRepair() (both "redoing steps") explicitly switch back to
  // Main themselves, so this effect only ever needs to move forward from
  // beat/feedback into a promoting ending, never the other direction.
  const promoted = phase === "ending" && ending.advances;
  useEffect(() => {
    playMusic(promoted ? "promotion" : "main");
  }, [promoted]);
  useEffect(() => stopMusic, []);
  // A beat can override the level's mood: Level 2 runs three screens in
  // late-night navy and comes back, Level 3 has a maroon Crunch Time stretch.
  const mood = beat.mood ?? level.mood;
  // Blur ONLY a standalone interactive question-answer screen -- the moment
  // the controls the player is actually working with are on screen, never
  // the dialogue leading up to them. Cards and review have no controls to
  // focus, so they never blur. Applies to a hero plate exactly the same as a
  // location: the rule is about the screen, not which kind of art is behind it.
  const dimmed = revealed && beat.kind !== "card" && beat.kind !== "review";
  // A handful of beats author `tone: "conflict" | "alarm"` on themselves --
  // borrow the concerned/uncertain tier reaction as the neutral face for
  // those, so the same character isn't smiling through a tense moment.
  const neutralTier: Tier | undefined =
    "tone" in beat && (beat.tone === "conflict" || beat.tone === "alarm") ? "wrong" : undefined;
  // Mirrors the big-character render condition below exactly, so the
  // dialogue box knows to hold back its own small portrait rather than
  // showing the same speaker twice at once.
  const bigCharacterVisible =
    scene.mode === "location" &&
    (beat.kind === "card" || beat.kind === "review" || !revealed) &&
    (scene.characterAnchors && beat.castMembers
      ? beat.castMembers.some((name, i) => Boolean(scene.characterAnchors?.[i]) && Boolean(defaultExpressionFor(name)))
      : Boolean(scene.characterAnchor) && Boolean(defaultExpressionFor(beat.castMember ?? beat.speaker)));

  // A soft cue exactly when the backdrop itself swaps -- not on every beat,
  // only when the picture actually changes (a new location, or a fresh hero
  // plate taking over from the last one).
  const lastSceneSrc = useRef<string | null>(null);
  useEffect(() => {
    if (lastSceneSrc.current !== null && lastSceneSrc.current !== scene.src) playSceneChange();
    lastSceneSrc.current = scene.src;
  }, [scene.src]);
  // A distinct cue the moment a standalone interactive screen actually takes
  // over -- fires once on the false-to-true edge, not on every render while
  // it stays true.
  const wasDimmed = useRef(false);
  useEffect(() => {
    if (dimmed && !wasDimmed.current) playFocusMoment();
    wasDimmed.current = dimmed;
  }, [dimmed]);

  return (
    <div
      className="marketing-v2 themeable relative flex h-dvh w-full flex-col overflow-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
    >
      {/* ---- the scene ----
           Full-bleed behind everything, on every breakpoint. This USED to be
           an in-flow panel on phones sized by whatever vertical space the box
           below it left over -- so the same character rendered at a different
           effective zoom on every beat depending on how tall that beat's box
           was, reading as "floating"/inconsistently scaled rather than a
           steady backdrop. Pinning it full-screen always (matching desktop)
           makes its size, and therefore every character anchor computed
           against it, constant across beats; the box now overlaps it instead
           of shrinking it. SceneLayers' own blurred-edge feathering is what
           keeps a landscape image from cropping its sides away on a portrait
           screen -- that part is unchanged, it just now has the full
           viewport height to work with instead of a shrinking sliver. */}
      {/* ONE plane with a slow zoom. The two-plane parallax is gone: the
         background plate still contains the characters that were lifted out of
         it, so any relative motion dragged a ghost of them out from behind the
         cutout, and no fill I tried (diffusion, colour propagation, horizontal
         cloning) erased them cleanly enough to ship. A soft push is the effect
         that survives that honestly. If character-free plates ever arrive from
         the artist, real parallax is a small change. */}
      <div
        ref={sceneHost}
        aria-hidden={scene.mode === "none" || !scene.alt}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {scene.mode === "none" ? (
          <AmbientBackdrop mood={mood} accent={accent} />
        ) : scene.mode === "hero" ? (
          // Static on purpose -- the slow zoom this used to carry pushed a
          // composed illustration past its own edges over the course of a
          // beat, which read as the same cropping problem the location
          // anchors had. A held frame never crops itself.
          <div
            className="absolute inset-0 transition-[filter] duration-500"
            style={{ filter: dimmed ? "blur(7px) brightness(0.7) saturate(0.45)" : undefined }}
          >
            <SceneLayers src={scene.src} alt={scene.alt} />
          </div>
        ) : (
          <div className="absolute inset-0">
            <LocationBackdrop
              src={scene.src}
              alt={scene.alt}
              focal={scene.focal}
              mobileFocal={scene.mobileFocal}
              offset={sceneOffset}
              dimmed={dimmed}
            />
            {/* A card or the review is never staged (see BeatStage's own
               `stageable`), so it is always in its "revealed" state -- the
               character shows for its whole beat, same as it always has. An
               interactive beat IS staged: the character carries the speaker
               while its setup line is being read, then steps aside the
               moment the controls appear, handing the speaker off to the
               dialogue box's small portrait so nothing stands over the
               answers the player is actually working with. */}
            {(beat.kind === "card" || beat.kind === "review" || !revealed) &&
              (scene.characterAnchors && beat.castMembers ? (
                // Two or more named people in one room, in story order -- the
                // reception's Christina-left, Jordan-right layout from its own
                // scene.json, not a rule that applies anywhere else yet.
                beat.castMembers.map((name, i) => {
                  const slot = scene.characterAnchors?.[i];
                  // Christina reads as the host greeting Jordan into the room,
                  // so she stands in front of him rather than the reverse.
                  return slot ? (
                    <SceneCharacter
                      key={name}
                      speaker={name}
                      anchor={slot}
                      offset={sceneOffset}
                      sceneHeight={sceneHeight}
                      zIndex={name === "Christina" ? 2 : 1}
                    />
                  ) : null;
                })
              ) : (
                scene.characterAnchor && (
                  <SceneCharacter
                    speaker={beat.castMember ?? beat.speaker}
                    // The same scale everywhere a location shows a
                    // character, matching the proportion the original flat
                    // illustrations used (close, nearly filling the frame) --
                    // not shrunk to dodge the dialogue panel underneath it.
                    anchor={scene.characterAnchor}
                    tier={phase === "feedback" ? result?.tier : undefined}
                    neutralTier={neutralTier}
                    offset={sceneOffset}
                    sceneHeight={sceneHeight}
                  />
                )
              ))}
          </div>
        )}
      </div>

      {/* Center-stage vignette: only on a standalone interactive screen, the
         same moment the backdrop blurs and desaturates -- darkens the
         corners so the answers in the middle read as the thing lit up, not
         a card floating over a still-bright room. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: dimmed ? 1 : 0,
          background: "radial-gradient(ellipse at center, transparent 40%, color-mix(in srgb, var(--background) 60%, transparent) 100%)",
        }}
      />

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

      {/* Mood rides the EDGES, never the whole frame. A full-bleed wash at the
         weight this needs to read as late-night or crunch also drains the art,
         which is the one thing on screen worth looking at. So the tint lands
         where the scrims already darken -- the HUD strip and the ground under
         the dialogue box -- and the middle of the picture is left alone. */}
      {mood !== "day" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-colors duration-700"
          style={{
            background:
              mood === "crunch"
                ? "linear-gradient(180deg, color-mix(in srgb, #4a0d1c 60%, transparent) 0%, transparent 22%, transparent 58%, color-mix(in srgb, #3a0a16 46%, transparent) 84%, color-mix(in srgb, #2a0710 74%, transparent) 100%)"
                : "linear-gradient(180deg, color-mix(in srgb, #071033 56%, transparent) 0%, transparent 22%, transparent 58%, color-mix(in srgb, #061029 44%, transparent) 84%, color-mix(in srgb, #04081f 72%, transparent) 100%)",
          }}
        />
      )}

      <Hud
        simulation={simulation}
        level={level}
        reputation={reputation}
        band={band}
        scored={scored}
        delta={phase === "feedback" ? (result?.delta ?? null) : null}
        accent={accent}
        onBack={index > 0 ? goBack : undefined}
      />

      {pip ? (
        <PerformancePlanFlow
          level={level.n as 1 | 2 | 3}
          pip={pip}
          onPassed={() => {
            const earned = Object.values(live.scores).reduce((total, tier) => total + TIER_SCORE[tier], 0);
            setReputationBaseline(50 - earned);
            setPip(null);
            setStrikes(0);
            setPhase("beat");
            patchRun({ index: pip.resumeIndex });
            saveRun({ gameId: simulation.id, level: level.n, index: pip.resumeIndex, scores: live.scores, reputation: 50, scored });
          }}
          onTerminated={() => {
            setPip(null);
            setStrikes(0);
            setPipUsed(false);
            setReputationBaseline(START_REPUTATION);
            clearRun(simulation.id, level.n);
            setRun({ index: 0, scores: {} });
            setRepair(null);
            setLocked(null);
            setResult(null);
            setPhase("beat");
          }}
        />
      ) : phase === "ending" ? (
        <div className="relative z-10 flex min-h-0 flex-1 items-end justify-center px-3 pb-3 sm:px-5 sm:pb-5">
          <EndingCard
            ending={ending}
            reputation={reputation}
            band={band}
            simulation={simulation}
            next={simulation.levels.find((entry) => entry.n === level.n + 1)}
            misses={misses.length}
            onRepair={startRepair}
            onReplay={restart}
          />
        </div>
      ) : (
        // Keyed on the beat: a new beat is a fresh mount, which is what gives
        // the countdown its starting value without an effect resetting state.
        <BeatStage
          key={beat.id}
          hidden={phase === "feedback"}
          beat={beat}
          accent={accent}
          cast={level.cast}
          locked={locked}
          paused={phase !== "beat"}
          ambient={scene.mode === "none"}
          // The big cinematic character already carries the speaker -- the
          // dialogue box's small round portrait would just be a second,
          // redundant face on screen at the same time.
          sceneCharacterVisible={bigCharacterVisible}
          onRevealChange={setRevealed}
          onResolve={resolve}
          onNext={advance}
        />
      )}

      {phase === "feedback" && result && (
        <FeedbackSheet beat={beat} result={result} reputation={reputation} onNext={advance} />
      )}

      {repair && repair.length > 0 && phase === "beat" && (
        <div className="absolute inset-x-0 top-[74px] z-30 flex justify-center px-3">
          <span
            className="flex items-center gap-[9px] rounded-full border px-[14px] py-[7px] text-[12.5px] font-bold backdrop-blur-[10px]"
            style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", borderColor: "var(--primary)", color: "var(--foreground)" }}
          >
            <Wrench className="h-[14px] w-[14px]" aria-hidden />
            Fixing {repair.length} {repair.length === 1 ? "answer" : "answers"}
          </span>
        </div>
      )}

      {/* Says so, rather than silently dropping them mid-level. */}
      {resumed && phase === "beat" && (
        <div className="pointer-events-none absolute inset-x-0 top-[74px] z-30 flex justify-center px-3 animate-[play-notice_11s_ease-out_both]">
          <span
            className="pointer-events-auto flex items-center gap-[10px] rounded-full border px-[14px] py-[7px] text-[12.5px] font-bold backdrop-blur-[10px]"
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
// Deterministic sparkle field: fixed coordinates, not Math.random(), so the
// server and client render the same markup and hydration never mismatches.
const AMBIENT_SPARKS = [
  { x: 12, y: 20, delay: 0 },
  { x: 82, y: 14, delay: 1.1 },
  { x: 66, y: 64, delay: 2.3 },
  { x: 24, y: 72, delay: 0.6 },
  { x: 90, y: 46, delay: 1.7 },
  { x: 44, y: 32, delay: 2.9 },
  { x: 58, y: 84, delay: 1.4 },
] as const;

const AMBIENT_MOOD_WASH: Record<Mood, [string, string]> = {
  day: ["#3452e6", "#7c5cff"],
  night: ["#1c3f9e", "#4b3ba8"],
  crunch: ["#a8123a", "#7a1650"],
};

/** Stands in for a scene once its picture has gone stale (see SCENE_FRESH_BEATS):
 *  slow drifting colour, not a still frame with nothing left to say. Dreamy's
 *  cloud floats over this, which is the one place it still earns a name pill --
 *  there is no one else in the room to look at. */
function AmbientBackdrop({ mood, accent }: { mood: Mood; accent: string }) {
  const [a, b] = AMBIENT_MOOD_WASH[mood];
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ background: "var(--background)" }}>
      <span
        className="absolute -top-[15%] -left-[10%] h-[65%] w-[65%] rounded-full opacity-60 motion-safe:animate-[play-ambient-drift-a_18s_ease-in-out_infinite]"
        style={{ background: a, filter: "blur(70px)" }}
      />
      <span
        className="absolute top-[10%] -right-[15%] h-[55%] w-[55%] rounded-full opacity-50 motion-safe:animate-[play-ambient-drift-b_22s_ease-in-out_infinite]"
        style={{ background: b, filter: "blur(80px)" }}
      />
      <span
        className="absolute -bottom-[20%] left-[20%] h-[60%] w-[60%] rounded-full opacity-40 motion-safe:animate-[play-ambient-drift-c_26s_ease-in-out_infinite]"
        style={{ background: accent, filter: "blur(90px)" }}
      />
      {AMBIENT_SPARKS.map((spark, index) => (
        <span
          key={index}
          className="absolute h-[3px] w-[3px] rounded-full bg-white motion-safe:animate-[play-ambient-twinkle_3.6s_ease-in-out_infinite]"
          style={{ left: `${spark.x}%`, top: `${spark.y}%`, animationDelay: `${spark.delay}s` }}
        />
      ))}
    </div>
  );
}

function SceneLayers({ src, alt }: { src: string; alt: string }) {
  // One sharp cover layer, every breakpoint -- mobile used to stack two
  // blurred copies behind a smaller centered one to avoid cropping a wide
  // image's sides, but the blurred edges read as a visible defect rather
  // than a clever fix. Plain cover, same as every location backdrop already
  // does on mobile with no blur at all.
  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      priority
      sizes="100vw"
      className="object-cover object-center motion-safe:animate-[play-scene-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both]"
    />
  );
}

/** Locations no longer drift with the pointer -- static was the right call:
 *  it read as things moving on their own for no reason on desktop, and had
 *  nothing to respond to on the touch devices most players are actually on.
 *  The layer separation (room and character as independent images) stays; it
 *  is what makes the scene compose correctly, not what made it move. */
function useScenePointer() {
  return ZERO_OFFSET;
}

const ZERO_OFFSET = { x: 0, y: 0 };

/** A recurring Cobalt Capital location (see locations.ts), shown when the
 *  current beat has no hero illustration of its own. Unlike SceneLayers this
 *  is a single cover image at its own focal point on both mobile and desktop
 *  -- there is no named character in the plate to keep uncropped, so it is
 *  free to bleed off the frame the way a real photo would. Drifts a few
 *  pixels against the pointer; the character standing in front of it (if any)
 *  drifts further, per its own layer in the parallax host below. */
function LocationBackdrop({
  src,
  alt,
  focal,
  mobileFocal,
  offset,
  dimmed,
}: {
  src: string;
  alt: string;
  focal: { x: number; y: number };
  mobileFocal: { x: number; y: number };
  offset: { x: number; y: number };
  /** True only on a standalone interactive question-answer screen -- once
   *  the real controls are up and the room itself would otherwise compete
   *  with them. Never true for a card, review, or a beat still being read;
   *  those want the room clear so the character standing in it reads. */
  dimmed?: boolean;
}) {
  const filter = dimmed ? "blur(7px) brightness(0.7) saturate(0.45)" : undefined;
  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover transition-[filter] duration-500 sm:hidden"
        style={{ objectPosition: `${mobileFocal.x * 100}% ${mobileFocal.y * 100}%`, filter }}
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="hidden object-cover transition-[filter] duration-500 motion-safe:animate-[play-scene-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both] sm:block"
        style={{
          objectPosition: `${focal.x * 100}% ${focal.y * 100}%`,
          transform: `translate3d(${offset.x * -6}px, ${offset.y * -4}px, 0) scale(1.03)`,
          filter,
        }}
      />
    </>
  );
}

/** A named character standing in a location scene, chest-up, the same floating
 *  convention Dreamy already uses rather than an attempt to plant their feet on
 *  the floor at a matched perspective -- the sprite is a flat anime illustration
 *  over a photographic room, and pretending they physically stand in it would
 *  only make that seam harder to miss. This is why boardroom locations have no
 *  `characterAnchor` at all: a floating half-body sprite reads fine hovering in
 *  an open room, but not seated at a specific chair. Shows a neutral default
 *  expression -- the beat has not been answered yet, so there is no tier to
 *  react with; that happens on the feedback card instead. */
function SceneCharacter({
  speaker,
  anchor,
  tier,
  offset,
  sceneHeight,
  zIndex,
  neutralTier,
}: {
  speaker?: string;
  anchor: { x: number; baselineY: number; heightFrac: number; centered?: boolean };
  /** Set only once the player has answered. Swaps the character's face to the
   *  Character Bible's tier reaction -- the same welcoming/concerned/proud and
   *  confident/focused/uncertain mapping the feedback card uses -- so the
   *  consequence lands somewhere big enough to actually see, not a 44px icon. */
  tier?: Tier;
  offset: { x: number; y: number };
  /** The scene container's real height in px (see the ResizeObserver at the
   *  call site). `bottom`/`height` are set in px, not `%` -- a percentage
   *  past 100% on this nested an absolutely positioned element measured
   *  correctly via getBoundingClientRect but painted as though the browser
   *  had silently ignored it, which pixels do not have any ambiguity about. */
  sceneHeight: number;
  /** Stacking order when two characters share a scene (the reception). */
  zIndex?: number;
  /** A conflict/alarm beat's setup line reads as tense -- borrow the
   *  concerned/uncertain tier reaction as the neutral face for THIS beat
   *  rather than defaulting to the same welcoming/confident look every
   *  beat gets before an answer exists to react to. Only changes anything
   *  for the small number of beats that author a `tone`; everything else is
   *  exactly the default it always was. */
  neutralTier?: Tier;
}) {
  const src = (tier && expressionFor(speaker, tier)) || (neutralTier && expressionFor(speaker, neutralTier)) || defaultExpressionFor(speaker);
  // Pairs with the entrance animation below, which is keyed on the same
  // `src` for the same reason: a genuinely new image (a new speaker, or an
  // expression swap), not just this component re-rendering.
  useEffect(() => {
    if (src) playCharacterEnter();
  }, [src]);
  if (!src || sceneHeight === 0) return null;
  // Centered and filling the room is the norm -- whoever is speaking is the
  // thing to look at, the same treatment Jordan's introduction got. The two
  // boardrooms are the one exception: `centered: false` there keeps a
  // character in the single strip of open floor by the window, since the
  // rest of the room is furniture with no mask asset yet to occlude it.
  const x = anchor.centered === false ? anchor.x : 0.5;
  return (
    <span
      aria-hidden
      // No idle bob: two characters sharing a scene, animating on independent
      // unsynced loops, drift in and out of alignment with each other and
      // read as a positioning bug rather than a subtle idle. The entrance
      // animation plus pointer parallax is motion enough.
      className="pointer-events-none absolute"
      style={{
        left: `${x * 100}%`,
        bottom: `${(1 - anchor.baselineY) * sceneHeight}px`,
        height: `${anchor.heightFrac * sceneHeight}px`,
        zIndex,
        transform: `translate3d(calc(-50% + ${offset.x * 14}px), ${offset.y * -8}px, 0)`,
      }}
    >
      {/* Keyed on the image itself: whenever the speaker changes, or their
         expression swaps on commit, this remounts and plays its entrance again
         -- the character visibly steps into the scene rather than a flat image
         just appearing or silently swapping underneath the player. */}
      <Image
        key={src}
        src={src}
        alt=""
        width={Math.round((PORTRAIT_RATIO[src] ?? 0.55) * 900)}
        height={900}
        // max-w-none overrides Tailwind preflight's `img { max-width: 100% }`
        // -- inside this absolutely positioned, auto-width span, that rule's
        // percentage resolved against an indefinite container and silently
        // clamped the sprite to a fraction of its real size (confirmed live:
        // removing it took a 188px-wide render to its correct 639px). That
        // clamp, not the anchor math, was the actual cause of characters
        // reading as small and "floating" far above the dialogue box.
        className="h-full w-auto max-w-none object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] motion-safe:animate-[play-character-enter_0.42s_cubic-bezier(0.16,1,0.3,1)_both]"
      />
    </span>
  );
}

/** Walks back from the current beat to the last one that carried art. */
// How many beats an image is allowed to outlive the beat that owns it before
// it reads as stale rather than "the same room". Tuned against the sheet: it
// covers a card explaining itself over 2-3 follow-up questions (the onboarding
// steps, a beat immediately followed by its own question) without covering the
// long unillustrated tails every level ends on (a run of narrative cards into
// the final review), which is exactly where a still image stops adding
// anything and an ambient backdrop takes over instead.
const SCENE_FRESH_BEATS = 3;

type CharSlot = { x: number; baselineY: number; heightFrac: number; centered?: boolean };

type SceneCue =
  | { mode: "hero"; src: string; alt: string }
  | {
      mode: "location";
      src: string;
      alt: string;
      focal: { x: number; y: number };
      mobileFocal: { x: number; y: number };
      characterAnchor?: CharSlot;
      characterAnchors?: CharSlot[];
    }
  | { mode: "none"; src: string; alt: string };

function sceneFor(level: Level, index: number, beat: Beat): SceneCue {
  for (let i = index; i >= 0; i -= 1) {
    const candidate = level.beats[i];
    if (candidate.art) {
      // Found the nearest beat that owns art. Use it while it's fresh; once it
      // has gone stale, stop looking further back -- the CURRENT beat's own
      // location (not whatever room the old picture happened to show) is what
      // should replace it.
      if (index - i <= SCENE_FRESH_BEATS) return { mode: "hero", src: candidate.art, alt: candidate.artAlt ?? "" };
      break;
    }
    // A beat can mark itself as the start of a new scene without owning art
    // of its own -- stop looking further back, same as running out of
    // freshness, rather than inheriting a picture from before the reset.
    if (candidate.resetScene) break;
  }
  const location = locationFor(beat.id);
  if (location) {
    return {
      mode: "location",
      src: location.src,
      alt: location.alt,
      focal: location.focal,
      mobileFocal: location.mobileFocal,
      characterAnchor: location.characterAnchor,
      characterAnchors: location.characterAnchors,
    };
  }
  return { mode: "none", src: level.cover, alt: "" };
}

/** The stage for one beat, mounted fresh per beat. It owns the shared
 *  countdown, which is why the clock needs no reset: the component simply
 *  starts again. Timing out scores as Wrong, never Risky, because a slow
 *  reader is not the same as someone who invented numbers. */
function BeatStage({
  beat,
  accent,
  cast,
  locked,
  paused,
  hidden,
  ambient,
  sceneCharacterVisible,
  onRevealChange,
  onResolve,
  onNext,
}: {
  beat: Beat;
  accent: string;
  cast?: Record<string, string>;
  locked: string | null;
  paused: boolean;
  /** True while the verdict card is up: the stage steps back rather than
   *  showing half a question behind it. */
  hidden?: boolean;
  /** True when the scene behind this beat is the ambient backdrop, not a real
   *  picture -- Dreamy's floating cloud and name pill only earn their place
   *  here, since a beat WITH a scene already has someone in it to look at. */
  ambient?: boolean;
  /** True when the big cinematic character is already on screen carrying
   *  this speaker -- the dialogue box holds back its own small portrait so
   *  the same face never shows twice at once. */
  sceneCharacterVisible?: boolean;
  /** Reports the staged/revealed transition to the parent, which uses it to
   *  decide whether the big scene character or the dialogue box's small
   *  portrait carries the speaker right now (see the render site). */
  onRevealChange?: (revealed: boolean) => void;
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
  const portrait = speaker && !sceneCharacterVisible ? cast?.[speaker] : undefined;
  const stageable =
    Boolean(beat.setup) &&
    beat.kind !== "card" &&
    beat.kind !== "review";
  const [revealed, setRevealed] = useState(!stageable);
  useEffect(() => {
    onRevealChange?.(revealed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

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

  // A card or the review is read against the scene, bottom-anchored like a
  // dialogue box always has been. A beat the player is actively working sits
  // in the center of the frame instead -- it's the thing on screen, not a
  // caption under a picture, now that the picture behind it is a real room
  // rather than something cropped to leave the bottom third free for it.
  // Centered is for an actionable screen only -- the controls the player is
  // actually working with. The setup line leading up to them (not yet
  // revealed) is dialogue, and dialogue docks at the bottom like a card,
  // never centered over the character's middle.
  const interactive = revealed && beat.kind !== "card" && beat.kind !== "review";
  // The review beat is its own case: it's never a card (bottom-docked
  // dialogue) or a scored question (centered, wide, focused) -- it's the
  // liminal wait on the colorful ambient backdrop with Dreamy, and reads
  // better centered on that backdrop than pinned to the bottom edge like a
  // regular narrative card.
  const centered = interactive || beat.kind === "review";
  return (
    <>
      {seconds > 0 && !paused && revealed && <Clock remaining={remaining} total={seconds} />}
      <div
        aria-hidden={hidden || undefined}
        className={`relative z-10 flex min-h-0 flex-1 justify-center px-3 pb-3 transition-opacity duration-300 sm:px-5 sm:pb-5 ${centered ? "items-center" : "items-end"}`}
        style={{ opacity: hidden ? 0 : 1 }}
      >
        {/* Dreamy is positioned OVER the box's top edge rather than stacked
           above it. In the flow it claimed its own ~84px row on a phone, which
           is the black gap that opened up between the art and the question. */}
        <div
          className={`relative flex w-full flex-col ${
            // Fixed max-widths only ever changed once, at the sm: breakpoint,
            // then stayed flat forever after -- a 13" laptop and a 5K
            // external monitor got the identical box. clamp()'s middle term
            // is pure vw, so it scales linearly with viewport width; picked
            // so it equals the old flat value exactly at 1440px (a 13"
            // MacBook Air's default scaled width) and grows past that point,
            // capped well short of comic-book-sized on anything wider.
            interactive ? "max-w-[720px] sm:max-w-[clamp(720px,50vw,1000px)]" : "max-w-[620px] sm:max-w-[clamp(620px,43vw,880px)]"
          } ${
            // Lifted off the very bottom edge on a plain dialogue/card beat --
            // it used to sit flush against it with only its own small padding,
            // reading as pinned to the floor rather than a deliberately placed
            // caption. A vh-based margin (not a fixed px one) so the lift
            // scales with the viewport instead of reading as a rounding error
            // on a short phone and invisible on a tall one. Safe to lift here:
            // the character's own art ends right around the true bottom edge
            // (see locations.ts' baselineY), so the strip this uncovers is
            // either more of the character or plain floor, never a hard seam.
            centered ? "" : "mb-[3dvh] sm:mb-[4dvh]"
          }`}
        >
          {narrated && ambient && <Dreamy pose={beat.pose ?? "happy"} />}
          {beat.kind === "choice" && beat.layout === "boss" ? (
            <DialogueBox speaker={speaker} portrait={portrait} setup={beat.setup} accent={accent} gold held={!revealed} ambient={ambient} onAdvance={() => setRevealed(true)}>
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
              onPrimary={beat.kind === "card" || beat.kind === "review" ? onNext : undefined}
              ambient={ambient}
            >
              <BeatBody beat={beat} locked={locked} remaining={remaining} onResolve={onResolve} onNext={onNext} />
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
  locked,
  remaining,
  onResolve,
  onNext,
}: {
  beat: Beat;
  locked: string | null;
  remaining: number;
  onResolve: Resolve;
  onNext: () => void;
}) {
  if (beat.kind === "card") return <CardBody beat={beat} onNext={onNext} />;
  if (beat.kind === "choice") return <ChoiceBody beat={beat} onResolve={onResolve} locked={locked} />;
  if (beat.kind === "match") return <MatchBody beat={beat} onResolve={onResolve} />;
  if (beat.kind === "rapid") return <RapidBody beat={beat} onResolve={onResolve} remaining={remaining} />;
  if (beat.kind === "chain") return <ChainBody beat={beat} onResolve={onResolve} />;
  if (beat.kind === "slider") return <SliderBody beat={beat} onResolve={onResolve} />;
  if (beat.kind === "flags") return <FlagsBody beat={beat} onResolve={onResolve} remaining={remaining} />;
  if (beat.kind === "rank") return <RankBody beat={beat} onResolve={onResolve} />;
  if (beat.kind === "pick") return <PickBody beat={beat} onResolve={onResolve} remaining={remaining} />;
  if (beat.kind === "bucket") return <BucketBody beat={beat} onResolve={onResolve} />;
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          See the decision
          <Keycap tint="var(--primary-foreground)">⏎</Keycap>
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
  ambient,
  onPrimary,
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
  /** True when there is no scene behind this box. A speaker WITH a portrait
   *  already reads as someone in the room; Dreamy has none, so its name pill
   *  is the only thing telling a player who is talking, and only earns its
   *  place when there is no picture doing that job instead. */
  ambient?: boolean;
  /** The beat's single action, for beats with no question to reveal. */
  onPrimary?: () => void;
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
        if (!done) {
          skip();
          return;
        }
        if (held && onAdvance) {
          playSelect();
          onAdvance();
          return;
        }
        // A card has no question to open, so the same key presses its one
        // button. Without this, two thirds of the level could not be played
        // from the keyboard at all. Deliberately NOT wired to the box's click,
        // which would double-fire with the button underneath it.
        if (!held && onPrimary) {
          playSelect();
          onPrimary();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, held, onAdvance, onPrimary, skip]);
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
      {speaker && !portrait && ambient && (
        <span
          className="absolute -top-[13px] left-[14px] z-10 rounded-full px-[12px] py-[4px] text-[12px] font-extrabold tracking-[0.08em] uppercase"
          style={{ background: accent, color: "#05070f", fontFamily: "var(--font-display)" }}
        >
          {speaker}
        </span>
      )}
      <div
        onClick={step}
        className="flex max-h-[76dvh] flex-col gap-[var(--space-3)] overflow-y-auto rounded-[20px] border-2 px-[16px] pt-[20px] pb-[16px] backdrop-blur-[22px] sm:px-[clamp(20px,1.4vw,32px)] sm:pt-[clamp(22px,1.53vw,34px)] [scrollbar-width:thin]"
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
                <Image
                  src={portrait}
                  alt=""
                  width={112}
                  height={112}
                  className="h-[52px] w-[52px] object-cover object-top sm:h-[clamp(62px,4.3vw,90px)] sm:w-[clamp(62px,4.3vw,90px)]"
                />
              </span>
            )}
            <span className="min-w-0 flex-1">
              {portrait && speaker && (
                <span className="mb-[3px] block text-[12px] font-extrabold tracking-[0.1em] uppercase" style={{ color: accent, fontFamily: "var(--font-display)" }}>
                  {speaker}
                </span>
              )}
              {/* Title tier: what the speaker actually says is the biggest text
                 on screen, ahead of the question and its answers -- title,
                 subheading, body, in that order, rather than the question
                 outsizing the line that gives it context. */}
              <p className="m-0 text-[23px] leading-[1.28] font-extrabold sm:text-[clamp(27px,1.875vw,40px)]" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>
                {visible}
                {!done && <span className="ml-[2px] inline-block h-[18px] w-[8px] translate-y-[2px] animate-pulse" style={{ background: accent }} aria-hidden />}
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
            <Keycap tint={accent}>⏎</Keycap>
            <span className="sr-only">or press enter</span>
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
  onBack,
}: {
  simulation: Simulation;
  level: Level;
  reputation: number;
  band: ReturnType<typeof bandFor>;
  scored: number;
  delta: number | null;
  accent: string;
  /** Steps back one beat. Undefined on the level's first beat, where there is
   *  nowhere within the run to go back to. */
  onBack?: () => void;
}) {
  return (
    <header className="relative z-20 flex flex-none flex-col gap-[8px] px-3 pt-3 sm:px-5 sm:pt-4">
      <div className="flex items-center gap-[var(--space-3)]">
        <span className="flex flex-none items-center gap-[6px]">
          {/* Always available, mid-level or not -- the per-beat back chevron
             only ever stepped back one beat within the run; there was no way
             to jump straight out to the Play hub once past the first beat. */}
          <Link
            href="/play"
            aria-label="Back to Play"
            className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
            style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
          >
            <Home className="h-[17px] w-[17px]" aria-hidden />
          </Link>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to the previous screen"
              className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
              style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
            >
              <ChevronLeft className="h-[19px] w-[19px]" aria-hidden />
            </button>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)" }}>
            {simulation.title}
          </span>
          <span className="block truncate text-[11.5px] font-bold tracking-[0.1em] uppercase" style={{ color: accent }}>
            Level {level.n} · {level.role}
          </span>
        </span>
        <span className="flex flex-none items-center gap-[6px]">
          <MusicToggle />
          <MuteToggle />
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
          {/* Every third dot is a checkpoint: the run is saved at each beat, and
             marking them makes that visible instead of hoping the player trusts
             it. */}
          {Array.from({ length: SCORED_BEATS }, (_, dot) => {
            const checkpoint = (dot + 1) % 3 === 0;
            return (
              <span
                key={dot}
                className={`rounded-full transition-colors duration-300 ${checkpoint ? "h-[8px] w-[8px]" : "h-[5px] w-[5px]"}`}
                style={{
                  background: dot < scored ? accent : "transparent",
                  border: checkpoint ? `1.5px solid ${dot < scored ? accent : "var(--color-glass-border-raised)"}` : "none",
                  boxShadow: dot < scored ? "none" : "inset 0 0 0 5px var(--color-glass-border-raised)",
                }}
              />
            );
          })}
        </span>
      </div>
    </header>
  );
}

/** Music on/off -- deliberately its own button, independent from the sound
 *  effects toggle below: "mute it and only hear sound effects" means muting
 *  the music can never also take the SFX with it the way one shared switch
 *  would. */
function MusicToggle() {
  const musicMuted = useSyncExternalStore(subscribeMusicMuted, musicMutedSnapshot, serverMusicMutedSnapshot);
  return (
    <button
      type="button"
      onClick={() => setMusicMuted(!musicMuted)}
      aria-pressed={musicMuted}
      aria-label={musicMuted ? "Turn music on" : "Turn music off"}
      className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
      style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: musicMuted ? "var(--muted-foreground)" : "var(--foreground)" }}
    >
      <Music className="h-[16px] w-[16px]" aria-hidden />
    </button>
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

/** A ring, not a bar: the countdown reads as a stopwatch face rather than a
 *  loading indicator, and the number sits inside it instead of beside a strip
 *  that is easy to miss in a corner of the eye. Pulses only in the last third,
 *  so urgency is felt rather than present the whole time a beat is timed. */
function Clock({ remaining, total }: { remaining: number; total: number }) {
  const fraction = Math.max(0, Math.min(1, remaining / total));
  const urgent = fraction < 0.34;
  // One tick per second, not per 100ms render (the countdown's own interval
  // granularity) -- fires on the second the displayed number actually
  // changes, sharper once the clock reads urgent.
  const lastTick = useRef<number | null>(null);
  useEffect(() => {
    const second = Math.ceil(remaining);
    if (lastTick.current === second) return;
    lastTick.current = second;
    if (second > 0) playTick(urgent);
  }, [remaining, urgent]);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const color = urgent ? "var(--destructive)" : "var(--world-business-money-office)";
  return (
    <div className="relative z-20 mt-[8px] flex flex-none justify-center">
      <span
        className={`relative flex h-[46px] w-[46px] items-center justify-center rounded-full border-2 backdrop-blur-[10px] ${urgent ? "motion-safe:animate-[play-pulse_0.9s_ease-in-out_infinite]" : ""}`}
        style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 62%, transparent)" }}
      >
        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="20" cy="20" r={radius} fill="none" stroke="var(--color-glass-border-raised)" strokeWidth="3" />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fraction)}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <span className="text-[13px] font-extrabold tabular-nums" style={{ color }}>
          {Math.ceil(remaining)}
        </span>
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
  const portrait = expressionFor(beat.speaker, result.tier);

  // The card owns the key rather than leaning on the focused button's default
  // activation: the sheet is the only thing on screen, so enter, space and right
  // should all dismiss it whatever happens to hold focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "ArrowRight") return;
      event.preventDefault();
      onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center px-3 py-3 sm:px-5 sm:py-5" style={{ background: "color-mix(in srgb, var(--background) 58%, transparent)" }}>
      <div
        className="flex w-full max-w-[620px] flex-col gap-[var(--space-3)] rounded-[20px] border-2 px-[18px] py-[18px] backdrop-blur-[22px] motion-safe:animate-[play-sheet-up_0.44s_cubic-bezier(0.16,1,0.3,1)_both]"
        style={{ background: "color-mix(in srgb, var(--background) 92%, transparent)", borderColor: color }}
      >
        <p className="flex items-center justify-between gap-[var(--space-3)]">
          <span className="flex items-baseline gap-[12px]">
            {/* The character bible's tier reaction, sized to actually read --
               this is the reliable place to see it: a scene character (when
               one is on screen) already swaps face in place, but stays at
               whatever modest scale the room calls for and can end up mostly
               behind this very card. This is guaranteed visible every time. */}
            {portrait && (
              <Image
                key={portrait}
                src={portrait}
                alt=""
                aria-hidden
                width={192}
                height={192}
                className="h-[72px] w-[72px] flex-none rounded-[16px] border-2 object-cover object-top motion-safe:animate-[play-character-enter_0.32s_ease-out_both]"
                style={{ borderColor: color }}
              />
            )}
            <span className="text-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color }}>
              {TIER_HEADLINE[result.tier]}
            </span>
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {cta}
          <Keycap tint="var(--primary-foreground)">⏎</Keycap>
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
  next,
  misses,
  onRepair,
  onReplay,
}: {
  ending: ReturnType<typeof endingFor>;
  reputation: number;
  band: ReturnType<typeof bandFor>;
  simulation: Simulation;
  /** The next built level, if there is one. */
  next?: Level;
  /** How many beats went wrong, so they can be offered as a repair round. */
  misses: number;
  onRepair: () => void;
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
        {ending.advances && next ? (
          <Link
            href={`/play/${simulation.id}?level=${next.n}`}
            className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Start Level {next.n} · {next.role}
            <ArrowRight className="h-[17px] w-[17px]" aria-hidden />
          </Link>
        ) : ending.advances ? (
          <span
            className="flex w-full items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold opacity-55"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            aria-disabled
          >
            {ending.primary}
          </span>
        ) : misses > 0 ? (
          <>
            {/* Replaying twenty screens to fix three answers is what makes a
               student close the app. Fixing the three is what makes them stay. */}
            <button
              type="button"
              onClick={onRepair}
              className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Wrench className="h-[16px] w-[16px]" aria-hidden />
              Fix your {misses} {misses === 1 ? "miss" : "misses"}
            </button>
            <p className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              Replays only what you got wrong. A fix is worth +2, not the full +5.
            </p>
            <button
              type="button"
              onClick={onReplay}
              className="dm-quiet flex w-full cursor-pointer items-center justify-center gap-[7px] rounded-full border px-[18px] py-[12px] text-[15px] font-bold"
              style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
            >
              <RotateCcw className="h-[15px] w-[15px]" aria-hidden />
              {ending.primary}
            </button>
          </>
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
        {ending.advances && !next && simulation.upcoming[0] && (
          <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {simulation.upcoming[0]} is coming soon.
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
        {ADVANCE_AT} and above advances.
      </p>
    </div>
  );
}
