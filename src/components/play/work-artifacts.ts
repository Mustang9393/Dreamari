/** Read-only career evidence. Data and labels travel with the script; no scoring here. */
/** Read-only evidence inside an existing answer control; never owns score or state. */
export type DecisionEvidence = { code: string; medium: "laboratory" | "operations" | "drawing"; fields: {label:string; value:string}[] };
export type ArtifactBase = { id: string; title: string; caption: string; provenance: string; world?:string; medium?: "laboratory" | "operations" | "drawing"; organisation?:string; recordId?:string };
export type InterfaceSpec = {
  heading: string;
  siteName?: string;
  navigation?: string;
  illustration?: "landscape";
  fidelity?: "wireframe" | "ui";
  description: string;
  fields: { label: string; value: string; required: "colour" | "text"; error?: string }[];
  action: string;
  actionPlacement: "before-details" | "after-details";
  detail: string;
};
export type WorkArtifact = ArtifactBase & (
  | { kind: "work-screen"; panels: {label:string; heading:string; detail:string; fields:{label:string; value:string}[]}[] }
  | { kind: "register"; columns:string[]; records:{id:string; values:string[]}[] }
  | { kind: "panel-plan"; legend:string; codes:string[]; question:string; controls:string[] }
  | { kind: "mixture"; unit: string; batches: {label:string; ingredients:{label:string; amount:number}[]}[] }
  | { kind: "sample-results"; samples:{label:string; broken:number; tested:number}[]; scope:string }
  | { kind: "sample-hold"; sampleId:string; checks:{label:string; value:string}[] }
  | { kind: "flow"; steps: { title: string; detail: string; icon?: "search" | "calendar" | "check" | "file" | "tool" }[] }
  | { kind: "notes"; layout?: "board" | "handover"; entries: { label: string; text: string; tone?: "fact" | "quote" | "unknown" | "blocked" | "next" }[] }
  | { kind: "interface"; screen: InterfaceSpec; process?: string[] }
  | { kind: "comparison"; panels: { label: string; screen: InterfaceSpec }[] }
);

export function artifactProblems(a: WorkArtifact): string[] {
  const errors: string[] = [];
  if ("demo" in a || "practice" in a) errors.push("Supporting graphics must be read-only");
  if (!a.id || !a.title || !a.caption || !a.provenance) errors.push("Missing artifact identity, caption or provenance");
  if (a.kind === "flow" && (a.steps.length < 2 || a.steps.some(s => !s.title || !s.detail))) errors.push("Incomplete flow");
  if (a.kind === "notes" && (!a.entries.length || a.entries.some(e => !e.label || !e.text))) errors.push("Incomplete evidence notes");
  if (a.kind === "mixture" && (!a.unit || a.batches.length < 2 || a.batches.some(b => !b.label || !b.ingredients.length || b.ingredients.some(i => !i.label || !Number.isFinite(i.amount) || i.amount < 0) || b.ingredients.reduce((sum,i)=>sum+i.amount,0) <= 0))) errors.push("Invalid formulation data");
  if (a.kind === "sample-results" && (!a.scope || !a.samples.length || a.samples.some(s => !s.label || !Number.isInteger(s.tested) || s.tested < 1 || !Number.isInteger(s.broken) || s.broken < 0 || s.broken > s.tested))) errors.push("Invalid sample counts");
  if (a.kind === "sample-hold" && (!a.sampleId || !a.checks.length || a.checks.some(c => !c.label || !c.value))) errors.push("Incomplete held sample");
  if(a.kind === "work-screen" && (!a.panels.length || new Set(a.panels.map(t=>t.label)).size !== a.panels.length || a.panels.some(t=>!t.label || !t.heading || !t.detail || !t.fields.length || t.fields.some(f=>!f.label || !f.value)))) errors.push("Incomplete work screen");
  if(a.kind === "register" && (!a.columns.length || !a.records.length || new Set(a.records.map(r=>r.id)).size !== a.records.length || a.records.some(r=>!r.id || r.values.length !== a.columns.length || r.values.some(v=>!v)))) errors.push("Incomplete sample register");
  if(a.kind === "panel-plan" && (!a.legend || a.codes.length<2 || new Set(a.codes).size !== a.codes.length || a.codes.some(c=>!c) || !a.question || !a.controls.length)) errors.push("Incomplete panel protocol");
  const screens = a.kind === "interface" ? [a.screen] : a.kind === "comparison" ? a.panels.map(p => p.screen) : [];
  for (const s of screens) if (!s.heading || !s.action || !s.detail || s.fields.some(f => !f.label)) errors.push("Incomplete interface");
  if (a.kind === "comparison" && (a.panels.length !== 2 || a.panels[0].label === a.panels[1].label)) errors.push("Comparison requires two named versions");
  return errors;
}

export function decisionEvidenceProblems(e:DecisionEvidence):string[] {
 return !e.code || !["laboratory","operations","drawing"].includes(e.medium) || !e.fields.length || e.fields.some(f=>!f.label || !f.value) || new Set(e.fields.map(f=>f.label)).size !== e.fields.length ? ["Incomplete decision evidence record"] : [];
}
