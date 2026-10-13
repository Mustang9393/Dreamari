import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';

// Reproducible raster packaging, not image generation. Preserve the original
// source and real alpha; never redraw, stretch or silently overwrite a set.
// Run from repo root. See docs/handoff/play-sop/12-glossary-art-pipeline.md.
const [command, manifestPath, reviewDirectory] = process.argv.slice(2);
if (!['prompts', 'prepare', 'validate', 'preview'].includes(command) || !manifestPath) {
  throw new Error('Usage: node scripts/glossary-art.mjs prompts|prepare|validate|preview <manifest.json> [review-directory]');
}
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const themes = ['drift', 'signal'];
const sizes = { drift: [768, 256], signal: [768, 320] };
const outputRoot = path.resolve('public/images/glossary', manifest.version);
const receiptPath = manifestPath.replace(/\.json$/, '-receipt.json');
if (!/^[a-z0-9-]+$/.test(manifest.version) || !/^[a-z0-9-]+$/.test(manifest.career)) throw new Error('Unsafe version or career');
const ids = new Set();
const slugs = new Set();
for (const term of manifest.terms) {
  if (ids.has(term.id) || slugs.has(term.slug) || !/^[a-z0-9-]+$/.test(term.slug)) throw new Error(`Duplicate id/slug or unsafe slug: ${term.id}`);
  ids.add(term.id);
  slugs.add(term.slug);
}
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const prompt = (term, theme) => manifest.promptTemplate.replace('{{SUBJECT}}', term.brief).replace('{{STYLE}}', manifest.styles[theme]);
if (command === 'prompts') {
  for (const term of manifest.terms) for (const theme of themes) {
    console.log(JSON.stringify({ id: term.id, theme, references: manifest.styleReferences[theme].map(ref => path.resolve(ref)), transparent_background: true, prompt: prompt(term, theme) }));
  }
  process.exit(0);
}

if (command === 'preview') {
  if (!reviewDirectory) throw new Error('Pass an explicit preview output directory.');
  await mkdir(reviewDirectory, { recursive: true });
  const escape = (s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
  for (const theme of themes) {
    const anchors = theme === 'drift'
      ? ['company', 'product', 'service', 'customer', 'profit'].map(id => ({ id: `L1 ${id}`, file: `public/images/glossary/themes-oct08/drift/${id}.webp` }))
      : ['building', 'sneaker', 'palette-sneaker', 'cloud-sale-sneaker', 'coins-320'].map(id => ({ id: `L1 ${id}`, file: `public/images/glossary/signal/${id}.webp` }));
    const cells = [...anchors, ...manifest.terms.map(term => ({ id: `L${term.level} ${term.id}`, file: path.join(outputRoot, theme, `${term.slug}.webp`) }))];
    const layers = [];
    for (const [index, cell] of cells.entries()) {
      const left = index % 5 * 220, top = Math.floor(index / 5) * 240;
      const image = await sharp(cell.file).resize(184, 184, { fit: 'contain', kernel: theme === 'signal' ? 'nearest' : 'lanczos3', background: '#00000000' }).png().toBuffer();
      layers.push({ input: image, left: left + 18, top: top + 14 });
      const label = Buffer.from(`<svg width="220" height="32"><text x="110" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="white">${escape(cell.id)}</text></svg>`);
      layers.push({ input: label, left, top: top + 200 });
    }
    await sharp({ create: { width: 1100, height: 960, channels: 4, background: '#121b30' } }).composite(layers).png().toFile(path.join(reviewDirectory, `${theme}-contact-sheet.png`));
    console.log(`Preview: ${theme}-contact-sheet.png, top row is unchanged Level 1`);
  }
  process.exit(0);
}

async function alphaBounds(bytes) {
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, right = -1, top = info.height, bottom = -1, transparent = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const a = data[(y * info.width + x) * 4 + 3];
    if (a < 16) transparent++;
    if (a > 16) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
  }
  if (right < left || transparent / (info.width * info.height) < .05) throw new Error('Empty image or missing genuine transparency');
  return { left, top, width: right - left + 1, height: bottom - top + 1, canvasWidth: info.width, canvasHeight: info.height };
}

// Preflight the WHOLE set before creating any output; preserve existing files.
if (command === 'prepare') {
  let receiptExists = false;
  try { await access(receiptPath); receiptExists = true; } catch { /* New set. */ }
  if (receiptExists) throw new Error(`Receipt exists; choose a new version: ${receiptPath}`);
  for (const term of manifest.terms) for (const theme of themes) {
    if (!term.sources[theme]) throw new Error(`Missing source: ${theme}/${term.id}`);
    const src = await readFile(term.sources[theme]);
    if (!(await sharp(src).metadata()).hasAlpha) throw new Error(`No alpha: ${theme}/${term.id}`);
    const box = await alphaBounds(src);
    if (box.left < 3 || box.top < 3 || box.left + box.width > box.canvasWidth - 3 || box.top + box.height > box.canvasHeight - 3) throw new Error(`Artwork touches source edge: ${theme}/${term.id}`);
    for (const size of sizes[theme]) {
      const dest = path.join(outputRoot, theme, `${term.slug}${size === 768 ? '' : `-${size}`}.webp`);
      try { await access(dest); } catch { continue; }
      throw new Error(`Output exists; choose a new version: ${dest}`);
    }
  }
  for (const term of manifest.terms) for (const theme of themes) {
    const src = await readFile(term.sources[theme]);
    const { left, top, width, height } = await alphaBounds(src);
    const cropped = await sharp(src).extract({ left, top, width, height }).png().toBuffer();
    // Pixel theme is sampled onto one 128px grid once, then enlarged at an
    // integer factor. Its two outputs share the same pixel construction.
    const inner = theme === 'signal' ? 112 : 692;
    const base = await sharp(cropped).resize(inner, inner, { fit: 'contain', kernel: theme === 'signal' ? 'nearest' : 'lanczos3', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const destDir = path.join(outputRoot, theme);
    await mkdir(destDir, { recursive: true });
    for (const size of sizes[theme]) {
      let pipeline;
      if (theme === 'signal') {
        const sprite = await sharp({ create: { width: 128, height: 128, channels: 4, background: '#00000000' } }).composite([{ input: base, left: 8, top: 8 }]).png().toBuffer();
        // 320 uses a 160px grid padded from 128 then doubled, no fractional
        // pixel resampling. 768 is the original 128px grid enlarged 6x.
        const grid = size === 320 ? await sharp(sprite).extend({ top: 16, bottom: 16, left: 16, right: 16, background: '#00000000' }).png().toBuffer() : sprite;
        pipeline = sharp(grid).resize(size, size, { kernel: 'nearest' }).webp({ lossless: true, effort: 6 });
      } else {
        const fitted = await sharp(base).resize(Math.round(size * .9), Math.round(size * .9), { fit: 'contain', background: '#00000000' }).png().toBuffer();
        const padding = Math.floor((size - Math.round(size * .9)) / 2);
        pipeline = sharp({ create: { width: size, height: size, channels: 4, background: '#00000000' } }).composite([{ input: fitted, left: padding, top: padding }]).webp({ quality: 84, alphaQuality: 100, effort: 6 });
      }
      await pipeline.toFile(path.join(destDir, `${term.slug}${size === 768 ? '' : `-${size}`}.webp`));
    }
    console.log(`Prepared ${theme}/${term.slug}`);
  }
}

const receipt = { schemaVersion: 1, career: manifest.career, version: manifest.version, provider: manifest.provider, references: {}, assets: [] };
for (const theme of themes) receipt.references[theme] = await Promise.all(manifest.styleReferences[theme].map(async ref => ({ path: path.relative(process.cwd(), ref), sha256: hash(await readFile(ref)) })));
for (const term of manifest.terms) for (const theme of themes) {
  const source = await readFile(term.sources[theme]);
  const revisions = await Promise.all((term.revisionPrompts?.[theme] ?? []).map(async revision => ({ inputName: path.basename(revision.input), inputSha256: hash(await readFile(revision.input)), prompt: revision.prompt })));
  const entry = { id: term.id, level: term.level, theme, sourceName: path.basename(term.sources[theme]), sourceSha256: hash(source), prompt: prompt(term, theme), revisions, outputs: [] };
  for (const size of sizes[theme]) {
    const dest = path.join(outputRoot, theme, `${term.slug}${size === 768 ? '' : `-${size}`}.webp`);
    const bytes = await readFile(dest), meta = await sharp(bytes).metadata(), box = await alphaBounds(bytes);
    if (meta.width !== size || meta.height !== size || !meta.hasAlpha) throw new Error(`Wrong output geometry: ${dest}`);
    if (box.left < size * .04 || box.top < size * .04 || box.left + box.width > size * .96 || box.top + box.height > size * .96) throw new Error(`Missing safe margin: ${dest}`);
    if (bytes.length > (size === 768 ? 140000 : 35000)) throw new Error(`Over byte budget: ${dest}`);
    entry.outputs.push({ path: path.relative(process.cwd(), dest), width: size, height: size, bytes: bytes.length, sha256: hash(bytes), alphaBounds: box });
  }
  receipt.assets.push(entry);
}
if (command === 'prepare') await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
if (command === 'validate') {
  const saved = JSON.parse(await readFile(receiptPath, 'utf8'));
  if (JSON.stringify(saved) !== JSON.stringify(receipt)) throw new Error('Sources, references, prompts or outputs differ from the saved receipt. Review the change; do not silently replace the receipt.');
}
console.log(`Validated ${receipt.assets.length} illustrations / ${receipt.assets.length * 2} WebP files; alpha, size, margins and byte budgets pass.`);
