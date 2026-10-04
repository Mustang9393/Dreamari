// Graphic post photo backgrounds (4 Oct 2026): converts the approved
// Unsplash photos to 1080x1350 (4:5) webp and measures, per photo, where the
// words read best: the calmest band (least edge detail) for the text, light
// or dark ink from that band's brightness, and the calmest corner away from
// the text for the Dreamari mark. Prints the TEMPLATES entries for
// src/components/connect/FeedBreathers.tsx.
// Usage: node scripts/career-photos/graphic-photos.mjs <id>=<source.jpg> ...

import sharp from "sharp";

const W = 1080, H = 1350, SW = 108, SH = 135;
const out = [];
for (const arg of process.argv.slice(2)) {
  const [id, src] = arg.split("=");
  const file = `public/images/connect/graphics/${id}.webp`;
  await sharp(src).resize(W, H, { fit: "cover", position: "centre" }).webp({ quality: 80 }).toFile(file);
  const { data } = await sharp(file).resize(SW, SH).greyscale().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => data[y * SW + x];
  const energy = (x0, y0, x1, y1) => { let e = 0, n = 0; for (let y = y0; y < y1 - 1; y++) for (let x = x0; x < x1 - 1; x++) { e += Math.abs(px(x, y) - px(x + 1, y)) + Math.abs(px(x, y) - px(x, y + 1)); n++; } return e / n; };
  const lum = (x0, y0, x1, y1) => { let s = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += px(x, y); n++; } return s / n; };
  const bands = { top: [0.08, 0.45], middle: [0.3, 0.7], bottom: [0.55, 0.92] };
  const scored = Object.entries(bands).map(([k, [a, b]]) => ({ k, e: energy(8, Math.round(a * SH), SW - 8, Math.round(b * SH)), l: lum(8, Math.round(a * SH), SW - 8, Math.round(b * SH)) }));
  scored.sort((a, b) => a.e - b.e);
  const best = scored[0];
  const corners = { tl: [0, 0], tr: [SW - 30, 0], bl: [0, SH - 18], br: [SW - 30, SH - 18] };
  const avoid = best.k === "top" ? ["tl", "tr"] : best.k === "bottom" ? ["bl", "br"] : [];
  const mark = Object.entries(corners).filter(([c]) => !avoid.includes(c)).map(([c, [x, y]]) => ({ c, e: energy(x, y, x + 30, y + 18) })).sort((a, b) => a.e - b.e)[0].c;
  out.push({ id, valign: best.k, ink: best.l > 150 ? "dark" : "light", mark, bandEnergy: best.e.toFixed(1), lum: Math.round(best.l) });
}
console.log(JSON.stringify(out, null, 1));
