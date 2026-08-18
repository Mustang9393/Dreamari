"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { CardHud, ChipGrid, Citation, GlassCard, InkText, QuestionHeading, StepFooter } from "./ui";
import { LocalBurst } from "./DreamyGuide";
import { BookOpen, Brain, Briefcase, Calculator, Code2, FlaskConical, Globe, GraduationCap, Landmark, Languages, Music, Palette, Rocket, Sparkles, UserRound, Wrench, Zap } from "lucide-react";
import { bricolage } from "./fonts";
import { cascade, useVariant } from "./variant";
import {
  EDUCATION_OPTIONS,
  ENERGY_OPTIONS,
  GPA_OPTIONS,
  GRADE_OPTIONS,
  INTEREST_WORLDS,
  PATH_OPTIONS,
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
  percent: number;
  phase?: string;
  almostDone?: boolean;
};

const EDUCATION_ICONS = [Rocket, Wrench, GraduationCap, BookOpen, Sparkles];

// Tiny hook wrapper so ProfileStep can gate its in-body heading (the boxed
// version's header strip already carries the same words).
function useVariantIsCinematic() {
  return useVariant() === "cinematic";
}

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

export function InterestsStep({ state, patch, onNext, react, percent, phase }: StepProps) {
  return (
    <div className="w-full">
      <CardHud percent={percent} phase={phase} />
      <GlassCard header={{ icon: <Globe className="h-4 w-4" />, title: "Interests", constraint: "Choose up to 2" }}>
        <QuestionHeading title="What sounds interesting?" subtitle="Choose up to 2" />
        <div
          className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border px-3.5 py-2"
          style={{ background: "var(--color-glass-surface-1)", borderColor: "var(--color-glass-border)" }}
        >
          <span className="text-[12.5px] font-bold text-[var(--color-night-foreground)]">Your picks</span>
          {/* The actual selections, live, in pick order — not just a count. */}
          {state.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold"
              style={{
                borderColor: WORLD_ACCENTS[interest] ?? "var(--color-brand-400)",
                color: "var(--color-night-foreground)",
                background: `color-mix(in srgb, ${WORLD_ACCENTS[interest] ?? "var(--color-brand-400)"} 14%, transparent)`,
              }}
            >
              {interest}
            </span>
          ))}
          <span
            className="ml-auto text-[12.5px] font-semibold"
            style={{ color: state.interests.length ? "var(--color-feedback-success-dark-surface)" : "var(--color-night-muted-foreground)" }}
          >
            {state.interests.length} of 2 selected
          </span>
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
      <StepFooter onNext={onNext} nextDisabled={state.interests.length === 0} />
    </div>
  );
}

export function SubjectsStep({ state, patch, onBack, onNext, react, percent, phase }: StepProps) {
  return (
    <div className="w-full">
      <CardHud percent={percent} phase={phase} />
      <GlassCard header={{ icon: <BookOpen className="h-4 w-4" />, title: "Favorite Subjects", constraint: "Choose up to 2" }}>
        <QuestionHeading title="Which subjects do you enjoy?" subtitle="Choose up to 2" />
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
  return (
    <div className="rounded-2xl border px-4 py-3.5" style={{ background: "var(--color-glass-surface-1)", borderColor: "var(--color-glass-border)" }}>
      <p className="text-[10.5px] font-bold tracking-[0.14em] text-[var(--color-night-muted-foreground)] uppercase">{label}</p>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={(e) => {
                dispatchAuroraPulse("select", e);
                onChange(option);
              }}
              className="rounded-xl border px-2 py-2 text-[13px] font-semibold transition-all duration-150 hover:-translate-y-px"
              style={{
                background: isSelected ? "color-mix(in srgb, var(--color-brand-500) 22%, var(--color-glass-surface-1))" : "var(--color-glass-surface-2)",
                borderColor: isSelected ? "var(--color-brand-400)" : "var(--color-glass-border)",
                color: isSelected ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)",
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

// Figma's Work Vibe format (frame 3002:14540): each row is a card with the label,
// a value pill, and a 3-stop SLIDER — not buttons. Copy (labels/options) stays
// verbatim from the reference; the slider is the design system's input format.
function VibeSliderRow({
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
  const index = value ? options.indexOf(value) : -1;
  const fraction = index >= 0 ? index / (options.length - 1) : 0;
  return (
    <div className="rounded-2xl border px-4 py-3.5" style={{ background: "var(--color-glass-surface-1)", borderColor: "var(--color-glass-border)" }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10.5px] font-bold tracking-[0.14em] text-[var(--color-night-muted-foreground)] uppercase">{label}</p>
        <span
          className="rounded-full px-3 py-1 text-[11.5px] font-bold text-white transition-colors"
          style={{ background: index >= 0 ? "var(--color-accent-purple)" : "var(--color-glass-surface-2)", color: index >= 0 ? "#ffffff" : "var(--color-night-muted-foreground)", minWidth: 74, textAlign: "center" }}
        >
          {value ?? "…"}
        </span>
      </div>
      <div className="relative mt-3 h-7">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full" style={{ background: "var(--color-glass-surface-2)" }} />
        {index >= 0 && (
          <div
            className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full transition-[width] duration-200"
            style={{ width: `${fraction * 100}%`, background: "linear-gradient(90deg, var(--color-brand-500), var(--color-accent-purple))" }}
          />
        )}
        <input
          type="range"
          min={0}
          max={options.length - 1}
          step={1}
          value={index >= 0 ? index : 1}
          aria-label={label}
          aria-valuetext={value ?? "not set"}
          onChange={(e) => onChange(options[Number(e.target.value)])}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[left] duration-200"
          style={{
            left: `${(index >= 0 ? fraction : 0.5) * 100}%`,
            background: "var(--color-night-foreground)",
            borderColor: index >= 0 ? "var(--color-accent-purple)" : "var(--color-glass-stroke)",
            boxShadow: index >= 0 ? "0 0 0 5px color-mix(in srgb, var(--color-accent-purple) 22%, transparent)" : "0 3px 10px rgba(0,0,0,0.4)",
          }}
        />
      </div>
      <div className="mt-1 flex justify-between">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={(e) => {
              dispatchAuroraPulse("select", e);
              onChange(option);
            }}
            className="text-[11px] font-semibold transition-colors"
            style={{ color: value === option ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)", opacity: value === option ? 1 : 0.7 }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function WorkVibeStep({ state, patch, onBack, onNext, react, percent, phase }: StepProps) {
  const variant = useVariant();
  const glass = variant === "glass";
  const setupPanel = (
    <div
      className={`rounded-xl border px-3.5 py-2.5 ${glass ? "lg:w-[200px] lg:flex-none lg:self-start lg:px-4 lg:py-3" : "sm:col-span-2"}`}
      style={{ background: "var(--color-glass-surface-1)", borderColor: "var(--color-glass-border)" }}
    >
      <p className="text-[10.5px] font-bold tracking-[0.14em] text-[var(--color-night-muted-foreground)] uppercase">Your Setup</p>
      {glass ? (
        <div className="mt-2 hidden flex-col gap-1.5 lg:flex">
          <span className="text-[13.5px] font-semibold text-[var(--color-night-foreground)]">{state.energy ?? "Energy…"}</span>
          <span className="text-[13.5px] font-semibold text-[var(--color-night-foreground)]">{state.teamStyle ?? "Team…"}</span>
        </div>
      ) : null}
      <p className={`mt-0.5 text-[14px] font-semibold text-[var(--color-night-foreground)] ${glass ? "lg:hidden" : ""}`}>
        {state.energy ?? "Energy…"} · {state.teamStyle ?? "Team…"}
      </p>
    </div>
  );
  return (
    <div className="w-full">
      <CardHud percent={percent} phase={phase} />
      <GlassCard header={{ icon: <Zap className="h-4 w-4" />, title: "Work Vibe", constraint: "Pick one from each row" }}>
        <QuestionHeading title="Where do you work best?" subtitle="Pick one from each row." />
        {glass ? (
          /* Replit desktop layout: sliders stacked left, "Your Setup" as a side
             panel filling the column vertically; stacks on phones. */
          <div className="flex flex-col gap-3 lg:flex-row-reverse lg:items-start">
            {setupPanel}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <VibeButtonRow label="Your Energy" options={ENERGY_OPTIONS} value={state.energy} onChange={(energy) => { react(); patch({ energy }); }} />
              <VibeButtonRow label="Your Team Style" options={TEAM_OPTIONS} value={state.teamStyle} onChange={(teamStyle) => { react(); patch({ teamStyle }); }} />
            </div>
          </div>
        ) : (
          /* Side-by-side on ≥sm: a full-column track is mostly dead travel for a
             3-stop slider, and the two dials read as one decision when paired. */
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <VibeSliderRow label="Your Energy" options={ENERGY_OPTIONS} value={state.energy} onChange={(energy) => { react(); patch({ energy }); }} />
            <VibeSliderRow label="Your Team Style" options={TEAM_OPTIONS} value={state.teamStyle} onChange={(teamStyle) => { react(); patch({ teamStyle }); }} />
            {setupPanel}
          </div>
        )}
        <Citation>MIT CAPD Self Assessment + O*NET Work Styles</Citation>
      </GlassCard>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!state.energy || !state.teamStyle} />
    </div>
  );
}

export function EducationStep({ state, patch, onBack, onNext, react, percent, phase }: StepProps) {
  const variant = useVariant();
  return (
    <div className="w-full">
      <CardHud percent={percent} phase={phase} />
      <GlassCard header={{ icon: <GraduationCap className="h-4 w-4" />, title: "Education & Training", constraint: "Choose one" }}>
        <QuestionHeading title="How much school feels right for you?" />
        <div className="grid auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EDUCATION_OPTIONS.map((option, optionIndex) => {
            const isSelected = state.education === option.title;
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
                className="h-full rounded-xl border px-3.5 py-3 text-left transition-all duration-150 hover:-translate-y-px"
                style={{
                  background: isSelected ? "color-mix(in srgb, var(--color-brand-500) 22%, var(--color-glass-surface-1))" : "var(--color-glass-surface-1)",
                  borderColor: isSelected ? "var(--color-brand-400)" : "var(--color-glass-border)",
                  ...cascade(variant, optionIndex),
                }}
              >
                {(() => { const Icon = EDUCATION_ICONS[optionIndex]; return <Icon className="mb-1.5 h-5 w-5" style={{ color: isSelected ? "var(--color-brand-300)" : "var(--color-night-muted-foreground)" }} aria-hidden />; })()}
                <span className="block text-[14px] font-bold text-[var(--color-night-foreground)]">{option.title}</span>
                <span className="mt-0.5 block text-[12px] font-medium text-[var(--color-night-muted-foreground)]">{option.subtitle}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!state.education} />
    </div>
  );
}

const UNDERLINE_INPUT =
  "w-full border-0 border-b bg-transparent px-0 py-2.5 text-[15px] font-semibold text-[var(--color-night-foreground)] outline-none transition-colors placeholder:text-[var(--color-night-muted-foreground)] placeholder:opacity-70 focus:border-[var(--color-brand-400)]";

function PillGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (next: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold tracking-wide text-[var(--color-night-muted-foreground)]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={(e) => {
                dispatchAuroraPulse("select", e);
                onChange(option);
              }}
              className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-150 hover:-translate-y-px"
              style={{
                background: isSelected ? "color-mix(in srgb, var(--color-brand-500) 24%, var(--color-glass-surface-1))" : "var(--color-glass-surface-1)",
                borderColor: isSelected ? "var(--color-brand-400)" : "var(--color-glass-border)",
                color: isSelected ? "var(--color-night-foreground)" : "var(--color-night-muted-foreground)",
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

// Figma Profile frame (3009:15398): underline text inputs (question as
// placeholder), pill groups for grade/GPA — no dropdowns. Copy verbatim from
// the reference: field questions as placeholders/labels, the GPA reassurance as
// the card subline, "Use your school email if you have one." as the email hint.
export function ProfileStep({ state, patch, onBack, onNext, react, percent, phase, almostDone }: StepProps) {
  const valid = state.fullName.trim().length > 0 && state.email.trim().length > 3 && state.grade !== "" && state.gpa !== "";
  return (
    <div className="w-full">
      <CardHud percent={percent} phase={phase} almostDone={almostDone} />
      <GlassCard header={{ icon: <UserRound className="h-4 w-4" />, title: "Profile Basics", constraint: "Name, email, grade, and GPA" }}>
        {useVariantIsCinematic() && <QuestionHeading title="Profile Basics" subtitle="Name, email, grade, and GPA" />}
        <div className="flex flex-col gap-4">
          <input
            className={UNDERLINE_INPUT}
            style={{ borderBottomColor: "var(--color-glass-stroke)" }}
            placeholder="What is your full name?"
            aria-label="What is your full name?"
            value={state.fullName}
            onChange={(e) => patch({ fullName: e.target.value })}
            autoComplete="name"
          />
          <div>
            <input
              type="email"
              className={UNDERLINE_INPUT}
              style={{ borderBottomColor: "var(--color-glass-stroke)" }}
              placeholder="What is your school email?"
              aria-label="What is your school email?"
              value={state.email}
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
            />
            <p className="mt-1 text-[11px] font-medium text-[var(--color-night-muted-foreground)] opacity-80">Use your school email if you have one.</p>
          </div>
          <PillGroup label="What grade are you in?" options={GRADE_OPTIONS} value={state.grade} onChange={(grade) => { react(); patch({ grade }); }} />
          <div>
            <PillGroup label="What is your current GPA?" options={GPA_OPTIONS} value={state.gpa} onChange={(gpa) => { react(); patch({ gpa }); }} />
            <p className="mt-1.5 text-[11px] font-medium text-[var(--color-night-muted-foreground)] opacity-80">
              Your GPA does not define you. It just helps Dreamari find realistic schools and pathways.
            </p>
          </div>
        </div>
      </GlassCard>
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!valid} nextLabel="Finish →" />
    </div>
  );
}

// 50% interstitial — celebration beat. Dreamy parties: dedicated bounce keyframe
// (globals.css: dreamy-celebrate) instead of the ambient float, plus the page-level
// Confetti the orchestrator fires for this stage.
export function MilestoneScreen({ onNext, percent }: { onNext: () => void; percent: number }) {
  const [burstNonce, setBurstNonce] = useState(0);
  useEffect(() => {
    const kick = setTimeout(() => setBurstNonce(1), 60);
    const interval = setInterval(() => setBurstNonce((n) => (n < 4 ? n + 1 : n)), 1300);
    return () => {
      clearTimeout(kick);
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <CardHud percent={percent} />
      <GlassCard className="text-center">
        <p className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "var(--color-feedback-success-dark-surface)" }}>
          50% Complete
        </p>
        <div className="relative mx-auto mt-4 mb-2 h-28 w-28 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite] sm:h-32 sm:w-32">
          <Image src="/images/dreamy/v2/dreamy-party.png" alt="Dreamy celebrating" fill sizes="128px" className="object-contain" />
          <LocalBurst nonce={burstNonce} />
        </div>
        <h1 className={`${bricolage.className} text-[30px] font-extrabold text-[var(--color-night-foreground)] sm:text-[36px]`}><InkText text="You’re moving fast. 🚀" /></h1>
        <p className="mt-2 text-[15px] font-medium text-[var(--color-night-muted-foreground)] sm:text-[16px]">The good part is coming.</p>
      </GlassCard>
      <div className="mt-5 flex justify-center">
        <Button variant="primary" size="large" onClick={(e) => { dispatchAuroraPulse("cta", e); onNext(); }} type="button">
          Continue →
        </Button>
      </div>
    </div>
  );
}

const PATH_ICONS: Record<string, React.ReactNode> = {
  college: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  ),
  trades: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  both: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
};

export function CompletionScreen({ state, patch, onSeeMatches }: { state: BuildState; patch: (u: Partial<BuildState>) => void; onSeeMatches: () => void }) {
  const variant = useVariant();
  const [burstNonce, setBurstNonce] = useState(0);
  useEffect(() => {
    const kick = setTimeout(() => setBurstNonce(1), 60);
    const interval = setInterval(() => setBurstNonce((n) => (n < 4 ? n + 1 : n)), 1300);
    return () => {
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
        <p className="mt-2 text-[15px] font-medium text-[var(--color-night-muted-foreground)] sm:text-[16px]">Your profile is ready. Let&apos;s find your path.</p>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PATH_OPTIONS.map((option, optionIndex) => {
            const isSelected = state.path === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                onClick={(e) => {
                  dispatchAuroraPulse("select", e);
                  patch({ path: option.id });
                }}
                className="flex flex-col items-center gap-1 rounded-xl border px-3 py-4 transition-all duration-150 hover:-translate-y-px"
                style={{
                  background: isSelected ? "color-mix(in srgb, var(--color-brand-500) 22%, var(--color-glass-surface-1))" : "var(--color-glass-surface-1)",
                  borderColor: isSelected ? "var(--color-brand-400)" : "var(--color-glass-border)",
                  color: isSelected ? "var(--color-brand-300)" : "var(--color-night-muted-foreground)",
                  ...cascade(variant, optionIndex),
                }}
              >
                {PATH_ICONS[option.id]}
                <span className="text-[14px] font-bold text-[var(--color-night-foreground)]">{option.title}</span>
                <span className="text-[11.5px] font-medium text-[var(--color-night-muted-foreground)]">{option.subtitle}</span>
              </button>
            );
          })}
        </div>
      </GlassCard>
      <div className="mt-5 flex justify-center">
        <Button variant="primary" size="large" onClick={(e) => { dispatchAuroraPulse("cta", e); onSeeMatches(); }} disabled={!state.path} type="button">
          See Matches →
        </Button>
      </div>
    </div>
  );
}
