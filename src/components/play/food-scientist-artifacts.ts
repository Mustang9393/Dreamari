import type { WorkArtifact } from "./work-artifacts";
import project from "./food-scientist-project.json";
// Both rendered trial evidence and keys derive from the canonical project record.
export const FS_PROJECT = project;
export const FS_BEST_TRIAL = project.batches.reduce((a,b) => a.broken/a.tested < b.broken/b.tested ? a : b).id;
export const FS_ARTIFACTS = {
  "brief": {
    "id": "fs-brief",
    "kind": "notes",
    "layout": "handover",
    "title": "Project card \u00b7 Sprout oat snack",
    "caption": "Your recommendation supports the next experiment. It does not authorise a product launch.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "Problem",
        "text": "The current snack breaks too easily during handling."
      },
      {
        "label": "Your task",
        "text": "Compare small trials and recommend the next test."
      },
      {
        "label": "Authority",
        "text": "Kiran supervises lab work. Mei approves tasting and further testing."
      }
    ]
  },
  "plan": {
    "id": "fs-plan",
    "kind": "notes",
    "layout": "handover",
    "title": "Trial plan \u00b7 100 g per batch",
    "caption": "One planned change: replace 5 g oats with 5 g binder. These are fictional development trials, not a recipe to follow.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "A",
        "text": `Oats ${project.batches[0].oats} g · binder ${project.batches[0].binder} g · seeds ${project.batches[0].seeds} g`
      },
      {
        "label": "B",
        "text": `Oats ${project.batches[1].oats} g · binder ${project.batches[1].binder} g · seeds ${project.batches[1].seeds} g`
      },
      {
        "label": "Both trials",
        "text": "Same mixing, shaping, storage interval and break test."
      }
    ]
  },
  "example": {
    "id": "fs-example",
    "kind": "notes",
    "layout": "handover",
    "title": "Example \u00b7 a different cracker test",
    "caption": "Changing one factor makes the comparison easier to interpret; repeat it to check consistency.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "Changed",
        "text": "Mixing time: short versus long."
      },
      {
        "label": "Kept the same",
        "text": "Ingredients, shape and test method."
      },
      {
        "label": "Recorded",
        "text": "Sample ID, mixing time and break-test result."
      }
    ]
  },
  "flow": {
    "id": "fs-flow",
    "kind": "flow",
    "title": "From question to evidence",
    "caption": "Prepare the comparison before making a conclusion.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "steps": [
      {
        "title": "Plan",
        "detail": "One change; same test",
        "icon": "file"
      },
      {
        "title": "Make",
        "detail": "Record both batch IDs",
        "icon": "tool"
      },
      {
        "title": "Measure",
        "detail": "Repeat the agreed test",
        "icon": "search"
      },
      {
        "title": "Recommend",
        "detail": "Evidence + next check",
        "icon": "check"
      }
    ]
  },
  "results": {
    "id": "fs-results",
    "kind": "notes",
    "layout": "handover",
    "title": "Handling test \u00b7 same method",
    "caption": "These results describe this trial only. Less breakage does not prove why it changed or that the snack is safe.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "Batch A",
        "text": `${project.batches[0].broken} of ${project.batches[0].tested} pieces broke`
      },
      {
        "label": "Batch B",
        "text": `${project.batches[1].broken} of ${project.batches[1].tested} pieces broke`
      },
      {
        "label": "Test scope",
        "text": "Small trial; no repeat batch yet."
      },
      {
        "label": "Safety / shelf life",
        "text": "This handling test does not measure either."
      }
    ]
  },
  "log": {
    "id": "fs-log",
    "kind": "notes",
    "layout": "handover",
    "title": "Sample record \u00b7 draft for review",
    "caption": "Read each record as written. Missing information must be checked against verified records, never guessed.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "A",
        "text": "Ingredient amounts and test method recorded."
      },
      {
        "label": "B",
        "text": "Test method omitted from the draft record."
      },
      {
        "label": "C",
        "text": "Ingredient identity missing; tasting not authorised."
      },
      {
        "label": "D",
        "text": "Held separately while the record is checked."
      }
    ]
  },
  "hold": {
    "id": "fs-hold",
    "kind": "notes",
    "layout": "handover",
    "title": "Tasting tray \u00b7 sample C",
    "caption": "The appearance of a food sample cannot confirm its ingredients or allergen status.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "Sample ID",
        "text": "C"
      },
      {
        "label": "Ingredient record",
        "text": "Missing"
      },
      {
        "label": "Allergen review",
        "text": "Not confirmed"
      },
      {
        "label": "Tasting",
        "text": "Not authorised"
      }
    ]
  },
  "sensory": {
    "id": "fs-sensory",
    "kind": "notes",
    "layout": "handover",
    "title": "Panel plan \u00b7 approved samples A and B",
    "caption": "This is an educational plan, not permission to taste unknown food or run a panel yourself.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "Readiness",
        "text": "Mei has confirmed the approved panel protocol and sample checks."
      },
      {
        "label": "Method",
        "text": "Use neutral sample codes; same serving conditions; separate responses."
      },
      {
        "label": "Question",
        "text": "How firm does each sample feel?"
      },
      {
        "label": "Scope",
        "text": "Describe this panel. Do not claim everyone prefers one batch."
      }
    ]
  },
  "handover": {
    "id": "fs-handover",
    "kind": "notes",
    "layout": "handover",
    "title": "Project handover \u00b7 version 1",
    "caption": "A useful handover states what was measured and what remains unknown.",
    "provenance": "Fictional Sprout Lab training project. Counts and formulations are teaching data, not validated recipes or safety limits.",
    "entries": [
      {
        "label": "Trial result",
        "text": "B had less breakage than A in this small handling test."
      },
      {
        "label": "Recommendation",
        "text": "Repeat B alongside A under the same method."
      },
      {
        "label": "Unresolved",
        "text": "Sample C is held for review. Shelf life has not been studied."
      },
      {
        "label": "Owner",
        "text": "Mei reviews the records and approves the next work."
      }
    ]
  }
} satisfies Record<string, WorkArtifact>;
