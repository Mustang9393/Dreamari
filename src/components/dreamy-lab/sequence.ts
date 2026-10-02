// DEMO-ONLY: the Dreamy Lab's sprite sequence. The 3D Dreamy
// (blender/dreamy/dreamy.blend) is rendered once as a 300-frame transparent
// sequence at 30 fps; the lab plays slices of it. 2.5D by design: the user
// asked for something "light weight so in the website" to "play with its
// different animations/emotions", and a frame sequence needs no WebGL and
// looks identical on a Chromebook. Re-render with `blender -b dreamy.blend -a`
// and `scripts/dreamy-lab-frames.sh` if the character changes.

export const FRAME_COUNT = 300;
export const FPS = 30;
export const FRAME_SIZE = 384;

export function frameSrc(frame: number): string {
  const n = Math.min(FRAME_COUNT, Math.max(1, Math.round(frame)));
  return `/images/dreamy/lab/f_${String(n).padStart(4, "0")}.webp`;
}

export type Emotion = {
  id: string;
  label: string;
  /** one short line for the lab (8th-grade reading level) */
  hint: string;
  /** inclusive frame range on the master timeline */
  from: number;
  to: number;
  /** idle loops; the rest play once then return to idle */
  loop?: boolean;
};

export const EMOTIONS: Emotion[] = [
  { id: "idle", label: "Idle", hint: "Just floating. Held gaze with one tiny dart.", from: 1, to: 33, loop: true },
  { id: "joy", label: "Joy", hint: "A blink, then eyes close to happy arcs. Big smile. Warm glow.", from: 34, to: 74 },
  { id: "surprised", label: "Surprised", hint: "Eyes lead the mouth. Pupils widen a beat later.", from: 70, to: 106 },
  { id: "curious", label: "Curious", hint: "One eye narrows. Gaze slides to the side and holds.", from: 108, to: 140 },
  { id: "nervous", label: "Nervous", hint: "Lids droop. Quick darts. Thin wavy line.", from: 142, to: 174 },
  { id: "blink", label: "Blink", hint: "A slow thinking blink, then a quick one. Lids close fast, open slow.", from: 176, to: 213 },
  { id: "wave", label: "Wave", hint: "One stub hand puffs out and waves. Eyes follow it.", from: 214, to: 262 },
];
