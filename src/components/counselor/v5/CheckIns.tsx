"use client";

// Students > Check-ins (7 Oct 2026; Chandu: "build everything" from the
// research list). The SchooLinks pattern the 25 Sept notes describe: this
// week's answers across four areas as good / okay / low bars, the students
// to reach first (any low answer) with a one-tap walk-in or booking, and the
// notes students left. DEMO-ONLY data (family.ts) until the student app
// sends a weekly check-in.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarPlus, Send, UserRound } from "lucide-react";
import { useCheckInRequests } from "@/lib/weeklyCheckIn";
import { openSendCheckIn } from "./CheckInSend";
import { IconTip } from "@/components/app/IconTip";
import { cv } from "@/lib/counselorBase";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { DrawRing } from "./charts";
import { CHECK_DIMS, LEVEL_INK, alertIn, alertKey, checkInFor, whenText, type Level } from "./family";
import { openCheckIn } from "./CheckInSheet";
import { markAlertHandled, readSafetyContacts, sendOnce, useHandledAlerts, useOutbox, useSafetyContacts } from "@/lib/counselorOutbox";
import { notify, openLog } from "./LogSheet";
import { StudentFace } from "./StudentFace";

const RULE = "color-mix(in srgb, var(--foreground) 10%, transparent)";
const LEVELS: Level[] = ["good", "okay", "low"];

function Title({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
      <h2 className="text-[20px] leading-[26px] font-semibold sm:text-[22px] sm:leading-[28px]" style={{ fontFamily: "var(--font-display)" }}>{children}</h2>
      {aside}
    </div>
  );
}

export function CheckInsView() {
  const roster = useReviewedRoster();
  const [all, setAll] = useState(false);
  const rows = useMemo(() => roster.map((s) => ({ s, c: checkInFor(s) })), [roster]);
  const answered = rows.filter((r) => r.c.answered);
  const reach = answered
    .map((r) => ({ ...r, lows: CHECK_DIMS.filter((d) => r.c.levels[d] === "low") }))
    .filter((r) => r.lows.length)
    .sort((a, b) => b.lows.length - a.lows.length);
  const notes = answered.filter((r) => r.c.note).sort((a, b) => a.c.daysAgo - b.c.daysAgo);
  // notes with an alert word come first, before any chart
  const allAlerts = useMemo(() => rows.filter((r) => r.c.answered && alertIn(r.c.note)), [rows]);
  const handled = useHandledAlerts();
  const lastSent = useCheckInRequests()[0];
  const outbox = useOutbox();
  const contacts = useSafetyContacts();
  const alerts = allAlerts.filter((r) => !handled[alertKey(r.s.id)]);
  const handledCount = allAlerts.length - alerts.length;
  // each alert goes to the school's safety contacts once (DEMO-ONLY send)
  useEffect(() => {
    for (const r of allAlerts) {
      sendOnce({ kind: "alert", key: alertKey(r.s.id), to: readSafetyContacts().map((c) => c.email), subject: `Check-in alert: ${r.s.name}, Grade ${r.s.grade}` });
    }
  }, [allAlerts]);
  const sentAt = (id: string) => outbox.find((e) => e.key === alertKey(id))?.at;
  const share = (d: (typeof CHECK_DIMS)[number], l: Level) => Math.round((answered.filter((r) => r.c.levels[d] === l).length / Math.max(1, answered.length)) * 100);
  const href = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;

  return (
    <div className="flex flex-col gap-[48px]">
      {/* check-ins go out from here (8 Oct 2026: the student app no longer
         shows a standing card; a counselor sends one) */}
      <div className="-mb-[var(--space-6)] flex flex-wrap items-center justify-between gap-[var(--space-3)]">
        <p className="text-[14.5px]" style={{ color: "var(--muted-foreground)" }}>{lastSent ? `Last sent ${new Date(lastSent.at).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })} to ${lastSent.label === "Everyone" ? `all ${lastSent.count}` : `${lastSent.label} (${lastSent.count})`}.` : "Students answer when you send a check-in."}</p>
        <button type="button" onClick={() => openSendCheckIn()} className="dm-solid inline-flex min-h-[42px] cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14.5px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><Send className="h-4 w-4" aria-hidden /> Send a check-in</button>
      </div>
      {alerts.length > 0 && (
        <section aria-label="Needs a response today" className="flex flex-col gap-[var(--space-3)] border-l-[3px] pl-[var(--space-5)]" style={{ borderColor: "var(--color-feedback-danger-solid)" }}>
          <span className="flex items-center gap-[8px] text-[18px] font-semibold v5-risk"><AlertTriangle className="h-5 w-5" aria-hidden />Needs a response today</span>
          <p className="text-[14px]" style={{ color: "var(--muted-foreground)" }}>A note uses a word on your district&apos;s alert list. Follow your school&apos;s safety steps. {contacts.length ? <>We told {contacts.map((c) => `${c.name} (${c.role.toLowerCase()})`).join(" and ")}.</> : <>No safety contacts set. <Link href={cv("profile")} className="dm-link font-semibold" style={{ color: "var(--accent)" }}>Add them in Profile</Link></>}</p>
          <ul className="flex flex-col">
            {alerts.map(({ s, c }) => (
              <li key={s.id} className="flex items-center gap-[var(--space-3)] py-[8px]">
                <button type="button" onClick={() => openCheckIn(s.id, alerts.map((a) => a.s.id))} className="dm-quiet dm-row flex min-w-0 flex-1 cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] text-left">
                  <StudentFace s={s} size={40} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-semibold">{s.name} <span className="font-medium" style={{ color: "var(--muted-foreground)" }}>· Grade {s.grade}</span></span>
                    <span className="truncate text-[14px] italic">“{c.note}”</span>
                    {sentAt(s.id) && <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>Sent to safety contacts {new Date(sentAt(s.id)!).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}</span>}
                  </span>
                </button>
                <button type="button" onClick={() => openLog({ mode: "walkin", studentId: s.id, alert: alertKey(s.id) })} className="dm-solid inline-flex min-h-[40px] flex-none cursor-pointer items-center gap-[8px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}><UserRound className="h-4 w-4" aria-hidden /> Log a check-in</button>
                <button type="button" onClick={() => { markAlertHandled(alertKey(s.id)); notify(`Marked handled: ${s.name}`); }} className="dm-quiet inline-flex min-h-[40px] flex-none cursor-pointer items-center rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)" }}>Handled</button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {handledCount > 0 && <button type="button" onClick={() => { const ids = allAlerts.filter((r) => handled[alertKey(r.s.id)]).map((r) => r.s.id); openCheckIn(ids[0], ids); }} className="dm-link -mt-[var(--space-6)] self-start text-[13.5px] font-semibold" style={{ color: "var(--accent)" }}>{handledCount} alert{handledCount === 1 ? "" : "s"} handled this week. See them</button>}
      {/* this week, the four areas */}
      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-[var(--space-12)]">
        <div className="flex items-center gap-[var(--space-5)]">
          <DrawRing pct={Math.round((answered.length / Math.max(1, roster.length)) * 100)} size={96} stroke={10} />
          <div className="flex flex-col">
            <span className="text-[34px] leading-[38px] font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{answered.length}<span className="text-[18px]" style={{ color: "var(--muted-foreground)" }}>/{roster.length}</span></span>
            <span className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>answered this week</span>
            <span className="mt-[6px] text-[14px] font-semibold v5-risk">{reach.length} to reach out to</span>
            {/* the ones who haven't answered get a nudge (8 Oct 2026 audit) */}
            {roster.length > answered.length && (
              <button type="button" onClick={() => openSendCheckIn({ who: "unanswered" })} className="dm-link mt-[2px] self-start text-left text-[14px] font-semibold" style={{ color: "var(--accent)" }}>
                {`Send to the ${roster.length - answered.length} who haven't answered`}
              </button>
            )}
          </div>
        </div>
        <ul className="flex flex-col gap-[var(--space-4)]">
          {CHECK_DIMS.map((d) => (
            <li key={d} className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-[var(--space-4)] sm:grid-cols-[150px_minmax(0,1fr)_150px]">
              <span className="text-[14.5px] font-semibold">{d}</span>
              <span className="flex h-[14px] overflow-hidden rounded-full" role="img" aria-label={`${d}: ${share(d, "good")}% good, ${share(d, "okay")}% okay, ${share(d, "low")}% low`}>
                {LEVELS.map((l) => <span key={l} style={{ width: `${share(d, l)}%`, background: LEVEL_INK[l] }} />)}
              </span>
              <span className="hidden text-right text-[13px] font-semibold tabular-nums sm:block" style={{ color: "var(--muted-foreground)" }}>
                <span className="v5-ok">{share(d, "good")}%</span> · {share(d, "okay")}% · <span className="v5-risk">{share(d, "low")}%</span>
              </span>
            </li>
          ))}
          <li className="flex gap-[var(--space-5)] text-[13px] font-medium" style={{ color: "var(--muted-foreground)" }}>
            {LEVELS.map((l) => <span key={l} className="flex items-center gap-[6px]"><span aria-hidden className="size-[9px] rounded-full" style={{ background: LEVEL_INK[l] }} />{l === "good" ? "Good" : l === "okay" ? "Okay" : "Low"}</span>)}
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-[48px] lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-[var(--space-12)]">
        <section aria-label="Reach out first" className="flex min-w-0 flex-col gap-[var(--space-3)]">
          <Title aside={<span className="text-[14px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{reach.length} students</span>}>Reach Out First</Title>
          <ul className="flex flex-col">
            {reach.slice(0, all ? reach.length : 8).map(({ s, c, lows }) => (
              <li key={s.id} className="flex items-center gap-[var(--space-3)] border-b py-[10px]" style={{ borderColor: RULE }}>
                <Link href={href(s.id)} className="dm-quiet dm-row flex min-w-0 flex-1 items-center gap-[var(--space-3)] rounded-[var(--radius-md)]">
                  <StudentFace s={s} size={40} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] leading-[19px] font-semibold">{s.name}</span>
                    <span className="truncate text-[13px] font-semibold v5-risk">{lows.length >= 3 ? "Reach out today · " : ""}Low: {lows.join(", ")}</span>
                    {c.note && <span className="truncate text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>“{c.note}”</span>}
                  </span>
                </Link>
                <IconTip label="Log a walk-in">
                  <button type="button" aria-label={`Log a walk-in with ${s.name}`} onClick={() => openLog({ mode: "walkin", studentId: s.id })} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)" }}><UserRound className="h-4 w-4" aria-hidden /></button>
                </IconTip>
                <IconTip label="Book a meeting">
                  <button type="button" aria-label={`Book a meeting with ${s.name}`} onClick={() => openLog({ mode: "book", studentId: s.id })} className="dm-quiet flex size-9 flex-none cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)", color: "var(--accent)" }}><CalendarPlus className="h-4 w-4" aria-hidden /></button>
                </IconTip>
              </li>
            ))}
          </ul>
          {reach.length > 8 && <button type="button" onClick={() => setAll((a) => !a)} className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--accent)" }}>{all ? "Show fewer" : `Show all ${reach.length}`}</button>}
        </section>
        <section aria-label="Notes from students" className="flex min-w-0 flex-col gap-[var(--space-3)]">
          <Title>Notes from Students</Title>
          <ul className="flex flex-col gap-[var(--space-4)]">
            {notes.slice(0, 8).map(({ s, c }) => (
              <li key={s.id}>
                <button type="button" onClick={() => openCheckIn(s.id, notes.slice(0, 8).map((n) => n.s.id))} className="dm-quiet dm-row flex w-[calc(100%+var(--space-4))] cursor-pointer gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-2)] py-[6px] text-left">
                  <StudentFace s={s} size={32} />
                  <span className="flex min-w-0 flex-col gap-[2px]">
                    <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{s.name} · {whenText(c.daysAgo)}</span>
                    <span className="text-[15px] leading-[21px]">{c.note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
