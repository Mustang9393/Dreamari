"use client";

// DEMO-ONLY: the live three.js canvas for the Dreamy Lab 3D page. Loaded
// with next/dynamic (ssr: false) so three.js never ships to any other page.
// Performance guards, because most students are on Chromebooks: device
// pixel ratio capped, rendering pauses when the canvas is off screen or
// the tab is hidden, and a low-power mode drops to DPR 1 at 30 fps.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { DreamyRig } from "./dreamyRig";
import { Brain } from "./brain";

export type LiveHandle = { play: (name: string) => void };

export default function DreamyLiveCanvas({
  lowPower,
  onReady,
  onStats,
  onState,
  onError,
}: {
  lowPower: boolean;
  onReady: (h: LiveHandle) => void;
  onStats: (s: { fps: number; ms: number }) => void;
  onState: (s: string) => void;
  onError: (msg: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const lowRef = useRef(lowPower);
  const resizeRef = useRef<(() => void) | null>(null);
  const cbRef = useRef({ onReady, onStats, onState, onError });
  useEffect(() => {
    lowRef.current = lowPower;
    cbRef.current = { onReady, onStats, onState, onError };
  });

  useEffect(() => {
    const host = hostRef.current!;
    let disposed = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
    camera.position.set(0, 0.15, 10.2);
    camera.lookAt(0, 0.05, 0);
    const key = new THREE.DirectionalLight(0xfff1e0, 2.2); key.position.set(-3, 4, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xcfe3ff, 0.9); fill.position.set(4, 1, 4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xbfdcff, 1.6); rim.position.set(0, 3, -5); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x8aa0c8, 0.6));

    let rig: DreamyRig | null = null;
    const brain = new Brain();
    brain.onReactionEnd = () => cbRef.current.onState("idle");

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const tl = new THREE.TextureLoader();
    const tex = (url: string) => tl.loadAsync(url).then((t) => { t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; return t; });
    Promise.all([loader.loadAsync("/models/dreamy/dreamy.opt.glb"), tex("/models/dreamy/iris_L.png"), tex("/models/dreamy/iris_R.png")])
      .then(([gltf, irisL, irisR]) => {
        if (disposed) return;
        rig = new DreamyRig(gltf as unknown as { scene: THREE.Group }, irisL, irisR);
        scene.add(rig.root);
        if (noPause) (window as unknown as { __dreamy?: unknown }).__dreamy = { scene, rig, brain };
        cbRef.current.onReady({ play: (n) => { brain.play(n, clock.now()); cbRef.current.onState(n); } });
      })
      .catch((e) => cbRef.current.onError(String(e?.message ?? e)));

    // ---- sizing
    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      const cap = lowRef.current ? 1 : 1.75;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    resizeRef.current = resize;
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    // ---- pointer: look-at, drag to rotate, tap to react
    const el = renderer.domElement;
    let down: { x: number; y: number; yaw: number; pitch: number; moved: boolean } | null = null;
    const norm = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) };
    };
    const onMove = (e: PointerEvent) => {
      const p = norm(e);
      brain.setPointer(Math.max(-1, Math.min(1, p.x * 1.3)), Math.max(-1, Math.min(1, p.y * 1.3)), clock.now());
      if (down) {
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) down.moved = true;
        brain.drag.active = true;
        brain.drag.yaw = Math.max(-1.1, Math.min(1.1, down.yaw + dx * 0.008));
        brain.drag.pitch = Math.max(-0.4, Math.min(0.4, down.pitch + dy * 0.005));
      }
    };
    const onDown = (e: PointerEvent) => { el.setPointerCapture(e.pointerId); down = { x: e.clientX, y: e.clientY, yaw: brain.drag.yaw, pitch: brain.drag.pitch, moved: false }; };
    const onUp = () => {
      if (down && !down.moved) { brain.play("happy", clock.now()); cbRef.current.onState("happy"); }
      down = null; brain.drag.active = false;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    // ---- loop with pause when hidden / off screen
    // ?nopause=1 keeps rendering in hidden tabs (for automated checks only)
    const noPause = new URLSearchParams(window.location.search).has("nopause");
    const clock = { elapsedTime: 0, t0: performance.now(), now() { return (performance.now() - this.t0) / 1000; }, getDelta() { const n = (performance.now() - this.t0) / 1000; const d = n - this.elapsedTime; this.elapsedTime = n; return d; } };
    let visible = true, last = 0, raf = 0, frames = 0, statT = 0, workMs = 0;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0.01 });
    io.observe(host);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!noPause && (!visible || document.hidden)) { clock.getDelta(); return; }
      clock.getDelta(); const now = clock.elapsedTime;
      const minDt = lowRef.current ? 1 / 30 : 0;
      if (now - last < minDt) return;
      const dt = now - last; last = now;
      const t0 = performance.now();
      // drag yaw drifts back to centre when released
      if (!brain.drag.active) { brain.drag.yaw *= Math.pow(0.08, dt); brain.drag.pitch *= Math.pow(0.08, dt); }
      if (rig) rig.apply(brain.update(now, dt), now);
      renderer.render(scene, camera);
      workMs += performance.now() - t0; frames++;
      if (now - statT > 0.5) {
        cbRef.current.onStats({ fps: Math.round(frames / (now - statT)), ms: +(workMs / Math.max(1, frames)).toFixed(1) });
        frames = 0; workMs = 0; statT = now;
      }
    };
    raf = requestAnimationFrame(loop);
    // hidden tabs get no rAF; drive a slow timer instead when nopause is set
    const hiddenTick = noPause ? window.setInterval(() => { if (document.hidden) loop(); }, 33) : 0;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf); window.clearInterval(hiddenTick);
      el.remove();
      try {
        ro.disconnect(); io.disconnect();
        el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointerup", onUp); el.removeEventListener("pointercancel", onUp);
        scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          m.geometry?.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x?.dispose());
        });
        pmrem.dispose(); renderer.dispose();
      } catch (err) {
        console.warn("Dreamy 3D cleanup", err);
      }
    };
  }, []);

  useEffect(() => { resizeRef.current?.(); }, [lowPower]);

  return <div ref={hostRef} className="h-full w-full" aria-label="Dreamy, live 3D. Drag to turn him, tap to make him happy." role="img" />;
}
