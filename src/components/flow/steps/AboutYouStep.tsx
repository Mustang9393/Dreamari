import Image from "next/image";
import { DreamySpeechBubble } from "../DreamySpeechBubble";
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
    // small gap between him and the card, between the progress bar above (rendered by
    // FlowContainer) and this step's own card, matching how the reference app places him.
    // sm:-mt-5 trims the section's own shared gap-8 (32px) down to ~12px specifically for
    // this row — FlowContainer also drops the vertical-centering slack that would
    // otherwise stack on top of that for this exact step (see the step===3 check there) —
    // so the top gap stays fixed at ~12px instead of growing on taller viewports.
    <div className="flex w-full max-w-2xl flex-col items-center gap-3 lg:max-w-4xl sm:-mt-5">
      <div className="flex items-center gap-2.5">
        <DreamySpeechBubble message="Let's get to know you! 😊" className="max-w-[190px] text-xs sm:text-sm" />
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
