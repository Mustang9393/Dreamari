"use client";

// DEMO-ONLY: the (i) note, so whoever opens the lab has the context
// without a Slack thread beside it -- what was built from Joshua's note,
// what the lab adds on top of it, and that this is a mock to understand
// the flow, not a final design. Short bullets, no em dashes.

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import type { ScreenNote } from "./shared";

const FLOW_NOTE = {
  title: "Build → Mini Explore → Saved → Rank → My Profile",
  sections: [
    {
      heading: "Built from the note, as written",
      bullets: [
        "Build stays exactly as it is today.",
        "Mini Explore: browse by industry, save what interests you, up to 7.",
        "Rank: pick #1, #2 and #3 from the saved set.",
        "My Profile: the Top 3 with Explore more, Saved careers, Remove and Replace all in plain sight.",
      ],
    },
    {
      heading: "What we added",
      bullets: [
        "Mini Explore opens on your strongest world; a second chosen world is the next tab, Explore all is for anything else.",
        "Each card's chip says why it's there (a subject you picked, the world, or your path).",
        "Careers load in as you scroll, no button to press for more.",
        "Tap a card for the same detail Match shows today (what you'd do, good fit if, school and path).",
        "After the Top 3, a next step and actions per career, so the screen doesn't stop.",
      ],
    },
    {
      heading: "Mock, not final",
      bullets: [
        "These screens illustrate the flow. Visual design, copy and data sit on Match's current styling as placeholders.",
        "Ordering here is keyword based for the demo. The real matching runs in Dreamonna.",
      ],
    },
  ],
};

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <IconTip label="About this flow">
      <button type="button" aria-label="About this flow" onClick={onClick} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>
        <Info className="h-4 w-4" aria-hidden />
      </button>
    </IconTip>
  );
}

export function InfoSheet({ screen, open, onClose }: { screen: ScreenNote | null; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label="About this flow">
          <motion.div initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }} className="relative flex max-h-[88dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
            <div className="flex flex-none items-start justify-between gap-3 border-b px-5 pt-4 pb-3" style={{ borderColor: "var(--glass-border)" }}>
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--primary)" }}>Flow lab · mock, not final</p>
                <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{FLOW_NOTE.title}</p>
              </div>
              <IconTip label="Close">
                <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
              </IconTip>
            </div>
            <div className="flow-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
              {screen && (
                <section className="rounded-[var(--radius-md)] border p-3" style={{ borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))", background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
                  <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--primary)" }}>This screen</p>
                  <h3 className="text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}>{screen.heading}</h3>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {screen.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] leading-[1.5] font-medium" style={{ color: "var(--muted-foreground)" }}>
                        <span aria-hidden className="mt-[8px] size-1 flex-none rounded-full" style={{ background: "var(--primary)" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {FLOW_NOTE.sections.map((s) => (
                <section key={s.heading}>
                  <h3 className="text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}>{s.heading}</h3>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] leading-[1.5] font-medium" style={{ color: "var(--muted-foreground)" }}>
                        <span aria-hidden className="mt-[8px] size-1 flex-none rounded-full" style={{ background: "var(--muted-foreground)" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
