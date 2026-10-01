// Small filesystem helpers shared by every play-art command. Kept dependency
// free (per the brief: no new packages) since these are one-line wrappers.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
// scripts/play-art/lib -> scripts/play-art -> scripts -> repo root. Used only
// to compute sane defaults; every CLI path option still resolves against the
// caller's cwd like a normal tool, so `--out`/`--manifest`/`--public` work
// whether you run from the repo root or not.
export const REPO_ROOT = path.resolve(HERE, "../../..");

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function sizeKB(bytesOrPath) {
  const bytes = typeof bytesOrPath === "number" ? bytesOrPath : fs.statSync(bytesOrPath).size;
  return Math.round((bytes / 1024) * 10) / 10;
}

/** Recursively lists files under dir, returning absolute paths. Missing dir
 *  returns an empty list rather than throwing, since intake subfolders are
 *  optional (a career might have no new heroes yet). */
export function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(p));
    else if (entry.isFile() && !entry.name.startsWith(".")) out.push(p);
  }
  return out;
}

export function filesByExt(dir, exts) {
  return walkFiles(dir).filter((p) => exts.includes(path.extname(p).toLowerCase()));
}

export function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export function writeJSON(p, data) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

/** "/images/play/rn/expressions/rosa-welcoming.webp" + publicRoot ->
 *  <publicRoot>/images/play/rn/expressions/rosa-welcoming.webp. Asset paths
 *  in the manifest are always the site-absolute form the schema requires;
 *  this is the one place that turns one into a real file to read or write,
 *  so tests can point it at a scratch dir standing in for public/. */
export function assetToFsPath(publicRoot, assetSrc) {
  return path.join(publicRoot, assetSrc.replace(/^\//, ""));
}

export const nameNoExt = (p) => path.basename(p, path.extname(p));
