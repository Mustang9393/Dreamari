import type { ComponentPropsWithoutRef } from "react";
import { dispatchAuroraPulse } from "./aurora/pulse";

export function FlowButton({ className = "", children, onClick, ...props }: ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      onClick={(event) => {
        dispatchAuroraPulse("cta", event);
        onClick?.(event);
      }}
      className={`flex h-[52px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[var(--step-button-from)] to-[var(--step-button-to)] text-base font-bold text-white transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] sm:h-14 sm:text-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
