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
              className={`flex-1 rounded-full border px-3 py-2 text-center text-sm font-bold whitespace-nowrap transition-colors sm:py-2.5 ${
                selected
                  ? "border-[var(--step-accent)] bg-[color-mix(in_srgb,var(--step-accent)_14%,white)] text-[color:var(--step-accent)] dark:border-[color-mix(in_srgb,var(--step-accent)_65%,black)] dark:bg-[color-mix(in_srgb,var(--step-accent)_20%,black)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
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
