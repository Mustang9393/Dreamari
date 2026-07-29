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
        <p className="text-xs font-bold tracking-[0.8px] text-amber-600 dark:text-amber-300">BASIC INFO</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">Tell me about yourself</p>
      </div>
      <div className="flex w-full flex-col gap-5">
        <LabeledInput label="Full Name" value={fullName} onChange={onChangeFullName} />
        <LabeledInput label="School / Workplace" value={schoolWorkplace} onChange={onChangeSchoolWorkplace} />
        <LabeledSelect
          label="Grade Level / Stage"
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
