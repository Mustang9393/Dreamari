// Review original generated PNGs before packaging/admitting them. No creative
// image processing: proportional thumbnails on a dark contact sheet only.
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const [manifestPath, directory] = process.argv.slice(2);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
await mkdir(directory, { recursive: true });
for (const theme of ['drift', 'signal']) {
  const cells = [...manifest.terms.map(t => ({ id: t.id, file: t.sources[theme] })), { id: 'Welcome', file: path.join(path.dirname(manifest.terms[0].sources[theme]), `welcome-${theme}.png`) }];
  const layers = [];
  for (const [i, cell] of cells.entries()) {
    try {
      const thumb = await sharp(cell.file).resize(300, 270, { fit: 'contain', background: '#00000000' }).png().toBuffer();
      layers.push({ input: thumb, left: i % 3 * 320 + 10, top: Math.floor(i / 3) * 310 });
      const label = Buffer.from(`<svg width="320" height="32"><text x="160" y="24" text-anchor="middle" font-family="Arial" font-size="18" fill="white">${cell.id}</text></svg>`);
      layers.push({ input: label, left: i % 3 * 320, top: Math.floor(i / 3) * 310 + 274 });
    } catch (error) { console.log(`Not ready: ${cell.file}: ${error.message}`); }
  }
  await sharp({ create: { width: 960, height: 620, channels: 4, background: '#121b30' } }).composite(layers).png().toFile(path.join(directory, `${theme}-sources.png`));
}
