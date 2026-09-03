// Six profile covers, 1600x900 PNG. Dark base, warm light, then a material:
// fluted glass (per-column refraction + rib highlights), molten glass (a glossy
// blob), rippled glass (wave displacement), and grain over everything.
const sharp = require('sharp'); const fs = require('fs');
const OUT = '/Users/chandump/dreamari/public/images/profile/covers';
const W = 1600, H = 900;

function svgBase(bg, blobs) {
  const circles = blobs.map(([c, o, x, y, r]) => `<circle cx="${x * 16}" cy="${y * 9}" r="${r}" fill="${c}" fill-opacity="${o}" filter="url(#b)"/>`).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="b" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="150"/></filter></defs><rect width="${W}" height="${H}" fill="${bg}"/>${circles}</svg>`);
}
async function raw(buf) { const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { data, w: info.width, h: info.height }; }
function px(img, x, y) { x = Math.max(0, Math.min(img.w - 1, x | 0)); y = Math.max(0, Math.min(img.h - 1, y | 0)); const i = (y * img.w + x) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; }

// vertical flutes: each rib bends the light sideways and carries a highlight
// on one edge and a shadow on the other, like reeded glass
function flutes(img, period = 64, amp = 22, gain = 1) {
  const out = Buffer.alloc(img.w * img.h * 4);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const t = ((x % period) / period) * Math.PI * 2;
    const dx = Math.sin(t) * amp;
    const [r, g, b] = px(img, x + dx, y);
    const edge = Math.cos(t);                     // +1 lit edge, -1 shaded edge
    const light = 1 + gain * (0.18 * edge) + gain * 0.22 * Math.pow(Math.max(0, Math.sin(t + 0.6)), 8);
    const shade = edge < 0 ? 1 + 0.12 * edge : 1;
    const o = (y * img.w + x) * 4;
    out[o] = Math.min(255, r * light * shade); out[o + 1] = Math.min(255, g * light * shade); out[o + 2] = Math.min(255, b * light * shade); out[o + 3] = 255;
  }
  return { data: out, w: img.w, h: img.h };
}
// rippled glass: horizontal waves displace vertically
function ripple(img, period = 140, amp = 26) {
  const out = Buffer.alloc(img.w * img.h * 4);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const dy = Math.sin((x / period) * Math.PI * 2 + y / 260) * amp;
    const [r, g, b] = px(img, x, y + dy);
    const light = 1 + 0.16 * Math.cos((x / period) * Math.PI * 2 + y / 260);
    const o = (y * img.w + x) * 4;
    out[o] = Math.min(255, r * light); out[o + 1] = Math.min(255, g * light); out[o + 2] = Math.min(255, b * light); out[o + 3] = 255;
  }
  return { data: out, w: img.w, h: img.h };
}
function grain(amount = 14) {
  const buf = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) { const v = 128 + (Math.random() - 0.5) * 2 * amount * 6; buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = v; buf[i * 4 + 3] = Math.round(amount * 4); }
  return buf;
}
async function finish(img, name, extra = []) {
  await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } })
    .composite([{ input: grain(12), raw: { width: W, height: H, channels: 4 }, blend: 'overlay' }, ...extra])
    .png({ compressionLevel: 9 }).toFile(`${OUT}/${name}.png`);
  console.log('wrote', name);
}
// molten glass: a glossy blob lit from above
function blobSvg(cx, cy, rx, ry, rot, c1, c2) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="body" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="${c1}"/><stop offset="0.55" stop-color="${c2}"/><stop offset="1" stop-color="#1a0806"/></radialGradient>
    <radialGradient id="spec" cx="38%" cy="22%" r="30%"><stop offset="0" stop-color="#fff" stop-opacity="0.85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="rim" cx="50%" cy="50%" r="50%"><stop offset="0.82" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#ffb37a" stop-opacity="0.55"/></radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="90"/></filter>
  </defs>
  <g transform="rotate(${rot} ${cx} ${cy})">
    <ellipse cx="${cx}" cy="${cy + 40}" rx="${rx * 1.3}" ry="${ry * 0.9}" fill="#ff6a2b" fill-opacity="0.35" filter="url(#glow)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#body)" filter="url(#soft)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#rim)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#spec)"/>
  </g></svg>`);
}

async function rippleAndHorizon() {
  let base = await raw(svgBase('#0b0709', [['#ff6a2b', 0.95, 55, 96, 620], ['#ffd08a', 0.6, 45, 108, 340], ['#4a1030', 0.9, 20, 20, 600], ['#12102a', 0.9, 85, 25, 520]]));
  await finish(ripple(base, 120, 34), 'ripple');
  base = await raw(svgBase('#08070d', [['#ff5a1f', 0.95, 50, 118, 620], ['#ff9f4a', 0.6, 30, 110, 420], ['#3b0f0f', 0.8, 75, 90, 520]]));
  await sharp(base.data, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: grain(22), raw: { width: W, height: H, channels: 4 }, blend: 'overlay' }]).png({ compressionLevel: 9 }).toFile(`${OUT}/horizon.png`);
  console.log('wrote horizon');
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (process.env.ONLY) { await rippleAndHorizon(); return; }
  // 1 fluted amber: warm glow low-right behind reeded glass
  let base = await raw(svgBase('#120c0a', [['#ff7a2a', 0.95, 78, 82, 520], ['#ffb056', 0.7, 55, 100, 380], ['#7a2a12', 0.8, 15, 20, 520]]));
  await finish(flutes(base, 72, 24, 1), 'fluted-amber');
  // 2 fluted ember: red core, thinner ribs
  base = await raw(svgBase('#0e0608', [['#ff3d2e', 0.9, 30, 70, 520], ['#ff8a3d', 0.7, 65, 95, 420], ['#3a0f2a', 0.9, 85, 15, 520]]));
  await finish(flutes(base, 44, 14, 1.1), 'fluted-ember');
  // 3 fluted dusk: cool violet with one warm bar, wide ribs
  base = await raw(svgBase('#0b0a16', [['#6d4cff', 0.85, 25, 30, 520], ['#ff7a45', 0.8, 80, 85, 440], ['#1d1240', 0.9, 60, 60, 600]]));
  await finish(flutes(base, 110, 34, 0.9), 'fluted-dusk');
  // 4 molten glass
  base = await raw(svgBase('#0a0608', [['#5a1a0e', 0.9, 50, 110, 620], ['#2a0c14', 0.9, 20, 10, 500]]));
  await finish(base, 'molten', [{ input: blobSvg(1000, 470, 210, 330, -18, '#ff8a3d', '#8f1b12'), blend: 'over' }]);
  // 5 rippled ocean-fire: dark with orange horizon, water ripples
  base = await raw(svgBase('#0b0709', [['#ff6a2b', 0.95, 55, 96, 620], ['#ffd08a', 0.6, 45, 108, 340], ['#4a1030', 0.9, 20, 20, 600], ['#12102a', 0.9, 85, 25, 520]]));
  await finish(ripple(base, 120, 34), 'ripple');
  // 6 ember horizon: nothing but a warm glow rising from the bottom edge, heavy grain
  base = await raw(svgBase('#08070d', [['#ff5a1f', 0.95, 50, 118, 620], ['#ff9f4a', 0.6, 30, 110, 420], ['#3b0f0f', 0.8, 75, 90, 520]]));
  await sharp(base.data, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: grain(22), raw: { width: W, height: H, channels: 4 }, blend: 'overlay' }]).png({ compressionLevel: 9 }).toFile(`${OUT}/horizon.png`);
  console.log('wrote horizon');
})();
