"use client";

import { useConfirmGlow } from "./confirmPulse";
import { GPA_BELOW, GPA_HIGHER, GPA_NOT_USED, GPA_SCALE } from "./types";

const AMBER = "var(--color-world-business-money-office)";
const SPECIALS: readonly string[] = [GPA_HIGHER, GPA_BELOW, GPA_NOT_USED];
// Where the thumb rests, muted, before the student has touched it or chosen
// a special answer -- the scale's midpoint, not an actual selection.
const RESTING_INDEX = Math.round((GPA_SCALE.length - 1) / 2);

/** GPA, to the decimal (direct feedback, 11 Sept 2026: "we want really
 *  accurate, to the decimal level" -- a band like "3.5 to 3.9" was only ever
 *  a rough proxy for the school-matching math). A real <input type=range>
 *  covers all 21 tenths from 2.0 to 4.0: drag or arrow keys land on an
 *  exact number, no typing and no 24-row list to scan (the "long ass
 *  dropdown" this replaces, direct feedback, 11 Sept 2026). The three
 *  answers a single number can't hold -- below the scale, above it, "we
 *  don't grade that way" -- are chips underneath, not slider stops; picking
 *  one shows in the readout exactly like a dragged number would, and
 *  moving the slider again always wins. Same visual language as CostStep's
 *  tuition slider: gradient fill, glowing thumb, a real range input under
 *  custom paint (keyboard and screen-reader support for free). No outer
 *  bordered panel of its own -- this sits inside Profile Basics' existing
 *  card as one more field, not a second nested box. */
export function GpaField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const numericIndex = GPA_SCALE.indexOf(value);
  const numeric = numericIndex !== -1;
  const special = SPECIALS.includes(value);
  const touched = numeric || special;
  const index = numeric ? numericIndex : RESTING_INDEX;
  const fraction = index / (GPA_SCALE.length - 1);
  const glowing = useConfirmGlow(touched);
  const readout = numeric ? GPA_SCALE[index] : special ? value : "Drag to set your GPA";

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold tracking-wide text-[var(--color-night-muted-foreground)]">GPA</p>
      <p className="text-[17px] font-extrabold transition-colors" style={{ color: touched ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)" }}>
        {readout}
      </p>

      <div className="relative mt-3 mb-2 h-8">
        {/* Track base + gradient fill up to the thumb (only a real
           selection lights the glow, not the resting midpoint). */}
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ background: "var(--color-glass-surface-2)" }} />
        <div
          className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full transition-[width] duration-200"
          style={{
            width: `${fraction * 100}%`,
            background: `linear-gradient(90deg, var(--color-brand-500), ${AMBER})`,
            boxShadow: numeric ? `0 0 14px 0 color-mix(in srgb, ${AMBER} 45%, transparent)` : "none",
          }}
        />
        {/* Labeled ticks only at the whole numbers -- 21 dots for every
           tenth would read as noise at this width; the number row below
           carries the same three positions. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
          {[2, 3, 4].map((whole) => {
            const i = GPA_SCALE.indexOf(whole.toFixed(1));
            const at = (i / (GPA_SCALE.length - 1)) * 100;
            return (
              <span
                key={whole}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200"
                style={{ left: `${at}%`, top: "50%", background: numeric && index >= i ? AMBER : "var(--color-glass-stroke)" }}
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
          onChange={(e) => onChange(GPA_SCALE[Number(e.target.value)])}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-200 ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
          style={{
            left: `${fraction * 100}%`,
            background: touched ? "var(--color-night-foreground)" : "color-mix(in srgb, var(--color-night-foreground) 70%, transparent)",
            borderColor: numeric ? AMBER : "var(--color-glass-stroke)",
            boxShadow: glowing
              ? `0 0 0 9px color-mix(in srgb, ${AMBER} 38%, transparent), 0 4px 12px rgba(0,0,0,0.4)`
              : numeric
                ? `0 0 0 6px color-mix(in srgb, ${AMBER} 22%, transparent), 0 4px 12px rgba(0,0,0,0.4)`
                : "0 4px 12px rgba(0,0,0,0.4)",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-[10.5px] font-semibold opacity-70" style={{ color: "var(--color-night-muted-foreground)" }} aria-hidden>
        <span>2.0</span>
        <span>3.0</span>
        <span>4.0</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
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
                background: isSelected ? AMBER : "var(--color-glass-surface-2)",
                borderColor: isSelected ? AMBER : "var(--color-glass-stroke)",
                color: isSelected ? "#1a1200" : "var(--color-night-muted-foreground)",
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
