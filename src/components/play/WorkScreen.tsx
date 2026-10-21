import type { WorkArtifact } from "./work-artifacts";
import styles from "./WorkScreen.module.css";
/** Supporting evidence is visible at once. Only the game's answer/Continue controls interact. */
export function WorkScreen({artifact}:{artifact:Extract<WorkArtifact,{kind:"work-screen"}>}) {
 return <div className={styles.console}>
  <div className={styles.bar}><span>METHOD REFERENCE</span><span>Read only</span></div>
  <div className={styles.overview}>{artifact.panels.map(t=><section key={t.label}><h4>{t.label}</h4><dl>{t.fields.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></section>)}</div>
 </div>;
}
