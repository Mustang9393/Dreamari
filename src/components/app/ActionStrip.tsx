"use client";

// The quiet action strip for detail-page headers (career and school, 3 Oct
// 2026): icon-over-label buttons with no box until hover, the shape the For
// You rail uses. Chandu: "we don't want it to ruin the design with SOLID
// CTAs", and on the career page "how do other platforms do it?" (Netflix's
// title page: one row of icon-over-label actions).

import { useRef, useState } from "react";
import type React from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2, X } from "lucide-react";

// On phones a label may wrap to two centred lines ("Financial / aid"), so
// four or five actions share one row without colliding.
const BASE = "dm-quiet flex min-h-[52px] min-w-[64px] cursor-pointer flex-col items-center justify-start gap-[4px] rounded-[var(--radius-md)] px-[8px] py-[6px] text-center text-[12px] leading-[14px] font-semibold whitespace-nowrap disabled:cursor-wait max-sm:min-w-0 max-sm:px-[2px] max-sm:whitespace-normal";

// Boxed (8 Oct 2026, Usman: "Save, Top 3 and Connect don't look like action
// buttons"): the same actions as quiet outlined buttons, matching Glossary
// Game beside them, icon and label on one line at 44px, at every width.
const BOXED = "dm-quiet flex min-h-[44px] min-w-0 cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] border px-[12px] text-[13.5px] leading-[17px] font-semibold whitespace-nowrap disabled:cursor-wait max-sm:px-[8px] max-sm:text-[13px] [&>svg]:shrink-0";
// three across a narrow card: icon over label inside the box on phones
const TIGHT = " max-sm:min-h-[56px] max-sm:flex-col max-sm:gap-[4px] max-sm:px-[4px] max-sm:text-[12.5px]";
const boxStyle = (ink: string | undefined, on: boolean) => ({
  borderColor: on ? "color-mix(in srgb, var(--accent-subtle) 70%, transparent)" : ink ? "var(--glass-border)" : "rgba(255,255,255,0.3)",
  background: on ? "color-mix(in srgb, var(--accent-subtle) 16%, transparent)" : ink ? "var(--glass-surface-1)" : "rgba(12,16,35,0.55)",
});

/** A toggle or action. When on, a fresh hover or keyboard focus shows what a
 *  tap would do ("Remove") with an X; it waits for the pointer to leave
 *  after a tap so a fresh Save never reads as Remove. */
export function StripButton({ icon, label, onClick, ariaLabel, on = false, busy = false, pulse = false, offLabel, ink, boxed = false, tight = false, toolbar = false }: { icon: React.ReactNode; label: string; onClick: () => void; ariaLabel: string; on?: boolean; busy?: boolean; pulse?: boolean; offLabel?: string; /** text colour off the dark photo header (a themed sheet) */ ink?: string; /** an outlined button, not a bare icon over a label */ boxed?: boolean; /** boxed, three across a phone: icon over label there */ tight?: boolean; /** compact labeled action inside a sheet toolbar */ toolbar?: boolean }) {
  const [peek, setPeek] = useState(false);
  const armed = useRef(true);
  const showOff = on && !!offLabel && peek && !busy;
  return (
    <button type="button" aria-label={ariaLabel} aria-pressed={on} aria-busy={busy} disabled={busy}
      onPointerEnter={(e) => { if (e.pointerType === "mouse" && armed.current) setPeek(true); }}
      onPointerLeave={() => { setPeek(false); armed.current = true; }}
      onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setPeek(true); }}
      onBlur={() => setPeek(false)}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); armed.current = false; setPeek(false); onClick(); }}
      className={toolbar ? "dm-quiet cpk-toolbar-button" : boxed ? BOXED + (tight ? TIGHT : "") : BASE}
      style={{ ...(boxed ? boxStyle(ink, on) : {}), color: showOff ? "var(--color-feedback-error)" : toolbar && on ? "var(--cpk-world)" : ink ?? (on ? "#fff" : "rgba(255,255,255,0.86)"), animation: pulse && !on ? `${toolbar ? "cpk-action-ring" : "dm-tray-ring"} 1.6s ease-out 3` : undefined }}>
      {busy ? <Loader2 className="h-[22px] w-[22px] animate-spin" aria-hidden /> : showOff ? <X className="h-[22px] w-[22px]" aria-hidden /> : icon}
      <span>{showOff ? offLabel : label}</span>
    </button>
  );
}

/** A way out: an in-app link, or (`external`) a new tab, marked with a small
 *  diagonal arrow after the word. */
export function StripLink({ icon, label, href, external = false, ink, boxed = false }: { icon?: React.ReactNode; label: string; href: string; external?: boolean; ink?: string; boxed?: boolean }) {
  const inner = (
    <>
      {icon}
      <span className="text-balance">{label}{external && <ArrowUpRight className="ml-[2px] inline h-[11px] w-[11px] align-[-1px]" aria-hidden />}</span>
    </>
  );
  const style = { ...(boxed ? boxStyle(ink, false) : {}), color: ink ?? "rgba(255,255,255,0.86)" };
  const cls = boxed ? BOXED : BASE;
  return external
    ? <a href={href} target="_blank" rel="noreferrer" className={cls} style={style} aria-label={`${label}, opens in a new tab`}>{inner}</a>
    : <Link href={href} className={cls} style={style}>{inner}</Link>;
}
