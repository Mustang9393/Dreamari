// Welcome screen art per industry, and per level when a level has its own
// (16 Oct 2026, Chandu: "for level 1 of all worlds we will have images for
// the terms. And the welcome screen. Codex has to know to generate those as
// well. And I would like codex to attempt generating a custom image we can
// use for each level in the selector only or the welcome screen only").
//
// The welcome screen shows one hero illustration beside Dreamy (Finance's is
// the sneaker shop). Every industry gets one; a level may get its own,
// which then also serves the Levels map when the blueprint pins it as the
// level's `plate`. Codex delivers the files; the engine reads this file.
//
//   WELCOME_ART[industrySlug]            public/images/glossary/<industry>-<date>/{drift,signal}/welcome.webp
//   LEVEL_WELCOME_ART[lessonId]          public/images/glossary/<industry>-<date>/{drift,signal}/welcome-l02.webp
//
// Format: 1024 by 1024, transparent, one composed scene (the workplace,
// never a person), same style lock as the theme's Level 1 term art; it is
// shown at about 300 px beside the copy, so keep one readable silhouette.

import type { PlateTheme } from "./levelPlates";

type ThemedArt = Partial<Record<PlateTheme, string>>;

/** Industry slug to its welcome hero per theme. */
export const WELCOME_ART: Partial<Record<string, ThemedArt>> = {
  // finance keeps its authored sneaker shop (assetsFor / SIGNAL_ASSETS)
  software: { drift: "/images/glossary/software-oct17/drift/welcome.webp", signal: "/images/glossary/software-oct17/signal/welcome.webp" },
};

/** Lesson id (RN-L02) to a welcome hero of its own per theme. Optional. */
export const LEVEL_WELCOME_ART: Partial<Record<string, ThemedArt>> = {};

/** The welcome image for this lesson, or null to show Dreamy alone. */
export function welcomeArtFor(industrySlug: string, lessonId: string, theme: PlateTheme): string | null {
  return LEVEL_WELCOME_ART[lessonId]?.[theme] ?? WELCOME_ART[industrySlug]?.[theme] ?? null;
}
