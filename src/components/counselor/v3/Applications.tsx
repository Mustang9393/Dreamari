"use client";

// Counselor Dashboard v3 (29 Sept 2026): Applications, new, on the imagined
// school integration (Parchment for transcripts, Common App for school
// forms, the National Student Clearinghouse for outcomes; all mock).
//
// Why: the research's second counselor job is managing college documents,
// the work Naviance, Scoir and MaiaLearning are built around. For each
// senior the counselor owes a transcript and a school report per college,
// plus the letter; the student owes the application. v2 tracked
// "Applications" and "Transcript Submission" as two milestones with no
// colleges or deadlines. Here every senior's colleges sit on one row with
// the next deadline and what the SCHOOL still owes, since that is the part
// only the counselor can fix; the per-college detail folds open under it.
// The colleges and deadlines are the same ones Letter requests uses, so the
// two screens always agree.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Send } from "lucide-react";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { IconTip } from "@/components/app/IconTip";
import { letterRequests, useLetterOverrides } from "@/lib/counselorLetters";
import { ALUMNI, collegeFiles, type CollegeFile, type DocState } from "@/lib/counselorSis";
import { logTime } from "@/lib/counselorTimeLog";
import { createLocalRecord, daysFromToday, shortDate } from "@/lib/localRecord";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { Avatar } from "../chips";
import { GLASS_INSET } from "../surfaces";
import { MetricRow } from "./overviewShared";
import { SubTabs } from "./SubTabs";
import { ShowAll } from "./Disclosure";
import { BigStat, BTN, BTN_STYLE, Card, CardTitle, Empty, HeroCard, SyncBadge, Verdict } from "./kit";

// DEMO-ONLY: documents the counselor sent from here (mock Parchment and
// Common App deliveries).
const sentStore = createLocalRecord<Record<string, string>>("dreamari-counselor-docs-sent", {});

type Senior = { s: CounselorStudent; files: CollegeFile[]; due: string; schoolOwes: number; docsOwed: number; letterOwed: boolean; studentOwes: number; sentAt?: string };
type Tab = "school" | "student" | "all" | "none";

const DOC_WORD: Record<DocState | "optional", string> = { done: "Sent", pending: "Waiting", missing: "Not yet", optional: "Optional" };
const DOC_COLOR: Record<DocState | "optional", string> = { done: "var(--cd-green)", pending: "var(--cd-amber)", missing: "var(--cd-red)", optional: "var(--muted-foreground)" };

function Cell({ st }: { st: DocState | "optional" }) {
  return (
    <span className="flex items-center gap-[6px] text-[12px] font-semibold whitespace-nowrap" style={{ color: st === "optional" ? "var(--muted-foreground)" : "var(--foreground)" }}>
      <span aria-hidden className="size-[7px] rounded-full" style={{ background: DOC_COLOR[st] }} />
      {DOC_WORD[st]}
    </span>
  );
}

/** Per college: what the student owes (the application) and what the
 *  school owes (transcript, school report, letter). */
export function CollegeTable({ files }: { files: CollegeFile[] }) {
  return (
    <table className="w-full min-w-[640px] border-collapse text-left">
      <thead>
        <tr className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {["College", "Plan", "Application", "Transcript", "School report", "Letter", "Scores"].map((h) => <th key={h} className="py-[6px] pr-[12px] font-bold">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {files.map((f) => (
          <tr key={f.college} className="border-t" style={{ borderColor: "var(--glass-border)" }}>
            <td className="py-[8px] pr-[12px] text-[12.5px] font-bold" style={{ color: "var(--foreground)" }}>{f.college}</td>
            <td className="py-[8px] pr-[12px] text-[12px] font-semibold whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{f.plan} · {shortDate(f.deadline)}</td>
            <td className="py-[8px] pr-[12px]"><Cell st={f.application} /></td>
            <td className="py-[8px] pr-[12px]"><Cell st={f.transcript} /></td>
            <td className="py-[8px] pr-[12px]"><Cell st={f.schoolReport} /></td>
            <td className="py-[8px] pr-[12px]"><Cell st={f.letter} /></td>
            <td className="py-[8px] pr-[12px]"><Cell st={f.scores} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** One senior's files with the counselor's "sent from here" applied. */
export function useSeniorFiles(s: CounselorStudent): CollegeFile[] | null {
  const letterO = useLetterOverrides();
  const sent = sentStore.useValue();
  const r = letterRequests([s], letterO)[0];
  if (!r) return null;
  const files = collegeFiles(s, r.recipients, r.due, r.status === "sent");
  return sent[s.id] ? files.map((f) => ({ ...f, transcript: "done", schoolReport: "done" })) : files;
}

export function Applications() {
  const router = useRouter();
  const roster = useReviewedRoster();
  const letterO = useLetterOverrides();
  const sent = sentStore.useValue();
  const [tab, setTab] = useState<Tab>("school");
  const [openId, setOpenId] = useState<string | null>(null);
  const [all, setAll] = useState(false);

  const { seniors, none } = useMemo(() => {
    const reqs = letterRequests(roster, letterO);
    const byId = new Map(roster.map((s) => [s.id, s]));
    const out: Senior[] = [];
    for (const r of reqs) {
      const s = byId.get(r.studentId);
      if (!s) continue;
      let files = collegeFiles(s, r.recipients, r.due, r.status === "sent");
      const at = sent[s.id];
      if (at) files = files.map((f) => ({ ...f, transcript: "done", schoolReport: "done" }));
      const docsOwed = files.reduce((n, f) => n + (f.transcript !== "done" ? 1 : 0) + (f.schoolReport !== "done" ? 1 : 0), 0);
      const letterOwed = r.status !== "sent";
      const studentOwes = files.filter((f) => f.application !== "done").length;
      out.push({ s, files, due: r.due, schoolOwes: docsOwed + (letterOwed ? 1 : 0), docsOwed, letterOwed, studentOwes, sentAt: at });
    }
    const withReq = new Set(out.map((x) => x.s.id));
    return { seniors: out.sort((a, b) => a.due.localeCompare(b.due) || b.schoolOwes - a.schoolOwes), none: roster.filter((s) => s.grade === 12 && !withReq.has(s.id)) };
  }, [roster, letterO, sent]);

  const apps = seniors.reduce((n, x) => n + x.files.length, 0);
  const submitted = seniors.reduce((n, x) => n + x.files.filter((f) => f.application === "done").length, 0);
  const docs = apps * 2;
  const docsSent = seniors.reduce((n, x) => n + x.files.filter((f) => f.transcript === "done").length + x.files.filter((f) => f.schoolReport === "done").length, 0);
  const soon = seniors.filter((x) => daysFromToday(x.due) <= 35 && x.schoolOwes > 0);
  const list = tab === "school" ? seniors.filter((x) => x.schoolOwes > 0) : tab === "student" ? seniors.filter((x) => x.studentOwes > 0) : seniors;
  const shown = all ? list : list.slice(0, 10);

  const sendDocs = (x: Senior) => {
    sentStore.update((o) => ({ ...o, [x.s.id]: new Date().toISOString() }));
    logTime({ activity: `Transcripts and school reports, ${x.s.name}`, minutes: 6, kind: "indirect", studentId: x.s.id });
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <HeroCard>
            <CardTitle title="Application season" unit={`${seniors.length} seniors applying`} aside={<SyncBadge label="Parchment and Common App · synced 7:15 AM" />} />
            <div className="grid grid-cols-3 gap-[var(--space-4)]">
              <BigStat value={`${submitted} of ${apps}`} label="applications submitted" />
              <BigStat value={`${docsSent} of ${docs}`} label="transcripts and school reports sent" />
              <BigStat value={String(none.length)} label="seniors with no colleges yet" tone={none.length ? "warn" : undefined} />
            </div>
            <Verdict tone={soon.length ? "warn" : "good"}>{soon.length ? `${soon.length} seniors need school documents in the next 5 weeks` : "No school documents due in the next 5 weeks"}</Verdict>
          </HeroCard>
          <Card>
            <CardTitle title="Where last year's class went" unit={`${ALUMNI.className}, National Student Clearinghouse`} />
            <div className="flex flex-col gap-[var(--space-3)]">
              <MetricRow label="Enrolled the fall after graduating" value={ALUMNI.enrolledFall} target={70} />
              <MetricRow label="Still enrolled a year later" note={ALUMNI.persistedClass} value={ALUMNI.persisted} target={80} />
            </div>
            <ul className="flex flex-col gap-[6px] border-t pt-[var(--space-3)] text-[12.5px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>
              <li className="flex justify-between gap-[8px]"><span style={{ color: "var(--muted-foreground)" }}>4-year / 2-year / under 2-year</span><span className="tabular-nums" style={{ color: "var(--foreground)" }}>{ALUMNI.fourYear}% / {ALUMNI.twoYear}% / {ALUMNI.lessThanTwo}%</span></li>
              {ALUMNI.topColleges.slice(0, 3).map((c) => <li key={c.name} className="flex justify-between gap-[8px]"><span className="truncate" style={{ color: "var(--muted-foreground)" }}>{c.name}</span><span className="tabular-nums" style={{ color: "var(--foreground)" }}>{c.n}</span></li>)}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <SubTabs
          ariaLabel="Applications"
          value={tab}
          onChange={(k) => { setTab(k); setAll(false); }}
          options={[
            { key: "school", label: "School owes", count: seniors.filter((x) => x.schoolOwes > 0).length },
            { key: "student", label: "Student owes", count: seniors.filter((x) => x.studentOwes > 0).length },
            { key: "all", label: "All applying", count: seniors.length },
            { key: "none", label: "No colleges yet", count: none.length },
          ]}
        />
        {tab === "none" ? (
          none.length === 0 ? <Empty>Every senior has a college list.</Empty> : (
            <ul className="flex flex-col gap-[8px]">
              {none.map((s) => (
                <li key={s.id} className="flex items-center gap-[12px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={GLASS_INSET}>
                  <Avatar name={s.name} size={32} index={s.avatarIndex} />
                  <span className="flex min-w-0 flex-1 flex-col leading-tight"><span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{s.name}</span><span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Plan: {s.postsecondaryIntent}</span></span>
                  <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${s.id}`)} className={BTN} style={BTN_STYLE}>Open</button>
                </li>
              ))}
            </ul>
          )
        ) : list.length === 0 ? <Empty>Nothing here.</Empty> : (
          <ul className="flex flex-col gap-[8px]">
            {shown.map((x) => {
              const open = openId === x.s.id;
              const left = daysFromToday(x.due);
              return (
                <li key={x.s.id} className="flex flex-col rounded-[var(--radius-md)] border" style={GLASS_INSET}>
                  <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] px-[12px] py-[8px]">
                    <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : x.s.id)} className="dm-quiet flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] text-left">
                      <Avatar name={x.s.name} size={32} index={x.s.avatarIndex} />
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{x.s.name}</span>
                        <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{x.files.length} {x.files.length === 1 ? "college" : "colleges"} · next {shortDate(x.due)}{left >= 0 ? `, ${left} days` : ", passed"} · {x.files[0].plan}</span>
                      </span>
                    </button>
                    <span className="w-[140px] flex-none text-right text-[12px] leading-tight font-bold" style={{ color: x.schoolOwes ? "var(--foreground)" : "var(--muted-foreground)" }}>
                      {x.docsOwed ? `${x.docsOwed} ${x.docsOwed === 1 ? "document" : "documents"} to send` : x.letterOwed ? "Letter to write" : "School is done"}
                      <span className="block text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{x.studentOwes ? `${x.studentOwes} of ${x.files.length} not submitted` : "all submitted"}</span>
                    </span>
                    {x.docsOwed === 0
                      ? (x.letterOwed
                        ? <button type="button" onClick={() => router.push(`/counselor?view=productivity&doc=recommendation-letter&student=${x.s.id}`)} className={`${BTN} w-[132px] justify-center`} style={BTN_STYLE}>Write letter</button>
                        : <span className="flex h-8 w-[132px] flex-none items-center justify-center text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>All sent</span>)
                      : <button type="button" onClick={() => sendDocs(x)} className={`${BTN} w-[132px] justify-center`} style={BTN_STYLE}><Send className="h-[13px] w-[13px]" aria-hidden /> Send documents</button>}
                    <IconTip label={open ? "Hide colleges" : "Show colleges"}>
                      <button type="button" aria-label={open ? "Hide colleges" : "Show colleges"} aria-expanded={open} onClick={() => setOpenId(open ? null : x.s.id)} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                        <ChevronDown aria-hidden className="h-4 w-4 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
                      </button>
                    </IconTip>
                  </div>
                  {open && (
                    <div className="overflow-x-auto border-t px-[12px] py-[10px]" style={{ borderColor: "var(--glass-border)" }}>
                      <CollegeTable files={x.files} />
                      <div className="flex flex-wrap gap-[8px] pt-[10px]">
                        <button type="button" onClick={() => router.push(`/counselor?view=productivity&doc=recommendation-letter&student=${x.s.id}`)} className={BTN} style={BTN_STYLE}>Open the letter</button>
                        <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${x.s.id}&tab=applications`)} className={BTN} style={BTN_STYLE}>Open profile</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {tab !== "none" && list.length > 10 && <ShowAll total={list.length} shown={10} open={all} onToggle={() => setAll((v) => !v)} />}
      </Card>
    </div>
  );
}
