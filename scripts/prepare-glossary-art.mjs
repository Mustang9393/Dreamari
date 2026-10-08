import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

// Raster normalization only: preserve artwork, aspect ratio and real alpha.
// Generation sources are documented in docs/GLOSSARY_ART_OCT08.md.
const root = process.argv[2];
if (!root) throw new Error('Pass the generated_images directory as the first argument.');
const sources = {
  drift: ['01a1190e-1cca-79e0-a2bb-a0297f12f804', ['ee17620a-9ce0-4f66-a2fc-0bd945cb7e3b', 'ddde098e-ccd7-4ab7-84d8-bbe8b51c9949', '1c80c155-8b1d-484a-a4ea-89fc36f8a7b2', '7698ec20-3d1a-456a-8e24-1a933e815593', '1a8a491b-6ab2-453f-aa33-a89fdaff0c86']],
  orbit: ['01a1190e-4a51-72f2-ac68-61b16feba4de', ['21d0830b-1657-46f8-b0cc-b24b039b0a0e', 'f3580cfa-44c3-4ebd-8de4-f03bd4036812', '3d243be1-44e6-4a09-8d5a-8a6efa7e425f', '1ed8085b-3ee5-46dc-808e-3563286130b0', '743183e0-5654-47b5-b9ae-c6cda904390c']],
  horizon: ['01a1190e-705b-7c72-ba5b-aadb6c018e22', ['fb6bff0d-4b03-4aad-ab05-9e6fd9c9b6d3', '22c680d1-ad9d-4fe9-8127-850e60cac017', '665fe811-eef9-41f5-97c6-b13d2491feaa', '1b7c051f-c468-42ad-b376-aba461e4a6e5', 'ab499710-0fe1-4387-8bd7-9dc7f1ef54b0']],
};
const terms = ['company', 'product', 'service', 'customer', 'profit'];
for (const [theme, [folder, ids]] of Object.entries(sources)) {
  if (process.argv[3] && theme !== process.argv[3]) continue;
  const style = theme === 'orbit' ? 'orbit-paper' : theme === 'horizon' ? 'horizon-neon' : theme;
  const output = path.resolve('public/images/glossary/themes-oct08', style);
  await mkdir(output, { recursive: true });
  for (const [i, id] of ids.entries()) {
    const source = path.join(root, folder, `exec-${id}.png`);
    const meta = await sharp(source).metadata();
    if (!meta.hasAlpha) throw new Error(`Missing transparency: ${source}`);
    const trimmed = await sharp(source).trim({ threshold: 8 }).toBuffer();
    for (const size of [768, 256]) {
      const inner = Math.round(size * .9);
      const fitted = await sharp(trimmed).resize(inner, inner, { fit: 'contain', background: {r:0,g:0,b:0,alpha:0} }).toBuffer();
      const padding = Math.floor((size - inner) / 2);
      await sharp({ create: { width: size, height: size, channels: 4, background: {r:0,g:0,b:0,alpha:0} } })
        .composite([{input:fitted, left:padding, top:padding}]).webp({quality:84, alphaQuality:100, effort:4})
        .toFile(path.join(output, `${terms[i]}${size === 256 ? '-256' : ''}.webp`));
    }
    console.log(`${theme}/${terms[i]} prepared`);
  }
}
