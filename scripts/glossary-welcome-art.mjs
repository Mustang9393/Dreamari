// The term packer intentionally takes exactly five terms. Welcome artwork
// has its own 1024px contract, but shares the same references and receipts.
import sharp from 'sharp';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const [command, manifestPath] = process.argv.slice(2);
if (!['prepare', 'validate'].includes(command) || !manifestPath) throw new Error('prepare|validate <manifest>');
const m = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!/^[a-z0-9-]+$/.test(m.version)) throw new Error('Unsafe version');
const receiptPath = manifestPath.replace(/\.json$/, '-welcome-receipt.json');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const receipt = { version: m.version, provider: m.provider, assets: [] };
const pending = [];
for (const theme of ['drift', 'signal']) {
  const source = await readFile(m.welcome.sources[theme]);
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1, transparent = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const alpha = data[(y * info.width + x) * 4 + 3];
    if (alpha < 16) transparent++;
    if (alpha > 16) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  }
  if (right < left || transparent < info.width * info.height * .05 || left < 3 || top < 3 || right > info.width - 4 || bottom > info.height - 4) throw new Error(`Missing alpha/margins: ${theme}`);
  const cropped = await sharp(source).extract({ left, top, width: right - left + 1, height: bottom - top + 1 }).png().toBuffer();
  const record = { theme, sourceSha256: hash(source), prompt: m.welcome.prompts[theme], references: await Promise.all(m.styleReferences[theme].map(async p => ({ path: p, sha256: hash(await readFile(p)) }))), outputs: [] };
  for (const size of [1024, theme === 'signal' ? 320 : 256]) {
    const dest = `public/images/glossary/${m.version}/${theme}/welcome${size === 1024 ? '' : `-${size}`}.webp`;
    let bytes;
    if (command === 'prepare') {
      try { await access(dest); throw new Error(`Refusing overwrite: ${dest}`); } catch (e) { if (e.code !== 'ENOENT') throw e; }
      let image;
      if (theme === 'signal') {
        const sprite = await sharp(cropped).resize(104, 104, { fit: 'contain', kernel: 'nearest', background: '#00000000' }).extend({ top: 12, bottom: 12, left: 12, right: 12, background: '#00000000' }).png().toBuffer();
        const grid = size === 320 ? await sharp(sprite).extend({ top: 16, bottom: 16, left: 16, right: 16, background: '#00000000' }).png().toBuffer() : sprite;
        image = sharp(grid).resize(size, size, { kernel: 'nearest' }).webp({ lossless: true, effort: 6 });
      } else {
        image = sharp(cropped).resize(Math.round(size * .82), Math.round(size * .82), { fit: 'contain', background: '#00000000' }).extend({ top: Math.floor(size * .09), bottom: size - Math.round(size * .82) - Math.floor(size * .09), left: Math.floor(size * .09), right: size - Math.round(size * .82) - Math.floor(size * .09), background: '#00000000' }).webp({ quality: 84, alphaQuality: 100, effort: 6 });
      }
      bytes = await image.toBuffer();
      pending.push({ dest, bytes });
    } else bytes = await readFile(dest);
    const meta = await sharp(bytes).metadata();
    if (meta.width !== size || meta.height !== size || !meta.hasAlpha || bytes.length > (size === 1024 ? 260000 : 35000)) throw new Error(`Geometry/alpha/budget: ${dest}`);
    record.outputs.push({ path: dest, width: size, height: size, bytes: bytes.length, sha256: hash(bytes) });
  }
  receipt.assets.push(record);
}
if (command === 'prepare') {
  try { await access(receiptPath); throw new Error('Receipt exists'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  for (const { dest, bytes } of pending) { await mkdir(path.dirname(dest), { recursive: true }); await writeFile(dest, bytes, { flag: 'wx' }); }
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
} else if (JSON.stringify(JSON.parse(await readFile(receiptPath, 'utf8'))) !== JSON.stringify(receipt)) throw new Error('Welcome provenance mismatch');
console.log(`${m.career}: two welcome scenes / four WebPs validated; alpha, sizes, budgets and provenance pass.`);
