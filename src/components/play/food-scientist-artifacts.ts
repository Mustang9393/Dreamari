import type { WorkArtifact } from "./work-artifacts";
export const FS_ARTIFACTS = {
  "note": {
    "id": "fs-context-note",
    "kind": "scene-context",
    "view": "batch-note",
    "title": "Small-batch lab note",
    "caption": "Small-batch lab note. Illustrative context only; no answer information.",
    "provenance": "Fictional project atmosphere, not a live screen or measurement."
  },
  "codes": {
    "id": "fs-context-codes",
    "kind": "scene-context",
    "view": "sample-codes",
    "title": "Coded sample labels",
    "caption": "Coded sample labels. Illustrative context only; no answer information.",
    "provenance": "Fictional project atmosphere, not a live screen or measurement."
  },
  "message": {
    "id": "fs-context-message",
    "kind": "scene-context",
    "view": "message",
    "title": "Lab message",
    "caption": "Lab message. Illustrative context only; no answer information.",
    "provenance": "Fictional project atmosphere, not a live screen or measurement.",
    "from": "Ren",
    "line": "Ready to review the tasting?"
  }
} satisfies Record<string, WorkArtifact>;
