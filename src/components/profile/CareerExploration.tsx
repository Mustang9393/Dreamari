"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, PenLine, Trash2, X } from "lucide-react";
import { picksSnapshot, serverPicksSnapshot, subscribePicks } from "@/lib/picks";
import { IconTip } from "@/components/app/IconTip";
import { Portal } from "@/components/profile/CareerReport";
import { DatePicker } from "@/components/app/DatePicker";
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
  const [ownOpen, setOwnOpen] = useState(false);
  // Rows added from the dropdown start undated (Joshua, 11 Sept 2026: the
  // date is typed, never pre-filled with today); the editor opens on the
  // first one so the one required field is right there.
  const addTypes = (types: ExperienceTypeId[]) => {
    let first: string | null = null;
    for (const type of types) {
      const e = addExperience({ careerId, type, date: "", where: "", notes: "", feeling: null });
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
      {/* items-start: a CSS grid row stretches every cell to its tallest
         sibling by default, so opening the Add-your-own checklist (right)
         was also stretching the unrelated Logged-in-Dreamari box (left) to
         match its new height (direct feedback, 21 Sept 2026). Each column
         sizes to its own content instead. */}
      <div className="grid items-start gap-[14px] sm:grid-cols-2" data-keep-together>
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

        {/* RIGHT: add your own. Interactive editing happens in a popout
           modal (below), not inline -- the row list used to grow this
           section's own content, and even with items-start keeping the
           LEFT box from visually stretching, the shared grid row still
           auto-sizes to its tallest cell, so the row (and everything
           below it) kept getting taller and taller as more rows were
           added or expanded (direct feedback, 22 Sept 2026). A fixed-size
           trigger keeps this column's height constant regardless of how
           many rows exist. The rows themselves stay in the DOM
           (`hidden print:flex` below) so Download/print still shows every
           logged experience -- the file's own standing requirement. */}
        <section aria-labelledby={`${idPrefix}own`} className="flex flex-col gap-[12px] rounded-[var(--radius-sm)] border px-[16px] py-[14px]" style={{ borderColor: "var(--rule)", background: "var(--paper-sunken)" }}>
          <h4 id={`${idPrefix}own`} className={LABEL} style={{ color: "var(--primary)" }}><PenLine className="h-[13px] w-[13px] flex-none" aria-hidden />Add your own</h4>
          <div data-print-hide className="flex flex-col gap-[10px]">
            {mine.length === 0 ? (
              <p className="text-[12.5px] leading-[18px]" style={{ color: "var(--ink-faint)" }}>Nothing added yet -- log a job shadow, project, or conversation.</p>
            ) : (
              <p className="text-[13px] leading-[18px] font-bold" style={{ color: "var(--ink)" }}>{mine.length} {mine.length === 1 ? "experience" : "experiences"} logged</p>
            )}
            <button
              type="button"
              onClick={() => setOwnOpen(true)}
              className={`dm-tap flex min-h-[40px] w-full cursor-pointer items-center justify-center font-bold ${FIELD}`}
              style={fieldStyle}
            >
              {mine.length === 0 ? "Add your own" : "Manage"}
            </button>
          </div>
          {/* Print/Download-only: the real rows, screen-hidden. */}
          {mine.length > 0 && (
            <ul className="hidden list-none flex-col gap-[8px] p-0 print:flex">
              {mine.map((e) => (
                <ExperienceRow key={e.id} e={e} editing={false} onEdit={() => {}} onDone={() => {}} />
              ))}
            </ul>
          )}
        </section>
      </div>
      {ownOpen && (
        <AddYourOwnModal
          idPrefix={idPrefix}
          items={mine}
          editing={editing}
          onEdit={(id) => setEditing(editing === id ? null : id)}
          onDone={() => setEditing(null)}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((v) => !v)}
          onAddTypes={addTypes}
          onClose={() => { setOwnOpen(false); setMenuOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

/** The popout that holds everything interactive for "add your own" --
 *  the checklist trigger and every logged row, editable in place. Keeps
 *  the inline column (above) at a fixed height no matter how many rows
 *  exist, since all of the growth now happens inside this overlay instead
 *  of in the page's own layout flow. */
function AddYourOwnModal({ idPrefix, items, editing, onEdit, onDone, menuOpen, onToggleMenu, onAddTypes, onClose }: {
  idPrefix: string;
  items: Experience[];
  editing: string | null;
  onEdit: (id: string) => void;
  onDone: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onAddTypes: (types: ExperienceTypeId[]) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);

  return (
    <Portal>
      <div className="no-print fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Add your own">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: "rgba(20,16,8,0.5)", backdropFilter: "blur(20px)" }} />
        <div
          className="relative z-[1] flex max-h-[calc(100dvh-64px)] w-full max-w-[480px] flex-col gap-[14px] rounded-t-[var(--radius-xl)] border p-[18px] sm:max-h-[85dvh] sm:rounded-[var(--radius-lg)]"
          style={{ background: "var(--paper-raised)", borderColor: "var(--rule)", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.5)" }}
        >
          <div className="flex items-center justify-between gap-[8px]">
            <h3 className={LABEL} style={{ color: "var(--primary)" }}><PenLine className="h-[13px] w-[13px] flex-none" aria-hidden />Add your own</h3>
            <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--ink-faint)" }}><X className="h-4 w-4" aria-hidden /></button>
          </div>
          <AddMenu open={menuOpen} onToggle={onToggleMenu} onAdd={onAddTypes} idPrefix={idPrefix} />
          {/* Scroll-safety fix, direct feedback 23 Sept 2026: the modal size
             can stay the same and let users scroll inside -- this has
             happened throughout the app. Rows grow with every logged
             experience, so only this region scrolls; title and Close stay
             in view. */}
          <div className="dm-scroll flex min-h-0 flex-1 flex-col gap-[8px] overflow-y-auto pr-[2px]">
            {items.length === 0 ? (
              <p className="text-[12.5px] leading-[18px]" style={{ color: "var(--ink-faint)" }}>Pick one or more above; each becomes a row you can fill in.</p>
            ) : (
              <ul className="flex list-none flex-col gap-[8px] p-0">
                {items.map((e) => (
                  <ExperienceRow key={e.id} e={e} editing={editing === e.id} onEdit={() => onEdit(e.id)} onDone={onDone} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}

/** "Add something you did": a button that opens a checklist; Add commits the
 *  checked types as rows. Checkboxes, not a single select (Joshua).
 *
 *  The checklist used to open inline, growing this section's own height --
 *  which no longer stretched its sibling (the `items-start` fix above) but
 *  still pushed the report content below it down the page while open
 *  (direct feedback, 21 Sept 2026: it should overlay, not shove content
 *  around). Portalled and positioned from the trigger's own measured rect,
 *  same pattern as ProfileExperience's Settings menu: it floats above
 *  whatever is below in the document instead of displacing it, and closes
 *  on an outside click via the full-screen backdrop button. Now mounted
 *  inside AddYourOwnModal rather than directly in the page -- its own
 *  panel is portalled too, so its z-index (128/129) stays above the
 *  modal's (120), both competing in the same document-root stacking
 *  order. */
function AddMenu({ open, onToggle, onAdd, idPrefix }: { open: boolean; onToggle: () => void; onAdd: (types: ExperienceTypeId[]) => void; idPrefix: string }) {
  const [checked, setChecked] = useState<Set<ExperienceTypeId>>(new Set());
  const [menuRect, setMenuRect] = useState({ top: 0, left: 0, width: 0, maxHeight: 320, openUp: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggle = (id: ExperienceTypeId) => setChecked((cur) => { const next = new Set(cur); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  const MARGIN = 8;
  const MIN_HEIGHT = 160;
  const MAX_HEIGHT = 320;

  function computeRect() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, openUp ? spaceAbove : spaceBelow));
    return { top: openUp ? rect.top - 6 : rect.bottom + 6, left: rect.left, width: rect.width, maxHeight, openUp };
  }

  // Same bounded-panel pattern as Listbox/DatePicker: capped and scrollable
  // rather than left to grow past the viewport on a shorter screen (this
  // panel overflowed the page on a real render, 21 Sept 2026 -- the fixed
  // "Add" button at the end was pushed off-screen entirely below a tall
  // enough checklist). The checklist scrolls; "Add" stays pinned in view.
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    let top = menuRect.top;
    let left = menuRect.left;
    if (menuRect.openUp) {
      if (rect.top < MARGIN) top += MARGIN - rect.top;
    } else if (rect.bottom > window.innerHeight - MARGIN) {
      top = Math.max(MARGIN, top - (rect.bottom - (window.innerHeight - MARGIN)));
    }
    if (rect.right > window.innerWidth - MARGIN) left -= rect.right - (window.innerWidth - MARGIN);
    if (left < MARGIN) left = MARGIN;
    if (top !== menuRect.top || left !== menuRect.left) setMenuRect((p) => ({ ...p, top, left }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onResize() {
      const next = computeRect();
      if (next) setMenuRect(next);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <div data-print-hide className="flex flex-col gap-[8px]">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={`${idPrefix}add-menu`}
        onClick={() => {
          const next = computeRect();
          if (next) setMenuRect(next);
          onToggle();
        }}
        className={`dm-tap flex min-h-[40px] w-full cursor-pointer items-center justify-between gap-[8px] text-left font-bold ${FIELD}`}
        style={fieldStyle}
      >
        Add something you did
        <ChevronDown className="h-4 w-4 flex-none transition-transform" style={{ color: "var(--ink-faint)", transform: open ? "rotate(180deg)" : "none" }} aria-hidden />
      </button>
      {open && (
        <Portal>
          <button type="button" aria-label="Close menu" className="fixed inset-0 z-[128] cursor-default" onClick={onToggle} />
          <div
            ref={panelRef}
            id={`${idPrefix}add-menu`}
            className="fixed z-[129] flex flex-col gap-[6px] rounded-[var(--radius-sm)] border p-[6px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
            style={{
              ...fieldStyle,
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
              maxHeight: menuRect.maxHeight,
              transform: menuRect.openUp ? "translateY(-100%)" : undefined,
            }}
          >
            <div className="dm-scroll flex min-h-0 flex-1 flex-col gap-[4px] overflow-y-auto">
              {EXPERIENCE_TYPES.map((t) => (
                <label key={t.id} className="dm-quiet flex min-h-[36px] cursor-pointer items-center gap-[10px] rounded-[6px] px-[8px] text-[13px] leading-[18px] font-semibold" style={{ color: "var(--ink)" }}>
                  <input type="checkbox" checked={checked.has(t.id)} onChange={() => toggle(t.id)} className="size-[16px] accent-[var(--primary)]" />
                  {t.label}
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={checked.size === 0}
              onClick={() => { onAdd([...checked]); setChecked(new Set()); }}
              className="dm-solid flex min-h-[38px] flex-none cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              {checked.size > 1 ? `Add ${checked.size}` : "Add"}
            </button>
          </div>
        </Portal>
      )}
    </div>
  );
}

/** One experience: a concise row (what · date · where · feeling) that opens
 *  into four short fields on tap (Joshua, 11 Sept 2026: loggable in under
 *  30 seconds). Only the date is required, marked with an asterisk. */
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
        <IconTip label="Edit">
          <button type="button" data-print-hide aria-label={`Edit ${experienceLabel(e.type)}`} onClick={onEdit} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--ink-faint)" }}><PenLine className="h-[14px] w-[14px]" aria-hidden /></button>
        </IconTip>
        <IconTip label="Delete">
          <button type="button" data-print-hide aria-label={`Delete ${experienceLabel(e.type)}`} onClick={() => removeExperience(e.id)} className="dm-quiet flex size-8 flex-none cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--ink-faint)" }}><Trash2 className="h-[14px] w-[14px]" aria-hidden /></button>
        </IconTip>
      </div>
      {editing && (
        <div data-print-hide className="flex flex-col gap-[10px] border-t px-[12px] py-[12px]" style={{ borderColor: "var(--rule)" }}>
          <label className="flex flex-col gap-[4px] text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>
            <span>Date<span aria-hidden style={{ color: "var(--primary)" }}>*</span><span className="sr-only"> (required)</span></span>
            <DatePicker value={e.date} onChange={(v) => updateExperience(e.id, { date: v })} ariaLabel="Date" className={FIELD} style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>
            Where or with whom?
            <input type="text" value={e.where} placeholder="Company, school, or person" onChange={(ev) => updateExperience(e.id, { where: ev.target.value })} className={FIELD} style={fieldStyle} />
          </label>
          <label className="flex flex-col gap-[4px] text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>
            What did you do?
            <input type="text" value={e.notes} onChange={(ev) => updateExperience(e.id, { notes: ev.target.value })} className={FIELD} style={fieldStyle} />
          </label>
          <fieldset className="flex flex-col gap-[6px]">
            <legend className="text-[12px] font-bold" style={{ color: "var(--ink-soft)" }}>How did this affect your interest?</legend>
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
