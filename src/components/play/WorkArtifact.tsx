import type { InterfaceSpec, WorkArtifact as Artifact } from "./work-artifacts";

function Screen({ screen }: { screen: InterfaceSpec }) {
  const action = <div className="rounded-[var(--radius-md)] px-3 py-2 text-center text-[12px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{screen.action}</div>;
  return <div className="flex min-w-0 flex-col gap-2 rounded-[var(--radius-md)] border p-3 text-left" style={{ borderColor: "var(--glass-border)", background: "var(--background)" }}>
    <div aria-hidden className="flex gap-1 border-b pb-2" style={{ borderColor: "var(--glass-border)" }}>{[0, 1, 2].map(n => <span key={n} className="h-1 w-1 rounded-full" style={{ background: "var(--muted-foreground)" }} />)}</div>
    <strong className="text-[14px]">{screen.heading}</strong>
    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{screen.description}</p>
    {screen.actionPlacement === "before-details" && action}
    <p className="text-[12px] leading-relaxed">{screen.detail}</p>
    {screen.fields.map(f => <div key={f.label} className="flex flex-col gap-1 text-[12px]">
      <span className="font-semibold">{f.label} {f.required === "text" ? "(required)" : <span aria-label="Red required marker" style={{ color: "var(--destructive)" }}>●</span>}</span>
      <span className="rounded-[var(--radius-sm)] border px-2 py-2" style={{ borderColor: "var(--glass-border)" }}>{f.value}</span>
      {f.error && <p style={{ color: "var(--destructive)" }}>{f.error}</p>}
    </div>)}
    {screen.actionPlacement === "after-details" && action}
  </div>;
}

/** One evidence renderer, selected by content shape rather than career ID. */
export function WorkArtifact({ artifact: a }: { artifact: Artifact }) {
  return <figure aria-label={a.title} className="my-3 flex min-w-0 flex-col gap-2 rounded-[var(--radius-lg)] border p-3 sm:p-4" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--foreground)" }}>
    <div className="flex flex-wrap items-baseline justify-between gap-1"><strong className="text-[13px]">{a.title}</strong><span className="text-[9px] font-semibold tracking-wider uppercase" style={{ color: "var(--muted-foreground)" }}>Read-only project evidence</span></div>
    {a.kind === "flow" && <ol className="grid gap-2 sm:grid-cols-3">{a.steps.map((s, i) => <li key={s.title} className="rounded-[var(--radius-md)] border p-2 text-left" style={{ borderColor: "var(--glass-border)" }}><span className="text-[10px] font-bold" style={{ color: "var(--primary)" }}>STEP {i + 1}</span><p className="text-[13px] font-bold">{s.title}</p><p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{s.detail}</p></li>)}</ol>}
    {a.kind === "notes" && <dl className="grid gap-2">{a.entries.map(e => <div key={e.label} className="grid grid-cols-[minmax(70px,0.3fr)_1fr] gap-3 border-t pt-2 text-left text-[12px]" style={{ borderColor: "var(--glass-border)" }}><dt className="font-bold">{e.label}</dt><dd>{e.text}</dd></div>)}</dl>}
    {a.kind === "interface" && <Screen screen={a.screen} />}
    {a.kind === "comparison" && <div className="grid gap-3 sm:grid-cols-2">{a.panels.map(p => <div key={p.label} className="min-w-0"><p className="mb-1 text-left text-[11px] font-bold">{p.label}</p><Screen screen={p.screen} /></div>)}</div>}
    <figcaption className="text-left text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{a.caption}</figcaption>
  </figure>;
}
