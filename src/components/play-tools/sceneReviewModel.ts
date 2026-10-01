// The scene review's model: which sprite stands in each location, where the
// dialogue box sits, and the automatic flags. Pure, no React. Placement math
// comes from src/components/play/scenePlacement.ts, the same helpers the
// player uses, so a flag here describes what the player really renders.

import type { CareerArt, CharacterSlot, SceneLocation } from "@/components/play/art";
import { spriteBox, spriteCenterX, spriteWidthPx } from "@/components/play/scenePlacement";
import type { Level, Simulation } from "@/components/play/types";

// ------------------------------------------------------------------ frames

export type FrameSpec = { key: string; label: string; w: number; h: number };

export const FRAMES: FrameSpec[] = [
  { key: "phone", label: "Phone", w: 390, h: 844 },
  { key: "tablet", label: "Tablet", w: 768, h: 1024 },
  { key: "laptop", label: "Laptop", w: 1440, h: 900 },
  { key: "wide", label: "Wide", w: 1920, h: 1080 },
  { key: "ultrawide", label: "Ultrawide", w: 2560, h: 1080 },
];

/** Sum of every frame's width / height, for fitting a row to its container. */
export const FRAME_ASPECT_SUM = FRAMES.reduce((sum, f) => sum + f.w / f.h, 0);

export type Rect = { left: number; top: number; width: number; height: number };

/** Where a bottom-docked dialogue card sits in a W x H scene. Mirrors
 *  BeatStage + DialogueBox in SimulationPlayer.tsx: px-3/pb-3 (sm px-5/pb-5)
 *  padding, a 3dvh (sm 4dvh) lift, max width 620 (sm clamp(620px, 43vw,
 *  880px)). The box's height depends on its copy, so this uses the player's
 *  one-line character card measured live (225px at 390x844, 215px at
 *  1440x900); on desktop its type scales with vw, so the height follows the
 *  box width. Interactive beats center their box and are not modelled. */
export function dialogueZone(w: number, h: number): Rect {
  const phone = w < 640;
  const pad = phone ? 12 : 20;
  const maxWidth = phone ? 620 : Math.min(880, Math.max(620, 0.43 * w));
  const width = Math.min(w - 2 * pad, maxWidth);
  const height = phone ? 225 : 215 * (width / 620);
  const bottom = pad + (phone ? 0.03 : 0.04) * h;
  return { left: (w - width) / 2, top: h - bottom - height, width, height };
}

// ------------------------------------------------------------------ sprites

/** A sprite's opaque area as fractions of its image box, measured off the
 *  loaded file. headX is the centre of the top few rows, where the head is. */
export type AlphaBox = { top: number; bottom: number; left: number; right: number; headX: number };

/** When the file cannot be measured: the full-figure standard's canvas
 *  margins (4% transparent above the head). */
export const STANDARD_ALPHA: AlphaBox = { top: 0.04, bottom: 1, left: 0, right: 1, headX: 0.5 };

/** Face centre below the top of the figure, as a fraction of the figure's
 *  height. A full figure is about 7.5 heads tall, so its face centre sits
 *  near 7%. The legacy waist-up crop is about 3 heads tall, so near 16%. */
export function faceOffsetFor(standard: CareerArt["spriteStandard"]): number {
  return standard === "waist-up-legacy" ? 0.16 : 0.07;
}

export type SpriteGeometry = {
  box: Rect;
  /** top of the opaque figure, px from the frame top */
  figureTop: number;
  face: { x: number; y: number };
};

export function spriteGeometry(slot: CharacterSlot, frame: { w: number; h: number }, ratio: number | undefined, alpha: AlphaBox, faceOffset: number): SpriteGeometry {
  const placed = spriteBox(slot, frame.h);
  const width = spriteWidthPx(placed.heightPx, ratio);
  const left = spriteCenterX(slot) * frame.w - width / 2;
  const figureTop = placed.topPx + alpha.top * placed.heightPx;
  const figureHeight = (alpha.bottom - alpha.top) * placed.heightPx;
  return {
    box: { left, top: placed.topPx, width, height: placed.heightPx },
    figureTop,
    face: { x: left + alpha.headX * width, y: figureTop + faceOffset * figureHeight },
  };
}

// ------------------------------------------------------------------ rows

export type RowSprite = {
  slot: CharacterSlot;
  name: string;
  src: string;
  /** "routed": the cast member most beats in this room show; "fallback": nobody is routed, so the first cast member stands in */
  source: "routed" | "fallback";
};

export type LocationRow = {
  id: string;
  location: SceneLocation;
  /** beat ids routed here */
  beats: string[];
  sprites: RowSprite[];
};

function levelBeats(levels: Level[]) {
  const seen = new Set<string>();
  const out: Level["beats"] = [];
  const add = (level: Level | undefined) => {
    if (!level) return;
    for (const beat of level.beats) {
      if (seen.has(beat.id)) continue;
      seen.add(beat.id);
      out.push(beat);
    }
  };
  for (const level of levels) {
    add(level);
    add(level.expressSource);
  }
  return out;
}

function mostCommon<T>(counts: Map<string, { n: number; value: T }>): T | undefined {
  let best: { n: number; value: T } | undefined;
  for (const entry of counts.values()) if (!best || entry.n > best.n) best = entry;
  return best?.value;
}

/** One row per location, with the sprite(s) the player would stand in it:
 *  the same `castMembers` / `castMember ?? speaker` rule SceneCharacter's
 *  call site uses, counted over every beat routed to the room. */
export function buildRows(art: CareerArt, simulation: Simulation | undefined): LocationRow[] {
  const beats = simulation ? levelBeats(simulation.levels) : [];
  const byId = new Map(beats.map((beat) => [beat.id, beat]));
  const firstCast = Object.keys(art.cast)[0];
  return Object.entries(art.locations).map(([id, location]) => {
    const routed = Object.entries(art.beatLocations)
      .filter(([, loc]) => loc === id)
      .map(([beatId]) => beatId);
    const singles = new Map<string, { n: number; value: string }>();
    const groups = new Map<string, { n: number; value: string[] }>();
    for (const beatId of routed) {
      const beat = byId.get(beatId);
      if (!beat) continue;
      if (beat.castMembers?.length) {
        const key = beat.castMembers.join("+");
        groups.set(key, { n: (groups.get(key)?.n ?? 0) + 1, value: beat.castMembers });
      } else {
        const name = beat.castMember ?? beat.speaker;
        if (name && art.cast[name]) singles.set(name, { n: (singles.get(name)?.n ?? 0) + 1, value: name });
      }
    }
    const sprites: RowSprite[] = [];
    const group = mostCommon(groups);
    if (location.characterAnchors && group) {
      group.forEach((name, i) => {
        const slot = location.characterAnchors?.[i];
        const member = art.cast[name];
        if (slot && member) sprites.push({ slot, name, src: member.default, source: "routed" });
      });
    } else if (location.characterAnchor) {
      const name = mostCommon(singles);
      const pick = name ?? firstCast;
      const member = pick ? art.cast[pick] : undefined;
      if (pick && member) sprites.push({ slot: location.characterAnchor, name: pick, src: member.default, source: name ? "routed" : "fallback" });
    }
    return { id, location, beats: routed, sprites };
  });
}

// ------------------------------------------------------------------ flags

export type Probe = { status: "ok"; w: number; h: number; alpha: AlphaBox | null } | { status: "error" };

export type Flag = { code: string; message: string };

const TOLERANCE = 0.02;

function frameList(keys: string[]): string {
  if (keys.length === FRAMES.length) return "every frame";
  return keys.map((k) => FRAMES.find((f) => f.key === k)?.label ?? k).join(", ");
}

function inside(point: { x: number; y: number }, rect: Rect) {
  return point.x >= rect.left && point.x <= rect.left + rect.width && point.y >= rect.top && point.y <= rect.top + rect.height;
}

export function rowFlags(row: LocationRow, art: CareerArt, probes: Record<string, Probe | undefined>, resolve: (src: string) => string): Flag[] {
  const flags: Flag[] = [];
  const { location } = row;
  if (probes[resolve(location.src)]?.status === "error") flags.push({ code: "plate-missing", message: `Plate did not load: ${location.src}` });
  if (!location.alt?.trim() || /todo/i.test(location.alt)) flags.push({ code: "alt-missing", message: "Alt text is missing or still TODO." });
  if (row.beats.length === 0) flags.push({ code: "unused", message: "No beat is routed to this location." });
  const faceOffset = faceOffsetFor(art.spriteStandard);
  for (const sprite of row.sprites) {
    const who = row.sprites.length > 1 ? `${sprite.name}: ` : "";
    const probe = probes[resolve(sprite.src)];
    const ratio = art.portraitRatios[sprite.src];
    if (probe?.status === "error") {
      flags.push({ code: "sprite-missing", message: `${who}Sprite did not load: ${sprite.src}` });
      continue;
    }
    // Missing or stale ratios are reported once for the career (careerFlags),
    // not once per room that happens to show the same sprite.
    const alpha = probe?.status === "ok" && probe.alpha ? probe.alpha : STANDARD_ALPHA;
    const cropped: string[] = [];
    const low: string[] = [];
    const hidden: string[] = [];
    const offSide: string[] = [];
    for (const frame of FRAMES) {
      const g = spriteGeometry(sprite.slot, frame, probe?.status === "ok" ? probe.w / probe.h : ratio, alpha, faceOffset);
      if (g.figureTop < 0) cropped.push(frame.key);
      if (g.face.y > frame.h / 3) low.push(frame.key);
      if (inside(g.face, dialogueZone(frame.w, frame.h))) hidden.push(frame.key);
      if (g.face.x < 0 || g.face.x > frame.w) offSide.push(frame.key);
    }
    if (cropped.length) flags.push({ code: "head-cropped", message: `${who}Head crops above the frame (${frameList(cropped)}).` });
    if (low.length) flags.push({ code: "face-low", message: `${who}Face sits below the upper third (${frameList(low)}).` });
    if (hidden.length) flags.push({ code: "face-hidden", message: `${who}Face is under the dialogue box (${frameList(hidden)}).` });
    if (offSide.length) flags.push({ code: "face-off-side", message: `${who}Face is off the side of the frame (${frameList(offSide)}).` });
  }
  return flags;
}

/** Problems that belong to the career, not to one room. `probes` measures
 *  the sprites the rows show, so a stale ratio is caught off the real file. */
export function careerFlags(art: CareerArt, simulation: Simulation | undefined, probes: Record<string, Probe | undefined>, resolve: (src: string) => string): Flag[] {
  const flags: Flag[] = [];
  const dangling = Object.entries(art.beatLocations).filter(([, loc]) => !art.locations[loc]);
  if (dangling.length) {
    const ids = [...new Set(dangling.map(([, loc]) => loc))];
    flags.push({ code: "route-dangling", message: `${dangling.length} ${dangling.length === 1 ? "beat routes" : "beats route"} to a location that does not exist: ${ids.join(", ")} (${dangling.map(([b]) => b).join(", ")}).` });
  }
  const sprites = new Set<string>();
  for (const member of Object.values(art.cast)) {
    sprites.add(member.default);
    for (const src of Object.values(member.tiers ?? {})) if (src) sprites.add(src);
  }
  const noRatio = [...sprites].filter((src) => art.portraitRatios[src] === undefined);
  if (noRatio.length) flags.push({ code: "cast-ratio-missing", message: `${noRatio.length} cast ${noRatio.length === 1 ? "sprite has" : "sprites have"} no portraitRatios entry: ${noRatio.join(", ")}.` });
  for (const src of sprites) {
    const probe = probes[resolve(src)];
    const ratio = art.portraitRatios[src];
    if (ratio === undefined || probe?.status !== "ok") continue;
    const real = probe.w / probe.h;
    if (Math.abs(ratio - real) / real > TOLERANCE) flags.push({ code: "ratio-stale", message: `portraitRatios says ${ratio} for ${src}, the file is ${real.toFixed(4)}.` });
  }
  if (simulation) {
    const known = new Set(levelBeats(simulation.levels).map((beat) => beat.id));
    const unknown = Object.keys(art.beatLocations).filter((id) => !known.has(id));
    if (unknown.length) flags.push({ code: "route-unknown-beat", message: `beatLocations lists ${unknown.length} beat ${unknown.length === 1 ? "id" : "ids"} no level has: ${unknown.join(", ")}.` });
  }
  return flags;
}

/** Every image the review needs to probe for this career. */
export function probeTargets(rows: LocationRow[], art: CareerArt): { plates: string[]; sprites: string[] } {
  const cast = Object.values(art.cast).flatMap((member) => [member.default, ...Object.values(member.tiers ?? {}).filter((src): src is string => !!src)]);
  return {
    plates: [...new Set(rows.map((r) => r.location.src))],
    sprites: [...new Set([...rows.flatMap((r) => r.sprites.map((s) => s.src)), ...cast])],
  };
}

export function reportText(career: string, rows: { row: LocationRow; flags: Flag[] }[], global: Flag[]): string {
  const total = global.length + rows.reduce((n, r) => n + r.flags.length, 0);
  const lines = [`Scene review: ${career}`, `${rows.length} locations, ${total} ${total === 1 ? "flag" : "flags"}`];
  for (const flag of global) lines.push(`- career: ${flag.message}`);
  for (const { row, flags } of rows) for (const flag of flags) lines.push(`- ${row.id}: ${flag.message}`);
  return lines.join("\n");
}

/** Minimal shape check for a dropped-in manifest; returns a reason or null. */
export function manifestProblem(value: unknown): string | null {
  if (!value || typeof value !== "object") return "The file is not a JSON object.";
  const v = value as Partial<CareerArt>;
  if (typeof v.career !== "string" || !v.career) return "It has no \"career\" id.";
  if (!v.locations || typeof v.locations !== "object") return "It has no \"locations\" object.";
  for (const [id, loc] of Object.entries(v.locations)) {
    if (!loc || typeof loc.src !== "string" || !loc.focal || !loc.mobileFocal) return `Location "${id}" needs src, focal and mobileFocal.`;
  }
  if (!v.cast || typeof v.cast !== "object") return "It has no \"cast\" object.";
  return null;
}

/** Fills the optional collections a generated manifest may leave out. */
export function normalizeManifest(value: CareerArt): CareerArt {
  return { ...value, portraitRatios: value.portraitRatios ?? {}, beatLocations: value.beatLocations ?? {}, spriteStandard: value.spriteStandard ?? "full-figure-1024x2048" };
}

