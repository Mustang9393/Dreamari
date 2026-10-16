import type { CSSProperties } from "react";
import type { WorldScene } from "./worldScenes";

/** At most twelve decorative nodes, no listeners, canvas, filters or timers.
 * Reuses the parent room's existing pointer and answer event stream. */
export function LivingWorld({ scene, cue }: { scene: WorldScene; cue: string }) {
  return <div className="glossary-living-world" data-weather={scene.weather} data-cue={cue} aria-hidden>
    <span className="glossary-scene-light" />
    <span className="glossary-scene-disc" />
    <span className="glossary-scene-horizon" />
    <span className="glossary-scene-response" key={cue} />
    {Array.from({ length: 8 }, (_, i) => <i className="glossary-scene-mote" key={i} style={{
      "--mote-x": `${(i * 37 + scene.seed % 31) % 100}%`,
      "--mote-y": `${10 + (i * 23 + scene.seed % 29) % 78}%`,
      "--mote-delay": `${-i * 2.7}s`,
      "--mote-duration": `${18 + i % 4 * 5}s`,
    } as CSSProperties} />)}
  </div>;
}
