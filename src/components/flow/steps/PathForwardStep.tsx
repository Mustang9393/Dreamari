import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { PathOption } from "../PathOption";
import { StepHeader } from "../StepHeader";

const OPTIONS = [
  { title: "2–4 years", sub: "Trade school, community college, or associate degree", emoji: "⚡" },
  { title: "4 years", sub: "Traditional 4-year university or bachelor's degree", emoji: "🎓" },
  { title: "6+ years", sub: "Graduate or professional school (law, medicine, etc.)", emoji: "🔬" },
];

type PathForwardStepProps = {
  pathForward: number;
  onChange: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
};

export function PathForwardStep({ pathForward, onChange, onBack, onNext }: PathForwardStepProps) {
  return (
    <FlowCard
      header={
        <StepHeader
          eyebrow="FUTURE HORIZONS"
          title="Design Your Path Forward"
          subtitle="How long are you thinking about studying after high school?"
          onBack={onBack}
        />
      }
    >
      <div className="flex w-full flex-col gap-2 sm:gap-3.5">
        {OPTIONS.map((option, index) => (
          <PathOption
            key={option.title}
            icon={option.emoji}
            title={option.title}
            sub={option.sub}
            selected={pathForward === index}
            onClick={() => onChange(index)}
          />
        ))}
      </div>

      <FlowButton onClick={onNext} className="mt-2 sm:mt-3">
        Complete Build Phase →
      </FlowButton>
    </FlowCard>
  );
}
