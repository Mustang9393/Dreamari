"use client";

// The app's secondary tabs: text with a sliding underline, the same look as
// Explore's Careers/Schools strip, Connect's sections and a pro's profile
// tabs. Use this inside a page or a panel that already has a primary pill
// tablist (My Profile's tabs, Opportunities' segment), so the two never
// clash (1 Oct 2026; Chandu: "in the Saved tab we need the other style of
// tabs we've used everywhere else... make sure this logic is consistent
// across the app"). Primary = pill, secondary = text + underline.

import { motion } from "framer-motion";

export function TextTabs<K extends string>({ items, value, onChange, ariaLabel, layoutId, className = "" }: {
  items: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  ariaLabel: string;
  /** unique per tablist on the page, so underlines never slide between two lists */
  layoutId: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={`dm-scroll flex items-center gap-[var(--space-5)] overflow-x-auto pb-[6px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      {items.map((item) => {
        const on = item.key === value;
        return (
          <button key={item.key} type="button" role="tab" aria-selected={on} onClick={() => onChange(item.key)}
            className={`relative flex-none px-[2px] py-[3px] text-[14px] leading-[18px] font-bold uppercase tracking-[0.01em] whitespace-nowrap ${on ? "" : "dm-quiet cursor-pointer"}`}
            style={{ fontFamily: "var(--font-body)", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {item.label}
            {on && <motion.span layoutId={layoutId} aria-hidden className="absolute inset-x-0 -bottom-[5px] h-[2px]" style={{ background: "var(--accent)" }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        );
      })}
    </div>
  );
}
