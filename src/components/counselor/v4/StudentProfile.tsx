"use client";

// DEMO-ONLY v2 fork of ../StudentProfile.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx).
//
// 25 Sept 2026 pass under the v2 budget: the identity card leads with what
// needs the counselor (a "Needs you" line built from the student's own
// milestones), the milestone grid is grade-scoped and ordered attention
// first, dates read "Jan 8", no "You" badge (this is the counselor's view,
// not the student's), plain notes copy.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { goBackOr } from "@/components/app/chrome";
import {
  ChevronLeft, Bell, MessageSquare, StickyNote, Target, GraduationCap, BookOpen, Flag, Compass,
  Sparkles, Sunrise, Gamepad2, Bookmark, Landmark, Trophy, HelpCircle, MessageCircle, FileText, Briefcase,
} from "lucide-react";
import { MetricTile, Segmented } from "./viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { lastActiveLabel, milestonesForGrade, type CounselorStudent, type MilestoneKey, type MilestoneStatus } from "@/lib/counselorRoster";
import { getReviewedStudentById, useReviewDecisions } from "@/lib/counselorReviews";
import { readNotes, addNote } from "@/lib/counselorNotes";
import { StatusChip, MilestoneChip, Avatar, CardLink } from "./chips";
import { signalsFor } from "@/lib/studentSignals";
import { DraftTools } from "./ProductivitySuite";
import { Disclosure } from "./Disclosure";
import { CheckinsCard, PlanSignoffCard, TodosCard } from "./Casefile";
import { GLASS_INSET } from "../surfaces";
import { careerArtFor, DreamyMoment } from "./overviewShared";



const fmtDate = lastActiveLabel;


/** What this student needs from the counselor: their own milestones, plus
 *  the reference's two non-milestone rules (an undecided senior, an active
 *  support flag). `review` marks the ones the Review Queue can act on. */
function needsYou(s: CounselorStudent, keys: MilestoneKey[]): { text: string; review?: boolean; alert?: boolean }[] {
  const out: { text: string; review?: boolean; alert?: boolean }[] = [];
  for (const k of keys) {
    if (s.milestones[k] === "Pending Review") out.push({ text: `Review ${k}`, review: true });
    else if (s.milestones[k] === "Overdue") out.push({ text: `${k} overdue`, alert: true });
    else if (s.milestones[k] === "Changes Requested") out.push({ text: `${k} awaiting resubmission` });
  }
  if (s.grade === 12 && s.postsecondaryIntent === "Undecided") out.push({ text: "Postsecondary plan not finalized", alert: true });
  return out;
}

// Attention first, done last, so the grid reads as a to-do list.
const MILESTONE_RANK: Record<MilestoneStatus, number> = { Overdue: 0, "Changes Requested": 1, "Pending Review": 2, "In Progress": 3, "Not Started": 4, "Not Applicable": 6, Approved: 5, Completed: 5 };

type ProfileTab = "overview" | "plan" | "activity" | "notes" | "drafts";


import { GLASS_CARD as TINTED_CARD } from "../surfaces";



function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Bell; label: string; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="v4-tool-button dm-quiet flex h-9 cursor-pointer items-center gap-[8px] rounded-[var(--radius-sm)] border px-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <Icon className="h-[15px] w-[15px]" aria-hidden />
      {label}
    </button>
  );
}

function CardHead({ icon: Icon, title, accent = "var(--primary)" }: { icon: typeof Bell; title: string; accent?: string }) {
  return (
    <span className="flex items-center gap-[10px]">
      <span className="flex size-[30px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}>
        <Icon className="h-[15px] w-[15px]" aria-hidden />
      </span>
      <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{title}</h2>
    </span>
  );
}

export function StudentProfileView({ studentId }: { studentId: string }) {
  const router = useRouter();
  useReviewDecisions();
  const student = getReviewedStudentById(studentId);
  const [notes, setNotes] = useState(() => readNotes(studentId));
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [moreOpen, setMoreOpen] = useState(false);


  if (!student) {
    return (
      <div className="flex flex-col items-center gap-[10px] rounded-[var(--radius-lg)] border py-[60px] text-center" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
        <DreamyMoment mood="explore" size={72} />
        <p style={{ color: "var(--muted-foreground)" }}>Student not found.</p>
        <button type="button" onClick={() => goBackOr(router, "/counselor?view=students")} className="dm-link text-[13px] font-bold" style={{ color: "var(--primary)" }}>Back to Students</button>
      </div>
    );
  }

  const gradeKeys = milestonesForGrade(student.grade);
  const approvedCount = gradeKeys.filter((k) => student.milestones[k] === "Approved" || student.milestones[k] === "Completed").length;
  const actions = needsYou(student, gradeKeys);
  const signals = signalsFor(student);
  const orderedKeys = [...gradeKeys].sort((a, b) => MILESTONE_RANK[student.milestones[a]] - MILESTONE_RANK[student.milestones[b]]);
  const topMatch = student.topMatches[0]?.title;
  const art = careerArtFor(topMatch);

  // The reference's eight On Dreamari tiles, live from the student app
  // where a live signal exists, then v2's three extra signals folded below.
  const engagement = [
    { icon: Sparkles, value: String(signals.dreamScore), label: "Dream Score", description:"Experience points earned by completing student-app milestones." },
    { icon: Sunrise, value: String(student.engagement.dailyDropsCompleted), label: "Daily Drops completed", description:"Completed daily learning activities in the student app." },
    { icon: Gamepad2, value: String(signals.simulationsCompleted), label: "Career simulations", description:"Career simulations the student has completed." },
    { icon: Bookmark, value: String(signals.careersSaved), label: "Careers saved", description:"Careers bookmarked by the student." },
    { icon: Landmark, value: String(signals.collegesSaved), label: "Colleges saved", description:"Colleges on the student’s saved list." },
    { icon: Trophy, value: String(signals.glossaryLessonsCompleted), label: "Career challenges", description:"Completed glossary and career-learning lessons." },
    { icon: HelpCircle, value: String(student.engagement.questionsSubmitted), label: "Questions submitted", description:"Questions the student has submitted to their counselor." },
    { icon: MessageCircle, value: String(student.engagement.communityPosts), label: "Community posts", description:"Posts the student has contributed to the community." },
  ];
  const engagementMore = [
    { icon: FileText, value: signals.resumeAtsScore === null ? "None" : String(signals.resumeAtsScore), label: "Resume score", description:"Latest resume ATS review score, out of 100. None means no review yet." },
    { icon: Briefcase, value: String(signals.reportVersions), label: "Career report versions", description:"Saved versions of the student’s career report." },
    { icon: BookOpen, value: String(signals.experiencesLogged), label: "Experiences logged", description:"Work, volunteering, projects and other experiences recorded by the student." },
  ];

  const openNote = () => {
    setTab("notes");
    window.setTimeout(() => document.getElementById("counselor-note-input")?.focus(), 50);
  };

  return (
    <div className="v4-page v4-profile flex flex-col gap-[var(--space-5)]">
      <div className="v4-profile-toolbar flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => goBackOr(router, "/counselor?view=students")} className="dm-quiet flex cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> Students
        </button>
        <div className="flex flex-wrap items-center gap-[8px]">
          <ActionButton icon={MessageSquare} label="Message" onClick={() => router.push(`/counselor?view=connect&compose=1&ids=${student.id}&v=4`)} />
          <ActionButton icon={StickyNote} label="Note" onClick={openNote} />
        </div>
      </div>

      {/* Identity, calm: who, one status, and what they need from you --
         nothing that the tabs below already say (direct feedback on the
         first pass: "the student profile header is making my head spin. So
         many signals all at once"). Student number, school and DOB live in
         About the student; the milestone count lives on the Milestones card;
         the support flag is one of the "Needs you" items, not its own banner. */}
      <HoverBeam strength={0.6} className="v4-profile-identity h-full">
        <div className="v4-profile-summary v4-surface relative flex flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <div className="relative z-[1] flex min-w-0 items-center gap-[14px]">
            <Avatar name={student.name} size={56} index={student.avatarIndex} />
            <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <h1 className="text-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{student.name}</h1>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {student.grade} · {student.careerTrack} · active {fmtDate(student.lastActive).toLowerCase()}</span>
              {topMatch && <span className="v4-career-tag"><Target className="h-[12px] w-[12px]" aria-hidden />Top match: {topMatch}</span>}
            </div>
            <StatusChip status={student.status} />
          </div>
          {(actions.length > 0 || student.supportFlagReason) && (
            <ul className="relative z-[1] flex flex-col gap-[6px] border-t pt-[var(--space-3)]" style={{ borderColor: "var(--glass-border)" }}>
              {actions.map((a) => (
                <li key={a.text} className="flex items-center justify-between gap-[10px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                  <span className="flex items-center gap-[8px]">
                    <span aria-hidden className="size-[7px] flex-none rounded-full" style={{ background: a.alert ? "var(--v4-risk)" : "var(--primary)" }} />
                    {a.text}
                  </span>
                  {a.review && <CardLink onClick={() => router.push("/counselor?view=review-queue")}>Review</CardLink>}
                </li>
              ))}
              {student.supportFlagReason && (
                <li className="flex items-center gap-[8px] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                  <Flag aria-hidden className="h-[13px] w-[13px] flex-none" style={{ color: "var(--v4-warn)" }} />
                  {/* The reference's flag text uses em dashes; shown with a comma (no em dashes in UI copy). */}
                  {student.supportFlagReason.replace(/\s*[\u2014\u2013]\s*/g, ", ")}
                </li>
              )}
            </ul>
          )}
          {/* The student's top career match as the student app's own poster,
             faded in like the Career & College focus card: from the right on a wide row, as a cover behind the portrait in the desktop sidebar
             (Maisha, 7 Oct 2026: "loves the Explore cards art"; "draw it a
             little closer to the student experience"). Decorative; the
             match itself is named in the line below the name. Last child so the
             sidebar layout's `>div:first-child` rules still apply. */}
          {art && <span aria-hidden className="v4-career-art" style={{ backgroundImage: `url(${art.src})`, backgroundPosition: art.position }} />}
        </div>
      </HoverBeam>

      {/* Everything else, one group at a time (direct instruction: "organise
         and consolidate similar functions together into different tabs, the
         drafts, recommendation etc dont need to be on the main page"). */}
      <Segmented
        ariaLabel="Student profile section"
        options={[
          { key: "overview", label: "Overview" },
          { key: "plan", label: "Plan" },
          { key: "activity", label: "Activity" },
          { key: "notes", label: "Notes" },
          { key: "drafts", label: "Drafts" },
        ]}
        value={tab}
        onChange={(k) => setTab(k as ProfileTab)}
      />

      {tab === "overview" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <HoverBeam strength={0.6} className="h-full">
            <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
              <span className="flex flex-wrap items-baseline gap-x-[8px]">
                <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Milestones</h2>
                <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{approvedCount} of {gradeKeys.length} complete</span>
              </span>
              <div className="v4-student-milestone-list">
                {orderedKeys.map((key) => (
                  <span key={key} className="v4-student-milestone-row" style={GLASS_INSET}>
                    <span className="truncate text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{key}</span>
                    <MilestoneChip status={student.milestones[key]} />
                  </span>
                ))}
              </div>
            </div>
          </HoverBeam>
          <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-2">
            <HoverBeam strength={0.6} className="h-full">
              <div className="v4-surface flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
                <CardHead icon={BookOpen} title="About the Student" />
                <dl className="flex flex-col gap-[12px] text-[13px]">
                  {[
                    { icon: GraduationCap, label: "Education goals", value: student.educationGoals.join(" → ") },
                    { icon: Target, label: "Favorite career cluster", value: student.careerCluster },
                    { icon: Compass, label: "Postsecondary plan", value: student.postsecondaryIntent === "Undecided" ? "Undecided" : student.postsecondaryIntent },
                    { icon: BookOpen, label: "Student", value: `${student.tag} · ${student.school} · born ${student.dob}` },
                  ].map((r) => (
                    // dl > div > dt + dd (the only grouping a <dl> allows; the
                    // icon rides inside the dt), an axe fix from this pass.
                    <div key={r.label} className="relative flex flex-col gap-[1px] pl-[25px]">
                      <dt className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}><r.icon className="absolute top-[2px] left-0 h-[15px] w-[15px]" aria-hidden style={{ color: "var(--muted-foreground)" }} />{r.label}</dt>
                      <dd className="font-semibold" style={{ color: "var(--foreground)" }}>{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </HoverBeam>
            <HoverBeam strength={0.6} className="h-full">
              <div className="v4-surface flex h-full flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
                <CardHead icon={Target} title="Top 5 Career Matches" />
                <div className="flex flex-col gap-[10px]">
                  {student.topMatches.map((m, i) => (
                    <div key={m.title} className="flex items-center gap-[12px]">
                      <span className="flex size-[22px] flex-none items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--primary)" }}>{i + 1}</span>
                      <span className="flex min-w-0 flex-1 flex-col gap-[4px]">
                        <span className="flex items-center justify-between text-[13px] font-semibold">
                          <span style={{ color: "var(--foreground)" }}>{m.title}</span>
                          <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{m.pct}%</span>
                        </span>
                        <span className="relative block h-[6px] overflow-hidden rounded-[3px]" style={{ background: "var(--inset-border)" }}>
                          <span className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${m.pct}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--primary) 35%, transparent), var(--primary))" }} />
                        </span>
                      </span>
                    </div>
                  ))}
                  {student.topMatches.length === 0 && <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No saved matches yet.</p>}
                </div>
              </div>
            </HoverBeam>
          </div>
        </div>
      )}

      {tab === "plan" && (
        <div className="v4-student-plan">
          <HoverBeam strength={0.6} className="h-full"><TodosCard student={student} /></HoverBeam>
          <HoverBeam strength={0.6} className="h-full"><PlanSignoffCard student={student} /></HoverBeam>
        </div>
      )}

      {tab === "activity" && (
        <HoverBeam strength={0.6} className="h-full">
          <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={Sparkles} title="On Dreamari" />
            <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
              {engagement.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} description={e.description} accent="var(--primary)" />)}
            </div>
            <Disclosure id="profile-more-activity" title="More From the Student App" open={moreOpen} onToggle={() => setMoreOpen((v) => !v)}>
              <div className="grid grid-cols-2 gap-x-[var(--space-4)] gap-y-[var(--space-5)] sm:grid-cols-4">
                {engagementMore.map((e) => <MetricTile key={e.label} icon={e.icon} value={e.value} label={e.label} description={e.description} accent="var(--primary)" />)}
              </div>
            </Disclosure>
          </div>
        </HoverBeam>
      )}

      {tab === "notes" && (
        <div className="flex flex-col gap-[var(--space-4)]">
          <div className="v4-surface flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={StickyNote} title="Notes" />
            <div className="flex flex-col gap-[8px]">
              <textarea
                id="counselor-note-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="A note about this student"
                rows={2}
                className="w-full resize-none rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[13px] outline-none"
                style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              />
              <button
                type="button"
                disabled={draft.trim().length === 0}
                onClick={() => {
                  setNotes(addNote(studentId, draft.trim()));
                  setDraft("");
                }}
                className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 w-fit cursor-pointer items-center justify-center self-end rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add note
              </button>
            </div>
            {notes.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>No notes yet.</p>
            ) : (
              <ul className="flex flex-col gap-[8px]">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-[var(--radius-md)] border px-[14px] py-[10px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                    <p className="text-[13px]" style={{ color: "var(--foreground)" }}>{n.text}</p>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{new Date(n.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <HoverBeam strength={0.6} className="h-full"><CheckinsCard student={student} /></HoverBeam>
        </div>
      )}

      {tab === "drafts" && (
        <HoverBeam strength={0.6} className="h-full">
          <div className="v4-surface flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
            <CardHead icon={Sparkles} title="Drafts" />
            <DraftTools student={student} />
          </div>
        </HoverBeam>
      )}
    </div>
  );
}
