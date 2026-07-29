import type { ReactNode } from "react";

type StepTransitionProps = {
  children: ReactNode;
};

export function StepTransition({ children }: StepTransitionProps) {
  return <div className="flex w-full justify-center motion-safe:animate-[step-in_0.4s_ease-out]">{children}</div>;
}
