"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, CalendarPlus, Clock, FileCheck2, UserRound } from "lucide-react";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS } from "@/lib/counselorRoster";
import { attentionRank, attentionReason } from "./studentAttention";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { Avatar } from "./chips";
import { CountUp, DreamyMoment } from "./overviewShared";
import { IconTip } from "@/components/app/IconTip";
import { openLog } from "../v5/LogSheet";
import { CoverageBanner } from "../v5/Coverage";
import { Coverflow } from "../v5/Coverflow";
import { MostWatched } from "../v5/Videos";
import { openCareer } from "../v5/ExploreSheets";
import { schoolSnapshot, toV5 } from "@/lib/counselorV5";
import { useTodayFilters } from "./Workspace";
import "./today.css";

const subscribeDate = (notify: () => void) => { const timer = window.setInterval(notify, 60000); return () => window.clearInterval(timer); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", {weekday:"long",month:"long",day:"numeric"}).format(new Date());
const serverDateSnapshot = () => "Today";

function Jump({children,onClick}:{children:React.ReactNode;onClick:()=>void}) {return <button className="v4-text-action" onClick={onClick}>{children}<ArrowUpRight size={16}/></button>;}


export function Overview(){
 const router=useRouter();const reviewed=useReviewedRoster();
 const filters=useTodayFilters();
 const account=useSyncExternalStore(subscribeCounselorAccount,counselorAccountSnapshot,serverCounselorAccountSnapshot);
 const {gradeFilter,setStatusFilter}=useCounselorFilters();
 const date = useSyncExternalStore(subscribeDate, dateSnapshot, serverDateSnapshot);
 const roster=useMemo(()=>gradeFilter==="All Grades"?reviewed:reviewed.filter(s=>s.grade===gradeFilter),[reviewed,gradeFilter]);
 const total=roster.length;const onTrack=roster.filter(s=>s.status==="On Track").length;const atRisk=roster.filter(s=>s.status==="At Risk").length;const attention=total-onTrack-atRisk;
 const undecided=roster.filter(s=>s.postsecondaryIntent==="Undecided").length;
 const pending=MILESTONE_KEYS.map(key=>({key,count:roster.filter(s=>s.milestones[key]==="Pending Review").length}));
 const pendingCount=pending.reduce((n,r)=>n+r.count,0);

 const saved=useMemo(()=>schoolSnapshot(roster.map(toV5)).topSaved.slice(0,10),[roster]);
 const priority=[...roster].filter(s=>s.status!=="On Track").sort(attentionRank).slice(0,5);
 const pct=(n:number,d=total)=>d?Math.round(n/d*100):0;
 const go=(view:string)=>router.push(`/counselor?view=${view}&v=4`);
 const openStudent=(id:string)=>router.push(`/counselor?view=students&studentId=${id}&v=4`);
 const status=(value:"On Track"|"Needs Attention"|"At Risk")=>{setStatusFilter(value);go("students");};
 // Title Case labels; the numbers roll up on arrival like the student app's
 // XP count (Maisha, 7 Oct 2026: "the extra kick of excitement").
 const signals:{label:string;value:number;suffix?:string;small:string;action:()=>void}[]=[
  {label:"Students in View",value:total,small:gradeFilter==="All Grades"?"Across all grades":`Grade ${gradeFilter}`,action:()=>go("students")},
  {label:"On Track",value:pct(onTrack),suffix:"%",small:`${onTrack} students`,action:()=>go("milestones&mode=student")},
  {label:"At Risk",value:atRisk,small:`${attention} more need attention`,action:()=>status("At Risk")},
  {label:"Still Exploring",value:undecided,small:"No postsecondary plan yet",action:()=>go("insights")},
 ];
 return <div className="v4-daily">
  {/* v5's hero (8 Oct 2026: "how can we make v4's overview more like
     v5's, without destroying it"): the greeting with the four numbers right
     under it, and the day's two actions on the right, Log time beside the
     review. The sentence that repeated the review and risk counts went:
     the numbers below and the Pending Reviews island already say them. */}
  <section className="v4-welcome">
   <div><span className="v4-overline">{date||"Today"}</span><h1>Welcome back{account.name?`, ${account.name.split(" ")[0]}`:""}<span className="v4-period">.</span></h1></div>
   <div className="v4-welcome-actions">
    {filters}
    <button className="v4-secondary-action" onClick={()=>openLog({mode:"time"})}><Clock size={16}/>Log time</button>
    <button className="v4-primary-action" onClick={()=>go(pendingCount?"review-queue":"students")}>{pendingCount?"Start reviewing":"Open students"}<ArrowUpRight size={18}/></button>
   </div>
  </section>

  <div className="v4-signal-strip" aria-label="Caseload summary">
   {signals.map((s,i)=><button key={s.label} onClick={s.action} className={`v4-signal v4-signal-${i}`}><span>{s.label}</span><strong><CountUp value={s.value} suffix={s.suffix}/></strong><small>{s.small}</small><ArrowUpRight size={16}/></button>)}
  </div>

  {/* today's notice from v5, only when there is one: covering for a
     teammate. Check-ins are gone from the demo (9 Oct 2026, Maisha:
     "Dreamari is focused on career readiness, and social-emotional/
     mental-health monitoring is not something our platform is currently
     promising to do") */}
  <CoverageBanner />

  <div className="v4-daily-grid">
   <section className="v4-focus-sheet">
    {/* First person (Maisha: "flip it so the counselor reads it as talking
       about themselves ... 'My Next Conversations'"). */}
    <header className="v4-section-head"><div><h2>My Next Conversations</h2></div><span className="v4-pill">{attention+atRisk} need support</span></header>
    <div className="v4-priority-list">{priority.length?priority.map((s,i)=><div key={s.id} className="v4-priority-row"><button onClick={()=>openStudent(s.id)}><span className="v4-list-index">{String(i+1).padStart(2,"0")}</span><Avatar name={s.name} size={44} index={s.avatarIndex}/><span className="v4-person"><strong>{s.name}</strong><small>Grade {s.grade} · {attentionReason(s)}</small></span><span className={`v4-status-text ${s.status==="At Risk"?"is-risk":"is-attention"}`}><i aria-hidden/>{s.status}</span></button>
     {/* v5's booking on the row that calls for it */}
     <IconTip label="Log a walk-in"><button className="v4-row-action" aria-label={`Log a walk-in with ${s.name}`} onClick={()=>openLog({mode:"walkin",studentId:s.id})}><UserRound size={16}/></button></IconTip>
     <IconTip label="Book a meeting"><button className="v4-row-action is-primary" aria-label={`Book a meeting with ${s.name}`} onClick={()=>openLog({mode:"book",studentId:s.id})}><CalendarPlus size={16}/></button></IconTip></div>):<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={72}/><h3>Everyone Is on Track</h3><p>No students need attention in this view.</p></div>}</div>
    <div className="v4-sheet-foot"><span>Prioritized by current milestone status</span><Jump onClick={()=>go("students")}>View students</Jump></div>
   </section>
   <section className="v4-review-island">
    <header className="v4-section-head"><span className="v4-overline">Pending Reviews</span><FileCheck2 size={22}/></header>
    <div className="v4-review-number"><strong><CountUp value={pendingCount}/></strong><span>submissions<br/>awaiting my review</span></div>
    {/* The document icons wear the Pending Review status colour, one hue
       for the whole stack (Maisha: "make all of these the same color ...
       so there isn't too much competing for our attention"). */}
    <div className="v4-review-stack">{pending.filter(r=>r.count>0).map(r=><button key={r.key} onClick={()=>go("review-queue")}><span className="v4-mini-document" style={{color:"var(--v4-review)"}}><FileCheck2 size={17}/></span><span>{r.key}</span><b>{r.count}</b><ArrowUpRight size={14}/></button>)}{!pendingCount&&<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={64}/><p>All caught up. Every submitted milestone has been reviewed.</p></div>}</div>
    <button className="v4-island-action" onClick={()=>go("review-queue")}>Open review desk <ArrowRight size={18}/></button>
   </section>
  </div>

  {/* Milestone Completion, Career Interests and Plans After Graduation
     moved to Insights whole (8 Oct 2026, Chandu: "the today tab seems
     really badly cluttered"; "milestone completion and plans after
     graduation etc belong in insights"). Today answers what needs me
     today; On Track and Still Exploring open the moved charts. */}
  {/* What students are into, back on Today (8 Oct 2026, Chandu: "I want
     to see top 10 carousel and videos on the today page too"): v5 Home's
     ranked carousel of what they save and its Most Watched videos. */}
  <section className="v4-today-rail" aria-label="What my students are saving">
   <header className="v4-section-head"><div><h2>What My Students Are Saving</h2></div><Jump onClick={()=>go("explore")}>Explore</Jump></header>
   <Coverflow mode="cover" label="Most saved careers" items={saved.map(({career,students:n},k)=>({key:career.id,rank:k+1,title:career.title,world:career.world,photo:career.photo,focus:career.photoFocus,stat:{value:String(n),label:n===1?"Student":"Students"},onOpen:()=>openCareer({title:career.title,world:career.world,photo:career.photo},saved.map(x=>({title:x.career.title,world:x.career.world,photo:x.career.photo})))}))}/>
  </section>
  <section className="v4-today-rail" aria-label="Most watched"><header className="v4-section-head"><div><h2>Most Watched by My Students</h2></div></header><MostWatched titled={false}/></section>
 </div>;
}
