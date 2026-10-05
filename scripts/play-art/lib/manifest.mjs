// Manifest read/write and a small hand-written validator for
// src/components/play/art/career-art.schema.json. Not a general JSON-Schema
// engine (no new dependency) -- just the specific rules that schema encodes,
// kept next to it so the two don't drift silently.
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT, ensureDir } from "./fs-util.mjs";

// Mirrors src/components/play/art/index.ts's STANDARD_SLOT. Duplicated
// rather than imported because this is plain Node ESM reading a .ts file,
// and the brief rules out adding a build step or dependency to bridge that.
export const STANDARD_SLOT = { x: 0.5, baselineY: 1.78, heightFrac: 1.75 };
// The waist-up standard's slot: the sprite's cut edge rests on the bottom of
// the frame (what IB's cast has always used, and what a cutout lifted out of
// a composed scene by `extract` usually is).
export const WAIST_UP_SLOT = { x: 0.5, baselineY: 0.99, heightFrac: 0.9 };
/** The standing slot every auto-placed room gets, from the career's sprite
 *  standard. */
export function slotFor(manifest) {
  return manifest?.spriteStandard === "waist-up-legacy" ? WAIST_UP_SLOT : STANDARD_SLOT;
}

export const TIERS = ["best", "acceptable", "wrong", "risky", "none"];
export const SPRITE_STANDARDS = ["full-figure-1024x2048", "waist-up-legacy"];
export const EXPRESSION_VOCAB = ["welcoming", "proud", "concerned", "confident", "focused", "uncertain", "composed", "assessing"];
// The beat-to-room mapper (scripts/play-beats) reads this off every location.
export const LOCATION_ROLES = [
  "work-floor",
  "work-floor-night",
  "private-meeting",
  "formal-meeting",
  "break",
  "transition",
  "arrival",
  "specialist",
];

const ID_RE = /^[a-z0-9-]+$/;
const ASSET_RE = /^\/images\/play\//;

export function defaultManifestPath(careerId) {
  return path.join(REPO_ROOT, "src/components/play/art", `${careerId}.json`);
}

export function loadManifest(manifestPath) {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

export function saveManifest(manifestPath, manifest) {
  ensureDir(path.dirname(manifestPath));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

function isFraction(v) {
  return typeof v === "number" && v >= 0 && v <= 1;
}

/** Returns { errors, warnings }. Errors are schema/content violations that
 *  should block a release; warnings are informational (legacy quirks,
 *  auto-generated placeholders worth a human glance, size/orphan notices). */
export function schemaLiteValidate(manifest) {
  const errors = [];
  const warnings = [];
  const m = manifest || {};

  for (const key of ["career", "folder", "spriteStandard", "locations", "cast", "portraitRatios", "beatLocations"]) {
    if (!(key in m)) errors.push(`manifest is missing required field "${key}"`);
  }
  if (m.career && !ID_RE.test(m.career)) errors.push(`career "${m.career}" must match ^[a-z0-9-]+$`);
  if (m.folder && !ID_RE.test(m.folder)) errors.push(`folder "${m.folder}" must match ^[a-z0-9-]+$`);
  if (m.spriteStandard && !SPRITE_STANDARDS.includes(m.spriteStandard)) {
    errors.push(`spriteStandard "${m.spriteStandard}" is not one of ${SPRITE_STANDARDS.join(", ")}`);
  }

  for (const [id, loc] of Object.entries(m.locations || {})) {
    if (!loc.src || !ASSET_RE.test(loc.src)) errors.push(`location "${id}": src must start with /images/play/`);
    if (typeof loc.alt !== "string" || loc.alt.length < 10) {
      errors.push(`location "${id}": alt must be a string of at least 10 characters`);
    } else if (/^TODO/i.test(loc.alt.trim())) {
      errors.push(`location "${id}": alt is still a TODO placeholder ("${loc.alt}")`);
    }
    for (const key of ["focal", "mobileFocal"]) {
      const pt = loc[key];
      if (!pt || !isFraction(pt.x) || !isFraction(pt.y)) errors.push(`location "${id}": ${key} needs numeric x/y in 0..1`);
    }
    if (loc.characterAnchor) validateSlot(loc.characterAnchor, `location "${id}" characterAnchor`, errors);
    if (loc.characterAnchors) loc.characterAnchors.forEach((s, i) => validateSlot(s, `location "${id}" characterAnchors[${i}]`, errors));
    if (loc.role !== undefined && !LOCATION_ROLES.includes(loc.role)) {
      errors.push(`location "${id}": role "${loc.role}" is not one of ${LOCATION_ROLES.join(", ")}`);
    }
    if (loc.locked !== undefined && typeof loc.locked !== "boolean") {
      errors.push(`location "${id}": locked must be a boolean`);
    }
  }

  for (const [name, member] of Object.entries(m.cast || {})) {
    if (!member.default || !ASSET_RE.test(member.default)) errors.push(`cast "${name}": default must start with /images/play/`);
    if (member.face && !ASSET_RE.test(member.face)) errors.push(`cast "${name}": face must start with /images/play/`);
    if (member.tiers) {
      for (const [tier, asset] of Object.entries(member.tiers)) {
        if (!TIERS.includes(tier)) errors.push(`cast "${name}": tier "${tier}" is not one of ${TIERS.join(", ")}`);
        if (!ASSET_RE.test(asset)) errors.push(`cast "${name}": tier "${tier}" asset must start with /images/play/`);
      }
    }
    if (member.voicePitch !== undefined && (member.voicePitch < 200 || member.voicePitch > 900)) {
      errors.push(`cast "${name}": voicePitch ${member.voicePitch} is out of 200..900`);
    }
  }

  for (const [key, val] of Object.entries(m.portraitRatios || {})) {
    if (typeof val !== "number" || val <= 0) errors.push(`portraitRatios["${key}"] must be a positive number`);
  }

  return { errors, warnings };
}

function validateSlot(slot, label, errors) {
  if (!isFraction(slot.x)) errors.push(`${label}: x must be 0..1`);
  if (typeof slot.baselineY !== "number" || slot.baselineY < 0 || slot.baselineY > 3) errors.push(`${label}: baselineY must be 0..3`);
  if (typeof slot.heightFrac !== "number" || slot.heightFrac < 0.1 || slot.heightFrac > 3) errors.push(`${label}: heightFrac must be 0.1..3`);
}
