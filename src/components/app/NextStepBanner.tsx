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
}: {
  eyebrow: string;
  text: string;
  ctaLabel: string;
  href: string;
  Icon?: LucideIcon;
  /** localStorage key that remembers the X; omit for a banner that always shows */
  storageKey?: string;
  ariaLabel?: string;
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
  return (
    <aside aria-label={ariaLabel} className="relative overflow-hidden rounded-[var(--radius-lg)] border" style={{ background: "var(--inset-surface)", borderColor: "color-mix(in srgb, var(--primary) 55%, var(--glass-border))" }}>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] motion-safe:animate-[next-step-glow_3.2s_ease-in-out_infinite]" style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 45%, transparent), 0 0 44px -12px var(--primary)" }} />
      <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(110deg, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 42%, color-mix(in srgb, #7c5cff 14%, transparent) 72%, transparent 100%)" }} />
      <button type="button" onClick={dismiss} aria-label={`Dismiss: ${eyebrow}`} className="dm-quiet absolute top-[8px] left-[8px] z-[1] flex size-7 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
      <div className="relative flex flex-wrap items-center gap-[var(--space-3)] p-[var(--space-4)] pl-[40px] sm:gap-[var(--space-4)] sm:p-[var(--space-5)] sm:pl-[44px]">
        <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--accent-subtle)" }}>{eyebrow}</span>
          <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>{text}</span>
        </span>
        <Link href={href} className="dm-solid flex min-h-[40px] flex-none items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-semibold" style={{ background: "var(--primary)", color: "#FFFFFF" }}>
          {Icon && <Icon className="h-4 w-4" aria-hidden />} {ctaLabel}
        </Link>
      </div>
    </aside>
  );
}
