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
  named: {
    id: "fs-visible-labels", kind: "scene-context", view: "sample-codes", state: "named",
    title: "Named recipe labels", caption: "Visible recipe names before the tasting uses neutral codes.",
    provenance: "Fictional tasting labels; preparation facts remain in the question."
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
