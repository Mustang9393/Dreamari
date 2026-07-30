"use client";

import { useEffect, useState } from "react";
import { IconAssessment, IconCompass, IconGamepad, IconNetwork, IconTarget } from "./icons";
import { ScrollHint } from "./ScrollHint";
import { Stars } from "./Stars";
import { Button } from "@/components/ui/Button";

// Each chapter's "center" point along overall scroll progress (0–1) — used both as the
// proximity-falloff anchor for that chapter's word block and as the fixed dot position on
// the side rail.
export const THRESHOLDS = [0.02, 0.26, 0.5, 0.74, 0.97];

// How far (in progress units) a chapter stays legible around its own threshold before
// fading toward the dim baseline — roughly half the ~0.24 gap between thresholds, so
// neighboring chapters hand off smoothly without much simultaneous double-visibility.
const FALLOFF = 0.16;

const STEPS = [
  {
    num: "01",
    key: "build",
    label: "BUILD",
    side: "left" as const,
    desc: "Know yourself first.",
    color: "#4a82ff",
    sizeScale: 1,
    Icon: IconAssessment,
  },
  {
    num: "02",
    key: "match",
    label: "MATCH",
    side: "right" as const,
    desc: "Find your perfect fit.",
    color: "#FF6058",
    sizeScale: 1,
    Icon: IconTarget,
  },
  {
    num: "03",
    key: "play",
    label: "PLAY",
    side: "left" as const,
    desc: "Live the role.",
    color: "#B79CFF",
    sizeScale: 1.15,
    Icon: IconGamepad,
  },
  {
    num: "04",
    key: "explore",
    label: "EXPLORE",
    side: "right" as const,
    desc: "Go deeper, everywhere.",
    color: "#00C0E8",
    sizeScale: 0.78,
    Icon: IconCompass,
  },
  {
    num: "05",
    key: "connect",
    label: "CONNECT",
    side: "left" as const,
    desc: "Meet the pros.",
    color: "#FFCC00",
    sizeScale: 0.76,
    Icon: IconNetwork,
  },
];

// Continuous falloff around a chapter's own threshold — 1 right at the threshold, ramping
// down to 0 by FALLOFF away. Replaces a hard active/inactive toggle with the same
// "brightens as it nears center, dims as it leaves" feel the reference concept used.
function proximity(progress: number, center: number): number {
  return Math.max(0, 1 - Math.abs(progress - center) / FALLOFF);
}

type HowItWorksSectionProps = { scrollProgress: number };

export function HowItWorksSection({ scrollProgress }: HowItWorksSectionProps) {
  // Starts at 0,0 (not window.innerWidth/innerHeight) because this component's initial
  // render also happens on the server during prerendering, where `window` doesn't exist —
  // reading it directly in a useState initializer crashes the production build. The real
  // size is synced in on mount below; the section is below the fold anyway, so the brief
  // instant before that effect runs isn't visible.
  const [vp, setVp] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { w, h } = vp;
  const safeProgress = isNaN(scrollProgress) ? 0 : Math.min(1, Math.max(0, scrollProgress));

  if (w === 0 || h === 0) return null;

  const isMobile = w < 640;

  // Reminds the user this section keeps responding to scroll — visible for nearly the
  // whole journey through the 5 steps, fading out only right at the very end once
  // Connect is reached, since at that point continuing to scroll just carries them past
  // this section rather than revealing anything new within it.
  const nudgeOpacity = Math.max(0, Math.min(1, (0.95 - safeProgress) / 0.08));

  // Fades in right as Connect (the last node, threshold 0.97) arrives, taking over the same
  // bottom slot the scroll nudge just vacated — there's nothing left to reveal by scrolling
  // further, so this is the moment to hand the user a direct way forward instead.
  const exploreCtaOpacity = Math.max(0, Math.min(1, (safeProgress - 0.97) / 0.03));

  // Rail geometry: a slim vertical track near the left edge, inset from the top/bottom by
  // a fixed margin so it never sits flush against the frame.
  const railInset = Math.max(24, Math.min(72, w * 0.05));
  const railTop = Math.max(70, h * 0.12);
  const railBottom = Math.max(56, h * 0.09);
  const railHeight = h - railTop - railBottom;

  // Last chapter sits noticeably higher than even spacing would put it — its own
  // description row needs to clear the "Start exploring" CTA that appears in the same
  // bottom-anchored slot exactly when Connect becomes active, and the two were colliding.
  const yFracs = [0.13, 0.31, 0.49, 0.65, 0.76];
  const sidePad = isMobile ? 28 : Math.max(90, railInset + 90);
  const railClear = isMobile ? 0 : railInset + 40;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,9,28,0.55)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 30% at 50% 100%, rgba(90,50,170,0.18) 0%, transparent 70%)",
        }}
      />
      <Stars count={isMobile ? 18 : 26} />
      {/* Solid-er near the very top edge specifically: this is where the hero's cloud
          mascot overflows down into — the base 0.55 overlay above is too translucent
          to hide it cleanly, ghosting it through instead of properly occluding it. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "20vh",
          background: "linear-gradient(to bottom, rgba(4,9,28,0.97) 0%, rgba(4,9,28,0) 100%)",
        }}
      />

      {/* Small, permanent corner labels — replaces the old big fading "How It Works"
          heading. Nothing to fade or reclaim space for, so the chapters below get the
          full frame immediately instead of waiting on a heading transition. */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? 22 : 34,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          padding: `0 ${isMobile ? 20 : 44}px`,
          zIndex: 6,
          pointerEvents: "none",
        }}
      >
        <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: isMobile ? 9 : 12, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
          HOW DREAMARI WORKS
        </div>
        {!isMobile && (
          <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            FIVE CHAPTERS
          </div>
        )}
      </div>

      {/* Side progress rail: a fixed track with one dot per chapter (colored, static) and a
          gradient fill + glowing puck that slides along it as overall scroll progress
          advances — mirrors the reference concept, just tucked closer to the edge on
          mobile so it doesn't eat into the (much narrower) content column. */}
      <div style={{ position: "absolute", left: railInset, top: railTop, bottom: railBottom, width: 3, zIndex: 5 }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.08)", borderRadius: 999 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: `${safeProgress * 100}%`,
            borderRadius: 999,
            background: `linear-gradient(${STEPS.map((s) => s.color).join(",")})`,
            boxShadow: `0 0 16px ${STEPS[0].color}99`,
          }}
        />
        {STEPS.map((step) => (
          <div
            key={step.key}
            style={{
              position: "absolute",
              left: "50%",
              top: `${THRESHOLDS[STEPS.indexOf(step)] * 100}%`,
              width: isMobile ? 6 : 9,
              height: isMobile ? 6 : 9,
              borderRadius: "50%",
              background: step.color,
              transform: "translate(-50%,-50%)",
              boxShadow: `0 0 10px ${step.color}`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: `${safeProgress * 100}%`,
            width: isMobile ? 11 : 16,
            height: isMobile ? 11 : 16,
            borderRadius: "50%",
            background: "#fff",
            transform: "translate(-50%,-50%)",
            boxShadow: "0 0 22px 4px rgba(255,255,255,0.55)",
          }}
        />
      </div>

      {STEPS.map((step, i) => {
        const t = proximity(safeProgress, THRESHOLDS[i]);
        const isLeft = step.side === "left";
        // Smaller settle-in slide on mobile — the full ±40px reads fine as a subtle detail
        // on a spacious desktop canvas, but on a narrow viewport it was enough to push an
        // inactive word's already-edge-anchored text half off-screen.
        const slideDist = isMobile ? 12 : 40;
        const dir = isLeft ? -slideDist : slideDist;
        const nameFontSize = (isMobile ? Math.min(52, w * 0.16) : Math.min(190, w * 0.1)) * step.sizeScale;
        const descFontSize = isMobile ? 15 : 22;
        const numFontSize = isMobile ? 11 : 15;
        const iconSize = isMobile ? 34 : 50;

        return (
          <div
            key={step.key}
            style={{
              position: "absolute",
              top: `${yFracs[i] * 100}%`,
              left: 0,
              right: 0,
              transform: `translateY(-50%) translateX(${(1 - t) * dir}px) scale(${0.95 + 0.05 * t})`,
              opacity: 0.18 + 0.82 * t,
              paddingLeft: isLeft ? railClear + sidePad : sidePad,
              paddingRight: isLeft ? sidePad : railClear + sidePad,
              display: "flex",
              flexDirection: "column",
              alignItems: isLeft ? "flex-start" : "flex-end",
              textAlign: isLeft ? "left" : "right",
              zIndex: 4,
              willChange: "transform, opacity",
            }}
          >
            <p style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: numFontSize, letterSpacing: "0.4em", color: step.color, margin: 0, marginBottom: isMobile ? 4 : 10 }}>
              {step.num}
            </p>
            <p
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 900,
                fontSize: nameFontSize,
                lineHeight: 0.86,
                letterSpacing: "-0.04em",
                color: step.color,
                textShadow: `0 0 ${isMobile ? 24 : 50}px ${step.color}66`,
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: isLeft ? "row" : "row-reverse",
                alignItems: "center",
                gap: isMobile ? 10 : 16,
                marginTop: isMobile ? 12 : 22,
                opacity: t > 0.55 ? Math.min(1, (t - 0.55) / 0.45) : 0,
              }}
            >
              <span
                style={{
                  width: iconSize,
                  height: iconSize,
                  flexShrink: 0,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.color,
                  background: `${step.color}22`,
                  boxShadow: `0 0 18px ${step.color}55, inset 0 0 0 1px ${step.color}66`,
                }}
              >
                <step.Icon c={step.color} size={Math.round(iconSize * 0.46)} />
              </span>
              <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: descFontSize, color: "rgba(255,255,255,0.82)" }}>{step.desc}</span>
            </div>
          </div>
        );
      })}

      <ScrollHint opacity={nudgeOpacity} className="absolute inset-x-0 bottom-5 z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center" style={{ opacity: exploreCtaOpacity }}>
        <Button variant="cta-solid" href="/flow" className="pointer-events-auto">
          Start exploring →
        </Button>
      </div>
    </div>
  );
}
