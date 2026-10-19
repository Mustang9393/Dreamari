/** Read-only career evidence. Data and labels travel with the script; no scoring here. */
export type ArtifactBase = { id: string; title: string; caption: string; provenance: string };
export type InterfaceSpec = {
  heading: string;
  description: string;
  fields: { label: string; value: string; required: "colour" | "text"; error?: string }[];
  action: string;
  actionPlacement: "before-details" | "after-details";
  detail: string;
};
export type WorkArtifact = ArtifactBase & (
  | { kind: "flow"; steps: { title: string; detail: string }[] }
  | { kind: "notes"; entries: { label: string; text: string }[] }
  | { kind: "interface"; screen: InterfaceSpec }
  | { kind: "comparison"; panels: { label: string; screen: InterfaceSpec }[] }
);

export function artifactProblems(a: WorkArtifact): string[] {
  const errors: string[] = [];
  if (!a.id || !a.title || !a.caption || !a.provenance) errors.push("Missing artifact identity, caption or provenance");
  if (a.kind === "flow" && (a.steps.length < 2 || a.steps.some(s => !s.title || !s.detail))) errors.push("Incomplete flow");
  if (a.kind === "notes" && (!a.entries.length || a.entries.some(e => !e.label || !e.text))) errors.push("Incomplete evidence notes");
  const screens = a.kind === "interface" ? [a.screen] : a.kind === "comparison" ? a.panels.map(p => p.screen) : [];
  for (const s of screens) if (!s.heading || !s.action || !s.detail || s.fields.some(f => !f.label)) errors.push("Incomplete interface");
  if (a.kind === "comparison" && (a.panels.length !== 2 || a.panels[0].label === a.panels[1].label)) errors.push("Comparison requires two named versions");
  return errors;
}
