type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function LabeledInput({ label, value, onChange }: LabeledInputProps) {
  return (
    <label className="flex w-full flex-col gap-1.5 sm:gap-2">
      <span className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">{label}</span>
      {/* Font size here stays at 16px (text-base) even on mobile, unlike most other text
          in this redesign — anything smaller makes iOS Safari auto-zoom the page when
          this field is focused, which is a worse experience than a slightly taller
          input. */}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 focus:border-[var(--step-accent)] focus:outline-none sm:h-13 dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}
