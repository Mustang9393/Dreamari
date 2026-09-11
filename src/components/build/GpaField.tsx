"use client";

import { useEffect, useRef } from "react";
import { useConfirmGlow } from "./confirmPulse";
import { playGpaTick } from "./sound";
import { GPA_BELOW, GPA_HIGHER, GPA_NOT_USED, GPA_SCALE } from "./types";

// A gradual gradient (direct feedback, 11 Sept 2026: "blue to yellow...
// too far apart and not gradual") -- brand blue into the app's own violet
// accent, adjacent hues rather than opposite ones, the same pairing the
// marketing page's own headline gradient uses.
const ACCENT = "var(--color-accent-purple)";
const SPECIALS: readonly string[] = [GPA_HIGHER, GPA_BELOW, GPA_NOT_USED];
// Where the thumb rests, muted, before the student has touched it or chosen
// a special answer -- the scale's midpoint, not an actual selection.
const RESTING_INDEX = Math.round((GPA_SCALE.length - 1) / 2);

/** Every tenth gets its own tick; height and brightness step up at the
 *  halves and again at the whole numbers, so the track reads as a fine
 *  ruler at a glance. This -- not a caption -- is what tells the student a
 *  whole number isn't precise enough (direct feedback, 11 Sept 2026: "show
 *  that decimals are a required accuracy... without causing clutter"). */
function tickWeight(scaleValue: string): "major" | "half" | "minor" {
  const n = Number(scaleValue);
  if (Number.isInteger(n)) return "major";
  if (Math.round(n * 10) % 5 === 0) return "half";
  return "minor";
}

/** GPA, to the decimal (direct feedback, 11 Sept 2026: "we want really
 *  accurate, to the decimal level"). A real <input type=range> covers all
 *  21 tenths from 2.0 to 4.0: drag or arrow keys land on an exact number,
 *  no typing and no long list to scan. A tick sounds each time the value
 *  crosses a tenth (playGpaTick, sound.ts), the pitch climbing gently with
 *  the value -- a dial's detent, not a chime. The live number floats
 *  directly over the thumb as a pill, not a caption elsewhere on the card
 *  (direct feedback, 11 Sept 2026: "the GPA updating is off to the side...
 *  the feedback is not proper") -- the answer sits exactly where the eye
 *  and the finger already are, and follows the drag. The three answers a
 *  single number can't hold -- below the scale, above it, "we don't grade
 *  that way" -- are chips underneath, under their own small "Or" (direct
 *  feedback, 11 Sept 2026: without it, three buttons under a slider read
 *  as a separate, confusing control rather than alternate answers to the
 *  same question). Picking one shows in that same pill, and the ruler
 *  goes quiet underneath it until the slider is touched again, which
 *  always wins back. */
export function GpaField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const numericIndex = GPA_SCALE.indexOf(value);
  const numeric = numericIndex !== -1;
  const special = SPECIALS.includes(value);
  const touched = numeric || special;
  const index = numeric ? numericIndex : RESTING_INDEX;
  const fraction = index / (GPA_SCALE.length - 1);
  // The slider's own chrome (fill, ticks, thumb) only lights up when IT is
  // the mechanism behind the current answer -- a chosen special leaves it
  // visibly parked, not pretending to still hold a position.
  const glowing = useConfirmGlow(numeric);
  const lastTickedIndex = useRef(index);
  useEffect(() => {
    lastTickedIndex.current = index;
  }, [index]);

  function handleSliderChange(next: number) {
    if (next !== lastTickedIndex.current) {
      playGpaTick(next, GPA_SCALE.length);
      lastTickedIndex.current = next;
    }
    onChange(GPA_SCALE[next]);
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold tracking-wide text-[var(--color-night-muted-foreground)]">GPA</p>

      {/* The one feedback surface: pinned over the thumb while it's a
         number, centered while it's a special answer, a plain prompt
         while nothing is chosen yet. */}
      <div className="relative h-[34px]">
        {touched ? (
          <span
            className="absolute top-0 flex -translate-x-1/2 items-center justify-center rounded-full border px-3.5 py-1 text-[19px] leading-[22px] font-extrabold whitespace-nowrap tabular-nums shadow-[0_10px_22px_-8px_rgba(0,0,0,0.6)] transition-[left] duration-150"
            style={{
              left: numeric ? `clamp(34px, ${fraction * 100}%, calc(100% - 34px))` : "50%",
              background: "var(--color-night-card, #12142a)",
              borderColor: numeric ? ACCENT : "var(--color-glass-stroke)",
              color: "var(--color-night-foreground)",
            }}
          >
            {numeric ? GPA_SCALE[index] : value}
          </span>
        ) : (
          <span className="absolute top-[3px] left-1/2 -translate-x-1/2 text-[13px] font-semibold whitespace-nowrap" style={{ color: "var(--color-night-muted-foreground)" }}>
            Drag to set your exact GPA
          </span>
        )}
      </div>

      <div className="relative mt-2 mb-2 h-8">
        {/* Track base, a touch deeper-set than before. */}
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full" style={{ background: "var(--color-glass-surface-2)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.35)" }} />
        <div
          className="absolute top-1/2 left-0 h-2.5 -translate-y-1/2 rounded-full transition-[width] duration-200"
          style={{
            width: numeric ? `${fraction * 100}%` : "0%",
            background: `linear-gradient(90deg, var(--color-brand-500), ${ACCENT})`,
            boxShadow: numeric ? `0 0 14px 0 color-mix(in srgb, ${ACCENT} 45%, transparent)` : "none",
          }}
        />
        {/* The ruler: one tick per tenth. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
          {GPA_SCALE.map((scaleValue, i) => {
            const weight = tickWeight(scaleValue);
            const at = (i / (GPA_SCALE.length - 1)) * 100;
            const lit = numeric && i <= index;
            const height = weight === "major" ? 13 : weight === "half" ? 9 : 4;
            return (
              <span
                key={scaleValue}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  left: `${at}%`,
                  top: "50%",
                  width: weight === "minor" ? 1.5 : 2,
                  height,
                  background: lit ? ACCENT : weight === "minor" ? "color-mix(in srgb, var(--color-glass-stroke) 65%, transparent)" : "var(--color-glass-stroke)",
                  opacity: lit ? 1 : weight === "minor" ? 0.6 : 0.9,
                }}
              />
            );
          })}
        </div>
        {/* The real control, visually replaced by the custom thumb below. */}
        <input
          type="range"
          min={0}
          max={GPA_SCALE.length - 1}
          step={1}
          value={index}
          aria-label="GPA"
          aria-valuetext={numeric ? `${GPA_SCALE[index]} GPA` : "Not set"}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-150 ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
          style={{
            left: `${fraction * 100}%`,
            background: numeric ? "var(--color-night-foreground)" : "color-mix(in srgb, var(--color-night-foreground) 55%, transparent)",
            borderColor: numeric ? ACCENT : "var(--color-glass-stroke)",
            boxShadow: glowing
              ? `0 0 0 9px color-mix(in srgb, ${ACCENT} 38%, transparent), 0 4px 12px rgba(0,0,0,0.4)`
              : numeric
                ? `0 0 0 6px color-mix(in srgb, ${ACCENT} 22%, transparent), 0 4px 12px rgba(0,0,0,0.4)`
                : "0 4px 12px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[10.5px] font-semibold opacity-70" style={{ color: "var(--color-night-muted-foreground)" }} aria-hidden>
        <span>2.0</span>
        <span>3.0</span>
        <span>4.0</span>
      </div>

      {/* A one-word bridge (direct feedback, 11 Sept 2026: do the chips read
         as part of this same question, or as a separate, confusing thing?)
         -- without it, three buttons appearing under a slider with no
         connective copy read as their own unrelated control. */}
      <p className="mt-3 mb-1.5 text-center text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: "var(--color-night-muted-foreground)" }}>
        Or
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {SPECIALS.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option)}
              className="cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors"
              style={{
                background: isSelected ? ACCENT : "var(--color-glass-surface-2)",
                borderColor: isSelected ? ACCENT : "var(--color-glass-stroke)",
                color: isSelected ? "#ffffff" : "var(--color-night-muted-foreground)",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
