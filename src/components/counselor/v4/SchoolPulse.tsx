"use client";

// The school-level charts that used to sit on v4's Today (8 Oct 2026,
// Chandu: "the today tab seems really badly cluttered"; "milestone
// completion and plans after graduation etc belong in insights"). Moved
// whole, every data point kept (Maisha's rule): Milestone Completion leads
// Student Progress; Career Interests and Plans After Graduation lead Career
// & College Insights. Today's On Track and Still Exploring figures open them.

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Users } from "lucide-react";
import { useState } from "react";
import { DrillPanel, type Drill } from "./Drill";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { milestonesForGrade, type MilestoneKey } from "@/lib/counselorRoster";
import { useChartColors } from "./ChartColors";
import { CountUp } from "./overviewShared";
import "./today.css";

const milestones:MilestoneKey[]=["Career Report","Resume","Academic Plan","College List","Financial Aid"];
const intents=["4-Year College","2-Year College","Trade/Technical School","Workforce","Military","Undecided"] as const;
const colors=[1,2,3,4,5,6].map(n=>`var(--v4-cat-${n})`);
const steps=[1,2,3,4,5,6].map(n=>`var(--v4-step-${n})`);
function Jump({children,onClick}:{children:React.ReactNode;onClick:()=>void}) {return <button className="v4-text-action" onClick={onClick}>{children}<ArrowUpRight size={16}/></button>;}

function useScope(){
 const router=useRouter();const reviewed=useReviewedRoster();
 const {gradeFilter,setStatusFilter,setPlanFilter}=useCounselorFilters();
 const roster=useMemo(()=>gradeFilter==="All Grades"?reviewed:reviewed.filter(s=>s.grade===gradeFilter),[reviewed,gradeFilter]);
 const total=roster.length;const onTrack=roster.filter(s=>s.status==="On Track").length;const atRisk=roster.filter(s=>s.status==="At Risk").length;const attention=total-onTrack-atRisk;
 const pct=(n:number,d=total)=>d?Math.round(n/d*100):0;
 const go=(view:string)=>router.push(`/counselor?view=${view}&v=4`);
 const openStudent=(id:string)=>router.push(`/counselor?view=students&studentId=${id}&v=4`);
 return {roster,onTrack,atRisk,attention,pct,go,openStudent,setStatusFilter,setPlanFilter};
}

export function MilestoneCompletion(){
 const {roster,onTrack,atRisk,attention,pct,go,openStudent}=useScope();
 const milestoneColors=useChartColors();
 return <>
  <section className="v4-progress-landscape" {...milestoneColors.attrs}>
   <header className="v4-section-head"><div><h2>Milestone Completion</h2></div><span className="v4-section-tools">{milestoneColors.toggle}<Jump onClick={()=>go("milestones")}>Milestone tracker</Jump></span></header>
   <div className="v4-landscape-grid">
    {/* Status words match the dots (Maisha: "At Risk red, On Track green,
       Needs Attention yellow"); the key spells each status in full. */}
    <div className="v4-caseload-map"><div className="v4-map-label"><strong><CountUp value={pct(onTrack)}/><span>%</span></strong><p>of my students<br/>are on track</p></div><div className="v4-dot-matrix" role="group" aria-label={`${onTrack} on track, ${attention} need attention, ${atRisk} at risk. Each dot is one student.`}>{[...roster].sort((a,b)=>a.status.localeCompare(b.status)).map(s=><button key={s.id} aria-label={`${s.name}: ${s.status}`} onClick={()=>openStudent(s.id)} className={s.status==="On Track"?"is-track":s.status==="At Risk"?"is-risk":"is-attention"}/>)}</div><div className="v4-map-key"><span><i className="is-track"/>On Track</span><span><i className="is-attention"/>Needs Attention</span><span><i className="is-risk"/>At Risk</span></div><small>One dot = one student · select to open</small></div>
    <div className="v4-milestone-lanes"><div className="v4-lane-heading"><span>Approved Milestones</span><span>Share of eligible students</span></div>{milestones.map((key,i)=>{const eligible=roster.filter(s=>milestonesForGrade(s.grade).includes(key)&&s.milestones[key]!=="Not Applicable");const approved=eligible.filter(s=>s.milestones[key]==="Approved").length;const value=pct(approved,eligible.length);return <button key={key} onClick={()=>go("milestones")} className="v4-lane"><span>{key}</span><div className="v4-lane-track"><span style={{width:`${value}%`,background:colors[i]}}/>{[25,50,75].map(t=><i key={t} style={{left:`${t}%`}}/>)}</div><b>{eligible.length?`${value}%`:"n/a"}</b><small>{approved} / {eligible.length}</small></button>;})}<div className="v4-lane-axis"><span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span></div></div>
   </div>
  </section>

 </>;
}

export function FuturesPair(){
 const {roster,pct,go,setPlanFilter}=useScope();
 const interestColors=useChartColors(),planColors=useChartColors();
 const undecided=roster.filter(s=>s.postsecondaryIntent==="Undecided").length;
 const pathways=[...roster.reduce((m,s)=>m.set(s.careerTrack,(m.get(s.careerTrack)??0)+1),new Map<string,number>())].sort((a,b)=>b[1]-a[1]);
 const plan=()=>{setPlanFilter("Undecided");go("students");};
 // a world opens the students behind its count (8 Oct 2026 audit: the rows
 // linked back to the page they sit on)
 const [drill,setDrill]=useState<Drill|null>(null);
 return <>
  <div className="v4-futures-grid">
   <section className="v4-pathways-sheet" {...interestColors.attrs}><header className="v4-section-head"><div><h2>Career Interests</h2></div><span className="v4-section-tools">{interestColors.toggle}<Jump onClick={()=>go("explore")}>Explore</Jump></span></header><div className="v4-ranked-worlds">{pathways.slice(0,5).map(([name,count],i)=><button key={name} onClick={()=>setDrill({title:name,subtitle:`${count} ${count===1?"student":"students"} exploring it`,students:roster.filter(s=>s.careerTrack===name).map(s=>({id:s.id,name:s.name,grade:s.grade,avatarIndex:s.avatarIndex,note:s.status})),studentsLabel:"Students",action:{label:"See its careers in Explore",onClick:()=>{setDrill(null);go("explore");}}})}><span className="v4-world-rank">0{i+1}</span><span className="v4-world-bar"><span style={{width:`${pct(count,pathways[0]?.[1]||1)}%`,background:colors[i]}}/><strong>{name}</strong></span><b>{count}</b></button>)}</div><p className="v4-chart-note">Students by career world · bar lengths compare the five leading interests</p></section>
   <section className="v4-destination-sheet" {...planColors.attrs}><header className="v4-section-head"><div><h2>Plans After Graduation</h2></div>{planColors.toggle}</header><div className="v4-destination-bar" role="img" aria-label={intents.map(k=>`${k}: ${roster.filter(s=>s.postsecondaryIntent===k).length}`).join(", ")}>{intents.map((k,i)=>{const n=roster.filter(s=>s.postsecondaryIntent===k).length;return n>0?<span key={k} style={{flex:n,background:steps[i],color:`var(--v4-step-${i+1}-ink)`}}><b>{n}</b></span>:null;})}</div><div className="v4-destination-key">{intents.map((k,i)=><div key={k}><i style={{background:steps[i]}}/><span>{k}</span><b>{roster.filter(s=>s.postsecondaryIntent===k).length}</b></div>)}</div><Jump onClick={plan}><Users size={15}/>{undecided} students are still deciding</Jump></section>
  </div>

  <DrillPanel drill={drill} onClose={()=>setDrill(null)}/>
 </>;
}
