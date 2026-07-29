import type { ReactNode } from "react";
import { dispatchAuroraPulse } from "./aurora/pulse";

type PathOptionProps = {
  icon: ReactNode;
  title: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
};

export function PathOption({ icon, title, sub, selected, onClick }: PathOptionProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("select", event);
        onClick();
      }}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors sm:gap-5 sm:p-5 ${
        selected
          ? "border-2 border-amber-400 bg-amber-100 dark:border-amber-400/60 dark:bg-amber-400/10"
          : "border-border-subtle bg-surface-tertiary dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12 ${
          selected ? "bg-amber-600 text-white" : "bg-[#e2e8f0] text-slate-500 dark:bg-white/10 dark:text-slate-400"
        }`}
      >
        <span className="size-5 sm:size-6">{icon}</span>
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">{title}</span>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{sub}</span>
      </span>
    </button>
  );
}
