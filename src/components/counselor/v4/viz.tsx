"use client";
import { Info } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
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


/** Arrow, Home and End move between tabs and select as they go (one handler
 *  for the pill SubTabs and the underline Segmented). */
export function tabKeyDown<K extends string>(e: React.KeyboardEvent<HTMLButtonElement>, i: number, options: { key: K }[], onChange: (key: K) => void) {
 let next = i;
 if (e.key === "ArrowRight") next = (i + 1) % options.length;
 else if (e.key === "ArrowLeft") next = (i - 1 + options.length) % options.length;
 else if (e.key === "Home") next = 0;
 else if (e.key === "End") next = options.length - 1;
 else return;
 e.preventDefault();
 onChange(options[next].key);
 (e.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();
}

/** Level 4 of v4's tab hierarchy: a switch inside one card (it changes that
 *  card's content, not the page). Quiet compact text with one underline,
 *  visibly smaller than the shell's page nav so it reads as part of the card.
 *  A page view switch is `SubTabs` (the pill), never this. Counts print as
 *  "Label (4)", the same format the pill uses. */
export function Segmented<K extends string>({options,value,onChange,ariaLabel,grow=false}:{options:{key:K;label:string;count?:number}[];value:K;onChange:(key:K)=>void;ariaLabel:string;grow?:boolean}) {
 return <div role="tablist" aria-label={ariaLabel} className={`v4-tabs ${grow?"v4-tabs-grow":""}`}>{options.map((o,i)=><button key={o.key} type="button" role="tab" aria-selected={o.key===value} tabIndex={o.key===value?0:-1} onClick={()=>onChange(o.key)} onKeyDown={e=>tabKeyDown(e,i,options,onChange)}><span>{o.label}</span>{o.count!==undefined&&<small>({o.count})</small>}</button>)}</div>;
}

export function MetricTile({icon:Icon,value,label,delta,description}:ComponentProps<typeof import("@/components/connect/viz").MetricTile>&{description?:string}){return <div className="v4-metric-detail"><span className="v4-metric-label"><Icon className="size-4" aria-hidden/>{label}{description&&<IconTip label={description}><button type="button" aria-label={`About ${label}`} className="v4-metric-help"><Info size={13}/></button></IconTip>}</span><strong>{value}</strong>{typeof delta==="number"&&<small>{delta>0?"+":""}{delta}% from prior period</small>}</div>;}
