// Plates and hero scenes (SOP chapter 7 s4: plates 1920x1080 webp q~82;
// heroes native size if already 16:9, else a top-anchored crop so a
// centre-crop doesn't cut a head, as happened once on L2-09).
import sharp from "sharp";

const TARGET_RATIO = 16 / 9;
const RATIO_TOLERANCE = 0.02;

export async function processPlate(inputPath) {
  return sharp(inputPath).resize(1920, 1080, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
}

export async function processHero(inputPath) {
  const meta = await sharp(inputPath).metadata();
  const ratio = meta.width / meta.height;
  let pipeline = sharp(inputPath);
  if (Math.abs(ratio - TARGET_RATIO) > RATIO_TOLERANCE) {
    if (ratio < TARGET_RATIO) {
      // Narrower than 16:9: crop height down to match the width, anchored
      // to the top so a standing figure's head survives.
      const targetH = Math.round(meta.width * (9 / 16));
      pipeline = pipeline.resize(meta.width, targetH, { fit: "cover", position: "top" });
    } else {
      // Wider than 16:9 is rare for hero art; centre-crop the width.
      const targetW = Math.round(meta.height * TARGET_RATIO);
      pipeline = pipeline.resize(targetW, meta.height, { fit: "cover", position: "centre" });
    }
  }
  return pipeline.webp({ quality: 82 }).toBuffer();
}
