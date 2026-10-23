"use client";

// "What it pays": the sheet behind Typical pay's (i) on Career Detail.
//
// Why (20 Oct 2026): Maisha, reviewing Career Detail on dreamari.com, asked
// in Slack to "refine the What It Pays pop-up to feel more premium and
// consistent with Dreamari's design standards", and to consider giving
// People Doing It, Jobs Open Each Year and Projected Growth "their own Job
// Outlook tab instead of being included in the salary pop-up". Chandu:
// "redesign everything for this note and page", live, not as a lab.
//
// So, against the production sheet she was looking at:
// - Pay only. The three outlook tiles left: growth and openings now lead
//   the fact strip and own the Pay & Outlook tab, and the sheet's last row
//   goes there instead of repeating them.
// - The range is a line of light, not a flat slider (and not the glow kit's
//   lit tube, whose white core and bloom band read metallic here, Chandu:
//   "we want it to feel like glow/light"): dim where pay starts, brightest
//   at the top, with Typical as the one bright orb where
//   it really falls between Starting out and Top earners.
// - Typical pay is the gradient numeral every key figure on the page uses.
// - It names where the numbers come from, because trust in the figures is
//   the point of the whole note ("so students can trust the information").
// - Phones get a bottom sheet; wider screens a centred card.

import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { LightRange } from "@/components/app/LightRange";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const LABEL = "text-[12px] leading-[16px] font-semibold uppercase tracking-[0.04em]";
const MUTED = { color: "var(--muted-foreground)" } as const;

const num = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

/** The frame both Career Detail fact sheets share (What it pays, What you
 *  need to get in): scrim, accent-lit card, the career as an eyebrow, the
 *  title, a close button, a bottom sheet on phones and a centred card
 *  above 640px. One frame so the sheets read as one family (Chandu, 20 Oct
 *  2026: "redesign the typical degree (i) popup to be consistent with the
 *  what it pays pop up too"). */
export function FactSheet({ career, accent, title, more, source, onClose, children, footer, wide = false, maxWidth }: {
  career: string;
  /** the world accent, e.g. var(--world-arts-media-sport) */
  accent: string;
  title: string;
  /** the last row: closes the sheet and opens the tab that goes deeper */
  more?: { label: string; onClick: () => void };
  /** who publishes the figures, e.g. "U.S. Bureau of Labor Statistics" */
  source?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** actions pinned under the body (counselor v7's Send, Save, Schedule;
   *  20 Oct 2026, Chandu: "design all the pop ups with dreamari's design
   *  standards like we did for what it pays") */
  footer?: React.ReactNode;
  /** a little wider for forms and lists (560px instead of 480px) */
  wide?: boolean;
  /** wider still for a two-column sheet (counselor v7's Explore sheets, 760px) */
  maxWidth?: number;
}) {
  const still = useReducedMotion();
  const titleId = useId();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const tint = (p: number) => `color-mix(in srgb, ${accent} ${p}%, transparent)`;
  const light = `color-mix(in srgb, ${accent} 70%, #ffffff)`;
  const surface = "color-mix(in srgb, var(--background) 95%, var(--foreground))";

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby={titleId} style={{ fontFamily: "var(--font-body)", background: "transparent", minHeight: 0 }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.72)" }} />
      <motion.div
        initial={still ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
        className={`dm-scroll relative z-[1] flex max-h-[calc(92dvh/var(--vz,1))] w-full flex-col overflow-hidden rounded-t-[24px] border sm:rounded-[20px] ${maxWidth ? "" : wide ? "sm:max-w-[560px]" : "sm:max-w-[480px]"}`}
        style={{
          borderColor: tint(40),
          ...(maxWidth ? { maxWidth: `min(${maxWidth}px, 100%)` } : null),
          background: `radial-gradient(120% 70% at 100% 0, ${tint(22)}, transparent 62%), ${surface}`,
          boxShadow: `0 16px 48px -4px rgba(0,0,0,0.62), 0 4px 16px rgba(0,0,0,0.28), 0 24px 60px -30px ${tint(70)}`,
          color: "var(--foreground)",
        }}
      >
        <div className="absolute top-[14px] right-[14px] z-[1]">
          <IconTip label="Close">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-full border"
              style={{ borderColor: "var(--glass-border)", background: "rgba(5,7,15,0.55)" }}
            >
              <X className="size-4" aria-hidden />
            </button>
          </IconTip>
        </div>

        <div className="dm-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <header className="flex flex-col gap-[4px] pt-[22px] pr-[64px] pl-[24px]">
          <p className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.08em]" style={{ color: light }}>{career}</p>
          <h2 id={titleId} className="text-[24px] leading-[28px] font-extrabold" style={DISPLAY}>{title}</h2>
        </header>

        <div className="flex flex-col gap-[24px] px-[24px] pt-[18px] pb-[24px]">
          {children}
          {(source || more) && (
            <div className="-mb-[8px] flex flex-col gap-[4px] border-t pt-[14px]" style={{ borderColor: "var(--glass-border)" }}>
              {more && (
                <button
                  type="button"
                  onClick={more.onClick}
                  className="dm-quiet -mx-[12px] flex min-h-[44px] cursor-pointer items-center justify-between gap-[12px] rounded-[12px] px-[12px] text-left text-[15px] leading-[22px] font-semibold"
                >
                  <span>{more.label}</span>
                  <ChevronRight className="size-[18px] flex-none" style={{ color: light }} aria-hidden />
                </button>
              )}
              {source && <p className="text-[12px] leading-[16px]" style={MUTED}>Source: {source}</p>}
            </div>
          )}
        </div>
        </div>
        {footer && (
          <footer className="flex flex-none items-center justify-end gap-[10px] border-t px-[24px] py-[14px]" style={{ borderColor: "var(--glass-border)" }}>{footer}</footer>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

/** A sheet's headline figure: small label, gradient display value, an
 *  optional suffix and one plain line under it. */
export function SheetHero({ label, value, suffix, line, accent }: { label: string; value: React.ReactNode; suffix?: string; line?: string; accent: string }) {
  return (
    <div className="flex flex-col gap-[4px]">
      <span className={LABEL} style={MUTED}>{label}</span>
      <span className="flex flex-wrap items-baseline gap-x-[8px]">
        <span
          className="text-[34px] leading-[40px] font-extrabold tabular-nums sm:text-[40px] sm:leading-[44px]"
          style={{ ...DISPLAY, backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          {value}
        </span>
        {suffix && <span className="text-[15px] leading-[22px] font-semibold" style={MUTED}>{suffix}</span>}
      </span>
      {line && <span className="text-[14px] leading-[20px]" style={MUTED}>{line}</span>}
    </div>
  );
}

export function PaySheet({ career, accent, pay, source, onMore, moreLabel = "Pay by state", onClose }: {
  career: string;
  accent: string;
  pay: { starting: string; typical: string; top: string; note?: string };
  source?: string;
  /** closes the sheet and opens Pay & Outlook */
  onMore?: () => void;
  moreLabel?: string;
  onClose: () => void;
}) {
  // where Typical sits between the two ends; no marker when a figure is missing
  const lo = num(pay.starting);
  const hi = num(pay.top);
  const mid = num(pay.typical);
  const at = hi > lo && mid >= lo && mid <= hi ? ((mid - lo) / (hi - lo)) * 100 : null;
  return (
    <FactSheet career={career} accent={accent} title="What it pays" source={source} more={onMore ? { label: moreLabel, onClick: onMore } : undefined} onClose={onClose}>
      <SheetHero label="Typical pay" value={pay.typical} suffix="a year" line="Half of people in this job earn more." accent={accent} />
      <LightRange
        accent={accent}
        at={at}
        from={{ label: "Starting out", value: pay.starting }}
        to={{ label: "Top earners", value: pay.top }}
        ariaLabel={`Starting out ${pay.starting}, typical ${pay.typical}, top earners ${pay.top}`}
      />
      {/* the profile's own caveat on the figures ("27% work for themselves,
         so this describes the ones with a boss"): dreamonna shows it under
         the range, and this sheet had dropped it (23 Oct 2026) */}
      {pay.note && <p className="text-[14px] leading-[20px]" style={MUTED}>{pay.note}</p>}
    </FactSheet>
  );
}
