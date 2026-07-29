type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function LabeledInput({ label, value, onChange }: LabeledInputProps) {
  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-[#e2e8f0] bg-white px-4 text-base font-semibold text-slate-900 focus:border-[var(--step-accent)] focus:outline-none sm:h-13 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}
