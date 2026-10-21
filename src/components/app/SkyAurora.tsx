"use client";

// DEMO-ONLY, the Black & Blue look (src/app/look-v2.css), dark only: an aurora
// low in the sky, rendered as light rather than drawn in CSS (21 Oct 2026,
// Chandu: "how about we give the lighter glow a more aurora-esque
// material/shape?", then, of a first pass in CSS stripes and ellipses: "please
// make it match an actual spectral material light thingy when rendered not
// some flat lines and weird squishy shapes").
//
// Animated (Chandu: "can it be a bit animated instead of static?"): the
// beams flicker and change height, the curtain sways and drifts sideways,
// slowly enough to stay a background.
//
// A small fragment shader: two curtains of light, each with a noise-driven
// lower edge that folds and drifts, fine vertical rays, a hot near-white
// lower edge and a falloff upward in the reference slide's pale blues, with
// a trace of aurora green-teal; never purple. Subtle ("IT CAN BE A LITTLE
// MORE SUBTLE TOO"), composited with `screen` so it adds light to the sky and
// the stars still show through it.
//
// Cost (the Glossary Lab lesson: the lag there was GPU work): rendered at
// about 40% of screen resolution (the light is soft, so the browser's
// upscale is invisible), at most 24 frames a second, paused when the tab is
// hidden, a single still frame for reduced motion and for the counselor's
// calm sky. No blur filters. Without WebGL it simply isn't there; the CSS
// gradient underneath is the whole sky.
//
// Beams standing on the bottom edge (Chandu: "make it realistic refer aurora
// beams. Make it sit on the bottom edge too."). AA: the brightest part, the
// foot, is the bottom few percent of the screen; above that the light is
// capped lower, where text can sit on the sky.
import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
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

// one curtain: k picks its own noise, lift raises it, rayScale sets ray density
vec3 curtain(vec2 uv, float aspect, float t, float k, float lift, float rayScale) {
  float x = uv.x * aspect;
  // the lower edge folds and drifts slowly
  // its foot rests on the bottom edge of the screen and ripples a little
  float base = 0.012 + lift
    + 0.05 * (fbm(vec2(x * 0.55 + t * 0.04 + k * 3.1, k * 1.7 + t * 0.02)) - 0.5)
    + 0.012 * sin(x * 1.4 + t * 0.25 + k * 2.0);
  float d = uv.y - base;
  // folds: the rays bend with the curtain, so sample them in warped x
  // (only a slight bend: beams stand nearly upright)
  // the whole curtain drifts sideways and sways
  float wx = x + t * 0.018 + 0.12 * fbm(vec2(x * 0.9 + k, uv.y * 0.8 + t * 0.06));
  // beams: distinct shafts of light with dark gaps, a finer texture inside
  float r1 = noise(vec2(wx * rayScale, t * 0.22 + k * 5.0));
  float r2 = noise(vec2(wx * rayScale * 3.1, t * 0.5 + k * 11.0));
  float rays = 0.18 + 0.82 * pow(r1, 2.0) * (0.6 + 0.4 * r2);
  // each beam reaches its own height, some tall, most short
  float reach = 0.16 + 0.42 * pow(noise(vec2(wx * rayScale * 0.45, k * 3.0 + t * 0.12)), 1.8);
  float body = d > 0.0 ? exp(-d / reach) : exp(d * 22.0);
  // brightness along the curtain, with gaps, so it never reads as one band
  float along = 0.25 + 0.75 * smoothstep(0.2, 0.62, fbm(vec2(x * 0.7 - t * 0.03 + k * 7.0, 2.0 + k + t * 0.04)));
  // the glowing foot the beams rise from
  float i = (body * rays + 0.35 * exp(-abs(d) / 0.06)) * along;
  // falloff upward: pale at the foot, deeper blue up high
  float h = clamp(d / 0.55, 0.0, 1.0);
  // the reference slide's own sky blues, pale at the foot, deeper up high
  // (Chandu: "I think we've strayed way from this color too much")
  vec3 c = mix(vec3(0.80, 0.88, 0.98), vec3(0.60, 0.74, 0.94), smoothstep(0.0, 0.15, h));
  c = mix(c, vec3(0.42, 0.58, 0.86), smoothstep(0.12, 0.6, h));
  // a trace of aurora green-teal, low and in patches ("a tiny bit of
  // aurora colors (NO purple) Very subtly too")
  float tint = smoothstep(0.45, 0.8, noise(vec2(x * 0.8 - t * 0.02 + k * 4.0, 3.0)));
  c = mix(c, vec3(0.45, 0.85, 0.75), 0.12 * tint * (1.0 - smoothstep(0.05, 0.45, h)));
  // the hot lower edge
  c += vec3(0.16, 0.18, 0.2) * exp(-abs(d) * 55.0);
  return c * i;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  float t = uTime;
  vec3 col = curtain(uv, aspect, t, 0.0, 0.0, 13.0);
  col += 0.55 * curtain(uv, aspect, t * 0.8, 1.0, 0.04, 23.0);
  // fade toward the sides and the top of the layer
  float edge = smoothstep(0.0, 0.22, uv.x) * smoothstep(1.0, 0.78, uv.x);
  col *= mix(0.45, 1.0, edge) * smoothstep(1.0, 0.55, uv.y);
  // soft highlight roll-off, then the cap that keeps text on the sky AA:
  // full strength only at the foot, lower where text can sit
  col = 1.0 - exp(-col * 0.85);
  // (scaled, not clipped per channel, so the colour keeps its hue)
  float cap = mix(0.12, 0.05, smoothstep(0.06, 0.35, uv.y));
  col *= min(1.0, cap / max(max(col.r, col.g), max(col.b, 1e-4)));
  gl_FragColor = vec4(col, 1.0);
}
`;

const SCALE = 0.4;
const FPS = 24;

export function SkyAurora({ still = false }: { /** one frame, no motion (the counselor's calm sky) */ still?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;

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
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => root.classList.contains("look-v2") && !root.classList.contains("light");

    const size = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    const draw = (t: number) => {
      size();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    // a fixed start offset so the first frame is already a good shape
    const t0 = performance.now() - 40_000;
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      draw((now - t0) / 1000);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      const visible = on();
      canvas.style.display = visible ? "" : "none";
      if (!visible) return;
      if (still || reduce.matches || document.hidden) {
        draw(40);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    sync();

    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", sync);
    const onResize = () => {
      if (!raf && on()) draw(40);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", sync);
      window.removeEventListener("resize", onResize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [still]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      data-sky-aurora
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] w-full"
      style={{ mixBlendMode: "screen", display: "none" }}
    />
  );
}
