"use client";

// The Bag Secured payoff (IB v2 screen 46: "trigger a strong confetti
// celebration across the screen. This should feel like the payoff for
// completing the entire internship and earning the promotion, not simply
// another information screen"). One canvas over the whole screen: two side
// cannons, then a slow shower from the top. Ribbons, discs and stars that
// tumble (a cosine flip on one axis), drift and fade -- never flat squares
// (direct feedback, 21 Sept 2026: "not flat basic confetti, ever").
// Reduced motion gets nothing; the card itself still lands.

import { useEffect, useRef } from "react";

type Piece = {
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; flip: number; vf: number;
  size: number; color: string; shape: 0 | 1 | 2; life: number; drag: number;
};

export function ConfettiStorm({ accent }: { accent: string }) {
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
    // The career's own colour first, then gold, white and the app's blues.
    const probe = document.createElement("span");
    probe.style.color = accent;
    document.body.appendChild(probe);
    const accentRgb = getComputedStyle(probe).color;
    probe.remove();
    const palette = [accentRgb, accentRgb, "#ffd36e", "#ffffff", "#7aa7ff", "#3b6cff", "#4ee0a8", "#ff7a9c"];
    const W = () => canvas.width;
    const H = () => canvas.height;
    const pieces: Piece[] = [];
    const make = (x: number, y: number, angle: number, speed: number): Piece => ({
      x, y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.3,
      flip: Math.random() * Math.PI * 2, vf: 0.08 + Math.random() * 0.12,
      size: (6 + Math.random() * 9) * dpr,
      color: palette[Math.floor(Math.random() * palette.length)],
      shape: (Math.random() < 0.55 ? 0 : Math.random() < 0.6 ? 1 : 2) as 0 | 1 | 2,
      life: 1, drag: 0.985 + Math.random() * 0.008,
    });
    const cannon = (fromLeft: boolean, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const base = fromLeft ? -Math.PI / 3.1 : -Math.PI + Math.PI / 3.1;
        const angle = base + (Math.random() - 0.5) * 0.7;
        pieces.push(make(fromLeft ? -10 * dpr : W() + 10 * dpr, H() * (0.72 + Math.random() * 0.1), angle, (16 + Math.random() * 14) * dpr));
      }
    };
    const shower = (count: number) => {
      for (let i = 0; i < count; i += 1) {
        pieces.push(make(Math.random() * W(), -20 * dpr - Math.random() * H() * 0.3, Math.PI / 2 + (Math.random() - 0.5) * 0.4, (2 + Math.random() * 3) * dpr));
      }
    };
    cannon(true, 110);
    cannon(false, 110);
    const timers = [window.setTimeout(() => { cannon(true, 70); cannon(false, 70); }, 450), window.setTimeout(() => shower(160), 900)];
    let frame = 0;
    const started = performance.now();
    const draw = (now: number) => {
      ctx.clearRect(0, 0, W(), H());
      const elapsed = now - started;
      for (let i = pieces.length - 1; i >= 0; i -= 1) {
        const p = pieces[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + 0.32 * dpr;
        p.vx += Math.sin((elapsed / 400) + i) * 0.04 * dpr;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.flip += p.vf;
        if (elapsed > 3600) p.life -= 0.012;
        if (p.y > H() + 40 * dpr || p.life <= 0) { pieces.splice(i, 1); continue; }
        const squash = Math.cos(p.flip);
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, squash);
        ctx.fillStyle = p.color;
        // The back face reads a touch darker as it flips over.
        if (squash < 0) ctx.globalAlpha *= 0.75;
        if (p.shape === 0) {
          ctx.fillRect(-p.size * 0.9, -p.size * 0.28, p.size * 1.8, p.size * 0.56);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          for (let k = 0; k < 10; k += 1) {
            const r = k % 2 === 0 ? p.size * 0.6 : p.size * 0.26;
            const a = (k * Math.PI) / 5 - Math.PI / 2;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (pieces.length > 0 || elapsed < 1200) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", resize);
    };
  }, [accent]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[70] h-full w-full" />;
}
