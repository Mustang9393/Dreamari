// Drops campus photo links that don't resolve (19 Oct 2026, Chandu: "lets not
// show any school without real images"). The dataset Usman exported points
// every school with a card image at cdn.dreamonna.com/media/<id>/campus.webp,
// but on 19 Oct 2026 only 143 of 4,617 of those objects existed: the rest
// answer 403 (S3's reply for a missing key, with or without browser headers).
// This asks the CDN for the first KB of each, keeps the ones that come back as
// an image, and removes the dead links from public/data/colleges/index.json
// and the matching detail/<slug>.json, so the app never requests them.
// Re-run it whenever the CDN gains photos; it only ever removes dead links,
// so run build-dataset.mjs first to bring back links that came alive.
//
//   node scripts/colleges/verify-images.mjs [--dry]

import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry");
const dir = path.join(process.cwd(), "public/data/colleges");
const indexPath = path.join(dir, "index.json");
const ix = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const url = (im) => (im.startsWith("http") ? im : ix.imageBase.replace("{id}", im));

async function alive(u) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(u, { headers: { Range: "bytes=0-1023" }, signal: AbortSignal.timeout(20000) });
      await r.arrayBuffer();
      if (r.status === 200 || r.status === 206) return (r.headers.get("content-type") ?? "").startsWith("image/");
      if (r.status === 403 || r.status === 404) return false;
    } catch { /* network blip: retry */ }
  }
  return null; // unknown after retries: leave the link alone
}

const rows = ix.colleges.filter((r) => r.im);
let next = 0, live = 0, dead = 0, unknown = 0;
const deadSlugs = [];
async function worker() {
  while (next < rows.length) {
    const r = rows[next++];
    const ok = await alive(url(r.im));
    if (ok === true) live++;
    else if (ok === false) { dead++; deadSlugs.push(r.s); }
    else unknown++;
  }
}
await Promise.all(Array.from({ length: 48 }, worker));
console.log(`checked ${rows.length}: ${live} live, ${dead} dead, ${unknown} unknown`);
if (DRY) process.exit(0);

const deadSet = new Set(deadSlugs);
for (const r of ix.colleges) if (deadSet.has(r.s)) delete r.im;
fs.writeFileSync(indexPath, JSON.stringify(ix));
for (const s of deadSlugs) {
  const p = path.join(dir, "detail", `${s}.json`);
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p, "utf8"));
  if (d.image) { delete d.image; fs.writeFileSync(p, JSON.stringify(d)); }
}
console.log(`removed ${deadSlugs.length} dead links`);
