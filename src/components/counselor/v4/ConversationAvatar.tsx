"use client";

import Image from "next/image";
import { studentPortraitSrc, useStudentAvatarSrc } from "@/lib/avatar";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { LineAvatar, SKIN_TONES } from "../v6/LineAvatar";
import { LIVE_TRAITS, PORTRAIT_TRAITS } from "../v6/avatarTraits";

// DiceBear styles to try on the conversation cards (9 Oct 2026, Chandu:
// "From dicebear.com/animated-avatars can we have toggles and try glyphs,
// slice, big smile, avataaars, cameo, miniavs, constellations, plants and
// voxel art, voxel bot, and loops (use animated ones wherever possible)").
// "Plants" is DiceBear's Sprouts style. Five of the eleven animate:
// Constellation, Sprouts, Voxel Art, Voxel Bot and Loops, at the slow speed;
// the rest are still. The animation is CSS inside the SVG and DiceBear
// stops it under prefers-reduced-motion.
// DEMO-ONLY: drawn by DiceBear's public HTTP API (api.dicebear.com, 10.x),
// seeded with the roster id so no student name leaves the app. For
// production, self-host with @dicebear/core and the chosen style package
// instead of calling the public API.
export const DICEBEAR_STYLES = [
  { key: "glyphs", label: "Glyphs" },
  { key: "slice", label: "Slice" },
  { key: "big-smile", label: "Big Smile" },
  { key: "avataaars", label: "Avataaars" },
  { key: "cameo", label: "Cameo" },
  { key: "miniavs", label: "Miniavs" },
  { key: "constellation", label: "Constellation", animated: true },
  { key: "sprouts", label: "Sprouts (plants)", animated: true },
  { key: "voxel-art", label: "Voxel Art", animated: true },
  { key: "voxel-bot", label: "Voxel Bot", animated: true },
  { key: "loops", label: "Loops", animated: true },
] as const;

type DiceBearKey = (typeof DICEBEAR_STYLES)[number]["key"];
export type ConversationAvatarStyle = "line" | "portrait" | DiceBearKey;

/** Every choice for the picker, the two house styles first. */
export const AVATAR_STYLE_OPTIONS: { value: ConversationAvatarStyle; label: string }[] = [
  { value: "portrait", label: "Portraits" },
  { value: "line", label: "Line art" },
  ...DICEBEAR_STYLES.map((s) => ({ value: s.key, label: "animated" in s ? `${s.label} · animated` : s.label })),
];

export const isAvatarStyle = (v: string): v is ConversationAvatarStyle => AVATAR_STYLE_OPTIONS.some((o) => o.value === v);

// Only friendly faces on a student's card. Two styles roll expressions and
// props a counselor tool should never put on a student: Avataaars has sad,
// grimacing, screaming and vomiting mouths, crying and dizzy eyes, angry
// brows, and slogan or skull shirts (one demo student came up in a
// "RESIST!" shirt); Big Smile has sad, angry and unimpressed faces, a clown
// nose and a sleep mask; Sprouts can glare or frown and Voxel Art can frown
// under angry brows (an angry plant beside "Needs Attention" reads as a
// verdict on the student). Each is limited to its neutral and positive parts
// (DiceBear 10.x names the options `<part>Variant`; the allowed values are
// the style definition's own, @dicebear/styles 10.6.0).
const STYLE_PARAMS: Partial<Record<DiceBearKey, Record<string, string>>> = {
  avataaars: {
    mouthVariant: "default,smile,twinkle,serious",
    eyesVariant: "default,happy,side,squint,wink",
    eyebrowsVariant: "default,defaultNatural,flatNatural,raisedExcited,raisedExcitedNatural,upDown,upDownNatural",
    clothesGraphicVariant: "bat,bear,cumbia,deer,diamond,hola,pizza",
  },
  "big-smile": {
    mouthVariant: "awkwardSmile,braces,gapSmile,kawaii,openedSmile,teethSmile",
    eyesVariant: "cheery,normal,starstruck,winking",
    accessoriesVariant: "catEars,glasses,sailormoonCrown,sunglasses",
  },
  // the animated plant and voxel faces can frown or glare too
  sprouts: {
    eyesVariant: "round,dots,bigPupils,happy,closedLine,wink,wide,close",
    mouthVariant: "smile,tinySmile,grin,ooh,line,catMouth,open,wavy,tooth",
  },
  "voxel-art": {
    mouthVariant: "smile,bigSmile,flat,ooh,smirk,laugh,wideSmile,grin",
    eyebrowsVariant: "flat,raised,soft",
  },
};

const diceBearSrc = (style: DiceBearKey, seed: string, background?: string) => {
  const animated = DICEBEAR_STYLES.some((s) => s.key === style && "animated" in s);
  // One parameter per value (mouthVariant=smile&mouthVariant=twinkle): the
  // API rejects a request with several comma lists (400, FST_ERR_VALIDATION,
  // measured 9 Oct 2026) but takes the same values repeated.
  const q = new URLSearchParams({ seed });
  for (const [key, values] of Object.entries(STYLE_PARAMS[style] ?? {})) for (const v of values.split(",")) q.append(key, v);
  if (background) q.set("backgroundColor", background);
  if (animated) q.set("animationVariant", "slow");
  return `https://api.dicebear.com/10.x/${style}/svg?${q.toString()}`;
};

/** Every face style draws on one of DiceBear's own pastels, chosen per
 *  student, so the frame around it can be painted the same colour and the
 *  art reads edge to edge (9 Oct 2026, Chandu: no "square in a square or
 *  inside another circle"; 10 Oct: wider cards "without losing the
 *  avatars"). */
const PASTELS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];
/** All-over patterns: they crop cleanly, so they fill the frame. */
const PATTERNS = new Set<DiceBearKey>(["loops", "constellation"]);
/** One pastel per student, the same on every visit. */
const pastelFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PASTELS[h % PASTELS.length];
};

/** Same roster identity in each style. */
export function ConversationAvatar({student, style, size=44}: {size?:number; student: Pick<CounselorStudent, "id" | "avatarIndex">; style: ConversationAvatarStyle}) {
 const live = useStudentAvatarSrc("Jordan");
 const traits = student.avatarIndex >= 0 ? PORTRAIT_TRAITS[student.avatarIndex] ?? LIVE_TRAITS : LIVE_TRAITS;
 // The card's picture frame is wider than tall (5:4) and every avatar is
 // square art. Rather than crop a face, the frame is painted the avatar's
 // own background colour (the app chooses it and passes it to DiceBear)
 // and the square sits whole in the middle, so the art reads edge to edge
 // with nothing cut (10 Oct 2026, Chandu: wider cards "without losing the
 // avatars"). DiceBear 10 has no scale option and will not drop its
 // background, so the colour has to be ours.
 if (style === "line") return <span className="v4-avatar-frame" style={{ background: `#${SKIN_TONES[traits.t - 1]}` }}><LineAvatar seed={student.id} tone={traits.t}/></span>;
 if (style !== "portrait") {
  // A plain <img>: the SVG's own CSS animation only runs when it is loaded
  // as an image file, and next/image would need dangerouslyAllowSVG.
  // Keyed on the style: a browser keeps painting an <img>'s old picture
  // until the new src has downloaded, so switching styles briefly showed
  // the previous style. A new element starts empty instead.
  if (PATTERNS.has(style)) {
   // eslint-disable-next-line @next/next/no-img-element
   return <img key={style} src={diceBearSrc(style, student.id)} alt="" width={size*2} height={size*2} loading="lazy" decoding="async" className="v4-dicebear"/>;
  }
  const bg = pastelFor(student.id);
  return <span key={style} className="v4-avatar-frame" style={{ background: `#${bg}` }}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={diceBearSrc(style, student.id, bg)} alt="" width={size*2} height={size*2} loading="lazy" decoding="async" className="v4-dicebear"/>
  </span>;
 }
 return <Image src={student.avatarIndex >= 0 ? studentPortraitSrc(student.avatarIndex) : live} alt="" width={size*2} height={size*2} className="h-full w-full object-cover"/>;
}
