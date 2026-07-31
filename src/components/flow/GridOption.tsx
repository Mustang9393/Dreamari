import { dispatchAuroraPulse } from "./aurora/pulse";
import { CheckIcon } from "./icons";

type GridOptionProps = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

// Uniform 2-column grid cell for multi-select answers (subjects, strengths, values) —
// replaces the old flex-wrap Chip, whose pill width tracked each label's own text length
// and produced an uneven, haphazard wrap. Every cell here is the same height regardless
// of label length, arranged two-per-row via the grid wrapper each caller renders around
// these (`grid grid-cols-1 gap-2.5 sm:grid-cols-2`).
export function GridOption({ label, selected, disabled, onClick }: GridOptionProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("select", event);
        onClick();
      }}
      aria-pressed={selected}
      disabled={disabled}
      className={`flex w-full items-center justify-between gap-2.5 rounded-2xl border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-3 sm:p-4 ${
        selected ? "border-[var(--step-accent)] bg-[var(--step-accent)]" : "border-border-subtle bg-surface-tertiary dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <span className={`text-[13px] font-bold sm:text-base ${selected ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>{label}</span>
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:size-5 ${
          selected ? "border-white bg-white text-[color:var(--step-accent)]" : "border-slate-300 dark:border-white/20"
        }`}
      >
        {selected && <CheckIcon className="size-2.5 sm:size-3" />}
      </span>
    </button>
  );
}
