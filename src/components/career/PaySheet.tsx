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

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { LightRange } from "@/components/app/LightRange";

const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const LABEL = "text-[12px] leading-[16px] font-semibold uppercase tracking-[0.04em]";
const MUTED = { color: "var(--muted-foreground)" } as const;

const num = (s: string) => Number(s.replace(/[^0-9.]/g, ""));

export function PaySheet({ career, accent, pay, source, onMore, moreLabel = "Pay by state", onClose }: {
  career: string;
  /** the world accent, e.g. var(--world-arts-media-sport) */
  accent: string;
  pay: { starting: string; typical: string; top: string };
  /** who publishes the figures, e.g. "U.S. Bureau of Labor Statistics" */
  source?: string;
  /** closes the sheet and opens Pay & Outlook */
  onMore?: () => void;
  moreLabel?: string;
  onClose: () => void;
}) {
  const still = useReducedMotion();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // where Typical sits between the two ends; no marker when a figure is missing
  const lo = num(pay.starting);
  const hi = num(pay.top);
  const mid = num(pay.typical);
  const at = hi > lo && mid >= lo && mid <= hi ? ((mid - lo) / (hi - lo)) * 100 : null;
  const tint = (p: number) => `color-mix(in srgb, ${accent} ${p}%, transparent)`;
  const light = `color-mix(in srgb, ${accent} 70%, #ffffff)`;
  const surface = "color-mix(in srgb, var(--background) 95%, var(--foreground))";

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="marketing-v2 themeable fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="pay-sheet-title" style={{ fontFamily: "var(--font-body)", background: "transparent", minHeight: 0 }}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(5,7,15,0.72)" }} />
      <motion.div
        initial={still ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
        className="dm-scroll relative z-[1] max-h-[calc(92dvh/var(--vz,1))] w-full overflow-x-hidden overflow-y-auto rounded-t-[24px] border sm:max-w-[480px] sm:rounded-[20px]"
        style={{
          borderColor: tint(40),
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

        <header className="flex flex-col gap-[4px] pt-[22px] pr-[64px] pl-[24px]">
          <p className="text-[12px] leading-[16px] font-bold uppercase tracking-[0.08em]" style={{ color: light }}>{career}</p>
          <h2 id="pay-sheet-title" className="text-[24px] leading-[28px] font-extrabold" style={DISPLAY}>What it pays</h2>
        </header>

        <div className="flex flex-col gap-[24px] px-[24px] pt-[18px] pb-[24px]">
          <div className="flex flex-col gap-[4px]">
            <span className={LABEL} style={MUTED}>Typical pay</span>
            <span className="flex flex-wrap items-baseline gap-x-[8px]">
              <span
                className="text-[40px] leading-[44px] font-extrabold tabular-nums"
                style={{ ...DISPLAY, backgroundImage: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #ffffff) 0%, ${accent} 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
              >
                {pay.typical}
              </span>
              <span className="text-[15px] leading-[22px] font-semibold" style={MUTED}>a year</span>
            </span>
            <span className="text-[14px] leading-[20px]" style={MUTED}>Half of people in this job earn more.</span>
          </div>

          <LightRange
            accent={accent}
            at={at}
            from={{ label: "Starting out", value: pay.starting }}
            to={{ label: "Top earners", value: pay.top }}
            ariaLabel={`Starting out ${pay.starting}, typical ${pay.typical}, top earners ${pay.top}`}
          />

          {(source || onMore) && (
            <div className="-mb-[8px] flex flex-col gap-[4px] border-t pt-[14px]" style={{ borderColor: "var(--glass-border)" }}>
              {onMore && (
                <button
                  type="button"
                  onClick={onMore}
                  className="dm-quiet -mx-[12px] flex min-h-[44px] cursor-pointer items-center justify-between gap-[12px] rounded-[12px] px-[12px] text-left text-[15px] leading-[22px] font-semibold"
                >
                  <span>{moreLabel}</span>
                  <ChevronRight className="size-[18px] flex-none" style={{ color: light }} aria-hidden />
                </button>
              )}
              {source && <p className="text-[12px] leading-[16px]" style={MUTED}>Source: {source}</p>}
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
