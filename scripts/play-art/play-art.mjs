#!/usr/bin/env node
// Art post-processing CLI for Play career simulations. Turns Joshua/Codex's
// raw sprites and room plates into the standard on-disk assets plus the
// per-career manifest (src/components/play/art/<career>.json) the engine
// reads, so scaling to every new career doesn't mean a human doing the same
// eight steps by hand each time. See scripts/play-art/README.md for the
// day-to-day flow; see docs/handoff/play-sop/07-art-direction-and-prompts.md
// and docs/handoff/sprite-master-prompt.md for why each step is shaped this way.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { REPO_ROOT, ensureDir, filesByExt, sizeKB, nameNoExt, assetToFsPath, readJSON } from "./lib/fs-util.mjs";
import { processSprite } from "./lib/sprite.mjs";
import { computeFaceCropBox, renderFaceChip } from "./lib/face-chip.mjs";
import { processPlate, processHero } from "./lib/plates.mjs";
import {
  defaultManifestPath,
  loadManifest,
  saveManifest,
  schemaLiteValidate,
  STANDARD_SLOT,
  EXPRESSION_VOCAB,
  LOCATION_ROLES,
} from "./lib/manifest.mjs";
import { runValidate } from "./lib/validate.mjs";
import { checkSpriteGeometry, checkLocationClutter } from "./lib/qa.mjs";
import { computePlacement, screenFractionOf, CHECK_VIEWPORTS } from "./lib/placement.mjs";
import { buildPromptPack, readJSONSafe } from "./lib/prompts.mjs";

const SPRITE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const ACRONYMS = { hr: "HR", ceo: "CEO", cfo: "CFO", coo: "COO", cno: "CNO", it: "IT", hq: "HQ" };

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const eq = key.indexOf("=");
      if (eq >= 0) {
        args[key.slice(0, eq)] = key.slice(eq + 1);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
        args[key] = argv[++i];
      } else {
        args[key] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function titleCaseId(id) {
  return id
    .split("-")
    .map((w) => ACRONYMS[w] || w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** "cobalt-hr-welcoming" -> { character: "cobalt-hr", expression: "welcoming" }.
 *  Falls back to treating the whole name as the character with expression
 *  "default" if the last hyphen segment isn't a known expression -- flagged
 *  by the caller, since that's almost certainly a naming-convention miss. */
function splitSpriteName(basename) {
  const parts = basename.split("-");
  const last = parts[parts.length - 1].toLowerCase();
  if (parts.length > 1 && EXPRESSION_VOCAB.includes(last)) {
    return { character: parts.slice(0, -1).join("-"), expression: last, matched: true };
  }
  return { character: basename, expression: "default", matched: false };
}

function pickFirst(available, priority) {
  for (const p of priority) if (available.has(p)) return p;
  return null;
}

// ---------------------------------------------------------------- new-career

async function cmdNewCareer(args) {
  const careerId = args._[0];
  if (!careerId) throw new Error("usage: new-career <career-id> --folder <short> --firm \"<Firm Name>\"");
  const folder = args.folder;
  const firm = args.firm;
  if (!folder) throw new Error("--folder <short> is required (public/images/play/<short>)");
  if (!firm) throw new Error('--firm "<Firm Name>" is required (goes in the scaffold note)');

  const base = args.out ? path.resolve(args.out) : REPO_ROOT;
  const manifestPath = args.out ? path.join(base, `${careerId}.json`) : defaultManifestPath(careerId);
  const intakeDir = path.join(base, "art-intake", careerId);

  if (fs.existsSync(manifestPath)) {
    throw new Error(`refusing to overwrite existing manifest: ${manifestPath}`);
  }

  for (const sub of ["sprites", "plates", "heroes"]) ensureDir(path.join(intakeDir, sub));

  const readme = `Art intake: ${careerId} (${firm})
====================================================

Drop source art here, then run:
  node scripts/play-art/play-art.mjs process ${careerId}

sprites/<character>-<expression>.(png|jpg|webp)
  Expression is one of: ${EXPRESSION_VOCAB.join(", ")}.
  If Codex couldn't produce true alpha, generate on a flat #00FF00
  background instead -- \`process\` chroma-keys it automatically. Full
  figure, head to shoes, ~4% margin above hair / ~2% below shoes; see
  docs/handoff/sprite-master-prompt.md for the exact spec, or run
  \`node scripts/play-art/play-art.mjs prompts ${careerId} --cast cast.json --rooms rooms.json\`
  to generate the Codex prompt text from a cast list.

plates/<location-id>.(png|jpg|webp)
  One people-free room per file, any size; \`process\` resizes to 1920x1080.
  Optionally drop a rooms.json here (see scripts/play-art/templates/
  rooms.example.json) to carry each room's semantic \`role\` into the
  manifest for the beat-to-room mapper.

heroes/<beat>.(png|jpg|webp)
  One illustrated beat scene per file, named after the script's beat id.

What process does for you automatically: chroma-key + despeckle + trim +
place sprites on the 1024x2048 standard canvas, cut a face chip per
character (flagged for a human glance), resize plates/heroes, write
portraitRatios/cast/locations into the manifest, and auto-place every new
room's focal point (no dragging a slider -- see \`place\`).

The only human step left: art QA (identity, brands, style) -- see
docs/handoff/play-sop/07-art-direction-and-prompts.md section 5 -- and a
glance at the auto-generated face chips. Run \`qa ${careerId}\` before
calling a career done.
`;
  fs.writeFileSync(path.join(intakeDir, "README.txt"), readme);

  const manifest = {
    $schema: "./career-art.schema.json",
    career: careerId,
    folder,
    spriteStandard: "full-figure-1024x2048",
    notes: [`Scaffolded by scripts/play-art for ${firm}; process fills sprites/plates/cast once art lands in the intake folder.`],
    locations: {},
    cast: {},
    portraitRatios: {},
    beatLocations: {},
  };
  const { errors } = schemaLiteValidate(manifest);
  if (errors.length) throw new Error(`scaffolded manifest fails its own schema check: ${errors.join("; ")}`);
  ensureDir(path.dirname(manifestPath));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`Created ${manifestPath}`);
  console.log(`Created ${intakeDir}/{sprites,plates,heroes}/ + README.txt`);
}

// -------------------------------------------------------------- placement

/** Recomputes focal/mobileFocal/characterAnchor for every location that
 *  isn't locked, using the plate file on disk. Shared by `process`
 *  (runs automatically) and `place` (run by hand, e.g. after re-tuning). */
async function applyPlacement(manifest, publicRoot, { force = false } = {}) {
  const rows = [];
  for (const [id, loc] of Object.entries(manifest.locations || {})) {
    if (loc.locked && !force) {
      rows.push({ id, skipped: "locked" });
      continue;
    }
    const fsPath = assetToFsPath(publicRoot, loc.src);
    if (!fs.existsSync(fsPath)) {
      rows.push({ id, skipped: `plate file missing at ${fsPath}` });
      continue;
    }
    const before = { focal: loc.focal, mobileFocal: loc.mobileFocal };
    const placement = await computePlacement(fsPath);
    loc.focal = placement.focal;
    loc.mobileFocal = placement.mobileFocal;
    loc.characterAnchor = { ...STANDARD_SLOT };
    rows.push({ id, before, after: placement, clutterNorm: placement.clutterNorm });
  }
  return rows;
}

function printPlacementRows(rows) {
  for (const r of rows) {
    if (r.skipped) {
      console.log(`  ${r.id}: skipped (${r.skipped})`);
      continue;
    }
    const dFocalX = r.before.focal ? Math.abs(r.before.focal.x - r.after.focal.x).toFixed(4) : "n/a (no prior value)";
    const dMobileX = r.before.mobileFocal ? Math.abs(r.before.mobileFocal.x - r.after.mobileFocal.x).toFixed(4) : "n/a (no prior value)";
    console.log(
      `  ${r.id}: focal ${r.before.focal ? JSON.stringify(r.before.focal) + " -> " : ""}${JSON.stringify(r.after.focal)} (deltaX ${dFocalX}), ` +
        `mobileFocal ${r.before.mobileFocal ? JSON.stringify(r.before.mobileFocal) + " -> " : ""}${JSON.stringify(r.after.mobileFocal)} (deltaX ${dMobileX}), ` +
        `standing column clutter ${(r.clutterNorm * 100).toFixed(0)}%`
    );
  }
}

async function cmdPlace(args) {
  const careerId = args._[0];
  if (!careerId) throw new Error("usage: place <career-id> [--manifest <path>] [--public <dir>] [--force]");
  const manifestPath = args.manifest ? path.resolve(args.manifest) : defaultManifestPath(careerId);
  const publicRoot = args.public ? path.resolve(args.public) : path.join(REPO_ROOT, "public");
  const manifest = loadManifest(manifestPath);

  const rows = await applyPlacement(manifest, publicRoot, { force: !!args.force });
  saveManifest(manifestPath, manifest);

  console.log(`Placed ${rows.filter((r) => !r.skipped).length} location(s) in ${manifestPath}:`);
  printPlacementRows(rows);

  console.log("\nStanding-column screen position by viewport (where the low-clutter column actually lands):");
  for (const r of rows) {
    if (r.skipped) continue;
    // r.after.column is the true intended standing-column fraction this
    // placement solved focal/mobileFocal for; using it directly (rather
    // than re-deriving it from a stored object-position, which is only
    // exact at the aspect it was solved for) keeps this check exact.
    const { column, imageAspect } = r.after;
    console.log(`  ${r.id}:`);
    for (const vp of CHECK_VIEWPORTS) {
      const v = vp.w / vp.h;
      const p = vp.w < 640 ? r.after.mobileFocal.x : r.after.focal.x;
      const screenFrac = screenFractionOf(column, p, imageAspect, v);
      const visible = screenFrac >= 0 && screenFrac <= 1;
      console.log(`    ${vp.name}: ${(screenFrac * 100).toFixed(1)}% of viewport width${visible ? "" : "  (OFF-SCREEN at this breakpoint)"}`);
    }
  }
}

// ------------------------------------------------------------------- process

async function cmdProcess(args) {
  const careerId = args._[0];
  if (!careerId) throw new Error("usage: process <career-id> [--in <dir>] [--out <dir>] [--manifest <path>] [--green]");
  const manifestPath = args.manifest ? path.resolve(args.manifest) : defaultManifestPath(careerId);
  if (!fs.existsSync(manifestPath)) throw new Error(`no manifest at ${manifestPath} -- run new-career first`);
  const manifest = loadManifest(manifestPath);
  const folder = manifest.folder;

  const inDir = args.in ? path.resolve(args.in) : path.join(REPO_ROOT, "art-intake", careerId);
  const outDir = args.out ? path.resolve(args.out) : path.join(REPO_ROOT, "public/images/play", folder);
  const forceGreen = !!args.green;

  const report = { sprites: [], plates: [], heroes: [], flaggedFaceChips: [], warnings: [], errors: [] };

  // --- sprites ---
  const spriteFiles = filesByExt(path.join(inDir, "sprites"), SPRITE_EXTS).sort();
  const byCharacter = new Map(); // character -> Map(expression -> { assetPath, canvasRaw, result })
  ensureDir(path.join(outDir, "expressions"));

  for (const file of spriteFiles) {
    const basename = nameNoExt(file);
    const { character, expression, matched } = splitSpriteName(basename);
    if (!matched) report.warnings.push(`${basename}: last segment isn't a known expression (${EXPRESSION_VOCAB.join("|")}); treated whole name as the character with expression "default" -- check the filename`);
    let result;
    try {
      result = await processSprite(file, { forceGreen });
    } catch (e) {
      report.errors.push(e.message);
      continue;
    }
    const outName = `${character}-${expression}.webp`;
    const outPath = path.join(outDir, "expressions", outName);
    fs.writeFileSync(outPath, result.webp);
    const assetPath = `/images/play/${folder}/expressions/${outName}`;

    manifest.portraitRatios = manifest.portraitRatios || {};
    manifest.portraitRatios[assetPath] = result.ratio;

    if (!byCharacter.has(character)) byCharacter.set(character, new Map());
    byCharacter.get(character).set(expression, { assetPath, canvasRaw: result.canvasRaw, figureTop: result.figureTop, figureHeight: result.figureHeight });

    report.sprites.push({
      file: path.relative(REPO_ROOT, file),
      out: assetPath,
      kb: sizeKB(outPath),
      chromaKeyed: result.chromaKeyed,
      removedIslandPixels: result.removedIslandPixels,
      note: result.note,
    });
  }

  // --- cast + face chips, per character ---
  manifest.cast = manifest.cast || {};
  const DEFAULT_PRIORITY = ["welcoming", "composed", "confident", "assessing", "focused"];
  const BEST_PRIORITY = ["proud", "confident"];
  const ACCEPTABLE_PRIORITY = ["welcoming", "focused", "composed"];
  const WRONG_PRIORITY = ["concerned", "uncertain"];

  for (const [character, exprs] of byCharacter) {
    const available = new Set(exprs.keys());
    const defaultExpr = pickFirst(available, DEFAULT_PRIORITY) || [...available][0];
    const defaultEntry = exprs.get(defaultExpr);
    const displayName = titleCaseId(character);

    const castEntry = { default: defaultEntry.assetPath };

    if (available.size > 1) {
      const best = pickFirst(available, BEST_PRIORITY);
      const acceptable = pickFirst(available, ACCEPTABLE_PRIORITY);
      const wrong = pickFirst(available, WRONG_PRIORITY);
      const tiers = {};
      if (best) tiers.best = exprs.get(best).assetPath;
      if (acceptable) tiers.acceptable = exprs.get(acceptable).assetPath;
      if (wrong) {
        tiers.wrong = exprs.get(wrong).assetPath;
        tiers.risky = exprs.get(wrong).assetPath;
      }
      if (Object.keys(tiers).length) {
        tiers.none = defaultEntry.assetPath;
        castEntry.tiers = tiers;
      }
    }

    // Face chip, from the default sprite's already-placed canvas.
    const box = computeFaceCropBox(defaultEntry.canvasRaw, 1024, 2048, defaultEntry.figureTop, defaultEntry.figureHeight);
    if (box) {
      const chip = await renderFaceChip(defaultEntry.canvasRaw, 1024, 2048, box);
      const faceName = `face-${character}.webp`;
      const facePath = path.join(outDir, faceName);
      fs.writeFileSync(facePath, chip);
      castEntry.face = `/images/play/${folder}/${faceName}`;
      report.flaggedFaceChips.push(`/images/play/${folder}/${faceName} (auto-framed from ${defaultEntry.assetPath}; eyeball hairline/chin/centring)`);
    } else {
      report.warnings.push(`${character}: could not locate a hairline in the default sprite; no face chip generated`);
    }

    manifest.cast[displayName] = { ...(manifest.cast[displayName] || {}), ...castEntry };
  }

  // --- plates ---
  ensureDir(path.join(outDir, "locations"));
  const plateFiles = filesByExt(path.join(inDir, "plates"), SPRITE_EXTS).sort();
  let roomRoles = {};
  const roomsJsonPath = path.join(inDir, "rooms.json");
  if (fs.existsSync(roomsJsonPath)) {
    for (const r of readJSON(roomsJsonPath)) if (r.id && r.role) roomRoles[r.id] = r.role;
  }
  manifest.locations = manifest.locations || {};
  for (const file of plateFiles) {
    const id = nameNoExt(file);
    const buf = await processPlate(file);
    const outPath = path.join(outDir, "locations", `${id}.webp`);
    fs.writeFileSync(outPath, buf);
    const assetPath = `/images/play/${folder}/locations/${id}.webp`;

    if (manifest.locations[id]) {
      report.plates.push({ id, out: assetPath, kb: sizeKB(outPath), note: "location already tuned in the manifest; left untouched" });
      continue;
    }
    const role = roomRoles[id];
    if (role && !LOCATION_ROLES.includes(role)) report.warnings.push(`rooms.json: room "${id}" has unknown role "${role}"`);
    manifest.locations[id] = {
      src: assetPath,
      alt: "TODO: describe",
      focal: { x: 0.5, y: 0.45 },
      mobileFocal: { x: 0.5, y: 0.42 },
      characterAnchor: { ...STANDARD_SLOT },
      ...(role && LOCATION_ROLES.includes(role) ? { role } : {}),
    };
    report.plates.push({ id, out: assetPath, kb: sizeKB(outPath), note: "new location added" });
  }

  // --- heroes ---
  const heroFiles = filesByExt(path.join(inDir, "heroes"), SPRITE_EXTS).sort();
  for (const file of heroFiles) {
    const beat = nameNoExt(file);
    const buf = await processHero(file);
    const outPath = path.join(outDir, `${beat}.webp`);
    fs.writeFileSync(outPath, buf);
    report.heroes.push({ beat, out: `/images/play/${folder}/${beat}.webp`, kb: sizeKB(outPath) });
  }

  // --- auto-place every unlocked location (no human dragging a slider) ---
  // outDir is always <publicRoot>/images/play/<folder>; strip those three
  // segments back off to get the root that loc.src ("/images/play/...")
  // resolves against, whether that's the real public/ or a scratch stand-in.
  const publicRootForPlacement = path.resolve(outDir, "..", "..", "..");
  const placementRows = await applyPlacement(manifest, publicRootForPlacement);

  saveManifest(manifestPath, manifest);

  // --- report ---
  console.log(`\n=== process ${careerId} ===`);
  console.log(`in:  ${inDir}`);
  console.log(`out: ${outDir}`);
  console.log(`manifest: ${manifestPath}\n`);

  console.log(`Sprites (${report.sprites.length}):`);
  for (const s of report.sprites) {
    console.log(`  ${s.file} -> ${s.out}  ${s.kb}KB${s.chromaKeyed ? "  chroma-keyed" : ""}${s.removedIslandPixels ? `  cleaned ${s.removedIslandPixels}px of stray islands` : ""}${s.note ? `  NOTE: ${s.note}` : ""}`);
  }
  console.log(`\nPlates (${report.plates.length}):`);
  for (const p of report.plates) console.log(`  ${p.id} -> ${p.out}  ${p.kb}KB  (${p.note})`);
  console.log(`\nHeroes (${report.heroes.length}):`);
  for (const h of report.heroes) console.log(`  ${h.beat} -> ${h.out}  ${h.kb}KB`);

  console.log(`\nAuto-placed locations:`);
  printPlacementRows(placementRows);

  if (report.flaggedFaceChips.length) {
    console.log(`\nFace chips flagged for human review (${report.flaggedFaceChips.length}):`);
    for (const f of report.flaggedFaceChips) console.log(`  ${f}`);
  }
  if (report.warnings.length) {
    console.log(`\nWarnings:`);
    for (const w of report.warnings) console.log(`  - ${w}`);
  }
  if (report.errors.length) {
    console.log(`\nErrors:`);
    for (const e of report.errors) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

// ------------------------------------------------------------------ validate

async function cmdValidate(args) {
  const careerId = args._[0];
  if (!careerId) throw new Error("usage: validate <career-id> [--manifest <path>] [--public <dir>]");
  const manifestPath = args.manifest ? path.resolve(args.manifest) : defaultManifestPath(careerId);
  const publicRoot = args.public ? path.resolve(args.public) : path.join(REPO_ROOT, "public");
  const manifest = loadManifest(manifestPath);

  const { errors, warnings } = await runValidate(manifest, publicRoot);
  printReport(`validate ${careerId}`, errors, warnings);
  if (errors.length) process.exitCode = 1;
}

function printReport(title, errors, warnings) {
  console.log(`\n=== ${title} ===`);
  console.log(`${errors.length} error(s), ${warnings.length} warning(s)`);
  if (errors.length) {
    console.log("\nErrors:");
    for (const e of errors) console.log(`  - ${e}`);
  }
  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

// --------------------------------------------------------------------- qa

async function cmdQa(args) {
  const careerId = args._[0];
  if (!careerId) throw new Error("usage: qa <career-id> [--manifest <path>] [--public <dir>]");
  const manifestPath = args.manifest ? path.resolve(args.manifest) : defaultManifestPath(careerId);
  const publicRoot = args.public ? path.resolve(args.public) : path.join(REPO_ROOT, "public");
  const manifest = loadManifest(manifestPath);

  const { errors, warnings } = await runValidate(manifest, publicRoot);

  const spritePaths = new Set();
  for (const member of Object.values(manifest.cast || {})) {
    if (member.default) spritePaths.add(member.default);
    if (member.tiers) for (const v of Object.values(member.tiers)) spritePaths.add(v);
  }
  if (manifest.spriteStandard === "full-figure-1024x2048") {
    console.log(`\nGeometry (standard slot baselineY ${STANDARD_SLOT.baselineY} / heightFrac ${STANDARD_SLOT.heightFrac}):`);
    for (const assetPath of spritePaths) {
      const fsPath = assetToFsPath(publicRoot, assetPath);
      if (!fs.existsSync(fsPath)) continue;
      const geo = await checkSpriteGeometry(fsPath);
      errors.push(...geo.errors);
      warnings.push(...geo.warnings);
      console.log(`  ${assetPath}: headTop ${(geo.perViewport[0]?.headTopFrac * 100 || 0).toFixed(1)}% / face ${(geo.perViewport[0]?.faceFrac * 100 || 0).toFixed(1)}% of scene height (same at all 5 viewports -- see qa.mjs's note on why)`);
    }
  } else {
    // The standard slot (baselineY 1.78 / heightFrac 1.75) only describes
    // how a full-figure-1024x2048 sprite renders. A waist-up-legacy career
    // like IB uses its own smaller heightFrac/baselineY per location, so
    // checking against the standard slot here would just be wrong, not
    // lenient -- skip it rather than print numbers that don't describe how
    // the sprite actually appears on screen.
    console.log(`\nGeometry check skipped: spriteStandard is "${manifest.spriteStandard}", not the full-figure standard the standard slot describes.`);
  }

  console.log(`\nStanding-column clutter at the phone crop:`);
  for (const [id, loc] of Object.entries(manifest.locations || {})) {
    const fsPath = assetToFsPath(publicRoot, loc.src);
    if (!fs.existsSync(fsPath) || !loc.mobileFocal) continue;
    const { clutter, warnings: w } = await checkLocationClutter(fsPath, loc.mobileFocal.x);
    warnings.push(...w);
    console.log(`  ${id}: ${(clutter * 100).toFixed(0)}%`);
  }

  printReport(`qa ${careerId}`, errors, warnings);
  if (errors.length) process.exitCode = 1;
}

// ------------------------------------------------------------------- measure

async function cmdMeasure(args) {
  const careerId = args._[0];
  if (!careerId) throw new Error("usage: measure <career-id> [--manifest <path>] [--public <dir>]");
  const manifestPath = args.manifest ? path.resolve(args.manifest) : defaultManifestPath(careerId);
  const publicRoot = args.public ? path.resolve(args.public) : path.join(REPO_ROOT, "public");
  const manifest = loadManifest(manifestPath);

  console.log(`\n=== measure ${careerId} ===`);
  for (const [assetPath, stored] of Object.entries(manifest.portraitRatios || {})) {
    const fsPath = assetToFsPath(publicRoot, assetPath);
    if (!fs.existsSync(fsPath)) {
      console.log(`  ${assetPath}: MISSING at ${fsPath}`);
      continue;
    }
    const meta = await sharp(fsPath).metadata();
    const real = +(meta.width / meta.height).toFixed(4);
    const delta = Math.abs(real - stored);
    console.log(`  ${assetPath}: stored ${stored}  real ${real} (${meta.width}x${meta.height})  delta ${delta.toFixed(4)}${delta > 0.002 ? "  ** OFF BY MORE THAN 0.002 **" : ""}`);
  }
}

// ------------------------------------------------------------------- prompts

async function cmdPrompts(args) {
  const careerId = args._[0];
  if (!careerId) throw new Error('usage: prompts <career-id> --cast cast.json --rooms rooms.json');
  if (!args.cast || !args.rooms) throw new Error("--cast <cast.json> and --rooms <rooms.json> are required (see scripts/play-art/templates/)");

  const manifestPath = args.manifest ? path.resolve(args.manifest) : defaultManifestPath(careerId);
  const manifest = loadManifest(manifestPath);
  const cast = readJSONSafe(path.resolve(args.cast));
  const rooms = readJSONSafe(path.resolve(args.rooms));
  const masterPromptMd = fs.readFileSync(path.join(REPO_ROOT, "docs/handoff/sprite-master-prompt.md"), "utf8");

  const pack = buildPromptPack({ masterPromptMd, cast, rooms, careerId, careerFolder: manifest.folder });

  const outDir = args.out ? path.resolve(args.out, "art-intake", careerId) : path.join(REPO_ROOT, "art-intake", careerId);
  ensureDir(outDir);
  const outPath = path.join(outDir, "PROMPTS.md");
  fs.writeFileSync(outPath, pack);
  console.log(`Wrote ${outPath} (${cast.length} character(s), ${rooms.length} room(s)). These prompts run in Codex -- Claude cannot generate the images.`);
}

// ------------------------------------------------------------------------ main

const COMMANDS = {
  "new-career": cmdNewCareer,
  process: cmdProcess,
  validate: cmdValidate,
  measure: cmdMeasure,
  place: cmdPlace,
  qa: cmdQa,
  prompts: cmdPrompts,
};

async function main() {
  const [, , cmd, ...rest] = process.argv;
  const handler = COMMANDS[cmd];
  if (!handler) {
    console.error(`Usage: node scripts/play-art/play-art.mjs <${Object.keys(COMMANDS).join("|")}> ...`);
    process.exitCode = 1;
    return;
  }
  const args = parseArgs(rest);
  await handler(args);
}

main().catch((e) => {
  console.error(`\nplay-art: ${e.message}`);
  process.exitCode = 1;
});
