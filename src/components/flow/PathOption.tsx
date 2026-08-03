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
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors sm:gap-5 sm:p-5 ${
        selected
          ? "border-2 border-[var(--step-accent)] bg-[color-mix(in_srgb,var(--step-accent)_14%,white)] dark:border-[color-mix(in_srgb,var(--step-accent)_65%,black)] dark:bg-[color-mix(in_srgb,var(--step-accent)_18%,black)]"
          : "border-border-subtle bg-surface-tertiary dark:border-white/10 dark:bg-white/5"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-12 ${
          selected ? "bg-[var(--step-accent)] text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
        }`}
      >
        {/* flex + centered, not just a fixed box — an SVG icon (size-full, fills and
            centers on its own) didn't need this, but an emoji character (PathForwardStep's
            ⚡🎓🔬) sits on its own text baseline and doesn't center itself inside a plain
            fixed-size box the way an SVG does. */}
        <span className="flex size-4 items-center justify-center text-base leading-none sm:size-6 sm:text-xl">{icon}</span>
      </span>
      <span className="flex flex-col gap-0.5 sm:gap-1">
        <span className="text-sm font-bold text-slate-900 sm:text-lg dark:text-white">{title}</span>
        <span className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-400">{sub}</span>
      </span>
    </button>
  );
}
