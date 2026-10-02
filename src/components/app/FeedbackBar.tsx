"use client";

// The one feedback bar (1 Oct 2026): what happened, how to undo it, where
// it went. The Career actions lab's bar, made shared, since Chandu picked
// its shape over the Opportunities toast ("I prefer the lab's shape"). One
// bar; a new action replaces it, never stacks. Undo is a real button; a
// thin line drains for the six seconds it stays and pauses while the
// pointer is on it (Gmail's "Undo send", Google Photos' delete bar). The
// link navigates with showTheWay so the page slides toward where the
// thing went.

import { useEffect, useState } from "react";
import { TOAST_GLASS } from "./Toast";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Undo2, X } from "lucide-react";
import { showTheWay } from "@/lib/showTheWay";

export type Feedback = { id: string; text: string; undo?: () => void; link?: { label: string; href: string }; error?: boolean };
export const FEEDBACK_MS = 6000;

export function FeedbackBar({ bar, onClose, top = false }: { bar: Feedback | null; onClose: () => void; top?: boolean }) {
  const router = useRouter();
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (!bar || bar.error || hold) return;
    const t = window.setTimeout(onClose, FEEDBACK_MS);
    return () => window.clearTimeout(t);
  }, [bar, hold, onClose]);
  return (
    <div className={`pointer-events-none fixed inset-x-0 z-[125] flex justify-center px-4 ${top ? "top-[112px] lg:top-[132px]" : "bottom-[92px] lg:bottom-6"}`}>
      <AnimatePresence mode="wait">
        {bar && (
          <motion.div key={bar.id} role="status" onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.22 }}
            className="pointer-events-auto relative flex max-w-[min(560px,100%)] items-center gap-3 overflow-hidden rounded-full border py-2 pr-2 pl-4 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.8)]"
            style={TOAST_GLASS}>
            {bar.error ? <X className="h-4 w-4 flex-none" aria-hidden style={{ color: "#E0453C" }} /> : <Check className="h-4 w-4 flex-none" strokeWidth={3} aria-hidden style={{ color: "var(--color-feedback-success, rgb(52,199,140))" }} />}
            <span className="min-w-0 truncate text-[13.5px] font-semibold">{bar.text}</span>
            {bar.undo && <button type="button" onClick={() => { bar.undo!(); onClose(); }} className="flex flex-none cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-[12.5px] font-bold" style={{ borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)" }}><Undo2 className="h-3.5 w-3.5" aria-hidden />Undo</button>}
            {bar.link && <button type="button" onClick={() => { const to = bar.link!.href; onClose(); showTheWay(router, to); }} className="flex flex-none cursor-pointer items-center gap-0.5 rounded-full py-1.5 pr-2 pl-3 text-[12.5px] font-bold text-white" style={{ background: "var(--primary)" }}>{bar.link.label} <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>}
            {bar.error && <button type="button" aria-label="Dismiss" onClick={onClose} className="dm-quiet flex size-7 flex-none cursor-pointer items-center justify-center rounded-full"><X className="h-3.5 w-3.5" aria-hidden /></button>}
            {!bar.error && (
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
                <span key={hold ? "hold" : "run"} className="block h-full origin-left" style={{ background: "var(--primary)", animation: hold ? "none" : `dm-bar-drain ${FEEDBACK_MS}ms linear forwards`, transform: hold ? "scaleX(1)" : undefined }} />
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes dm-bar-drain { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
    </div>
  );
}
