"use client";

// Prepare > Meetings > Upcoming, the top row (10 Oct 2026, Chandu:
// "Meetings and messages and their subtabs ... need super engaging and
// exciting like we did for awaiting me just now"). The week calendar told
// you what was booked; it never got you ready for the next one or closed
// the ones that were over. Two cards, one height:
// - Next up, the one hero (and the only glow on the page): who, when, a
//   live countdown, then the prep a counselor hunts for before a meeting
//   (their status and why, what they last sent, a link to review it if it
//   is waiting) and Dreamy in glasses, sitting across the frame's edge,
//   with one talking point. While a meeting is on, the countdown counts
//   down what is left and offers Mark done.
// - Past meetings: ones that are over and not yet marked done. One tap
//   marks one done (the time goes to the time log, Dreamy's note to the
//   meeting): a green "Done" stamp, a burst and a chime, then the row
//   slides out, the same decision feel as the review session. The last one
//   ends on Dreamy hopping and a fanfare. Undo is one link away.
// Copy pass the same day (Chandu: "What is ready to log?" and "So much text
// right now on this page needs to reduce"): "Ready to log / Log it" became
// "Past meetings / Done", the explainer lines and labels went, and the
// week's progress lives once, in the calendar's head, as "2/7 done".

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import { LocalBurst } from "@/components/build/ui";
import { playCorrect, playFanfare } from "@/components/play/sound";
import { cv } from "@/lib/counselorBase";
import { attentionReason, type CounselorStudent } from "@/lib/counselorRoster";
import { completeMeeting, reopenMeeting, timeLabel, type Meeting } from "@/lib/counselorMeetings";
import { logTime, removeTime, useTimeLog } from "@/lib/counselorTimeLog";
import { StudentFace } from "../v5/StudentFace";
import { GlassesDreamy } from "./InsightCharts";
import { STATUS_COLORS } from "./chips";
import { countdown, dayWord, lastSent, logNote, meetingStart, talkingPoint, useSecondClock } from "./meetingsModel";

const studentHref = (id: string) => `${cv("students")}&studentId=${encodeURIComponent(id)}`;
const activityFor = (m: Meeting) => `Meeting: ${m.type.toLowerCase()}`;

/** One tap logs a meeting: the stamp lands, then the record is written. */
function useLogMeeting(onLogged?: (m: Meeting, isLast: boolean) => void) {
  const [stamping, setStamping] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const log = (m: Meeting, isLast = false) => {
    if (stamping) return;
    setStamping(m.id);
    setBurst((n) => n + 1);
    playCorrect();
    timer.current = window.setTimeout(() => {
      completeMeeting(m.id, logNote(m));
      logTime({ activity: activityFor(m), minutes: m.minutes, kind: "direct", studentId: m.studentId, auto: true });
      setStamping(null);
      onLogged?.(m, isLast);
    }, 680);
  };
  return { stamping, burst, log };
}

export function MeetingsNext({ next, toLog, anyOver, byId, now, onOutreach }: {
  next?: Meeting;
  /** over and not logged, newest first */
  toLog: Meeting[];
  /** whether any meeting in the last two weeks is over (logged or not) */
  anyOver: boolean;
  byId: Map<string, CounselorStudent>;
  now: Date;
  onOutreach: () => void;
}) {
  const s = next ? byId.get(next.studentId) : undefined;
  return (
    <div className={`mtg-top${anyOver ? " has-wrap" : ""}`}>
      {next && s ? <NextUp key={next.id} m={next} s={s} now={now} /> : <NothingNext onOutreach={onOutreach} />}
      {anyOver && <ToLog items={toLog} byId={byId} now={now} />}
    </div>
  );
}

function NothingNext({ onOutreach }: { onOutreach: () => void }) {
  return (
    <section aria-label="Next meeting" className="mtg-hero is-empty">
      <GlassesDreamy size={76} thinking />
      <div className="flex flex-col gap-[6px]">
        <h2 className="mtg-hero-name">Nothing booked</h2>
        <button type="button" className="dm-link self-start text-[14px] font-semibold" style={{ color: "var(--primary)" }} onClick={onOutreach}>Needs Outreach</button>
      </div>
    </section>
  );
}

function NextUp({ m, s, now }: { m: Meeting; s: CounselorStudent; now: Date }) {
  const tick = useSecondClock();
  const t = tick || now.getTime();
  const start = meetingStart(m).getTime();
  const end = start + m.minutes * 60000;
  const left = countdown(start - t);
  const on = !left && t < end;
  const { stamping, burst, log } = useLogMeeting();
  const reason = s.status !== "On Track" ? attentionReason(s) : null;
  // what they last sent, unless the reason already names that milestone
  const lastOne = lastSent(s);
  const sent = lastOne && (lastOne.state === "waiting" || !reason?.includes(lastOne.milestone)) ? lastOne : null;
  const first = s.name.split(" ")[0];
  const reviewHref = sent?.state === "waiting" ? cv("workspace", `&studentId=${encodeURIComponent(s.id)}&milestone=${encodeURIComponent(sent.milestone)}`) : null;
  const ago = sent ? (sent.daysAgo === 1 ? "yesterday" : `${sent.daysAgo} days ago`) : "";

  return (
    <section aria-label="Next meeting" className={`mtg-hero${on ? " is-on" : ""}`}>
      <div className="mtg-hero-top">
        <Link href={studentHref(s.id)} className="mtg-hero-who dm-quiet">
          <StudentFace s={s} size={60} />
          <span className="flex min-w-0 flex-col gap-[2px]">
            <span className="mtg-eyebrow">{on ? "Now" : "Next up"}</span>
            <h2 className="mtg-hero-name truncate">{s.name}</h2>
            <span className="mtg-hero-sub truncate">{dayWord(m.day, now)} · {timeLabel(m.time)} · {m.minutes} min</span>
          </span>
        </Link>
        {/* the live countdown; screen readers get the start time above, not every tick */}
        <div className="mtg-count" aria-hidden>
          <strong suppressHydrationWarning>{tick ? (left ?? (on ? countdown(end - t) : "0:00")) : " "}</strong>
          {!left && <small>left</small>}
        </div>
      </div>

      <p className="mtg-topic"><b>{m.type}</b>{m.topic && <span>“{m.topic}”</span>}</p>

      <div className="mtg-prep">
        <p className="mtg-facts">
          <span style={{ color: STATUS_COLORS[s.status], fontWeight: 600 }}>{s.status}</span>
          {reason && <span>{reason}</span>}
          {sent && (reviewHref
            ? <Link href={reviewHref} className="mtg-facts-link dm-link">{sent.milestone} waiting on you, sent {ago}</Link>
            : <span>Last sent {sent.milestone}, {sent.state === "changes" ? "changes asked" : "approved"}</span>)}
        </p>
        <div className="mtg-dreamy">
          <span className="mtg-dreamy-img"><GlassesDreamy size={84} hop={burst} /></span>
          <p className="mtg-dreamy-say"><Sparkles className="mt-[3px] h-[14px] w-[14px] flex-none" aria-hidden /><span>{talkingPoint(s, m)}</span></p>
        </div>
        {(on || t >= end) && (
          <button type="button" onClick={() => log(m)} disabled={!!stamping} className="mtg-log is-solid self-start" aria-label={`Mark the meeting with ${first} done`}>
            <Check className="h-4 w-4" aria-hidden />Mark done
          </button>
        )}
      </div>
      {stamping === m.id && <span className="mtg-stamp" aria-hidden>Done</span>}
      <LocalBurst nonce={burst} />
    </section>
  );
}

function ToLog({ items, byId, now }: { items: Meeting[]; byId: Map<string, CounselorStudent>; now: Date }) {
  const entries = useTimeLog();
  const [minutes, setMinutes] = useState(0);
  const [last, setLast] = useState<Meeting | null>(null);
  const [finish, setFinish] = useState(0);
  const { stamping, burst, log } = useLogMeeting((m, isLast) => {
    setMinutes((n) => n + m.minutes);
    setLast(m);
    // the last one: the finish line
    if (isLast) { playFanfare(); setFinish((n) => n + 1); }
  });
  const undo = () => {
    if (!last) return;
    reopenMeeting(last.id);
    const entry = entries.find((e) => e.studentId === last.studentId && e.activity === activityFor(last));
    if (entry) removeTime(entry.id);
    setMinutes((n) => Math.max(0, n - last.minutes));
    setLast(null);
  };
  const lastName = last ? byId.get(last.studentId)?.name.split(" ")[0] : undefined;

  if (!items.length) {
    return (
      <section aria-label="Past meetings" className="mtg-wrap is-done">
        <LocalBurst nonce={finish} />
        <GlassesDreamy size={88} hop={finish} />
        <h3 className="mtg-wrap-title">All done</h3>
        {minutes > 0 && <p className="mtg-hero-sub"><b>{minutes} min</b> with students</p>}
        {last && lastName && <Undo word={`Done: ${lastName}`} onUndo={undo} />}
      </section>
    );
  }

  return (
    <section aria-label="Past meetings" className="mtg-wrap">
      <div className="mtg-wrap-head">
        <h3 className="mtg-wrap-title">Past meetings</h3>
      </div>
      <ul className={`mtg-wrap-list dm-scroll${items.length > 3 ? " has-more" : ""}`}>
        {items.map((m) => {
          const s = byId.get(m.studentId);
          if (!s) return null;
          const leaving = stamping === m.id;
          return (
            <li key={m.id} className={`mtg-log-row${leaving ? " is-leaving" : ""}`}>
              <Link href={studentHref(s.id)} className="mtg-log-who dm-quiet">
                <StudentFace s={s} size={36} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[14px] leading-[18px] font-semibold">{s.name}</span>
                  <span className="truncate text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>{dayWord(m.day, now)} {timeLabel(m.time)} · {m.type}</span>
                </span>
              </Link>
              <button type="button" onClick={() => log(m, items.length === 1)} disabled={!!stamping} className="mtg-log dm-quiet" aria-label={`Mark the meeting with ${s.name} done`}>
                <Check className="h-[15px] w-[15px]" aria-hidden />Done
              </button>
              {leaving && <span className="mtg-stamp is-small" aria-hidden>Done</span>}
              {leaving && <LocalBurst nonce={burst} />}
            </li>
          );
        })}
      </ul>
      {last && lastName && <Undo word={`Done: ${lastName}`} onUndo={undo} />}
    </section>
  );
}

function Undo({ word, onUndo }: { word: string; onUndo: () => void }) {
  return (
    <span role="status" className="mtg-undo">
      <Sparkles className="h-[14px] w-[14px]" aria-hidden />{word}
      <button type="button" onClick={onUndo} className="dm-link"><RotateCcw className="h-[13px] w-[13px]" aria-hidden />Undo</button>
    </span>
  );
}


/** Agenda view: the rest of the coming week, calm. One line per meeting
 *  (time, face, name, reason), grouped under a day word; the length and
 *  what they wrote are the row's tooltip. */
export function ComingUp({ meetings, byId, now }: { meetings: Meeting[]; byId: Map<string, CounselorStudent>; now: Date }) {
  if (!meetings.length) return null;
  const days = [...new Set(meetings.map((m) => m.day))];
  return (
    <section aria-label="Coming up" className="mtg-coming">
      <h3 className="mtg-wrap-title">Coming up</h3>
      {days.map((day) => (
        <div key={day} className="mtg-coming-day">
          <span className="mtg-coming-label">{dayWord(day, now)}</span>
          <ul>
            {meetings.filter((m) => m.day === day).map((m) => {
              const s = byId.get(m.studentId);
              if (!s) return null;
              return (
                <li key={m.id}>
                  <Link href={studentHref(s.id)} className="mtg-coming-row dm-quiet" aria-label={`${timeLabel(m.time)}, ${m.minutes} min, ${s.name}, ${m.type}${m.topic ? `, ${m.topic}` : ""}. Open ${s.name}`}>
                    <span className="mtg-coming-time">{timeLabel(m.time)}</span>
                    <StudentFace s={s} size={28} />
                    <span className="mtg-coming-name">{s.name}</span>
                    <span className="mtg-coming-type">{m.type}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
