import type { ReactNode } from "react";

type FlowCardProps = {
  children: ReactNode;
};

export function FlowCard({ children }: FlowCardProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-start gap-6 rounded-3xl bg-white px-6 py-7 shadow-[0_0_24px_rgba(242,176,30,0.12)] sm:gap-7 sm:px-10 sm:py-10 dark:border dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_0_32px_rgba(0,0,0,0.4)] dark:backdrop-blur-xl">
      {children}
    </div>
  );
}
