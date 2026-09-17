"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SparkBar } from "@/components/flow/SparkBar";
import { Portal } from "@/components/profile/CareerReport";

// Shared field/card styling for every resume step -- copied verbatim from
// ProfileExperience.tsx's own Settings form fields (SETTINGS_FIELD/_STYLE/
// _LABEL/_CARD, ProfileExperience.tsx:2221-2225) rather than imported, since
// those are file-local consts in a 2500+ line file. Same look, independent
// module.
const FIELD_CLASS = "min-h-[44px] w-full rounded-[var(--radius-md)] border px-[var(--space-3)] text-[15px] font-semibold outline-none focus:border-[var(--primary)]";
export const FIELD_STYLE: CSSProperties = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" };
const LABEL_CLASS = "text-[12px] font-bold tracking-[0.06em] uppercase";
export const CARD_CLASS = "flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]";
export const INSET = { background: "var(--inset-surface)", borderColor: "var(--inset-border)" } as const;
export const DANGER = "var(--color-feedback-error, #ff6b6b)";
/** Shared disclaimer wherever a check/preview could otherwise read as a
 *  promise (ATS Check, Text Preview). One sentence, one source, so it
 *  can't drift into two different claims. */
export const NOT_A_GUARANTEE_NOTE = "Not a guarantee every system reads it the same way.";
/** The selected/checked border + tint every pick-row and template swatch
 *  in this feature uses -- same object literal was hand-copied three
 *  times (TemplateGallery, TailorScreen x2), which risked one drifting
 *  from the others. */
export function selectedRowStyle(active: boolean): CSSProperties {
  return active ? { borderColor: "var(--primary)", background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : { borderColor: "var(--glass-border)" };
}

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

// "Experience & Activities" here (plural, matching the reference's own big
// on-page header for this step), but the Review checklist's own item for
// the same step reads "Experience & Activity" (singular) in the reference
// -- a genuine inconsistency in the source between two different UI
// elements, re-checked live rather than assumed to be a typo on either
// side (direct feedback, 16 Sept 2026: "dont be lazy... match every
// pixel"). ReviewStep's own item label is set independently to match.
const WIZARD_STEPS = ["Personal Information", "Education", "Experience & Activities", "Skills", "Certifications", "Review"] as const;

export function WizardProgress({ stepIndex, leading }: { stepIndex: number; leading?: ReactNode }) {
  const percent = Math.round(((stepIndex + 1) / WIZARD_STEPS.length) * 100);
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-[var(--space-3)]">
        {leading}
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--accent-subtle)" }}>Resume · {WIZARD_STEPS[stepIndex]}</span>
        <span className="ml-auto flex-none text-[11px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{percent}%</span>
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
  // var(--surface) here, not var(--card) -- this footer sits sticky INSIDE
  // a rounded var(--card) panel (every wizard step, Edit Selection), and
  // --surface renders visibly darker than --card with square corners
  // where the card is rounded. The mismatch read as a separate floating
  // dark rectangle rather than part of the card underneath it (direct
  // feedback, 16 Sept 2026: "a weird dark shape with a dark border and
  // floating inside the surfaces... clipped by padding"). Matching the
  // card's own background makes it read as one continuous panel again.
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-between gap-[var(--space-3)] border-t px-[var(--space-1)] pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
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

function ResumeToast({ message, onClose }: { message: string; onClose: () => void }) {
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
// wrapper. IN-PLACE, not a floating overlay (direct feedback, 15 Sept
// 2026, after a first attempt as a fixed left-anchored drawer: "the side
// bar doesn't cover the modal underneath, so it looks cluttered sitting
// above each other" -- a fixed-position drawer can't line up with a
// responsive grid column without measuring it, and even then it's a
// second layer floating over the first). This version isn't positioned at
// all: each step (EducationStep, CertificationsStep, the wizard's own
// Experience branch) swaps its OWN body for this form and swaps back on
// close, so there is only ever one thing in that card at a time -- no
// overlap is possible by construction. The live preview lives in the
// grid's other column entirely, so it was never at risk either way.
// ---------------------------------------------------------------------------

// The document toolbar's own button: icon-only (a plain square, no pill)
// below `lg`, icon+label at `lg` and up. Was a row of full pill buttons at
// every width -- 6-7 of them wrapped onto multiple lines on tablet and
// mobile, each one ALSO wrapping its own two-word label onto two lines,
// which both overflowed the screen and roughly tripled the toolbar's
// height (direct feedback, 17 Sept 2026: "too many controls on top of the
// preview on tablet mode... can we do icons only"). `title` carries the
// label as a native tooltip once the visible text is gone.
export function ToolbarButton({ label, onClick, children, iconOnly = false }: { label: string; onClick: () => void; children: ReactNode; /** icon at every width, label only in the tooltip (the document header, direct feedback 17 Sept 2026: "one line is enough") */ iconOnly?: boolean }) {
  // Below lg the button is icon-only, so the label comes back as a real
  // tooltip on hover and keyboard focus, in the same bubble the Dream
  // Score chip uses (direct feedback, 17 Sept 2026: "anywhere we use only
  // icons... a tooltip should show on hover with the label"). Hidden from
  // lg up, where the label is already printed.
  return (
    <Tip label={label} hideFromLg={!iconOnly}>
      <button
        type="button"
        data-print-hide
        aria-label={label}
        onClick={onClick}
        className={`dm-tap flex size-9 flex-none cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border text-[13.5px] font-bold whitespace-nowrap ${iconOnly ? "" : "lg:h-auto lg:w-auto lg:px-[var(--space-4)] lg:py-[10px]"}`}
        style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
      >
        {children}
        {!iconOnly && <span className="hidden lg:inline">{label}</span>}
      </button>
    </Tip>
  );
}

/** The tooltip bubble itself, portalled to the body and positioned from the
 *  trigger's rect. Rendering it inline under the trigger looked right in
 *  the DOM but painted BEHIND whatever came next (the resume sheet, the
 *  next saved-resume row): those neighbours carry their own stacking
 *  contexts (entrance animations that keep a transform after they fill),
 *  so no z-index inside the header could win (17 Sept 2026). */
function Tip({ label, children, hideFromLg = false, className = "" }: { label: string; children: ReactNode; hideFromLg?: boolean; className?: string }) {
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setTip({ x: r.left + r.width / 2, y: r.bottom + 8 });
  };
  const hide = () => setTip(null);
  // Scrolling under an open tooltip would leave it stranded; dismiss instead.
  useEffect(() => {
    if (!tip) return;
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", hide, { capture: true } as EventListenerOptions);
  }, [tip]);
  return (
    <span ref={ref} className={`relative flex flex-none ${className}`} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} aria-describedby={tip ? id : undefined}>
      {children}
      {tip && (
        <Portal>
          <span
            id={id}
            role="tooltip"
            className={`pointer-events-none fixed z-[9999] -translate-x-1/2 rounded-[var(--radius-sm)] border px-[10px] py-[6px] text-[12px] leading-[16px] font-semibold whitespace-nowrap motion-safe:animate-[fade-slide-up_0.18s_ease-out_both] ${hideFromLg ? "lg:hidden" : ""}`}
            style={{ left: tip.x, top: tip.y, background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)", color: "var(--foreground)", boxShadow: "0 14px 30px -16px rgba(0,0,0,0.7)", fontFamily: "var(--font-body)" }}
          >
            {label}
          </span>
        </Portal>
      )}
    </span>
  );
}

export function ResumeModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-4)] motion-safe:animate-[resume-drawer-in_0.22s_ease-out_both]">
      <div className="flex flex-none items-center gap-[var(--space-2)] border-b pb-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
        <button type="button" aria-label="Back" onClick={onClose} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <h3 className="text-[16px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
      </div>
      <div className="flex flex-col gap-[var(--space-4)]">{children}</div>
    </div>
  );
}

/** Universal rule (direct feedback, 17 Sept 2026): anything icon-only shows
 *  its label as a tooltip on hover and keyboard focus. Wrap the control. */
export function IconTip({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <Tip label={label} className={className}>{children}</Tip>;
}
