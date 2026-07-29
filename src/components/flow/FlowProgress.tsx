import { TOTAL_STEPS } from "./types";

type FlowProgressProps = {
  step: number;
};

export function FlowProgress({ step }: FlowProgressProps) {
  const percent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--step-accent)_12%,white)] px-4 py-2 pb-3 transition-colors duration-700 sm:px-5 dark:border dark:border-white/10 dark:bg-white/10 dark:backdrop-blur">
      <div className="flex w-full items-center justify-between text-xs font-bold tracking-wider text-[color:var(--step-accent)] uppercase transition-colors duration-700 sm:text-sm dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]">
        <p>
          Step {step} of {TOTAL_STEPS}
        </p>
        <p>{percent}%</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-975/80 dark:bg-black/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--step-accent)] to-[color-mix(in_srgb,var(--step-accent)_65%,black)] transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
