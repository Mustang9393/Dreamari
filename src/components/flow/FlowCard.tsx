import type { ReactNode } from "react";

type FlowCardProps = {
  children: ReactNode;
};

export function FlowCard({ children }: FlowCardProps) {
  return (
    // max-w-2xl on mobile/tablet, but lg:max-w-4xl (≈896px) on desktop — matches the wider
    // Figma desktop card (node 403:36309, ~895px) so chip/pill answer grids have room to lay
    // out on fewer rows instead of wrapping the way a mobile-width card forces them to.
    <div className="flex w-full max-w-2xl flex-col items-start gap-3 rounded-3xl bg-white px-5 py-4 shadow-[0_0_24px_rgba(242,176,30,0.12)] sm:gap-6 sm:px-10 sm:py-8 lg:max-w-4xl dark:border dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_0_32px_rgba(0,0,0,0.4)] dark:backdrop-blur-xl">
      {children}
    </div>
  );
}
