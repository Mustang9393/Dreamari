"use client";
import { useId, useRef, useState } from "react";
import type { WorkArtifact } from "./work-artifacts";
import styles from "./WorkScreen.module.css";

/** A reference console: switching records never submits an answer or invents readings. */
export function WorkScreen({artifact}:{artifact:Extract<WorkArtifact,{kind:"work-screen"}>}) {
 const [selected,setSelected]=useState(0);
 const prefix=useId();
 const buttons=useRef<(HTMLButtonElement|null)[]>([]);
 const tab=artifact.tabs[selected];
 return <div className={styles.console}>
  <div className={styles.bar}><span>WORKSPACE / REFERENCE</span><span>Read only</span></div>
  <div className={styles.tabs} role="tablist" aria-label={artifact.title}>{artifact.tabs.map((t,i)=><button key={t.label} ref={el=>{buttons.current[i]=el;}} type="button" role="tab" id={`${prefix}-tab-${i}`} aria-controls={`${prefix}-panel-${i}`} aria-selected={selected===i} tabIndex={selected===i?0:-1} onClick={()=>setSelected(i)} onKeyDown={e=>{
   let next=i;if(e.key==="ArrowRight")next=(i+1)%artifact.tabs.length;else if(e.key==="ArrowLeft")next=(i+artifact.tabs.length-1)%artifact.tabs.length;else if(e.key==="Home")next=0;else if(e.key==="End")next=artifact.tabs.length-1;else return;e.preventDefault();setSelected(next);buttons.current[next]?.focus();
  }}>{t.label}</button>)}</div>
  {artifact.tabs.map((t,i)=><section key={t.label} role="tabpanel" id={`${prefix}-panel-${i}`} aria-labelledby={`${prefix}-tab-${i}`} hidden={selected!==i} tabIndex={0} className={styles.panel}>
   {selected===i&&<><h4>{tab.heading}</h4><dl>{tab.fields.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl><p>{tab.detail}</p></>}
  </section>)}
 </div>;
}
