"use client";

// Home v4, 9 Oct 2026: Chandu requested Apple's glanceable calendar and
// reminders hierarchy, open on the page (no widget boxes), v5's cleaner
// conversation cards and review column, shorter copy, and all content kept.

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock } from "lucide-react";
import { useCounselorFilters, type GradeFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS } from "@/lib/counselorRoster";
import { isPast, timeLabel, useMeetingsDone } from "@/lib/counselorMeetings";
import { attentionRank, attentionReason } from "./studentAttention";
import { reviewHref } from "./milestonesModel";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { AVATAR_STYLE_OPTIONS, ConversationAvatar, isAvatarStyle, type ConversationAvatarStyle } from "./ConversationAvatar";
import { Listbox } from "./Listbox";
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
  {/* one headline and one quiet line, like the band's other columns
     (9 Oct 2026: the band "might look a little cluttered") */}
  <span className="v4-calendar-event"><span className="v4-calendar-time"><strong>{when}, {date} · {timeLabel(next.time)}<ArrowUpRight size={14} aria-hidden/></strong></span><small className="v4-widget-detail">{student?.name ?? "Student meeting"} · {next.type}, {next.minutes} min</small></span>
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
 const avatarStyle:ConversationAvatarStyle=isAvatarStyle(pickedAvatarStyle)?pickedAvatarStyle:"portrait";
 const total=roster.length;const onTrack=roster.filter(s=>s.status==="On Track").length;const atRisk=roster.filter(s=>s.status==="At Risk").length;const attention=total-onTrack-atRisk;
 const undecided=roster.filter(s=>s.postsecondaryIntent==="Undecided").length;
 const pending=MILESTONE_KEYS.map(key=>({key,count:roster.filter(s=>s.milestones[key]==="Pending Review").length}));
 const pendingCount=pending.reduce((n,r)=>n+r.count,0);
 const pendingCategories=pending.filter(r=>r.count>0);
 // Each submission waiting, one per student and milestone, in the student
 // row's own priority order (who needs the most support first); there are
 // no submission dates yet to sort by.
 const waitingList=[...roster].sort(attentionRank).flatMap(s=>MILESTONE_KEYS.filter(k=>s.milestones[k]==="Pending Review").map(k=>({s,k})));
 const WAITING_SHOWN=5;

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
 // Everyone who needs support, in priority order, not only the first five
 // (9 Oct 2026, Chandu: "the student card row can be scrollable still,
 // right? It's not like there are only 5 students needing attention"). The
 // row scrolls sideways and the next card peeks in at the edge.
 const priority=[...roster].filter(s=>s.status!=="On Track").sort(attentionRank);
 const pct=(n:number,d=total)=>d?Math.round(n/d*100):0;
 const go=(view:string)=>router.push(`/counselor?view=${view}&v=4`);
 const openStudent=(id:string)=>router.push(studentHref(id));
 const status=(value:"On Track"|"Needs Attention"|"At Risk")=>{setStatusFilter(value);go("students");};
 // v4's four metrics, Title Case, in v5's form: the number first, then the
 // label, hairlines between, no third line (Maisha, 9 Oct 2026: "Keep the
 // existing metrics from V4 ... Use V5's cleaner layout"). The numbers roll
 // up on arrival like the student app's XP count (Maisha, 7 Oct 2026: "the
 // extra kick of excitement").
 // The caseload pulse: At Risk leads (the one figure to act on), On Track
 // and Still Exploring sit under it as quiet links. "Students in View" left
 // Home for the grade picker's label (9 Oct 2026, see the top band below).
 const pulseLinks=[
  {label:`${pct(onTrack)}% on track`,action:()=>go("milestones&mode=student")},
  {label:`${undecided} still exploring`,action:()=>go("insights")},
 ];
 return <div className="v4-daily">
  {/* 9 Oct: Apple's event widget + notification stack hierarchy, adapted to
      Dreamari. Two useful groups; quieter copy without losing an update. */}
  <section className="v4-welcome v4-home-hero v4-home-lockscreen">
   <div className="v4-home-lead"><span className="v4-overline">{date||"Today"}</span><h1>Welcome back{account.name?`, ${account.name.split(" ")[0]}`:""}<span className="v4-period">.</span></h1></div>
   <div className="v4-home-side"><div className="v4-welcome-actions">
    {filters&&<div className="v4-home-scope">{filters}</div>}
    <button className="v4-secondary-action" onClick={()=>openLog({mode:"time"})}><Clock size={16}/>Log Time</button>
    <button className="v4-primary-action" onClick={()=>go(pendingCount?"review-queue":"students")}>{pendingCount?"Start Reviewing":"Open Students"}<ArrowUpRight size={18}/></button>
   </div></div>
   {/* Three glanceable columns (9 Oct 2026). Chandu: "the 85 on track, 7 at
      risk, 42 exploring can also be one of those columns next to the
      meeting and reminders ... At risk can be highlighted". The full-width
      figures strip is gone (it cost a band and pushed the work down); the
      pulse is a third column, At Risk as its headline, the other two as
      quiet links under it. Not a carousel: these are compared, not read
      one at a time, and the reminders beside them already rotate. */}
   <div className="v4-home-widgets">
    <NextMeeting roster={reviewed} />
    <ReminderCarousel items={brief}/>
    <section className="v4-pulse-widget" aria-label="Caseload pulse">
     <button type="button" onClick={()=>status("At Risk")} className={`v4-pulse-lead dm-quiet ${atRisk?"is-risk":""}`}><strong><CountUp value={atRisk}/></strong><span>{atRisk===1?"student at risk":"students at risk"}<ArrowUpRight size={14} aria-hidden/></span></button>
     <div className="v4-pulse-links">{pulseLinks.map((l,n)=><span key={l.label} className="contents">{n>0&&<span aria-hidden className="v4-pulse-dot">·</span>}<button type="button" onClick={l.action} className="dm-quiet">{l.label}</button></span>)}</div>
    </section>
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
    <div className="v4-conversation-meta"><span>{attention+atRisk} need support · By milestone priority</span>{/* thirteen styles to compare (two house styles and eleven DiceBear
       ones), so the two-button switch became a dropdown (9 Oct 2026) */}<Listbox ariaLabel="Avatar style" value={avatarStyle} onChange={v=>{if(isAvatarStyle(v))setAvatarStyle(v);}} options={AVATAR_STYLE_OPTIONS} className="v4-avatar-picker" panelStyle={{background:"var(--card)",color:"var(--foreground)"}}/></div>
    <div className="v4-conversation-rail dm-scroll" role="group" aria-label="Students needing a conversation">{priority.length?priority.map(s=><article key={s.id} className="v4-conversation-card">
     <button type="button" className="v4-conversation-profile dm-quiet" onClick={()=>openStudent(s.id)}><span className="v4-conversation-portrait" data-avatar={avatarStyle}><ConversationAvatar student={s} style={avatarStyle} size={160}/></span><span className="v4-conversation-copy"><strong>{s.name}</strong><span className="v4-conversation-grade">Grade {s.grade}<span className={`v4-conversation-status ${s.status==="At Risk"?"is-risk":""}`}>{s.status}</span></span><span className="v4-conversation-reason">{attentionReason(s)}</span></span></button>
     <div className="v4-conversation-actions"><button type="button" className="v4-conversation-log dm-quiet" aria-label={`Log a walk-in with ${s.name}`} onClick={()=>openLog({mode:"walkin",studentId:s.id})}>Log walk-in</button><button type="button" className="v4-conversation-book" aria-label={`Book a meeting with ${s.name}`} onClick={()=>openLog({mode:"book",studentId:s.id})}>Book</button></div>
    </article>):<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={72}/><h3>Everyone Is on Track</h3><p>No students need attention in this view.</p></div>}</div>
   </section>
   {/* Pending Reviews beside the student row again, rebuilt in the row's
      own language (9 Oct 2026, Chandu: "bring pending reviews back in line
      with the student row but somehow redesign or re-word or re-create it
      in a way that it feels cohesive side by side with the student row").
      Every earlier version was a number and a link beside picture cards,
      which can never balance them. Now both columns show students who need
      the counselor: each row is a submission waiting, with the student's
      face in the same avatar style as the cards, their name, the
      milestone, and a Review button in the cards' Book tint. The heading
      row's "Review all" opens the whole queue. */}
   <section className="v4-review-column" aria-label="Pending reviews">
    <header className="v4-section-head"><h2>Pending Reviews</h2>{pendingCount?<Jump onClick={()=>go("review-queue")}>Review all</Jump>:null}</header>
    <div className="v4-conversation-meta v4-review-meta"><span>{pendingCount?`${pendingCount} waiting · ${pendingCategories.length} ${pendingCategories.length===1?"milestone":"milestones"}`:"Nothing waiting"}</span></div>
    <div className="v4-review-body">
    {pendingCount?<ul className="v4-waiting-list dm-scroll">
     {waitingList.slice(0,WAITING_SHOWN).map(({s,k})=><li key={`${s.id}-${k}`} className="v4-waiting-row">
      <button type="button" className="v4-waiting-who dm-quiet" onClick={()=>openStudent(s.id)} aria-label={`${s.name}: open profile`}>
       <span className="v4-waiting-face" data-avatar={avatarStyle}><ConversationAvatar student={s} style={avatarStyle} size={22}/></span>
       <span className="v4-waiting-copy"><strong>{s.name}</strong><small>{k}</small></span>
      </button>
      <button type="button" className="v4-waiting-review" onClick={()=>router.push(reviewHref(k,[s.id]))} aria-label={`Review ${s.name}'s ${k}`}>Review</button>
     </li>)}
     {waitingList.length>WAITING_SHOWN&&<li className="v4-waiting-more"><button type="button" className="dm-quiet" onClick={()=>go("review-queue")}>{waitingList.length-WAITING_SHOWN} more waiting<ArrowUpRight size={14} aria-hidden/></button></li>}
    </ul>:<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={64}/><p>All caught up. Every submitted milestone has been reviewed.</p></div>}
    </div>
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
