// Scene plates for the Levels map (16 Oct 2026). The map paints a plate for
// every level from the theme's own sky, so no industry needs level art. When
// the team wants painted variety, it scales by TIER and THEME, never by
// level and industry: three tiers times two themes is six strips, fifteen
// worlds would make ninety at most, while one strip per level per industry
// would be six hundred. Register strips here; the map picks
// `PLATES[theme][tier][levelIndex % length]`, and a blueprint level can pin
// one with `plate`. Author strips as 1536 by 512 WebP, horizon in the lower
// third, nothing important within twelve percent of the edges, no text, so
// any crop from 2:1 to 6:1 reads (the plate is drawn with cover and a
// per-level horizontal slice). Empty lists mean "paint it".

import type { GlossaryLevel } from "./data";

export type PlateTheme = "drift" | "signal";

export const PLATES: Record<PlateTheme, Record<GlossaryLevel["tier"], string[]>> = {
  drift: { Beginner: [], Intermediate: [], Advanced: [] },
  signal: { Beginner: [], Intermediate: [], Advanced: [] },
};

/** The image for a level's plate, or null to paint it. */
export function plateImage(theme: PlateTheme, level: Pick<GlossaryLevel, "tier" | "plate">, index: number): string | null {
  if (level.plate) return level.plate;
  const list = PLATES[theme][level.tier];
  return list.length ? list[index % list.length] : null;
}
