// Deterministic geometry QA: no screenshots, no browser. Two independent
// checks, both derived from the standard slot { baselineY: 1.78, heightFrac:
// 1.75 } that every character renders at:
//
// 1. Per sprite file: does the head clear the top of frame, and does the
//    face land in the readable upper part of the screen?
// 2. Per location: is the column the automatic (or hand-tuned) focal point
//    centres on actually clutter-free at a phone crop?
//
// Note on the viewport list: the slot is defined in fractions of the scene's
// own height, so (assuming the scene element fills the viewport, which is
// the working assumption here since SimulationPlayer's actual container
// sizing is owned by another change in flight) the head/face fractions come
// out viewport-height-invariant -- scaling the sprite by heightFrac*height
// and reading its position back as a fraction of that same height cancels
// the height out. We still compute and report per viewport as asked, both
// because a future aspect-clamped scene container could reintroduce
// variance and because it's the honest way to show the math held at each size.
import sharp from "sharp";
import { alphaBBox } from "./chroma.mjs";
import { STANDARD_SLOT } from "./manifest.mjs";
import { CHECK_VIEWPORTS, clutterAtColumn } from "./placement.mjs";

const FACE_WARN_FRAC = 0.4;
const CLUTTER_WARN = 0.35;

export async function checkSpriteGeometry(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bbox = alphaBBox(data, info.width, info.height);
  if (!bbox) return { errors: [`${filePath}: no visible alpha, cannot check geometry`], warnings: [], perViewport: [] };

  const renderedTopFrac = STANDARD_SLOT.baselineY - STANDARD_SLOT.heightFrac; // fraction of scene height
  const headTopFrac = renderedTopFrac + STANDARD_SLOT.heightFrac * (bbox.top / info.height);
  const faceFileY = bbox.top + 0.07 * bbox.height;
  const faceFrac = renderedTopFrac + STANDARD_SLOT.heightFrac * (faceFileY / info.height);

  const errors = [];
  const warnings = [];
  const perViewport = CHECK_VIEWPORTS.map((vp) => ({ viewport: vp.name, headTopFrac, faceFrac }));

  if (headTopFrac < 0) {
    errors.push(`${filePath}: head crops above the frame at the standard slot (headTop ${headTopFrac.toFixed(3)} of scene height)`);
  }
  if (faceFrac > FACE_WARN_FRAC) {
    warnings.push(`${filePath}: face sits at ${(faceFrac * 100).toFixed(1)}% of scene height, below the readable top 40%`);
  }
  return { errors, warnings, perViewport };
}

export async function checkLocationClutter(fsPath, mobileFocalX) {
  const clutter = await clutterAtColumn(fsPath, mobileFocalX);
  const warnings = [];
  if (clutter > CLUTTER_WARN) {
    warnings.push(`${fsPath}: standing column is cluttered at the phone crop (edge density ${(clutter * 100).toFixed(0)}%)`);
  }
  return { clutter, warnings };
}
