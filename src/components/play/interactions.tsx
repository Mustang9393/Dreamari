"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, ChevronRight, ChevronUp, Eye, FileText, Flag, GripVertical, Trophy, X } from "lucide-react";

import { GestureSpotlight, useFirstUseHint } from "@/components/flow/GestureSpotlight";
import { BANDS, TIER_COLOR, passThreshold } from "./scoring";
import { playCorrect, playSelect, playSweep, playWrong } from "./sound";
import type {
  BucketBeat,
  CardBeat,
  ChainBeat,
  CheckBeat,
  ChoiceBeat,
  FlagsBeat,
  FlipsBeat,
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
export function useTypewriter(text: string, speed = 26) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const chars = reduced ? text.length : Math.floor((Date.now() - started) / speed);
      setShown(Math.min(text.length, chars));
      if (chars >= text.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [text, speed]);

  return {
    visible: text.slice(0, shown),
    done: shown >= text.length,
    skip: () => setShown(text.length),
  };
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
export function Keycap({ children, tint }: { children: string; tint: string }) {
  return (
    <span
      aria-hidden
      className="ml-[2px] hidden h-[19px] min-w-[19px] items-center justify-center rounded-[5px] border px-[4px] text-[11px] leading-none font-bold [@media(hover:hover)_and_(pointer:fine)]:inline-flex"
      style={{ borderColor: tint, color: tint, opacity: 0.72 }}
    >
      {children}
    </span>
  );
}

// -------------------------------------------------------------- shared parts

/** Every pick in the game gets the same treatment -- the chosen tile colours to
 *  its tier, a bad one shakes, a sound fires. A game where only the matching
 *  screen reacts feels broken on the other nine. */
function tierSound(tier: Tier) {
  if (tier === "best" || tier === "acceptable") playCorrect();
  else if (tier === "wrong" || tier === "risky") playWrong();
  else playSelect();
}

function OptionButton({
  label,
  index,
  disabled,
  picked,
  tier,
  dimmed,
  revealed,
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
      className={`group flex w-full cursor-pointer items-center gap-[14px] rounded-[16px] border px-[18px] py-[16px] text-left text-[16px] leading-snug font-semibold transition-[transform,border-color,background,opacity] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:transition-none sm:text-[17px] ${
        bad ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""
      } ${mark === "answer" ? "motion-safe:animate-[play-pop_0.44s_cubic-bezier(0.34,1.56,0.64,1)]" : ""}`}
      style={{
        animationDelay: `${index * 55}ms`,
        background: mark ? `color-mix(in srgb, ${paint} 18%, var(--glass-surface-1))` : "var(--glass-surface-1)",
        borderColor: mark ? paint : "var(--color-glass-border-raised)",
        color: "var(--foreground)",
        opacity: dimmed && !mark ? 0.4 : 1,
      }}
    >
      <span
        aria-hidden
        className="flex h-[29px] w-[29px] flex-none items-center justify-center rounded-full border text-[13px] font-extrabold"
        style={{
          borderColor: mark ? paint : "var(--color-glass-border-raised)",
          background: mark ? paint : "transparent",
          color: mark ? "#05070f" : "var(--muted-foreground)",
        }}
      >
        {mark === "wrong" ? <X className="h-[15px] w-[15px]" /> : mark ? <Check className="h-[15px] w-[15px]" /> : index + 1}
      </span>
      {label}
    </button>
  );
}

/** The HEADING of a beat. Has to stay clearly above the situation text, which
 *  is now bold itself. */
// Subheading tier: what the speaker says (DialogueBox's own text) is the
// title, sized above this; the answers below are body text, sized under it.
function Question({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[18px] leading-[1.25] font-extrabold sm:text-[21px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
      {children}
    </p>
  );
}

// ------------------------------------------------------------------ the card

export function CardBody({ beat, onNext, accent = "var(--world-business-money-office)" }: { beat: CardBeat; onNext: () => void; accent?: string }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
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
      <Question>{beat.title}</Question>
      {beat.body && (
        <p className="text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {beat.body}
        </p>
      )}
      {beat.example && (
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
        <dl className="m-0 grid grid-cols-3 gap-[7px]">
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
      <button
        type="button"
        onClick={() => {
          playSelect();
          onNext();
        }}
        className="dm-solid mt-[var(--space-1)] flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        {beat.cta}
        <Keycap tint="var(--primary-foreground)">⏎</Keycap>
      </button>
    </div>
  );
}

// Shown once, on the "Your Reputation" explainer before the level starts --
// a reference table of the rules, not a readout of where the player stands
// (reputation is still the untouched baseline here, which happens to fall
// inside "Cautious" -- highlighting it as a "current" band read as if the
// player had already earned that standing before making a single choice).
function BandLadder() {
  return (
    <ul className="flex list-none flex-col gap-[5px] p-0">
      {[...BANDS].reverse().map((band) => (
        <li key={band.name} className="flex items-center justify-between rounded-[10px] border px-[11px] py-[8px] text-[13px] font-bold" style={{ borderColor: "transparent", color: "var(--muted-foreground)" }}>
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
            {rung.lit && rung.label.startsWith("You") && (
              <span className="rounded-full px-[8px] py-[1px] text-[9.5px] font-extrabold tracking-[0.1em] uppercase" style={{ background: `color-mix(in srgb, ${gold} 22%, transparent)`, color: gold }}>
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
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
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
              className={`flex w-full cursor-pointer items-center gap-[12px] rounded-[16px] border px-[18px] py-[15px] text-left text-[16px] font-semibold transition-[border-color,background,opacity] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] sm:text-[17px] ${missed.has(index) ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""}`}
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
              className="w-full rounded-[14px] border-2 bg-transparent px-[16px] py-[14px] text-center text-[24px] font-extrabold tabular-nums outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
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
            <button type="button" onClick={submitTyped} className="dm-solid flex w-full cursor-pointer items-center justify-center rounded-full px-[18px] py-[13px] text-[16px] font-extrabold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
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
          <div className="flex justify-center rounded-[14px] border border-dashed py-[10px]" style={{ borderColor: "var(--color-glass-border-raised)" }}>
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
                aria-label="Drag this token onto an answer"
              >
                Drag
              </motion.button>
            )}
          </div>
          <div className="flex flex-col gap-[8px] sm:grid sm:grid-cols-3">
            {options.map((option, index) => (
              <div
                key={option.label}
                ref={(el) => { cardRefs.current[index] = el; }}
                className={`flex flex-col gap-[4px] rounded-[16px] border px-[16px] py-[13px] text-[15.5px] font-semibold transition-[border-color,background,transform,opacity] duration-150 sm:text-[16px] ${missed.has(index) ? "motion-safe:animate-[play-shake_0.42s_ease-in-out]" : ""} ${solved && option.correct ? "motion-safe:animate-[play-pop_0.44s_cubic-bezier(0.34,1.56,0.64,1)]" : ""}`}
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
              </div>
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
            className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold motion-safe:animate-[fade-slide-up_0.34s_ease-out_both]"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {beat.cta}
            <Keycap tint="var(--primary-foreground)">⏎</Keycap>
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
              className="flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[16px] border px-[16px] py-[14px] text-left text-[15px] font-semibold transition-[border-color,background] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] sm:text-[16px]"
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold motion-safe:animate-[fade-slide-up_0.34s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {beat.cta}
          <Keycap tint="var(--primary-foreground)">⏎</Keycap>
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
    playSelect();
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
          className="flex w-full cursor-pointer flex-col items-center gap-[10px] rounded-[18px] border px-[20px] py-[26px] text-center disabled:cursor-default sm:py-[34px]"
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
          className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-full px-[18px] py-[13px] text-[16px] font-extrabold motion-safe:animate-[fade-slide-up_0.34s_ease-out_both]"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {beat.cta}
          <Keycap tint="var(--primary-foreground)">⏎</Keycap>
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------- choice: options

export function ChoiceBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
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
            onClick={() => { tierSound(choice.tier); onResolve(choice.tier, choice.why, choice.id); }}
          />
        ))}
      </div>
    </div>
  );
}

/** Drag to Blank (Interaction Rules): the sentence keeps its shape, the
 *  word tiles sit on a rail below, and a tile is DRAGGED into the slot
 *  rather than tapped (D75 -- a drag costs a deliberate second and feels
 *  like a game rather than a quiz). One attempt on a scored beat, same as
 *  every other scored interaction: whichever tile lands in the slot
 *  commits. Number keys still commit directly (ChoiceBody's useDigitKeys),
 *  so the keyboard path stays one press. */
function BlankBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  const choices = useShuffled(beat.choices, beat.id);
  const chosen = beat.choices.find((choice) => choice.id === locked);
  const [before, after] = beat.question.split("___");
  const slotRef = useRef<HTMLSpanElement>(null);
  const firstTileRef = useRef<HTMLButtonElement>(null);
  // The tiles are drag-only -- tapping does nothing -- with no visual cue
  // beyond a cursor-grab style that's invisible on touch. First encounter
  // only (see useFirstUseHint), and dismissed the moment a drag starts.
  const [hintOn, dismissHint] = useFirstUseHint("blank-drag");
  const dropTile = (choice: ChoiceBeat["choices"][number], x: number, y: number) => {
    if (locked !== null) return;
    const rect = slotRef.current?.getBoundingClientRect();
    if (!rect) return;
    // A forgiving halo around the slot -- a drop just shy of a small inline
    // target should not read as a miss (a real miss springs the tile back).
    const pad = 26;
    if (x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad) {
      tierSound(choice.tier);
      onResolve(choice.tier, choice.why, choice.id);
    }
  };
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>
        {before}
        <span
          ref={slotRef}
          className="mx-[3px] inline-block min-w-[104px] rounded-[8px] border-2 border-dashed px-[9px] text-center align-baseline transition-colors duration-200"
          style={{
            borderColor: chosen ? TIER_COLOR[chosen.tier] : "var(--color-glass-border-raised)",
            color: chosen ? "var(--foreground)" : "transparent",
            borderStyle: chosen ? "solid" : "dashed",
          }}
        >
          {chosen ? chosen.label : " "}
        </span>
        {after}
      </Question>
      <div className={beat.layout === "tiles" ? "grid grid-cols-2 gap-[8px]" : "flex flex-wrap gap-[8px]"}>
        {choices.map((choice, index) => (
          <motion.button
            key={choice.id}
            ref={index === 0 ? firstTileRef : undefined}
            type="button"
            disabled={locked !== null}
            drag={locked === null}
            dragSnapToOrigin
            dragMomentum={false}
            whileDrag={{ scale: 1.08, zIndex: 30 }}
            onDragStart={dismissHint}
            onDragEnd={(event) => {
              const pointer = event as PointerEvent;
              dropTile(choice, pointer.clientX, pointer.clientY);
            }}
            className="relative cursor-grab touch-none rounded-full border px-[18px] py-[15px] text-[16px] font-bold transition-[border-color,opacity] duration-200 select-none active:cursor-grabbing disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:transition-none sm:text-[17px]"
            style={{
              animationDelay: `${index * 55}ms`,
              background:
                locked === choice.id
                  ? `color-mix(in srgb, ${TIER_COLOR[choice.tier]} 20%, var(--glass-surface-1))`
                  : locked !== null && choice.tier === "best"
                    ? "color-mix(in srgb, var(--color-feedback-success) 20%, var(--glass-surface-1))"
                    : "var(--glass-surface-1)",
              borderColor:
                locked === choice.id
                  ? TIER_COLOR[choice.tier]
                  : locked !== null && choice.tier === "best"
                    ? "var(--color-feedback-success)"
                    : "var(--color-glass-border-raised)",
              color: "var(--foreground)",
              opacity: locked !== null && locked !== choice.id && choice.tier !== "best" ? 0.4 : 1,
            }}
          >
            {choice.label}
          </motion.button>
        ))}
      </div>
      <GestureSpotlight active={hintOn && locked === null} targetRef={firstTileRef} direction="up" label="Drag into the blank" onDismiss={dismissHint} hintSize={22} hintDistance={28} />
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
        className="flex h-[52px] w-[52px] items-center justify-center rounded-[16px]"
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
      className={`flex min-h-[58px] w-full items-center rounded-[16px] border-2 px-[14px] py-[13px] text-left leading-snug transition-[background,border-color,transform,opacity] duration-150 disabled:cursor-default ${
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
export function RapidBody({ beat, onResolve, remaining }: { beat: RapidBeat; onResolve: Resolve; remaining: number }) {
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
  }, [picked, item, right, step, beat.items.length, finish]);

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
          {built.join(" ")}
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
      <div className="rounded-[14px] border px-[14px] pt-[16px] pb-[12px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--color-glass-border-raised)" }}>
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
        className="dm-solid w-full cursor-pointer rounded-full px-[18px] py-[13px] text-[16px] font-extrabold disabled:opacity-50"
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
        className="dm-solid w-full cursor-pointer rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
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
    setDrag((current) => {
      if (current) {
        const to = Math.max(0, Math.min(rows.length - 1, current.index + Math.round(current.dy / current.height)));
        if (to !== current.index) {
          playSelect();
          setRows((list) => reorder(list, current.index, to));
        }
      }
      return null;
    });
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
              <span className="min-w-0 flex-1 text-[14.5px] font-bold" style={{ color: "var(--foreground)" }}>{row}</span>
              <span className="flex flex-none gap-[4px]" onPointerDown={(event) => event.stopPropagation()}>
                <button type="button" onClick={() => move(index, -1)} disabled={locked || index === 0} aria-label={`Move ${row} up`} className="dm-quiet flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[9px] border disabled:opacity-30" style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}>
                  <ChevronUp className="h-[16px] w-[16px]" aria-hidden />
                </button>
                <button type="button" onClick={() => move(index, 1)} disabled={locked || index === rows.length - 1} aria-label={`Move ${row} down`} className="dm-quiet flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[9px] border disabled:opacity-30" style={{ borderColor: "var(--color-glass-border-raised)", color: "var(--foreground)" }}>
                  <ChevronDown className="h-[16px] w-[16px]" aria-hidden />
                </button>
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
        className="dm-solid w-full cursor-pointer rounded-full px-[18px] py-[13px] text-[16px] font-extrabold disabled:opacity-50"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        Submit rank
      </button>
      <GestureSpotlight active={hintOn && !locked} targetRef={firstRowRef} direction="up" label="Press & drag to reorder" onDismiss={dismissHint} hintSize={22} hintDistance={28} />
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
        className="dm-solid w-full cursor-pointer rounded-full px-[18px] py-[13px] text-[16px] font-extrabold disabled:cursor-not-allowed disabled:opacity-45"
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
        className="rounded-[14px] border-2 px-[14px] py-[16px] text-[16px] leading-[23px] font-bold motion-safe:animate-[play-pop_0.36s_cubic-bezier(0.34,1.56,0.64,1)]"
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
              className={`flex-1 cursor-pointer rounded-[14px] border-2 px-[12px] py-[14px] text-[14.5px] font-extrabold transition-[border-color,background] duration-150 disabled:cursor-default ${
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
