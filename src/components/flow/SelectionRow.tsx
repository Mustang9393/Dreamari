import type { ReactNode } from "react";
import { dispatchAuroraPulse } from "./aurora/pulse";
import { CheckIcon } from "./icons";

type SelectionRowProps = {
  icon: ReactNode;
  title: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
};

export function SelectionRow({ icon, title, sub, selected, onClick }: SelectionRowProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("select", event);
        onClick();
      }}
      aria-pressed={selected}
      className={`flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition-colors sm:gap-3 sm:p-4 ${
        selected
          ? "border-[var(--step-accent)] bg-[color-mix(in_srgb,var(--step-accent)_14%,white)] dark:border-[color-mix(in_srgb,var(--step-accent)_65%,black)] dark:bg-[color-mix(in_srgb,var(--step-accent)_18%,black)]"
          : "border-border-subtle bg-surface-tertiary dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg p-1.5 sm:size-10 sm:p-2 ${
          selected ? "bg-[var(--step-accent)] text-white" : "bg-slate-500 text-white dark:bg-white/15"
        }`}
      >
        <span className="size-5 sm:size-6">{icon}</span>
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-bold text-slate-900 sm:text-lg dark:text-white">{title}</span>
        <span className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-400">{sub}</span>
      </span>
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full border sm:size-6 ${
          selected ? "border-transparent bg-[var(--step-accent)] text-white" : "border-slate-400 bg-transparent dark:border-slate-500"
        }`}
      >
        {selected && <CheckIcon className="size-3 sm:size-3.5" />}
      </span>
    </button>
  );
}
