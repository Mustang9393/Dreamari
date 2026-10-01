// Face chip framing (SOP chapter 7 s4: "hairline to chin with ~15% margin,
// eyes at ~42% of the height"). There's no real face detector here (no new
// dependency allowed), so this estimates hairline/chin/eyes from the alpha
// mask plus a standard cartoon body proportion (a figure is ~7.5 heads
// tall). That's a scriptable approximation, not a measurement -- every chip
// this produces is flagged for human review in the process report on
// purpose, per the brief.
import sharp from "sharp";

/** canvasRaw is the RGBA buffer of a sprite already placed on the standard
 *  canvas (so figureTop/figureHeight, from processSprite, describe where the
 *  figure sits in it). Returns a crop box in canvas pixel coordinates. */
export function computeFaceCropBox(canvasRaw, canvasW, canvasH, figureTop, figureHeight) {
  let hairline = -1;
  for (let y = figureTop; y < figureTop + figureHeight; y++) {
    let count = 0;
    const rowBase = y * canvasW;
    for (let x = 0; x < canvasW; x++) {
      if (canvasRaw[(rowBase + x) * 4 + 3] > 128) count++;
      if (count > 4) break;
    }
    if (count > 4) { hairline = y; break; }
  }
  if (hairline < 0) return null;

  const headHeight = figureHeight / 7.5; // standard 7.5-heads-tall proportion
  const chin = hairline + headHeight;

  // Sample a row a third of the way down the head band (below flyaway hair,
  // above the neck/shoulders) to centre the crop horizontally.
  const sampleY = Math.min(canvasH - 1, Math.round(hairline + headHeight * 0.35));
  let minX = canvasW;
  let maxX = -1;
  const rowBase = sampleY * canvasW;
  for (let x = 0; x < canvasW; x++) {
    if (canvasRaw[(rowBase + x) * 4 + 3] > 128) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }
  const centerX = maxX >= minX ? (minX + maxX) / 2 : canvasW / 2;

  const margin = headHeight * 0.15;
  const cropSize = chin + margin - (hairline - margin);
  const eyeY = hairline + headHeight * 0.5; // eyes roughly midway hairline->chin

  let top = eyeY - 0.42 * cropSize;
  let left = centerX - cropSize / 2;
  if (top < 0) top = 0;
  if (top + cropSize > canvasH) top = canvasH - cropSize;
  if (left < 0) left = 0;
  if (left + cropSize > canvasW) left = canvasW - cropSize;

  return { left: Math.round(left), top: Math.round(top), size: Math.round(cropSize), hairline, chin };
}

export async function renderFaceChip(canvasRaw, canvasW, canvasH, box) {
  return sharp(canvasRaw, { raw: { width: canvasW, height: canvasH, channels: 4 } })
    .extract({ left: box.left, top: box.top, width: box.size, height: box.size })
    .resize(512, 512)
    .webp({ quality: 90 })
    .toBuffer();
}
