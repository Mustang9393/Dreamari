import type { CSSProperties } from "react";

export type ScenePhase = "dawn" | "day" | "dusk" | "night";
export type SceneWeather = "breeze" | "glints" | "drizzle";
export type WorldScene = {
  phase: ScenePhase;
  weather: SceneWeather;
  seed: number;
  tier: "Beginner" | "Intermediate" | "Advanced";
};

/** No asset or industry lookup: the same world key always produces the same
 * weather and phase offset. Finance's original rendering path is untouched. */
export function worldScene(industry: string, world: string, level: number, tier: WorldScene["tier"]): WorldScene | null {
  if (industry === "finance") return null;
  const seed = Array.from(world).reduce((n, char) => (n * 31 + char.charCodeAt(0)) >>> 0, 7);
  const phases: ScenePhase[] = ["dawn", "day", "dusk", "night"];
  const weather: SceneWeather[] = ["breeze", "glints", "drizzle"];
  return { phase: phases[(Math.max(1, level) - 1 + seed % 4) % 4], weather: weather[seed % 3], seed, tier };
}

/** Shared by the room and the map thumbnail. Colours come from the existing
 * certified token vocabulary, never a second industry palette. */
export function sceneStyle(scene: WorldScene | null, mastery = 0): CSSProperties {
  if (!scene) return {};
  return {
    "--scene-seed": scene.seed % 13,
    "--scene-mastery": Math.max(0, Math.min(1, mastery)),
    "--scene-depth": scene.tier === "Advanced" ? 1 : scene.tier === "Intermediate" ? .8 : .6,
    "--scene-sun-x": `${16 + scene.seed % 64}%`,
  } as CSSProperties;
}
