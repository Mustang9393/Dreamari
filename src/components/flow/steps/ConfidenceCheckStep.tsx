import { Chip } from "../Chip";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GifBanner } from "../GifBanner";

const SKILLS = ["Problem Solving", "Communication", "Creativity", "Leadership", "Teamwork", "Analysis", "Organization", "Adaptability"];

const MAX_STRENGTHS = 3;

type ConfidenceCheckStepProps = {
  strengths: string[];
  onToggleStrength: (strength: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function ConfidenceCheckStep({ strengths, onToggleStrength, onBack, onNext }: ConfidenceCheckStepProps) {
  return (
    <FlowCard onBack={onBack}>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-[0.8px] text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">CONFIDENCE CHECK</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">What are you most confident doing?</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pick up to 3 strengths you already have</p>
      </div>

      <GifBanner gifId="G1X87RbwxK2EgZQbAd" alt="Cristiano Ronaldo looking confident" focus="center" />

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
          Based on Self-Efficacy Theory — Albert Bandura, Stanford University
        </p>
      </div>
    </FlowCard>
  );
}
