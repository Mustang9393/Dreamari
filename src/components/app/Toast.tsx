"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { announce } from "./LiveRegion";
import { IconTip } from "@/components/app/IconTip";

/** A short, self-dismissing confirmation -- same visual language as
 *  UndoToast, for actions that need acknowledgement but nothing to undo
 *  (a first Like/Dislike tap's explainer, "Added to your Top 3"). */
export function Toast({ message, onClose, duration = 3200 }: { message: string; onClose: () => void; duration?: number }) {
  useEffect(() => {
    announce(message);
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [message, onClose, duration]);
  if (typeof document === "undefined") return null;
  return createPortal(
      // background: transparent -- .marketing-v2 (tokens.css) sets
      // `background: var(--background)` on itself for page-root usage; this
      // wrapper only wants the class for its CSS variables (--card etc used
      // below), not a solid near-black bar spanning the full width behind a
      // toast meant to float over the page (direct report + screenshot, 22
      // Sept 2026). Same fix as CareerDetailExperience.tsx's FactPopover
      // (minHeight: 0, same root cause, different unwanted inherited rule).
      <div className="marketing-v2 themeable pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[130] flex justify-center px-5 md:bottom-8" style={{ background: "transparent" }}>
      <div
        role="status"
        className="pointer-events-auto flex max-w-[420px] items-center gap-[14px] rounded-[14px] border px-[16px] py-[12px] text-[14px] font-semibold shadow-2xl motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <span className="min-w-0 flex-1">{message}</span>
        <IconTip label="Dismiss">
          <button type="button" aria-label="Dismiss" onClick={onClose} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>×</button>
        </IconTip>
      </div>
    </div>,
    document.body,
  );
}
