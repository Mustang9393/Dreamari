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
// The track/ticks/thumb's own safe margin, in real pixels applied
// directly to each absolutely positioned element -- NOT a Tailwind padding
// class on the parent, which does nothing for percentage-based `left` on
// an absolute child (a padding box's origin for that math is the border
// edge, same as with zero padding; this is why the slider kept clipping
// through several rounds of "just add more padding", direct feedback,
// 11 Sept 2026: "I've been asking this for so many attempts"). Big enough
// for the thumb's 12px radius plus its glow ring's spread.
const SAFE = 18;
const TRAVEL = `calc(100% - ${SAFE * 2}px)`;
function travelLeft(fraction: number): string {
  return `calc(${SAFE}px + ${TRAVEL} * ${fraction})`;
}

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
 *  The live answer is a chip in line with the slider itself, right after
 *  the track ends (direct feedback, 11 Sept 2026: "put a container in line
 *  with the slider and have the GPA update there as you slide... after the
 *  slider ends") -- it reads as the slider's own readout, the way the
 *  earlier floating pill tried to, but as a normal flex sibling rather
 *  than an edge-tracking overlay, so it can never clip. "My school does
 *  not use GPA" moved into the title row, in the spot the readout used to
 *  sit before this change (direct feedback: "bring it to where the score
 *  sits now next to the GPA title") -- a compact checkbox, not a chip;
 *  checking it dims and disables the scale below. */
export function GpaField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const resolvedIndex = indexForValue(value);
  const onScale = resolvedIndex !== null;
  const notUsed = value === GPA_NOT_USED;
  const index = onScale ? resolvedIndex : RESTING_INDEX;
  const fraction = index / LAST_INDEX;
  // The two open-ended answers are long phrases, not a plain tenth -- they
  // need a smaller, two-line size to fit the same square slot.
  const isLongLabel = index === 0 || index === LAST_INDEX;
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
      {/* Title row: "GPA" with the one opt-out sitting right beside it,
         not pushed to the row's far edge (direct feedback, 11 Sept 2026:
         "should sit near the GPA title, not on the right edge"). */}
      <div className="mb-2.5 flex items-center gap-3">
        <p className="text-[15px] font-extrabold" style={{ color: "var(--color-night-foreground)" }}>GPA</p>
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

      {/* The instructional/reassurance line moved out of the card
         entirely -- it now sits centered above the footer's Skip button
         (direct feedback, 11 Sept 2026), so this field is just its
         controls. */}

      {/* Gone entirely, not just dimmed, once "does not use GPA" is
         checked -- the space collapses with it (direct feedback, 11 Sept
         2026: "the whole slider must disappear and its space also
         responsively collapsed"). */}
      {!notUsed && (
        <div>
        {/* Track and readout chip share one row -- the chip is a normal
           flex sibling (fixed width, right of the track), not an overlay
           chasing the thumb, so it can never run past the card's edge.
           items-start: the chip aligns with the track itself, not the
           end-label row stacked underneath it. */}
        <div className="flex items-start gap-2.5">
          <div className="min-w-0 flex-1">
          <div className="relative h-8">
            {/* Track base, inset by SAFE on both real edges directly
               (not via parent padding, which absolute percentage
               children ignore). */}
            <div className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full" style={{ left: SAFE, right: SAFE, background: "var(--color-glass-surface-2)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.35)" }} />
            <div
              className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full transition-[width] duration-200"
              style={{
                left: SAFE,
                width: onScale ? `calc(${TRAVEL} * ${fraction})` : "0px",
                background: FILL_GRADIENT,
                boxShadow: onScale ? `0 0 10px 0 color-mix(in srgb, ${ACCENT} 40%, transparent)` : "none",
              }}
            />
            {/* The ruler: one tick per stop, bright where it crosses the
               coloured fill so it never disappears into it. Positioned
               across the same SAFE-to-(100%-SAFE) travel range as the
               thumb, not the full 0-100%. */}
            <div className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{ left: SAFE, right: SAFE }}>
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
              aria-label="GPA"
              aria-valuetext={onScale ? labelForIndex(index) : "Not set"}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
            />
            {/* A slim ring, not a wide spread, travelling only within the
               SAFE-inset range -- verified by direct pixel measurement
               that this never clips the card's edge, at either end of
               the scale. */}
            <span
              aria-hidden
              className={`pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-150 ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
              style={{
                left: travelLeft(fraction),
                background: onScale ? "var(--color-night-foreground)" : "color-mix(in srgb, var(--color-night-foreground) 55%, transparent)",
                borderColor: onScale ? ACCENT : "var(--color-glass-stroke)",
                boxShadow: onScale ? `0 0 0 3px color-mix(in srgb, ${ACCENT} 30%, transparent), 0 2px 6px rgba(0,0,0,0.35)` : "0 2px 6px rgba(0,0,0,0.35)",
              }}
            />
          </div>

          {/* The scale's own end labels ARE the two open-ended answers,
             flush at the row's true edges (direct feedback, 11 Sept 2026)
             -- dragging the track all the way to an edge selects one.
             Muted, not full foreground brightness (direct feedback: "too
             bright, make it more muted"). */}
          <div className="mt-2 flex items-center justify-between text-[13px] font-bold" style={{ color: "var(--color-night-muted-foreground)" }} aria-hidden>
            <span>{GPA_BELOW}</span>
            <span>3.0</span>
            <span>{GPA_HIGHER}</span>
          </div>
          </div>

          {/* The live readout, the slider's own display slot -- a
             square recessed window (inset shadow, dark surface, coloured
             digits), not a bright filled pill that read as a clickable
             button (direct feedback, 11 Sept 2026: "more like a slot not
             a flat stupid button"). A plain exact tenth gets a big number
             (direct feedback: "the numbers need to be larger... value
             big, text smaller"); the two long end-of-scale answers drop
             to a smaller two-line size so they still fit the same square. */}
          <span
            className="mr-1 flex h-16 w-16 flex-none flex-col items-center justify-center gap-0.5 rounded-[12px] border px-1 text-center font-extrabold tabular-nums transition-colors"
            style={{
              // Vibrant, not dark-on-dark (direct feedback, 11 Sept 2026:
              // "the black and purple isn't vibrant enough") -- the same
              // blue-to-violet gradient the track fills with, in white,
              // so the slot reads as energetic rather than recessed.
              background: onScale ? FILL_GRADIENT : "var(--color-glass-surface-2)",
              borderColor: onScale ? "rgba(255,255,255,0.35)" : "var(--color-glass-stroke)",
              color: onScale ? "#ffffff" : "var(--color-night-muted-foreground)",
              // Blur cut down from 16px (direct feedback, 11 Sept 2026:
              // "the glow on the right is being clipped by the right
              // margin padding") -- this chip sits flush at the row's own
              // right edge with no reserved margin of its own, so its glow
              // needs to be modest enough to fit there, the same lesson
              // the thumb's ring already learned.
              boxShadow: onScale
                ? `inset 0 1px 0 rgba(255,255,255,0.3), 0 0 8px 0 color-mix(in srgb, ${ACCENT} 55%, transparent)`
                : "inset 0 2px 6px rgba(0,0,0,0.35)",
            }}
          >
            {onScale && (
              isLongLabel ? (
                // "2.0" / "4.0" big on top, "or below" / "or higher"
                // smaller underneath -- the number leads, the qualifier
                // is secondary (direct feedback, 11 Sept 2026: "make 2.0
                // bigger and then under it put the or below"). Same big
                // number treatment as a plain tenth, just split in two.
                <>
                  <span style={{ fontSize: "22px", lineHeight: "22px" }}>{index === 0 ? "2.0" : "4.0"}</span>
                  <span style={{ fontSize: "10px", lineHeight: "11px" }}>{index === 0 ? "or below" : "or higher"}</span>
                </>
              ) : (
                <span style={{ fontSize: "26px", lineHeight: "26px" }}>{labelForIndex(index)}</span>
              )
            )}
          </span>
        </div>
        </div>
      )}
    </div>
  );
}
