import type { WorldScene } from "./worldScenes";

/** Four decorative nodes, no listeners, canvas, filters or timers. Reuses the
 * parent room's existing pointer and answer event stream. The weather motes
 * were removed on 17 Oct 2026 (Chandu decided to drop weather). */
export function LivingWorld({ scene, cue }: { scene: WorldScene; cue: string }) {
  return <div className="glossary-living-world" data-cue={cue} aria-hidden>
    <span className="glossary-scene-light" />
    <span className="glossary-scene-disc" />
    <span className="glossary-scene-horizon" />
    <span className="glossary-scene-response" key={cue} />
  </div>;
}
