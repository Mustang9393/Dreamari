"use client";

// The app's secondary tabs: text with a sliding underline, the same look as
// Explore's Careers/Schools strip, Connect's sections and a pro's profile
// tabs. Use this inside a page or a panel that already has a primary pill
// tablist (My Profile's tabs, Opportunities' segment), so the two never
// clash (1 Oct 2026; Chandu: "in the Saved tab we need the other style of
// tabs we've used everywhere else... make sure this logic is consistent
// across the app"). Primary = pill, secondary = text + underline.

import { motion } from "framer-motion";

export function TextTabs<K extends string>({ items, value, onChange, ariaLabel, layoutId, className = "", soft = false }: {
  items: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  ariaLabel: string;
  /** unique per tablist on the page, so underlines never slide between two lists */
  layoutId: string;
  className?: string;
  /** the counselor app's quieter tabs (8 Oct 2026, Chandu: "scale down the
   *  This Week, Needs a Meeting tab titles... make them softer... v4 did
   *  this better"): v4's sub-navigation, 13px sentence case, muted until
   *  active, a hairline under the row */
  soft?: boolean;
}) {
  return (
    // data-text-tabs: v4's stylesheet turns every tablist in its content
    // area into a pill track; this one keeps its underline there (9 Oct
    // 2026, Chandu on Explore's Careers | Pay by State inside v4: "this is
    // ugly btw, what's happening here": it was getting both)
    <div role="tablist" data-text-tabs aria-label={ariaLabel} className={`dm-scroll flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${soft ? "gap-[22px] border-b" : "gap-[var(--space-5)] pb-[6px]"} ${className}`} style={soft ? { borderColor: "color-mix(in srgb, var(--foreground) 9%, transparent)" } : undefined}>
      {items.map((item) => {
        const on = item.key === value;
        return (
          <button key={item.key} type="button" role="tab" aria-selected={on} onClick={() => onChange(item.key)}
            className={`relative flex-none whitespace-nowrap ${soft ? `py-[9px] text-[13px] leading-[16px] ${on ? "font-semibold" : "font-medium"}` : "px-[2px] py-[3px] text-[14px] leading-[18px] font-bold uppercase tracking-[0.01em]"} ${on ? "" : "dm-quiet cursor-pointer"}`}
            style={{ fontFamily: "var(--font-body)", color: on ? "var(--foreground)" : "var(--muted-foreground)" }}>
            {item.label}
            {on && <motion.span layoutId={layoutId} aria-hidden className={`absolute inset-x-0 h-[2px] ${soft ? "-bottom-px rounded-full" : "-bottom-[5px]"}`} style={{ background: "var(--accent)" }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
          </button>
        );
      })}
    </div>
  );
}
