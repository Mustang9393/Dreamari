"use client";

// DEMO-ONLY, the Black & Blue look (src/app/look-v2.css), light only: the day
// sky, the night sky's twin (22 Oct 2026, Chandu: "how would we make
// lightmode as conceptual and creative as the dark mode? I want to do
// something of a night and day mode").
//
// Second shape (23 Oct 2026, Chandu: "the light mode god rays are too much so
// lets remove the top sun and focus on how we can make the rays look like
// those sunrise photos from space along the earths atmosphere just like we
// did for aurora rather than what we have now. We want to keep some of the
// rainbow stuff though. lens flares where they make sense but visible. Lens
// flares can happen over the cards/surfaces too maybe."):
//
//   - The bottom edge is the Earth's limb at sunrise, seen from orbit, where
//     the aurora stands at night: a thin deep-orange seam, a gold band, a
//     bright white-cyan line, cyan, then blue thinning upward into the page.
//     Cloud tops streak the gold and white bands edge-on. The limb's top
//     wavers a little and the glow swells in patches on its own timing,
//     nothing slides sideways (the aurora's rules).
//   - The sun rises at one point on the limb: a white core, a long warm
//     glare along the limb, a soft column of light, and a few thin shafts
//     fanning up through the atmosphere. On a white page light cannot be
//     added, so the shafts are painted as a faint warm tint with coverage,
//     and their edges split a touch per colour channel (chromatic
//     aberration). A faint spectral halo rings the sun.
//   - Moments (lib/sky.ts): a pulse of brightness runs along the limb away
//     from where it happened, the sun's shafts flare on a big one, and the
//     lens flare lives on its own layer over the page (SkyFlare, below):
//     a source bloom at the pressed control, rainbow-rimmed ghosts strung
//     from there toward the sun, an anamorphic streak and a spectral glint
//     on a big one. Ghosts are a white body with a pastel rim, never a dark
//     hue (Chandu: "make their base LIGHT and not muddy dark colors").
//
// Cost, the aurora's rules: ~40% of screen resolution, 24 frames a second
// (full rate only while a moment plays), paused in hidden tabs, one still
// frame for reduced motion and the counselor's calm sky, no blur filters.
// The flare layer draws only while a moment plays and is display:none
// otherwise. Without WebGL the CSS frame underneath is the whole day.
//
// Shader rules learned the hard way (22 Oct 2026): no `continue`, loops over
// moments unrolled with literal indices, no `pow(x, 2.0)` (undefined for a
// negative base), a hash that is safe at a real 16-bit mediump.
import { useEffect, useRef } from "react";
import { SKY_ARRIVAL_EVENT, SKY_EVENT, SKY_STORM_EVENT } from "@/lib/sky";
import { WEATHER_EVENT, readWeather } from "./weather";

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const MAX_MOMENTS = 4;
/** where the sun rises along the limb, 0..1 across the screen */
const SUN_X = 0.62;

const COMMON = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
// moments: x across the screen 0..1, age in seconds (negative: waiting), big, strength
uniform vec4 uMom[${MAX_MOMENTS}];
// where it happened, 0..1 up the screen; below 0: a page's arrival (no origin)
uniform float uMomY[${MAX_MOMENTS}];
uniform vec2 uLean; // the eased cursor lean, -1..1, for the clouds' parallax
uniform float uWeather; // 0 clear .. 1 storm, eased
uniform float uDark;    // 1 in dark mode: only the storm draws, in night colours
uniform vec4 uStrike;   // lightning: x across the screen, age in seconds, strength, unused

float sq(float x) { return x * x; }
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
// a spectrum, for halos and flare ghosts
vec3 rainbow(float h) {
  return 0.55 + 0.45 * cos(6.2832 * (h + vec3(0.0, 0.33, 0.67)));
}
// cirrus density at a point (23 Oct 2026, reworked after "the clouds look
// kinda bad"): two scales of domain-warped noise, long and soft, feathered
// at the edges so nothing reads as a cut-out; the field evolves inside
// itself as it drifts. Returns 0..1 density.
float cirrus(vec2 p, float t) {
  vec2 q = vec2(p.x * 0.9 - t * 0.01, p.y * 7.0);
  vec2 warp = 0.5 * vec2(fbm(q * 1.1 + t * 0.02), fbm(q * 0.8 - t * 0.012 + 3.0));
  float broad = fbm(q + warp);
  float fine = fbm(vec2(q.x * 2.6, q.y * 1.6) + warp * 1.6 + 5.0 + t * 0.008);
  float d = smoothstep(0.44, 0.74, broad * 0.75 + fine * 0.35);
  float band = smoothstep(0.55, 0.72, p.y) * smoothstep(1.05, 0.86, p.y);
  return d * band;
}
// the storm deck: a low, thick cloud base, soft and lumpy, with structure inside
float deckDensity(vec2 p, float t) {
  vec2 q = vec2(p.x * 1.2 - t * 0.015, p.y * 4.5);
  vec2 warp = 0.4 * vec2(fbm(q * 1.4 + t * 0.02), fbm(q * 1.0 + 7.0 - t * 0.01));
  float n = fbm(q + warp);
  float fine = fbm(q * 3.2 + warp * 2.0 + 11.0);
  float band = smoothstep(0.42, 0.6, p.y) * smoothstep(1.08, 0.82, p.y);
  return smoothstep(0.34, 0.68, n * 0.8 + fine * 0.3) * band;
}
// paint c with coverage w over what is already there (premultiplied)
void over(inout vec3 P, inout float A, vec3 c, float w) {
  w = clamp(w, 0.0, 1.0);
  P = P * (1.0 - w) + c * w;
  A = A * (1.0 - w) + w;
}
`;

// ---- the sky: the limb at sunrise, on the bottom edge
const FRAG_SKY = COMMON + `
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  float x = uv.x * aspect;

  // ---- moments along the limb: a pulse of brightness running both ways
  // from where it happened; a big one also flares the sun's shafts
  float pulse = 0.0;
  float flare = 0.0;
  ${[0, 1, 2, 3].map((i) => `
  {
    vec4 m = uMom[${i}];
    float age = m.y;
    if (m.w > 0.0 && age >= 0.0 && age <= 2.0) {
      float big = m.z > 0.5 ? 1.0 : 0.0;
      float d = abs(uv.x - m.x) * aspect;
      float fade = 1.0 - smoothstep(0.6, 2.0, age);
      float run = exp(-sq((d - age * 0.5) / 0.09));
      float near = exp(-sq(d / 0.12)) * smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.2, 1.2, age));
      pulse += (run * fade + near * 0.7) * m.w * (1.0 + 0.6 * big);
      flare += big * m.w * smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(0.5, 1.4, age));
    }
  }`).join("")}

  vec3 P = vec3(0.0);
  float A = 0.0;
  vec3 light = vec3(1.0, 1.0, 1.0);
  float lift = 0.012 * (fbm(vec2(x * 0.9 + 3.0, t * 0.04)) - 0.5);
  float h = max(0.0, uv.y - lift);
  float day = 1.0 - uDark;

  // ---- the limb as light only (Chandu: "keep it strictly to light like
  // actual light flow not any colors"; "I dont see any light stuff on the
  // bottom of the page"): white light standing on the bottom edge over the
  // page's faint blue, streaming along the limb and rising, swelling in
  // patches on its own timing. Day only; at night the aurora owns the edge.
  if (uDark < 0.5) {
    float swell = 0.7 + 0.3 * smoothstep(0.2, 0.8, fbm(vec2(x * 1.4 + 11.0, t * 0.07)));
    swell *= 1.0 + 0.9 * pulse;
    float flow = 0.5 + 0.5 * fbm(vec2(x * 2.2 + 5.0, h * 16.0 - t * 0.06));
    float fil = 0.6 + 0.4 * noise(vec2(x * 9.0 + t * 0.015, h * 60.0 - t * 0.1));
    float band = (exp(-h / 0.08) * 1.4 + exp(-h / 0.3) * 0.9) * swell * (0.7 + 0.6 * flow * fil);
    float seam = exp(-h / 0.014) * 1.2 * swell;
    float halo = exp(-h / 0.5) * 0.45 * swell;
    over(P, A, light, (seam + band + halo) * (1.0 - 0.6 * uWeather));
    float sh = noise(vec2(x * 5.0 + 2.0, t * 0.05));
    sh = sh * sh * sh;
    float breatheL = 0.4 + 0.6 * smoothstep(0.3, 0.8, noise(vec2(x * 2.5 + 11.0, t * 0.11)));
    over(P, A, light, sh * breatheL * exp(-h / 0.42) * 1.0 * (1.0 + pulse) * (1.0 - 0.7 * uWeather));

    // the sun on the limb: a white core, a long glare, a soft column, thin shafts
    vec2 ds = (uv - vec2(${SUN_X.toFixed(2)}, 0.012 + lift)) * vec2(aspect, 1.0);
    float dd = length(ds);
    float dim = 1.0 - 0.75 * uWeather;
    float core = (exp(-dd / 0.028) * 1.6 + exp(-dd / 0.08) * 0.45) * dim;
    float glare = exp(-abs(ds.y) / 0.014) * exp(-abs(ds.x) / 0.32) * (0.85 + 0.3 * flare) * dim;
    float column = exp(-abs(ds.x) / 0.045) * exp(-max(0.0, ds.y) / 0.22) * 0.32 * dim;
    over(P, A, light, glare);
    over(P, A, light, column);
    over(P, A, light, core);
    float ang = atan(ds.x, max(ds.y, 0.002));
    float ra = ang * 14.0 + 0.04 * sin(t * 0.07);
    float ab = 0.14;
    vec3 r1 = vec3(noise(vec2(ra - ab, t * 0.05)), noise(vec2(ra, t * 0.05)), noise(vec2(ra + ab, t * 0.05)));
    float r2 = noise(vec2(ra * 2.5 + 5.0, t * 0.08 + 3.0));
    vec3 shaft = r1 * r1 * r1 * (0.6 + 0.4 * r2);
    float breathe = 0.4 + 0.6 * smoothstep(0.3, 0.8, noise(vec2(ra * 0.5 + 11.0, t * 0.11)));
    float reach = exp(-dd / 0.30) * smoothstep(0.0, 0.03, ds.y) * (1.0 + 1.2 * flare) * dim;
    vec3 rays = shaft * breathe * reach;
    over(P, A, light, rays.g * 0.4);
    P += vec3(0.04, 0.0, -0.03) * (rays.r - rays.b) * A;
  }

  // ---- the clouds. Clear: soft cirrus, white strands with a faint neutral
  // shade, lit from behind on a moment. Storm: a low thick deck, lit from
  // inside by lightning. The band leans a few pixels against the cursor.
  vec2 cp = vec2(x, uv.y) - uLean * vec2(0.014, 0.007);
  float cc = cirrus(cp, t) * day;
  float dk = deckDensity(cp, t);
  float c = mix(cc, max(cc * 0.5, dk), uWeather);
  // shading from the density above: tops lit, undersides shaded
  float cAbove = mix(cirrus(cp + vec2(0.0, 0.012), t) * day, deckDensity(cp + vec2(0.0, 0.02), t), uWeather);
  float lit = clamp((c - cAbove) * 5.0, 0.0, 1.0);
  float under = clamp((cAbove - c) * 4.0, 0.0, 1.0);
  // the moments' pulse, read along the cloud band
  float lining = 0.0;
  ${[0, 1, 2, 3].map((i) => `
  {
    vec4 m = uMom[${i}];
    float age = m.y;
    if (m.w > 0.0 && age >= 0.0 && age <= 2.0) {
      float d = abs(uv.x - m.x) * aspect;
      lining += exp(-sq((d - age * 0.45) / 0.16)) * (1.0 - smoothstep(0.5, 2.0, age)) * m.w * (m.z > 0.5 ? 1.5 : 1.0);
      lining += exp(-sq(d / 0.2)) * smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.3, 1.4, age)) * m.w * 0.8;
    }
  }`).join("")}
  // lightning as light inside the cloud (Chandu: "like the clouds lighting
  // up not like flat 2d flash graphics"): a source inside the deck, its
  // light falling off with distance and scattering through the density, so
  // the cloud's own structure shows while it glows; a few flickers.
  float strike = 0.0;
  float glowIn = 0.0;
  if (uStrike.z > 0.0 && uStrike.y >= 0.0 && uStrike.y < 2.2) {
    // one swell per strike, never a flicker (23 Oct 2026, Chandu: "tone down
    // the flashes a bit. We have epilepsy and stuff to think about"; WCAG
    // 2.3.1 allows at most three flashes a second and this is one slow one):
    // a 180 ms rise, a long fall, and the lift capped well under full white
    float sa = uStrike.y;
    float swellS = smoothstep(0.0, 0.18, sa) * exp(-max(0.0, sa - 0.18) / 0.5);
    strike = swellS * uStrike.z * 0.6;
    vec2 sp = vec2(uStrike.x * aspect, 0.8 + 0.06 * sin(uStrike.x * 20.0));
    float sdist = length(vec2(x, uv.y) - sp);
    // light inside density: thick parts near the source glow most; thin
    // parts let it through as a softer haze; it dies with distance
    float core = exp(-sdist / 0.1);
    float spread = exp(-sdist / 0.3);
    glowIn = strike * (core * (0.6 + 1.4 * c) + spread * (0.25 + 0.5 * c) * 0.6);
    glowIn = min(glowIn, 0.6);
  }
  // clear palette (day), or the night deck
  vec3 cloudDay = mix(vec3(0.975, 0.98, 0.99), light, lit);
  cloudDay = mix(cloudDay, vec3(0.86, 0.89, 0.935), under * 0.4);
  float through = clamp(lining, 0.0, 1.0) * (0.5 + 0.8 * lit + 0.6 * (1.0 - c));
  cloudDay = mix(cloudDay, light, through * 0.9);
  vec3 deckDay = mix(vec3(0.70, 0.73, 0.78), vec3(0.52, 0.55, 0.61), under * 0.7 + 0.3 * c);
  deckDay = mix(deckDay, vec3(0.86, 0.88, 0.92), lit * 0.5);
  vec3 deckNight = mix(vec3(0.13, 0.16, 0.22), vec3(0.06, 0.08, 0.12), under * 0.7 + 0.3 * c);
  deckNight = mix(deckNight, vec3(0.22, 0.26, 0.34), lit * 0.5);
  vec3 deck = mix(deckDay, deckNight, uDark);
  // the lightning's colour: warm-white by day, blue-white at night, kept
  // under full white so the texture survives the flash
  vec3 bolt = mix(vec3(1.0, 0.98, 0.94), vec3(0.80, 0.88, 1.0), uDark);
  deck = mix(deck, bolt, clamp(glowIn, 0.0, 0.55));
  vec3 cloud = mix(cloudDay, deck, uWeather);
  float covDay = cc * (0.9 + 0.4 * through);
  float covStorm = min(1.0, c * (1.05 + 0.25 * glowIn));
  over(P, A, cloud, mix(covDay, covStorm, uWeather));
  // light through the gaps below the band while a moment plays (clear only)
  float gap = (1.0 - c) * smoothstep(0.3, 0.62, uv.y) * smoothstep(0.78, 0.62, uv.y);
  float fallN = noise(vec2(x * 6.0 + 1.0, t * 0.04));
  over(P, A, light, gap * fallN * fallN * clamp(lining, 0.0, 1.0) * 0.5 * (1.0 - uWeather) * day);
  // storm: the glow scattering out of the deck into the air under it, rain, and the strike's soft lift on the page
  if (uWeather > 0.01) {
    float colId = floor(x * 70.0);
    float cx = fract(x * 70.0);
    float hcol = hash(vec2(colId, 7.0));
    float fall = fract(uv.y * 2.2 + t * (1.3 + hcol) + hcol * 9.0);
    float drop = smoothstep(0.0, 0.05, fall) * smoothstep(0.26, 0.08, fall) * exp(-sq((cx - 0.5) / 0.06));
    // thin and sparse, under the deck only, gone before the content zone
    float rain = drop * step(0.72, hcol) * smoothstep(0.78, 0.6, uv.y) * smoothstep(0.3, 0.52, uv.y);
    over(P, A, mix(vec3(0.74, 0.79, 0.87), vec3(0.42, 0.48, 0.6), uDark), rain * mix(0.16, 0.07, uDark) * uWeather);
    over(P, A, bolt, glowIn * (1.0 - c) * 0.1 * uWeather * smoothstep(0.3, 0.6, uv.y));
    over(P, A, bolt, strike * 0.03 * uWeather);
  }

  // ---- motes: white specks rising through the glow near the limb (day)
  if (uDark < 0.5) {
    float motes = 0.0;
    for (int k = 0; k < 2; k++) {
      float kf = float(k);
      vec2 g = vec2(x, uv.y) * (18.0 + kf * 8.0);
      g.y -= t * (0.05 + kf * 0.02);
      g.x += 0.15 * sin(t * 0.3 + floor(g.y) * 1.7 + kf);
      vec2 cell = floor(g);
      vec2 f = fract(g);
      float hh = hash(cell + kf * 17.0);
      vec2 pos = vec2(hash(cell + 3.1 + kf), hash(cell + 7.7 + kf));
      float spark = 0.6 + 0.4 * sin(t * (1.0 + hh * 2.0) + hh * 6.28);
      motes += step(0.74, hh) * exp(-length(f - pos) * 11.0) * spark;
    }
    float moteBand = smoothstep(0.015, 0.05, h) * exp(-h / 0.12);
    over(P, A, light, motes * moteBand * 0.8 * (1.0 - uWeather));
  }

  gl_FragColor = vec4(min(P, vec3(1.0)), A);
}
`;

// ---- the flare: over the page, only while a moment plays. Drawn the way a
// lens draws one (23 Oct 2026, Chandu: "The lens flare is good but render it
// better. More realistically"): the pressed control is the light source, with
// a hot core, a wide veiling haze and an eight-point starburst; the ghosts
// sit on the line from the source through the centre of the frame, most of
// them on the far side, iris-shaped (eight blades), a mix of thin rings and
// soft discs, each with only a faint chromatic rim.
const FRAG_FLARE = COMMON + `
// an eight-bladed iris: the distance field of a regular octagon
float iris(vec2 p) {
  return max(max(abs(p.x), abs(p.y)), max(abs(p.x + p.y), abs(p.x - p.y)) * 0.7071);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 ctr = vec2(0.5, 0.5);
  vec3 P = vec3(0.0);
  float A = 0.0;
  vec3 light = vec3(1.0, 1.0, 1.0);
  ${[0, 1, 2, 3].map((i) => `
  {
    vec4 m = uMom[${i}];
    float age = m.y;
    float oy = uMomY[${i}];
    if (m.w > 0.0 && oy >= 0.0 && age >= 0.0 && age <= 2.0) {
      float big = m.z > 0.5 ? 1.0 : 0.0;
      vec2 origin = vec2(m.x, oy);
      // the source flashes fast; the ghosts linger a little longer
      float srcEnv = smoothstep(0.0, 0.06, age) * (1.0 - smoothstep(0.15, 0.8, age)) * m.w;
      float life = smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.5, 1.6, age)) * (0.65 + 0.35 * big) * m.w;
      vec2 so = (uv - origin) * vec2(aspect, 1.0);
      float sd = length(so);
      vec2 toCtr = (ctr - origin) * vec2(aspect, 1.0);
      vec2 dir = length(toCtr) > 0.05 ? normalize(toCtr) : normalize(vec2(1.0, -0.45));
      float drift = 1.0 + 0.1 * smoothstep(0.0, 1.4, age);
      // veiling haze: the wide soft lift in brightness round a bright source
      over(P, A, light, (exp(-sd / 0.28) * 0.2 * big + exp(-sd / 0.1) * 0.3) * srcEnv);
      // the core: a soft bloom that carries the feel of light
      over(P, A, light, (exp(-sd / 0.04) * 1.4 + exp(-sd / 0.13) * 0.55) * srcEnv);
      // the starburst: eight thin spikes, their tips faintly split into a spectrum
      float angS = atan(so.y, so.x);
      float spikes = pow(abs(cos(angS * 4.0)), 40.0);
      float star = spikes * exp(-sd / 0.12) * big * srcEnv;
      over(P, A, mix(light, 0.82 + 0.18 * rainbow(sd * 9.0), smoothstep(0.04, 0.12, sd)), star * 0.9);
      // a wide soft spectral arc on the far side, faint
      if (big > 0.5) {
        vec2 aq = so - dir * 0.85 * drift;
        float ad = length(aq);
        float arc = exp(-sq((ad - 0.25) / 0.028)) * life;
        over(P, A, 0.8 + 0.2 * rainbow((ad - 0.22) * 9.0), arc * 0.14);
      }
      // a faint anamorphic streak through the source
      float streak = exp(-sq(so.y / 0.0025)) * exp(-abs(so.x) / 0.2) * srcEnv * big * 0.45;
      over(P, A, vec3(0.9, 0.95, 1.0), streak);
      // (dir and drift are set above the starburst; the ghosts reuse them)
      // the ghosts, on the optical axis, spaced by fixed screen distances so
      // they spread across the frame wherever the source is. Soft light, not
      // rings (23 Oct 2026, Chandu: "too big at places and the shape is
      // squished... Make it feel like light and not just sharp rings"):
      // small round gaussian glows with a wide feathered rim, warm at the
      // centre and cool at the edge, a whisper of spectrum on the rim, each
      // drifting outward and breathing over its life.
      for (int g = 0; g < 6; g++) {
        float gf = float(g);
        if (gf < 3.0 || big > 0.5) {
          float sdist = (gf < 0.5 ? 0.14 : gf < 1.5 ? 0.3 : gf < 2.5 ? 0.5 : gf < 3.5 ? 0.72 : gf < 4.5 ? 0.95 : 1.2) * drift;
          float gr = (gf < 0.5 ? 0.018 : gf < 1.5 ? 0.04 : gf < 2.5 ? 0.028 : gf < 3.5 ? 0.06 : gf < 4.5 ? 0.034 : 0.07) * (1.0 + 0.05 * sin(age * 4.0 + gf * 1.3));
          vec2 gq = so - dir * sdist;
          float d = length(gq);
          float glow = exp(-sq(d / gr));
          // the rim split per channel, red outside and blue inside, as pale
          // tints on white (23 Oct 2026, Chandu: "lets add some rainbow
          // dispersion. Faint. But visible. Not hard.")
          float w = gr * 0.42;
          float rr = exp(-sq((d - gr * 1.02) / w));
          float rg = exp(-sq((d - gr * 0.95) / w));
          float rb = exp(-sq((d - gr * 0.88) / w));
          float rim = max(rr, max(rg, rb));
          vec3 disp = 1.0 - (1.0 - vec3(rr, rg, rb) / max(rim, 1e-4)) * 0.28;
          vec3 col = mix(vec3(1.0, 0.985, 0.95), vec3(0.93, 0.96, 1.0), smoothstep(0.0, 1.0, d / gr));
          col = mix(col, disp, rim * 0.85);
          over(P, A, col, (glow * 0.8 + rim * 0.42) * life);
        }
      }
      // a big one: a glint away from the source, gone in under a second
      if (big > 0.5 && age < 0.9) {
        float p = age / 0.9;
        vec2 hpos = origin + vec2(0.04 + p * 0.2, 0.02 + p * 0.03);
        vec2 gg = (uv - hpos) * vec2(aspect, 1.0);
        float along = gg.x / 0.09;
        float tail = along < 0.0 ? exp(-abs(along) * 1.3) : exp(-along * 12.0);
        float line = exp(-sq(gg.y / 0.003)) * tail * (1.0 - p * p);
        float head = exp(-length(gg) / 0.011) * (1.0 - p);
        over(P, A, mix(light, 0.8 + 0.2 * rainbow(along * 0.25 + p), 0.4), line * 0.9 + head * 0.9);
      }
    }
  }`).join("")}
  gl_FragColor = vec4(min(P, vec3(1.0)), A);
}
`;

const SCALE = 0.4;
const FLARE_SCALE = 0.5;
const FPS = 24;
const MOMENT_MS = 2000;

type Moment = { x: number; /** px down the screen; absent for a page's arrival */ y?: number; big: boolean; t0: number; strength: number };

const isLightNow = () => document.documentElement.classList.contains("light");
const isDay = () => document.documentElement.classList.contains("look-v2") && isLightNow();

/**
 * One WebGL layer: compiles the shader, sizes the canvas, draws on demand and
 * runs a loop. `always` layers (the sky) run whenever visible; a `momentsOnly`
 * layer (the flare) runs only while a moment plays and hides otherwise.
 */
/** per-frame extras: [leanX, leanY, weather, strikeX, strikeAge, strikeStrength, dark] */
function layer(canvas: HTMLCanvasElement, frag: string, scale: number, momentsOnly: boolean, still: boolean, getExtra?: () => number[], isOn: () => boolean = isDay) {
  canvas.style.display = "none";
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl || gl.isContextLost()) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uMom = gl.getUniformLocation(prog, "uMom[0]");
  const uMomY = gl.getUniformLocation(prog, "uMomY[0]");
  const uLean = gl.getUniformLocation(prog, "uLean");
  const uWeather = gl.getUniformLocation(prog, "uWeather");
  const uStrike = gl.getUniformLocation(prog, "uStrike");
  const uDark = gl.getUniformLocation(prog, "uDark");
  const momData = new Float32Array(MAX_MOMENTS * 4);
  const momY = new Float32Array(MAX_MOMENTS);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let dead = false;
  let raf = 0;
  let last = 0;
  let running = false;
  let moments: Moment[] = [];
  const t0 = performance.now() - 40_000;
  const onLost = (e: Event) => { e.preventDefault(); dead = true; canvas.style.display = "none"; cancelAnimationFrame(raf); };
  canvas.addEventListener("webglcontextlost", onLost);

  const size = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth * scale));
    const h = Math.max(1, Math.round(canvas.clientHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  const draw = (now: number, frozen: boolean) => {
    if (dead) return;
    size();
    moments = moments.filter((m) => now - m.t0 < MOMENT_MS);
    momData.fill(0);
    momY.fill(-1);
    moments.slice(0, MAX_MOMENTS).forEach((m, i) => {
      momData[i * 4] = m.x / Math.max(1, canvas.clientWidth);
      momData[i * 4 + 1] = (now - m.t0) / 1000;
      momData[i * 4 + 2] = m.big ? 1 : 0;
      momData[i * 4 + 3] = m.strength;
      momY[i] = m.y === undefined ? -1 : 1 - m.y / Math.max(1, canvas.clientHeight);
    });
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, frozen ? 40 : ((now - t0) / 1000) % 7200.0);
    gl.uniform4fv(uMom, momData);
    gl.uniform1fv(uMomY, momY);
    const ex = getExtra ? getExtra() : [0, 0, 0, 0, -1, 0];
    gl.uniform2f(uLean, ex[0], ex[1]);
    gl.uniform1f(uWeather, ex[2]);
    gl.uniform4f(uStrike, ex[3], ex[4], ex[5], 0);
    gl.uniform1f(uDark, ex[6] ?? 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const frozen = () => still || reduce.matches;
  const idle = () => {
    // nothing left to play
    if (momentsOnly) canvas.style.display = "none";
    else draw(performance.now(), true);
  };
  const loop = (now: number) => {
    if (!moments.length && (frozen() || momentsOnly) && !(getExtra && (getExtra()[5] > 0 || getExtra()[2] > 0.001))) { raf = 0; idle(); return; }
    raf = requestAnimationFrame(loop);
    if (!moments.length && now - last < 1000 / FPS) return;
    last = now;
    draw(now, frozen() && !moments.length);
  };
  const play = () => {
    if (!running || dead) return;
    if (momentsOnly) canvas.style.display = "";
    if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
  };
  const sync = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    const visible = isOn() && !dead;
    canvas.style.display = visible && !momentsOnly ? "" : "none";
    running = visible && !document.hidden;
    if (!running) return;
    if (momentsOnly) { if (moments.length) play(); return; }
    if (frozen()) { draw(performance.now(), true); if (moments.length) play(); return; }
    last = 0;
    raf = requestAnimationFrame(loop);
  };
  return {
    sync,
    play,
    push(m: Moment) { if (!running || reduce.matches) return; moments.push(m); play(); },
    isRunning: () => running,
    redraw() { if (!raf && running && !momentsOnly) draw(performance.now(), true); },
    dispose() { cancelAnimationFrame(raf); canvas.removeEventListener("webglcontextlost", onLost); canvas.style.display = "none"; },
  };
}

/** The day sky, inside the backdrop (light only). */
export function SkySun({ still = false }: { /** one frame, no motion (the counselor's calm sky); a moment still plays, then it is still again */ still?: boolean } = {}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // the clouds' parallax: an eased lean toward the opposite of the cursor
    let aimX = 0, aimY = 0, leanX = 0, leanY = 0;
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      aimX = (e.clientX / window.innerWidth) * 2 - 1;
      aimY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // the storm (the Storm switch, WeatherSwitch.tsx): eased in over ~1.5s;
    // lightning on skyStorm() (a missed streak, once that signal exists) and,
    // while the storm is on, on its own every 7 to 14 seconds
    let weather = readWeather() === "storm" ? 1 : 0;
    let strike: { x: number; t0: number; strength: number } | null = null;
    let nextStrike = 0;
    const strikeNow = (x?: number, strength = 1) => {
      // never under reduced motion, and never within 7 s of the last one
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const now = performance.now();
      if (strike && now - strike.t0 < 7000) return;
      strike = { x: x ?? 0.15 + Math.random() * 0.7, t0: now, strength };
      L?.play();
    };
    const onStorm = (e: Event) => { const d = (e as CustomEvent<{ x?: number } | undefined>).detail; strikeNow(d?.x === undefined ? undefined : d.x / window.innerWidth, 1.2); };
    const onWeather = () => { if (L) { L.sync(); L.play(); } };
    const getExtra = (): number[] => {
      leanX += (aimX - leanX) * 0.08;
      leanY += (aimY - leanY) * 0.08;
      const target = readWeather() === "storm" ? 1 : 0;
      weather += (target - weather) * 0.04;
      if (Math.abs(target - weather) < 0.005) weather = target;
      const now = performance.now();
      if (weather > 0.5 && now > nextStrike) { nextStrike = now + 9000 + Math.random() * 8000; strikeNow(); }
      if (weather <= 0.5) nextStrike = now + 2000;
      const age = strike ? (now - strike.t0) / 1000 : -1;
      if (strike && age > 2.2) strike = null;
      return [leanX, leanY, weather, strike?.x ?? 0, strike ? age : -1, strike?.strength ?? 0, isLightNow() ? 0 : 1];
    };
    // light: always. Dark: only while the storm is on (its own night deck,
    // rain and lightning over the stars; the aurora keeps the edge).
    const isOn = () => document.documentElement.classList.contains("look-v2") && (isLightNow() || readWeather() === "storm" || weather > 0.01);
    const L = layer(canvas, FRAG_SKY, SCALE, false, still, getExtra, isOn);
    if (!L) return;
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener(SKY_STORM_EVENT, onStorm);
    window.addEventListener(WEATHER_EVENT, onWeather);
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMoment = (e: Event) => {
      const { x, big } = (e as CustomEvent<{ x: number; y?: number; big: boolean }>).detail;
      L.push({ x, big, t0: performance.now(), strength: 1 });
    };
    // the wake on every page (the stars' rule): a pulse along the limb from a
    // random spot, at least a fifth of the width from last time
    let lastWake = 0;
    const wake = () => {
      if (!L.isRunning() || reduce.matches) return;
      const now = performance.now();
      if (now - lastWake < 800) return;
      lastWake = now;
      let prev = 0.5;
      try { prev = Number(sessionStorage.getItem("dreamari-sky-wake") ?? 0.5); } catch { /* storage blocked */ }
      let ox = 0.1 + Math.random() * 0.8;
      if (Math.abs(ox - prev) < 0.2) ox = prev < 0.5 ? prev + 0.2 + Math.random() * 0.3 : prev - 0.2 - Math.random() * 0.3;
      try { sessionStorage.setItem("dreamari-sky-wake", String(ox)); } catch { /* storage blocked */ }
      const strength = 0.85 + Math.random() * 0.3;
      L.push({ x: canvas.clientWidth * ox, big: false, t0: now, strength });
      if (Math.random() < 0.3) L.push({ x: canvas.clientWidth * ox, big: false, t0: now + 380 + Math.random() * 240, strength: strength * 0.45 });
    };
    let wasRunning = false;
    const sync = () => {
      L.sync();
      if (L.isRunning() && !wasRunning) window.setTimeout(wake, 250 + Math.random() * 500);
      wasRunning = L.isRunning();
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    window.addEventListener(SKY_EVENT, onMoment);
    window.addEventListener(SKY_ARRIVAL_EVENT, wake);
    window.addEventListener("resize", L.redraw);
    return () => {
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      window.removeEventListener(SKY_EVENT, onMoment);
      window.removeEventListener(SKY_ARRIVAL_EVENT, wake);
      window.removeEventListener("resize", L.redraw);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener(SKY_STORM_EVENT, onStorm);
      window.removeEventListener(WEATHER_EVENT, onWeather);
      L.dispose();
    };
  }, [still]);
  return <canvas ref={ref} aria-hidden data-sky-sun className="pointer-events-none absolute inset-0 h-full w-full" style={{ display: "none" }} />;
}

/** The lens flare, over the page (light only), only while a moment plays. */
export function SkyFlare() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const L = layer(canvas, FRAG_FLARE, FLARE_SCALE, true, false);
    if (!L) return;
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMoment = (e: Event) => {
      const { x, y, big } = (e as CustomEvent<{ x: number; y?: number; big: boolean }>).detail;
      if (y === undefined) return; // no origin, no flare
      L.push({ x, y, big, t0: performance.now(), strength: 1 });
    };
    L.sync();
    const mo = new MutationObserver(L.sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", L.sync);
    reduce.addEventListener("change", L.sync);
    window.addEventListener(SKY_EVENT, onMoment);
    return () => {
      mo.disconnect();
      document.removeEventListener("visibilitychange", L.sync);
      reduce.removeEventListener("change", L.sync);
      window.removeEventListener(SKY_EVENT, onMoment);
      L.dispose();
    };
  }, []);
  // above the page, below sheets and dialogs; never catches a pointer
  return <canvas ref={ref} aria-hidden data-sky-flare className="pointer-events-none fixed inset-0 z-[45] h-full w-full" style={{ display: "none" }} />;
}
