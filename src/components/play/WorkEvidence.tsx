import type { DecisionEvidence } from "./work-artifacts";
import styles from "./WorkEvidence.module.css";

/** Phrasing content is valid inside a button; all fields are accessible text. */
export function DecisionRecord({evidence}:{evidence:DecisionEvidence}) {
 return <span className={styles.record} data-medium={evidence.medium} data-fields={evidence.fields.length}>
  <span className={styles.code}>{evidence.code}</span>
  <span className={styles.fields}>{evidence.fields.map(f=><span className={styles.field} key={f.label}><span>{f.label}</span><strong>{f.value}</strong></span>)}</span>
 </span>;
}
