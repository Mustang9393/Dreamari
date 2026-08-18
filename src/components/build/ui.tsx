"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { bricolage } from "./fonts";
import { cascade, useVariant } from "./variant";
import { playProgressSwell } from "./sound";
import { useEffect, useRef, useState } from "react";

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

export type CardHeader = { icon?: ReactNode; title: string; constraint?: string };

export function GlassCard({ children, className = "", header }: { children: ReactNode; className?: string; header?: CardHeader }) {
  const variant = useVariant();
  if (variant === "cinematic") {
    // Boxless: the space background IS the surface; content floats directly on it.
    return <div className={`w-full px-1 ${className}`}>{children}</div>;
  }
  // Replit card structure: a gradient header strip (step icon, step title,
  // constraint line) capping the box, content below. Gradient = the progress
  // bar's blue -> purple -> pink ramp.
  return (
    <div
      className="w-full overflow-hidden rounded-3xl border backdrop-blur-xl"
      style={{
        background: "var(--color-glass-surface-3)",
        borderColor: "var(--color-glass-border)",
        boxShadow: "0 24px 60px -28px rgba(0,0,0,0.6)",
      }}
    >
      {header && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 sm:px-6"
          style={{ background: "linear-gradient(90deg, var(--color-brand-500), var(--color-accent-purple), var(--color-world-arts-media-sport))" }}
        >
          {header.icon && (
            <span aria-hidden className="flex-none text-white/90">
              {header.icon}
            </span>
          )}
          <span className={`${bricolage.className} text-[15px] font-bold text-white`}>{header.title}</span>
          {header.constraint && <span className="ml-auto text-right text-[12px] font-semibold text-white/85">{header.constraint}</span>}
        </div>
      )}
      <div className={`p-3.5 sm:p-6 ${className}`}>{children}</div>
    </div>
  );
}

// In-card progress HUD (glass variant; the cinematic variant renders the same
// PhaseProgress floating at the top of the screen instead). Speaks in PHASES per
// direct feedback - no "Step x of 8" counters, no BUILD badge repetition. When the
// percent GROWS, the bar animates its fill, fires a spark fan off the leading edge
// (Duolingo-style), and plays a short rising chime; module-level memory of the last
// percent survives step remounts so going Previous never re-celebrates.
let lastCelebratedPercent = 0;

export function PhaseProgress({ percent, phase, almostDone }: { percent: number; phase?: string; almostDone?: boolean }) {
  const [sparkNonce, setSparkNonce] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    if (percent > lastCelebratedPercent) {
      const from = lastCelebratedPercent;
      lastCelebratedPercent = percent;
      // Swell rides the fill animation; sparks pop at the crest.
      const duration = playProgressSwell(from, percent) ?? 0.6;
      const timer = setTimeout(() => setSparkNonce((n) => n + 1), duration * 850);
      return () => clearTimeout(timer);
    }
  }, [percent]);

  return (
    <div>
      <div className="flex items-center gap-2.5">
        {phase && (
          <span className="text-[11px] font-bold tracking-wide" style={{ color: "var(--color-brand-300)" }}>
            {phase}
          </span>
        )}
        {almostDone && (
          <span className="text-[11px] font-bold" style={{ color: "var(--color-feedback-success-dark-surface)" }}>
            Almost done
          </span>
        )}
        <span className="ml-auto text-[12px] font-extrabold" style={{ color: "var(--color-feedback-success-dark-surface)" }}>
          {percent}% Complete
        </span>
      </div>
      <div className="relative mt-2">
        <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: "var(--color-glass-surface-2)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(90deg, var(--color-brand-500), var(--color-accent-purple), var(--color-world-arts-media-sport))",
              boxShadow: "0 0 10px 0 color-mix(in srgb, var(--color-accent-purple) 55%, transparent)",
            }}
          />
        </div>
        {/* Spark fan wrapping the bar's leading edge on growth. */}
        {sparkNonce > 0 && (
          <div key={sparkNonce} aria-hidden className="pointer-events-none absolute top-1/2 -translate-y-1/2" style={{ left: `${percent}%` }}>
            {Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <span
                  key={i}
                  className="absolute h-1 w-1 rounded-full motion-safe:animate-[dreamy-burst_0.6s_ease-out_forwards]"
                  style={{
                    background: i % 2 ? "var(--color-accent-purple)" : "var(--color-world-business-money-office)",
                    ["--bx"]: `${Math.round(Math.cos(angle) * 22)}px`,
                    ["--by"]: `${Math.round(Math.sin(angle) * 22)}px`,
                    animationDelay: `${(i % 3) * 0.04}s`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Both variants carry the progress WITH the question block, rendered ABOVE the
// box (Replit chrome) / above the heading (frameless frame 3214-7363).
export function CardHud({ percent, phase, almostDone }: { percent: number; phase?: string; almostDone?: boolean }) {
  return (
    <div className="mb-3 sm:mb-5">
      <PhaseProgress percent={percent} phase={phase} almostDone={almostDone} />
    </div>
  );
}

export function QuestionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  const variant = useVariant();
  if (variant === "cinematic") {
    // Left-aligned per the frameless Figma frame (3214-7363) — big, but anchored
    // to the same grid as the options below, not floating centered.
    return (
      <div className="mb-5 sm:mb-7">
        <h1 className={`${bricolage.className} text-[24px] leading-[1.08] font-extrabold tracking-tight text-[var(--color-night-foreground)] sm:text-[40px]`}>
          <InkText text={title} />
        </h1>
        {subtitle && (
          <p
            className="mt-2 text-[14px] font-medium text-[var(--color-night-muted-foreground)] opacity-0 motion-safe:animate-[fade-slide-up_0.5s_ease-out_forwards]"
            style={{ animationDelay: "0.5s" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="mb-3 sm:mb-5">
      <h1 className={`${bricolage.className} text-[17px] font-bold text-[var(--color-night-foreground)] sm:text-2xl`}>{title}</h1>
      {subtitle && <p className="mt-1 text-[13px] font-medium text-[var(--color-night-muted-foreground)] sm:text-sm">{subtitle}</p>}
    </div>
  );
}

export function Citation({ children }: { children: ReactNode }) {
  const variant = useVariant();
  return (
    <p className={`mt-4 text-center text-[10.5px] font-medium tracking-wide text-[var(--color-night-muted-foreground)] ${variant === "cinematic" ? "opacity-50" : "opacity-70"}`}>
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
  nextLabel?: string;
}) {
  return (
    // Sticky to the step column's scroll container: on phones where a stage
    // scrolls, Next/Previous stay on screen instead of hiding below the fold.
    <div className="sticky bottom-0 z-10 mt-3 flex w-full items-center justify-between gap-3 pt-2 pb-1 max-sm:[background:linear-gradient(to_top,color-mix(in_srgb,var(--color-night-background)_92%,transparent)_62%,transparent)]">
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
          onNext();
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
  const variant = useVariant();

  const atMax = selected.length >= max;

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
    <div className={`grid auto-rows-fr gap-2 ${columns}`}>
      {options.map((option, index) => {
        const isSelected = selected.includes(option);
        const isLocked = atMax && !isSelected;
        const accent = accents?.[option] ?? "var(--color-brand-400)";
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
            className={`flex h-full min-h-[44px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-[13.5px] leading-snug font-semibold transition-all duration-150 sm:text-[14px] ${
              isLocked ? "cursor-not-allowed opacity-40" : "hover:-translate-y-px"
            }`}
            style={{
              background: isSelected ? `color-mix(in srgb, ${accent} 16%, var(--color-glass-surface-1))` : "var(--color-glass-surface-1)",
              borderColor: isSelected ? accent : "var(--color-glass-border)",
              color: isSelected ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)",
              ...cascade(variant, index),
            }}
          >
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
  );
}
