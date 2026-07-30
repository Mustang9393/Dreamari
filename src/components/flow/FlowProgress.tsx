import { TOTAL_STEPS } from "./types";

type FlowProgressProps = {
  step: number;
};

export function FlowProgress({ step }: FlowProgressProps) {
  const percent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    // w-[calc(100%-9rem)], not w-full: HomeButton/ThemeToggle are `fixed` at the viewport's
    // top corners (20px inset, 40px square, so a ~60px footprint each), independent of this
    // section's own padding — on narrower viewports this bar's edges (and the "Step X of Y"
    // text right at its left edge) sat directly underneath them, clipped. Shaving 9rem off
    // the width and letting the flex parent's items-center recenter it keeps an even ~72px
    // clear on both sides, comfortably past both buttons, on any viewport.
    <div className="mx-auto flex w-[calc(100%-9rem)] max-w-xl flex-col gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--step-accent)_12%,white)] px-4 py-2 pb-3 transition-colors duration-700 sm:px-5 dark:border dark:border-white/10 dark:bg-white/10 dark:backdrop-blur">
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
