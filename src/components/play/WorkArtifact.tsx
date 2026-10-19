"use client";

import { useEffect, useId, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2, CircleHelp, FileText, Headphones, Layers2, MapPin, MousePointer2, PanelTop, Play, RotateCcw, Search, TriangleAlert, Wrench } from "lucide-react";
import type { InterfaceSpec, WorkArtifact as Artifact } from "./work-artifacts";
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
function PreviewAction({ label, onClick }: { label: string; onClick?: () => void }) {
  return onClick ? <button type="button" className={styles.previewAction} data-interactive onClick={onClick}>{label}<ArrowRight aria-hidden /></button>
    : <span className={styles.previewAction}>{label}<ArrowUpRight aria-hidden /></span>;
}
function Screen({ screen, onAction }: { screen: InterfaceSpec; onAction?: () => void }) {
  const fieldId = useId();
  const action = <PreviewAction label={screen.action} onClick={onAction} />;
  return <div className={styles.screen}>
    <div className={styles.siteBar}><span className={styles.siteMark}><Layers2 aria-hidden />{screen.siteName ?? "Project preview"}</span>{screen.navigation && <span className={styles.siteNav}>{screen.navigation}</span>}</div>
    {screen.fields.length ? <div className={styles.formLayout}>
      <div className={styles.formSummary}>{screen.illustration === "landscape" && <Landscape />}<h4>{screen.heading}</h4><p className={styles.eventMeta}>{screen.description}</p></div>
      <div className={styles.formBody}><div className={styles.fields}>{screen.fields.map((f,i)=><div key={f.label} className={styles.field}>
        <label htmlFor={`${fieldId}-${i}`}>{f.label} {f.required === "text" ? <span>(required)</span> : <span aria-label="Red required marker" style={{color:"var(--color-feedback-danger-solid)"}}>●</span>}</label>
        <input id={`${fieldId}-${i}`} value={f.value} readOnly tabIndex={-1} aria-invalid={Boolean(f.error)} aria-describedby={f.error ? `${fieldId}-error-${i}` : undefined} />
        {f.error && <p id={`${fieldId}-error-${i}`} className={styles.error}><TriangleAlert aria-hidden />{f.error}</p>}
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
function Prototype({ artifact }: { artifact: Extract<Artifact, {kind:"interface"}> }) {
  const [stage,setStage] = useState<"event"|"form"|"done">("event");
  const [email,setEmail] = useState("");
  const [error,setError] = useState(false);
  const inputId=useId();
  const fieldRef=useRef<HTMLInputElement>(null);
  const reduced=useReducedMotion();
  useEffect(()=>{if(stage === "form") fieldRef.current?.focus();},[stage]);
  const demo=artifact.demo!;
  return <>
    <div className={styles.toolbar}><Play aria-hidden /><span className={styles.title}>{artifact.title}</span><span className={styles.demoStatus}>{stage === "done" ? "3 / 3" : stage === "form" ? "2 / 3" : "1 / 3"}</span><button type="button" className={styles.demoReset} onClick={()=>{setStage("event");setEmail("");setError(false);}}><RotateCcw aria-hidden />Reset demo</button></div>
    <div className={styles.demoProgress} aria-hidden><motion.div initial={false} animate={{scaleX:stage === "event" ? 1/3 : stage === "form" ? 2/3 : 1}} transition={{duration:reduced?0:.25}} /></div>
    <motion.div key={stage} aria-live="polite" initial={reduced?false:{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{duration:.2}} className={styles.demoBody}>
      {stage === "event" ? <Screen screen={artifact.screen} onAction={()=>setStage("form")} /> : stage === "form" ? <form className={styles.screen} noValidate onSubmit={e=>{e.preventDefault();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setError(true);return;}setStage("done");}}>
        <div className={styles.siteBar}><span>{artifact.screen.heading}</span><span className={styles.meta}>Prototype · not submitted</span></div>
        <div className={styles.field}><label htmlFor={inputId}>{demo.fieldLabel} (required)</label><input ref={fieldRef} id={inputId} type="email" autoComplete="off" value={email} placeholder={demo.placeholder} onChange={e=>setEmail(e.target.value)} aria-invalid={error} aria-describedby={error?`${inputId}-error`:undefined} />{error&&<p className={styles.error} id={`${inputId}-error`}><TriangleAlert aria-hidden />{demo.error}</p>}</div>
        <button type="submit" className={styles.previewAction} data-interactive style={{marginTop:10}}>{demo.submitLabel}<ArrowRight aria-hidden /></button>
      </form> : <div className={styles.success}><CheckCircle2 aria-hidden /><h4>{demo.successTitle}</h4><p>{demo.successBody}</p><span className={styles.meta}>Demo complete · no data sent</span></div>}
    </motion.div>
    {artifact.process && <ol className={styles.process} aria-label="Design process">{artifact.process.map((step,i)=><li key={step}><span>{i+1}</span>{step}{i<artifact.process!.length-1&&<ArrowRight aria-hidden/>}</li>)}</ol>}
  </>;
}
/** Data-driven work evidence; visuals are distinct from the game's action controls. */
export function WorkArtifact({ artifact:a }: { artifact: Artifact }) {
  const reduced=useReducedMotion();
  const enter=(i=0)=>({initial:reduced?false:{opacity:0,y:7},animate:{opacity:1,y:0},transition:{duration:.28,delay:reduced?0:i*.08}});
  const isDemo=a.kind === "interface" && Boolean(a.demo);
  const Icon=a.kind==="flow"?MapPin:a.kind==="notes"?FileText:a.kind==="comparison"?Layers2:a.kind==="interface"&&a.screen.fidelity==="wireframe"?Layers2:PanelTop;
  return <motion.figure {...enter()} aria-label={a.title} className={styles.artifact} data-work-artifact={a.id}>
    {!isDemo&&<div className={styles.toolbar}><Icon aria-hidden /><span className={styles.title}>{a.title}</span><span className={styles.meta}>{a.kind==="interface"&&a.screen.fidelity==="wireframe"?"Layout only":a.kind==="notes"?"Project file":"Design preview"}</span></div>}
    {a.kind==="flow"&&<ol className={`${styles.canvas} ${styles.flow}`}>{a.steps.map((s,i)=>{const Glyph=glyphs[s.icon??(i===a.steps.length-1?"check":"file")] ?? FileText;return <li key={s.title} style={{animationDelay:`${(i+1)*80}ms`}} className={`${styles.flowStep} ${styles.itemEnter}`}><div className={styles.flowIcon}><Glyph aria-hidden /></div><strong>{s.title}</strong><p>{s.detail}</p>{i<a.steps.length-1&&<ArrowRight aria-hidden className={styles.flowArrow}/>}</li>;})}</ol>}
    {a.kind==="notes"&&<dl style={{"--note-columns":Math.min(3,a.entries.length)} as CSSProperties} className={a.layout==="handover"?styles.handover:styles.notes}>{a.entries.map((e,i)=>{const Glyph=glyphs[e.tone??"fact"] ?? FileText;return <div key={e.label} style={{animationDelay:`${(i+1)*80}ms`}} className={`${styles.note} ${styles.itemEnter}`} data-tone={e.tone}><dt className={styles.noteHeader}><Glyph aria-hidden /><span>{e.label}</span></dt><dd>{a.layout==="handover"&&<span className={styles.noteLabel}>{e.label}</span>}<p>{e.text}</p></dd></div>;})}</dl>}
    {a.kind==="interface"&&(a.demo?<Prototype key={a.id} artifact={a}/>:a.screen.fidelity==="wireframe"?<Wireframe screen={a.screen}/>:<Screen screen={a.screen}/>)}
    {a.kind==="comparison"&&<div className={styles.comparison}>{a.panels.map((p,i)=><div key={p.label} style={{animationDelay:`${(i+1)*80}ms`}} className={`${styles.compact} ${styles.itemEnter}`}><div key="version" className={styles.version}><b>{String.fromCharCode(65+i)}</b>{p.label}</div><Screen key="screen" screen={p.screen}/></div>)}</div>}
    <figcaption className="sr-only">{a.caption}</figcaption>
  </motion.figure>;
}
