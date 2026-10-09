"use client";

// Home (9 Oct 2026, Maisha: "Rename the 'Today' tab to Home"). Her notes
// of the same day shape every block below: v5's cleaner hero with v4's four
// metrics "grouped more closely together on the left" and "only two
// buttons: Log Time and Start Reviewing" on the right; "a small, compact
// indicator near the top showing the counselor's next scheduled meeting";
// My Next Conversations and the saved-careers carousel kept as they were;
// Pending Reviews in v5's compact form with v4's small arrows; Most Watched
// replaced by "Most Played Career Simulations" in v5's card layout.

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarClock, CalendarPlus, ChevronRight, Clock, UserRound } from "lucide-react";
import { useCounselorFilters, type GradeFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS } from "@/lib/counselorRoster";
import { isPast, timeLabel, useMeetingsDone } from "@/lib/counselorMeetings";
import { attentionRank, attentionReason } from "./studentAttention";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { Avatar } from "./chips";
import { CountUp, DreamyMoment } from "./overviewShared";
import { IconTip } from "@/components/app/IconTip";
import { openLog } from "../v5/LogSheet";
import { CoverageBanner } from "../v5/Coverage";
import { Coverflow } from "../v5/Coverflow";
import { MostPlayedSimulations } from "../v5/HomeExtras";
import { useMeetings } from "../v5/Prepare";
import { openCareer } from "../v5/ExploreSheets";
import { schoolSnapshot, toV5 } from "@/lib/counselorV5";
import { useTodayFilters } from "./Workspace";
import "../v5/v5.css";
import "./today.css";

const subscribeDate = (notify: () => void) => { const timer = window.setInterval(notify, 60000); return () => window.clearInterval(timer); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", {weekday:"long",month:"long",day:"numeric"}).format(new Date());
const serverDateSnapshot = () => "Today";
const noop = () => () => {};
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const studentHref = (id: string) => `/counselor?view=students&studentId=${encodeURIComponent(id)}&v=4`;

function Jump({children,onClick}:{children:React.ReactNode;onClick:()=>void}) {return <button className="v4-text-action" onClick={onClick}>{children}<ArrowUpRight size={16}/></button>;}

/** The next meeting still to come, as one line (Maisha, 9 Oct 2026: "a
 *  small, compact indicator near the top showing the counselor's next
 *  scheduled meeting, its time, and a clickable link to open it ... keep it
 *  minimal"). Client-only: the seeds are built from the clock, so the
 *  server would print a different line. */
function NextMeeting({ roster }: { roster: Parameters<typeof useMeetings>[0] }) {
 const mounted = useSyncExternalStore(noop, () => true, () => false);
 const meetings = useMeetings(roster);
 const done = useMeetingsDone();
 if (!mounted) return <span className="v4-home-next" aria-hidden />;
 const now = new Date();
 const next = meetings.find((m) => !isPast(m, now) && !done[m.id]);
 if (!next) return <button type="button" className="v4-home-next dm-row dm-quiet" onClick={() => openLog({ mode: "book" })}><CalendarClock size={15} aria-hidden /><span>Nothing booked yet. <b>Book a meeting</b></span><ChevronRight size={14} aria-hidden /></button>;
 const student = roster.find((s) => s.id === next.studentId);
 const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
 const [y, mo, d] = next.day.split("-").map(Number);
 const when = next.day === iso(now) ? "today" : next.day === iso(tomorrow) ? "tomorrow" : new Date(y, mo - 1, d).toLocaleDateString("en-US", { weekday: "short" });
 return <Link href="/counselor?view=meetings&v=4" className="v4-home-next dm-row dm-quiet" aria-label={`Next meeting: ${timeLabel(next.time)} ${when}, ${student?.name ?? "a student"}, ${next.type}. Open Meetings`}>
  <CalendarClock size={15} aria-hidden /><span>Next: <b>{timeLabel(next.time)} {when}</b>{student ? ` · ${student.name}` : ""} · {next.type}</span><ChevronRight size={14} aria-hidden />
 </Link>;
}

export function Overview(){
 const router=useRouter();const reviewed=useReviewedRoster();
 const filters=useTodayFilters();
 const account=useSyncExternalStore(subscribeCounselorAccount,counselorAccountSnapshot,serverCounselorAccountSnapshot);
 const {gradeFilter,setGradeFilter,setStatusFilter}=useCounselorFilters();
 const date = useSyncExternalStore(subscribeDate, dateSnapshot, serverDateSnapshot);
 const roster=useMemo(()=>gradeFilter==="All Grades"?reviewed:reviewed.filter(s=>s.grade===gradeFilter),[reviewed,gradeFilter]);
 const [briefOpen,setBriefOpen]=useState(false);
 const total=roster.length;const onTrack=roster.filter(s=>s.status==="On Track").length;const atRisk=roster.filter(s=>s.status==="At Risk").length;const attention=total-onTrack-atRisk;
 const undecided=roster.filter(s=>s.postsecondaryIntent==="Undecided").length;
 const pending=MILESTONE_KEYS.map(key=>({key,count:roster.filter(s=>s.milestones[key]==="Pending Review").length}));
 const pendingCount=pending.reduce((n,r)=>n+r.count,0);

 const saved=useMemo(()=>schoolSnapshot(roster.map(toV5)).topSaved.slice(0,10),[roster]);
 // Dreamy's briefing (9 Oct 2026, Chandu: "incorporate dreamy more in the
 // counselor dashboard"; he was "just a sticker in random places with no
 // real engagement or presence"). Dreamy is the counselor's assistant who
 // reads everything first: three lines under the greeting, each a link,
 // about what changed, not the figures the strip below already shows.
 const missed=roster.filter(s=>Object.values(s.milestones).includes("Overdue")).length;
 // DEMO-ONLY: submissions have no timestamps yet; "since yesterday" is the newest few waiting
 const newToday=Math.min(pendingCount,3);
 const byGrade=[9,10,11,12].map(g=>{const rows=reviewed.filter(s=>s.grade===g);return {g,pct:rows.length?Math.round(rows.filter(s=>s.status==="On Track").length/rows.length*100):100};}).filter(x=>gradeFilter==="All Grades"||x.g===gradeFilter);
 const lowest=byGrade.reduce((a,b)=>b.pct<a.pct?b:a,byGrade[0]);
 const lateStudent=[...roster].filter(s=>/overdue/i.test(attentionReason(s))).sort(attentionRank)[0];
 const brief:{text:string;go:()=>void}[]=[
  newToday>0?{text:`${newToday} new submission${newToday===1?"":"s"} since yesterday${missed?`, ${missed} past deadline`:""}.`,go:()=>go("review-queue")}:{text:"Nothing new waiting for review.",go:()=>go("review-queue")},
  ...(lowest&&gradeFilter==="All Grades"?[{text:`Grade ${lowest.g}: ${lowest.pct}% on track, lowest grade.`,go:()=>{setGradeFilter(lowest.g as GradeFilter);go("milestones");}}]:[]),
  ...(lateStudent?[{text:`${lateStudent.name.split(" ")[0]}'s ${attentionReason(lateStudent).replace(/ overdue$/i,"")} is overdue.`,go:()=>openStudent(lateStudent.id)}]:[]),
 ];
 const priority=[...roster].filter(s=>s.status!=="On Track").sort(attentionRank).slice(0,5);
 const pct=(n:number,d=total)=>d?Math.round(n/d*100):0;
 const go=(view:string)=>router.push(`/counselor?view=${view}&v=4`);
 const openStudent=(id:string)=>router.push(studentHref(id));
 const status=(value:"On Track"|"Needs Attention"|"At Risk")=>{setStatusFilter(value);go("students");};
 // v4's four metrics, Title Case, in v5's form: the number first, then the
 // label, hairlines between, no third line (Maisha, 9 Oct 2026: "Keep the
 // existing metrics from V4 ... Use V5's cleaner layout"). The numbers roll
 // up on arrival like the student app's XP count (Maisha, 7 Oct 2026: "the
 // extra kick of excitement").
 const signals:{label:string;value:number;suffix?:string;action:()=>void}[]=[
  {label:"Students in View",value:total,action:()=>go("students")},
  {label:"On Track",value:pct(onTrack),suffix:"%",action:()=>go("milestones&mode=student")},
  {label:"At Risk",value:atRisk,action:()=>status("At Risk")},
  {label:"Still Exploring",value:undecided,action:()=>go("insights")},
 ];
 return <div className="v4-daily">
  {/* v5's hero (Maisha, 9 Oct 2026: "Use V5's cleaner layout, with the
     metrics grouped more closely together on the left. On the right, keep
     only two buttons"): the greeting and Dreamy's briefing on the left, the
     two actions and the next meeting on the right, then the four figures
     in one group under both. The grade picker left the actions row for the
     end of the figures it narrows, so the right side is the two buttons. */}
  <section className="v4-welcome v4-home-hero">
   <div className="v4-home-lead"><span className="v4-overline">{date||"Today"}</span><h1>Welcome back{account.name?`, ${account.name.split(" ")[0]}`:""}<span className="v4-period">.</span></h1>
    <div className="v4-dreamy-brief">{/* the glasses Dreamy, reading (Chandu, 9 Oct 2026: "the dreamy cloud is horribly small. And please use the dreamy with glasses") */}
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src="/images/dreamy/v2/dreamy-glasses.webp" alt="" aria-hidden="true" width={96} height={96} className="v4-dreamy-brief-face"/>
     <div className="v4-brief-content"><ul aria-label="Dreamy's briefing">{brief.slice(0,1).map(b=><li key={b.text}><button type="button" className="dm-row" onClick={b.go}>{b.text}</button></li>)}</ul>
      {brief.length>1&&<><button type="button" className="v4-brief-toggle dm-quiet" aria-expanded={briefOpen} aria-controls="home-brief-details" onClick={()=>setBriefOpen(!briefOpen)}>{briefOpen?"Less":"More updates"}<ChevronRight size={12} aria-hidden/></button>
      <ul id="home-brief-details" hidden={!briefOpen} className="v4-brief-details">{brief.slice(1).map(b=><li key={b.text}><button type="button" className="dm-row" onClick={b.go}>{b.text}<ArrowUpRight size={12} aria-hidden/></button></li>)}</ul></>}
     </div></div>
   </div>
   <div className="v4-home-side">
    <div className="v4-welcome-actions">
     <button className="v4-secondary-action" onClick={()=>openLog({mode:"time"})}><Clock size={16}/>Log Time</button>
     <button className="v4-primary-action" onClick={()=>go(pendingCount?"review-queue":"students")}>{pendingCount?"Start Reviewing":"Open Students"}<ArrowUpRight size={18}/></button>
    </div>
    <NextMeeting roster={reviewed} />
   </div>
   <div className="v4-home-signals">
    <div className="v4-home-figures" role="group" aria-label="Caseload summary">
     {signals.map(s=><button key={s.label} type="button" onClick={s.action} className="v4-home-figure dm-quiet"><strong><CountUp value={s.value} suffix={s.suffix}/></strong><span>{s.label}<ChevronRight size={14} aria-hidden/></span></button>)}
    </div>
    {filters&&<div className="v4-home-scope">{filters}</div>}
   </div>
  </section>

  {/* today's notice from v5, only when there is one: covering for a
     teammate. Check-ins are gone from the demo (9 Oct 2026, Maisha:
     "Dreamari is focused on career readiness, and social-emotional/
     mental-health monitoring is not something our platform is currently
     promising to do") */}
  <CoverageBanner />

  <div className="v4-daily-grid">
   <section className="v4-focus-sheet">
    {/* First person (Maisha: "flip it so the counselor reads it as talking
       about themselves ... 'My Next Conversations'"). Kept as it was
       (Maisha, 9 Oct 2026: "Keep the existing V4 layout and functionality"). */}
    <header className="v4-section-head"><div><h2>My Next Conversations</h2></div><span className="v4-pill">{attention+atRisk} need support</span></header>
    <div className="v4-priority-list">{priority.length?priority.map((s,i)=><div key={s.id} className="v4-priority-row"><button onClick={()=>openStudent(s.id)}><span className="v4-list-index">{String(i+1).padStart(2,"0")}</span><Avatar name={s.name} size={44} index={s.avatarIndex}/><span className="v4-person"><strong>{s.name}</strong><small>Grade {s.grade} · {attentionReason(s)}</small></span><span className={`v4-status-text ${s.status==="At Risk"?"is-risk":"is-attention"}`}><i aria-hidden/>{s.status}</span></button>
     {/* v5's booking on the row that calls for it */}
     <IconTip label="Log a walk-in"><button className="v4-row-action" aria-label={`Log a walk-in with ${s.name}`} onClick={()=>openLog({mode:"walkin",studentId:s.id})}><UserRound size={16}/></button></IconTip>
     <IconTip label="Book a meeting"><button className="v4-row-action is-primary" aria-label={`Book a meeting with ${s.name}`} onClick={()=>openLog({mode:"book",studentId:s.id})}><CalendarPlus size={16}/></button></IconTip></div>):<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={72}/><h3>Everyone Is on Track</h3><p>No students need attention in this view.</p></div>}</div>
    <div className="v4-sheet-foot"><span>By milestone priority</span><Jump onClick={()=>go("students")}>View students</Jump></div>
   </section>
   {/* v5's Pending Reviews, open on the page with a hairline to its left
      (Maisha, 9 Oct 2026: "Replace the V4 layout with the cleaner, more
      compact design from V5. Retain the small arrow next to each review
      category/count"). The count opens the desk; each row opens it
      narrowed to that milestone. The island's own "Open review desk"
      went: Start Reviewing above already goes there. */}
   <section className="v4-review-column" aria-label="Pending reviews">
    <span className="v4-overline">Pending Reviews</span>
    {pendingCount?<>
     <Link href="/counselor?v=4&view=review-queue" className="v4-review-total dm-row dm-quiet"><strong><CountUp value={pendingCount}/></strong><span>submissions to review</span></Link>
     <ul className="v4-review-rows">{pending.filter(r=>r.count>0).map(r=><li key={r.key}><Link href={`/counselor?v=4&view=review-queue&milestone=${encodeURIComponent(r.key)}`} className="dm-quiet"><span>{r.key}</span><b>{r.count}</b><ArrowUpRight size={14} aria-hidden/></Link></li>)}</ul>
    </>:<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={64}/><p>All caught up. Every submitted milestone has been reviewed.</p></div>}
   </section>
  </div>

  {/* Milestone Completion, Career Interests and Plans After Graduation
     moved to Insights whole (8 Oct 2026, Chandu: "the today tab seems
     really badly cluttered"; "milestone completion and plans after
     graduation etc belong in insights"). Home answers what needs me
     today; On Track and Still Exploring open the moved charts. */}
  {/* What students are into (8 Oct 2026, Chandu: "I want to see top 10
     carousel and videos on the today page too"); kept (Maisha, 9 Oct 2026:
     "Keep the V4 carousel design displaying the top 10 most-saved careers"). */}
  <section className="v4-today-rail" aria-label="What my students are saving">
   <header className="v4-section-head"><div><h2>What My Students Are Saving</h2></div><Jump onClick={()=>go("explore")}>Explore</Jump></header>
   <Coverflow mode="cover" label="Most saved careers" items={saved.map(({career,students:n},k)=>({key:career.id,rank:k+1,title:career.title,world:career.world,photo:career.photo,focus:career.photoFocus,stat:{value:String(n),label:n===1?"Student":"Students"},onOpen:()=>openCareer({title:career.title,world:career.world,photo:career.photo},saved.map(x=>({title:x.career.title,world:x.career.world,photo:x.career.photo})))}))}/>
  </section>
  {/* v5's simulation cards in place of Most Watched (Maisha, 9 Oct 2026:
     "Replace V4's 'Most Watched by My Students' section with V5's 'Most
     Played Simulations.' Rename it 'Most Played Career Simulations'").
     A card opens who played it. */}
  <section className="v4-today-rail v4-home-sims" aria-label="Most played career simulations">
   <header className="v4-section-head"><div><h2>Most Played Career Simulations</h2></div></header>
   <MostPlayedSimulations students={total} titled={false}/>
  </section>
 </div>;
}
