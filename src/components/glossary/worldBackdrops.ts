// Per-world backdrops for the glossary game (16 Oct 2026, Chandu: "we need
// to be able to generate reliably and scale different backgrounds in signal
// mode for each world").
//
// The unit is the CAREER WORLD, never the industry or the level: fifteen
// worlds, so at most fifteen images per theme, and every industry under a
// world inherits its backdrop the moment it is registered. Nothing here is
// required: an unregistered world keeps today's look.
//
// Signal: one 1200 by 800 pixel-art panorama per world. The engine tiles it
// in mirrored pairs (so the left and right edges never have to match) and
// crops three parallax bands from it (sky, city, shore), and the Levels map
// slices the same image for its plates. Author it with the horizon in the
// lower third, a readable skyline silhouette in the middle band, a dark
// quiet lower band, nothing important within ten percent of the left and
// right edges, no text, no Dreamy. Style lock: the Signal Level 1 art.
//   public/images/glossary/backdrops/signal/<world-slug>.webp
//
// Drift: painted, not an image. The sky, orbs and cloud banks take the
// world's accent from worldTheme(), so every world already looks like
// itself. An optional silhouette strip per world (an SVG or a transparent
// WebP, 1600 by 300, a skyline, a runway, a kitchen pass line) sits on the
// horizon behind the clouds when registered.
//   public/images/glossary/backdrops/drift/<world-slug>.svg

export const SIGNAL_DEFAULT_BACKDROP = "/images/glossary/signal/bg.webp";

/** World name to its Signal panorama. Register a file to switch the world. */
export const SIGNAL_WORLD_BACKDROPS: Partial<Record<string, string>> = {
  // "Health & Medicine": "/images/glossary/backdrops/signal/health-medicine.webp",
};

/** World name to its Drift horizon silhouette. Optional. */
export const DRIFT_WORLD_SILHOUETTES: Partial<Record<string, string>> = {
  // "Driving, Flying & Shipping": "/images/glossary/backdrops/drift/driving-flying-shipping.svg",
};

export function signalBackdrop(world: string): string {
  return SIGNAL_WORLD_BACKDROPS[world] ?? SIGNAL_DEFAULT_BACKDROP;
}

export function driftSilhouette(world: string): string | null {
  return DRIFT_WORLD_SILHOUETTES[world] ?? null;
}
