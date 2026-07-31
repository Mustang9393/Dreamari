import { Chip } from "../Chip";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { BackButton } from "../BackButton";
import { GifBanner } from "../GifBanner";

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
    <FlowCard>
      <div className="flex w-full flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <BackButton onClick={onBack} />
          <p className="text-xs font-bold tracking-[0.8px] text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">FUTURE VALUES</p>
        </div>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">What are the three most important things for your future?</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pick up to 3</p>
      </div>

      <GifBanner gifId="l3nFh9xbJtZYc6UhO" alt="SpongeBob: Welcome to the future" />

      <div className="flex flex-wrap gap-2">
        {VALUES.map((value) => {
          const index = values.indexOf(value);
          const selected = index !== -1;
          const disabled = !selected && values.length >= MAX_VALUES;
          return (
            <Chip
              key={value}
              label={value}
              selected={selected}
              order={selected ? index + 1 : null}
              onClick={() => !disabled && onToggleValue(value)}
            />
          );
        })}
      </div>

      {values.length > 0 && (
        <div className="flex w-full flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-tertiary p-4 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-bold tracking-[1.4px] text-slate-500 uppercase dark:text-slate-400">Your priorities</p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {values.map((value, index) => `${index + 1}. ${value}`).join(" • ")}
          </p>
        </div>
      )}

      <div className="flex w-full flex-col gap-3.5">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
        <p className="w-full text-center text-[11px] text-slate-400/70 dark:text-slate-500/70">
          Based on Work Values Theory and Harvard University Career Services Self-Assessment Framework
        </p>
      </div>
    </FlowCard>
  );
}
