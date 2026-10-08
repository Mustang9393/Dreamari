"use client";

// A career photo that keeps the face in view in any frame (8 Oct 2026,
// Chandu: "the face detection is not working on the pop up sheets on
// tablet and I'm guessing others for careers in the counselor board...
// I just got cleavage"). The fixed crops (heroFocus) were worked out for one
// desktop and one phone window; sheets, drawers and panels show the same
// photo through other shapes, where a fixed percentage can land on the
// chest. This measures its own box and places the face from the photo's
// face data (career/faceData.ts): the face centre about a third of the way
// down, never cutting the top of the head; in a box taller than the photo,
// the face centred across. Photos without face data use `fallback`.

import Image from "next/image";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { FACE_DATA } from "@/components/career/faceData";

// Vision's face box starts at the brow; the hair above it runs about 35% of
// the face's height. The crop keeps that and a small margin in view, so a
// big face in a short band shows the whole head, not a cut-off scalp.
const HAIR = 0.7; // hair above the face box, as a share of (cy - top)
const CROWN = 0.03; // margin above the hair, as a share of the box
const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** object-position that puts the photo's face in view in a w x h box. */
export function faceObjectPosition(photo: string, w: number, h: number, target = 0.36): string | undefined {
  const d = FACE_DATA[photo];
  if (!d || !w || !h) return undefined;
  const [ar, cx, top, cy] = d;
  const box = w / h;
  let x = 0.5, y = 0.5;
  if (box > ar) {
    // the box is wider than the photo: the top and bottom are cropped
    const f = ar / box; // the share of the photo's height that shows
    const crown = top - HAIR * (cy - top);
    y = clamp(Math.min((cy - target * f) / (1 - f), (crown - CROWN * f) / (1 - f)));
  } else if (box < ar) {
    // taller than the photo: the sides are cropped
    const g = box / ar;
    x = clamp((cx - 0.5 * g) / (1 - g));
  }
  return `${Math.round(x * 100)}% ${Math.round(y * 100)}%`;
}

export function FacePhoto({ src, alt = "", sizes, className = "", wrapperClassName = "", style, fallback = "50% 25%", target, priority = false, onError }: {
  src: string; alt?: string; sizes: string; className?: string;
  /** classes for the filling wrapper (visibility at breakpoints) */
  wrapperClassName?: string; style?: CSSProperties;
  fallback?: string; target?: number; priority?: boolean; onError?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<[number, number] | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox([e.contentRect.width, e.contentRect.height]));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const position = (box && faceObjectPosition(src, box[0], box[1], target)) || fallback;
  return (
    <span ref={ref} className={`absolute inset-0 block ${wrapperClassName}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} style={{ ...style, objectPosition: position }} onError={onError} />
    </span>
  );
}
