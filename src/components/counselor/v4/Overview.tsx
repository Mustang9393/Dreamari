"use client";

// Home v4, 9 Oct 2026: Chandu requested Apple's glanceable calendar and
// reminders hierarchy, open on the page (no widget boxes), v5's cleaner
// conversation cards and review column, shorter copy, and all content kept.

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight, Clock } from "lucide-react";
import { useCounselorFilters, type GradeFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS } from "@/lib/counselorRoster";
import { isPast, timeLabel, useMeetingsDone } from "@/lib/counselorMeetings";
import { attentionRank, attentionReason } from "./studentAttention";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { ConversationAvatar, type ConversationAvatarStyle } from "./ConversationAvatar";
import { useAB } from "../abTests";
import { ReminderCarousel } from "./ReminderCarousel";
import { CountUp, DreamyMoment } from "./overviewShared";
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

/** A glanceable calendar widget; seeds depend on the client clock. */
function NextMeeting({ roster }: { roster: Parameters<typeof useMeetings>[0] }) {
 const mounted = useSyncExternalStore(noop, () => true, () => false);
 const meetings = useMeetings(roster);
 const done = useMeetingsDone();
 if (!mounted) return <div className="v4-calendar-widget" aria-hidden />;
 const now = new Date();
 const next = meetings.find((m) => !isPast(m, now) && !done[m.id]);
 if (!next) return <button type="button" className="v4-calendar-widget dm-quiet" onClick={() => openLog({ mode: "book" })}><strong>Nothing booked yet</strong><span className="v4-widget-detail">Book a meeting <ArrowUpRight size={14} aria-hidden /></span></button>;
 const student = roster.find((s) => s.id === next.studentId);
 const [y, mo, d] = next.day.split("-").map(Number);
 const day = new Date(y, mo - 1, d);
 const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
 const when = next.day === iso(now) ? "Today" : next.day === iso(tomorrow) ? "Tomorrow" : day.toLocaleDateString("en-US", { weekday: "long" });
 const date = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
 return <Link href="/counselor?view=meetings&v=4" className="v4-calendar-widget dm-quiet" aria-label={`Next meeting: ${timeLabel(next.time)}, ${when}, ${date}, ${student?.name ?? "a student"}, ${next.type}. Open Meetings`}>
  <span className="v4-calendar-event"><span className="v4-calendar-time"><strong>{when}, {date}<ArrowUpRight size={14} aria-hidden/></strong></span><span className="v4-calendar-person"><strong>{timeLabel(next.time)} · {student?.name ?? "Student meeting"}</strong><small>{next.type} · {next.minutes} min</small></span></span>
 </Link>;
}

export function Overview(){
 const router=useRouter();const reviewed=useReviewedRoster();
 const filters=useTodayFilters();
 const account=useSyncExternalStore(subscribeCounselorAccount,counselorAccountSnapshot,serverCounselorAccountSnapshot);
 const {gradeFilter,setGradeFilter,setStatusFilter}=useCounselorFilters();
 const date = useSyncExternalStore(subscribeDate, dateSnapshot, serverDateSnapshot);
 const roster=useMemo(()=>gradeFilter==="All Grades"?reviewed:reviewed.filter(s=>s.grade===gradeFilter),[reviewed,gradeFilter]);
 const [pickedAvatarStyle,setAvatarStyle]=useAB<ConversationAvatarStyle>("v4-home-conversation-avatar","portrait");
 const avatarStyle=pickedAvatarStyle==="line"?"line":"portrait";
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
 const brief:{title:string;detail:string;go:()=>void}[]=[
  newToday>0?{title:`${newToday} new submission${newToday===1?"":"s"}`,detail:`Since yesterday${missed?` · ${missed} past deadline`:""}`,go:()=>go("review-queue")}:{title:"All caught up",detail:"Nothing new waiting for review",go:()=>go("review-queue")},
  ...(lowest&&gradeFilter==="All Grades"?[{title:`Grade ${lowest.g} needs support`,detail:`${lowest.pct}% on track · Lowest grade`,go:()=>{setGradeFilter(lowest.g as GradeFilter);go("milestones");}}]:[]),
  ...(lateStudent?[{title:`${lateStudent.name.split(" ")[0]}'s ${attentionReason(lateStudent).replace(/ overdue$/i,"")}`,detail:"Overdue",go:()=>openStudent(lateStudent.id)}]:[]),
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
  {/* 9 Oct: Apple's event widget + notification stack hierarchy, adapted to
      Dreamari. Two useful groups; quieter copy without losing an update. */}
  <section className="v4-welcome v4-home-hero v4-home-lockscreen">
   <div className="v4-home-lead"><span className="v4-overline">{date||"Today"}</span><h1>Welcome back{account.name?`, ${account.name.split(" ")[0]}`:""}<span className="v4-period">.</span></h1></div>
   <div className="v4-home-side"><div className="v4-welcome-actions">
    <button className="v4-secondary-action" onClick={()=>openLog({mode:"time"})}><Clock size={16}/>Log Time</button>
    <button className="v4-primary-action" onClick={()=>go(pendingCount?"review-queue":"students")}>{pendingCount?"Start Reviewing":"Open Students"}<ArrowUpRight size={18}/></button>
   </div></div>
   <div className="v4-home-widgets">
    <NextMeeting roster={reviewed} />
    <ReminderCarousel items={brief}/>
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

  <div className="v4-daily-grid v4-home-work">
   <section className="v4-focus-sheet">
    <header className="v4-section-head"><h2>My Next Conversations</h2><Jump onClick={()=>go("students")}>View students</Jump></header>
    <div className="v4-conversation-meta"><span>{attention+atRisk} need support · By milestone priority</span><div className="v4-conversation-switch" role="group" aria-label="Conversation avatar style">{([{key:"portrait",label:"Portraits"},{key:"line",label:"Line art"}] as const).map(option=><button key={option.key} type="button" className="dm-quiet" aria-pressed={avatarStyle===option.key} onClick={()=>setAvatarStyle(option.key)}>{option.label}</button>)}</div></div>
    <div className="v4-conversation-rail dm-scroll" role="group" aria-label="Students needing a conversation">{priority.length?priority.map(s=><article key={s.id} className="v4-conversation-card">
     <button type="button" className="v4-conversation-profile dm-quiet" onClick={()=>openStudent(s.id)}><span className="v4-conversation-portrait" data-avatar={avatarStyle}><ConversationAvatar student={s} style={avatarStyle} size={160}/></span><span className="v4-conversation-copy"><strong>{s.name}</strong><span className="v4-conversation-grade">Grade {s.grade}<span className={`v4-conversation-status ${s.status==="At Risk"?"is-risk":""}`}>{s.status}</span></span><span className="v4-conversation-reason">{attentionReason(s)}</span></span></button>
     <div className="v4-conversation-actions"><button type="button" className="v4-conversation-log dm-quiet" aria-label={`Log a walk-in with ${s.name}`} onClick={()=>openLog({mode:"walkin",studentId:s.id})}>Log walk-in</button><button type="button" className="v4-conversation-book" aria-label={`Book a meeting with ${s.name}`} onClick={()=>openLog({mode:"book",studentId:s.id})}>Book</button></div>
    </article>):<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={72}/><h3>Everyone Is on Track</h3><p>No students need attention in this view.</p></div>}</div>
   </section>
   {/* 9 Oct: replace the long review list with a compact, open breakdown.
      The total opens the queue; every category keeps its filtered link. */}
   <section className="v4-review-column" aria-label="Pending reviews">
    <header className="v4-section-head"><h2>Pending Reviews</h2>{pendingCount>0&&<Link href="/counselor?v=4&view=review-queue" className="v4-review-count dm-quiet" aria-label={`${pendingCount} pending submissions. Open review queue`}><CountUp value={pendingCount}/><ArrowUpRight size={14} aria-hidden/></Link>}</header>
    {pendingCount?<div className="v4-review-breakdown" role="group" aria-label="Pending reviews by category">{pending.filter(r=>r.count>0).map(r=><Link key={r.key} href={`/counselor?v=4&view=review-queue&milestone=${encodeURIComponent(r.key)}`} className="dm-quiet"><span>{r.key}</span><b>{r.count}</b></Link>)}</div>:<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={64}/><p>All caught up. Every submitted milestone has been reviewed.</p></div>}
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
