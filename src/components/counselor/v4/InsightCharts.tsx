"use client";
import { useState } from "react";

/** Ranked counts are multi-select interests: a shared linear scale, never a pie. */
export function InterestPlot({ title, items, sample = 120 }: { title: string; items: { name: string; count: number }[]; sample?: number }) {
  const [selected, setSelected] = useState(0);
  const [all, setAll] = useState(false);
  const item = items[selected];
  const ceiling = Math.ceil(Math.max(...items.map(i=>i.count),1) / 10) * 10;
  return <section className="v4-interest-plot">
    <header><span className="v4-overline">Saved by your students</span><h2>{title}</h2><span className="v4-plot-count">{items.length} interests</span></header>
    <div className="v4-interest-spotlight"><span className="v4-interest-number">{String(selected+1).padStart(2,'0')}</span><div><h3>{item.name}</h3><p><strong>{item.count}</strong> students <span>· {Math.round(item.count/sample*100)}% of sample</span></p></div><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="4"/><circle cx="32" cy="32" r="26" pathLength="100" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${item.count/sample*100} 100`} transform="rotate(-90 32 32)" strokeLinecap="round"/><text x="32" y="36" textAnchor="middle">{Math.round(item.count/sample*100)}%</text></svg></div>
    <div className="v4-dot-axis" aria-hidden="true"><span>Students</span><div><i>0</i><i>{ceiling/2}</i><i>{ceiling}</i></div><span/></div>
    <ol className="v4-interest-rows">{items.slice(0,all ? items.length : 5).map((entry,index)=><li key={entry.name}><button type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span className="v4-dot-name"><small>{String(index+1).padStart(2,'0')}</small>{entry.name}</span><span className="v4-dot-field" aria-hidden="true"><i/><i/><i/><b style={{left:`${entry.count/ceiling*100}%`}}/></span><strong>{entry.count}</strong></button></li>)}</ol>
    {items.length>5 && <button type="button" className="v4-plot-expand" onClick={()=>setAll(!all)}>{all?'Show top five':`Explore all ${items.length}`}<span aria-hidden="true">{all?'−':'+'}</span></button>}
  </section>;
}

/** Mutually exclusive destinations; gaps are SVG strokes, not missing data. */
export function DestinationRing({ items, total, declared, onOpen }: { items: { label: string; count: number }[]; total: number; declared: number; onOpen: () => void }) {
  const arcs = items.map((item,index)=> ({ ...item, index, start: total ? items.slice(0,index).reduce((sum,p)=>sum+p.count,0)/total*100 : 0, share: total ? item.count/total*100 : 0 }));
  return <div className="v4-destination-chart"><button type="button" className="v4-ring-figure" onClick={onOpen} aria-label={`Postsecondary destinations: ${declared} of ${total} declared. Open details`}><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="91" fill="none" stroke="var(--glass-border)" strokeWidth="25"/>{arcs.filter(a=>a.count>0).map(a=><circle key={a.label} cx="120" cy="120" r="91" pathLength="100" fill="none" stroke={`var(--v4-chart-${a.index+1})`} strokeWidth="25" strokeDasharray={`${a.share} ${100-a.share}`} strokeDashoffset={-a.start} transform="rotate(-90 120 120)"/>)}<circle cx="120" cy="120" r="69" fill="none" stroke="var(--glass-border)" strokeDasharray="1 5"/></svg><span><strong>{total ? Math.round(declared/total*100) : 0}<small>%</small></strong><em>declared a path</em><b>{declared} of {total} students</b></span></button><ul>{arcs.map(a=><li key={a.label}><i style={{background:`var(--v4-chart-${a.index+1})`}}/><span>{a.label}</span><strong>{a.count}</strong></li>)}</ul></div>;
}

export function GradeDotPlot({ grades }: { grades: { grade: number; onTrack: number; total: number; avg: number }[] }) {
  return <div className="v4-grade-dotplot"><div className="v4-dot-legend"><span><i/>On track</span><span><i/>Plan completion</span></div><div className="v4-grade-axis" aria-hidden="true"><span/><div><b>0%</b><b>50%</b><b>100%</b></div></div>{grades.map(g=><div key={g.grade} className="v4-grade-dotrow"><span>Grade {g.grade}<small>{g.onTrack} / {g.total} on track</small></span><div aria-hidden="true"><i/><i/><i/><b className="v4-track-dot" style={{left:`${g.onTrack/g.total*100}%`}}/><b className="v4-completion-dot" style={{left:`${g.avg}%`}}/></div><p><strong>{Math.round(g.onTrack/g.total*100)}%</strong><span>{g.avg}%</span></p></div>)}</div>;
}

export function ReadinessArcs({ items }: { items: { value: number; label: string; extra: string }[] }) {
  return <div className="v4-readiness-arcs">{items.map((m,i)=><div key={m.label}><div className="v4-arc"><svg viewBox="0 0 160 96" aria-hidden="true"><path d="M 15 81 A 65 65 0 0 1 145 81" pathLength="100" fill="none" stroke="var(--glass-border)" strokeWidth="8" strokeLinecap="round"/><path d="M 15 81 A 65 65 0 0 1 145 81" pathLength="100" fill="none" stroke={`var(--v4-chart-${i+1})`} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${m.value} 100`}/></svg><strong>{m.value}<small>%</small></strong></div><h3>{m.label}</h3><p>{m.extra}</p></div>)}</div>;
}

export function InterestExplorer({ careers, colleges }: { careers: {name:string;count:number}[]; colleges: {name:string;count:number}[] }) {
  const [mode,setMode] = useState<'careers'|'colleges'>('careers');
  const [selected,setSelected] = useState(0);
  const [all,setAll] = useState(false);
  const items = mode === 'careers' ? careers : colleges;
  const focus=items[selected];
  const max = Math.ceil(Math.max(...items.map(i=>i.count))/10)*10;
  return <section className="v4-interest-explorer">
    <header><div className="v4-interest-mode" role="group" aria-label="Saved interests"><button type="button" aria-pressed={mode==='careers'} onClick={()=>{setMode('careers');setSelected(0);}}>Careers</button><button type="button" aria-pressed={mode==='colleges'} onClick={()=>{setMode('colleges');setSelected(0);}}>Colleges</button></div><span>120-student sample · multiple interests allowed</span></header>
    <div className="v4-interest-explorer-body"><div className="v4-interest-focus"><span className="v4-overline">{selected===0?'Most saved':`Rank ${selected+1}`} / {mode==='careers'?'Career':'College'}</span><h2>{focus.name}</h2><div className="v4-focus-orb"><svg viewBox="0 0 260 190" aria-hidden="true"><defs><linearGradient id="interest-ink"><stop stopColor="var(--v4-chart-5)"/><stop offset="1" stopColor="var(--v4-chart-2)"/></linearGradient></defs><ellipse cx="130" cy="95" rx="116" ry="68" fill="none" stroke="var(--glass-border)" transform="rotate(-24 130 95)"/><circle cx="130" cy="95" r="74" fill="none" stroke="var(--glass-border)" strokeWidth="2"/><circle cx="130" cy="95" r="74" fill="none" stroke="url(#interest-ink)" strokeWidth="11" pathLength="120" strokeDasharray={`${focus.count} 120`} strokeLinecap="round" transform="rotate(-90 130 95)"/><circle cx="130" cy="95" r="62" fill="none" stroke="var(--glass-border)" strokeDasharray="1 4"/></svg><span><strong>{focus.count}</strong><small>students saved it</small></span></div><p>{Math.round(focus.count/120*100)}% of the sample</p></div>
    <div className="v4-interest-ranking"><div className="v4-interest-ranking-title"><span>Most saved {mode}</span><small>Students</small></div><ol>{items.slice(0,all?10:5).map((item,i)=><li key={item.name}><button type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{item.name}</strong><span className="v4-interest-stem" aria-hidden="true"><i style={{width:`${item.count/max*100}%`}}/><b style={{left:`${item.count/max*100}%`}}/></span></div><em>{item.count}</em></button></li>)}</ol><button className="v4-plot-expand" onClick={()=>setAll(!all)}>{all?'Show top five':`Explore all ${items.length}`}<span aria-hidden="true">{all?'−':'+'}</span></button></div></div>
  </section>;
}
