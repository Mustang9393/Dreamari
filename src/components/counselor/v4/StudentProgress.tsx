"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Download, FileDown, Users, ChevronDown } from "lucide-react";
import { useCounselorFilters } from "../shell";
import { SCHOOL_COUNSELORS, counselorFor } from "@/lib/counselorOrg";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { CAREER_TRACKS, MILESTONE_KEYS, milestonesForGrade, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { Listbox } from "./Listbox";
import { Segmented } from "./viz";
import { Avatar, StatusChip } from "./chips";

type Report = {id:string;label:string;milestone?:MilestoneKey};
const REPORTS:Report[]=[{id:"career-report",label:"Career Report",milestone:"Career Report"},{id:"academic-plan",label:"Academic Plan",milestone:"Academic Plan"},{id:"resume",label:"Resume",milestone:"Resume"},{id:"college-list",label:"College List",milestone:"College List"},{id:"applications",label:"Applications",milestone:"Applications"},{id:"financial-aid",label:"Financial Aid",milestone:"Financial Aid"},{id:"plans",label:"Plans"},{id:"reviews",label:"Reviews"},{id:"support",label:"Support"}];
const STATES:MilestoneStatus[]=["Approved","Completed","Pending Review","In Progress","Changes Requested","Overdue","Not Started"];
const stateColor:Record<string,string>={Approved:"var(--v4-chart-1)",Completed:"var(--v4-chart-1)","Pending Review":"var(--v4-chart-2)","In Progress":"var(--v4-chart-3)","Changes Requested":"var(--destructive)",Overdue:"var(--destructive)","Not Started":"var(--v4-chart-6)"};
const PLANS=["4-Year College","2-Year College","Trade/Technical School","Workforce","Military","Undecided"];
type Bucket={label:string;color:string;students:CounselorStudent[]};

// V4 preserves actual states. Not started is never relabelled overdue;
// workforce/military are never relabelled undecided. Every count drills to its records.
function bucketsFor(report:Report,roster:CounselorStudent[]):Bucket[]{
 if(report.milestone) return STATES.map(label=>({label,color:stateColor[label],students:roster.filter(s=>s.milestones[report.milestone!]===label)})).filter(b=>b.students.length);
 if(report.id==="plans")return PLANS.map((label,i)=>({label,color:`var(--v4-chart-${i+1})`,students:roster.filter(s=>s.postsecondaryIntent===label)}));
 if(report.id==="reviews")return MILESTONE_KEYS.map(label=>({label,color:"var(--v4-chart-2)",students:roster.filter(s=>s.milestones[label]==="Pending Review")})).filter(b=>b.students.length);
 return ["On Track","Needs Attention","At Risk"].map((label,i)=>({label,color:["var(--v4-chart-1)","var(--v4-chart-3)","var(--destructive)"][i],students:roster.filter(s=>s.status===label)}));
}

export function StudentProgress(){
 const router=useRouter();
 const [reportId,setReportId]=useState(REPORTS[0].id);
 const [pathway,setPathway]=useState("All pathways");
 const [chosen,setChosen]=useState<string|null>(null);
 const [compare,setCompare]=useState(false);
 const [showAll,setShowAll]=useState(false);
 const {gradeFilter,counselorFilter,setCounselorFilter}=useCounselorFilters();
 const account=useSyncExternalStore(subscribeCounselorAccount,counselorAccountSnapshot,serverCounselorAccountSnapshot);
 const showCounselor=account.role==="Lead Counselor";
 const fullRoster=useReviewedRoster();
 const report=REPORTS.find(r=>r.id===reportId)!;
 const roster=useMemo(()=>fullRoster.filter(s=>(gradeFilter==="All Grades"||s.grade===gradeFilter)&&(pathway==="All pathways"||s.careerTrack===pathway)&&(!showCounselor||counselorFilter==="All"||counselorFor(s).id===counselorFilter)),[fullRoster,gradeFilter,pathway,showCounselor,counselorFilter]);
 const eligible=report.milestone?roster.filter(s=>milestonesForGrade(s.grade).includes(report.milestone!)&&s.milestones[report.milestone!]!=="Not Applicable"):roster;
 const buckets=bucketsFor(report,eligible);
 const selected=buckets.find(b=>b.label===chosen)??buckets.find(b=>b.students.length>0)??buckets[0];
 const done=report.milestone?eligible.filter(s=>["Approved","Completed"].includes(s.milestones[report.milestone!])).length:report.id==="plans"?eligible.filter(s=>s.postsecondaryIntent!=="Undecided").length:report.id==="reviews"?buckets.reduce((sum,b)=>sum+b.students.length,0):eligible.filter(s=>s.status!=="On Track").length;
 const percentage=eligible.length?Math.round(done/eligible.length*100):0;
 const grades=[9,10,11,12].filter(g=>eligible.some(s=>s.grade===g));
 const max=Math.max(1,...buckets.map(b=>b.students.length));
 const tickStep=[1,2,5,10,15,20,25,30,50,100,250,500].find(step=>step*4>=max)??Math.ceil(max/400)*100;
 const niceMax=tickStep*4;
 const students=selected?.students??[];
 const exportCsv=()=>{
  const rows=[[report.label,"Students",...grades.map(g=>`Grade ${g}`)],...buckets.map(b=>[b.label,String(b.students.length),...grades.map(g=>String(b.students.filter(s=>s.grade===g).length))])];
  const url=URL.createObjectURL(new Blob([rows.map(row=>row.map(v=>`"${v.replaceAll('"','""')}"`).join(",")).join("\n")],{type:"text/csv;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download=`${report.id}-progress.csv`;a.click();URL.revokeObjectURL(url);
 };
 return <div className="v4-page v4-progress">
  <Segmented ariaLabel="Report" value={reportId} onChange={id=>{setReportId(id);setChosen(null);setShowAll(false);}} options={REPORTS.map(r=>({key:r.id,label:r.label}))}/>
  <div className="v4-report-toolbar">
   <div className="v4-report-filters"><Listbox ariaLabel="Career pathway" value={pathway} onChange={v=>{setPathway(v);setShowAll(false);}} options={["All pathways",...CAREER_TRACKS].map(p=>({value:p,label:p}))}/>{showCounselor&&<Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{value:"All",label:"All counselors"},...SCHOOL_COUNSELORS.map(c=>({value:c.id,label:c.name}))]}/>}</div>
   <div className="v4-report-exports"><button className="v4-tool-button" onClick={exportCsv}><Download size={15}/>Export CSV</button><button className="v4-tool-button" onClick={()=>window.print()}><FileDown size={15}/>Print / PDF</button></div>
  </div>
  <section className="v4-report-canvas v4-surface">
   <div className="v4-report-explainer"><span className="v4-overline">{report.id==="reviews"?"Awaiting a decision":report.id==="support"?"Caseload health":report.id==="plans"?"After graduation":"Milestone progress"}</span><h2>{report.label}</h2><div className="v4-report-hero-number">{report.id==="reviews"||report.id==="support"?done:eligible.length?`${percentage}%`:"—"}</div><p>{report.milestone?`${done} of ${eligible.length} eligible students have completed this milestone.`:report.id==="plans"?`${done} of ${eligible.length} students have a declared plan.`:report.id==="reviews"?`Submissions pending review across ${new Set(buckets.flatMap(b=>b.students.map(s=>s.id))).size} students. A student may have more than one submission.`:`Students marked Needs Attention or At Risk, out of ${eligible.length} in view.`}</p>{report.milestone&&roster.length!==eligible.length&&<small>{roster.length-eligible.length} students outside this milestone’s grade requirements are excluded.</small>}{buckets.length>0&&<span className="v4-chart-instruction">Select a bar to see the students below <ArrowUpRight size={14}/></span>}</div>
   <div className="v4-report-bars" aria-label={`${report.label} breakdown`}>{buckets.length?buckets.map(b=><button key={b.label} className="v4-report-bar" aria-pressed={selected?.label===b.label} onClick={()=>{setChosen(b.label);setShowAll(false);}}><span className="v4-report-bar-label">{b.label}</span><span className="v4-report-bar-track"><span style={{width:`${b.students.length/niceMax*100}%`,background:b.color}}/>{[.25,.5,.75].map(n=><i key={n} style={{left:`${n*100}%`}}/>)}</span><strong>{b.students.length}</strong><ArrowUpRight size={14}/></button>):<p className="v4-report-empty">{report.id==="reviews"?"Your review queue is clear.":"No eligible students match the current filters."}</p>}{buckets.length>0&&<><div className="v4-report-scale">{[0,.25,.5,.75,1].map(n=><span key={n}>{n*niceMax}</span>)}</div><small className="v4-report-unit">{report.id==="reviews"?"Pending submissions":"Students"}</small></>}</div>
  </section>
  <section className="v4-report-students">
   <header><div><span className="v4-overline">Students behind the number</span><h2>{selected?.label??(report.id==="reviews"?"No pending reviews":"No students in view")}<span>{students.length}</span></h2></div>{students.length>0&&<button className="v4-inline-link" onClick={()=>router.push(`/counselor?view=connect&compose=1&ids=${students.map(s=>s.id).join(",")}&v=4`)}><Users size={15}/>Message this group<ArrowUpRight size={15}/></button>}</header>
   {students.length?<div className="v4-report-person-grid">{(showAll?students:students.slice(0,6)).map(s=><button key={s.id} onClick={()=>router.push(`/counselor?view=students&studentId=${s.id}&v=4`)}><Avatar name={s.name} index={s.avatarIndex} size={40}/><span><strong>{s.name}</strong><small>Grade {s.grade} · {s.careerTrack}</small></span><StatusChip status={s.status}/><ArrowUpRight size={14}/></button>)}</div>:<p className="v4-report-empty">No students in this category for the current filters.</p>}
   {students.length>6&&<button className="v4-show-all" onClick={()=>setShowAll(!showAll)}>{showAll?"Show fewer students":`View all ${students.length} students`}<ChevronDown size={14}/></button>}
  </section>
  <section className="v4-grade-comparison"><button className="v4-grade-disclosure" aria-expanded={compare} onClick={()=>setCompare(!compare)}><span>Compare grades <small>{report.label}</small></span><ChevronDown size={18} style={{transform:compare?"rotate(180deg)":undefined}}/></button>{compare&&<div className="dm-scroll overflow-x-auto"><table><caption className="sr-only">{report.label} counts by grade, using the same filters as the chart</caption><thead><tr><th>Category</th>{grades.map(g=><th key={g}>Grade {g}</th>)}<th>Total</th></tr></thead><tbody>{buckets.map(b=><tr key={b.label}><th scope="row">{b.label}</th>{grades.map(g=><td key={g}>{b.students.filter(s=>s.grade===g).length}</td>)}<td>{b.students.length}</td></tr>)}</tbody></table></div>}</section>
 </div>;
}
