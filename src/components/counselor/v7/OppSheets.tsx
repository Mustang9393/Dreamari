"use client";

// An opportunity, opened (the Replit's View), and Share with its audience
// picker (one student, selected students, a grade, a career interest, or
// everyone). One host renders both so Home and Opportunities open the same
// sheets. Sending logs a share on each student (counselorShares) and a time
// entry, the way v5's Send does. DEMO-ONLY: nothing is delivered.
//
// 22 Oct 2026 (Chandu: "make the v7 1:1 with the replit apart from the
// cosmetic upgrades ... Functionality wise"): the sheet carries the Replit's
// full field grid (eligibility, grades, format, deadline, dates, how to
// apply) under a "<Type> · <Industry>" eyebrow, and Share has every Replit
// audience: Individual student (one radio roster), Selected students (the
// checkbox roster), Grade, Career interest and All my students. "Students it
// fits" stays as v7's own extra. The Replit's share is "prototype only"; v7
// records the share on each student.

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Send } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { addShare } from "@/lib/counselorShares";
import { logTime } from "@/lib/counselorTimeLog";
import { useReviewedRoster } from "@/lib/counselorReviews";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { notify } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { industryOf, matchesFor, type Opp } from "./oppCatalog";
import { moment, FIELD, FIELD_STYLE, Modal, MUTED, OVERLINE, PrimaryButton, RULE, SHEET_ACCENT, SheetHero } from "./ui";

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

const GRADE_TEXT = (g: number[]) => (g.length ? (g.length > 1 ? `Grades ${g[0]} to ${g[g.length - 1]}` : `Grade ${g[0]}`) : "College students");

function ViewSheet({ opp }: { opp: Opp }) {
  const roster = useReviewedRoster();
  const item = opp.e.item;
  const who = item.type === "scholarship" ? item.provider : item.org;
  const where = item.type === "program" ? item.location : null;
  const fits = matchesFor(opp, roster);
  const kind = opp.kindLabel ?? (item.type === "program" ? "Program" : "Scholarship");
  const industry = industryOf(opp);
  const facts: { label: string; value: string; wide?: boolean }[] = [
    { label: "Eligibility", value: item.eligibility || "Any student who is curious about this field.", wide: true },
    { label: "Grades", value: GRADE_TEXT(item.grades) },
    { label: "Format", value: opp.format ?? "See program details" },
    { label: "Deadline", value: opp.e.time.label },
    { label: "Dates", value: opp.dates ?? "See program details" },
    { label: "How to apply", value: item.requires[0] ?? "See the provider's page", wide: true },
  ];
  return (
    <Modal overline={industry ? `${kind} · ${industry}` : kind} title={item.name} onClose={close}
      footer={<PrimaryButton onClick={() => shareOpp(opp)} icon={<Send className="h-4 w-4" aria-hidden />}>Share</PrimaryButton>}>
      <p className="-mt-[14px] text-[14px]" style={MUTED}>{[who, where].filter(Boolean).join(" · ")}</p>
      {opp.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- a counselor-pasted URL, any host
        <img src={opp.imageUrl} alt="" className="max-h-[160px] w-full rounded-[var(--radius-md)] object-cover" />
      )}
      {fits.length > 0 && <SheetHero label="Fits" value={fits.length} suffix="of your students" accent={SHEET_ACCENT} />}
      <p className="text-[15px] leading-[23px]">{opp.about}</p>
      <dl className="grid grid-cols-2 gap-x-[var(--space-5)]">
        {facts.map((f) => (
          <div key={f.label} className={`flex flex-col gap-[2px] border-t py-[10px] ${f.wide ? "col-span-2" : ""}`} style={{ borderColor: RULE }}>
            <dt className={OVERLINE} style={MUTED}>{f.label}</dt>
            <dd className="text-[14px] leading-[20px] font-semibold">{f.value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

type Audience = "fits" | "one" | "pick" | "grade" | "interest" | "all";
const AUDIENCES: { key: Audience; label: string }[] = [
  { key: "fits", label: "Students it fits" },
  { key: "one", label: "One student" },
  { key: "pick", label: "Pick students" },
  { key: "grade", label: "A grade" },
  { key: "interest", label: "A career interest" },
  { key: "all", label: "All my students" },
];

const PICK = { on: { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" }, off: { borderColor: "var(--glass-border)" } } as const;

function ShareSheet({ opp }: { opp: Opp }) {
  const roster = useReviewedRoster();
  const fits = useMemo(() => matchesFor(opp, roster), [opp, roster]);
  const [aud, setAud] = useState<Audience>(fits.length ? "fits" : "pick");
  const [grade, setGrade] = useState("12");
  const worlds = useMemo(() => [...new Set(roster.map((s) => s.careerTrack))].sort(), [roster]);
  const [world, setWorld] = useState(() => fits[0]?.careerTrack ?? worlds[0] ?? "");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [one, setOne] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const to: CounselorStudent[] =
    aud === "fits" ? fits
    : aud === "one" ? roster.filter((s) => s.id === one)
    : aud === "grade" ? roster.filter((s) => String(s.grade) === grade)
    : aud === "interest" ? roster.filter((s) => s.careerTrack === world)
    : aud === "all" ? roster
    : roster.filter((s) => picked.has(s.id));
  const list = roster.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  const send = () => {
    const name = opp.e.item.name;
    addShare({ kind: "opportunity", title: name, ref: opp.e.item.id, studentIds: to.map((s) => s.id), studentNames: to.map((s) => s.name) });
    logTime({ activity: `Shared ${name}`, minutes: 5, kind: "indirect" });
    notify(`${name} sent to ${to.length === 1 ? to[0].name.split(" ")[0] : `${to.length} students`}`);
    moment(true);
    close();
  };
  const rosterList = aud === "one" || aud === "pick";
  return (
    <Modal overline="Share" title={opp.e.item.name} onClose={close}
      footer={<PrimaryButton onClick={to.length ? send : undefined} icon={<Send className="h-4 w-4" aria-hidden />}>{to.length ? `Send to ${to.length === 1 ? to[0].name.split(" ")[0] : to.length}` : aud === "one" ? "Pick a student" : "Pick students"}</PrimaryButton>}>
      <div role="radiogroup" aria-label="Who gets it" className="flex flex-wrap gap-[8px]">
        {AUDIENCES.filter((a) => a.key !== "fits" || fits.length).map((a) => {
          const on = a.key === aud;
          return (
            <button key={a.key} type="button" role="radio" aria-checked={on} onClick={() => setAud(a.key)}
              className={`${on ? "" : "dm-quiet cursor-pointer "}inline-flex h-9 items-center rounded-full border px-[14px] text-[13px] font-semibold`}
              style={on ? PICK.on : PICK.off}>
              {a.label}{a.key === "fits" ? ` · ${fits.length}` : ""}
            </button>
          );
        })}
      </div>
      {aud === "grade" && (
        <Listbox ariaLabel="Grade" value={grade} onChange={setGrade} className={`${FIELD} text-left font-semibold`} style={FIELD_STYLE}
          options={[9, 10, 11, 12].map((g) => ({ value: String(g), label: `Grade ${g} · ${roster.filter((s) => s.grade === g).length} students` }))} />
      )}
      {aud === "interest" && (
        <Listbox ariaLabel="Career interest" value={world} onChange={setWorld} className={`${FIELD} text-left font-semibold`} style={FIELD_STYLE}
          options={worlds.map((w) => ({ value: w, label: `${w} · ${roster.filter((s) => s.careerTrack === w).length} students` }))} />
      )}
      {rosterList && (
        <div className="flex flex-col gap-[var(--space-2)]">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students" aria-label="Search students" className={FIELD} style={FIELD_STYLE} />
          <ul role={aud === "one" ? "radiogroup" : undefined} aria-label={aud === "one" ? "Student" : "Students"} className="flex max-h-[300px] flex-col overflow-y-auto">
            {list.map((s) => {
              const on = aud === "one" ? one === s.id : picked.has(s.id);
              const toggle = () => {
                if (aud === "one") setOne(s.id);
                else setPicked((p) => { const n = new Set(p); if (on) n.delete(s.id); else n.add(s.id); return n; });
              };
              return (
                <li key={s.id}>
                  <button type="button" role={aud === "one" ? "radio" : undefined} aria-checked={aud === "one" ? on : undefined} aria-pressed={aud === "one" ? undefined : on} onClick={toggle}
                    className="dm-quiet flex w-full cursor-pointer items-center gap-[10px] rounded-[var(--radius-md)] px-[6px] py-[7px] text-left">
                    <StudentFace s={s} size={30} />
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{s.name}</span>
                    <span className="hidden truncate text-[13px] sm:inline" style={MUTED}>Grade {s.grade} · {s.careerTrack}</span>
                    <span className="text-[13px] sm:hidden" style={MUTED}>Grade {s.grade}</span>
                    <span aria-hidden className={`flex size-[20px] flex-none items-center justify-center border ${aud === "one" ? "rounded-full" : "rounded-[6px]"}`} style={on ? PICK.on : PICK.off}>
                      {on && (aud === "one" ? <span className="size-[8px] rounded-full" style={{ background: "var(--primary-foreground)" }} /> : <Check className="h-3 w-3" strokeWidth={3} />)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Modal>
  );
}
