import type { Tier } from "../types";

// One career simulation's art, as data (29 Sept 2026, so every new career is
// art files plus one JSON, never code). The backend serves the same file per
// career; the scene tuner (/play-tools/scene-tuner) and the art script
// (scripts/play-art) read and write it. Schema: career-art.schema.json.

/** Fractions of the image: 0 = left/top edge, 1 = right/bottom edge. */
export type FocalPoint = { x: number; y: number };

/** Where a character stands in a location, as fractions of the scene's
 *  height. baselineY is the sprite's bottom edge measured from the top (above
 *  1 means the sprite's lower part is cropped below the frame, on purpose);
 *  heightFrac is the sprite's rendered height. x only applies with
 *  centered: false -- by default the speaker stands in the middle. */
export type CharacterSlot = { x: number; baselineY: number; heightFrac: number; centered?: boolean };

export type SceneLocation = {
  src: string;
  alt: string;
  /** desktop and tablet (640px and up) */
  focal: FocalPoint;
  /** phones (below 640px) */
  mobileFocal: FocalPoint;
  /** one speaker in the room */
  characterAnchor?: CharacterSlot;
  /** two or more named people together, in story order */
  characterAnchors?: CharacterSlot[];
  note?: string;
  /** true = hand-tuned; scripts/play-art's `place`/`process` must leave
   *  focal, mobileFocal and characterAnchor alone (29 Sept 2026, so 900+
   *  auto-placed careers can't silently clobber IB/RN's tuning). */
  locked?: boolean;
  /** Semantic room type for the beat-to-room mapper (scripts/play-beats),
   *  not read by the player itself. */
  role?:
    | "work-floor"
    | "work-floor-night"
    | "private-meeting"
    | "formal-meeting"
    | "break"
    | "transition"
    | "arrival"
    | "specialist";
};

export type CastMember = {
  /** the face worn before any answer exists */
  default: string;
  /** reaction per answer tier, shown on the feedback card */
  tiers?: Partial<Record<Tier, string>>;
  /** extra named expressions a beat can ask for (Beat.castPose), for a face
   *  that isn't a reaction: AMT Maya's arms-crossed "confident" on "You
   *  know the basics. Let's see how you troubleshoot." */
  poses?: Record<string, string>;
  /** 512x512 face chip for the dialogue box */
  face?: string;
  /** typing voice-blip pitch in Hz; 500 if absent */
  voicePitch?: number;
};

export type CareerArt = {
  $schema?: string;
  /** the catalogue career id, same as Simulation.careerId */
  career: string;
  /** public/images/play/<folder> */
  folder: string;
  /** "full-figure-1024x2048" is the standard for every new career */
  spriteStandard: "full-figure-1024x2048" | "waist-up-legacy";
  notes?: string[];
  locations: Record<string, SceneLocation>;
  cast: Record<string, CastMember>;
  /** width / height of every sprite file, written by scripts/play-art */
  portraitRatios: Record<string, number>;
  /** beat id -> location id; a beat not listed shows the ambient backdrop */
  beatLocations: Record<string, string>;
};
