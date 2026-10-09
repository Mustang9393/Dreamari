"use client";

// Home v4, 9 Oct 2026: Chandu requested Apple's glanceable calendar and
// reminders hierarchy, open on the page (no widget boxes), v5's cleaner
// conversation cards and review column, shorter copy, and all content kept.

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, Clock } from "lucide-react";
import { useCounselorFilters, type GradeFilter } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS } from "@/lib/counselorRoster";
import { isPast, timeLabel, useMeetingsDone } from "@/lib/counselorMeetings";
import { attentionRank, attentionReason } from "./studentAttention";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { AVATAR_STYLE_OPTIONS, ConversationAvatar, isAvatarStyle, type ConversationAvatarStyle } from "./ConversationAvatar";
import { Listbox } from "./Listbox";
import { useAB } from "../abTests";
import { ReminderCarousel } from "./ReminderCarousel";
import { DocumentPage } from "./DocumentPreview";
import { FitPage } from "./DocumentDesk";
import { CardProgressiveBlur } from "@/components/app/cardChrome";
import { reviewHref } from "./milestonesModel";
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
 // Pending Reviews' "See all": every milestone with something waiting,
 // the fullest first.
 const queuesBySize=[...pendingCategories].sort((a,b)=>b.count-a.count);
 // the submission Pending Reviews shows as a thumbnail: the student most in
 // need, their first milestone waiting
 const firstWaiting=(()=>{for(const st of [...roster].sort(attentionRank)){const k=MILESTONE_KEYS.find(m=>st.milestones[m]==="Pending Review");if(k)return {s:st,k};}return null;})();
 // Pending Reviews mirrors a card's bands, so it needs the card picture's
 // height, which follows the cards' width; measured, not guessed.
 const railRef=useRef<HTMLDivElement>(null);
 const [picH,setPicH]=useState<number|null>(null);
 useLayoutEffect(()=>{
  const pic=railRef.current?.querySelector<HTMLElement>(".v4-conversation-portrait");
  if(!pic) return;
  const ro=new ResizeObserver(()=>setPicH(Math.round(pic.getBoundingClientRect().height)));
  ro.observe(pic);
  return ()=>ro.disconnect();
 },[]);

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
 // the figures read first (10 Oct 2026, Chandu: "the 85% etc under the 7
 // at risk students need a bit more prominence. It was not read properly
 // when I demoed"): the number in full ink and weight, the words after it
 const pulseLinks=[
  {label:`${pct(onTrack)}% on track`,value:`${pct(onTrack)}%`,words:"on track",action:()=>go("milestones&mode=student")},
  {label:`${undecided} still exploring`,value:`${undecided}`,words:"still exploring",action:()=>go("insights")},
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
     <div className="v4-pulse-links">{pulseLinks.map((l,n)=><span key={l.label} className="contents">{n>0&&<span aria-hidden className="v4-pulse-dot">·</span>}<button type="button" onClick={l.action} className="dm-quiet" aria-label={l.label}><b>{l.value}</b> {l.words}</button></span>)}</div>
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
    <div ref={railRef} className="v4-conversation-rail dm-scroll" role="group" aria-label="Students needing a conversation">{priority.length?priority.map(s=><article key={s.id} className="v4-conversation-card">
     <button type="button" className="v4-conversation-profile dm-quiet" onClick={()=>openStudent(s.id)}><span className="v4-conversation-portrait" data-avatar={avatarStyle}><ConversationAvatar student={s} style={avatarStyle} size={160}/></span><span className="v4-conversation-copy"><strong>{s.name}</strong><span className="v4-conversation-grade">Grade {s.grade}<span className={`v4-conversation-status ${s.status==="At Risk"?"is-risk":""}`}>{s.status}</span></span><span className="v4-conversation-reason">{attentionReason(s)}</span></span></button>
     <div className="v4-conversation-actions"><button type="button" className="v4-conversation-log dm-quiet" aria-label={`Log a walk-in with ${s.name}`} onClick={()=>openLog({mode:"walkin",studentId:s.id})}>Log walk-in</button><button type="button" className="v4-conversation-book" aria-label={`Book a meeting with ${s.name}`} onClick={()=>openLog({mode:"book",studentId:s.id})}>Book</button></div>
    </article>):<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={72}/><h3>Everyone Is on Track</h3><p>No students need attention in this view.</p></div>}</div>
   </section>
   {/* (superseded 10 Oct: see the three bands below) Pending Reviews beside the student row: an overview, not a list
      (10 Oct 2026, Chandu: "Just show a big stat number and then some other
      details as an overview, not the full student list", then "please
      avoid the bar charts too"). The number starts on the cards' top edge;
      under it, how many are new, and a "See all" disclosure with each
      milestone's queue. The group is centred in the card row's height
      (Chandu: "just show 13 submissions waiting, 3 new since yesterday,
      have a see all accordion or something, centre it in its height,
      leaving the title and CTA where they are"). One number on the column:
      the bars, then number tiles, were too many figures competing. "Review
      all" in the heading row opens everything. */}
   <section className="v4-review-column" aria-label="Pending reviews">
    <header className="v4-section-head"><h2>Pending Reviews</h2>{pendingCount?<Jump onClick={()=>go("review-queue")}>Review all</Jump>:null}</header>
    {/* the meta row stays (it is the row that lines up with "18 need
       support" opposite) but says nothing: "Across 7 milestones" repeated
       See all (10 Oct 2026, Chandu: "too cluttered, so much text to read") */}
    <div className="v4-conversation-meta v4-review-meta" aria-hidden><span /></div>
    {/* Three bands, a card's own (10 Oct 2026, Chandu: "the middle
       alignment still feels off ... anything else that won't introduce
       clutter but solves the problem?"). Centring matched nothing in the
       cards beside it. Now the column has their bands: the picture band
       (the cards' picture height, measured) holds a small stack of the
       documents waiting; the count starts on the
       names' line with "new since yesterday" on the grade line; and See
       all sits on the buttons' line, its list opening upward over the
       column so nothing moves. */}
    <div className="v4-review-body" style={picH?{["--review-pic-h" as string]:`${picH}px`}:undefined}>
    {pendingCount?<div className="v4-review-bands">
     {/* the real first page of the submission most in need of review, at
        the column's width, its letterhead and title sharp and the rest
        fading under a progressive blur (10 Oct 2026, Chandu: "Show an
        actual thumbnail of the doc to review. Use more of the width
        available. Just the heading should be visible and the rest can have
        a progressive blur"), then "if Blake etc is visible in the thumbnail
        don't have an extra text line in a scrim", and "don't round the
        corners of the doc, make it look like a doc, not a picture of a doc
        in a card": square corners, a paper shadow, no caption, no border.
        It opens that submission. */}
     <div className="v4-review-faces">{firstWaiting&&<button type="button" className="v4-review-thumb dm-quiet" onClick={()=>router.push(reviewHref(firstWaiting.k,[firstWaiting.s.id]))} aria-label={`Review ${firstWaiting.s.name}'s ${firstWaiting.k}`}>
      <span className="v4-review-thumb-page" aria-hidden><FitPage shadow="none"><DocumentPage student={firstWaiting.s} milestone={firstWaiting.k}/></FitPage></span>
      <CardProgressiveBlur direction="up" size="64%" maxBlur={10}/>
      <span className="v4-review-thumb-fade" aria-hidden/>
     </button>}</div>
     <div className="v4-review-text"><strong><span className="v4-review-num"><CountUp value={pendingCount}/></span> {pendingCount===1?"submission waiting":"submissions waiting"}</strong></div>
     <details className="v4-review-all"><summary className="dm-quiet">See all<ChevronDown size={14} aria-hidden/></summary>
      <ul>{queuesBySize.map(q=><li key={q.key}><Link href={`/counselor?v=4&view=review-queue&milestone=${encodeURIComponent(q.key)}`} className="dm-quiet"><span>{q.key}</span><b>{q.count}</b></Link></li>)}</ul>
     </details>
    </div>:<div className="v4-clear-state v4-today-clear"><DreamyMoment mood="celebrate" size={64}/><p>All caught up. Every submitted milestone has been reviewed.</p></div>}
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
