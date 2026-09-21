"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { announce } from "./LiveRegion";

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
    <div className="marketing-v2 themeable pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[130] flex justify-center px-5 md:bottom-8">
      <div
        role="status"
        className="pointer-events-auto flex max-w-[420px] items-center gap-[14px] rounded-[14px] border px-[16px] py-[12px] text-[14px] font-semibold shadow-2xl motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <span className="min-w-0 flex-1">{message}</span>
        <button type="button" aria-label="Dismiss" onClick={onClose} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>×</button>
      </div>
    </div>,
    document.body,
  );
}
