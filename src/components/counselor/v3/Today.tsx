"use client";

// Counselor Dashboard v3 (29 Sept 2026): the Overview's "Today" list and
// season strip, built from the counselor platform research.
//
// Today replaces v2's "Needs your attention" strip. v2 listed At Risk
// students only, so a counselor's actual morning (a letter due in 16 days,
// three meetings, four seniors with no FAFSA, eleven submissions waiting)
// lived on five different screens. The research's first ask is one ranked
// "who needs me today" list with a reason and one action per row; every
// row here says why in a few words and does its one thing in one click.
// Every At Risk student v2 showed is still in the list (Show all), with
// the same reason and severity word, so nothing v2 carried is lost.
//
// Ranking, most time-bound first: meetings still to come today, letters by
// days left, At Risk students by severity, then the batched jobs (reviews
// waiting, seniors with no FAFSA, seniors who have not asked for a letter).
// A job done today sinks to the bottom with a check instead of vanishing,
// so the counselor can see the morning's progress.
//
// The season strip under it is the research's "the dashboard should change
// with the calendar": three numbers for the job this season is about, each
// opening its screen. Plain glass: Student Status stays the page's one hero.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardCheck, FileSignature, Landmark, CalendarDays, CalendarX, UserRound, Mail } from "lucide-react";
import { CHRONIC_ABSENCE, sisFor } from "@/lib/counselorSis";
import { HoverBeam } from "@/components/app/HoverBeam";
import { attentionReason, attentionSeverity, MILESTONE_KEYS, type AttentionSeverity, type CounselorStudent } from "@/lib/counselorRoster";
import { addSend } from "@/lib/counselorCasefile";
import { letterRequests, notRequested, daysLeft, markDrafting, useLetterOverrides } from "@/lib/counselorLetters";
import { fafsaRows, meetsRequirement, remindFafsa, useFafsaOverrides } from "@/lib/counselorFafsa";
import { isPast, seededMeetings, timeLabel, useMeetingsDone } from "@/lib/counselorMeetings";
import { logTime } from "@/lib/counselorTimeLog";
import { currentSeason, SEASONS, type Season } from "@/lib/counselorSeason";
import { addDays, createLocalRecord, daysFromToday, isoDay, shortDate } from "@/lib/localRecord";
import { Avatar, CardLink, Go } from "../chips";
import { GLASS_CARD, GLASS_INSET } from "../surfaces";
import { ShowAll } from "./Disclosure";

const SEVERITY_COLORS: Record<AttentionSeverity, string> = {
  Critical: "var(--cd-red)",
  High: "#E8823C",
  Medium: "#8B93B8",
};

// Batched jobs done today, keyed by job, valued by the day: tomorrow the
// job comes back if it still applies.
const doneToday = createLocalRecord<Record<string, string>>("dreamari-counselor-today-done", {});

type Item = {
  key: string;
  score: number;
  student?: CounselorStudent;
  icon?: typeof Check;
  title: string;
  note: string;
  tag?: { text: string; color: string };
  action: { label: string; run: () => void };
  done?: string;
  /** clicking the row itself */
  open?: () => void;
  /** other reasons for the same student, folded into this row */
  more?: number;
};

function useTodayItems(roster: CounselorStudent[]): Item[] {
  const router = useRouter();
  const letterO = useLetterOverrides();
  const fafsaO = useFafsaOverrides();
  const meetingsDone = useMeetingsDone();
  const done = doneToday.useValue();
  const today = isoDay(new Date());
  const season = currentSeason();

  return useMemo(() => {
    const items: Item[] = [];
    const byId = new Map(roster.map((s) => [s.id, s]));
    const markDone = (key: string) => doneToday.update((d) => ({ ...d, [key]: today }));

    // Meetings today: still to come first; past ones without notes after.
    for (const m of seededMeetings(roster)) {
      const s = byId.get(m.studentId);
      if (!s || m.day > today) continue;
      const past = isPast(m);
      if (meetingsDone[m.id]) continue;
      if (m.day === today && !past) {
        items.push({ key: m.id, score: 100, student: s, title: s.name, note: `${timeLabel(m.time)} meeting · ${m.type}`, action: { label: "Prep brief", run: () => router.push(`/counselor?view=productivity&doc=student-brief&student=${s.id}`) }, open: () => router.push(`/counselor?view=meetings`) });
      } else if (past && m.day >= addDays(today, -3)) {
        items.push({ key: m.id, score: 66, student: s, title: s.name, note: `Add notes from ${m.day === today ? "today's" : shortDate(m.day)} meeting`, action: { label: "Add notes", run: () => router.push(`/counselor?view=meetings&meeting=${m.id}`) } });
      }
    }

    // Letters by days left, one row per due date: five letters due the
    // same day are one job, not five rows (density first).
    const byDue = new Map<string, { due: string; left: number; students: CounselorStudent[]; drafting: boolean }>();
    for (const r of letterRequests(roster, letterO)) {
      if (r.status === "sent") continue;
      const left = daysLeft(r);
      const s = byId.get(r.studentId);
      if (left > 30 || !s) continue;
      const g = byDue.get(r.due) ?? { due: r.due, left, students: [], drafting: false };
      g.students.push(s);
      g.drafting ||= r.status === "drafting";
      byDue.set(r.due, g);
    }
    for (const g of byDue.values()) {
      const when = g.left < 0 ? `was due ${shortDate(g.due)}` : `due ${shortDate(g.due)} · ${g.left === 0 ? "today" : `${g.left} days`}`;
      const score = g.left <= 7 ? 97 : g.left <= 21 ? 86 : 70;
      const tag = g.left <= 7 ? { text: g.left < 0 ? "Late" : "Soon", color: "var(--cd-amber)" } : undefined;
      if (g.students.length === 1) {
        const s = g.students[0];
        items.push({ key: `letter-${s.id}`, score, student: s, title: s.name, note: `Letter ${when}`, tag, action: { label: g.drafting ? "Keep writing" : "Draft letter", run: () => { markDrafting(s.id); router.push(`/counselor?view=productivity&doc=recommendation-letter&student=${s.id}`); } } });
      } else {
        items.push({ key: `letters-${g.due}`, score, icon: FileSignature, title: `${g.students.length} letters ${when.split(" · ")[0]}`, note: `${g.students.map((x) => x.name.split(" ")[0]).slice(0, 3).join(", ")}${g.students.length > 3 ? ` and ${g.students.length - 3} more` : ""}${g.left >= 0 ? ` · ${g.left} days` : ""}`, tag, action: { label: "Open letters", run: () => router.push("/counselor?view=productivity&tool=letters") } });
      }
    }

    // At Risk, by severity, with v2's own reason and severity word.
    for (const s of roster.filter((x) => x.status === "At Risk")) {
      const sev = attentionSeverity(s);
      items.push({ key: `risk-${s.id}`, score: sev === "Critical" ? 90 : sev === "High" ? 76 : 62, student: s, title: s.name, note: attentionReason(s), tag: { text: sev, color: SEVERITY_COLORS[sev] }, action: { label: "Open", run: () => router.push(`/counselor?view=students&studentId=${s.id}`) } });
    }

    // School record (the imagined SIS): a failing course or a senior short
    // on credits is a row of its own; chronic absence is one batched row.
    for (const s of roster) {
      const r = sisFor(s);
      const f = r.courses.find((c) => c.letter === "F");
      if (f) items.push({ key: `grade-${s.id}`, score: 89, student: s, title: s.name, note: `F in ${f.name}, ${f.pct}%`, tag: { text: "Grades", color: "var(--cd-red)" }, action: { label: "Meeting brief", run: () => router.push(`/counselor?view=productivity&doc=student-brief&student=${s.id}`) }, open: () => router.push(`/counselor?view=students&studentId=${s.id}&tab=academics`) });
      else if (s.grade === 12 && !r.onTrackToGraduate) items.push({ key: `credits-${s.id}`, score: 87, student: s, title: s.name, note: `${r.credits.expected - r.credits.earned} credits short to graduate`, tag: { text: "Credits", color: "var(--cd-red)" }, action: { label: "Recovery plan", run: () => router.push(`/counselor?view=productivity&doc=success-plan&student=${s.id}`) }, open: () => router.push(`/counselor?view=students&studentId=${s.id}&tab=academics`) });
    }
    const absent = roster.filter((s) => sisFor(s).attendance.rate < CHRONIC_ABSENCE);
    if (absent.length) items.push({ key: "absence", score: 74, icon: CalendarX, title: `${absent.length} students chronically absent`, note: `Under ${CHRONIC_ABSENCE}% attendance this fall`, action: { label: "See who", run: () => router.push("/counselor?view=academics") } });

    // Batched jobs.
    const pending = roster.reduce((n, s) => n + MILESTONE_KEYS.filter((k) => s.milestones[k] === "Pending Review").length, 0);
    if (pending) items.push({ key: "reviews", score: 80, icon: ClipboardCheck, title: `${pending} submissions waiting`, note: "Review Queue", action: { label: "Review", run: () => router.push("/counselor?view=review-queue") } });

    if (season === "fall" || season === "winter") {
      const noFafsa = fafsaRows(roster, fafsaO).filter((r) => r.state === "not-submitted");
      if (noFafsa.length) {
        const key = "fafsa-remind";
        items.push({
          key, score: 78, icon: Landmark, title: `${noFafsa.length} seniors have not filed the FAFSA`, note: "Required to graduate in Illinois",
          done: done[key] === today ? "Reminded today" : undefined,
          action: { label: `Remind ${noFafsa.length}`, run: () => { const ids = noFafsa.map((r) => r.student.id); remindFafsa(ids); addSend({ kind: "reminder", text: "Your FAFSA is not submitted yet. Book a Financial aid meeting if your family needs help.", studentIds: ids, audience: "Seniors without a FAFSA" }); logTime({ activity: "FAFSA reminders", minutes: 3, kind: "indirect" }); markDone(key); } },
          open: () => router.push("/counselor?view=financial-aid"),
        });
      }
    }
    if (season === "fall") {
      const asked = notRequested(roster);
      if (asked.length) {
        const key = "letters-ask";
        items.push({
          key, score: 58, icon: Mail, title: `${asked.length} seniors have not asked for a letter`, note: "Ask for a brag sheet now",
          done: done[key] === today ? "Reminded today" : undefined,
          action: { label: `Remind ${asked.length}`, run: () => { addSend({ kind: "reminder", text: "If you want a recommendation letter, request it and fill in your brag sheet this week.", studentIds: asked.map((s) => s.id), audience: "Seniors without a letter request" }); logTime({ activity: "Letter reminders", minutes: 2, kind: "indirect" }); markDone(key); } },
        });
      }
    }

    // One row per student: their most urgent reason leads, the rest are
    // counted, so a student with a failing grade AND an overdue milestone
    // is one job, not two rows (density first).
    const sorted = items.sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || b.score - a.score);
    const seen = new Map<string, Item>();
    const out: Item[] = [];
    for (const it of sorted) {
      const id = it.student?.id;
      if (!id) { out.push(it); continue; }
      const first = seen.get(id);
      if (!first) { seen.set(id, it); out.push(it); continue; }
      first.more = (first.more ?? 0) + 1;
    }
    return out;
  }, [roster, letterO, fafsaO, meetingsDone, done, today, season, router]);
}

export function TodayCard({ roster }: { roster: CounselorStudent[] }) {
  const router = useRouter();
  const items = useTodayItems(roster);
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 5);
  const open = items.filter((i) => !i.done).length;
  const btn = "dm-quiet flex h-8 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[11px] text-[12.5px] font-bold";
  return (
    <div className="group flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
      <div className="flex flex-wrap items-center justify-between gap-[8px]">
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>
          Today
          <span className="ml-[8px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{open} to do</span>
        </h2>
        <CardLink onClick={() => router.push("/counselor?view=students")}>Students</CardLink>
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing is waiting on you today.</p>
      ) : (
        <ul className="flex flex-col gap-[6px]">
          {shown.map((it) => {
            const Icon = it.icon;
            return (
              <li key={it.key} className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={{ ...GLASS_INSET, opacity: it.done ? 0.62 : 1 }}>
                <button type="button" onClick={it.open ?? (it.student ? () => router.push(`/counselor?view=students&studentId=${it.student!.id}`) : it.action.run)} className="dm-quiet group/row flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] text-left">
                  {it.student ? <Avatar name={it.student.name} size={32} index={it.student.avatarIndex} /> : (
                    <span className="flex size-[32px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--primary)" }}>{Icon ? <Icon className="h-[15px] w-[15px]" aria-hidden /> : <UserRound className="h-[15px] w-[15px]" aria-hidden />}</span>
                  )}
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{it.title}</span>
                    <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                      {it.note}
                      {it.more ? ` · ${it.more} more` : ""}
                      {it.tag && <span className="ml-[8px] text-[10.5px] font-extrabold tracking-[0.04em] uppercase" style={{ color: it.tag.color }}>{it.tag.text}</span>}
                    </span>
                  </span>
                </button>
                {it.done ? (
                  <span className="flex h-8 flex-none items-center gap-[6px] px-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}><Check className="h-[13px] w-[13px]" aria-hidden style={{ color: "var(--cd-green)" }} />{it.done}</span>
                ) : (
                  <button type="button" onClick={it.action.run} className={btn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{it.action.label}</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {items.length > 5 && <ShowAll total={items.length} shown={5} open={all} onToggle={() => setAll((o) => !o)} />}
    </div>
  );
}

// ---- Season strip ----------------------------------------------------------

type Tile = { label: string; value: string; note: string; view: string; icon: typeof Check };

function seasonTiles(season: Season, roster: CounselorStudent[], letterO: ReturnType<typeof useLetterOverrides>, fafsaO: ReturnType<typeof useFafsaOverrides>): Tile[] {
  const seniors = roster.filter((s) => s.grade === 12);
  const fafsa = fafsaRows(roster, fafsaO);
  const filed = fafsa.filter(meetsRequirement).length;
  const letters = letterRequests(roster, letterO);
  const open = letters.filter((r) => r.status !== "sent");
  const dueSoon = open.filter((r) => daysLeft(r) <= 30).length;
  const doneOf = (k: (typeof MILESTONE_KEYS)[number], list: CounselorStudent[]) => list.filter((s) => s.milestones[k] === "Approved" || s.milestones[k] === "Completed").length;
  const fafsaTile: Tile = { label: "FAFSA filed", value: `${filed} of ${fafsa.length}`, note: "seniors, or opted out", view: "financial-aid", icon: Landmark };
  switch (season) {
    case "fall":
      return [
        { label: "Letters due in 30 days", value: String(dueSoon), note: `${open.length} open, ${letters.length - open.length} sent`, view: "productivity&tool=letters", icon: FileSignature },
        fafsaTile,
        { label: "Applications done", value: `${doneOf("Applications", seniors)} of ${seniors.length}`, note: "seniors", view: "milestones", icon: ClipboardCheck },
      ];
    case "winter": {
      const under = roster.filter((s) => s.grade < 12);
      return [
        fafsaTile,
        { label: "Academic plans done", value: `${doneOf("Academic Plan", under)} of ${under.length}`, note: "Grades 9 to 11, before registration", view: "milestones", icon: ClipboardCheck },
        { label: "Meetings this week", value: String(seededMeetings(roster).filter((m) => Math.abs(daysFromToday(m.day)) < 4).length), note: "booked in office hours", view: "meetings", icon: CalendarDays },
      ];
    }
    case "spring":
      return [
        { label: "Transcripts sent", value: `${doneOf("Transcript Submission", seniors)} of ${seniors.length}`, note: "before May 1 decisions", view: "milestones", icon: FileSignature },
        { label: "Seniors with a plan", value: `${seniors.filter((s) => s.postsecondaryIntent !== "Undecided").length} of ${seniors.length}`, note: "college, trade, work or service", view: "students", icon: UserRound },
        fafsaTile,
      ];
    case "summer":
      return [
        { label: "Seniors with a plan", value: `${seniors.filter((s) => s.postsecondaryIntent !== "Undecided").length} of ${seniors.length}`, note: "check in before fall", view: "students", icon: UserRound },
        { label: "Transcripts sent", value: `${doneOf("Transcript Submission", seniors)} of ${seniors.length}`, note: "final transcripts", view: "milestones", icon: FileSignature },
        fafsaTile,
      ];
  }
}

export function SeasonStrip({ roster }: { roster: CounselorStudent[] }) {
  const router = useRouter();
  const season = currentSeason();
  const letterO = useLetterOverrides();
  const fafsaO = useFafsaOverrides();
  const tiles = seasonTiles(season, roster, letterO, fafsaO);
  const s = SEASONS[season];
  return (
    <section aria-label={`${s.label} focus`} className="flex flex-col gap-[var(--space-3)]">
      <div className="flex flex-wrap items-baseline gap-x-[10px] gap-y-[2px]">
        <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>{s.label} focus</h2>
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.focus}</span>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <HoverBeam key={t.label} strength={0.5} className="h-full">
              <button type="button" onClick={() => router.push(`/counselor?view=${t.view}`)} className="group flex h-full w-full cursor-pointer flex-col gap-[6px] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={GLASS_CARD}>
                <span className="flex items-center justify-between gap-[8px]">
                  <span className="flex items-center gap-[8px] text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}><Icon className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} />{t.label}</span>
                  <Go />
                </span>
                <span className="text-[26px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{t.value}</span>
                <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.note}</span>
              </button>
            </HoverBeam>
          );
        })}
      </div>
    </section>
  );
}
