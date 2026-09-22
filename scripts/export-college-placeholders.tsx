/** Run: npx tsx scripts/export-college-placeholders.tsx. */
import React from "react";
import sharp from "sharp";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { CollegePlaceholder, COLLEGE_ART_VARIANTS } from "../src/components/colleges/CollegePlaceholder";
const out = "public/images/colleges/placeholders";
async function exportAssets() {
mkdirSync(out, { recursive: true });
for (const variant of COLLEGE_ART_VARIANTS) {
  const svg = renderToStaticMarkup(<CollegePlaceholder variant={variant} seed={variant} />);
  writeFileSync(`${out}/${variant}.svg`, svg);
  const rasterSvg = svg.replace(/var\(--college-art-accent, var\(--primary, #2f6bf2\)\)/g, "#2f6bf2");
  await sharp(Buffer.from(rasterSvg)).resize(800, 1050).png().toFile(`${out}/${variant}.png`);
}
// Image-only contact sheet: actual Explore media proportions, no invented card UI.
writeFileSync(`${out}/preview.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dreamari artwork</title><style>*{box-sizing:border-box}body{margin:0;padding:40px;background:#05070f}main{max-width:1200px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}img{display:block;width:100%;height:auto}a{display:block;outline-offset:5px}a:focus-visible{outline:2px solid #99c2ff}@media(max-width:700px){body{padding:16px}main{grid-template-columns:1fr;max-width:400px}}</style><main>${COLLEGE_ART_VARIANTS.map(v => `<a href="${v}.svg" aria-label="Open ${v} artwork"><img src="${v}.svg" alt="Dreamari ${v} artwork" width="800" height="1050"></a>`).join("")}</main></html>`);
console.log("Exported SVGs, 800 × 1050 PNGs, and image-only preview.");
}
exportAssets().catch(error => { console.error(error); process.exitCode = 1; });
