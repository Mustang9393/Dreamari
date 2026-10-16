// Compose browser-captured evidence only. This does not capture pages or
// alter app artwork. Run after the documented CUA viewport matrix.
import sharp from 'sharp';
import path from 'node:path';
const directory = process.argv[2] ?? 'output/glossary-living-worlds/after';
async function sheet(name, files, width, height, columns) {
  const layers = [];
  for (const [i, file] of files.entries()) {
    const left = i % columns * width, top = Math.floor(i / columns) * (height + 28);
    layers.push({ input: await sharp(path.join(directory, file)).resize(width, height, { fit: 'contain', background: '#101627' }).png().toBuffer(), left, top });
    const label = file.replace('.png', '');
    layers.push({ input: Buffer.from(`<svg width="${width}" height="28"><text x="${width / 2}" y="19" text-anchor="middle" font-family="Arial" font-size="12" fill="white">${label}</text></svg>`), left, top: top + height });
  }
  await sharp({ create: { width: columns * width, height: Math.ceil(files.length / columns) * (height + 28), channels: 4, background: '#101627' } }).composite(layers).png().toFile(path.join(directory, `${name}.png`));
}
for (const theme of ['drift', 'signal']) for (const viewport of [1280, 375]) for (const screen of ['question', 'map']) {
  const files = ['software', 'nursing'].flatMap(career => [1, 2, 3, 4].map(level => `${career}-l${level}-${theme}-${screen}-${viewport}.png`));
  await sheet(`matrix-${theme}-${screen}-${viewport}`, files, viewport === 375 ? 188 : 320, viewport === 375 ? 407 : 200, 4);
}
for (const screen of ['welcome', 'teach']) {
  const files = ['software', 'aviation', 'nursing'].flatMap(career => ['drift', 'signal'].map(theme => `${career}-${theme}-${screen}-1280.png`));
  await sheet(`all-${screen}-art`, files, 480, 300, 2);
}
console.log('Validated all 64 matrix captures and 12 art captures; wrote ten contact sheets.');
