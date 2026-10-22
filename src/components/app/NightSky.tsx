"use client";

// The night sky behind the Black & Blue look (src/app/look-v2.css), dark mode
// only (19 Oct 2026). Joshua: the black-and-blue look "feels slightly
// gloomy... explore ways to make it feel more aspirational, uplifting, and
// immersive". Chandu: "flowy tiny stars sprinkled across the background... in
// the same blue... Not star shaped but flowy dots etc realistic without
// clashing with the UI", and "I dont want to lift the black directly into
// navy": the ground stays black and the sky comes from light.
//
// Second pass, same day (Chandu: "the stars look a little too random, dont
// feel like actual stars, maybe the motion is reading more like pixie dust").
// The first pass behaved like particles: every dot swayed and drifted on a
// current, brightness was spread evenly, every dot had a soft halo and all of
// them pulsed. Real stars:
//   - don't wander: the whole sky only turns, imperceptibly (a slow drift of
//     the field, no per-dot motion);
//   - follow a steep brightness curve: most are pinpoints near the edge of
//     seeing, a few are bright, and only the bright ones carry a halo;
//   - scintillate, not pulse: only brighter stars twinkle, irregularly (two
//     unrelated sines multiplied), dim ones hold steady;
//   - aren't uniform: they sit in the upper sky and thin out toward the
//     horizon (third pass, 20 Oct: only near the top, gone by halfway down,
//     fewer and dimmer: "not EVERYWHERE", "tone it down a little bit more"),
//     a little thinner under the header bloom.
// Colours: mostly white and ice, a few in the sky blues.
//
// Cost: one canvas, two pre-rendered sprites (no shadowBlur, no CSS filter on
// a moving layer), ~30fps, paused in hidden tabs, drawn once and frozen for
// reduced motion, and stopped entirely outside dark Black & Blue.
//
// Calm mode and moments (20 Oct 2026, counselor v7; Chandu: "can we make the
// stars move or react in a cool way somehow when there is a valuable
// interaction made?", alongside "more translucent/blurred" surfaces). With
// `calm` the sky holds still: no drift, no twinkle, drawn once, so frosted
// glass over it costs the GPU nothing frame to frame (the Glossary Lab perf
// rule: no persistent backdrop blur over an animated layer). A valuable
// action calls skyMoment(): a wave of light runs through the sky from where
// it happened, the stars it passes brighten and ease outward, and a big
// moment adds one shooting star. The sky animates only for those ~2s, then
// is still again. Off for reduced motion.
//
// Lively (21 Oct 2026, the landing page; Chandu: "add the stars to the landing
// page too but have them be more animated and engaging but not distracting").
// Three quiet layers on top of the same sky, none of them per-dot wandering:
//   - depth: the field leans a few px away from the cursor, bright (near)
//     stars further than faint (far) ones, so the sky has real parallax;
//   - a shooting star now and then (every 9-17s, never on a timer you can
//     feel), thin and gone in under a second;
//   - the sky turns a touch faster and the bright stars twinkle a little more.
// Still one canvas at ~30fps, paused in hidden tabs, still for reduced motion.
import { useEffect, useRef } from "react";
import { SKY_EVENT } from "@/lib/sky";

type Moment = {
  x: number; big: boolean; t0: number;
  /** lively: a shooting star with no wave of light */ shotOnly?: boolean;
  /** an arrival's own shape (a page load): ring speed in px/ms, ring width in px, strength 0..1.3; actions use the defaults */
  speed?: number; width?: number; strength?: number;
};
const MOMENT_EVENT = SKY_EVENT;

export { skyMoment } from "@/lib/sky";
import { SKY_ARRIVAL_EVENT } from "@/lib/sky";

const TINTS = [
  { rgb: "255, 255, 255", weight: 0.42 },
  { rgb: "224, 236, 254", weight: 0.34 },
  { rgb: "178, 210, 251", weight: 0.16 },
  { rgb: "120, 175, 250", weight: 0.08 },
] as const;

type Star = {
  x: number; y: number;
  b: number; // brightness 0..1 (steep curve: most near 0)
  tint: number;
  s1: number; s2: number; p1: number; p2: number; // scintillation
};


/** A crisp point (core) or a soft glow (halo), both white; tinted on draw. */
function sprite(rgb: string, kind: "core" | "halo"): HTMLCanvasElement {
  const size = kind === "core" ? 8 : 32;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  if (kind === "core") {
    grad.addColorStop(0, `rgba(${rgb}, 1)`);
    grad.addColorStop(0.45, `rgba(${rgb}, 0.9)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
  } else {
    grad.addColorStop(0, `rgba(${rgb}, 0.5)`);
    grad.addColorStop(0.25, `rgba(${rgb}, 0.16)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

function pickTint(): number {
  let t = Math.random();
  for (let i = 0; i < TINTS.length; i++) {
    t -= TINTS[i].weight;
    if (t <= 0) return i;
  }
  return 0;
}

export function NightSky({ calm = false, contained = false, lively = false }: { calm?: boolean; /** sized to its box, not the window (the Edit My Build sheet); no wake-up wave */ contained?: boolean; /** the landing page: cursor parallax and the odd shooting star (see above) */ lively?: boolean } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cores = TINTS.map((t) => sprite(t.rgb, "core"));
    const halos = TINTS.map((t) => sprite(t.rgb, "halo"));
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let offset = 0; // the sky's slow turn, as a horizontal drift in px
    let running = false;
    let moments: Moment[] = [];
    let animating = false; // calm mode: only while a moment plays
    const MOMENT_MS = 2000;
    let lastArrival = 0;
    // lively: the eased cursor lean (-1..1) and the next unprompted shooting star
    let leanX = 0, leanY = 0, aimX = 0, aimY = 0;
    let nextShot = performance.now() + 4000 + Math.random() * 5000;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      aimX = (e.clientX / window.innerWidth) * 2 - 1;
      aimY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // lively fills its section (the landing hero runs past the fold), not the window
      const box = contained || lively ? canvas.parentElement : null;
      width = box ? box.clientWidth : window.innerWidth;
      height = box ? box.clientHeight : window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Stars live in the upper sky only (20 Oct 2026, Chandu: "a little too
      // much... Lets have it be there near the top but not EVERYWHERE", then
      // "tone it down a little bit more"): placed in the top half of the
      // screen, densest near the top, about a third fewer than the first
      // pass, and faded out by visibility() below.
      const SKY = 0.5;
      const count = Math.min(140, Math.round((width * height * SKY) / 6500));
      stars = Array.from({ length: count }, () => {
        // a few more toward the very top, like a sky above a lit horizon
        const y = height * SKY * Math.pow(Math.random(), 1.35);
        const x = Math.random() * width;
        return {
          x,
          y,
          b: Math.pow(Math.random(), 3.4),
          tint: pickTint(),
          s1: 1.1 + Math.random() * 2.2,
          s2: 0.7 + Math.random() * 1.6,
          p1: Math.random() * Math.PI * 2,
          p2: Math.random() * Math.PI * 2,
        };
      });
    };

    // A 0..1 multiplier: full strength in the top 15%, a smooth fade to
    // nothing by halfway down (so the middle and bottom of every screen stay
    // clear), and a little thinner right under the header bloom.
    const visibility = (x: number, y: number) => {
      const t = Math.min(1, Math.max(0, (y - height * 0.15) / (height * 0.35)));
      const fade = 1 - t * t * (3 - 2 * t); // smoothstep
      const dx = (x - width / 2) / (width * 0.42);
      const dy = (y + height * 0.06) / (height * 0.34);
      const bloom = Math.min(1, Math.hypot(dx, dy));
      return fade * (0.55 + 0.45 * bloom);
    };

    const DRIFT = lively ? 0.9 : 0.45; // px per second: the sky turning, not anything flying

    // An arrival (22 Oct 2026): the sky's greeting when a screen opens. The
    // same soft wave the first visit always had (Chandu, after a pass with
    // seven flashier kinds: "the christmas style like flashing is too much
    // on the stars, lets just do the original pulse we had for page loads.
    // but maybe vary it somehow each time"), varied each time: where it
    // starts (the middle, a third in from either edge, or an edge), how
    // fast and wide the ring runs, how strong it is, and now and then a
    // gentler second ripple a beat behind. Never a shooting star; that
    // belongs to actions. The last start point is kept for the session so
    // two loads in a row never greet from the same place.
    const startArrival = () => {
      if (reduce.matches || !stars.length) return;
      const now = performance.now();
      if (now - lastArrival < 800) return; // a mount and a view change at once: one greeting
      lastArrival = now;
      const origins = [0.5, 0.3, 0.7, 0.08, 0.92];
      let prev = -1;
      try { prev = Number(sessionStorage.getItem("dreamari-sky-arrival") ?? -1); } catch { /* storage blocked */ }
      const pool = origins.filter((_, i) => i !== prev);
      const i = Math.floor(Math.random() * pool.length);
      const ox = pool[i];
      try { sessionStorage.setItem("dreamari-sky-arrival", String(origins.indexOf(ox))); } catch { /* storage blocked */ }
      const shape = { speed: 0.6 + Math.random() * 0.5, width: 90 + Math.random() * 80, strength: 0.75 + Math.random() * 0.5 };
      moments.push({ x: width * ox, big: false, t0: now, ...shape });
      if (Math.random() < 0.35) moments.push({ x: width * ox, big: false, t0: now + 420, speed: shape.speed * 0.85, width: shape.width, strength: shape.strength * 0.5 });
      if (calm && !animating) { animating = true; last = 0; raf = requestAnimationFrame(frame); }
    };

    const draw = (time: number, dt: number) => {
      ctx.clearRect(0, 0, width, height);
      if (!calm) offset = (offset + DRIFT * dt) % width;
      // calm: a frozen twinkle phase, so a still sky still reads as stars
      const t = calm ? 0 : time / 1000;
      const now = performance.now();
      if (lively) {
        leanX += (aimX - leanX) * 0.06;
        leanY += (aimY - leanY) * 0.06;
        if (now > nextShot) {
          nextShot = now + 9000 + Math.random() * 8000;
          moments.push({ x: width * (0.35 + Math.random() * 0.6), big: true, t0: now, shotOnly: true });
        }
      }
      moments = moments.filter((m) => now - m.t0 < MOMENT_MS);
      for (const s of stars) {
        let x = s.x + offset;
        if (x > width) x -= width;
        // a moment's wave: a ring of light travelling out from where it
        // happened; a star brightens as the ring passes. Brightness only:
        // the stars hold still (22 Oct 2026, Chandu: "lets not have bouncy
        // stuff happen? just the lights have to get brighter and fade. The
        // stars can remain stationary"); the outward nudge is gone.
        let boost = 0;
        for (const m of moments) {
          if (m.shotOnly) continue;
          const age = now - m.t0;
          if (age < 0) continue; // a ripple waiting its beat
          const r = age * (m.speed ?? 0.85);
          const d = Math.hypot(x - m.x, s.y + 40);
          const ring = Math.exp(-(((d - r) / (m.width ?? 110)) ** 2));
          const fade = Math.max(0, 1 - age / MOMENT_MS);
          const k = ring * fade * (m.big ? 1.5 : 1) * (m.strength ?? 1);
          boost += k;
        }
        // lively: near (bright) stars lean further from the cursor than far ones
        const depth = lively ? 4 + s.b * 14 : 0;
        x -= leanX * depth;
        const y = s.y - leanY * depth * 0.6;
        const vis = visibility(x, y);
        // brightness 0..1 to alpha; faint stars sit near the edge of seeing
        const base = (0.13 + s.b * 0.72) * vis;
        // scintillation: only brighter stars, irregular, never a pulse
        const amp = s.b * (lively ? 0.6 : 0.45);
        const flicker = amp > 0.04
          ? 1 - amp * (0.5 + 0.5 * Math.sin(t * s.s1 + s.p1)) * (0.5 + 0.5 * Math.sin(t * s.s2 + s.p2))
          : 1;
        const alpha = Math.min(1, base * flicker * (1 + boost * 2.2) + boost * 0.25 * vis);
        // a crisp core for every star; a halo only on the bright ones
        const core = (1.1 + s.b * 2.4) * (1 + boost * 0.7);
        ctx.globalAlpha = alpha;
        ctx.drawImage(cores[s.tint], x - core / 2, y - core / 2, core, core);
        if (s.b > 0.35 || boost > 0.3) {
          const halo = 6 + s.b * 12;
          ctx.globalAlpha = Math.min(1, alpha * Math.max(s.b - 0.2, boost * 0.5));
          ctx.drawImage(halos[s.tint], x - halo / 2, y - halo / 2, halo, halo);
        }
      }
      // a big moment: one shooting star from above where it happened, down
      // and away, gone in under a second (a thin line of light, no blur)
      for (const m of moments) {
        if (!m.big) continue;
        const age = now - m.t0;
        if (age > 900) continue;
        const p = age / 900;
        const hx = m.x + 60 - p * 520;
        const hy = height * 0.06 + p * 210;
        const len = 150 * Math.sin(Math.PI * Math.min(1, p * 1.15));
        const tx = hx + len * 0.92;
        const ty = hy - len * 0.37;
        const g = ctx.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.25, "rgba(178,210,251,0.55)");
        g.addColorStop(1, "rgba(120,175,250,0)");
        ctx.globalAlpha = 1 - p * p;
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.drawImage(halos[0], hx - 7, hy - 7, 14, 14);
      }
      ctx.globalAlpha = 1;
    };

    const active = () => root.classList.contains("look-v2") && !root.classList.contains("light");

    const frame = (time: number) => {
      if (calm && !moments.length) {
        // the moment is over: one still frame, then nothing until the next
        animating = false;
        draw(time, 0);
        return;
      }
      raf = requestAnimationFrame(frame);
      // a moment plays at full frame rate; the turning sky needs ~30fps
      if (!calm && time - last < 33) return;
      const dt = last ? Math.min(0.1, (time - last) / 1000) : 0;
      last = time;
      draw(time, dt);
    };

    const sync = () => {
      const want = active() && !document.hidden;
      canvas.style.display = active() ? "block" : "none";
      if (want && !running) {
        running = true;
        // every screen opens with an arrival (22 Oct 2026; was one wake-up
        // wave per browser session). A boxed sky (a sheet) keeps quiet.
        if (!contained) window.setTimeout(startArrival, 350);
        if (reduce.matches || calm) {
          draw(0, 0);
        } else {
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      } else if (!want && running) {
        running = false;
        animating = false;
        cancelAnimationFrame(raf);
      }
    };

    const onMoment = (e: Event) => {
      if (reduce.matches || !running) return;
      const d = (e as CustomEvent<Omit<Moment, "t0">>).detail;
      // a moment's x is the screen's; a boxed sky counts from its own edge
      const left = contained ? canvas.getBoundingClientRect().left : 0;
      moments.push({ x: d.x - left, big: d.big, t0: performance.now() });
      if (calm && !animating) {
        animating = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    window.addEventListener(MOMENT_EVENT, onMoment);
    const onArrival = () => { if (running && !contained) startArrival(); };
    window.addEventListener(SKY_ARRIVAL_EVENT, onArrival);
    if (lively && !calm && window.matchMedia("(pointer: fine)").matches) window.addEventListener("pointermove", onPointer, { passive: true });

    seed();
    sync();
    const onResize = () => {
      seed();
      if ((reduce.matches || calm) && running) draw(0, 0);
    };
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", onResize);
    // a boxed sky follows its box (a sheet sizes after it mounts)
    const boxObserver = (contained || lively) && canvas.parentElement ? new ResizeObserver(onResize) : null;
    if (boxObserver && canvas.parentElement) boxObserver.observe(canvas.parentElement);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      boxObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener(MOMENT_EVENT, onMoment);
      window.removeEventListener(SKY_ARRIVAL_EVENT, onArrival);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [calm, contained, lively]);

  return <canvas ref={canvasRef} aria-hidden data-night-sky className="pointer-events-none absolute inset-0 h-full w-full" style={{ display: "none" }} />;
}
