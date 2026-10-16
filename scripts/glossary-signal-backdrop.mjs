// Signal world backgrounds: package and validate (17 Oct 2026, Chandu:
// "add the prompt for the signal backgrounds" so Codex can generate one per
// career world reliably). One 1200 by 800 opaque pixel-art panorama per
// career world, registered in SIGNAL_WORLD_BACKDROPS
// (src/components/glossary/worldBackdrops.ts). See SOP section 7d.
//
//   node scripts/glossary-signal-backdrop.mjs prepare <source.png> <world-slug>
//     Fits the source to 1200 x 800 (cover, centred), flattens any alpha
//     onto the panorama's own dark navy, and writes
//     public/images/glossary/backdrops/signal/<world-slug>.webp under the
//     180 KB budget (the shipped default is 177 KB). Refuses to overwrite
//     unless --force is passed.
//   node scripts/glossary-signal-backdrop.mjs validate
//     Checks every registered panorama: the file exists, 1200 x 800, opaque,
//     within budget, and its world is one of the fifteen career worlds.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public/images/glossary/backdrops/signal');
const W = 1200, H = 800, BUDGET = 180 * 1024;
const WORLDS = ['Business & Finance', 'Tech & Engineering', 'Health & Medicine', 'Arts, Media & Sport', 'Science & Research', 'Teaching & Education', 'Building & Construction', 'Law, Safety & Justice', 'Food & Cooking', 'Farming, Animals & Nature', 'Counseling & Social Work', 'Driving, Flying & Shipping', 'Factories & Making Things', 'Fixing Machines & Engines', 'Personal Care & Community Services'];
const slugOf = (world) => world.toLowerCase().replace(/&/g, '').replace(/,/g, '').trim().replace(/\s+/g, '-');
const SLUGS = new Map(WORLDS.map((w) => [slugOf(w), w]));

const [mode, a, b] = process.argv.slice(2);
const fail = (msg) => { console.error(`glossary-signal-backdrop: ${msg}`); process.exit(1); };

if (mode === 'prepare') {
  if (!a || !b) fail('usage: prepare <source.png> <world-slug>');
  if (!SLUGS.has(b)) fail(`"${b}" is not a career world slug. Use one of: ${[...SLUGS.keys()].join(', ')}`);
  if (!fs.existsSync(a)) fail(`no source at ${a}`);
  const out = path.join(OUT_DIR, `${b}.webp`);
  if (fs.existsSync(out) && !process.argv.includes('--force')) fail(`${path.relative(ROOT, out)} exists; pass --force to replace it`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const meta = await sharp(a).metadata();
  if (Math.abs(meta.width / meta.height - W / H) > 0.08) console.warn(`note: source is ${meta.width} x ${meta.height}; it will be cropped to 3:2 from the centre`);
  const base = sharp(a).resize(W, H, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).flatten({ background: '#0b1230' });
  let q = 88, buf;
  do { buf = await base.clone().webp({ quality: q, effort: 6 }).toBuffer(); q -= 4; } while (buf.length > BUDGET && q >= 60);
  if (buf.length > BUDGET) fail(`could not get under ${BUDGET / 1024} KB; simplify the source`);
  fs.writeFileSync(out, buf);
  console.log(`wrote ${path.relative(ROOT, out)} (${W} x ${H}, ${Math.round(buf.length / 1024)} KB, quality ${q + 4}). Register it: "${SLUGS.get(b)}": "/images/glossary/backdrops/signal/${b}.webp" in SIGNAL_WORLD_BACKDROPS.`);
} else if (mode === 'validate') {
  const src = fs.readFileSync(path.join(ROOT, 'src/components/glossary/worldBackdrops.ts'), 'utf8');
  const block = src.slice(src.indexOf('SIGNAL_WORLD_BACKDROPS'), src.indexOf('DRIFT_WORLD_SILHOUETTES'));
  const entries = [...block.matchAll(/^\s*"([^"]+)":\s*"([^"]+)"/gm)].map((m) => [m[1], m[2]]);
  const problems = [];
  for (const [world, url] of entries) {
    if (!WORLDS.includes(world)) problems.push(`"${world}" is not a career world`);
    const file = path.join(ROOT, 'public', url);
    if (!fs.existsSync(file)) { problems.push(`${world}: missing ${url}`); continue; }
    const m = await sharp(file).metadata();
    if (m.width !== W || m.height !== H) problems.push(`${world}: ${m.width} x ${m.height}, needs ${W} x ${H}`);
    if (m.hasAlpha) problems.push(`${world}: has transparency, must be opaque`);
    const size = fs.statSync(file).size;
    if (size > BUDGET) problems.push(`${world}: ${Math.round(size / 1024)} KB, budget ${BUDGET / 1024} KB`);
  }
  if (problems.length) fail(`\n- ${problems.join('\n- ')}`);
  console.log(`signal backdrops ok: ${entries.length} of ${WORLDS.length} worlds registered${entries.length ? ` (${entries.map((e) => e[0]).join(', ')})` : ''}; the rest use the default panorama`);
} else {
  fail('usage: prepare <source.png> <world-slug> [--force] | validate');
}
