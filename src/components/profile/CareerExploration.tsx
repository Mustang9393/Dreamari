"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, PenLine, Trash2 } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import {
  EXPERIENCE_TYPES, FEELINGS, addExperience, experienceLabel, experiencesSnapshot, loggedActivity, removeExperience,
  serverExperiencesSnapshot, shortDate, subscribeExperiences, updateExperience, type Experience, type ExperienceTypeId, type Feeling,
} from "@/lib/careerExploration";

// Section 03 of the Career Report, "Career Exploration" (Joshua Pierce,
// Slack, 12 Sept 2026). Two panels: what Dreamari logged (read only, the
// differentiated half, so it carries the weight) and what the student adds.
// Copy below is Joshua's, verbatim. Everything here also has to read in the
// Download preview and in print, where the controls hide and the rows stay.

const LABEL = "flex items-center gap-[6px] text-[14px] leading-[18px] font-bold tracking-[0.06em] uppercase";
const ROW = "flex items-start gap-[9px] text-[13px] leading-[18px] font-bold tracking-[-0.008em]";
const FIELD = "w-full rounded-[var(--radius-sm)] border px-[12px] py-[9px] text-[13px] leading-[18px] outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)]";
const fieldStyle = { borderColor: "var(--rule-strong)", background: "var(--paper-raised)", color: "var(--ink)" } as const;

export function CareerExplorationBody({ careerId, careerTitle, idPrefix }: { careerId: string; careerTitle: string; idPrefix: string }) {
  const picks = useSyncExternalStore(subscribePicks, picksSnapshot, serverPicksSnapshot);
  const all = useSyncExternalStore(subscribeExperiences, experiencesSnapshot, serverExperiencesSnapshot);
  const mine = all.filter((e) => e.careerId === careerId);
  const logged = loggedActivity(careerId, careerTitle, picks.ids);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  // Rows added from the dropdown but not yet dated. They live in the store
  // with today's date so nothing is lost if the student walks away; the
  // editor opens on the first one so the required date is right there.
  const addTypes = (types: ExperienceTypeId[]) => {
    let first: string | null = null;
    for (const type of types) {
      const e = addExperience({ careerId, type, date: new Date().toISOString().slice(0, 10), where: "", notes: "", feeling: null });
      first ??= e.id;
    }
    setMenuOpen(false);
    if (first) setEditing(first);
  };

  return (
    <div className="flex flex-col gap-[18px]">
      <p className="-mt-[6px] text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>Everything you’ve done to explore this career.</p>
      {/* Logged first on phones (stacked), side by side from sm; same shape
         as 05's two panels. */}
      <div className="grid gap-[14px] sm:grid-cols-2" data-keep-together>
        {/* LEFT: logged in Dreamari. Heavier than the form: tinted field, a
           stronger border and check marks on every row. */}
        <section aria-labelledby={`${idPrefix}logged`} className="flex flex-col gap-[12px] rounded-[var(--radius-sm)] border px-[16px] py-[14px]" style={{ borderColor: "color-mix(in srgb, var(--primary) 45%, var(--rule))", background: "color-mix(in srgb, var(--primary) 7%, var(--paper-sunken))", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 12%, transparent)" }}>
          <h4 id={`${idPrefix}logged`} className={LABEL} style={{ color: "var(--primary)" }}>
            <span className="flex size-[16px] flex-none items-center justify-center rounded-full" style={{ background: "var(--primary)", color: "#fff" }}><Check className="h-[10px] w-[10px]" strokeWidth={3.5} aria-hidden /></span>
            Logged in Dreamari
          </h4>
          {logged.length === 0 ? (
            <p className="text-[13px] leading-[19px]" style={{ color: "var(--ink-soft)" }}>Play a simulation or talk to a professional and it’ll show up here.</p>
          ) : (
            <ul className="flex list-none flex-col gap-[9px] p-0">
              {logged.map((item) => (
                <li key={item.text} className={ROW} style={{ color: "var(--ink)" }}>
                  <Check className="mt-[2px] h-[14px] w-[14px] flex-none" strokeWidth={3} aria-hidden style={{ color: "var(--primary)" }} />
                  <span className="min-w-0 flex-1">{item.text}</span>
                  <span className="flex-none tabular-nums" style={{ color: "var(--ink-faint)" }}>{shortDate(item.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RIGHT: add your own. */}
        <section aria-labelledby={`${idPrefix}own`} className="flex flex-col gap-[12px] rounded-[var(--radius-sm)] border px-[16px] py-[14px]" style={{ borderColor: "var(--rule)", background: "var(--paper-sunken)" }}>
          <h4 id={`${idPrefix}own`} className={LABEL} style={{ color: "var(--primary)" }}><PenLine className="h-[13px] w-[13px] flex-none" aria-hidden />Add your own</h4>
          <AddMenu open={menuOpen} onToggle={() => setMenuOpen((v) => !v)} onAdd={addTypes} idPrefix={idPrefix} />
          {mine.length === 0 && (
            <p data-print-hide className="text-[12.5px] leading-[18px]" style={{ color: "var(--ink-faint)" }}>Pick one or more above; each becomes a row you can fill in.</p>
          )}
          {mine.length > 0 && (
            <ul className="flex list-none flex-col gap-[8px] p-0">
              {mine.map((e) => (
                <ExperienceRow key={e.id} e={e} editing={editing === e.id} onEdit={() => setEditing(editing === e.id ? null : e.id)} onDone={() => setEditing(null)} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/** "Add something you did": a button that opens a checklist; Add commits the
 *  checked types as rows. Checkboxes, not a single select (Joshua). */
function AddMenu({ open, onToggle, onAdd, idPrefix }: { open: boolean; onToggle: () => void; onAdd: (types: ExperienceTypeId[]) => void; idPrefix: string }) {
  const [checked, setChecked] = useState<Set<ExperienceTypeId>>(new Set());
  const toggle = (id: ExperienceTypeId) => setChecked((cur) => { const next = new Set(cur); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return (
    <div data-print-hide className="flex flex-col gap-[8px]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${idPrefix}add-menu`}
        onClick={onToggle}
        className={`dm-tap flex min-h-[40px] w-full cursor-pointer items-center justify-between gap-[8px] text-left font-bold ${FIELD}`}
        style={fieldStyle}
      >
        Add something you did
        <ChevronDown className="h-4 w-4 flex-none transition-transform" style={{ color: "var(--ink-faint)", transform: open ? "rotate(180deg)" : "none" }} aria-hidden />
      </button>
      {open && (
        <div id={`${idPrefix}add-menu`} className="flex flex-col gap-[4px] rounded-[var(--radius-sm)] border p-[6px]" style={fieldStyle}>
          {EXPERIENCE_TYPES.map((t) => (
            <label key={t.id} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[10px] rounded-[6px] px-[8px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--ink)" }}>
              <input type="checkbox" checked={checked.has(t.id)} onChange={() => toggle(t.id)} className="size-[16px] accent-[var(--primary)]" />
              {t.label}
            </label>
          ))}
          <button
            type="button"
            disabled={checked.size === 0}
            onClick={() => { onAdd([...checked]); setChecked(new Set()); }}
            className="dm-solid mt-[4px] flex min-h-[38px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {checked.size > 1 ? `Add ${checked.size}` : "Add"}
          </button>
        </div>
      )}
    </div>
  );
}

/** One experience: a concise row (what · date · where · feeling) that opens
 *  into the four fields on tap. Only the date is required. */
function ExperienceRow({ e, editing, onEdit, onDone }: { e: Experience; editing: boolean; onEdit: () => void; onDone: () => void }) {
  const summary = [shortDate(e.date), e.where, e.feeling].filter(Boolean).join(" · ");
  return (
    <li className="rounded-[var(--radius-sm)] border" style={{ borderColor: "var(--rule)", background: "var(--paper-raised)" }}>
      <div className="flex items-center gap-[8px] px-[12px] py-[10px]">
        <button type="button" onClick={onEdit} aria-expanded={editing} className="dm-link flex min-w-0 flex-1 cursor-pointer flex-col gap-[2px] text-left">
          <span className={ROW} style={{ color: "var(--ink)" }}>
            <span aria-hidden className="mt-[6px] h-[6px] w-[6px] flex-none rounded-full" style={{ background: "var(--primary)" }} />
            <span className="min-w-0 flex-1">{experienceLabel(e.type)}</span>
          </span>
          <span className="pl-[15px] text-[12px] leading-[16px]" style={{ color: "var(--ink-soft)" }}>{summary}</span>
          {e.notes && <span className="pl-[15px] text-[12px] leading-[16px]" style={{ color: "var(--ink-faint)" }}>{e.notes}</span>}
        </button>
        <button type="button" data-print-hide aria-label={`Edit ${experienceLabel(e.type)}`} onClick={onEdit} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--ink-faint)" }}><PenLine className="h-[14px] w-[14px]" aria-hidden /></button>
        <button type="button" data-print-hide aria-label={`Delete ${experienceLabel(e.type)}`} onClick={() => removeExperience(e.id)} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--ink-faint)" }}><Trash2 className="h-[14px] w-[14px]" aria-hidden /></button>
      </div>
      {editing && (
        <div data-print-hide className="flex flex-col gap-[10px] border-t px-[12px] py-[12px]" style={{ borderColor: "var(--rule)" }}>
          <label className="flex flex-col gap-[4px] text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>
            Date <span className="font-semibold" style={{ color: "var(--ink-faint)" }}>(required)</span>
            <input type="date" required value={e.date} onChange={(ev) => updateExperience(e.id, { date: ev.target.value })} className={FIELD} style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>
            Where or with whom
            <input type="text" value={e.where} placeholder="“Mercy Hospital” or “my aunt, a nurse”" onChange={(ev) => updateExperience(e.id, { where: ev.target.value })} className={FIELD} style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>
            Tell us more
            <textarea rows={2} value={e.notes} placeholder="What did you do? What surprised you?" onChange={(ev) => updateExperience(e.id, { notes: ev.target.value })} className={`${FIELD} resize-y`} style={fieldStyle} />
          </label>
          <fieldset className="flex flex-col gap-[6px]">
            <legend className="text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>Did this change how you feel about this career?</legend>
            <div className="grid grid-cols-3 gap-[6px]">
              {FEELINGS.map((f: Feeling) => {
                const on = e.feeling === f;
                return (
                  <button key={f} type="button" aria-pressed={on} onClick={() => updateExperience(e.id, { feeling: on ? null : f })} className="dm-tap min-h-[36px] cursor-pointer rounded-[var(--radius-sm)] border px-[6px] text-[12px] leading-[15px] font-bold" style={{ borderColor: on ? "var(--primary)" : "var(--rule-strong)", background: on ? "color-mix(in srgb, var(--primary) 14%, var(--paper-raised))" : "var(--paper-raised)", color: on ? "var(--primary)" : "var(--ink)" }}>
                    {f}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {/* Hours: reserved for job shadows and internships once counselors
             confirm (Joshua / Maisha). EXPERIENCE_TYPES[].hours marks them. */}
          <button type="button" onClick={onDone} disabled={!e.date} className="dm-solid mt-[2px] flex min-h-[38px] w-fit cursor-pointer items-center rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: "var(--ink)", color: "var(--paper-raised)" }}>Done</button>
        </div>
      )}
    </li>
  );
}
