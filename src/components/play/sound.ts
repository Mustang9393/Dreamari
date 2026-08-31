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

/** The board is clear. */
export function playSweep() {
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => tone(at, freq, now + index * 0.075, 0.24, 0.12));
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
