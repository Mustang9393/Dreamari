// Hair-safe cutting for `extract` (SOP chapter 9). Vision's person mask is
// soft at the hair line: it keeps the background that shows between curls
// and leaves a pale halo where the edge blends into a bright sky (direct
// feedback, 5 Oct 2026: "make sure the cutouts do hair well, I don't want
// backgrounds slipping in through curls").
//
// So the mask is only the starting guess. In a band around the person's
// outline, every pixel's alpha is re-solved from colour: how far it sits from
// the local FOREGROUND colour (hair, estimated from the confident inside) and
// the local BACKGROUND colour (estimated from the real scene just outside the
// person). A pixel that looks like the background goes transparent even when
// the mask called it solid -- the gaps between curls -- and a part-covered
// edge pixel has the background's tint taken out of its colour, so no halo.
// Where hair and background are too alike to tell apart, Vision's own soft
// mask is kept.
import sharp from "sharp";
import { removeSmallIslands } from "./chroma.mjs";

/** Separable box blur of a Float32 field (w*h*channels), radius r. */
function boxBlur(src, w, h, ch, r) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const win = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < ch; c++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += src[(y * w + Math.min(w - 1, Math.max(0, x))) * ch + c];
      for (let x = 0; x < w; x++) {
        tmp[(y * w + x) * ch + c] = acc / win;
        const add = Math.min(w - 1, x + r + 1);
        const sub = Math.max(0, x - r);
        acc += src[(y * w + add) * ch + c] - src[(y * w + sub) * ch + c];
      }
    }
  }
  for (let x = 0; x < w; x++) {
    for (let c = 0; c < ch; c++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[(Math.min(h - 1, Math.max(0, y)) * w + x) * ch + c];
      for (let y = 0; y < h; y++) {
        out[(y * w + x) * ch + c] = acc / win;
        const add = Math.min(h - 1, y + r + 1);
        const sub = Math.max(0, y - r);
        acc += tmp[(add * w + x) * ch + c] - tmp[(sub * w + x) * ch + c];
      }
    }
  }
  return out;
}

/** Local mean colour of `rgb` over the pixels where `weight` is set
 *  (normalised convolution), radius r. */
function localMean(rgb, weight, w, h, r) {
  const n = w * h;
  const wrgb = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) wrgb[i * 3 + c] = rgb[i * 3 + c] * weight[i];
  const num = boxBlur(wrgb, w, h, 3, r);
  const den = boxBlur(weight, w, h, 1, r);
  return { num, den };
}

/** Zeroes every 4-connected piece of alpha > 50% smaller than minSize, and
 *  the faint fringe within 2px of it. */
function dropSmallSolidPieces(rgba, w, h, minSize) {
  const n = w * h;
  const solid = new Uint8Array(n);
  for (let i = 0; i < n; i++) solid[i] = rgba[i * 4 + 3] > 127 ? 1 : 0;
  const seen = new Uint8Array(n);
  const queue = new Int32Array(n);
  for (let start = 0; start < n; start++) {
    if (!solid[start] || seen[start]) continue;
    let head = 0, tail = 0;
    queue[tail++] = start;
    seen[start] = 1;
    while (head < tail) {
      const i = queue[head++];
      const x = i % w, y = (i / w) | 0;
      if (x > 0 && solid[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; queue[tail++] = i - 1; }
      if (x < w - 1 && solid[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; queue[tail++] = i + 1; }
      if (y > 0 && solid[i - w] && !seen[i - w]) { seen[i - w] = 1; queue[tail++] = i - w; }
      if (y < h - 1 && solid[i + w] && !seen[i + w]) { seen[i + w] = 1; queue[tail++] = i + w; }
    }
    if (tail >= minSize) continue;
    for (let q = 0; q < tail; q++) {
      const i = queue[q];
      const x = i % w, y = (i / w) | 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx;
        if (j === i || rgba[j * 4 + 3] <= 127) rgba[j * 4 + 3] = 0;
      }
    }
  }
}

/**
 * Cuts one person out of a scene.
 * @param scenePath the original image
 * @param maskPath  Vision's full-frame grayscale mask for that person
 * @returns { png: Buffer (cropped RGBA), touchesBottom, bbox }
 */
export async function refinedCutout(scenePath, maskPath) {
  const scene = await sharp(scenePath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = scene.info;
  const maskRaw = await sharp(maskPath).resize(w, h, { fit: "fill" }).greyscale().raw().toBuffer();
  const n = w * h;
  const rgb = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) rgb[i] = scene.data[i];
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) m[i] = maskRaw[i] / 255;

  // Scale the working distances to the image (tuned on ~1450px-wide art).
  const unit = Math.max(1, Math.round(Math.max(w, h) / 1450));
  const band = 10 * unit;

  // Distance-to-edge band: pixels within `band` of the 0.5 contour, either side.
  const hard = new Float32Array(n);
  for (let i = 0; i < n; i++) hard[i] = m[i] >= 0.5 ? 1 : 0;
  const near = boxBlur(hard, w, h, 1, band);
  // Confident foreground: well inside; confident background: well outside.
  const fgW = new Float32Array(n);
  const bgW = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    fgW[i] = near[i] > 0.985 && m[i] > 0.95 ? 1 : 0;
    bgW[i] = near[i] < 0.015 && m[i] < 0.05 ? 1 : 0;
  }
  const Fnear = localMean(rgb, fgW, w, h, 14 * unit);
  // Thin outer curls can have no confident inside within 14px; fall back to
  // a wider sample of anything the mask is sure about.
  const fgLoose = new Float32Array(n);
  for (let i = 0; i < n; i++) fgLoose[i] = m[i] > 0.9 && near[i] > 0.6 ? 1 : 0;
  const Fwide = localMean(rgb, fgLoose, w, h, 40 * unit);
  const F = { num: new Float32Array(n * 3), den: new Float32Array(n) };
  for (let i = 0; i < n; i++) {
    const src = Fnear.den[i] > 1e-3 ? Fnear : Fwide;
    F.den[i] = src.den[i];
    for (let c = 0; c < 3; c++) F.num[i * 3 + c] = src.num[i * 3 + c];
  }
  const B = localMean(rgb, bgW, w, h, 24 * unit);
  // The background a few pixels away: what actually shows through a gap in
  // the curls (a window right behind the head), finer than the 24px mean.
  const Bnear = localMean(rgb, bgW, w, h, 8 * unit);
  // Pockets of sky fully enclosed by curls are deeper than the band and
  // have no background within 24px: a wider ring and a wider background
  // sample catch them.
  const nearWide = boxBlur(hard, w, h, 1, 26 * unit);
  const Bwide = localMean(rgb, bgW, w, h, 56 * unit);
  // A slightly grown mask caps how far the new alpha may reach, so a dark
  // object in the background next to the hair is never pulled in.
  const grown = boxBlur(hard, w, h, 1, 2 * unit);

  const alpha = new Float32Array(n);
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const inBand = near[i] > 0.001 && near[i] < 0.999;
    let a = m[i];
    // More than a band's width outside the outline: never the person. Vision
    // leaves a faint glow out here, which showed as pale fuzz at the edge.
    if (near[i] <= 0.001) a = 0;
    const fd = F.den[i];
    const bd = B.den[i];
    if (inBand && fd > 1e-3 && bd > 1e-3) {
      const fr = F.num[i * 3] / fd, fg = F.num[i * 3 + 1] / fd, fb = F.num[i * 3 + 2] / fd;
      const br = B.num[i * 3] / bd, bg = B.num[i * 3 + 1] / bd, bb = B.num[i * 3 + 2] / bd;
      const dr = fr - br, dg = fg - bg, db = fb - bb;
      const dd = dr * dr + dg * dg + db * db;
      // Only when hair and background are clearly different colours.
      if (dd > 40 * 40) {
        const pr = rgb[i * 3] - br, pg = rgb[i * 3 + 1] - bg, pb = rgb[i * 3 + 2] - bb;
        let solved = (pr * dr + pg * dg + pb * db) / dd;
        solved = Math.min(1, Math.max(0, solved));
        // Practically the background's own colour: a crumb of sky caught
        // between curls, never hair. Fully clear.
        if (pr * pr + pg * pg + pb * pb < 28 * 28) solved = 0;
        // Matches the background right behind it and is brighter than the
        // hair around it: window light seen through a curl loop (it can sit
        // beside the face, where the skin makes the colour test ambiguous).
        const nd = Bnear.den[i];
        if (nd > 1e-3) {
          const nr = rgb[i * 3] - Bnear.num[i * 3] / nd, ng = rgb[i * 3 + 1] - Bnear.num[i * 3 + 1] / nd, nb = rgb[i * 3 + 2] - Bnear.num[i * 3 + 2] / nd;
          const lum = 0.3 * rgb[i * 3] + 0.59 * rgb[i * 3 + 1] + 0.11 * rgb[i * 3 + 2];
          const hairLum = 0.3 * fr + 0.59 * fg + 0.11 * fb;
          if (nr * nr + ng * ng + nb * nb < 42 * 42 && lum > hairLum + 40) solved = 0;
        }
        a = Math.min(solved, grown[i] > 0 ? 1 : 0);
      }
    }
    // Whatever the hair estimate: an edge pixel that is the background's own
    // colour is background (sky trapped between curls).
    if (inBand && bd > 1e-3) {
      const br = B.num[i * 3] / bd, bg = B.num[i * 3 + 1] / bd, bb = B.num[i * 3 + 2] / bd;
      const qr = rgb[i * 3] - br, qg = rgb[i * 3 + 1] - bg, qb = rgb[i * 3 + 2] - bb;
      const nd = Bnear.den[i];
      let close = qr * qr + qg * qg + qb * qb < 26 * 26;
      if (!close && nd > 1e-3) {
        const nr = rgb[i * 3] - Bnear.num[i * 3] / nd, ng = rgb[i * 3 + 1] - Bnear.num[i * 3 + 1] / nd, nb = rgb[i * 3 + 2] - Bnear.num[i * 3 + 2] / nd;
        close = nr * nr + ng * ng + nb * nb < 26 * 26;
      }
      if (close) a = 0;
    }
    if (a > 0 && nearWide[i] < 0.9995 && Bwide.den[i] > 1e-3 && F.den[i] > 1e-3) {
      const wd = Bwide.den[i], fd2 = F.den[i];
      const qr = rgb[i * 3] - Bwide.num[i * 3] / wd, qg = rgb[i * 3 + 1] - Bwide.num[i * 3 + 1] / wd, qb = rgb[i * 3 + 2] - Bwide.num[i * 3 + 2] / wd;
      const lum = 0.3 * rgb[i * 3] + 0.59 * rgb[i * 3 + 1] + 0.11 * rgb[i * 3 + 2];
      const hairLum = 0.3 * (F.num[i * 3] / fd2) + 0.59 * (F.num[i * 3 + 1] / fd2) + 0.11 * (F.num[i * 3 + 2] / fd2);
      if (lum > hairLum + 70 && qr * qr + qg * qg + qb * qb < 34 * 34) a = 0;
    }
    alpha[i] = a;
    if (process.env.DEBUG_REFINE) {
      const [dx, dy] = process.env.DEBUG_REFINE.split(",").map(Number);
      const x = i % w, y = (i / w) | 0;
      if (Math.abs(x - dx) <= 1 && Math.abs(y - dy) <= 1) console.error(JSON.stringify({ x, y, m: +m[i].toFixed(3), near: +near[i].toFixed(4), inBand, a: +a.toFixed(3), p: [rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]], F: F.den[i] > 1e-3 ? [0, 1, 2].map((c) => Math.round(F.num[i * 3 + c] / F.den[i])) : null, B: B.den[i] > 1e-3 ? [0, 1, 2].map((c) => Math.round(B.num[i * 3 + c] / B.den[i])) : null }));
    }
  }
  // A light smoothing pass so the solved edge does not sparkle.
  const smooth = boxBlur(alpha, w, h, 1, 1);
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let i = 0; i < n; i++) {
    const a = Math.min(alpha[i], smooth[i] * 1.15);
    const A = a < 0.04 ? 0 : a;
    let r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    // Take the background's tint out of part-covered edge pixels. The
    // classic un-mix (c = B + (p - B) / alpha) overshoots past white when the
    // edge is brighter than the background estimate -- that drew pale blobs
    // at the curl tips -- so each channel is held between the pixel's own
    // colour and the local hair colour, and a mostly see-through pixel simply
    // takes the hair colour (its weak alpha does the blending).
    if (A > 0 && A < 0.98 && B.den[i] > 1e-3 && F.den[i] > 1e-3) {
      const bd = B.den[i], fd = F.den[i];
      const br = B.num[i * 3] / bd, bg = B.num[i * 3 + 1] / bd, bb = B.num[i * 3 + 2] / bd;
      const fr = F.num[i * 3] / fd, fg = F.num[i * 3 + 1] / fd, fb = F.num[i * 3 + 2] / fd;
      if (A < 0.5) {
        r = fr; g = fg; b = fb;
      } else {
        const hold = (v, own, hair) => Math.min(Math.max(own, hair), Math.max(Math.min(own, hair), v));
        r = hold(br + (r - br) / A, r, fr);
        g = hold(bg + (g - bg) / A, g, fg);
        b = hold(bb + (b - bb) / A, b, fb);
      }
    }
    out[i * 4] = Math.max(0, Math.min(255, Math.round(r)));
    out[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(g)));
    out[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(b)));
    out[i * 4 + 3] = Math.round(A * 255);
    if (A > 0.04) {
      const x = i % w, y = (i / w) | 0;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  // Stray specks left at the outline (a few pixels of background that
  // survived on their own) go, the same island rule `process` uses.
  // Judged by their SOLID cores (alpha over half), not their faint glow, so a
  // speck a whisper of glow joins to the hair still counts as separate.
  dropSmallSolidPieces(out, w, h, Math.max(60, Math.round(n * 0.00008)));
  removeSmallIslands(out, w, h, Math.max(24, Math.round(n * 0.00002)));
  const bbox = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  const png = await sharp(out, { raw: { width: w, height: h, channels: 4 } }).extract(bbox).png({ compressionLevel: 9 }).toBuffer();
  return { png, bbox, touchesBottom: maxY >= h - 3 };
}
