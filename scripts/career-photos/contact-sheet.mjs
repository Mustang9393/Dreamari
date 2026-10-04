// Contact sheets of every Career Detail header as it is cropped (4 Oct
// 2026), desktop window and phone window side by side, so every photo can be
// checked by eye after hero-focus.mjs runs.
// Usage: node scripts/career-photos/contact-sheet.mjs <photo-list.txt> <out-dir>
// The list holds one public path per line (public/images/app/...webp).

import { readFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const [list, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const ts = readFileSync("src/components/career/heroFocus.ts", "utf8");
const focus = {};
for (const m of ts.matchAll(/"([^"]+)": \{ desktop: "50% (\d+)%", mobile: "50% (\d+)%" \}/g)) focus[m[1]] = { desktop: +m[2] / 100, mobile: +m[3] / 100 };

const D = { w: 200, h: 152 }, M = { w: 140, h: 151 }, LABEL = 18, COLS = 6, ROWS = 8;
const tileW = D.w + M.w + 6, tileH = D.h + LABEL;

async function crop(path, win, p) {
  const img = sharp(path); const { width, height } = await img.metadata();
  const scale = Math.max(win.w / width, win.h / height);
  const sw = Math.round(width * scale), sh = Math.round(height * scale);
  const top = Math.round((sh - win.h) * p), left = Math.round((sw - win.w) / 2);
  return sharp(path).resize(sw, sh).extract({ left, top, width: win.w, height: win.h }).png().toBuffer();
}
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const paths = readFileSync(list, "utf8").split("\n").filter(Boolean);
for (let s = 0; s * COLS * ROWS < paths.length; s++) {
  const chunk = paths.slice(s * COLS * ROWS, (s + 1) * COLS * ROWS);
  const parts = [];
  for (const [i, path] of chunk.entries()) {
    const key = path.replace(/^public/, "");
    const f = focus[key] ?? { desktop: 0.12, mobile: 0.12 };
    const x = (i % COLS) * (tileW + 10), y = Math.floor(i / COLS) * (tileH + 10);
    parts.push({ input: await crop(path, D, f.desktop), left: x, top: y });
    parts.push({ input: await crop(path, M, f.mobile), left: x + D.w + 6, top: y });
    const name = key.split("/").pop().replace(/\.webp$/, "");
    parts.push({ input: Buffer.from(`<svg width="${tileW}" height="${LABEL}"><text x="0" y="13" font-size="12" font-family="Helvetica" fill="#fff">${s * COLS * ROWS + i + 1}. ${esc(name)}${focus[key] ? "" : " (no face)"}</text></svg>`), left: x, top: y + D.h + 2 });
  }
  const W = COLS * (tileW + 10), H = Math.ceil(chunk.length / COLS) * (tileH + 10);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#15131f" } }).composite(parts).png().toFile(`${outDir}/sheet-${s + 1}.png`);
  console.log(`${outDir}/sheet-${s + 1}.png`);
}
