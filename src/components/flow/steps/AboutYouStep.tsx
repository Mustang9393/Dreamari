import Image from "next/image";
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
    // Dreamy sits in normal document flow here (not absolutely positioned) — a fixed,
    // ordinary gap between him and the card, between the progress bar above (rendered by
    // FlowContainer) and this step's own card, matching how the reference app places him.
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 lg:max-w-4xl">
      <div className="flex items-end gap-2.5">
        <div className="max-w-[190px] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 shadow-md sm:text-sm dark:bg-slate-800 dark:text-slate-200">
          Let&apos;s get to know you! 😊
        </div>
        <div className="relative aspect-square w-20 shrink-0 sm:w-24">
          <Image src="/images/dreamy-welcome-mascot.png" alt="Dreamy" fill sizes="96px" className="object-contain" priority />
        </div>
      </div>
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
    </div>
  );
}
