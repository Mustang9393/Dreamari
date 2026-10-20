"use client";

// An opportunity, opened (the Replit's View), and Share with its audience
// picker (individual, selected students, a grade, a career interest, or
// everyone). One host renders both so Home and Opportunities open the same
// sheets. Sending logs a share on each student (counselorShares) and a time
// entry, the way v5's Send does. DEMO-ONLY: nothing is delivered.

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Send } from "lucide-react";
import { addShare } from "@/lib/counselorShares";
import { logTime } from "@/lib/counselorTimeLog";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { notify } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { matchesFor, type Opp } from "./oppCatalog";
import { FIELD, FIELD_STYLE, Modal, MUTED, OVERLINE, PrimaryButton, RULE, SHEET_ACCENT, SheetHero } from "./ui";

type Open = { kind: "view" | "share"; opp: Opp } | null;
let current: Open = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const openOpp = (opp: Opp) => { current = { kind: "view", opp }; emit(); };
export const shareOpp = (opp: Opp) => { current = { kind: "share", opp }; emit(); };
const close = () => { current = null; emit(); };

export function OppSheetHost() {
  const open = useSyncExternalStore(subscribe, () => current, () => null);
  if (!open) return null;
  return open.kind === "view" ? <ViewSheet opp={open.opp} /> : <ShareSheet opp={open.opp} />;
}

const GRADE_TEXT = (g: number[]) => (g.length ? (g.length > 1 ? `Grades ${g[0]}–${g[g.length - 1]}` : `Grade ${g[0]}`) : "College students");

function ViewSheet({ opp }: { opp: Opp }) {
  const roster = useReviewedRoster();
  const item = opp.e.item;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const where = item.type === "program" ? item.location : null;
  const fits = matchesFor(opp, roster);
  const facts: { label: string; value: string }[] = [
    { label: "Grades", value: GRADE_TEXT(item.grades) },
    { label: "Deadline", value: opp.e.time.label },
    { label: "How to apply", value: item.requires[0] ?? "See the provider's page" },
  ];
  return (
    <Modal overline={opp.kindLabel ?? (item.type === "program" ? "Program" : "Scholarship")} title={item.name} onClose={close}
      footer={<PrimaryButton onClick={() => shareOpp(opp)} icon={<Send className="h-4 w-4" aria-hidden />}>Share</PrimaryButton>}>
      <p className="-mt-[14px] text-[14px]" style={MUTED}>{[who, where].filter(Boolean).join(" · ")}</p>
      {fits.length > 0 && <SheetHero label="Fits" value={fits.length} suffix="of your students" accent={SHEET_ACCENT} />}
      <p className="text-[15px] leading-[23px]">{opp.about}</p>
      <dl className="grid grid-cols-2 gap-x-[var(--space-5)]">
        {facts.map((f) => (
          <div key={f.label} className={`flex flex-col gap-[2px] border-t py-[10px] ${f.label === "How to apply" ? "col-span-2" : ""}`} style={{ borderColor: RULE }}>
            <dt className={OVERLINE} style={MUTED}>{f.label}</dt>
            <dd className="text-[14px] leading-[20px] font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

type Audience = "fits" | "pick" | "grade" | "interest" | "all";
const AUDIENCES: { key: Audience; label: string }[] = [
  { key: "fits", label: "Students it fits" },
  { key: "pick", label: "Pick students" },
  { key: "grade", label: "A grade" },
  { key: "interest", label: "A career interest" },
  { key: "all", label: "All my students" },
];

function ShareSheet({ opp }: { opp: Opp }) {
  const roster = useReviewedRoster();
  const fits = useMemo(() => matchesFor(opp, roster), [opp, roster]);
  const [aud, setAud] = useState<Audience>(fits.length ? "fits" : "pick");
  const [grade, setGrade] = useState(12);
  const worlds = useMemo(() => [...new Set(roster.map((s) => s.careerTrack))].sort(), [roster]);
  const [world, setWorld] = useState(() => fits[0]?.careerTrack ?? worlds[0] ?? "");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const to: CounselorStudent[] = aud === "fits" ? fits : aud === "grade" ? roster.filter((s) => s.grade === grade) : aud === "interest" ? roster.filter((s) => s.careerTrack === world) : aud === "all" ? roster : roster.filter((s) => picked.has(s.id));
  const list = roster.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  const send = () => {
    const name = opp.e.item.name;
    addShare({ kind: "opportunity", title: name, ref: opp.e.item.id, studentIds: to.map((s) => s.id), studentNames: to.map((s) => s.name) });
    logTime({ activity: `Shared ${name}`, minutes: 5, kind: "indirect" });
    notify(`${name} sent to ${to.length} ${to.length === 1 ? "student" : "students"}`);
    close();
  };
  return (
    <Modal overline="Share" title={opp.e.item.name} onClose={close}
      footer={<PrimaryButton onClick={to.length ? send : undefined} icon={<Send className="h-4 w-4" aria-hidden />}>{to.length ? `Send to ${to.length}` : "Pick students"}</PrimaryButton>}>
      <div role="radiogroup" aria-label="Who gets it" className="flex flex-wrap gap-[8px]">
        {AUDIENCES.filter((a) => a.key !== "fits" || fits.length).map((a) => {
          const on = a.key === aud;
          return (
            <button key={a.key} type="button" role="radio" aria-checked={on} onClick={() => setAud(a.key)}
              className={`${on ? "" : "dm-quiet cursor-pointer "}inline-flex h-9 items-center rounded-full border px-[14px] text-[13px] font-semibold`}
              style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>
              {a.label}{a.key === "fits" ? ` · ${fits.length}` : ""}
            </button>
          );
        })}
      </div>
      {aud === "grade" && (
        <select aria-label="Grade" value={grade} onChange={(e) => setGrade(Number(e.target.value))} className={FIELD} style={FIELD_STYLE}>
          {[9, 10, 11, 12].map((g) => <option key={g} value={g}>Grade {g} · {roster.filter((s) => s.grade === g).length} students</option>)}
        </select>
      )}
      {aud === "interest" && (
        <select aria-label="Career interest" value={world} onChange={(e) => setWorld(e.target.value)} className={FIELD} style={FIELD_STYLE}>
          {worlds.map((w) => <option key={w} value={w}>{w} · {roster.filter((s) => s.careerTrack === w).length} students</option>)}
        </select>
      )}
      {aud === "pick" ? (
        <div className="flex flex-col gap-[var(--space-2)]">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students" aria-label="Search students" className={FIELD} style={FIELD_STYLE} />
          <ul className="flex max-h-[300px] flex-col overflow-y-auto">
            {list.map((s) => {
              const on = picked.has(s.id);
              return (
                <li key={s.id}>
                  <button type="button" aria-pressed={on} onClick={() => setPicked((p) => { const n = new Set(p); if (on) n.delete(s.id); else n.add(s.id); return n; })}
                    className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[6px] py-[7px] text-left">
                    <StudentFace s={s} size={30} />
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{s.name}</span>
                    <span className="text-[13px]" style={MUTED}>Grade {s.grade}</span>
                    <span aria-hidden className="flex size-[20px] items-center justify-center rounded-[6px] border" style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : { borderColor: "var(--glass-border)" }}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </Modal>
  );
}
