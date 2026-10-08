// Synthesized game feedback, no audio assets -- the same WebAudio approach the
// build flow's chime uses. Four sounds only: a tick when you pick something, a
// rise when a pair lands, a thud when it does not, and a fanfare at the end.
//
// Muting is a first-class control, not a setting buried somewhere. Students play
// this in a classroom between lessons; a game that cannot be silenced instantly
// is a game they will not open at school.

const MUTE_KEY = "dreamari-play-muted";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (isMuted()) return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctx) ctx = new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Nothing to do: the toggle still works for this session.
  }
  for (const listener of muteListeners) listener();
}

// The toggle reads the preference through useSyncExternalStore, like every other
// bit of stored state here -- reading it into useState from an effect is the
// pattern the repo lints as an error.
const muteListeners = new Set<() => void>();

export function subscribeMuted(listener: () => void): () => void {
  muteListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === MUTE_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    muteListeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function mutedSnapshot(): boolean {
  return isMuted();
}

/** The server has no preference; the button renders un-muted and corrects on
 *  hydration. */
export function serverMutedSnapshot(): boolean {
  return false;
}

type Shape = "sine" | "triangle" | "square";

function tone(at: AudioContext, freq: number, start: number, duration: number, peak: number, shape: Shape = "sine") {
  const osc = at.createOscillator();
  const gain = at.createGain();
  osc.type = shape;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(at.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Picking up a tile. Deliberately tiny -- it fires a lot. */
export function playSelect() {
  const at = audio();
  if (!at) return;
  tone(at, 660, at.currentTime, 0.06, 0.05, "triangle");
}

/** A pair lands: two notes up. */
export function playCorrect() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  tone(at, 587.33, now, 0.12, 0.12);
  tone(at, 880, now + 0.07, 0.18, 0.13);
}

/** A pair does not land. Low and short, never harsh: getting it wrong is part
 *  of learning and should not feel like a punishment. */
export function playWrong() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  tone(at, 196, now, 0.14, 0.1, "triangle");
  tone(at, 155, now + 0.1, 0.2, 0.09, "triangle");
}

/** LAB-only material cues. A miss is a quiet invitation to repair, never
 * a descending failure buzzer. Reuses the shared context and mute control. */
export function playGlossaryCue(theme: "v1" | "v2" | "v3" | "v4", kind: "select" | "correct" | "repair" | "reward") {
  const at = audio();
  if (!at) return;
  const wave: Shape = theme === "v2" ? "square" : theme === "v1" ? "triangle" : "sine";
  const base = theme === "v4" ? 440 : theme === "v3" ? 523.25 : 587.33;
  const notes = kind === "repair" ? [base * .65, base * .75] : kind === "select" ? [base] : kind === "correct" ? [base, base * 1.5] : [base, base * 1.25, base * 1.5, base * 2];
  notes.forEach((freq, i) => tone(at, freq, at.currentTime + i * .075, kind === "reward" ? .35 : .13, kind === "select" ? .025 : kind === "repair" ? .04 : .075, wave));
}

/** The board is clear. */
export function playSweep() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => tone(at, freq, now + index * 0.075, 0.24, 0.12));
}

/** The offer (Bag Secured): a rising arpeggio into a held major chord with
 *  a shimmer on top. The one big sound in the set, for the one big moment
 *  (Joshua, 6 Oct 2026: "big confetti + celebratory sound. This should be
 *  the highest-dopamine moment of Level 1"). */
export function playFanfare() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  [392, 523.25, 659.25, 783.99].forEach((freq, index) => tone(at, freq, now + index * 0.09, 0.3, 0.11, "triangle"));
  [523.25, 659.25, 783.99, 1046.5].forEach((freq) => tone(at, freq, now + 0.42, 1.1, 0.07));
  [1567.98, 2093, 1760, 2637.02].forEach((freq, index) => tone(at, freq, now + 0.58 + index * 0.12, 0.35, 0.035));
}

/** One second of a timed beat's shared clock passing. Deliberately the
 *  smallest, driest sound in the set -- it repeats every second for as long
 *  as a countdown is up, so anything more than a short, quiet click would
 *  wear out its welcome fast. Sharper and a touch louder in the last
 *  stretch (matching the clock face's own urgent color/pulse), the same way
 *  a kitchen timer's tick reads differently once you notice it running out. */
export function playTick(urgent = false) {
  const at = audio();
  if (!at) return;
  tone(at, urgent ? 1400 : 1000, at.currentTime, 0.035, urgent ? 0.05 : 0.025, "square");
}

// ---- the torque wrench (Chandu, 6 Oct 2026: "the tightening of the torque
// wrench needs to sound like a torque wrench, get that exact sound right").
// A click-type wrench is nearly silent on the pull; the sounds are the
// faint strain of the fitting seating, the ratchet's zip when the handle
// swings back for a re-grip, and the break: a hard metallic CLACK, which is
// a few milliseconds of noise with a low knock under it and a short
// high-metal ring after it. All synthesised from noise and tones; no files.

let noiseBuffer: AudioBuffer | null = null;
function noise(at: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === at.sampleRate) return noiseBuffer;
  const length = at.sampleRate; // one second is plenty; bursts are short
  const buffer = at.createBuffer(1, length, at.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}
/** A filtered burst of noise: `type`/`freq`/`q` shape the filter, the gain
 *  envelope snaps up and decays over `duration`. */
function burst(at: AudioContext, start: number, duration: number, peak: number, type: BiquadFilterType, freq: number, q: number, attack = 0.001) {
  const src = at.createBufferSource();
  src.buffer = noise(at);
  const filter = at.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, start);
  filter.Q.setValueAtTime(q, start);
  const gain = at.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(at.destination);
  src.start(start, Math.random() * 0.5);
  src.stop(start + duration + 0.02);
}

/** The break: the head lets go at the set torque. Transient noise through a
 *  bright bandpass (the snap), a low knock that drops in pitch (the body of
 *  the wrench), then a short metallic ring from the head. Loud and dry. */
export function playTorqueClick() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  // the snap
  burst(at, now, 0.03, 0.9, "bandpass", 3600, 1.2);
  burst(at, now, 0.012, 0.6, "highpass", 6000, 0.7);
  // the knock
  const knock = at.createOscillator();
  const knockGain = at.createGain();
  knock.type = "sine";
  knock.frequency.setValueAtTime(240, now);
  knock.frequency.exponentialRampToValueAtTime(95, now + 0.07);
  knockGain.gain.setValueAtTime(0.0001, now);
  knockGain.gain.exponentialRampToValueAtTime(0.5, now + 0.003);
  knockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  knock.connect(knockGain);
  knockGain.connect(at.destination);
  knock.start(now);
  knock.stop(now + 0.1);
  // the ring off the head
  tone(at, 2420, now + 0.006, 0.11, 0.08, "sine");
  tone(at, 5160, now + 0.006, 0.07, 0.05, "sine");
  tone(at, 3890, now + 0.01, 0.05, 0.03, "triangle");
}

/** The pull: the fitting seating, a faint low grind that firms up as the
 *  tension rises (`level` 0..1). Quiet on purpose; the click is the sound. */
export function playTorqueStrain(level: number) {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  burst(at, now, 0.05 + level * 0.04, 0.035 + level * 0.05, "lowpass", 380 + level * 420, 0.9, 0.012);
}

/** The ratchet: the handle swinging back for a new grip runs the pawl over
 *  the teeth, a fast zip of tiny dry clicks. */
export function playRatchetBack() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  for (let i = 0; i < 7; i += 1) {
    burst(at, now + i * 0.028, 0.012, 0.09 - i * 0.006, "bandpass", 2900 + i * 90, 3);
  }
}

/** A page flick: the glossary flipbook card turning over -- a fast little
 *  up-down swish, more paper than beep. */
export function playFlip() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  sweep(at, 340, 980, now, 0.09, 0.05, "triangle");
  sweep(at, 980, 480, now + 0.07, 0.1, 0.035, "triangle");
}

/** A voice blip: the visual-novel idiom (Ace Attorney, Animal Crossing) --
 *  a tiny syllable of tone fired every few characters while a CHARACTER's
 *  line types out, at that character's own pitch, so who is talking is
 *  audible before it is read. Never fires for the Narrator or a System
 *  card: silence is part of what separates the office talking from the
 *  game talking. Kept very small and soft -- it repeats a lot. */
export function playVoiceBlip(pitch: number) {
  const at = audio();
  if (!at) return;
  // A whisper of detune per blip so a long line reads as speech cadence
  // rather than a metronome. Bounded, deterministic-ish drift is fine here.
  const wobble = 1 + (Math.random() - 0.5) * 0.06;
  tone(at, pitch * wobble, at.currentTime, 0.045, 0.022, "triangle");
}

/** A frequency glide rather than a fixed pitch -- the shape a whoosh or a
 *  soft stinger actually needs, which the fixed-pitch `tone` above can't do. */
function sweep(at: AudioContext, from: number, to: number, start: number, duration: number, peak: number, shape: Shape = "sine") {
  const osc = at.createOscillator();
  const gain = at.createGain();
  osc.type = shape;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(at.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** The room changes -- a new location, or a hero illustration taking over.
 *  A soft downward breath, not a doorbell: it fires every time the backdrop
 *  actually swaps, which is often enough that anything more present would
 *  turn into background noise fast. */
export function playSceneChange() {
  const at = audio();
  if (!at) return;
  sweep(at, 520, 220, at.currentTime, 0.32, 0.045);
}

/** A character's cutout steps into the scene -- pairs with its own fade-in-
 *  and-rise animation. A small bright glint, brief enough to survive firing
 *  twice at once when two people enter the same reception together. */
export function playCharacterEnter() {
  const at = audio();
  if (!at) return;
  sweep(at, 700, 980, at.currentTime, 0.16, 0.06, "triangle");
}

/** The moment a scored beat's real controls take the screen -- the backdrop
 *  blurs, the character steps aside, this is what the player is actually
 *  being asked to do. One low, weighted note, deliberately unlike the
 *  brighter correct/wrong/select sounds so it never reads as a verdict --
 *  it marks attention, not an outcome. */
export function playFocusMoment() {
  const at = audio();
  if (!at) return;
  tone(at, 220, at.currentTime, 0.22, 0.07, "sine");
}
