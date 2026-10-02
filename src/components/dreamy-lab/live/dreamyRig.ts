// DEMO-ONLY: the live Dreamy rig for the Dreamy Lab's 3D page.
//
// The model is exported from Blender (dreamy-performance-anim.blend) by
// blender/dreamy/export_web.py into public/models/dreamy/dreamy.opt.glb.
// Blender carves the eyes and mouth with live boolean cutters, which glTF
// cannot carry, so the body ships WITHOUT holes and this file cuts them in
// the body's fragment shader instead (an ellipse per eye, a D for the
// mouth), using the same per-expression sizes the Blender cutters have.
// Every control mirrors a Blender CTRL_EMOTION slider, and the morph
// weights use the Blender driver expressions, so a pose looks the same in
// both. Coordinates: Blender (x, y, z) arrive in three as (x, z, -y).

import * as THREE from "three";

export type Controls = {
  joy: number;
  surprise: number;
  curious: number;
  concern: number;
  smile: number;
  mouthOpen: number;
  glow: number;
  squash: number;
  stub: number;
  wave: number;
  blinkL: number;
  blinkR: number;
  lookX: number;
  lookY: number;
  hop: number;
  lean: number;
  yaw: number;
  pitch: number;
  question: number;
  drop: number;
  alert: number;
  bulb: number;
  heart: number;
  confetti: number;
  glasses: number;
};

export const NEUTRAL: Controls = {
  joy: 0, surprise: 0, curious: 0, concern: 0, smile: 0.35, mouthOpen: 0.8, glow: 0, squash: 0, stub: 0, wave: 0,
  blinkL: 0, blinkR: 0, lookX: 0, lookY: 0, hop: 0, lean: 0, yaw: 0, pitch: 0,
  question: 0, drop: 0, alert: 0, bulb: 0, heart: 0, confetti: 0, glasses: 0,
};

// Blender cutter sizes per shape key (measured from the .blend): centre x/z,
// width, height. Eyes are ellipses, the mouth is a flat-topped D.
const EYE = { base: { cz: -0.07, h: 0.772 }, blink: { cz: -0.077, h: 0.037 }, joy: { cz: -0.023, h: 0.556 }, concern: { cz: -0.07, h: 0.685 }, wonder: { cz: -0.07, h: 0.799 }, w: 0.69, cx: 0.63 };
const MOUTH = {
  base: { cz: -0.636, w: 0.479, h: 0.247 },
  smile: { cz: -0.66, w: 0.62, h: 0.32 },
  oh: { cz: -0.615, w: 0.32, h: 0.41 },
  closed: { cz: -0.592, w: 0.479, h: 0.064 },
  concern: { cz: -0.621, w: 0.414, h: 0.089 },
};

type Morph = { mesh: THREE.Mesh; idx: Record<string, number> };

export class DreamyRig {
  root = new THREE.Group(); // float + squash + lean
  turn = new THREE.Group(); // yaw/pitch (drag and look-at)
  private body!: THREE.Mesh;
  private bodyMat!: THREE.MeshPhysicalMaterial;
  private uniforms = {
    uEyeL: { value: new THREE.Vector4() },
    uEyeR: { value: new THREE.Vector4() },
    uMouth: { value: new THREE.Vector4() },
    // the compressor quantizes positions and moves the real scale into the node,
    // so the cut-outs run in the model's own space via the body node's matrix
    uNode: { value: new THREE.Matrix4() },
  };
  private eyeMorphs: Morph[] = [];
  private lidMorphs: Morph[] = [];
  private mouthMorphs: Morph[] = [];
  private lookParts: { obj: THREE.Object3D; rest: THREE.Vector3 }[] = [];
  private props: Record<string, { obj: THREE.Object3D; rest: THREE.Vector3 }[]> = {};

  constructor(gltf: { scene: THREE.Group }, irisL: THREE.Texture, irisR: THREE.Texture) {
    this.turn.add(gltf.scene);
    this.root.add(this.turn);
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const name = o.name;
      const morph = (): Morph => ({ mesh: m, idx: (m.morphTargetDictionary ?? {}) as Record<string, number> });
      if (name === "dreamy_body") {
        this.body = m;
        this.bodyMat = this.makeBodyMaterial();
        m.material = this.bodyMat;
        m.updateMatrix();
        this.uniforms.uNode.value.copy(m.matrix);
      } else if (name.includes("lid_rim")) {
        this.lidMorphs.push(morph());
      } else if (name.startsWith("Eye_")) {
        this.eyeMorphs.push(morph());
        if (/galaxy_iris|signature_star|softbox/.test(name)) this.lookParts.push({ obj: o, rest: o.position.clone() });
        if (name.includes("galaxy_iris")) {
          const tex = name.startsWith("Eye_L") ? irisL : irisR;
          const mat = (m.material as THREE.MeshStandardMaterial).clone();
          mat.map = tex;
          mat.emissiveMap = tex;
          mat.emissive = new THREE.Color(1, 1, 1);
          mat.emissiveIntensity = 1.6;
          mat.color = new THREE.Color(1, 1, 1);
          m.material = mat;
        }
      } else if (name.startsWith("Mouth_")) {
        this.mouthMorphs.push(morph());
      } else if (name.startsWith("PROP_")) {
        const key = name.includes("question") ? "question" : name.includes("sweat") ? "drop" : name.includes("exclaim") ? "alert"
          : name.includes("bulb") ? "bulb" : name.includes("heart") ? "heart" : name.includes("confetti") ? "confetti" : name.includes("glasses") ? "glasses" : null;
        if (key) {
          (this.props[key] ??= []).push({ obj: o, rest: o.scale.clone() });
          o.scale.setScalar(0);
        }
      }
    });
  }

  private makeBodyMaterial() {
    // Blender "REF • opalescent cloud": pale cyan-white, soft roughness,
    // a little sheen, warm emotional glow. The cut-outs are added below.
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setRGB(0.66, 0.89, 0.92),
      roughness: 0.42,
      clearcoat: 0.12,
      clearcoatRoughness: 0.5,
      sheen: 0.5,
      sheenColor: new THREE.Color().setRGB(0.75, 0.88, 1.0),
      sheenRoughness: 0.6,
      emissive: new THREE.Color("#ffc58f"),
      emissiveIntensity: 0.0,
    });
    const u = this.uniforms;
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, u);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;\nuniform mat4 uNode;")
        .replace("#include <skinning_vertex>", "#include <skinning_vertex>\nvLocal = (uNode * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
varying vec3 vLocal;
uniform vec4 uEyeL; uniform vec4 uEyeR; uniform vec4 uMouth;
bool inEllipse(vec2 p, vec4 e){ vec2 d=(p-e.xy)/(0.5*e.zw); return dot(d,d)<1.0; }
bool inD(vec2 p, vec4 e){ float top=e.y+0.5*e.w; if(p.y>top) return false; vec2 d=vec2((p.x-e.x)/(0.5*e.z),(p.y-top)/e.w); return dot(d,d)<1.0; }`,
        )
        .replace(
          "#include <clipping_planes_fragment>",
          `#include <clipping_planes_fragment>
if (vLocal.z > 0.36 && (inEllipse(vLocal.xy,uEyeL) || inEllipse(vLocal.xy,uEyeR) || inD(vLocal.xy,uMouth))) discard;`,
        );
    };
    return mat;
  }

  apply(c: Controls, t: number) {
    // ---- body transform: float, hop, squash, lean, turn
    const s = c.squash;
    this.root.scale.set(1 + 0.07 * s, 1 - 0.08 * s, 1 + 0.035 * s);
    this.root.position.y = c.hop + 0.05 * Math.sin(t * 1.25);
    this.root.rotation.z = c.lean + 0.018 * Math.sin(t * 0.85 + 1.0);
    this.root.rotation.x = 0.012 * Math.sin(t * 1.1 + 2.0);
    this.turn.rotation.y = c.yaw;
    this.turn.rotation.x = c.pitch;

    // ---- body morphs: the wave stub grows out of the side puff
    const bi = (this.body.morphTargetDictionary ?? {}) as Record<string, number>;
    const inf = this.body.morphTargetInfluences!;
    const stub = Math.min(1.5, Math.max(0, c.stub));
    // web export travels less than the Blender lattice; 1.9x matches the Blender silhouette
    inf[bi.stub] = stub * 1.9;
    inf[bi.wave_up] = Math.max(0, c.wave) * Math.min(1, stub) * 1.5;
    inf[bi.wave_down] = Math.max(0, -c.wave) * Math.min(1, stub) * 1.5;

    // ---- eye apertures (Blender: Blink=blink, Joy=joy*(1-blink), ...)
    const eye = (blink: number) => {
      const j = c.joy * (1 - blink), co = c.concern * (1 - blink), w = c.surprise * (1 - blink);
      const h = EYE.base.h + blink * (EYE.blink.h - EYE.base.h) + j * (EYE.joy.h - EYE.base.h) + co * (EYE.concern.h - EYE.base.h) + w * (EYE.wonder.h - EYE.base.h);
      const cz = EYE.base.cz + blink * (EYE.blink.cz - EYE.base.cz) + j * (EYE.joy.cz - EYE.base.cz);
      return { h: Math.max(0.0, h), cz, weights: { Blink: blink, Joy: j, Concern: co, Wonder: w } };
    };
    const L = eye(c.blinkL), R = eye(c.blinkR);
    this.uniforms.uEyeL.value.set(-EYE.cx, L.cz, EYE.w, L.h);
    this.uniforms.uEyeR.value.set(EYE.cx, R.cz, EYE.w, R.h);
    for (const m of this.lidMorphs) {
      const ws = m.mesh.name.startsWith("Eye_L") ? L.weights : R.weights;
      const mi = m.mesh.morphTargetInfluences!;
      for (const [k, v] of Object.entries(ws)) if (m.idx[k] !== undefined) mi[m.idx[k]] = v;
    }

    // ---- mouth (Blender driver expressions)
    const smile = Math.max(c.joy, c.smile) * (1 - c.surprise) * (1 - c.concern);
    const oh = c.surprise;
    const closed = (1 - c.mouthOpen) * (1 - c.concern) * (1 - c.surprise);
    const concern = c.concern;
    const lerp = (k: "cz" | "w" | "h") =>
      MOUTH.base[k] + smile * (MOUTH.smile[k] - MOUTH.base[k]) + oh * (MOUTH.oh[k] - MOUTH.base[k]) + closed * (MOUTH.closed[k] - MOUTH.base[k]) + concern * (MOUTH.concern[k] - MOUTH.base[k]);
    this.uniforms.uMouth.value.set(0, lerp("cz"), Math.max(0, lerp("w")), Math.max(0, lerp("h")));
    for (const m of this.mouthMorphs) {
      const mi = m.mesh.morphTargetInfluences!;
      const set = (k: string, v: number) => { if (m.idx[k] !== undefined) mi[m.idx[k]] = v; };
      set("Smile", smile); set("Oh", oh); set("Closed", closed); set("Concern", concern);
    }

    // ---- gaze: iris, star and highlight slide inside the socket
    for (const p of this.lookParts) p.obj.position.set(p.rest.x + c.lookX * 0.035, p.rest.y + c.lookY * 0.035, p.rest.z);

    // ---- warm inner glow (Blender "Emotion glow" expression)
    this.bodyMat.emissiveIntensity = 0.015 + 0.19 * c.joy + 0.07 * c.surprise + 0.035 * c.curious + 0.22 * c.glow;

    // ---- props pop in/out by scale
    for (const [k, list] of Object.entries(this.props)) {
      const v = Math.max(0, (c as Record<string, number>)[k] ?? 0);
      for (const p of list) {
        p.obj.scale.copy(p.rest).multiplyScalar(v);
        p.obj.visible = v > 0.001;
      }
    }
  }
}
