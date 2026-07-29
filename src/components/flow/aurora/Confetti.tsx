"use client";

import { useEffect, useRef } from "react";

type ConfettiProps = {
  colors: string[];
  active: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  life: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [parseInt(value.substring(0, 2), 16), parseInt(value.substring(2, 4), 16), parseInt(value.substring(4, 6), 16)];
}

export function Confetti({ colors, active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!active) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rgbs = colors.map(hexToRgb);
    const particles: Particle[] = Array.from({ length: 140 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 4 + Math.random() * 7;
      return {
        x: width / 2 + (Math.random() - 0.5) * width * 0.3,
        y: height * 0.35,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 5,
        color: `${rgbs[Math.floor(Math.random() * rgbs.length)].join(",")}`,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        life: 1,
      };
    });

    let rafId = 0;
    const gravity = 0.16;
    const drag = 0.985;
    // All the tuning above assumes ~60fps (a fixed amount of physics per callback). If the
    // tab is under heavy load and frames arrive slower, that used to mean the whole burst
    // just played out in slow motion in real time. Scaling every increment by elapsed time
    // (in 60fps-equivalent units) keeps it playing at the same real-world speed regardless
    // of frame rate — a callback 3x slower than expected does 3x the physics in one step.
    let lastTime = performance.now();

    function draw(now: number) {
      if (!ctx) return;
      const steps = Math.min(3, (now - lastTime) / (1000 / 60));
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      let anyAlive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        anyAlive = true;

        p.vx *= Math.pow(drag, steps);
        p.vy = p.vy * Math.pow(drag, steps) + gravity * steps;
        p.x += p.vx * steps;
        p.y += p.vy * steps;
        p.rotation += p.spin * steps;
        p.life -= 0.006 * steps;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0, p.life).toFixed(3)})`;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.restore();
      }

      if (anyAlive) {
        rafId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [active, colors]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 -z-10 size-full" aria-hidden="true" />;
}
