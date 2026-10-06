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
import { SparkBar } from "@/components/flow/SparkBar";
import { CountUp, Dreamy } from "./InsightCharts";
import "./insights.css";

type Report = {id:string;label:string;milestone?:MilestoneKey};
export const REPORTS:Report[]=[{id:"career-report",label:"Career Report",milestone:"Career Report"},{id:"academic-plan",label:"Academic Plan",milestone:"Academic Plan"},{id:"resume",label:"Resume",milestone:"Resume"},{id:"college-list",label:"College List",milestone:"College List"},{id:"applications",label:"Applications",milestone:"Applications"},{id:"financial-aid",label:"Financial Aid",milestone:"Financial Aid"},{id:"plans",label:"Plans"},{id:"reviews",label:"Reviews"},{id:"support",label:"Support"}];
const STATES:MilestoneStatus[]=["Approved","Completed","Pending Review","In Progress","Changes Requested","Overdue","Not Started"];
// Status colours that read without a legend (Maisha's v4 review, 7 Oct 2026:
// "Colours should be intuitive: At Risk red, On Track green, Needs Attention
// yellow"). Done is the status green, waiting on me is the brand blue, still
// moving is a lighter step of it, sent back is amber, overdue is red and not
// started is the neutral grey. Each fill keeps its label beside it.
const stateColor:Record<string,string>={Approved:"var(--v4-ok)",Completed:"var(--v4-ok)","Pending Review":"var(--v4-step-1)","In Progress":"var(--v4-step-3)","Changes Requested":"var(--v4-warn)",Overdue:"var(--v4-risk)","Not Started":"var(--v4-step-6)"};
// Categories where an empty list is good news, so the empty state celebrates.
const GOOD_WHEN_EMPTY:Record<string,string>={"Changes Requested":"Nothing is waiting on changes.",Overdue:"No students are overdue.","Not Started":"Every student has started.","Needs Attention":"No students need attention.","At Risk":"No students are at risk.",Undecided:"Every student has a plan."};
const PLANS=["4-Year College","2-Year College","Trade/Technical School","Workforce","Military","Undecided"];
type Bucket={label:string;color:string;students:CounselorStudent[]};

// V4 preserves actual states. Not started is never relabelled overdue;
// workforce/military are never relabelled undecided. Every count drills to its records.
// Returns every category the report has, including empty ones, so the status
// filter can offer all of them (a counselor can check "who is Overdue?" and
// see none); the chart still draws only the categories that have students.
function bucketsFor(report:Report,roster:CounselorStudent[]):Bucket[]{
 // "Completed" is kept only when a student actually has it: it is not one of
 // the six states counselors pick from (Maisha's list), but it is real data.
 if(report.milestone) return STATES.map(label=>({label,color:stateColor[label],students:roster.filter(s=>s.milestones[report.milestone!]===label)})).filter(b=>b.label!=="Completed"||b.students.length);
 // Plans: categories that must be told apart, the step ramp (step 6 is the neutral Undecided).
 if(report.id==="plans")return PLANS.map((label,i)=>({label,color:`var(--v4-step-${i+1})`,students:roster.filter(s=>s.postsecondaryIntent===label)}));
 // Reviews: the same measure side by side, one colour.
 if(report.id==="reviews")return MILESTONE_KEYS.map(label=>({label,color:"var(--v4-cat-1)",students:roster.filter(s=>s.milestones[label]==="Pending Review")})).filter(b=>b.students.length);
 return ["On Track","Needs Attention","At Risk"].map((label,i)=>({label,color:["var(--v4-ok)","var(--v4-warn)","var(--v4-risk)"][i],students:roster.filter(s=>s.status===label)}));
}

/** `reportId` + `embedded`: the Milestones page (MilestonesHub.tsx) picks the
 *  report from its own list and hides this screen's tab row, so the two
 *  never stack. */
export function StudentProgress({reportId:controlled,embedded=false}:{reportId?:string;embedded?:boolean}={}){
 const router=useRouter();
 const [ownReportId,setReportId]=useState(REPORTS[0].id);
 const reportId=controlled??ownReportId;
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
 // `categories` feeds the status filter (every category); `buckets` feeds the
 // chart (only categories with students, as before). Both read and write the
 // one `chosen` state, so a bar and the filter can never disagree.
 const categories=bucketsFor(report,eligible);
 const buckets=categories.filter(b=>b.students.length>0||report.id==="plans"||report.id==="support");
 const defaultBucket=report.id==="support"?buckets.find(b=>b.label==="At Risk"&&b.students.length>0):undefined;
 const selected=categories.find(b=>b.label===chosen)??defaultBucket??buckets.find(b=>b.students.length>0)??buckets[0];
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
  const a=document.createElement("a");a.href=url;a.download=`${report.id}-progress.csv`;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <div className="v4-page v4-progress">
  {!embedded&&<Segmented ariaLabel="Report" value={reportId} onChange={id=>{setReportId(id);setChosen(null);setShowAll(false);}} options={REPORTS.map(r=>({key:r.id,label:r.label}))}/>}
  <div className="v4-report-toolbar">
   <div className="v4-report-filters"><Listbox ariaLabel="Career pathway" value={pathway} onChange={v=>{setPathway(v);setShowAll(false);}} options={["All pathways",...CAREER_TRACKS].map(p=>({value:p,label:p}))}/>{showCounselor&&<Listbox ariaLabel="Counselor" value={counselorFilter} onChange={setCounselorFilter} options={[{value:"All",label:"All counselors"},...SCHOOL_COUNSELORS.map(c=>({value:c.id,label:c.name}))]}/>}</div>
   <div className="v4-report-exports"><button className="v4-tool-button" onClick={exportCsv}><Download size={15}/>Export CSV</button><button className="v4-tool-button" onClick={()=>window.print()}><FileDown size={15}/>Print / PDF</button></div>
  </div>
  <section className="v4-report-canvas v4-surface">
   <div className="v4-report-explainer"><span className="v4-overline">{report.id==="reviews"?"Awaiting a decision":report.id==="support"?"Caseload health":report.id==="plans"?"After graduation":"Milestone progress"}</span><h2>{report.label}</h2><div className="v4-report-hero-number">{report.id==="reviews"||report.id==="support"?<CountUp value={done}/>:eligible.length?<><CountUp value={percentage}/>%</>:"n/a"}</div>{(report.milestone||report.id==="plans")&&eligible.length>0&&<SparkBar key={report.id} className="v4-progress-spark" percent={percentage} fill={report.milestone?"var(--v4-ok)":"var(--v4-step-1)"} glow={report.milestone?"var(--v4-ok)":"var(--v4-step-1)"} height={6} track="var(--inset-bg)"/>}<p>{report.milestone?(eligible.length?`${done} of ${eligible.length} eligible students have completed this milestone.`:"No eligible students in this selection."):report.id==="plans"?`${done} of ${eligible.length} students have a declared plan.`:report.id==="reviews"?`Submissions pending review across ${new Set(buckets.flatMap(b=>b.students.map(s=>s.id))).size} students. A student may have more than one submission.`:`Students marked Needs Attention or At Risk, out of ${eligible.length} in view.`}</p>{report.milestone&&roster.length!==eligible.length&&<small>{roster.length-eligible.length} students outside this milestone’s grade requirements are excluded.</small>}{buckets.length>0&&<span className="v4-chart-instruction">Select a bar, or filter by status below <ArrowUpRight size={14}/></span>}</div>
   <div className="v4-report-bars" aria-label={`${report.label} breakdown`}>{buckets.length?buckets.map(b=><button key={b.label} className="v4-report-bar" aria-pressed={selected?.label===b.label} onClick={()=>{setChosen(b.label);setShowAll(false);}}><span className="v4-report-bar-label">{b.label}</span><span className="v4-report-bar-track"><span style={{width:`${b.students.length/niceMax*100}%`,background:b.color}}/>{[.25,.5,.75].map(n=><i key={n} style={{left:`${n*100}%`}}/>)}</span><strong>{b.students.length}</strong><ArrowUpRight size={14}/></button>):report.id==="reviews"?<div className="v4-progress-empty"><Dreamy mood="celebrate" size={64}/><p><strong>My review queue is clear.</strong><span>Every submission has a decision.</span></p></div>:<p className="v4-report-empty">No eligible students match the current filters.</p>}{buckets.length>0&&<><div className="v4-report-scale">{[0,.25,.5,.75,1].map(n=><span key={n}>{n*niceMax}</span>)}</div><small className="v4-report-unit">{report.id==="reviews"?"Pending submissions":"Students"}</small></>}</div>
  </section>
  {/* The status filter (Maisha's v4 review, 7 Oct 2026: "under the chart
     where the list of Approved students is, add a FILTER so counselors can
     pick Approved, Pending, In Progress, Changes Requested, Overdue, Not
     Started, and the same on every report"). One Listbox, not a second tab
     row under the report tabs (no stacked tabs). It lists every category of
     the report in view, with its count and colour, and shares the chart's
     selection: picking a bar sets the filter, picking a filter lights the bar. */}
  <section className="v4-report-students">
   <header><div><span className="v4-overline">Students behind the number</span><h2>{selected?.label??(report.id==="reviews"?"No Pending Reviews":"No Students in View")}<span>{students.length}</span></h2></div>
    <div className="v4-status-filter">{categories.length>0&&<Listbox ariaLabel={`Filter ${report.label} students by ${report.id==="plans"?"plan":report.id==="reviews"?"milestone":"status"}`} value={selected?.label??""} onChange={v=>{setChosen(v);setShowAll(false);}} options={categories.map(b=>({value:b.label,label:<span className="v4-status-option"><i style={{background:b.color}}/>{b.label}<b>{b.students.length}</b></span>}))}/>}
    {students.length>0&&<button className="v4-inline-link" onClick={()=>router.push(`/counselor?view=connect&compose=1&ids=${students.map(s=>s.id).join(",")}&v=4`)}><Users size={15}/>Message this group<ArrowUpRight size={15}/></button>}</div></header>
   {students.length?<div className="v4-report-person-grid">{(showAll?students:students.slice(0,6)).map(s=><button key={s.id} onClick={()=>router.push(`/counselor?view=students&studentId=${s.id}&v=4`)}><Avatar name={s.name} index={s.avatarIndex} size={40}/><span><strong>{s.name}</strong><small>Grade {s.grade} · {s.careerTrack}</small></span><StatusChip status={s.status}/><ArrowUpRight size={14}/></button>)}</div>
    // An empty category is often good news (nobody Overdue): Dreamy
    // celebrates it instead of a flat "no results" line.
    :<div className="v4-progress-empty">{selected&&GOOD_WHEN_EMPTY[selected.label]?<><Dreamy mood="celebrate" size={64}/><p><strong>{GOOD_WHEN_EMPTY[selected.label]}</strong><span>{report.label} · current filters</span></p></>:<><Dreamy mood="explore" size={64}/><p><strong>No students in this category yet.</strong><span>Try another status or clear the pathway filter.</span></p></>}</div>}
   {students.length>6&&<button className="v4-show-all" onClick={()=>setShowAll(!showAll)}>{showAll?"Show fewer students":`View all ${students.length} students`}<ChevronDown size={14}/></button>}
  </section>
  <section className="v4-grade-comparison"><button className="v4-grade-disclosure" aria-expanded={compare} onClick={()=>setCompare(!compare)}><span>Compare grades <small>{report.label}</small></span><ChevronDown size={18} style={{transform:compare?"rotate(180deg)":undefined}}/></button>{compare&&<div className="dm-scroll overflow-x-auto"><table><caption className="sr-only">{report.label} counts by grade, using the same filters as the chart</caption><thead><tr><th>Category</th>{grades.map(g=><th key={g}>Grade {g}</th>)}<th>Total</th></tr></thead><tbody>{buckets.map(b=><tr key={b.label}><th scope="row">{b.label}</th>{grades.map(g=><td key={g}>{b.students.filter(s=>s.grade===g).length}</td>)}<td>{b.students.length}</td></tr>)}</tbody></table></div>}</section>
 </div>;
}
