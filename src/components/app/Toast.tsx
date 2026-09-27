"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { announce } from "./LiveRegion";
import { IconTip } from "@/components/app/IconTip";

// Shared by Toast and UndoToast (module-level, not React context -- each is
// mounted independently via its own createPortal, from whichever screen
// currently owns it, so there's no common ancestor to hold context). Every
// mounted instance claims a slot in mount order so simultaneous toasts stack
// with a vertical offset instead of sharing the same fixed slot and
// overlapping (direct report + screenshot, 22 Sept 2026: "two toasts...
// overlap"). Newest sits at the base position with the highest z-index;
// older ones are pushed up and behind it.
let nextToastId = 0;
let toastOrder: number[] = [];
const toastListeners = new Set<() => void>();
const TOAST_STACK_GAP = 56;

function notifyToastListeners() {
  toastListeners.forEach((l) => l());
}

export function useToastStack(): { offset: number; z: number } {
  const [id] = useState(() => nextToastId++);
  const [, bump] = useState(0);
  useEffect(() => {
    const listener = () => bump((n) => n + 1);
    toastListeners.add(listener);
    toastOrder = [...toastOrder, id];
    notifyToastListeners();
    return () => {
      toastOrder = toastOrder.filter((x) => x !== id);
      toastListeners.delete(listener);
      notifyToastListeners();
    };
  }, [id]);
  const rawIndex = toastOrder.indexOf(id);
  const index = rawIndex === -1 ? toastOrder.length : rawIndex;
  const count = rawIndex === -1 ? toastOrder.length + 1 : toastOrder.length;
  return { offset: (count - 1 - index) * TOAST_STACK_GAP, z: 130 + index };
}

/** A short, self-dismissing confirmation -- same visual language as
 *  UndoToast, for actions that need acknowledgement but nothing to undo
 *  (a first Like/Dislike tap's explainer, "Added to your Top 3"). */
export function Toast({ message, onClose, duration = 3200 }: { message: string; onClose: () => void; duration?: number }) {
  const { offset, z } = useToastStack();
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
      // bottom/z-index carry the stack offset above via a CSS variable so
      // the mobile and md: bottom values both still apply at their own
      // breakpoint (an inline style would otherwise win over md:bottom-8
      // regardless of viewport).
      <div className="marketing-v2 themeable pointer-events-none fixed inset-x-0 flex justify-center px-5 bottom-[calc(88px+env(safe-area-inset-bottom)+var(--toast-offset,0px))] md:bottom-[calc(32px+var(--toast-offset,0px))]" style={{ background: "transparent", zIndex: z, "--toast-offset": `${offset}px` } as CSSProperties}>
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
