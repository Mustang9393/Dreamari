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
        "text": "Ren supervises lab work. Yuki approves tasting and further testing."
      }
    ]
  },
  "plan": {
    id:"fs-plan", kind:"mixture", title:"Formulation bench · 100 g trials", unit:"g",
    caption:"Replace 5 g oats with 5 g binder; same mixing, shaping, storage interval and break test.",
    provenance:"Fictional training formulations, not validated recipes.",
    batches:project.batches.map(b=>({label:`Batch ${b.id}`,ingredients:[{label:"Oats",amount:b.oats},{label:"Binder",amount:b.binder},{label:"Seeds",amount:b.seeds}]}))
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
    id:"fs-results", kind:"sample-results", title:"Handling test · broken pieces",
    caption:"This test measures breakage only, not safety or shelf life.",
    provenance:"Fictional training counts from the canonical project record.",
    samples:project.batches.map(b=>({label:`Batch ${b.id}`,broken:b.broken,tested:b.tested})),
    scope:"Small trial · no repeat batch yet · safety and shelf life not measured"
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
    id:"fs-hold", kind:"sample-hold", title:"Sample control · tasting tray",
    caption:"Appearance cannot confirm ingredients or allergen status.",
    provenance:"Fictional sample-control training record.", sampleId:project.heldSample.id,
    checks:[{label:"Ingredient record",value:project.heldSample.ingredientRecord},{label:"Allergen review",value:project.heldSample.allergenReview},{label:"Tasting",value:project.heldSample.tasting}]
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
        "text": "Yuki has confirmed the approved panel protocol and sample checks."
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
        "text": "Yuki reviews the records and approves the next work."
      }
    ]
  }
} satisfies Record<string, WorkArtifact>;
