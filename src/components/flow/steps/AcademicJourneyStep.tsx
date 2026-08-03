import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { GridOption } from "../GridOption";
import { StepHeader } from "../StepHeader";
import { LabeledSelect } from "../LabeledSelect";

const GPA_RANGES = ["Prefer not to say", "3.8 - 4.0", "3.5 - 3.7", "3.2 - 3.4", "2.8 - 3.1", "2.5 - 2.7", "Below 2.5"];

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English/Literature",
  "History",
  "Art",
  "Music",
  "Computer Science",
  "Foreign Languages",
  "Business",
  "Psychology",
  "Physical Education",
  "Drama/Theater",
];

// Same pattern as WorkStyleStep's "Your Setup" panel: a horizontal, wrapping strip of
// numbered rows on mobile/tablet (a short strip under the main content, not another tall
// stack), switching to a vertical list only at the desktop breakpoint, where it sits as
// its own column beside the GPA/subjects content instead of below it.
function SoFarPanel({ path, gradeLevel, subjects }: { path: string; gradeLevel: string; subjects: string[] }) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-xl border border-border-subtle bg-surface-tertiary p-3 sm:gap-1.5 sm:p-4 lg:w-[240px] lg:shrink-0 dark:border-white/10 dark:bg-white/5">
      <p className="text-[10px] font-bold tracking-[1.4px] text-slate-600 uppercase sm:text-xs dark:text-slate-400">So far</p>
      <p className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-300">
        {path} • {gradeLevel}
      </p>
      {subjects.length > 0 && (
        <ol className="flex flex-row flex-wrap gap-x-3 gap-y-0.5 lg:flex-col lg:gap-1">
          {subjects.map((subject, index) => (
            <li
              key={subject}
              className="text-xs font-bold text-[color:var(--step-accent)] sm:text-sm dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
            >
              {index + 1}. {subject}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

type AcademicJourneyStepProps = {
  path: string;
  gradeLevel: string;
  gpaRange: string;
  subjects: string[];
  onChangeGpaRange: (value: string) => void;
  onToggleSubject: (subject: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function AcademicJourneyStep({
  path,
  gradeLevel,
  gpaRange,
  subjects,
  onChangeGpaRange,
  onToggleSubject,
  onBack,
  onNext,
}: AcademicJourneyStepProps) {
  return (
    <FlowCard header={<StepHeader eyebrow="ACADEMIC PATH" title="Your Academic Journey" onBack={onBack} />}>
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-4">
          <LabeledSelect label="What's your GPA range?" value={gpaRange} options={GPA_RANGES} onChange={onChangeGpaRange} />

          <div className="flex w-full flex-col gap-2 sm:gap-3">
            <p className="text-[10px] leading-tight font-bold tracking-[1.4px] text-slate-600 uppercase sm:text-[11px] dark:text-slate-400">
              What subjects make you excited to learn? (Pick up to 3)
            </p>
            <div className="grid w-full grid-cols-1 gap-2 sm:gap-2.5 sm:grid-cols-2">
              {SUBJECTS.map((subject) => (
                <GridOption key={subject} label={subject} selected={subjects.includes(subject)} onClick={() => onToggleSubject(subject)} />
              ))}
            </div>
          </div>
        </div>

        <SoFarPanel path={path} gradeLevel={gradeLevel} subjects={subjects} />
      </div>

      <FlowButton onClick={onNext} className="mt-2 sm:mt-3">
        Continue →
      </FlowButton>
    </FlowCard>
  );
}
