import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GridOption } from "../GridOption";
import { StepHeader } from "../StepHeader";

const ACTIVITIES = ["Build things", "Solve problems", "Help people", "Be creative", "Lead others", "Stay organized"];

const MAX_ACTIVITIES = 3;

type SpendYourDaysStepProps = {
  activities: string[];
  onToggleActivity: (activity: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function SpendYourDaysStep({ activities, onToggleActivity, onBack, onNext }: SpendYourDaysStepProps) {
  return (
    <FlowCard
      header={<StepHeader eyebrow="CAREER INTERESTS" title="How Do You Want to Spend Your Days?" subtitle="Pick up to 3" onBack={onBack} />}
    >
      <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ACTIVITIES.map((activity) => {
          const selected = activities.includes(activity);
          const disabled = !selected && activities.length >= MAX_ACTIVITIES;
          return <GridOption key={activity} label={activity} selected={selected} disabled={disabled} onClick={() => onToggleActivity(activity)} />;
        })}
      </div>

      <p className="w-full text-center text-sm font-bold text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">
        {activities.length}/{MAX_ACTIVITIES} selected
      </p>

      <div className="mt-2 flex w-full flex-col gap-3.5 sm:mt-3">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
        <p className="w-full text-center text-[10px] leading-tight text-slate-600 dark:text-slate-400">
          Based on Holland RIASEC Interest Framework — U.S. Department of Labor
        </p>
      </div>
    </FlowCard>
  );
}
