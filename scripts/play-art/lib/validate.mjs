// Shared checks behind both `validate` and `qa` (qa is validate plus
// deterministic geometry). Kept in one place so the two commands can't
// silently drift apart on what "referenced file exists" or "sprite matches
// its recorded ratio" means.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { schemaLiteValidate } from "./manifest.mjs";
import { assetToFsPath, walkFiles, sizeKB } from "./fs-util.mjs";
import { greenFringePercent } from "./chroma.mjs";

const RATIO_TOLERANCE = 0.002;
// Legacy careers (IB's reception/exterior plates) ship at 4:3; this is a
// warning, never an error, on purpose -- see the brief on legacy leniency.
const PLATE_RATIO_TOLERANCE = 0.05;
const SIZE_WARN_KB = 250;
const FRINGE_WARN_PERCENT = 15;

export async function runValidate(manifest, publicRoot) {
  const { errors, warnings } = schemaLiteValidate(manifest);

  const spritePaths = new Set();
  const referenced = new Set();
  for (const member of Object.values(manifest.cast || {})) {
    if (member.default) spritePaths.add(member.default);
    if (member.face) referenced.add(member.face);
    if (member.tiers) for (const v of Object.values(member.tiers)) spritePaths.add(v);
  }
  for (const p of spritePaths) referenced.add(p);
  for (const loc of Object.values(manifest.locations || {})) referenced.add(loc.src);

  for (const assetPath of referenced) {
    const fsPath = assetToFsPath(publicRoot, assetPath);
    if (!fs.existsSync(fsPath)) {
      errors.push(`referenced file missing on disk: ${assetPath} (looked at ${fsPath})`);
      continue;
    }
    const kb = sizeKB(fsPath);
    if (kb > SIZE_WARN_KB) warnings.push(`${assetPath}: ${kb}KB, over the ~${SIZE_WARN_KB}KB budget`);
  }

  for (const assetPath of spritePaths) {
    const fsPath = assetToFsPath(publicRoot, assetPath);
    if (!fs.existsSync(fsPath)) continue; // already flagged above
    const meta = await sharp(fsPath).metadata();
    const ratio = +(meta.width / meta.height).toFixed(4);
    const stored = (manifest.portraitRatios || {})[assetPath];
    if (stored === undefined) {
      warnings.push(`${assetPath}: no portraitRatios entry recorded (real ratio ${ratio})`);
    } else if (Math.abs(stored - ratio) > RATIO_TOLERANCE) {
      errors.push(`${assetPath}: portraitRatios says ${stored}, real file measures ${ratio} (off by ${Math.abs(stored - ratio).toFixed(4)})`);
    }

    if (manifest.spriteStandard === "full-figure-1024x2048") {
      if (meta.width !== 1024 || meta.height !== 2048) {
        errors.push(`${assetPath}: expected 1024x2048 for the full-figure standard, got ${meta.width}x${meta.height}`);
      }
      if (!meta.hasAlpha) errors.push(`${assetPath}: no alpha channel`);
    } else if (!meta.hasAlpha) {
      warnings.push(`${assetPath}: no alpha channel (legacy waist-up sprite, allowed but worth a look)`);
    }

    const { data, info } = await sharp(fsPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const fringe = greenFringePercent(data, info.width, info.height);
    if (fringe > FRINGE_WARN_PERCENT) {
      warnings.push(`${assetPath}: ${fringe.toFixed(0)}% of semi-transparent edge pixels are green-dominant (possible under-despilled key)`);
    }
  }

  for (const [id, loc] of Object.entries(manifest.locations || {})) {
    const fsPath = assetToFsPath(publicRoot, loc.src);
    if (!fs.existsSync(fsPath)) continue;
    const meta = await sharp(fsPath).metadata();
    const ratio = meta.width / meta.height;
    if (Math.abs(ratio - 16 / 9) > PLATE_RATIO_TOLERANCE) {
      warnings.push(`location "${id}": plate is ${meta.width}x${meta.height} (${ratio.toFixed(3)}), not close to 16:9`);
    }
  }

  const folderRoot = path.join(publicRoot, "images/play", manifest.folder || "");
  if (fs.existsSync(folderRoot)) {
    const referencedFs = new Set([...referenced].map((a) => assetToFsPath(publicRoot, a)));
    for (const file of walkFiles(folderRoot)) {
      if (!referencedFs.has(file)) warnings.push(`orphaned file, not referenced by the manifest: ${path.relative(publicRoot, file)}`);
    }
  }

  return { errors, warnings };
}
