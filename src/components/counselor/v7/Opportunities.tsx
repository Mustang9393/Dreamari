"use client";

// v7 Opportunities (20 Oct 2026): the Replit's Discover and Applications.
//
// Discover: the student Opportunities tab's posters on shelves (career
// events, internships, summer programs, apprenticeships, part-time jobs,
// volunteering), each saying how many of your students it fits, with Share
// in the corner and the sheet on tap. A type picker narrows to one shelf as
// a grid. Add opportunity posts the counselor's own listing to the shelves.
//
// 22 Oct 2026 (Chandu: "make the v7 1:1 with the replit apart from the
// cosmetic upgrades and the design system upgrades. Functionality wise"):
// Discover now carries the Replit's whole filter set (Type, Career /
// Industry, Location, Grade, Deadline) behind one Filters button with a
// count, active filters as chips with Clear all, and each shelf says when
// nothing on it matches. Add opportunity is the Replit's full form (type,
// industry, format, eligibility, grades, three dates, how to apply, logo,
// visibility) with Save draft and Publish; a published listing lands on its
// shelf, a draft waits in a Drafts row. Applications already had the
// Replit's six statuses.
//
// Applications (Joshua, 20 Oct: "the Applications tab still needs some
// refinement"): kept light on purpose. One row per student and listing with
// the stage and the next step, the stage changeable in place. The live
// student's own Applied / Got it marks from the student Opportunities tab
// show here too.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
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
import { catalog, matchesFor, passes, DEADLINES, INDUSTRIES, LOCATIONS, NO_FILTERS, SHELVES, type Filters, type Opp, type ShelfKey } from "./oppCatalog";
import { openOpp, shareOpp } from "./OppSheets";
import { moment, DISPLAY, H2, CARD, CARD_STYLE, Field, FIELD, FIELD_STYLE, Modal, MUTED, OVERLINE, PageHead, PrimaryButton, QuietButton, RULE, studentHref } from "./ui";

const RAIL = "-mx-5 flex gap-[24px] sm:gap-[32px] overflow-x-auto px-5 pt-1 pb-3 [scrollbar-width:none] sm:-mx-[var(--space-14)] sm:px-[var(--space-14)]";
const PICKER = "h-11 min-w-[150px] rounded-[var(--radius-md)] border px-[12px] text-[14px] font-semibold";
const PICKER_STYLE = { borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" } as const;
const TEXTAREA = "w-full resize-y rounded-[var(--radius-md)] border bg-transparent px-[12px] py-[10px] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)] focus-visible:ring-2";

// ---- The counselor's own posts (Add opportunity) ---------------------------------

/** The Replit's ten Opportunity Types, each on the shelf it reads from. */
const OPP_TYPES = ["Internship", "Work-Based Learning", "Job Shadow", "Apprenticeship", "Part-Time Job", "Volunteer", "Career Event", "Employer Visit", "Summer Program", "Mentorship"] as const;
type OppType = (typeof OPP_TYPES)[number];
const SHELF_OF: Record<OppType, ShelfKey> = {
  Internship: "internships", "Work-Based Learning": "events", "Job Shadow": "events", Apprenticeship: "apprenticeships", "Part-Time Job": "jobs",
  Volunteer: "volunteer", "Career Event": "events", "Employer Visit": "events", "Summer Program": "summer", Mentorship: "events",
};
const FORMATS = ["In person", "Virtual", "Hybrid"] as const;
const VISIBILITY = ["Only my students", "My school", "District-wide"] as const;

// DEMO-ONLY: a counselor's post lives in this browser. Production writes it
// to the district's opportunity board, where visibility decides who sees it.
type Posted = {
  id: string; status: "draft" | "published"; savedAt: string;
  title: string; org: string; type: OppType; industry: OppField; description: string; location: string; format: (typeof FORMATS)[number];
  eligibility: string; gradeText: string; deadline: string; start: string; end: string; apply: string; imageUrl: string; visibility: (typeof VISIBILITY)[number];
};
const posted = createLocalRecord<Posted[]>("dreamari-counselor-v7-posted-opportunities-2", []);

/** "Grades 10–12", "9-12", "Grade 11", "10, 11 and 12" read as the grades that can apply; nothing said means every grade. */
function parseGrades(text: string): number[] {
  const nums = (text.match(/\d+/g) ?? []).map(Number).filter((n) => n >= 9 && n <= 12);
  if (!nums.length) return [9, 10, 11, 12];
  if (nums.length === 2 && /\d\s*(?:-|–|to|through)\s*\d/i.test(text)) {
    const [a, b] = [Math.min(...nums), Math.max(...nums)];
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }
  return [...new Set(nums)].sort((a, b) => a - b);
}

const shortDate = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" }); };

function toOpp(p: Posted, todayIso: string): Opp {
  const shelf = SHELF_OF[p.type];
  const dates = p.start && p.end ? `${shortDate(p.start)} to ${shortDate(p.end)}` : p.start ? `Starts ${shortDate(p.start)}` : null;
  const program: Program = {
    id: p.id, name: p.title, org: p.org, kind: "leadership", paid: shelf === "jobs" ? "paid" : "free", costNote: null, fields: [p.industry], grades: parseGrades(p.gradeText),
    states: /virtual/i.test(p.format) ? [] : ["NJ"], location: p.location || (p.format === "Virtual" ? "Virtual" : "Local"), when: dates,
    eligibility: p.eligibility, requires: [p.apply || "Ask your counselor"], opens: null, deadline: p.deadline || null, deadlineNote: null, url: /^https?:/i.test(p.apply) ? p.apply : "", verifiedOn: "",
    postedBy: { org: "Your counselor", boardId: "" }, setting: p.format,
  };
  const item = { type: "program" as const, ...program };
  return { e: { item, fit: { when: "now" as const, score: 0, reasons: [], checks: [] }, time: timing(item, todayIso) }, shelf, kindLabel: p.type, about: p.description || p.eligibility, format: p.format, dates, imageUrl: p.imageUrl || null };
}

function usePostedOpps(todayIso: string): { live: Opp[]; drafts: Posted[] } {
  const list = posted.useValue();
  return useMemo(() => ({ live: list.filter((p) => p.status === "published").map((p) => toOpp(p, todayIso)), drafts: list.filter((p) => p.status === "draft") }), [list, todayIso]);
}

type Tab = "discover" | "applications";

export function V7Opportunities() {
  const [tab, setTab] = useState<Tab>("discover");
  const [adding, setAdding] = useState<Posted | "new" | null>(null);
  return (
    <div className="flex flex-col gap-[var(--space-8)] pt-[var(--space-2)] lg:pt-[var(--space-4)]">
      <PageHead title="Opportunities" action={<PrimaryButton onClick={() => setAdding("new")} icon={<Plus className="h-4 w-4" aria-hidden />}>Add opportunity</PrimaryButton>} />
      <TextTabs items={[{ key: "discover", label: "Discover" }, { key: "applications", label: "Applications" }]} value={tab} onChange={setTab} ariaLabel="Opportunities sections" layoutId="v7-opp-tabs" soft caps={false} />
      {tab === "discover" ? <Discover onEditDraft={setAdding} /> : <Applications />}
      {adding && <AddOpportunity draft={adding === "new" ? null : adding} onClose={() => setAdding(null)} />}
    </div>
  );
}

// ---- Discover ----------------------------------------------------------------------

/** The shelf's empty line, in the Replit's words. */
const EMPTY_LINE = (title: string) => `No ${title.toLowerCase()} match this search and filter set. Clear a filter or try another search.`;

function Discover({ onEditDraft }: { onEditDraft: (p: Posted) => void }) {
  const roster = useReviewedRoster();
  const [todayIso] = useState(() => today());
  const mine = usePostedOpps(todayIso);
  const all = useMemo(() => [...mine.live, ...catalog(todayIso)], [mine.live, todayIso]);
  const [f, setF] = useState<Filters>(NO_FILTERS);
  const [panel, setPanel] = useState(false);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((x) => ({ ...x, [k]: v }));
  const list = useMemo(() => all.filter((o) => passes(o, f)), [all, f]);
  const card = (o: Opp) => {
    const fits = matchesFor(o, roster).length;
    return <Poster e={o.e} status={null} kindLabel={o.kindLabel} cue={fits ? `${fits} ${fits === 1 ? "student fits" : "students fit"}` : undefined} onOpen={() => openOpp(o)} action={<ShareDot name={o.e.item.name} onShare={() => shareOpp(o)} />} />;
  };

  // the active filters as chips (the search box shows itself)
  const chips: { key: keyof Filters; label: string }[] = [];
  if (f.shelf !== "all") chips.push({ key: "shelf", label: SHELVES.find((s) => s.key === f.shelf)?.title ?? "" });
  if (f.industry !== "all") chips.push({ key: "industry", label: f.industry });
  if (f.location !== "all") chips.push({ key: "location", label: f.location });
  if (f.grade !== "all") chips.push({ key: "grade", label: `Grade ${f.grade}` });
  if (f.deadline !== "all") chips.push({ key: "deadline", label: DEADLINES.find((d) => d.key === f.deadline)?.label ?? "" });
  const extra = chips.filter((c) => c.key !== "shelf").length;
  const clearAll = () => setF((x) => ({ ...NO_FILTERS, q: x.q }));

  const shelfView = f.shelf === "all";
  const oneShelf = SHELVES.find((s) => s.key === f.shelf);
  return (
    <div className="flex flex-col gap-[48px]">
      <div className="flex flex-col gap-[var(--space-3)]">
        <div className="flex flex-col gap-[var(--space-3)] md:flex-row md:items-center">
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-[14px] h-4 w-4" style={MUTED} aria-hidden />
            <input type="search" value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search opportunities or organizations" aria-label="Search opportunities"
              className="h-11 w-full rounded-[var(--radius-md)] border bg-transparent pr-[12px] pl-[40px] text-[15px] outline-none focus-visible:ring-2" style={{ borderColor: "var(--glass-border)" }} />
          </label>
          <div className="flex flex-wrap items-center gap-[var(--space-2)]">
            <Listbox ariaLabel="Type" value={f.shelf} onChange={(v) => set("shelf", v as ShelfKey | "all")} className={`${PICKER} min-w-[190px]`} style={PICKER_STYLE}
              options={[{ value: "all", label: "All types" }, ...SHELVES.map((s) => ({ value: s.key, label: s.title }))]} />
            <QuietButton onClick={() => setPanel((p) => !p)} icon={<SlidersHorizontal className="h-4 w-4" aria-hidden />}>
              Filters{extra ? <span className="ml-[2px] inline-flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-[6px] text-[12px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{extra}</span> : null}
            </QuietButton>
          </div>
        </div>
        {panel && (
          <div className="flex flex-wrap items-center gap-[var(--space-2)]" aria-label="More filters">
            <Listbox ariaLabel="Career / Industry" value={f.industry} onChange={(v) => set("industry", v as Filters["industry"])} className={PICKER} style={PICKER_STYLE}
              options={[{ value: "all", label: "All careers" }, ...INDUSTRIES.map((i) => ({ value: i, label: i }))]} />
            <Listbox ariaLabel="Location" value={f.location} onChange={(v) => set("location", v as Filters["location"])} className={PICKER} style={PICKER_STYLE}
              options={[{ value: "all", label: "All locations" }, ...LOCATIONS.map((l) => ({ value: l, label: l }))]} />
            <Listbox ariaLabel="Grade" value={String(f.grade)} onChange={(v) => set("grade", v === "all" ? "all" : Number(v))} className={PICKER} style={PICKER_STYLE}
              options={[{ value: "all", label: "All grades" }, ...[9, 10, 11, 12].map((g) => ({ value: String(g), label: `Grade ${g}` }))]} />
            <Listbox ariaLabel="Deadline" value={f.deadline} onChange={(v) => set("deadline", v as Filters["deadline"])} className={PICKER} style={PICKER_STYLE}
              options={[{ value: "all", label: "Any deadline" }, ...DEADLINES.map((d) => ({ value: d.key, label: d.label }))]} />
          </div>
        )}
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-[8px]" aria-label="Active filters">
            {chips.map((c) => (
              <button key={c.key} type="button" onClick={() => set(c.key, "all")} aria-label={`Remove ${c.label}`}
                className="dm-quiet inline-flex h-[32px] cursor-pointer items-center gap-[6px] rounded-full border pr-[8px] pl-[12px] text-[13px] font-semibold" style={{ borderColor: "var(--primary)", color: "var(--pc-link, var(--color-text-brand))" }}>
                {c.label}<X className="h-[14px] w-[14px]" aria-hidden />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="dm-link cursor-pointer text-[13px] font-semibold" style={MUTED}>Clear all</button>
          </div>
        )}
      </div>

      {mine.drafts.length > 0 && (
        <section aria-label="Drafts" className="flex flex-col gap-[var(--space-3)]">
          <h2 className={H2} style={DISPLAY}>Drafts</h2>
          <ul className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
            {mine.drafts.map((d) => (
              <li key={d.id} className="flex items-center gap-[var(--space-4)] border-b px-[var(--space-5)] py-[12px] last:border-b-0" style={{ borderColor: RULE }}>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{d.title || "Untitled"}<span className="font-normal" style={MUTED}>{d.org ? ` · ${d.org}` : ""} · {d.type}</span></span>
                <QuietButton onClick={() => onEditDraft(d)}>Finish</QuietButton>
              </li>
            ))}
          </ul>
        </section>
      )}

      {shelfView ? (
        SHELVES.map((s) => {
          const row = list.filter((o) => o.shelf === s.key);
          return (
            <section key={s.key} aria-label={s.title} className="flex flex-col gap-[var(--space-4)]">
              <div className="flex items-end justify-between gap-[var(--space-4)]">
                <h2 className={H2} style={DISPLAY}>{s.title}</h2>
                {row.length > 6 && <button type="button" onClick={() => set("shelf", s.key)} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>See all {row.length}</button>}
              </div>
              {row.length ? (
                <div className={`poster-row ${RAIL}`} style={{ touchAction: "pan-x pan-y" }}>
                  {row.slice(0, 12).map((o) => <div key={o.e.item.id} className="w-[220px] flex-none sm:w-[236px]">{card(o)}</div>)}
                </div>
              ) : (
                <p className="text-[14px]" style={MUTED}>{EMPTY_LINE(s.title)}</p>
              )}
            </section>
          );
        })
      ) : list.length ? (
        <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((o) => <div key={o.e.item.id}>{card(o)}</div>)}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-[var(--space-2)] py-[var(--space-6)]">
          <p className="text-[16px] font-semibold">{EMPTY_LINE(oneShelf?.title ?? "opportunities")}</p>
          <button type="button" onClick={() => setF(NO_FILTERS)} className="dm-link cursor-pointer text-[14px] font-semibold" style={{ color: "var(--pc-link, var(--color-text-brand))" }}>Clear search and filters</button>
        </div>
      )}
    </div>
  );
}

// ---- Applications --------------------------------------------------------------

// the Replit's six statuses, in order
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
  if (!sorted.length) return <p className="py-[var(--space-6)] text-[16px] font-semibold">No applications yet. Share an opportunity to get students started.</p>;
  return (
    <section aria-label="Applications" className={`${CARD} overflow-hidden`} style={CARD_STYLE}>
      <div className="hidden gap-[var(--space-4)] border-b px-[var(--space-5)] py-[12px] lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_170px_minmax(0,1.2fr)]" style={{ borderColor: RULE }}>
        {["Student", "Opportunity", "Status", "Follow-up"].map((h) => <span key={h} className={OVERLINE} style={MUTED}>{h}</span>)}
      </div>
      <ul>
        {sorted.map((a) => (
          <li key={a.key} className="grid grid-cols-1 items-center gap-x-[var(--space-4)] gap-y-[6px] border-b px-[var(--space-5)] py-[12px] last:border-b-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_170px_minmax(0,1.2fr)]" style={{ borderColor: RULE }}>
            <Link href={studentHref(a.s.id)} className="dm-quiet flex min-w-0 items-center gap-[10px] rounded-[var(--radius-md)]">
              <StudentFace s={a.s} size={32} />
              <span className="truncate text-[15px] font-semibold">{a.s.name}</span>
            </Link>
            <button type="button" onClick={() => openOpp(a.opp)} className="dm-quiet min-w-0 cursor-pointer truncate rounded-[var(--radius-md)] text-left text-[14px]">{a.opp.e.item.name}</button>
            <Listbox ariaLabel={`Status for ${a.s.name}`} value={a.stage} onChange={(v) => { stageStore.update((m) => ({ ...m, [a.key]: v as Stage })); notify(`${a.s.name.split(" ")[0]}: ${v}`); if (v === "Accepted" || v === "Completed") moment(true); }}
              className="h-9 w-full rounded-[var(--radius-md)] border px-[10px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "transparent", color: "var(--foreground)" }}
              options={STAGES.map((s) => ({ value: s, label: s }))} />
            <span className="truncate text-[14px]" style={MUTED}>{NEXT[a.stage]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---- Add opportunity -----------------------------------------------------------

const blank = (): Posted => ({
  id: `posted-${Date.now().toString(36)}`, status: "draft", savedAt: "",
  title: "", org: "", type: "Internship", industry: FIELDS[0], description: "", location: "", format: "In person",
  eligibility: "", gradeText: "", deadline: "", start: "", end: "", apply: "", imageUrl: "", visibility: "Only my students",
});

/** The Replit's form, two columns, as a v7 sheet. Publish is the lit action; Save draft keeps it for later. */
function AddOpportunity({ draft, onClose }: { draft: Posted | null; onClose: () => void }) {
  const [p, setP] = useState<Posted>(() => draft ?? blank());
  const set = <K extends keyof Posted>(k: K, v: Posted[K]) => setP((x) => ({ ...x, [k]: v }));
  const canPublish = p.title.trim() && p.org.trim();
  const canDraft = p.title.trim() || p.org.trim() || p.description.trim();
  const store = (status: Posted["status"]) => {
    const entry: Posted = { ...p, status, savedAt: new Date().toISOString(), title: p.title.trim(), org: p.org.trim(), location: p.location.trim() };
    posted.update((l) => [entry, ...l.filter((x) => x.id !== entry.id)]);
    if (status === "published") { notify(`${entry.title} is live on ${SHELVES.find((s) => s.key === SHELF_OF[entry.type])?.title}`); moment(true); }
    else notify(`${entry.title || "Draft"} saved`);
    onClose();
  };
  const pick = `${FIELD} text-left font-semibold`;
  const two = "grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2";
  return (
    <Modal overline="Share a local experience with students" title={draft ? "Finish your opportunity" : "Add an opportunity"} onClose={onClose} maxWidth={760}
      footer={<>
        <QuietButton onClick={canDraft ? () => store("draft") : undefined}>Save draft</QuietButton>
        <PrimaryButton onClick={canPublish ? () => store("published") : undefined}>Publish opportunity</PrimaryButton>
      </>}>
      <div className={two}>
        <Field label="Title"><input value={p.title} onChange={(e) => set("title", e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Organization"><input value={p.org} onChange={(e) => set("org", e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Opportunity type">
          <Listbox ariaLabel="Opportunity type" value={p.type} onChange={(v) => set("type", v as OppType)} className={pick} style={FIELD_STYLE} options={OPP_TYPES.map((t) => ({ value: t, label: t }))} />
        </Field>
        <Field label="Career / Industry">
          <Listbox ariaLabel="Career / Industry" value={p.industry} onChange={(v) => set("industry", v as OppField)} className={pick} style={FIELD_STYLE} options={FIELDS.map((f) => ({ value: f, label: f }))} />
        </Field>
      </div>
      <Field label="Description">
        <textarea value={p.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What students do there, in a few lines" className={TEXTAREA} style={FIELD_STYLE} />
      </Field>
      <div className={two}>
        <Field label="Location"><input value={p.location} onChange={(e) => set("location", e.target.value)} placeholder="Newark, NJ" className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Format">
          <Listbox ariaLabel="Format" value={p.format} onChange={(v) => set("format", v as Posted["format"])} className={pick} style={FIELD_STYLE} options={FORMATS.map((f) => ({ value: f, label: f }))} />
        </Field>
        <Field label="Eligibility"><input value={p.eligibility} onChange={(e) => set("eligibility", e.target.value)} placeholder="Who can apply" className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Grade levels"><input value={p.gradeText} onChange={(e) => set("gradeText", e.target.value)} placeholder="Grades 10 to 12" className={FIELD} style={FIELD_STYLE} /></Field>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-3">
        <Field label="Application deadline"><input type="date" value={p.deadline} onChange={(e) => set("deadline", e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Start date"><input type="date" value={p.start} onChange={(e) => set("start", e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="End date"><input type="date" value={p.end} onChange={(e) => set("end", e.target.value)} className={FIELD} style={FIELD_STYLE} /></Field>
      </div>
      <div className={two}>
        <Field label="Application URL or instructions"><input value={p.apply} onChange={(e) => set("apply", e.target.value)} placeholder="A link, or how to apply" className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Image / Logo URL"><input type="url" value={p.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://" className={FIELD} style={FIELD_STYLE} /></Field>
        <Field label="Visibility">
          <Listbox ariaLabel="Visibility" value={p.visibility} onChange={(v) => set("visibility", v as Posted["visibility"])} className={pick} style={FIELD_STYLE} options={VISIBILITY.map((v) => ({ value: v, label: v }))} />
        </Field>
      </div>
      <p className="text-[13px]" style={MUTED}>Students see it on the {SHELVES.find((s) => s.key === SHELF_OF[p.type])?.title.toLowerCase()} shelf once it is published.</p>
    </Modal>
  );
}
