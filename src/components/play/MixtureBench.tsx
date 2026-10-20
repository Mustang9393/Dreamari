"use client";
import {useState} from "react";
import {ArrowRightLeft,RotateCcw} from "lucide-react";
import type {WorkArtifact} from "./work-artifacts";
import styles from "./MixtureBench.module.css";
/** Local arithmetic draft. It cannot resolve a game answer or overwrite the trial record. */
export function MixtureBench({artifact:a}:{artifact:Extract<WorkArtifact,{kind:"mixture"}>}) {
 const [moved,setMoved]=useState(0); const p=a.practice!;
 const ingredients=a.batches[0].ingredients.map(i=>({...i,amount:i.amount+(i.label===p.from?-moved:i.label===p.to?moved:0)}));
 const total=ingredients.reduce((sum,i)=>sum+i.amount,0);
 return <div className={styles.bench}>
  <div className={styles.head}><span>Formulation practice · local draft</span><button type="button" disabled={moved===0} onClick={()=>setMoved(0)}><RotateCcw aria-hidden/>Reset draft</button></div>
  <div className={styles.station}><div className={styles.display}><span>Total mass</span><strong aria-live="polite">{total}<small>{a.unit}</small></strong><span>Fixed batch size</span></div><div className={styles.ingredients} aria-live="polite">{ingredients.map(i=><div key={i.label}><span>{i.label}</span><strong>{i.amount}<small>{a.unit}</small></strong></div>)}</div></div>
  <div className={styles.controls}><p>{p.instruction}</p><button type="button" disabled={moved+p.step>p.max} onClick={()=>setMoved(n=>Math.min(p.max,n+p.step))}><ArrowRightLeft aria-hidden/>Transfer {p.step} {a.unit}</button></div>
  <p className={styles.status} role="status">{moved===0?"Start from A. Try the planned transfer.":`${moved} ${a.unit} moved from ${p.from.toLowerCase()} to ${p.to.toLowerCase()}. Total stays ${total} ${a.unit}.`} <span>Practice only · no score</span></p>
 </div>;
}
