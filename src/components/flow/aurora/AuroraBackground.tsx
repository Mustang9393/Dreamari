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
};

type Ripple = {
  kind: AuroraPulseKind;
  x: number;
  y: number;
  start: number;
  duration: number;
  maxRadius: number;
  amplitude: number;
};

type Blob = {
  hex: string;
  x: number; // 0..1, fraction of canvas
  y: number; // 0..1
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

function gaussian(distance: number, width: number): number {
  return Math.exp(-(distance * distance) / (2 * width * width));
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

// Hex/honeycomb lattice, not a plain row-and-column grid: rows are packed at
// sqrt(3)/2 of the column spacing and every other row is offset by half a
// step, the standard hexagonal-packing layout.
const SPACING = 22;
const ROW_SPACING = SPACING * 0.866;
const BASE_RADIUS = 0.7;
const PEAK_RADIUS = 1.3;
const BLOB_RADIUS_FACTOR = 0.42;

export function AuroraBackground({ accent, visitedAccents, finale = false }: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const targetRgbRef = useRef(hexToRgb(accent));
  const currentRgbRef = useRef(hexToRgb(accent));
  const ripplesRef = useRef<Ripple[]>([]);
  const blobsRef = useRef<Blob[]>([]);
  const finaleRef = useRef(finale);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    targetRgbRef.current = hexToRgb(accent);
  }, [accent]);

  useEffect(() => {
    finaleRef.current = finale;
  }, [finale]);

  useEffect(() => {
    blobsRef.current = visitedAccents.map((hex, i) => {
      const [ax, ay] = ANCHORS[i % ANCHORS.length];
      return { hex, x: ax, y: ay };
    });
  }, [visitedAccents]);

  useEffect(() => {
    return onAuroraPulse(({ kind, x, y }) => {
      const isCta = kind === "cta";
      const now = performance.now();
      ripplesRef.current.push({
        kind,
        x,
        y,
        start: now,
        duration: isCta ? 1700 : 700,
        maxRadius: isCta ? Math.hypot(window.innerWidth, window.innerHeight) : 190,
        amplitude: isCta ? 22 : 9,
      });
      if (isCta) {
        // A second, gentler wavefront just behind the first — reads as one bigger, richer
        // pulse rather than a repeat, without any of the ripples reversing direction.
        ripplesRef.current.push({
          kind,
          x,
          y,
          start: now + 220,
          duration: 1700,
          maxRadius: Math.hypot(window.innerWidth, window.innerHeight),
          amplitude: 13,
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
    }

    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    const startTime = performance.now();

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
      ctx.fillStyle = isDark ? "#070912" : "#f3f4f8";
      ctx.fillRect(0, 0, width, height);

      const blobRadius = Math.max(width, height) * BLOB_RADIUS_FACTOR;
      const blobs = blobsRef.current;
      const blobAlpha = isDark ? 0.16 : 0.28;

      ctx.save();
      ctx.globalCompositeOperation = isDark ? "lighter" : "multiply";
      for (const blob of blobs) {
        const [br, bg, bb] = hexToRgb(blob.hex);
        const cx = blob.x * width;
        const cy = blob.y * height;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobRadius);
        if (isDark) {
          gradient.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${blobAlpha})`);
          gradient.addColorStop(1, `rgba(${br}, ${bg}, ${bb}, 0)`);
        } else {
          // Multiply-blend a pale tint of the color into the page instead of an additive
          // glow — additive glow on white is invisible; multiply reliably tints it.
          gradient.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${blobAlpha})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      const finaleBlobs: { cx: number; cy: number; rgb: [number, number, number] }[] = [];
      if (isFinale) {
        const sweep = (t * 12) % 360;
        for (let i = 0; i < 6; i++) {
          const hue = (sweep + i * 60) % 360;
          const rgb = hslToRgb(hue, 0.75, isDark ? 0.55 : 0.5);
          const cx = width * (0.15 + 0.14 * i);
          const cy = height * (0.3 + 0.1 * Math.sin(t * 0.3 + i));
          finaleBlobs.push({ cx, cy, rgb });
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobRadius * 0.85);
          const alpha = isDark ? 0.15 : 0.24;
          if (isDark) {
            gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`);
            gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`);
          } else {
            gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
      }
      ctx.restore();

      const ripples = ripplesRef.current.filter((r) => now - r.start < r.duration);
      ripplesRef.current = ripples;

      // Idle state stays subtle — brightness is mostly earned by an actual interaction (a
      // ripple) or by sitting inside one of the accumulated color washes. Light mode still
      // needs meaningfully higher floors than dark mode to read at all against white.
      const baseAmbient = isDark ? 0.05 : 0.16;
      const bandIntensity = isDark ? 0.1 : 0.16;
      const washCoupling = isDark ? 0.9 : 0.5;
      const maxAlpha = isDark ? 0.85 : 0.72;
      const pointer = pointerRef.current;

      // Deepen the dot color itself in light mode — same trick as the blobs above. A pale
      // wash of a saturated color over white just looks gray; mixing some black in first
      // keeps the hue readable at the alpha levels that behave well on a light background.
      const dotR = isDark ? current[0] : current[0] * 0.72;
      const dotG = isDark ? current[1] : current[1] * 0.72;
      const dotB = isDark ? current[2] : current[2] * 0.72;

      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / ROW_SPACING) + 1;

      for (let j = 0; j < rows; j++) {
        const y = j * ROW_SPACING;
        const v = y / (height || 1);
        const rowOffset = j % 2 === 0 ? 0 : SPACING / 2;

        for (let i = -1; i < cols; i++) {
          const x = i * SPACING + rowOffset;
          if (x < -SPACING || x > width + SPACING) continue;
          const u = x / (width || 1);

          // Organic undulation: two overlapping wave directions keyed to lattice indices (not
          // raw pixel coordinates), so the whole mesh flows like a loose sheet rather than
          // each dot jittering independently or the grid staying perfectly rigid.
          const wave1 = i * 0.35 + t * 0.35;
          const wave2 = j * 0.32 - t * 0.28;
          const idleAmp = isDark ? 3 : 3.4;
          let dotOffsetX = Math.sin(wave1) * idleAmp * 0.6 + Math.sin(wave2 * 1.3) * idleAmp * 0.4;
          let dotOffsetY = Math.cos(wave2) * idleAmp * 0.6 + Math.cos(wave1 * 1.2) * idleAmp * 0.4;

          const a = Math.sin(u * 3.2 + t * 0.4 + v * 1.3);
          const b = Math.sin(v * 2.4 - t * 0.3 + u * 0.6);
          const n = Math.min(1, Math.max(0, (a * 0.6 + b * 0.4 + 1) / 2));

          let alpha = baseAmbient + n * bandIntensity;

          // Sample the color washes at this dot so it brightens wherever a glow sits underneath.
          for (const blob of blobs) {
            const dx = x - blob.x * width;
            const dy = y - blob.y * height;
            alpha += gaussian(Math.hypot(dx, dy), blobRadius * 0.6) * washCoupling * 0.12;
          }
          for (const fb of finaleBlobs) {
            const dx = x - fb.cx;
            const dy = y - fb.cy;
            alpha += gaussian(Math.hypot(dx, dy), blobRadius * 0.55) * washCoupling * 0.14;
          }

          for (const ripple of ripples) {
            const elapsed = now - ripple.start;
            const rawProgress = Math.min(1, elapsed / ripple.duration);
            const eased = easeOutCubic(rawProgress);
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const distance = Math.hypot(dx, dy) || 0.0001;
            const ringCenter = eased * ripple.maxRadius;
            const ringWidth = ripple.maxRadius * (ripple.kind === "cta" ? 0.16 : 0.22);
            // Single bell-shaped lobe centered on the traveling front — always positive,
            // so dots only ever get pushed outward, never snap back.
            const proximity = gaussian(distance - ringCenter, ringWidth);
            const fade = 1 - eased;

            const displacement = ripple.amplitude * proximity * fade;
            dotOffsetX += (dx / distance) * displacement;
            dotOffsetY += (dy / distance) * displacement;

            alpha += proximity * fade * (ripple.kind === "cta" ? 0.55 : 0.32);
          }

          if (pointer.active) {
            const pd = Math.hypot(x - pointer.x, y - pointer.y);
            alpha += gaussian(pd, 80) * (isDark ? 0.06 : 0.1);
          }

          alpha = Math.min(maxAlpha, alpha);
          const radius = BASE_RADIUS + (PEAK_RADIUS - BASE_RADIUS) * n;

          let fillR = dotR;
          let fillG = dotG;
          let fillB = dotB;
          if (isFinale) {
            const hue = ((u + v) * 180 + t * 25) % 360;
            [fillR, fillG, fillB] = hslToRgb(hue, 0.7, isDark ? 0.62 : 0.42);
          }

          ctx.beginPath();
          ctx.arc(x + dotOffsetX, y + dotOffsetY, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${fillR | 0}, ${fillG | 0}, ${fillB | 0}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
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
