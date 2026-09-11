"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { announce } from "./LiveRegion";

// A six-second toast with one Undo (UX audit, 11 Sept 2026: "Not for me" and
// "Remove from Top 3" had no way back). Mounted by the screen that owns the
// action; the message is announced to screen readers as it appears.
export function UndoToast({ message, onUndo, onClose, duration = 6000 }: { message: string; onUndo: () => void; onClose: () => void; duration?: number }) {
  useEffect(() => {
    announce(`${message}. Undo available.`);
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [message, onClose, duration]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[130] flex justify-center px-5 md:bottom-8">
      <div
        role="status"
        className="pointer-events-auto flex max-w-[420px] items-center gap-[14px] rounded-[14px] border px-[16px] py-[12px] text-[14px] font-semibold shadow-2xl motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        <span className="min-w-0 flex-1">{message}</span>
        <button type="button" onClick={() => { onUndo(); onClose(); }} className="dm-link flex-none cursor-pointer rounded-[8px] px-[10px] py-[6px] text-[14px] font-bold" style={{ color: "var(--accent-subtle)" }}>
          Undo
        </button>
        <button type="button" aria-label="Dismiss" onClick={onClose} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>×</button>
      </div>
    </div>,
    document.body,
  );
}
