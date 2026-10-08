// Technical normalization only. Originals are native ImageGen outputs.
// Keep alpha, trim empty margins, then use one padded canvas for stable scale.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.argv[2];
if (!base) throw new Error('Usage: node scripts/glossary-art/normalize-painted.mjs <generated-images-directory>');
const sources = {
  'horizon-painted': {
    company: '01a11c2a-4b98-7b50-9260-c6cfa8b5f588/exec-ed80624a-7de4-438c-a6a0-8d0f7d4bc29e.png',
    product: '01a11c2a-4b98-7b50-9260-c6cfa8b5f588/exec-32e9861b-33d6-497b-a8e3-a7b814d22131.png',
    service: '01a11c2a-4b98-7b50-9260-c6cfa8b5f588/exec-2b3e068b-be33-476d-9204-fe62bd2be696.png',
    customer: '01a11c2a-4b98-7b50-9260-c6cfa8b5f588/exec-1b171ac5-bbba-4c38-b9dc-415936572dc4.png',
    profit: '01a11c2a-4b98-7b50-9260-c6cfa8b5f588/exec-4f9a3d4e-abe5-4ab1-8fd4-c23a074d3930.png',
    'dreamy-happy': '01a11c29-aeae-7f00-abee-a767109b8d8d/exec-cd5a25ab-3ea8-448e-9870-27032a68bf14.png',
    'dreamy-curious': '01a11c29-aeae-7f00-abee-a767109b8d8d/exec-a7139cc4-4de7-4bb8-b379-ae5d717f9d5b.png',
    'dreamy-party': '01a11c29-aeae-7f00-abee-a767109b8d8d/exec-85c558aa-bcc7-480c-bdeb-e2e567862c06.png',
  },
  'orbit-ink': {
    'dreamy-happy': '01a11c29-fffb-71a3-a7fc-f236f8962be0/exec-0127e04e-6bab-435a-aa3c-e21b394d3739.png',
    'dreamy-curious': '01a11c29-fffb-71a3-a7fc-f236f8962be0/exec-b7aabb7c-d7a8-49ae-930e-ba4584c34e64.png',
    'dreamy-party': '01a11c29-fffb-71a3-a7fc-f236f8962be0/exec-1a6c2140-eb3b-4d7b-bdee-874364877574.png',
  },
};
for (const [medium, assets] of Object.entries(sources)) {
  const directory = resolve('public/images/glossary/themes-oct08', medium);
  await mkdir(directory, { recursive: true });
  for (const [name, source] of Object.entries(assets)) {
    const subject = await sharp(resolve(base, source)).trim({ threshold: 12 }).resize(704, 704, { fit: 'inside' }).toBuffer();
    const canvas = await sharp({ create: { width: 768, height: 768, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: subject, gravity: 'centre' }]).png().toBuffer();
    for (const size of [768, 256]) {
      const destination = resolve(directory, `${name}${size === 256 ? '-256' : ''}.webp`);
      await sharp(canvas).resize(size, size).webp({ quality: 84, effort: 6 }).toFile(destination);
      console.log(destination);
    }
  }
}
