// Profile cover renders (v2). Run: NODE_PATH=node_modules node scripts/qa/render-profile-covers.js
// Six covers at 2000x1125 with the glassy, lit-from-behind feel of the CEO's
// references, in the brand palette (navy, brand blue, indigo, teal, pink): light streaks with grain, reeded glass, flowing smoke, a molten
// glass blob, a frosted glass band over an ember gradient, and a horizon glow.
const sharp = require('sharp'); const fs = require('fs');
const OUT = 'public/images/profile/covers'; let W = 2000, H = 1125;

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

// Brand palette only (tokens.css): navy ground, brand blue and its subtle
// accent, the hero purple/teal/pink darks, the indigo, teal and pink worlds.
const DARK = hex('#05070f'), BLUE = hex('#2f6bf2'), SKY = hex('#3894ff'), ICE = hex('#cfe3ff');
const INDIGO = hex('#6366f1'), PURPLE_DARK = hex('#2e2466'), TEAL = hex('#14b8a6'), TEAL_DARK = hex('#0f474d'), PINK = hex('#ff4585'), PINK_DARK = hex('#471438');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // 1. streaks: the "Stay in the loop" wall. Fine vertical light streaks, each
  //    its own brightness, over a warm field that fades to black at the top.
  await save(render((u, v, x) => {
    const field = Math.pow(Math.max(0, 1 - Math.abs(v - 0.62) * 1.6), 1.6);          // bright band across the middle-low
    const s1 = noise1(x * 0.35), s2 = noise1(x * 1.7 + 50), s3 = noise1(x * 6 + 900);
    const streak = 0.35 + 0.65 * Math.pow(s1 * 0.5 + s2 * 0.35 + s3 * 0.15, 1.8);
    const glow = field * streak;
    const light = lerpColor(BLUE, ICE, Math.pow(glow, 1.6));
    return lerpColor(DARK, light, Math.min(1, glow * 1.25));
  }), 'streaks', 16);

  // 2. fluted: reeded glass, thin ribs, a crisp specular line per rib, a warm
  //    light behind and a little dispersion at the edges.
  await save(render((u, v, x, y) => {
    const period = 34, t = ((x % period) / period);
    const bend = Math.sin(t * Math.PI * 2) * 30;                                   // refraction offset
    const sx = (x + bend) / W;
    const glowX = Math.exp(-Math.pow((sx - 0.7) * 2.2, 2)), glowY = Math.exp(-Math.pow((v - 0.7) * 1.6, 2));
    const back = lerpColor(hex('#0b0a1c'), lerpColor(INDIGO, ICE, 0.25), Math.min(1, glowX * glowY * 1.4 + 0.08));
    const spec = Math.pow(Math.max(0, Math.sin((t + 0.18) * Math.PI * 2)), 24) * 0.9;   // thin bright line
    const shade = 0.72 + 0.28 * Math.cos(t * Math.PI * 2);                             // one side darker
    const r = back[0] * shade + 225 * spec, g = back[1] * shade + 235 * spec, b = back[2] * shade + 255 * spec;
    return [r, g, b];
  }), 'fluted', 10);

  // 3. smoke: flowing red-orange smoke (domain-warped fbm) on black.
  await save(render((u, v) => {
    const wx = fbm(u * 3 + 7, v * 3 + 2, 4), wy = fbm(u * 3 + 31, v * 3 + 17, 4);
    const n = fbm(u * 2.2 + wx * 1.6, v * 2.2 + wy * 1.6 + 3, 6);
    const rise = Math.pow(Math.max(0, v - 0.25) / 0.75, 1.4);                        // denser toward the bottom
    const d = Math.pow(Math.max(0, n - 0.32) * 1.9, 1.35) * (0.35 + rise);
    const col = lerpColor(TEAL_DARK, lerpColor(TEAL, ICE, Math.pow(d, 1.8) * 0.7), Math.min(1, d * 1.3));
    return lerpColor(hex('#04070c'), col, Math.min(1, d * 1.5));
  }), 'smoke', 14);

  // 4. molten: a glossy glass pebble lit from top-left, warm glow on the table.
  const blob = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <radialGradient id="body" cx="42%" cy="30%" r="75%"><stop offset="0" stop-color="#cfe3ff"/><stop offset="0.35" stop-color="#3894ff"/><stop offset="0.75" stop-color="#1e3fa8"/><stop offset="1" stop-color="#0a1230"/></radialGradient>
      <linearGradient id="gloss" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="rim" cx="50%" cy="50%" r="50%"><stop offset="0.86" stop-color="#cfe3ff" stop-opacity="0"/><stop offset="1" stop-color="#cfe3ff" stop-opacity="0.7"/></radialGradient>
      <radialGradient id="floor" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#2f6bf2" stop-opacity="0.55"/><stop offset="1" stop-color="#2f6bf2" stop-opacity="0"/></radialGradient>
      <filter id="s"><feGaussianBlur stdDeviation="1.5"/></filter>
    </defs>
    <ellipse cx="1180" cy="760" rx="520" ry="150" fill="url(#floor)"/>
    <g transform="rotate(-16 1150 560)">
      <ellipse cx="1150" cy="560" rx="235" ry="345" fill="url(#body)" filter="url(#s)"/>
      <ellipse cx="1150" cy="560" rx="235" ry="345" fill="url(#rim)"/>
      <ellipse cx="1090" cy="430" rx="95" ry="190" fill="url(#gloss)"/>
    </g></svg>`);
  await save(render((u, v) => lerpColor(hex('#05070f'), hex('#0e1533'), Math.pow(Math.max(0, 1 - Math.hypot((u - 0.6) * 1.2, (v - 0.55) * 1.6)), 2))), 'molten', 10, [{ input: blob, blend: 'over' }]);

  // 5. frosted: the Payoneer card. An ember gradient with a soft white frosted
  //    band cutting diagonally, like light through frosted glass.
  await save(render((u, v) => {
    const base = lerpColor(lerpColor(hex('#0b1638'), BLUE, Math.pow(u * 0.7 + (1 - v) * 0.5, 1.4)), INDIGO, Math.pow(Math.max(0, u - 0.55) * 1.8, 2) * 0.7);
    const d = Math.abs((u - 0.15) * 0.75 + (0.9 - v) * 0.7 - 0.28);
    const band = Math.exp(-Math.pow(d * 5.2, 2));
    const frost = 0.62 * band + 0.06 * fbm(u * 6, v * 6, 4);
    return lerpColor(base, hex('#eef4ff'), Math.min(0.85, frost));
  }), 'frosted', 12);

  // 6. horizon: a warm glow rising from the bottom edge.
  await save(render((u, v) => {
    const d = Math.hypot((u - 0.5) * 1.15, (v - 1.12) * 1.0);
    const g = Math.pow(Math.max(0, 1 - d / 0.85), 1.8);
    const side = Math.exp(-Math.pow((u - 0.22) * 2.6, 2)) * Math.pow(Math.max(0, v - 0.4), 2) * 0.5;
    return lerpColor(DARK, lerpColor(PINK_DARK, lerpColor(PINK, hex('#ffd6e6'), Math.pow(g, 2.2) * 0.6), Math.min(1, g * 1.4 + side)), Math.min(1, (g + side) * 1.15));
  }), 'horizon', 18);

  // ---- Batch 2 (20 Sept): fourteen more, rendered at the header's real
  // on-screen proportions (~6:1) now that the cover banner itself was
  // trimmed down to that shape, so nothing here needs to lean on
  // object-cover to crop a taller source into a short strip. Same brand
  // palette, same generative approach, toward the ~40 the spec calls for.
  W = 2400; H = 400;

  // 7. aurora: soft undulating teal/indigo/pink bands, lit from the bottom.
  await save(render((u, v) => {
    const wave = fbm(u * 2.2 + 4, v * 1.4, 4) * 0.55;
    const band = Math.sin((v * 1.6 + wave) * Math.PI * 2) * 0.5 + 0.5;
    const col = lerpColor(lerpColor(TEAL, INDIGO, band), PINK, Math.pow(Math.max(0, u - 0.62), 1.3));
    const fade = Math.pow(1 - v, 0.75);
    return lerpColor(DARK, col, fade * (0.42 + 0.58 * band));
  }), 'aurora', 14);

  // 8. grid: a faint dot lattice with one bright glow spot.
  await save(render((u, v, x, y) => {
    const cell = 40;
    const gx = ((x % cell) + cell) % cell / cell - 0.5, gy = ((y % cell) + cell) % cell / cell - 0.5;
    const dot = Math.max(0, 1 - Math.hypot(gx, gy) * 6.5);
    const glow = Math.exp(-Math.pow(Math.hypot((u - 0.78) * 1.5, (v - 0.28) * 2.6), 2) * 3);
    const line = lerpColor(DARK, hex('#161f45'), 0.55);
    const lit = lerpColor(line, ICE, Math.min(1, dot * (0.32 + glow)));
    return lerpColor(lit, SKY, glow * 0.65);
  }), 'grid', 9);

  // 9. confetti: scattered bright sparks over navy, each its own brand hue.
  await save(render((u, v) => {
    let spark = 0, tint = DARK;
    for (let i = 0; i < 70; i++) {
      const sx = hash(i * 12.9), sy = hash(i * 78.2 + 4);
      const size = 2.2 + hash(i * 3.3) * 5;
      const d = Math.hypot((u - sx) * W, (v - sy) * H);
      const s = Math.max(0, 1 - d / size);
      if (s > spark) { spark = s; tint = [BLUE, PINK, TEAL, ICE][i % 4]; }
    }
    return lerpColor(DARK, tint, Math.min(1, spark * 1.3));
  }), 'confetti', 8);

  // 10. waves: three offset sine ribbons, brightest where they overlap.
  await save(render((u, v) => {
    const w1 = Math.sin((u * 2.4 + 0.1) * Math.PI * 2) * 0.09 + 0.32;
    const w2 = Math.sin((u * 2.4 + 0.55) * Math.PI * 2) * 0.09 + 0.55;
    const w3 = Math.sin((u * 2.4 + 1.0) * Math.PI * 2) * 0.09 + 0.78;
    const near = (w) => Math.exp(-Math.pow((v - w) * 9, 2));
    const g = Math.min(1, near(w1) + near(w2) * 0.85 + near(w3) * 0.7);
    const col = lerpColor(lerpColor(BLUE, INDIGO, near(w2)), TEAL, near(w1));
    return lerpColor(DARK, col, g);
  }), 'waves', 12);

  // 11. prism: diagonal color-split bands, like light through glass.
  await save(render((u, v) => {
    const d = u * 0.72 - v * 0.4;
    const t = ((d % 0.5) + 0.5) % 0.5 / 0.5;
    const stops = [DARK, BLUE, INDIGO, TEAL, PINK, DARK];
    const seg = t * (stops.length - 1), i = Math.floor(seg);
    const col = lerpColor(stops[i], stops[Math.min(i + 1, stops.length - 1)], seg - i);
    const edge = Math.pow(Math.sin(t * Math.PI), 0.6);
    return lerpColor(DARK, col, 0.35 + 0.5 * edge);
  }), 'prism', 11);

  // 12. orbit: concentric glowing rings from an off-center point.
  await save(render((u, v) => {
    const d = Math.hypot((u - 0.72) * 1.5, (v - 0.4) * 2.4);
    const ring = Math.pow(Math.abs(Math.sin(d * 13)), 6);
    const fall = Math.exp(-d * 1.6);
    const col = lerpColor(INDIGO, ICE, Math.min(1, ring * fall * 2));
    return lerpColor(DARK, col, Math.min(1, (ring * 0.8 + 0.2) * fall * 1.6));
  }), 'orbit', 10);

  // 13. terrain: warm topographic contour lines.
  await save(render((u, v) => {
    const n = fbm(u * 3.2, v * 3.2 + 9, 5);
    const line = Math.pow(1 - Math.abs(Math.sin(n * 22)), 9);
    const base = lerpColor(hex('#1a0f30'), PINK_DARK, v);
    return lerpColor(base, hex('#ffd6e6'), Math.min(0.85, line * 1.6));
  }), 'terrain', 12);

  // 14. bokeh: soft out-of-focus circles of light.
  await save(render((u, v) => {
    let g = 0, tint = SKY;
    for (let i = 0; i < 16; i++) {
      const cx = hash(i * 17.3), cy = hash(i * 51.1 + 8);
      const r = 0.06 + hash(i * 9.7) * 0.16;
      const d = Math.hypot((u - cx) * 1, (v - cy) * (W / H) * r * 0 + (v - cy));
      const dd = Math.hypot((u - cx), (v - cy) * (H / W) * 3.2);
      const s = Math.exp(-Math.pow(dd / r, 2) * 2.2) * 0.8;
      if (s > 0.02) { g += s; if (s > 0.3) tint = [SKY, TEAL, PINK, INDIGO][i % 4]; }
    }
    return lerpColor(DARK, tint, Math.min(1, g));
  }), 'bokeh', 10);

  // 15. shards: small angular faceted fragments, each its own tint and shade.
  await save(render((u, v, x, y) => {
    const cell = 46;
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    const jx = hash(cx * 12.1 + cy * 7.7), jy = hash(cx * 33.3 + cy * 91.1);
    const fx = x / cell - cx, fy = y / cell - cy;
    const facet = (fx * (0.6 + jx * 0.8) + fy * (0.6 + jy * 0.8)) % 1;
    const shade = 0.5 + 0.5 * Math.sin(facet * Math.PI * 2 + jy * 6);
    const tint = [BLUE, INDIGO, TEAL][Math.floor((jx + jy) * 3) % 3];
    const vgn = Math.pow(1 - Math.abs(v - 0.5) * 1.1, 0.6);
    return lerpColor(DARK, tint, (0.16 + 0.4 * Math.max(0, shade)) * vgn);
  }), 'shards', 10);

  // 16. ribbon: one flowing satin ribbon crossing the frame.
  await save(render((u, v) => {
    const center = 0.5 + 0.18 * Math.sin(u * Math.PI * 1.6) + 0.08 * Math.sin(u * Math.PI * 5.2 + 2);
    const d = Math.abs(v - center);
    const body = Math.exp(-Math.pow(d * 7, 2));
    const spec = Math.pow(Math.max(0, 1 - Math.abs(d * 7 - 0.35) * 3), 4) * 0.7;
    const col = lerpColor(PINK_DARK, PINK, Math.min(1, body + spec));
    return lerpColor(DARK, lerpColor(col, hex('#ffe6f0'), spec), Math.min(1, body * 0.9 + spec));
  }), 'ribbon', 12);

  // 17. static: fine horizontal scanlines over a cool gradient (a calmer,
  // horizontal cousin of "streaks" -- rows, not columns).
  await save(render((u, v, x, y) => {
    const row = noise1(y * 0.9) * 0.6 + noise1(y * 3.1 + 40) * 0.4;
    const field = Math.pow(Math.max(0, 1 - Math.abs(u - 0.68) * 1.3), 1.6);
    const line = 0.3 + 0.7 * Math.pow(Math.max(0, row), 1.6);
    const glow = field * line;
    return lerpColor(DARK, lerpColor(INDIGO, ICE, Math.pow(glow, 1.5)), Math.min(1, glow * 1.2));
  }), 'static', 15);

  // 18. nebula: a soft multi-hue radial cloud, warm center, cool edges.
  await save(render((u, v) => {
    const n = fbm(u * 2.4 + 12, v * 2.4 + 3, 5);
    const d = Math.hypot((u - 0.55) * 1.1, (v - 0.5) * 1.6);
    const cloud = Math.max(0, (0.75 - d) + n * 0.35);
    const col = lerpColor(lerpColor(PINK, INDIGO, Math.min(1, d * 1.3)), TEAL, Math.max(0, n - 0.5) * 1.2);
    return lerpColor(DARK, col, Math.min(1, cloud * 1.3));
  }), 'nebula', 13);

  // 19. mesh: two soft gradient blobs blending across the frame.
  await save(render((u, v) => {
    const a = Math.exp(-Math.pow(Math.hypot((u - 0.25) * 1.3, (v - 0.3) * 2), 2) * 1.6);
    const b = Math.exp(-Math.pow(Math.hypot((u - 0.8) * 1.3, (v - 0.75) * 2), 2) * 1.6);
    const col = lerpColor(lerpColor(DARK, BLUE, a), lerpColor(DARK, PINK, b), 0.5);
    return lerpColor(DARK, col, Math.min(1, a + b));
  }), 'mesh', 12);

  // 20. constellation: dense connected points, star-field style -- every
  // point links to its nearest neighbor, not just its array-order sibling,
  // so lines actually show up instead of scattering into isolated dots.
  await save(render((u, v) => {
    const n = 34;
    const pts = [];
    for (let i = 0; i < n; i++) pts.push([hash(i * 19.7 + 1), hash(i * 61.3 + 5)]);
    let g = 0;
    for (const [px, py] of pts) g = Math.max(g, Math.exp(-Math.pow(Math.hypot((u - px) * W, (v - py) * H) / 2.6, 2)));
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pts[i];
      let bestJ = -1, bestD = Infinity;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const [bx, by] = pts[j];
        const dd = Math.hypot((ax - bx) * (W / H), ay - by);
        if (dd < bestD) { bestD = dd; bestJ = j; }
      }
      if (bestJ < 0 || bestD > 0.22) continue;
      const [bx, by] = pts[bestJ];
      const t = Math.max(0, Math.min(1, ((u - ax) * (bx - ax) + (v - ay) * (by - ay)) / (Math.pow(bx - ax, 2) + Math.pow(by - ay, 2) + 1e-6)));
      const px2 = ax + (bx - ax) * t, py2 = ay + (by - ay) * t;
      const d = Math.hypot((u - px2) * W, (v - py2) * H);
      g = Math.max(g, Math.exp(-Math.pow(d / 1.3, 2)) * 0.55);
    }
    return lerpColor(DARK, ICE, Math.min(1, g));
  }), 'constellation', 11);
})();
