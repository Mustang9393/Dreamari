import { dispatchAuroraPulse } from "./aurora/pulse";
import { CheckIcon } from "./icons";

type RadioPillGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function RadioPillGroup({ label, options, value, onChange }: RadioPillGroupProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">{label}</p>
      {/* flex-1 on each pill, not each sized to its own label — 3 short labels left-
          clustered with a wide empty gap on the right, rather than reading as one
          deliberate row of options spanning the same width as everything else on the
          card. */}
      <div className="flex w-full items-stretch gap-2">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={(event) => {
                dispatchAuroraPulse("select", event);
                onChange(option);
              }}
              aria-pressed={selected}
              className={`flex flex-1 items-center justify-center gap-1 rounded-full border px-2 py-1.5 text-center text-[13px] font-bold whitespace-nowrap transition-colors sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-sm ${
                selected
                  ? "border-[var(--step-accent)] bg-[var(--step-accent)] text-white"
                  : "border-border-subtle bg-surface-tertiary text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }`}
            >
              {option}
              {selected && <CheckIcon className="size-3.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
