"use client";

import { type ComponentType, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ShieldAlert, CalendarDays, Check, CircleHelp, FileText, Headphones, Layers2, MapPin, MousePointer2, PanelTop, Search, TriangleAlert, Wrench } from "lucide-react";
import type { InterfaceSpec, WorkArtifact as Artifact } from "./work-artifacts";
import { WORLD_COLORS } from "@/components/app/worlds";
import { WorkScreen } from "./WorkScreen";
import styles from "./WorkArtifact.module.css";

const glyphs: Record<string, ComponentType<{ "aria-hidden"?: boolean }>> = { search: Search, calendar: CalendarDays, check: Check, file: FileText, tool: Wrench, fact: MousePointer2, quote: Headphones, unknown: CircleHelp, blocked: TriangleAlert, next: ArrowRight };

/** Native vector art stays crisp at game size; the record chooses it, never the career ID. */
function Landscape() {
  return <svg className={styles.landscape} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden>
    <rect width="200" height="120" fill="var(--color-neutral-200)" />
    <circle cx="155" cy="27" r="16" fill="var(--color-feedback-warning-solid)" />
    <path d="M0 88Q45 28 95 75T200 58V120H0Z" fill="var(--color-neutral-400)" />
    <path d="M0 109Q70 57 126 97T200 81V120H0Z" fill="var(--color-neutral-700)" />
    <path d="M80 120Q130 83 100 67" fill="none" stroke="var(--color-neutral-50)" strokeWidth="8" />
  </svg>;
}
function Wireframe({ screen }: { screen: InterfaceSpec }) {
  return <div className={styles.wireCanvas}>
    <svg className={styles.wireSvg} viewBox="0 0 520 225" role="img" aria-label={`Low-fidelity wireframe: image, ${screen.heading}, event details, and ${screen.action} action. Layout only.`}>
      <rect className={styles.wireFill} x="80" y="8" width="360" height="208" rx="5" />
      <path className={styles.wireLine} d="M80 31H440" />
      <circle className={styles.wireLine} cx="92" cy="20" r="2" /><circle className={styles.wireLine} cx="102" cy="20" r="2" /><circle className={styles.wireLine} cx="112" cy="20" r="2" />
      <rect className={styles.wireFill} x="98" y="48" width="115" height="106" rx="2" />
      <path className={styles.wireLine} d="M98 48L213 154M213 48L98 154" />
      <rect className={styles.wireBar} x="230" y="49" width="151" height="12" rx="2" />
      <rect className={styles.wireBar} x="230" y="70" width="110" height="5" rx="2" />
      <path className={styles.wireLine} d="M230 94H417M230 105H406M230 116H369" />
      <rect className={styles.wireFill} x="230" y="132" width="114" height="27" rx="2" />
      <text x="287" y="149" textAnchor="middle">{screen.action}</text>
      <path className={styles.wireLine} d="M98 179H421M98 189H310" />
      <g strokeDasharray="3 3"><path className={styles.wireLine} d="M65 50H22V154H65M455 49H500V116H455" /></g>
      <text x="40" y="105" textAnchor="middle" transform="rotate(-90 40 105)">Image</text>
      <text x="485" y="86" textAnchor="middle" transform="rotate(90 485 86)">Content</text>
    </svg>
  </div>;
}
function PreviewAction({ label }: { label: string }) {
  return <span className={styles.previewAction}>{label}<ArrowUpRight aria-hidden /></span>;
}
function Screen({ screen }: { screen: InterfaceSpec }) {
  const action = <PreviewAction label={screen.action} />;
  return <div className={styles.screen}>
    <div className={styles.siteBar}><span className={styles.siteMark}><Layers2 aria-hidden />{screen.siteName ?? "Project preview"}</span>{screen.navigation && <span className={styles.siteNav}>{screen.navigation}</span>}</div>
    {screen.fields.length ? <div className={styles.formLayout}>
      <div className={styles.formSummary}>{screen.illustration === "landscape" && <Landscape />}<h4>{screen.heading}</h4><p className={styles.eventMeta}>{screen.description}</p></div>
      <div className={styles.formBody}><div className={styles.fields}>{screen.fields.map((f)=><div key={f.label} className={styles.field}>
        <div className={styles.fieldLabel}>{f.label} {f.required === "text" ? <span>(required)</span> : <span role="img" aria-label="Red required marker" style={{color:"var(--color-feedback-danger-solid)"}}>●</span>}</div>
        <div className={styles.previewField} data-invalid={Boolean(f.error)}>{f.value}</div>
        {f.error && <p className={styles.error}><TriangleAlert aria-hidden />{f.error}</p>}
      </div>)}</div>{action}</div>
    </div> : <div className={screen.illustration ? styles.eventLayout : styles.eventPlain}>
      {screen.illustration === "landscape" && <Landscape />}
      <div className={styles.eventText}><h4>{screen.heading}</h4><p className={styles.eventMeta}><CalendarDays aria-hidden />{screen.description}</p>
        {screen.actionPlacement === "before-details" && action}
        <p className={styles.eventDetail}>{screen.detail}</p>
        {screen.actionPlacement === "after-details" && action}
      </div>
    </div>}
  </div>;
}
/** Data-driven work evidence; visuals are distinct from the game's action controls. */
export function WorkArtifact({ artifact:a }: { artifact: Artifact }) {
  const reduced=useReducedMotion();
  const enter=(i=0)=>({initial:reduced?false:{opacity:0,y:7},animate:{opacity:1,y:0},transition:{duration:.28,delay:reduced?0:i*.08}});
  const Icon=a.kind==="sample-hold"?ShieldAlert:a.kind==="work-screen"||a.kind==="sample-results"?PanelTop:a.kind==="register"||a.kind==="panel-plan"||a.kind==="mixture"?FileText:a.kind==="flow"?MapPin:a.kind==="notes"?FileText:a.kind==="comparison"?Layers2:a.kind==="interface"&&a.screen.fidelity==="wireframe"?Layers2:PanelTop;
  return <motion.figure {...enter()} aria-label={a.title} className={styles.artifact} style={{"--work-accent":a.world ? WORLD_COLORS[a.world] : undefined} as CSSProperties} data-medium={a.medium} data-work-artifact={a.id} data-readonly="true">
    {a.organisation&&<div className={styles.organisation}><span>{a.organisation}</span><span>{a.recordId ?? "Development record"}</span></div>}
    {<div className={styles.toolbar}><Icon aria-hidden /><span className={styles.title}>{a.title}</span><span className={styles.meta}>{a.medium==="laboratory"?"R&D / teaching record":a.kind==="interface"&&a.screen.fidelity==="wireframe"?"Layout only":a.kind==="register"||a.kind==="work-screen"||a.kind==="panel-plan"?"Work record":a.kind==="notes"?"Project file":a.kind==="flow"?"Work sequence":a.kind==="mixture"||a.kind==="sample-results"||a.kind==="sample-hold"?"Lab record":"Design preview"}</span></div>}
    {a.kind==="work-screen"&&<WorkScreen key={a.id} artifact={a}/>}
    {a.kind==="register"&&<div className={styles.registerStock}><table className={styles.register}><thead><tr><th scope="col">ID</th>{a.columns.map(c=><th scope="col" key={c}>{c}</th>)}</tr></thead><tbody>{a.records.map(r=><tr key={r.id}><th scope="row"><span>{r.id}</span></th>{r.values.map((v,i)=><td key={a.columns[i]}>{v}</td>)}</tr>)}</tbody></table></div>}
    {a.kind==="panel-plan"&&<div className={styles.protocolFile}><div className={styles.protocolHeading}><span>{a.legend}</span><b>PROTOCOL / DRAFT</b></div><h4>{a.question}</h4><div className={styles.responseRows}>{a.codes.map(code=><div key={code}><span className={styles.sampleCode}>{code}</span><div><span>Sample code · response</span><p>Awaiting independent response</p></div></div>)}</div><ul className={styles.protocolChecks}>{a.controls.map(control=><li key={control}><Check aria-hidden/>{control}</li>)}</ul></div>}
    {a.kind==="mixture"&&<div className={styles.labCanvas}><div className={styles.batchGrid}>{a.batches.map(b=><section key={b.label} className={styles.batch}><h4>{b.label}<span>{b.ingredients.reduce((sum,i)=>sum+i.amount,0)} {a.unit}</span></h4><div className={styles.formulaBar} aria-hidden>{b.ingredients.map((v,i)=><span key={v.label} data-material={i%3} style={{flexGrow:v.amount}}/>)}</div><dl className={styles.ingredients}>{b.ingredients.map((v,i)=><div key={v.label}><dt><span data-material={i%3}/>{v.label}</dt><dd>{v.amount} {a.unit}</dd></div>)}</dl></section>)}</div></div>}
    {a.kind==="sample-results"&&<div className={styles.resultScreen}><div className={styles.readoutHeader}><span>HANDLING TEST</span><span>Recorded counts · not live</span></div><div className={styles.resultGrid}>{a.samples.map(s=><section key={s.label}><h4>{s.label}</h4><div className={styles.reading}><strong>{s.broken}</strong><span>/ {s.tested}<small>broken</small></span></div><div className={styles.resultTrack} role="img" aria-label={`${s.broken} of ${s.tested} broken`}><motion.span initial={false} animate={{width:`${s.broken/s.tested*100}%`}} transition={{duration:reduced?0:.4}}/></div><p>{s.tested-s.broken} intact · {s.tested} tested</p></section>)}</div><p className={styles.resultScope}>{a.scope}</p></div>}
    {a.kind==="sample-hold"&&<div className={styles.holdCanvas}><div className={styles.sampleSeal}><ShieldAlert aria-hidden/><strong>{a.sampleId}</strong><span>ON HOLD</span></div><dl className={styles.holdChecks}>{a.checks.map(c=><div key={c.label}><dt>{c.label}</dt><dd>{c.value}</dd></div>)}</dl></div>}
    {a.kind==="flow"&&<ol data-long={a.steps.length>3} style={{"--flow-columns":Math.min(4,a.steps.length)} as CSSProperties} className={`${styles.canvas} ${styles.flow}`}>{a.steps.map((s,i)=>{const Glyph=glyphs[s.icon??(i===a.steps.length-1?"check":"file")] ?? FileText;return <li key={s.title} style={{animationDelay:`${(i+1)*80}ms`}} className={`${styles.flowStep} ${styles.itemEnter}`}><div className={styles.flowIcon}><Glyph aria-hidden /></div><strong>{s.title}</strong><p>{s.detail}</p>{i<a.steps.length-1&&<ArrowRight aria-hidden className={styles.flowArrow}/>}</li>;})}</ol>}
    {a.kind==="notes"&&<dl style={{"--note-columns":Math.min(3,a.entries.length)} as CSSProperties} className={a.layout==="handover"?styles.handover:styles.notes}>{a.entries.map((e,i)=>{const Glyph=glyphs[e.tone??"fact"] ?? FileText;return <div key={e.label} style={{animationDelay:`${(i+1)*80}ms`}} className={`${styles.note} ${styles.itemEnter}`} data-tone={e.tone}><dt className={styles.noteHeader}><Glyph aria-hidden /><span>{e.label}</span></dt><dd>{a.layout==="handover"&&<span className={styles.noteLabel}>{e.label}</span>}<p>{e.text}</p></dd></div>;})}</dl>}
    {a.kind==="interface"&&(a.screen.fidelity==="wireframe"?<Wireframe screen={a.screen}/>:<Screen screen={a.screen}/>)}
    {a.kind==="comparison"&&<div className={styles.comparison}>{a.panels.map((p,i)=><div key={p.label} style={{animationDelay:`${(i+1)*80}ms`}} className={`${styles.compact} ${styles.itemEnter}`}><div key="version" className={styles.version}><b>{String.fromCharCode(65+i)}</b>{p.label}</div><Screen key="screen" screen={p.screen}/></div>)}</div>}
    <figcaption className={a.kind==="mixture"?styles.labFoot:"sr-only"}>{a.caption}</figcaption>
  </motion.figure>;
}
