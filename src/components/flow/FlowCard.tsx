import type { ReactNode } from "react";

type FlowCardProps = {
  children: ReactNode;
  // Full-bleed content (a StepHeader) rendered above `children`, escaping this card's own
  // padding so it can reach the card's edges/rounded top corners — steps without a header
  // (Welcome, Congratulations) simply omit this and get the old plain-padded look.
  header?: ReactNode;
};

export function FlowCard({ children, header }: FlowCardProps) {
  return (
    // max-w-2xl on mobile/tablet. At lg+ this switches to --flow-content-width (see
    // globals.css: ~50% of the viewport, capped at 896px) instead of a chain of
    // ever-larger fixed breakpoint caps — that growth ladder (lg/xl/2xl) had pushed this
    // card up to ~1152px on large monitors, which read as too big. lg:max-w-none clears
    // the max-w-2xl ceiling so the token-driven width actually governs at this
    // breakpoint. FlowProgress references this exact same token, so the two can't drift
    // out of alignment with each other.
    // No `relative` here: this root also has `overflow-hidden` (for the rounded corners),
    // which would clip any absolutely-positioned child anchored to it — e.g. DreamyCorner
    // floats outside this card entirely, so it anchors to a non-clipping wrapper one level
    // up instead (see ConfidenceCheckStep).
    <div className="flex w-full max-w-2xl flex-col items-stretch overflow-hidden rounded-3xl bg-white shadow-[0_0_24px_var(--color-shadow-amber-12)] lg:w-[var(--flow-content-width)] lg:max-w-none dark:border dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_0_32px_var(--color-shadow-black-40)] dark:backdrop-blur-xl">
      {header}
      <div className="flex w-full flex-col items-start gap-2.5 p-4 sm:gap-4 sm:p-9">{children}</div>
    </div>
  );
}
