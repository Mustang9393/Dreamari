import { dispatchAuroraPulse } from "../aurora/pulse";
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

// A small rounded pill, distinct from GridOption's full-width row — matches the
// reference app's own chip style for this specific follow-up question. Selected state
// uses the same rotating --step-accent every other selection control on this step uses,
// rather than a fixed color, for consistency with the rest of the app.
function EasyChip({ subject, selected, onClick }: { subject: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("select", event);
        onClick();
      }}
      aria-pressed={selected}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        selected
          ? "border-[var(--step-accent)] bg-[var(--step-accent)] text-white"
          : "border-border-subtle bg-surface-tertiary text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      }`}
    >
      {subject}
    </button>
  );
}

type AcademicJourneyStepProps = {
  gpaRange: string;
  subjects: string[];
  easySubjects: string[];
  onChangeGpaRange: (value: string) => void;
  onToggleSubject: (subject: string) => void;
  onToggleEasySubject: (subject: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export function AcademicJourneyStep({
  gpaRange,
  subjects,
  easySubjects,
  onChangeGpaRange,
  onToggleSubject,
  onToggleEasySubject,
  onBack,
  onNext,
}: AcademicJourneyStepProps) {
  return (
    <FlowCard header={<StepHeader eyebrow="ACADEMIC PATH" title="Your Academic Journey" onBack={onBack} />}>
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

        {/* Only appears once at least one subject is picked above — its own options are
            exactly those selected subjects (not the fixed SUBJECTS list), so there's
            nothing to show until there's something to choose from. Matches the
            reference app exactly: a second, optional follow-up rendered as chips. */}
        {subjects.length > 0 && (
          <div className="flex w-full flex-col gap-2 border-t border-dashed border-border-subtle pt-3 sm:gap-3 sm:pt-4 dark:border-white/10">
            <div className="flex flex-col gap-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                <span aria-hidden>👉</span>
                Which ones feel <span className="text-emerald-600 dark:text-emerald-400">EASY</span> to you?
                <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase dark:bg-white/10 dark:text-slate-400">
                  optional
                </span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select any subjects that come naturally to you — separate from what you enjoy.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <EasyChip
                  key={subject}
                  subject={subject}
                  selected={easySubjects.includes(subject)}
                  onClick={() => onToggleEasySubject(subject)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <FlowButton onClick={onNext} className="mt-2 sm:mt-3">
        Continue →
      </FlowButton>
    </FlowCard>
  );
}
