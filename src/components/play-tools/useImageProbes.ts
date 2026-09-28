"use client";

// Loads each image once and reports whether it loaded, its natural size, and
// (for sprites) the bounding box of its opaque pixels, read off a small
// canvas. Every src is same-origin or a local object URL, so the canvas is
// never tainted; if it ever is, alpha comes back null and the review falls
// back to the standard's canvas margins.

import { useEffect, useState } from "react";
import type { AlphaBox, Probe } from "./sceneReviewModel";

const cache = new Map<string, Promise<Probe>>();

/** Height of the canvas the alpha box is measured on. Plenty for fractions. */
const SAMPLE_H = 512;
const ALPHA_MIN = 24;

function measureAlpha(img: HTMLImageElement): AlphaBox | null {
  try {
    const h = Math.min(SAMPLE_H, img.naturalHeight);
    const w = Math.max(1, Math.round((img.naturalWidth / img.naturalHeight) * h));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let top = -1;
    let bottom = -1;
    let left = w;
    let right = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] < ALPHA_MIN) continue;
        if (top < 0) top = y;
        bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
    if (top < 0) return null;
    // The head: the opaque columns in the top 6% of the figure.
    const headRows = Math.max(1, Math.round((bottom - top) * 0.06));
    let headLeft = w;
    let headRight = -1;
    for (let y = top; y <= Math.min(h - 1, top + headRows); y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] < ALPHA_MIN) continue;
        if (x < headLeft) headLeft = x;
        if (x > headRight) headRight = x;
      }
    }
    return {
      top: top / h,
      bottom: (bottom + 1) / h,
      left: left / w,
      right: (right + 1) / w,
      headX: headRight >= 0 ? (headLeft + headRight + 1) / 2 / w : (left + right + 1) / 2 / w,
    };
  } catch {
    return null;
  }
}

function probe(src: string, withAlpha: boolean): Promise<Probe> {
  const key = `${withAlpha ? "a" : "p"}:${src}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const next = new Promise<Probe>((done) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => done({ status: "ok", w: img.naturalWidth, h: img.naturalHeight, alpha: withAlpha ? measureAlpha(img) : null });
    img.onerror = () => done({ status: "error" });
    img.src = src;
  });
  cache.set(key, next);
  return next;
}

/** Probe results keyed by src; a src still loading is simply absent. */
export function useImageProbes(plates: string[], sprites: string[]): Record<string, Probe | undefined> {
  const [results, setResults] = useState<Record<string, Probe>>({});
  const key = JSON.stringify([plates, sprites]);
  useEffect(() => {
    let live = true;
    const [p, s] = JSON.parse(key) as [string[], string[]];
    const run = (src: string, alpha: boolean) =>
      probe(src, alpha).then((result) => {
        if (live) setResults((prev) => (prev[src] === result ? prev : { ...prev, [src]: result }));
      });
    p.forEach((src) => run(src, false));
    s.forEach((src) => run(src, true));
    return () => {
      live = false;
    };
  }, [key]);
  return results;
}
