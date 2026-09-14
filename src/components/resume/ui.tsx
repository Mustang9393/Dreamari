"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SparkBar } from "@/components/flow/SparkBar";
import { Portal } from "@/components/profile/CareerReport";

// Shared field/card styling for every resume step -- copied verbatim from
// ProfileExperience.tsx's own Settings form fields (SETTINGS_FIELD/_STYLE/
// _LABEL/_CARD, ProfileExperience.tsx:2221-2225) rather than imported, since
// those are file-local consts in a 2500+ line file. Same look, independent
// module.
export const FIELD_CLASS = "min-h-[44px] w-full rounded-[var(--radius-md)] border px-[var(--space-3)] text-[15px] font-semibold outline-none focus:border-[var(--primary)]";
export const FIELD_STYLE: CSSProperties = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" };
export const LABEL_CLASS = "text-[12px] font-bold tracking-[0.06em] uppercase";
export const CARD_CLASS = "flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]";
export const INSET = { background: "var(--inset-surface)", borderColor: "var(--inset-border)" } as const;
export const DANGER = "var(--color-feedback-error, #ff6b6b)";

export function Field({ label, htmlFor, children, required }: { label: string; htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label className={LABEL_CLASS} htmlFor={htmlFor} style={{ color: "var(--muted-foreground)" }}>
        {label}
        {required && <span style={{ color: "var(--accent-subtle)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput({ id, value, onChange, placeholder, type = "text", invalid, ...rest }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; invalid?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange" | "placeholder" | "type">) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={FIELD_CLASS}
      style={{ ...FIELD_STYLE, borderColor: invalid ? DANGER : FIELD_STYLE.borderColor }}
      {...rest}
    />
  );
}

export function SelectInput({ id, value, onChange, children }: { id: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${FIELD_CLASS} cursor-pointer`} style={FIELD_STYLE}>
      {children}
    </select>
  );
}

// ---------------------------------------------------------------------------
// Progress -- SparkBar is the app's shared animated-fill primitive (also
// what Build's own PhaseProgress wraps, src/components/build/ui.tsx:84-115),
// reused here labeled "RESUME" instead of "BUILD" rather than re-derived.
// ---------------------------------------------------------------------------

export const WIZARD_STEPS = ["Personal Information", "Education", "Experience & Activities", "Skills", "Certifications", "Review"] as const;

export function WizardProgress({ stepIndex }: { stepIndex: number }) {
  const percent = Math.round(((stepIndex + 1) / WIZARD_STEPS.length) * 100);
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--accent-subtle)" }}>Resume · {WIZARD_STEPS[stepIndex]}</span>
        <span className="text-[11px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{percent}%</span>
      </div>
      <SparkBar percent={percent} fill="var(--primary)" glow="var(--primary)" memoryKey="resume-wizard" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer -- sticky so Back/Next never scroll off a tall step (same reasoning
// as Build's StepFooter, src/components/build/ui.tsx:259-322), styled with
// Profile's own button language instead of Build's dark-flow <Button/>.
// ---------------------------------------------------------------------------

export function WizardFooter({ onBack, onNext, nextLabel = "Save & Next", nextDisabled, backLabel = "Back" }: { onBack?: () => void; onNext: () => void; nextLabel?: ReactNode; nextDisabled?: boolean; backLabel?: string }) {
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-[var(--space-3)] border-t px-[var(--space-1)] pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--surface)" }}>
      {onBack ? (
        <button type="button" onClick={onBack} className="dm-tap flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> {backLabel}
        </button>
      ) : <span />}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="dm-solid flex min-h-[44px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: "var(--primary)" }}
      >
        {nextLabel} <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast -- fixes the reference's two toast bugs (direct feedback, 14 Sept
// 2026): auto-dismisses on its own (~2.5s, not sticking around until
// manually closed) and is positioned above the sticky footer, never over it.
// ---------------------------------------------------------------------------

export function ResumeToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 2500);
    return () => window.clearTimeout(t);
  }, [onClose]);
  return (
    <Portal>
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[130] flex justify-center px-5">
        <div role="status" className="pointer-events-auto flex items-center gap-[10px] rounded-[var(--radius-md)] border px-[var(--space-4)] py-[10px] text-[13.5px] font-bold shadow-xl motion-safe:animate-[fade-slide-up_0.25s_ease-out_both]" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          {message}
        </div>
      </div>
    </Portal>
  );
}

/** One-shot toast state a step can drop in with a single `showToast()` call. */
export function useResumeToast() {
  const [message, setMessage] = useState<string | null>(null);
  return {
    toast: message ? <ResumeToast message={message} onClose={() => setMessage(null)} /> : null,
    showToast: (m: string) => setMessage(m),
  };
}

// ---------------------------------------------------------------------------
// Modal -- the shared "Add Education" / "Add Certification" / Experience
// wrapper. Centered card over a scrim, same corner-radius/border language as
// everything else here.
// ---------------------------------------------------------------------------

export function ResumeModal({ title, onClose, children, width = 480 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" style={{ background: "color-mix(in srgb, var(--background) 70%, transparent)" }} onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ maxWidth: width, background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)" }}>
          <div className="flex flex-none items-center justify-between border-b px-[var(--space-5)] py-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
            <h3 className="text-[16px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
            <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-[var(--space-5)] py-[var(--space-4)]">{children}</div>
        </div>
      </div>
    </Portal>
  );
}
