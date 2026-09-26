"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowUpRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import { MILESTONE_KEYS, avatarIndexForName, type CaseloadStatus, type MilestoneStatus, type MilestoneKey } from "@/lib/counselorRoster";
import { studentPortraitSrc, useStudentAvatarSrc } from "@/lib/avatar";

// Shared status pills -- the same caseload-status and milestone-review
// vocabulary shows up on Students, the student drill-down, Milestone
// Tracker, and Review Queue, so the colors/labels live in one place rather
// than four.

export const STATUS_COLORS: Record<CaseloadStatus, string> = {
  "On Track": "var(--cd-green)",
  "Needs Attention": "var(--cd-amber)",
  "At Risk": "var(--cd-red)",
};

export const MILESTONE_COLORS: Record<MilestoneStatus, string> = {
  Approved: "var(--cd-green)",
  "Pending Review": "#5B6CF9",
  "Changes Requested": "var(--cd-red)",
  "In Progress": "var(--cd-amber)",
  "Not Started": "color-mix(in srgb, var(--foreground) 45%, transparent)",
  // The reference's own extra states: student-completed reads as done
  // (same green as Approved), overdue is the one red the dashboard
  // reserves for "act now", and a dash-in-the-reference "not applicable"
  // is the quietest gray of all.
  Completed: "var(--cd-green)",
  Overdue: "var(--cd-red)",
  "Not Applicable": "color-mix(in srgb, var(--foreground) 22%, transparent)",
};

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold whitespace-nowrap" style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)`, background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
      <span aria-hidden className="size-[6px] flex-none rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function StatusChip({ status }: { status: CaseloadStatus }) {
  return <Chip label={status} color={STATUS_COLORS[status]} />;
}

export function MilestoneChip({ status }: { status: MilestoneStatus }) {
  return <Chip label={status} color={MILESTONE_COLORS[status]} />;
}

// One compact cell standing in for what used to be 5 separate pill
// columns (Career Report/Resume/Applications/Rec. Letter/Transcript) --
// each pill repeated the same "Approved" (green) label on most rows, pure
// visual noise across 120 rows, and the 5 shown were an arbitrary subset
// that silently left out the other 6 milestones a student actually has.
// This shows all 11 -- a real count plus a small segmented strip, same
// segmented-mark language the Overview charts already use, so a
// counselor can see completion AND spot exactly which stage is stuck
// (each segment is titled on hover) without opening the student.
// The strip is a small chart, so it wears the chart stage colors (the
// Milestone Tracker's rings use the same): approved brightest blue, pending
// and in progress lighter, not started neutral, red only for overdue or
// changes requested (26 Sept 2026: "the graph colors can be consistent
// across the app"). Status chips keep MILESTONE_COLORS.
const STRIP_COLORS: Record<MilestoneStatus, string> = {
  Approved: "#5B6CF9",
  Completed: "#5B6CF9",
  "Pending Review": "var(--cd-blue-soft)",
  "In Progress": "var(--cd-blue-pale)",
  "Not Started": "#5B6470",
  "Changes Requested": "var(--cd-red)",
  Overdue: "var(--cd-red)",
  "Not Applicable": "color-mix(in srgb, var(--foreground) 14%, transparent)",
};

export function MilestonesMini({ milestones }: { milestones: Record<MilestoneKey, MilestoneStatus> }) {
  const approved = MILESTONE_KEYS.filter((k) => milestones[k] === "Approved").length;
  return (
    <span className="flex flex-col gap-[4px]">
      <span className="text-[12px] font-bold tabular-nums whitespace-nowrap" style={{ color: "var(--foreground)" }}>{approved}/{MILESTONE_KEYS.length} approved</span>
      <span className="flex gap-[2px]">
        {MILESTONE_KEYS.map((k) => (
          <span key={k} title={`${k}: ${milestones[k]}`} aria-hidden className="h-[5px] w-[8px] flex-none rounded-[1.5px]" style={{ background: STRIP_COLORS[milestones[k]] }} />
        ))}
      </span>
    </span>
  );
}

// One legend row shared by every ring/bar card on the dashboard: dot + label
// on the left, the value pinned to the right edge, so a card's values always
// line up in one column. `min-w-0` on every flex step down to the label is
// what lets `truncate` actually bite -- a flex child's default min-width is
// its content's width, which silently defeats truncation until overridden.
/** The drill-down affordance, visible at rest and animated on hover
 *  (direct instruction, 25 Sept 2026: "whenever something hovers and can
 *  be clicked make sure a chevron appears and animates ... maybe another
 *  icon if it takes them out of the screen ... tablet, mobile won't have
 *  hover anyway"). Always drawn, muted, so a touch user sees it too.
 *  "leave": an arrow out of the corner, the click goes to another screen.
 *  "open": a chevron, it opens something on this screen (a pane).
 *  "expand": a chevron that turns, it unfolds in place. The parent needs
 *  the `group` class for the hover motion. */
export function Go({ kind = "leave", open, className = "" }: { kind?: "leave" | "open" | "expand"; open?: boolean; className?: string }) {
  const base = `h-[14px] w-[14px] flex-none transition-transform duration-150 ${className}`;
  const style = { color: "var(--muted-foreground)" };
  if (kind === "expand") return <ChevronDown aria-hidden className={base} style={{ ...style, transform: open ? "rotate(180deg)" : "none" }} />;
  if (kind === "open") return <ChevronRight aria-hidden className={`${base} group-hover:translate-x-[3px]`} style={style} />;
  return <ArrowUpRight aria-hidden className={`${base} group-hover:translate-x-[2px] group-hover:-translate-y-[2px]`} style={style} />;
}

export function StatRow({ label, value, color, onClick, active }: { label: string; value: number; color: string; onClick?: () => void; active?: boolean }) {
  const row = (
    <>
      <span className="flex min-w-0 flex-1 items-center gap-[8px]" style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}>
        <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: color }} />
        <span className="truncate">{label}</span>
      </span>
      {/* The arrow shows on hover/focus only: one per row, always on, was a
         column of arrows competing with the numbers. */}
      <span className="flex flex-none items-center gap-[6px] tabular-nums" style={{ color: "var(--foreground)" }}>{value}{onClick && <Go className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />}</span>
    </>
  );
  if (!onClick) return <span className="flex items-center justify-between text-[13px] font-semibold">{row}</span>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="dm-quiet group flex w-full cursor-pointer items-center justify-between rounded-[var(--radius-sm)] px-[4px] py-[2px] text-[13px] font-semibold"
      style={{ background: active ? `color-mix(in srgb, ${color} 16%, transparent)` : "transparent" }}
    >
      {row}
    </button>
  );
}

export function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// The same illustrated black/white portrait set every student wears
// app-wide (src/lib/avatar.ts), not a separate initials-only style just
// for this dashboard (direct instruction: "use the avatars from our
// collections... make sure there is diversity and variety and they make
// sense for the names"). That module already does the real work: 18
// common first names are pinned to a gender/ethnicity-matched portrait
// from a deliberately diverse 48-portrait set, and every other name
// (most of this roster's synthetic first names) draws a stable, varied
// portrait from that same diverse set via a deterministic hash -- so this
// component only has to point at it, not re-solve diversity itself.
// First name only, so "Jordan Rivera" (roster row) and "Jordan" (handle
// elsewhere in the app) draw the identical face for the one real student.
// Falls back to initials (this dashboard's original treatment) only if
// the image itself ever fails to load.
export function Avatar({ name, size = 34, index }: { name: string; size?: number; /** roster portrait file number; when absent the name is looked up in the roster */ index?: number }) {
  const [failed, setFailed] = useState(false);
  // Seeded students wear a portrait hand-matched to their name (gender and
  // background; counselorRosterPortraits.ts). The real student keeps the
  // "Jordan" seed so Jordan's own avatar and any picked override apply.
  const resolvedIndex = index ?? avatarIndexForName(name);
  const seed = name === "Jordan Rivera" ? "Jordan" : name;
  const named = useStudentAvatarSrc(seed);
  const src = resolvedIndex !== undefined && resolvedIndex >= 0 ? studentPortraitSrc(resolvedIndex) : named;
  if (failed) {
    return (
      <span
        className="flex flex-none items-center justify-center rounded-full text-[12.5px] font-extrabold"
        style={{ width: size, height: size, background: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <Image
      key={src}
      src={src}
      alt=""
      width={128}
      height={128}
      className="flex-none rounded-full object-cover"
      style={{ width: size, height: size, background: "var(--secondary)" }}
      onError={() => setFailed(true)}
    />
  );
}

// Every card on the v2 dashboard opens something, and the way in is this
// link in the card's header: a word plus a chevron, visible at rest as a
// small pill (not a hover-only hint: many counselors and administrators
// are older and many are on touch screens, where hover never happens). Not
// blue: the brand blue is spent on data marks and the active nav item, and
// a blue word next to a blue chart reads as part of the chart (direct
// feedback, 25 Sept 2026: "don't make the CTAs blue"). Hover is obvious and
// shaped: the pill's own background and border lift and the chevron slides
// right; the pill has real padding at rest so nothing appears over the text
// (direct feedback: "the padding that appears on hover is wrong, too tight
// and overlapping with the text, no shape"). `group-hover` on the card root
// also fires it when the whole card is hovered.
export function CardLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-none cursor-pointer items-center gap-[4px] rounded-full border px-[11px] py-[5px] text-[12.5px] leading-[16px] font-bold transition-[background-color,border-color,transform] duration-150 group-hover:border-[color-mix(in_srgb,var(--foreground)_28%,transparent)] group-hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] hover:border-[color-mix(in_srgb,var(--foreground)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--foreground)_14%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      style={{ color: "var(--foreground)", borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}
    >
      {children}
      <ArrowUpRight className="h-[14px] w-[14px] transition-transform duration-150 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] hover:translate-x-[2px]" aria-hidden />
    </button>
  );
}

// A row of choice chips that scrolls sideways when it does not fit. Unlike
// the bordered Segmented pill, it has no container edge: the row bleeds
// into the page gutter on both sides, so a chip that does not fit peeks
// past the content edge instead of being clipped by a border, and a fade
// on the overflowing side says there is more (direct feedback, 25 Sept
// 2026: "the top chips don't read like scrollable ... show the chip
// peeking, don't make the margins clip them"). The negative margins mirror
// the shell's <main> padding so the bleed lands exactly on the viewport
// edge on phones.
export function ScrollChips<K extends string>({ options, value, onChange, ariaLabel }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setEdges({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", update); ro.disconnect(); };
  }, [options.length]);
  const fade = (side: "left" | "right") => (
    <span aria-hidden className={`pointer-events-none absolute inset-y-0 ${side}-0 w-[48px] transition-opacity duration-150`} style={{ opacity: edges[side] ? 1 : 0, background: `linear-gradient(to ${side === "left" ? "right" : "left"}, var(--background), transparent)` }} />
  );
  return (
    <div className="relative -mx-[var(--space-4)] sm:-mx-[var(--space-5)] md:-mx-[var(--space-8)]">
      <div ref={ref} role="tablist" aria-label={ariaLabel} className="flex gap-[6px] overflow-x-auto px-[var(--space-4)] py-[2px] [scrollbar-width:none] sm:px-[var(--space-5)] md:px-[var(--space-8)] [&::-webkit-scrollbar]:hidden">
        {options.map((o) => {
          const on = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(o.key)}
              className="dm-quiet flex h-9 flex-none cursor-pointer items-center rounded-full border px-[14px] text-[13px] font-bold whitespace-nowrap transition-colors"
              style={{ background: on ? "var(--primary)" : "var(--inset-bg)", borderColor: on ? "var(--primary)" : "var(--inset-border)", color: on ? "#FFFFFF" : "var(--foreground)" }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {fade("left")}
      {fade("right")}
    </div>
  );
}

// The detail half of a master-detail screen (Review Queue, Connect). From
// lg up it is an ordinary grid child beside the list. Below lg the list
// gets the whole width and the detail opens as a bottom sheet over it when
// an item is chosen, with a Close bar, instead of sitting under the list
// where the counselor had to scroll to act (direct feedback, 25 Sept 2026:
// layout issues on tablet and mobile).
export function DetailPane({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      {open && <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 z-30 cursor-default lg:hidden" style={{ background: "rgba(0,0,0,0.6)" }} />}
      <div className={`${open ? "fixed inset-x-0 bottom-0 z-40 flex max-h-[88dvh] flex-col overflow-y-auto rounded-t-[var(--radius-lg)] border-t" : "hidden"} lg:static lg:z-auto lg:block lg:min-w-0 lg:max-h-none lg:overflow-visible lg:rounded-none lg:border-0`} style={open ? { background: "var(--background)", borderColor: "var(--glass-border)" } : undefined}>
        <div className="flex justify-end px-[var(--space-4)] pt-[10px] lg:hidden">
          <button type="button" onClick={onClose} className="flex cursor-pointer items-center gap-[4px] rounded-full border px-[11px] py-[5px] text-[12.5px] font-bold" style={{ color: "var(--foreground)", borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>
            Close <ChevronDown className="h-[14px] w-[14px]" aria-hidden />
          </button>
        </div>
        <div className="p-[var(--space-4)] lg:p-0">{children}</div>
      </div>
    </>
  );
}

// Avatar plus name that opens the student's profile (app-wide rule: every
// avatar and name opens the profile). `id` is the roster id; a name with
// no roster match renders as plain text. Not for use inside another
// button (a queue card): nested buttons are invalid.
export function StudentLink({ id, name, index, size = 44, children }: { id?: string; name: string; index?: number; size?: number; /** the line under the name */ children?: React.ReactNode }) {
  const router = useRouter();
  const inner = (
    <>
      <Avatar name={name} size={size} index={index} />
      <span className="flex min-w-0 flex-col gap-[2px] text-left">
        <span className="flex min-w-0 items-center gap-[6px]"><span className="truncate text-[17px] leading-[1.2] font-bold" style={{ color: "var(--foreground)" }}>{name}</span>{id && <Go />}</span>
        {children}
      </span>
    </>
  );
  if (!id) return <span className="flex min-w-0 items-center gap-[12px]">{inner}</span>;
  return (
    <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${id}`)} className="dm-quiet group flex min-w-0 cursor-pointer items-center gap-[12px] rounded-[var(--radius-md)] text-left">
      {inner}
    </button>
  );
}

/** A 20px tick box that reads as a control at rest (older users, no hover
 *  on tablets): bordered, filled in the primary when on. */
export function SelectBox({ checked, label, onChange }: { checked: boolean; label: string; onChange: (on: boolean) => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="flex size-[20px] flex-none cursor-pointer items-center justify-center rounded-[6px] border transition-colors" style={{ borderColor: checked ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 35%, transparent)", background: checked ? "var(--primary)" : "transparent", color: "#fff" }}>
      {checked && <Check className="h-[12px] w-[12px]" aria-hidden />}
    </button>
  );
}
