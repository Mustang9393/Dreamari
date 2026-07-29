import { Chip } from "../Chip";
import { FlowButton } from "../FlowButton";
import { FlowCard } from "../FlowCard";
import { LabeledSelect } from "../LabeledSelect";

const GPA_RANGES = ["3.5 - 4.0 (A- / A)", "3.0 - 3.49 (B / B+)", "2.5 - 2.99 (C+ / B-)", "Below 2.5"];

const SUBJECTS = ["Art", "Science", "Math", "English", "History", "Technology", "Music", "Sports", "Business"];

type AcademicJourneyStepProps = {
  path: string;
  gradeLevel: string;
  gpaRange: string;
  subjects: string[];
  onChangeGpaRange: (value: string) => void;
  onToggleSubject: (subject: string) => void;
  onNext: () => void;
};

export function AcademicJourneyStep({
  path,
  gradeLevel,
  gpaRange,
  subjects,
  onChangeGpaRange,
  onToggleSubject,
  onNext,
}: AcademicJourneyStepProps) {
  return (
    <FlowCard>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-[0.8px] text-[color:var(--step-accent)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">ACADEMIC PATH</p>
        <p className="text-[22px] font-bold text-slate-900 dark:text-white">Academic journey</p>
      </div>

      <LabeledSelect label="GPA Range" value={gpaRange} options={GPA_RANGES} onChange={onChangeGpaRange} />

      <div className="flex w-full flex-col gap-3">
        <p className="text-[11px] font-bold tracking-[1.4px] text-slate-500 uppercase dark:text-slate-400">Subjects that excite you</p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => {
            const index = subjects.indexOf(subject);
            return (
              <Chip
                key={subject}
                label={subject}
                selected={index !== -1}
                order={index !== -1 ? index + 1 : null}
                onClick={() => onToggleSubject(subject)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-tertiary p-4 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-bold tracking-[1.4px] text-slate-500 uppercase dark:text-slate-400">So far</p>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {path} • {gradeLevel}
          {subjects.length > 0 && <> • {subjects.join(", ")}</>}
        </p>
      </div>

      <div className="flex w-full flex-col gap-3.5">
        <FlowButton onClick={onNext}>
          Continue →
        </FlowButton>
        <p className="w-full text-center text-[11px] text-slate-500 dark:text-slate-400">
          Based on Holland&apos;s RIASEC framework (Johns Hopkins University)
        </p>
      </div>
    </FlowCard>
  );
}
