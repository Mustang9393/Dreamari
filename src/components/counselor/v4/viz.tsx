"use client";
import type { ComponentProps } from "react";
import { BarChart as SharedBarChart } from "@/components/connect/viz";
export * from "@/components/connect/viz";

/** Horizontal, labelled comparison tracks. Values remain visible and the
 *  shared scale starts at zero; color is supplemented by labels and counts. */
export function BarChart({groups,series,max=100,valueSuffix="%",barColors,targetLine}:ComponentProps<typeof SharedBarChart>){
 const ceiling=Math.max(max,...series.flatMap(s=>s.values),1);
 return <figure className="v4-comparison-chart" aria-label={`Comparison by ${groups.join(", ")}`}>
  <div className="v4-comparison-rows">{groups.map((group,i)=><div className="v4-comparison-row" key={`${group}-${i}`}><span className="v4-comparison-label">{group}</span><div className="v4-comparison-series">{series.map((s,j)=><div key={s.label} className="v4-comparison-track" aria-label={`${group}, ${s.label}: ${s.values[i]??0}${valueSuffix}`}><span style={{width:`${Math.max(0,(s.values[i]??0)/ceiling*100)}%`,background:barColors?.[i]??`var(--v4-chart-${j%5+1})`}}/><b>{s.values[i]??0}{valueSuffix}</b>{targetLine&&<i aria-label={targetLine.label} style={{left:`${Math.min(100,targetLine.value/ceiling*100)}%`}}/>}</div>)}</div></div>)}</div>
  <div className="v4-comparison-axis">{[0,.25,.5,.75,1].map(p=><span key={p}>{Math.round(ceiling*p)}{valueSuffix}</span>)}</div>
  {(series.length>1||targetLine)&&<figcaption>{series.map((s,j)=><span key={s.label}><i style={{background:`var(--v4-chart-${j%5+1})`}}/>{s.label}</span>)}{targetLine&&<span>│ {targetLine.label}: {targetLine.value}{valueSuffix}</span>}</figcaption>}
 </figure>;
}
