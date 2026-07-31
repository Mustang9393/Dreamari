import type { ReactNode } from "react";
import { ChevronLeftIcon } from "./icons";
import { dispatchAuroraPulse } from "./aurora/pulse";

type FlowCardProps = {
  children: ReactNode;
  /** Omit on the very first step — there's nothing before it to go back to. */
  onBack?: () => void;
};

export function FlowCard({ children, onBack }: FlowCardProps) {
  return (
    // max-w-2xl on mobile/tablet, but lg:max-w-4xl (≈896px) on desktop — matches the wider
    // Figma desktop card (node 403:36309, ~895px) so chip/pill answer grids have room to lay
    // out on fewer rows instead of wrapping the way a mobile-width card forces them to.
    <div className="flex w-full max-w-2xl flex-col items-start gap-3 rounded-3xl bg-white px-5 py-4 shadow-[0_0_24px_rgba(242,176,30,0.12)] sm:gap-4 sm:px-10 sm:py-6 lg:max-w-4xl dark:border dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_0_32px_rgba(0,0,0,0.4)] dark:backdrop-blur-xl">
      {/* A small icon-only affordance next to the question, not a second full-width
          button competing with the main (gradient, full-width) CTA at the bottom —
          going back is a secondary action and shouldn't visually compete with moving
          forward. */}
      {onBack && (
        <button
          type="button"
          onClick={(event) => {
            dispatchAuroraPulse("select", event);
            onBack();
          }}
          aria-label="Back to previous question"
          className="flex size-8 items-center justify-center rounded-full text-[color:var(--step-accent)] transition-opacity hover:opacity-70 dark:text-[color-mix(in_srgb,var(--step-accent)_70%,white)]"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
      )}
      {children}
    </div>
  );
}
