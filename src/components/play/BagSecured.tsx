"use client";

// The two reward moments of a level, drawn as the career's own party, not
// stock confetti (Chandu, 6 Oct 2026, on Joshua's "big confetti" ask: "I
// dont want to use the normal generic confetti thing, can we design and
// animate a proper color coded version with better graphics"; then "more
// depth and be more premium ... the spiraling gold confetti etc should have
// some sort of shine, and they should visibly twist").
//
// - TickerTapeStorm: the big one, behind Bag Secured. A ticker-tape parade
//   in the world's colours, in depth (far pieces small and dim, near pieces
//   big and bright, drawn last). Paper streamers twist along their length,
//   showing a lit front face and a dark back; gold coils spiral tightly
//   with a metallic sheen; foil pieces cut in the firm's mark (hexagons for
//   a Cobalt) flash white as they turn square to the light; sparks glow
//   additively. Two cannons from the bottom corners, then a slow shower,
//   then it thins out.
// - Balloons: the small one, for the midpoint review ("small confetti or a
//   few balloons ... noticeably smaller than the final offer celebration").
//   Seven glossy balloons in the same palette drift up once and are gone.
//
// Palette by world, so a new career inherits it (see worldPalette). Reduced
// motion gets nothing; the card itself still lands.

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** The celebration colours for a world: a bold mix the eye can read as a
 *  mix. Business is two golds, two cobalts and white; health is the
 *  world's teal with mint, sky and white; trades are the accent with amber,
 *  steel and white; everything else is the accent, a lighter tint and
 *  white. */
export function worldPalette(world: string, accent: string): string[] {
  switch (world) {
    case "Business & Finance":
      return [accent, "#ffd45c", "#2f5fe0", "#1b3fc4", "#ffffff", accent, "#ffd45c"];
    case "Health & Medicine":
      return [accent, "#8df0c8", "#ffffff", "#5ad7ff", "#2f9bd8", accent];
    case "Fixing Machines & Engines":
    case "Driving, Flying & Shipping":
      // The trades' accent is a dark slate that reads black on the dark
      // room, so the party is amber, white, steel and orange instead.
      return ["#ffd23f", "#ffffff", "#9fb3c8", "#ff9b1f", "#ffd23f", "#ffffff"];
    default:
      return [accent, "#ffffff", "#ffd36e", accent];
  }
}

type Base = { x: number; y: number; vx: number; vy: number; z: number; life: number; color: string };
type Piece =
  | (Base & { kind: "tape"; len: number; w: number; phase: number; curl: number; rot: number; vr: number; twist: number; vtw: number; turns: number })
  | (Base & { kind: "coil"; len: number; w: number; phase: number; rot: number; vr: number; twist: number; vtw: number })
  | (Base & { kind: "foil"; r: number; rot: number; vr: number; flip: number; vf: number; hex: boolean })
  | (Base & { kind: "spark"; r: number; twinkle: number });

function toRgb(color: string): string {
  const probe = document.createElement("span");
  probe.style.color = color;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  return rgb;
}
type Rgb = [number, number, number];
function parseRgb(rgb: string): Rgb {
  const m = /(\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [255, 255, 255];
}
const shade = ([r, g, b]: Rgb, k: number) => `rgb(${Math.round(r * k)}, ${Math.round(g * k)}, ${Math.round(b * k)})`;
const tint = ([r, g, b]: Rgb, k: number) => `rgb(${Math.round(r + (255 - r) * k)}, ${Math.round(g + (255 - g) * k)}, ${Math.round(b + (255 - b) * k)})`;

export function TickerTapeStorm({ world, accent, firm = "" }: { world: string; accent: string; firm?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const palette = worldPalette(world, accent).map(toRgb);
    const paper = palette.filter((c) => c !== "rgb(255, 255, 255)");
    const golds = [toRgb(accent), toRgb("#ffd45c"), toRgb("#f0b53a")];
    const hex = /cobalt/i.test(firm) || world === "Business & Finance";
    const W = () => canvas.width;
    const H = () => canvas.height;
    const pick = (from: string[]) => from[Math.floor(Math.random() * from.length)];
    const pieces: Piece[] = [];
    const base = (x: number, y: number, angle: number, speed: number, color: string): Base => {
      // 0.55 is far, 1.35 is near: size, speed and brightness all follow it.
      const z = 0.55 + Math.random() * 0.8;
      return { x, y, vx: Math.cos(angle) * speed * z, vy: Math.sin(angle) * speed * z, z, life: 1, color };
    };
    const tape = (x: number, y: number, angle: number, speed: number): Piece => ({
      kind: "tape", ...base(x, y, angle, speed, pick(paper)),
      len: (70 + Math.random() * 70) * dpr, w: (7 + Math.random() * 4) * dpr,
      phase: Math.random() * Math.PI * 2, curl: 0.35 + Math.random() * 0.35,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.05,
      twist: Math.random() * Math.PI * 2, vtw: 0.05 + Math.random() * 0.06, turns: 0.8 + Math.random() * 1.2,
    });
    const coil = (x: number, y: number, angle: number, speed: number): Piece => ({
      kind: "coil", ...base(x, y, angle, speed, pick(golds)),
      len: (34 + Math.random() * 30) * dpr, w: (9 + Math.random() * 5) * dpr,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.07,
      twist: Math.random() * Math.PI * 2, vtw: 0.12 + Math.random() * 0.1,
    });
    const foil = (x: number, y: number, angle: number, speed: number): Piece => ({
      kind: "foil", ...base(x, y, angle, speed, pick(palette)),
      r: (6 + Math.random() * 7) * dpr, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.25,
      flip: Math.random() * Math.PI * 2, vf: 0.08 + Math.random() * 0.1, hex,
    });
    const spark = (x: number, y: number, angle: number, speed: number): Piece => ({
      kind: "spark", ...base(x, y, angle, speed * 1.1, pick(golds)),
      r: (2 + Math.random() * 2.5) * dpr, twinkle: Math.random() * Math.PI * 2,
    });
    // Fewer pieces on a small machine (a Chromebook reports 2 to 4 cores);
    // depth order is fixed at spawn, so the array is sorted once per burst,
    // not once per frame.
    const budget = (navigator.hardwareConcurrency ?? 4) <= 4 ? 0.6 : 1;
    const launch = (x: number, y: number, angle: number, speed: number) => {
      if (Math.random() > budget) return;
      const roll = Math.random();
      pieces.push(roll < 0.36 ? tape(x, y, angle, speed) : roll < 0.52 ? coil(x, y, angle, speed) : roll < 0.9 ? foil(x, y, angle, speed) : spark(x, y, angle, speed));
    };
    const settle = () => pieces.sort((a, b) => a.z - b.z);
    const cannon = (fromLeft: boolean, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const dir = fromLeft ? -Math.PI / 2.9 : -Math.PI + Math.PI / 2.9;
        const angle = dir + (Math.random() - 0.5) * 0.8;
        launch(fromLeft ? -16 * dpr : W() + 16 * dpr, H() * (0.78 + Math.random() * 0.1), angle, (17 + Math.random() * 15) * dpr);
      }
    };
    const shower = (count: number) => {
      for (let i = 0; i < count; i += 1) {
        launch(Math.random() * W(), -30 * dpr - Math.random() * H() * 0.4, Math.PI / 2 + (Math.random() - 0.5) * 0.3, (1.6 + Math.random() * 2.4) * dpr);
      }
    };
    cannon(true, 80);
    cannon(false, 80);
    settle();
    const timers = [
      window.setTimeout(() => { cannon(true, 50); cannon(false, 50); settle(); }, 420),
      window.setTimeout(() => { shower(100); settle(); }, 800),
      window.setTimeout(() => { shower(60); settle(); }, 1900),
    ];
    const rgbCache = new Map<string, Rgb>();
    const rgbOf = (c: string): Rgb => {
      let v = rgbCache.get(c);
      if (!v) { v = parseRgb(c); rgbCache.set(c, v); }
      return v;
    };

    /** A twisting ribbon along the local x axis: each segment's half-width
     *  follows |cos| of the twist, the front face is lit, the back face is
     *  dark, and a segment turning square to the light gets a white sheen. */
    const ribbon = (len: number, w: number, curlAmp: number, curl: number, phase: number, twist: number, turns: number, t: number, rgb: Rgb) => {
      const steps = 14;
      const pts: { x: number; y: number; hw: number; c: number }[] = [];
      for (let s = 0; s <= steps; s += 1) {
        const u = s / steps;
        const c = Math.cos(twist + u * Math.PI * 2 * turns);
        pts.push({ x: (u - 0.5) * len, y: Math.sin(u * Math.PI * 2 * curl + t * 2 + phase) * curlAmp, hw: (w / 2) * (0.12 + 0.88 * Math.abs(c)), c });
      }
      for (let s = 0; s < steps; s += 1) {
        const a = pts[s], b = pts[s + 1];
        const c = (a.c + b.c) / 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y - a.hw);
        ctx.lineTo(b.x, b.y - b.hw);
        ctx.lineTo(b.x, b.y + b.hw);
        ctx.lineTo(a.x, a.y + a.hw);
        ctx.closePath();
        ctx.fillStyle = c >= 0 ? tint(rgb, 0.1 + 0.25 * c) : shade(rgb, 0.45 + 0.2 * (1 + c));
        ctx.fill();
        const sheen = c > 0.82 ? (c - 0.82) / 0.18 : 0;
        if (sheen > 0) {
          ctx.fillStyle = `rgba(255,255,255,${(0.55 * sheen).toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    let frame = 0;
    const started = performance.now();
    const G = 0.26 * dpr;
    const draw = (now: number) => {
      ctx.clearRect(0, 0, W(), H());
      const elapsed = now - started;
      const t = elapsed / 1000;
      for (let i = pieces.length - 1; i >= 0; i -= 1) {
        const p = pieces[i];
        if (p.kind === "tape") {
          p.vx = p.vx * 0.975 + Math.sin(t * 2.2 + p.phase) * 0.05 * dpr * p.z;
          p.vy = Math.min(p.vy * 0.975 + G * 0.5 * p.z, 3 * dpr * p.z);
          p.rot += p.vr + Math.sin(t * 1.7 + p.phase) * 0.01;
          p.twist += p.vtw;
        } else if (p.kind === "coil") {
          p.vx = p.vx * 0.975 + Math.sin(t * 2.6 + p.phase) * 0.04 * dpr * p.z;
          p.vy = Math.min(p.vy * 0.975 + G * 0.6 * p.z, 3.4 * dpr * p.z);
          p.rot += p.vr;
          p.twist += p.vtw;
        } else if (p.kind === "foil") {
          p.vx *= 0.982;
          p.vy = Math.min(p.vy * 0.982 + G * p.z, 5.5 * dpr * p.z);
          p.vx += Math.sin(t * 3 + i) * 0.03 * dpr;
          p.rot += p.vr;
          p.flip += p.vf;
        } else {
          p.vx *= 0.96;
          p.vy = p.vy * 0.96 + G * 0.4;
          p.twinkle += 0.3;
          p.life -= 0.012;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (elapsed > 4200) p.life -= p.kind === "tape" || p.kind === "coil" ? 0.008 : 0.012;
        if (p.y > H() + 80 * dpr || p.life <= 0) pieces.splice(i, 1);
      }
      // Far first, near last (kept sorted at spawn).
      for (const p of pieces) {
        const depthAlpha = 0.45 + 0.55 * Math.min(1, (p.z - 0.55) / 0.8);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life)) * depthAlpha;
        ctx.translate(p.x, p.y);
        if (p.kind === "tape") {
          ctx.rotate(p.rot);
          ribbon(p.len * p.z, p.w * p.z, p.w * p.z * 1.6, p.curl, p.phase, p.twist, p.turns, t, rgbOf(p.color));
        } else if (p.kind === "coil") {
          ctx.rotate(p.rot);
          // A tight spiral: many turns over a short length, metallic.
          ribbon(p.len * p.z, p.w * p.z, p.w * p.z * 0.9, 2.2, p.phase, p.twist, 3.4, t, rgbOf(p.color));
        } else if (p.kind === "foil") {
          ctx.rotate(p.rot);
          const squash = Math.cos(p.flip);
          ctx.scale(1, Math.max(0.08, Math.abs(squash)));
          const r = p.r * p.z;
          const rgb = rgbOf(p.color);
          const g = ctx.createLinearGradient(-r, -r, r, r);
          g.addColorStop(0, shade(rgb, 0.75));
          g.addColorStop(0.5, tint(rgb, 0.35));
          g.addColorStop(1, shade(rgb, 0.85));
          ctx.fillStyle = squash >= 0 ? g : shade(rgb, 0.55);
          ctx.beginPath();
          if (p.hex) {
            for (let k = 0; k < 6; k += 1) {
              const a = (Math.PI / 3) * k - Math.PI / 2;
              ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
          } else {
            ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
          }
          ctx.closePath();
          ctx.fill();
          // The flash as the face turns square to the light.
          const flash = squash > 0.9 ? (squash - 0.9) / 0.1 : 0;
          if (flash > 0) {
            ctx.fillStyle = `rgba(255,255,255,${(0.8 * flash).toFixed(3)})`;
            ctx.fill();
          }
        } else {
          const tw = 0.6 + 0.4 * Math.sin(p.twinkle);
          ctx.globalCompositeOperation = "lighter";
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12 * dpr;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let k = 0; k < 8; k += 1) {
            const r = k % 2 === 0 ? p.r * 2.4 * tw * p.z : p.r * 0.7 * p.z;
            const a = (k * Math.PI) / 4;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (pieces.length > 0 || elapsed < 2500) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("resize", resize);
    };
  }, [world, accent, firm]);
  // Behind the result card (z 6 under the stage's z 10) and in front of the
  // room: the card's glass softens what passes behind it, so the copy stays
  // readable at the peak while the parade fills the screen around it.
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[6] h-full w-full" />;
}

/** Seven glossy balloons in the world's palette, rising once behind the
 *  midpoint card: a small win, deliberately smaller than the ending. */
export function Balloons({ world, accent }: { world: string; accent: string }) {
  const reduced = useReducedMotion();
  // Portalled to the body: inside the card the fixed layer lands in the
  // card's own stacking context and floats over the copy; on the body it
  // sits behind the stage (z 6 under the stage's z 10), where it belongs.
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target is client-only
    setHost(document.body);
  }, []);
  if (reduced || !host) return null;
  // The accent is often a CSS variable; SVG gradient stops want a real
  // colour, so resolve it once (a var inside color-mix in a stop-color
  // attribute painted black on some worlds).
  const palette = worldPalette(world, toRgb(accent));
  const balloons = [
    { x: "6%", delay: 0, size: 96, drift: 16, dur: 8.4 },
    { x: "17%", delay: 1.1, size: 76, drift: -14, dur: 9.2 },
    { x: "30%", delay: 0.5, size: 108, drift: 12, dur: 8.0 },
    { x: "58%", delay: 0.8, size: 84, drift: -12, dur: 8.8 },
    { x: "70%", delay: 1.5, size: 100, drift: 14, dur: 9.4 },
    { x: "82%", delay: 0.3, size: 72, drift: -16, dur: 8.2 },
    { x: "91%", delay: 1.2, size: 90, drift: 10, dur: 8.9 },
  ];
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[6] overflow-hidden">
      {balloons.map((b, i) => {
        const color = palette[i % palette.length];
        return (
          <motion.svg
            key={i}
            viewBox="0 0 60 130"
            width={b.size}
            height={b.size * 2.17}
            className="absolute bottom-[-260px]"
            style={{ left: b.x, filter: `drop-shadow(0 14px 22px color-mix(in srgb, ${color} 45%, transparent))` }}
            initial={{ y: 0, x: 0, opacity: 0 }}
            animate={{ y: "-150dvh", x: [0, b.drift, -b.drift, 0], rotate: [-3, 3, -3], opacity: [0, 1, 1, 1, 0] }}
            transition={{ delay: b.delay, duration: b.dur, ease: "easeInOut", x: { duration: 3.6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 4.2, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: b.dur, times: [0, 0.06, 0.5, 0.88, 1] } }}
          >
            <defs>
              <radialGradient id={`balloon-${i}`} cx="32%" cy="28%" r="78%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="22%" stopColor={`color-mix(in srgb, ${color} 70%, white)`} />
                <stop offset="60%" stopColor={color} />
                <stop offset="100%" stopColor={`color-mix(in srgb, ${color} 55%, black)`} />
              </radialGradient>
            </defs>
            <path d="M30 2 C13 2, 3 17, 3 34 C3 53, 20 66, 30 74 C40 66, 57 53, 57 34 C57 17, 47 2, 30 2 Z" fill={`url(#balloon-${i})`} />
            {/* The gloss stripe. */}
            <path d="M14 20 C16 12, 22 7, 29 6 C24 10, 19 16, 17 24 Z" fill="rgba(255,255,255,0.75)" />
            <path d="M25 74 L35 74 L30 81 Z" fill={`color-mix(in srgb, ${color} 70%, black)`} />
            <path d="M30 81 C36 96, 24 106, 30 128" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.3" strokeLinecap="round" />
          </motion.svg>
        );
      })}
    </div>,
    host,
  );
}
