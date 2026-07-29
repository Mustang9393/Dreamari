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
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors sm:text-base ${
        selected
          ? "border-amber-400 bg-amber-100 text-amber-600 dark:border-amber-400/60 dark:bg-amber-400/15 dark:text-amber-300"
          : "border-border-subtle bg-surface-tertiary text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      }`}
    >
      {label}
      {selected && order !== null && (
        <span className="flex size-5 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">{order}</span>
      )}
    </button>
  );
}
