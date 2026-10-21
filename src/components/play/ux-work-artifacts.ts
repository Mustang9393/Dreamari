import type { WorkArtifact } from "./work-artifacts";
export const UX_ARTIFACTS = {
  "app": {
    "id": "ux-context-app",
    "kind": "scene-context",
    "view": "music-ui",
    "title": "Music app preview",
    "caption": "Music app preview. Illustrative context only; no answer information.",
    "provenance": "Fictional project atmosphere, not a live screen or measurement."
  },
  "wireframe": {
    "id": "ux-context-wireframe",
    "kind": "scene-context",
    "view": "wireframe",
    "title": "Rough app layout",
    "caption": "Rough app layout. Illustrative context only; no answer information.",
    "provenance": "Fictional project atmosphere, not a live screen or measurement."
  },
  "message": {
    "id": "ux-context-message",
    "kind": "scene-context",
    "view": "message",
    "title": "Team message",
    "caption": "Team message. Illustrative context only; no answer information.",
    "provenance": "Fictional project atmosphere, not a live screen or measurement.",
    "from": "Noah",
    "line": "Ready for a quick check?"
  }
} satisfies Record<string, WorkArtifact>;
