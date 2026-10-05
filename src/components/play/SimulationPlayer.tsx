"use client";

import Image from "next/image";
import { SparkBar } from "@/components/flow/SparkBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Briefcase, ChevronLeft, CircleHelp, FastForward, FileText, Home, Music, RotateCcw, SkipForward, Star, Trophy, Volume2, VolumeX, Wrench, X } from "lucide-react";

import { IconTip } from "@/components/app/IconTip";
import { WORLD_COLORS } from "@/components/app/worlds";
import { ErrorView, LoadingView } from "@/components/app/states";

import { defaultExpressionFor, expressionFor, PORTRAIT_RATIO, VOICE_PITCH } from "./expressions";
import { locationFor } from "./locations";
import { DESKTOP_PLATE_SCALE, FALLBACK_PORTRAIT_RATIO, plateObjectPosition, spriteBox } from "./scenePlacement";
import { PerformancePlanFlow } from "./PerformancePlanFlow";
import { PERFORMANCE_PLANS, randomStepOrders, type PipState } from "./performance-plan";
import {
  BossOverlay,
  BucketBody,
  CardBody,
  ChainBody,
  CheckBody,
  ChoiceBody,
  FlagsBody,
  FlipsBody,
  FocusBody,
  MatchBody,
  PickBody,
  PromptSlot,
  Question,
  RankBody,
  RapidBody,
  RevealBody,
  SliderBody,
  TYPE_SPEED,
  useTypewriter,
  type Resolve,
} from "./interactions";
import { PresentationProvider, TypingProvider, usePresentation, type TypingRegistry } from "./presentation";
import { PreGameFlow, type PreGameMode } from "./PreGame";
import { ConfettiStorm } from "./ConfettiStorm";
import { musicFailedSnapshot, musicMutedSnapshot, playMusic, retryMusic, serverMusicFailedSnapshot, serverMusicMutedSnapshot, setMusicFocused, setMusicMuted, stopMusic, subscribeMusicFailed, subscribeMusicMuted } from "./music";
import { clearRun, progressSnapshot, readRun, saveRun, serverProgressSnapshot, subscribeProgress } from "./progress";
import {
  mutedSnapshot,
  playCharacterEnter,
  playFocusMoment,
  playSceneChange,
  playSelect,
  playSweep,
  playVoiceBlip,
  serverMutedSnapshot,
  setMuted,
  subscribeMuted,
} from "./sound";
import { ADVANCE_AT, BAND_COLOR, SCORED_BEATS, START_REPUTATION, STRIKE_TRIGGER, TIER_STRIKES, bandFor, clamp, endingFor } from "./scoring";
import { SKILL_MEANING } from "./skills";
import { TIER_HEADLINE, TIER_SCORE, type Beat, type Level, type Mood, type Simulation, type Tier } from "./types";
import { ConnectInterstitial } from "./ConnectInterstitial";
import { LocalBurst } from "@/components/build/ui";

// The player. A dialogue box over a full-bleed scene, the way a visual novel
// works: the art is the room, the box is the voice, and the choices are the
// only thing you can do. Everything about WHAT happens lives in the level data;
// this file only knows how a beat is staged and how reputation moves.

// DEMO-ONLY: a HUD button that jumps straight to the Connect interstitial
// without replaying a level (direct instruction, 17 Sept 2026: "add a back
// button or replay thing so we can QA without going back so many steps to
// launch this"). Same pattern as WelcomeSplash's DEMO_ALWAYS_SHOW_SPLASH.
// Flip back to false before this ships to students. See
// docs/HANDOFF_INDEX.md's Demo vs Production section.
export const DEMO_CONNECT_SHORTCUT = true;

type Phase = "beat" | "feedback" | "ending";

type Result = { tier: Tier; why: string; delta: number };

// Beat kinds that resolve a Tier through onResolve and so feed reputation --
// "card"/"check"/"flips"/"reveal"/"review" are narrative, teaching, or
// comprehension-check beats that never call onResolve with a scored tier
// (a `check` beat's own doc comment: "NOT SCORED, NOT A STRIKE").
const SCORED_KINDS = new Set<Beat["kind"]>(["choice", "match", "rapid", "chain", "slider", "flags", "rank", "pick", "bucket"]);
/** A beat that moves the score: a scored kind that is not a practice question. */
const isScored = (b: Beat) => SCORED_KINDS.has(b.kind) && !b.practice;

export function SimulationPlayer({ simulation, level }: { simulation: Simulation; level: Level }) {
  const router = useRouter();
  // Opens on "Start Level N" instead of navigating straight there -- one
  // real Connect interaction (Like/Comment/Ask a professional, always
  // skippable) between levels, direct instruction 17 Sept 2026.
  const [connectOpen, setConnectOpen] = useState(false);
  // Express runs save in their own slot (n + 100): the trimmed beats array
  // indexes differently, so resuming a full-mode save mid-Express (or vice
  // versa) would land on the wrong beat.
  const saveSlot = level.saveSlot ?? (level.express ? level.n + 100 : level.n);
  // AUTOSAVE. Storage is read as an external store, and the run is DERIVED from
  // it rather than seeded into useState: a state initialiser runs during
  // hydration, when useSyncExternalStore still reports the server snapshot, so
  // seeding silently threw the save away and every resume started at beat one.
  // Deriving means the saved run appears as soon as the store hydrates.
  const saved = readRun(useSyncExternalStore(subscribeProgress, progressSnapshot, serverProgressSnapshot), simulation.id, saveSlot);
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
  // "Ten Best answers take a perfect run from 50 to exactly 100" is the
  // handoff's scoring contract, but it assumes exactly SCORED_BEATS (10)
  // scored beats -- true for every level's full mode, but Express modes cut
  // beats (including scored ones, per direct feedback, 9 Sept 2026: "make
  // sure in express mode if everything correct the offer is received and
  // the reputation score scales appropriately") and can end up with fewer.
  // Flat +5-per-best against a shorter run just falls short of 85 (ADVANCE_AT)
  // even on a perfect play -- IB Level 1 Express currently has 4 scored
  // beats left after this session's cuts, so flat scoring would cap a
  // perfect run at 70. Scaling every tier's point value by
  // SCORED_BEATS / actualScoredBeats keeps a perfect run landing at exactly
  // 100 regardless of how many scored beats a given mode ends up with, full
  // or Express, without changing the underlying TIER_SCORE ratios (a Wrong
  // still costs the same fraction of a Best) or touching the shared
  // per-tier point table other simulations rely on.
  const scoreScale = useMemo(() => {
    // A level with fixed points (directed) scales Best to exactly that.
    if (level.points) return level.points / TIER_SCORE.best;
    const count = level.beats.filter(isScored).length;
    return count > 0 ? SCORED_BEATS / count : 1;
  }, [level.beats, level.points]);
  const scoredValue = useCallback((tier: Tier) => Math.round(TIER_SCORE[tier] * scoreScale), [scoreScale]);
  const reputation = clamp(reputationBaseline + Object.values(live.scores).reduce((total, tier) => total + scoredValue(tier), 0));
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
  const [autoNext, setAutoNext] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const beat = level.beats[index];
  const accent = WORLD_COLORS[simulation.world] ?? "var(--primary)";
  // The 4 Oct 2026 presentation pass, opt-in per level (Level.directed).
  const directed = Boolean(level.directed);
  const presentation = useMemo(() => ({ directed }), [directed]);
  // The optional run-up (Level.preGame): the start card shows when the level
  // opens fresh, and the HUD's ? reopens it at any time. Never a gate.
  // DERIVED for a fresh run, not seeded into state: on the first paint the
  // saved run has not hydrated yet, so a state initialiser would show the
  // start card over a run that is actually mid-way (same trap as the run
  // itself, see AUTOSAVE above).
  const [preGameOpen, setPreGameOpen] = useState<PreGameMode | null>(null);
  const [preGameDismissed, setPreGameDismissed] = useState(false);
  const preGameAuto = Boolean(level.preGame) && !preGameDismissed && run === null && !resumable && index === 0;
  const preGameMode: PreGameMode | null = preGameOpen ?? (preGameAuto ? "start" : null);
  const preGameInRun = preGameOpen !== null && (run !== null || resumable !== null);
  const closePreGame = () => {
    setPreGameOpen(null);
    setPreGameDismissed(true);
  };

  // EXPRESS: the cut teaching moves from push to pull ("Without these panels
  // Express is not a faster mode, it is an incomplete one" -- the handoff's
  // Do Not list). The lexicon is DERIVED from the level's own beats, so it
  // teaches exactly what the full mode teaches: vocabulary comes from the
  // flips card's own term/def pairs, and a character's panel is their own
  // intro card (kicker, one-liner, face). Nothing is authored twice.
  const expressLexicon = useMemo(() => {
    if (!level.express) return null;
    const cast = new Map<string, LexEntry>();
    const terms = new Map<string, LexEntry & { firstBeat: string | null }>();
    for (const entry of level.beats) {
      if (entry.kind === "card" && entry.variant === "character" && entry.castMember && !cast.has(entry.castMember)) {
        // Setup reads "Christina • Associate" -- the role half is the kicker,
        // the name is the panel's title.
        const role = entry.setup?.split("•")[1]?.trim() ?? entry.setup ?? "";
        cast.set(entry.castMember, { kicker: role, title: entry.castMember, body: entry.title, portrait: level.cast?.[entry.castMember] });
      }
      if (entry.kind === "flips") {
        for (const card of entry.cards) {
          const key = card.term.toLowerCase();
          if (!terms.has(key)) terms.set(key, { kicker: "What it means", title: card.term, body: card.def, firstBeat: null });
        }
      }
    }
    // Industry terms underline ONCE, on first use (the doc's rule) -- find the
    // first beat whose spoken line uses each term. Character names stay
    // tappable in every setup line ("their card again").
    for (const entry of level.beats) {
      const text = entry.setup ?? "";
      for (const item of terms.values()) {
        if (item.firstBeat === null && new RegExp(`\\b${item.title}\\b`, "i").test(text)) item.firstBeat = entry.id;
      }
    }
    return { cast, terms };
  }, [level]);
  const annotate = useMemo(() => {
    if (!expressLexicon) return undefined;
    const tokens: { token: string; entry: LexEntry }[] = [];
    for (const [name, entry] of expressLexicon.cast) tokens.push({ token: name, entry });
    for (const entry of expressLexicon.terms.values()) if (entry.firstBeat === beat.id) tokens.push({ token: entry.title, entry });
    if (!tokens.length) return undefined;
    const render = (line: string, open: (entry: LexEntry) => void) => renderTappableLine(line, tokens, open);
    return render;
  }, [expressLexicon, beat.id]);

  // Art is sticky: a beat without its own scene keeps the last one, so the
  // unillustrated beats feel like they happen in the same room.
  const scene = sceneFor(level, index, beat);
  // Wired 27 Sept 2026: a real loading view for the level's first paint,
  // gated on the actual scene image finishing (or, for a moodlit "none"
  // scene with no photo, resolving the moment that's known) -- not a fake
  // timer. Deliberately one-shot per mount (this component remounts per
  // level via the page's own `key={level.id}`): later beats swap scenes via
  // the "sticky art" rule above, and that swap must never bring this
  // overlay back over gameplay already in progress.
  const [sceneReady, setSceneReady] = useState(false);
  const sceneReadyOnce = useRef(false);
  const markSceneReady = useCallback(() => {
    if (sceneReadyOnce.current) return;
    sceneReadyOnce.current = true;
    setSceneReady(true);
  }, []);
  useEffect(() => {
    if (scene.mode === "none") markSceneReady();
  }, [scene.mode, markSceneReady]);
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
  const stageable = Boolean(beat.setup) && beat.kind !== "card" && beat.kind !== "review" && !(directed && beat.inlineSetup);
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
      // Hold on the board before the card: long enough to see what you picked
      // land, and longer on a miss so the revealed right answer is readable
      // before the explanation covers it.
      // Directed levels hold a miss a little less (950ms): the revealed right
      // answer is still readable, and the verdict follows sooner.
      const hold = tier === "wrong" || tier === "risky" ? (directed ? 950 : 1150) : 420;
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
      // A practice question shows its verdict and nothing else: no score, no
      // strike, no dot.
      if (beat.practice) {
        // A practice beat the script gives no verdict screen just moves on.
        if (directed && beat.noVerdict) {
          window.setTimeout(() => setAutoNext((n) => n + 1), hold);
          return;
        }
        window.setTimeout(() => {
          setResult({ tier, why, delta: 0 });
          setPhase("feedback");
        }, hold);
        return;
      }
      // Once a plan has fired this level, further strikes just cost
      // reputation as normal -- "Frequency: Once per level."
      const strikeDelta = pipUsed ? 0 : (TIER_STRIKES[banked] ?? 0);
      window.setTimeout(() => {
        setRun((current) => {
          const from = current ?? base;
          return { ...from, scores: { ...from.scores, [beatId]: banked } };
        });
        if (strikeDelta > 0 && !level.noStrikes) {
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
        setResult({ tier: banked, why, delta: scoredValue(banked) });
        setPhase("feedback");
      }, hold);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locked, repair, beat.id, pipUsed, strikes, index, scoredValue],
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
      // `[]` is truthy -- setting repair to an empty array here (instead of
      // null once the queue is exhausted) meant the NEXT advance() call (the
      // one from clicking the review beat's own "See the decision" button)
      // took this same `if (repair)` branch again instead of ever reaching
      // the end-of-level check below, re-landing on the review beat instead
      // of completing it. That's the exact "nothing happens when I click"
      // report -- only reproducible after a repair round, since a run with
      // no misses never sets `repair` at all.
      setRepair(rest.length > 0 ? rest : null);
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
      clearRun(simulation.id, saveSlot);
      setPhase("ending");
      return;
    }
    setPhase("beat");
    patchRun({ index: index + 1 });
    saveRun({ gameId: simulation.id, level: saveSlot, index: index + 1, scores: live.scores, reputation, scored });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, level.beats, level.n, simulation.id, reputation, scored, repair, reviewIndex]);
  // A no-verdict practice beat (Beat.noVerdict) asks to move on once
  // answered; the counter keeps resolve() from holding a stale advance.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- advancing is the effect's whole job, once per request
    if (autoNext > 0) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once per request, not when advance re-memoises
  }, [autoNext]);

  // DEMO-ONLY (Level.qaSkip): past any screen without answering it.
  const skipScreen = useCallback(() => {
    if (index + 1 >= level.beats.length) return;
    setLocked(null);
    setResult(null);
    setPhase("beat");
    patchRun({ index: index + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, level.beats.length]);

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
    clearRun(simulation.id, saveSlot);
    setRun({ index: 0, scores: {} });
    setRepair(null);
    setLocked(null);
    setResult(null);
    setPhase("beat");
    setStrikes(0);
    setPipUsed(false);
    setReputationBaseline(START_REPUTATION);
    setConnectOpen(false);
  };

  // DEMO-ONLY (lab builds, Level.qaSkip): back to screen one with a clean
  // slate, start card included, from any screen (Chandu, 5 Oct 2026: "there
  // needs to be a start over button for me for demo").
  const startOver = () => {
    restart();
    setRun(null);
    setPreGameOpen(null);
    setPreGameDismissed(false);
  };

  /** Replay only the beats that went wrong. */
  const startRepair = () => {
    if (!misses.length) return;
    const queue = level.beats.filter((entry) => misses.includes(entry.id)).map((entry) => entry.id);
    setRepair(queue);
    setLocked(null);
    setResult(null);
    setPhase("beat");
    setConnectOpen(false);
    const to = level.beats.findIndex((entry) => entry.id === queue[0]);
    patchRun({ index: to });
  };

  const band = bandFor(reputation);
  const ending = endingFor(level.endings, reputation);
  const nextLevel = simulation.levels.find((entry) => entry.n === level.n + 1);

  // Music: the Main Song runs for the whole level, switching to the
  // Promotion Song only once an ending actually advances the player --
  // restart()/startRepair() (both "redoing steps") explicitly switch back to
  // Main themselves, so this effect only ever needs to move forward from
  // beat/feedback into a promoting ending, never the other direction.
  const promoted = phase === "ending" && ending.advances;
  useEffect(() => {
    playMusic(promoted ? "promotion" : "main", simulation.id);
  }, [promoted, simulation.id]);
  useEffect(() => stopMusic, []);

  // Muffle the music -- a lowpass, not a mute -- for a PIP or a timed focus
  // question, so the room reads as going quiet around the player instead of
  // the song just stopping. `timerActive` is reported up from BeatStage,
  // the only place that knows whether THIS beat's clock is actually
  // counting down right now (same guard its own <Clock> render uses).
  const [timerActive, setTimerActive] = useState(false);
  const musicFocused = pip !== null || timerActive;
  useEffect(() => {
    setMusicFocused(musicFocused);
  }, [musicFocused]);
  // A beat can override the level's mood: Level 2 runs three screens in
  // late-night navy and comes back, Level 3 has a maroon Crunch Time stretch.
  const mood = beat.mood ?? level.mood;
  // Blur ONLY a standalone interactive question-answer screen -- the moment
  // the controls the player is actually working with are on screen, never
  // the dialogue leading up to them. Cards and review have no controls to
  // focus, so they never blur. Applies to a hero plate exactly the same as a
  // location: the rule is about the screen, not which kind of art is behind it.
  // Directed levels clear the room again while the verdict is up, so the
  // character who asked can be SEEN reacting to it (see stageCast).
  const dimmed =
    (revealed && beat.kind !== "card" && beat.kind !== "review" && !(directed && phase === "feedback") && !(directed && beat.keepScene && scene.mode === "location")) ||
    // Directed: a final review that has a room behind it shows it blurred
    // and darkened (RN v2 screen 54), so the score is what you look at.
    (directed && beat.kind === "review");
  // A handful of beats author `tone: "conflict" | "alarm"` on themselves --
  // borrow the concerned/uncertain tier reaction as the neutral face for
  // those, so the same character isn't smiling through a tense moment.
  const neutralTier: Tier | undefined =
    "tone" in beat && (beat.tone === "conflict" || beat.tone === "alarm") ? "wrong" : undefined;
  // Who stands in the room right now, and with which face. One list feeds
  // both the render below and the dialogue box (which holds back its own
  // small portrait while a big character carries the speaker).
  //
  // Directed levels (4 Oct 2026) add two things: a scored beat's REACTOR
  // (its speaker, or `reactor` when someone else should react) steps back
  // into the cleared room wearing the verdict's face while the feedback is
  // up -- the expression variety lives here, big enough to see -- and a
  // card can wear the reaction to an earlier beat (`reactsTo`).
  const reactor = beat.reactor ?? beat.speaker;
  const reacting = directed && phase === "feedback" && result !== null && Boolean(expressionFor(reactor, result.tier));
  const echoedTier: Tier | undefined = directed && beat.kind === "card" && beat.reactsTo ? live.scores[beat.reactsTo] : undefined;
  // keepScene (directed): the person the script shows stays in the room
  // while the question is answered (RN v2: "IMAGE: DA RN SIM ROSA" on 8 and
  // 30, Tyler on 41), instead of stepping aside behind a blur.
  const showStage = scene.mode === "location" && (beat.kind === "card" || beat.kind === "review" || !revealed || reacting || (directed && Boolean(beat.keepScene)));
  const stageCast: { name: string; slot: CharSlot; tier?: Tier; z?: number }[] = [];
  if (showStage && scene.mode === "location") {
    if (scene.characterAnchors && beat.castMembers) {
      beat.castMembers.forEach((name, i) => {
        const slot = scene.characterAnchors?.[i];
        if (!slot || !defaultExpressionFor(name)) return;
        // Christina reads as the host greeting Jordan into the room, so she
        // stands in front of him; on a directed level whoever is speaking
        // stands in front, and once the verdict lands, whoever reacts.
        const lead = directed && (phase === "feedback" ? name === reactor : name === beat.speaker);
        stageCast.push({
          name,
          slot,
          tier: directed && name === reactor ? (phase === "feedback" ? result?.tier : undefined) ?? echoedTier : undefined,
          z: lead ? 3 : name === "Christina" ? 2 : 1,
        });
      });
    } else if (scene.characterAnchor) {
      const name = reacting ? reactor : (beat.castMember ?? beat.speaker);
      if (name && defaultExpressionFor(name)) {
        stageCast.push({ name, slot: scene.characterAnchor, tier: (phase === "feedback" ? result?.tier : undefined) ?? echoedTier });
      }
    }
  }
  const bigCharacterVisible = stageCast.length > 0;
  const bossEntrance = directed && beat.kind === "card" && beat.entrance === "boss";
  // "Level 1.5" from the section card on (Level.sectionAfter).
  const sectionStart = level.sectionAfter ? level.beats.findIndex((b) => b.id === level.sectionAfter?.beatId) : -1;
  const sectionLabel = sectionStart >= 0 && index >= sectionStart ? level.sectionAfter?.label : undefined;
  // The checkpoint stage (directed, IB v2 screen 30): its own celebratory
  // backdrop, so reaching it reads as a milestone, not another card.
  const checkpointStage = directed && Boolean(level.preGame) && beat.kind === "card" && beat.variant === "act";

  // POINTS TRAVEL (directed, doc screens 12-13): the verdict's +6 / -6
  // flies from the feedback card into the score in the corner, and only
  // when it lands does the number move and the gauge glow -- "every time
  // reputation changes, the points should visually travel back into this
  // score so students understand the connection". Until then the HUD shows
  // the score from before this answer.
  const [landedResult, setLandedResult] = useState<Result | null>(null);
  const flying = directed && phase === "feedback" && result !== null && landedResult !== result && result.delta !== 0;
  const shownReputation = flying && result ? clamp(reputation - result.delta) : reputation;
  const [glowing, setGlowing] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const land = useCallback(() => {
    setLandedResult(result);
    setGlowing(true);
    playSelect();
    // The one-time tooltip under the score, the first time it moves in a run.
    if (level.scoreTip && scored === 1) setTipOpen(true);
  }, [result, level.scoreTip, scored]);
  useEffect(() => {
    if (!tipOpen) return;
    const timer = window.setTimeout(() => setTipOpen(false), 4200);
    return () => window.clearTimeout(timer);
  }, [tipOpen]);
  useEffect(() => {
    if (!glowing) return;
    const timer = window.setTimeout(() => setGlowing(false), 1400);
    return () => window.clearTimeout(timer);
  }, [glowing]);
  // The act moment's "reputation pulse" (doc, after screen 16) rides the same glow.
  const scoreGlow = directed && (glowing || (beat.kind === "card" && beat.variant === "act"));

  // The checkpoint IS the save point (doc: "If the student selects Finish
  // Later, reopening the simulation should resume at the beginning of Act
  // 3"): the moment it shows, the run is saved one beat past it, so leaving
  // from here -- by its button or by closing the tab -- resumes on Act 3.
  useEffect(() => {
    // Only once the player owns the run: on a resume that lands exactly on
    // the checkpoint, saving ahead would rewrite the very save being read
    // and skip the checkpoint before it was ever shown.
    if (!directed || run === null || beat.kind !== "card" || beat.variant !== "act" || !beat.secondaryCta || phase !== "beat") return;
    saveRun({ gameId: simulation.id, level: saveSlot, index: index + 1, scores: live.scores, reputation, scored });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per arrival on the checkpoint
  }, [beat.id, phase]);

  // HUD dots: one per scored beat this level actually has, with the act
  // boundaries drawn larger (directed); untouched levels keep ten dots with
  // every third marked, exactly as before.
  const scoredIds = useMemo(() => level.beats.filter(isScored).map((b) => b.id), [level.beats]);
  const dotPlan = useMemo(() => {
    if (!directed) return { total: SCORED_BEATS, big: new Set([2, 5, 8]) };
    const big = new Set<number>();
    let count = 0;
    for (const b of level.beats) {
      if (isScored(b)) count += 1;
      if (b.kind === "card" && b.variant === "act" && count > 0) big.add(count - 1);
    }
    big.add(scoredIds.length - 1);
    return { total: scoredIds.length, big };
  }, [directed, level.beats, scoredIds]);

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
    <PresentationProvider value={presentation}>
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
            // keepScene (directed): the picture IS the story here, so it is
            // only darkened behind the question, never blurred.
            style={{ filter: dimmed ? (beat.keepScene ? "brightness(0.72)" : "blur(7px) brightness(0.7) saturate(0.45)") : undefined }}
          >
            <SceneLayers src={scene.src} alt={scene.alt} onReady={markSceneReady} />
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
              onReady={markSceneReady}
            />
            {/* A card or the review is never staged (see BeatStage's own
               `stageable`), so it is always in its "revealed" state -- the
               character shows for its whole beat, same as it always has. An
               interactive beat IS staged: the character carries the speaker
               while its setup line is being read, then steps aside the
               moment the controls appear, handing the speaker off to the
               dialogue box's small portrait so nothing stands over the
               answers the player is actually working with. */}
            {/* The boss arrival (directed, doc screen 24): the room drops
               into shadow around a warm spotlight behind the character, so
               the entrance reads as an event before a word is read. */}
            {bossEntrance && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 motion-safe:animate-[fade-slide-up_0.9s_ease-out_both]"
                style={{ background: "radial-gradient(38% 60% at 50% 42%, rgba(255,206,120,0.22) 0%, transparent 70%), radial-gradient(ellipse at center, transparent 30%, rgba(4,6,14,0.72) 100%)" }}
              />
            )}
            {stageCast.map((member) => (
              <SceneCharacter
                key={member.name}
                speaker={member.name}
                anchor={member.slot}
                tier={member.tier}
                neutralTier={neutralTier}
                offset={sceneOffset}
                sceneHeight={sceneHeight}
                zIndex={member.z}
                dramatic={bossEntrance}
              />
            ))}
          </div>
        )}
      </div>

      {/* The level's first paint: gone the instant the scene's own image
         reports loaded (see markSceneReady above), never a fixed delay.
         Sits above the (still-mounting) scene/HUD rather than replacing
         them, so there is nothing to re-mount once it clears. */}
      {!sceneReady && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center" style={{ background: "var(--background)" }}>
          <div className="w-full max-w-[240px] px-4">
            <LoadingView label="Loading level" shape="chip" />
          </div>
        </div>
      )}

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
        reputation={shownReputation}
        band={band}
        scored={scored}
        delta={directed ? null : phase === "feedback" ? (result?.delta ?? null) : null}
        accent={accent}
        spotlightScore={beat.spotlight === "score"}
        dots={dotPlan}
        glow={scoreGlow}
        tip={tipOpen ? level.scoreTip : undefined}
        sectionLabel={sectionLabel}
        onSkip={level.qaSkip && index + 1 < level.beats.length ? skipScreen : undefined}
        onStartOver={level.qaSkip ? startOver : undefined}
        onGuide={
          level.preGame
            ? () => setPreGameOpen("start")
            : undefined
        }
        onBack={index > 0 ? goBack : undefined}
        onOpenConnect={DEMO_CONNECT_SHORTCUT && nextLevel ? () => setConnectOpen(true) : undefined}
      />

      {pip ? (
        <PerformancePlanFlow
          plan={(PERFORMANCE_PLANS[simulation.id] ?? PERFORMANCE_PLANS["investment-banking"])[level.n as 1 | 2 | 3]}
          pip={pip}
          onPassed={() => {
            const earned = Object.values(live.scores).reduce((total, tier) => total + scoredValue(tier), 0);
            setReputationBaseline(50 - earned);
            setPip(null);
            setStrikes(0);
            setPhase("beat");
            patchRun({ index: pip.resumeIndex });
            saveRun({ gameId: simulation.id, level: saveSlot, index: pip.resumeIndex, scores: live.scores, reputation: 50, scored });
          }}
          onTerminated={() => {
            setPip(null);
            setStrikes(0);
            setPipUsed(false);
            setReputationBaseline(START_REPUTATION);
            clearRun(simulation.id, saveSlot);
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
            next={nextLevel}
            misses={misses.length}
            onAdvance={() => setConnectOpen(true)}
            onRepair={startRepair}
            onReplay={restart}
            directed={directed}
            fromRole={level.role}
            fixWorth={scoredValue("acceptable")}
            fullWorth={scoredValue("best")}
            noRepair={level.noRepair}
            plainEndings={level.plainEndings}
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
          annotate={annotate}
          locked={locked}
          paused={phase !== "beat"}
          ambient={scene.mode === "none"}
          // The big cinematic character already carries the speaker -- the
          // dialogue box's small round portrait would just be a second,
          // redundant face on screen at the same time.
          sceneCharacterVisible={bigCharacterVisible}
          reputation={reputation}
          onRevealChange={setRevealed}
          onTimerActive={setTimerActive}
          onResolve={resolve}
          onNext={advance}
        />
      )}

      {phase === "feedback" && result && (
        <FeedbackSheet
          beat={beat}
          result={result}
          reputation={reputation}
          onNext={advance}
          docked={directed}
          reactor={directed ? reactor : beat.speaker}
          // The big reacting character already carries the face on a
          // directed level; the card only shows one when nobody is on stage.
          portraitOff={directed && reacting && bigCharacterVisible}
        />
      )}
      {flying && result && <ScoreFlight key={`flight-${beat.id}${repair ? "-fix" : ""}`} delta={result.delta} onLand={land} />}

      {/* Rendered outside the phase branches so the demo shortcut (Hud's
         FastForward button) can force it open from any beat, not only from
         the ending screen it normally opens from. */}
      {connectOpen && nextLevel && (
        <ConnectInterstitial
          simulation={simulation}
          stageRole={level.role}
          nextLevelLabel={`Level ${nextLevel.n} · ${nextLevel.role}`}
          onContinue={() => router.push(`/play/${simulation.id}?level=${nextLevel.n}`)}
        />
      )}

      {checkpointStage && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] motion-safe:animate-[fade-slide-up_0.6s_ease-out_both]" style={{ background: `radial-gradient(60% 55% at 50% 40%, color-mix(in srgb, ${accent} 30%, transparent), transparent 70%), radial-gradient(120% 90% at 50% 120%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 60%), color-mix(in srgb, var(--background) 78%, transparent)` }}>
          <AmbientBackdrop mood="day" accent={accent} />
        </div>
      )}
      {directed && level.preGame && phase === "ending" && ending.advances && <ConfettiStorm accent={accent} />}
      {preGameMode && level.preGame && (
        <PreGameFlow
          simulation={simulation}
          level={level}
          preGame={level.preGame}
          accent={accent}
          initial={preGameMode}
          inRun={preGameInRun}
          onClose={closePreGame}
          onStart={closePreGame}
        />
      )}

      {repair && repair.length > 0 && phase === "beat" && (
        <div className="absolute inset-x-0 top-[74px] z-30 flex justify-center px-3">
          <span
            className="flex items-center gap-[9px] rounded-[var(--radius-sm)] border px-[14px] py-[7px] text-[12.5px] font-bold backdrop-blur-[10px]"
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
            className="pointer-events-auto flex items-center gap-[10px] rounded-[var(--radius-sm)] border px-[14px] py-[7px] text-[12.5px] font-bold backdrop-blur-[10px]"
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
    </PresentationProvider>
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

function SceneLayers({ src, alt, onReady }: { src: string; alt: string; onReady?: () => void }) {
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
      onLoad={onReady}
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
  onReady,
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
  onReady?: () => void;
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
        style={{ objectPosition: plateObjectPosition(mobileFocal), filter }}
        onLoad={onReady}
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="hidden object-cover transition-[filter] duration-500 motion-safe:animate-[play-scene-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both] sm:block"
        style={{
          objectPosition: plateObjectPosition(focal),
          transform: `translate3d(${offset.x * -6}px, ${offset.y * -4}px, 0) scale(${DESKTOP_PLATE_SCALE})`,
          filter,
        }}
        onLoad={onReady}
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
  dramatic = false,
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
  /** The boss arrival: a slower rise out of shadow into a warm rim light. */
  dramatic?: boolean;
}) {
  const src = (tier && expressionFor(speaker, tier)) || (neutralTier && expressionFor(speaker, neutralTier)) || defaultExpressionFor(speaker);
  // Pairs with the entrance animation below, which is keyed on the same
  // `src` for the same reason: a genuinely new image (a new speaker, or an
  // expression swap), not just this component re-rendering.
  useEffect(() => {
    if (src) playCharacterEnter();
  }, [src]);
  if (!src || sceneHeight === 0) return null;
  // The boss arrival also stands a little larger than anyone else, in a
  // slow-breathing warm aura (IB v2 screen 24: "significantly more visual
  // presence and aura than previous character introductions").
  // Centered and filling the room is the norm -- whoever is speaking is the
  // thing to look at, the same treatment Jordan's introduction got. The two
  // boardrooms are the one exception: `centered: false` there keeps a
  // character in the single strip of open floor by the window, since the
  // rest of the room is furniture with no mask asset yet to occlude it.
  // The math lives in scenePlacement.ts, shared with /play-tools/scene-review.
  const box = spriteBox(anchor, sceneHeight);
  return (
    <span
      aria-hidden
      // No idle bob: two characters sharing a scene, animating on independent
      // unsynced loops, drift in and out of alignment with each other and
      // read as a positioning bug rather than a subtle idle. The entrance
      // animation plus pointer parallax is motion enough.
      className="pointer-events-none absolute"
      style={{
        left: `${box.leftPct}%`,
        bottom: `${box.bottomPx}px`,
        height: `${box.heightPx}px`,
        zIndex,
        transform: `translate3d(calc(-50% + ${offset.x * 14}px), ${offset.y * -8}px, 0)${dramatic ? " scale(1.04)" : ""}`,
        transformOrigin: "50% 100%",
      }}
    >
      {dramatic && (
        <span
          aria-hidden
          className="absolute top-[4%] left-1/2 h-[70%] w-[150%] -translate-x-1/2 rounded-full motion-safe:animate-[play-boss-aura_3.2s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(closest-side, rgba(255,200,110,0.42), rgba(255,170,70,0.16) 55%, transparent)", filter: "blur(10px)" }}
        />
      )}
      {/* Keyed on the image itself: whenever the speaker changes, or their
         expression swaps on commit, this remounts and plays its entrance again
         -- the character visibly steps into the scene rather than a flat image
         just appearing or silently swapping underneath the player. */}
      <Image
        key={src}
        src={src}
        alt=""
        width={Math.round((PORTRAIT_RATIO[src] ?? FALLBACK_PORTRAIT_RATIO) * 900)}
        height={900}
        // max-w-none overrides Tailwind preflight's `img { max-width: 100% }`
        // -- inside this absolutely positioned, auto-width span, that rule's
        // percentage resolved against an indefinite container and silently
        // clamped the sprite to a fraction of its real size (confirmed live:
        // removing it took a 188px-wide render to its correct 639px). That
        // clamp, not the anchor math, was the actual cause of characters
        // reading as small and "floating" far above the dialogue box.
        className={`h-full w-auto max-w-none object-contain ${
          dramatic
            ? "drop-shadow-[0_0_34px_rgba(255,200,110,0.35)] motion-safe:animate-[play-boss-enter_1.1s_cubic-bezier(0.16,1,0.3,1)_both]"
            : "drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] motion-safe:animate-[play-character-enter_0.42s_cubic-bezier(0.16,1,0.3,1)_both]"
        }`}
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
  annotate,
  locked,
  paused,
  hidden,
  ambient,
  sceneCharacterVisible,
  reputation = 0,
  onRevealChange,
  onTimerActive,
  onResolve,
  onNext,
}: {
  beat: Beat;
  /** The live score, for the final review's suspense build (directed). */
  reputation?: number;
  accent: string;
  cast?: Record<string, string>;
  /** Express only: wraps a finished dialogue line's industry terms and
   *  character names in tappable spans (the pull version of the cut
   *  teaching screens). */
  annotate?: (line: string, open: (entry: LexEntry) => void) => React.ReactNode;
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
  /** Reports whether THIS beat's countdown is actually counting down right
   *  now -- same guard its own <Clock> render uses -- so the parent can
   *  muffle the music for a timed focus question. */
  onTimerActive?: (active: boolean) => void;
  onResolve: Resolve;
  onNext: () => void;
}) {
  // RPG pacing: read the situation first, advance when YOU are ready, and only
  // then does the question and its options appear. The situation stays on
  // screen underneath, because several beats cannot be answered without it.
  // Cards and the review beat are not staged -- their "setup" is a label like
  // "Intern • Week 1", not a paragraph to read.
  // No mascot in the simulation (Interaction Rules, D62): the Narrator sets
  // scenes and the System carries the rules, and NEITHER shows an avatar or
  // a name -- a student should be able to tell at a glance whether the
  // office is talking (a named character with a face) or the game is.
  const voiceless = beat.speaker === "Dreamy" || beat.speaker === "Narrator" || beat.speaker === "System";
  const speaker = voiceless ? undefined : beat.speaker;
  const portrait = speaker && !sceneCharacterVisible ? cast?.[speaker] : undefined;
  // The three voices, each with its own face, box shape and sound (or
  // silence): a CHARACTER speaks in the display face with voice blips and
  // a chat-notched bubble; the NARRATOR sets scenes in quiet italics; a
  // SYSTEM card is the game talking -- squared, hairline, silent.
  const voice: DialogueVoice = beat.speaker === "System" ? "system" : speaker ? "character" : "narrator";
  const { directed: directedStage } = usePresentation();
  const stageable =
    Boolean(beat.setup) &&
    beat.kind !== "card" &&
    beat.kind !== "review" &&
    !(directedStage && beat.inlineSetup);
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
  // A body can stop the clock while the student reads an explanation
  // (directed rapid-fire, between questions).
  const [clockHeld, setClockHeld] = useState(false);

  useEffect(() => {
    // A timed beat must not burn its clock while the player is still reading
    // the situation. The timer starts when the question does.
    if (!seconds || paused || locked || !revealed || clockHeld) return;
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
        // The fallback's "real week" is IB wording; a directed level's
        // scripts give no timeout line, so it just says what happened.
        onResolve("wrong", directedStage ? "Time ran out." : "Time ran out. In a real week, silence is its own answer.", fallback.id);
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [seconds, paused, locked, revealed, clockHeld, beat, onResolve, directedStage]);

  const timerActive = seconds > 0 && !paused && revealed;
  useEffect(() => {
    onTimerActive?.(timerActive);
    return () => onTimerActive?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive]);

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
  // System teach/intro cards read as the game addressing the player, not a
  // caption under a scene -- big intros like these sit CENTER SCREEN (direct
  // feedback). Character cards and narrator story captions keep the
  // bottom-docked dialogue placement.
  const { directed } = usePresentation();
  // Directed: act and checkpoint cards sit centre stage, a little high (IB
  // v2 screen 30: "move the checkpoint content slightly higher"), story cards
  // can ask for the centre (`center`), and a keepScene question docks low so
  // the picture above it stays readable.
  const actCard = directed && beat.kind === "card" && beat.variant === "act";
  const lowQuestion = directed && interactive && beat.keepScene;
  const centered = !lowQuestion && (interactive || beat.kind === "review" || (beat.kind === "card" && (beat.system === true || actCard || (directed && beat.center === true))));
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
            centered ? (actCard ? "-translate-y-[7dvh]" : "") : "mb-[3dvh] sm:mb-[4dvh]"
          }`}
        >
          {beat.kind === "choice" && beat.layout === "boss" ? (
            <DialogueBox speaker={speaker} portrait={portrait} setup={stageable && revealed ? undefined : beat.setup} accent={accent} gold held={!revealed} ambient={ambient} voice={voice} annotate={annotate} onAdvance={() => setRevealed(true)}>
              <BossOverlay beat={beat} onResolve={onResolve} locked={locked} />
            </DialogueBox>
          ) : (
            <DialogueBox
              speaker={speaker}
              portrait={portrait}
              // The general rule (Joshua Pierce, Slack, 6 Sept 2026): once a
              // character has said the line in the scene, the activity screen
              // does not repeat it. Cards keep their eyebrow; a staged beat
              // drops its spoken line the moment the interaction is revealed.
              setup={stageable && revealed ? undefined : beat.setup}
              accent={accent}
              tone={"tone" in beat ? beat.tone : undefined}
              gold={beat.kind === "card" && (beat.celebrate || beat.entrance === "boss")}
              held={!revealed}
              staticSetup={!stageable}
              voice={voice}
              annotate={annotate}
              onAdvance={() => setRevealed(true)}
              onPrimary={beat.kind === "card" || beat.kind === "review" ? onNext : undefined}
              ambient={ambient}
            >
              <BeatBody beat={beat} accent={accent} cast={cast} reputation={reputation} locked={locked} remaining={remaining} onClockHold={setClockHeld} onResolve={onResolve} onNext={onNext} />
            </DialogueBox>
          )}
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------ the body

/** The fallback Action Prompt per mechanic, in the sheet's own wording --
 *  used whenever a beat doesn't author its own `prompt`. */
function DEFAULT_PROMPT(beat: Beat): string | undefined {
  switch (beat.kind) {
    case "choice":
      if (beat.layout === "blank" || beat.layout === "tiles") return "Drag or tap the right word into the space.";
      if (beat.layout === "document") return "Tap the line with the mistake.";
      if (beat.layout === "boss") return "Choose one.";
      return "timer" in beat && beat.timer ? "Tap one before the timer runs out." : "Tap one.";
    case "match":
      return "Tap a quote, then tap its match.";
    case "rapid":
      return beat.timer ? "Quick questions, one timer. Tap fast." : "Quick questions. Tap fast.";
    case "slider":
      return "Slide to your answer, then confirm.";
    case "flags":
      return "Tap every problem you can find, then submit.";
    case "rank":
      return "Move the rows into order, then submit.";
    case "pick":
      return `Pick ${beat.pick}, then submit.`;
    case "bucket":
      return "Sort each one into a bucket.";
    case "chain":
      return "Build the answer one step at a time.";
    default:
      return undefined;
  }
}

function BeatBody({
  beat,
  accent,
  cast,
  reputation = 0,
  locked,
  remaining,
  onClockHold,
  onResolve,
  onNext,
}: {
  beat: Beat;
  cast?: Record<string, string>;
  reputation?: number;
  onClockHold?: (held: boolean) => void;
  /** The simulation's world color -- teach/ladder accents follow the
   *  career, never a hardcoded world. */
  accent: string;
  locked: string | null;
  remaining: number;
  onResolve: Resolve;
  onNext: () => void;
}) {
  // The Action Prompt (Interaction Rules): every screen states its action
  // in the same small grey style. A beat can author its own line; the rest
  // derive one from their mechanic, so no screen ships without one. Cards
  // and the review are exempt -- there the button label IS the prompt.
  const { directed } = usePresentation();
  // Directed levels (doc screens 11 and 27): no "Tap one." over plain
  // options and no second instruction over the document -- the question
  // already says what to do, once. The drag designs carry their own cues.
  const silentPrompt =
    directed &&
    beat.kind === "choice" &&
    (beat.layout === "options" || beat.layout === "document" || beat.layout === "zones" || beat.layout === "move" || beat.layout === "chat") ||
    // Neither script writes these fallbacks ("Quick questions, one timer.
    // Tap fast.", "Pick 3, then submit."): the rapid set has its own
    // question count and pass line, the pick its own counter.
    (directed && (beat.kind === "rapid" || beat.kind === "pick" || beat.kind === "rank"));
  // An authored prompt always shows; only the derived fallback goes quiet.
  const promptText =
    beat.kind === "card" || beat.kind === "review"
      ? undefined
      : (beat.prompt ?? (silentPrompt ? undefined : DEFAULT_PROMPT(beat)));
  const prompt = promptText && (
    <p className="text-[12px] font-bold tracking-[0.04em]" style={{ color: "var(--muted-foreground)" }}>
      {promptText}
    </p>
  );
  const body = (() => {
    if (beat.kind === "card") return <CardBody beat={beat} accent={accent} onNext={onNext} />;
    if (beat.kind === "check") return <CheckBody beat={beat} onNext={onNext} />;
    if (beat.kind === "reveal") return <RevealBody beat={beat} onNext={onNext} />;
    if (beat.kind === "flips") return <FlipsBody beat={beat} accent={accent} onNext={onNext} />;
    if (beat.kind === "focus") return <FocusBody beat={beat} accent={accent} onNext={onNext} />;
    if (beat.kind === "choice") return <ChoiceBody beat={beat} accent={accent} cast={cast} onResolve={onResolve} locked={locked} />;
    if (beat.kind === "match") return <MatchBody beat={beat} onResolve={onResolve} />;
    if (beat.kind === "rapid") return <RapidBody beat={beat} onResolve={onResolve} remaining={remaining} onClockHold={onClockHold} />;
    if (beat.kind === "chain") return <ChainBody beat={beat} onResolve={onResolve} />;
    if (beat.kind === "slider") return <SliderBody beat={beat} onResolve={onResolve} />;
    if (beat.kind === "flags") return <FlagsBody beat={beat} onResolve={onResolve} remaining={remaining} />;
    if (beat.kind === "rank") return <RankBody beat={beat} onResolve={onResolve} />;
    if (beat.kind === "pick") return <PickBody beat={beat} onResolve={onResolve} remaining={remaining} />;
    if (beat.kind === "bucket") return <BucketBody beat={beat} onResolve={onResolve} />;
    return <ReviewBody title={beat.title} body={beat.body} onNext={onNext} reputation={directed ? reputation : undefined} accent={accent} pending={beat.kind === "review" ? beat.pending : undefined} />;
  })();
  if (!prompt) return body;
  // Directed: heading first, then its instruction (both v2 scripts), or the
  // instruction IS the heading (RN v2 screen 33).
  if (directed && beat.prompt && beat.kind !== "card" && beat.kind !== "review") {
    if (beat.promptStyle === "heading") {
      return (
        <div className="flex flex-col gap-[var(--space-3)]">
          <Question>{beat.prompt}</Question>
          {body}
        </div>
      );
    }
    return <PromptSlot.Provider value={prompt}>{body}</PromptSlot.Provider>;
  }
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      {prompt}
      {body}
    </div>
  );
}

/** The Final Review beat: a held breath before the ending. */
function ReviewBody({ title, body, onNext, reputation, accent = "var(--primary)", pending }: { title: string; body: string; onNext: () => void; reputation?: number; accent?: string; pending?: string }) {
  const [ready, setReady] = useState(false);
  // Directed (doc screen 38): "have the reputation score become the visual
  // focus of the screen and build suspense before revealing the outcome".
  // The ring fills from zero to the real score, slowing as it nears it,
  // and the decision unlocks only after it settles.
  const suspense = typeof reputation === "number";
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!suspense) {
      const timer = window.setTimeout(() => setReady(true), 2200);
      return () => window.clearTimeout(timer);
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced motion jumps straight to the final count
      setCount(reputation);
      setReady(true);
      return;
    }
    const duration = 2600;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      setCount(Math.round(reputation * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
      else window.setTimeout(() => setReady(true), 450);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [suspense, reputation]);
  if (suspense) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] text-center">
        <span className="text-[12px] font-extrabold tracking-[0.22em] uppercase" style={{ color: accent }}>Final Review</span>
        <p className="text-[19px] leading-[1.2] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>{title}</p>
        <span className="relative my-[var(--space-2)] flex h-[132px] w-[132px] items-center justify-center">
          <svg viewBox="0 0 132 132" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
            <circle cx="66" cy="66" r={radius} fill="none" stroke="var(--color-glass-border-raised)" strokeWidth="8" />
            <circle cx="66" cy="66" r={radius} fill="none" stroke={accent} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - count / 100)} style={{ filter: `drop-shadow(0 0 10px color-mix(in srgb, ${accent} 60%, transparent))` }} />
          </svg>
          <span className="flex flex-col items-center leading-none">
            {/* RN v2 screen 54: "REPUTATION 92". */}
            <span className="mb-[4px] text-[10.5px] font-extrabold tracking-[0.18em] uppercase" style={{ color: "var(--muted-foreground)" }} aria-hidden>Reputation</span>
            <span className="text-[44px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: accent }} aria-label={`Reputation ${reputation}`}>{count}</span>
          </span>
        </span>
        <p className="text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{body}</p>
        {ready ? (
          <button
            type="button"
            onClick={onNext}
            className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            See the decision
            <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
          </button>
        ) : (
          <p className="flex h-[47px] items-center gap-[8px] text-[14px] font-bold" style={{ color: "var(--accent-subtle)" }}>{pending ?? "Decision pending"}</p>
        )}
      </div>
    );
  }
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          See the decision
          <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
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

/** The reputation number eased between values, so a +5 counts up rather
 *  than teleporting -- the count is what makes a score read as a SCORE. */
function useCountUp(value: number) {
  const [shown, setShown] = useState(value);
  const previous = useRef(value);
  useEffect(() => {
    const from = previous.current;
    previous.current = value;
    if (from === value) return;
    const started = performance.now();
    const duration = 650;
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
       
      setShown(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return shown;
}

/** The reputation score as a SCORE, not a bare number (direct feedback): a
 *  ring gauge that fills 0-100 in the band's own color, a star badge, a
 *  count-up/down between values, a pop when it changes, and the floating
 *  +5/-3 delta. The same ring language as the countdown clock, so the
 *  HUD's two dials read as one family. */
export function ScoreGauge({ reputation, band, delta, accent, demo = false, hideBand = false, glow = false }: { reputation: number; band: ReturnType<typeof bandFor>; delta: number | null; accent: string; demo?: boolean; hideBand?: boolean; glow?: boolean }) {
  // Spotlight demo (direct feedback): while a beat is EXPLAINING the score,
  // the gauge acts out a worked example -- nudging up 5, back, down 3,
  // back -- with an arrow calling the eye to it, so "that number in the
  // corner" is unmissable and its movement is seen, not described.
  const DEMO_STEPS = useMemo(() => [0, 5, 0, -3, 0] as const, []);
  const [demoStep, setDemoStep] = useState(0);
  // The debut flight: the gauge appears HUGE at screen center (where the
  // player is actually looking when the beat says "that number in the
  // corner"), then flies up into its corner slot -- and only THEN does the
  // arrow-and-pulse demo start (direct feedback). Reduced motion skips
  // straight to docked.
  const [docked, setDocked] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  /** All FLIGHT coordinates in plain pixels (from -> to), measured once --
   *  animating transform x/y numerically is what keeps the travel smooth;
   *  interpolating mixed vw/px `left` keyframes is what made it jitter. */
  const [flight, setFlight] = useState<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  useEffect(() => {
    if (!demo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting a one-shot animation when the beat leaves
      setDocked(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
       
      setDocked(true);
      return;
    }
    const rect = anchorRef.current?.getBoundingClientRect();
     
    if (rect) setFlight({ sx: window.innerWidth / 2, sy: window.innerHeight * 0.4, tx: rect.left + rect.width / 2, ty: rect.top + rect.height / 2 });
    else setDocked(true);
  }, [demo]);
  useEffect(() => {
    if (!demo || !docked) return;
    const timer = window.setInterval(() => setDemoStep((current) => (current + 1) % DEMO_STEPS.length), 1500);
    return () => {
      window.clearInterval(timer);
      setDemoStep(0);
    };
  }, [demo, docked, DEMO_STEPS]);
  const demoDelta = demo && docked ? DEMO_STEPS[demoStep] : 0;
  const shown = useCountUp(clamp(reputation + demoDelta));
  // The gauge wears the career's own world color, not a generic tier color --
  // every simulation's HUD reads as that career's world (Chandu, 7 Sept 2026).
  const color = accent;
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  return (
    <span className="relative flex flex-none items-center gap-[6px]" aria-label={`Reputation ${reputation}, ${band}`}>
      {demo && !docked && flight && (
        /* The debut: a big double of the gauge blooms at screen center on
           its own dark disc (legibility over any scene), holds a beat,
           then flies smoothly into the corner slot -- pure numeric
           transform animation, no layout properties. One shot per
           spotlight beat. */
        <motion.span
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[70] flex flex-col items-center gap-[10px]"
          initial={{ x: flight.sx, y: flight.sy, translateX: "-50%", translateY: "-50%", scale: 0.85, opacity: 0 }}
          animate={{
            x: [flight.sx, flight.sx, flight.tx],
            y: [flight.sy, flight.sy, flight.ty],
            scale: [0.85, 1, 0.3],
            opacity: [0, 1, 1],
          }}
          transition={{ duration: 2.4, times: [0, 0.5, 1], ease: [0.6, 0, 0.2, 1] }}
          onAnimationComplete={() => setDocked(true)}
        >
          <span
            className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full border backdrop-blur-[14px]"
            style={{
              background: "color-mix(in srgb, var(--background) 84%, transparent)",
              borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
              boxShadow: `0 24px 80px -12px rgba(0,0,0,0.9), 0 0 60px -10px color-mix(in srgb, ${color} 60%, transparent)`,
            }}
          >
            <svg viewBox="0 0 38 38" className="absolute inset-[10px] -rotate-90">
              <circle cx="19" cy="19" r={radius} fill="none" stroke="var(--color-glass-border-raised)" strokeWidth="3" />
              <circle cx="19" cy="19" r={radius} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - reputation / 100)} />
            </svg>
            <span className="text-[40px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
              {reputation}
            </span>
          </span>
          <span className="rounded-[var(--radius-sm)] px-[14px] py-[4px] text-[13px] font-extrabold tracking-[0.3em] uppercase backdrop-blur-[10px]" style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)", color, textShadow: `0 0 18px ${color}` }}>
            Reputation
          </span>
        </motion.span>
      )}
      {demo && docked && (
        <>
          {/* Docked: the halo pulses on the real gauge and a bold arrow
             points at it while the worked +5/-3 demo cycles. */}
          <span aria-hidden className="absolute inset-y-[-6px] left-[-6px] w-[50px] rounded-full motion-safe:animate-[play-pulse_1.2s_ease-in-out_infinite]" style={{ boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 55%, transparent)` }} />
          <span aria-hidden className="absolute top-full left-[2px] mt-[12px] text-[24px] leading-none motion-safe:animate-[play-nudge-up_1s_ease-in-out_infinite]" style={{ color: "var(--color-feedback-success)", textShadow: "0 0 16px var(--color-feedback-success)" }}>
            ▲
          </span>
        </>
      )}
      {glow && (
        <span aria-hidden className="pointer-events-none absolute top-[-6px] left-[-6px] h-[50px] w-[50px] rounded-full motion-safe:animate-[play-pulse_0.7s_ease-in-out_2]" style={{ boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 70%, transparent), 0 0 26px 4px color-mix(in srgb, ${color} 55%, transparent)` }} />
      )}
      {/* Keyed by reputation: every change re-runs the pop, so the gauge
         visibly REACTS to the choice that moved it. */}
      <span
        key={`${reputation}-${demo && docked ? "docked" : "rest"}`}
        ref={anchorRef}
        data-score-gauge
        className={`relative flex h-[38px] w-[38px] items-center justify-center motion-safe:animate-[play-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)] ${demo && !docked ? "opacity-0" : ""}`}
        aria-hidden
      >
        <svg viewBox="0 0 38 38" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="19" cy="19" r={radius} fill="none" stroke="var(--color-glass-border-raised)" strokeWidth="3" />
          <circle
            cx="19"
            cy="19"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - shown / 100)}
            style={{ transition: "stroke-dashoffset 0.65s cubic-bezier(0.16,1,0.3,1), stroke 0.4s" }}
          />
        </svg>
        <span className="text-[13.5px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color }}>
          {shown}
        </span>
      </span>
      {/* The band word (At Risk / Cautious / Respected / Trusted) is
         RETIRED on any rebuilt level (Scoring Model, 20 Sept): the corner
         shows the reputation NUMBER only, and the three outcomes at the
         level's end carry the meaning the band used to. Untouched levels
         keep it until they get the same pass. */}
      {!hideBand && (
        <span className="hidden flex-col sm:flex" aria-hidden>
          <Star className="h-[11px] w-[11px]" fill="currentColor" style={{ color }} />
          <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>
            {band}
          </span>
        </span>
      )}
      {demo && demoDelta !== 0 && (
        <span
          key={`demo-${demoStep}`}
          className="absolute -top-[16px] right-0 text-[14px] font-extrabold tabular-nums motion-safe:animate-[play-float_1.4s_ease-out_forwards]"
          style={{ color: demoDelta > 0 ? "var(--color-feedback-success)" : "var(--destructive)" }}
        >
          {demoDelta > 0 ? `+${demoDelta}` : demoDelta}
        </span>
      )}
      {!demo && delta !== null && delta !== 0 && (
        <span
          key={`delta-${reputation}`}
          className="absolute -top-[16px] right-0 text-[14px] font-extrabold tabular-nums motion-safe:animate-[play-float_1.4s_ease-out_forwards]"
          style={{ color: delta > 0 ? "var(--color-feedback-success)" : "var(--destructive)" }}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </span>
  );
}

// Dreamy is GONE from the simulation (Interaction Rules, D62): Christina
// teaches, the Narrator sets scenes, and System Cards carry the rules.
// Dreamy stays in the mini game, on career pages, and everywhere else in
// the app -- the simulation asks a student to believe they have a job for
// thirty minutes, and a mascot is the one thing that cannot survive in
// that room.

// -------------------------------------------------------------- the dialogue

/** The three voices on screen, each with its own face, box shape and sound
 *  (or silence), so narration, a person talking, and the game's own rules
 *  never read as the same thing:
 *  - character: a chat-notched bubble in the display face, name + portrait,
 *    with per-character voice blips while the line types (the visual-novel
 *    idiom -- who is talking is audible before it is read).
 *  - narrator: quiet italics in the body face, no name, no sound -- scene
 *    direction, not speech.
 *  - system: squared corners, hairline edge, utility type, silent -- the
 *    game talking, visibly different from every in-story card. */
type DialogueVoice = "character" | "narrator" | "system";

// Each character speaks at their own pitch (VOICE_PITCH, from each career's
// art manifest), so Christina and Marcus sound different before a line is read.

// One tappable meaning, in Express mode: an industry term's plain meaning, or
// a character's own intro card again. Derived from the level's beats -- see
// expressLexicon in SimulationPlayer.
type LexEntry = { kicker: string; title: string; body: string; portrait?: string };

// Wraps every lexicon token in a finished dialogue line with a tappable,
// dotted-underlined span. Inline buttons inherit the line's own font and
// color so the sentence still reads as one sentence.
function renderTappableLine(line: string, tokens: { token: string; entry: LexEntry }[], open: (entry: LexEntry) => void): React.ReactNode {
  const escaped = tokens.map((item) => item.token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(pattern)) {
    const at = match.index ?? 0;
    const hit = tokens.find((item) => item.token.toLowerCase() === match[0].toLowerCase());
    if (!hit) continue;
    if (at > cursor) nodes.push(line.slice(cursor, at));
    nodes.push(
      <button
        key={`${hit.token}-${at}`}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          playSelect();
          open(hit.entry);
        }}
        className="inline cursor-pointer underline decoration-dotted decoration-2 underline-offset-4"
        style={{ font: "inherit", color: "inherit", letterSpacing: "inherit", textDecorationColor: "color-mix(in srgb, currentColor 45%, transparent)" }}
      >
        {match[0]}
      </button>,
    );
    cursor = at + match[0].length;
  }
  if (cursor === 0) return line;
  nodes.push(line.slice(cursor));
  return nodes;
}

export function DialogueBox({
  speaker,
  portrait,
  setup,
  accent,
  tone,
  gold,
  held,
  staticSetup,
  ambient,
  voice = "narrator",
  annotate,
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
  /** True for beats with no separate reveal step (card, review): the setup
   *  line is a permanent label, not a cinematic delivery to hide once the
   *  activity appears. False (the default) hides the setup line once
   *  revealed -- otherwise a character's line printed once to deliver it,
   *  then again as a sticky header over the very question it just
   *  introduced (direct feedback, 9 Sept 2026: "if a character just said
   *  something in the cinematic scene, we should not repeat the same
   *  dialogue on the following activity card"). */
  staticSetup?: boolean;
  /** True when there is no scene behind this box. A speaker WITH a portrait
   *  already reads as someone in the room; the name pill only earns its
   *  place when there is no picture doing that job instead. */
  ambient?: boolean;
  voice?: DialogueVoice;
  /** Express only: renders the finished line with tappable terms/names. */
  annotate?: (line: string, open: (entry: LexEntry) => void) => React.ReactNode;
  /** The beat's single action, for beats with no question to reveal. */
  onPrimary?: () => void;
  onAdvance?: () => void;
  children: React.ReactNode;
}) {
  const line = setup ?? "";
  const { directed } = usePresentation();
  // Directed levels pace by voice (4 Oct 2026): a label (staticSetup) never
  // types, a person speaks at speech pace, the narrator reads faster, and
  // the game's own system lines appear whole. Untouched levels keep the
  // single 26ms pace they always had.
  const speed = !directed ? 26 : staticSetup ? 0 : voice === "character" ? TYPE_SPEED.speech : voice === "system" ? TYPE_SPEED.system : TYPE_SPEED.narration;
  const { visible, done: ownDone, skip: ownSkip } = useTypewriter(line, speed);
  // Every line typing INSIDE this box (a card's title and body, say)
  // registers here, so the same tap that finishes the box's own line
  // finishes all of them at once -- one gesture, whatever is typing.
  const typers = useRef(new Map<string, () => void>());
  const [pendingTypers, setPendingTypers] = useState(0);
  const [skippedAll, setSkippedAll] = useState(false);
  const registry = useMemo<TypingRegistry>(
    () => ({
      skipped: skippedAll,
      register: (id, skipLine) => {
        const had = typers.current.has(id);
        typers.current.set(id, skipLine);
        if (!had) setPendingTypers(typers.current.size);
      },
      unregister: (id) => {
        if (typers.current.delete(id)) setPendingTypers(typers.current.size);
      },
    }),
    [skippedAll],
  );
  const done = ownDone && pendingTypers === 0;
  const skip = useCallback(() => {
    ownSkip();
    typers.current.forEach((finish) => finish());
    setSkippedAll(true);
  }, [ownSkip]);
  // The skip hint (directed): appears only once a line has been typing for
  // a moment, so a short line never flashes it, and leaves the instant the
  // text is all there.
  const [hint, setHint] = useState(false);
  useEffect(() => {
    if (!directed) return;
    // Debounced both ways: it shows after 450ms of typing and hides 300ms
    // after the last line finishes, so the hand-off from a card's title to
    // its body never blinks it off and on again.
    const timer = window.setTimeout(() => setHint(!done), done ? 300 : 450);
    return () => window.clearTimeout(timer);
  }, [directed, done]);
  /** Express: the meaning panel a tapped term/name opened, if any. */
  const [lex, setLex] = useState<LexEntry | null>(null);

  // Voice blips: a tiny syllable every couple of characters while a
  // CHARACTER's line types, at that character's own pitch. Narrator and
  // System stay silent on purpose -- the silence is part of the contrast.
  const blipAt = useRef(0);
  useEffect(() => {
    if (voice !== "character" || !speaker || done) return;
    const chars = visible.length;
    if (chars - blipAt.current < 2) return;
    blipAt.current = chars;
    const glyph = line[chars - 1];
    if (glyph && /[a-z0-9]/i.test(glyph)) playVoiceBlip(VOICE_PITCH[speaker] ?? 500);
  }, [visible, done, voice, speaker, line]);

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
      if (event.key === " " || event.key === "Enter" || event.key === "ChevronRight" || event.key.toLowerCase() === "a") {
        // Never hijack input while a blocking modal (Connect, a video
        // lightbox, etc.) is open on top of the game -- direct feedback,
        // 17 Sept 2026: "the spacebar is connected to the game behind the
        // modal... when the modal is active all input should be locked to
        // the modal." This listener stays live on window regardless of
        // what's rendered on top of it, so checking only the focused
        // element (a button, or a text field) isn't enough -- focus can
        // land somewhere generic inside the modal and still leak through.
        // Every modal in this app already sets this exact flag while
        // open, to lock background scroll, so it doubles as a reliable
        // "something modal is up" signal.
        if (document.body.style.overflow === "hidden") return;
        // Never hijack a key the player is aiming at a button, or typing
        // into a field.
        const active = document.activeElement;
        if (active instanceof HTMLButtonElement) return;
        if (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) return;
        if (active instanceof HTMLElement && active.isContentEditable) return;
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
        : voice === "system"
          ? "color-mix(in srgb, var(--accent-subtle) 40%, var(--color-glass-border-raised))"
          : "var(--color-glass-border-raised)";
  // The box SHAPE is the voice: a character bubble squares the corner
  // nearest its speaker (the modern chat-bubble notch); narration keeps
  // the soft uniform card; a system card is squared and hairline all
  // round, a different object entirely.
  const shape =
    voice === "system"
      ? "rounded-[var(--radius-sm)] border"
      : voice === "character"
        ? "rounded-[var(--radius-lg)] rounded-tl-[6px] border-2"
        : "rounded-[var(--radius-lg)] border-2";

  return (
    <div className="relative">
      {/* A speaker with a portrait gets a Nintendo-style row inside the box
         instead of a floating name tag, so the line reads as something a person
         in the scene said rather than as narration about them. */}
      {speaker && !portrait && ambient && (
        <span
          className="absolute -top-[13px] left-[14px] z-10 rounded-[var(--radius-sm)] px-[12px] py-[4px] text-[12px] font-extrabold tracking-[0.08em] uppercase"
          style={{ background: accent, color: "#05070f", fontFamily: "var(--font-display)" }}
        >
          {speaker}
        </span>
      )}
      {hint && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-[12px] -bottom-[30px] z-10 flex items-center gap-[6px] rounded-full px-[10px] py-[4px] text-[11.5px] font-bold motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]"
          style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)", color: "var(--muted-foreground)", backdropFilter: "blur(8px)" }}
        >
          Tap to show it all
          <span className="hidden rounded-[4px] border px-[5px] text-[10px] leading-[15px] [@media(hover:hover)]:inline" style={{ borderColor: "var(--color-glass-border-raised)" }}>Space</span>
        </span>
      )}
      <TypingProvider value={registry}>
      <div
        onClick={step}
        className={`dm-scroll flex max-h-[76dvh] flex-col gap-[var(--space-3)] overflow-y-auto px-[16px] pt-[20px] pb-[16px] backdrop-blur-[22px] sm:px-[clamp(20px,1.4vw,32px)] sm:pt-[clamp(22px,1.53vw,34px)] ${shape}`}
        style={{
          background: voice === "system" ? "color-mix(in srgb, var(--background) 93%, transparent)" : "color-mix(in srgb, var(--background) 86%, transparent)",
          borderColor: edge,
        }}
      >
        {/* HIERARCHY: the situation is a bold subheading, ruled off from the
           question and its options below. They were one undifferentiated stack
           of text, so a player could not tell the setup from the thing they had
           to answer. Hidden once revealed (staticSetup false): the line
           already played once as the held cinematic delivery, so keeping it
           up here too just repeats the same dialogue over the activity. */}
        {line && (staticSetup || held) && (
          <div className="flex items-start gap-[12px]">
            {portrait && (
              <span
                aria-hidden
                className="mt-[2px] flex-none overflow-hidden rounded-[var(--radius-lg)] border-2"
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
                 on screen, ahead of the question and its answers -- and each
                 VOICE wears its own face: a character speaks in the display
                 font at full size, the narrator sets scenes in quieter
                 italics of the body face, and a system card uses plain
                 utility type -- three visibly different kinds of text. */}
              <p
                className={`m-0 ${
                  voice === "character"
                    ? "text-[23px] leading-[1.28] font-extrabold sm:text-[clamp(27px,1.875vw,40px)]"
                    : voice === "system"
                      ? "text-[19px] leading-[1.4] font-bold sm:text-[clamp(21px,1.4vw,28px)]"
                      : "text-[21px] leading-[1.35] font-semibold italic sm:text-[clamp(23px,1.6vw,33px)]"
                }`}
                style={{
                  color: voice === "narrator" ? "color-mix(in srgb, var(--foreground) 90%, transparent)" : "var(--foreground)",
                  fontFamily: voice === "character" ? "var(--font-display)" : "var(--font-body)",
                }}
              >
                {/* Once the line has finished typing, Express swaps in the
                   annotated version -- identical text, with terms and names
                   tappable. During typing it stays plain: half-typed tokens
                   cannot match. */}
                {ownDone && annotate ? annotate(line, setLex) : visible}
                {!ownDone && <span className="ml-[2px] inline-block h-[18px] w-[8px] translate-y-[2px] animate-pulse" style={{ background: accent }} aria-hidden />}
              </p>
            </span>
          </div>
        )}
        {ownDone && held && (
          <button
            type="button"
            onClick={step}
            className="flex cursor-pointer items-center gap-[8px] self-start text-[13px] font-extrabold tracking-[0.06em] uppercase motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]"
            style={{ color: accent }}
          >
            Continue
            <ChevronRight className="h-[16px] w-[16px] motion-safe:animate-[play-nudge_1.1s_ease-in-out_infinite]" aria-hidden />
            <span className="sr-only">or press enter</span>
          </button>
        )}
        {ownDone && !held && (
          <>
            {/* Only when the setup line is still visible above (staticSetup):
               otherwise the line already hid itself, and a rule with nothing
               above it just reads as a stray line at the top of the box. */}
            {line && staticSetup && <span aria-hidden className="-mx-[16px] border-t sm:-mx-[20px]" style={{ borderColor: "var(--color-glass-border-raised)" }} />}
            <div className="motion-safe:animate-[fade-slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]">{children}</div>
          </>
        )}
      </div>
      </TypingProvider>

      {/* Express meaning panel: a System-style card (utility voice -- this is
         the game explaining, not the office talking). Tap anywhere to close. */}
      {lex && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-[var(--space-5)]"
          onClick={(event) => {
            event.stopPropagation();
            setLex(null);
          }}
        >
          <div aria-hidden className="absolute inset-0" style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", backdropFilter: "blur(28px)" }} />
          <div
            role="dialog"
            aria-label={lex.title}
            className="relative w-full max-w-[360px] rounded-[var(--radius-sm)] border px-[20px] py-[18px] motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]"
            style={{ background: "color-mix(in srgb, var(--background) 95%, transparent)", borderColor: "color-mix(in srgb, var(--accent-subtle) 40%, var(--color-glass-border-raised))" }}
          >
            <div className="flex items-start gap-[14px]">
              {lex.portrait && (
                <span aria-hidden className="flex-none overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--color-glass-border-raised)" }}>
                  <Image src={lex.portrait} alt="" width={112} height={112} className="h-[56px] w-[56px] object-cover object-top" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>{lex.kicker}</span>
                <span className="mt-[3px] block text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{lex.title}</span>
                <span className="mt-[6px] block text-[14px] leading-[20px]" style={{ color: "color-mix(in srgb, var(--foreground) 88%, transparent)" }}>{lex.body}</span>
              </span>
            </div>
            <span className="mt-[14px] block text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Tap anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------- the HUD

/** Express: the score gauge as a button. Tapping it opens the three outcomes
 *  -- the exact teaching the cut spotlight screen pushed, now pulled on
 *  demand. The row the player is currently in is lit. */
function TappableScore({ reputation, band, delta, accent, hideBand = false, glow = false, docCopy = false }: { reputation: number; band: ReturnType<typeof bandFor>; delta: number | null; accent: string; hideBand?: boolean; glow?: boolean; docCopy?: boolean }) {
  const [open, setOpen] = useState(false);
  // Outcome-first wording (Scoring Model, 20 Sept): the word itself is
  // what happens to the player, not a feeling about it.
  const OUTCOMES = docCopy
    ? [
        // Doc screen 13, word for word.
        { label: "Bag secured", range: "85+", note: "You earn the return offer.", active: reputation >= 85 },
        { label: "Retry level", range: "40\u201384", note: "No offer. Replay the level.", active: reputation >= 40 && reputation < 85 },
        { label: "Terminated", range: "0\u201339", note: "Your internship ends.", active: reputation < 40 },
      ]
    : hideBand
    ? [
        { label: "Bag secured", range: "85+", note: "", active: reputation >= 85 },
        { label: "Retry level", range: "40-84", note: "", active: reputation >= 40 && reputation < 85 },
        { label: "Terminated", range: "Under 40", note: "", active: reputation < 40 },
      ]
    : [
        { label: "Promoted", range: "85+", note: "", active: reputation >= 85 },
        { label: "No return offer, start over", range: "40-84", note: "", active: reputation >= 40 && reputation < 85 },
        { label: "The run ends", range: "Under 40", note: "", active: reputation < 40 },
      ];
  const trigger = (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={hideBand ? `Reputation ${Math.round(reputation)}. What this number decides` : `Reputation ${Math.round(reputation)}, ${band}. What this number decides`}
      onClick={() => {
        playSelect();
        setOpen(true);
      }}
      className="dm-quiet cursor-pointer rounded-[var(--radius-md)]"
    >
      <ScoreGauge reputation={reputation} band={band} delta={delta} accent={accent} hideBand={hideBand} glow={glow} />
    </button>
  );
  return (
    <>
      {/* Doc screen 13: "On desktop, hovering can show: Click to see how
         reputation works." */}
      {docCopy ? <IconTip label="Click to see how reputation works">{trigger}</IconTip> : trigger}
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-[var(--space-5)]"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(false);
          }}
        >
          <div aria-hidden className="absolute inset-0" style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", backdropFilter: "blur(28px)" }} />
          <div
            role="dialog"
            aria-label="What your reputation decides"
            onClick={docCopy ? (event) => event.stopPropagation() : undefined}
            className="relative w-full max-w-[360px] rounded-[var(--radius-sm)] border px-[20px] py-[18px] motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]"
            style={{ background: "color-mix(in srgb, var(--background) 95%, transparent)", borderColor: "color-mix(in srgb, var(--accent-subtle) 40%, var(--color-glass-border-raised))" }}
          >
            {docCopy && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="dm-quiet absolute top-[10px] right-[10px] flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full"
                style={{ color: "var(--muted-foreground)" }}
              >
                <X className="h-[16px] w-[16px]" aria-hidden />
              </button>
            )}
            <span className="block text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>Reputation</span>
            <span className="mt-[3px] block pr-[24px] text-[19px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {docCopy ? "Your decisions raise or lower your score." : "This number decides how the level ends."}
            </span>
            <div className="mt-[12px] flex flex-col gap-[6px]">
              {OUTCOMES.map((outcome) => (
                <div
                  key={outcome.label}
                  className="flex items-baseline justify-between gap-[12px] rounded-[8px] border px-[12px] py-[9px]"
                  style={{
                    borderColor: outcome.active ? accent : "var(--color-glass-border-raised)",
                    background: outcome.active ? `color-mix(in srgb, ${accent} 12%, transparent)` : "transparent",
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-[14px] leading-[19px] font-bold">{docCopy ? outcome.label.toUpperCase() : outcome.label}</span>
                    {outcome.note && <span className="block text-[12.5px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{outcome.note}</span>}
                  </span>
                  <span className="flex-none text-[13px] leading-[18px] font-bold tabular-nums" style={{ color: outcome.active ? "var(--foreground)" : "var(--muted-foreground)" }}>{outcome.range}</span>
                </div>
              ))}
            </div>
            {!docCopy && <span className="mt-[14px] block text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>Tap anywhere to close</span>}
          </div>
        </div>
      )}
    </>
  );
}

export function Hud({
  simulation,
  level,
  reputation,
  band,
  scored,
  delta,
  accent,
  spotlightScore = false,
  dots = { total: SCORED_BEATS, big: new Set([2, 5, 8]) },
  glow = false,
  tip,
  sectionLabel,
  onSkip,
  onStartOver,
  onGuide,
  onBack,
  onOpenConnect,
}: {
  /** Replaces "Level N" in the level line (Level.sectionAfter). */
  sectionLabel?: string;
  /** DEMO-ONLY (Level.qaSkip): skip this screen without answering. */
  onSkip?: () => void;
  /** DEMO-ONLY (Level.qaSkip): wipe the run and go back to the start card. */
  onStartOver?: () => void;
  /** Reopens the optional run-up (Level.preGame). */
  onGuide?: () => void;
  /** How many decision dots, and which are drawn larger as save points. */
  dots?: { total: number; big: Set<number> };
  /** The gauge's landing glow (directed). */
  glow?: boolean;
  /** A one-time line under the score (directed, doc screen 12). */
  tip?: string;
  simulation: Simulation;
  level: Level;
  reputation: number;
  band: ReturnType<typeof bandFor>;
  scored: number;
  delta: number | null;
  accent: string;
  /** True while the current beat is EXPLAINING the score -- the gauge runs
   *  its arrow-nudge + worked increase/decrease demo. */
  spotlightScore?: boolean;
  /** Steps back one beat. Undefined on the level's first beat, where there is
   *  nowhere within the run to go back to. */
  onBack?: () => void;
  /** Demo-only: jumps straight to the Connect interstitial. Undefined when
   *  the shortcut is off or there's no next level to connect into. */
  onOpenConnect?: () => void;
}) {
  return (
    <header className="relative z-20 flex flex-none flex-col gap-[8px] px-3 pt-3 sm:px-5 sm:pt-4">
      {/* A soft fade from the page ground behind the HUD, plus a text
         shadow on the title: over a bright office scene the title and level
         line had nothing under them (light-mode audit finding 4, both
         themes). A gradient, not a bar, so the scene still reads edge to
         edge. */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[150%]" style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--background) 72%, transparent) 0%, color-mix(in srgb, var(--background) 38%, transparent) 55%, transparent 100%)" }} />
      <div className="flex items-center gap-[var(--space-3)]">
        <span className="flex flex-none items-center gap-[6px]">
          {/* Always available, mid-level or not -- the per-beat back chevron
             only ever stepped back one beat within the run; there was no way
             to jump straight out to the Play hub once past the first beat. */}
          <IconTip label="Back to Play">
            <Link
              href="/play"
              aria-label="Back to Play"
              className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
              style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
            >
              <Home className="h-[17px] w-[17px]" aria-hidden />
            </Link>
          </IconTip>
          {onBack && (
            <IconTip label="Back">
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to the previous screen"
                className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
                style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
              >
                <ChevronLeft className="h-[19px] w-[19px]" aria-hidden />
              </button>
            </IconTip>
          )}
          {onStartOver && (
            // DEMO-ONLY: the lab build's start over.
            <IconTip label="Start over">
              <button
                type="button"
                onClick={onStartOver}
                aria-label="Start over from the beginning"
                className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
                style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
              >
                <RotateCcw className="h-[16px] w-[16px]" aria-hidden />
              </button>
            </IconTip>
          )}
          {onSkip && (
            // DEMO-ONLY: the lab build's QA skip.
            <IconTip label="Skip this screen">
              <button
                type="button"
                onClick={onSkip}
                aria-label="Skip this screen"
                className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
                style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
              >
                <SkipForward className="h-[16px] w-[16px]" aria-hidden />
              </button>
            </IconTip>
          )}
        </span>
        <span className="min-w-0 flex-1" style={{ textShadow: "0 1px 3px color-mix(in srgb, var(--background) 85%, transparent)" }}>
          <span className="block truncate text-[13px] font-extrabold uppercase" style={{ fontFamily: "var(--font-display)" }}>
            {simulation.title}
          </span>
          <span className="block truncate text-[11.5px] font-bold tracking-[0.1em] uppercase" style={{ color: accent }}>
            {sectionLabel ?? `Level ${level.n}`} · {level.role}
            {level.express ? " · Express" : ""}
          </span>
        </span>
        <span className="flex flex-none items-center gap-[6px]">
          {onOpenConnect && (
            <IconTip label="Demo: jump to Connect">
              <button
                type="button"
                onClick={onOpenConnect}
                aria-label="Demo: jump to Connect interstitial"
                className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
                style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--accent-subtle)" }}
              >
                <FastForward className="h-[15px] w-[15px]" aria-hidden />
              </button>
            </IconTip>
          )}
          {onGuide && (
            <IconTip label="How to Play">
              <button
                type="button"
                onClick={onGuide}
                aria-label="How to Play and the mini lesson"
                className="dm-quiet flex h-9 w-9 flex-none items-center justify-center rounded-full border backdrop-blur-[10px]"
                style={{ background: "color-mix(in srgb, var(--background) 62%, transparent)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
              >
                <CircleHelp className="h-[17px] w-[17px]" aria-hidden />
              </button>
            </IconTip>
          )}
          <MusicToggle />
          <MuteToggle />
        </span>
        {/* Band text hides below sm -- at a phone's narrowest widths, four
           icon buttons plus this cluster left almost no room for the title,
           which was truncating down to one or two characters. The gauge
           alone still says the same thing at a glance; aria-label keeps the
           full "47, Cautious" available to assistive tech either way. */}
        {/* EXPRESS, and every rebuilt level (hideBand): reputation shows from
           screen one but is never explained by a teaching screen -- the
           number itself is the explainer. Tapping it opens the three
           outcomes (the old mandatory "That number in the corner just
           moved" screen, pull instead of push -- Interaction Rules, 20
           Sept). Untouched full-mode levels keep the gauge inert; their
           spotlight beat still does this job until they get the same pass. */}
        <span className="relative flex-none">
          {level.express || level.hideBand ? (
            <TappableScore reputation={reputation} band={band} delta={delta} accent={accent} hideBand={level.hideBand} glow={glow} docCopy={level.directed} />
          ) : (
            <ScoreGauge reputation={reputation} band={band} delta={delta} accent={accent} demo={spotlightScore} />
          )}
          {tip && (
            <span
              role="status"
              className="absolute top-full right-0 z-40 mt-[12px] w-[230px] rounded-[var(--radius-md)] border px-[13px] py-[10px] text-[13px] leading-[18px] font-semibold motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]"
              style={{ background: "color-mix(in srgb, var(--background) 94%, transparent)", borderColor: accent, color: "var(--foreground)", boxShadow: "0 18px 40px -18px rgba(0,0,0,0.8)" }}
            >
              <span aria-hidden className="absolute -top-[6px] right-[14px] h-[10px] w-[10px] rotate-45 border-t border-l" style={{ background: "color-mix(in srgb, var(--background) 94%, transparent)", borderColor: accent }} />
              {tip}
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-[7px]">
        {/* Same spark/flicker language as the Build flow's bar (SparkBar): the
           reputation gaining ground is the run's core reward. Solid in the
           career's own world color -- the HUD reads as that career's world,
           not a generic tier color (Chandu, 7 Sept 2026). */}
        <SparkBar className="flex-1" percent={reputation} height={6} track="var(--color-glass-border-raised)" fill={accent} glow={accent} />
        <span className="flex flex-none items-center gap-[3px]" aria-label={`${scored} of ${dots.total} decisions made`}>
          {/* Every third dot is a checkpoint: the run is saved at each beat, and
             marking them makes that visible instead of hoping the player trusts
             it. */}
          {Array.from({ length: dots.total }, (_, dot) => {
            const checkpoint = dots.big.has(dot);
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
      <MusicFailedPill />
    </header>
  );
}

/** A quiet pill for when the track itself failed to load (a bad/missing
 *  file, a network hiccup) -- distinct from the music simply being muted,
 *  and never blocking play: the level keeps going with no music rather
 *  than stalling on a failed asset. Wired 27 Sept 2026, see music.ts's own
 *  `failed` state and src/lib/surfaceStates.ts row 53. */
function MusicFailedPill() {
  const failed = useSyncExternalStore(subscribeMusicFailed, musicFailedSnapshot, serverMusicFailedSnapshot);
  if (!failed) return null;
  return <ErrorView pill="Music" message="Music didn't load" onRetry={retryMusic} />;
}

/** Music on/off -- deliberately its own button, independent from the sound
 *  effects toggle below: "mute it and only hear sound effects" means muting
 *  the music can never also take the SFX with it the way one shared switch
 *  would. */
function MusicToggle() {
  const musicMuted = useSyncExternalStore(subscribeMusicMuted, musicMutedSnapshot, serverMusicMutedSnapshot);
  return (
    <IconTip label={musicMuted ? "Turn music on" : "Turn music off"}>
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
    </IconTip>
  );
}

/** Sound on/off, one tap, always visible. This gets played in classrooms; a
 *  game you cannot silence in one tap is a game you do not open at school. */
function MuteToggle() {
  const muted = useSyncExternalStore(subscribeMuted, mutedSnapshot, serverMutedSnapshot);
  return (
    <IconTip label={muted ? "Turn sound on" : "Turn sound off"}>
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
    </IconTip>
  );
}

/** A ring, not a bar: the countdown reads as a stopwatch face rather than a
 *  loading indicator, and the number sits inside it instead of beside a strip
 *  that is easy to miss in a corner of the eye. Pulses only in the last third,
 *  so urgency is felt rather than present the whole time a beat is timed.
 *  SILENT, per direct instruction: no per-second tick sound -- the ring and
 *  the pulse carry the urgency on their own. */
export function Clock({ remaining, total }: { remaining: number; total: number }) {
  const fraction = Math.max(0, Math.min(1, remaining / total));
  const urgent = fraction < 0.34;
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

/** The points flying into the score (directed, doc screens 12-13): the
 *  verdict's +6 / -6 lifts off the feedback card and arcs into the gauge in
 *  the corner, and the gauge only moves when it lands. Measured from the
 *  real elements once the card has settled; reduced motion lands at once. */
function ScoreFlight({ delta, onLand }: { delta: number; onLand: () => void }) {
  const [path, setPath] = useState<{ sx: number; sy: number; tx: number; ty: number } | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const source = document.querySelector("[data-score-source]")?.getBoundingClientRect();
      const target = document.querySelector("[data-score-gauge]")?.getBoundingClientRect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !source || !target) {
        onLand();
        return;
      }
      setPath({ sx: source.left + source.width / 2, sy: source.top + source.height / 2, tx: target.left + target.width / 2, ty: target.top + target.height / 2 });
    }, 520);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one flight per verdict
  }, []);
  if (!path) return null;
  const good = delta > 0;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[80]"
      initial={{ x: path.sx, y: path.sy, scale: 1.25, opacity: 0 }}
      animate={{
        x: [path.sx, path.sx + (path.tx - path.sx) * 0.3, path.tx],
        y: [path.sy, path.sy - (path.sy - path.ty) * 0.75, path.ty],
        scale: [1.25, 1.1, 0.6],
        opacity: [1, 1, 0.85],
      }}
      transition={{ duration: 0.8, ease: [0.45, 0, 0.2, 1], times: [0, 0.45, 1] }}
      onAnimationComplete={() => {
        setPath(null);
        onLand();
      }}
    >
      <span
        className="block -translate-x-1/2 -translate-y-1/2 rounded-full px-[12px] py-[4px] text-[17px] font-extrabold tabular-nums"
        style={{
          fontFamily: "var(--font-display)",
          color: "#05070f",
          background: good ? "var(--color-feedback-success)" : "var(--world-building-construction)",
          boxShadow: `0 0 24px ${good ? "var(--color-feedback-success)" : "var(--world-building-construction)"}`,
        }}
      >
        {good ? `+${delta}` : delta}
      </span>
    </motion.span>
  );
}

// D55: a feedback card is a headline of two or three words, then ONE
// sentence, then the skill chips and the score -- nothing else. The
// sentence is the Why line for the option the student actually chose
// (result.why); the beat-level feedback body is no longer shown.
export function FeedbackSheet({
  beat,
  result,
  reputation,
  onNext,
  docked = false,
  reactor,
  portraitOff = false,
}: {
  beat: Beat;
  result: Result;
  reputation: number;
  onNext: () => void;
  /** Directed: the card docks at the bottom over a CLEAR room, so the
   *  character reacting on stage stays visible above it, visual-novel style,
   *  instead of a full-screen blur hiding everything behind the verdict. */
  docked?: boolean;
  /** Whose face the card shows (defaults to the speaker). */
  reactor?: string;
  /** True when that face is already on stage, big. */
  portraitOff?: boolean;
}) {
  const good = result.delta > 0 || (result.delta === 0 && (result.tier === "best" || result.tier === "acceptable"));
  const color = good ? "var(--color-feedback-success)" : result.delta <= -6 ? "var(--destructive)" : "var(--world-building-construction)";
  const cta = "feedbackCta" in beat ? beat.feedbackCta : "Continue";
  const skills = "skills" in beat ? beat.skills : [];
  const [openSkill, setOpenSkill] = useState<string | null>(null);
  const portrait = portraitOff ? undefined : expressionFor(reactor ?? beat.speaker, result.tier);

  // The card owns the key rather than leaning on the focused button's default
  // activation: the sheet is the only thing on screen, so enter, space and right
  // should all dismiss it whatever happens to hold focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "ChevronRight") return;
      event.preventDefault();
      onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext]);

  return (
    <div
      className={docked ? "absolute inset-0 z-30 flex items-end justify-center px-3 pb-[3dvh] sm:px-5 sm:pb-[4dvh]" : "absolute inset-0 z-30 flex items-center justify-center px-3 py-3 sm:px-5 sm:py-5"}
      style={
        docked
          ? { background: "linear-gradient(to top, color-mix(in srgb, var(--background) 82%, transparent) 0%, color-mix(in srgb, var(--background) 30%, transparent) 42%, transparent 70%)" }
          : { background: "color-mix(in srgb, var(--background) 58%, transparent)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }
      }
    >
      <div
        className="flex w-full max-w-[620px] flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border-2 px-[18px] py-[18px] backdrop-blur-[22px] motion-safe:animate-[play-sheet-up_0.44s_cubic-bezier(0.16,1,0.3,1)_both]"
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
                className="h-[72px] w-[72px] flex-none rounded-[var(--radius-lg)] border-2 object-cover object-top motion-safe:animate-[play-character-enter_0.32s_ease-out_both]"
                style={{ borderColor: color }}
              />
            )}
            <span className="text-[21px] font-extrabold" style={{ fontFamily: "var(--font-display)", color }}>
              {result.tier === "best" && beat.bestHeadline ? beat.bestHeadline : TIER_HEADLINE[result.tier]}
            </span>
          </span>
          {/* A practice question (delta 0) shows no points at all. */}
          {(result.delta !== 0 || !docked) && (
            <span data-score-source className="text-[14px] font-extrabold tabular-nums" style={{ color }}>
              {result.delta > 0 ? `+${result.delta}` : result.delta}{docked ? " Reputation" : ` · ${reputation}`}
            </span>
          )}
        </p>
        <p className="text-[15.5px] leading-relaxed font-semibold" style={{ color: "var(--foreground)" }}>
          {result.why}
        </p>
        {skills.length > 0 && (
          <div className="flex flex-col gap-[6px]">
            {/* Tappable, as the skills explainer promised two screens ago
               (Interaction Rules: every chip is tappable from L1-11 onward
               and shows its What It Means line). */}
            <p className="flex flex-wrap gap-[6px]">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setOpenSkill((current) => (current === skill ? null : skill))}
                  aria-expanded={openSkill === skill}
                  className="dm-quiet cursor-pointer rounded-[var(--radius-md)] border px-[10px] py-[4px] text-[11.5px] font-semibold"
                  style={{
                    borderColor: openSkill === skill ? "var(--accent-subtle)" : "var(--color-glass-border-raised)",
                    color: openSkill === skill ? "var(--foreground)" : "var(--muted-foreground)",
                    background: openSkill === skill ? "color-mix(in srgb, var(--accent-subtle) 14%, transparent)" : "transparent",
                  }}
                >
                  {skill}
                </button>
              ))}
            </p>
            {openSkill && SKILL_MEANING[openSkill] && (
              <p className="text-[12.5px] leading-snug font-semibold motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]" style={{ color: "var(--accent-subtle)" }}>
                {openSkill}: <span style={{ color: "var(--muted-foreground)" }}>{SKILL_MEANING[openSkill]}</span>
              </p>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={onNext}
          autoFocus
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {cta}
          <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the ending

export function EndingCard({
  ending,
  reputation,
  band,
  simulation,
  next,
  misses,
  onAdvance,
  onRepair,
  onReplay,
  directed = false,
  fromRole,
  fixWorth,
  fullWorth,
  noRepair = false,
  plainEndings = false,
}: {
  noRepair?: boolean;
  plainEndings?: boolean;
  /** Directed: no band word (it is retired on this level), the promotion
   *  drawn as Intern -> Analyst, and the repair note uses the level's real
   *  point values. */
  directed?: boolean;
  fromRole?: string;
  fixWorth?: number;
  fullWorth?: number;
  ending: ReturnType<typeof endingFor>;
  reputation: number;
  band: ReturnType<typeof bandFor>;
  simulation: Simulation;
  /** The next built level, if there is one. */
  next?: Level;
  /** How many beats went wrong, so they can be offered as a repair round. */
  misses: number;
  /** Opens the Connect interstitial instead of navigating straight there. */
  onAdvance: () => void;
  onRepair: () => void;
  onReplay: () => void;
}) {
  const Icon = ending.advances ? Trophy : reputation >= 60 ? Briefcase : FileText;
  useEffect(() => {
    if (ending.advances) playSweep();
  }, [ending.advances]);
  return (
    <div
      className="relative mb-[6dvh] flex w-full max-w-[560px] flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border-2 px-[20px] py-[24px] text-center backdrop-blur-[22px] motion-safe:animate-[play-sheet-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
      style={{ background: "color-mix(in srgb, var(--background) 92%, transparent)", borderColor: BAND_COLOR[band] }}
    >
      {/* Doc screen 39: "This should feel like a major win." */}
      {directed && ending.advances && <LocalBurst nonce={1} />}
      <span className="flex h-[58px] w-[58px] items-center justify-center rounded-[var(--radius-lg)]" style={{ background: BAND_COLOR[band], color: "#05070f" }}>
        <Icon className="h-[28px] w-[28px]" aria-hidden />
      </span>
      {/* Both v2 scripts: the headline first ("BAG SECURED"), then
         "Reputation 92". */}
      {!directed && (
        <p className="text-[15px] font-extrabold tabular-nums" style={{ color: BAND_COLOR[band] }}>
          {`${reputation} · ${band}`}
        </p>
      )}
      <h2 className="text-[26px] leading-[1.1] font-extrabold sm:text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        {ending.headline}
      </h2>
      {directed && (
        <p className="text-[15px] font-extrabold tabular-nums" style={{ color: BAND_COLOR[band] }}>
          Reputation {reputation}
        </p>
      )}
      <p className="text-[15.5px] leading-relaxed" style={{ color: "var(--foreground)" }}>
        {ending.message}
      </p>
      {directed && ending.advances && fromRole && (next?.role ?? simulation.upcoming[0]) ? (
        // Doc screen 39: "clearly show that the student has advanced from
        // Intern -> Analyst".
        <div className="flex items-center gap-[10px] motion-safe:animate-[fade-slide-up_0.5s_ease-out_0.3s_both]">
          <span className="rounded-[var(--radius-sm)] border px-[12px] py-[6px] text-[13px] font-extrabold tracking-[0.1em] uppercase" style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--muted-foreground)" }}>{fromRole}</span>
          <ChevronRight className="h-[18px] w-[18px]" aria-hidden style={{ color: BAND_COLOR[band] }} />
          <span className="rounded-[var(--radius-sm)] px-[12px] py-[6px] text-[13px] font-extrabold tracking-[0.1em] uppercase" style={{ background: BAND_COLOR[band], color: "#05070f" }}>{next?.role ?? simulation.upcoming[0]}</span>
        </div>
      ) : null}
      {ending.subline && (
        <p className="text-[14px] leading-relaxed font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {ending.subline}
        </p>
      )}
      {directed && ending.unlock && (
        <p className="text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>{ending.unlock}</p>
      )}
      <div className="mt-[var(--space-1)] flex w-full flex-col gap-[8px]">
        {ending.advances && next ? (
          <button
            type="button"
            onClick={onAdvance}
            className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Start Level {next.n} {directed ? "\u2022" : "\u00b7"} {next.role}
            <ChevronRight className="h-[17px] w-[17px]" aria-hidden />
          </button>
        ) : ending.advances ? (
          <span
            className="flex w-full items-center justify-center gap-[8px] rounded-[var(--radius-sm)] px-[18px] py-[13px] text-[16px] font-extrabold opacity-55"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            aria-disabled
          >
            {ending.primary}
          </span>
        ) : misses > 0 && !noRepair ? (
          <>
            {/* Replaying twenty screens to fix three answers is what makes a
               student close the app. Fixing the three is what makes them stay. */}
            <button
              type="button"
              onClick={onRepair}
              className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <Wrench className="h-[16px] w-[16px]" aria-hidden />
              Fix your {misses} {misses === 1 ? "miss" : "misses"}
            </button>
            <p className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {directed && fixWorth !== undefined && fullWorth !== undefined
                ? `Replays only what you got wrong. A fix is worth +${fixWorth}, not the full +${fullWorth}.`
                : "Replays only what you got wrong. A fix is worth +2, not the full +5."}
            </p>
            <button
              type="button"
              onClick={onReplay}
              className="dm-quiet flex w-full cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[18px] py-[12px] text-[15px] font-semibold"
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
            className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
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
        {!(plainEndings && !ending.advances) && (
          <Link
            href="/play"
            className="dm-quiet flex w-full cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[18px] py-[12px] text-[15px] font-semibold"
            style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
          >
            <X className="h-[15px] w-[15px]" aria-hidden />
            Back to Games
          </Link>
        )}
      </div>
      {!plainEndings && (
        <p className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {ADVANCE_AT} and above advances.
        </p>
      )}
    </div>
  );
}
