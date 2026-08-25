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

const TRACK_SRC: Record<MusicTrack, string> = {
  main: "/audio/play/ib-main-song.mp3",
  promotion: "/audio/play/ib-promotion-song.mp3",
};

let el: HTMLAudioElement | null = null;
let current: MusicTrack | null = null;

function element(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!el) {
    el = new Audio();
    el.loop = true;
    el.volume = 0.55;
    el.muted = isMusicMuted();
  }
  return el;
}

/** Switches to a track only if it isn't already the one playing -- calling
 *  this every render (it's driven by plain useEffects, not a one-shot
 *  action) must not restart the song from 0 each time. */
export function playMusic(track: MusicTrack): void {
  const audio = element();
  if (!audio) return;
  audio.muted = isMusicMuted();
  if (current === track) return;
  current = track;
  audio.src = TRACK_SRC[track];
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Blocked autoplay (no user gesture yet) -- the level's own first tap
    // (an answer, the mute toggle, anything) resumes it via the next call.
  });
}

/** Leaving the simulation entirely -- the music must not keep playing over
 *  the rest of the app. */
export function stopMusic(): void {
  if (!el) return;
  el.pause();
  current = null;
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
