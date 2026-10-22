"use client";

// DEMO-ONLY, the Black & Blue look (src/app/look-v2.css), light only: the day
// sky, the night sky's twin (22 Oct 2026, Chandu: "how would we make
// lightmode as conceptual and creative as the dark mode? I want to do
// something of a night and day mode ... I think sunshine instead of the
// aurora might work but I think we'll need some atmospheric clouds").
//
// The rule that flips. At night the ground stays black and the sky comes
// from light (NightSky.tsx, SkyAurora.tsx: light added over black). Adding
// light to white does nothing, so by day the ground stays paper white and
// the sky comes from air: everything here is atmosphere, drawn with depth
// and shadow instead of glow. A day sky is deepest blue straight up and
// white at the horizon, the reverse of night, so the blue sits behind the
// header and the haze sits on the bottom edge.
//
// Layers, one fragment shader, all from the aurora's own noise:
//   - the sun, never drawn as a disc (the stars are not star shaped either):
//     it sits just off the top edge, where the aurora sits on the bottom
//     edge, and only what it does is visible: a warm bloom at the edge and
//     crepuscular rays fanning down through the haze. The rays read because
//     the gaps between them stay a touch deeper blue: shadow, not light;
//   - cirrus: thin high bands, lit from the sun's side, a faint grey-blue
//     underside. The underside is the day's contrast, and it gives frosted
//     glass something to blur (17 Sept 2026: "the glassy effects and
//     frosting arent even visible on light mode");
//   - a pale haze on the bottom edge, where the aurora's seam is at night;
//   - motes: a few warm specks drifting up inside the rays only, the way dust
//     shows in a sunbeam. The stars' twin: points the wave can run through,
//     invisible outside the light so they never clutter the page.
// Everything stays in the top third and the bottom edge, the frame the stars
// keep, so the content zone stays calm.
//
// Moments (lib/sky.ts), the same events the night sky answers:
//   - a page's arrival: the sun breaks through, a brightening sweeps the
//     clouds and rays out from a random gap (varied like NightSky's wake);
//   - a small moment: a ray brightens over where it happened and the cloud
//     edge there lights up silver;
//   - a big moment: a sunburst, the rays flare for a beat and one glint
//     streaks across the cloud band (the shooting star's twin).
//
// Cost, the aurora's rules: ~40% of screen resolution, 24 frames a second
// (full rate only while a moment plays), paused in hidden tabs, one still
// frame for reduced motion and the counselor's calm sky, no blur filters.
// Without WebGL the CSS sky underneath is the whole day. AA: text sits on
// this sky, so by day the thing capped is darkness: the deepest blue is the
// zenith behind the header, and the layer fades out before the content.
import { useEffect, useRef, useSyncExternalStore } from "react";
import { SKY_ARRIVAL_EVENT, SKY_EVENT } from "@/lib/sky";

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const MAX_MOMENTS = 4;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uSun;
// moments: x across the screen 0..1, age in seconds (negative: waiting), big, strength
uniform vec4 uMom[${MAX_MOMENTS}];
uniform float uMomY[${MAX_MOMENTS}]; // where it happened, 0..1 up the screen; below 0: the edge

// Dave Hoskins' hash without sine: safe at a real 16-bit mediump (SkyAurora.tsx)
float sq(float x) { return x * x; } // pow(x, 2.0) is undefined for x < 0 in GLSL ES

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

// a spectrum, for halos and flare ghosts (22 Oct 2026, Chandu: "can we add
// some rainbow effects like we see with some lensflare etc for action
// reactions?"): sunlight through a lens or ice splits into this
vec3 rainbow(float h) {
  return 0.55 + 0.45 * cos(6.2832 * (h + vec3(0.0, 0.33, 0.67)));
}

// cirrus density at a point: long thin bands, stretched sideways, drifting
float cirrus(vec2 p, float t) {
  // long streaks: the noise is stretched sideways and combed by a second
  // noise, the way wind draws ice cloud into strands
  vec2 q = vec2(p.x * 1.1 - t * 0.012, p.y * 9.0);
  vec2 warp = 0.45 * vec2(fbm(q * 1.3 + t * 0.01), fbm(q * 0.9 - t * 0.008));
  float n = fbm(q + warp);
  float fine = fbm(vec2(q.x * 3.0, q.y * 1.4) + warp * 2.0 + 4.0);
  float body = smoothstep(0.50, 0.70, n);
  float strands = smoothstep(0.42, 0.62, fine) * smoothstep(0.42, 0.58, n);
  // only the upper band carries cloud; it thins out toward the content
  float band = smoothstep(0.56, 0.70, p.y) * smoothstep(1.04, 0.84, p.y);
  return clamp(body * 0.8 + strands * 0.55, 0.0, 1.0) * band;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  // the sun: just above the top edge, a little right of centre
  vec2 sun = uSun;
  float low = step(sun.y, 0.5); // 1.0: the sun sits on the horizon
  vec2 d = (uv - sun) * vec2(aspect, 1.0);
  float dist = length(d);
  float ang = atan(d.x, abs(d.y));

  // ---- moments: the light answers from the rays themselves (22 Oct 2026,
  // Chandu: "lets try to make the reactions come from the rays themselves
  // not like a water ripple"). The shafts that pass through where it
  // happened surge, and a band of brightness runs along them away from the
  // sun, their chromatic edges flaring as it passes. No ring.
  float breakLocal = 0.0;  // the surge: brighter rays, silver cloud edges, motes
  float flare = 0.0;       // a big moment: the whole sky's rays flare for a beat
  float surgeAb = 0.0;     // the chromatic split widens as a surge passes
  vec3 glint = vec3(0.0);
  // flare ghosts in spectral colour: a white body of light with a pastel
  // rim painted as coverage, so they read as light through glass, never a
  // dark hue (Chandu: "make their base LIGHT and not muddy dark colors")
  vec3 irisCol = vec3(0.0);
  float irisCov = 0.0;
  float swellLight = 0.0;
  // unrolled with literal indices and no continue (22 Oct 2026): the GPU
  // shader compiler miscompiled the loop form, blanking the whole layer
  {
    vec4 m = uMom[0];
    float age = m.y;
    if (m.w > 0.0 && age >= 0.0 && age <= 2.0) {
    float big = m.z > 0.5 ? 1.0 : 0.0;
    // where it happened: the pressed control (Chandu: "the lensflare could
    // come from the origin of the action"), or, for a page's arrival, the
    // edge the light comes from
    float oy = uMomY[0];
    vec2 origin = vec2(m.x, oy < 0.0 ? mix(0.92, 0.08, low) : oy);
    // the rays that pass through that point
    vec2 od = (origin - sun) * vec2(aspect, 1.0);
    float angO = atan(od.x, abs(od.y));
    float spread = mix(0.17, 0.055, low) * (1.0 + 0.5 * big);
    float window = exp(-sq((ang - angO) / spread));
    // the surge: a quick rise, a slow fade, and a band of brightness running
    // along the shafts away from the sun
    float env = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.3, 1.8, age));
    float travel = mix(1.0 - uv.y, uv.y, low);
    float band = exp(-sq((travel - age * 0.55) / 0.14)) * (1.0 - smoothstep(0.8, 1.6, age));
    float surge = window * (0.9 * env + 1.3 * band) * m.w * (1.0 + 0.6 * big);
    breakLocal += surge;
    surgeAb += window * band * m.w;
    {
      // a lens flare from the action: rainbow-rimmed ghosts strung along the
      // line from where it happened through the middle of the screen, each
      // a different size, blooming in a blink and fading over a second. A
      // small moment gets two faint ghosts, a big one the whole chain.
      float life = smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.35, 1.3, age)) * (0.55 + 0.45 * big);
      for (int g = 0; g < 4; g++) {
        float gf = float(g);
        if (gf < 2.0 || big > 0.5) {
        float k = 0.18 + gf * 0.27;
        vec2 gp = mix(origin, vec2(0.5, 0.5), k);
        float gr = 0.02 + gf * 0.02;
        float gd = length((uv - gp) * vec2(aspect, 1.0));
        float rim = exp(-sq((gd - gr) / (gr * 0.32)));
        float disc = exp(-gd / gr) * 0.3;
        swellLight += (rim * 0.55 + disc * 0.7) * life * m.w;
        float cov = clamp(rim * 0.5 * life * m.w, 0.0, 1.0);
        irisCol = mix(irisCol, 0.76 + 0.24 * rainbow(gd / gr * 0.7 + gf * 0.23 + age * 0.15), cov);
        irisCov += cov * (1.0 - irisCov);
        }
      }
      // the source itself: a soft white bloom where it happened, gone fast
      float src = exp(-length((uv - origin) * vec2(aspect, 1.0)) / 0.05) * smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.2, 0.9, age));
      swellLight += src * (0.5 + 0.4 * big) * m.w;
      flare += big * m.w * smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(0.5, 1.1, age));
      // one glint away from the source, gone in under a second
      if (big > 0.5 && age < 0.9) {
        float p = age / 0.9;
        vec2 h = origin + vec2(0.04 + p * 0.22, mix(-0.05, 0.05, low) * p + 0.03);
        vec2 g = (uv - h) * vec2(aspect, 1.0);
        float along = g.x / 0.09;
        float tail = along < 0.0 ? exp(-abs(along) * 1.3) : exp(-along * 12.0);
        float line = exp(-sq(g.y / 0.0035)) * tail * (1.0 - p * p);
        float head = exp(-length(g) / 0.012) * (1.0 - p);
        glint += mix(vec3(1.0, 0.99, 0.95), rainbow(along * 0.25 + p), 0.45) * line * 1.1 + vec3(1.0, 0.99, 0.95) * head * 0.9;
      }
    }
    }
  }
  {
    vec4 m = uMom[1];
    float age = m.y;
    if (m.w > 0.0 && age >= 0.0 && age <= 2.0) {
    float big = m.z > 0.5 ? 1.0 : 0.0;
    // where it happened: the pressed control (Chandu: "the lensflare could
    // come from the origin of the action"), or, for a page's arrival, the
    // edge the light comes from
    float oy = uMomY[1];
    vec2 origin = vec2(m.x, oy < 0.0 ? mix(0.92, 0.08, low) : oy);
    // the rays that pass through that point
    vec2 od = (origin - sun) * vec2(aspect, 1.0);
    float angO = atan(od.x, abs(od.y));
    float spread = mix(0.17, 0.055, low) * (1.0 + 0.5 * big);
    float window = exp(-sq((ang - angO) / spread));
    // the surge: a quick rise, a slow fade, and a band of brightness running
    // along the shafts away from the sun
    float env = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.3, 1.8, age));
    float travel = mix(1.0 - uv.y, uv.y, low);
    float band = exp(-sq((travel - age * 0.55) / 0.14)) * (1.0 - smoothstep(0.8, 1.6, age));
    float surge = window * (0.9 * env + 1.3 * band) * m.w * (1.0 + 0.6 * big);
    breakLocal += surge;
    surgeAb += window * band * m.w;
    {
      // a lens flare from the action: rainbow-rimmed ghosts strung along the
      // line from where it happened through the middle of the screen, each
      // a different size, blooming in a blink and fading over a second. A
      // small moment gets two faint ghosts, a big one the whole chain.
      float life = smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.35, 1.3, age)) * (0.55 + 0.45 * big);
      for (int g = 0; g < 4; g++) {
        float gf = float(g);
        if (gf < 2.0 || big > 0.5) {
        float k = 0.18 + gf * 0.27;
        vec2 gp = mix(origin, vec2(0.5, 0.5), k);
        float gr = 0.02 + gf * 0.02;
        float gd = length((uv - gp) * vec2(aspect, 1.0));
        float rim = exp(-sq((gd - gr) / (gr * 0.32)));
        float disc = exp(-gd / gr) * 0.3;
        swellLight += (rim * 0.55 + disc * 0.7) * life * m.w;
        float cov = clamp(rim * 0.5 * life * m.w, 0.0, 1.0);
        irisCol = mix(irisCol, 0.76 + 0.24 * rainbow(gd / gr * 0.7 + gf * 0.23 + age * 0.15), cov);
        irisCov += cov * (1.0 - irisCov);
        }
      }
      // the source itself: a soft white bloom where it happened, gone fast
      float src = exp(-length((uv - origin) * vec2(aspect, 1.0)) / 0.05) * smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.2, 0.9, age));
      swellLight += src * (0.5 + 0.4 * big) * m.w;
      flare += big * m.w * smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(0.5, 1.1, age));
      // one glint away from the source, gone in under a second
      if (big > 0.5 && age < 0.9) {
        float p = age / 0.9;
        vec2 h = origin + vec2(0.04 + p * 0.22, mix(-0.05, 0.05, low) * p + 0.03);
        vec2 g = (uv - h) * vec2(aspect, 1.0);
        float along = g.x / 0.09;
        float tail = along < 0.0 ? exp(-abs(along) * 1.3) : exp(-along * 12.0);
        float line = exp(-sq(g.y / 0.0035)) * tail * (1.0 - p * p);
        float head = exp(-length(g) / 0.012) * (1.0 - p);
        glint += mix(vec3(1.0, 0.99, 0.95), rainbow(along * 0.25 + p), 0.45) * line * 1.1 + vec3(1.0, 0.99, 0.95) * head * 0.9;
      }
    }
    }
  }
  {
    vec4 m = uMom[2];
    float age = m.y;
    if (m.w > 0.0 && age >= 0.0 && age <= 2.0) {
    float big = m.z > 0.5 ? 1.0 : 0.0;
    // where it happened: the pressed control (Chandu: "the lensflare could
    // come from the origin of the action"), or, for a page's arrival, the
    // edge the light comes from
    float oy = uMomY[2];
    vec2 origin = vec2(m.x, oy < 0.0 ? mix(0.92, 0.08, low) : oy);
    // the rays that pass through that point
    vec2 od = (origin - sun) * vec2(aspect, 1.0);
    float angO = atan(od.x, abs(od.y));
    float spread = mix(0.17, 0.055, low) * (1.0 + 0.5 * big);
    float window = exp(-sq((ang - angO) / spread));
    // the surge: a quick rise, a slow fade, and a band of brightness running
    // along the shafts away from the sun
    float env = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.3, 1.8, age));
    float travel = mix(1.0 - uv.y, uv.y, low);
    float band = exp(-sq((travel - age * 0.55) / 0.14)) * (1.0 - smoothstep(0.8, 1.6, age));
    float surge = window * (0.9 * env + 1.3 * band) * m.w * (1.0 + 0.6 * big);
    breakLocal += surge;
    surgeAb += window * band * m.w;
    {
      // a lens flare from the action: rainbow-rimmed ghosts strung along the
      // line from where it happened through the middle of the screen, each
      // a different size, blooming in a blink and fading over a second. A
      // small moment gets two faint ghosts, a big one the whole chain.
      float life = smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.35, 1.3, age)) * (0.55 + 0.45 * big);
      for (int g = 0; g < 4; g++) {
        float gf = float(g);
        if (gf < 2.0 || big > 0.5) {
        float k = 0.18 + gf * 0.27;
        vec2 gp = mix(origin, vec2(0.5, 0.5), k);
        float gr = 0.02 + gf * 0.02;
        float gd = length((uv - gp) * vec2(aspect, 1.0));
        float rim = exp(-sq((gd - gr) / (gr * 0.32)));
        float disc = exp(-gd / gr) * 0.3;
        swellLight += (rim * 0.55 + disc * 0.7) * life * m.w;
        float cov = clamp(rim * 0.5 * life * m.w, 0.0, 1.0);
        irisCol = mix(irisCol, 0.76 + 0.24 * rainbow(gd / gr * 0.7 + gf * 0.23 + age * 0.15), cov);
        irisCov += cov * (1.0 - irisCov);
        }
      }
      // the source itself: a soft white bloom where it happened, gone fast
      float src = exp(-length((uv - origin) * vec2(aspect, 1.0)) / 0.05) * smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.2, 0.9, age));
      swellLight += src * (0.5 + 0.4 * big) * m.w;
      flare += big * m.w * smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(0.5, 1.1, age));
      // one glint away from the source, gone in under a second
      if (big > 0.5 && age < 0.9) {
        float p = age / 0.9;
        vec2 h = origin + vec2(0.04 + p * 0.22, mix(-0.05, 0.05, low) * p + 0.03);
        vec2 g = (uv - h) * vec2(aspect, 1.0);
        float along = g.x / 0.09;
        float tail = along < 0.0 ? exp(-abs(along) * 1.3) : exp(-along * 12.0);
        float line = exp(-sq(g.y / 0.0035)) * tail * (1.0 - p * p);
        float head = exp(-length(g) / 0.012) * (1.0 - p);
        glint += mix(vec3(1.0, 0.99, 0.95), rainbow(along * 0.25 + p), 0.45) * line * 1.1 + vec3(1.0, 0.99, 0.95) * head * 0.9;
      }
    }
    }
  }
  {
    vec4 m = uMom[3];
    float age = m.y;
    if (m.w > 0.0 && age >= 0.0 && age <= 2.0) {
    float big = m.z > 0.5 ? 1.0 : 0.0;
    // where it happened: the pressed control (Chandu: "the lensflare could
    // come from the origin of the action"), or, for a page's arrival, the
    // edge the light comes from
    float oy = uMomY[3];
    vec2 origin = vec2(m.x, oy < 0.0 ? mix(0.92, 0.08, low) : oy);
    // the rays that pass through that point
    vec2 od = (origin - sun) * vec2(aspect, 1.0);
    float angO = atan(od.x, abs(od.y));
    float spread = mix(0.17, 0.055, low) * (1.0 + 0.5 * big);
    float window = exp(-sq((ang - angO) / spread));
    // the surge: a quick rise, a slow fade, and a band of brightness running
    // along the shafts away from the sun
    float env = smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.3, 1.8, age));
    float travel = mix(1.0 - uv.y, uv.y, low);
    float band = exp(-sq((travel - age * 0.55) / 0.14)) * (1.0 - smoothstep(0.8, 1.6, age));
    float surge = window * (0.9 * env + 1.3 * band) * m.w * (1.0 + 0.6 * big);
    breakLocal += surge;
    surgeAb += window * band * m.w;
    {
      // a lens flare from the action: rainbow-rimmed ghosts strung along the
      // line from where it happened through the middle of the screen, each
      // a different size, blooming in a blink and fading over a second. A
      // small moment gets two faint ghosts, a big one the whole chain.
      float life = smoothstep(0.0, 0.1, age) * (1.0 - smoothstep(0.35, 1.3, age)) * (0.55 + 0.45 * big);
      for (int g = 0; g < 4; g++) {
        float gf = float(g);
        if (gf < 2.0 || big > 0.5) {
        float k = 0.18 + gf * 0.27;
        vec2 gp = mix(origin, vec2(0.5, 0.5), k);
        float gr = 0.02 + gf * 0.02;
        float gd = length((uv - gp) * vec2(aspect, 1.0));
        float rim = exp(-sq((gd - gr) / (gr * 0.32)));
        float disc = exp(-gd / gr) * 0.3;
        swellLight += (rim * 0.55 + disc * 0.7) * life * m.w;
        float cov = clamp(rim * 0.5 * life * m.w, 0.0, 1.0);
        irisCol = mix(irisCol, 0.76 + 0.24 * rainbow(gd / gr * 0.7 + gf * 0.23 + age * 0.15), cov);
        irisCov += cov * (1.0 - irisCov);
        }
      }
      // the source itself: a soft white bloom where it happened, gone fast
      float src = exp(-length((uv - origin) * vec2(aspect, 1.0)) / 0.05) * smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(0.2, 0.9, age));
      swellLight += src * (0.5 + 0.4 * big) * m.w;
      flare += big * m.w * smoothstep(0.0, 0.15, age) * (1.0 - smoothstep(0.5, 1.1, age));
      // one glint away from the source, gone in under a second
      if (big > 0.5 && age < 0.9) {
        float p = age / 0.9;
        vec2 h = origin + vec2(0.04 + p * 0.22, mix(-0.05, 0.05, low) * p + 0.03);
        vec2 g = (uv - h) * vec2(aspect, 1.0);
        float along = g.x / 0.09;
        float tail = along < 0.0 ? exp(-abs(along) * 1.3) : exp(-along * 12.0);
        float line = exp(-sq(g.y / 0.0035)) * tail * (1.0 - p * p);
        float head = exp(-length(g) / 0.012) * (1.0 - p);
        glint += mix(vec3(1.0, 0.99, 0.95), rainbow(along * 0.25 + p), 0.45) * line * 1.1 + vec3(1.0, 0.99, 0.95) * head * 0.9;
      }
    }
    }
  }

  // ---- the sky: zenith blue behind the header, nothing by the content
  vec3 zenith = vec3(0.60, 0.77, 0.97);
  vec3 pale = vec3(0.84, 0.91, 0.99);
  vec3 sky = mix(pale, zenith, smoothstep(0.72, 1.0, uv.y));
  // the layer's own alpha: full behind the header, gone by the content zone
  float topA = smoothstep(0.52, 0.86, uv.y);

  // ---- rays: shafts of light fanning out from the sun. Light is only ever
  // added here, never darkened or textured (22 Oct 2026, Chandu: "i dont
  // want the rays to be too muddy, it needs to be like light"): each shaft
  // is a clean warm-white beam that glows up and fades on its own timing
  // and falls off smoothly along its length.
  float swing = 0.06 * sin(t * 0.05) + 0.03 * sin(t * 0.13 + 1.0);
  float ra = ang * mix(9.0, 34.0, low) + swing;
  // chromatic aberration (22 Oct 2026, Chandu: "add that sort of chromatic
  // rainbow aberration subtly to the ray's edges"): each colour channel
  // samples the shaft a touch off-angle, so the edges of every ray split
  // into a faint spectrum, as they do through a lens
  float ab = 0.16 + 0.3 * clamp(surgeAb, 0.0, 1.0);
  vec3 r1 = vec3(noise(vec2(ra - ab, t * 0.05)), noise(vec2(ra, t * 0.05)), noise(vec2(ra + ab, t * 0.05)));
  float r2 = noise(vec2(ra * 2.7 + 5.0, t * 0.08 + 3.0));
  vec3 shaftRGB = pow(r1, vec3(2.4)) * (0.6 + 0.4 * r2);
  shaftRGB += 0.08 * clamp(breakLocal, 0.0, 1.0);
  float shaft = shaftRGB.g;
  float pulse = 0.4 + 0.6 * smoothstep(0.3, 0.8, noise(vec2(ra * 0.5 + 11.0, t * 0.11)));
  // a slow breath along the beam, far too soft to read as texture
  float along = 0.85 + 0.15 * noise(vec2(dist * 3.0 - t * 0.05, ra * 0.2));
  // the light falls off smoothly with distance from the sun
  float reach = mix(exp(-max(0.0, dist - 0.08) / 0.42), exp(-uv.y / 0.5), low);
  float rayEnv = pulse * along * reach * (1.0 + 1.2 * breakLocal + 0.9 * flare);
  float rays = shaft * rayEnv;
  vec3 raysRGB = shaftRGB * rayEnv;
  vec3 rayLight = vec3(1.0, 0.985, 0.93);
  vec3 col = sky + rayLight * raysRGB * 0.42 * (1.0 - low);

  // ---- cirrus: lit on the sun side, a grey-blue underside
  float c = cirrus(vec2(uv.x * aspect, uv.y), t);
  vec2 toSun = normalize(vec2(-d.x, -d.y)) * 0.012;
  float cUp = cirrus(vec2(uv.x * aspect, uv.y) + toSun, t);
  float lit = clamp((c - cUp) * 6.0, 0.0, 1.0);      // the edge facing the sun
  float under = clamp((cUp - c) * 6.0, 0.0, 1.0);    // the shaded underside
  vec3 cloud = mix(vec3(0.96, 0.975, 0.995), vec3(1.0), lit);
  cloud = mix(cloud, vec3(0.80, 0.86, 0.94), under * 0.5);
  // the silver lining: a moment's break brightens the lit edges to white
  cloud = mix(cloud, vec3(1.0), clamp(breakLocal * (0.3 + lit), 0.0, 1.0) * 0.8);
  col = mix(col, cloud, c * 0.95);

  // ---- the sun's bloom at the top edge, warm, never a disc
  float bloom = exp(-dist / 0.16) * 1.5 + exp(-dist / 0.45) * 0.3;
  // a low sun: the whole bottom edge glows. No hard line and no even arc
  // (22 Oct 2026, Chandu: "the arc at the bottom is too uniform ... varying
  // levels of glow ... I dont want a hard horizon"): the glow swells and
  // fades in patches along the width, each on its own timing (the noise
  // moves through time, not sideways, so nothing slides), and its reach
  // upward wanders a little, so the edge is never one line.
  float gx = uv.x * aspect;
  float swell = 0.45 + 0.55 * smoothstep(0.15, 0.85, fbm(vec2(gx * 1.6 + 7.0, t * 0.09)));
  float swell2 = 0.7 + 0.3 * noise(vec2(gx * 4.0 + 3.0, t * 0.14 + 5.0));
  float lift = 0.07 * (fbm(vec2(gx * 1.1 + 2.0, t * 0.05)) - 0.5);
  float seamY = max(0.0, uv.y - lift);
  float seamW = 0.78 + 0.22 * exp(-sq((uv.x - 0.5) * aspect / 1.1));
  bloom = mix(bloom, (exp(-seamY / 0.11) * 0.95 + exp(-seamY / 0.3) * 0.5) * seamW * swell * swell2, low);
  bloom *= 1.0 + 0.6 * flare;
  vec3 warm = vec3(1.0, 0.97, 0.84);
  col = mix(col, warm, clamp(bloom, 0.0, 1.0));

  float content = smoothstep(0.1, 0.35, uv.y) * smoothstep(0.85, 0.6, uv.y);
  // ---- motes: warm specks rising inside the rays only (the Tyndall effect)
  float motes = 0.0;
  for (int k = 0; k < 2; k++) {
    float kf = float(k);
    vec2 g = vec2(uv.x * aspect, uv.y) * (16.0 + kf * 7.0);
    g.y -= t * (0.045 + kf * 0.02);
    g.x += 0.15 * sin(t * 0.3 + floor(g.y) * 1.7 + kf);
    vec2 cell = floor(g);
    vec2 f = fract(g);
    float h = hash(cell + kf * 17.0);
    vec2 pos = vec2(hash(cell + 3.1 + kf), hash(cell + 7.7 + kf));
    float spark = 0.6 + 0.4 * sin(t * (1.0 + h * 2.0) + h * 6.28);
    float dot = exp(-length(f - pos) * 11.0);
    motes += step(0.72, h) * dot * spark;
  }
  float moteLight = clamp(rays * 1.3, 0.0, 1.0) * max(topA, low * (1.0 - content)) * (1.0 + breakLocal);
  col = mix(col, vec3(1.0, 0.985, 0.94), clamp(motes * moteLight, 0.0, 1.0));
  col += vec3(1.0, 0.99, 0.96) * swellLight;
  col = mix(col, irisCol, irisCov * 0.85);
  col += glint;

  float alpha = topA;
  // a low sun: its rays rise through the page, held back where content sits
  alpha = max(alpha, low * clamp(rays, 0.0, 1.0) * (1.0 - 0.5 * content));
  alpha = max(alpha, low * clamp(bloom, 0.0, 1.0));
  // a thin paler hem where the layer fades in the clouds, so no band shows
  alpha = max(alpha, c * 0.6 * smoothstep(0.5, 0.64, uv.y));

  // ---- the horizon haze on the bottom edge, where the aurora stands at night
  float haze = mix(exp(-uv.y / 0.07) * 0.75 + exp(-uv.y / 0.2) * 0.25,
                   exp(-seamY / 0.14) * 0.65 + exp(-seamY / 0.36) * 0.35, low);
  haze *= 0.92 + 0.08 * fbm(vec2(uv.x * aspect * 2.0 + t * 0.01, uv.y * 6.0));
  vec3 hazeCol = mix(vec3(0.90, 0.94, 0.99), vec3(0.76, 0.85, 0.97), low);
  col = mix(col, hazeCol, clamp(haze, 0.0, 1.0));
  alpha = max(alpha, clamp(haze * mix(0.7, 0.9, low), 0.0, 1.0));
  // a low sun: the rays and the seam are light added over the haze. The
  // base is bright, near white with a clear yellow hue (22 Oct 2026,
  // Chandu: "is the yellow base a little too muddy? should it be brighter
  // at the base with a yellow hue"): the blue haze is lifted out right at
  // the edge, so the warm light never greys against it
  float base = exp(-seamY / 0.09) * low;
  col = mix(col, vec3(1.0, 0.99, 0.95), base * 0.8);
  col += rayLight * raysRGB * 0.8 * low;
  col = mix(col, warm, clamp(bloom, 0.0, 1.0) * low);
  col += vec3(1.0, 0.92, 0.55) * exp(-seamY / 0.045) * swell * 0.3 * low;

  col = min(col, vec3(1.0));
  float glintA = max(max(glint.r, glint.g), glint.b);
  alpha = clamp(max(alpha, max(max(glintA, irisCov * 0.85), swellLight)), 0.0, 1.0);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

// DEMO-ONLY: which sun the day sky uses, for vetting (22 Oct 2026, Chandu:
// "please have a switch for low and top sun i couldnt vet them"). ?sun=low
// or ?sun=top in the URL sets it too. Top is the default.
const SUN_KEY = "dreamari-sun";
const SUN_EVENT = "dreamari:sun";
type Sun = "top" | "low";
function readSun(): Sun {
  try { return localStorage.getItem(SUN_KEY) === "low" ? "low" : "top"; } catch { return "top"; }
}
function setSun(sun: Sun) {
  try { localStorage.setItem(SUN_KEY, sun); } catch { /* storage blocked */ }
  window.dispatchEvent(new CustomEvent(SUN_EVENT));
}
function subscribeSun(cb: () => void) {
  window.addEventListener(SUN_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(SUN_EVENT, cb); window.removeEventListener("storage", cb); };
}
function subscribeLight(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const isLight = () => document.documentElement.classList.contains("look-v2") && document.documentElement.classList.contains("light");

/** DEMO-ONLY: a small Top / Low switch for the day sky, light mode only. */
export function SunSwitch() {
  const sun = useSyncExternalStore(subscribeSun, readSun, () => "top" as Sun);
  const light = useSyncExternalStore(subscribeLight, isLight, () => false);
  if (!light) return null;
  const btn = (value: Sun, label: string) => (
    <button
      type="button"
      aria-pressed={sun === value}
      onClick={() => setSun(value)}
      className="dm-quiet h-[26px] cursor-pointer rounded-[8px] px-[9px] text-[12px] leading-[16px] font-semibold"
      style={{
        fontFamily: "var(--font-body)",
        background: sun === value ? "var(--primary)" : "transparent",
        color: sun === value ? "var(--primary-foreground)" : "var(--foreground)",
      }}
    >
      {label}
    </button>
  );
  return (
    <div
      role="group"
      aria-label="Day sky sun"
      className="fixed right-[14px] bottom-[14px] z-[60] flex items-center gap-[3px] rounded-[11px] border p-[3px] shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
    >
      <span className="px-[6px] text-[11px] font-semibold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-body)" }}>Sun</span>
      {btn("top", "Top")}
      {btn("low", "Low")}
    </div>
  );
}

const SCALE = 0.4;
const FPS = 24;
const MOMENT_MS = 2000;

type Moment = { x: number; /** px down the screen; absent for a page's arrival */ y?: number; big: boolean; t0: number; strength: number };

export function SkySun({ still = false }: { /** one frame, no motion (the counselor's calm sky); a moment still plays, then it is still again */ still?: boolean } = {}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.style.display = "none";
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl || gl.isContextLost()) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    let dead = false;
    let raf = 0;
    const onLost = (e: Event) => { e.preventDefault(); dead = true; canvas.style.display = "none"; cancelAnimationFrame(raf); };
    canvas.addEventListener("webglcontextlost", onLost);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMom = gl.getUniformLocation(prog, "uMom[0]");
    const uSun = gl.getUniformLocation(prog, "uSun");
    const uMomY = gl.getUniformLocation(prog, "uMomY[0]");
    const momY = new Float32Array(MAX_MOMENTS);
    // DEMO-ONLY preview switch (22 Oct 2026, Chandu: "should the rays come
    // from the bottom?"): ?sun=low puts the sun on the horizon, where the
    // aurora stands at night; ?sun=top (the default) keeps it off the top edge.
    let lowSun = readSun() === "low";
    try {
      const q = new URLSearchParams(location.search).get("sun");
      if (q === "low" || q === "top") { localStorage.setItem(SUN_KEY, q); lowSun = q === "low"; }
    } catch { /* storage blocked */ }
    // the switch (SunSwitch below) changes it live
    const onSun = () => { lowSun = readSun() === "low"; if (!raf && !dead) draw(performance.now(), true); };
    window.addEventListener(SUN_EVENT, onSun);
    const momData = new Float32Array(MAX_MOMENTS * 4);

    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => root.classList.contains("look-v2") && root.classList.contains("light");

    let moments: Moment[] = [];
    let running = false;
    let animating = false; // still: only while a moment plays
    let last = 0;
    const t0 = performance.now() - 40_000;
    const skyTime = (now: number) => ((now - t0) / 1000) % 7200.0;

    const size = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
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
      gl.uniform1f(uTime, frozen ? 40 : skyTime(now));
      gl.uniform4fv(uMom, momData);
      gl.uniform1fv(uMomY, momY);
      // low: far below the horizon, so the rays rise nearly parallel across the
      // full width (22 Oct 2026, Chandu: "the sun rays are too localised at
      // the centre at the bottom ... How can we use the full width")
      gl.uniform2f(uSun, lowSun ? 0.5 : 0.56, lowSun ? -1.7 : 1.1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frozen = () => still || reduce.matches;
    const loop = (now: number) => {
      if (frozen() && !moments.length) {
        // the moment is over: one still frame, then nothing until the next
        animating = false;
        draw(now, true);
        return;
      }
      raf = requestAnimationFrame(loop);
      // a moment plays at full frame rate; the drifting sky needs 24fps
      if (!moments.length && now - last < 1000 / FPS) return;
      last = now;
      draw(now, frozen());
    };
    const play = () => {
      if (frozen() && !animating) { animating = true; raf = requestAnimationFrame(loop); }
    };

    // the same budget as NightSky: a tap always gets its break of sun
    const onMoment = (e: Event) => {
      if (!running || reduce.matches) return;
      const { x, y, big } = (e as CustomEvent<{ x: number; y?: number; big: boolean }>).detail;
      moments.push({ x, y, big, t0: performance.now(), strength: 1 });
      play();
    };
    let lastWake = 0;
    const wake = () => {
      if (!running || reduce.matches) return;
      const now = performance.now();
      if (now - lastWake < 800) return;
      lastWake = now;
      let prev = 0.5;
      try { prev = Number(sessionStorage.getItem("dreamari-sky-wake") ?? 0.5); } catch { /* storage blocked */ }
      let ox = 0.1 + Math.random() * 0.8;
      if (Math.abs(ox - prev) < 0.2) ox = prev < 0.5 ? prev + 0.2 + Math.random() * 0.3 : prev - 0.2 - Math.random() * 0.3;
      try { sessionStorage.setItem("dreamari-sky-wake", String(ox)); } catch { /* storage blocked */ }
      const strength = 0.85 + Math.random() * 0.3;
      moments.push({ x: canvas.clientWidth * ox, big: false, t0: now, strength });
      if (Math.random() < 0.3) moments.push({ x: canvas.clientWidth * ox, big: false, t0: now + 380 + Math.random() * 240, strength: strength * 0.45 });
      play();
    };
    const onArrival = () => wake();

    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      animating = false;
      const visible = on() && !dead;
      canvas.style.display = visible ? "" : "none";
      const want = visible && !document.hidden;
      if (!want) { running = false; return; }
      if (!running) {
        running = true;
        window.setTimeout(wake, 250 + Math.random() * 500);
      }
      if (frozen()) {
        draw(performance.now(), true);
        if (moments.length) play();
        return;
      }
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    sync();

    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    window.addEventListener(SKY_EVENT, onMoment);
    window.addEventListener(SKY_ARRIVAL_EVENT, onArrival);
    const onResize = () => {
      if (!raf && on()) draw(performance.now(), true);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      window.removeEventListener(SKY_EVENT, onMoment);
      window.removeEventListener(SKY_ARRIVAL_EVENT, onArrival);
      window.removeEventListener(SUN_EVENT, onSun);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.style.display = "none";
    };
  }, [still]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-sky-sun
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ display: "none" }}
    />
  );
}
