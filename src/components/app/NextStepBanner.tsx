"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X, type LucideIcon } from "lucide-react";

// The compact "what now" banner (Joshua Pierce, Slack, 5 Sept 2026): a slow
// glow so the eye lands on it without it shouting, one sentence, one button,
// a small X that remembers the dismissal. One component for every bridge
// between features: Top Three -> Play, Play -> Explore.
export function NextStepBanner({
  eyebrow,
  text,
  ctaLabel,
  href,
  Icon,
  storageKey,
  ariaLabel = eyebrow,
  emphasis = "quiet",
}: {
  eyebrow: string;
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
  if (priority) {
    return (
      <aside aria-label={ariaLabel} className="relative overflow-hidden rounded-[var(--radius-lg)]" style={{ background: "linear-gradient(120deg, var(--primary) 0%, #5b6cf5 55%, #7c5cff 100%)", boxShadow: "0 18px 48px -18px color-mix(in srgb, var(--primary) 80%, transparent)" }}>
        {/* the glow breathes around the whole surface and a light sweeps
           across it: the only saturated block on the page, so the eye goes
           here first without the banner growing */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] motion-safe:animate-[next-step-glow_2.8s_ease-in-out_infinite]" style={{ boxShadow: "0 0 72px -8px var(--primary), 0 0 28px -4px color-mix(in srgb, #7c5cff 80%, transparent)" }} />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 w-[40%] motion-safe:animate-[next-step-sheen_4.5s_ease-in-out_infinite]" style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%)" }} />
        <div className="relative flex flex-wrap items-center justify-end gap-[var(--space-3)] p-[var(--space-4)] sm:flex-nowrap sm:gap-[var(--space-4)] sm:p-[var(--space-5)]">
          <span className="flex min-w-0 basis-full flex-col gap-[3px] sm:flex-1 sm:basis-auto">
            <span className="flex items-center gap-[7px] text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.85)" }}>
              <span aria-hidden className="relative flex size-[8px] flex-none">
                <span className="absolute inset-0 rounded-full motion-safe:animate-[next-step-dot_1.8s_ease-out_infinite]" style={{ background: "#FFFFFF" }} />
                <span className="relative size-[8px] rounded-full" style={{ background: "#FFFFFF" }} />
              </span>
              {eyebrow}
            </span>
            <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "#FFFFFF" }}>{text}</span>
          </span>
          <Link href={href} className="dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold sm:px-[var(--space-5)] motion-safe:animate-[next-step-cta-pulse-light_2.8s_ease-out_infinite]" style={{ background: "#FFFFFF", color: "var(--primary)" }}>
            {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
          </Link>
          <button type="button" onClick={dismiss} aria-label={`Dismiss: ${eyebrow}`} className="dm-quiet -mr-[6px] flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "rgba(255,255,255,0.8)" }}>
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </aside>
    );
  }
  return (
    <aside aria-label={ariaLabel} className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--inset-surface)", borderColor: "color-mix(in srgb, var(--primary) 55%, var(--glass-border))" }}>
      {/* the glow breathes, a light sweeps across every few seconds, and the
         button carries a soft ring pulse: the eye lands here, the size stays */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] motion-safe:animate-[next-step-glow_2.8s_ease-in-out_infinite]" style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 60%, transparent), 0 0 64px -10px var(--primary), 0 0 22px -6px color-mix(in srgb, var(--primary) 70%, transparent)" }} />
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(110deg, color-mix(in srgb, var(--primary) 26%, transparent) 0%, transparent 42%, color-mix(in srgb, #7c5cff 18%, transparent) 72%, transparent 100%)" }} />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 w-[40%] motion-safe:animate-[next-step-sheen_4.5s_ease-in-out_infinite]" style={{ background: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.09) 50%, transparent 100%)" }} />
      {/* one row: the words, the button, then the X at the far end, all on
         the same centre line (the X used to float in the top-left corner) */}
      <div className="relative flex flex-wrap items-center justify-end gap-[var(--space-3)] p-[var(--space-4)] sm:flex-nowrap sm:gap-[var(--space-4)] sm:p-[var(--space-5)]">
        {/* phones: the sentence takes the full width, the button and X drop
           to a line beneath it; from 640px everything sits on one line */}
        <span className="flex min-w-0 basis-full flex-col gap-[3px] sm:flex-1 sm:basis-auto">
          <span className="text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--accent-subtle)" }}>{eyebrow}</span>
          <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{text}</span>
        </span>
        <Link href={href} className="dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold sm:px-[var(--space-5)] motion-safe:animate-[next-step-cta-pulse_2.8s_ease-out_infinite]" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
          {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
        </Link>
        <button type="button" onClick={dismiss} aria-label={`Dismiss: ${eyebrow}`} className="dm-quiet -mr-[6px] flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
