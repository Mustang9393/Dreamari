import { Check, Headphones, Mail, MoreHorizontal, Pause, Play } from "lucide-react";
import type { WorkArtifact } from "./work-artifacts";
import styles from "./SceneVignette.module.css";
type Context = Extract<WorkArtifact,{kind:"scene-context"}>;
/** Illustrative workplace atmosphere. No answer data, focus targets or extra tasks. */
export function SceneVignette({artifact:a}:{artifact:Context}) {
 return <figure className={styles.shell} data-work-artifact={a.id} data-readonly="true" data-support-only="true" role="img" aria-label={a.caption}>
  {a.view==="music-ui"&&<div className={styles.music} data-scene-state={a.state??"clear"}>
   <div className={styles.brand}><Headphones aria-hidden/><b>AMPLIFY</b><small>{a.state==="buried"?"CURRENT":"REVISED"}</small></div>
   <div className={styles.track}><div className={styles.cover}><span/><span/></div><div className={styles.musicDetails}>
    <div className={styles.titleAction}><strong>Afterglow</strong>{a.state!=="buried"&&<span className={styles.clearSave}>Save set</span>}</div>
    {a.state==="buried"&&<><div className={styles.longDescription} aria-label="Long description above Save"><i/><i/><i/><i/></div><span className={styles.buriedSave}>Save set</span></>}
   </div></div>
   <div className={styles.player}><Play aria-hidden/><div className={styles.progress}><span/></div><div className={styles.bars} aria-hidden>{[1,2,3,4,5].map(n=><i key={n} style={{animationDelay:`${n*80}ms`}}/>)}</div><MoreHorizontal aria-hidden/></div>
  </div>}
  {a.view==="wireframe"&&<div className={styles.wire}><div className={styles.brand}><span className={styles.pencilTitle}>Wireframe</span><MoreHorizontal aria-hidden/></div><div className={styles.track}><div className={styles.wireImage}>×</div><div className={styles.skeleton}><i/><i/><i/></div><span className={styles.wireAction}>Save</span></div><div className={styles.wireFoot}><Play aria-hidden/><span/><Pause aria-hidden/></div></div>}
  {a.view==="message"&&<div className={styles.message}><Mail aria-hidden/><div><small>{a.from}</small><p>{a.line}</p></div><span className={styles.messageDot}/></div>}
  {a.view==="batch-note"&&<div className={styles.note}><div className={styles.noteTop}><span>LUMA · R&amp;D</span><span className={styles.tag}>TRIAL</span></div><strong>Strawberry blend</strong><div className={styles.noteLine}/><div className={styles.noteLine}/><small><Check aria-hidden/> Small batch prepared</small></div>}
  {a.view==="sample-codes"&&<div className={styles.codes}>{(a.state==='named'?['Recipe A','Recipe B']:['318','742']).map((code,i)=><div key={code}><small>LUMA / SAMPLE</small><strong>{code}</strong><div className={styles.barcode} aria-hidden/ ><span>{i===0?'A':'B'}</span></div>)}</div>}
 </figure>;
}
