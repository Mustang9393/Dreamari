import type { ReactNode } from "react";

type StepTransitionProps = {
  children: ReactNode;
};

export function StepTransition({ children }: StepTransitionProps) {
  // h-full: lets a height-filling child (the build flow's per-step wrapper)
  // actually reach full height instead of shrinking to its own content --
  // default flex cross-axis stretch then does the rest without needing
  // flex-col here.
  return <div className="flex h-full w-full justify-center motion-safe:animate-[step-in_0.4s_ease-out]">{children}</div>;
}
