"use client";

import { useEffect, useState } from "react";
import { IconAssessment, IconCompass, IconGamepad, IconNetwork, IconTarget } from "./icons";
import { Stars } from "./Stars";
import { Button } from "@/components/ui/Button";

// A chapter stays at full brightness within HOLD of its own "centered in the viewport"
// moment — a deliberate plateau, not just a single instant of peak — giving the user a
// "brief moment to lock in" on each word before it starts fading. Past that hold, it
// ramps down to the dim baseline over FALLOFF. Together these are narrow enough relative
// to the 0.25 gap between chapter centers (see CENTER_OF below) that only one chapter is
// ever legible at a time, with a brief crossfade as one hands off to the next.
const HOLD = 0.05;
const FALLOFF = 0.09;

const STEPS = [
  {
    key: "build",
    label: "BUILD",
    side: "left" as const,
    desc: "By taking a personality, skill, and academic assessment.",
    color: "#4a82ff",
    sizeScale: 1,
    Icon: IconAssessment,
  },
  {
    key: "match",
    label: "MATCH",
    side: "right" as const,
    desc: "With the right career, college major, and schools.",
    color: "#FF6058",
    sizeScale: 1,
    Icon: IconTarget,
  },
  {
    key: "play",
    label: "PLAY",
    side: "left" as const,
    desc: "Day-in-the-life college major and career games you actually want to open.",
    color: "#B79CFF",
    sizeScale: 1.15,
    Icon: IconGamepad,
  },
  {
    key: "explore",
    label: "EXPLORE",
    side: "right" as const,
    desc: "Careers, companies, and pathways with depth.",
    color: "#00C0E8",
    sizeScale: 0.78,
    Icon: IconCompass,
  },
  {
    key: "connect",
    label: "CONNECT",
    side: "left" as const,
    desc: "With professionals in the industry you're interested in.",
    color: "#FFCC00",
    sizeScale: 0.76,
    Icon: IconNetwork,
  },
];

// Each chapter below renders as a real, normal-flow block one viewport tall — the user
// scrolls the page and the words genuinely travel up through the frame, the same way any
// other page content would, instead of sitting fixed in place while only their opacity
// changes. Given N equal-height (one-viewport-tall) chapters stacked in a wrapper of
// overall scroll fraction 0–1, chapter i sits exactly centered in the viewport at
// progress = i / (N-1) — chapter 0 already fills the screen at progress 0, chapter N-1 at
// progress 1, with the rest evenly between. This is what actually drives the "lock in and
// glow" brightness below; it doesn't control position, only how lit each word looks while
// it scrolls through.
function centerOf(index: number, count: number): number {
  return count > 1 ? index / (count - 1) : 0;
}

// Held at 1 within HOLD of the chapter's own centered moment (the "lock in" plateau),
// then ramps down to 0 over FALLOFF beyond that.
function proximity(progress: number, center: number): number {
  const d = Math.abs(progress - center);
  if (d <= HOLD) return 1;
  return Math.max(0, 1 - (d - HOLD) / FALLOFF);
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

  // Rail geometry: a slim vertical track near the left edge, inset from the top/bottom by
  // a generous fixed margin so it never sits flush against the frame.
  const railInset = Math.max(32, Math.min(80, w * 0.06));
  const railTop = Math.max(90, h * 0.15);
  const railBottom = Math.max(96, h * 0.14);
  const sidePad = isMobile ? 28 : Math.max(120, railInset + 110);
  // Clearance reserved specifically for the rail's own footprint (track + dot/puck glow),
  // on *both* mobile and desktop — mobile previously had none at all (just sidePad), which
  // wasn't enough room: the rail's glow bled into the first few characters of every
  // left-aligned word (BUILD, PLAY, CONNECT).
  const railClear = isMobile ? railInset + 24 : railInset + 48;

  return (
    <div style={{ position: "relative" }}>
      {/* Single sticky layer for everything that needs to stay pinned to the viewport
          while the chapters scroll past underneath: background, the progress rail, and
          the bottom CTA/hint slot. Earlier this was three separate sticky elements (each
          using the sticky + negative-margin trick below) — mobile Safari has a history of
          mishandling stacked sticky siblings that each rely on a canceling negative
          margin, and consolidating to one sticky element removes that risk entirely
          without changing anything visually. Internal stacking (rail/CTA above the
          chapter words, background below them) is done with explicit z-index on the
          pieces inside, since this element itself doesn't establish a new stacking
          context. Must come before the real content in DOM order so its un-collapsed
          flow position starts at the very top — otherwise it would only "arrive" once
          scrolled down near the bottom. A position:sticky element still reserves its own
          box in normal flow; a negative margin equal to its own height cancels that
          reservation out, so the wrapper's real height comes purely from the chapter
          content below while this still sticks for as long as that content scrolls.
          100vh, not 100dvh: this height feeds directly into the scroll-progress math in
          HowItWorksScroller (both the chapter blocks below and this element resize with
          it), and dvh live-updates as a mobile browser's address bar hides/shows *during*
          the scroll gesture itself — that moved the "finish line" while the user was
          mid-scroll, which is what made progress crawl for a long stretch and then jump
          once the chrome animation settled. vh is pinned to a single fixed reference
          regardless of chrome state, so the scroll math stays stable throughout. */}
      <div style={{ position: "sticky", top: 0, height: "100vh", marginBottom: "-100vh", overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "rgba(4,9,28,0.55)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: "radial-gradient(ellipse 70% 30% at 50% 100%, rgba(90,50,170,0.18) 0%, transparent 70%)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Stars count={isMobile ? 18 : 26} />
        </div>
        {/* Solid near the very top edge specifically: this is where the hero's cloud
            mascot overflows down into (up to ~18vh, per HeroIllustration's own
            CLOUD_SIZE / VISIBLE_FRACTION math) — a plain linear fade from solid to
            transparent starting at y:0 was thinning out to near-nothing by exactly the
            depth the cloud still reaches, letting it ghost through. Holding fully solid
            through ~22vh (past the cloud's max overflow, with margin) and only then
            fading out over the next 12vh guarantees full coverage where it matters, with
            the softening still reading as organic rather than a hard cut. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "34vh",
            zIndex: 0,
            background: "linear-gradient(to bottom, rgba(4,9,28,1) 0%, rgba(4,9,28,1) 65%, rgba(4,9,28,0) 100%)",
          }}
        />

        {/* Small, permanent corner labels. */}
        <div
          style={{
            position: "absolute",
            top: isMobile ? 28 : 48,
            left: 0,
            right: 0,
            zIndex: 0,
            display: "flex",
            justifyContent: "space-between",
            padding: `0 ${isMobile ? 28 : 64}px`,
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

        {/* Progress rail — the one piece that actually needs to be pinned, per its own
            "path graphic" purpose: a fixed track with a colored dot per chapter and a
            glowing puck sliding along it as scroll progress advances. */}
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
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              style={{
                position: "absolute",
                left: "50%",
                top: `${centerOf(i, STEPS.length) * 100}%`,
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

        {/* Bottom CTA slot, well clear of the frame edge. "Start building" stays visible
            for the entire section now — it used to only pulse in during BUILD's own
            lock-in window, but per feedback it should be a persistent way forward rather
            than something that comes and goes. */}
        <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center sm:bottom-14">
          <Button variant="cta-outline" href="/flow" className="pointer-events-auto">
            Start building →
          </Button>
        </div>
      </div>

      {/* Real content: normal document flow, one viewport-tall block per chapter. This is
          what makes the words actually scroll up through the frame on their own, rather
          than sitting fixed while only opacity changes underneath a sticky viewport.
          pointerEvents: none because position:sticky always creates its own stacking
          context — the CTA's z-index above only ranks it *within* that sticky layer, not
          against this div's z-index:3, so with default pointer-events this (empty, purely
          textual) box was sitting on top in hit-testing and swallowing clicks meant for
          the "Start building" button underneath it. Nothing in here is interactive, so
          just letting clicks fall through is simpler than fighting stacking contexts. */}
      <div style={{ position: "relative", zIndex: 3, pointerEvents: "none" }}>
        {STEPS.map((step, i) => {
          const t = proximity(safeProgress, centerOf(i, STEPS.length));
          const isLeft = step.side === "left";
          const nameFontSize = (isMobile ? Math.min(52, w * 0.16) : Math.min(190, w * 0.1)) * step.sizeScale;
          const descFontSize = isMobile ? 15 : 22;
          const iconSize = isMobile ? 34 : 50;

          return (
            <div
              key={step.key}
              style={{
                position: "relative",
                // 100vh, not 100dvh — see the sticky layer above for why: this height
                // directly defines how much the user has to scroll per chapter, and dvh
                // changing live as the address bar animates mid-scroll was what made the
                // section feel like it "scrolled forever" before catching up.
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: isLeft ? "flex-start" : "flex-end",
                textAlign: isLeft ? "left" : "right",
                paddingLeft: isLeft ? railClear + sidePad : sidePad,
                paddingRight: isLeft ? sidePad : railClear + sidePad,
                // Bottom padding well beyond the top: the sticky scroll-hint/CTA slot
                // lives in the same fixed strip near the viewport bottom regardless of
                // which chapter is showing, so centering content in the *full* viewport
                // let a chapter with a longer description (PLAY, MATCH) bleed into that
                // slot. Weighting the padding toward the bottom shifts the visual center
                // up just enough to clear it, on every chapter, without needing a
                // per-chapter special case.
                paddingTop: isMobile ? 50 : 70,
                paddingBottom: isMobile ? 110 : 150,
                opacity: 0.05 + 0.95 * t,
                transform: `scale(${0.95 + 0.05 * t})`,
                willChange: "opacity, transform",
              }}
            >
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
                <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 600, fontSize: descFontSize, color: "rgba(255,255,255,0.82)", maxWidth: isMobile ? "72vw" : "34vw" }}>
                  {step.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
