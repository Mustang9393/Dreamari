"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { onAuroraPulse, type AuroraPulseKind } from "./pulse";

type AuroraBackgroundProps = {
  accent: string;
  /** Every accent visited so far, in step order — the background keeps a soft, persistent glow for each. */
  visitedAccents: string[];
  /** True on the final step: swaps the dominant wash for a slow-drifting full-spectrum gradient. */
  finale?: boolean;
  /** True for the Match Experience's own "Path Saved!" celebration specifically (not the
   * Build finale) — layers in occasional subtle white flashes across the whole canvas,
   * like a lit-up cloud catching distant lightning. */
  lightning?: boolean;
};

type Ripple = {
  kind: AuroraPulseKind;
  x: number;
  y: number;
  start: number;
  duration: number;
  maxRadius: number;
  amplitude: number;
  // "band": the original behavior, anchored to the bottom edge, masked so it never blooms
  // into the header. "point": launched from a specific screen point (Dreamy) instead --
  // drawn as a full circle with no band mask, since it isn't trying to stay anchored to
  // the aurora curtain, and Dreamy visibly sits well above where that mask would apply.
  originKind: "band" | "point";
};

// Dreamy's own sprite in QuestionHeading carries this attribute -- looked up live at pulse
// time rather than tracked via props/state, since it's just an occasional visual flourish,
// not something the rest of the canvas needs to react to continuously.
function getDreamyAnchor(): { x: number; y: number } | null {
  if (typeof document === "undefined") return null;
  const el = document.querySelector("[data-dreamy-anchor]");
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

type Blob = {
  hex: string;
  x: number; // 0..1, fraction of canvas
  y: number; // 0..1
  // Slow independent twinkle, like the blob is a distant star breathing in brightness —
  // unrelated to clicks/ripples, just a constant gentle ambient pulse.
  phase: number;
  speed: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return [r, g, b];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Light-mode base wash, matched exactly to the Figma reference (node 588:35961):
// linear-gradient(242.096deg, rgba(127, 168, 255, 0.4) 64.584%, rgb(238, 244, 255) 116.1%).
// The first stop's alpha is pre-blended over white into an opaque equivalent — the canvas
// fill has to stay fully opaque every frame (it's what erases the previous frame's dots/
// ripples), so a literal rgba here would leave a ghosting trail instead of a clean wash.
const LIGHT_WASH_ANGLE_DEG = 242.096;
const LIGHT_WASH_STOP_1 = { offsetPercent: 64.584, color: "rgb(204, 220, 255)" };
const LIGHT_WASH_STOP_2 = { offsetPercent: 116.1, color: "rgb(238, 244, 255)" };

// Reproduces the standard CSS angled-gradient box geometry (0deg = up, clockwise) so stop
// percentages line up the same way they do in the Figma/CSS source, including stops past
// 100% (the gradient line is extended past the box's own 100% point rather than clamped,
// so the box's far edge shows the same partial, not-fully-resolved blend CSS would render).
function createAngledGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angleDeg: number,
  stops: { offsetPercent: number; color: string }[],
): CanvasGradient {
  const angleRad = (angleDeg * Math.PI) / 180;
  const dirX = Math.sin(angleRad);
  const dirY = -Math.cos(angleRad);
  const lineLength = Math.abs(width * dirX) + Math.abs(height * dirY);
  const cx = width / 2;
  const cy = height / 2;
  const half = lineLength / 2;
  const x0 = cx - dirX * half;
  const y0 = cy - dirY * half;
  const maxPercent = Math.max(100, ...stops.map((s) => s.offsetPercent));
  const extendedLength = lineLength * (maxPercent / 100);
  const x1 = x0 + dirX * extendedLength;
  const y1 = y0 + dirY * extendedLength;
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const stop of stops) {
    gradient.addColorStop(Math.min(1, Math.max(0, stop.offsetPercent / maxPercent)), stop.color);
  }
  return gradient;
}

// Ease-out cubic — fast start, gentle settle. Used for ripple expansion and fade so
// motion reads as a smooth push, never a mechanical linear sweep or a bounce.
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

// Anchor points (fractions of canvas size) that accumulated per-step glows cycle through,
// spread out so they don't all stack on top of each other.
const ANCHORS: [number, number][] = [
  [0.15, 0.2],
  [0.85, 0.25],
  [0.2, 0.8],
  [0.8, 0.78],
  [0.5, 0.12],
  [0.08, 0.55],
  [0.92, 0.55],
  [0.5, 0.9],
  [0.35, 0.4],
  [0.65, 0.6],
  [0.5, 0.5],
];

const BLOB_RADIUS_FACTOR = 0.42;

// The band is no longer a hex-lattice dot-matrix (removed per direct feedback -- the
// nebula gradients behind this canvas are the texture now, this canvas layers accent
// tint/blobs/ripples on top of them); BAND_FRACTION still shapes where the ripple glow's
// top-fade mask sits, so band-origin pulses still read as rising from a "bottom curtain."
const BAND_FRACTION = 0.42; // fraction of viewport height the band occupies, at its deepest
const BAND_EDGE_FADE = 130; // px of soft fade above the band's (undulating) top edge

export function AuroraBackground({ accent, visitedAccents, finale = false, lightning = false }: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const targetRgbRef = useRef(hexToRgb(accent));
  const currentRgbRef = useRef(hexToRgb(accent));
  // Set for real on mount by the [accent] effect below (performance.now() can't be called
  // during render); 0 just means "treat as already-settled" for the one frame before that
  // effect runs.
  const lastAccentChangeAtRef = useRef(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const blobsRef = useRef<Blob[]>([]);
  const finaleRef = useRef(finale);
  const lightningRef = useRef(lightning);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  // Each accumulated step-glow blob is baked once (at max brightness) into its own small
  // offscreen canvas — position never changes, only brightness (the twinkle) does — so every
  // frame just needs a cheap drawImage + globalAlpha per blob instead of re-running a
  // gradient fill across the whole canvas for each one. Rebaked whenever the blob list,
  // theme, or canvas size changes.
  const blobLayersRef = useRef<HTMLCanvasElement[]>([]);
  const blobLayerDirtyRef = useRef(true);
  // Ripple glow is composited through this isolated, initially-transparent layer instead
  // of drawing straight onto the main canvas — see the draw() loop for why.
  const rippleLayerRef = useRef<HTMLCanvasElement | null>(null);
  // Cached rather than rebuilt every frame — a CanvasGradient is just a paint definition
  // bound to fixed coordinates, so it's safe to reuse across frames until the canvas resizes.
  const lightWashGradientRef = useRef<CanvasGradient | null>(null);

  useEffect(() => {
    themeRef.current = theme;
    blobLayerDirtyRef.current = true;
  }, [theme]);

  useEffect(() => {
    targetRgbRef.current = hexToRgb(accent);
    // Marks the moment of a step change so the base wash can brighten toward the new
    // accent right as it lands, then ease back down to its steady floor -- landing on a
    // screen should read as a small wash of that step's color, not just a passive tint.
    lastAccentChangeAtRef.current = performance.now();
  }, [accent]);

  useEffect(() => {
    finaleRef.current = finale;
  }, [finale]);

  useEffect(() => {
    lightningRef.current = lightning;
  }, [lightning]);

  useEffect(() => {
    blobsRef.current = visitedAccents.map((hex, i) => {
      const [ax, ay] = ANCHORS[i % ANCHORS.length];
      const h1 = Math.sin(i * 91.345) * 47821.63;
      const h2 = Math.sin(i * 51.917) * 30245.11;
      const frac = (n: number) => n - Math.floor(n);
      return { hex, x: ax, y: ay, phase: frac(h1) * Math.PI * 2, speed: 0.12 + frac(h2) * 0.18 };
    });
    blobLayerDirtyRef.current = true;
  }, [visitedAccents]);

  useEffect(() => {
    return onAuroraPulse(({ kind, x }) => {
      const isCta = kind === "cta";
      const now = performance.now();
      // The aurora usually reacts from the bottom edge -- a glow of its own, not a ripple
      // planted wherever the click happened to land. But every CTA pulse doing exactly that
      // read as mechanical, so about a third of the time (only when Dreamy is actually
      // visible on screen) it launches from him instead, like he's the one reacting -- a
      // little variety with a reason behind it, not randomness for its own sake.
      const bottomY = canvasRef.current?.clientHeight ?? window.innerHeight;
      const dreamyAnchor = isCta && Math.random() < 0.35 ? getDreamyAnchor() : null;
      const originKind: Ripple["originKind"] = dreamyAnchor ? "point" : "band";
      const originX = dreamyAnchor ? dreamyAnchor.x : x;
      const originY = dreamyAnchor ? dreamyAnchor.y : bottomY;
      ripplesRef.current.push({
        kind,
        x: originX,
        y: originY,
        start: now,
        duration: isCta ? 1900 : 700,
        maxRadius: isCta ? Math.hypot(window.innerWidth, window.innerHeight) : 190,
        amplitude: isCta ? 22 : 9,
        originKind,
      });
      if (isCta) {
        // A second, gentler wavefront just behind the first — reads as one bigger, richer
        // pulse rather than a repeat, without any of the ripples reversing direction.
        ripplesRef.current.push({
          kind,
          x: originX,
          y: originY,
          start: now + 220,
          duration: 1900,
          maxRadius: Math.hypot(window.innerWidth, window.innerHeight),
          amplitude: 13,
          originKind,
        });
      }
      if (ripplesRef.current.length > 10) ripplesRef.current.splice(0, ripplesRef.current.length - 10);
    });
  }, []);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      pointerRef.current = { x: event.clientX, y: event.clientY, active: true };
    }
    function handlePointerLeave() {
      pointerRef.current.active = false;
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      blobLayerDirtyRef.current = true;

      if (!rippleLayerRef.current) rippleLayerRef.current = document.createElement("canvas");
      rippleLayerRef.current.width = canvas.width;
      rippleLayerRef.current.height = canvas.height;

      lightWashGradientRef.current = ctx
        ? createAngledGradient(ctx, width, height, LIGHT_WASH_ANGLE_DEG, [LIGHT_WASH_STOP_1, LIGHT_WASH_STOP_2])
        : null;
    }

    // Rebakes each accumulated step-glow blob into its own small offscreen canvas at max
    // brightness. Only called when something that changes their appearance changes (list,
    // theme, size) — not every frame — the per-frame twinkle is applied afterward as a
    // cheap globalAlpha multiplier on the (already-rendered) blit, not a gradient recompute.
    function redrawBlobLayers(isDark: boolean) {
      const blobRadius = Math.max(width, height) * BLOB_RADIUS_FACTOR;
      const blobAlpha = isDark ? 0.11 : 0.22;
      const size = Math.max(1, Math.ceil(blobRadius * 2 * dpr));

      blobLayersRef.current = blobsRef.current.map((blob) => {
        const layer = document.createElement("canvas");
        layer.width = size;
        layer.height = size;
        const layerCtx = layer.getContext("2d");
        if (!layerCtx) return layer;
        const [br, bg, bb] = hexToRgb(blob.hex);
        const cx = size / 2;
        const cy = size / 2;
        const r = blobRadius * dpr;
        const gradient = layerCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${blobAlpha})`);
        gradient.addColorStop(1, isDark ? `rgba(${br}, ${bg}, ${bb}, 0)` : "rgba(255, 255, 255, 0)");
        layerCtx.fillStyle = gradient;
        layerCtx.fillRect(0, 0, size, size);
        return layer;
      });
      blobLayerDirtyRef.current = false;
    }

    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    const startTime = performance.now();
    // Lightning flash scheduling — plain closure variables (like width/height above),
    // not refs, since they're only ever touched from inside this same effect's draw loop.
    let nextFlashAt = 0;
    let flashStartedAt: number | null = null;
    let flashX = 0;
    let flashY = 0;
    let flashRadius = 0;

    function draw(now: number) {
      if (!ctx) return;
      const t = (now - startTime) / 1000;
      const isDark = themeRef.current === "dark";
      const isFinale = finaleRef.current;

      const [tr, tg, tb] = targetRgbRef.current;
      const current = currentRgbRef.current;
      current[0] += (tr - current[0]) * 0.04;
      current[1] += (tg - current[1]) * 0.04;
      current[2] += (tb - current[2]) * 0.04;

      // Light mode needs its own tuning throughout this function, not just a lighter fill —
      // the same low alpha that glows nicely on near-black washes out to nothing on white
      // (translucent color over white desaturates fast), so light mode gets higher alpha
      // and a slightly deepened dot color to compensate, not just "the same numbers, inverted."
      // Mirrors --color-aurora-canvas-dark/light in globals.css — kept as literals here
      // rather than a getComputedStyle() read since this runs every animation frame;
      // update both places together if this ever changes.
      //
      // Dark mode's base fill blends toward the current accent (the same already-smooth
      // 0.04/frame lerp everything else on this canvas reads from) instead of staying a
      // fixed navy -- this is the one piece of the canvas painted first, full-bleed, every
      // frame, so it's the one change guaranteed to be visible regardless of where content
      // covers the rest of the screen. Light mode keeps the exact Figma wash untouched.
      // Landing on a step brightens the wash toward its accent, then eases back down to a
      // steady floor over ~2.2s -- a quadratic decay (bright, dies down a bit, settles
      // somewhere still clearly visible) rather than either a flat tint or a flash that
      // fades to nothing. Same curve drives both themes so the transition reads the same
      // regardless of mode.
      const sinceTransition = now - lastAccentChangeAtRef.current;
      const transitionBoost = Math.pow(Math.max(0, 1 - sinceTransition / 2200), 2);
      const [cr0, cg0, cb0] = current;

      if (isDark) {
        // Transparent clear (not an opaque fillRect) so BackgroundSpace's own nebula
        // gradients -- sitting behind this canvas -- show through, with the accent as a
        // translucent wash layered on top instead of replacing them outright. Was an
        // opaque flat navy, which fully hid BackgroundSpace regardless of z-index (an
        // opaque paint blocks whatever's behind it independent of stacking order); the
        // canvas read as flat/plain once that got fixed and the dot-matrix grid (which
        // used to be the visual texture carrying the whole background) came out too.
        ctx.clearRect(0, 0, width, height);
        const tintAlpha = 0.16 + transitionBoost * 0.26;
        ctx.fillStyle = `rgba(${cr0 | 0}, ${cg0 | 0}, ${cb0 | 0}, ${tintAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = lightWashGradientRef.current ?? "#f3f4f8";
        ctx.fillRect(0, 0, width, height);
        // Light mode can't blend the accent into the base fill the same way (the wash is a
        // pre-built gradient, not a flat color) -- an accent-tinted overlay on top gets the
        // same "brightens in, settles to a visible floor" behavior. Needs a higher alpha
        // than dark mode to read at all against a light wash (same reason every other
        // light-mode value in this file runs higher than its dark-mode counterpart).
        const tintAlpha = 0.05 + transitionBoost * 0.11;
        ctx.fillStyle = `rgba(${cr0 | 0}, ${cg0 | 0}, ${cb0 | 0}, ${tintAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);
      }


      const blobRadius = Math.max(width, height) * BLOB_RADIUS_FACTOR;
      const blobs = blobsRef.current;
      // Where the bottom aurora-borealis band begins (its deepest/lowest extent) — dots and
      // ripple glow are otherwise confined below here, per column, with an organic undulating
      // top edge (see edgeWaveAt below) rather than a hard horizontal line.
      const bandBaseTop = height * (1 - BAND_FRACTION);

      // Accumulated per-step blobs are a dark-mode-only effect — light mode uses the exact
      // Figma wash as its base and stays on that same wash through the whole flow, so it
      // doesn't get visually busier/more colorful with every step visited.
      if (isDark) {
        if (blobLayerDirtyRef.current) redrawBlobLayers(isDark);
        // Baked layers are already rendered in device pixels — draw 1:1 (identity transform)
        // rather than through the CSS-pixel dpr transform, which would scale them again.
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "lighter";
        for (let idx = 0; idx < blobs.length; idx++) {
          const blob = blobs[idx];
          const layer = blobLayersRef.current[idx];
          if (!layer) continue;
          // Slow independent breathing per blob — never fully off, so it reads as a dimming
          // star rather than a flicker/pop.
          const twinkle = 0.5 + 0.5 * Math.sin(t * blob.speed + blob.phase);
          ctx.globalAlpha = 0.4 + twinkle * 0.6;
          const cx = blob.x * width * dpr;
          const cy = blob.y * height * dpr;
          ctx.drawImage(layer, cx - layer.width / 2, cy - layer.height / 2);
        }
        ctx.restore();
      }

      // Skipped on the finale step: the per-step blobs (now just a cheap cached blit,
      // above) stay visible, but there's no need to also pay for 6 more full-canvas
      // rainbow gradient fills on top of them every single frame — replace them outright
      // with a smaller, cheaper set of moving rainbow washes instead of layering both.
      const finaleBlobs: { cx: number; cy: number; rgb: [number, number, number] }[] = [];
      if (isFinale) {
        const sweep = (t * 12) % 360;
        const FINALE_BLOB_COUNT = 4;
        ctx.save();
        ctx.globalCompositeOperation = isDark ? "lighter" : "multiply";
        for (let i = 0; i < FINALE_BLOB_COUNT; i++) {
          const hue = (sweep + i * (360 / FINALE_BLOB_COUNT)) % 360;
          const rgb = hslToRgb(hue, 0.75, isDark ? 0.55 : 0.5);
          const cx = width * (0.18 + 0.21 * i);
          const cy = height * (0.3 + 0.1 * Math.sin(t * 0.3 + i));
          finaleBlobs.push({ cx, cy, rgb });
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobRadius * 0.85);
          const alpha = isDark ? 0.15 : 0.24;
          gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`);
          gradient.addColorStop(1, isDark ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)` : "rgba(255, 255, 255, 0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }

      const ripples = ripplesRef.current.filter((r) => now - r.start < r.duration);
      ripplesRef.current = ripples;

      // A soft radial glow behind the dots for each active ripple — expands outward in
      // step with the dot ring and feathers to nothing well before the edge, so the pulse
      // reads as an actual wave of light, not just the dot grid reacting on its own. One
      // gradient fill per active ripple (typically 0-2 at a time), not per dot, so it's
      // cheap even alongside everything else on screen.
      //
      // Drawn onto rippleLayer (an isolated, transparent-by-default offscreen canvas) and
      // composited onto the main canvas afterward, rather than drawing directly onto ctx —
      // the top-edge fade a few lines down needs `destination-out` to erase gradually
      // instead of a hard ctx.clip() cutoff, but destination-out erases whatever's already
      // painted on WHICHEVER canvas it targets. Applied straight to ctx, that included the
      // base background fill and dot grid from earlier this same frame, not just this
      // glow — punching a real transparent hole through to whatever sits behind the
      // <canvas> element in the DOM (a solid black patch in light mode, since the page
      // background behind it isn't the light fill this canvas paints). Isolating the glow
      // on its own layer means the erase only ever touches this glow's own pixels.
      if (ripples.length > 0) {
        const rippleLayer = rippleLayerRef.current;
        const rippleCtx = rippleLayer?.getContext("2d");
        if (rippleLayer && rippleCtx) {
          rippleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
          rippleCtx.clearRect(0, 0, width, height);

          const [cr, cg, cb] = current;

          function drawRippleGlow(ripple: Ripple) {
            const elapsed = now - ripple.start;
            const rawProgress = Math.min(1, elapsed / ripple.duration);
            const eased = easeOutCubic(rawProgress);
            const isCta = ripple.kind === "cta";
            const glowRadius = eased * ripple.maxRadius * (isCta ? 1.0 : 0.85);
            const glowAlphaBase = isCta ? (isDark ? 0.22 : 0.16) : isDark ? 0.13 : 0.1;
            // A wavefront reads as "traveling" only if it's still bright once it's big
            // enough to see -- fading from the very first frame (old: alphaBase*(1-eased))
            // meant it was brightest as a single pixel at the click origin and nearly gone
            // by the time it had grown large enough to register, which is why this pulse
            // was firing correctly but landing as functionally invisible. Hold near-full
            // brightness through most of the animation and only fade over the tail, so the
            // glow is still visible while it's actually crossing the screen.
            const holdUntil = 0.55;
            const fadeMul = rawProgress < holdUntil ? 1 : Math.max(0, 1 - (rawProgress - holdUntil) / (1 - holdUntil));
            const glowAlpha = glowAlphaBase * fadeMul;
            if (glowAlpha <= 0.003 || glowRadius <= 1) return;

            const gradient = rippleCtx!.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, glowRadius);
            gradient.addColorStop(0, `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${glowAlpha.toFixed(3)})`);
            gradient.addColorStop(0.7, `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${(glowAlpha * 0.35).toFixed(3)})`);
            gradient.addColorStop(1, isDark ? `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, 0)` : "rgba(255, 255, 255, 0)");
            rippleCtx!.fillStyle = gradient;
            rippleCtx!.fillRect(0, 0, width, height);

            // The fill alone is the same hue as everything else already on screen (the
            // ambient accent wash, the blobs) -- "brighter of the same color" reads as
            // almost nothing against a backdrop that's already that color. A faint
            // near-white edge traced at the wavefront reads as an actual moving front
            // regardless of what accent is active. Traced as a wobbly path (two sine
            // terms perturbing the radius per angle, seeded off the ripple's own start
            // time so consecutive pulses don't wobble in lockstep) rather than a perfect
            // ctx.arc() circle -- a geometrically perfect ring reads as synthetic against
            // everything else on this canvas, which is deliberately organic (the dot
            // band's own top edge uses the same two-sine-wave technique). CTA-only: the
            // smaller select pulse stays a plain glow. Band-origin ripples only trace their
            // upper half (the lower half is off-canvas anyway, born at the bottom edge);
            // point-origin ones (launched from Dreamy) trace the full circle.
            if (isCta && glowRadius > 4) {
              const ringAlpha = glowAlpha * (isDark ? 0.28 : 0.2);
              if (ringAlpha > 0.01) {
                const seed = ripple.start * 0.001;
                const arcSpan = ripple.originKind === "point" ? Math.PI * 2 : Math.PI;
                rippleCtx!.beginPath();
                const steps = ripple.originKind === "point" ? 72 : 48;
                for (let s = 0; s <= steps; s++) {
                  const angle = Math.PI + (s / steps) * arcSpan;
                  const wobble = Math.sin(angle * 5 + now * 0.0016 + seed) * glowRadius * 0.02 + Math.sin(angle * 2.3 - now * 0.001 + seed * 1.7) * glowRadius * 0.035;
                  const r = glowRadius + wobble;
                  const px = ripple.x + Math.cos(angle) * r;
                  const py = ripple.y + Math.sin(angle) * r;
                  if (s === 0) rippleCtx!.moveTo(px, py);
                  else rippleCtx!.lineTo(px, py);
                }
                rippleCtx!.lineWidth = 2;
                rippleCtx!.strokeStyle = isDark ? `rgba(255, 255, 255, ${ringAlpha.toFixed(3)})` : `rgba(${cr | 0}, ${cg | 0}, ${cb | 0}, ${ringAlpha.toFixed(3)})`;
                rippleCtx!.stroke();
              }
            }
          }

          const bandRipples = ripples.filter((r) => r.originKind !== "point");
          const pointRipples = ripples.filter((r) => r.originKind === "point");

          rippleCtx.save();
          for (const ripple of bandRipples) drawRippleGlow(ripple);
          rippleCtx.restore();

          // Keep the band-origin glow anchored to the aurora band rather than letting a big
          // CTA pulse bloom all the way to the top frame (where FlowProgress sits) — fades
          // it out gradually (fully gone by fadeTop, untouched by fadeBottom) instead of a
          // hard cutoff, safely now that it only erases this isolated layer. Point-origin
          // (Dreamy) ripples are drawn AFTER this mask, unmasked -- they're meant to glow
          // right where they're launched from, which is well above where this mask applies.
          const fadeBottom = Math.max(0, bandBaseTop - BAND_EDGE_FADE * 3);
          const fadeTop = Math.max(0, fadeBottom - BAND_EDGE_FADE * 3);
          if (fadeBottom > 0) {
            rippleCtx.save();
            rippleCtx.globalCompositeOperation = "destination-out";
            const mask = rippleCtx.createLinearGradient(0, fadeTop, 0, fadeBottom);
            mask.addColorStop(0, "rgba(0,0,0,1)");
            mask.addColorStop(1, "rgba(0,0,0,0)");
            rippleCtx.fillStyle = mask;
            rippleCtx.fillRect(0, 0, width, fadeBottom);
            rippleCtx.restore();
          }

          rippleCtx.save();
          for (const ripple of pointRipples) drawRippleGlow(ripple);
          rippleCtx.restore();

          ctx.save();
          ctx.globalCompositeOperation = isDark ? "lighter" : "multiply";
          ctx.drawImage(rippleLayer, 0, 0, width, height);
          ctx.restore();
        }
      }



      // Subtle "cloud lit up by distant lightning" flash — a soft, localized brightening
      // patch at a random spot each time (not a uniform full-screen wash, which read as
      // way too flash-bang), with a soft radial falloff so it looks like part of the
      // existing color/glow just brightened a little, not a foreign white overlay. Fast
      // rise then a slower decay (real lightning brightens quicker than it fades), at
      // long randomized intervals so it never feels mechanical or frequent.
      if (lightningRef.current) {
        if (nextFlashAt === 0) nextFlashAt = now + 2600 + Math.random() * 3400;
        if (flashStartedAt === null && now >= nextFlashAt) {
          flashStartedAt = now;
          flashX = width * (0.2 + Math.random() * 0.6);
          flashY = height * (0.1 + Math.random() * 0.5);
          flashRadius = Math.min(width, height) * (0.16 + Math.random() * 0.12);
        }

        if (flashStartedAt !== null) {
          const FLASH_DURATION = 340;
          const elapsed = now - flashStartedAt;
          if (elapsed >= FLASH_DURATION) {
            flashStartedAt = null;
            nextFlashAt = now + 3400 + Math.random() * 4600;
          } else {
            const flashT = elapsed / FLASH_DURATION;
            const intensity = flashT < 0.25 ? flashT / 0.25 : 1 - (flashT - 0.25) / 0.75;
            const peakAlpha = (isDark ? 0.14 : 0.07) * intensity;
            const flashGradient = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, flashRadius);
            flashGradient.addColorStop(0, `rgba(255, 255, 255, ${peakAlpha.toFixed(3)})`);
            flashGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = flashGradient;
            ctx.fillRect(0, 0, width, height);
          }
        }
      } else {
        nextFlashAt = 0;
        flashStartedAt = null;
      }

      if (!reducedMotion) rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 size-full" aria-hidden="true" />;
}
