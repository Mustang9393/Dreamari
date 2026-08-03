import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GifBanner } from "../GifBanner";
import { GridOption } from "../GridOption";
import { StepHeader } from "../StepHeader";

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
    <FlowCard
      header={
        <StepHeader
          eyebrow="CONFIDENCE CHECK"
          title="What are you most confident doing?"
          subtitle="Pick up to 3 strengths you already have"
          onBack={onBack}
        />
      }
    >
      <GifBanner gifId="G1X87RbwxK2EgZQbAd" alt="Cristiano Ronaldo looking confident" focus="center" maxHeight={190} />

      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SKILLS.map((skill) => {
          const index = strengths.indexOf(skill);
          const selected = index !== -1;
          const disabled = !selected && strengths.length >= MAX_STRENGTHS;
          return <GridOption key={skill} label={skill} selected={selected} disabled={disabled} onClick={() => onToggleStrength(skill)} />;
        })}
      </div>

      <div className="mt-2 flex w-full flex-col gap-3.5 sm:mt-3">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
        <p className="w-full text-center text-[10px] leading-tight text-slate-600 dark:text-slate-400">
          Based on Self-Efficacy Theory — Albert Bandura, Stanford University
        </p>
      </div>
    </FlowCard>
  );
}
