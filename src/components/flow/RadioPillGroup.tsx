import { dispatchAuroraPulse } from "./aurora/pulse";

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
      <div className="flex w-full flex-wrap items-start gap-2">
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
              className={`flex-1 rounded-full border px-4 py-2.5 text-center text-sm font-bold whitespace-nowrap transition-colors ${
                selected
                  ? "border-amber-400 bg-amber-100 text-amber-600 dark:border-amber-400/60 dark:bg-amber-400/15 dark:text-amber-300"
                  : "border-border-subtle bg-surface-tertiary text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
