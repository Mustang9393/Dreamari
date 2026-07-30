import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { LabeledInput } from "../LabeledInput";
import { LabeledSelect } from "../LabeledSelect";

const GRADE_LEVELS = ["9th Grade", "10th Grade", "11th Grade", "12th Grade"];

type AboutYouStepProps = {
  fullName: string;
  schoolWorkplace: string;
  gradeLevel: string;
  onChangeFullName: (value: string) => void;
  onChangeSchoolWorkplace: (value: string) => void;
  onChangeGradeLevel: (value: string) => void;
  onNext: () => void;
};

export function AboutYouStep({
  fullName,
  schoolWorkplace,
  gradeLevel,
  onChangeFullName,
  onChangeSchoolWorkplace,
  onChangeGradeLevel,
  onNext,
}: AboutYouStepProps) {
  return (
    <FlowCard>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-[0.8px] text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">BASIC INFO</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">Tell Me About Yourself</p>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">So I Can Find Your Perfect Matches</p>
      </div>
      <div className="flex w-full flex-col gap-5">
        <LabeledInput label="What's your full name?" value={fullName} onChange={onChangeFullName} />
        <LabeledInput label="What's your school or workplace?" value={schoolWorkplace} onChange={onChangeSchoolWorkplace} />
        <LabeledSelect
          label="What grade or stage are you in?"
          value={gradeLevel}
          options={GRADE_LEVELS}
          onChange={onChangeGradeLevel}
          highlighted
        />
      </div>
      <FlowButton onClick={onNext}>
        Continue →
      </FlowButton>
    </FlowCard>
  );
}
