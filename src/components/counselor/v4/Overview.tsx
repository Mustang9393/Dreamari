"use client";

// Home v4, 9 Oct 2026: Chandu requested Apple's glanceable calendar and
// reminders hierarchy, open on the page (no widget boxes), v5's cleaner
// conversation cards and review column, shorter copy, and all content kept.

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Clock } from "lucide-react";
import { useCounselorFilters } from "../shell";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { MILESTONE_KEYS } from "@/lib/counselorRoster";
import { isPast, timeLabel, useMeetingsDone } from "@/lib/counselorMeetings";
import { attentionRank } from "./studentAttention";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount } from "@/lib/counselorAccount";
import { openLog } from "../v5/LogSheet";
import { CoverageBanner } from "../v5/Coverage";
import { RankedPosterCard } from "@/components/app/PosterCard";
import "./insights2.css";
import { MostPlayedSimulations } from "../v5/HomeExtras";
import { useMeetings } from "../v5/Prepare";
import { openCareer } from "../v5/ExploreSheets";
import { schoolSnapshot, toV5 } from "@/lib/counselorV5";
import { useTodayFilters } from "./Workspace";
import "../v5/v5.css";
import "./today.css";
import "./layout2.css";
import "../v7/v7.css";
import { Stat } from "../v7/Home";

const subscribeDate = (notify: () => void) => { const timer = window.setInterval(notify, 60000); return () => window.clearInterval(timer); };
const dateSnapshot = () => new Intl.DateTimeFormat("en", {weekday:"long",month:"long",day:"numeric"}).format(new Date());
const serverDateSnapshot = () => "Today";
const noop = () => () => {};
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Jump({children,onClick}:{children:React.ReactNode;onClick:()=>void}) {return <button className="v4-text-action" onClick={onClick}>{children}<ArrowUpRight size={16}/></button>;}

/** Home's meetings card (v7's shape): how many are left this week, the
 *  next one, and the way to the schedule. */
function MeetingsCard({ roster }: { roster: Parameters<typeof useMeetings>[0] }) {
 const mounted = useSyncExternalStore(noop, () => true, () => false);
 const meetings = useMeetings(roster);
 const done = useMeetingsDone();
 if (!mounted) return <div aria-hidden />;
 const now = new Date();
 const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()));
 const left = meetings.filter((m) => !isPast(m, now) && !done[m.id] && m.day <= iso(weekEnd));
 const next = meetings.find((m) => !isPast(m, now) && !done[m.id]);
 const student = next ? roster.find((s) => s.id === next.studentId) : undefined;
 let when = "";
 if (next) {
  const [y, mo, d] = next.day.split("-").map(Number);
  const day = new Date(y, mo - 1, d);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  when = next.day === iso(now) ? "Today" : next.day === iso(tomorrow) ? "Tomorrow" : day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
 }
 return <Stat figure="meetings" href="/counselor?view=meetings&v=4" label="Meetings this week" value={left.length} go="View schedule"
  line={next ? <>Next: <span className="font-semibold" style={{ color: "var(--foreground)" }}>{student?.name ?? "a student"}</span> · {when} · {timeLabel(next.time)}</> : "Nothing booked yet"} />;
}

export function Overview(){
 const router=useRouter();const reviewed=useReviewedRoster();
 const filters=useTodayFilters();
 const account=useSyncExternalStore(subscribeCounselorAccount,counselorAccountSnapshot,serverCounselorAccountSnapshot);
 const {gradeFilter,setStatusFilter}=useCounselorFilters();
 const date = useSyncExternalStore(subscribeDate, dateSnapshot, serverDateSnapshot);
 const roster=useMemo(()=>gradeFilter==="All Grades"?reviewed:reviewed.filter(s=>s.grade===gradeFilter),[reviewed,gradeFilter]);
 const total=roster.length;const atRisk=roster.filter(s=>s.status==="At Risk").length;
 const pending=MILESTONE_KEYS.map(key=>({key,count:roster.filter(s=>s.milestones[key]==="Pending Review").length}));
 const pendingCount=pending.reduce((n,r)=>n+r.count,0);
 const topPending=[...pending].sort((x,y)=>y.count-x.count).find(r=>r.count>0);

 const saved=useMemo(()=>schoolSnapshot(roster.map(toV5)).topSaved.slice(0,10),[roster]);
 // Dreamy's briefing (9 Oct 2026, Chandu: "incorporate dreamy more in the
 // counselor dashboard"; he was "just a sticker in random places with no
 // real engagement or presence"). Dreamy is the counselor's assistant who
 // reads everything first: three lines under the greeting, each a link,
 // about what changed, not the figures the strip below already shows.
 // Everyone who needs support, in priority order, not only the first five
 // (9 Oct 2026, Chandu: "the student card row can be scrollable still,
 // right? It's not like there are only 5 students needing attention"). The
 // row scrolls sideways and the next card peeks in at the edge.
 const priority=[...roster].filter(s=>s.status!=="On Track").sort(attentionRank);
 const go=(view:string)=>router.push(`/counselor?view=${view}&v=4`);
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
 return <div className="v4-daily v4-sections">
  {/* 9 Oct: Apple's event widget + notification stack hierarchy, adapted to
      Dreamari. Two useful groups; quieter copy without losing an update. */}
  {/* The hero, rebuilt (20 Oct 2026, Chandu: "the hero is still cluttered
     ... things are all tight and crowded everywhere. We need to seriously
     rethink the design. If we need to use boxes to organise stuff where
     needed try that too"). Research-led: group by enclosure (one card per
     glance question) instead of hairline columns, the most important figure
     top-left, hierarchy from type size not color, generous padding inside
     the cards and a steady gutter between them. The greeting and the day's
     actions share one line; under it three equal cards, each one label, one
     large line and one quiet line: who is at risk, the next meeting, and
     what changed. Every figure and link the band had is still here. */}
  <section className="v4h" aria-label="Today">
   <div className="v4h-top">
    <div className="v4h-hello"><span className="v4h-date">{date||"Today"}</span><h1>Welcome back{account.name?`, ${account.name.split(" ")[0]}`:""}<span className="v4-period">.</span></h1></div>
    <div className="v4h-actions">
     {filters&&<div className="v4h-scope">{filters}</div>}
     <button className="v4-secondary-action" onClick={()=>openLog({mode:"time"})}><Clock size={16}/>Log Time</button>
     <button className="v4-primary-action" onClick={()=>go(pendingCount?"review-queue":"students")}>{pendingCount?"Start Reviewing":"Open Students"}<ArrowUpRight size={18}/></button>
    </div>
   </div>
   {/* Home in v7's shape (20 Oct 2026, Chandu: "lets try using the same
      sort of organisation level as v6 and v7 have for the home page of
      v4"): three summary cards, each one label, one big number with its
      words, one quiet line and one way in, then the picture rows. The
      student list and the review breakdown that sat under the band left
      Home; their facts are on these cards and the full lists are one click
      away (Students, Review). */}
   <div className="v4h-cards">
    {/* v7's three hero cards (20 Oct 2026, Chandu: "lets use the same hero
       cards from v7 in v4"): v7's own Stat, the label, one number, one
       line, the whole card the link, a constellation on hover; v4's
       numbers (the grade filter applies) and v4's pages behind them */}
    <Stat figure="reviews" href="/counselor?view=review-queue&v=4" label="Reviews" value={pendingCount} go="Start reviewing"
     line={topPending ? <>Most: <span className="font-semibold" style={{ color: "var(--foreground)" }}>{topPending.key}</span></> : "All caught up"} />
    <MeetingsCard roster={reviewed} />
    {/* the card opens Students on the At Risk filter, as the old card did */}
    <div className="contents" onClickCapture={()=>setStatusFilter("At Risk")}>
     <Stat figure="people" href="/counselor?view=students&v=4" label="Students who need you" value={priority.length} go="Review students"
      line={atRisk ? <><span aria-hidden className="mr-[7px] inline-block size-[7px] rounded-full align-[1px]" style={{ background: "var(--color-feedback-danger-solid)" }} /><span className="font-semibold" style={{ color: "var(--foreground)" }}>{atRisk}</span> at risk</> : "None at risk"} />
    </div>
   </div>
  </section>

  {/* today's notice from v5, only when there is one: covering for a
     teammate. Check-ins are gone from the demo (9 Oct 2026, Maisha:
     "Dreamari is focused on career readiness, and social-emotional/
     mental-health monitoring is not something our platform is currently
     promising to do") */}
  <CoverageBanner />

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
   {/* a row, like Explore's and Insights' shelves, not a coverflow
      (20 Oct 2026, Chandu: "change the carousel to a row type everywhere
      that appears"); the same ten careers, rank and student count */}
   <div className="v4-cc-rail flow-scroll" role="list" aria-label="Most saved careers">{saved.map(({career,students:n},k)=><div role="listitem" key={career.id} className={`v4-iv-poster ${k+1>=10?"is-two":""}`}><RankedPosterCard career={career} rank={k+1} chip={`${n} saved`} onClick={()=>openCareer({title:career.title,world:career.world,photo:career.photo},saved.map(x=>({title:x.career.title,world:x.career.world,photo:x.career.photo})))}/></div>)}</div>
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
