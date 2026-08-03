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
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex w-full flex-col gap-4">
          <GifBanner gifId="l3nFh9xbJtZYc6UhO" alt="SpongeBob: Welcome to the future" dimCaption={false} />

          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
            {VALUES.map((value) => {
              const index = values.indexOf(value);
              const selected = index !== -1;
              const disabled = !selected && values.length >= MAX_VALUES;
              return <GridOption key={value} label={value} selected={selected} disabled={disabled} onClick={() => onToggleValue(value)} />;
            })}
          </div>
        </div>

        {/* lg:h-full (with the parent row switched to items-stretch) + lg:justify-center
            makes this a real right-side column spanning the full card height instead of
            a short box that just hugs its own content, matching AcademicJourneyStep's
            and WorkStyleStep's own setup panels. */}
        {values.length > 0 && (
          <div className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-tertiary p-4 text-center lg:h-full lg:w-[240px] lg:shrink-0 lg:justify-center dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-bold tracking-[1.4px] text-slate-600 uppercase dark:text-slate-400">Your priorities</p>
            <ol className="flex flex-row flex-wrap justify-center gap-x-3 gap-y-0.5 lg:flex-col lg:items-center lg:gap-1.5">
              {values.map((value, index) => (
                <li
                  key={value}
                  className="text-sm font-bold text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
                >
                  {index + 1}. {value}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

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
