"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, FileText, Trophy, X } from "lucide-react";

import { BANDS, TIER_COLOR, passThreshold } from "./scoring";
import { playCorrect, playSelect, playSweep, playWrong } from "./sound";
import type { CardBeat, ChoiceBeat, MatchBeat, RapidBeat, Tier } from "./types";

// The interaction bodies. Each one owns its own rules from the Interaction
// Rules tab and reports a single result upward: one tier, and the line that
// explains THAT answer. Nothing here knows about reputation or navigation.

/** id is the picked option, so the shell can show which one locked. */
export type Resolve = (tier: Tier, why: string, id?: string) => void;

// ---------------------------------------------------------------- typewriter

/** Reveals text a character at a time, like a dialogue box should. The count is
 *  derived from ELAPSED TIME, not from how many ticks fired: counting ticks
 *  drifted against React's commits and stalled halfway through a long line.
 *  Mounted fresh per beat (the stage is keyed), so there is no reset to do. */
export function useTypewriter(text: string, speed = 12) {
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
      className={`group flex w-full cursor-pointer items-center gap-[12px] rounded-[14px] border px-[14px] py-[12px] text-left text-[15px] leading-snug font-semibold transition-[transform,border-color,background,opacity] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:transition-none ${
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
        className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border text-[12px] font-extrabold"
        style={{
          borderColor: mark ? paint : "var(--color-glass-border-raised)",
          background: mark ? paint : "transparent",
          color: mark ? "#05070f" : "var(--muted-foreground)",
        }}
      >
        {mark === "wrong" ? <X className="h-[15px] w-[15px]" /> : mark ? <Check className="h-[15px] w-[15px]" /> : String.fromCharCode(65 + index)}
      </span>
      {label}
    </button>
  );
}

/** The HEADING of a beat. Has to stay clearly above the situation text, which
 *  is now bold itself. */
function Question({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[21px] leading-[1.16] font-extrabold sm:text-[25px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
      {children}
    </p>
  );
}

// ------------------------------------------------------------------ the card

export function CardBody({ beat, onNext, reputation }: { beat: CardBeat; onNext: () => void; reputation: number }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
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
      {beat.showBands && <BandLadder reputation={reputation} />}
      <button
        type="button"
        onClick={() => {
          playSelect();
          onNext();
        }}
        className="dm-solid mt-[var(--space-1)] w-full cursor-pointer rounded-full px-[18px] py-[13px] text-[16px] font-extrabold"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      >
        {beat.cta}
      </button>
    </div>
  );
}

function BandLadder({ reputation }: { reputation: number }) {
  return (
    <ul className="flex list-none flex-col gap-[5px] p-0">
      {[...BANDS].reverse().map((band) => {
        const here = reputation >= band.min && reputation <= band.max;
        return (
          <li
            key={band.name}
            className="flex items-center justify-between rounded-[10px] border px-[11px] py-[8px] text-[13px] font-bold"
            style={{
              background: here ? "var(--glass-surface-2)" : "transparent",
              borderColor: here ? "var(--color-glass-border-raised)" : "transparent",
              color: here ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            <span>{band.name}</span>
            <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>
              {band.max === 100 ? `${band.min}+` : `${band.min} to ${band.max}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ----------------------------------------------------------- choice: options

export function ChoiceBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  if (beat.layout === "blank") return <BlankBody beat={beat} onResolve={onResolve} locked={locked} />;
  if (beat.layout === "document") return <DocumentBody beat={beat} onResolve={onResolve} locked={locked} />;
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="flex flex-col gap-[8px]">
        {beat.choices.map((choice, index) => (
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

/** Fill in the Blank: the sentence keeps its shape and the blank fills in. */
function BlankBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  const chosen = beat.choices.find((choice) => choice.id === locked);
  const [before, after] = beat.question.split("___");
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>
        {before}
        <span
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
      <div className="flex flex-wrap gap-[8px]">
        {beat.choices.map((choice, index) => (
          <button
            key={choice.id}
            type="button"
            disabled={locked !== null}
            onClick={() => { tierSound(choice.tier); onResolve(choice.tier, choice.why, choice.id); }}
            className="cursor-pointer rounded-full border px-[15px] py-[10px] text-[15px] font-bold transition-[transform,border-color,opacity] duration-200 disabled:cursor-default motion-safe:animate-[fade-slide-up_0.34s_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:transition-none"
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
          </button>
        ))}
      </div>
    </div>
  );
}

/** Catch the Mistake: a document window, one line per row. */
function DocumentBody({ beat, onResolve, locked }: { beat: ChoiceBeat; onResolve: Resolve; locked: string | null }) {
  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <Question>{beat.question}</Question>
      <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: "var(--color-glass-border-raised)" }}>
        <p
          className="flex items-center gap-[7px] px-[12px] py-[8px] text-[12px] font-bold tracking-[0.04em]"
          style={{ background: "var(--glass-surface-3)", color: "var(--muted-foreground)" }}
        >
          <FileText className="h-[14px] w-[14px]" aria-hidden />
          Nike Deal • Intern Summary
        </p>
        <ul className="m-0 flex list-none flex-col p-0">
          {beat.choices.map((choice, index) => (
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
        {beat.choices.map((choice, index) => (
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
      className={`flex min-h-[52px] w-full items-center rounded-[14px] border-2 px-[11px] py-[10px] text-left leading-snug transition-[background,border-color,transform,opacity] duration-150 disabled:cursor-default ${
        strong ? "text-[15px] font-extrabold" : "text-[13.5px] font-semibold"
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
  // remaining questions are simply never answered, which is the rule.
  useEffect(() => {
    if (remaining <= 0) finish(right);
  }, [remaining, right, finish]);

  const item = beat.items[step];
  if (!item) return null;

  function pick(index: number) {
    if (picked !== null) return;
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
  }

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
