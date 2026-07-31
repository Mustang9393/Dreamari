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
    // max-w-2xl on mobile/tablet, but lg:max-w-4xl (≈896px) on desktop — matches the wider
    // Figma desktop card (node 403:36309, ~895px) so chip/pill answer grids have room to lay
    // out on fewer rows instead of wrapping the way a mobile-width card forces them to.
    <div className="flex w-full max-w-2xl flex-col items-stretch overflow-hidden rounded-3xl bg-white shadow-[0_0_24px_rgba(242,176,30,0.12)] lg:max-w-4xl dark:border dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_0_32px_rgba(0,0,0,0.4)] dark:backdrop-blur-xl">
      {header}
      <div className="flex w-full flex-col items-start gap-2.5 p-4 sm:gap-4 sm:p-9">{children}</div>
    </div>
  );
}
