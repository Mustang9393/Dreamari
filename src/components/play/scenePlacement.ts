// The placement math for a location scene, in one place (29 Sept 2026). The
// player (LocationBackdrop and SceneCharacter in SimulationPlayer.tsx) and the
// QA contact sheet (/play-tools/scene-review) both call these helpers, so what
// the review shows for a room at a given screen size is exactly what the
// player renders there. Pure functions, no React, no DOM.

import type { CharacterSlot, FocalPoint } from "./art/types";

/** Below this viewport width a location uses its mobileFocal (Tailwind `sm`). */
export const MOBILE_BREAKPOINT_PX = 640;

/** Desktop and tablet plates render slightly oversized (scale 1.03) so the
 *  cover crop never shows a hairline edge while the entrance zoom settles. */
export const DESKTOP_PLATE_SCALE = 1.03;

/** Width / height assumed for a sprite whose ratio is missing from the
 *  manifest's portraitRatios. A wrong guess letterboxes the sprite. */
export const FALLBACK_PORTRAIT_RATIO = 0.55;

/** The CSS object-position that crops an object-cover plate at its focal
 *  point: 0 keeps the left/top edge, 1 the right/bottom edge. */
export function plateObjectPosition(focal: FocalPoint): string {
  return `${focal.x * 100}% ${focal.y * 100}%`;
}

/** Which focal point a location uses at a given scene width. */
export function focalForWidth(location: { focal: FocalPoint; mobileFocal: FocalPoint }, width: number): FocalPoint {
  return width < MOBILE_BREAKPOINT_PX ? location.mobileFocal : location.focal;
}

/** Horizontal centre of a sprite as a fraction of the scene width. Centered
 *  (the default) puts the speaker in the middle; `centered: false` uses the
 *  slot's own x. */
export function spriteCenterX(anchor: Pick<CharacterSlot, "x" | "centered">): number {
  return anchor.centered === false ? anchor.x : 0.5;
}

export type SpriteBox = {
  /** CSS `left`, as a percentage of the scene width (the sprite is then
   *  shifted back by half its own width). */
  leftPct: number;
  /** CSS `bottom` in px: negative means the sprite runs below the frame. */
  bottomPx: number;
  /** CSS `height` in px; the sprite image fills it at its own ratio. */
  heightPx: number;
  /** Sprite top edge in px from the scene's top (negative = above the frame). */
  topPx: number;
};

/** Where a character slot puts its sprite in a scene of the given height.
 *  Heights and offsets are real px, not percentages (see SceneCharacter). */
export function spriteBox(anchor: CharacterSlot, sceneHeight: number): SpriteBox {
  const heightPx = anchor.heightFrac * sceneHeight;
  const bottomPx = (1 - anchor.baselineY) * sceneHeight;
  return {
    leftPct: spriteCenterX(anchor) * 100,
    bottomPx,
    heightPx,
    topPx: sceneHeight - bottomPx - heightPx,
  };
}

/** Rendered sprite width: the image is h-full w-auto at its file's ratio. */
export function spriteWidthPx(heightPx: number, ratio: number | undefined): number {
  return heightPx * (ratio ?? FALLBACK_PORTRAIT_RATIO);
}
