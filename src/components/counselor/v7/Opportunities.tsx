"use client";

// v7 Opportunities (20 Oct 2026): the Replit's Discover and Applications.
//
// Discover: the student Opportunities tab's posters on shelves (career
// events, internships, summer programs, apprenticeships, part-time jobs,
// volunteering), each saying how many of your students it fits, with Share
// in the corner and the sheet on tap. A type picker narrows to one shelf as
// a grid. Add opportunity posts the counselor's own listing to the shelves.
//
// Applications (Joshua, 20 Oct: "the Applications tab still needs some
// refinement"): kept light on purpose. One row per student and listing with
// the stage and the next step, the stage changeable in place. The live
// student's own Applied / Got it marks from the student Opportunities tab
// show here too.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Listbox } from "@/components/app/Listbox";
import { TextTabs } from "@/components/app/TextTabs";
import { Poster } from "@/components/opportunities/Poster";
import { today, timing } from "@/components/opportunities/match";
import type { Field as OppField, Program } from "@/components/opportunities/types";
import { FIELDS } from "@/components/opportunities/types";
import { opportunityStore } from "@/lib/opportunities";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { createLocalRecord, seedHash } from "@/lib/localRecord";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { notify } from "../v5/LogSheet";
import { StudentFace } from "../v5/StudentFace";
import { STUDENT_ID } from "@/components/profile/BookCounselorSheet";
import { ShareDot } from "./Home";
import { catalog, matchesFor, SHELVES, type Opp, type ShelfKey } from "./oppCatalog";
import { openOpp, shareOpp } from "./OppSheets";
import { CARD, CARD_STYLE, Field, FIELD, FIELD_STYLE, Modal, MUTED, OVERLINE, PageHead, PrimaryButton, RULE, studentHref } from "./ui";

const RAIL = "-mx-5 flex gap-[var(--space-4)] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]";

// the counselor's own posts (Add opportunity)
type Posted = { id: string; name: string; org: string; location: string; shelf: ShelfKey; deadline: string; field: OppField; grades: number[]; about: string };
const posted = createLocalRecord<Posted[]>("dreamari-counselor-v7-posted-opportunities", []);
const SHELF_LABEL: Record<ShelfKey, string> = { events: "Career event", internships: "Internship", summer: "Summer program", apprenticeships: "Apprenticeship", jobs: "Part-time job", volunteer: "Volunteer" };

function usePostedOpps(todayIso: string): Opp[] {
  const list = posted.useValue();
  return useMemo(() => list.map((p) => {
    const program: Program = { id: p.id, name: p.name, org: p.org, kind: "leadership", paid: p.shelf === "jobs" ? "paid" : "free", costNote: null, fields: [p.field], grades: p.grades, states: ["NJ"], location: p.location, when: null, eligibility: "", requires: ["Ask your counselor"], opens: null, deadline: p.deadline, deadlineNote: null, url: "", verifiedOn: "", postedBy: { org: "Your counselor", boardId: "" } };
    const item = { type: "program" as const, ...program };
    return { e: { item, fit: { when: "now" as const, score: 0, reasons: [], checks: [] }, time: timing(item, todayIso) }, shelf: p.shelf, kindLabel: SHELF_LABEL[p.shelf], about: p.about, format: "In person" };
  }), [list, todayIso]);
}

type Tab = "discover" | "applications";

export function V7Opportunities() {
  const [tab, setTab] = useState<Tab>("discover");
  const [adding, setAdding] = useState(false);
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Opportunities" line="Find, share and track what fits your students." action={<PrimaryButton onClick={() => setAdding(true)} icon={<Plus className="h-4 w-4" aria-hidden />}>Add opportunity</PrimaryButton>} />
      <TextTabs items={[{ key: "discover", label: "Discover" }, { key: "applications", label: "Applications" }]} value={tab} onChange={setTab} ariaLabel="Opportunities sections" layoutId="v7-opp-tabs" soft caps={false} />
      {tab === "discover" ? <Discover /> : <Applications />}
      {adding && <AddOpportunity onClose={() => setAdding(false)} />}
    </div>
  );
}

function Discover() {
  const roster = useReviewedRoster();
  const [todayIso] = useState(() => today());
  const mine = usePostedOpps(todayIso);
  const all = useMemo(() => [...mine, ...catalog(todayIso)], [mine, todayIso]);
  const [shelf, setShelf] = useState<ShelfKey | "all">("all");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const list = all.filter((o) => !needle || o.e.item.name.toLowerCase().includes(needle) || (o.e.item.type === "program" ? o.e.item.org : o.e.item.provider).toLowerCase().includes(needle));
  const card = (o: Opp) => {
    const fits = matchesFor(o, roster).length;
    return <Poster e={o.e} status={null} kindLabel={o.kindLabel} cue={fits ? `${fits} ${fits === 1 ? "student fits" : "students fit"}` : undefined} onOpen={() => openOpp(o)} action={<ShareDot name={o.e.item.name} onShare={() => shareOpp(o)} />} />;
  };
  const showShelves = shelf === "all" && !needle;
  const flat = list.filter((o) => shelf === "all" || o.shelf === shelf);
  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <div className="flex flex-col gap-[var(--space-3)] md:flex-row md:items-center">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search className="pointer-events-none absolute left-[14px] h-4 w-4" style={MUTED} aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search opportunities or organizations" aria-label="Search opportunities"
            className="h-11 w-full rounded-[var(--radius-md)] border bg-transparent pr-[12px] pl-[40px] text-[15px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
        </label>
        <Listbox ariaLabel="Type" value={shelf} onChange={(v) => setShelf(v as ShelfKey | "all")} className="h-11 min-w-[190px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" }}
          options={[{ value: "all", label: "All types" }, ...SHELVES.map((s) => ({ value: s.key, label: s.title }))]} />
      </div>
      {showShelves ? (
        SHELVES.map((s) => {
          const row = list.filter((o) => o.shelf === s.key);
          if (!row.length) return null;
          return (
            <section key={s.key} aria-label={s.title} className="flex flex-col gap-[var(--space-4)]">
              <div className="flex items-end justify-between gap-[var(--space-4)]">
                <h2 className="text-[22px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h2>
                {row.length > 6 && <button type="button" onClick={() => setShelf(s.key)} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-brand-300))" }}>See all {row.length}</button>}
              </div>
              <div className={`poster-row ${RAIL}`} style={{ touchAction: "pan-x pan-y" }}>
                {row.slice(0, 12).map((o) => <div key={o.e.item.id} className="w-[220px] flex-none sm:w-[236px]">{card(o)}</div>)}
              </div>
            </section>
          );
        })
      ) : flat.length ? (
        <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {flat.map((o) => <div key={o.e.item.id}>{card(o)}</div>)}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-[var(--space-2)] py-[var(--space-6)]">
          <p className="text-[17px] font-semibold">Nothing matches.</p>
          <button type="button" onClick={() => { setQ(""); setShelf("all"); }} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-brand-300))" }}>Clear search</button>
        </div>
      )}
    </div>
  );
}

// ---- Applications --------------------------------------------------------------

const STAGES = ["Saved", "Applied", "Interviewing", "Accepted", "Participating", "Completed"] as const;
type Stage = (typeof STAGES)[number];
const NEXT: Record<Stage, string> = {
  Saved: "Nudge to apply",
  Applied: "Check application status",
  Interviewing: "Interview prep",
  Accepted: "Confirm participation",
  Participating: "Check in halfway",
  Completed: "Add to their resume",
};
const stageStore = createLocalRecord<Record<string, Stage>>("dreamari-counselor-v7-application-stages", {});

type App = { key: string; s: CounselorStudent; opp: Opp; stage: Stage };

function Applications() {
  const roster = useReviewedRoster();
  const [todayIso] = useState(() => today());
  const stages = stageStore.useValue();
  const live = opportunityStore.useValue();
  const apps: App[] = useMemo(() => {
    const opps = catalog(todayIso);
    const byId = new Map(opps.map((o) => [o.e.item.id, o]));
    const out: App[] = [];
    // the live student's own marks from the student Opportunities tab
    const me = roster.find((s) => s.id === STUDENT_ID);
    if (me) for (const [id, rec] of Object.entries(live.status ?? {})) {
      const st = rec.status;
      const o = byId.get(id);
      if (o && (st === "applied" || st === "won" || st === "saved")) out.push({ key: `${me.id}:${id}`, s: me, opp: o, stage: st === "won" ? "Accepted" : st === "applied" ? "Applied" : "Saved" });
    }
    // DEMO-ONLY: a stable spread of the caseload's applications, one listing
    // per student from what fits them. Production reads applications from
    // the student app and the providers.
    for (const s of roster.filter((x) => x.grade >= 10 && x.id !== STUDENT_ID)) {
      const h = Math.abs(seedHash(`app-${s.id}`));
      if (h % 4 !== 0) continue;
      const fits = opps.filter((o) => matchesFor(o, [s]).length);
      const o = fits[h % Math.max(1, fits.length)];
      if (!o) continue;
      out.push({ key: `${s.id}:${o.e.item.id}`, s, opp: o, stage: STAGES[(h >>> 4) % 5] });
    }
    return out.map((a) => ({ ...a, stage: stages[a.key] ?? a.stage }));
  }, [roster, todayIso, stages, live]);
  // earliest stage first: those are the ones that need a push
  const sorted = [...apps].sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage) || a.s.name.localeCompare(b.s.name));
  if (!sorted.length) return <p className="py-[var(--space-6)] text-[17px] font-semibold">No applications yet. Share an opportunity to get students started.</p>;
  return (
    <section aria-label="Applications" className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
      <div className="hidden gap-[var(--space-4)] border-b px-[var(--space-5)] py-[12px] lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_170px_minmax(0,1.2fr)]" style={{ borderColor: RULE }}>
        {["Student", "Opportunity", "Stage", "Next step"].map((h) => <span key={h} className={OVERLINE} style={MUTED}>{h}</span>)}
      </div>
      <ul>
        {sorted.map((a) => (
          <li key={a.key} className="grid grid-cols-1 items-center gap-x-[var(--space-4)] gap-y-[6px] border-b px-[var(--space-5)] py-[12px] last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_170px_minmax(0,1.2fr)]" style={{ borderColor: RULE }}>
            <Link href={studentHref(a.s.id)} className="dm-quiet flex min-w-0 items-center gap-[10px] rounded-[var(--radius-md)]">
              <StudentFace s={a.s} size={32} />
              <span className="truncate text-[15px] font-semibold">{a.s.name}</span>
            </Link>
            <button type="button" onClick={() => openOpp(a.opp)} className="dm-quiet min-w-0 cursor-pointer truncate rounded-[var(--radius-md)] text-left text-[14.5px]">{a.opp.e.item.name}</button>
            <Listbox ariaLabel={`Stage for ${a.s.name}`} value={a.stage} onChange={(v) => { stageStore.update((m) => ({ ...m, [a.key]: v as Stage })); notify(`${a.s.name.split(" ")[0]}: ${v}`); }}
              className="h-9 w-full rounded-[var(--radius-md)] border px-[10px] text-[13.5px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" }}
              options={STAGES.map((s) => ({ value: s, label: s }))} />
            <span className="truncate text-[14px]" style={MUTED}>{NEXT[a.stage]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---- Add opportunity -----------------------------------------------------------

function AddOpportunity({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [location, setLocation] = useState("");
  const [shelf, setShelf] = useState<ShelfKey>("events");
  const [deadline, setDeadline] = useState("");
  const [field, setField] = useState<OppField>(FIELDS[0]);
  const [about, setAbout] = useState("");
  const ready = name.trim() && org.trim() && deadline;
  const save = () => {
    if (!ready) return;
    posted.update((l) => [{ id: `posted-${Date.now().toString(36)}`, name: name.trim(), org: org.trim(), location: location.trim() || "Local", shelf, deadline, field, grades: [9, 10, 11, 12], about: about.trim() }, ...l]);
    notify(`${name.trim()} added to ${SHELVES.find((s) => s.key === shelf)?.title}`);
    onClose();
  };
  return (
    <Modal title="Add an opportunity" onClose={onClose} wide footer={<PrimaryButton onClick={ready ? save : undefined}>Add opportunity</PrimaryButton>}>
      <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        <Field label="Organization"><input value={org} onChange={(e) => setOrg(e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Location"><input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Newark, NJ" className={FIELD} style={FIELD_STYLE} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-[var(--space-3)]">
        <Field label="Type">
          <select value={shelf} onChange={(e) => setShelf(e.target.value as ShelfKey)} className={FIELD} style={FIELD_STYLE}>
            {SHELVES.map((s) => <option key={s.key} value={s.key}>{SHELF_LABEL[s.key]}</option>)}
          </select>
        </Field>
        <Field label="Field">
          <select value={field} onChange={(e) => setField(e.target.value as OppField)} className={FIELD} style={FIELD_STYLE}>
            {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
        <Field label="Deadline"><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
      </div>
      <Field label="What students do">
        <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={3} className="w-full resize-y rounded-[var(--radius-md)] border bg-transparent p-[12px] text-[15px] leading-[22px] outline-none focus-visible:ring-2" style={FIELD_STYLE} />
      </Field>
    </Modal>
  );
}
