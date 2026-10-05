// `extract`: the no-Codex front door (SOP chapter 9). Turns whatever images
// a career's art came as -- composed scenes with people in them, people-free
// rooms, first-person moments -- into the intake folders `process` already
// reads, with Apple's on-device subject lifting (Vision) doing the cutting.
//
//   art-intake/<career>/scenes/*        anything, as it came
//     -> no people in it               copied to plates/ (a room)
//     -> people in it                  one transparent PNG per person in
//                                      cutouts/, a numbered contact sheet
//                                      (cutouts/_sheet.jpg) and assign.json
//
//   then a person names the cutouts they want in assign.json
//   ("<scene>-2.png": "maya-welcoming"; leave "" to skip) and runs
//   `extract <career> --assign`, which copies each named cutout into
//   sprites/<name>.png for `process`. Cutouts cut off at the bottom of their
//   scene switch the career to the waist-up sprite standard.
//
// macOS only (Vision). Needs no network and no credits.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

import { REPO_ROOT, ensureDir, filesByExt, nameNoExt } from "./fs-util.mjs";
import { refinedCutout } from "./refine.mjs";

const IMAGE_EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const NATIVE_DIR = path.join(REPO_ROOT, "scripts/play-art/native");
const SOURCE = path.join(NATIVE_DIR, "extract-subjects.swift");
const BINARY = path.join(NATIVE_DIR, ".bin", "extract-subjects");

/** Compiles the Vision helper once (and again whenever the source changes). */
function helper() {
  if (process.platform !== "darwin") throw new Error("extract needs macOS (it uses Apple's Vision subject lifting)");
  const stale = !fs.existsSync(BINARY) || fs.statSync(BINARY).mtimeMs < fs.statSync(SOURCE).mtimeMs;
  if (stale) {
    ensureDir(path.dirname(BINARY));
    console.log("Compiling the Vision helper (once)...");
    execFileSync("swiftc", ["-O", SOURCE, "-o", BINARY], { stdio: "inherit" });
  }
  return BINARY;
}

async function contactSheet(files, outPath) {
  const H = 420;
  const tiles = [];
  for (const file of files) {
    const img = sharp(file);
    const meta = await img.metadata();
    const w = Math.round((meta.width / meta.height) * H);
    const label = Buffer.from(
      `<svg width="${w}" height="34"><rect width="100%" height="34" fill="#000" fill-opacity="0.72"/><text x="10" y="23" font-family="Helvetica" font-size="18" font-weight="700" fill="#ffd34d">${path.basename(file)}</text></svg>`,
    );
    const tile = await sharp({ create: { width: w, height: H, channels: 4, background: { r: 255, g: 0, b: 255, alpha: 1 } } })
      .composite([{ input: await img.resize(w, H).png().toBuffer() }, { input: label, top: 0, left: 0 }])
      .png()
      .toBuffer();
    tiles.push({ tile, w });
  }
  const perRow = 5;
  const rows = [];
  for (let i = 0; i < tiles.length; i += perRow) rows.push(tiles.slice(i, i + perRow));
  const width = Math.max(...rows.map((r) => r.reduce((sum, t) => sum + t.w + 12, 12)));
  const height = rows.length * (H + 12) + 12;
  const composites = [];
  rows.forEach((row, r) => {
    let x = 12;
    for (const t of row) {
      composites.push({ input: t.tile, left: x, top: 12 + r * (H + 12) });
      x += t.w + 12;
    }
  });
  await sharp({ create: { width, height, channels: 3, background: { r: 18, g: 18, b: 22 } } }).composite(composites).jpeg({ quality: 82 }).toFile(outPath);
}

export async function cmdExtract(args, { defaultManifestPath, loadManifest, saveManifest }) {
  const careerId = args._[0];
  if (!careerId) throw new Error("usage: extract <career-id> [--assign] [--in <intake dir>]");
  const intake = args.in ? path.resolve(args.in) : path.join(REPO_ROOT, "art-intake", careerId);
  const scenesDir = path.join(intake, "scenes");
  const cutoutsDir = path.join(intake, "cutouts");
  const assignPath = path.join(cutoutsDir, "assign.json");

  if (args.assign) {
    if (!fs.existsSync(assignPath)) throw new Error(`no ${path.relative(REPO_ROOT, assignPath)} -- run extract first`);
    const assign = JSON.parse(fs.readFileSync(assignPath, "utf8"));
    ensureDir(path.join(intake, "sprites"));
    let copied = 0;
    let waistUp = false;
    for (const [file, entry] of Object.entries(assign.cutouts ?? {})) {
      const name = (entry.name ?? "").trim();
      if (!name || name === "skip") continue;
      if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`assign.json: "${name}" must be lowercase-with-hyphens, like maya-welcoming`);
      fs.copyFileSync(path.join(cutoutsDir, file), path.join(intake, "sprites", `${name}.png`));
      if (entry.touchesBottom) waistUp = true;
      copied += 1;
      console.log(`  ${file} -> sprites/${name}.png`);
    }
    const manifestPath = defaultManifestPath(careerId);
    if (waistUp && fs.existsSync(manifestPath)) {
      const manifest = loadManifest(manifestPath);
      if (manifest.spriteStandard !== "waist-up-legacy") {
        manifest.spriteStandard = "waist-up-legacy";
        saveManifest(manifestPath, manifest);
        console.log("  The cutouts stop at the bottom of their scenes: switched the manifest to the waist-up sprite standard.");
      }
    } else if (waistUp) {
      console.log('  Note: these are waist-up cutouts. After new-career, set "spriteStandard": "waist-up-legacy" in the manifest (or re-run --assign).');
    }
    console.log(`\n${copied} sprite(s) ready. Next: npm run art:process -- ${careerId}`);
    return;
  }

  const scenes = filesByExt(scenesDir, IMAGE_EXTS).sort();
  if (!scenes.length) throw new Error(`no images in ${path.relative(REPO_ROOT, scenesDir)} -- drop the career's images there first`);
  const bin = helper();
  ensureDir(cutoutsDir);
  ensureDir(path.join(intake, "plates"));
  const previous = fs.existsSync(assignPath) ? JSON.parse(fs.readFileSync(assignPath, "utf8")) : { cutouts: {} };
  const assign = { note: 'Name the cutouts you want as sprites ("maya-welcoming"; the last part is the expression: welcoming, proud, concerned, confident, focused, uncertain, composed, assessing). Leave "" to skip. Then: npm run art:extract -- <career> --assign', cutouts: {} };
  const madeCutouts = [];
  const report = { plates: [], withPeople: [], heroes: [] };
  ensureDir(path.join(intake, "heroes"));

  for (const scene of scenes) {
    const base = nameNoExt(scene);
    const out = execFileSync(bin, [scene, cutoutsDir, base], { encoding: "utf8" });
    const sceneLine = out.split("\n").find((l) => l.startsWith("{\"scene\""));
    const peopleInScene = sceneLine ? JSON.parse(sceneLine).people : 0;
    const lines = out.split("\n").filter((l) => l.startsWith("{\"file\""));
    if (!peopleInScene || !lines.length) {
      for (const l of lines) fs.rmSync(path.join(cutoutsDir, JSON.parse(l).file.replace(/\.png$/, ".mask.png")), { force: true });
      // Nobody in it: it is a room.
      const dest = path.join(intake, "plates", path.basename(scene));
      if (!fs.existsSync(dest)) fs.copyFileSync(scene, dest);
      report.plates.push(path.basename(scene));
      continue;
    }
    const people = lines.map((l) => JSON.parse(l));
    report.withPeople.push({ scene: path.basename(scene), people: peopleInScene });
    // A cutout that holds two or more people (two technicians kneeling
    // together, a teammate plus the player's own gloved hand) cannot be a
    // sprite: the scene is a composed moment, so it becomes a hero, shown
    // whole on the beat it belongs to.
    if (people.some((p) => p.people > 1)) {
      const dest = path.join(intake, "heroes", path.basename(scene));
      if (!fs.existsSync(dest)) fs.copyFileSync(scene, dest);
      report.heroes.push(path.basename(scene));
    }
    for (const p of people) {
      const maskPath = path.join(cutoutsDir, p.file.replace(/\.png$/, ".mask.png"));
      if (p.people > 1) {
        fs.rmSync(maskPath, { force: true });
        continue;
      }
      // Hair-safe cut: the mask is re-solved from colour around the outline
      // (refine.mjs), so the background between curls goes clear.
      const cut = await refinedCutout(scene, maskPath);
      fs.rmSync(maskPath, { force: true });
      if (!cut) continue;
      fs.writeFileSync(path.join(cutoutsDir, p.file), cut.png);
      madeCutouts.push(path.join(cutoutsDir, p.file));
      assign.cutouts[p.file] = {
        name: previous.cutouts?.[p.file]?.name ?? "",
        fromScene: path.basename(scene),
        touchesBottom: cut.touchesBottom,
        sizePx: [cut.bbox.width, cut.bbox.height],
      };
    }
  }
  fs.writeFileSync(assignPath, JSON.stringify(assign, null, 2) + "\n");
  if (madeCutouts.length) await contactSheet(madeCutouts, path.join(cutoutsDir, "_sheet.jpg"));

  console.log(`\nRooms (no people found, copied to plates/): ${report.plates.length ? report.plates.join(", ") : "none"}`);
  console.log(`Scenes with people: ${report.withPeople.map((s) => `${s.scene} (${s.people})`).join(", ") || "none"}`);
  console.log(`  -> ${madeCutouts.length} single-person cutout(s) in ${path.relative(REPO_ROOT, cutoutsDir)}/, contact sheet _sheet.jpg`);
  console.log(`Composed moments (people that cannot be separated, copied to heroes/): ${report.heroes.length ? report.heroes.join(", ") : "none"}`);
  console.log("  Any other scene with people can also be a hero: copy it to heroes/ if a beat should show it whole.");
  console.log(`\nNext: name the cutouts you want in ${path.relative(REPO_ROOT, assignPath)}, then npm run art:extract -- ${careerId} --assign`);
}
