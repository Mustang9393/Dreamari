type SubjectChipProps = {
  label: string;
  selected: boolean;
  order: number | null;
  onClick: () => void;
};

export function SubjectChip({ label, selected, order, onClick }: SubjectChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
        selected
          ? "border-amber-400 bg-amber-100 text-amber-600"
          : "border-border-subtle bg-surface-tertiary text-slate-600"
      }`}
    >
      {label}
      {selected && order !== null && (
        <span className="flex size-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
          {order}
        </span>
      )}
    </button>
  );
}
