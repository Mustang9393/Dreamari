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
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
        selected
          ? "border-amber-400 bg-amber-100 dark:border-amber-400/60 dark:bg-amber-400/10"
          : "border-border-subtle bg-surface-tertiary dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg p-2 ${
          selected ? "bg-amber-600 text-white" : "bg-slate-500 text-white dark:bg-white/15"
        }`}
      >
        <span className="size-6">{icon}</span>
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">{title}</span>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{sub}</span>
      </span>
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-transparent bg-amber-600 text-white" : "border-slate-400 bg-transparent dark:border-slate-500"
        }`}
      >
        {selected && <CheckIcon className="size-3.5" />}
      </span>
    </button>
  );
}
