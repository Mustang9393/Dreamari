// Per-background-version sound for the Glossary Game -- direct request 21
// Sept 2026: "add sounds that fit the CRT version, the synth version etc.
// Make it all different. Then see if we can add a background track to
// each that fit each ones vibe." Wraps (rather than edits) the app-wide
// `sound.ts` sfx: v1 (the shipped default) keeps that module's own
// sounds byte-for-byte, exactly as every other screen in the app hears
// them; v2/v3/v4 synthesize their own instead. GlossaryGameExperience.tsx
// imports `playCorrect`/`playSelect`/`playSweep`/`playWrong` from HERE
// instead of `./sound` directly -- every existing call site (spread across
// a dozen question-type renderers in that file) keeps calling the exact
// same four function names with no changes; which sound actually plays is
// decided by `setGlossaryPlayTheme(bgVersion)`, called once from the
// top-level component whenever the background-version chip changes.
import { isMuted, mutedSnapshot, serverMutedSnapshot, setMuted, subscribeMuted } from "./sound";
import * as base from "./sound";

export { mutedSnapshot, serverMutedSnapshot, setMuted, subscribeMuted };

export type PlayTheme = "v1" | "v2" | "v3" | "v4";

let currentTheme: PlayTheme = "v1";
// Separate from `currentTheme === theme` below: v1 (the default) is also
// the initial value of currentTheme, so on first mount the top-level
// component's own `setGlossaryPlayTheme("v1")` call would otherwise look
// like a no-op change and skip starting v1's own track entirely -- this
// flag makes sure the very first call always starts music regardless of
// which theme it names.
let started = false;
export function setGlossaryPlayTheme(theme: PlayTheme) {
  if (started && currentTheme === theme) return;
  started = true;
  currentTheme = theme;
  stopThemeMusic();
  if (musicMuted()) return;
  startThemeMusic(theme);
}

// A dedicated on/off control for the background loop ONLY, separate from
// the sound-effects mute above -- direct request, 21 Sept 2026: "and a
// button to toggle music on off." Persisted the same way (localStorage +
// useSyncExternalStore triad) so it survives a refresh mid-lesson.
const MUSIC_MUTE_KEY = "dreamari-glossary-music-muted";

export function musicMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUSIC_MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMusicMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUSIC_MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Nothing to do: the toggle still works for this session.
  }
  if (muted) stopThemeMusic();
  else startThemeMusic(currentTheme);
  for (const listener of musicMuteListeners) listener();
}

const musicMuteListeners = new Set<() => void>();

export function subscribeMusicMuted(listener: () => void): () => void {
  musicMuteListeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === MUSIC_MUTE_KEY) listener();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    musicMuteListeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function musicMutedSnapshot(): boolean {
  return musicMuted();
}

/** The server has no preference; the button renders un-muted and corrects on
 *  hydration. */
export function serverMusicMutedSnapshot(): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// A private AudioContext, separate from sound.ts's own -- two contexts
// firing short percussive blips at the same time is inaudible as two
// separate clocks (each just schedules its own notes against real time),
// and keeping them apart means this module never has to reach into
// sound.ts's internals to share one.
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

type Shape = "sine" | "triangle" | "square" | "sawtooth";

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

function sweepTone(at: AudioContext, from: number, to: number, start: number, duration: number, peak: number, shape: Shape = "sine") {
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

// ---------------------------------------------------------------------------
// Sound effects, one distinct set per experimental version.

export function playSelect() {
  if (currentTheme === "v1") return base.playSelect();
  const at = audio();
  if (!at) return;
  if (currentTheme === "v2") tone(at, 1046.5, at.currentTime, 0.035, 0.05, "square");
  else if (currentTheme === "v3") tone(at, 740, at.currentTime, 0.09, 0.035, "sine");
  else tone(at, 220, at.currentTime, 0.05, 0.05, "sawtooth");
}

export function playCorrect() {
  if (currentTheme === "v1") return base.playCorrect();
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  if (currentTheme === "v2") {
    // A classic 8-bit "coin" blip -- two square-wave notes, hard and fast.
    tone(at, 987.77, now, 0.07, 0.11, "square");
    tone(at, 1318.5, now + 0.06, 0.12, 0.11, "square");
  } else if (currentTheme === "v3") {
    // A soft two-tone chime -- longer decay, layered sine, ambient.
    tone(at, 523.25, now, 0.35, 0.09, "sine");
    tone(at, 783.99, now + 0.05, 0.4, 0.07, "sine");
  } else {
    // A rising sawtooth synth stab -- an outrun "power up."
    sweepTone(at, 220, 440, now, 0.18, 0.12, "sawtooth");
    tone(at, 440, now + 0.14, 0.14, 0.1, "sawtooth");
  }
}

export function playWrong() {
  if (currentTheme === "v1") return base.playWrong();
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  if (currentTheme === "v2") {
    // A flat, low square-wave buzz -- an arcade "miss."
    tone(at, 147, now, 0.16, 0.09, "square");
    tone(at, 110, now + 0.1, 0.18, 0.08, "square");
  } else if (currentTheme === "v3") {
    tone(at, 220, now, 0.3, 0.06, "sine");
    tone(at, 174.61, now + 0.08, 0.3, 0.05, "sine");
  } else {
    sweepTone(at, 220, 110, now, 0.22, 0.11, "sawtooth");
  }
}

export function playSweep() {
  if (currentTheme === "v1") return base.playSweep();
  const at = audio();
  if (!at) return;
  const now = at.currentTime;
  if (currentTheme === "v2") {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) => tone(at, freq, now + i * 0.06, 0.14, 0.1, "square"));
  } else if (currentTheme === "v3") {
    [261.63, 329.63, 392, 523.25].forEach((freq, i) => tone(at, freq, now + i * 0.14, 0.55, 0.06, "sine"));
  } else {
    [130.81, 196, 261.63, 329.63, 392].forEach((freq, i) => tone(at, freq, now + i * 0.08, 0.22, 0.1, "sawtooth"));
  }
}

// ---------------------------------------------------------------------------
// Background loop, one small repeating pattern per version. A lookahead-free
// plain interval is fine here: this is decorative ambience, not something
// that needs sample-accurate sync to anything else on screen.
type Pattern = { notes: number[]; shape: Shape; stepMs: number; gain: number; noteLen: number };
// Rewritten with real melodic phrases (a rise-and-resolve shape, not a
// repeating 4-note stub) per direct feedback, 21 Sept 2026: "Please have a
// more catchy tune for the CRT version, And every version please. Not too
// distracting, just something that sits in the back." Gain lowered again
// on top of that for "sits in the back." v1 (the shipped default -- no
// added track until now) got its own warm, friendly triangle-wave phrase
// right after, per "v1 also could use a good tune" -- distinct waveform
// from every experimental version (triangle, vs. v2 square/v3 sine/v4
// sawtooth) so it still reads as its own thing, not a leftover demo sound.
// Rewritten again, 22 Sept 2026 -- direct feedback: "the music for the
// glossary games are too short of loops being repeated and causes fatigue
// we need full songs that vary... things like mario, pokemon etc have per
// city etc." A single 8-16-note phrase repeating every few seconds is a
// jingle, not a song -- real game themes get away with looping because
// they have real FORM: an intro, a main idea, a contrasting second idea
// (often a key/register change), sometimes a "lift" restatement, before
// they ever return to the top. Every pattern below is now sectioned the
// same way (marked in comments: Intro/A/B/Bridge/Return, or A/A'/B/Coda),
// so the loop point is minutes apart instead of seconds, and the middle of
// the loop genuinely sounds different from the start rather than just
// being the start again.
const PATTERNS: Partial<Record<PlayTheme, Pattern>> = {
  // v1: warm triangle-wave "twinkle" theme, C major. Intro pickup -> Theme A
  // (the original rise-and-resolve) -> A' (the same shape recolored around
  // the subdominant, G) -> Bridge (relative minor, A -- the one moment of
  // real harmonic contrast) -> a quiet octave-down echo of Theme A -> Theme
  // A returns at full pitch for a real "reprise" close, then a long rest.
  v1: {
    notes: [
      0, 392, 523.25,
      523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 0,
      392, 523.25, 659.25, 783.99, 659.25, 523.25, 392, 0,
      440, 523.25, 659.25, 880, 659.25, 523.25, 440, 0,
      261.63, 329.63, 392, 523.25, 392, 329.63, 261.63, 0,
      523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 0, 0, 0,
    ],
    shape: "triangle", stepMs: 260, gain: 0.02, noteLen: 0.4,
  },
  // v2: NES-title-screen square wave. Fanfare pickup -> Theme A (the
  // original rising phrase) -> Theme B (a syncopated second idea over the
  // dominant, G, using rests for the "gap" NES themes love) -> a
  // same-register rhythmic variation on Theme A (faster repeated notes,
  // the "hurry-up" NES trick) -> Theme A returns with an octave-leap finish.
  v2: {
    notes: [
      0, 392, 523.25, 659.25,
      523.25, 659.25, 783.99, 659.25, 587.33, 659.25, 523.25, 0,
      587.33, 0, 783.99, 587.33, 0, 987.77, 783.99, 0,
      523.25, 523.25, 659.25, 783.99, 783.99, 659.25, 523.25, 0,
      523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 0, 0, 0,
    ],
    shape: "square", stepMs: 230, gain: 0.024, noteLen: 0.15,
  },
  // v3: ambient sine pentatonic, slow and spacious. Section A (the original
  // C-pentatonic rise-and-fall) -> Section B, the same shape recentered on
  // A minor pentatonic a third below (a real mood shift, still unhurried)
  // -> Section C, a sparse high "distant stars" coda with wide rests before
  // the loop point.
  v3: {
    notes: [
      261.63, 0, 293.66, 0, 329.63, 0, 392, 0, 440, 0, 392, 0, 329.63, 0, 293.66, 0,
      220, 0, 261.63, 0, 293.66, 0, 329.63, 0, 392, 0, 329.63, 0, 293.66, 0, 261.63, 0,
      523.25, 0, 0, 0, 587.33, 0, 0, 0, 659.25, 0, 0, 0, 523.25, 0, 0, 0,
    ],
    shape: "sine", stepMs: 480, gain: 0.022, noteLen: 1.2,
  },
  // v4: outrun sawtooth arpeggio, a real 4-chord progression (Am-F-G-Am)
  // played low as the "verse," then the exact same progression again an
  // octave up as the "chorus lift" -- the genre's own catchiest trick,
  // rather than one 2-chord vamp repeating forever.
  v4: {
    notes: [
      110, 130.81, 164.81, 220, 164.81, 130.81, 110, 0,
      174.61, 220, 261.63, 349.23, 261.63, 220, 174.61, 0,
      196, 246.94, 293.66, 392, 293.66, 246.94, 196, 0,
      110, 130.81, 164.81, 220, 261.63, 220, 164.81, 130.81,
      220, 261.63, 329.63, 440, 329.63, 261.63, 220, 0,
      349.23, 440, 523.25, 698.46, 523.25, 440, 349.23, 0,
      392, 493.88, 587.33, 783.99, 587.33, 493.88, 392, 0,
      220, 261.63, 329.63, 440, 523.25, 440, 329.63, 261.63,
    ],
    shape: "sawtooth", stepMs: 210, gain: 0.02, noteLen: 0.17,
  },
};

let loopTimer: ReturnType<typeof setInterval> | null = null;
let loopStep = 0;
let hissNode: AudioBufferSourceNode | null = null;
let hissGain: GainNode | null = null;

function startHiss(at: AudioContext) {
  // A quiet tape-hiss bed, CRT only -- a short noise buffer looped, the
  // cheap way to get continuous static texture without scheduling a note
  // every few milliseconds.
  const seconds = 2;
  const buffer = at.createBuffer(1, at.sampleRate * seconds, at.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
  hissNode = at.createBufferSource();
  hissNode.buffer = buffer;
  hissNode.loop = true;
  hissGain = at.createGain();
  hissGain.gain.value = 0.012;
  hissNode.connect(hissGain);
  hissGain.connect(at.destination);
  hissNode.start();
}

export function startThemeMusic(theme: PlayTheme) {
  stopThemeMusic();
  if (musicMuted()) return;
  const pattern = PATTERNS[theme];
  if (!pattern) return;
  loopStep = 0;
  loopTimer = setInterval(() => {
    const at = audio();
    if (at) {
      if (theme === "v2" && !hissNode) startHiss(at);
      const freq = pattern.notes[loopStep % pattern.notes.length];
      if (freq > 0) tone(at, freq, at.currentTime, pattern.noteLen, pattern.gain, pattern.shape);
    }
    loopStep++;
  }, pattern.stepMs);
}

export function stopThemeMusic() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  if (hissNode) {
    try {
      hissNode.stop();
    } catch {
      // Already stopped -- nothing to do.
    }
    hissNode = null;
    hissGain = null;
  }
}
