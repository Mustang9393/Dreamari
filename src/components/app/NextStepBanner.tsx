"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { BorderBeam } from "border-beam";
import { IconTip } from "@/components/app/IconTip";

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
  content,
  wrapperClassName = "",
  wrapperId,
  ctaHidden = false,
  ctaDelayMs = 0,
  sizeTo,
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
  /** rich or animated sentence in place of `text` (which stays the accessible name) */
  content?: ReactNode;
  /** classes and id for the outer wrapper (a one-time pulse, a scroll target) */
  wrapperClassName?: string;
  wrapperId?: string;
  /** hold the button back (a nudge phase that ends on the button's word) */
  ctaHidden?: boolean;
  /** when the button arrives after being held back, fade it in this late */
  ctaDelayMs?: number;
  /** the resting sentence: the banner is sized to it (and its button) from
   *  the start, so a nudge phase that changes the words never changes the
   *  banner's height (priority banners only) */
  sizeTo?: string;
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
      <div id={wrapperId} className={`relative ${wrapperClassName}`}>
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
          {/* Container-width wrap, not a viewport breakpoint (direct
             feedback, 27 Sept 2026: long text was crushed into a
             one-word-per-line column whenever this banner sat in a narrow
             column on an otherwise-wide screen -- a `sm:` switch can't see
             that). The text has flex-grow far outweighing the CTA's, so on
             a shared row it still absorbs the free space and the CTA stays
             its natural size (matching the old flex-1/flex-none look) --
             but the text also refuses to shrink below ~28ch, so once the
             row can no longer fit both, the CTA is alone on its own line
             and (grow:1, basis:0) fills it edge to edge. */}
          {/* sizeTo: an invisible copy of the resting line and its button
             shares the grid cell with the live row, so the cell is always
             the resting size and the live row centres inside it (direct
             feedback, 28 Sept 2026: "the banner becomes taller when the
             resting state happens, is that needed?"). */}
          <div className={`relative ${sizeTo ? "grid" : ""} p-[var(--space-4)] sm:p-[var(--space-5)]`}>
          {sizeTo && (
            <div aria-hidden className="invisible col-start-1 row-start-1 flex flex-wrap items-center justify-start gap-[var(--space-3)] sm:gap-[var(--space-4)]">
              <span className="flex min-w-[min(28ch,100%)] shrink grow-[999] basis-[28ch] flex-col gap-[3px]">
                <span className="text-[15px] leading-[21px] font-semibold">{sizeTo}</span>
              </span>
              <span className="flex min-h-[40px] grow shrink-0 basis-0 items-center justify-center gap-[6px] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)]">
                {Icon && <Icon className="h-4 w-4" />} {ctaLabel}
              </span>
            </div>
          )}
          <div className="col-start-1 row-start-1 flex flex-wrap content-center items-center justify-start gap-[var(--space-3)] sm:gap-[var(--space-4)]">
            <span className="flex min-w-[min(28ch,100%)] shrink grow-[999] basis-[28ch] flex-col gap-[3px]">
              {eyebrow && <span className="flex items-center gap-[7px] text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--primary)" }}>
                <span aria-hidden className="relative flex size-[8px] flex-none">
                  {!calm && <span className="absolute inset-0 rounded-full motion-safe:animate-[next-step-dot_1.4s_ease-out_infinite]" style={{ background: "var(--primary)" }} />}
                  <span className="relative size-[8px] rounded-full" style={{ background: "var(--primary)" }} />
                </span>
                {eyebrow}
              </span>}
              <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{content ?? text}</span>
            </span>
            {!ctaHidden && (
              <Link href={href} className={`dm-solid flex min-h-[40px] grow shrink-0 basis-0 items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)] ${calm ? "" : "motion-safe:animate-[next-step-cta-pulse_2.2s_ease-out_infinite]"} ${ctaDelayMs ? "motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]" : ""}`} style={{ background: "var(--primary)", color: "#FFFFFF", animationDelay: ctaDelayMs ? `${ctaDelayMs}ms` : undefined }}>
                {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
              </Link>
            )}
          </div>
          </div>
        </aside>
      </BorderBeam>
      {/* The X sits ON the banner's corner, not inside it (direct feedback,
         28 Sept 2026: "the x should not be taking up so much space, it can
         sit without causing extra padding on any side... breaking its
         layout but aesthetically"). A small chip straddling the border, like
         a notification's close button, so the sentence and the button get
         the full width. Outside the aside because the aside clips; the
         invisible ::before keeps a 44px hit area around the 26px chip. */}
      <IconTip label="Dismiss" className="absolute -top-[9px] -right-[9px] z-[2]">
        <button type="button" onClick={dismiss} aria-label={`Dismiss: ${eyebrow || text}`} className="dm-quiet relative flex size-[26px] cursor-pointer items-center justify-center rounded-full border before:absolute before:-inset-[9px] before:content-['']" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--muted-foreground)", boxShadow: "0 4px 12px rgba(0,0,0,0.35)" }}>
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </IconTip>
      </div>
    );
  }
  return (
    <div id={wrapperId} className={`relative ${wrapperClassName}`}>
    <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={beamDuration ?? 3.2} strength={0.7}>
      <aside aria-label={ariaLabel} className="relative overflow-hidden rounded-[var(--radius-lg)]" style={{ background: "var(--inset-surface)" }}>
        {/* BorderBeam (border-beam npm package) rides the border; the wash
           +sheen below run on their own slower, unrelated cycle so they
           read as atmosphere behind the ring rather than a second beam
           competing with it (direct feedback, 9 Sept 2026). */}
        {!calm && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: "linear-gradient(110deg, color-mix(in srgb, var(--primary) 9%, transparent) 0%, transparent 45%, color-mix(in srgb, #7c5cff 7%, transparent) 80%, transparent 100%)", animation: "next-step-wash 6.5s ease-in-out infinite" }} />}
        {!calm && <span aria-hidden className="pointer-events-none absolute inset-y-0 w-[35%] motion-safe:animate-[next-step-sheen_7.5s_ease-in-out_infinite]" style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)" }} />}
        {/* one row: the words, the button, then the X at the far end, all on
           the same centre line (the X used to float in the top-left corner).
           Wraps by container width, not viewport (direct feedback, 27 Sept
           2026): the text refuses to shrink below ~28ch (basis-[28ch] +
           matching min-width) and heavily outweighs the CTA's flex-grow, so
           it keeps the free space on a shared row; once the row can't fit
           both, the CTA lands alone on its own line and (grow, basis-0)
           fills it full width instead of the text getting crushed to one
           word per line. The X no longer reserves padding here: it is a chip on
           the banner's corner (below). */}
        <div className="relative flex flex-wrap items-center justify-start gap-[var(--space-3)] p-[var(--space-4)] sm:gap-[var(--space-4)] sm:p-[var(--space-5)]">
          <span className="flex min-w-[min(28ch,100%)] shrink grow-[999] basis-[28ch] flex-col gap-[3px]">
            {eyebrow && <span className="text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--accent-subtle)" }}>{eyebrow}</span>}
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{content ?? text}</span>
          </span>
          {!ctaHidden && (
            <Link href={href} className={`dm-solid flex min-h-[40px] grow shrink-0 basis-0 items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)] ${calm ? "" : "motion-safe:animate-[next-step-cta-pulse_3.2s_ease-out_infinite]"} ${ctaDelayMs ? "motion-safe:animate-[fade-slide-up_0.4s_ease-out_both]" : ""}`} style={{ background: "var(--primary)", color: "#FFFFFF", animationDelay: ctaDelayMs ? `${ctaDelayMs}ms` : undefined }}>
              {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
            </Link>
          )}
        </div>
      </aside>
    </BorderBeam>
      {/* The X sits ON the banner's corner, not inside it (direct feedback,
         28 Sept 2026: "the x should not be taking up so much space, it can
         sit without causing extra padding on any side... breaking its
         layout but aesthetically"). A small chip straddling the border, like
         a notification's close button, so the sentence and the button get
         the full width. Outside the aside because the aside clips; the
         invisible ::before keeps a 44px hit area around the 26px chip. */}
      <IconTip label="Dismiss" className="absolute -top-[9px] -right-[9px] z-[2]">
        <button type="button" onClick={dismiss} aria-label={`Dismiss: ${eyebrow || text}`} className="dm-quiet relative flex size-[26px] cursor-pointer items-center justify-center rounded-full border before:absolute before:-inset-[9px] before:content-['']" style={{ background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--muted-foreground)", boxShadow: "0 4px 12px rgba(0,0,0,0.35)" }}>
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </IconTip>
    </div>
  );
}
