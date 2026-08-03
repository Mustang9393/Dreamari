import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { SelectionRow } from "../SelectionRow";
import { StepHeader } from "../StepHeader";
import { HandIcon, PiggyBankIcon, ScaleIcon } from "../icons";

const OPTIONS = [
  { title: "Cost matters a lot", sub: "I need the most affordable path possible", icon: <PiggyBankIcon /> },
  { title: "Somewhat important", sub: "I want good value but can invest a bit", icon: <ScaleIcon /> },
  { title: "Not a concern", sub: "I am focused on the best fit regardless of cost", icon: <HandIcon /> },
];

type FinancialStepProps = {
  financial: number;
  onChange: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
};

export function FinancialStep({ financial, onChange, onBack, onNext }: FinancialStepProps) {
  return (
    <FlowCard header={<StepHeader eyebrow="FINANCIAL FIT" title="What Feels Right Financially?" subtitle="Pick one" onBack={onBack} />}>
      <div className="flex w-full flex-col gap-2 sm:gap-3">
        {OPTIONS.map((option, index) => (
          <SelectionRow
            key={option.title}
            icon={option.icon}
            title={option.title}
            sub={option.sub}
            selected={financial === index}
            onClick={() => onChange(index)}
          />
        ))}
      </div>

      <div className="mt-2 flex w-full flex-col gap-3.5 sm:mt-3">
        <FlowButton onClick={onNext}>
          Next →
        </FlowButton>
        <p className="w-full text-center text-[10px] leading-tight text-slate-600 dark:text-slate-400">Financial fit improves completion rates by 40 percent (NCES, 2022).</p>
      </div>
    </FlowCard>
  );
}
