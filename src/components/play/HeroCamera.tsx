"use client";

// A camera on a hero image. Chandu, 5 Oct 2026, on AMT's tool-drawer photo:
// "zoom into the toolbox when that beat happens so that can also solve the
// problem of it being hidden by the boxes", and "outline the empty tool
// slot, have it pulse and then show the options to select which tool is
// missing", with "the drawer being the dominant thing".
//
// A beat frames part of its picture (`Beat.artFrame.focus`): the camera
// pushes in until that region fills the space above the dialogue box, and
// can ring one spot (`highlight`). Beats that share the picture and frame
// hold the shot. The image is the photo's own aspect (`ratio`), never a
// re-cropped copy, so a spot given as a fraction of it stays on that spot.

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Beat } from "./types";

type Frame = NonNullable<Beat["artFrame"]>;
type Box = { left: number; top: number; width: number; height: number };

const EASE = [0.16, 1, 0.3, 1] as const;

/** The image's cover rectangle in a cw x ch viewport; with a focus, scaled
 *  until the region is `fill` of the screen's height (or the screen's
 *  width, whichever comes first) and moved so it sits centred at `toY`.
 *  It never uncovers the top or sides; the bottom may lift by `lift`. */
export function frameBox(cw: number, ch: number, frame: Frame, focused: boolean): Box {
  const W = Math.max(cw, ch * frame.ratio);
  const H = W / frame.ratio;
  const f = frame.focus;
  if (!f || !focused) return { left: (cw - W) / 2, top: (ch - H) / 2, width: W, height: H };
  const scale = Math.max(1, Math.min((cw * 1.05) / ((f.x1 - f.x0) * W), (ch * (f.fill ?? 0.45)) / ((f.y1 - f.y0) * H)));
  const ws = W * scale;
  const hs = H * scale;
  let left = cw / 2 - ((f.x0 + f.x1) / 2) * ws;
  let top = ch * (f.toY ?? 0.38) - ((f.y0 + f.y1) / 2) * hs;
  left = Math.min(0, Math.max(cw - ws, left));
  top = Math.min(0, Math.max(ch * (1 - (f.lift ?? 0)) - hs, top));
  return { left, top, width: ws, height: hs };
}

function useViewport() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

/** The picture, framed. Mounts at the full cover and pushes in, so arriving
 *  reads as a camera move, not a cut. Used in place of SceneLayers when a
 *  beat carries an `artFrame`. */
export function HeroCamera({ src, alt, frame, onReady }: { src: string; alt: string; frame: Frame; onReady?: () => void }) {
  const { ref, size } = useViewport();
  const box = size ? frameBox(size.w, size.h, frame, true) : null;
  const start = size ? frameBox(size.w, size.h, frame, false) : null;
  const lifted = Boolean(frame.focus?.lift);
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {box && start && (
        <motion.div className="absolute" initial={start} animate={box} transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}>
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="200vw"
            className="object-cover"
            // Lifted off the bottom edge: fade into the strip behind the box.
            style={lifted ? { maskImage: "linear-gradient(to bottom, black 88%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 88%, transparent)" } : undefined}
            onLoad={onReady}
          />
          {frame.highlight && <SlotOutline spot={frame.highlight} />}
        </motion.div>
      )}
    </div>
  );
}

const RING = "var(--world-building-construction)";

/** The outline of one spot, traced as a pill (AMT: the wrench-shaped empty
 *  slot), drawn in once the camera has landed, then breathing. */
function SlotOutline({ spot }: { spot: NonNullable<Frame["highlight"]> }) {
  const place = { left: `${(spot.x - spot.rx) * 100}%`, top: `${(spot.y - spot.ry) * 100}%`, width: `${spot.rx * 200}%`, height: `${spot.ry * 200}%` };
  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute rounded-full border-[3px]"
        style={{
          ...place,
          borderColor: RING,
          boxShadow: `0 0 22px 2px color-mix(in srgb, ${RING} 75%, transparent), inset 0 0 16px color-mix(in srgb, ${RING} 55%, transparent)`,
        }}
        initial={{ opacity: 0, scale: 1.25 }}
        animate={{ opacity: [0, 1, 0.55, 1], scale: [1.25, 1, 1, 1] }}
        transition={{ duration: 2.4, delay: 1.4, times: [0, 0.3, 0.65, 1], repeat: Infinity, repeatDelay: 0.2 }}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute rounded-full border-2"
        style={{ ...place, borderColor: RING }}
        initial={{ opacity: 0 }}
        animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
        transition={{ duration: 1.8, delay: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
    </>
  );
}
