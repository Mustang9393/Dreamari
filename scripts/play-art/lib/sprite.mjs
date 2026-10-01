// One sprite source file -> one standard-canvas webp cutout. Implements SOP
// chapter 7 s4 "Post-processing, step by step (script these)" for sprites.
import sharp from "sharp";
import { chromaKey, removeSmallIslands, alphaBBox } from "./chroma.mjs";

export const CANVAS_W = 1024;
export const CANVAS_H = 2048;
const TOP_MARGIN = 0.04;
const BOTTOM_MARGIN = 0.02;

/** A PNG can carry an alpha channel that's fully opaque (some exporters
 *  always add one), which is not "real" transparency. Sampling a small
 *  probe is cheap and avoids decoding the full image twice just to check. */
async function hasRealAlpha(inputPath, metaHasAlpha) {
  if (!metaHasAlpha) return false;
  const { data } = await sharp(inputPath)
    .resize(64, 64, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
}

/**
 * Processes one sprite source file end to end: key or trust alpha, despeckle,
 * trim to the alpha bounding box, scale onto the 1024x2048 standard canvas
 * with the ~4%/~2% margins, and export webp-with-alpha.
 *
 * Returns { canvasRaw, webp, width, height, ratio, chromaKeyed, removedIslandPixels,
 *   note, figureTop, figureHeight } or throws with a descriptive message if
 * the source keyed away to nothing.
 */
export async function processSprite(inputPath, { forceGreen = false } = {}) {
  const meta = await sharp(inputPath).metadata();
  const needsKey = forceGreen || !(await hasRealAlpha(inputPath, meta.hasAlpha));

  const { data: raw, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  if (needsKey) chromaKey(raw, width, height);

  // Tiny stray alpha islands (a chroma key's noise, or a rough generator
  // alpha): drop anything under ~0.002% of the frame, floored at 24px so a
  // small source image isn't over-aggressively eaten.
  const minIsland = Math.max(24, Math.round(width * height * 0.00002));
  const removedIslandPixels = removeSmallIslands(raw, width, height, minIsland);

  const bbox = alphaBBox(raw, width, height);
  if (!bbox) {
    throw new Error(`${inputPath}: no visible alpha after keying/cleanup (fully transparent) -- check the source`);
  }

  const cropped = sharp(raw, { raw: { width, height, channels: 4 } }).extract(bbox);

  const availableH = CANVAS_H * (1 - TOP_MARGIN - BOTTOM_MARGIN);
  let scale = availableH / bbox.height;
  let newW = Math.round(bbox.width * scale);
  let newH = Math.round(bbox.height * scale);
  let note = null;
  if (newW > CANVAS_W) {
    scale = CANVAS_W / bbox.width;
    newW = Math.round(bbox.width * scale);
    newH = Math.round(bbox.height * scale);
    note = "figure wider than the canvas at full height-fit; constrained by width instead (check for unusually wide pose/prop)";
  }

  const resizedRaw = await cropped.resize(newW, newH, { fit: "fill" }).raw().toBuffer();

  const canvasRaw = Buffer.alloc(CANVAS_W * CANVAS_H * 4); // zero = transparent
  const left = Math.round((CANVAS_W - newW) / 2);
  const top = Math.round(CANVAS_H * TOP_MARGIN);
  for (let y = 0; y < newH; y++) {
    const srcStart = y * newW * 4;
    const dstStart = ((top + y) * CANVAS_W + left) * 4;
    resizedRaw.copy(canvasRaw, dstStart, srcStart, srcStart + newW * 4);
  }

  const webp = await sharp(canvasRaw, { raw: { width: CANVAS_W, height: CANVAS_H, channels: 4 } })
    .webp({ quality: 90, effort: 6, alphaQuality: 100 })
    .toBuffer();

  return {
    canvasRaw,
    webp,
    width: CANVAS_W,
    height: CANVAS_H,
    ratio: +(CANVAS_W / CANVAS_H).toFixed(4),
    chromaKeyed: needsKey,
    removedIslandPixels,
    note,
    figureTop: top,
    figureHeight: newH,
  };
}
