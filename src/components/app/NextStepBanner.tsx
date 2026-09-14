"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X, type LucideIcon } from "lucide-react";
import { BorderBeam } from "border-beam";

// The compact "what now" banner (Joshua Pierce, Slack, 5 Sept 2026): a slow
// glow so the eye lands on it without it shouting, one sentence, one button,
// a small X that remembers the dismissal. One component for every bridge
// between features: Top Three -> Play, Play -> Explore.
export function NextStepBanner({
  eyebrow = "",
  text,
  ctaLabel,
  href,
  Icon,
  storageKey,
  ariaLabel = eyebrow || text,
  emphasis = "quiet",
  calm = false,
  beamDuration,
}: {
  /** small uppercase line above the text; omit or pass "" for just the text */
  eyebrow?: string;
  text: string;
  ctaLabel: string;
  href: string;
  Icon?: LucideIcon;
  /** localStorage key that remembers the X; omit for a banner that always shows */
  storageKey?: string;
  ariaLabel?: string;
  /** "priority": the one thing to do next. Solid brand surface, white type,
   *  a pulsing dot on the eyebrow; same size as the quiet banner (Joshua
   *  Pierce, Slack, 6 Sept 2026: more obvious, not larger). */
  emphasis?: "quiet" | "priority";
  /** beam ring only: no wash, no sheen (direct feedback, 11 Sept 2026: "lose the shimmer") */
  calm?: boolean;
  /** seconds per lap of the ring; overrides the emphasis default (1.8 priority, 3.2 quiet) */
  beamDuration?: number;
}) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!storageKey) return;
    // syncing with the browser's storage (an external system), which is what
    // the set-state-in-effect rule exists to allow
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(storageKey) === "1") setHidden(true);
    } catch {}
  }, [storageKey]);
  if (hidden) return null;
  const dismiss = () => {
    setHidden(true);
    if (storageKey) {
      try { window.localStorage.setItem(storageKey, "1"); } catch {}
    }
  };
  const priority = emphasis === "priority";
  // The plain wrapper div matters: BorderBeam's root sets its own
  // `animation` shorthand, which overrides a parent `.seq-reveal > *`
  // fade-slide-up rule -- and that rule starts every child at opacity 0.
  // Unwrapped, the banner stayed invisible forever inside a seq-reveal
  // page (Play: a 144px blank between Glossary Games and In the works,
  // direct feedback, 10 Sept 2026). The wrapper takes the reveal instead.
  // The X used to sit inset inside the card's own corner, which forced the
  // text/CTA row to reserve clearance for it -- on a narrow phone that
  // clearance was enough to push the CTA onto its own line beneath the
  // sentence, turning a compact one-line nudge into a tall stack (direct
  // feedback, 14 Sept 2026: "looks really bad and taking up too much space
  // vertically"). It's now a small circular badge attached to, and poking
  // out past, the card's top-right corner instead -- outside the row
  // entirely, so the row never has to make room for it and can keep text
  // and CTA on one line at every width, matching the "Do this next" row on
  // Overview. It has to live outside the `aside` (rendered as a sibling in
  // the outer `relative` wrapper) because the `aside` clips its own
  // overflow for the wash/sheen animation, which would cut the badge off
  // wherever it pokes past the edge.
  const dismissButton = (
    <button
      type="button"
      onClick={dismiss}
      aria-label={`Dismiss: ${eyebrow || text}`}
      className="dm-quiet absolute -top-[10px] -right-[10px] z-10 flex size-[26px] cursor-pointer items-center justify-center rounded-full border"
      style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--muted-foreground)", boxShadow: "0 4px 10px -4px rgba(0,0,0,0.5)" }}
    >
      <X className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
  if (priority) {
    return (
      <div className="relative">
      <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={beamDuration ?? 1.8} strength={beamDuration ? 0.75 : 1}>
        <aside aria-label={ariaLabel} className="relative overflow-hidden rounded-[var(--radius-lg)]" style={{ background: "var(--inset-surface)" }}>
          {/* Priority used to be a solid blue-purple gradient fill -- the one
             saturated block on an otherwise dark page, and it read as
             off-palette rather than urgent (direct feedback, 7 Sept 2026).
             Same cohesive dark surface as the quiet banner now; "priority"
             comes through motion instead -- BorderBeam, faster/stronger
             here than the quiet banner's slower one, at full strength (a
             little more accentuated than quiet, direct feedback, 9 Sept
             2026). The wash+sheen below run on their OWN, slower, unrelated
             cycle so they read as atmosphere, not a second competing beam. */}
          {!calm && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: "linear-gradient(110deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, transparent 45%, color-mix(in srgb, #7c5cff 10%, transparent) 80%, transparent 100%)", animation: "next-step-wash 5.2s ease-in-out infinite" }} />}
          {!calm && <span aria-hidden className="pointer-events-none absolute inset-y-0 w-[35%] motion-safe:animate-[next-step-sheen_5.4s_ease-in-out_infinite]" style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)" }} />}
          <div className="relative flex items-center gap-[var(--space-3)] p-[var(--space-4)] sm:gap-[var(--space-4)] sm:p-[var(--space-5)]">
            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
              {eyebrow && <span className="flex items-center gap-[7px] text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--primary)" }}>
                <span aria-hidden className="relative flex size-[8px] flex-none">
                  {!calm && <span className="absolute inset-0 rounded-full motion-safe:animate-[next-step-dot_1.4s_ease-out_infinite]" style={{ background: "var(--primary)" }} />}
                  <span className="relative size-[8px] rounded-full" style={{ background: "var(--primary)" }} />
                </span>
                {eyebrow}
              </span>}
              <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{text}</span>
            </span>
            <Link href={href} className={`dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)] ${calm ? "" : "motion-safe:animate-[next-step-cta-pulse_2.2s_ease-out_infinite]"}`} style={{ background: "var(--primary)", color: "#FFFFFF" }}>
              {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
            </Link>
          </div>
        </aside>
      </BorderBeam>
      {dismissButton}
      </div>
    );
  }
  return (
    <div className="relative">
    <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={beamDuration ?? 3.2} strength={0.7}>
      <aside aria-label={ariaLabel} className="relative overflow-hidden rounded-[var(--radius-lg)]" style={{ background: "var(--inset-surface)" }}>
        {/* BorderBeam (border-beam npm package) rides the border; the wash
           +sheen below run on their own slower, unrelated cycle so they
           read as atmosphere behind the ring rather than a second beam
           competing with it (direct feedback, 9 Sept 2026). */}
        {!calm && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: "linear-gradient(110deg, color-mix(in srgb, var(--primary) 9%, transparent) 0%, transparent 45%, color-mix(in srgb, #7c5cff 7%, transparent) 80%, transparent 100%)", animation: "next-step-wash 6.5s ease-in-out infinite" }} />}
        {!calm && <span aria-hidden className="pointer-events-none absolute inset-y-0 w-[35%] motion-safe:animate-[next-step-sheen_7.5s_ease-in-out_infinite]" style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)" }} />}
        {/* One row, at every width, text and CTA together (direct feedback,
           14 Sept 2026): the X no longer lives in this row at all (see the
           corner badge below), so the row never has to reserve space for it. */}
        <div className="relative flex items-center gap-[var(--space-3)] p-[var(--space-4)] sm:gap-[var(--space-4)] sm:p-[var(--space-5)]">
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            {eyebrow && <span className="text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--accent-subtle)" }}>{eyebrow}</span>}
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{text}</span>
          </span>
          <Link href={href} className={`dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)] ${calm ? "" : "motion-safe:animate-[next-step-cta-pulse_3.2s_ease-out_infinite]"}`} style={{ background: "var(--primary)", color: "#FFFFFF" }}>
            {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
          </Link>
        </div>
      </aside>
    </BorderBeam>
    {dismissButton}
    </div>
  );
}
