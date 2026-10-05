"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, CheckCheck, FileCheck2, MessageCircle, MoveUpRight, Sparkles } from "lucide-react";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS, milestonesForGrade, type MilestoneKey } from "@/lib/counselorRoster";
import { attentionRank, attentionReason } from "./studentAttention";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { Avatar } from "./chips";

const subscribeDate = (notify: () => void) => { const timer = window.setInterval(notify, 60000); return () => window.clearInterval(timer); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", {weekday:"long",month:"long",day:"numeric"}).format(new Date());
const serverDateSnapshot = () => "Today";

const milestones:MilestoneKey[]=["Career Report","Resume","Academic Plan","College List","Financial Aid"];
const intents=["4-Year College","2-Year College","Trade/Technical School","Workforce","Military","Undecided"] as const;
const colors=["var(--v4-chart-1)","var(--v4-chart-2)","var(--v4-chart-3)","var(--v4-chart-4)","var(--v4-chart-5)","var(--v4-chart-6)"];
function Jump({children,onClick}:{children:React.ReactNode;onClick:()=>void}) {return <button className="v4-text-action" onClick={onClick}>{children}<ArrowUpRight size={16}/></button>;}

export function Overview(){
 const router=useRouter();const reviewed=useReviewedRoster();
 const account=useSyncExternalStore(subscribeCounselorAccount,counselorAccountSnapshot,serverCounselorAccountSnapshot);
 const {gradeFilter,setStatusFilter,setPlanFilter}=useCounselorFilters();
 const date = useSyncExternalStore(subscribeDate, dateSnapshot, serverDateSnapshot);
 const roster=useMemo(()=>gradeFilter==="All Grades"?reviewed:reviewed.filter(s=>s.grade===gradeFilter),[reviewed,gradeFilter]);
 const total=roster.length;const onTrack=roster.filter(s=>s.status==="On Track").length;const atRisk=roster.filter(s=>s.status==="At Risk").length;const attention=total-onTrack-atRisk;
 const undecided=roster.filter(s=>s.postsecondaryIntent==="Undecided").length;
 const pending=MILESTONE_KEYS.map(key=>({key,count:roster.filter(s=>s.milestones[key]==="Pending Review").length}));
 const pendingCount=pending.reduce((n,r)=>n+r.count,0);
 const priority=[...roster].filter(s=>s.status!=="On Track").sort(attentionRank).slice(0,5);
 const pathways=[...roster.reduce((m,s)=>m.set(s.careerTrack,(m.get(s.careerTrack)??0)+1),new Map<string,number>())].sort((a,b)=>b[1]-a[1]);
 const pct=(n:number,d=total)=>d?Math.round(n/d*100):0;
 const go=(view:string)=>router.push(`/counselor?view=${view}&v=4`);
 const status=(value:"On Track"|"Needs Attention"|"At Risk")=>{setStatusFilter(value);go("students");};
 const plan=()=>{setPlanFilter("Undecided");go("students");};
 return <div className="v4-daily">
  <section className="v4-welcome">
   <div><span className="v4-overline">{date||"Today"}</span><h1>Welcome back{account.name?`, ${account.name.split(" ")[0]}`:""}<span className="v4-period">.</span></h1><p>{pendingCount?<>You have <button onClick={()=>go("review-queue")}>{pendingCount} submissions to review</button></>:"Your review queue is clear"}{atRisk?<> and <button onClick={()=>status("At Risk")}>{atRisk} students who need support</button>.</>:". Take a moment to explore your students’ progress."}</p></div>
   <button className="v4-primary-action" onClick={()=>go(pendingCount?"review-queue":"students")}>{pendingCount?"Start reviewing":"Open students"}<ArrowUpRight size={18}/></button>
  </section>

  <div className="v4-signal-strip" aria-label="Caseload summary">
   {[{label:"Students in view",value:total,small:gradeFilter==="All Grades"?"Across all grades":`Grade ${gradeFilter}`,action:()=>go("students")},{label:"On track",value:`${pct(onTrack)}%`,small:`${onTrack} students`,action:()=>status("On Track")},{label:"At risk",value:atRisk,small:`${attention} more need attention`,action:()=>status("At Risk")},{label:"Still exploring",value:undecided,small:"No postsecondary plan yet",action:plan}].map((s,i)=><button key={s.label} onClick={s.action} className={`v4-signal v4-signal-${i}`}><span>{s.label}</span><strong>{s.value}</strong><small>{s.small}</small><ArrowUpRight size={16}/></button>)}
  </div>

  <div className="v4-daily-grid">
   <section className="v4-focus-sheet">
    <header className="v4-section-head"><div><h2>Your next conversations</h2></div><span className="v4-pill">{attention+atRisk} need support</span></header>
    <div className="v4-priority-list">{priority.length?priority.map((s,i)=><button key={s.id} onClick={()=>router.push(`/counselor?view=students&studentId=${s.id}&v=4`)}><span className="v4-list-index">{String(i+1).padStart(2,"0")}</span><Avatar name={s.name} size={44} index={s.avatarIndex}/><span className="v4-person"><strong>{s.name}</strong><small>Grade {s.grade} · {attentionReason(s)}</small></span><span className={`v4-status-text ${s.status==="At Risk"?"is-risk":""}`}>{s.status}</span><MoveUpRight size={18}/></button>):<div className="v4-clear-state"><CheckCheck/><h3>Everyone is on track</h3><p>No students need attention in this view.</p></div>}</div>
    <div className="v4-sheet-foot"><span>Prioritized by current milestone status</span><Jump onClick={()=>go("students")}>View students</Jump></div>
   </section>
   <section className="v4-review-island">
    <header className="v4-section-head"><span className="v4-overline">Pending reviews</span><FileCheck2 size={22}/></header>
    <div className="v4-review-number"><strong>{pendingCount}</strong><span>submissions<br/>awaiting your review</span></div>
    <div className="v4-review-stack">{pending.filter(r=>r.count>0).map((r,i)=><button key={r.key} onClick={()=>go("review-queue")}><span className="v4-mini-document" style={{color:colors[i%colors.length]}}><FileCheck2 size={17}/></span><span>{r.key}</span><b>{r.count}</b><ArrowUpRight size={14}/></button>)}{!pendingCount&&<p className="v4-clear-state">All caught up. Every submitted milestone has been reviewed.</p>}</div>
    <button className="v4-island-action" onClick={()=>go("review-queue")}>Open review desk <ArrowRight size={18}/></button>
   </section>
  </div>

  <section className="v4-progress-landscape">
   <header className="v4-section-head"><div><h2>Milestone completion</h2></div><Jump onClick={()=>go("milestones")}>Milestone tracker</Jump></header>
   <div className="v4-landscape-grid">
    <div className="v4-caseload-map"><div className="v4-map-label"><strong>{pct(onTrack)}<span>%</span></strong><p>of your students<br/>are on track</p></div><div className="v4-dot-matrix" role="group" aria-label={`${onTrack} on track, ${attention} need attention, ${atRisk} at risk. Each dot is one student.`}>{[...roster].sort((a,b)=>a.status.localeCompare(b.status)).map(s=><button key={s.id} aria-label={`${s.name}: ${s.status}`} onClick={()=>router.push(`/counselor?view=students&studentId=${s.id}&v=4`)} className={s.status==="On Track"?"is-track":s.status==="At Risk"?"is-risk":"is-attention"}/>)}</div><div className="v4-map-key"><span><i className="is-track"/>On track</span><span><i className="is-attention"/>Attention</span><span><i className="is-risk"/>At risk</span></div><small>One dot = one student · select to open</small></div>
    <div className="v4-milestone-lanes"><div className="v4-lane-heading"><span>Approved milestones</span><span>Share of eligible students</span></div>{milestones.map((key,i)=>{const eligible=roster.filter(s=>milestonesForGrade(s.grade).includes(key));const approved=eligible.filter(s=>s.milestones[key]==="Approved").length;const value=pct(approved,eligible.length);return <button key={key} onClick={()=>go("milestones")} className="v4-lane"><span>{key}</span><div className="v4-lane-track"><span style={{width:`${value}%`,background:colors[i]}}/>{[25,50,75].map(t=><i key={t} style={{left:`${t}%`}}/>)}</div><b>{eligible.length?`${value}%`:"—"}</b><small>{approved} / {eligible.length}</small></button>;})}<div className="v4-lane-axis"><span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span></div></div>
   </div>
  </section>

  <div className="v4-futures-grid">
   <section className="v4-pathways-sheet"><header className="v4-section-head"><div><span className="v4-overline">04 / Interests</span><h2>Career interests</h2></div><Jump onClick={()=>go("insights")}>Explore</Jump></header><div className="v4-ranked-worlds">{pathways.slice(0,5).map(([name,count],i)=><button key={name} onClick={()=>go("insights")}><span className="v4-world-rank">0{i+1}</span><span className="v4-world-bar"><span style={{width:`${pct(count,pathways[0]?.[1]||1)}%`,background:colors[i]}}/><strong>{name}</strong></span><b>{count}</b></button>)}</div><p className="v4-chart-note">Students by career world · bar lengths compare the five leading interests</p></section>
   <section className="v4-destination-sheet"><header className="v4-section-head"><div><h2>Plans after graduation</h2></div><Sparkles size={22}/></header><div className="v4-destination-bar" role="img" aria-label={intents.map(k=>`${k}: ${roster.filter(s=>s.postsecondaryIntent===k).length}`).join(", ")}>{intents.map((k,i)=>{const n=roster.filter(s=>s.postsecondaryIntent===k).length;return n>0?<span key={k} data-tone={i} style={{flex:n,background:colors[i]}}><b>{n}</b></span>:null;})}</div><div className="v4-destination-key">{intents.map((k,i)=><div key={k}><i style={{background:colors[i]}}/><span>{k}</span><b>{roster.filter(s=>s.postsecondaryIntent===k).length}</b></div>)}</div><Jump onClick={plan}><MessageCircle size={15}/>{undecided} students are still deciding</Jump></section>
  </div>
  <p className="v4-data-note">Demo roster · current grade selection · review decisions update these counts. No historical trends are inferred.</p>
 </div>;
}
