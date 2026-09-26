"use client";

// A right-hand detail panel: the one place a card's full breakdown and its
// actions live, so the screen underneath can stay a calm grid of summaries
// (progressive disclosure; "drill-downs should help take action"). Same
// modal conventions as DocumentPreview: Portal out of <main>, a backdrop
// that closes on click, role="dialog", Escape to close.

import { useEffect } from "react";
import { X } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";

export function SidePanel({ open, onClose, title, subtitle, children }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[80] flex justify-end">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.55)", backdropFilter: "blur(2px)" }} />
        <aside role="dialog" aria-modal="true" aria-label={title} className="relative flex h-full w-full max-w-[440px] flex-col gap-[var(--space-5)] overflow-y-auto border-l p-[var(--space-6)]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "var(--cd-panel-shadow)" }}>
          <div className="flex items-start justify-between gap-[12px]">
            <span className="flex min-w-0 flex-col gap-[3px]">
              <h2 className="text-[17px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
              {subtitle && <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{subtitle}</span>}
            </span>
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-[var(--radius-sm)]" style={{ color: "var(--muted-foreground)" }}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {children}
        </aside>
      </div>
    </Portal>
  );
}
