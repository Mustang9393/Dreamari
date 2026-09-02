"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { bricolage } from "./fonts";
import { cascade } from "./variant";
import { CONFIRM_GLOW_MS, dispatchConfirmPulse, useConfirmGlow } from "./confirmPulse";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { barGradientColorAt, ProgressSpark } from "./ProgressSpark";

export { useConfirmGlow };

// The shimmer half of confirm-glow: a masked light band that sweeps once across
// whatever it's placed inside (needs position:relative + overflow-hidden on the
// parent, or this handles the clipping itself via rounded-[inherit]). Pair with
// motion-safe:animate-[confirm-lift_...] on the element itself for the "lift" half.
export function ConfirmShimmer({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <span
        className="absolute inset-y-0 left-0 w-1/3 motion-safe:animate-[confirm-shimmer-sweep_0.42s_ease-out_forwards]"
        style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.6) 45%, transparent 90%)" }}
      />
    </span>
  );
}

// Shared primitives for the build flow, variant-aware (see variant.tsx): the same
// step implementations render the "glass" treatment (Figma card structure, glass
// tokens) or the "cinematic" treatment (boxless, ink-materializing type, cascading
// options) purely from context. Type follows the Figma UI styles: Bricolage
// Grotesque for Display/H1/Body, the app's Montserrat for labels/captions.

// Splits text into word spans that materialize with the ink-bleed animation —
// the Tom-Riddle's-diary effect from the supplied reference. Words stagger 45ms.
export function InkText({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={className} aria-label={text} role="text">
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="inline-block motion-safe:animate-[ink-bleed-in_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] motion-safe:opacity-0"
          style={{ animationDelay: `${delay + i * 0.045}s` }}
        >
          {word}
          {i < text.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

// The step container — boxless (the space background IS the surface), per
// the A/B verdict: the cinematic treatment won.
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full px-1 ${className}`}>{children}</div>;
}

// Frosted-box treatment for the flow's single/low-count panels (summary
// cards, the slider track, the map/list toggle, dropdowns) -- NOT for
// repeated grids like ChipGrid's options or Education's row: a dozen
// stacked backdrop-blur layers is a WebKit compositing bomb on phones (see
// the no-blur note on ChipGrid below), but 1-3 panels per screen cost
// nothing. Mixing in --color-night-card raises the surface's opacity so
// each box reads as a solid frosted panel instead of a barely-there wash;
// both source tokens flip per theme already, so this stays correct (and
// WCAG AA, spot-checked) in light mode too.
export const GLASS_PANEL_BG = "color-mix(in srgb, var(--color-night-card) 32%, var(--color-glass-surface-raised))";
export const GLASS_PANEL_BORDER = "color-mix(in srgb, var(--color-glass-border-raised) 100%, var(--color-night-foreground) 16%)";
export const GLASS_PANEL_CLASS = "backdrop-blur-md";

// The in-flow progress bar. It names the CHAPTER, not the step: "BUILD" sits over
// the bar on every question so the flow reads as one leg of Build → Match → Play,
// never as "Step x of 8" (counters make it feel long). The old "Phase 1..4" labels
// meant nothing to a student and are retired. When the percent GROWS, a comet with a
// trailing streak rides the leading edge from the old percent to the new one
// (Duolingo's combo-streak spark, adapted -- we don't have a combo mechanic, so it
// fires on every advance instead of a streak); module-level memory of the last
// percent survives step remounts so going Previous never re-celebrates.
let lastCelebratedPercent = 0;

export function PhaseProgress({ percent, almostDone }: { percent: number; almostDone?: boolean }) {
  const [comet, setComet] = useState<{ from: number; to: number; nonce: number } | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  // Each step remounts this component fresh (it lives inside the step's own JSX tree,
  // which StepTransition keys by stageId), so a plain `width: ${percent}%` never had a
  // prior value to transition FROM -- the CSS `transition-[width]` was declared but
  // never actually had anything to animate, since the new instance painted straight at
  // its target width on frame one. displayPercent starts at the module-level "last
  // shown" value (correct across the remount) and only moves to the real percent a
  // frame later, same two-phase trick as the spark's position.
  const [displayPercent, setDisplayPercent] = useState(lastCelebratedPercent);

  useEffect(() => {
    // No `mounted` ref guard: that pattern (synchronously mutating the module-level
    // lastCelebratedPercent, then using a ref to block a second run) is NOT safe under
    // React's dev-mode StrictMode, which deliberately runs every effect twice
    // (mount -> cleanup -> mount) to catch exactly this kind of non-idempotent effect.
    // The first invoke mutated lastCelebratedPercent and scheduled a timer; cleanup
    // cancelled the timer but couldn't undo the mutation; the second invoke then saw
    // the guard already tripped and did nothing -- so the real update silently never
    // landed. (This is why the bar was rendering the PREVIOUS step's fill width. Traced
    // via direct DOM sampling: styleWidth stuck at a stale value while the % label,
    // which reads the prop directly rather than this state, was already correct.)
    // Fix: read lastCelebratedPercent fresh on every invoke, and only mutate it inside
    // the timer callback -- so if the timer gets cancelled, nothing happened, and a
    // second invoke starts from the same clean state as the first.
    const from = lastCelebratedPercent;
    const growing = percent > from;
    const timer = setTimeout(() => {
      lastCelebratedPercent = percent;
      setDisplayPercent(percent);
      if (growing) setComet((c) => ({ from, to: percent, nonce: (c?.nonce ?? 0) + 1 }));
    }, 0);
    return () => clearTimeout(timer);
  }, [percent]);

  useEffect(() => {
    // A rare, unprompted flicker in place (from === to, so ProgressSpark draws its
    // small idle-width floor rather than sweeping any distance) so the bar doesn't
    // read as dead between real advances -- spaced apart enough not to read as a
    // loop, but per direct feedback the original 14-30s gap felt sluggish; tightened
    // without going so quick it turns distracting. jitterPath's own randomness
    // already gives each firing (idle or growth) its own shape.
    let timer: ReturnType<typeof setTimeout>;
    function scheduleIdle() {
      const delay = 7000 + Math.random() * 8000;
      timer = setTimeout(() => {
        setComet((c) => ({ from: percent, to: percent, nonce: (c?.nonce ?? 0) + 1 }));
        scheduleIdle();
      }, delay);
    }
    scheduleIdle();
    return () => clearTimeout(timer);
  }, [percent]);

  useEffect(() => {
    // The bar's fill pulses -- brightness AND an actual colored glow, in the spark's
    // own matched color, not just "brighter of whatever the bar's static gradient
    // already is" -- in step with the spark (same nonce/timing, same source color),
    // for every firing alike (a real advance or one of the occasional idle loops), so
    // the bar never just sits there while something else lights up next to it.
    // Driven via the Web Animations API rather than a CSS class toggle, since the
    // element never remounts (a toggled class needs a real off-state to re-trigger,
    // and this needs to restart cleanly on every nonce) and without `fill: "forwards"`
    // it reverts cleanly to the underlying inline boxShadow/background once done, so
    // nothing needs to be manually reset.
    if (!comet || !fillRef.current) return;
    const glowColor = barGradientColorAt(comet.to / 100);
    const restingShadow = "0 0 10px 0 color-mix(in srgb, var(--color-accent-purple) 55%, transparent)";
    const glowShadow = (spread: number, blur: number) => `0 0 ${blur}px ${spread}px ${glowColor}`;
    // An irregular multi-peak flicker (real electricity doesn't ramp smoothly up and
    // down once) rather than one clean pulse -- matches the spark's own erratic
    // timing instead of reading as a separate, calmer animation next to it.
    const anim = fillRef.current.animate(
      [
        { filter: "brightness(1) saturate(1)", boxShadow: restingShadow, offset: 0 },
        { filter: "brightness(1.65) saturate(1.4)", boxShadow: glowShadow(4, 24), offset: 0.12 },
        { filter: "brightness(1.1) saturate(1.1)", boxShadow: glowShadow(1, 12), offset: 0.24 },
        { filter: "brightness(1.55) saturate(1.35)", boxShadow: glowShadow(3, 20), offset: 0.4 },
        { filter: "brightness(1.05) saturate(1.05)", boxShadow: glowShadow(1, 10), offset: 0.55 },
        { filter: "brightness(1.4) saturate(1.25)", boxShadow: glowShadow(2, 16), offset: 0.7 },
        { filter: "brightness(1) saturate(1)", boxShadow: restingShadow, offset: 1 },
      ],
      { duration: 700, easing: "ease-out" },
    );
    return () => anim.cancel();
  }, [comet]);

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span
          className="text-[14px] leading-none font-extrabold tracking-[0.14em] sm:text-[15px]"
          style={{ color: "color-mix(in srgb, var(--color-brand-400) 55%, var(--color-night-foreground))" }}
        >
          BUILD
        </span>
        {almostDone && (
          <span className="text-[11px] font-bold" style={{ color: "color-mix(in srgb, var(--color-feedback-success-dark-surface) 55%, var(--color-night-foreground))" }}>
            Almost done
          </span>
        )}
        <span className="ml-auto text-[12px] font-extrabold" style={{ color: "color-mix(in srgb, var(--color-feedback-success-dark-surface) 55%, var(--color-night-foreground))" }}>
          {percent}% Complete
        </span>
      </div>
      <div ref={trackRef} className="relative mt-2">
        <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--color-glass-surface-2)" }}>
          <div
            ref={fillRef}
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${displayPercent}%`,
              background: "linear-gradient(90deg, var(--color-brand-500), var(--color-accent-purple), var(--color-world-arts-media-sport))",
              boxShadow: "0 0 10px 0 color-mix(in srgb, var(--color-accent-purple) 55%, transparent)",
            }}
          />
        </div>
        {/* Hand-drawn-style scribble sweeping the newly-filled span on growth. */}
        {comet && <ProgressSpark key={comet.nonce} trackRef={trackRef} fromPercent={comet.from} toPercent={comet.to} />}
      </div>
    </div>
  );
}

// Progress renders in-flow above the heading (frameless Figma frame 3214-7363).
export function CardHud({ percent, almostDone }: { percent: number; almostDone?: boolean }) {
  return (
    <div className="mb-3 sm:mb-5">
      <PhaseProgress percent={percent} almostDone={almostDone} />
    </div>
  );
}

// Local burst particle vectors (deterministic, no randomness at render — SSR-safe
// and consistent): 10 particles fanning up/outward from Dreamy's head.
const BURST_PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (-95 + i * 21) * (Math.PI / 180);
  const distance = 46 + (i % 3) * 16;
  return {
    bx: `${Math.round(Math.cos(angle) * distance)}px`,
    by: `${Math.round(Math.sin(angle) * distance)}px`,
    br: `${i % 2 === 0 ? 200 : -160}deg`,
    delay: `${(i % 4) * 0.03}s`,
    color: ["var(--color-brand-400)", "var(--color-accent-purple)", "var(--color-world-arts-media-sport)", "var(--color-world-business-money-office)"][i % 4],
  };
});

export function LocalBurst({ nonce }: { nonce: number }) {
  if (nonce === 0) return null;
  return (
    <div key={nonce} aria-hidden className="pointer-events-none absolute inset-0">
      {BURST_PARTICLES.map((particle, i) => (
        <span
          key={i}
          className="absolute top-1/3 left-1/2 h-1.5 w-1.5 rounded-[2px] motion-safe:animate-[dreamy-burst_0.7s_ease-out_forwards]"
          style={{
            background: particle.color,
            ["--bx" as string]: particle.bx,
            ["--by" as string]: particle.by,
            ["--br" as string]: particle.br,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

const REACTION_MS = 950;
const REACTION_SPRITE = "/images/dreamy/v2/dreamy-heart.png";

export function QuestionHeading({
  title,
  subtitle,
  sprite,
  reactionNonce,
}: {
  title: string;
  subtitle?: string;
  sprite?: string;
  // Omit entirely on steps where a celebratory reaction is the wrong tone
  // (cost, location, education-level, profile) -- those are the flow's
  // stakes-bearing questions, not identity picks. Only threaded through on
  // Interests/Subjects/Work Vibe, per direct instruction: relevant screens
  // only, not every screen or interaction.
  reactionNonce?: number;
}) {
  // Left-aligned per the frameless Figma frame (3214-7363) — big, anchored to
  // the same grid as the options below. Dreamy sits beside the question,
  // ASKING it (the old speech-bubble row is retired to free vertical space).
  const [reacting, setReacting] = useState(false);
  const lastNonce = useRef(reactionNonce ?? 0);

  useEffect(() => {
    if (reactionNonce === undefined || reactionNonce === lastNonce.current) return;
    lastNonce.current = reactionNonce;
    setReacting(true);
    const timer = setTimeout(() => setReacting(false), REACTION_MS);
    return () => clearTimeout(timer);
  }, [reactionNonce]);

  return (
    <div className="mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
      {sprite && (
        <div data-dreamy-anchor className="relative h-[52px] w-[52px] flex-none sm:h-[72px] sm:w-[72px]">
          <img
            key={reacting ? REACTION_SPRITE : sprite}
            src={reacting ? REACTION_SPRITE : sprite}
            alt=""
            aria-hidden
            className="h-full w-full object-contain motion-safe:animate-[dreamy-celebrate_3.2s_ease-in-out_infinite]"
          />
          {reactionNonce !== undefined && <LocalBurst nonce={reactionNonce} />}
        </div>
      )}
      <div>
      <h1 className={`${bricolage.className} text-[24px] leading-[1.08] font-extrabold tracking-tight text-[var(--color-night-foreground)] sm:text-[40px]`}>
        <InkText text={title} />
      </h1>
      {subtitle && (
        <p
          className="mt-2 text-[14.5px] font-medium opacity-0 motion-safe:animate-[fade-slide-up_0.5s_ease-out_forwards]"
          style={{ color: "color-mix(in srgb, var(--color-night-foreground) 80%, transparent)", animationDelay: "0.5s" }}
        >
          {subtitle}
        </p>
      )}
      </div>
    </div>
  );
}

// The source line. Deliberately unfilled — it sits straight on the background
// while the cards above it carry the surface, so it never reads as another tile.
export function Citation({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-4 bg-transparent text-center text-[11px] font-medium tracking-wide text-[var(--color-night-muted-foreground)] opacity-60"
      style={{ background: "transparent" }}
    >
      {children}
    </p>
  );
}

export function StepFooter({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Next Step",
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: React.ReactNode;
}) {
  const [holding, setHolding] = useState(false);
  return (
    // Sticky to the step column's scroll container: on phones where a stage
    // scrolls, Next/Previous stay on screen instead of hiding below the fold.
    // No mt-auto here (there was one; removed): a flex item's auto margin
    // consumes ALL free space on that line, which per spec suppresses
    // justify-content for the WHOLE flex line, not just this item -- so
    // while it did pin the footer to the bottom, it silently broke the
    // question content's own centering above it (confirmed live: on a short
    // step, "flex-1 flex-col justify-center" was measuring as fully
    // correct via getComputedStyle, yet the content still rendered pinned
    // to the top -- because the parent's justify-content had no effect at
    // all once this auto margin existed anywhere on that line). Fixed
    // structurally instead: each step now wraps its own centered content in
    // a dedicated flex-1 block, with this footer as a plain sibling after
    // it and CardHud as a plain sibling before it -- no auto margins
    // anywhere, so justify-content on the middle block actually applies.
    <div className="flow-sticky-footer sticky bottom-0 z-10 mt-3 flex w-full items-center justify-between gap-3 pt-2 pb-1">
      {onBack ? (
        <Button variant="secondary" onClick={(e) => { dispatchAuroraPulse("select", e); onBack(); }} type="button">
          Previous
        </Button>
      ) : (
        <span />
      )}
      <Button
        variant="primary"
        onClick={(e) => {
          dispatchAuroraPulse("cta", e);
          // Give the selected answer its shimmer-and-lift moment before the step actually
          // changes, instead of the screen cutting away the instant it's chosen. holding
          // (not nextDisabled, which would visually greys the button mid-confirm) blocks a
          // second click from queuing a second delayed advance.
          if (holding) return;
          setHolding(true);
          dispatchConfirmPulse();
          window.setTimeout(() => {
            setHolding(false);
            onNext();
          }, CONFIRM_GLOW_MS);
        }}
        disabled={nextDisabled}
        type="button"
      >
        {nextLabel}
      </Button>
    </div>
  );
}

export function ChipGrid({
  options,
  selected,
  max,
  onChange,
  accents,
  icons,
  columns = "grid-cols-1 sm:grid-cols-2",
  onPick,
}: {
  options: string[];
  selected: string[];
  max: number;
  onChange: (next: string[]) => void;
  accents?: Record<string, string>;
  icons?: Record<string, ReactNode>;
  columns?: string;
  onPick?: () => void;
}) {
  // Progressive disclosure on phones: long lists show 6 options + one "Show
  // all N" reveal (never a second tier), so the CTA is visible without any
  // scrolling and the rest slides in on request. Desktop always fits, so it
  // always shows everything.
  const PREVIEW = 6;
  const [isPhone, setIsPhone] = useState(false);
  // null = collapsed; "tap" = user revealed (animate the tail in). Derived
  // guard below force-expands when a pick lives in the hidden tail (e.g.
  // returning via Previous), with no animation.
  const [expandedBy, setExpandedBy] = useState<null | "tap">(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const collapsible = isPhone && options.length > PREVIEW + 1;
  const mustExpand = selected.some((option) => options.indexOf(option) >= PREVIEW);
  const expanded = expandedBy !== null || mustExpand;
  const visibleOptions = collapsible && !expanded ? options.slice(0, PREVIEW) : options;

  const gridRef = useRef<HTMLDivElement | null>(null);
  const atMax = selected.length >= max;
  // One shared glow window for the whole grid (not per-chip -- hooks can't live inside
  // .map()) applied to whichever options are currently selected when it fires.
  const confirming = useConfirmGlow(selected.length > 0);

  function toggle(option: string, e: React.MouseEvent) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }
    // Hard cap: at the max, new picks are locked out until one is deselected —
    // no silent oldest-swap.
    if (atMax) return;
    dispatchAuroraPulse("select", e);
    onPick?.();
    onChange([...selected, option]);
  }

  return (
    <div>
      <div ref={gridRef} className={`grid auto-rows-fr gap-2 ${columns}`}>
        {visibleOptions.map((option, index) => {
        const isSelected = selected.includes(option);
        const isLocked = atMax && !isSelected;
        const accent = accents?.[option] ?? "var(--color-brand-400)";
        const glowing = isSelected && confirming;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            aria-disabled={isLocked}
            onClick={(e) => toggle(option, e)}
            // No per-chip backdrop-filter: a dozen stacked backdrop-blur layers
            // is a WebKit compositing bomb on phones; the token surface reads
            // fine without it.
            className={`relative flex h-full min-h-[44px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[13.5px] leading-snug font-semibold transition-all duration-150 sm:text-[14px] ${
              isLocked ? "cursor-not-allowed opacity-40" : "hover:-translate-y-px"
            } ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
            style={{
              background: isSelected ? `color-mix(in srgb, ${accent} 16%, var(--color-glass-surface-raised))` : "var(--color-glass-surface-raised)",
              borderColor: isSelected ? accent : GLASS_PANEL_BORDER,
              color: isSelected ? "var(--color-night-foreground)" : "color-mix(in srgb, var(--color-night-foreground) 80%, transparent)",
              boxShadow: glowing ? `0 0 0 1px ${accent}, 0 4px 18px -2px color-mix(in srgb, ${accent} 65%, transparent)` : undefined,
              ...(expandedBy === "tap" && index >= PREVIEW
                ? { animation: `option-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) both`, animationDelay: `${(index - PREVIEW) * 0.05}s` }
                : cascade(index)),
            }}
          >
            <ConfirmShimmer active={glowing} />
            {icons?.[option] ? (
              <span aria-hidden className="flex-none" style={{ color: isSelected ? accent : "var(--color-night-muted-foreground)" }}>
                {icons[option]}
              </span>
            ) : (
              <span
                aria-hidden
                className="h-2 w-2 flex-none rounded-full transition-transform duration-150"
                style={{
                  background: accent,
                  boxShadow: isSelected ? `0 0 10px 2px color-mix(in srgb, ${accent} 55%, transparent)` : "none",
                  transform: isSelected ? "scale(1.3)" : "scale(1)",
                }}
              />
            )}
            {option}
          </button>
        );
        })}
      </div>
      {collapsible && !expanded && (
        <button
          type="button"
          onClick={(e) => {
            setExpandedBy("tap");
            dispatchAuroraPulse("select", e);
          }}
          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-colors ${GLASS_PANEL_CLASS}`}
          style={{
            background: GLASS_PANEL_BG,
            borderColor: GLASS_PANEL_BORDER,
            color: "var(--color-night-muted-foreground)",
          }}
        >
          Show all {options.length}
          <ChevronDown aria-hidden className="h-4 w-4" />
        </button>
      )}
      {/* Way back up — hidden if a pick lives in the tail (collapsing would
         hide a selection; mustExpand keeps it open regardless). */}
      {collapsible && expanded && !mustExpand && (
        <button
          type="button"
          onClick={() => {
            setExpandedBy(null);
            gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-colors ${GLASS_PANEL_CLASS}`}
          style={{
            background: GLASS_PANEL_BG,
            borderColor: GLASS_PANEL_BORDER,
            color: "var(--color-night-muted-foreground)",
          }}
        >
          Show less
          <ChevronUp aria-hidden className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
