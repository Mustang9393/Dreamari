"use client";

// Line-art student avatars (Chandu, 7 Oct 2026: "can we try this?" on
// DiceBear's Lorelei Neutral, by Lisa Wischofsky, CC0). Drawn locally from
// the npm package, so no student ID leaves the app. Ink features on a
// gray skin-tone disc: no hair and no ethnic features (facial features are a
// random mix for everyone; skin tone is the one, chosen, signal, the way
// emoji and Memoji do it). Only friendly faces: brows, eyes and mouths that
// read worried, sleepy, sideways or odd are left out (checked by eye on the
// full variant sheet). About 100,000 combinations; a school can hand them
// out without repeats.

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import * as lorelei from "@dicebear/lorelei-neutral";

// five grays, light to deep (Chandu, 7 Oct 2026: "don't use colours for the
// avatars, keep it different shades of grey"): tone shows as value, not hue,
// in line with the grayscale student portraits. The student picks one.
export const SKIN_TONES = ["ededed", "d8d8d8", "bcbcbc", "9c9c9c", "7f7f7f"] as const;

const BROWS = ["variant01", "variant02", "variant03", "variant05", "variant07", "variant08", "variant09", "variant10", "variant11", "variant12"];
// no heart pupils (09) or winks (15, 18): they read flirty in a counselor's
// list; no flat dashes (01) or narrow squints (22): they read bored or smug
const EYES = ["variant02", "variant04", "variant06", "variant08", "variant10", "variant11", "variant12", "variant13", "variant14", "variant16", "variant17", "variant19", "variant20", "variant21", "variant23", "variant24"];
const MOUTHS = ["happy01", "happy02", "happy03", "happy04", "happy05", "happy06", "happy07", "happy16"];

export function LineAvatar({ seed, tone, className = "" }: { seed: string; tone: 1 | 2 | 3 | 4 | 5; className?: string }) {
  const uri = useMemo(() => createAvatar(lorelei, {
    seed,
    backgroundColor: [SKIN_TONES[tone - 1]],
    eyebrows: BROWS as never,
    eyes: EYES as never,
    mouth: MOUTHS as never,
    glassesProbability: 18,
    frecklesProbability: 15,
    // deep tones get a slightly lighter ink so the features keep contrast
    ...(tone >= 4 ? { eyesColor: ["111111"], eyebrowsColor: ["111111"], mouthColor: ["111111"], noseColor: ["111111"], glassesColor: ["111111"] } : {}),
  }).toDataUri(), [seed, tone]);
  // eslint-disable-next-line @next/next/no-img-element -- an inline SVG data URI, nothing for next/image to optimize
  return <img src={uri} alt="" className={className} />;
}
