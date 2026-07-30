import { Chip } from "../Chip";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GifBanner } from "../GifBanner";

const SKILLS = ["Problem Solving", "Communication", "Creativity", "Leadership", "Teamwork", "Analysis", "Organization", "Adaptability"];

const MAX_STRENGTHS = 3;

type ConfidenceCheckStepProps = {
  strengths: string[];
  onToggleStrength: (strength: string) => void;
  onNext: () => void;
};

export function ConfidenceCheckStep({ strengths, onToggleStrength, onNext }: ConfidenceCheckStepProps) {
  return (
    <FlowCard>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-[0.8px] text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">SELF EFFICACY</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">What are you naturally good at?</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select up to 3 strengths</p>
      </div>

      <GifBanner gifId="111ebonMs90YLu" alt="Thumbs up" />

      <div className="flex flex-wrap gap-2">
        {SKILLS.map((skill) => {
          const index = strengths.indexOf(skill);
          const selected = index !== -1;
          const disabled = !selected && strengths.length >= MAX_STRENGTHS;
          return (
            <Chip
              key={skill}
              label={skill}
              selected={selected}
              order={selected ? index + 1 : null}
              onClick={() => !disabled && onToggleStrength(skill)}
            />
          );
        })}
      </div>

      {strengths.length > 0 && (
        <div className="w-full rounded-xl bg-[color-mix(in_srgb,var(--step-accent)_14%,white)] p-3.5 dark:bg-[color-mix(in_srgb,var(--step-accent)_20%,black)]">
          <p className="text-sm font-semibold text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">Nice ✨ {strengths[0]} is a superpower in almost every field!</p>
        </div>
      )}

      <div className="flex w-full flex-col gap-3.5">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
        <p className="w-full text-center text-[11px] text-slate-500 dark:text-slate-400">
          Grounded in Bandura&apos;s Self-Efficacy Theory (Stanford University)
        </p>
      </div>
    </FlowCard>
  );
}
