"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Portal } from "@/components/profile/CareerReport";

// Universal rule (direct feedback, 17 Sept 2026): anything icon-only shows
// its label as a tooltip on hover and keyboard focus. Originally built for
// the Resume Builder's own toolbar (resume/ui.tsx) and shared here so every
// other icon-only control in the app -- Career detail, College detail, and
// anywhere else -- can wrap itself in the same `IconTip` instead of a second
// implementation of the identical rule.

/** The tooltip bubble itself, portalled to the body and positioned from the
 *  trigger's rect. Rendering it inline under the trigger looked right in
 *  the DOM but painted BEHIND whatever came next (a sheet, the next row):
 *  those neighbours carry their own stacking contexts, so no z-index inside
 *  the header could win. */
export function Tip({ label, children, hideFromLg = false, className = "" }: { label: string; children: ReactNode; hideFromLg?: boolean; className?: string }) {
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ x: r.left + r.width / 2, y: r.bottom + 8 });
  };
  const hide = () => setTip(null);
  // Scrolling under an open tooltip would leave it stranded; dismiss instead.
  useEffect(() => {
    if (!tip) return;
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", hide, { capture: true } as EventListenerOptions);
  }, [tip]);
  return (
    <span ref={ref} className={`relative flex flex-none ${className}`} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} aria-describedby={tip ? id : undefined}>
      {children}
      {tip && (
        <Portal>
          <span
            id={id}
            role="tooltip"
            className={`pointer-events-none fixed z-[9999] -translate-x-1/2 rounded-[var(--radius-sm)] border px-[10px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap motion-safe:animate-[fade-slide-up_0.18s_ease-out_both] ${hideFromLg ? "lg:hidden" : ""}`}
            style={{ left: tip.x, top: tip.y, background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 14px 30px -16px rgba(0,0,0,0.7)", fontFamily: "var(--font-body)" }}
          >
            {label}
          </span>
        </Portal>
      )}
    </span>
  );
}

/** Wrap any icon-only control in this so its label shows as a tooltip on
 *  hover and keyboard focus -- the icon alone is never the whole affordance. */
export function IconTip({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <Tip label={label} className={className}>{children}</Tip>;
}
