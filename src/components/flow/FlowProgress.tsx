import { TOTAL_STEPS } from "./types";

type FlowProgressProps = {
  step: number;
};

export function FlowProgress({ step }: FlowProgressProps) {
  const percent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-amber-100/90 px-4 py-2 pb-3 sm:px-5 dark:border dark:border-white/10 dark:bg-white/10 dark:backdrop-blur">
      <div className="flex w-full items-center justify-between text-xs font-bold tracking-wider text-amber-600 uppercase sm:text-sm dark:text-amber-300">
        <p>
          Step {step} of {TOTAL_STEPS}
        </p>
        <p>{percent}%</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-975/80 dark:bg-black/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
