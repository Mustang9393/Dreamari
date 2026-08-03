import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GifBanner } from "../GifBanner";
import { GridOption } from "../GridOption";
import { StepHeader } from "../StepHeader";

const VALUES = ["Income", "Impact", "Creativity", "Stability", "Flexibility", "Recognition"];

const MAX_VALUES = 3;

type FutureValuesStepProps = {
  values: string[];
  onToggleValue: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function FutureValuesStep({ values, onToggleValue, onBack, onNext }: FutureValuesStepProps) {
  return (
    <FlowCard
      header={
        <StepHeader
          eyebrow="FUTURE VALUES"
          title="What are the three most important things for your future?"
          subtitle="Pick up to 3"
          onBack={onBack}
        />
      }
    >
      <GifBanner gifId="l3nFh9xbJtZYc6UhO" alt="SpongeBob: Welcome to the future" />

      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {VALUES.map((value) => {
          const index = values.indexOf(value);
          const selected = index !== -1;
          const disabled = !selected && values.length >= MAX_VALUES;
          return <GridOption key={value} label={value} selected={selected} disabled={disabled} onClick={() => onToggleValue(value)} />;
        })}
      </div>

      {values.length > 0 && (
        <div className="flex w-full flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-tertiary p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-bold tracking-[1.4px] text-slate-600 uppercase dark:text-slate-400">Your priorities</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {values.map((value, index) => `${index + 1}. ${value}`).join(" • ")}
          </p>
        </div>
      )}

      <div className="mt-2 flex w-full flex-col gap-3.5 sm:mt-3">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
        <p className="w-full text-center text-[10px] leading-tight text-slate-600 dark:text-slate-400">
          Based on Work Values Theory and Harvard University Career Services Self-Assessment Framework
        </p>
      </div>
    </FlowCard>
  );
}
