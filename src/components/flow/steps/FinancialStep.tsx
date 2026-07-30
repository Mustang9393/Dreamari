import { FlowActions } from "../FlowActions";
import { FlowCard } from "../FlowCard";
import { SelectionRow } from "../SelectionRow";
import { HandIcon, LightbulbIcon, PiggyBankIcon, ScaleIcon } from "../icons";

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
    <FlowCard>
      <div className="flex w-full flex-col gap-2">
        <p className="w-full text-2xl leading-[32px] font-bold text-slate-900 dark:text-white">What Feels Right Financially?</p>
        <p className="w-full text-sm font-medium text-slate-600 dark:text-slate-300">Pick one</p>
      </div>

      <div className="flex w-full flex-col gap-3">
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

      <div className="h-px w-full bg-border-subtle dark:bg-white/10" />

      <div className="flex w-full items-start gap-2">
        <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-slate-500 dark:text-slate-400" />
        <p className="flex-1 text-[11px] text-slate-500 dark:text-slate-400">Financial fit improves completion rates by 40 percent (NCES, 2022).</p>
      </div>

      <FlowActions nextLabel="Next" onBack={onBack} onNext={onNext} />
    </FlowCard>
  );
}
