"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";
import { useResolvedColor } from "./useResolvedColor";

// v3 experiment: a Vanta.js "Dots" scene -- direct request 21 Sept 2026,
// linking https://www.vantajs.com/?effect=dots. Two earlier attempts (a
// flat breathing grid, then a hyperspace warp of dots flying toward the
// camera) were both corrected against the ACTUAL reference, checked live:
// Vanta.DOTS is a scattered (not gridded) field of small dots at varying
// sizes, connected to their nearby neighbors by thin lines (its own
// `showLines` option), where the whole field pans with real 3D camera
// parallax as the pointer moves -- not dots individually flying anywhere.
// Approximated here with a 2D canvas rather than three.js/Vanta itself
// (avoids a 3D-engine dependency for one background): a scattered dot
// field with per-dot size variance standing in for depth, a proximity
// line network between nearby dots (the reference's own `showLines`), a
// spring-eased whole-field parallax offset following the pointer (the
// reference's `mouseControls`), and a very slow ambient per-dot drift so
// the constellation is never perfectly frozen. Recolored to the game's
// gold accent instead of Vanta's own orange ("color match to compliment
// the background").
export function PlayBackdropV3Dots({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;
  // `accent` is a design-token CSS expression (e.g. `var(--world-...)`),
  // not always a literal hex -- canvas fillStyle can't parse `var()`
  // directly, so it's resolved to a real color first (see
  // useResolvedColor's own comment for why).
  const resolvedAccent = useResolvedColor(accent);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !resolvedAccent) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let targetX = 0;
    let targetY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    function onMove(e: PointerEvent) {
      targetX = (e.clientX / window.innerWidth - 0.5) * -30;
      targetY = (e.clientY / window.innerHeight - 0.5) * -30;
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    const [r, g, b] = parseRgb(resolvedAccent);
    const SPACING = 46;
    let seed = 7331;
    function rand() {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    type P = { x: number; y: number; r: number; vx: number; vy: number };
    function buildField(): P[] {
      const cols = Math.ceil(width / SPACING) + 4;
      const rows = Math.ceil(height / SPACING) + 4;
      const field: P[] = [];
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          // A scattered field, not a grid: each cell holds one dot at a
          // jittered offset inside it, so spacing stays roughly even
          // without ever looking gridded (matching the reference).
          field.push({
            x: (cx - 2) * SPACING + rand() * SPACING,
            y: (cy - 2) * SPACING + rand() * SPACING,
            r: 1 + rand() * 2.2,
            vx: (rand() - 0.5) * 0.06,
            vy: (rand() - 0.5) * 0.06,
          });
        }
      }
      return field;
    }
    let dots = buildField();

    const LINK_DIST = SPACING * 1.35;

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.save();
      ctx!.translate(parallaxX, parallaxY);

      // The connecting web -- the reference's own `showLines`. Only
      // nearby pairs link, and the closer they are the more opaque, so
      // the network reads as depth rather than a uniform mesh.
      ctx!.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const bDot = dots[j];
          const dx = a.x - bDot.x;
          const dy = a.y - bDot.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.35;
            ctx!.strokeStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(bDot.x, bDot.y);
            ctx!.stroke();
          }
        }
      }

      for (const d of dots) {
        if (!reduced) {
          d.x += d.vx;
          d.y += d.vy;
        }
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${r},${g},${b},0.85)`;
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    if (reduced) {
      drawFrame();
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
      };
    }

    let raf = 0;
    function tick() {
      // Spring-eased parallax -- the reference's own camera pan, standing
      // in for real 3D `mouseControls` rotation.
      parallaxX += (targetX - parallaxX) * 0.05;
      parallaxY += (targetY - parallaxY) * 0.05;
      drawFrame();
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      resize();
      dots = buildField();
    };
    window.removeEventListener("resize", resize);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [resolvedAccent, reduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "#1c1c1c" }}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      {bloom && (
        <span
          key={bloom.key}
          aria-hidden
          className="motion-safe:animate-[backdrop-bloom_900ms_ease-out_forwards] absolute top-1/2 left-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ "--bloom-peak": bloomPeak, background: `radial-gradient(closest-side, color-mix(in srgb, ${bloomColor} 55%, transparent), transparent 68%)` } as React.CSSProperties}
        />
      )}
    </div>
  );
}

// `getComputedStyle(...).color` always comes back as `rgb(r, g, b)` (or
// `rgba(...)`), never a hex string -- parsed here rather than re-guessing
// a format.
function parseRgb(rgb: string): [number, number, number] {
  const match = rgb.match(/(\d+(?:\.\d+)?)/g);
  if (!match || match.length < 3) return [255, 184, 31];
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}
