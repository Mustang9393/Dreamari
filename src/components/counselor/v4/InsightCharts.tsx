"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { heroFocus } from "@/components/career/heroFocus";
import "./insights.css";

// The Insights area's "more exciting" layer (Maisha's v4 review, 7 Oct 2026:
// "make the experience more exciting to receive. Draw it a little closer to
// the student experience ... the Explore cards, the games, or other visual
// moments ... without losing the clean, professional, easy-to-process
// experience"). Three small, shared pieces so every Insights screen speaks
// the same way, one moment per region: hero numbers count up, rings draw in
// (`v4-ring-draw` in insights.css), and Dreamy appears only at a real moment
// (an idea, a win, a clear list). All of it stops under reduced motion.

/** A hero number that counts up from zero on arrival, and glides to its new
 *  value when a filter changes it. Screen readers get the final value only. */
export function CountUp({ value, decimals = 0, duration = 900 }: { value: number; decimals?: number; duration?: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(0);
  const current = useRef(shown);
  useEffect(() => {
    const from = current.current;
    if (reduce || from === value) { current.current = value; setShown(value); return; }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const next = from + (value - from) * (1 - (1 - t) ** 3);
      current.current = next;
      setShown(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce, duration]);
  return <><span aria-hidden="true">{shown.toFixed(decimals)}</span><span className="sr-only">{value.toFixed(decimals)}</span></>;
}

export type DreamyMood = "celebrate" | "explore" | "idea" | "nervous" | "problem-solving";
/** Dreamy, the student app's mascot, at a moment that earns it. */
export function Dreamy({ mood, size = 56, className = "" }: { mood: DreamyMood; size?: number; className?: string }) {
  return <Image src={`/images/dreamy-expressions/dreamy-${mood}.webp`} alt="" aria-hidden="true" width={size * 2} height={size * 2} loading="eager" className={`v4-dreamy ${className}`} style={{ width: size, height: size }} />;
}

// The student app's own card art for each top-saved career (6 Oct 2026,
// direct ask: "the career card imagery come in a bit, not too dominant but
// there"). It sits behind the focus card as a faded wash so the counselor
// sees the same world the students saved, while the number stays the hero.
// Colleges have no art here: only one of the ten has a campus photo.
export const CAREER_ART: Record<string, string> = {
  "Investment Banker": "/images/app/poster-investment-banking-v3.webp",
  "Software Engineer": "/images/app/poster-software-engineer.webp",
  "Entrepreneur / Business Owner": "/images/app/poster-entrepreneur.webp",
  "Registered Nurse": "/images/app/poster-registered-nurse.webp",
  "Psychologist": "/images/app/browse/psychologist.webp",
  "Marketing Manager": "/images/app/browse/marketing-manager.webp",
  "Physician / Doctor": "/images/app/browse/family-doctor.webp",
  "Graphic Designer": "/images/app/browse/graphic-designer.webp",
  "Electrician / Skilled Trade": "/images/app/poster-electrician.webp",
  "Teacher / Educator": "/images/app/browse/subject-teacher-or-professor.webp",
};
/** The same posters for the career worlds the recommendations and outreach
 *  list name (7 Oct 2026: career art "where a career or career world is
 *  named, faded like the Career & College focus card"). */
export const WORLD_ART: Record<string, string> = {
  "Business & Finance": "/images/app/poster-investment-banking-v3.webp",
  "Entrepreneurship": "/images/app/poster-entrepreneur.webp",
  "Health & Medicine": "/images/app/poster-registered-nurse.webp",
  "Tech & Engineering": "/images/app/poster-software-engineer.webp",
  "Law, Safety & Justice": "/images/app/poster-lawyer.webp",
};
/** A small, round crop of a poster, for a list row. */
export function ArtThumb({ src, size = 32 }: { src: string; size?: number }) {
  return <span aria-hidden="true" className="v4-art-thumb" style={{ width: size, height: size, backgroundImage: `url(${src})`, backgroundPosition: heroFocus(src)?.desktop ?? "50% 25%" }} />;
}

/** Ranked counts are multi-select interests: a shared linear scale, never a pie. */
export function InterestPlot({ title, items, sample = 120 }: { title: string; items: { name: string; count: number }[]; sample?: number }) {
  const [selected, setSelected] = useState(0);
  const [all, setAll] = useState(false);
  const item = items[selected];
  const ceiling = Math.ceil(Math.max(...items.map(i=>i.count),1) / 10) * 10;
  return <section className="v4-interest-plot">
    <header><span className="v4-overline">Saved by my students</span><h2>{title}</h2><span className="v4-plot-count">{items.length} interests</span></header>
    <div className="v4-interest-spotlight"><span className="v4-interest-number">{String(selected+1).padStart(2,'0')}</span><div><h3>{item.name}</h3><p><strong>{item.count}</strong> students <span>· {Math.round(item.count/sample*100)}% of students</span></p></div><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="4"/><circle cx="32" cy="32" r="26" pathLength="100" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${item.count/sample*100} 100`} transform="rotate(-90 32 32)" strokeLinecap="round"/><text x="32" y="36" textAnchor="middle">{Math.round(item.count/sample*100)}%</text></svg></div>
    <div className="v4-dot-axis" aria-hidden="true"><span>Students</span><div><i>0</i><i>{ceiling/2}</i><i>{ceiling}</i></div><span/></div>
    <ol className="v4-interest-rows">{items.slice(0,all ? items.length : 5).map((entry,index)=><li key={entry.name}><button type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span className="v4-dot-name"><small>{String(index+1).padStart(2,'0')}</small>{entry.name}</span><span className="v4-dot-field" aria-hidden="true"><i/><i/><i/><b style={{left:`${entry.count/ceiling*100}%`}}/></span><strong>{entry.count}</strong></button></li>)}</ol>
    {items.length>5 && <button type="button" className="v4-plot-expand" onClick={()=>setAll(!all)}>{all?'Show top five':`Explore all ${items.length}`}<span aria-hidden="true">{all?'−':'+'}</span></button>}
  </section>;
}

/** Mutually exclusive destinations; gaps are SVG strokes, not missing data. */
export function DestinationRing({ items, total, declared, onOpen }: { items: { label: string; count: number }[]; total: number; declared: number; onOpen: () => void }) {
  const arcs = items.map((item,index)=> ({ ...item, index, start: total ? items.slice(0,index).reduce((sum,p)=>sum+p.count,0)/total*100 : 0, share: total ? item.count/total*100 : 0 }));
  return <div className="v4-destination-chart"><button type="button" className="v4-ring-figure" onClick={onOpen} aria-label={`Postsecondary destinations: ${declared} of ${total} declared. Open details`}><svg viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="91" fill="none" stroke="var(--glass-border)" strokeWidth="25"/>{arcs.filter(a=>a.count>0).map(a=><circle key={a.label} className="v4-ring-draw" cx="120" cy="120" r="91" pathLength="100" fill="none" stroke={`var(--v4-step-${a.index+1})`} strokeWidth="25" strokeDasharray={`${a.share} ${100-a.share}`} strokeDashoffset={-a.start} transform="rotate(-90 120 120)"/>)}<circle cx="120" cy="120" r="69" fill="none" stroke="var(--glass-border)" strokeDasharray="1 5"/></svg><span><strong><CountUp value={total ? Math.round(declared/total*100) : 0}/><small>%</small></strong><em>declared a path</em><b>{declared} of {total} students</b></span></button><ul>{arcs.map(a=><li key={a.label}><i style={{background:`var(--v4-step-${a.index+1})`}}/><span>{a.label}</span><strong>{a.count}</strong></li>)}</ul></div>;
}

// "Progress Grade by Grade": the dot-and-diamond plot, kept and refined (7 Oct
// 2026). Chandu: "I actually liked the chart we had before, it just needed
// more refinement to support the diamond shapes etc. so that it was clearer."
// Maisha's note was that the dot and diamond were "both very similar
// hues/tones of blue", so it took a moment to read. Now: On track is a green
// dot (the same green as Today's On Track dots), Plan completion a blue
// diamond, both larger with a card-coloured ring; a line between them shows
// the gap at a glance; quarter gridlines; and each value is printed in its
// own colour beside its own shape, so nothing has to be decoded.
export function GradeDotPlot({ grades }: { grades: { grade: number; onTrack: number; total: number; avg: number }[] }) {
  const reduce = useReducedMotion();
  return <figure className="v4-dumbbell">
    <figcaption className="v4-dumbbell-legend"><span><i className="is-track"/>On track</span><span><i className="is-plan"/>Plan completion</span></figcaption>
    <div className="v4-dumbbell-axis" aria-hidden="true"><span/><div>{[0,25,50,75,100].map(t=><b key={t} style={{left:`${t}%`}}>{t}%</b>)}</div><span/></div>
    {grades.map((g,i)=>{ const track=Math.round(g.onTrack/g.total*100); const lo=Math.min(track,g.avg), hi=Math.max(track,g.avg); return <div key={g.grade} className="v4-dumbbell-row" role="img" aria-label={`Grade ${g.grade}: ${track}% on track (${g.onTrack} of ${g.total}), ${g.avg}% average plan completion`}>
      <div className="v4-dumbbell-label"><strong>Grade {g.grade}</strong><small>{g.onTrack} / {g.total} on track</small></div>
      <div className="v4-dumbbell-plot" aria-hidden="true">
        {[25,50,75].map(t=><i key={t} className="v4-dumbbell-grid" style={{left:`${t}%`}}/>)}
        <motion.span className="v4-dumbbell-gap" initial={reduce?false:{opacity:0}} animate={{opacity:1}} transition={{duration:.5,delay:reduce?0:.15+.08*i}} style={{left:`${lo}%`,width:`${hi-lo}%`}}/>
        <motion.b className="is-plan" initial={reduce?false:{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:380,damping:22,delay:reduce?0:.25+.08*i}} style={{left:`${g.avg}%`}}/>
        <motion.b className="is-track" initial={reduce?false:{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:380,damping:22,delay:reduce?0:.2+.08*i}} style={{left:`${track}%`}}/>
      </div>
      <div className="v4-dumbbell-values"><span className="is-track"><i/>{track}%</span><span className="is-plan"><i/>{g.avg}%</span></div>
    </div>;})}
  </figure>;
}

export function ReadinessArcs({ items }: { items: { value: number; label: string; extra: string }[] }) {
  return <div className="v4-readiness-arcs">{items.map((m,i)=><div key={m.label}><div className="v4-arc"><svg viewBox="0 0 160 96" aria-hidden="true"><path d="M 15 81 A 65 65 0 0 1 145 81" pathLength="100" fill="none" stroke="var(--glass-border)" strokeWidth="8" strokeLinecap="round"/><path className="v4-ring-draw" d="M 15 81 A 65 65 0 0 1 145 81" pathLength="100" fill="none" stroke={`var(--v4-cat-${i+1})`} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${m.value} 100`}/></svg><strong><CountUp value={m.value}/><small>%</small></strong></div><h3>{m.label}</h3><p>{m.extra}</p></div>)}</div>;
}

export function InterestExplorer({ careers, colleges, careerCards }: { careers: {name:string;count:number}[]; colleges: {name:string;count:number}[]; /** replaces the careers focus and list (ranked posters) */ careerCards?: React.ReactNode }) {
  const [mode,setMode] = useState<'careers'|'colleges'>('careers');
  const [selected,setSelected] = useState(0);
  const [all,setAll] = useState(false);
  const items = mode === 'careers' ? careers : colleges;
  const focus=items[selected];
  const max = Math.ceil(Math.max(...items.map(i=>i.count))/10)*10;
  return <section className="v4-interest-explorer">
    <header><div className="v4-interest-mode" role="group" aria-label="Saved interests"><button type="button" aria-pressed={mode==='careers'} onClick={()=>{setMode('careers');setSelected(0);}}>Careers</button><button type="button" aria-pressed={mode==='colleges'} onClick={()=>{setMode('colleges');setSelected(0);}}>Colleges</button></div><span>Students can save more than one</span></header>
    {mode==='careers'&&careerCards ? careerCards : <div className="v4-interest-explorer-body"><div className="v4-interest-focus">{mode==='careers'&&CAREER_ART[focus.name]&&<span key={focus.name} className="v4-focus-art" aria-hidden="true" style={{backgroundImage:`url(${CAREER_ART[focus.name]})`,backgroundPosition:heroFocus(CAREER_ART[focus.name])?.desktop??"50% 25%"}}/>}<span className="v4-overline">{selected===0?'Most saved':`Rank ${selected+1}`} / {mode==='careers'?'Career':'College'}</span><h2>{focus.name}</h2><div className="v4-focus-orb"><svg viewBox="0 0 260 190" aria-hidden="true"><defs><linearGradient id="interest-ink"><stop stopColor="var(--v4-chart-1)"/><stop offset="1" stopColor="var(--v4-chart-2)"/></linearGradient></defs><ellipse cx="130" cy="95" rx="116" ry="68" fill="none" stroke="var(--glass-border)" transform="rotate(-24 130 95)"/><circle cx="130" cy="95" r="74" fill="none" stroke="var(--glass-border)" strokeWidth="2"/><circle cx="130" cy="95" r="74" fill="none" stroke="url(#interest-ink)" strokeWidth="11" pathLength="120" className="v4-ring-draw v4-ring-morph" strokeDasharray={`${focus.count} 120`} strokeLinecap="round" transform="rotate(-90 130 95)"/><circle cx="130" cy="95" r="62" fill="none" stroke="var(--glass-border)" strokeDasharray="1 4"/></svg><span><strong><CountUp value={focus.count}/></strong><small>students saved it</small></span></div><p>{Math.round(focus.count/120*100)}% of students</p></div>
    <div className="v4-interest-ranking"><div className="v4-interest-ranking-title"><span>Most Saved {mode==='careers'?'Careers':'Colleges'}</span><small>Students</small></div><ol>{items.slice(0,all?10:5).map((item,i)=><li key={item.name}><button type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{String(i+1).padStart(2,'0')}</span>{mode==='careers'&&CAREER_ART[item.name]&&<ArtThumb src={CAREER_ART[item.name]}/>}<div><strong>{item.name}</strong><span className="v4-interest-stem" aria-hidden="true"><i style={{width:`${item.count/max*100}%`}}/><b style={{left:`${item.count/max*100}%`}}/></span></div><em>{item.count}</em></button></li>)}</ol><button className="v4-plot-expand" onClick={()=>setAll(!all)}>{all?'Show top five':`Explore all ${items.length}`}<span aria-hidden="true">{all?'−':'+'}</span></button></div></div>}
  </section>;
}
