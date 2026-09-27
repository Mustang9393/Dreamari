"use client";

// DEMO-ONLY: Interactions section, "Sound". Every real WebAudio trigger in
// the app, grouped by where it fires, each behind an explicit click --
// nothing here auto-plays, matching the app's own rule (isMuted/musicMuted
// gate every real call site the same way). Two independent mute stores
// exist (Sound: dreamari-play-muted, Music: dreamari-glossary-music-muted)
// and are demoed live, reading the real store through useSyncExternalStore
// like every other persisted preference in the app.

import { useSyncExternalStore, type CSSProperties } from "react";
import { SubHead, Specimen, StateGrid, StateCell, MONO } from "../../kit";
import { SoundButton } from "./shared";
import {
  playSelect,
  playCorrect,
  playWrong,
  playSweep,
  playTick,
  playFlip,
  playVoiceBlip,
  playSceneChange,
  playCharacterEnter,
  playFocusMoment,
  isMuted,
  setMuted,
  subscribeMuted,
  mutedSnapshot,
  serverMutedSnapshot,
} from "@/components/play/sound";
import { playMilestoneChime, playXpRise, playGpaTick } from "@/components/build/sound";
import { playFeedback } from "@/components/flow/aurora/feedback";
import { playMessageTone } from "@/components/connect/mentorship/sound";
import { isVideoSoundMuted, setVideoSoundMuted, useVideoSoundMuted } from "@/components/app/videoSound";

const MUTED_STYLE: CSSProperties = { color: "var(--muted-foreground)" };

function SoundMuteToggle() {
  const muted = useSyncExternalStore(subscribeMuted, mutedSnapshot, serverMutedSnapshot);
  return (
    <button
      type="button"
      onClick={() => setMuted(!isMuted())}
      className="dm-quiet cursor-pointer rounded-full border px-[14px] py-[7px] text-[12.5px] font-bold"
      style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
    >
      Sound: {muted ? "Off" : "On"} (dreamari-play-muted)
    </button>
  );
}

function VideoSoundToggle() {
  const muted = useVideoSoundMuted();
  return (
    <button
      type="button"
      onClick={() => setVideoSoundMuted(!isVideoSoundMuted())}
      className="dm-quiet cursor-pointer rounded-full border px-[14px] py-[7px] text-[12.5px] font-bold"
      style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}
    >
      Video sound: {muted ? "Off" : "On"} (dreamari-video-sound-muted)
    </button>
  );
}

export function SoundGroup() {
  return (
    <>
      <SubHead>Sound</SubHead>
      <p className="max-w-[68ch] text-[13px] leading-[19px]" style={MUTED_STYLE}>
        Synthesized WebAudio, no audio files. Every button below fires the real function on click only -- reflecting
        the app&apos;s own rule that a sound only ever plays in direct response to something the student just did.
      </p>

      <Specimen name="Play and Glossary sound effects" file="src/components/play/sound.ts, src/components/play/glossaryThemeSound.ts" purpose="Four core sounds (select, correct, wrong, sweep) plus scene/voice cues, shared by every simulation and Glossary game." when="A tile pick, a pair landing or missing, clearing the board, a scene change, a character entering, a typewriter line, or a scored beat's focus moment.">
        <StateGrid min={200}>
          <StateCell label="Select"><SoundButton label="playSelect — picking a tile" onPlay={playSelect} /></StateCell>
          <StateCell label="Correct"><SoundButton label="playCorrect — a pair lands" onPlay={playCorrect} /></StateCell>
          <StateCell label="Wrong"><SoundButton label="playWrong — a pair misses" onPlay={playWrong} /></StateCell>
          <StateCell label="Sweep"><SoundButton label="playSweep — board cleared" onPlay={playSweep} /></StateCell>
          <StateCell label="Tick"><SoundButton label="playTick — countdown, per second" onPlay={() => playTick(false)} /></StateCell>
          <StateCell label="Tick (urgent)"><SoundButton label="playTick(true) — final seconds" onPlay={() => playTick(true)} /></StateCell>
          <StateCell label="Flip"><SoundButton label="playFlip — Glossary card turns" onPlay={playFlip} /></StateCell>
          <StateCell label="Voice blip"><SoundButton label="playVoiceBlip — dialogue typing" onPlay={() => playVoiceBlip(500)} /></StateCell>
          <StateCell label="Scene change"><SoundButton label="playSceneChange — location swaps" onPlay={playSceneChange} /></StateCell>
          <StateCell label="Character enters"><SoundButton label="playCharacterEnter" onPlay={playCharacterEnter} /></StateCell>
          <StateCell label="Focus moment"><SoundButton label="playFocusMoment — a scored beat opens" onPlay={playFocusMoment} /></StateCell>
          <StateCell label="Sound toggle (live)" note="Reads/writes the real dreamari-play-muted store -- gates every button above.">
            <SoundMuteToggle />
          </StateCell>
        </StateGrid>
        <p className="max-w-[68ch] text-[12.5px] leading-[18px]" style={MUTED_STYLE}>
          Each background version (v1–v4) re-skins these same four names in{" "}
          <code style={MONO}>glossaryThemeSound.ts</code>, plus its own full background theme, gated by a{" "}
          <em>separate</em> Music toggle (<code style={MONO}>dreamari-glossary-music-muted</code>) so muting sound
          effects never silences the music and vice versa -- a real bug fixed 25 Sept 2026 (see the file&apos;s own
          comment).
        </p>
      </Specimen>

      <Specimen name="Dream Score milestones and tap feedback" file="src/components/build/sound.ts, src/components/flow/aurora/feedback.ts" purpose="The rising chime when a landmark is reached, the plain count-up tone for an ordinary XP gain, and the tap/CTA bell + haptic used across Build and Match." when="Build's 50% mark and completion, Match filling its picks, a mentorship module or Connect chain finishing, and any tap inside the aurora-driven flows.">
        <StateGrid min={200}>
          <StateCell label="Milestone chime"><SoundButton label="playMilestoneChime — a landmark reached" onPlay={playMilestoneChime} /></StateCell>
          <StateCell label="XP count-up"><SoundButton label="playXpRise(900) — a plain gain" onPlay={() => playXpRise(900)} /></StateCell>
          <StateCell label="Tap / select"><SoundButton label="playFeedback(“select”) + 8ms vibration" onPlay={() => playFeedback("select")} /></StateCell>
          <StateCell label="CTA / continue"><SoundButton label="playFeedback(“cta”) + 18ms vibration" onPlay={() => playFeedback("cta")} /></StateCell>
          <StateCell label="GPA tick (orphaned)" note="Defined in build/sound.ts, but no real control in the app calls it today -- a genuine gap between the comment describing a GPA-slider click sound and what's actually wired. Included here for completeness, not as a live interaction.">
            <SoundButton label="playGpaTick(3, 10) — not currently called anywhere" onPlay={() => playGpaTick(3, 10)} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Messages and video preview sound" file="src/components/connect/mentorship/sound.ts, src/components/app/videoSound.ts" purpose="A soft two-note chime for an incoming mentorship message, and the shared mute preference for Explore's inline company-video previews." when="A new message in a mentorship program's Messages dock (never for your own sends); hovering a company video card in Explore's Browse All.">
        <StateGrid min={200}>
          <StateCell label="New message"><SoundButton label="playMessageTone — an incoming message" onPlay={playMessageTone} /></StateCell>
          <StateCell label="Video sound (live)" note="Reads/writes dreamari-video-sound-muted -- one shared preference for every inline video preview, defaults on.">
            <VideoSoundToggle />
          </StateCell>
        </StateGrid>
      </Specimen>
    </>
  );
}
