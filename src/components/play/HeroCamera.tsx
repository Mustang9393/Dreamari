"use client";

// A camera on a hero image. Chandu, 5 Oct 2026, on AMT's tool-drawer photo:
// "zoom into the toolbox when that beat happens so that can also solve the
// problem of it being hidden by the boxes", "outline the empty tool slot,
// have it pulse", "the drawer being the dominant thing", and then: "The
// zoomed view lifts the image up too high. There's so much space between the
// option boxes and the top. Let's zoom tastefully and functionally. And use
// a different highlighter shape and pulse."
//
// So the camera frames a region of the picture (`Beat.artFrame.focus`) into
// the band that is actually free: under the HUD and above the dialogue box,
// measured live, so it re-fits when the box grows from a line to a list of
// choices. It never zooms past `maxScale`, never uncovers the top or sides,
// and lets the picture run on under the box. It can mark one spot
// (`highlight`) with an inspection reticle. Beats that share the picture and
// frame hold the shot. The image is the photo's own aspect (`ratio`), never
// a re-cropped copy, so a spot given as a fraction of it stays on that spot.

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Beat } from "./types";

type Frame = NonNullable<Beat["artFrame"]>;
type Box = { left: number; top: number; width: number; height: number };
type Band = { top: number; bottom: number };

const EASE = [0.16, 1, 0.3, 1] as const;
// Under the HUD's buttons and progress bar.
const HUD_CLEAR = 76;
const GAP = 14;

/** The image's cover rectangle in a cw x ch viewport; with a focus, scaled
 *  so the region fills the free band (never past the screen's width or
 *  `maxScale`) and centred in it. The top and sides stay covered; the
 *  bottom only has to reach a little under the box. */
export function frameBox(cw: number, ch: number, frame: Frame, focused: boolean, band?: Band): Box {
  const W = Math.max(cw, ch * frame.ratio);
  const H = W / frame.ratio;
  const f = frame.focus;
  if (!f || !focused) return { left: (cw - W) / 2, top: (ch - H) / 2, width: W, height: H };
  const top0 = band?.top ?? HUD_CLEAR;
  const bottom0 = band?.bottom ?? ch * 0.55;
  const bandH = Math.max(120, bottom0 - top0 - GAP * 2);
  const scale = Math.max(1, Math.min(f.maxScale ?? 2, (cw * 1.02) / ((f.x1 - f.x0) * W), (bandH * (f.fill ?? 0.94)) / ((f.y1 - f.y0) * H)));
  const ws = W * scale;
  const hs = H * scale;
  let left = cw / 2 - ((f.x0 + f.x1) / 2) * ws;
  let top = (top0 + bottom0) / 2 - ((f.y0 + f.y1) / 2) * hs;
  left = Math.min(0, Math.max(cw - ws, left));
  top = Math.min(0, Math.max(Math.min(ch, bottom0 + 60) - hs, top));
  return { left, top, width: ws, height: hs };
}

function useViewport() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize((s) => (s && s.w === el.clientWidth && s.h === el.clientHeight ? s : { w: el.clientWidth, h: el.clientHeight }));
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

/** Where the dialogue box starts, measured, rounded to 32px steps so a
 *  line typing out doesn't nudge the camera on every new word. */
function useBoxTop(host: React.RefObject<HTMLDivElement | null>) {
  const [top, setTop] = useState<number | null>(null);
  useEffect(() => {
    let raf = 0;
    let observed: Element | null = null;
    const ro = new ResizeObserver(() => measure());
    const measure = () => {
      const el = document.querySelector("[data-dialogue-box]");
      const h = host.current;
      if (!el || !h) return;
      if (el !== observed) {
        if (observed) ro.unobserve(observed);
        ro.observe(el);
        observed = el;
      }
      const t = Math.round((el.getBoundingClientRect().top - h.getBoundingClientRect().top) / 32) * 32;
      setTop((prev) => (prev === t ? prev : t));
    };
    // The box mounts, grows and swaps per beat: keep looking.
    const tick = () => {
      measure();
      raf = window.setTimeout(tick, 400) as unknown as number;
    };
    tick();
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [host]);
  return top;
}

/** The picture, framed. Mounts at the full cover and pushes in, so arriving
 *  reads as a camera move, not a cut. Used in place of SceneLayers when a
 *  beat carries an `artFrame`. */
export function HeroCamera({ src, alt, frame, onReady }: { src: string; alt: string; frame: Frame; onReady?: () => void }) {
  const { ref, size } = useViewport();
  const boxTop = useBoxTop(ref);
  // The push starts one frame after the box first exists, so it always
  // plays from the full cover, never waiting on some later re-render.
  const [pushed, setPushed] = useState(false);
  useEffect(() => {
    if (!size || pushed) return;
    const raf = requestAnimationFrame(() => setPushed(true));
    return () => cancelAnimationFrame(raf);
  }, [size, pushed]);
  // Memoised: the player re-renders many times a second while a line types,
  // and a fresh target object every render kept restarting the push.
  const w = size?.w ?? 0;
  const h = size?.h ?? 0;
  const band = useMemo(() => (boxTop ? { top: HUD_CLEAR, bottom: boxTop } : undefined), [boxTop]);
  const box = useMemo(() => (w && h ? frameBox(w, h, frame, pushed, band) : null), [w, h, frame, pushed, band]);
  const start = useMemo(() => (w && h ? frameBox(w, h, frame, false) : null), [w, h, frame]);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {box && start && (
        <motion.div className="absolute" initial={start} animate={box} transition={{ duration: 1.2, ease: EASE }}>
          <Image src={src} alt={alt} fill priority sizes="200vw" className="object-cover" onLoad={onReady} />
          {frame.highlight && <Reticle spot={frame.highlight} />}
        </motion.div>
      )}
      {/* Under the box the picture sinks into the room's dark, so a lifted
         frame never shows a hard bottom edge. */}
      {frame.focus && boxTop && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ top: boxTop + 24, background: "linear-gradient(180deg, transparent, color-mix(in srgb, var(--background) 92%, transparent) 70%)" }}
        />
      )}
    </div>
  );
}

const MARK = "var(--world-building-construction)";

/** An inspection reticle on one spot (AMT: the empty slot): a warm glow
 *  inside it, and four corner brackets that close in from wide, then
 *  breathe, the way a scanner locks onto a target. */
function Reticle({ spot }: { spot: NonNullable<Frame["highlight"]> }) {
  const place = { left: `${(spot.x - spot.rx) * 100}%`, top: `${(spot.y - spot.ry) * 100}%`, width: `${spot.rx * 200}%`, height: `${spot.ry * 200}%` };
  const corner = "absolute h-[22%] w-[38%] max-h-[26px] max-w-[26px]";
  const line = `3px solid ${MARK}`;
  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute rounded-[40%]"
        style={{ ...place, background: `radial-gradient(closest-side, color-mix(in srgb, ${MARK} 38%, transparent), transparent)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.45, 0.9] }}
        transition={{ duration: 2.6, delay: 1.2, times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute"
        style={{ ...place, filter: `drop-shadow(0 0 6px color-mix(in srgb, ${MARK} 80%, transparent))` }}
        initial={{ opacity: 0, scale: 1.6 }}
        animate={{ opacity: 1, scale: [1.6, 1, 1.06, 1] }}
        transition={{ opacity: { duration: 0.3, delay: 1 }, scale: { duration: 2.2, delay: 1, times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatDelay: 0.6 } }}
      >
        <span className={`${corner} top-0 left-0 rounded-tl-[6px]`} style={{ borderTop: line, borderLeft: line }} />
        <span className={`${corner} top-0 right-0 rounded-tr-[6px]`} style={{ borderTop: line, borderRight: line }} />
        <span className={`${corner} bottom-0 left-0 rounded-bl-[6px]`} style={{ borderBottom: line, borderLeft: line }} />
        <span className={`${corner} right-0 bottom-0 rounded-br-[6px]`} style={{ borderBottom: line, borderRight: line }} />
      </motion.span>
    </>
  );
}
