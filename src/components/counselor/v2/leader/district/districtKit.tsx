"use client";

// Shared pieces for the five District Leader screens (2 Oct 2026).
// DEMO-ONLY v2. Everything here exists so the screens read as one system:
// the same status chip, the same bar, the same school row, and one place
// that decides how a school is opened and how a KPI drills.
//
// Colour rule (the user's standing one): blue plus status colours. The
// Replit's purple / blue / orange status pills become green / blue / amber
// dots on a neutral chip: the text stays foreground, only the dot carries
// the status, as Verdict does in overviewShared.tsx.

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Go } from "../../../chips";
import { RankBar } from "../../overviewShared";
import type { Drill } from "../../Drill";
import { openSchoolFromDistrict } from "../context";
import {
  DISTRICT_TOTALS,
  SCHOOLS,
  SCHOOL_STATUS_LABELS,
  schoolLocation,
  type DistrictKpi,
  type LeaderSchool,
  type SchoolStatus,
} from "@/lib/leaderData";

/** 13058 -> "13,058". */
export const int = (n: number): string => n.toLocaleString("en-US");
/** 18 -> "+18.0 pts" (the Replit prints one decimal on every delta). */
export const pts = (n: number): string => `+${n.toFixed(1)} pts`;

export const STATUS_COLOR: Record<SchoolStatus, string> = {
  above: "var(--cd-green)",
  meeting: "var(--primary)",
  support: "var(--cd-amber)",
};

/** The leading dot every status wears. */
export function StatusDot({ color }: { color: string }) {
  return <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />;
}

/** Above / Meeting / Support: a neutral chip, a coloured dot. */
export function StatusChip({ status, short = false }: { status: SchoolStatus; short?: boolean }) {
  const l = SCHOOL_STATUS_LABELS[status];
  return (
    <span className="inline-flex w-fit flex-none items-center gap-[7px] rounded-full border px-[10px] py-[3px] text-[11.5px] leading-[16px] font-bold whitespace-nowrap" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <StatusDot color={STATUS_COLOR[status]} />
      {short ? l.shortCaption : l.pill}
    </span>
  );
}

/** Opens a school: every school row on every District screen goes through
 *  here (decision, 2 Oct 2026). `team` lands on that school's Counseling Team. */
export function useOpenSchool() {
  const router = useRouter();
  return useCallback((schoolId: string, view: "overview" | "team" = "overview") => openSchoolFromDistrict(router.push, schoolId, view), [router]);
}

/** A thin gradient bar (the RankBar family) with an optional neutral
 *  reference tick, e.g. the district value or the launch baseline. `color`
 *  lets a status colour in; the default is the one blue. */
export function Bar({ value, reference, color = "var(--primary)", height = 6 }: { value: number; /** percent of the full bar */ reference?: number; color?: string; height?: number }) {
  if (reference === undefined && color === "var(--primary)") return <RankBar value={value} height={height} />;
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className="relative block w-full rounded-full" style={{ height, background: "color-mix(in srgb, var(--foreground) 12%, transparent)" }} aria-hidden>
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${v}%`, background: `linear-gradient(90deg, color-mix(in srgb, ${color} 35%, transparent), ${color})` }} />
      {reference !== undefined && <span className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-[1px]" style={{ left: `calc(${Math.max(0, Math.min(100, reference))}% - 1px)`, background: "color-mix(in srgb, var(--foreground) 55%, transparent)" }} />}
    </span>
  );
}

/** School name over "City, NY · N students". Wraps instead of truncating so
 *  a long name keeps its caption on a phone. */
export function SchoolCell({ school, students }: { school: LeaderSchool; students?: number }) {
  return (
    <span className="flex min-w-0 flex-col gap-[2px]">
      <span className="text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>{school.name}</span>
      <span className="text-[11.5px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{schoolLocation(school)} · {int(students ?? school.enrollment)} students</span>
    </span>
  );
}

/** A tappable school row: a real button with an aria-label and the shared
 *  hover chevron. Children are inline-level (spans) so the markup stays
 *  valid inside a button. */
export function SchoolRow({ school, onOpen, children, view }: { school: LeaderSchool; onOpen: (id: string, view?: "overview" | "team") => void; children: React.ReactNode; view?: "overview" | "team" }) {
  return (
    <button type="button" onClick={() => onOpen(school.id, view)} aria-label={view === "team" ? `Open ${school.name} counseling team` : `Open ${school.name}`} className="dm-quiet group flex w-full cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] px-[10px] py-[10px] text-left">
      <span className="min-w-0 flex-1">{children}</span>
      <Go />
    </button>
  );
}

/** Column heads for a school table; hidden below md, where rows stack. */
export function TableHead({ template, labels }: { template: string; labels: { label: string; align?: "right" }[] }) {
  return (
    <div className={`hidden gap-[12px] px-[10px] pr-[36px] pb-[8px] md:grid ${template}`} role="presentation">
      {labels.map((l) => (
        <span key={l.label} className={`text-[11px] font-bold tracking-[0.06em] uppercase ${l.align === "right" ? "text-right" : ""}`} style={{ color: "var(--muted-foreground)" }}>{l.label}</span>
      ))}
    </div>
  );
}

/** The divider rule between rows of a school list. */
export const ROWS = "flex flex-col [&>*+*]:border-t [&>*+*]:border-t-[var(--glass-border)]";

/** A muted one-line note under a card's content. */
export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] leading-[17px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{children}</p>;
}

/** Small-caps label above a control or a card section. */
export const EYEBROW = "text-[11px] font-bold tracking-[0.06em] uppercase";

/** Value of one outcome measure for a school (professional exposure
 *  included). Capacity has no per-school outcome value, see `kpiDrill`. */
type OutcomeId = "career" | "postsecondary" | "experiential" | "professional" | "planning";

/**
 * The drill behind a District KPI card. The Replit's (i) tooltip becomes the
 * lead; current / baseline / change become stats; and the breakdown it never
 * had: every school's value for this measure, highest first, so a
 * superintendent sees which schools are behind (decision, 2 Oct 2026).
 * Counselor capacity has no per-school outcome value; each school's
 * counselor efficiency (a relative %, not points) stands in for it, as the
 * Replit does on the drilled-in School Counseling Team.
 */
export function kpiDrill(kpi: DistrictKpi, onCompare: () => void): Drill {
  const isCapacity = kpi.id === "capacity";
  const valueOf = (s: LeaderSchool): number => (isCapacity ? s.counselorEfficiency.pct : s[kpi.id as OutcomeId].value);
  const sorted = [...SCHOOLS].sort((a, b) => valueOf(b) - valueOf(a));
  const top = valueOf(sorted[0]) || 1;
  const below = SCHOOLS.filter((s) => valueOf(s) < kpi.value).length;
  const baseline = isCapacity ? "0% relative" : `${kpi.baseline}%`;
  return {
    title: kpi.label,
    subtitle: `District rollup · ${int(DISTRICT_TOTALS.enrollment)} students · 2026–27`,
    lead: kpi.tooltip,
    stats: [
      { value: isCapacity ? "19% relative" : kpi.displayValue, label: "2026–27 current" },
      { value: baseline, label: "Launch baseline" },
      { value: isCapacity ? "+19% relative" : pts(kpi.delta), label: isCapacity ? "Change, not percentage points" : "Change vs launch" },
      { value: `${below} of ${SCHOOLS.length}`, label: "Schools below the district value" },
    ],
    rowsLabel: isCapacity ? "Counselor efficiency by school, relative % (highest first)" : "Every school, highest first",
    rows: sorted.map((s) => {
      const v = valueOf(s);
      return isCapacity
        ? { label: s.name, value: `+${v}% relative`, pct: (v / top) * 100 }
        : { label: s.name, value: `${v}% · ${pts(s[kpi.id as OutcomeId].delta)}`, pct: v };
    }),
    action: { label: "Compare in School performance", onClick: onCompare },
  };
}

/** Download a CSV built client-side. A BOM keeps the en dash intact in Excel. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = rows.map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["﻿", body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
