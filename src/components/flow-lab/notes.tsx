"use client";

// DEMO-ONLY: the (i) note per flow, so whoever opens the lab has the
// context without a Slack thread beside it (direct instruction, 25 Sept
// 2026): what was built from Joshua's notes, what we changed in his
// version, the v3 disclaimer and the reasoning, and that these are mocks
// to illustrate a flow, not final designs. Short bullets, no em dashes.

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import type { LabVersion } from "./lab";

type Note = { title: string; kicker: string; sections: { heading: string; bullets: string[] }[] };

export const FLOW_NOTES: Record<LabVersion, Note> = {
  v2: {
    title: "v2",
    kicker: "Build > Mini Explore > Saved > Rank > My Profile",
    sections: [
      {
        heading: "Built from the v2 note, as written",
        bullets: [
          "Build stays exactly as it is today.",
          "Mini Explore: a tab per chosen world plus Explore more; six careers at a time, six more on tap.",
          "Save what interests you, up to 7. No choosing yet.",
          "Rank: pick #1, #2 and #3 from the saved set.",
          "My Profile: the Top 3 with Explore more, Saved careers, Remove and Replace all in plain sight.",
        ],
      },
      {
        heading: "What we added without changing the flow",
        bullets: [
          "The six are ordered by the student's Build answers (worlds, subjects, college or trades), and each card says why it is there.",
          "The six move like a carousel, forward and back, instead of a growing list.",
          "Tap a card for the same detail Match shows today (what you'd do, good fit if, school and path).",
          "Short coachmarks carry the instructions instead of on-screen copy.",
          "After the Top 3, a next step and actions per career, so the screen does not stop.",
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
  },
  v3: {
    title: "v3",
    kicker: "Build add-on > Match > My Profile",
    sections: [
      {
        heading: "The flow",
        bullets: [
          "Build asks one extra question per chosen world: which parts of it.",
          "Match shows six careers built from those answers, a reason on every card, and one stretch pick from a nearby world.",
          "Six more, any time, in either direction.",
          "Picking up to three is the Top 3. No separate save and rank steps.",
          "Same Top 3 screen as v2, on purpose, so only the route there differs.",
        ],
      },
      {
        heading: "Why this shape",
        bullets: [
          "Testers rated the three step flow easy. We kept it.",
          "They said matches felt scattered with no reason. So the six come from their own answers and each card says why.",
          "They said the inputs were too coarse. So one short follow-up per world, not a longer Build.",
          "They wanted a way out of a bad six. So six more is a first class control.",
          "Saving seven and then ranking is choosing twice. Here the pick is the choice.",
        ],
      },
      {
        heading: "Disclaimer",
        bullets: [
          "A mock to illustrate the flow we suggest, not a final design.",
          "Visuals, copy and data are placeholders on Match's current styling.",
          "The matching here is keyword based for the demo. The real matching runs in Dreamonna.",
        ],
      },
    ],
  },
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

export function InfoSheet({ version, open, onClose }: { version: LabVersion; open: boolean; onClose: () => void }) {
  const note = FLOW_NOTES[version];
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label={note.title}>
          <motion.div initial={{ scale: 0.96, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 8 }} className="relative flex max-h-[88dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
            <div className="flex flex-none items-start justify-between gap-3 border-b px-5 pt-4 pb-3" style={{ borderColor: "var(--glass-border)" }}>
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--primary)" }}>Flow lab · mock, not final</p>
                <h2 className="text-[18px] leading-tight font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{note.title}</h2>
                <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{note.kicker}</p>
              </div>
              <IconTip label="Close">
                <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
              </IconTip>
            </div>
            <div className="flow-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
              {note.sections.map((s) => (
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
