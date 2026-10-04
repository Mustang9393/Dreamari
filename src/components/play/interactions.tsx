"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Eye, FileText, Flag, AtSign, Flame, FolderClosed, GripVertical, HardDrive, Landmark, Laptop, Lock, Megaphone, MessageCircle, Sparkles, Store, TrendingUp, Wallet, MessagesSquare, SendHorizontal, Trophy, X } from "lucide-react";
import Image from "next/image";

import { IconTip } from "@/components/app/IconTip";
import { GestureSpotlight, useFirstUseHint } from "@/components/flow/GestureSpotlight";
import { BANDS, TIER_COLOR, passThreshold } from "./scoring";
import { playCorrect, playFlip, playSelect, playSweep, playVoiceBlip, playWrong } from "./sound";
import { usePresentation, useTypingRegistry } from "./presentation";
import { VOICE_PITCH } from "./expressions";
import { ConfirmShimmer } from "@/components/flow/ConfirmShimmer";
import { LocalBurst } from "@/components/build/ui";
import type {
  BucketBeat,
  CardBeat,
  ChainBeat,
  CheckBeat,
  ChoiceBeat,
  FlagsBeat,
  FlipsBeat,
  FocusBeat,
  MatchBeat,
  PickBeat,
  RankBeat,
  RapidBeat,
  RevealBeat,
  SliderBeat,
  Tier,
} from "./types";

// The interaction bodies. Each one owns its own rules from the Interaction
// Rules tab and reports a single result upward: one tier, and the line that
// explains THAT answer. Nothing here knows about reputation or navigation.

/** id is the picked option, so the shell can show which one locked. */
export type Resolve = (tier: Tier, why: string, id?: string) => void;

// Answer positions are randomised (so the right answer is never learnable
// by position -- "harder to game the system", direct request) and STABLE
// while a question is on screen: options must never move under a player
// mid-answer. React's render pass has to stay pure, so Math.random cannot
// roll inside it -- instead a nonce rolls ONCE at page load (module scope),
// and each beat's order is a pure seeded Fisher-Yates of (nonce, beat id):
// every visit to the app deals fresh positions, every render of the same
// question deals the same ones. Display order only -- scoring reads
// tiers/roles off the option objects themselves, never off positions.
const SHUFFLE_NONCE = Math.floor(Math.random() * 0xffffffff);

function seededShuffle<T>(items: readonly T[], key: string): T[] {
  // FNV-1a over the key, mixed with the per-load nonce...
  let h = SHUFFLE_NONCE >>> 0;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // ...driving a mulberry32 stream for the swaps.
  const rand = () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function useShuffled<T>(items: readonly T[], key: string): T[] {
  return useMemo(() => seededShuffle(items, key), [items, key]);
}

// ---------------------------------------------------------------- typewriter

/** Reveals text a character at a time, like a dialogue box should. The count is
 *  derived from ELAPSED TIME, not from how many ticks fired: counting ticks
 *  drifted against React's commits and stalled halfway through a long line.
 *  Mounted fresh per beat (the stage is keyed), so there is no reset to do. */
export function useTypewriter(text: string, speed = 26, active = true) {
  // speed <= 0 means "no typing at all" (a label, or the game's own system
  // copy on a directed level): the whole line is there from the first paint.
  const [shown, setShown] = useState(() => (speed <= 0 ? text.length : 0));
  // The running interval, so a skip can stop it. Without this the interval
  // kept recomputing the count from elapsed time after a skip and dragged
  // the line back to half-typed on its next tick.
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (speed <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- an untyped line shows whole at once
      setShown(text.length);
      return;
    }
    if (!active) {
      setShown(0);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const chars = reduced ? text.length : Math.floor((Date.now() - started) / speed);
      setShown(Math.min(text.length, chars));
      if (chars >= text.length) window.clearInterval(timer);
    }, 16);
    timerRef.current = timer;
    return () => window.clearInterval(timer);
  }, [text, speed, active]);

  const skip = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    setShown(text.length);
  }, [text]);
  return {
    visible: text.slice(0, shown),
    done: shown >= text.length,
    skip,
  };
}

/** Typing speeds on a directed level, one per kind of text, so the pace
 *  itself says who is talking: a person speaks a little slower than the
 *  narrator reads, and the game's own rules never type at all. */
export const TYPE_SPEED = { speech: 24, narration: 16, system: 0 } as const;

/** A line that types itself out on a directed level. The untyped remainder
 *  is laid out but invisible, so the box is its final size from the first
 *  frame and nothing below it jumps while the line types. It registers with
 *  the dialogue box around it while typing, so one tap anywhere on the box
 *  (or Space / Enter) finishes it instantly. */
export function TypedText({
  text,
  speed,
  active = true,
  voicePitch,
  onDone,
}: {
  text: string;
  speed: number;
  /** false holds the line back until an earlier one has finished. */
  active?: boolean;
  /** A character's voice-blip pitch; omitted for silent narration. */
  voicePitch?: number;
  onDone?: () => void;
}) {
  const registry = useTypingRegistry();
  // Once the player has tapped to show everything in this box, a line that
  // only starts afterwards (a card's body, after its title) appears whole.
  const { visible, done, skip } = useTypewriter(text, registry?.skipped ? 0 : speed, active);
  const id = useId();
  useEffect(() => {
    if (!registry) return;
    if (active && !done) registry.register(id, skip);
    else registry.unregister(id);
    return () => registry.unregister(id);
  }, [registry, id, active, done, skip]);
  const reported = useRef(false);
  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once, the first time the line completes
  }, [done]);
  const blipAt = useRef(0);
  useEffect(() => {
    if (!voicePitch || done || !active) return;
    if (visible.length - blipAt.current < 2) return;
    blipAt.current = visible.length;
    const glyph = text[visible.length - 1];
    if (glyph && /[a-z0-9]/i.test(glyph)) playVoiceBlip(voicePitch);
  }, [visible, done, active, voicePitch, text]);
  return (
    <>
      {visible}
      <span aria-hidden style={{ visibility: "hidden" }}>{text.slice(visible.length)}</span>
    </>
  );
}

/** Number keys select options. The badge on each option shows its digit, so the
 *  keyboard route is discoverable without a line of instructions -- the affordance
 *  IS the hint. Ignored while focus is in a control, so tabbing still behaves. */
export function useDigitKeys(count: number, pick: (index: number) => void, enabled = true) {
  useEffect(() => {
    if (!enabled || count <= 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const digit = Number(event.key);
      if (!Number.isInteger(digit) || digit < 1 || digit > count) return;
      event.preventDefault();
      pick(digit - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, pick, enabled]);
}

/** A single keycap glyph, shown only where there is a real keyboard. The whole
 *  keyboard story is told by glyphs on the controls themselves -- the digit on
 *  each option, this cap on the advance -- rather than a line of instructions
 *  under every screen. Touch players never see any of it. */
// -------------------------------------------------------------- shared parts

/** Every pick in the game gets the same treatment -- the chosen tile colours to
 *  its tier, a bad one shakes, a sound fires. A game where only the matching
 *  screen reacts feels broken on the other nine. */
function tierSound(tier: Tier) {
  if (tier === "best" || tier === "acceptable") playCorrect();
  else if (tier === "wrong" || tier === "risky") playWrong();
  else playSelect();
}

export function OptionButton({
  label,
  index,
  disabled,
  picked,
  tier,
  dimmed,
  revealed,
  numbered = true,
  compact = false,
  onClick,
}: {
  label: string;
  index: number;
  disabled?: boolean;
  picked?: boolean;
  tier?: Tier;
  dimmed?: boolean;
  /** This is the best answer and the round is over: show it even when the player
   *  chose something else. Being told WHICH one was right, at the moment you get
   *  it wrong, is most of what instant feedback is for. */
  revealed?: boolean;
  /** Hide the 1, 2, 3 badge until there is a result to show in its place. */
  numbered?: boolean;
  /** Tighter row for a preview that has to leave the scene most of the room. */
  compact?: boolean;
  onClick: () => void;
}) {
  const bad = Boolean(picked) && (tier === "wrong" || tier === "risky");
  const mark = picked ? (bad ? "wrong" : "right") : revealed ? "answer" : null;
  const paint = mark === "wrong" ? TIER_COLOR[tier ?? "none"] : "var(--color-feedback-success)";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // A right pick previously just recolored; a wrong one shook and the revealed
      // answer popped, so getting it right was the least-marked outcome. It now
      // gets the Build flow's confirm moment: a lift plus one light sweep.
      className={`group relative flex w-full cursor-pointer items-center gap-[14px] rounded-[var(--radius-md)] border text-left leading-snug font-semibold transition-[transform,border-color,background,opacity] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:transition-none ${compact ? "px-[14px] py-[10px] text-[14px]" : "px-[18px] py-[16px] text-[16px] sm:text-[17px]"} ${
        bad ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""
      } ${mark === "answer" ? "motion-safe:animate-[play-pop_0.44s_cubic-bezier(0.34,1.56,0.64,1)]" : ""} ${
        mark === "right" ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""
      }`}
      style={{
        animationDelay: `${index * 55}ms`,
        background: mark ? `color-mix(in srgb, ${paint} 18%, var(--glass-surface-1))` : "var(--glass-surface-1)",
        borderColor: mark ? paint : "var(--color-glass-border-raised)",
        color: "var(--foreground)",
        opacity: dimmed && !mark ? 0.4 : 1,
      }}
    >
      <ConfirmShimmer active={mark === "right"} />
      {(numbered || mark) && <span
        aria-hidden
        className={`flex flex-none items-center justify-center rounded-full border font-extrabold ${compact ? "h-[24px] w-[24px] text-[12px]" : "h-[29px] w-[29px] text-[13px]"}`}
        style={{
          borderColor: mark ? paint : "var(--color-glass-border-raised)",
          background: mark ? paint : "transparent",
          color: mark ? "#05070f" : "var(--muted-foreground)",
        }}
      >
        {mark === "wrong" ? <X className="h-[15px] w-[15px]" /> : mark ? <Check className="h-[15px] w-[15px]" /> : index + 1}
      </span>}
      {label}
    </button>
  );
}

/** The HEADING of a beat. Has to stay clearly above the situation text, which
 *  is now bold itself. */
// Subheading tier: what the speaker says (DialogueBox's own text) is the
// title, sized above this; the answers below are body text, sized under it.
export function Question({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[18px] leading-[1.25] font-extrabold sm:text-[21px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
      {children}
    </p>
  );
}

// ------------------------------------------------------------------ the card

export function CardBody({ beat, onNext, accent = "var(--world-business-money-office)" }: { beat: CardBeat; onNext: () => void; accent?: string }) {
  const { directed } = usePresentation();
  // Directed levels type what is SAID, never what is shown (4 Oct 2026):
  // a line in quotes is a person speaking (speech pace, their voice blips),
  // anything else on a story card is the narrator (faster, silent), and a
  // system card is the game itself, which never types. The button, ladder
  // and tiles wait for the words, the way a dialogue box always has.
  const typed = directed && !beat.system && beat.variant !== "act";
  const quoted = (text?: string) => Boolean(text && /["\u201c]/.test(text));
  const pitch = beat.speaker ? VOICE_PITCH[beat.speaker] ?? 500 : undefined;
  const [titleDone, setTitleDone] = useState(!typed);
  const [bodyDone, setBodyDone] = useState(!typed || !beat.body);
  const ready = titleDone && bodyDone;
  const line = (text: string, active: boolean, done: () => void) =>
    typed ? (
      <TypedText
        text={text}
        active={active}
        speed={quoted(text) ? TYPE_SPEED.speech : TYPE_SPEED.narration}
        voicePitch={quoted(text) ? pitch : undefined}
        onDone={done}
      />
    ) : (
      text
    );
  const after = typed ? "motion-safe:animate-[fade-slide-up_0.32s_cubic-bezier(0.16,1,0.3,1)_both]" : "";
  // The arrival card celebrates: one burst and the level-up sweep as it
  // lands, the title a step larger. Everything else on the card is the same,
  // so the moment is the only thing that changed.
  useEffect(() => {
    if (beat.celebrate || beat.entrance === "boss") playSweep();
  }, [beat.celebrate, beat.entrance]);
  // Act Moment (Interaction Rules): a completion moment auto-advances with
  // no button at all, never a real stopping point -- fast, celebratory,
  // and it must not introduce any reading. A checkpoint (secondaryCta set)
  // waits on the student instead, same as every other card.
  useEffect(() => {
    if (beat.variant !== "act" || !beat.auto) return;
    playSweep();
    // 1.8s on a directed level: long enough to read two words and see the
    // reputation pulse the doc asks for, short enough to stay a beat, not a stop.
    const timer = window.setTimeout(onNext, directed ? 1800 : 1400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot per beat id, re-arming onNext would restart the timer
  }, [beat.id]);
  if (beat.variant === "act") {
    return (
      <div className="relative flex flex-col items-center gap-[var(--space-3)] py-[var(--space-6)] text-center">
        <LocalBurst nonce={1} />
        <span className="text-[13px] font-extrabold tracking-[0.14em] uppercase" style={{ color: accent }}>{beat.title}</span>
        <p className="text-[24px] leading-[1.2] font-extrabold sm:text-[28px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{beat.body}</p>
        {beat.note && <p className="text-[15px] font-extrabold" style={{ color: accent }}>{beat.note}</p>}
        {beat.secondaryCta && (
          <div className="mt-[var(--space-2)] flex w-full max-w-[320px] flex-col gap-[10px]">
            <button
              type="button"
              onClick={() => { playSelect(); onNext(); }}
              className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {beat.cta}
            </button>
            <a
              href={beat.secondaryHref ?? "/play"}
              className="dm-quiet flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] border px-[18px] py-[12px] text-[14px] font-semibold"
              style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--muted-foreground)" }}
            >
              {beat.secondaryCta}
            </a>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="relative flex flex-col gap-[var(--space-3)]">
      {beat.celebrate && <LocalBurst nonce={1} />}
      {beat.step && (
        <span className="flex items-center gap-[7px] text-[11.5px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--accent-subtle)" }}>
          Step {beat.step.at} of {beat.step.of}
          <span className="flex gap-[4px]" aria-hidden>
            {Array.from({ length: beat.step.of }, (_, index) => (
              <span
                key={index}
                className="h-[5px] rounded-full transition-[width] duration-300"
                style={{ width: index === beat.step!.at - 1 ? 18 : 5, background: index < beat.step!.at ? "var(--accent-subtle)" : "var(--color-glass-border-raised)" }}
              />
            ))}
          </span>
        </span>
      )}
      {/* the arrival title is a step larger, plain ink (no gradient: direct
         feedback, 6 Sept 2026); the burst and the sweep carry the moment */}
      {beat.celebrate ? (
        <p className="text-[24px] leading-[1.15] font-extrabold sm:text-[28px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{line(beat.title, true, () => setTitleDone(true))}</p>
      ) : (
        <Question>{line(beat.title, true, () => setTitleDone(true))}</Question>
      )}
      {beat.body && (
        <p className="text-[16px] leading-relaxed" style={{ color: directed ? "color-mix(in srgb, var(--foreground) 82%, transparent)" : "var(--muted-foreground)" }}>
          {line(beat.body, titleDone, () => setBodyDone(true))}
        </p>
      )}
      {ready && <div className={`flex flex-col gap-[var(--space-3)] ${after}`}>
      {directed && beat.exampleSteps ? (
        <ExampleSteps steps={beat.exampleSteps} accent={accent} />
      ) : beat.example && (
        <p
          className="rounded-[12px] border px-[13px] py-[11px] text-[14px] leading-relaxed"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)", color: "var(--muted-foreground)" }}
        >
          <span className="mr-[6px] text-[11px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--accent-subtle)" }}>
            Example
          </span>
          {beat.example}
        </p>
      )}
      {beat.facts && beat.facts.length > 0 && (
        <dl className="m-0 grid gap-[7px]" style={{ gridTemplateColumns: `repeat(${Math.min(3, beat.facts.length)}, minmax(0, 1fr))` }}>
          {beat.facts.map((fact) => (
            <div key={fact.label} className="rounded-[12px] border px-[10px] py-[9px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}>
              <dt className="text-[10.5px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>{fact.label}</dt>
              <dd className="m-0 mt-[3px] text-[13.5px] leading-[18px] font-extrabold" style={{ color: "var(--foreground)" }}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {beat.note && (
        <p className="text-[13px] font-bold" style={{ color: "var(--world-business-money-office)" }}>{beat.note}</p>
      )}
      {beat.ladder && <PowerLadder rungs={beat.ladder} accent={accent} />}
      {beat.showBands && <BandLadder />}
      </div>}
      {ready && <button
        type="button"
        onClick={() => {
          playSelect();
          onNext();
        }}
        className={`dm-solid mt-[var(--space-1)] flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold ${after}`}
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        {beat.cta}
        <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
      </button>}
    </div>
  );
}

// Shown once, on the "Your Reputation" explainer before the level starts --
// a reference table of the rules, not a readout of where the player stands
// (reputation is still the untouched baseline here, which happens to fall
// inside "Cautious" -- highlighting it as a "current" band read as if the
// player had already earned that standing before making a single choice).
const STEP_ICON = { store: Store, gap: Wallet, bank: Landmark, grow: TrendingUp } as const;

/** The example as a story in four panels (directed): who wants what, the
 *  gap, who closes it, what happens. Each step lands in turn, so the eye
 *  reads it in order, and the gap is the one panel in a warning colour --
 *  it is the problem the bank exists to solve. */
function ExampleSteps({ steps, accent }: { steps: NonNullable<CardBeat["exampleSteps"]>; accent: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border px-[12px] pt-[12px] pb-[14px] sm:px-[16px]" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--glass-surface-1) 70%, transparent)" }}>
      <span className="mb-[10px] block text-[10.5px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--accent-subtle)" }}>Example</span>
      <ol className="m-0 grid list-none grid-cols-2 gap-[10px] p-0 sm:flex sm:items-stretch sm:gap-0">
        {steps.map((step, index) => {
          const Icon = STEP_ICON[step.icon];
          const tint = step.icon === "gap" ? "var(--destructive)" : step.icon === "grow" ? "var(--color-feedback-success)" : accent;
          return (
            <li key={step.text} className="flex min-w-0 items-stretch sm:flex-1">
              <span
                className="flex min-w-0 flex-1 flex-col items-center gap-[8px] rounded-[12px] px-[8px] py-[10px] text-center motion-safe:animate-[fade-slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: `${index * 220}ms`, background: `color-mix(in srgb, ${tint} 9%, transparent)` }}
              >
                <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${tint} 22%, transparent)`, color: tint }}>
                  <Icon className="h-[20px] w-[20px]" aria-hidden />
                </span>
                <span className="text-[13px] leading-[17px] font-semibold sm:text-[14px] sm:leading-[19px]" style={{ color: "var(--foreground)" }}>{step.text}</span>
              </span>
              {index < steps.length - 1 && (
                <ChevronRight aria-hidden className="mx-[2px] hidden h-[18px] w-[18px] flex-none self-center sm:block motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]" style={{ color: "var(--muted-foreground)", animationDelay: `${index * 220 + 120}ms` }} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function BandLadder() {
  return (
    <ul className="flex list-none flex-col gap-[5px] p-0">
      {[...BANDS].reverse().map((band) => (
        <li key={band.name} className="flex items-center justify-between rounded-[var(--radius-sm)] border px-[11px] py-[8px] text-[13px] font-bold" style={{ borderColor: "transparent", color: "var(--muted-foreground)" }}>
          <span>{band.name}</span>
          <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>
            {band.max === 100 ? `${band.min}+` : `${band.min} to ${band.max}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The ladder graphic on a character's POWER card (Characters tab): every
 *  rung carries its job title, the player and the character this card is
 *  about are lit, the rest dimmed. Same picture every time, so a student
 *  learns to read it at a glance -- it shows the hierarchy without any line
 *  of copy having to state it. Drawn as a DIAGRAM -- a vertical rail of
 *  connected dots, labelled and clearly non-interactive -- after the
 *  bordered-row version read as a set of tappable options on a screen
 *  whose only action is Continue (direct feedback: "I don't understand
 *  what the use of this screen is"). Rungs come bottom-to-top in data and
 *  render top-down (highest rung first), the way a ladder is read. */
function PowerLadder({ rungs, accent }: { rungs: { label: string; lit: boolean }[]; accent: string }) {
  const gold = accent;
  return (
    <div
      className="rounded-[12px] border px-[14px] py-[12px]"
      style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--glass-surface-1) 60%, transparent)" }}
    >
      <p className="mb-[8px] text-[10.5px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--muted-foreground)" }}>
        The ladder
      </p>
      <ul className="relative flex list-none flex-col gap-[2px] p-0" aria-label="The career ladder">
        {/* The rail: one thin line connecting every rung, which is what
           makes this read as a chart rather than a stack of buttons. */}
        <span aria-hidden className="absolute top-[8px] bottom-[8px] left-[5px] w-[2px] rounded-full" style={{ background: "var(--color-glass-border-raised)" }} />
        {[...rungs].reverse().map((rung, index) => (
          <li
            key={rung.label}
            className="relative flex items-center gap-[12px] py-[5px] text-[13.5px] motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <span
              aria-hidden
              className="z-[1] h-[12px] w-[12px] flex-none rounded-full border-2"
              style={{
                borderColor: rung.lit ? gold : "var(--color-glass-border-raised)",
                background: rung.lit ? gold : "var(--background)",
                boxShadow: rung.lit ? `0 0 10px color-mix(in srgb, ${gold} 60%, transparent)` : "none",
              }}
            />
            <span className={rung.lit ? "font-extrabold" : "font-semibold"} style={{ color: rung.lit ? "var(--foreground)" : "var(--muted-foreground)", opacity: rung.lit ? 1 : 0.6 }}>
              {rung.label}
            </span>
            {rung.lit && /^You\b|\bYou$/.test(rung.label) && (
              <span className="rounded-[var(--radius-sm)] px-[8px] py-[1px] text-[9.5px] font-extrabold tracking-[0.1em] uppercase" style={{ background: `color-mix(in srgb, ${gold} 22%, transparent)`, color: gold }}>
                You
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ------------------------------------------------ the unscored comprehension check

/** Comprehension Check (Interaction Rules): unscored, never a strike,
 *  unlimited tries, cannot skip. `tap`: wrong taps shake and stay open.
 *  `type`: wrong entries shake and clear; after two wrong tries the hint
 *  fades in. `drag`: a token on a rail dragged onto an answer card -- a
 *  wrong drop shakes that card and the token springs back, a right drop
 *  locks. Continue appears only once it is right. */
export function CheckBody({ beat, onNext }: { beat: CheckBeat; onNext: () => void }) {
  const [solved, setSolved] = useState(false);
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [entry, setEntry] = useState("");
  const [tries, setTries] = useState(0);
  const [shakeBox, setShakeBox] = useState(0);
  /** drag method: which answer card the token is currently held over, so
   *  the target lights up BEFORE the drop -- the reach is part of the fun. */
  const [over, setOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const options = beat.options ?? [];
  const rightIndex = options.findIndex((option) => option.correct);
  const whyRight = beat.method === "type" ? (beat.whyRight ?? "") : (options[rightIndex]?.why ?? "");

  const cardAt = (x: number, y: number) =>
    cardRefs.current.findIndex((el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });

  const miss = (index: number) => {
    playWrong();
    setMissed((current) => new Set(current).add(index));
    window.setTimeout(() => setMissed((current) => { const next = new Set(current); next.delete(index); return next; }), 460);
  };
  const solve = () => {
    playCorrect();
    setSolved(true);
  };

  const submitTyped = () => {
    if (solved || !entry.trim()) return;
    if (entry.trim().toLowerCase() === (beat.answer ?? "").trim().toLowerCase()) {
      solve();
    } else {
      playWrong();
      setTries((count) => count + 1);
      setShakeBox((count) => count + 1);
      setEntry("");
    }
  };

  // Drag hit-test: the token is dropped wherever the pointer ends; the card
  // under that point wins. dragSnapToOrigin gives the sprung-back rail
  // return on a miss for free.
  const dropAt = (x: number, y: number) => {
    if (solved) return;
    const index = cardRefs.current.findIndex((el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
    if (index === -1) return;
    if (options[index].correct) solve();
    else miss(index);
  };

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>

      {beat.method === "tap" && (
        <div className="flex flex-col gap-[8px]">
          {options.map((option, index) => (
            <button
              key={option.label}
              type="button"
              disabled={solved && !option.correct}
              onClick={() => {
                if (solved) return;
                if (option.correct) solve();
                else miss(index);
              }}
              className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] border px-[18px] py-[15px] text-left text-[16px] font-semibold transition-[border-color,background,opacity] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] sm:text-[17px] ${missed.has(index) ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""}`}
              style={{
                animationDelay: `${index * 55}ms`,
                background: solved && option.correct ? "color-mix(in srgb, var(--color-feedback-success) 18%, var(--glass-surface-1))" : "var(--glass-surface-1)",
                borderColor: solved && option.correct ? "var(--color-feedback-success)" : "var(--color-glass-border-raised)",
                color: "var(--foreground)",
                opacity: solved && !option.correct ? 0.4 : 1,
              }}
            >
              {solved && option.correct && <Check className="h-[16px] w-[16px] flex-none" style={{ color: "var(--color-feedback-success)" }} aria-hidden />}
              {option.label}
            </button>
          ))}
        </div>
      )}

      {beat.method === "type" && (
        <div className="flex flex-col gap-[10px]">
          <form
            key={shakeBox}
            onSubmit={(event) => { event.preventDefault(); submitTyped(); }}
            className={shakeBox > 0 && !solved ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""}
          >
            <input
              value={solved ? (beat.answer ?? "") : entry}
              onChange={(event) => setEntry(event.target.value)}
              disabled={solved}
              autoFocus
              inputMode={/^\d+$/.test(beat.answer ?? "") ? "numeric" : "text"}
              aria-label="Your answer"
              className="w-full rounded-[var(--radius-lg)] border-2 bg-transparent px-[16px] py-[14px] text-center text-[24px] font-extrabold tabular-nums outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              style={{ borderColor: solved ? "var(--color-feedback-success)" : "var(--color-glass-border-raised)", color: "var(--foreground)", fontFamily: "var(--font-display)" }}
            />
          </form>
          {/* Supporting information fades back in after two wrong tries
             (Interaction Rules, typed check). */}
          {!solved && tries >= 2 && beat.hint && (
            <p className="text-[13px] leading-relaxed font-semibold motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]" style={{ color: "var(--muted-foreground)" }}>
              {beat.hint}
            </p>
          )}
          {!solved && (
            <button type="button" onClick={submitTyped} className="dm-solid flex w-full cursor-pointer items-center justify-center rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Check
            </button>
          )}
        </div>
      )}

      {beat.method === "drag" && (
        <div className="flex flex-col gap-[14px]">
          {/* The rail. The token costs a deliberate second to move, which is
             the point (D75) -- it feels like a game, not a quiz. Idle, it
             breathes; held, it grows and glows; over a card, THAT card
             lights up before the drop, so the reach itself gives feedback. */}
          <div className="flex justify-center rounded-[var(--radius-lg)] border border-dashed py-[10px]" style={{ borderColor: "var(--color-glass-border-raised)" }}>
            {solved ? (
              <span className="flex h-[48px] items-center gap-[6px] text-[12px] font-bold tracking-[0.08em] uppercase motion-safe:animate-[play-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)]" style={{ color: "var(--color-feedback-success)" }}>
                <Check className="h-[14px] w-[14px]" aria-hidden /> Locked in
              </span>
            ) : (
              <motion.button
                type="button"
                drag
                dragSnapToOrigin
                dragMomentum={false}
                whileDrag={{ scale: 1.22 }}
                onDragStart={() => setDragging(true)}
                onDrag={(event) => {
                  const pointer = event as PointerEvent;
                  setOver(cardAt(pointer.clientX, pointer.clientY));
                }}
                onDragEnd={(event) => {
                  const pointer = event as PointerEvent;
                  setDragging(false);
                  setOver(null);
                  dropAt(pointer.clientX, pointer.clientY);
                }}
                className={`relative z-30 flex h-[48px] w-[48px] cursor-grab touch-none items-center justify-center rounded-full text-[10px] font-extrabold tracking-[0.06em] text-white uppercase select-none active:cursor-grabbing ${dragging ? "" : "motion-safe:animate-[play-pulse_1.6s_ease-in-out_infinite]"}`}
                style={{
                  background: "var(--primary)",
                  boxShadow: dragging
                    ? "0 0 0 6px color-mix(in srgb, var(--primary) 30%, transparent), 0 14px 34px -8px color-mix(in srgb, var(--primary) 85%, transparent)"
                    : "0 6px 18px -6px color-mix(in srgb, var(--primary) 70%, transparent)",
                }}
                aria-label="Drag this token onto an answer, or tap an answer"
              >
                Drag
              </motion.button>
            )}
          </div>
          <div className="flex flex-col gap-[8px] sm:grid sm:grid-cols-3">
            {/* Each card is also a button: a tap answers exactly like a drop,
               so a player whose drag misses (or who never sees the token as
               draggable) is never stranded on the screen. */}
            {options.map((option, index) => (
              <button
                key={option.label}
                type="button"
                disabled={solved}
                onClick={() => { if (solved) return; if (option.correct) solve(); else miss(index); }}
                ref={(el) => { cardRefs.current[index] = el; }}
                className={`flex cursor-pointer flex-col gap-[4px] rounded-[var(--radius-lg)] border px-[16px] py-[13px] text-left text-[15.5px] font-semibold transition-[border-color,background,transform,opacity] duration-150 disabled:cursor-default sm:text-[16px] ${missed.has(index) ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""} ${solved && option.correct ? "motion-safe:animate-[play-pop_0.44s_cubic-bezier(0.34,1.56,0.64,1)]" : ""}`}
                style={{
                  background:
                    solved && option.correct
                      ? "color-mix(in srgb, var(--color-feedback-success) 18%, var(--glass-surface-1))"
                      : over === index
                        ? "color-mix(in srgb, var(--primary) 16%, var(--glass-surface-1))"
                        : "var(--glass-surface-1)",
                  borderColor: solved && option.correct ? "var(--color-feedback-success)" : over === index ? "var(--primary)" : "var(--color-glass-border-raised)",
                  color: "var(--foreground)",
                  opacity: solved && !option.correct ? 0.4 : 1,
                  transform: over === index && !solved ? "scale(1.03)" : "scale(1)",
                }}
              >
                <span className="flex items-center gap-[6px] text-[10px] font-extrabold tracking-[0.12em] uppercase" style={{ color: solved && option.correct ? "var(--color-feedback-success)" : over === index ? "var(--primary)" : "var(--muted-foreground)" }}>
                  {solved && option.correct && <Check className="h-[12px] w-[12px]" aria-hidden />}
                  Answer {index + 1}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {solved && (
        <>
          {whyRight && (
            <p className="text-[14.5px] leading-relaxed font-semibold motion-safe:animate-[fade-slide-up_0.34s_ease-out_both]" style={{ color: "var(--color-feedback-success)" }}>
              {whyRight}
            </p>
          )}
          <button
            type="button"
            onClick={() => { playSelect(); onNext(); }}
            className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold motion-safe:animate-[fade-slide-up_0.34s_ease-out_both]"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {beat.cta}
            <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
          </button>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------- tap to reveal

/** Tap to Reveal (Interaction Rules): rows hide their payload behind TAP TO
 *  REVEAL; Continue only appears once every row is open, so nobody can skip
 *  the lesson. Not scored. */
export function RevealBody({ beat, onNext }: { beat: RevealBeat; onNext: () => void }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const allOpen = open.size >= beat.rows.length;
  const ROW_COLOR: Record<string, string> = {
    red: "var(--destructive)",
    amber: "var(--world-business-money-office)",
    green: "var(--color-feedback-success)",
  };
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.title}</Question>
      {beat.body && (
        <p className="-mt-[4px] text-[16px] leading-relaxed" style={{ color: "color-mix(in srgb, var(--foreground) 82%, transparent)" }}>{beat.body}</p>
      )}
      <div className="flex flex-col gap-[8px]">
        {beat.rows.map((row, index) => {
          const revealed = open.has(index);
          const tint = row.color ? ROW_COLOR[row.color] : "var(--accent-subtle)";
          return (
            <button
              key={row.label}
              type="button"
              disabled={revealed}
              onClick={() => {
                playSelect();
                setOpen((current) => new Set(current).add(index));
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[16px] py-[14px] text-left text-[15px] font-semibold transition-[border-color,background] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] sm:text-[16px]"
              style={{
                animationDelay: `${index * 55}ms`,
                background: revealed ? `color-mix(in srgb, ${tint} 12%, var(--glass-surface-1))` : "var(--glass-surface-1)",
                borderColor: revealed ? tint : "var(--color-glass-border-raised)",
                color: "var(--foreground)",
              }}
            >
              <span className="min-w-0">
                {row.label}
                {revealed && (
                  <span className="mt-[3px] block text-[14px] leading-snug font-bold motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]" style={{ color: tint }}>
                    {row.reveal}
                  </span>
                )}
              </span>
              {!revealed && (
                <span className="flex flex-none items-center gap-[5px] text-[10.5px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "var(--accent-subtle)" }}>
                  <Eye className="h-[13px] w-[13px]" aria-hidden /> Tap to reveal
                </span>
              )}
            </button>
          );
        })}
      </div>
      {beat.note && (
        <p className="text-[13px] leading-relaxed font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {beat.note}
        </p>
      )}
      {allOpen && (
        <button
          type="button"
          onClick={() => { playSelect(); onNext(); }}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold motion-safe:animate-[fade-slide-up_0.34s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {beat.cta}
          <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
        </button>
      )}
    </div>
  );
}

// --------------------------------------------------------------- word cards

/** Word Cards: vocabulary one word per card -- the big term AND its
 *  definition on the same face, paged with a 3D page turn (no
 *  flip-to-reveal, per direct feedback). Center-stage like the reputation
 *  explainer, so the words never read as an afterthought. Continue appears
 *  only after the last word. Not scored. */
export function FlipsBody({ beat, onNext, accent = "var(--world-business-money-office)" }: { beat: FlipsBeat; onNext: () => void; accent?: string }) {
  const [at, setAt] = useState(0);
  const [finished, setFinished] = useState(false);
  const card = beat.cards[Math.min(at, beat.cards.length - 1)];
  const last = at >= beat.cards.length - 1;
  const turn = () => {
    if (finished && last) return;
    // The card physically turns; the sound bank already had a flip for it that
    // nothing was calling. A generic tick undersold the motion.
    playFlip();
    if (last) {
      playCorrect();
      setFinished(true);
    } else {
      setAt((current) => current + 1);
    }
  };
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.title}</Question>
      <div style={{ perspective: "1200px" }}>
        {/* Keyed per word: each card turns IN like a page. One-directional
           rotation only -- no backface tricks (see the glossary flipbook's
           3D-safety note). */}
        <motion.button
          key={card.term}
          type="button"
          onClick={turn}
          disabled={finished && last}
          initial={{ rotateY: -70, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full cursor-pointer flex-col items-center gap-[10px] rounded-[var(--radius-md)] border px-[20px] py-[26px] text-center disabled:cursor-default sm:py-[34px]"
          style={{
            transformOrigin: "left center",
            // The glossary flipbook's binder page: ruled paper over a faint
            // world-gold tint, with a real paper shadow (direct feedback --
            // same look, minus the illustration).
            background:
              `repeating-linear-gradient(180deg, transparent 0px, transparent 26px, color-mix(in srgb, var(--glass-border) 55%, transparent) 27px), color-mix(in srgb, ${accent} 5%, var(--card))`,
            borderColor: finished && last ? "var(--color-feedback-success)" : "var(--glass-border)",
            boxShadow: "0 18px 40px -22px rgba(0,0,0,0.45)",
          }}
        >
          {/* The hand-drawn wobble, same filter recipe as the glossary. */}
          <svg width="0" height="0" aria-hidden className="absolute">
            <filter id="play-sketch">
              <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
            </filter>
          </svg>
          <span className="text-[11px] font-extrabold tracking-[0.16em] uppercase" style={{ color: "var(--muted-foreground)" }}>
            Word {at + 1} of {beat.cards.length}
          </span>
          <span className="flex flex-col items-center gap-[4px]">
            <span className="text-[34px] leading-[1.1] font-extrabold uppercase sm:text-[44px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", filter: "url(#play-sketch)" }}>
              {card.term}
            </span>
            {/* The hand-drawn underline squiggle, straight off the binder. */}
            <svg viewBox="0 0 120 8" aria-hidden className="h-[8px] w-[120px]" style={{ color: accent, filter: "url(#play-sketch)" }}>
              <path d="M2 5 Q 20 1, 40 4 T 78 4 T 118 3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="max-w-[38ch] text-[16px] leading-relaxed font-semibold sm:text-[17px]" style={{ color: "var(--muted-foreground)" }}>
            {card.def}
          </span>
          {!(finished && last) && (
            <span className="mt-[4px] flex items-center gap-[6px] text-[12px] font-extrabold tracking-[0.08em] uppercase" style={{ color: "var(--accent-subtle)" }}>
              {last ? "Got it" : "Next word"} <ChevronRight className="h-[14px] w-[14px] motion-safe:animate-[play-nudge_1.4s_ease-in-out_infinite]" aria-hidden />
            </span>
          )}
        </motion.button>
      </div>
      {/* One dot per word, filling as the student pages through. */}
      <span className="flex justify-center gap-[6px]" aria-hidden>
        {beat.cards.map((entry, index) => (
          <span key={entry.term} className="h-[6px] w-[6px] rounded-full transition-colors duration-300" style={{ background: index < at + (finished ? 1 : 0) ? "var(--accent-subtle)" : "var(--color-glass-border-raised)" }} />
        ))}
      </span>
      {finished && (
        <button
          type="button"
          onClick={() => { playSelect(); onNext(); }}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold motion-safe:animate-[fade-slide-up_0.34s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {beat.cta}
          <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------- focus: term pairs

/** Teach Card - Focus One, as FLASH CARDS SIDE BY SIDE (IB Level 1 doc,
 *  screens 15 and 16, 4 Oct 2026; Chandu: "keep the flash cards but follow
 *  this side by side thing"). Both cards are on screen at once, the Word
 *  Cards' ruled-paper face with the hand-drawn underline, but only one is
 *  in focus: the other is blurred, set back and turned slightly, like the
 *  next card waiting in the deck. GOT IT on the focused card swaps focus;
 *  GOT IT on the second continues; Back returns to the first at any time.
 *  Side by side at every width (the pairing is the point), so the type
 *  scales down on a phone instead of the cards stacking. */
export function FocusBody({ beat, onNext, accent = "var(--world-business-money-office)" }: { beat: FocusBeat; onNext: () => void; accent?: string }) {
  const [focus, setFocus] = useState(0);
  const [seen, setSeen] = useState(false);
  const gotIt = useCallback(() => {
    if (focus === 0) {
      playFlip();
      setSeen(true);
      setFocus(1);
    } else {
      playCorrect();
      onNext();
    }
  }, [focus, onNext]);
  const back = useCallback(() => {
    if (focus === 0) return;
    playFlip();
    setFocus(0);
  }, [focus]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (document.body.style.overflow === "hidden") return;
      if (event.key === "ArrowLeft") { event.preventDefault(); back(); }
      if (event.key === "ArrowRight") { event.preventDefault(); gotIt(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [back, gotIt]);
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {beat.title && <Question>{beat.title}</Question>}
      <svg width="0" height="0" aria-hidden className="absolute">
        <filter id="play-sketch-focus">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
        </filter>
      </svg>
      <div className="grid grid-cols-2 gap-[10px] sm:gap-[16px]" style={{ perspective: "1200px" }}>
        {beat.terms.map((t, index) => {
          const isFocus = index === focus;
          const done = index === 0 && seen && !isFocus;
          return (
            <motion.div
              key={t.term}
              aria-hidden={!isFocus}
              initial={{ opacity: 0, y: 14, rotateY: index === 0 ? -18 : 18 }}
              animate={{
                opacity: isFocus ? 1 : 0.5,
                y: isFocus ? 0 : 8,
                scale: isFocus ? 1 : 0.94,
                rotateZ: isFocus ? 0 : index === 0 ? -2.5 : 2.5,
                rotateY: 0,
                filter: isFocus ? "blur(0px) saturate(1)" : "blur(5px) saturate(0.6)",
              }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
              className="relative flex min-w-0 flex-col items-center gap-[8px] rounded-[var(--radius-md)] border px-[10px] pt-[16px] pb-[12px] text-center sm:gap-[10px] sm:px-[18px] sm:pt-[24px] sm:pb-[18px]"
              style={{
                pointerEvents: isFocus ? "auto" : "none",
                background: `repeating-linear-gradient(180deg, transparent 0px, transparent 26px, color-mix(in srgb, var(--glass-border) 55%, transparent) 27px), color-mix(in srgb, ${accent} 5%, var(--card))`,
                borderColor: isFocus ? accent : "var(--glass-border)",
                boxShadow: isFocus ? `0 22px 46px -24px rgba(0,0,0,0.6), 0 0 0 1px color-mix(in srgb, ${accent} 35%, transparent)` : "0 12px 30px -22px rgba(0,0,0,0.5)",
              }}
            >
              {done && (
                <span className="absolute top-[8px] right-[8px] flex h-[20px] w-[20px] items-center justify-center rounded-full" style={{ background: "var(--color-feedback-success)", color: "#05070f" }}>
                  <Check className="h-[12px] w-[12px]" aria-hidden />
                </span>
              )}
              <span className="text-[10px] font-extrabold tracking-[0.16em] uppercase sm:text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {index + 1} of 2
              </span>
              <span className="flex flex-col items-center gap-[3px]">
                <span className="text-[22px] leading-[1.05] font-extrabold uppercase sm:text-[clamp(30px,2.4vw,44px)]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", filter: "url(#play-sketch-focus)" }}>
                  {t.term}
                </span>
                <svg viewBox="0 0 120 8" aria-hidden className="h-[7px] w-[80px] sm:w-[110px]" style={{ color: accent, filter: "url(#play-sketch-focus)" }}>
                  <path d="M2 5 Q 20 1, 40 4 T 78 4 T 118 3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-[13px] leading-snug font-semibold sm:text-[16px] sm:leading-relaxed" style={{ color: "color-mix(in srgb, var(--foreground) 78%, transparent)" }}>
                {t.def}
              </span>
              <button
                type="button"
                tabIndex={isFocus ? 0 : -1}
                onClick={gotIt}
                className="dm-solid mt-auto flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[10px] py-[10px] text-[13.5px] font-semibold sm:py-[12px] sm:text-[15px]"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)", visibility: isFocus ? "visible" : "hidden" }}
              >
                Got it
                <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
              </button>
            </motion.div>
          );
        })}
      </div>
      <div className="flex h-[36px] items-center">
        {focus === 1 && (
          <button
            type="button"
            onClick={back}
            className="dm-quiet flex cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[8px] py-[7px] text-[13.5px] font-semibold motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back to {beat.terms[0].term}
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------- choice: options

export function ChoiceBody({ beat, onResolve, locked, accent = "var(--world-business-money-office)", cast }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null; accent?: string; cast?: Record<string, string> }) {
  const { directed } = usePresentation();
  const choices = useShuffled(beat.choices, beat.id);
  const pickByKey = useCallback(
    (index: number) => {
      const choice = choices[index];
      if (!choice || locked) return;
      tierSound(choice.tier);
      onResolve(choice.tier, choice.why, choice.id);
    },
    [choices, locked, onResolve],
  );
  useDigitKeys(choices.length, pickByKey, locked === null);
  if (beat.layout === "blank" || beat.layout === "tiles") return <BlankBody beat={beat} onResolve={onResolve} locked={locked} />;
  if (beat.layout === "document") return <DocumentBody beat={beat} onResolve={onResolve} locked={locked} />;
  if (beat.layout === "zones") return <ZonesBody beat={beat} onResolve={onResolve} locked={locked} accent={accent} />;
  if (beat.layout === "move") return <MoveBody beat={beat} onResolve={onResolve} locked={locked} accent={accent} />;
  if (beat.layout === "chat") return <ChatBody beat={beat} onResolve={onResolve} locked={locked} accent={accent} cast={cast} />;
  if (beat.dragEnabled) return <DragOptionsBody beat={beat} onResolve={onResolve} locked={locked} />;
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="flex flex-col gap-[8px]">
        {choices.map((choice, index) => (
          <OptionButton
            key={choice.id}
            index={index}
            label={choice.label}
            disabled={locked !== null}
            picked={locked === choice.id}
            tier={choice.tier}
            dimmed={locked !== null && locked !== choice.id}
            revealed={locked !== null && locked !== choice.id && choice.tier === "best"}
            // Directed levels drop the 1-2-3 badges (doc screen 11: "Remove
            // the numbers 1, 2, 3 from the answer choices"); the badge still
            // appears as the tick or cross once there is a result.
            numbered={!directed}
            onClick={() => { tierSound(choice.tier); onResolve(choice.tier, choice.why, choice.id); }}
          />
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------- the doc's drag designs
// Three different dressings for "drag your answer somewhere, then commit"
// (IB Level 1 doc, 4 Oct 2026): each one looks like the thing it is about,
// so the security check, the credit-stealing moment and the message to
// Christina no longer share one generic token-and-cards layout. Every drop
// target is also a tap target, so a missed drag never strands anyone, and
// nothing scores until Submit/Send.

function rectHit(el: Element | null, x: number, y: number, pad = 0) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad;
}

function zoneIcon(label: string) {
  if (/data room/i.test(label)) return Lock;
  if (/drive/i.test(label)) return HardDrive;
  if (/chat/i.test(label)) return MessagesSquare;
  return FolderClosed;
}

function SubmitButton({ disabled, onClick, label = "Submit" }: { disabled: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold transition-opacity duration-200 disabled:cursor-default disabled:opacity-40"
      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
    >
      {label}
      <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
    </button>
  );
}

/** Screen 23: a "Client files" card above three storage zones in a row --
 *  Data room left, Personal drive centre, Group chat right, in that fixed
 *  order (the doc names the positions). Drag the files into a zone (or tap
 *  the zone), then Submit. */
function ZonesBody({ beat, onResolve, locked, accent }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null; accent: string }) {
  const zoneRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [placed, setPlaced] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [held, setHeld] = useState(false);
  const zoneAt = (x: number, y: number) => zoneRefs.current.findIndex((el) => rectHit(el, x, y, 8));
  const place = (index: number) => {
    if (locked !== null) return;
    playSelect();
    setPlaced(index);
  };
  const submit = () => {
    if (placed === null || locked !== null) return;
    const choice = beat.choices[placed];
    tierSound(choice.tier);
    onResolve(choice.tier, choice.why, choice.id);
  };
  const fileCard = (small = false) => (
    <span
      className={`flex items-center gap-[8px] rounded-[10px] border font-extrabold ${small ? "px-[9px] py-[6px] text-[11.5px]" : "px-[16px] py-[12px] text-[14px]"}`}
      style={{ background: `color-mix(in srgb, ${accent} 16%, var(--card))`, borderColor: accent, color: "var(--foreground)", boxShadow: "0 10px 24px -14px rgba(0,0,0,0.7)" }}
    >
      <FileText className={small ? "h-[13px] w-[13px]" : "h-[17px] w-[17px]"} aria-hidden style={{ color: accent }} />
      Client files
    </span>
  );
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="flex h-[64px] items-center justify-center">
        {placed === null ? (
          <motion.button
            type="button"
            drag={locked === null}
            dragSnapToOrigin
            dragMomentum={false}
            whileDrag={{ scale: 1.08, rotate: -3, zIndex: 40 }}
            onDragStart={() => setHeld(true)}
            onDrag={(event) => setOver(zoneAt((event as PointerEvent).clientX, (event as PointerEvent).clientY))}
            onDragEnd={(event) => {
              const index = zoneAt((event as PointerEvent).clientX, (event as PointerEvent).clientY);
              setHeld(false);
              setOver(null);
              if (index !== -1) place(index);
            }}
            className={`relative cursor-grab touch-none select-none active:cursor-grabbing ${held ? "" : "motion-safe:animate-[play-hover_2.4s_ease-in-out_infinite]"}`}
            aria-label="Client files. Drag into a storage zone, or tap a zone."
          >
            {fileCard()}
          </motion.button>
        ) : (
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {locked === null ? "Change your mind? Tap another zone." : ""}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-[8px] sm:gap-[12px]">
        {beat.choices.map((choice, index) => {
          const Icon = zoneIcon(choice.label);
          const isPlaced = placed === index;
          const verdict = locked !== null ? (isPlaced ? TIER_COLOR[choice.tier] : choice.tier === "best" ? "var(--color-feedback-success)" : null) : null;
          const edge = verdict ?? (isPlaced ? accent : over === index ? "var(--primary)" : "var(--color-glass-border-raised)");
          return (
            <button
              key={choice.id}
              ref={(el) => { zoneRefs.current[index] = el; }}
              type="button"
              disabled={locked !== null}
              onClick={() => place(index)}
              className="flex min-h-[132px] cursor-pointer flex-col items-center justify-start gap-[8px] rounded-[var(--radius-lg)] border-2 px-[6px] pt-[16px] pb-[12px] text-center transition-[border-color,background,transform] duration-200 disabled:cursor-default sm:min-h-[150px]"
              style={{
                borderColor: edge,
                borderStyle: isPlaced || verdict ? "solid" : "dashed",
                background: isPlaced ? `color-mix(in srgb, ${verdict ?? accent} 12%, var(--glass-surface-1))` : over === index ? "color-mix(in srgb, var(--primary) 12%, var(--glass-surface-1))" : "var(--glass-surface-1)",
                transform: over === index ? "scale(1.04)" : "scale(1)",
              }}
            >
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                <Icon className="h-[19px] w-[19px]" aria-hidden style={{ color: verdict ?? (isPlaced ? accent : "var(--muted-foreground)") }} />
              </span>
              <span className="text-[13.5px] leading-tight font-extrabold sm:text-[15.5px]" style={{ color: "var(--foreground)" }}>{choice.label}</span>
              {isPlaced && <span className="motion-safe:animate-[play-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">{fileCard(true)}</span>}
            </button>
          );
        })}
      </div>
      <SubmitButton disabled={placed === null || locked !== null} onClick={submit} />
    </div>
  );
}

// sm and up gets the fanned hand; a phone is too narrow for five fanned
// cards, so it gets the doc's other option, a stacked deck.
const wideQuery = "(min-width: 640px)";
function useWide(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(wideQuery);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(wideQuery).matches,
    () => true,
  );
}

/** The action a YOUR MOVE card stands for, as a glyph, so the hand reads
 *  at a glance before any label is read. Keyed on the doc's own wording. */
function MoveGlyph({ label, className, color }: { label: string; className: string; color: string }) {
  const props = { className, "aria-hidden": true, style: { color } } as const;
  if (/christina|privately/i.test(label)) return <MessageCircle {...props} />;
  if (/call .* out|front of the team/i.test(label)) return <Megaphone {...props} />;
  if (/crash/i.test(label)) return <Flame {...props} />;
  if (/ignore|keep working/i.test(label)) return <Laptop {...props} />;
  if (/subtweet/i.test(label)) return <AtSign {...props} />;
  return <Sparkles {...props} />;
}

/** Screen 30, redesigned (4 Oct 2026, Chandu: "the ui can be better there
 *  ... it looks a little wonky"): the doc's movable action cards dealt as a
 *  HAND, fanned like playing cards under one large glowing YOUR MOVE slot.
 *  Hovering lifts a card out of the hand; drag it into the slot (or tap it)
 *  and it lands there face up, then Submit. Placing another swaps it. The
 *  fan tightens on a phone so all five still fit without scrolling. */
function MoveBody({ beat, onResolve, locked, accent }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null; accent: string }) {
  const choices = useShuffled(beat.choices, beat.id);
  const wide = useWide();
  const zoneRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const chosen = choices.find((choice) => choice.id === placed);
  const place = (id: string) => {
    if (locked !== null) return;
    playSelect();
    setPlaced(id);
  };
  const submit = () => {
    if (!chosen || locked !== null) return;
    tierSound(chosen.tier);
    onResolve(chosen.tier, chosen.why, chosen.id);
  };
  const verdict = locked !== null && chosen ? TIER_COLOR[chosen.tier] : null;
  const mid = (choices.length - 1) / 2;
  const dragProps = (id: string, isPlaced: boolean) => ({
    drag: locked === null && !isPlaced,
    dragSnapToOrigin: true,
    dragMomentum: false,
    onDrag: (event: MouseEvent | TouchEvent | PointerEvent) => setOver(rectHit(zoneRef.current, (event as PointerEvent).clientX, (event as PointerEvent).clientY, 12)),
    onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent) => {
      const hit = rectHit(zoneRef.current, (event as PointerEvent).clientX, (event as PointerEvent).clientY, 12);
      setOver(false);
      if (hit) place(id);
    },
    onTap: () => place(id),
  });
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="flex flex-col items-center gap-[18px] pt-[4px]">
        <div
          ref={zoneRef}
          className="relative flex h-[132px] w-full max-w-[300px] flex-col items-center justify-center gap-[8px] rounded-[18px] border-2 px-[16px] text-center transition-[border-color,background,transform,box-shadow] duration-200 sm:h-[150px]"
          style={{
            borderStyle: chosen ? "solid" : "dashed",
            borderColor: verdict ?? (chosen ? accent : over ? accent : `color-mix(in srgb, ${accent} 45%, transparent)`),
            background: chosen
              ? `linear-gradient(160deg, color-mix(in srgb, ${verdict ?? accent} 18%, var(--card)), var(--card))`
              : `radial-gradient(80% 90% at 50% 50%, color-mix(in srgb, ${accent} ${over ? 22 : 10}%, transparent), transparent)`,
            transform: over ? "scale(1.04)" : "scale(1)",
            boxShadow: over || chosen ? `0 0 34px -8px color-mix(in srgb, ${verdict ?? accent} 70%, transparent)` : "none",
          }}
        >
          <span className="text-[11.5px] font-extrabold tracking-[0.28em] uppercase" style={{ color: verdict ?? accent }}>Your move</span>
          {chosen ? (
            <span key={chosen.id} className="flex flex-col items-center gap-[6px] motion-safe:animate-[play-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
              <MoveGlyph label={chosen.label} className="h-[22px] w-[22px]" color={verdict ?? accent} />
              <span className="max-w-[24ch] text-[16px] leading-snug font-extrabold sm:text-[17px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                {chosen.label}
              </span>
            </span>
          ) : (
            <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Drag a card here</span>
          )}
        </div>
        {wide ? (
          // The fanned hand. Room above for the hover lift and below for the
          // fan's dip, so nothing is clipped by the scrolling box around it.
          <div className="flex w-full justify-center px-[12px] pt-[22px] pb-[30px]" style={{ perspective: "900px" }}>
            {choices.map((choice, index) => {
              const offset = index - mid;
              const isPlaced = placed === choice.id;
              return (
                <motion.button
                  key={choice.id}
                  type="button"
                  disabled={locked !== null}
                  {...dragProps(choice.id, isPlaced)}
                  whileHover={locked === null && !isPlaced ? { y: -16, rotate: 0, scale: 1.05, zIndex: 30 } : undefined}
                  whileDrag={{ scale: 1.08, rotate: 0, zIndex: 40 }}
                  initial={{ opacity: 0, y: 40, rotate: 0 }}
                  animate={{ opacity: isPlaced ? 0.25 : 1, y: Math.abs(offset) * Math.abs(offset) * 4, rotate: offset * 5 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.08 + index * 0.06 }}
                  className="relative flex h-[160px] w-[116px] flex-none cursor-grab touch-none flex-col items-center justify-between rounded-[14px] border px-[10px] pt-[14px] pb-[12px] text-center select-none active:cursor-grabbing disabled:cursor-default lg:h-[170px] lg:w-[130px]"
                  style={{
                    marginLeft: index === 0 ? 0 : "-12px",
                    transformOrigin: "50% 120%",
                    zIndex: 10 - Math.abs(Math.round(offset)),
                    background: isPlaced ? "transparent" : `linear-gradient(170deg, color-mix(in srgb, ${accent} 10%, var(--card)) 0%, var(--card) 60%)`,
                    borderStyle: isPlaced ? "dashed" : "solid",
                    borderColor: isPlaced ? "var(--color-glass-border-raised)" : `color-mix(in srgb, ${accent} 35%, var(--color-glass-border-raised))`,
                    boxShadow: isPlaced ? "none" : "0 18px 32px -16px rgba(0,0,0,0.85)",
                  }}
                >
                  <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)` }}>
                    <MoveGlyph label={choice.label} className="h-[20px] w-[20px]" color={accent} />
                  </span>
                  <span className="text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{choice.label}</span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          // The stacked deck: each card overlaps the one above a little and
          // sits a hair off-square, so it reads as a pile of cards, not a
          // list of buttons -- with nothing wider than the screen.
          <div className="flex w-full flex-col pb-[6px]">
            {choices.map((choice, index) => {
              const isPlaced = placed === choice.id;
              return (
                <motion.button
                  key={choice.id}
                  type="button"
                  disabled={locked !== null}
                  {...dragProps(choice.id, isPlaced)}
                  whileDrag={{ scale: 1.04, rotate: 0, zIndex: 40 }}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: isPlaced ? 0.25 : 1, y: 0, rotate: index % 2 === 0 ? -0.8 : 0.8 }}
                  transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1], delay: 0.06 + index * 0.05 }}
                  className="relative flex w-full cursor-grab touch-none items-center gap-[12px] rounded-[14px] border px-[14px] py-[12px] text-left select-none active:cursor-grabbing disabled:cursor-default"
                  style={{
                    marginTop: index === 0 ? 0 : "-4px",
                    zIndex: index + 1,
                    background: isPlaced ? "transparent" : `linear-gradient(100deg, color-mix(in srgb, ${accent} 10%, var(--card)) 0%, var(--card) 70%)`,
                    borderStyle: isPlaced ? "dashed" : "solid",
                    borderColor: isPlaced ? "var(--color-glass-border-raised)" : `color-mix(in srgb, ${accent} 35%, var(--color-glass-border-raised))`,
                    boxShadow: isPlaced ? "none" : "0 10px 20px -14px rgba(0,0,0,0.9)",
                  }}
                >
                  <span className="flex h-[32px] w-[32px] flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)` }}>
                    <MoveGlyph label={choice.label} className="h-[16px] w-[16px]" color={accent} />
                  </span>
                  <span className="text-[14px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{choice.label}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
      <SubmitButton disabled={!chosen || locked !== null} onClick={submit} />
    </div>
  );
}

/** Screen 32: a chat thread with Christina. Drag one of the drafted
 *  messages into the compose bar (or tap it), then Send: it posts into the
 *  thread, she starts typing, and her reaction is the verdict. */
function ChatBody({ beat, onResolve, locked, accent, cast }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null; accent: string; cast?: Record<string, string> }) {
  const choices = useShuffled(beat.choices, beat.id);
  const barRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [sent, setSent] = useState(false);
  const who = beat.chatWith ?? { name: "Christina", role: "Associate" };
  const face = cast?.[who.name];
  const chosen = choices.find((choice) => choice.id === placed);
  const plain = (label: string) => label.replace(/^["\u201c]|["\u201d]$/g, "");
  const place = (id: string) => {
    if (locked !== null || sent) return;
    playSelect();
    setPlaced(id);
  };
  const send = () => {
    if (!chosen || sent || locked !== null) return;
    playSelect();
    setSent(true);
    // The message posts, she types for a moment, then the verdict lands.
    window.setTimeout(() => {
      tierSound(chosen.tier);
      onResolve(chosen.tier, chosen.why, chosen.id);
    }, 1100);
  };
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: "var(--color-glass-border-raised)", background: "color-mix(in srgb, var(--background) 70%, transparent)" }}>
        <div className="flex items-center gap-[10px] border-b px-[14px] py-[10px]" style={{ borderColor: "var(--color-glass-border-raised)", background: "var(--glass-surface-2)" }}>
          {face && (
            <span className="relative flex-none">
              <Image src={face} alt="" width={72} height={72} className="h-[34px] w-[34px] rounded-full object-cover object-top" />
              <span className="absolute right-[-1px] bottom-[-1px] h-[10px] w-[10px] rounded-full border-2" style={{ background: "var(--color-feedback-success)", borderColor: "var(--background)" }} />
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-[14px] leading-tight font-extrabold">{who.name}</span>
            <span className="block text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{who.role} · Online</span>
          </span>
        </div>
        <div className="flex min-h-[112px] flex-col justify-end gap-[8px] px-[14px] py-[12px]">
          <span className="self-center text-[10.5px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>Today 3:04 PM</span>
          {sent && chosen && (
            <span className="max-w-[80%] self-end rounded-[16px] rounded-br-[5px] px-[13px] py-[9px] text-[14.5px] leading-snug font-semibold motion-safe:animate-[fade-slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              {plain(chosen.label)}
            </span>
          )}
          {sent && (
            <span className="flex items-center gap-[8px] self-start motion-safe:animate-[fade-slide-up_0.3s_ease-out_0.35s_both]">
              {face && <Image src={face} alt="" width={48} height={48} className="h-[22px] w-[22px] rounded-full object-cover object-top" />}
              <span className="flex gap-[4px] rounded-[14px] px-[12px] py-[10px]" style={{ background: "var(--glass-surface-2)" }} aria-label={`${who.name} is typing`}>
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className="h-[6px] w-[6px] rounded-full motion-safe:animate-[play-pulse_0.9s_ease-in-out_infinite]" style={{ background: "var(--muted-foreground)", animationDelay: `${dot * 150}ms` }} />
                ))}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-[8px] border-t px-[10px] py-[10px]" style={{ borderColor: "var(--color-glass-border-raised)" }}>
          <div
            ref={barRef}
            className="flex min-h-[44px] flex-1 items-center rounded-[22px] border px-[14px] py-[8px] text-[14px] font-semibold transition-[border-color,background] duration-200"
            style={{
              borderStyle: chosen ? "solid" : "dashed",
              borderColor: over ? "var(--primary)" : chosen && !sent ? accent : "var(--color-glass-border-raised)",
              background: over ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
              color: chosen && !sent ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {chosen && !sent ? plain(chosen.label) : sent ? "Message sent" : `Drag a message here`}
          </div>
          <button
            type="button"
            onClick={send}
            disabled={!chosen || sent || locked !== null}
            aria-label="Send"
            className="dm-solid flex h-[44px] w-[44px] flex-none cursor-pointer items-center justify-center rounded-full transition-opacity duration-200 disabled:cursor-default disabled:opacity-40"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <SendHorizontal className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
      </div>
      {!sent && (
        <div className="flex flex-col gap-[8px]">
          {choices.map((choice, index) => {
            const isPlaced = placed === choice.id;
            return (
              <motion.button
                key={choice.id}
                type="button"
                disabled={locked !== null}
                drag={locked === null}
                dragSnapToOrigin
                dragMomentum={false}
                whileDrag={{ scale: 1.04, zIndex: 40 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isPlaced ? 0.35 : 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onDrag={(event) => setOver(rectHit(barRef.current, (event as PointerEvent).clientX, (event as PointerEvent).clientY, 14))}
                onDragEnd={(event) => {
                  const hit = rectHit(barRef.current, (event as PointerEvent).clientX, (event as PointerEvent).clientY, 14);
                  setOver(false);
                  if (hit) place(choice.id);
                }}
                onTap={() => place(choice.id)}
                className="cursor-grab touch-none self-end rounded-[16px] rounded-br-[5px] border px-[14px] py-[10px] text-right text-[14.5px] leading-snug font-semibold select-none active:cursor-grabbing sm:max-w-[85%]"
                style={{ background: `color-mix(in srgb, var(--primary) 14%, var(--card))`, borderColor: "color-mix(in srgb, var(--primary) 40%, transparent)", color: "var(--foreground)" }}
              >
                {plain(choice.label)}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Drag to Answer / Drag Cards to Zone / Drag Message to Chat (Interaction
 *  Rules): one mechanic under three different dressings -- a token on a
 *  rail, press-and-hold, drag onto the right card. A wrong drop shakes
 *  that card and springs the token back; a right drop locks. Every card
 *  is also a plain tap target, so a missed drag never strands anyone
 *  (same fallback CheckBeat's own drag method already relies on). */
function DragOptionsBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  const choices = useShuffled(beat.choices, beat.id);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [over, setOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [missed, setMissed] = useState<Set<number>>(new Set());

  const commit = useCallback(
    (choice: ChoiceBeat["choices"][number]) => {
      if (locked !== null) return;
      tierSound(choice.tier);
      onResolve(choice.tier, choice.why, choice.id);
    },
    [locked, onResolve],
  );
  const cardAt = (x: number, y: number) =>
    cardRefs.current.findIndex((el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  const dropAt = (x: number, y: number) => {
    if (locked !== null) return;
    const index = cardAt(x, y);
    if (index === -1) return;
    const choice = choices[index];
    if (choice.tier === "best") commit(choice);
    else {
      playWrong();
      setMissed((current) => new Set(current).add(index));
      window.setTimeout(() => setMissed((current) => { const next = new Set(current); next.delete(index); return next; }), 460);
      commit(choice);
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="flex flex-col gap-[14px]">
        <div className="flex justify-center rounded-[var(--radius-lg)] border border-dashed py-[10px]" style={{ borderColor: "var(--color-glass-border-raised)" }}>
          {locked !== null ? (
            <span className="flex h-[48px] items-center gap-[6px] text-[12px] font-bold tracking-[0.08em] uppercase" style={{ color: "var(--color-feedback-success)" }}>
              <Check className="h-[14px] w-[14px]" aria-hidden /> Locked in
            </span>
          ) : (
            <motion.button
              type="button"
              drag
              dragSnapToOrigin
              dragMomentum={false}
              whileDrag={{ scale: 1.22 }}
              onDragStart={() => setDragging(true)}
              onDrag={(event) => {
                const pointer = event as PointerEvent;
                setOver(cardAt(pointer.clientX, pointer.clientY));
              }}
              onDragEnd={(event) => {
                const pointer = event as PointerEvent;
                setDragging(false);
                setOver(null);
                dropAt(pointer.clientX, pointer.clientY);
              }}
              className={`relative z-30 flex h-[48px] w-[48px] cursor-grab touch-none items-center justify-center rounded-full text-[10px] font-extrabold tracking-[0.06em] text-white uppercase select-none active:cursor-grabbing ${dragging ? "" : "motion-safe:animate-[play-pulse_1.6s_ease-in-out_infinite]"}`}
              style={{
                background: "var(--primary)",
                boxShadow: dragging
                  ? "0 0 0 6px color-mix(in srgb, var(--primary) 30%, transparent), 0 14px 34px -8px color-mix(in srgb, var(--primary) 85%, transparent)"
                  : "0 6px 18px -6px color-mix(in srgb, var(--primary) 70%, transparent)",
              }}
              aria-label="Drag this token onto an answer, or tap an answer"
            >
              Drag
            </motion.button>
          )}
        </div>
        <div className="flex flex-col gap-[8px] sm:grid sm:grid-cols-3">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              disabled={locked !== null}
              onClick={() => commit(choice)}
              ref={(el) => { cardRefs.current[index] = el; }}
              className={`flex cursor-pointer flex-col gap-[4px] rounded-[var(--radius-lg)] border px-[16px] py-[13px] text-left text-[15.5px] font-semibold transition-[border-color,background,transform,opacity] duration-150 disabled:cursor-default sm:text-[16px] ${missed.has(index) ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""} ${locked === choice.id && choice.tier === "best" ? "motion-safe:animate-[play-pop_0.44s_cubic-bezier(0.34,1.56,0.64,1)]" : ""}`}
              style={{
                background:
                  locked === choice.id
                    ? `color-mix(in srgb, ${TIER_COLOR[choice.tier]} 20%, var(--glass-surface-1))`
                    : over === index
                      ? "color-mix(in srgb, var(--primary) 16%, var(--glass-surface-1))"
                      : "var(--glass-surface-1)",
                borderColor: locked === choice.id ? TIER_COLOR[choice.tier] : over === index ? "var(--primary)" : "var(--color-glass-border-raised)",
                color: "var(--foreground)",
                opacity: locked !== null && locked !== choice.id ? 0.4 : 1,
                transform: over === index && locked === null ? "scale(1.03)" : "scale(1)",
              }}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Drag to Blank (Interaction Rules): the sentence keeps its shape, the
 *  word tiles sit on a rail below, and a tile can be DRAGGED into the slot
 *  (D75 -- a drag costs a deliberate second and feels like a game rather
 *  than a quiz) or simply TAPPED. Tap was added after players got stuck on
 *  the data-room beat: a drag that misses the slot springs back with no
 *  other way forward. One attempt on a scored beat, same as every other
 *  scored interaction: whichever tile lands in (or is tapped into) the slot
 *  commits. Number keys still commit directly (ChoiceBody's useDigitKeys),
 *  so the keyboard path stays one press. */
function BlankBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  const choices = useShuffled(beat.choices, beat.id);
  const chosen = beat.choices.find((choice) => choice.id === locked);
  const [before, after] = beat.question.split("___");
  const slotRef = useRef<HTMLSpanElement>(null);
  const firstTileRef = useRef<HTMLButtonElement>(null);
  // Drag has no visual cue beyond a cursor-grab style that's invisible on
  // touch, so the first encounter gets a spotlight (see useFirstUseHint),
  // dismissed the moment a drag or tap happens.
  const [hintOn, dismissHint] = useFirstUseHint("blank-drag");
  // Which tile is in the air, and whether it is over the slot right now, so
  // the slot can light up before the drop and the tile can lift visibly.
  const [held, setHeld] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const overSlot = (x: number, y: number) => {
    const rect = slotRef.current?.getBoundingClientRect();
    if (!rect) return false;
    // A forgiving halo around the slot -- a drop just shy of a small inline
    // target should not read as a miss (a real miss springs the tile back).
    const pad = 26;
    return x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad;
  };
  const commit = (choice: ChoiceBeat["choices"][number]) => {
    if (locked !== null) return;
    tierSound(choice.tier);
    onResolve(choice.tier, choice.why, choice.id);
  };
  const dropTile = (choice: ChoiceBeat["choices"][number], x: number, y: number) => {
    setHeld(null);
    setOver(false);
    if (locked !== null) return;
    if (overSlot(x, y)) commit(choice);
  };
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>
        {before}
        <span
          ref={slotRef}
          className="mx-[3px] inline-block min-w-[104px] rounded-[8px] border-2 border-dashed px-[9px] text-center align-baseline"
          style={{
            borderColor: chosen ? TIER_COLOR[chosen.tier] : over ? "var(--primary)" : held ? "rgba(255,255,255,0.55)" : "var(--color-glass-border-raised)",
            background: over && !chosen ? "color-mix(in srgb, var(--primary) 22%, transparent)" : "transparent",
            color: chosen ? "var(--foreground)" : "transparent",
            borderStyle: chosen ? "solid" : "dashed",
            transform: over && !chosen ? "scale(1.06)" : "none",
            transition: "border-color 160ms, background-color 160ms, transform 160ms",
          }}
        >
          {chosen ? chosen.label : " "}
        </span>
        {after}
      </Question>
      <div className={beat.layout === "tiles" ? "grid grid-cols-2 gap-[8px]" : "flex flex-wrap gap-[8px]"}>
        {choices.map((choice, index) => (
          // The entrance animation lives on this wrapper. A CSS keyframe with
          // fill-mode "both" leaves its final transform on the element, which
          // silently overrode framer's drag transform when both sat on the
          // button: the tile then never moved under the finger.
          <div key={choice.id} className="motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: `${index * 55}ms` }}>
            <motion.button
              ref={index === 0 ? firstTileRef : undefined}
              type="button"
              disabled={locked !== null}
              drag={locked === null}
              dragSnapToOrigin
              dragMomentum={false}
              dragElastic={1}
              whileDrag={{ scale: 1.1, zIndex: 40, boxShadow: "0 18px 36px -12px rgba(0,0,0,0.6)" }}
              whileTap={locked === null ? { scale: 0.97 } : undefined}
              onDragStart={() => { dismissHint(); setHeld(choice.id); }}
              onDrag={(event) => {
                const pointer = event as PointerEvent;
                setOver(overSlot(pointer.clientX, pointer.clientY));
              }}
              onDragEnd={(event) => {
                const pointer = event as PointerEvent;
                dropTile(choice, pointer.clientX, pointer.clientY);
              }}
              // A press with no drag: framer fires onTap only when the
              // pointer did not move past the drag threshold, so a drag
              // that misses never double-commits through this path.
              onTap={() => { dismissHint(); commit(choice); }}
              className="relative w-full cursor-grab touch-none rounded-[var(--radius-md)] border px-[18px] py-[15px] text-[15px] font-semibold select-none active:cursor-grabbing disabled:cursor-default sm:text-[17px]"
              style={{
                background:
                  locked === choice.id
                    ? `color-mix(in srgb, ${TIER_COLOR[choice.tier]} 20%, var(--glass-surface-1))`
                    : locked !== null && choice.tier === "best"
                      ? "color-mix(in srgb, var(--color-feedback-success) 20%, var(--glass-surface-1))"
                      : held === choice.id
                        ? "color-mix(in srgb, var(--primary) 18%, var(--glass-surface-2))"
                        : "var(--glass-surface-1)",
                borderColor:
                  locked === choice.id
                    ? TIER_COLOR[choice.tier]
                    : locked !== null && choice.tier === "best"
                      ? "var(--color-feedback-success)"
                      : held === choice.id
                        ? "var(--primary)"
                        : "var(--color-glass-border-raised)",
                color: "var(--foreground)",
                opacity: locked !== null && locked !== choice.id && choice.tier !== "best" ? 0.4 : 1,
                transition: "border-color 200ms, background-color 200ms, opacity 200ms",
              }}
            >
              {choice.label}
            </motion.button>
          </div>
        ))}
      </div>
      <GestureSpotlight active={hintOn && locked === null} targetRef={firstTileRef} direction="up" label="Drag or tap into the blank" hintSize={22} hintDistance={28} />
    </div>
  );
}

/** Catch the Mistake: a document window, one line per row. */
function DocumentBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  const choices = useShuffled(beat.choices, beat.id);
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--color-glass-border-raised)" }}>
        <p
          className="flex items-center gap-[7px] px-[12px] py-[8px] text-[12px] font-bold tracking-[0.04em]"
          style={{ background: "var(--glass-surface-3)", color: "var(--muted-foreground)" }}
        >
          <FileText className="h-[14px] w-[14px]" aria-hidden />
          {beat.doc ?? "Document"}
        </p>
        <ul className="m-0 flex list-none flex-col p-0">
          {choices.map((choice, index) => (
            <li key={choice.id}>
              <button
                type="button"
                disabled={locked !== null}
                onClick={() => { tierSound(choice.tier); onResolve(choice.tier, choice.why, choice.id); }}
                className="w-full cursor-pointer border-t px-[12px] py-[11px] text-left text-[14.5px] leading-snug font-medium transition-colors duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]"
                style={{
                  animationDelay: `${index * 45}ms`,
                  borderColor: "var(--glass-border)",
                  background:
                    locked === choice.id
                      ? `color-mix(in srgb, ${TIER_COLOR[choice.tier]} 18%, transparent)`
                      : locked !== null && choice.tier === "best"
                        ? "color-mix(in srgb, var(--color-feedback-success) 18%, transparent)"
                        : "var(--glass-surface-1)",
                  color: "var(--foreground)",
                  opacity: locked !== null && locked !== choice.id && choice.tier !== "best" ? 0.45 : 1,
                }}
              >
                {choice.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Boss Moment: a gold overlay over the current screen, two options, and it
 *  counts as one of the ten scored beats. */
export function BossOverlay({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  const choices = useShuffled(beat.choices, beat.id);
  return (
    <div className="flex flex-col items-center gap-[var(--space-3)] text-center">
      <span
        className="flex h-[52px] w-[52px] items-center justify-center rounded-[var(--radius-lg)]"
        style={{ background: "var(--world-business-money-office)", color: "#05070f" }}
      >
        <Trophy className="h-[26px] w-[26px]" aria-hidden />
      </span>
      <Question>{beat.question}</Question>
      <div className="flex w-full flex-col gap-[8px]">
        {choices.map((choice, index) => (
          <OptionButton
            key={choice.id}
            index={index}
            label={choice.label}
            disabled={locked !== null}
            picked={locked === choice.id}
            tier={choice.tier}
            dimmed={locked !== null && locked !== choice.id}
            revealed={locked !== null && locked !== choice.id && choice.tier === "best"}
            onClick={() => { tierSound(choice.tier); onResolve(choice.tier, choice.why, choice.id); }}
          />
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- matching

/** Match pairs, the way a language app does it: tap one tile, tap another, and
 *  find out immediately. The old version waited for a Check button, highlighted
 *  only the left column, and stacked the chosen definition UNDERNEATH the term,
 *  which made the pairing invisible until you submitted.
 *
 *  Now: either column can start a pair, a right answer flashes green and clears
 *  both tiles off the board, a wrong one shakes red and lets go. The board
 *  emptying is the progress bar. The handoff's rule still holds -- no partial
 *  credit, one wrong pair scores the beat Wrong -- it is just enforced by
 *  remembering that a mistake happened rather than by a submit step.
 */
type Side = "term" | "def";
type TileState = "idle" | "picked" | "right" | "wrong" | "done";

export function MatchBody({ beat, onResolve }: { beat: MatchBeat; onResolve: Resolve }) {
  // Definitions are shuffled once per mount, deterministically per beat so the
  // layout never jumps between renders.
  const defs = useMemo(
    () =>
      beat.pairs
        .map((pair, index) => ({ ...pair, index }))
        .slice()
        .sort((a, b) => ((a.def.length * 7 + a.index * 3) % 11) - ((b.def.length * 7 + b.index * 3) % 11)),
    [beat.pairs],
  );

  const [picked, setPicked] = useState<{ side: Side; term: string } | null>(null);
  const [done, setDone] = useState<string[]>([]);
  // BOTH tiles in the attempt are flashed, identified by side as well as key:
  // a definition tile is keyed by the term it belongs to, so flashing by key
  // alone lit up the wrong tile and left the one you actually tapped grey.
  const [flash, setFlash] = useState<{ a: { side: Side; term: string }; b: { side: Side; term: string }; ok: boolean } | null>(null);
  const missed = useRef(false);
  const settled = useRef(false);

  const total = beat.pairs.length;

  function attempt(side: Side, term: string) {
    if (flash || done.includes(term)) return;
    // Nothing held, or re-picking on the same side: just select.
    if (!picked || picked.side === side) {
      playSelect();
      setPicked({ side, term });
      return;
    }
    const ok = picked.term === term;
    if (!ok) missed.current = true;
    if (ok) playCorrect();
    else playWrong();
    setFlash({ a: picked, b: { side, term }, ok });
    window.setTimeout(() => {
      setFlash(null);
      setPicked(null);
      if (!ok) return;
      const cleared = [...done, term];
      setDone(cleared);
      if (cleared.length < total || settled.current) return;
      settled.current = true;
      playSweep();
      window.setTimeout(() => {
        const right = !missed.current;
        onResolve(right ? "best" : "wrong", right ? beat.whenRight : beat.whenWrong);
      }, 420);
    }, ok ? 260 : 520);
  }

  const tileState = (term: string, side: Side): TileState => {
    if (done.includes(term)) return "done";
    if (flash) {
      const isA = flash.a.side === side && flash.a.term === term;
      const isB = flash.b.side === side && flash.b.term === term;
      if (isA || isB) return flash.ok ? "right" : "wrong";
    }
    if (picked && picked.side === side && picked.term === term) return "picked";
    return "idle";
  };

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="grid grid-cols-2 gap-[8px]">
        <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
          {beat.pairs.map((pair, index) => (
            <li key={pair.term}>
              <MatchTile
                label={pair.term}
                state={tileState(pair.term, "term")}
                index={index}
                strong
                onClick={() => attempt("term", pair.term)}
              />
            </li>
          ))}
        </ul>
        <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
          {defs.map((pair, index) => (
            <li key={pair.def}>
              <MatchTile
                label={pair.def}
                state={tileState(pair.term, "def")}
                index={index}
                onClick={() => attempt("def", pair.term)}
              />
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {done.length} of {total} matched
      </p>
    </div>
  );
}

function MatchTile({
  label,
  state,
  index,
  strong,
  onClick,
}: {
  label: string;
  state: TileState;
  index: number;
  strong?: boolean;
  onClick: () => void;
}) {
  const green = "var(--color-feedback-success)";
  const red = "var(--destructive)";
  const style =
    state === "done"
      ? { background: `color-mix(in srgb, ${green} 12%, transparent)`, borderColor: `color-mix(in srgb, ${green} 40%, transparent)`, color: "var(--muted-foreground)" }
      : state === "right"
        ? { background: `color-mix(in srgb, ${green} 26%, var(--glass-surface-1))`, borderColor: green, color: "var(--foreground)" }
        : state === "wrong"
          ? { background: `color-mix(in srgb, ${red} 24%, var(--glass-surface-1))`, borderColor: red, color: "var(--foreground)" }
          : state === "picked"
            ? { background: "color-mix(in srgb, var(--primary) 26%, var(--glass-surface-1))", borderColor: "var(--primary)", color: "var(--foreground)" }
            : { background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "done"}
      aria-pressed={state === "picked"}
      className={`flex min-h-[58px] w-full items-center rounded-[var(--radius-lg)] border-2 px-[14px] py-[13px] text-left leading-snug transition-[background,border-color,transform,opacity] duration-150 disabled:cursor-default ${
        strong ? "text-[16px] font-extrabold" : "text-[14.5px] font-semibold"
      } ${state === "done" ? "opacity-45" : "cursor-pointer"} ${
        state === "wrong" ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""
      } ${state === "picked" ? "-translate-y-px" : ""} motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]`}
      style={{ animationDelay: state === "idle" ? `${index * 45}ms` : undefined, ...style }}
    >
      {label}
    </button>
  );
}

// -------------------------------------------------------------- rapid-fire

/** Four questions on ONE shared countdown that keeps running between them. The
 *  set is a single scored beat; unanswered questions score as wrong. */
export function RapidBody({ beat, onResolve, remaining, onClockHold }: { beat: RapidBeat; onResolve: Resolve; remaining: number; onClockHold?: (held: boolean) => void }) {
  const { directed } = usePresentation();
  // Question order is the sheet's own; only each question's OPTIONS shuffle.
  const items = useMemo(
    () => beat.items.map((item, index) => ({ ...item, options: seededShuffle(item.options, `${beat.id}:${index}`) })),
    [beat.items, beat.id],
  );
  const [step, setStep] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const need = passThreshold(beat.items.length);
  const settled = useRef(false);

  const finish = useCallback(
    (correct: number) => {
      if (settled.current) return;
      settled.current = true;
      const pass = correct >= need;
      onResolve(pass ? "best" : "wrong", pass ? beat.whenPass : beat.whenFail);
    },
    [need, onResolve, beat.whenPass, beat.whenFail],
  );

  // The shared clock is owned by the stage. When it runs out mid-set the
  // remaining questions are simply never answered, which is the rule. Only
  // beats that actually have a timer count as timed out this way -- without
  // `beat.timer` (Level 2's own rapid-fire model, unlike Level 1's shared
  // clock), `remaining` is 0 from the very first render, and this used to
  // fire immediately on mount, resolving the whole set as failed before the
  // player ever saw question one.
  useEffect(() => {
    if (beat.timer && remaining <= 0) finish(right);
  }, [beat.timer, remaining, right, finish]);

  const item = items[step];

  const pick = useCallback((index: number) => {
    if (picked !== null || !item) return;
    setPicked(index);
    const hit = Boolean(item.options[index]?.correct);
    if (hit) playCorrect();
    else playWrong();
    const correct = hit ? right + 1 : right;
    setRight(correct);
    // Directed (4 Oct 2026, Chandu: "the feedback is disappearing too fast
    // ... there should be a button click to advance so the feedback can be
    // read first"): the explanation stays until the student moves on, and
    // the shared clock stops while they read it, so reading never costs time.
    if (directed) {
      onClockHold?.(true);
      return;
    }
    window.setTimeout(
      () => {
        if (step + 1 >= beat.items.length) finish(correct);
        else {
          setStep(step + 1);
          setPicked(null);
        }
      },
      // Longer on a miss: the green answer has to be readable before the next
      // question replaces it.
      hit ? 480 : 1150,
    );
  }, [picked, item, right, step, beat.items.length, finish, directed, onClockHold]);
  const nextQuestion = useCallback(() => {
    if (picked === null) return;
    playSelect();
    onClockHold?.(false);
    if (step + 1 >= beat.items.length) finish(right);
    else {
      setStep(step + 1);
      setPicked(null);
    }
  }, [picked, step, beat.items.length, finish, right, onClockHold]);

  useDigitKeys(item?.options.length ?? 0, pick, picked === null);

  if (!item) return null;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <span className="text-[12px] font-extrabold tracking-[0.14em] uppercase" style={{ color: "var(--accent-subtle)" }}>
          Question {step + 1} of {beat.items.length}
        </span>
        <span className="flex items-center gap-[5px]" aria-hidden>
          {beat.items.map((_, index) => (
            <span
              key={index}
              className="h-[6px] rounded-full transition-[width,background] duration-300"
              style={{
                width: index === step ? 20 : 6,
                background: index < step ? "var(--color-feedback-success)" : index === step ? "var(--foreground)" : "var(--color-glass-border-raised)",
              }}
            />
          ))}
        </span>
      </div>
      <Question>{item.question}</Question>
      <div className="flex flex-col gap-[8px]">
        {item.options.map((option, index) => (
          <OptionButton
            key={option.label}
            index={index}
            label={option.label}
            disabled={picked !== null}
            picked={picked === index}
            tier={option.correct ? "best" : "wrong"}
            dimmed={picked !== null && picked !== index}
            revealed={picked !== null && picked !== index && option.correct}
            onClick={() => pick(index)}
          />
        ))}
      </div>
      {/* Each option carries its own `why` (right or wrong), authored per
         question, but the set only resolves once at the end -- so without
         this, a wrong pick here just shook and recolored with no explanation
         at all (direct feedback, 10 Sept 2026: "in the express version we
         need explanation when you get something wrong ... didnt happen").
         Shown for the ~480/1150ms window before the next question, same as
         the reveal it sits next to. */}
      {picked !== null && item.options[picked] && (
        <p
          className="rounded-[12px] border px-[12px] py-[10px] text-[13.5px] leading-[19px] font-semibold motion-safe:animate-[fade-slide-up_0.24s_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{
            background: `color-mix(in srgb, ${item.options[picked].correct ? "var(--color-feedback-success)" : TIER_COLOR.wrong} 14%, var(--glass-surface-1))`,
            borderColor: item.options[picked].correct ? "var(--color-feedback-success)" : TIER_COLOR.wrong,
            color: "var(--foreground)",
          }}
        >
          {item.options[picked].why}
        </p>
      )}
      {directed && picked !== null && (
        <button
          type="button"
          autoFocus
          onClick={nextQuestion}
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {step + 1 >= beat.items.length ? "See how you did" : "Next question"}
          <ChevronRight className="h-4 w-4" aria-hidden style={{ color: "var(--primary-foreground)" }} />
        </button>
      )}
      <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
        {need} of {beat.items.length} correct to pass. No score on single questions.
      </p>
    </div>
  );
}

// ————————————————————————————————————————————————————————————————
// Level 2 and 3 interactions. Each one owns its rule from the Interaction
// Rules tab; none of them invents scoring.
// ————————————————————————————————————————————————————————————————

/** Build the Strongest Answer. Three prompts in sequence, each adding a
 *  sentence to the answer box. The chain scores ONCE: all steps right is Best,
 *  anything less is Wrong, because the three sentences are one argument. */
export function ChainBody({ beat, onResolve }: { beat: ChainBeat; onResolve: Resolve }) {
  const [step, setStep] = useState(0);
  const [built, setBuilt] = useState<string[]>([]);
  const [missed, setMissed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const settled = useRef(false);
  const current = beat.steps[step];

  const choose = useCallback((index: number) => {
    if (picked !== null || !current) return;
    const option = current.options[index];
    setPicked(index);
    if (option?.correct) playCorrect();
    else playWrong();
    const wrong = missed || !option?.correct;
    window.setTimeout(
      () => {
        setBuilt((lines) => [...lines, current.options.find((o) => o.correct)?.label ?? ""]);
        setMissed(wrong);
        setPicked(null);
        if (step + 1 < beat.steps.length) {
          setStep(step + 1);
          return;
        }
        if (settled.current) return;
        settled.current = true;
        playSweep();
        onResolve(wrong ? "wrong" : "best", wrong ? beat.whenWrong : beat.whenRight);
      },
      option?.correct ? 460 : 1150,
    );
  }, [picked, current, missed, step, beat.steps.length, beat.whenWrong, beat.whenRight, onResolve]);

  useDigitKeys(current?.options.length ?? 0, choose, picked === null);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="flex items-center gap-[7px]">
        {beat.steps.map((entry, index) => (
          <span
            key={entry.label}
            className="flex h-[24px] flex-1 items-center justify-center rounded-full border text-[11px] font-extrabold tracking-[0.06em] uppercase transition-colors duration-300"
            style={{
              borderColor: index < step ? "var(--color-feedback-success)" : index === step ? "var(--primary)" : "var(--color-glass-border-raised)",
              background: index < step ? "color-mix(in srgb, var(--color-feedback-success) 18%, transparent)" : "transparent",
              color: index <= step ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {entry.label}
          </span>
        ))}
      </div>
      {built.length > 0 && (
        <p
          className="rounded-[12px] border px-[12px] py-[10px] text-[14px] leading-[21px]"
          style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
        >
          {built.join(". ") + "."}
        </p>
      )}
      {current && (
        <>
          <p className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{current.prompt}</p>
          <div className="flex flex-col gap-[8px]">
            {current.options.map((option, index) => (
              <OptionButton
                key={option.label}
                index={index}
                label={option.label}
                disabled={picked !== null}
                picked={picked === index}
                tier={option.correct ? "best" : "wrong"}
                dimmed={picked !== null && picked !== index}
                revealed={picked !== null && picked !== index && option.correct}
                onClick={() => choose(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Risk Slider. A real range input drives it, so keyboard and screen readers
 *  work; the segments are painted around it. Only the correct segment scores
 *  its tier -- adjacent ones are not partial credit. */
export function SliderBody({ beat, onResolve }: { beat: SliderBeat; onResolve: Resolve }) {
  const [at, setAt] = useState(0);
  const [locked, setLocked] = useState(false);
  const last = beat.steps.length - 1;
  const shade = ["var(--color-feedback-success)", "var(--world-business-money-office)", "var(--world-building-construction)", "var(--destructive)"];

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="rounded-[var(--radius-lg)] border px-[14px] pt-[16px] pb-[12px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}>
        <p className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: shade[Math.min(at, shade.length - 1)] }}>
          {beat.steps[at]?.label}
        </p>
        <div className="relative mt-[14px] mb-[10px] h-[26px]">
          <span className="absolute inset-x-0 top-1/2 flex h-[10px] -translate-y-1/2 gap-[3px] overflow-hidden rounded-full">
            {beat.steps.map((step, index) => (
              <span key={step.label} className="flex-1 transition-opacity duration-200" style={{ background: shade[Math.min(index, shade.length - 1)], opacity: index <= at ? 1 : 0.22 }} />
            ))}
          </span>
          <input
            type="range"
            min={0}
            max={last}
            step={1}
            value={at}
            disabled={locked}
            aria-label={beat.question}
            aria-valuetext={beat.steps[at]?.label}
            onChange={(event) => {
              playSelect();
              setAt(Number(event.target.value));
            }}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-[24px] w-[24px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-200"
            style={{
              left: `${(at / last) * 100}%`,
              background: "var(--foreground)",
              borderColor: shade[Math.min(at, shade.length - 1)],
              boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
            }}
          />
        </div>
        {/* Labels sit UNDER the track, not on it: on the prototype the handle
           covered the word it was pointing at. */}
        <div className="flex justify-between text-[11.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          {beat.steps.map((step, index) => (
            <span key={step.label} style={{ color: index === at ? "var(--foreground)" : undefined }}>{step.label}</span>
          ))}
        </div>
      </div>
      <button
        type="button"
        disabled={locked}
        onClick={() => {
          const step = beat.steps[at];
          if (!step) return;
          setLocked(true);
          tierSound(step.tier);
          onResolve(step.tier, step.why);
        }}
        className="dm-solid w-full cursor-pointer rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold disabled:opacity-50"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Submit
      </button>
    </div>
  );
}

/** Find All Red Flags. Tap every row that is wrong, then submit. All the flags
 *  and nothing else is Best; anything else is Wrong. Tapping everything must
 *  not pass, which is why false positives count against you. */
export function FlagsBody({ beat, onResolve, remaining }: { beat: FlagsBeat; onResolve: Resolve; remaining: number }) {
  const [marked, setMarked] = useState<number[]>([]);
  const settled = useRef(false);
  const total = beat.rows.filter((row) => row.flag).length;

  const submit = useCallback(
    (picks: number[]) => {
      if (settled.current) return;
      settled.current = true;
      const right = beat.rows.every((row, index) => row.flag === picks.includes(index));
      if (right) playCorrect();
      else playWrong();
      onResolve(right ? "best" : "wrong", right ? beat.whenRight : beat.whenWrong);
    },
    [beat.rows, beat.whenRight, beat.whenWrong, onResolve],
  );

  useEffect(() => {
    // Out of time: score whatever was found at that moment, per the rules tab.
    if (beat.timer && remaining <= 0) submit(marked);
  }, [beat.timer, remaining, marked, submit]);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <p className="text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        {marked.length} of {total} red flags marked
      </p>
      <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
        {beat.rows.map((row, index) => {
          const on = marked.includes(index);
          return (
            <li key={row.label}>
              <button
                type="button"
                onClick={() => {
                  playSelect();
                  setMarked((current) => (current.includes(index) ? current.filter((i) => i !== index) : [...current, index]));
                }}
                aria-pressed={on}
                className="flex w-full cursor-pointer items-center gap-[10px] rounded-[12px] border-2 px-[12px] py-[11px] text-left text-[14.5px] font-semibold transition-[border-color,background] duration-150 motion-safe:animate-[fade-slide-up_0.3s_ease-out_both]"
                style={{
                  animationDelay: `${index * 40}ms`,
                  background: on ? "color-mix(in srgb, var(--destructive) 18%, var(--glass-surface-1))" : "var(--glass-surface-1)",
                  borderColor: on ? "var(--destructive)" : "var(--color-glass-border-raised)",
                  color: "var(--foreground)",
                }}
              >
                <span
                  aria-hidden
                  className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[7px] border-2"
                  style={{ borderColor: on ? "var(--destructive)" : "var(--color-glass-border-raised)", background: on ? "var(--destructive)" : "transparent", color: "#05070f" }}
                >
                  {on ? <Flag className="h-[13px] w-[13px]" /> : null}
                </span>
                {row.label}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => submit(marked)}
        className="dm-solid w-full cursor-pointer rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Submit findings
      </button>
    </div>
  );
}

/** Rank the Order. Rows arrive shuffled -- the prototype loaded one of these
 *  already in the right order -- and every position must be correct. */
export function RankBody({ beat, onResolve }: { beat: RankBeat; onResolve: Resolve }) {
  const [rows, setRows] = useState<string[]>(() => {
    // Deterministic shuffle: stable across renders, never the answer order.
    const shuffled = [...beat.order];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = (i * 7 + beat.order.length * 3) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.join("|") === beat.order.join("|") ? [...shuffled].reverse() : shuffled;
  });
  const [locked, setLocked] = useState(false);

  // Dragging is the obvious gesture for a list you are ordering, by mouse and by
  // finger. The arrows stay as the keyboard and screen-reader route.
  //
  // The rows SLIDE rather than swap. The committed order is left alone until the
  // drag ends; while it is live, the held row follows the pointer and every row
  // it passes is translated one slot out of its way. Reordering the array
  // mid-drag would move rows by re-layout, which no transition can animate.
  const [drag, setDrag] = useState<{ index: number; dy: number; height: number; from: number } | null>(null);
  const target = drag ? Math.max(0, Math.min(rows.length - 1, drag.index + Math.round(drag.dy / drag.height))) : -1;
  const firstRowRef = useRef<HTMLLIElement>(null);
  // GripVertical is a weak affordance on its own -- press-and-drag to
  // reorder isn't obvious from a static icon. First encounter only.
  const [hintOn, dismissHint] = useFirstUseHint("rank-drag");

  function reorder(list: string[], from: number, to: number): string[] {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  }

  /** Where a row sits while a drag is live: its slot in the previewed order. */
  function slot(index: number): number {
    if (!drag) return index;
    if (index === drag.index) return target;
    if (drag.index < target && index > drag.index && index <= target) return index - 1;
    if (drag.index > target && index >= target && index < drag.index) return index + 1;
    return index;
  }

  const move = (index: number, by: -1 | 1) => {
    const to = index + by;
    if (to < 0 || to >= rows.length) return;
    playSelect();
    setRows((current) => reorder(current, index, to));
  };

  function onPointerDown(event: React.PointerEvent<HTMLLIElement>, index: number) {
    if (locked || event.button !== 0) return;
    dismissHint();
    const height = event.currentTarget.getBoundingClientRect().height + 6; // + the list gap
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ index, dy: 0, height, from: event.clientY });
    playSelect();
  }

  function onPointerMove(event: React.PointerEvent<HTMLLIElement>) {
    const y = event.clientY;
    setDrag((current) => (current ? { ...current, dy: y - current.from } : current));
  }

  function onPointerUp() {
    // Committing the reorder must NOT happen inside setDrag's own updater --
    // React 18 Strict Mode double-invokes state updaters to catch impure
    // ones, and setRows was a side effect of that updater, so the reorder
    // silently applied twice: two passes of the same (from, to) splice
    // through the already-shifted list, which is not idempotent (it can
    // net out to the original order, reading as "it snapped back", or to a
    // scrambled one). Read `drag` directly (already current, set by
    // onPointerMove's own pure updates) and keep setDrag(null) separate and
    // side-effect-free.
    if (drag) {
      const to = Math.max(0, Math.min(rows.length - 1, drag.index + Math.round(drag.dy / drag.height)));
      if (to !== drag.index) {
        playSelect();
        setRows((list) => reorder(list, drag.index, to));
      }
    }
    setDrag(null);
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <ul className="m-0 flex list-none flex-col gap-[6px] p-0">
        {rows.map((row, index) => {
          const held = drag?.index === index;
          const offset = held ? drag.dy : (slot(index) - index) * (drag?.height ?? 0);
          return (
            <li
              key={row}
              ref={index === 0 ? firstRowRef : undefined}
              onPointerDown={(event) => onPointerDown(event, index)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="flex touch-none items-center gap-[10px] rounded-[12px] border px-[11px] py-[9px] select-none"
              style={{
                background: "var(--glass-surface-1)",
                borderColor: held ? "var(--accent-subtle)" : "var(--color-glass-border-raised)",
                cursor: locked ? "default" : held ? "grabbing" : "grab",
                transform: `translateY(${offset}px)${held ? " scale(1.03)" : ""}`,
                boxShadow: held ? "0 14px 30px rgb(0 0 0 / 0.42)" : undefined,
                // The held row must track the pointer exactly; the rows moving
                // out of its way are the ones that should ease.
                transition: held ? "box-shadow 0.15s ease-out" : "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative",
                zIndex: held ? 2 : 1,
                willChange: drag ? "transform" : undefined,
              }}
            >
              <GripVertical className="h-[15px] w-[15px] flex-none opacity-45" aria-hidden />
              <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full text-[11.5px] font-extrabold tabular-nums" style={{ background: "var(--color-glass-border-raised)", color: "var(--foreground)" }}>
                {slot(index) + 1}
              </span>
              {/* truncate: the slide-to-reorder math (offset/slot above)
                 assumes every row is the SAME height (drag.height, measured
                 once off whichever row a drag starts from) -- a long label
                 wrapping to a second line made THAT row taller than the
                 others, so the uniform per-row translateY step no longer
                 matched its real height and it visually overlapped its
                 neighbor mid-drag (found by the lab's automated overlap
                 check, 27 Sept 2026). One line, always, keeps every row's
                 real height equal to what the drag math already assumes,
                 at any width. */}
              <span className="min-w-0 flex-1 truncate text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{row}</span>
              <span className="flex flex-none gap-[4px]" onPointerDown={(event) => event.stopPropagation()}>
                {/* 36px, not the original 30px -- a real repeatedly-tapped
                   control mid-simulation (mobile audit, 9 Sept 2026). */}
                <IconTip label="Move up">
                  <button type="button" onClick={() => move(index, -1)} disabled={locked || index === 0} aria-label={`Move ${row} up`} className="dm-quiet flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border disabled:opacity-30 md:h-[30px] md:w-[30px]" style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}>
                    <ChevronUp className="h-[16px] w-[16px]" aria-hidden />
                  </button>
                </IconTip>
                <IconTip label="Move down">
                  <button type="button" onClick={() => move(index, 1)} disabled={locked || index === rows.length - 1} aria-label={`Move ${row} down`} className="dm-quiet flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border disabled:opacity-30 md:h-[30px] md:w-[30px]" style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}>
                    <ChevronDown className="h-[16px] w-[16px]" aria-hidden />
                  </button>
                </IconTip>
              </span>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={locked}
        onClick={() => {
          setLocked(true);
          const right = rows.join("|") === beat.order.join("|");
          const placed = rows.filter((row, index) => row === beat.order[index]).length;
          // Partial credit (RN handoff): one adjacent swap leaves N-2 rows
          // in place -- "three of four in the right place" on a 4-row beat.
          const close = !right && Boolean(beat.whenClose) && placed >= beat.order.length - 2;
          if (right || close) playCorrect();
          else playWrong();
          if (right) onResolve("best", beat.whenRight);
          else if (close) onResolve("acceptable", beat.whenClose ?? beat.whenWrong);
          else onResolve("wrong", beat.whenWrong);
        }}
        className="dm-solid w-full cursor-pointer rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold disabled:opacity-50"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Submit rank
      </button>
      <GestureSpotlight active={hintOn && !locked} targetRef={firstRowRef} direction="up" label="Press & drag to reorder" hintSize={22} hintDistance={28} />
    </div>
  );
}

export function PickBody({ beat, onResolve, remaining }: { beat: PickBeat; onResolve: Resolve; remaining: number }) {
  // `chosen` indexes into THIS shuffled array, and submit reads roles off
  // the same array -- positions and roles can never disagree.
  const cards = useShuffled(beat.cards, beat.id);
  const [chosen, setChosen] = useState<number[]>([]);
  const settled = useRef(false);

  const submit = useCallback(
    (picks: number[]) => {
      if (settled.current) return;
      settled.current = true;
      const harmful = picks.some((index) => cards[index]?.role === "harmful");
      const right = !harmful && picks.length === beat.pick && picks.every((index) => cards[index]?.role === "pick");
      const tier: Tier = harmful ? "risky" : right ? "best" : "wrong";
      if (right) playCorrect();
      else playWrong();
      onResolve(tier, right ? beat.whenRight : harmful ? (beat.whenHarmful ?? beat.whenWrong) : beat.whenWrong);
    },
    [cards, beat.pick, beat.whenHarmful, beat.whenRight, beat.whenWrong, onResolve],
  );

  useEffect(() => {
    if (beat.timer && remaining <= 0) submit(chosen);
  }, [beat.timer, remaining, chosen, submit]);

  const full = chosen.length >= beat.pick;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <p className="text-[12.5px] font-bold" style={{ color: full ? "var(--color-feedback-success)" : "var(--muted-foreground)" }}>
        {chosen.length} of {beat.pick} chosen
      </p>
      <ul className="m-0 flex list-none flex-col gap-[7px] p-0">
        {cards.map((card, index) => {
          const on = chosen.includes(index);
          return (
            <li key={card.label}>
              <button
                type="button"
                onClick={() => {
                  if (on) {
                    setChosen((current) => current.filter((i) => i !== index));
                    return;
                  }
                  if (full) return;
                  playSelect();
                  setChosen((current) => [...current, index]);
                }}
                aria-pressed={on}
                aria-disabled={!on && full}
                className={`flex w-full items-center gap-[10px] rounded-[12px] border-2 px-[12px] py-[11px] text-left text-[14.5px] font-semibold transition-[border-color,background,opacity] duration-150 motion-safe:animate-[fade-slide-up_0.3s_ease-out_both] ${
                  !on && full ? "cursor-not-allowed opacity-45" : "cursor-pointer"
                }`}
                style={{
                  animationDelay: `${index * 40}ms`,
                  background: on ? "color-mix(in srgb, var(--primary) 20%, var(--glass-surface-1))" : "var(--glass-surface-1)",
                  borderColor: on ? "var(--primary)" : "var(--color-glass-border-raised)",
                  color: "var(--foreground)",
                }}
              >
                <span
                  aria-hidden
                  className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-2"
                  style={{ borderColor: on ? "var(--primary)" : "var(--color-glass-border-raised)", background: on ? "var(--primary)" : "transparent", color: "#05070f" }}
                >
                  {on ? <Check className="h-[13px] w-[13px]" /> : null}
                </span>
                {card.label}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        disabled={!full}
        onClick={() => submit(chosen)}
        className="dm-solid w-full cursor-pointer rounded-[var(--radius-md)] px-[18px] py-[13px] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-45"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Submit
      </button>
    </div>
  );
}

/** Two-Bucket Sort. One item at a time, two buttons, and it passes at three
 *  quarters of the items rounded up -- the universal rule for any beat made of
 *  sub-items. */
export function BucketBody({ beat, onResolve }: { beat: BucketBeat; onResolve: Resolve }) {
  const [at, setAt] = useState(0);
  const [right, setRight] = useState(0);
  const [flash, setFlash] = useState<0 | 1 | null>(null);
  const settled = useRef(false);
  const need = passThreshold(beat.items.length);
  const item = beat.items[at];

  const put = useCallback((into: 0 | 1) => {
    if (flash !== null || !item) return;
    const ok = item.into === into;
    if (ok) playCorrect();
    else playWrong();
    setFlash(into);
    const score = ok ? right + 1 : right;
    window.setTimeout(
      () => {
        setRight(score);
        setFlash(null);
        if (at + 1 < beat.items.length) {
          setAt(at + 1);
          return;
        }
        if (settled.current) return;
        settled.current = true;
        playSweep();
        const pass = score >= need;
        onResolve(pass ? "best" : "wrong", pass ? beat.whenRight : beat.whenWrong);
      },
      ok ? 420 : 900,
    );
  }, [flash, item, right, at, beat.items.length, need, beat.whenRight, beat.whenWrong, onResolve]);

  const pickByKey = useCallback((index: number) => put(index === 0 ? 0 : 1), [put]);
  useDigitKeys(2, pickByKey, flash === null);

  if (!item) return null;
  const correctBucket = item.into;

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <span className="flex items-center gap-[5px]" aria-label={`Item ${at + 1} of ${beat.items.length}`}>
          {beat.items.map((entry, index) => (
            <span
              key={entry.label}
              className="h-[6px] rounded-full transition-[width,background] duration-300"
              style={{ width: index === at ? 22 : 6, background: index < at ? "var(--color-feedback-success)" : index === at ? "var(--foreground)" : "var(--color-glass-border-raised)" }}
            />
          ))}
        </span>
        <span className="text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>{need} of {beat.items.length} to pass</span>
      </div>
      <p
        className="rounded-[var(--radius-lg)] border-2 px-[14px] py-[16px] text-[16px] leading-[23px] font-bold motion-safe:animate-[play-pop_0.36s_cubic-bezier(0.34,1.56,0.64,1)]"
        key={item.label}
        style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}
      >
        {item.label}
      </p>
      <div className="flex gap-[8px]">
        {beat.buckets.map((bucket, index) => {
          const side = index as 0 | 1;
          const lit = flash === side;
          const ok = lit && side === correctBucket;
          return (
            <button
              key={bucket}
              type="button"
              onClick={() => put(side)}
              disabled={flash !== null}
              className={`flex-1 cursor-pointer rounded-[var(--radius-md)] border-2 px-[12px] py-[14px] text-[14.5px] font-extrabold transition-[border-color,background] duration-150 disabled:cursor-default ${
                lit && !ok ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""
              }`}
              style={{
                background: lit
                  ? `color-mix(in srgb, ${ok ? "var(--color-feedback-success)" : "var(--destructive)"} 22%, var(--glass-surface-1))`
                  : "var(--glass-surface-1)",
                borderColor: lit ? (ok ? "var(--color-feedback-success)" : "var(--destructive)") : "var(--color-glass-border-raised)",
                color: "var(--foreground)",
              }}
            >
              {bucket}
            </button>
          );
        })}
      </div>
    </div>
  );
}
