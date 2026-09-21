"use client";

import { createPortal } from "react-dom";
import { resolveCareer } from "./data";

/** Top 3 is full -- pick one to swap out. Same structure and copy as
 *  ProfileExperience's own swap-picker (extracted so Career Detail's "+"
 *  button can reuse it, direct feedback 21 Sept 2026), with the backdrop
 *  blur raised to the app-wide 28px floor (21 Sept 2026 app-wide blur
 *  pass -- see the other modal backdrops touched the same day). */
export function Top3SwapModal({ incomingId, currentIds, onConfirm, onCancel }: { incomingId: string; currentIds: string[]; onConfirm: (outgoingId: string) => void; onCancel: () => void }) {
  if (typeof document === "undefined") return null;
  const incoming = resolveCareer(incomingId);
  return createPortal(
    <div
      className="marketing-v2 themeable no-print fixed inset-0 z-[60] flex items-end justify-center pb-[calc(76px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
      style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}
      onPointerUp={(event) => { if (event.target === event.currentTarget) onCancel(); }}
    >
      <div
        className="dm-scroll filters-reveal max-h-[calc(100dvh-96px)] w-full max-w-[440px] overflow-y-auto rounded-[var(--radius-xl)] border p-[var(--space-6)] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}
      >
        <p className="text-[17px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Top 3 is full</p>
        <p className="mt-1 text-[15px]" style={{ color: "var(--muted-foreground)" }}>
          Swap one out for <strong style={{ color: "var(--foreground)" }}>{incoming?.title ?? "this career"}</strong>. It returns to Saved.
        </p>
        <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-2)]">
          {currentIds.map((id) => {
            const career = resolveCareer(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onConfirm(id)}
                className="dm-quiet flex min-h-[52px] cursor-pointer items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-4)] text-left text-[15px] font-semibold"
                style={{ borderColor: "var(--glass-border)" }}
              >
                <span className="min-w-0 truncate">{career?.title ?? id}</span>
                <span className="flex-none text-[13px] font-bold" style={{ color: "var(--accent-subtle)" }}>Replace</span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onCancel} className="dm-link mt-[var(--space-4)] w-full cursor-pointer rounded-[var(--radius-md)] py-[var(--space-3)] text-center text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          Never mind
        </button>
      </div>
    </div>,
    document.body,
  );
}
