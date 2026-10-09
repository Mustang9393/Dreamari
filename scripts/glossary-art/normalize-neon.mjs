// Technical normalization only. New native ImageGen artwork, no background images.
// Versioned alongside previous artwork for safe rollback; keep alpha/aspect ratio.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const base = process.argv[2];
if (!base) throw new Error('Pass the native generated-images directory.');
const sources = {
  "company": "01a11c29-aeae-7f00-abee-a767109b8d8d/exec-9cb45924-4f3d-477a-8407-0a1933debc2a.png",
  "product": "01a11c29-aeae-7f00-abee-a767109b8d8d/exec-4c9850ff-eb09-443c-b6bd-0e24899ef7e1.png",
  "service": "01a11c29-aeae-7f00-abee-a767109b8d8d/exec-24d7f4f0-04ca-4af5-ab76-67bfc842d244.png",
  "customer": "01a11c2a-4b98-7b50-9260-c6cfa8b5f588/exec-2308c617-2b4c-4bc3-a991-70f4eb7a128d.png",
  "profit": "01a11c2a-4b98-7b50-9260-c6cfa8b5f588/exec-81011995-80c2-4931-b0ed-e94a4074e08b.png",
  "dreamy-happy": "01a11c29-fffb-71a3-a7fc-f236f8962be0/exec-400dea56-540d-4b73-905a-785a36d001b3.png",
  "dreamy-curious": "01a11c29-fffb-71a3-a7fc-f236f8962be0/exec-de900ede-5cb5-4eeb-b6a5-ade5063ab9a6.png",
  "dreamy-party": "01a11c29-fffb-71a3-a7fc-f236f8962be0/exec-4bb00dfe-81e2-4ece-b384-32ed4c1389c4.png"
};
const directory = resolve('public/images/glossary/themes-oct08/horizon-signs');
await mkdir(directory, { recursive: true });
for (const [name, source] of Object.entries(sources)) {
  const subject = await sharp(resolve(base, source)).trim({ threshold: 12 }).resize(704, 704, { fit: 'inside' }).toBuffer();
  const canvas = await sharp({ create: { width: 768, height: 768, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: subject, gravity: 'centre' }]).png().toBuffer();
  for (const size of [768, 256]) {
    const destination = resolve(directory, `${name}${size === 256 ? '-256' : ''}.webp`);
    await sharp(canvas).resize(size, size).webp({ quality: 86, effort: 6 }).toFile(destination);
    console.log(destination);
  }
}

