"use client";

import Image from "next/image";
import { type RefObject, useEffect, useRef } from "react";

// Measured directly from public/images/hero-cloud-mascot.png (1200x1200): the two dark
// starry eye ellipses sit at these percentages of the image's own bounding box (ending
// at 61.33%). Mouth starts at y=63.5% — 63% was the old crop line, kept tight enough to
// never show any of the mouth. Per direct feedback ("I don't see enough of it"), pushed
// to 70% instead: this does let the very top of the mouth peek in, but the tradeoff of
// "more of the character actually visible" was worth it over "technically zero mouth."
const EYE_LEFT = { left: 25.17, top: 42.17, width: 16.83, height: 19.16 };
const EYE_RIGHT = { left: 58.17, top: 42.17, width: 16.83, height: 19.16 };
// 0.77, up from 0.7 — per direct feedback the crop should show eyes AND the full
// mouth before the dissolve takes over. Measured from the PNG's actual pixels: the
// mouth spans 63.42%..68.83% of the artwork, so a 70% crop with the fade completing
// at 69.5% was dissolving the mouth itself — only the upper head read as solid. At
// 0.77 the fade band (69.5%..76.5%, see the mask below) sits fully BELOW the mouth:
// eyes and mouth solid, chin/body dissolving, bottom ~15% of the cloud (raster ends
// at 84.67%) still cropped so it keeps reading as a peek.
const VISIBLE_FRACTION = 0.77;

type MascotProps = {
  heroRef: RefObject<HTMLElement | null>;
};

export function Mascot({ heroRef }: MascotProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const sheenRef = useRef<HTMLDivElement | null>(null);
  const eyeLeftRef = useRef<HTMLDivElement | null>(null);
  const eyeRightRef = useRef<HTMLDivElement | null>(null);
  const canvasLeftRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRightRef = useRef<HTMLCanvasElement | null>(null);

  // ---- hero exit: sinks away + fades as the page scrolls from the hero into the next
  // section, driven straight off scroll position rather than a fixed-duration animation. ----
  useEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    if (!stage || !hero) return;

    let ticking = false;
    function update() {
      ticking = false;
      if (!stage || !hero) return;
      // Exit progress comes from where the hero's bottom edge actually sits in
      // the viewport, NOT from raw scrollY. The scrollY version assumed Dreamy is
      // on screen at scroll position 0 and gone by ~62% of the hero's height —
      // true on desktop, badly false on phones, where the hero's content column
      // is about as tall as the screen: Dreamy started at/below the fold, and by
      // the time a reader scrolled down to where he was, the scrollY-driven fade
      // had already dissolved him — leaving his entire reserved region as a big
      // blank purple void between the CTA and Build (reported directly, with a
      // screenshot). Anchoring to the hero's bottom edge means: while his strip
      // is still at the viewport's bottom border, progress is 0 and he's fully
      // there; he only starts sinking/fading as his region genuinely lifts away
      // from the border, finishing by the time the hero's bottom has climbed 70%
      // of the screen. Works identically wherever the fold lands relative to the
      // hero on any device.
      const heroBottom = hero.getBoundingClientRect().bottom;
      const vh = window.innerHeight || 1;
      // Dead zone, then exit: progress stays 0 until the hero's bottom edge has
      // climbed past 55% of the viewport (Dreamy fully solid the whole time his
      // strip is in the lower/middle of the screen — the first version of this
      // started fading immediately and he was gone while still mid-screen, which
      // recreated a shorter version of the same blank-region complaint), then
      // ramps to fully faded as the edge reaches ~8% from the top — dissolving
      // exactly while his region actually exits.
      const progress = Math.min(1, Math.max(0, (0.55 * vh - heroBottom) / (0.47 * vh)));
      stage.style.opacity = String(1 - progress);
      stage.style.transform = `translate(-50%, ${(1 - VISIBLE_FRACTION) * 100}%) translateY(${progress * 60}px) scale(${1 - progress * 0.24})`;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    // The one-shot mount call above can run before layout settles (fonts swap in,
    // the hero's min-h resolves, images load) and then nothing re-runs it until
    // the first scroll — which left Dreamy stuck at a stale mid-fade opacity on
    // load (caught at 0.6 on a mobile viewport). Observing the hero's size means
    // every layout settle recomputes the exit progress, so the load state is
    // always current, not a snapshot of pre-hydration geometry.
    const heroResize = new ResizeObserver(onScroll);
    heroResize.observe(hero);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      heroResize.disconnect();
    };
  }, [heroRef]);

  // ---- iris artwork: drawn once per eye onto its canvas, a dark starry gradient with a
  // highlight, matching the baked-in eye tone already painted into the mascot artwork so
  // the animated iris reads as the SAME eye rather than a mismatched patch. ----
  useEffect(() => {
    function drawIris(canvas: HTMLCanvasElement | null) {
      if (!canvas) return;
      const size = 300;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const g = ctx.createRadialGradient(size * 0.5, size * 0.36, size * 0.04, size * 0.5, size * 0.5, size * 0.58);
      g.addColorStop(0, "#2a4a80");
      g.addColorStop(0.55, "#0e1c3f");
      g.addColorStop(1, "#050a1c");
      // Fills the full square, not just the inscribed circle, so a shift that outruns
      // the overhang exposes more of this same dark tone instead of a blank corner.
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 55; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const d = Math.hypot(x - size / 2, y - size / 2);
        if (d > size * 0.48) continue;
        ctx.globalAlpha = Math.random() * 0.8 + 0.15;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.6 + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#f4f8ff";
      ctx.beginPath();
      ctx.ellipse(size * 0.36, size * 0.34, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.translate(size * 0.62, size * 0.58);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.05);
      ctx.lineTo(size * 0.014, -size * 0.014);
      ctx.lineTo(size * 0.05, 0);
      ctx.lineTo(size * 0.014, size * 0.014);
      ctx.lineTo(0, size * 0.05);
      ctx.lineTo(-size * 0.014, size * 0.014);
      ctx.lineTo(-size * 0.05, 0);
      ctx.lineTo(-size * 0.014, -size * 0.014);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    drawIris(canvasLeftRef.current);
    drawIris(canvasRightRef.current);
  }, []);

  // ---- page-wide, direction-aware cursor tracking: computes the real angle from the
  // mascot's on-screen center to the cursor so the eyes point the correct direction no
  // matter where on the page the character sits. ----
  useEffect(() => {
    const wrap = tiltRef.current?.parentElement;
    const tilt = tiltRef.current;
    const eyeLeftEl = eyeLeftRef.current;
    const eyeRightEl = eyeRightRef.current;
    if (!wrap || !tilt || !eyeLeftEl || !eyeRightEl) return;

    const pointerFine = window.matchMedia("(pointer:fine)").matches;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 3;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;
    let lastMoveT = performance.now();
    let speed = 0;

    function onMouseMove(e: MouseEvent) {
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveT);
      const d = Math.hypot(e.clientX - lastMouseX, e.clientY - lastMouseY);
      speed = speed * 0.7 + (d / dt) * 0.3;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      lastMoveT = now;
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    if (pointerFine) window.addEventListener("mousemove", onMouseMove);

    let curX = 0;
    let curY = 0;
    let curExcite = 0;
    let blinkT = performance.now() + 1800 + Math.random() * 2500;
    let blinking = false;
    let blinkStart = 0;
    let blinkDur = 190;
    let queuedBlink = false;
    let rafId = 0;

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (!wrap || !tilt || !eyeLeftEl || !eyeRightEl) return;

      let tx = 0;
      let ty = 0;
      let distFactor = 0.3;
      if (pointerFine) {
        const r = wrap.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.42;
        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const reach = Math.max(280, r.width * 0.9);
        tx = Math.max(-1, Math.min(1, dx / reach));
        ty = Math.max(-1, Math.min(1, dy / reach));
        const dist = Math.hypot(dx, dy);
        distFactor = Math.max(0, 1 - dist / 900);
      } else {
        const t = now * 0.001;
        tx = Math.sin(t * 0.5) * 0.8;
        ty = Math.sin(t * 0.35) * 0.45;
      }

      curX += (tx - curX) * 0.22;
      curY += (ty - curY) * 0.22;

      const speedExcite = Math.min(1, speed * 2.2);
      const targetExcite = Math.max(speedExcite, distFactor * 0.6);
      curExcite += (targetExcite - curExcite) * 0.08;
      speed *= 0.94;

      const maxShift = eyeLeftEl.clientWidth * 0.34;
      const txPx = curX * maxShift;
      const tyPx = curY * maxShift * 0.85;
      const eyeScale = 1 + curExcite * 0.16;

      let blinkScale = 1;
      if (!blinking && now > blinkT) {
        blinking = true;
        blinkStart = now;
        blinkDur = 160 + Math.random() * 70;
        queuedBlink = Math.random() < 0.22;
      }
      if (blinking) {
        const p = (now - blinkStart) / blinkDur;
        if (p >= 1) {
          blinking = false;
          if (queuedBlink) {
            queuedBlink = false;
            blinkT = now + 140;
          } else {
            blinkT = now + 2200 + Math.random() * 4200;
          }
        } else {
          blinkScale = Math.max(0.04, p < 0.5 ? 1 - p * 2 : (p - 0.5) * 2);
        }
      }

      [canvasLeftRef.current, canvasRightRef.current].forEach((c) => {
        if (c) c.style.transform = `translate(${txPx}px, ${tyPx}px) scale(${eyeScale}) scaleY(${blinkScale / eyeScale})`;
      });

      // Body language, not just eye tracking: the whole cloud leans toward the
      // cursor (a few px of translate + a slight cartoon z-tilt in the lean's
      // direction) and puffs up a touch as excitement rises — the same curExcite
      // the eyes already use, so body and eyes react as one creature rather than
      // two independent systems. All of this happens INSIDE the masked float
      // wrapper, so the bottom dissolve stays glued to the artwork no matter how
      // far it leans. Kept to single-digit px/degrees: past that the lean starts
      // reading as the sticker sliding around its frame instead of a character
      // shifting its weight.
      const rotY = curX * 9;
      const rotX = -curY * 6.5;
      const leanX = curX * 7;
      const leanY = curY * 4;
      const rotZ = curX * 2.2;
      const puff = 1 + curExcite * 0.03;
      tilt.style.transform = `translate(${leanX}px, ${leanY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${puff})`;

      // Parallax depth layers (see the sheen element's comment): the ambient glow
      // is the FARTHEST layer so it drifts against the cursor, the body lean above
      // is the middle layer, and the surface sheen is the NEAREST so its hotspot
      // travels furthest with the cursor. Three rates of motion from one input is
      // what sells the depth.
      if (glowRef.current) glowRef.current.style.transform = `translate(${-curX * 9}px, ${-curY * 6}px)`;
      if (sheenRef.current) sheenRef.current.style.backgroundPosition = `${50 + curX * 28}% ${40 + curY * 22}%`;
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      if (pointerFine) window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const socketBase =
    "absolute overflow-hidden rounded-full pointer-events-none [background:radial-gradient(ellipse_at_50%_40%,#16264a_0%,#0d1730_62%,#05070f_100%)]";
  // Canvas overhangs the round socket by comfortably more than maxShift (0.34 of the
  // socket's own width) can ever travel — 260%/-80% leaves wide margin over that, so an
  // off-center shift never exposes the socket's own background at the edge (this is the
  // documented failure mode: a thin margin here reads as a "closed" or glitched eye at
  // off-center angles, worse on real browsers than in headless testing).
  const canvasClass = "absolute [width:260%] [height:260%] [left:-80%] [top:-80%] [transition:transform_.04s_linear]";

  return (
    <div
      ref={stageRef}
      // --mascot-size comes from tokens.css (.marketing-v2), which also shrinks it on
      // short viewports via media queries — not set inline here, so Hero.tsx's reserved
      // padding (calc(var(--mascot-size) * .62 + 28px)) always matches automatically.
      className="pointer-events-none absolute bottom-0 left-1/2 z-[1] [transform:translate(-50%,23%)] [width:var(--mascot-size)] [height:var(--mascot-size)]"
      // The organic bottom dissolve — ENVIRONMENTAL, on this static stage, not on the
      // float wrapper inside it. Per direct feedback (with a phone screenshot to
      // prove it): a mask glued to the float wrapper travels WITH the bob, so the
      // faded chin rose mid-air with the character, reading as "the object has a
      // black fade painted on it." The fade belongs to the frame: static in stage
      // space, so as Dreamy bobs up through it more of him becomes visible, and as
      // he settles back down the band swallows the chin again — mist at the frame's
      // limit, not a stain on the character. Geometry (percentages of the stage
      // box): the scroll-exit effect translates the stage down by
      // (1 - VISIBLE_FRACTION), so the hero's overflow:hidden crops at exactly
      // VISIBLE_FRACTION (77%) of the stage; eyes end at 61.33%, mouth spans
      // 63.42..68.83% (measured from the PNG). Fade runs 69.5% -> 76.5%: eyes and
      // full mouth solid at the float's base, dissolve completes just before the
      // crop, and since the float only bobs UP from base, artwork can never carry
      // opacity past the crop line. A static mask on this stage is only safe
      // because the Image no longer has its drop-shadow filter (mask clips filter
      // output to the masked box — the old shadow painted past it and rendered as
      // a rectangular halo; that was the original reason the mask got moved onto
      // the float wrapper at all).
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 69.5%, transparent 76.5%)",
        maskImage: "linear-gradient(to bottom, black 0%, black 69.5%, transparent 76.5%)",
      }}
    >
      <div className="absolute inset-0 [animation:mkt-mascot-float_5.5s_ease-in-out_infinite]">
        {/* Ambient glow lives INSIDE the masked float wrapper, not as a stage-level
           sibling — as a sibling it escaped the mask, still reached past the hero's
           70% crop line at faint opacity, and hard-clipped there as a hairline seam
           across the mascot's chin (caught on mobile, where the vivid page gradient
           makes any clipped glow edge visible). In here it inherits the same bottom
           dissolve as the artwork and bobs with the float, which also reads more
           physically coherent than a glow pinned in place under a moving character. */}
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute rounded-full blur-[24px] [background:radial-gradient(circle,rgba(47,107,242,.28),transparent_60%)]"
          style={{ inset: "6%" }}
        />
        {/* No transform-style:preserve-3d — this element's own rotateX/rotateY tilt
            doesn't need real relative depth for its children, just a flat rotated
            plane. Nesting the eyes' circular overflow:hidden clip inside a live 3D
            rendering context is known to clip inconsistently on real browsers
            (Chrome/Safari both), exposing the socket background at off-center angles —
            a bug that doesn't reproduce in headless testing. */}
        <div
          ref={tiltRef}
          className="relative h-full w-full [transition:transform_.08s_linear] [will-change:transform]"
        >
          <Image
            src="/images/hero-cloud-mascot.png"
            alt="Dreamari mascot, a friendly cloud character"
            fill
            sizes="460px"
            className="pointer-events-none object-contain select-none"
            priority
          />
          {/* Parallax lighting sheen — the "pseudo-3D" pass, chosen over a real
             modeled 3D character per direct request ("parallax for the style").
             A soft light spot that travels WITH the cursor across the cloud's
             surface (the glow layer behind travels AGAINST it — see the tick), so
             three layers move at three different rates: glow behind, body lean in
             the middle, light on the surface. The div is masked by the mascot
             PNG's own alpha channel, so the light lands ONLY on the cloud's
             silhouette — never a rectangular glow over the background — and the
             artwork's pixels stay untouched (soft-light blend just modulates
             them). Driven per-frame via backgroundPosition (the gradient is
             oversized to 220% so the hotspot can wander well off-center without
             its own edge showing). Sits under the eye sockets so the glossy eye
             canvases keep their own baked lighting. */}
          <div
            ref={sheenRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(196,218,255,0.9) 0%, rgba(150,186,255,0.35) 30%, transparent 58%)",
              backgroundSize: "220% 220%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "50% 40%",
              mixBlendMode: "soft-light",
              WebkitMaskImage: "url(/images/hero-cloud-mascot.png)",
              maskImage: "url(/images/hero-cloud-mascot.png)",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
          <div
            ref={eyeLeftRef}
            className={socketBase}
            style={{ left: `${EYE_LEFT.left}%`, top: `${EYE_LEFT.top}%`, width: `${EYE_LEFT.width}%`, height: `${EYE_LEFT.height}%` }}
          >
            <canvas ref={canvasLeftRef} className={canvasClass} />
          </div>
          <div
            ref={eyeRightRef}
            className={socketBase}
            style={{ left: `${EYE_RIGHT.left}%`, top: `${EYE_RIGHT.top}%`, width: `${EYE_RIGHT.width}%`, height: `${EYE_RIGHT.height}%` }}
          >
            <canvas ref={canvasRightRef} className={canvasClass} />
          </div>
        </div>
      </div>
    </div>
  );
}

export { VISIBLE_FRACTION };
