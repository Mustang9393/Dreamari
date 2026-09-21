"use client";

import { useEffect, useRef, useState } from "react";
import { onPlayPulse, type PlayPulseKind } from "./backdropPulse";
import { useResolvedColor } from "./useResolvedColor";

// v3 experiment: the REAL Vanta.js DOTS effect -- two hand-built canvas
// approximations (a static breathing grid, then a scattered/line-linked
// field) were both rejected as not matching the actual reference (direct
// feedback, 21 Sept 2026: "you got the dots worng. Thats not what is
// showing in the reference at all", pasting the library's own embed
// snippet from vantajs.com/?effect=dots). This loads the genuine library
// -- three.js + vanta.dots -- from the same CDN URLs in that snippet,
// exactly the intended integration, rather than continuing to
// hand-approximate it.
type VantaEffect = { destroy: () => void };
declare global {
  interface Window {
    THREE?: unknown;
    VANTA?: { DOTS: (opts: Record<string, unknown>) => VantaEffect };
  }
}

const THREE_SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
const VANTA_DOTS_SRC = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function rgbToHexNumber(rgb: string): number {
  const match = rgb.match(/(\d+(?:\.\d+)?)/g);
  if (!match || match.length < 3) return 0xffb81f;
  const [r, g, b] = match.map((n) => Math.round(Number(n)));
  return (r << 16) + (g << 8) + b;
}

export function PlayBackdropV3Dots({ accent = "#ffb81f" }: { accent?: string } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<VantaEffect | null>(null);
  const [bloom, setBloom] = useState<{ key: number; kind: PlayPulseKind } | null>(null);
  useEffect(() => onPlayPulse(({ kind }) => setBloom((b) => ({ key: (b?.key ?? 0) + 1, kind }))), []);
  const bloomColor = bloom?.kind === "wrong" ? "var(--destructive)" : accent;
  const bloomPeak = bloom?.kind === "celebrate" ? 0.7 : bloom?.kind === "wrong" ? 0.32 : 0.5;
  // VANTA.DOTS' `color`/`color2`/`backgroundColor` are numeric hex
  // (0xff8820), not CSS strings -- `accent` is often a design-token CSS
  // expression (e.g. `var(--world-...)`), so it's resolved to a real
  // color first the same way canvas-based experiments needed to (see
  // useResolvedColor's own comment), then converted to a hex number.
  const resolvedAccent = useResolvedColor(accent);

  useEffect(() => {
    if (!resolvedAccent || !containerRef.current) return;
    let cancelled = false;

    loadScript(THREE_SRC)
      .then(() => loadScript(VANTA_DOTS_SRC))
      .then(() => {
        if (cancelled || !window.VANTA || !containerRef.current) return;
        vantaRef.current = window.VANTA.DOTS({
          el: containerRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          backgroundColor: 0x0b0b0c,
          color: rgbToHexNumber(resolvedAccent),
          color2: rgbToHexNumber(resolvedAccent),
          size: 3,
          spacing: 35,
          // `false`, not the default `true` -- inspected the effect's own
          // THREE.js scene live (`effect.scene.children`) to confirm what
          // "the spherical spinning shape in the middle made up of lines"
          // actually was: a `LineSegments` mesh (Vanta's internal
          // `linesMesh`) connecting nearby dots, separate from the dot
          // field itself (a `Points` mesh, untouched). Direct instruction,
          // 21 Sept 2026: "Keep the wavy sea of dots exactly like this...
          // remove ONLY that from this and keep everything else the
          // same" -- `showLines: false` removes exactly that mesh at the
          // source, cleaner than hiding it after the fact.
          showLines: false,
        });
      })
      .catch(() => {
        // Left blank on purpose -- if the CDN is unreachable, the div's
        // own dark background (below) is still a reasonable fallback
        // scene rather than a broken/blank one.
      });

    return () => {
      cancelled = true;
      vantaRef.current?.destroy();
      vantaRef.current = null;
    };
  }, [resolvedAccent]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ background: "#0b0b0c" }}>
      {/* Reverted here per direct instruction, 21 Sept 2026 ("please
         revert to the version you did 2 turns before") -- two attempts at
         hiding Vanta.DOTS' own central radiating-burst artifact (resizing
         the target box away from the viewport, then a vignette mask) each
         cost more of the "floor" look than they were worth. Plain fit,
         same as when this was first called "perfect" (bar the burst). */}
      <div ref={containerRef} aria-hidden className="absolute inset-0 h-full w-full" />
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
