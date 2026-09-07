"use client";

import { useSyncExternalStore } from "react";
import { createAvatar } from "@dicebear/core";
import * as notionists from "@dicebear/notionists";
import * as avataaars from "@dicebear/avataaars";
import * as personas from "@dicebear/personas";
import * as openPeeps from "@dicebear/open-peeps";

// Every student's avatar, app-wide (direct feedback, 8 Sept 2026: "the
// avatar stuff should trickle down into everything... wherever a student's
// avatar is used"). @dicebear/core generates the SVG locally from a seed
// string (a handle, a first name): same seed always draws the same avatar,
// nothing ever calls out to a third-party image host, and no student photo
// is ever stored. All four styles below are cleared for commercial use with
// no attribution owed (design CC0 1.0 for Notionists/Open Peeps, "free for
// personal and commercial use" for Avataaars; code MIT throughout) --
// Personas is the one style in DiceBear's set that carries a CC BY 4.0
// design license (attribution required) and is deliberately left out here
// for that reason, even though it renders fine.
export type AvatarStyle = "notionists" | "avataaars" | "openPeeps";

// Mood-safe by construction (direct feedback: never a sad/angry/distressed
// face). Notionists' and Open Peeps' brow/eye variants are unnamed line-art
// styles, not named moods -- there is no "sad" option in their schema to
// exclude in the first place. Avataaars names its moods, so its
// mouth/eyes/eyebrows enums are trimmed to the happy/neutral/cool subset.
const MOOD_SAFE: Record<AvatarStyle, Record<string, string[]>> = {
  notionists: {},
  openPeeps: {},
  avataaars: {
    mouth: ["default", "smile", "twinkle", "serious"],
    eyes: ["default", "happy", "wink", "side", "squint"],
    eyebrows: ["default", "defaultNatural", "raisedExcited", "raisedExcitedNatural", "upDown", "upDownNatural"],
  },
};

export const AVATAR_STYLES: { key: AvatarStyle; label: string; tag: string }[] = [
  { key: "notionists", label: "Notionists", tag: "hand-drawn, Notion's own style" },
  { key: "avataaars", label: "Avataaars", tag: "the classic cartoon-people set" },
  { key: "openPeeps", label: "Open Peeps", tag: "hand-drawn doodle people" },
];

const STYLE_KEY = "dreamari:avatar-style";
const STYLE_EVENT = "dreamari:avatar-style-change";
const DEFAULT_STYLE: AvatarStyle = "notionists";

export function readAvatarStyle(): AvatarStyle {
  try {
    const saved = window.localStorage.getItem(STYLE_KEY);
    return AVATAR_STYLES.some((s) => s.key === saved) ? (saved as AvatarStyle) : DEFAULT_STYLE;
  } catch {
    return DEFAULT_STYLE;
  }
}

export function setAvatarStyle(style: AvatarStyle) {
  try {
    window.localStorage.setItem(STYLE_KEY, style);
    window.dispatchEvent(new Event(STYLE_EVENT));
  } catch {}
}

function subscribe(cb: () => void) {
  window.addEventListener(STYLE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(STYLE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** The live, app-wide avatar style; `notionists` on the server and before
 *  first paint. Changing it (`setAvatarStyle`) updates every avatar on
 *  screen, anywhere in the app, immediately -- one switch, not a prop to
 *  thread through every caller. */
export function useAvatarStyle(): AvatarStyle {
  return useSyncExternalStore(subscribe, readAvatarStyle, () => DEFAULT_STYLE);
}

const svgCache = new Map<string, string>();

/** A student's generated avatar as a ready-to-embed SVG string, seeded so
 *  the same person always draws the same face. width/height are forced to
 *  100% (DiceBear bakes a literal pixel size onto the root <svg>, which
 *  only looks right at that exact size -- anywhere smaller cropped instead
 *  of scaling) so the caller's own CSS box controls the actual size. */
export function generatedAvatarSvg(seed: string, style: AvatarStyle): string {
  const cacheKey = `${style}:${seed}`;
  const cached = svgCache.get(cacheKey);
  if (cached) return cached;
  const base = { seed, size: 64, backgroundType: ["solid"] as ("solid" | "gradientLinear")[], backgroundColor: ["f4f7ff"] };
  // A switch, not STYLE_MODULE[style] -- each DiceBear style package has its
  // own distinct Options type, so a generic map lookup can't narrow which
  // one applies and createAvatar's generic can't be satisfied.
  const raw =
    style === "avataaars"
      ? createAvatar(avataaars, { ...base, ...MOOD_SAFE.avataaars }).toString()
      : style === "openPeeps"
        ? createAvatar(openPeeps, { ...base, ...MOOD_SAFE.openPeeps }).toString()
        : createAvatar(notionists, { ...base, ...MOOD_SAFE.notionists }).toString();
  const svg = raw.replace(/width="64" height="64"/, 'width="100%" height="100%"');
  svgCache.set(cacheKey, svg);
  return svg;
}
