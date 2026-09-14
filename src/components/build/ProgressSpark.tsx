"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return [r, g, b];
}

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

// Exported so PhaseProgress can drive the bar's OWN pulse off the exact same color the
// spark uses -- congruent, not just "the bar's normal gradient, brighter."
export function barGradientColorAt(fraction: number): string {
  const fallback: [string, string, string] = ["#4767f3", "#8b5cf6", "#ff4585"];
  const names = ["--color-brand-500", "--color-accent-purple", "--color-world-arts-media-sport"];
  const cs = typeof window !== "undefined" ? getComputedStyle(document.documentElement) : null;
  const [c1, c2, c3] = names.map((name, i) => hexToRgb(cs?.getPropertyValue(name) || "") ?? hexToRgb(fallback[i])!);
  const f = Math.min(1, Math.max(0, fraction));
  return f <= 0.5 ? mix(c1, c2, f / 0.5) : mix(c2, c3, (f - 0.5) / 0.5);
}

type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; glint: boolean };

/** A short, localized discharge. Sprites are painted once per burst, then particles
 * coast with drag and gravity. No per-frame React updates or persistent loop. */
export function ProgressSpark({ trackRef, fromPercent, toPercent, color }: {
  trackRef: RefObject<HTMLDivElement | null>;
  fromPercent: number;
  toPercent: number;
  color?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || document.hidden || toPercent <= 0) return;
    const width = track.getBoundingClientRect().width;
    if (!width) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const height = 88;
    const barHeight = track.getBoundingClientRect().height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    // Resolve inherited CSS custom properties on the actual canvas, including
    // locally scoped accents used by the glossary and simulation screens.
    canvas.style.color = color ?? barGradientColorAt(toPercent / 100);
    const tint = getComputedStyle(canvas).color;
    const white = getComputedStyle(document.documentElement).getPropertyValue("--color-neutral-0").trim() || "#fff";
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const brush = sprite.getContext("2d")!;
    const halo = brush.createRadialGradient(32, 32, 0, 32, 32, 32);
    halo.addColorStop(0, white);
    halo.addColorStop(0.09, white);
    halo.addColorStop(0.23, tint);
    halo.addColorStop(1, "transparent");
    brush.fillStyle = halo;
    brush.fillRect(0, 0, 64, 64);

    const from = width * Math.max(0, Math.min(100, fromPercent)) / 100;
    const to = width * Math.max(0, Math.min(100, toPercent)) / 100;
    const idle = from === to;
    const duration = idle ? 360 : 700;
    // Each exposure is a new, fixed discharge between two positions the fill
    // actually traversed. Longer gains add channel length/strikes, never scale
    // a reusable symbol. Once born, a channel only changes luminosity.
    const travel = Math.abs(to - from);
    const position = (ms: number) => from + (to - from) *
      (1 - Math.pow(1 - Math.min(ms / duration, 1), 3));
    const strikeTimes = idle ? [0, 155] : travel < 16 ? [60, 230] : [65, 175, 310, 475];
    const strikes = strikeTimes.map((birth, index) => {
      const end = idle ? to : position(birth);
      const span = idle ? 30 : Math.max(24, end - position(Math.max(0, birth - 120)));
      const origin = Math.max(0, end - span);
      const finish = end - origin < 16 ? Math.min(width, origin + 24) : end;
      const length = finish - origin;
      const amplitude = Math.min(6, Math.max(3, length * 0.07));
      // Restore the older bolt's 2–4 loose, irregular turns: varied spacing,
      // amplitude and direction, without the repeated hook of a bolt icon.
      const turns = 2 + Math.floor(Math.random() * 3);
      const points: [number, number][] = [[origin, height / 2]];
      let direction = Math.random() < 0.5 ? 1 : -1;
      for (let joint = 1; joint <= turns; joint++) {
        const step = length / (turns + 1);
        const px = origin + joint * step + (Math.random() - 0.5) * step * 0.5;
        direction = Math.random() < 0.35 ? direction : -direction;
        points.push([px, height / 2 + direction * amplitude * (0.55 + Math.random() * 0.6)]);
      }
      points.push([finish, height / 2]);
      const main = new Path2D();
      points.forEach(([px, py], i) => { if (i) main.lineTo(px, py); else main.moveTo(px, py); });
      const fork = new Path2D();
      const [fx, fy] = points[1 + Math.floor(Math.random() * turns)];
      const sign = fy < height / 2 ? 1 : -1;
      fork.moveTo(fx, fy);
      fork.lineTo(fx + length * 0.08, fy - sign * 5);
      fork.lineTo(fx + length * 0.2, fy - sign * 3);
      fork.lineTo(fx + length * 0.28, fy - sign * 6);
      return { birth, main, fork, origin, finish, contact: points[2], fired: false, power: idle ? 0.7 : 1 - index * 0.1 };
    });
    const particles: Particle[] = [];
    let frame = 0;
    let start = 0;
    let previous = 0;
    let emission = 0;
    let stopped = false;
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
    const visibility = () => { if (document.hidden) stop(); };
    const preference = () => { if (motion.matches) stop(); };
    document.addEventListener("visibilitychange", visibility);
    motion.addEventListener("change", preference);

    function draw(now: number) {
      if (stopped || !ctx) return;
      if (!start) start = previous = now;
      const elapsed = now - start;
      const dt = Math.min((now - previous) / 1000, 0.032);
      previous = now;
      ctx.clearRect(0, 0, width, height);
      const t = Math.min(elapsed / duration, 1);
      // Same cubic ease-out as the fill: emitter stays attached to its leading edge.
      const ease = 1 - Math.pow(1 - t, 3);
      const x = from + (to - from) * ease;
      const y = height / 2;
      const energy = Math.pow(1 - t, 0.65);
      const flicker = 0.84 + 0.1 * Math.sin(elapsed * 0.043) + 0.06 * Math.sin(elapsed * 0.097);
      if (t < 1) {
        emission += dt * (idle ? 22 : 65);
        while (emission >= 1 && particles.length < 64) {
          emission--;
          const angle = Math.random() * Math.PI * 2;
          const speed = 18 + Math.random() * (idle ? 35 : 85);
          particles.push({ x, y, vx: Math.cos(angle) * speed - (idle ? 0 : 24),
            vy: Math.sin(angle) * speed * 0.65 - 12, age: 0,
            life: 0.25 + Math.random() * 0.4, size: 0.5 + Math.random() * 1.1,
            glint: Math.random() > 0.8 });
        }
        // Broad bloom, hot nucleus and a thin anamorphic specular reflection.
        ctx.globalAlpha = energy * flicker * (idle ? 0.45 : 0.8);
        ctx.drawImage(sprite, x - 18, y - 6, 36, 12);
        ctx.drawImage(sprite, x - 26, y - 2.5, 52, 5);
        ctx.fillStyle = white;
        ctx.beginPath(); ctx.ellipse(x, y, 2.5, Math.min(1.4, barHeight / 3), 0, 0, Math.PI * 2); ctx.fill();
      }
      // Animation-style exposure: instant contact, a short white-hot hold,
      // then a colored afterimage. Channels stay pinned to their contact points.
      // The next strike forms farther along the bar; nothing slides or deforms.
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.miterLimit = 3;
      for (const strike of strikes) {
        const age = elapsed - strike.birth;
        if (age < 0 || age > 170) continue;
        if (!strike.fired) {
          strike.fired = true;
          // Secondary debris leaves the fracture once, retaining its momentum
          // after the electrical channel disappears.
          for (let i = 0; i < (idle ? 3 : 6) && particles.length < 64; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 25 + Math.random() * 65;
            particles.push({ x: strike.contact[0], y: strike.contact[1],
              vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 15,
              age: 0, life: 0.25 + Math.random() * 0.25,
              size: 0.6 + Math.random() * 0.6, glint: i === 0 });
          }
        }
        const exposure = age < 38 ? 1 : Math.exp(-(age - 38) / 42);
        // The discharge illuminates the fill itself: a narrow reflected hot
        // strip with feathered ends, exactly on the bar surface. Its surrounding
        // bloom is horizontal, so the bolt reads as charge inside the material.
        const reflection = ctx.createLinearGradient(strike.origin, 0, strike.finish, 0);
        reflection.addColorStop(0, "transparent");
        reflection.addColorStop(0.3, tint);
        reflection.addColorStop(0.7, white);
        reflection.addColorStop(1, "transparent");
        ctx.fillStyle = reflection;
        ctx.globalAlpha = exposure * strike.power * 0.8;
        ctx.fillRect(strike.origin, height / 2 - barHeight / 2,
          strike.finish - strike.origin, barHeight);
        for (const [path, weight] of [[strike.main, 1], [strike.fork, 0.42]] as const) {
          ctx.strokeStyle = tint;
          ctx.lineWidth = 11 * weight;
          ctx.globalAlpha = exposure * strike.power * 0.12; ctx.stroke(path);
          ctx.lineWidth = 5.5 * weight;
          ctx.globalAlpha = exposure * strike.power * 0.8; ctx.stroke(path);
          ctx.strokeStyle = white;
          ctx.lineWidth = 3 * weight;
          ctx.globalAlpha = exposure * strike.power; ctx.stroke(path);
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) { particles.splice(i, 1); continue; }
        p.vx *= Math.exp(-3 * dt); p.vy += 70 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        const alpha = Math.pow(1 - p.age / p.life, 1.5);
        ctx.globalAlpha = alpha * 0.65;
        const radius = p.size * 4;
        ctx.drawImage(sprite, p.x - radius, p.y - radius, radius * 2, radius * 2);
        ctx.globalAlpha = alpha; ctx.strokeStyle = tint; ctx.lineWidth = p.size * 0.7;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); ctx.stroke();
        ctx.fillStyle = white; ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
        if (p.glint) {
          ctx.globalAlpha = alpha * Math.pow(Math.sin(Math.PI * p.age / p.life), 4);
          ctx.fillRect(p.x - 3, p.y - 0.35, 6, 0.7);
          ctx.fillRect(p.x - 0.35, p.y - 3, 0.7, 6);
        }
      }
      ctx.globalAlpha = 1;
      if (elapsed < duration || particles.length) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    }
    frame = requestAnimationFrame(draw);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", preference);
    };
  }, [trackRef, fromPercent, toPercent, color]);

  return <canvas ref={canvasRef} aria-hidden="true" data-spark-kind={fromPercent === toPercent ? "idle" : "growth"}
    className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 motion-reduce:hidden"
    style={{ height: 88 }} />;
}
