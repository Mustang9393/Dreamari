"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";
import { useResolvedColor } from "./useResolvedColor";

// v3 experiment: a Vanta.js-style "Dots" scene -- direct request 21 Sept
// 2026, linking https://www.vantajs.com/?effect=dots. Built first-party
// here (a canvas grid, each dot's size/brightness driven by a slow ambient
// wave plus a spring-eased pointer proximity glow) rather than adding the
// `vanta`/`three` packages for one background -- Vanta's DOTS effect is a
// well-known, fairly simple technique (a regular grid + a mouse-proximity
// highlight), not something that needs a 3D engine to approximate well.
// Dots colored in the game's own gold accent rather than Vanta's default
// palette ("color match to compliment the background").
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

    let pointerX = -9999;
    let pointerY = -9999;
    function onMove(e: PointerEvent) {
      pointerX = e.clientX;
      pointerY = e.clientY;
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    const spacing = 34;
    const baseRadius = 1.4;
    const [r, g, b] = parseRgb(resolvedAccent);

    function drawFrame(t: number) {
      ctx!.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * spacing;
          const y = cy * spacing;
          // A slow ambient wave -- every dot breathes independently, offset
          // by its own position so the field ripples rather than pulsing
          // in unison.
          const wave = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.0006 + (x + y) * 0.02);
          const dist = Math.hypot(x - pointerX, y - pointerY);
          const proximity = reduced ? 0 : Math.max(0, 1 - dist / 160);
          const radius = baseRadius + wave * 1.1 + proximity * 3.2;
          const alpha = 0.18 + wave * 0.22 + proximity * 0.55;
          ctx!.beginPath();
          ctx!.fillStyle = `rgba(${r},${g},${b},${Math.min(alpha, 0.95).toFixed(3)})`;
          ctx!.arc(x, y, radius, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    if (reduced) {
      drawFrame(0);
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    function tick(t: number) {
      drawFrame(t);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [resolvedAccent, reduced]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "#07080a" }}>
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
