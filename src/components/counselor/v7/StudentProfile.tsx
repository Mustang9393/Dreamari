"use client";

// A student, opened (the Replit's student profile, 20 Oct 2026): who they
// are, three actions (Prepare meeting, Message, Add note), and five tabs:
// About Me, Postsecondary Plan, Career Plan, Course Planner, Activity.
//
// Kept from the Replit: the tabs and every section in them. Filled with
// real reads where the app has them instead of the Replit's placeholders:
// schools that fit from the student Explore Schools engine, the Top 3 as
// the student app's posters, courses and credits from the SIS record,
// meetings from the shared calendar. Changed: one lit action (Prepare
// meeting); About Me's two goal cards open the matching tab rather than
// repeating it.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, NotebookPen, CalendarCheck } from "lucide-react";
import { goBackOr } from "@/components/app/chrome";
import { PosterCard } from "@/components/app/PosterCard";
import { NotFoundView } from "@/components/app/states";
import { TextTabs } from "@/components/app/TextTabs";
import { LightRange } from "@/components/app/LightRange";
import { Listbox } from "@/components/app/Listbox";
import { pathwayFor, schoolsFor, type SchoolMatch } from "@/components/colleges/pathway";
import { SchoolCard, type CardBadge } from "@/components/colleges/shared";
import { isPast, timeLabel } from "@/lib/counselorMeetings";
import { toggleShortlist, useShortlist } from "@/lib/counselorBriefs";
import { addNote, readNotes } from "@/lib/counselorNotes";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { lastActiveLabel, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { sisFor } from "@/lib/counselorSis";
import { careerById, toV5 } from "@/lib/counselorV5";
import { EMPTY_PROFILE } from "@/lib/studentProfile";
import { signalsFor } from "@/lib/studentSignals";
import { openCareer, openSchool } from "../v5/ExploreSheets";
import { notify } from "../v5/LogSheet";
import { StudentIdCard } from "../v4/StudentProfile";
import { flagsFor, useAllMeetings } from "./data";
import { interestOf, planOf } from "./Students";
import { coursesToConsider, prefsFor } from "./studentData";
import { moment, FIGURE, H2, H3, CARD, CARD_STYLE, DISPLAY, FIELD_STYLE, Modal, MUTED, OVERLINE, PrimaryButton, QuietButton, RULE, TextLink, briefHref, v7 } from "./ui";

type Tab = "about" | "postsecondary" | "career" | "courses" | "activity";
const TABS: { key: Tab; label: string }[] = [
  { key: "about", label: "About Me" },
  { key: "postsecondary", label: "Postsecondary Plan" },
  { key: "career", label: "Career Plan" },
  { key: "courses", label: "Course Planner" },
  { key: "activity", label: "Activity" },
];
const FIT_TONE: Record<string, CardBadge["tone"]> = { Reach: "reach", Target: "target", Safety: "safety", "Open admission": "open" };
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function StudentProfile({ studentId, initialTab }: { studentId: string; initialTab?: string }) {
  const router = useRouter();
  const roster = useReviewedRoster();
  const row = roster.find((r) => r.id === studentId);
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.key === initialTab) ? (initialTab as Tab) : "about");
  const [noting, setNoting] = useState(false);
  if (!row) return <div className="py-[var(--space-12)]"><NotFoundView what="student" home="Back to Students" homeHref={v7("students")} /></div>;

  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <button type="button" onClick={() => goBackOr(router, v7("students"))} className="dm-link inline-flex w-fit cursor-pointer items-center gap-[6px] text-[14px] font-semibold" style={MUTED}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      {/* The header is the student's ID tag, the same one v4 uses (21 Oct
         2026, Chandu: "can we do the same student ID and counselor ID
         designs for v7?", then "don't change the other content from what was
         there in v7 before. Just the header becomes the ID card on the left
         instead"). The tag carries name, grade, status and last active; the
         three actions stay at the header's right. Everything below is as it
         was. The tag's styles are v4's own (today.css), scoped to
         data-counselor-version="v4". */}
      <header className="flex flex-col gap-[var(--space-5)] lg:flex-row lg:items-center lg:justify-between">
        <div data-counselor-version="v4" className="mx-auto w-full max-w-[300px] lg:mx-0"><StudentIdCard student={row} /></div>
        <div className="flex flex-wrap items-center justify-center gap-[var(--space-2)]">
          <PrimaryButton href={briefHref(row.id)} icon={<CalendarCheck className="h-4 w-4" aria-hidden />}>Prepare meeting</PrimaryButton>
          <QuietButton href={v7("reviews", `&tab=messages&studentId=${encodeURIComponent(row.id)}`)} icon={<MessageCircle className="h-4 w-4" aria-hidden />}>Message</QuietButton>
          <QuietButton onClick={() => setNoting(true)} icon={<NotebookPen className="h-4 w-4" aria-hidden />}>Add note</QuietButton>
        </div>
      </header>

      {/* five tabs fit from 640px; below that they become one dropdown
         (standing rule: a tab set wider than the screen is a dropdown) */}
      <div className="hidden sm:block"><TextTabs items={TABS} value={tab} onChange={setTab} ariaLabel="Student sections" layoutId="v7-student-tabs" soft caps={false} /></div>
      <div className="sm:hidden">
        <Listbox ariaLabel="Student section" value={tab} onChange={(v) => setTab(v as Tab)} options={TABS.map((t) => ({ value: t.key, label: t.label }))}
          className="h-11 w-full rounded-[var(--radius-md)] border px-[12px] text-[15px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" }} />
      </div>

      {tab === "about" ? <AboutMe row={row} onTab={setTab} />
        : tab === "postsecondary" ? <Postsecondary row={row} />
        : tab === "career" ? <CareerPlan row={row} />
        : tab === "courses" ? <Courses row={row} />
        : <Activity row={row} roster={roster} />}

      {noting && <NoteSheet row={row} onClose={() => setNoting(false)} />}
    </div>
  );
}

// ---- shared bits ---------------------------------------------------------------

function Panel({ title, children, action, className = "" }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <section className={`${CARD} flex flex-col gap-[var(--space-4)] p-[var(--space-5)] sm:p-[var(--space-6)] ${className}`} style={CARD_STYLE}>
      <h2 className={OVERLINE} style={MUTED}>{title}</h2>
      {children}
      {action && <div className="mt-auto pt-[var(--space-2)]">{action}</div>}
    </section>
  );
}

/** label / value rows divided by hairlines */
function Lines({ items }: { items: { label: string; value: React.ReactNode; muted?: boolean }[] }) {
  return (
    <dl className="flex flex-col">
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline justify-between gap-[var(--space-4)] border-t py-[10px] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
          <dt className="flex-none text-[14px] whitespace-nowrap" style={MUTED}>{it.label}</dt>
          <dd className="text-right text-[14px] font-semibold" style={it.muted ? MUTED : undefined}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const STATUS_WORD: Record<MilestoneStatus, string> = { Approved: "Done", Completed: "Done", "Pending Review": "To review", "Changes Requested": "Needs changes", "In Progress": "In progress", "Not Started": "Not started", Overdue: "Overdue", "Not Applicable": "Not yet" };
const STATUS_INK: Partial<Record<MilestoneStatus, string>> = { Overdue: "var(--color-feedback-danger-solid)", "Changes Requested": "var(--color-feedback-warning-solid)" };

function MilestoneLines({ row, keys }: { row: CounselorStudent; keys: MilestoneKey[] }) {
  return (
    <ol className="flex flex-col">
      {keys.map((k, i) => {
        const st = row.milestones[k];
        return (
          <li key={k} className="flex items-center gap-[var(--space-3)] border-t py-[10px] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
            <span className="w-[22px] text-[13px] font-semibold tabular-nums" style={MUTED}>{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{k}</span>
            <span className="text-[13px] font-semibold" style={{ color: STATUS_INK[st] ?? "var(--muted-foreground)" }}>{STATUS_WORD[st]}</span>
          </li>
        );
      })}
    </ol>
  );
}

function useTop3(row: CounselorStudent) {
  return useMemo(() => {
    const s = toV5(row);
    const top = s.dreamari.top3.map(careerById).filter((c): c is NonNullable<typeof c> => !!c);
    const saved = s.dreamari.saved.map(careerById).filter((c): c is NonNullable<typeof c> => !!c).filter((c) => !top.some((t) => t.id === c.id));
    return { top, saved, s };
  }, [row]);
}

// ---- About Me ------------------------------------------------------------------

function AboutMe({ row, onTab }: { row: CounselorStudent; onTab: (t: Tab) => void }) {
  const { top } = useTop3(row);
  const p = prefsFor(row);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        <Panel title="Postsecondary goal" action={<TextLink onClick={() => onTab("postsecondary")}>View postsecondary plan</TextLink>}>
          <span className={H3} style={DISPLAY}>{planOf(row)}</span>
          <Lines items={[{ label: "Schools saved", value: row.engagement.collegesSaved }, { label: "Applications", value: STATUS_WORD[row.milestones.Applications] }]} />
        </Panel>
        <Panel title="Career goal" action={<TextLink onClick={() => onTab("career")}>View career plan</TextLink>}>
          <span className={H3} style={DISPLAY}>{top[0]?.title ?? interestOf(row)}</span>
          <Lines items={[{ label: "Also in Top 3", value: top.length > 1 ? top.slice(1).map((c) => c.title).join(" · ") : "Not picked yet", muted: top.length < 2 }, { label: "Careers saved", value: row.engagement.careersSaved }]} />
        </Panel>
      </div>
      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-col gap-[4px]">
          <h2 className={H2} style={DISPLAY}>Preferences</h2>
        </div>
        <dl className={`${CARD} grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-3`} style={CARD_STYLE}>
          {[
            { label: "Subjects", value: p.subjects },
            { label: "Industries", value: p.industries },
            { label: "Location", value: p.location },
            { label: "Education", value: p.education },
            { label: "Tuition budget", value: p.budget },
            { label: "Work style", value: p.style },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-[4px] border-b p-[var(--space-5)] sm:border-r" style={{ borderColor: RULE }}>
              <dt className={OVERLINE} style={MUTED}>{f.label}</dt>
              <dd className="text-[15px] leading-[21px] font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

// ---- Postsecondary Plan --------------------------------------------------------

function Postsecondary({ row }: { row: CounselorStudent }) {
  const { top } = useTop3(row);
  const gpa = sisFor(row).gpa;
  const career = top[0];
  // the same per-student shortlist the meeting brief saves to
  const short = useShortlist(row.id);
  const schools = useMemo(() => {
    const pathway = career ? pathwayFor(career.id) : null;
    if (!pathway) return [] as SchoolMatch[];
    const path = row.postsecondaryIntent === "Trade/Technical School" ? "trades" : row.postsecondaryIntent === "Undecided" ? "both" : "college";
    // DEMO-ONLY: the demo school is in New Jersey; production reads the
    // student's own state preferences.
    const g = schoolsFor(pathway, { ...EMPTY_PROFILE, gpa: gpa.toFixed(2), gpaType: "unweighted", states: ["New Jersey"], path });
    return [g.reach[0], g.target[0], g.safety[0]].filter((m): m is SchoolMatch => !!m);
  }, [career, row.postsecondaryIntent, gpa]);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <section className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
          <h2 className={H2} style={DISPLAY}>Schools That Fit</h2>
          {career && <span className="text-[14px] font-semibold" style={MUTED}>For {career.title} · GPA {gpa.toFixed(1)}</span>}
        </div>
        {schools.length ? (
          <div className="-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
            {schools.map((m) => (
              <div key={m.college.slug} className="w-[280px] flex-none lg:w-auto">
                <SchoolCard c={m.college} onOpen={() => openSchool(m.college, schools.map((x) => x.college))} saved={short.includes(m.college.slug)} onSave={() => toggleShortlist(row.id, m.college.slug)} compared={false} program={m.program} fit={FIT_TONE[m.fit] ? { label: m.fit, tone: FIT_TONE[m.fit] } : undefined} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[15px]" style={MUTED}>No schools to suggest until {row.name.split(" ")[0]} picks a career.</p>
        )}
      </section>
      <Panel title="Milestones">
        <MilestoneLines row={row} keys={["School Exploration", "School List", "Applications", "Financial Aid"]} />
      </Panel>
    </div>
  );
}

// ---- Career Plan ---------------------------------------------------------------

function CareerPlan({ row }: { row: CounselorStudent }) {
  const { top, saved } = useTop3(row);
  const sig = signalsFor(row);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <section className="flex flex-col gap-[var(--space-4)]">
        <h2 className={H2} style={DISPLAY}>Top 3 Careers</h2>
        {top.length ? (
          <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:max-w-[720px]">
            {top.map((c) => <PosterCard key={c.id} fill career={{ title: c.title, world: c.world, photo: c.photo }} onClick={() => openCareer({ title: c.title, world: c.world, photo: c.photo })} />)}
          </div>
        ) : <p className="text-[15px]" style={MUTED}>No Top 3 yet.</p>}
      </section>
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        <Panel title="Saved careers">
          {saved.length ? (
            <div className="flex flex-wrap gap-[8px]">
              {saved.slice(0, 8).map((c) => (
                <button key={c.id} type="button" onClick={() => openCareer({ title: c.title, world: c.world, photo: c.photo })} className="dm-quiet inline-flex h-9 cursor-pointer items-center rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>{c.title}</button>
              ))}
            </div>
          ) : <p className="text-[14px]" style={MUTED}>Nothing saved beyond the Top 3.</p>}
        </Panel>
        <Panel title="Learning and next steps">
          <Lines items={[
            { label: "Simulations", value: `${sig.simulationsCompleted} completed`, muted: !sig.simulationsCompleted },
            { label: "Glossary games", value: `${sig.glossaryLessonsCompleted} lessons`, muted: !sig.glossaryLessonsCompleted },
            { label: "Career Report", value: STATUS_WORD[row.milestones["Career Report"]] },
            { label: "Career Pathway", value: STATUS_WORD[row.milestones["Career Pathway"]] },
          ]} />
        </Panel>
      </div>
    </div>
  );
}

// ---- Course Planner ------------------------------------------------------------

function Courses({ row }: { row: CounselorStudent }) {
  const sis = sisFor(row);
  // areas not yet earned; in-progress credits are named, not counted as done
  const remaining = sis.requirements.filter((r) => r.area !== "Total" && r.earned < r.required);
  const pct = Math.round((sis.credits.earned / sis.credits.required) * 100);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        <Panel title="Current courses">
          <ul className="flex flex-col">
            {sis.courses.map((c) => (
              <li key={c.id} className="flex items-center gap-[var(--space-3)] border-t py-[10px] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{c.name}</span>
                <span className="text-[13px]" style={MUTED}>{c.level === "Regular" ? "" : c.level}</span>
                <span className="w-[28px] text-right text-[14px] font-extrabold tabular-nums" style={{ color: c.letter === "D" || c.letter === "F" ? "var(--color-feedback-danger-solid)" : undefined }}>{c.letter}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Graduation progress">
          <p className="flex items-end gap-[10px]">
            <span className={FIGURE} style={DISPLAY}>{sis.credits.earned}</span>
            <span className="pb-[4px] text-[14px] font-semibold" style={MUTED}>of {sis.credits.required} credits · {sis.onTrackToGraduate ? "on track" : "behind"}</span>
          </p>
          {/* a bullet, not a bar (Few; house LightRange): 0 to required, lit at earned */}
          <LightRange accent={sis.onTrackToGraduate ? "var(--primary)" : "var(--color-feedback-warning-solid)"} at={pct}
            ariaLabel={`${sis.credits.earned} of ${sis.credits.required} credits`} />
          {remaining.length > 0 && <Lines items={remaining.slice(0, 5).map((r) => ({ label: r.area, value: `${r.required - r.earned} left${r.inProgress ? `, ${r.inProgress} in progress` : ""}` }))} />}
        </Panel>
      </div>
      <Panel title={`Courses to consider for ${interestOf(row)}`}>
        <div className="flex flex-wrap gap-[8px]">
          {coursesToConsider(row).map((c) => <span key={c} className="inline-flex h-9 items-center rounded-full border px-[14px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>{c}</span>)}
        </div>
        <p className="text-[13px]" style={MUTED}>Ideas to talk through together, not requirements.</p>
      </Panel>
    </div>
  );
}

// ---- Activity ------------------------------------------------------------------

function Activity({ row, roster }: { row: CounselorStudent; roster: CounselorStudent[] }) {
  const meetings = useAllMeetings(roster);
  const sig = signalsFor(row);
  const e = row.engagement;
  const { top } = useTop3(row);
  const mine = meetings.filter((m) => m.studentId === row.id);
  const now = new Date();
  const notes = readNotes(row.id);
  const stats = [
    { value: lastActiveLabel(row.lastActive), label: "Last active" },
    { value: String(e.careersSaved), label: "Careers saved" },
    { value: `${top.length} / 3`, label: "Top 3 careers" },
    { value: String(e.collegesSaved), label: "Schools saved" },
    { value: String(sig.simulationsCompleted), label: "Simulations done" },
    { value: String(sig.glossaryLessonsCompleted), label: "Glossary lessons" },
    { value: String(e.questionsSubmitted), label: "Questions asked" },
    { value: sig.resumeStarted ? "Started" : "Not yet", label: "Resume" },
  ];
  // one thing worth asking about, the most useful first
  const flags = flagsFor(row);
  const talk = flags.length ? { title: flags[0], line: "Ask what is getting in the way, and agree on one next step." }
    : top[1] ? { title: "Two careers in the running", line: `${top[0].title} and ${top[1].title} are both in the Top 3. Ask which one feels closer.` }
    : { title: "Keep the momentum", line: "Ask what they want to explore next." };
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <dl className={`${CARD} grid grid-cols-2 sm:grid-cols-4`} style={CARD_STYLE}>
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-[2px] border-b p-[var(--space-5)] sm:border-r" style={{ borderColor: RULE }}>
            <dd className="text-[24px] leading-[30px] font-extrabold tabular-nums" style={DISPLAY}>{s.value}</dd>
            <dt className="text-[13px] font-semibold" style={MUTED}>{s.label}</dt>
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
        <Panel title="Worth a conversation">
          <p className={H3} style={DISPLAY}>{talk.title}</p>
          <p className="text-[14px] leading-[22px]" style={MUTED}>{talk.line}</p>
        </Panel>
        <Panel title="Meetings">
          {mine.length ? (
            <ul className="flex flex-col">
              {mine.slice(-5).reverse().map((m) => {
                const d = new Date(`${m.day}T12:00:00`);
                return (
                  <li key={m.id} className="flex items-center gap-[var(--space-3)] border-t py-[10px] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
                    <span className="w-[96px] flex-none text-[13px] font-semibold tabular-nums" style={MUTED}>{DAY[d.getDay()]} {MON[d.getMonth()]} {d.getDate()}</span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{m.type}</span>
                    <span className="text-[13px]" style={MUTED}>{isPast(m, now) ? "Done" : timeLabel(m.time)}</span>
                  </li>
                );
              })}
            </ul>
          ) : <p className="text-[14px]" style={MUTED}>No meetings yet.</p>}
        </Panel>
      </div>
      {notes.length > 0 && (
        <Panel title="Your notes">
          <ul className="flex flex-col">
            {notes.slice(0, 5).map((n) => (
              <li key={n.id} className="flex flex-col gap-[2px] border-t py-[10px] first:border-t-0 first:pt-0" style={{ borderColor: RULE }}>
                <span className="text-[13px]" style={MUTED}>{new Date(n.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                <span className="text-[14px] leading-[21px]">{n.text}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function NoteSheet({ row, onClose }: { row: CounselorStudent; onClose: () => void }) {
  const [text, setText] = useState("");
  const save = () => {
    if (!text.trim()) return;
    addNote(row.id, text.trim());
    notify(`Note saved for ${row.name.split(" ")[0]}`);
    moment();
    onClose();
  };
  return (
    <Modal overline={row.name} title="Add a note" onClose={onClose}
      footer={<PrimaryButton onClick={save}>Save note</PrimaryButton>}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} aria-label="Note" placeholder="What happened? What comes next?"
        className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent p-[12px] text-[15px] leading-[22px] outline-none focus-visible:ring-2" style={FIELD_STYLE} />
    </Modal>
  );
}
