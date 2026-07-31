import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { StepHeader } from "../StepHeader";
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
  onBack: () => void;
  onNext: () => void;
};

export function AboutYouStep({
  fullName,
  schoolWorkplace,
  gradeLevel,
  onChangeFullName,
  onChangeSchoolWorkplace,
  onChangeGradeLevel,
  onBack,
  onNext,
}: AboutYouStepProps) {
  return (
    <FlowCard
      header={<StepHeader eyebrow="BASIC INFO" title="Tell Me About Yourself" subtitle="So I Can Find Your Perfect Matches" onBack={onBack} />}
    >
      <div className="flex w-full flex-col gap-3.5 sm:gap-5">
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
      <FlowButton onClick={onNext} className="mt-2 sm:mt-3">
        Continue →
      </FlowButton>
    </FlowCard>
  );
}
