"use client";

// DEMO-ONLY: shared building blocks for the Interactions section only
// (src/components/component-lab/sections/Interactions.tsx and its
// siblings). Mirrors the idioms kit.tsx already established elsewhere in
// the lab (Foundations.tsx's file-local `Replayable`) rather than
// reinventing them, so this section reads as part of the same system.

import { useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import { MONO } from "../../kit";

const MUTED: CSSProperties = { color: "var(--muted-foreground)" };

/** One step in an end-to-end flow: the real screen, its real route, and the
 *  one thing a student does there. */
export type FlowStep = { screen: string; route: string; does: string };

/** A compact, scannable strip of real screens -- never prose. Each card
 *  names the actual component's route so the step can be checked against
 *  src/app directly; an arrow (not a numbered list) reads as a path. */
export function StepStrip({ steps }: { steps: FlowStep[] }) {
  return (
    <ol className="flex w-full flex-wrap items-stretch gap-[var(--space-2)]">
      {steps.map((step, i) => (
        <li key={i} className="flex items-stretch gap-[var(--space-2)]">
          <div className="flex w-[188px] flex-none flex-col gap-[4px] rounded-[var(--radius-md)] border p-[var(--space-3)]" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <span className="text-[13px] leading-[17px] font-bold">{step.screen}</span>
            <code className="text-[10.5px] leading-[14px] break-all" style={MONO}>
              {step.route}
            </code>
            <span className="text-[12px] leading-[16px]" style={MUTED}>
              {step.does}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span aria-hidden className="flex flex-none items-center" style={MUTED}>
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Same nonce-bump idiom as Foundations.tsx's file-local `Replayable`,
 *  exported here so every one-shot animation in this section (and its
 *  sibling files) gets the same Replay control. */
export function Replayable({ children }: { children: (nonce: number) => ReactNode }) {
  const [nonce, setNonce] = useState(0);
  return (
    <div className="flex flex-col items-center gap-[10px]">
      {children(nonce)}
      <button
        type="button"
        onClick={() => setNonce((n) => n + 1)}
        className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[3px] text-[10.5px] font-bold"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
      >
        Replay
      </button>
    </div>
  );
}

/** The real duration/easing (and optional delay), read from the CSS/framer
 *  source and rendered in MONO -- never paraphrased. */
export function DurationTag({ duration, easing, delay }: { duration: string; easing: string; delay?: string }) {
  return (
    <div className="flex flex-col items-center gap-[2px] text-center">
      <code className="text-[10.5px]" style={MONO}>
        {duration}
        {delay ? ` · delay ${delay}` : ""}
      </code>
      <code className="text-[10px] break-all" style={{ ...MONO, ...MUTED }}>
        {easing}
      </code>
    </div>
  );
}

/** A sound never plays on its own in the lab -- every trigger below is an
 *  explicit click, never mounted-and-firing. `label` names the moment it
 *  really plays in the app, not the function name. */
export function SoundButton({ label, onPlay }: { label: string; onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="dm-quiet flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-full border px-[12px] py-[7px] text-center text-[12px] font-bold"
      style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
    >
      <Volume2 className="h-[13px] w-[13px] flex-none" aria-hidden />
      <span className="min-w-0">{label}</span>
    </button>
  );
}
