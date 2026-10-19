import type { InterfaceSpec, WorkArtifact } from "./work-artifacts";
const provenance = "Fictional Northline volunteer sign-up project; AI-authored teaching example.";
const base = { heading: "Riverside clean-up", description: "Saturday · 10:00 AM · Riverside Park", detail: "Help the team clean the river path. Equipment is provided.", action: "Join this event", actionPlacement: "after-details" as const };
export const UX_DRAFT_FORM: InterfaceSpec = { ...base, fields: [{ label: "Email address", value: "alex@", required: "colour", error: "Something went wrong." }] };
const revisedForm: InterfaceSpec = { ...base, fields: [{ label: "Email address", value: "alex@", required: "text", error: "Enter a complete email address, like alex@example.com." }] };
export const UX_FORM_FINDINGS = [
  { label: "The email field has a visible label.", flag: !UX_DRAFT_FORM.fields[0].label, why: "The label tells people what belongs in the field." },
  { label: "Required fields are marked only in red.", flag: UX_DRAFT_FORM.fields[0].required === "colour", why: "Colour alone does not explain which fields are required." },
  { label: `The error says: ${UX_DRAFT_FORM.fields[0].error}`, flag: UX_DRAFT_FORM.fields[0].error === "Something went wrong.", why: "It does not identify the problem or explain what to fix." },
  { label: `The button says ${UX_DRAFT_FORM.action}.`, flag: UX_DRAFT_FORM.action !== "Join this event", why: "The label describes the action clearly." },
];
export const UX_ARTIFACTS = {
  flow: { id: "ux-join-flow", kind: "flow", title: "The task: join a nearby event", caption: "A user flow maps the steps; it does not prescribe the page's colours.", provenance, steps: [{ title: "Find an event", detail: "Choose a place and date" }, { title: "Read the details", detail: "Check that you can attend" }, { title: "Join", detail: "Complete the sign-up" }] },
  wireframe: { id: "ux-wireframe", kind: "interface", title: "A wireframe plans what goes where", caption: "A simplified layout for the same event. A prototype adds behaviour that can be tried.", provenance, screen: { ...base, fields: [] } },
  notes: { id: "ux-evidence", kind: "notes", title: "Session notes · Eleanor", caption: "A fictional session record. Keep observations separate from possible explanations.", provenance, entries: [{ label: "Observed", text: "Eleanor clicked the event title three times." }, { label: "Heard", text: "Where do I join?" }, { label: "Not yet known", text: "Why she expected the title to open sign-up." }] },
  iteration: { id: "ux-prototype-versions", kind: "comparison", title: "Two routes to the same task", caption: "These are design ideas, not proof of improvement. Try the same joining task with each version.", provenance, panels: [{ label: "Draft A", screen: { ...base, fields: [] } }, { label: "Draft B", screen: { ...base, actionPlacement: "before-details", fields: [] } }] },
  form: { id: "ux-draft-form", kind: "interface", title: "Draft sign-up form", caption: "Read-only design preview. Identify the problems before changing the draft.", provenance, screen: UX_DRAFT_FORM },
  formExample: { id: "ux-form-example", kind: "interface", title: "An error that explains what to fix", caption: "Teaching example: words explain both the required field and its error.", provenance, screen: revisedForm },
  handover: { id: "ux-handover", kind: "notes", title: "Handover · current project state", caption: "The team needs behaviour, evidence and remaining work, not a polished screenshot alone.", provenance, entries: [{ label: "Flow and states", text: "Event details → join form → confirmation" }, { label: "Finding", text: "Eleanor asked where to join." }, { label: "Still blocked", text: "The latest keyboard test cannot complete sign-up." }, { label: "Next check", text: "Agree a fix and retest the complete task." }] },
} satisfies Record<string, WorkArtifact>;
