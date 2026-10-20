import type { WorkArtifact } from "./work-artifacts";
import project from "./food-scientist-project.json";
// Both rendered trial evidence and keys derive from the canonical project record.
export const FS_PROJECT = project;
export const FS_BEST_TRIAL = project.batches.reduce((a,b) => a.broken/a.tested < b.broken/b.tested ? a : b).id;
const lab = { world:"Farming, Animals & Nature", medium:"laboratory", organisation:"Sprout Lab / product development" } as const;
export const FS_ARTIFACTS = {
  "brief": {
    "id": "fs-brief",
    ...lab,
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
  "toolkit": {
    ...lab,id:"fs-toolkit",kind:"work-screen",title:"Measurement reference",recordId:"FS / work console",
    caption:"Select a method to see what it measures. This reference contains no live readings.",provenance:"Fictional lab method reference, no measurements invented.",
    tabs:[
      {label:"Mass",heading:"Ingredient weighing",detail:"Use a balance to record ingredient mass before mixing.",fields:[{label:"Tool",value:"Balance"},{label:"Record",value:"Mass in g"}]},
      {label:"Firmness",heading:"Physical texture test",detail:"A texture analyser measures a physical property under a defined method.",fields:[{label:"Tool",value:"Texture analyser"},{label:"Record",value:"Physical firmness"}]},
      {label:"Sensory",heading:"People’s responses",detail:"A sensory panel records how people perceive a sample.",fields:[{label:"Method",value:"Sensory panel"},{label:"Record",value:"Independent responses"}]}
    ]
  },
  "plan": {
    id:"fs-plan", ...lab, kind:"mixture", title:"Formulation bench · 100 g trials", unit:"g",
    practice:{from:"Oats",to:"Binder",step:5,max:5,instruction:"Move 5 g from oats to binder. Keep seeds and total mass fixed."},
    caption:"Replace 5 g oats with 5 g binder; same mixing, shaping, storage interval and break test.",
    provenance:"Fictional training formulations, not validated recipes.",
    batches:project.batches.map(b=>({label:`Batch ${b.id}`,ingredients:[{label:"Oats",amount:b.oats},{label:"Binder",amount:b.binder},{label:"Seeds",amount:b.seeds}]}))
  },
  "example": {
    "id": "fs-example",
    ...lab,
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
    ...lab,
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
    id:"fs-results", ...lab, kind:"sample-results", title:"Handling test · broken pieces",
    caption:"This test measures breakage only, not safety or shelf life.",
    provenance:"Fictional training counts from the canonical project record.",
    samples:project.batches.map(b=>({label:`Batch ${b.id}`,broken:b.broken,tested:b.tested})),
    scope:"Small trial · no repeat batch yet · safety and shelf life not measured"
  },
  "log": {
    ...lab,id:"fs-log",kind:"register",title:"Sample traceability register",recordId:"FS / sample log",
    caption:"Read the draft as written. Confirm missing information; never guess.",provenance:"Fictional training records.",
    columns:["Ingredients","Test method","Sample state"],records:project.records.map(r=>({id:r.id,values:[r.ingredients,r.method,r.state]}))
  },
  "hold": {
    id:"fs-hold", ...lab, kind:"sample-hold", title:"Sample control · tasting tray",
    caption:"Appearance cannot confirm ingredients or allergen status.",
    provenance:"Fictional sample-control training record.", sampleId:project.heldSample.id,
    checks:[{label:"Ingredient record",value:project.heldSample.ingredientRecord},{label:"Allergen review",value:project.heldSample.allergenReview},{label:"Tasting",value:project.heldSample.tasting}]
  },
  "sensory": {
    ...lab,id:"fs-sensory",kind:"panel-plan",title:"Sensory panel / serving plan",recordId:"FS / coded panel",
    caption:"A blank response protocol, not panel results. Yuki has approved A and B; C remains held.",provenance:"Fictional approved-sample teaching setup; codes are illustrative.",
    legend:"Approved samples · response sheet",codes:project.panel.codes,question:project.panel.question,controls:project.panel.controls
  },
  "handover": {
    "id": "fs-handover",
    ...lab,
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
