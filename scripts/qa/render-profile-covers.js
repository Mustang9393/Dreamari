// Profile cover renders (v2). Run: NODE_PATH=node_modules node scripts/qa/render-profile-covers.js
// Six covers at 2000x1125 in the dark, warm-lit, glassy register of the CEO's
// references: light streaks with grain, reeded glass, flowing smoke, a molten
// glass blob, a frosted glass band over an ember gradient, and a horizon glow.
const sharp = require('sharp'); const fs = require('fs');
const OUT = 'public/images/profile/covers'; const W = 2000, H = 1125;

// ---- noise ----
function hash(n) { let x = Math.sin(n) * 43758.5453; return x - Math.floor(x); }
function noise2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi * 157 + yi * 311), b = hash((xi + 1) * 157 + yi * 311), c = hash(xi * 157 + (yi + 1) * 311), d = hash((xi + 1) * 157 + (yi + 1) * 311);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 5) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f); a *= 0.5; f *= 2.05; } return s; }
function noise1(x) { const xi = Math.floor(x), xf = x - xi, u = xf * xf * (3 - 2 * xf); return hash(xi * 7.13) + (hash((xi + 1) * 7.13) - hash(xi * 7.13)) * u; }
const clamp = (v) => Math.max(0, Math.min(255, v));
const mix = (a, b, t) => a + (b - a) * t;
function lerpColor(c1, c2, t) { return [mix(c1[0], c2[0], t), mix(c1[1], c2[1], t), mix(c1[2], c2[2], t)]; }
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function render(fn) {
  const buf = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [r, g, b] = fn(x / W, y / H, x, y);
    const o = (y * W + x) * 4; buf[o] = clamp(r); buf[o + 1] = clamp(g); buf[o + 2] = clamp(b); buf[o + 3] = 255;
  }
  return buf;
}
function grain(a) { const b = Buffer.alloc(W * H * 4); for (let i = 0; i < W * H; i++) { const v = 128 + (Math.random() - 0.5) * 2 * a * 6; b[i * 4] = b[i * 4 + 1] = b[i * 4 + 2] = v; b[i * 4 + 3] = Math.round(a * 4); } return b; }
async function save(buf, name, g = 12, extra = []) {
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } })
    .composite([{ input: grain(g), raw: { width: W, height: H, channels: 4 }, blend: 'overlay' }, ...extra])
    .webp({ quality: 90 }).toFile(`${OUT}/${name}.webp`);
  console.log('wrote', name);
}

const DARK = hex('#0a0810'), EMBER = hex('#ff6a1f'), AMBER = hex('#ffb35a'), RED = hex('#ff3b2e'), PLUM = hex('#3a1030'), VIOLET = hex('#6d4cff');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // 1. streaks: the "Stay in the loop" wall. Fine vertical light streaks, each
  //    its own brightness, over a warm field that fades to black at the top.
  await save(render((u, v, x) => {
    const field = Math.pow(Math.max(0, 1 - Math.abs(v - 0.62) * 1.6), 1.6);          // bright band across the middle-low
    const s1 = noise1(x * 0.35), s2 = noise1(x * 1.7 + 50), s3 = noise1(x * 6 + 900);
    const streak = 0.35 + 0.65 * Math.pow(s1 * 0.5 + s2 * 0.35 + s3 * 0.15, 1.8);
    const glow = field * streak;
    const warm = lerpColor(EMBER, AMBER, Math.pow(glow, 1.5));
    return lerpColor(DARK, warm, Math.min(1, glow * 1.25));
  }), 'streaks', 16);

  // 2. fluted: reeded glass, thin ribs, a crisp specular line per rib, a warm
  //    light behind and a little dispersion at the edges.
  await save(render((u, v, x, y) => {
    const period = 34, t = ((x % period) / period);
    const bend = Math.sin(t * Math.PI * 2) * 30;                                   // refraction offset
    const sx = (x + bend) / W;
    const glowX = Math.exp(-Math.pow((sx - 0.7) * 2.2, 2)), glowY = Math.exp(-Math.pow((v - 0.7) * 1.6, 2));
    const back = lerpColor(hex('#1c0c0a'), lerpColor(EMBER, AMBER, 0.35), Math.min(1, glowX * glowY * 1.4 + 0.08));
    const spec = Math.pow(Math.max(0, Math.sin((t + 0.18) * Math.PI * 2)), 24) * 0.9;   // thin bright line
    const shade = 0.72 + 0.28 * Math.cos(t * Math.PI * 2);                             // one side darker
    const r = back[0] * shade + 255 * spec, g = back[1] * shade + 235 * spec, b = back[2] * shade + 210 * spec;
    return [r, g, b];
  }), 'fluted', 10);

  // 3. smoke: flowing red-orange smoke (domain-warped fbm) on black.
  await save(render((u, v) => {
    const wx = fbm(u * 3 + 7, v * 3 + 2, 4), wy = fbm(u * 3 + 31, v * 3 + 17, 4);
    const n = fbm(u * 2.2 + wx * 1.6, v * 2.2 + wy * 1.6 + 3, 6);
    const rise = Math.pow(Math.max(0, v - 0.25) / 0.75, 1.4);                        // denser toward the bottom
    const d = Math.pow(Math.max(0, n - 0.32) * 1.9, 1.35) * (0.35 + rise);
    const col = lerpColor(hex('#5a0a12'), lerpColor(RED, AMBER, Math.pow(d, 1.6)), Math.min(1, d * 1.3));
    return lerpColor(hex('#050307'), col, Math.min(1, d * 1.5));
  }), 'smoke', 14);

  // 4. molten: a glossy glass pebble lit from top-left, warm glow on the table.
  const blob = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="body" cx="42%" cy="30%" r="75%"><stop offset="0" stop-color="#ffb35a"/><stop offset="0.35" stop-color="#ff5a1f"/><stop offset="0.75" stop-color="#7a120c"/><stop offset="1" stop-color="#2a0705"/></radialGradient>
      <linearGradient id="gloss" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="rim" cx="50%" cy="50%" r="50%"><stop offset="0.86" stop-color="#ffd2a0" stop-opacity="0"/><stop offset="1" stop-color="#ffd2a0" stop-opacity="0.7"/></radialGradient>
      <radialGradient id="floor" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff6a1f" stop-opacity="0.55"/><stop offset="1" stop-color="#ff6a1f" stop-opacity="0"/></radialGradient>
      <filter id="s"><feGaussianBlur stdDeviation="1.5"/></filter>
    </defs>
    <ellipse cx="1180" cy="760" rx="520" ry="150" fill="url(#floor)"/>
    <g transform="rotate(-16 1150 560)">
      <ellipse cx="1150" cy="560" rx="235" ry="345" fill="url(#body)" filter="url(#s)"/>
      <ellipse cx="1150" cy="560" rx="235" ry="345" fill="url(#rim)"/>
      <ellipse cx="1090" cy="430" rx="95" ry="190" fill="url(#gloss)"/>
    </g></svg>`);
  await save(render((u, v) => lerpColor(hex('#070508'), hex('#2a0a0c'), Math.pow(Math.max(0, 1 - Math.hypot((u - 0.6) * 1.2, (v - 0.55) * 1.6)), 2))), 'molten', 10, [{ input: blob, blend: 'over' }]);

  // 5. frosted: the Payoneer card. An ember gradient with a soft white frosted
  //    band cutting diagonally, like light through frosted glass.
  await save(render((u, v) => {
    const base = lerpColor(lerpColor(hex('#2a0d08'), EMBER, Math.pow(u * 0.7 + (1 - v) * 0.5, 1.4)), AMBER, Math.pow(Math.max(0, u - 0.55) * 1.8, 2) * 0.6);
    const d = Math.abs((u - 0.15) * 0.75 + (0.9 - v) * 0.7 - 0.28);
    const band = Math.exp(-Math.pow(d * 5.2, 2));
    const frost = 0.62 * band + 0.06 * fbm(u * 6, v * 6, 4);
    return lerpColor(base, hex('#fff1e2'), Math.min(0.85, frost));
  }), 'frosted', 12);

  // 6. horizon: a warm glow rising from the bottom edge.
  await save(render((u, v) => {
    const d = Math.hypot((u - 0.5) * 1.15, (v - 1.12) * 1.0);
    const g = Math.pow(Math.max(0, 1 - d / 0.85), 1.8);
    const side = Math.exp(-Math.pow((u - 0.22) * 2.6, 2)) * Math.pow(Math.max(0, v - 0.4), 2) * 0.5;
    return lerpColor(hex('#08070d'), lerpColor(hex('#5a1608'), lerpColor(EMBER, AMBER, Math.pow(g, 2)), Math.min(1, g * 1.4 + side)), Math.min(1, (g + side) * 1.15));
  }), 'horizon', 18);
})();
