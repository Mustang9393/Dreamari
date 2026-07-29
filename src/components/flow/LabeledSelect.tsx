import { ChevronDownIcon } from "./icons";

type LabeledSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  highlighted?: boolean;
};

export function LabeledSelect({ label, value, options, onChange, highlighted = false }: LabeledSelectProps) {
  const borderClasses = highlighted
    ? "border-2 border-[var(--step-accent)] dark:border-[color-mix(in_srgb,var(--step-accent)_70%,black)]"
    : "border border-[#e2e8f0] dark:border-white/10";

  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">{label}</span>
      <div className={`relative flex h-12 w-full items-center rounded-xl bg-white px-4 sm:h-13 dark:bg-white/5 ${borderClasses}`}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none bg-transparent text-base font-semibold text-slate-900 focus:outline-none dark:text-white"
        >
          {options.map((option) => (
            <option key={option} value={option} className="text-slate-900">
              {option}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 size-4 text-slate-500 dark:text-slate-400" />
      </div>
    </label>
  );
}
