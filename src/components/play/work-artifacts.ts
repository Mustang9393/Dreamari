/** Read-only career evidence. Data and labels travel with the script; no scoring here. */
export type ArtifactBase = { id: string; title: string; caption: string; provenance: string };
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
  | { kind: "mixture"; unit: string; batches: {label:string; ingredients:{label:string; amount:number}[]}[] }
  | { kind: "sample-results"; samples:{label:string; broken:number; tested:number}[]; scope:string }
  | { kind: "sample-hold"; sampleId:string; checks:{label:string; value:string}[] }
  | { kind: "flow"; steps: { title: string; detail: string; icon?: "search" | "calendar" | "check" | "file" | "tool" }[] }
  | { kind: "notes"; layout?: "board" | "handover"; entries: { label: string; text: string; tone?: "fact" | "quote" | "unknown" | "blocked" | "next" }[] }
  | { kind: "interface"; screen: InterfaceSpec; process?: string[]; demo?: { kind: "email-signup"; fieldLabel: string; placeholder: string; error: string; submitLabel: string; successTitle: string; successBody: string } }
  | { kind: "comparison"; panels: { label: string; screen: InterfaceSpec }[] }
);

export function artifactProblems(a: WorkArtifact): string[] {
  const errors: string[] = [];
  if (!a.id || !a.title || !a.caption || !a.provenance) errors.push("Missing artifact identity, caption or provenance");
  if (a.kind === "flow" && (a.steps.length < 2 || a.steps.some(s => !s.title || !s.detail))) errors.push("Incomplete flow");
  if (a.kind === "notes" && (!a.entries.length || a.entries.some(e => !e.label || !e.text))) errors.push("Incomplete evidence notes");
  if (a.kind === "mixture" && (!a.unit || a.batches.length < 2 || a.batches.some(b => !b.label || !b.ingredients.length || b.ingredients.some(i => !i.label || !Number.isFinite(i.amount) || i.amount < 0) || b.ingredients.reduce((sum,i)=>sum+i.amount,0) <= 0))) errors.push("Invalid formulation data");
  if (a.kind === "sample-results" && (!a.scope || !a.samples.length || a.samples.some(s => !s.label || !Number.isInteger(s.tested) || s.tested < 1 || !Number.isInteger(s.broken) || s.broken < 0 || s.broken > s.tested))) errors.push("Invalid sample counts");
  if (a.kind === "sample-hold" && (!a.sampleId || !a.checks.length || a.checks.some(c => !c.label || !c.value))) errors.push("Incomplete held sample");
  const screens = a.kind === "interface" ? [a.screen] : a.kind === "comparison" ? a.panels.map(p => p.screen) : [];
  for (const s of screens) if (!s.heading || !s.action || !s.detail || s.fields.some(f => !f.label)) errors.push("Incomplete interface");
  if (a.kind === "comparison" && (a.panels.length !== 2 || a.panels[0].label === a.panels[1].label)) errors.push("Comparison requires two named versions");
  if (a.kind === "interface" && a.demo && (a.screen.fields.length || Object.values(a.demo).some(v => !v))) errors.push("Incomplete prototype demo or unsupported initial form");
  return errors;
}
