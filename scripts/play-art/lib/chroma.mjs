// Green-screen keying and cleanup for sprite source art (SOP chapter 7 s4,
// sprite-master-prompt.md's chroma-key fallback). Codex can't always deliver
// true alpha, so the fallback is a flat #00FF00 backdrop; a hard-threshold
// key leaves a visible stair-step on hair and fingertips, so this ramps
// alpha by how far green exceeds the other channels instead of cutting once.

// Below LOW: not screen, fully opaque. At/above HIGH: fully screen, fully
// transparent. Between: linear ramp -- this is the "soft" part.
const LOW = 12;
const HIGH = 100;

/** Mutates a raw RGBA buffer in place: derives alpha from green-dominance,
 *  then despills (pulls G toward max(R,B)) on the partial-alpha edge ring,
 *  more aggressively as alpha approaches 0, so that ring doesn't read green
 *  once composited over a room plate. */
export function chromaKey(raw, width, height) {
  const n = width * height;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const r = raw[o];
    const g = raw[o + 1];
    const b = raw[o + 2];
    const maxRB = r > b ? r : b;
    const diff = g - maxRB;
    let alpha = 255 * (1 - (diff - LOW) / (HIGH - LOW));
    if (alpha > 255) alpha = 255;
    if (alpha < 0) alpha = 0;
    raw[o + 3] = alpha;
    if (alpha > 0 && alpha < 255 && g > maxRB) {
      const spill = 1 - alpha / 255;
      raw[o + 1] = Math.round(g - spill * (g - maxRB));
    }
  }
}

/** Flood-fills the alpha mask (4-connectivity) and zeroes any connected
 *  island smaller than minSize: the tiny stray opaque/alpha specks a chroma
 *  key (or a slightly noisy generator alpha) leaves behind, which a human
 *  post-processor would otherwise erase by hand. Returns the pixel count
 *  removed, for the process report. */
export function removeSmallIslands(raw, width, height, minSize) {
  const n = width * height;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = raw[i * 4 + 3] > 10 ? 1 : 0;
  const visited = new Uint8Array(n);
  const queue = new Int32Array(n);
  const members = new Int32Array(n);
  let removed = 0;
  for (let start = 0; start < n; start++) {
    if (!mask[start] || visited[start]) continue;
    let qHead = 0;
    let qTail = 0;
    let mCount = 0;
    queue[qTail++] = start;
    visited[start] = 1;
    while (qHead < qTail) {
      const idx = queue[qHead++];
      members[mCount++] = idx;
      const x = idx % width;
      const y = (idx / width) | 0;
      if (x > 0 && mask[idx - 1] && !visited[idx - 1]) { visited[idx - 1] = 1; queue[qTail++] = idx - 1; }
      if (x < width - 1 && mask[idx + 1] && !visited[idx + 1]) { visited[idx + 1] = 1; queue[qTail++] = idx + 1; }
      if (y > 0 && mask[idx - width] && !visited[idx - width]) { visited[idx - width] = 1; queue[qTail++] = idx - width; }
      if (y < height - 1 && mask[idx + width] && !visited[idx + width]) { visited[idx + width] = 1; queue[qTail++] = idx + width; }
    }
    if (mCount < minSize) {
      for (let k = 0; k < mCount; k++) raw[members[k] * 4 + 3] = 0;
      removed += mCount;
    }
  }
  return removed;
}

/** Bounding box of pixels with alpha above threshold, or null if the image
 *  keyed away to nothing (a real failure worth surfacing, not silently
 *  producing a blank sprite). */
export function alphaBBox(raw, width, height, threshold = 10) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      if (raw[(rowBase + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Percentage of semi-transparent edge pixels (alpha strictly between the
 *  two ramp bounds) that are still green-dominant -- the QA signal for a
 *  key that wasn't despilled enough. Used by `validate`/`qa`, not `process`. */
export function greenFringePercent(raw, width, height) {
  const n = width * height;
  let edge = 0;
  let greenEdge = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const a = raw[o + 3];
    if (a > 10 && a < 245) {
      edge++;
      const r = raw[o];
      const g = raw[o + 1];
      const b = raw[o + 2];
      if (g > Math.max(r, b) + 5) greenEdge++;
    }
  }
  return edge > 0 ? (greenEdge / edge) * 100 : 0;
}
