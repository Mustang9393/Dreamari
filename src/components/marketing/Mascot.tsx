"use client";

import Image from "next/image";
import { type RefObject, useEffect, useRef } from "react";

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
      // The stage is position:FIXED to the viewport's bottom edge (see the stage
      // element) — that is what finally guarantees "the screen's limit does the
      // cut" on every screen size. Two earlier hero-anchored versions each failed
      // on some class of device: pinning to the hero's bottom puts the crop line
      // wherever the hero happens to end (mid-screen on tall viewports, below the
      // fold on small phones whose hero content exceeds 100dvh), and no exit-fade
      // retiming can fix an anchor that simply isn't the screen edge. Fixed
      // positioning makes the viewport itself the anchor: at page top Dreamy
      // peeks from the actual bottom bezel on ANY device, and this exit ducks
      // him back down THROUGH that same edge as the reader scrolls on — so the
      // cut is the screen's, always, by construction.
      //
      // progress: 0 while the hero's bottom edge is at/below the fold (reader is
      // still inside the hero — Dreamy stays pinned and solid); ramps to 1 as
      // that edge climbs the first ~32% of the viewport past the fold, sinking
      // him by his own visible height (fully below the bezel) before the next
      // section's content reaches his strip. Anything that overlaps momentarily
      // paints above him (later DOM order), and he's translucent by then.
      const vh = window.innerHeight || 1;
      // The duck is timed off Build's MEASURED arrival, and the trigger is the
      // VIEWPORT BOTTOM, not Dreamy's own head: progress stays 0 until Build's
      // section top actually crosses the fold, then ramps to 1 over half a
      // stage-height of further scroll. The previous version led by 0.9x the
      // stage height from his head's position — fine at 264px, but once his size
      // became dvh-aware (372px+ on tall phones) that lead grew so long he was
      // fully dissolved while Build was still hundreds of px below the fold,
      // leaving a stretch of pure void with NO Dreamy in it (reported twice from
      // a tall iPhone; the math checks out — progress hit 1 with Build ~600px
      // away). Anchoring the start to "Build is visibly entering the screen"
      // means he holds the bezel through the entire empty traversal by
      // definition, on every screen size, and only tucks away while the reader
      // can SEE what he's making room for.
      const buildTop = document.getElementById("build")?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      // Fade span is 70% of the VIEWPORT, not half a stage-height: the old
      // 0.5*stage span finished the duck when Build had barely peeked over the
      // fold (~230px in), leaving the rest of the approach blank again (third
      // report of the void, both scroll directions). Now progress hits 1 only
      // once Build's top has climbed 70% of the screen — Dreamy stays visibly
      // present for the entire traversal and hands off exactly as Build's
      // content takes over the viewport. Symmetric by construction on the way
      // back up.
      const progress = Math.min(1, Math.max(0, (vh - buildTop) / (vh * 0.7)));
      const sinkPx = progress * stage.offsetHeight * VISIBLE_FRACTION;
      stage.style.opacity = String(1 - progress);
      stage.style.transform = `translate(-50%, ${(1 - VISIBLE_FRACTION) * 100}%) translateY(${sinkPx}px)`;
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

  // ---- page-wide cursor tracking for the cloud's BODY language only (a lean
  // toward the cursor, a puff on excitement) -- the eyes stay exactly as
  // baked into the real artwork, not re-drawn/re-aimed on canvases layered
  // over them, per direct instruction to use the plain "OG" mascot image
  // even though that means the eyes themselves no longer track the cursor. ----
  useEffect(() => {
    const wrap = tiltRef.current?.parentElement;
    const tilt = tiltRef.current;
    if (!wrap || !tilt) return;

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
    let rafId = 0;

    function tick(now: number) {
      rafId = requestAnimationFrame(tick);
      if (!wrap || !tilt) return;

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

      // Body language: the whole cloud leans toward the cursor (a few px of
      // translate + a slight cartoon z-tilt in the lean's direction) and
      // puffs up a touch as excitement rises. All of this happens INSIDE the
      // masked float wrapper, so the bottom dissolve stays glued to the
      // artwork no matter how far it leans. Kept to single-digit px/degrees:
      // past that the lean starts reading as the sticker sliding around its
      // frame instead of a character shifting its weight.
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

  return (
    <div
      ref={stageRef}
      // --mascot-size comes from tokens.css (.marketing-v2), which also shrinks it on
      // short viewports via media queries — not set inline here, so Hero.tsx's reserved
      // padding (calc(var(--mascot-size) * .62 + 28px)) always matches automatically.
      // `fixed`, not absolute-in-hero: the ONLY anchor that is the screen's bottom
      // edge on every device (see the exit effect's comment for the full story).
      // No ancestor between here and the viewport has a transform/filter, so the
      // fixed containing block really is the viewport; the hero's overflow-hidden
      // no longer crops this element at all — the viewport edge itself is the
      // crop, which is exactly the point. Hidden along with the whole student
      // <main> when the Schools view is active (display:none propagates).
      className="pointer-events-none fixed bottom-0 left-1/2 z-[1] [transform:translate(-50%,23%)] [width:var(--mascot-size)] [height:var(--mascot-size)]"
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
        // Fade band deliberately COMPLETES BELOW the bezel (83% > the 77% visible
        // cut): earlier the band finished at 76.5%, i.e. alpha hit zero a hair above
        // the screen edge — technically seamless, but perceptually the mist "ended"
        // 20-30px early against a dark background and Dreamy read as hovering above
        // the border (reported from an iPhone with a screenshot). Running the ramp
        // 71% -> 83% leaves ~50% opacity AT the bezel, so the physical screen edge
        // itself makes the final, visible cut — which is the entire point of the
        // fixed-to-viewport design. Everything below 77% is off-screen anyway.
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 71%, transparent 83%)",
        maskImage: "linear-gradient(to bottom, black 0%, black 71%, transparent 83%)",
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
        </div>
      </div>
    </div>
  );
}

export { VISIBLE_FRACTION };
