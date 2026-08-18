"use client";

import { COST_STOPS } from "./types";
import { Target } from "lucide-react";
import { CardHud, Citation, GlassCard, QuestionHeading, StepFooter } from "./ui";
import type { StepProps } from "./steps";

// Education Cost — the "enhance interactive elements like sliders" showcase. A real
// <input type=range> drives everything (keyboard + screen-reader + touch for free);
// the visuals are custom-painted around it: a gradient fill that grows with the
// value, tick dots that light as the thumb passes them, a glowing thumb, and
// clickable stop labels that jump the slider. Discrete 6 stops per the reference.

const AMBER = "var(--color-world-business-money-office)";

export function CostStep({ state, patch, onBack, onNext, react, percent }: StepProps) {
  const index = state.costIndex;
  const touched = index >= 0;
  const value = touched ? index : 0;
  const fraction = value / (COST_STOPS.length - 1);

  function setIndex(next: number) {
    if (next !== state.costIndex) react();
    patch({ costIndex: next });
  }

  return (
    <div className="w-full">
      <CardHud percent={percent} />
      <GlassCard header={{ icon: <Target className="h-4 w-4" />, title: "Education Cost", constraint: "Choose one" }}>
      <QuestionHeading title="What total school or training cost feels realistic?" subtitle="Select a range. You can change it later." />

      <div
        className="rounded-2xl border px-4 py-5 sm:px-6"
        style={{ background: "var(--color-glass-surface-1)", borderColor: "var(--color-glass-border)" }}
      >
        <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--color-night-muted-foreground)] uppercase">Selected Range</p>
        <p
          className="mt-1 text-lg font-extrabold transition-colors sm:text-xl"
          style={{ color: touched ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)" }}
        >
          {touched ? COST_STOPS[index] : "Select a range"}
        </p>

        <div className="relative mt-5 mb-2 h-8">
          {/* Track base + gradient fill up to the thumb. */}
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ background: "var(--color-glass-surface-2)" }} />
          <div
            className="absolute top-1/2 left-0 h-2 -translate-y-1/2 rounded-full transition-[width] duration-200"
            style={{
              width: `calc(${fraction * 100}% )`,
              background: `linear-gradient(90deg, var(--color-brand-500), ${AMBER})`,
              boxShadow: touched ? `0 0 14px 0 color-mix(in srgb, ${AMBER} 45%, transparent)` : "none",
            }}
          />
          {/* Tick dots at each stop, lit once passed. */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
            {COST_STOPS.map((stop, i) => (
              <span
                key={stop}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200"
                style={{
                  left: `${(i / (COST_STOPS.length - 1)) * 100}%`,
                  top: "50%",
                  background: touched && i <= value ? AMBER : "var(--color-glass-stroke)",
                }}
              />
            ))}
          </div>
          {/* The real control, visually replaced by the custom thumb below. */}
          <input
            type="range"
            min={0}
            max={COST_STOPS.length - 1}
            step={1}
            value={value}
            aria-label="What total school or training cost feels realistic?"
            aria-valuetext={touched ? COST_STOPS[index] : "Select a range"}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-200"
            style={{
              left: `${fraction * 100}%`,
              background: touched ? "var(--color-night-foreground)" : "color-mix(in srgb, var(--color-night-foreground) 70%, transparent)",
              borderColor: touched ? AMBER : "var(--color-glass-stroke)",
              boxShadow: touched ? `0 0 0 6px color-mix(in srgb, ${AMBER} 22%, transparent), 0 4px 12px rgba(0,0,0,0.4)` : "0 4px 12px rgba(0,0,0,0.4)",
            }}
          />
        </div>

        {/* Stop labels double as jump targets — two-line splits mirror the
           reference's own line breaks. */}
        <div className="grid grid-cols-3 gap-y-2 sm:grid-cols-6">
          {(
            [
              ["As little as", "possible"],
              ["$25,000", "or less"],
              ["$50,000", "or less"],
              ["$100,000", "or less"],
              ["Over $100,000", "for the right path"],
              ["I’m not sure yet", ""],
            ] as const
          ).map(([top, bottom], i) => {
            const isActive = touched && i === index;
            return (
              <button
                key={COST_STOPS[i]}
                type="button"
                onClick={() => setIndex(i)}
                className="px-1 text-center text-[11px] leading-tight font-semibold transition-colors sm:text-[11.5px]"
                style={{ color: isActive ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)", opacity: isActive ? 1 : 0.75 }}
              >
                {top}
                {bottom && <span className="block text-[10px] font-medium opacity-80">{bottom}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <Citation>These answers help Dreamari compare options, not rule out your dreams. You can change them later.</Citation>
      </GlassCard>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!touched} />
    </div>
  );
}
