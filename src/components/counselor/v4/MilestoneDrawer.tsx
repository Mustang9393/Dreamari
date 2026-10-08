"use client";

// One milestone, opened (9 Oct 2026, Maisha: clicking a milestone opens a
// side drawer, not a new page: "Career Goals · 77% complete · 23 Done · 4
// In Progress · 1 Needs Attention · 2 Not Started", then the students
// behind those numbers, intervention first, and from there act on them:
// "See issue → identify students → take action"). The four counts are the
// legend and the filter at once, so no number is said twice. The list
// opens on the students who are not done; "View all" adds the rest.
// The panel is the v4 SidePanel (role=dialog aria-modal), so Back and
// Escape close it.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileCheck2, MessageSquare, Users } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { SidePanel } from "./SidePanel";
import { BatchComposer } from "./Batch";
import { Avatar, SelectBox } from "./chips";
import { DreamyMoment } from "./overviewShared";
import { notify } from "../v5/LogSheet";
import { SegBar } from "./milestoneViz";
import { M_LABEL, M_STATES, STATE_RANK, entryNote, messageHref, reviewHref, studentHref, typeLabel, type MState, type MilestoneRow } from "./milestonesModel";

export function MilestoneDrawer({ row, onClose }: { row: MilestoneRow | null; onClose: () => void }) {
  return (
    <SidePanel open={!!row} onClose={onClose} title={row?.item.name ?? ""} subtitle={row ? `Grade ${row.grade} · ${typeLabel(row.item.classification)}` : undefined}>
      {row && <DrawerBody key={`${row.grade}-${row.item.id}`} row={row} onClose={onClose} />}
    </SidePanel>
  );
}

type Filter = MState | "open" | "all";

function DrawerBody({ row, onClose }: { row: MilestoneRow; onClose: () => void }) {
  const router = useRouter();
  const [filter, setFilterState] = useState<Filter>("open");
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [composing, setComposing] = useState(false);
  const setFilter = (f: Filter) => { setFilterState(f); setPicked(new Set()); setComposing(false); };
  // leaving the panel for another screen: close it first, so its history
  // step comes off before the page goes on (backStep.ts)
  const go = (href: string) => { onClose(); router.push(href); };

  const sorted = [...row.entries].sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state] || a.s.name.localeCompare(b.s.name));
  const shown = filter === "all" ? sorted : filter === "open" ? sorted.filter((e) => e.state !== "done") : sorted.filter((e) => e.state === filter);
  const targets = (picked.size ? shown.filter((e) => picked.has(e.s.id)) : shown).map((e) => e.s);
  const listLabel = filter === "all" ? `All ${row.total} Students` : filter === "open" ? `${shown.length} Not Done` : `${shown.length} ${M_LABEL[filter]}`;
  const allPicked = shown.length > 0 && shown.every((e) => picked.has(e.s.id));
  const toggle = (id: string, on: boolean) => setPicked((prev) => { const next = new Set(prev); if (on) next.add(id); else next.delete(id); return next; });

  return (
    <div className="v4-ms-drawer flex flex-col gap-[var(--space-4)]">
      <div className="flex flex-col gap-[10px]">
        <span className="flex items-baseline gap-[8px]">
          <strong className="text-[30px] leading-none font-semibold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{row.pct}%</strong>
          <span className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>complete · {row.counts.done} of {row.total}</span>
        </span>
        <SegBar counts={row.counts} label={row.item.name} className="is-tall" />
        {/* the four counts, each a filter for the list below */}
        <div role="group" aria-label="Show students by status" className="grid grid-cols-2 gap-[6px]">
          {M_STATES.map((st) => (
            <button key={st.key} type="button" aria-pressed={filter === st.key} onClick={() => setFilter(filter === st.key ? "open" : st.key)} className="v4-ms-chip">
              <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: st.color }} />
              <span className="flex-1 truncate text-left">{st.label}</span>
              <b className="tabular-nums">{row.counts[st.key]}</b>
            </button>
          ))}
        </div>
      </div>

      {row.key && row.waiting.length > 0 && (
        <button type="button" onClick={() => go(reviewHref(row.key!, row.waiting.map((s) => s.id)))} className="dm-solid flex h-10 cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-sm)] bg-[var(--primary)] text-[13px] font-bold text-[var(--primary-foreground)]">
          <FileCheck2 className="h-[15px] w-[15px]" aria-hidden /> Review {row.waiting.length} waiting for you
        </button>
      )}

      <div className="flex flex-col gap-[8px] border-t pt-[var(--space-4)]" style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-[10px]">
          {shown.length > 0 && <SelectBox checked={allPicked} label={allPicked ? "Clear selection" : "Select all"} onChange={(on) => setPicked(on ? new Set(shown.map((e) => e.s.id)) : new Set())} />}
          <h3 className="flex-1 text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{listLabel}</h3>
          {shown.length > 0 && (
            <button type="button" aria-expanded={composing} onClick={() => setComposing((v) => !v)} className="v4-inline-link" style={{ color: "var(--primary)" }}>
              <Users className="h-[14px] w-[14px]" aria-hidden />{picked.size ? `Message ${picked.size}` : `Message all ${shown.length}`}
            </button>
          )}
        </div>
        {composing && targets.length > 0 && (
          <BatchComposer students={targets} audience={picked.size ? row.item.name : `${row.item.name} · ${filter === "all" ? "All" : filter === "open" ? "Not Done" : M_LABEL[filter]}`} onCancel={() => setComposing(false)} onDone={(summary) => { notify(summary); setComposing(false); setPicked(new Set()); }} />
        )}

        {shown.length === 0 ? (
          filter === "open" ? (
            <p className="flex items-center gap-[10px] py-[var(--space-2)] text-[13px] font-semibold" style={{ color: "var(--foreground)" }}><DreamyMoment mood="celebrate" size={48} />Every student has completed this.</p>
          ) : (
            <p className="py-[var(--space-3)] text-[13px]" style={{ color: "var(--muted-foreground)" }}>No students are {M_LABEL[filter as MState]?.toLowerCase() ?? "here"}.</p>
          )
        ) : (
          <ul className="flex flex-col">
            {shown.map((e) => {
              const note = entryNote(e, row.item);
              const first = e.s.name.split(" ")[0];
              return (
                <li key={e.s.id} onClick={() => go(studentHref(e.s.id))} className="v4-ms-person dm-quiet">
                  <span onClick={(ev) => ev.stopPropagation()} className="flex">
                    <SelectBox checked={picked.has(e.s.id)} label={`Select ${e.s.name}`} onChange={(on) => toggle(e.s.id, on)} />
                  </span>
                  <Avatar name={e.s.name} index={e.s.avatarIndex} size={32} />
                  <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <Link href={studentHref(e.s.id)} onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); go(studentHref(e.s.id)); }} className="truncate text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{e.s.name}</Link>
                    <span className="truncate text-[12px] font-semibold" style={{ color: e.state === "attention" ? "var(--v4-caution)" : "var(--muted-foreground)" }}>
                      {M_LABEL[e.state]}{note !== M_LABEL[e.state] ? ` · ${note}` : ""}
                    </span>
                  </span>
                  <span onClick={(ev) => ev.stopPropagation()} className="flex flex-none items-center gap-[2px]">
                    {row.key && e.raw === "Pending Review" && (
                      <IconTip label="Review submission"><button type="button" aria-label={`Review ${first}'s submission`} onClick={() => go(reviewHref(row.key!, [e.s.id]))} className="v4-ms-icon"><FileCheck2 className="h-[15px] w-[15px]" aria-hidden /></button></IconTip>
                    )}
                    <IconTip label={`Message ${first}`}><button type="button" aria-label={`Message ${e.s.name}`} onClick={() => go(messageHref([e.s.id]))} className="v4-ms-icon"><MessageSquare className="h-[15px] w-[15px]" aria-hidden /></button></IconTip>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {filter === "open" && row.counts.done > 0 && (
          <button type="button" onClick={() => setFilter("all")} className="dm-quiet mt-[4px] flex h-9 cursor-pointer items-center justify-center rounded-full border text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>View all {row.total} students</button>
        )}
        {filter === "all" && (
          <button type="button" onClick={() => setFilter("open")} className="dm-quiet mt-[4px] flex h-9 cursor-pointer items-center justify-center rounded-full border text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Show only not done</button>
        )}
      </div>
    </div>
  );
}
