"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { onAuroraPulse, type AuroraPulseKind } from "./pulse";

type AuroraBackgroundProps = {
  accent: string;
};

type Pulse = {
  kind: AuroraPulseKind;
  x: number;
  y: number;
  start: number;
  duration: number;
  maxRadius: number;
  amplitude: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return [r, g, b];
}

function gaussianBump(distance: number, width: number): number {
  return Math.exp(-(distance * distance) / (2 * width * width));
}

const SPACING = 28;
const BASE_RADIUS = 1.4;
const PEAK_RADIUS = 2.4;

export function AuroraBackground({ accent }: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  const targetRgbRef = useRef(hexToRgb(accent));
  const currentRgbRef = useRef(hexToRgb(accent));
  const pulsesRef = useRef<Pulse[]>([]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    targetRgbRef.current = hexToRgb(accent);
  }, [accent]);

  useEffect(() => {
    return onAuroraPulse(({ kind, x, y }) => {
      const isCta = kind === "cta";
      pulsesRef.current.push({
        kind,
        x,
        y,
        start: performance.now(),
        duration: isCta ? 1300 : 700,
        maxRadius: isCta ? Math.hypot(window.innerWidth, window.innerHeight) : 260,
        amplitude: isCta ? 0.55 : 0.3,
      });
      // Cap concurrent pulses so rapid clicking can't accumulate unbounded work.
      if (pulsesRef.current.length > 8) pulsesRef.current.shift();
    });
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

      const [tr, tg, tb] = targetRgbRef.current;
      const current = currentRgbRef.current;
      current[0] += (tr - current[0]) * 0.04;
      current[1] += (tg - current[1]) * 0.04;
      current[2] += (tb - current[2]) * 0.04;

      ctx.fillStyle = isDark ? "#070912" : "#fbfbfd";
      ctx.fillRect(0, 0, width, height);

      const pulses = pulsesRef.current.filter((p) => now - p.start < p.duration);
      pulsesRef.current = pulses;

      const baseAmbient = isDark ? 0.1 : 0.05;
      const bandIntensity = isDark ? 0.4 : 0.28;
      const maxAlpha = isDark ? 0.85 : 0.55;

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;

      for (let i = 0; i < cols; i++) {
        const x = i * SPACING;
        const u = x / (width || 1);
        for (let j = 0; j < rows; j++) {
          const y = j * SPACING;
          const v = y / (height || 1);

          const a = Math.sin(u * 3.2 + t * 0.55 + v * 1.3);
          const b = Math.sin(v * 2.4 - t * 0.35 + u * 0.6);
          const c = Math.sin((u + v) * 4.0 + t * 0.22);
          const field = a * 0.5 + b * 0.35 + c * 0.25;
          const n = Math.min(1, Math.max(0, (field + 1.1) / 2.2));

          let alpha = baseAmbient + n * bandIntensity;

          for (const pulse of pulses) {
            const elapsed = now - pulse.start;
            const progress = elapsed / pulse.duration;
            const distance = Math.hypot(x - pulse.x, y - pulse.y);
            const ringCenter = progress * pulse.maxRadius;
            const ringWidth = pulse.maxRadius * 0.35;
            const ring = gaussianBump(distance - ringCenter, ringWidth) * pulse.amplitude * (1 - progress);
            alpha += ring;
            if (pulse.kind === "cta") {
              alpha += pulse.amplitude * 0.35 * (1 - progress);
            }
          }

          alpha = Math.min(maxAlpha, alpha);
          const radius = BASE_RADIUS + (PEAK_RADIUS - BASE_RADIUS) * n;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${current[0] | 0}, ${current[1] | 0}, ${current[2] | 0}, ${alpha.toFixed(3)})`;
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
