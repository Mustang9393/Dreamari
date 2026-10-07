"use client";

// The document workspace on phones and tablets (8 Oct 2026, Chandu: "we need
// a better UI for tablet and mobile, not stacking every row. Think about
// usability, touch controls, pinching... The preview should be the dominant
// full screen and the tools like how Canva, other graphic editors or doc
// editors work on mobile"). Below lg the page fills the screen and pinches
// to zoom; the tools live in a bottom bar, and each opens a bottom sheet
// over the page instead of a column of stacked panels.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minimize2, X } from "lucide-react";

/** Two-finger pinch (and double tap) zoom for the page. The zoom widens the
 *  page's box rather than scaling pixels, so FitPage re-renders the text
 *  crisp at every size; one finger scrolls. */
export function PinchZoom({ children }: { children: React.ReactNode }) {
  const [zoom, setZoom] = useState(1);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ d: number; z: number } | null>(null);
  const lastTap = useRef(0);
  const dist = () => {
    const [a, b] = [...pts.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const clamp = (z: number) => Math.min(3, Math.max(1, z));
  return (
    <div className="relative">
      <div
        className="overflow-auto overscroll-contain [scrollbar-width:none]"
        style={{ touchAction: "pan-x pan-y" }}
        onPointerDown={(e) => {
          if (e.pointerType !== "touch") return;
          pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pts.current.size === 2) start.current = { d: dist(), z: zoom };
          if (pts.current.size === 1) {
            const now = Date.now();
            if (now - lastTap.current < 280) setZoom((z) => (z > 1 ? 1 : 2));
            lastTap.current = now;
          }
        }}
        onPointerMove={(e) => {
          if (!pts.current.has(e.pointerId)) return;
          pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pts.current.size === 2 && start.current) setZoom(clamp(start.current.z * (dist() / Math.max(1, start.current.d))));
        }}
        onPointerUp={(e) => { pts.current.delete(e.pointerId); if (pts.current.size < 2) start.current = null; }}
        onPointerCancel={(e) => { pts.current.delete(e.pointerId); if (pts.current.size < 2) start.current = null; }}
      >
        <div style={{ width: `${zoom * 100}%` }}>{children}</div>
      </div>
      {zoom > 1.02 && (
        <button type="button" onClick={() => setZoom(1)} className="absolute top-[8px] right-[8px] z-[2] inline-flex h-9 cursor-pointer items-center gap-[6px] rounded-full border px-[12px] text-[12.5px] font-bold" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          <Minimize2 className="h-[13px] w-[13px]" aria-hidden /> {Math.round(zoom * 100)}%
        </button>
      )}
    </div>
  );
}

/** A tool's bottom sheet: the page stays visible above it. */
export function ToolSheet({ title, open, onClose, children, tall = false }: { title: string; open: boolean; onClose: () => void; children: React.ReactNode; tall?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[115] flex flex-col justify-end lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "color-mix(in srgb, var(--background) 40%, transparent)" }} />
      <div className={`relative flex flex-col overflow-hidden rounded-t-[22px] border-t ${tall ? "h-[88dvh]" : "max-h-[72dvh]"}`} style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)", fontFamily: "var(--font-body)", paddingBottom: "env(safe-area-inset-bottom)", boxShadow: "0 -18px 48px -20px rgba(0,0,0,0.5)" }}>
        <span aria-hidden className="mx-auto mt-[8px] h-[5px] w-[40px] flex-none rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 22%, transparent)" }} />
        <div className="flex flex-none items-center justify-between px-[18px] pt-[8px] pb-[10px]">
          <h2 className="text-[17px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-10 cursor-pointer items-center justify-center rounded-full"><X className="h-5 w-5" aria-hidden /></button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto overscroll-contain px-[18px] pb-[18px]">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** One tool in the bottom bar: icon over a short label, a 56px touch target. */
export function ToolButton({ icon: Icon, label, onClick, primary = false, disabled = false }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex min-h-[56px] min-w-[56px] flex-1 cursor-pointer flex-col items-center justify-center gap-[3px] rounded-[14px] px-[4px] text-[11.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      style={primary ? { background: "var(--primary)", color: "var(--primary-foreground)" } : { color: "var(--foreground)" }}>
      <Icon className="h-[20px] w-[20px]" />
      <span className="leading-none whitespace-nowrap">{label}</span>
    </button>
  );
}
