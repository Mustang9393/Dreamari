"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { CardHud, ChipGrid, Citation, ConfirmShimmer, GLASS_PANEL_BG, GLASS_PANEL_BORDER, GLASS_PANEL_CLASS, GlassCard, InkText, LocalBurst, QuestionHeading, StepFooter, useConfirmGlow } from "./ui";
import { ChevronRight, BookOpen, Brain, Briefcase, Calculator, Code2, FlaskConical, GraduationCap, Landmark, Languages, Music, Palette, Rocket, Sparkles, Wrench } from "lucide-react";
import { bricolage } from "./fonts";
import { cascade } from "./variant";
import { playMilestoneChime, playXpRise } from "./sound";
import { awardDreamScore, peekDreamScoreAfter } from "@/lib/dreamScore";
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
  /** Jumps straight to the Match deck, bypassing the rest of Build (direct
      feedback, 5 Sept 2026: a fast path for running demos without taking
      someone through every question). Absent on the milestone/completion
      screens, which have nothing left to skip past. */
  onSkip?: () => void;
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

export function InterestsStep({ state, patch, onNext, react, reactionNonce, percent, sprite, onSkip }: StepProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} reactionNonce={reactionNonce} title="What sounds interesting?" subtitle="Choose up to 2" />
        {/* "Your picks" — same panel treatment as Work Vibe's "Your Setup":
           caption row (label + counter), then the picks side by side as
           Bricolage statements in their world colors, separated by a dot.
           flex-wrap lets two long names break onto a second line cleanly. */}
        <div className={`mb-3 rounded-[var(--radius-md)] border px-3.5 py-2.5 ${GLASS_PANEL_CLASS}`} style={{ background: GLASS_PANEL_BG, borderColor: GLASS_PANEL_BORDER }}>
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
      <StepFooter onNext={onNext} nextDisabled={state.interests.length === 0} onSkip={onSkip} />
    </div>
  );
}

export function SubjectsStep({ state, patch, onBack, onNext, react, reactionNonce, percent, sprite, onSkip }: StepProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ justifyContent: "safe center" }}>
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
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={state.subjects.length === 0} onSkip={onSkip} />
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
    <div className={`rounded-[var(--radius-lg)] border px-4 py-3.5 ${GLASS_PANEL_CLASS}`} style={{ background: GLASS_PANEL_BG, borderColor: GLASS_PANEL_BORDER }}>
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
              className={`dm-tap relative rounded-[var(--radius-md)] border px-2 py-2 text-[13px] font-semibold transition-all duration-150  ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
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

export function WorkVibeStep({ state, patch, onBack, onNext, react, reactionNonce, percent, sprite, onSkip }: StepProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ justifyContent: "safe center" }}>
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
            className={`flex flex-col justify-center gap-4 rounded-[var(--radius-md)] border px-4 py-4 ${GLASS_PANEL_CLASS}`}
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
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!state.energy || !state.teamStyle} onSkip={onSkip} />
    </div>
  );
}

export function EducationStep({ state, patch, onBack, onNext, react, percent, sprite, onSkip }: StepProps) {
  const confirming = useConfirmGlow(!!state.education);
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} title="How many years of education are you open to after high school?" />
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
                className={`dm-tap relative h-full rounded-[var(--radius-md)] border px-3.5 py-3 text-left transition-all duration-150  ${glowing ? "motion-safe:animate-[confirm-lift_0.42s_ease-out]" : ""}`}
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
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!state.education} onSkip={onSkip} />
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
          className={`w-full cursor-pointer appearance-none rounded-[var(--radius-md)] border px-3.5 py-2.5 text-[14px] font-semibold outline-none transition-colors focus:border-[var(--color-brand-400)] ${GLASS_PANEL_CLASS}`}
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
export function ProfileStep({ state, patch, onBack, onNext, react, percent, almostDone, sprite, onSkip }: StepProps) {
  // Name and email come from sign-up, so they are not asked again here
  // (Joshua Pierce and Usman, Slack, 6 Sept 2026). Zip code stays (cleared;
  // a street address never is).
  const valid = state.grade !== "" && state.gpa !== "";
  return (
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} almostDone={almostDone} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ justifyContent: "safe center" }}>
      <GlassCard>
        <QuestionHeading sprite={sprite} title="Profile Basics" />
        <div className="flex flex-col gap-4">
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
      <StepFooter onBack={onBack} onNext={onNext} nextDisabled={!valid} nextLabel={<span className="inline-flex items-center gap-[6px]">Finish<ChevronRight size={15} strokeWidth={2.75} aria-hidden /></span>} onSkip={onSkip} />
    </div>
  );
}

// 50% interstitial — celebration beat. Dreamy parties: dedicated bounce keyframe
// (globals.css: dreamy-celebrate) instead of the ambient float, plus the page-level
// Confetti the orchestrator fires for this stage.
export function MilestoneScreen({ onNext, onBack, percent }: { onNext: () => void; onBack: () => void; percent: number }) {
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
    // Same three-part skeleton as every step (CardHud pinned top, centered
    // middle, footer at the bottom): this screen used to be a free-floating
    // block, so the HUD drifted down to meet the content and the layout
    // jumped between steps. Back exists here too -- a celebration is not a
    // one-way door.
    <div className="flex h-full w-full flex-col">
      <CardHud percent={percent} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ justifyContent: "safe center" }}>
      <div className="mx-auto w-full max-w-[560px]">
      <GlassCard className="text-center">
        {/* No "50% Complete" eyebrow: the HUD two lines up already says it. */}
        <div data-dreamy-anchor className="relative mx-auto mt-4 mb-2 h-28 w-28 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite] sm:h-32 sm:w-32">
          <Image src="/images/dreamy/v2/dreamy-party.png" alt="Dreamy celebrating" fill sizes="128px" className="object-contain" />
          <LocalBurst nonce={burstNonce} />
        </div>
        <h1 className={`${bricolage.className} text-[30px] font-extrabold text-[var(--color-night-foreground)] sm:text-[36px]`}><InkText text="You’re moving fast. 🚀" /></h1>
        <p className="mt-2 text-[15px] font-medium text-[var(--color-night-muted-foreground)] sm:text-[16px]">The good part is coming.</p>
      </GlassCard>
      </div>
      </div>
      {/* Dreamy IS this screen -- the pulse always launches from him here. */}
      <StepFooter onBack={onBack} onNext={onNext} pulseFromDreamy nextLabel={<span className="inline-flex items-center gap-[6px]">Continue<ChevronRight size={15} strokeWidth={2.75} aria-hidden /></span>} />
    </div>
  );
}

// The one Congratulations screen (direct feedback, 5 Sept 2026): the
// climactic moment. Screen-wide confetti falls for the first seconds, Dreamy
// parties with local bursts, the chime plays, and the copy says what comes
// next. Its CTA goes straight to the Match deck.
// Soft, atmospheric palette: whites, lavender, blush, warm ivory. No blue
// and no yellow (direct feedback, 5 Sept 2026).
const SPARK_COLORS = ["#ffffff", "#e9d5ff", "#fbcfe8", "#fff4e0", "#f5e9ff", "#ffe4ec"];

/** Particle VFX for the landing: clean round points of light, two sizes
 *  (fine sparks and a few soft bokeh orbs), drifting outward and upward
 *  from the centre with a twinkle. Seeded from the index so a wave renders
 *  the same every time. */
function MagicSparkles({ count }: { count: number }) {
  const rnd = (i: number, k: number) => ((i * k) % 100) / 100;
  const dots = Array.from({ length: count }, (_, i) => {
    const a = rnd(i, 7919) * Math.PI * 2;
    const dist = 70 + rnd(i, 104729) * 290;
    const orb = i % 9 === 0;
    return {
      x: Math.cos(a) * dist,
      y: Math.sin(a) * dist * 0.7 - 70 - rnd(i, 331) * 60,
      size: orb ? 7 + rnd(i, 1301) * 6 : 2 + rnd(i, 1301) * 3,
      delay: rnd(i, 613) * 0.6,
      dur: 1.6 + rnd(i, 419) * 1.4,
      color: SPARK_COLORS[i % SPARK_COLORS.length],
      orb,
    };
  });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center">
      {dots.map((d, i) => (
        <span
          key={i}
          className={`magic-dust absolute ${d.orb ? "magic-orb" : ""}`}
          style={{
            width: d.size,
            height: d.size,
            ["--sx" as string]: `${d.x}px`,
            ["--sy" as string]: `${d.y}px`,
            ["--spark" as string]: d.color,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

const BUILD_XP = 100;
const COUNT_MS = 1100;
const HOLD_MS = 900;
const FLY_MS = 950;

export function CompletionScreen({ onSeeMatches, onBack }: { onSeeMatches: () => void; onBack: () => void }) {
  const [burstNonce, setBurstNonce] = useState(0);
  // sparkle waves over the card as the score lands (in place of confetti)
  const [sparkNonce, setSparkNonce] = useState(0);
  // The Dream Score moment (Joshua Pierce, 5 Sept 2026): +XP counts up from
  // 1 to 100 fast with a rising sweep, lands with confetti, Dreamy and the
  // chime, then lifts, floats and shrinks into its slot beside the menu,
  // where the header chip pops in. The points are banked as it arrives (or
  // on the way out, if the student taps Reveal before it gets there).
  const [xp, setXp] = useState(0);
  const [flown, setFlown] = useState(false);
  const xpRef = useRef<HTMLParagraphElement | null>(null);
  const awarded = useRef(false);
  const landedRef = useRef(false);
  useEffect(() => {
    const bank = () => {
      if (awarded.current) return;
      awarded.current = true;
      awardDreamScore("build-complete", BUILD_XP);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    playXpRise(COUNT_MS);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setXp(Math.max(1, Math.round(eased * BUILD_XP)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const land = COUNT_MS + 60;
    const chime = setTimeout(() => {
      landedRef.current = true;
      playMilestoneChime();
      // the background pulses out from Dreamy as the score lands (the 50%
      // screen's pulse), glow only, no traced ring; the chime is the sound
      dispatchAuroraPulse("cta", undefined, { forceDreamyOrigin: true, soft: true, silent: true });
    }, land);
    const kick = setTimeout(() => setBurstNonce(1), land);
    const rain = setTimeout(() => setSparkNonce(1), land);
    const stop = setTimeout(() => setSparkNonce(2), land + 900);
    const interval = setInterval(() => setBurstNonce((n) => (n < 4 ? n + 1 : n)), 1300);
    let flight: Animation | null = null;
    let clone: HTMLElement | null = null;
    let trail: ReturnType<typeof setInterval> | null = null;
    const fly = setTimeout(() => {
      const el = xpRef.current;
      if (!el || reduce) { setFlown(true); bank(); return; }
      const from = el.getBoundingClientRect();
      // Where the header chip will sit: just left of the menu button, at
      // the chip's own width -- a hardcoded half-width guess (42px, "100 XP"
      // sized) only ever slotted in cleanly for a first-ever 3-digit score;
      // any other total sat off-center, and a wide one on a narrow viewport
      // could push the guess past the screen edge entirely (direct
      // feedback, 7 Sept 2026). An invisible probe with the chip's own
      // classes and the score it will actually show measures the real width.
      const menu = document.querySelector("header button") as HTMLElement | null;
      const m = menu?.getBoundingClientRect();
      let chipHalfWidth = 42;
      if (m) {
        const finalScore = peekDreamScoreAfter("build-complete", BUILD_XP);
        const probe = document.createElement("span");
        probe.setAttribute("aria-hidden", "true");
        probe.className = "flex h-9 items-center gap-[5px] px-[10px] text-[12.5px] leading-[16px] font-bold tabular-nums";
        probe.style.cssText = "position:fixed; left:-9999px; top:-9999px; visibility:hidden; white-space:nowrap;";
        probe.style.fontFamily = "var(--font-body)";
        probe.innerHTML = `<span style="display:inline-block;width:14px;height:14px;flex:none"></span>${finalScore.toLocaleString("en-US")} XP`;
        (el.closest(".marketing-v2") ?? document.body).appendChild(probe);
        chipHalfWidth = probe.getBoundingClientRect().width / 2;
        probe.remove();
      }
      const targetCx = m ? m.left - 10 - chipHalfWidth : window.innerWidth - 120;
      const targetCy = m ? m.top + m.height / 2 : 38;
      clone = el.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, { position: "fixed", left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, margin: "0", zIndex: "70", pointerEvents: "none", animation: "none", visibility: "visible", willChange: "transform, opacity", filter: "drop-shadow(0 0 18px color-mix(in srgb, var(--primary) 60%, transparent))" });
      // inside the flow's theme scope (the body has none of its colour
      // variables, so a body-level copy rendered as transparent text)
      (el.closest(".marketing-v2") ?? document.body).appendChild(clone);
      setFlown(true);
      const dx = targetCx - (from.left + from.width / 2);
      const dy = targetCy - (from.top + from.height / 2);
      flight = clone.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1, offset: 0 },
          { transform: `translate(${dx * 0.08}px, -56px) scale(1.08)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 40}px) scale(0.7)`, opacity: 1, offset: 0.62 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.28)`, opacity: 0.85, offset: 1 },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(0.3, 0.6, 0.15, 1)", fill: "forwards" },
      );
      // a trail of sparks peeling off the score as it travels
      const host = clone.parentElement ?? document.body;
      trail = setInterval(() => {
        if (!clone) return;
        const r = clone.getBoundingClientRect();
        const spark = document.createElement("span");
        spark.className = "xp-trail-spark";
        const size = 3 + Math.random() * 5;
        Object.assign(spark.style, {
          left: `${r.left + r.width * (0.35 + Math.random() * 0.3)}px`,
          top: `${r.top + r.height * (0.3 + Math.random() * 0.4)}px`,
          width: `${size}px`,
          height: `${size}px`,
          ["--tx" as string]: `${(Math.random() - 0.5) * 70}px`,
          ["--ty" as string]: `${20 + Math.random() * 60}px`,
          ["--spark" as string]: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
        });
        host.appendChild(spark);
        setTimeout(() => spark.remove(), 900);
      }, 38);
      flight.onfinish = () => { clone?.remove(); clone = null; if (trail) clearInterval(trail); trail = null; bank(); };
    }, land + HOLD_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(chime);
      clearTimeout(kick);
      clearTimeout(rain);
      clearTimeout(stop);
      clearTimeout(fly);
      clearInterval(interval);
      flight?.cancel();
      clone?.remove();
      if (trail) clearInterval(trail);
      // leaving after the count landed (Reveal tapped mid-flight) still banks
      // the points; an unmount before that (dev double-invoke) does not
      if (landedRef.current) bank();
    };
  }, []);
  const landed = xp >= BUILD_XP;
  return (
    <div className="flex h-full w-full flex-col">
      {/* The HUD stays on the last screen too, at 100 -- it had simply
         disappeared here, so the bar the student watched fill for eight
         steps never got to show itself full. */}
      <CardHud percent={100} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto" style={{ justifyContent: "safe center" }}>
      <div className="mx-auto w-full max-w-[640px]">
      <GlassCard className="text-center">
        <div data-dreamy-anchor className="relative mx-auto mb-3 h-28 w-28 sm:h-32 sm:w-32 motion-safe:animate-[dreamy-celebrate_1.1s_ease-in-out_infinite]">
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
        {/* the score: counts 1 to 100, then pops as it lands */}
        {/* the label and the number share one block that collapses once the
           number has flown, so the copy below rises to sit under the title
           instead of leaving a hole (direct feedback, 5 Sept 2026) */}
        <div className="overflow-hidden transition-[max-height,opacity] duration-500 ease-out" style={{ maxHeight: flown ? 0 : 140, opacity: flown ? 0 : 1 }}>
          {/* the name of the system, said once, where it is first earned: the
             unit students see is XP, the system is the Dream Score */}
          <p className="mt-3 text-[11px] leading-[15px] font-bold tracking-[0.16em] uppercase motion-safe:animate-[fade-slide-up_0.5s_ease-out_0.2s_both]" style={{ color: "var(--color-night-muted-foreground)" }}>Dream Score</p>
          <p
            ref={xpRef}
            aria-live="polite"
            className={`${bricolage.className} xp-shimmer-text mt-1 flex items-center justify-center gap-[8px] text-[40px] leading-[44px] font-extrabold tabular-nums sm:text-[48px] sm:leading-[52px] ${landed ? "motion-safe:animate-[dreamy-pop_0.6s_cubic-bezier(0.16,1,0.3,1)_both]" : ""}`}
            style={{ filter: landed ? "drop-shadow(0 0 18px color-mix(in srgb, var(--primary) 60%, transparent))" : "none" }}
          >
            <Sparkles className="h-7 w-7 flex-none sm:h-8 sm:w-8" aria-hidden style={{ color: "var(--accent-subtle)" }} /> <span className="xp-shimmer-ink">+{xp} XP</span>
          </p>
        </div>
        <p className="mt-3 text-[16px] leading-[22px] font-semibold text-[var(--color-night-foreground)] motion-safe:animate-[fade-slide-up_0.6s_ease-out_1.2s_both] sm:text-[18px] sm:leading-[24px]">Your personalized career matches are ready.</p>
      </GlassCard>
      </div>
      </div>
      {/* the success is sparkles, not confetti (direct feedback, 5 Sept 2026):
         two waves of stars bloom out from the centre and drift up */}
      {sparkNonce > 0 && <MagicSparkles key={sparkNonce} count={sparkNonce === 1 ? 84 : 48} />}
      <StepFooter onBack={onBack} onNext={onSeeMatches} pulseFromDreamy nextLabel={<span className="inline-flex items-center gap-[6px]">Reveal My Matches<ChevronRight size={15} strokeWidth={2.75} aria-hidden /></span>} />
    </div>
  );
}
