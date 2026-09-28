// Automatic focal-point placement for location plates. With 900+ careers
// nobody can hand-drag a slider per room, so this picks the least-cluttered
// "standing column" (where the character cutout, always rendered at
// viewport centre) and points object-position at it, instead of a human
// tuning focal/mobileFocal in the scene tuner.
import sharp from "sharp";

const PROBE_W = 192;
const PROBE_H = 108;
// Theoretical ceiling of the 3x3 Sobel magnitude (kernel weights sum to 4 on
// each axis, times a 0..255 channel, combined via sqrt(gx^2+gy^2)) -- used
// only to normalise clutter into a 0..1 range comparable to the centring bias.
const SOBEL_MAX = 1442.5;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

async function edgeMagnitude(inputPath) {
  const { data } = await sharp(inputPath)
    .resize(PROBE_W, PROBE_H, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const at = (x, y) => {
    const cx = x < 0 ? 0 : x >= PROBE_W ? PROBE_W - 1 : x;
    const cy = y < 0 ? 0 : y >= PROBE_H ? PROBE_H - 1 : y;
    return data[cy * PROBE_W + cx];
  };
  const mag = new Float32Array(PROBE_W * PROBE_H);
  for (let y = 0; y < PROBE_H; y++) {
    for (let x = 0; x < PROBE_W; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1));
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1));
      mag[y * PROBE_W + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  return mag;
}

/** Least-cluttered column in the lower ~55% of the frame (where a standing
 *  figure's feet would land), width ~= a sprite's shoulder width (~12% of
 *  the plate), biased toward the centre so near-ties resolve to the middle
 *  instead of drifting to whichever side happens to be marginally emptier. */
function standingColumn(mag) {
  const bandTop = Math.round(PROBE_H * 0.45);
  const rows = PROBE_H - bandTop;
  const winW = Math.max(4, Math.round(PROBE_W * 0.12));
  const colSum = new Float64Array(PROBE_W);
  for (let y = bandTop; y < PROBE_H; y++) {
    const rowBase = y * PROBE_W;
    for (let x = 0; x < PROBE_W; x++) colSum[x] += mag[rowBase + x];
  }
  const prefix = new Float64Array(PROBE_W + 1);
  for (let x = 0; x < PROBE_W; x++) prefix[x + 1] = prefix[x] + colSum[x];
  const maxClutter = winW * rows * SOBEL_MAX;

  let bestC = Math.round(PROBE_W / 2);
  let bestScore = Infinity;
  const half = winW / 2;
  for (let c = Math.ceil(half); c < PROBE_W - Math.ceil(half); c++) {
    const lo = Math.round(c - half);
    const hi = Math.round(c + half);
    const clutterNorm = (prefix[hi] - prefix[lo]) / maxClutter;
    const distance = Math.abs((c + 0.5) / PROBE_W - 0.5) * 2; // 0 centre .. 1 edge
    const score = clutterNorm + 0.15 * distance;
    if (score < bestScore) {
      bestScore = score;
      bestC = c;
    }
  }
  return { column: (bestC + 0.5) / PROBE_W, clutterNorm: (prefix[Math.round(bestC + half)] - prefix[Math.round(bestC - half)]) / maxClutter };
}

/** Saliency centre of mass (edge density) over the whole frame, for focal.y. */
function saliencyY(mag) {
  let weighted = 0;
  let total = 0;
  for (let y = 0; y < PROBE_H; y++) {
    let rowSum = 0;
    const rowBase = y * PROBE_W;
    for (let x = 0; x < PROBE_W; x++) rowSum += mag[rowBase + x];
    weighted += rowSum * ((y + 0.5) / PROBE_H);
    total += rowSum;
  }
  return total > 0 ? weighted / total : 0.45;
}

/** object-fit: cover math. If the image is relatively wider than the
 *  viewport (A > V), the width overflows and object-position's x fraction p
 *  slides a window of visible-width-fraction f = V/A across it; the
 *  viewport's horizontal centre then lands on image-x = (1-f)*p + f/2.
 *  Solve p so that lands exactly on the target column c. If A <= V there is
 *  no horizontal crop at all (the height overflows instead), so p is a
 *  no-op: any value shows the same thing, and this returns the neutral 0.5. */
export function solveObjectPositionX(c, imageAspect, viewportAspect) {
  if (imageAspect <= viewportAspect + 1e-6) return 0.5;
  const f = viewportAspect / imageAspect;
  if (Math.abs(1 - f) < 1e-4) return 0.5;
  return clamp((c - f / 2) / (1 - f), 0, 1);
}

/** Inverse of the above: given a stored object-position p, where does image
 *  x-fraction c actually land on screen (0..1; outside that range means it's
 *  cropped off-screen at this viewport)? Used only for reporting/QA. */
export function screenFractionOf(c, p, imageAspect, viewportAspect) {
  if (imageAspect <= viewportAspect + 1e-6) return c;
  const f = viewportAspect / imageAspect;
  const windowLeft = (1 - f) * p;
  return (c - windowLeft) / f;
}

export const DESKTOP_V = 1440 / 900;
export const MOBILE_V = 390 / 844;

export const CHECK_VIEWPORTS = [
  { name: "390x844", w: 390, h: 844 },
  { name: "768x1024", w: 768, h: 1024 },
  { name: "1440x900", w: 1440, h: 900 },
  { name: "1920x1080", w: 1920, h: 1080 },
  { name: "2560x1080", w: 2560, h: 1080 },
];

/** Full automatic placement for one plate file: focal (desktop/tablet,
 *  640px+) and mobileFocal (phones), plus the raw column/clutter for
 *  reporting. mobileFocal.y is nudged up 0.04 from focal.y per the brief
 *  (phones read a touch higher), both clamped to a sane 0.35..0.55 band so
 *  a busy ceiling or floor never becomes the focal point. */
export async function computePlacement(inputPath) {
  const meta = await sharp(inputPath).metadata();
  const imageAspect = meta.width / meta.height;
  const mag = await edgeMagnitude(inputPath);
  const { column, clutterNorm } = standingColumn(mag);
  const focalY = clamp(saliencyY(mag), 0.35, 0.55);
  const mobileY = clamp(focalY - 0.04, 0.35, 0.55);
  const focalX = solveObjectPositionX(column, imageAspect, DESKTOP_V);
  const mobileX = solveObjectPositionX(column, imageAspect, MOBILE_V);
  return {
    column,
    clutterNorm,
    imageAspect,
    focal: { x: +focalX.toFixed(4), y: +focalY.toFixed(4) },
    mobileFocal: { x: +mobileX.toFixed(4), y: +mobileY.toFixed(4) },
  };
}

/** Clutter at a specific image column (for `qa`'s phone-crop check, using
 *  whatever focal is actually stored rather than recomputing the optimum). */
export async function clutterAtColumn(inputPath, columnFrac) {
  const mag = await edgeMagnitude(inputPath);
  const bandTop = Math.round(PROBE_H * 0.45);
  const rows = PROBE_H - bandTop;
  const winW = Math.max(4, Math.round(PROBE_W * 0.12));
  const c = clamp(Math.round(columnFrac * PROBE_W), Math.ceil(winW / 2), PROBE_W - Math.ceil(winW / 2));
  let sum = 0;
  for (let y = bandTop; y < PROBE_H; y++) {
    const rowBase = y * PROBE_W;
    for (let x = c - Math.round(winW / 2); x < c + Math.round(winW / 2); x++) sum += mag[rowBase + clamp(x, 0, PROBE_W - 1)];
  }
  return sum / (winW * rows * SOBEL_MAX);
}
