"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { IconAssessment, IconCompass, IconGamepad, IconNetwork, IconTarget } from "./icons";
import { Stars } from "./Stars";
import { Button } from "@/components/ui/Button";
import { HOW_IT_WORKS_CHAPTER_COLORS } from "@/generated/design-tokens";

// A chapter stays at full brightness within HOLD of its own "centered in the viewport"
// moment — a deliberate plateau, not just a single instant of peak — giving the user a
// "brief moment to lock in" on each word before it starts fading. Past that hold, it
// ramps down to the dim baseline over FALLOFF. FALLOFF is now deliberately wide relative
// to the 0.25 gap between chapter centers (see centerOf below) — 2*(HOLD+FALLOFF) > 0.25
// means adjacent chapters' windows overlap, so the next chapter is already faintly (and
// blurrily, see the filter below) visible near the bottom of the frame before the
// current one has even finished its own hold, instead of a dead gap between them.
const HOLD = 0.035;
const FALLOFF = 0.16;

// Each chapter block is shorter than a full viewport (see the render below) so two
// adjacent chapters' text can share the same 100vh window at once — but centerOf's
// simple i/(N-1) mapping only lines up with a chapter's block actually being centered
// in the viewport at that exact progress value when the blocks are a FULL viewport
// tall. With shorter blocks, chapter 0 would end up sitting above true center right
// as progress hits 0 (nothing has "pushed" it down into place yet, since progress
// can't go negative to compensate) — which is exactly the "starts from the top"
// symptom. A leading spacer before chapter 0 — and, to keep the (still just i/(N-1))
// centerOf math correct for every chapter after it, a matching trailing spacer after
// the last one — restores the same geometry a full-height chapter would have had, so
// chapter 0 is genuinely centered (not just "at full opacity") right when it arrives,
// and the last chapter still reaches true center exactly at progress 1. Derivation:
// solving for both endpoints to land exactly on progress 0 and 1 gives spacer height
// = 50% * (1 - chapter height %) on each side.
//
// Mobile/tablet use deliberate half-screen-ish intervals. Combined with the document
// scroll-snap targets on each chapter below, one gesture advances to one focused stage
// and leaves it parked there until the next gesture. The next stage still begins inside
// the viewport while the current one leaves, preserving the existing blurred handoff.
// A function of viewport width, not a plain constant, since it needs to vary by
// breakpoint; called with the same `w` the component already tracks.
function chapterHeightVh(w: number): number {
  if (w < 640) return 44;
  if (w < 1024) return 52;
  return 62;
}
function edgeSpacerVh(w: number): number {
  return 50 * (1 - chapterHeightVh(w) / 100);
}

const STEPS = [
  {
    key: "build",
    label: "BUILD",
    side: "left" as const,
    desc: "By taking a personality, skill, and academic assessment.",
    color: HOW_IT_WORKS_CHAPTER_COLORS[0],
    Icon: IconAssessment,
  },
  {
    key: "match",
    label: "MATCH",
    side: "right" as const,
    desc: "With the right career, college major, and schools.",
    color: HOW_IT_WORKS_CHAPTER_COLORS[1],
    Icon: IconTarget,
  },
  {
    key: "play",
    label: "PLAY",
    side: "left" as const,
    desc: "Day-in-the-life college major and career games you actually want to open.",
    color: HOW_IT_WORKS_CHAPTER_COLORS[2],
    Icon: IconGamepad,
  },
  {
    key: "explore",
    label: "EXPLORE",
    side: "right" as const,
    desc: "Careers, companies, and pathways with depth.",
    color: HOW_IT_WORKS_CHAPTER_COLORS[3],
    Icon: IconCompass,
  },
  {
    key: "connect",
    label: "CONNECT",
    side: "left" as const,
    desc: "With professionals in the industry you're interested in.",
    color: HOW_IT_WORKS_CHAPTER_COLORS[4],
    Icon: IconNetwork,
  },
];

// The vertical progress rail (below) used to fill/dot itself with each chapter's own
// STEPS color — multi-colored, same as the chapter words themselves — which read as two
// competing colorful things fighting for attention at once. This is the rail's own
// palette instead: a light-to-dark blue ramp off the same brand tokens the homepage
// hero uses, so the rail reads as "one calm progress indicator" while the chapter words
// stay the ones carrying color.
const RAIL_HUES = ["var(--color-brand-200)", "var(--color-brand-300)", "var(--color-brand-400)", "var(--color-brand-500)", "var(--color-brand-600)"];

// One shared scale for every chapter title, instead of the old per-word sizeScale
// (BUILD/MATCH at 1, PLAY at 1.15, EXPLORE/CONNECT down at ~0.77) — that made the
// titles visibly different sizes, which read as inconsistent rather than deliberate.
// Sized to the *longest* labels (EXPLORE, CONNECT, 7 characters) so every title shares
// one size without any of them overflowing past the frame or crowding the rail/edges —
// the same value those two already used safely.
const CHAPTER_TITLE_SCALE = 0.76;

// The finale ("You're ready to light up") is a second phase after the five chapters,
// sharing the same sticky-pinned viewport. It needs its own fixed scroll distance (in
// vh) rather than a slice of the chapters' own 0..1 range — otherwise adding or
// resizing the finale would compress or stretch the five chapters' already-tuned
// spacing. chaptersScrollVh is exactly the distance (in vh) between chapterProgress 0
// and 1 given the functions above (derived the same way edgeSpacerVh was: total
// chapter+spacer content height minus one viewport height, since that's how much the
// page actually scrolls while progress goes from its first to last value).
function chaptersScrollVh(w: number): number {
  return 2 * edgeSpacerVh(w) + STEPS.length * chapterHeightVh(w) - 100;
}
// CONNECT must have a complete exit phase of its own before the finale is allowed to
// enter. Previously finaleProgress started at the exact moment CONNECT reached its
// centered snap point, so "YOU'RE READY" appeared on top of it. This distance lets the
// last chapter travel out, fade and blur fully before the finale begins at opacity 0.
function connectExitVh(w: number): number {
  if (w < 640) return 38;
  if (w < 1024) return 44;
  return 54;
}
// FINALE_SCROLL_VH is how much additional scrolling pops the finale in; FINALE_HOLD_VH
// is extra room after that so the finale sits fully visible for a while before the user
// hits the true bottom of the page, instead of the reveal finishing right as scrolling
// runs out. Both smaller on mobile (was a flat 80/100 for every width) — same "roughly 3
// scroll gestures total" goal as chapterHeightVh above; the finale doesn't need as much
// hold room on a phone since there's no separate desktop-vs-mobile layout shift to wait
// out.
function finaleScrollVh(w: number): number {
  return w < 1024 ? 50 : 80;
}
function finaleHoldVh(w: number): number {
  return w < 1024 ? 50 : 100;
}

// Each chapter below renders as a real, normal-flow block — the user scrolls the page
// and the words genuinely travel up through the frame, instead of sitting fixed in
// place while only their opacity changes. Chapter i sits exactly centered in the
// viewport at progress = i / (count-1) — chapter 0 (BUILD) is already centered and at
// full focus the instant the section arrives (its own sticky background/rail engaging
// *is* the reveal), the last chapter reaches full focus at progress 1 and holds there.
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

type HowItWorksSectionProps = { scrollOffsetPx: number };

export function HowItWorksSection({ scrollOffsetPx }: HowItWorksSectionProps) {
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

  // chapterProgress drives the five chapters + rail (0..1 across chaptersScrollVh(w)).
  // connectExitProgress then gets a dedicated 0..1 phase where CONNECT and the chapter
  // chrome leave completely. Only after that reaches 1 can finaleProgress begin. All
  // three are derived from the same raw px offset so their ranges cannot overlap.
  // `h || 1` guards the very
  // first render (before the vp effect above has synced real dimensions in), where
  // dividing by a real 0 would produce NaN.
  const chaptersScrollPx = (chaptersScrollVh(w) / 100) * (h || 1);
  const connectExitScrollPx = (connectExitVh(w) / 100) * (h || 1);
  const finaleScrollPx = (finaleScrollVh(w) / 100) * (h || 1);
  const safeOffset = isNaN(scrollOffsetPx) ? 0 : Math.max(0, scrollOffsetPx);
  const safeProgress = Math.min(1, safeOffset / chaptersScrollPx);
  const connectExitProgress = Math.max(0, Math.min(1, (safeOffset - chaptersScrollPx) / connectExitScrollPx));
  const finaleProgress = Math.max(0, Math.min(1, (safeOffset - chaptersScrollPx - connectExitScrollPx) / finaleScrollPx));

  // Used purely to key-remount the finale title below right as it re-enters view — that
  // restarts its rainbow→brand-blue color-settle animation fresh each time, instead of
  // it having already finished playing (as a plain CSS animation tied to mount would)
  // long before the user scrolls that far. Derived straight from finaleProgress rather
  // than tracked in its own state, since it only needs to flip at the same 0-boundary
  // finaleProgress itself already crosses.
  const finaleEntering = finaleProgress > 0;

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
        {/* Bridges the color handoff from the hero section's own background (an opaque
            gradient whose bottom edge is #0a1e4c) into this section's own darker tone.
            A single color (#0a1e4c) fading its own alpha out, eased rather than linear,
            with NO intermediate opaque stop of a different color — the previous version
            routed through a fully-opaque rgba(4,9,28,1) plateau at 40%, which is a
            completely different hue from both the hero's blue and whatever's ultimately
            revealed underneath, and broke the fade's monotonicity (blue -> black ->
            fades away) in a way that read as a hard seam rather than one continuous
            motion. Alpha-only easing lets the natural blend-as-it-fades handle the hue
            transition on its own. Tall (58vh, up from 34vh) so the whole handoff spans
            a long, gradual scroll distance instead of being compressed into a short one.
            Dreamy fades out on her own well before this point now (see HeroIllustration's
            scroll-linked opacity), so this no longer also needs to hide a lingering cloud
            fragment — just the color join. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "58vh",
            zIndex: 0,
            background:
              "linear-gradient(to bottom, rgba(10,30,76,1) 0%, rgba(10,30,76,0.86) 18%, rgba(10,30,76,0.62) 36%, rgba(10,30,76,0.38) 54%, rgba(10,30,76,0.18) 74%, rgba(10,30,76,0.06) 88%, rgba(10,30,76,0) 100%)",
          }}
        />

        {/* Small, permanent corner labels — fade out with the rest of the chapter chrome
            once the finale starts popping in, since "FIVE CHAPTERS" no longer applies
            to what's on screen at that point. */}
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
            opacity: 1 - connectExitProgress,
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
            glowing puck sliding along it as scroll progress advances. Fades out once the
            finale starts popping in — the vertical rail's job is done once all five
            chapters are behind you, and the finale has its own horizontal version of it. */}
        <div style={{ position: "absolute", left: railInset, top: railTop, bottom: railBottom, width: 3, zIndex: 5, opacity: 1 - connectExitProgress }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.08)", borderRadius: 999 }} />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: `${safeProgress * 100}%`,
              borderRadius: 999,
              background: `linear-gradient(${RAIL_HUES.join(",")})`,
              boxShadow: `0 0 16px color-mix(in srgb, ${RAIL_HUES[0]} 60%, transparent)`,
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
                background: RAIL_HUES[i],
                transform: "translate(-50%,-50%)",
                boxShadow: `0 0 10px ${RAIL_HUES[i]}`,
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
            for the entire five-chapter section now — it used to only pulse in during
            BUILD's own lock-in window, but per feedback it should be a persistent way
            forward rather than something that comes and goes. Fades out once the finale
            pops in, which carries its own, more prominent version of this same CTA. */}
        <div
          className="absolute inset-x-0 bottom-10 z-10 flex justify-center sm:bottom-14"
          style={{ opacity: 1 - connectExitProgress, pointerEvents: connectExitProgress > 0 ? "none" : "auto" }}
        >
          <Button variant="cta-outline" href="/flow" className="pointer-events-auto">
            Start building →
          </Button>
        </div>

        {/* The finale: pops in once the five chapters are behind you, taking over the
            whole sticky frame. The reveal is a single pop (scale + fade), not a
            replay of each chapter's own progressive fill — the horizontal path below
            is shown fully lit from the start, since "all five, unlocked" is the point
            being made, not another progress bar. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 28 : 40,
            padding: isMobile ? "0 24px" : "0 64px",
            textAlign: "center",
            opacity: finaleProgress,
            transform: `scale(${0.85 + 0.15 * finaleProgress})`,
            pointerEvents: finaleProgress > 0.6 ? "auto" : "none",
            willChange: "opacity, transform",
          }}
        >
          {/* Horizontal path: each chapter's own icon/color, fully lit, joined by a
              gradient line echoing the vertical rail it replaces. A slow pulse on each
              circle's glow keeps the "fully unlocked" state feeling alive rather than
              static. */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? 14 : 30 }}>
            <div
              style={{
                position: "absolute",
                left: isMobile ? 22 : 32,
                right: isMobile ? 22 : 32,
                top: "50%",
                height: 3,
                transform: "translateY(-50%)",
                borderRadius: 999,
                background: `linear-gradient(90deg, ${STEPS.map((s) => s.color).join(",")})`,
                zIndex: 0,
              }}
            />
            {STEPS.map((step, i) => {
              const size = isMobile ? 44 : 68;
              return (
                <div
                  key={step.key}
                  className="animate-[finale-pulse_2.6s_ease-in-out_infinite]"
                  style={
                    {
                      position: "relative",
                      zIndex: 1,
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // Opaque (not the translucent `${color}26` used elsewhere on this
                      // page) so the connecting line behind it is fully hidden under each
                      // node instead of visibly striking through — the line should only
                      // read as connecting the circles, not passing through them.
                      background: `color-mix(in srgb, ${step.color} 16%, rgb(4,9,28) 84%)`,
                      border: `2px solid ${step.color}`,
                      animationDelay: `${i * 0.18}s`,
                      "--pulse-glow": `${step.color}88`,
                    } as CSSProperties
                  }
                >
                  <step.Icon c={step.color} size={Math.round(size * 0.42)} />
                </div>
              );
            })}
          </div>

          {/* Eyebrow/title/subtext read as one tight cluster (12-16px apart) — the larger
              gap on the outer flex container is for the bigger jumps between this
              cluster, the circle path above, and the CTA below. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? 11 : 13,
                letterSpacing: "0.3em",
                color: "var(--color-brand-300)",
              }}
            >
              CAMPAIGN COMPLETE
            </div>

            {/* One gradient text, animated: the colors inside it wash left-to-right and
                settle into solid brand blue, rather than two separate layers
                crossfading — the gradient itself is wider than the text box (250%) with
                the five chapter colors packed into its first stretch and brand blue
                filling the rest, so animating background-position slides the visible
                window from "all five colors" to "solid blue" in one continuous motion.
                Replays via `key` each time the finale re-enters view. */}
            <p
              key={finaleEntering ? "title-wash-active" : "title-wash-idle"}
              className="animate-[finale-title-wash_2.6s_ease-in-out_forwards]"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 900,
                fontSize: isMobile ? 42 : Math.min(96, w * 0.075),
                lineHeight: 0.98,
                letterSpacing: "-0.03em",
                margin: 0,
                maxWidth: isMobile ? "100%" : "18ch",
                backgroundImage: `linear-gradient(90deg, ${STEPS[0].color} 0%, ${STEPS[1].color} 10%, ${STEPS[2].color} 20%, ${STEPS[3].color} 30%, ${STEPS[4].color} 40%, var(--color-brand-400) 55%, var(--color-brand-400) 100%)`,
                backgroundSize: "250% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              YOU&apos;RE READY.
            </p>

            <p
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: isMobile ? 15 : 20,
                color: "rgba(255,255,255,0.82)",
                margin: 0,
                maxWidth: isMobile ? "88vw" : "40ch",
              }}
            >
              Five stages down. Time to meet the pros for real.
            </p>
          </div>

          <Button variant="cta-solid" href="/flow" className="pointer-events-auto px-10 py-4 text-lg">
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
        <div style={{ height: `${edgeSpacerVh(w)}vh` }} />
        {STEPS.map((step, i) => {
          const t = proximity(safeProgress, centerOf(i, STEPS.length));
          const isLeft = step.side === "left";
          // Desktop: sized directly off the actual available width (not a flat 190px
          // cap) so it scales properly with the viewport instead of leaving a lot of
          // unused horizontal room at wider sizes. 5.19 is "CONNECT"/"EXPLORE" (the two
          // longest labels, 7 chars, Montserrat weight 900) measured width-per-1px-of-
          // font-size via canvas.measureText — filling 85% of the available width gives
          // "as big as possible" while still leaving a real margin against the rail and
          // the outer edge, not crowding either.
          const availableTitleWidth = w - railClear - 2 * sidePad;
          const nameFontSize = isMobile
            ? Math.min(52, w * 0.16) * CHAPTER_TITLE_SCALE
            : Math.max(90, Math.min(260, (availableTitleWidth * 0.85) / 5.19));
          // Scales with viewport width too (was a flat 22px) so it grows alongside the
          // now much bigger titles instead of looking undersized next to them.
          const descFontSize = isMobile ? 15 : Math.max(22, Math.min(30, w * 0.017));
          const iconSize = isMobile ? 34 : 50;

          return (
            <div
              key={step.key}
              data-how-it-works-snap-target="center"
              style={{
                position: "relative",
                // Shorter than a full viewport (was 100vh) so two adjacent chapters'
                // text can both sit inside the same 100vh-tall viewport at once — the
                // next chapter's title now peeks in blurred near the bottom of the
                // frame before the current one has even left its own hold, instead of
                // there being nothing else on screen to anticipate. Also directly
                // shortens the scroll distance between chapters. dvh isn't used here
                // for the same reason as the sticky layer above avoids it.
                minHeight: `${chapterHeightVh(w)}vh`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: isLeft ? "flex-start" : "flex-end",
                textAlign: isLeft ? "left" : "right",
                paddingLeft: isLeft ? railClear + sidePad : sidePad,
                paddingRight: isLeft ? sidePad : railClear + sidePad,
                paddingTop: isMobile ? 60 : 83,
                paddingBottom: isMobile ? 60 : 83,
                // On mobile/tablet this element is a real document snap target. Center
                // alignment maps exactly to the same geometry as centerOf(), and
                // scroll-snap-stop prevents a momentum swipe from skipping a chapter.
                scrollSnapAlign: w < 1024 ? "center" : undefined,
                scrollSnapStop: w < 1024 ? "always" : undefined,
                // safeProgress clamps at 1 with CONNECT centered, so its own proximity
                // remains 1. The separate exit phase now fades and lifts it completely
                // before finaleProgress is permitted to start.
                opacity: (0.05 + 0.95 * t) * (1 - connectExitProgress),
                transform: `translateY(${-10 * connectExitProgress}vh) scale(${0.95 + 0.05 * t})`,
                // Blurred while out of its own hold window, sharpening to 0 right as it
                // locks in — this is what makes an upcoming chapter read as "coming
                // into focus" rather than just fading up already-sharp.
                filter: `blur(${(1 - t) * 8 + connectExitProgress * 8}px)`,
                willChange: "opacity, transform, filter",
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
                  // Stays hidden until the title is essentially fully locked in (not
                  // just "mostly faded up," per feedback that it should reveal only
                  // once the title itself is in focus), then ramps in quickly.
                  opacity: t > 0.8 ? Math.min(1, (t - 0.8) / 0.2) : 0,
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
        <div style={{ height: `${edgeSpacerVh(w)}vh` }} />
        {/* One transition runway covers CONNECT's full exit and the finale's full entry.
            Its end is the next mobile/tablet snap target after CONNECT, so a single
            gesture visibly carries the blurred handoff through both phases and parks on
            a fully revealed "YOU'RE READY" state. The hold below keeps that state on
            screen before the page ends. */}
        <div
          data-how-it-works-snap-target="end"
          style={{
            height: `${connectExitVh(w) + finaleScrollVh(w)}vh`,
            scrollSnapAlign: w < 1024 ? "end" : undefined,
            scrollSnapStop: w < 1024 ? "always" : undefined,
          }}
        />
        <div style={{ height: `${finaleHoldVh(w)}vh` }} />
      </div>
    </div>
  );
}
