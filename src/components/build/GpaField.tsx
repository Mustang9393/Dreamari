"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useConfirmGlow } from "./confirmPulse";
import { playGpaTick } from "./sound";
import { GPA_BELOW, GPA_HIGHER, GPA_NOT_USED, GPA_SCALE } from "./types";

// A gradual gradient (direct feedback, 11 Sept 2026: "blue to yellow...
// too far apart and not gradual") -- brand blue into the app's own violet
// accent, adjacent hues rather than opposite ones, the same pairing the
// marketing page's own headline gradient uses.
const ACCENT = "var(--color-accent-purple)";
const ACCENT_DEEP = `color-mix(in srgb, ${ACCENT} 65%, black)`;
const FILL_GRADIENT = `linear-gradient(90deg, var(--color-brand-500) 0%, ${ACCENT} 60%, ${ACCENT_DEEP} 100%)`;
// Ticks that fall on the coloured fill were painted the same colour as the
// fill itself and vanished into it; a bright, near-white mark reads clearly
// across the whole gradient, blue end to deep-purple end alike.
const TICK_ON_FILL = "rgba(255,255,255,0.92)";

const LAST_INDEX = GPA_SCALE.length - 1;
// Where the thumb rests, muted, before the student has touched it -- the
// scale's midpoint, not an actual selection.
const RESTING_INDEX = Math.round(LAST_INDEX / 2);
// One inset, shared by the track, its ticks and the end labels below it --
// just enough for the thumb's small ring, nothing like the wide margin a
// floating value pill used to need (that pill is gone; see below).
const INSET = "px-4";

/** The scale's two ends ARE "2.0 or below" and "4.0 or higher" -- so make
 *  them the end points, literally. Everywhere in between is the exact
 *  tenth. Only "My school does not use GPA" stays outside the scale -- it
 *  opts out of the whole question rather than sitting on it. */
function labelForIndex(i: number): string {
  if (i === 0) return GPA_BELOW;
  if (i === LAST_INDEX) return GPA_HIGHER;
  return GPA_SCALE[i];
}

/** Resolves ANY stored answer -- a stop's own label, or (for a value saved
 *  before this change) the raw "2.0"/"4.0" -- back to its index; null for
 *  "does not use GPA" or nothing chosen yet. */
function indexForValue(value: string): number | null {
  if (value === GPA_BELOW) return 0;
  if (value === GPA_HIGHER) return LAST_INDEX;
  const i = GPA_SCALE.indexOf(value);
  return i === -1 ? null : i;
}

/** Every tenth gets its own tick; height steps up at the halves and again
 *  at the whole numbers, so the track reads as a fine ruler at a glance.
 *  This -- not a caption -- is what tells the student a whole number isn't
 *  precise enough (direct feedback, 11 Sept 2026: "show that decimals are
 *  a required accuracy... without causing clutter"). */
function tickWeight(scaleValue: string): "major" | "half" | "minor" {
  const n = Number(scaleValue);
  if (Number.isInteger(n)) return "major";
  if (Math.round(n * 10) % 5 === 0) return "half";
  return "minor";
}

/** GPA, to the decimal (direct feedback, 11 Sept 2026: "we want really
 *  accurate, to the decimal level"). A real <input type=range> covers all
 *  21 stops from "2.0 or below" through the exact tenths to "4.0 or
 *  higher": drag or arrow keys land on an exact answer, no typing and no
 *  long list to scan. A tick sounds each time the value crosses a stop
 *  (playGpaTick, sound.ts).
 *
 *  Simplified (direct feedback, 11 Sept 2026: "reduce so much clutter" and
 *  repeated clipping at the card's edge): the value no longer floats in a
 *  pill that chases the thumb -- that pill needed a wide, ever-fussy edge
 *  reservation and was the whole source of the clipping. The answer now
 *  shows once, small and stable, right next to the "GPA" title. The
 *  thumb's own glow is a slim ring, not a wide spread, so a single small
 *  inset (INSET, shared by the track/ticks/end-labels) comfortably clears
 *  it with no reservation math at all. "My school does not use GPA" is a
 *  compact checkbox on the SAME title line; checking it dims and disables
 *  the scale below it. */
export function GpaField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const resolvedIndex = indexForValue(value);
  const onScale = resolvedIndex !== null;
  const notUsed = value === GPA_NOT_USED;
  const index = onScale ? resolvedIndex : RESTING_INDEX;
  const fraction = index / LAST_INDEX;
  // The slider's own chrome (fill, ticks, thumb) only lights up when IT is
  // the mechanism behind the current answer.
  const glowing = useConfirmGlow(onScale);
  const lastTickedIndex = useRef(index);
  useEffect(() => {
    lastTickedIndex.current = index;
  }, [index]);

  function handleSliderChange(next: number) {
    if (next !== lastTickedIndex.current) {
      playGpaTick(next, GPA_SCALE.length);
      lastTickedIndex.current = next;
    }
    onChange(labelForIndex(next));
  }

  return (
    <div>
      {/* Title row: "GPA", the current answer right beside it once there
         is one (bigger title, direct feedback, 11 Sept 2026), and the one
         opt-out on the same line, compact -- a checkbox, not a chip
         (direct feedback: "without the chip... in line with the GPA
         title"). */}
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-baseline gap-2 text-[15px] font-extrabold" style={{ color: "var(--color-night-foreground)" }}>
          GPA
          {onScale && <span style={{ color: ACCENT }}>{labelForIndex(index)}</span>}
        </p>
        <button
          type="button"
          role="checkbox"
          aria-checked={notUsed}
          onClick={() => onChange(notUsed ? "" : GPA_NOT_USED)}
          className="flex flex-none cursor-pointer items-center gap-1.5 text-[12.5px] font-semibold whitespace-nowrap"
          style={{ color: notUsed ? ACCENT : "var(--color-night-muted-foreground)" }}
        >
          <span
            className="flex size-[15px] flex-none items-center justify-center rounded-[4px] border-2"
            style={{ borderColor: notUsed ? ACCENT : "var(--color-glass-stroke)", background: notUsed ? ACCENT : "transparent" }}
          >
            {notUsed && <Check className="h-[10px] w-[10px]" strokeWidth={3.5} color="#ffffff" />}
          </span>
          {GPA_NOT_USED}
        </button>
      </div>

      {/* One merged line, not two separate blurbs: instructional and
         reassurance copy together, always shown. No em dash (house
         style). */}
      <p className="mb-2 text-[14px] leading-[19px] font-medium italic" style={{ color: "var(--color-night-muted-foreground)" }}>
        Drag to set your exact GPA. It doesn&apos;t define you, it just helps us find realistic schools.
      </p>

      {/* Disabled and dimmed once "does not use GPA" is checked -- that is
         what should say "the scale doesn't apply right now". */}
      <div className={`transition-opacity duration-150 ${notUsed ? "pointer-events-none opacity-40" : ""}`}>
        <div className={`relative mb-2 h-8 ${INSET}`}>
          {/* Track base. */}
          <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full" style={{ background: "var(--color-glass-surface-2)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.35)" }} />
          <div
            className="absolute top-1/2 left-0 h-2.5 -translate-y-1/2 rounded-full transition-[width] duration-200"
            style={{
              width: onScale ? `${fraction * 100}%` : "0%",
              background: FILL_GRADIENT,
              boxShadow: onScale ? `0 0 10px 0 color-mix(in srgb, ${ACCENT} 40%, transparent)` : "none",
            }}
          />
          {/* The ruler: one tick per stop, bright where it crosses the
             coloured fill so it never disappears into it. */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
            {GPA_SCALE.map((scaleValue, i) => {
              const weight = tickWeight(scaleValue);
              const at = (i / LAST_INDEX) * 100;
              const lit = onScale && i <= index;
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
                    background: lit ? TICK_ON_FILL : weight === "minor" ? "color-mix(in srgb, var(--color-glass-stroke) 65%, transparent)" : "var(--color-glass-stroke)",
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
            max={LAST_INDEX}
            step={1}
            value={index}
            disabled={notUsed}
            aria-label="GPA"
            aria-valuetext={onScale ? labelForIndex(index) : "Not set"}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
          {/* A slim ring, not a wide spread -- stays comfortably inside
             INSET with no edge-clipping risk (direct feedback, 11 Sept
             2026: repeated cropping from a much bigger glow). */}
          <span
            aria-hidden
            className={`pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-150 ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
            style={{
              left: `${fraction * 100}%`,
              background: onScale ? "var(--color-night-foreground)" : "color-mix(in srgb, var(--color-night-foreground) 55%, transparent)",
              borderColor: onScale ? ACCENT : "var(--color-glass-stroke)",
              boxShadow: onScale ? `0 0 0 3px color-mix(in srgb, ${ACCENT} 30%, transparent), 0 2px 6px rgba(0,0,0,0.35)` : "0 2px 6px rgba(0,0,0,0.35)",
            }}
          />
        </div>

        {/* The scale's own end labels ARE the two open-ended answers
           (direct feedback, 11 Sept 2026: "2.0 should just say below 2.0
           and 4.0 should say 4.0 or higher") -- dragging all the way to
           either edge selects it. Same inset as the track above, so these
           sit close to the true edges without the thumb clipping. */}
        <div className={`flex items-center justify-between ${INSET} text-[13px] font-bold`} style={{ color: "var(--color-night-foreground)" }} aria-hidden>
          <span>{GPA_BELOW}</span>
          <span>3.0</span>
          <span>{GPA_HIGHER}</span>
        </div>
      </div>
    </div>
  );
}
