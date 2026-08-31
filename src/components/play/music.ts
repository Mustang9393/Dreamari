// Background music for the IB simulation. Two tracks, from the handoff's own
// rules: the Main Song plays for the entire run, it switches to the
// Promotion Song the instant a level's ending actually promotes the player,
// and it reverts to the Main Song the instant they redo any steps -- a
// repair round or a full restart both count.
//
// Deliberately its own mute flag, separate from sound.ts's SFX mute: the
// rule is explicitly "mute it [the music] and only hear sound effects", so
// muting music can never also silence the tick/select/correct SFX the way a
// single shared flag would.

const MUSIC_MUTE_KEY = "dreamari-play-music-muted";

export type MusicTrack = "main" | "promotion";

// Per-simulation scores, falling back to the IB pair (the promotion
// stinger is generic celebration, so a career without its own borrows it).
const DEFAULT_TRACKS: Record<MusicTrack, string> = {
  main: "/audio/play/ib-main-song.mp3",
  promotion: "/audio/play/ib-promotion-song.mp3",
};
const SIM_TRACKS: Record<string, Partial<Record<MusicTrack, string>>> = {
  "investment-banking": DEFAULT_TRACKS,
  "registered-nurse": { main: "/audio/play/rn-main-song.m4a" },
};

function trackSrc(track: MusicTrack, simId?: string): string {
  return (simId && SIM_TRACKS[simId]?.[track]) || DEFAULT_TRACKS[track];
}

let el: HTMLAudioElement | null = null;
let current: string | null = null;

// What SHOULD be playing right now, so a play() blocked by the browser's
// autoplay policy can be retried on the next real gesture. Without this,
// a level entered without a prior tap on the page (Express mode's direct
// link, a hard reload, a shared URL) stayed silent for the whole run:
// `current` was already set when play() rejected, so every later
// playMusic call short-circuited on the same-src check.
let wanted: { track: MusicTrack; simId?: string } | null = null;
let retryArmed = false;

function armGestureRetry(): void {
  if (retryArmed || typeof window === "undefined") return;
  retryArmed = true;
  const retry = () => {
    retryArmed = false;
    window.removeEventListener("pointerdown", retry);
    window.removeEventListener("keydown", retry);
    if (wanted) playMusic(wanted.track, wanted.simId);
  };
  window.addEventListener("pointerdown", retry, { once: true });
  window.addEventListener("keydown", retry, { once: true });
}

// A lowpass filter sitting between the <audio> element and the speakers, so
// a PIP or a timed focus question can "muffle" the music the way a closed
// door dulls a room's noise -- ducking volume would just make it quieter,
// this makes it sound genuinely far away, which is the actual ask. Wiring
// an element through Web Audio is one-way (createMediaElementSource can
// only be called once per element, and afterward the element's sound ONLY
// reaches the speakers via this graph), so it's built once, lazily, the
// same moment the element itself is created.
const NORMAL_HZ = 20000;
const MUFFLED_HZ = 500;
let audioCtx: AudioContext | null = null;
let filter: BiquadFilterNode | null = null;
let focused = false;

function element(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!el) {
    el = new Audio();
    el.loop = true;
    el.volume = 0.55;
    el.muted = isMusicMuted();
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) {
        audioCtx = new Ctor();
        const source = audioCtx.createMediaElementSource(el);
        filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = NORMAL_HZ;
        source.connect(filter);
        filter.connect(audioCtx.destination);
      }
    } catch {
      // No Web Audio support -- music still plays normally, just never muffles.
    }
  }
  // Autoplay policies suspend a freshly-created context until a real user
  // gesture; every call site here already runs off one (a tap, an answer,
  // a mount that follows the level's own start tap), so resuming eagerly
  // is safe and means the very first sound isn't silently swallowed.
  if (audioCtx && audioCtx.state === "suspended") void audioCtx.resume();
  return el;
}

/** Switches to a track only if it isn't already the one playing -- calling
 *  this every render (it's driven by plain useEffects, not a one-shot
 *  action) must not restart the song from 0 each time. */
export function playMusic(track: MusicTrack, simId?: string): void {
  const audio = element();
  if (!audio) return;
  wanted = { track, simId };
  audio.muted = isMusicMuted();
  const src = trackSrc(track, simId);
  // Keyed by the resolved FILE, not the track name -- switching careers on
  // the same "main" track must switch songs.
  if (current === src) return;
  current = src;
  audio.src = src;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Blocked autoplay (no user gesture yet). Reset `current` so the retry
    // is not swallowed by the same-src check, and arm a one-shot gesture
    // listener -- the player's very first tap starts the song.
    current = null;
    armGestureRetry();
  });
}

/** PIP and timed focus questions duck the music behind a lowpass filter --
 *  "focused" reads as the room going quiet around you, not the song
 *  stopping. Ramped (not snapped) so the transition itself is audible
 *  rather than a jarring cut, and idempotent against repeated calls with
 *  the same value (a beat re-rendering every second while its clock ticks
 *  must not restart the ramp from scratch each time). */
export function setMusicFocused(next: boolean): void {
  if (focused === next) return;
  focused = next;
  if (!filter) return;
  const ctx = filter.context;
  const now = ctx.currentTime;
  filter.frequency.cancelScheduledValues(now);
  filter.frequency.setValueAtTime(filter.frequency.value, now);
  filter.frequency.linearRampToValueAtTime(next ? MUFFLED_HZ : NORMAL_HZ, now + 0.5);
}

/** Leaving the simulation entirely -- the music must not keep playing over
 *  the rest of the app. */
export function stopMusic(): void {
  // Clear the retry intent FIRST: a blocked track must not spring back to
  // life on the next tap after the player has already left the simulation.
  wanted = null;
  if (!el) return;
  el.pause();
  current = null;
  focused = false;
}

export function isMusicMuted(): boolean {
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
  if (el) el.muted = muted;
  for (const listener of musicMuteListeners) listener();
}

// Same useSyncExternalStore-friendly shape as sound.ts's own mute state.
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
  return isMusicMuted();
}

/** The server has no preference; the button renders un-muted and corrects on
 *  hydration. */
export function serverMusicMutedSnapshot(): boolean {
  return false;
}
