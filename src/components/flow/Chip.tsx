import { dispatchAuroraPulse } from "./aurora/pulse";

type ChipProps = {
  label: string;
  selected: boolean;
  order: number | null;
  onClick: () => void;
};

export function Chip({ label, selected, order, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("select", event);
        onClick();
      }}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors sm:py-2.5 sm:text-base ${
        selected
          ? "border-[var(--step-accent)] bg-[color-mix(in_srgb,var(--step-accent)_14%,white)] text-[color:var(--step-accent)] dark:border-[color-mix(in_srgb,var(--step-accent)_65%,black)] dark:bg-[color-mix(in_srgb,var(--step-accent)_20%,black)] dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
          : "border-border-subtle bg-surface-tertiary text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      }`}
    >
      {label}
      {selected && order !== null && (
        <span className="flex size-5 items-center justify-center rounded-full bg-[var(--step-accent)] text-xs font-bold text-white">
          {order}
        </span>
      )}
    </button>
  );
}
