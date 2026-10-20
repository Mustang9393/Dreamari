"use client";

// LightRange: the house range bar. A line of light from a low end to a high
// end, dim where it starts and brightest at the top, with one bright point
// marking where a value falls between them.
//
// Why (20 Oct 2026): built for Career Detail's "What it pays" sheet, where
// the counselor v4 glow kit's lit tube (white core plus bloom band) read
// metallic (Chandu: "that design makes it look sort of metallic, we want it
// to feel like glow/light"). Then: "this bar direction is what is to be used
// app wide wherever something like this appears". So any low-to-high range
// with a marked value (pay ranges, score bands, a value against a scale)
// uses this, not a flat slider or a filled track.
//
// Light, not a solid: a thin gradient line whose glow is soft box-shadow,
// points made of radial gradients. No blur filters (they lag on Chromebooks;
// see the Glossary Lab perf rules), no rim, no shine, no white core.

import { motion, useReducedMotion } from "framer-motion";

const LABEL = "text-[12px] leading-[16px] font-semibold uppercase tracking-[0.04em]";

export function LightRange({ accent, at, from, to, ariaLabel }: {
  /** the surface's accent (a world colour, or var(--primary)) */
  accent: string;
  /** where the marked value sits, 0 to 100; null or undefined for no mark */
  at?: number | null;
  /** the low and high ends, labelled under the line */
  from?: { label: string; value: string };
  to?: { label: string; value: string };
  ariaLabel?: string;
}) {
  const still = useReducedMotion();
  const tint = (p: number) => `color-mix(in srgb, ${accent} ${p}%, transparent)`;
  const mark = typeof at === "number" && Number.isFinite(at) ? Math.min(100, Math.max(0, at)) : null;
  return (
    <div className="flex flex-col gap-[10px]" role={ariaLabel ? "img" : undefined} aria-label={ariaLabel}>
      <div className="relative mx-[8px] h-[28px]" aria-hidden>
        <motion.span
          className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 origin-left rounded-full"
          initial={still ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ backgroundImage: `linear-gradient(to right, ${tint(30)}, ${accent})`, boxShadow: `0 0 8px ${tint(55)}, 0 0 22px ${tint(30)}` }}
        />
        <Glint x="0%" accent={accent} dim />
        <Glint x="100%" accent={accent} dim />
        {mark !== null && (
          <motion.div
            className="absolute inset-y-0"
            initial={still ? false : { left: "0%", opacity: 0 }}
            animate={{ left: `${mark}%`, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.25 }}
          >
            <Glint x="0%" accent={accent} />
          </motion.div>
        )}
      </div>
      {(from || to) && (
        <div className="flex justify-between gap-[12px]" aria-hidden={ariaLabel ? true : undefined}>
          {[from, to].map((end, i) =>
            end ? (
              <span key={i} className={`flex flex-col gap-[2px] ${i ? "items-end text-right" : ""}`}>
                <span className={LABEL} style={{ color: "var(--muted-foreground)" }}>{end.label}</span>
                <b className="text-[17px] leading-[22px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{end.value}</b>
              </span>
            ) : (
              <span key={i} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

// A point of light: a bright centre falling off into the accent, and (for
// the marked value) a wide soft halo. All radial gradients. Exported as
// LightPoint for charts that mark values the same way (Outlook's jobs line).
export function LightPoint({ x, y = "50%", accent, dim }: { x: string; y?: string; accent: string; dim?: boolean }) {
  return <Glint x={x} y={y} accent={accent} dim={dim} />;
}

function Glint({ x, y = "50%", accent, dim }: { x: string; y?: string; accent: string; dim?: boolean }) {
  const core = dim ? 8 : 14;
  return (
    <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: x, top: y }}>
      {!dim && (
        <span
          className="absolute top-1/2 left-1/2 size-[72px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, color-mix(in srgb, ${accent} 45%, transparent) 0%, color-mix(in srgb, ${accent} 14%, transparent) 38%, transparent 70%)` }}
        />
      )}
      <span
        className="relative block rounded-full"
        style={{
          width: core,
          height: core,
          background: `radial-gradient(circle, color-mix(in srgb, ${accent} 25%, #ffffff) 0%, color-mix(in srgb, ${accent} 75%, #ffffff) 45%, ${accent} 100%)`,
          boxShadow: `0 0 ${dim ? 8 : 14}px color-mix(in srgb, ${accent} ${dim ? 50 : 80}%, transparent)`,
          opacity: dim ? 0.7 : 1,
        }}
      />
    </span>
  );
}
