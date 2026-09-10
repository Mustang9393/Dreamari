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
  if (priority) {
    return (
      <div>
      <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={1.8} strength={1}>
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
          <div className="relative flex flex-wrap items-center justify-start gap-[var(--space-3)] p-[var(--space-4)] sm:flex-nowrap sm:gap-[var(--space-4)] sm:p-[var(--space-5)] sm:pr-[52px]">
            <span className="flex min-w-0 basis-full flex-col gap-[3px] sm:flex-1 sm:basis-auto">
              {eyebrow && <span className="flex items-center gap-[7px] pr-[28px] text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase sm:pr-0" style={{ color: "var(--primary)" }}>
                <span aria-hidden className="relative flex size-[8px] flex-none">
                  {!calm && <span className="absolute inset-0 rounded-full motion-safe:animate-[next-step-dot_1.4s_ease-out_infinite]" style={{ background: "var(--primary)" }} />}
                  <span className="relative size-[8px] rounded-full" style={{ background: "var(--primary)" }} />
                </span>
                {eyebrow}
              </span>}
              <span className={`text-[15px] leading-[21px] font-semibold ${eyebrow ? "" : "pr-[28px] sm:pr-0"}`} style={{ color: "var(--foreground)" }}>{text}</span>
            </span>
            <Link href={href} className={`dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)] ${calm ? "" : "motion-safe:animate-[next-step-cta-pulse_2.2s_ease-out_infinite]"}`} style={{ background: "var(--primary)", color: "#FFFFFF" }}>
              {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
            </Link>
          </div>
          <button type="button" onClick={dismiss} aria-label={`Dismiss: ${eyebrow || text}`} className="dm-quiet absolute top-[8px] right-[8px] flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </aside>
      </BorderBeam>
      </div>
    );
  }
  return (
    <div>
    <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.2} strength={0.7}>
      <aside aria-label={ariaLabel} className="relative overflow-hidden rounded-[var(--radius-lg)]" style={{ background: "var(--inset-surface)" }}>
        {/* BorderBeam (border-beam npm package) rides the border; the wash
           +sheen below run on their own slower, unrelated cycle so they
           read as atmosphere behind the ring rather than a second beam
           competing with it (direct feedback, 9 Sept 2026). */}
        {!calm && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: "linear-gradient(110deg, color-mix(in srgb, var(--primary) 9%, transparent) 0%, transparent 45%, color-mix(in srgb, #7c5cff 7%, transparent) 80%, transparent 100%)", animation: "next-step-wash 6.5s ease-in-out infinite" }} />}
        {!calm && <span aria-hidden className="pointer-events-none absolute inset-y-0 w-[35%] motion-safe:animate-[next-step-sheen_7.5s_ease-in-out_infinite]" style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)" }} />}
        {/* one row: the words, the button, then the X at the far end, all on
           the same centre line (the X used to float in the top-left corner) */}
        <div className="relative flex flex-wrap items-center justify-start gap-[var(--space-3)] p-[var(--space-4)] sm:flex-nowrap sm:gap-[var(--space-4)] sm:p-[var(--space-5)] sm:pr-[52px]">
          {/* phones: the sentence takes the full width and the button drops to
             a line beneath it; from 640px everything sits on one line. The X
             lives in the card's top-right corner (direct feedback, 10 Sept
             2026), out of the row, so it never leaves a hole in the layout. */}
          <span className="flex min-w-0 basis-full flex-col gap-[3px] sm:flex-1 sm:basis-auto">
            {eyebrow && <span className="pr-[28px] text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase sm:pr-0" style={{ color: "var(--accent-subtle)" }}>{eyebrow}</span>}
            <span className={`text-[15px] leading-[21px] font-semibold ${eyebrow ? "" : "pr-[28px] sm:pr-0"}`} style={{ color: "var(--foreground)" }}>{text}</span>
          </span>
          <Link href={href} className={`dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)] ${calm ? "" : "motion-safe:animate-[next-step-cta-pulse_3.2s_ease-out_infinite]"}`} style={{ background: "var(--primary)", color: "#FFFFFF" }}>
            {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
          </Link>
        </div>
        <button type="button" onClick={dismiss} aria-label={`Dismiss: ${eyebrow || text}`} className="dm-quiet absolute top-[8px] right-[8px] flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </aside>
    </BorderBeam>
    </div>
  );
}
