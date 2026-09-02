"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { CardHud, ChipGrid, Citation, ConfirmShimmer, GLASS_PANEL_BG, GLASS_PANEL_BORDER, GLASS_PANEL_CLASS, GlassCard, InkText, LocalBurst, QuestionHeading, StepFooter, useConfirmGlow } from "./ui";
import { ArrowRight, BookOpen, Brain, Briefcase, Calculator, Code2, FlaskConical, GraduationCap, Landmark, Languages, Music, Palette, Rocket, Sparkles, Wrench } from "lucide-react";
import { bricolage } from "./fonts";
import { cascade } from "./variant";
import { playMilestoneChime } from "./sound";
import {
  EDUCATION_OPTIONS,
  ENERGY_OPTIONS,
  GPA_OPTIONS,
  GRADE_OPTIONS,
  TRAVEL_DISTANCE_OPTIONS,
  INTEREST_WORLDS,
  SUBJECTS,
  TEAM_OPTIONS,
  type BuildState,
} from "./types";

// Every user-facing string here is verbatim from docs/BUILD_FLOW_SPEC.md. Layout
// follows the Figma Build Flow card structure: HUD (progress) at the card's top,
// question heading, content, and the CTA row OUTSIDE the card on the space
// background. Surfaces are the pipeline's Figma glass tokens throughout.

export type StepProps = {
  state: BuildState;
  patch: (update: Partial<BuildState>) => void;
  onBack?: () => void;
  onNext: () => void;
  react: () => void;
  reactionNonce: number;
  percent: number;
  almostDone?: boolean;
  sprite?: string;
};

const EDUCATION_ICONS = [Rocket, Wrench, GraduationCap, BookOpen, Sparkles];

// Per-subject icons per the Figma Subjects frame (3002:14277).
const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  Mathematics: <Calculator className="h-4 w-4" />,
  Science: <FlaskConical className="h-4 w-4" />,
  "English/Literature": <BookOpen className="h-4 w-4" />,
  History: <Landmark className="h-4 w-4" />,
  Art: <Palette className="h-4 w-4" />,
  Music: <Music className="h-4 w-4" />,
  "Computer Science": <Code2 className="h-4 w-4" />,
  "Foreign Languages": <Languages className="h-4 w-4" />,
  Business: <Briefcase className="h-4 w-4" />,
  Psychology: <Brain className="h-4 w-4" />,
};

const WORLD_ACCENTS: Record<string, string> = Object.fromEntries(
  INTEREST_WORLDS.map((world) => [world.label, `var(--color-world-${world.slug})`]),
);

export function InterestsStep({ state, patch, onNext, react, reactionNonce, percent, sprite }: StepProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} reactionNonce={reactionNonce} title="What sounds interesting?" subtitle="Choose up to 2" />
        {/* "Your picks" — same panel treatment as Work Vibe's "Your Setup":
           caption row (label + counter), then the picks side by side as
           Bricolage statements in their world colors, separated by a dot.
           flex-wrap lets two long names break onto a second line cleanly. */}
        <div className={`mb-3 rounded-xl border px-3.5 py-2.5 ${GLASS_PANEL_CLASS}`} style={{ background: GLASS_PANEL_BG, borderColor: GLASS_PANEL_BORDER }}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10.5px] font-bold tracking-[0.14em] text-[var(--color-night-muted-foreground)] uppercase">Your picks</span>
            <span
              className="text-[11px] font-bold tracking-wide"
              style={{ color: state.interests.length ? "color-mix(in srgb, var(--color-feedback-success-dark-surface) 55%, var(--color-night-foreground))" : "var(--color-night-muted-foreground)" }}
            >
              {state.interests.length} of 2
            </span>
          </div>
          <p className="mt-0.5 flex min-h-[24px] flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {state.interests.length === 0 && <span className="text-[13.5px] font-semibold text-[var(--color-night-muted-foreground)]">Pick up to two worlds below.</span>}
            {state.interests.map((interest, pickIndex) => (
              <span key={interest} className="flex items-baseline gap-2">
                {pickIndex > 0 && <span aria-hidden className="text-[13px] font-bold text-[var(--color-night-muted-foreground)]">·</span>}
                <span
                  className={`${bricolage.className} text-[17px] leading-tight font-extrabold motion-safe:animate-[dreamy-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)] sm:text-[18px]`}
                  style={{ color: `color-mix(in srgb, ${WORLD_ACCENTS[interest] ?? "var(--color-brand-400)"} 60%, var(--color-night-foreground))`, textShadow: `0 0 18px color-mix(in srgb, ${WORLD_ACCENTS[interest] ?? "var(--color-brand-400)"} 40%, transparent)` }}
                >
                  {interest}
                </span>
              </span>
            ))}
          </p>
        </div>
        <ChipGrid
          options={INTEREST_WORLDS.map((world) => world.label)}
          selected={state.interests}
          max={2}
          onChange={(interests) => patch({ interests })}
          accents={WORLD_ACCENTS}
          columns="grid-cols-2 lg:grid-cols-3"
          onPick={react}
        />
        <Citation>Harvard FAS Mignone + O*NET Interest Profiler</Citation>
      </GlassCard>
      </div>
      <StepFooter onNext={onNext} nextDisabled={state.interests.length === 0} />
    </div>
  );
}

export function SubjectsStep({ state, patch, onBack, onNext, react, reactionNonce, percent, sprite }: StepProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} reactionNonce={reactionNonce} title="Which subjects do you enjoy?" subtitle="Choose up to 2" />
        <ChipGrid
          options={SUBJECTS}
          selected={state.subjects}
          max={2}
          onChange={(subjects) => patch({ subjects })}
          icons={SUBJECT_ICONS}
          columns="grid-cols-2 lg:grid-cols-3"
          onPick={react}
        />
      </GlassCard>
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={state.subjects.length === 0} />
    </div>
  );
}

// Replit Work Vibe row (boxed variant): label + three pick-one pills.
function VibeButtonRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (next: string) => void;
}) {
  const confirming = useConfirmGlow(value !== null);
  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${GLASS_PANEL_CLASS}`} style={{ background: GLASS_PANEL_BG, borderColor: GLASS_PANEL_BORDER }}>
      <p className="text-[10.5px] font-bold tracking-[0.14em] text-[var(--color-night-muted-foreground)] uppercase">{label}</p>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          const glowing = isSelected && confirming;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={(e) => {
                dispatchAuroraPulse("select", e);
                onChange(option);
              }}
              className={`relative rounded-xl border px-2 py-2 text-[13px] font-semibold transition-all duration-150 hover:-translate-y-px ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
              style={{
                background: isSelected ? "color-mix(in srgb, var(--color-brand-500) 22%, var(--color-glass-surface-raised))" : "var(--color-glass-surface-2)",
                borderColor: isSelected ? "var(--color-brand-400)" : GLASS_PANEL_BORDER,
                color: isSelected ? "var(--color-night-foreground)" : "color-mix(in srgb, var(--color-night-foreground) 80%, transparent)",
                boxShadow: glowing ? "0 0 0 1px var(--color-brand-400), 0 4px 18px -2px color-mix(in srgb, var(--color-brand-400) 65%, transparent)" : undefined,
              }}
            >
              <ConfirmShimmer active={glowing} />
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Chosen values render as prominent Bricolage statements (per direct
// feedback: selected items show up vibrantly, no chips).
function SetupValue({ value, placeholder }: { value: string | null; placeholder: string }) {
  if (!value) return <span className="text-[13.5px] font-semibold text-[var(--color-night-muted-foreground)]">{placeholder}</span>;
  return (
    <span
      className={`${bricolage.className} text-[17px] leading-tight font-extrabold motion-safe:animate-[dreamy-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)] sm:text-[18px]`}
      style={{ color: "color-mix(in srgb, var(--color-brand-400) 55%, var(--color-night-foreground))", textShadow: "0 0 18px color-mix(in srgb, var(--color-brand-400) 45%, transparent)" }}
    >
      {value}
    </span>
  );
}

export function WorkVibeStep({ state, patch, onBack, onNext, react, reactionNonce, percent, sprite }: StepProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} reactionNonce={reactionNonce} title="Where do you work best?" subtitle="Pick one from each row." />
        {/* Replit pattern: options on the left, the chosen words rise on the
           RIGHT as vibrant statements — a different rhythm from the grid
           steps. On phones the summary tucks below the rows. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_224px]">
          <div className="flex flex-col gap-3">
            <VibeButtonRow label="Your Energy" options={ENERGY_OPTIONS} value={state.energy} onChange={(energy) => { react(); patch({ energy }); }} />
            <VibeButtonRow label="Your Team Style" options={TEAM_OPTIONS} value={state.teamStyle} onChange={(teamStyle) => { react(); patch({ teamStyle }); }} />
          </div>
          <div
            className={`flex flex-col justify-center gap-4 rounded-xl border px-4 py-4 ${GLASS_PANEL_CLASS}`}
            style={{ background: GLASS_PANEL_BG, borderColor: GLASS_PANEL_BORDER }}
          >
            <p className="text-[10.5px] font-bold tracking-[0.14em] text-[var(--color-night-muted-foreground)] uppercase">Your Setup</p>
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--color-night-muted-foreground)] uppercase">Energy</p>
              <p className="mt-0.5"><SetupValue value={state.energy} placeholder="Pick one…" /></p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--color-night-muted-foreground)] uppercase">Team style</p>
              <p className="mt-0.5"><SetupValue value={state.teamStyle} placeholder="Pick one…" /></p>
            </div>
          </div>
        </div>
        <Citation>MIT CAPD Self Assessment + O*NET Work Styles</Citation>
      </GlassCard>
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!state.energy || !state.teamStyle} />
    </div>
  );
}

export function EducationStep({ state, patch, onBack, onNext, react, percent, sprite }: StepProps) {
  const confirming = useConfirmGlow(!!state.education);
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} title="How much school feels right for you?" />
        {/* Auto-fit grid, not the old horizontal-scroll-on-mobile pattern (per
           direct feedback: a scrolling row of answer options reads as broken,
           not as a deliberate rhythm change). Fits as many of the 5 cards as
           the width allows in one row and wraps the rest -- on a typical phone
           that's 2 per row, tablet usually 3-4, desktop all 5 in one row --
           instead of a fixed breakpoint guess that can still overflow or cut
           cards off at in-between widths (tablet split-view, foldables, etc). */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
          {EDUCATION_OPTIONS.map((option, optionIndex) => {
            const isSelected = state.education === option.title;
            const glowing = isSelected && confirming;
            return (
              <button
                key={option.title}
                type="button"
                aria-pressed={isSelected}
                onClick={(e) => {
                  dispatchAuroraPulse("select", e);
                  react();
                  patch({ education: option.title });
                }}
                className={`relative h-full rounded-xl border px-3.5 py-3 text-left transition-all duration-150 hover:-translate-y-px ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
                style={{
                  background: isSelected ? "color-mix(in srgb, var(--color-brand-500) 22%, var(--color-glass-surface-raised))" : "var(--color-glass-surface-raised)",
                  borderColor: isSelected ? "var(--color-brand-400)" : GLASS_PANEL_BORDER,
                  boxShadow: glowing ? "0 0 0 1px var(--color-brand-400), 0 4px 18px -2px color-mix(in srgb, var(--color-brand-400) 65%, transparent)" : undefined,
                  ...cascade(optionIndex),
                }}
              >
                <ConfirmShimmer active={glowing} />
                {(() => { const Icon = EDUCATION_ICONS[optionIndex]; return <Icon className="mb-1.5 h-5 w-5" style={{ color: isSelected ? "var(--color-brand-300)" : "var(--color-night-muted-foreground)" }} aria-hidden />; })()}
                <span className="block text-[14px] font-bold text-[var(--color-night-foreground)]">{option.title}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!state.education} />
    </div>
  );
}

const UNDERLINE_INPUT =
  "w-full border-0 border-b bg-transparent px-0 py-2.5 text-[15px] font-semibold text-[var(--color-night-foreground)] outline-none transition-colors placeholder:text-[var(--color-night-muted-foreground)] placeholder:opacity-70 focus:border-[var(--color-brand-400)]";

// Grade/GPA as dropdowns (per feedback: pill walls read as information
// overload on the profile step). Native <select> = keyboard/screen-reader
// support for free; glass styling matches the flow's inputs.
function SelectField({ label, options, value, placeholder, onChange }: { label: string; options: string[]; value: string; placeholder: string; onChange: (next: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold tracking-wide text-[var(--color-night-muted-foreground)]">{label}</p>
      <div className="relative">
        <select
          value={value}
          aria-label={label}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full cursor-pointer appearance-none rounded-xl border px-3.5 py-2.5 text-[14px] font-semibold outline-none transition-colors focus:border-[var(--color-brand-400)] ${GLASS_PANEL_CLASS}`}
          style={{
            background: GLASS_PANEL_BG,
            borderColor: value ? "var(--color-brand-400)" : GLASS_PANEL_BORDER,
            color: value ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)",
          }}
        >
          <option value="" disabled style={{ color: "#4a4f6d", background: "#0b0e1f" }}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} style={{ color: "#f4f7ff", background: "#0b0e1f" }}>
              {option}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[var(--color-night-muted-foreground)]"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

// Figma Profile frame (3009:15398): underline text inputs, dropdowns for
// grade/GPA. Fields are labelled, not asked — "Full Name" beats "What is your
// full name?" on a form where the answer is obvious, and four questions in a
// row was the flow's densest block of reading.
export function ProfileStep({ state, patch, onBack, onNext, react, percent, almostDone, sprite }: StepProps) {
  const valid = state.fullName.trim().length > 0 && state.email.trim().length > 3 && state.grade !== "" && state.gpa !== "";
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} almostDone={almostDone} />
      <div className="flex min-h-0 flex-1 flex-col" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} title="Profile Basics" />
        <div className="flex flex-col gap-4">
          <input
            className={UNDERLINE_INPUT}
            style={{ borderBottomColor: "var(--color-glass-stroke)" }}
            placeholder="Full Name"
            aria-label="Full name"
            value={state.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            autoComplete="name"
          />
          <div>
            <input
              type="email"
              className={UNDERLINE_INPUT}
              style={{ borderBottomColor: "var(--color-glass-stroke)" }}
              placeholder="School Email"
              aria-label="School email"
              value={state.email}
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
            />
            <p className="mt-1 text-[11px] font-medium text-[var(--color-night-muted-foreground)] opacity-80">Use your school one if you have it.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField label="Grade" options={GRADE_OPTIONS} value={state.grade} placeholder="Select" onChange={(grade) => { react(); patch({ grade }); }} />
            <SelectField label="GPA" options={GPA_OPTIONS} value={state.gpa} placeholder="Select" onChange={(gpa) => { react(); patch({ gpa }); }} />
          </div>
          <div>
            <p className="mt-1.5 text-[11px] font-medium text-[var(--color-night-muted-foreground)] opacity-80">
              Your GPA does not define you. It just helps us find realistic schools.
            </p>
          </div>
          <input
            className={UNDERLINE_INPUT}
            style={{ borderBottomColor: "var(--color-glass-stroke)" }}
            placeholder="Zip Code"
            aria-label="Zip code"
            inputMode="numeric"
            maxLength={5}
            value={state.zipCode}
            onChange={(e) => patch({ zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) })}
            autoComplete="postal-code"
          />
          <SelectField
            label="How far would you go for school?"
            options={TRAVEL_DISTANCE_OPTIONS}
            value={state.travelDistance}
            placeholder="Select"
            onChange={(travelDistance) => { react(); patch({ travelDistance }); }}
          />
        </div>
      </GlassCard>
      </div>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!valid} nextLabel={<span className="inline-flex items-center gap-[6px]">Finish<ArrowRight size={15} strokeWidth={2.75} aria-hidden /></span>} />
    </div>
  );
}

// 50% interstitial — celebration beat. Dreamy parties: dedicated bounce keyframe
// (globals.css: dreamy-celebrate) instead of the ambient float, plus the page-level
// Confetti the orchestrator fires for this stage.
export function MilestoneScreen({ onNext, percent }: { onNext: () => void; percent: number }) {
  const [burstNonce, setBurstNonce] = useState(0);
  useEffect(() => {
    const chime = setTimeout(() => playMilestoneChime(), 200);
    const kick = setTimeout(() => setBurstNonce(1), 60);
    const interval = setInterval(() => setBurstNonce((n) => (n < 4 ? n + 1 : n)), 1300);
    return () => {
      clearTimeout(chime);
      clearTimeout(kick);
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <CardHud percent={percent} />
      <GlassCard className="text-center">
        {/* No "50% Complete" eyebrow: the HUD two lines up already says it. */}
        <div data-dreamy-anchor className="relative mx-auto mt-4 mb-2 h-28 w-28 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite] sm:h-32 sm:w-32">
          <Image src="/images/dreamy/v2/dreamy-party.png" alt="Dreamy celebrating" fill sizes="128px" className="object-contain" />
          <LocalBurst nonce={burstNonce} />
        </div>
        <h1 className={`${bricolage.className} text-[30px] font-extrabold text-[var(--color-night-foreground)] sm:text-[36px]`}><InkText text="You’re moving fast. 🚀" /></h1>
        <p className="mt-2 text-[15px] font-medium text-[var(--color-night-muted-foreground)] sm:text-[16px]">The good part is coming.</p>
      </GlassCard>
      <div className="mt-5 flex justify-center">
        {/* Dreamy IS this screen -- the pulse always launches from him here rather than
           leaving it to the usual one-in-three coin flip. */}
        <Button variant="primary" size="large" onClick={(e) => { dispatchAuroraPulse("cta", e, { forceDreamyOrigin: true }); onNext(); }} type="button">
          <span className="inline-flex items-center gap-[6px]">Continue<ArrowRight size={15} strokeWidth={2.75} aria-hidden /></span>
        </Button>
      </div>
    </div>
  );
}

export function CompletionScreen({ onSeeMatches }: { onSeeMatches: () => void }) {
  const [burstNonce, setBurstNonce] = useState(0);
  useEffect(() => {
    const chime = setTimeout(() => playMilestoneChime(), 200);
    const kick = setTimeout(() => setBurstNonce(1), 60);
    const interval = setInterval(() => setBurstNonce((n) => (n < 4 ? n + 1 : n)), 1300);
    return () => {
      clearTimeout(chime);
      clearTimeout(kick);
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="mx-auto w-full max-w-[640px]">
      <GlassCard className="text-center">
        <div className="relative mx-auto mb-3 h-28 w-28 sm:h-32 sm:w-32 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite]">
          <Image src="/images/dreamy/v2/dreamy-party.png" alt="Dreamy celebrating" fill sizes="128px" className="object-contain" />
          <LocalBurst nonce={burstNonce} />
          <span
            aria-hidden
            className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full text-white"
            style={{ background: "var(--color-feedback-success-dark-surface)", boxShadow: "0 6px 16px -4px rgba(51,199,140,0.6)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        </div>
        <h1 className={`${bricolage.className} text-[32px] font-extrabold text-[var(--color-night-foreground)] sm:text-[38px]`}><InkText text="Congratulations!" /></h1>
      </GlassCard>
      <div className="mt-5 flex justify-center">
        <Button variant="primary" size="large" onClick={(e) => { dispatchAuroraPulse("cta", e); onSeeMatches(); }} type="button">
          <span className="inline-flex items-center gap-[6px]">See matches<ArrowRight size={15} strokeWidth={2.75} aria-hidden /></span>
        </Button>
      </div>
    </div>
  );
}
