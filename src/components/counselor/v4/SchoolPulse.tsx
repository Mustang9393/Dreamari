"use client";

// The school-level charts that used to sit on v4's Today (8 Oct 2026,
// Chandu: "the today tab seems really badly cluttered"; "milestone
// completion and plans after graduation etc belong in insights"). Moved
// whole, every data point kept (Maisha's rule). Milestone Completion is no
// longer placed anywhere (Milestones has its own); FuturesPair leads
// College & Career.
//
// 9 Oct 2026, Maisha's Insights notes: "Keep Plans After Graduation but
// simplify and rename it 'Postsecondary Direction'." It reads the Insights
// filters (insightsScope.tsx), and every segment and key opens the students
// it counts, with their actions. Later the same day her College & Career
// image dropped Top Career Fields from the page ("Let's change order of
// this also. Make it look closer to how explore cards look in a line"), so
// FuturesPair became PostsecondaryDirection, one full-width row.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { milestonesForGrade, type CounselorStudent, type MilestoneKey, type PostsecondaryIntent } from "@/lib/counselorRoster";
import { useChartColors } from "./ChartColors";
import { CountUp } from "./overviewShared";
import { InsightStudentsPanel, type StudentsDrill } from "./InsightStudents";
import { doneBy, useInsightsScope } from "./insightsScope";
import "./today.css";
import "./insights.css";
import "./insights2.css";

const milestones:MilestoneKey[]=["Career Report","Resume","Academic Plan","School List","Financial Aid"];
const colors=[1,2,3,4,5,6].map(n=>`var(--v4-cat-${n})`);
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


const INTENTS: PostsecondaryIntent[] = ["4-Year College", "2-Year College", "Trade/Technical School", "Workforce", "Military", "Undecided"];

/** Postsecondary Direction, one full-width row (9 Oct 2026, Maisha's
 *  College & Career image: the segmented bar and its two-column key span
 *  the page under the poster rows; "Top Career Fields" is not in her image
 *  and left this page). Same key as Readiness's Postsecondary Plan Defined,
 *  so the two pages agree; every segment and key opens its students. */
export function PostsecondaryDirection(){
 const scope=useInsightsScope();
 const {roster,back,scopeLabel,year}=scope;
 const planColors=useChartColors();
 const [drill,setDrill]=useState<StudentsDrill|null>(null);
 const when=back===0?"":` · end of ${year.label}`;
 const sub=(s:string)=>[s,scopeLabel].filter(Boolean).join(" · ")+when;
 const intentOf=(s:CounselorStudent):PostsecondaryIntent=>s.postsecondaryIntent!=="Undecided"&&doneBy(s,"postsecondary",back)?s.postsecondaryIntent:"Undecided";
 const plans=INTENTS.map(k=>({k,list:roster.filter(s=>intentOf(s)===k)}));
 const decided=roster.length-(plans.find(p=>p.k==="Undecided")?.list.length??0);
 const openPlan=(k:PostsecondaryIntent,list:CounselorStudent[])=>setDrill({title:k==="Undecided"?"Still Deciding":k,subtitle:sub(`${list.length} ${list.length===1?"student":"students"}`),students:list.map(s=>({s,note:s.careerTrack}))});
 if(roster.length===0)return null;
 return <>
  <div className="v4-futures-insights v4-cc-direction">
   <section className="v4-destination-sheet" {...planColors.attrs}>
    <header className="v4-section-head"><div><h2>Postsecondary Direction</h2><p className="v4-section-sub">{decided} of {roster.length} have chosen a direction</p></div>{planColors.toggle}</header>
    <div className="v4-destination-bar" role="group" aria-label="Plans after graduation">{plans.map((p,i)=>p.list.length>0?<button key={p.k} type="button" onClick={()=>openPlan(p.k,p.list)} aria-label={`${p.k}: ${p.list.length} students. Show them`} style={{flex:p.list.length,background:`var(--v4-step-${i+1})`,color:`var(--v4-step-${i+1}-ink)`}}><b>{p.list.length}</b></button>:null)}</div>
    <div className="v4-destination-key">{plans.map((p,i)=><button key={p.k} type="button" onClick={()=>openPlan(p.k,p.list)} disabled={!p.list.length}><i style={{background:`var(--v4-step-${i+1})`}}/><span>{p.k==="Undecided"?"Still deciding":p.k}</span><b>{p.list.length}</b></button>)}</div>
   </section>
  </div>
  <InsightStudentsPanel drill={drill} onClose={()=>setDrill(null)}/>
 </>;
}
