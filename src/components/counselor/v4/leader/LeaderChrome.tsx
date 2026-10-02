"use client";

// The School Leader and District Leader pieces of the dashboard shell
// (2 Oct 2026), rebuilt from the Replit's leader header (NOTES.md 1.2, 2.0,
// 3.0). Three things a leader's top bar carries instead of the counselor's
// filters:
//
// - Identity: the school (or the district), with its one-line facts, in
//   place of the counselor's school picker, year and grade chips and the
//   student search. A leader sees one school (or one district), so there is
//   nothing to pick, and the dashboards are schoolwide, so there are no
//   students to search.
// - "Data definitions": the Replit's modal, as the dashboard's own side
//   panel. Every measure in one place, with its numerator, denominator and
//   launch baseline.
// - "Back to Metro Heights": shown only when a district leader opened this
//   school from the District view. The Replit has no way back except its
//   Demo View select (NOTES.md 6).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { DISTRICT, districtDataDefinitions, schoolById, schoolDataDefinitions, schoolLocation, type DataDefinitionsModal } from "@/lib/leaderData";
import type { CounselorRole } from "@/lib/counselorAccount";
import { GLASS_INSET } from "../../surfaces";
import { SidePanel } from "../SidePanel";
import { backToDistrict, useFromDistrict, useLeaderSchoolId } from "./context";

export const isLeaderRole = (role: CounselorRole | ""): role is "School Leader" | "District Leader" => role === "School Leader" || role === "District Leader";

/** The org a leader role is looking at: its name, one-line facts and the footer initials. */
export function useLeaderOrg(role: "School Leader" | "District Leader") {
  const schoolId = useLeaderSchoolId();
  if (role === "District Leader") return { name: DISTRICT.name, meta: DISTRICT.metaLine, initials: DISTRICT.sidebar.initials };
  const s = schoolById(schoolId);
  const name = s?.name ?? "Northbridge Academy";
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return { name, meta: s ? `${schoolLocation(s)} · ${s.enrollment.toLocaleString("en-US")} students · 2026–27` : "2026–27", initials };
}

/** Desktop and mobile top-bar identity, plus the way back to the district. */
export function LeaderIdentity({ role, compact = false }: { role: "School Leader" | "District Leader"; compact?: boolean }) {
  const org = useLeaderOrg(role);
  const fromDistrict = useFromDistrict();
  const router = useRouter();
  return (
    <div className="flex min-w-0 items-center gap-[10px]">
      {role === "School Leader" && fromDistrict && (
        <button type="button" onClick={() => backToDistrict(router.push)} className="dm-quiet flex h-9 flex-none cursor-pointer items-center gap-[4px] rounded-[var(--radius-sm)] border pr-[12px] pl-[8px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
          <ChevronLeft className="h-4 w-4" aria-hidden /> {compact ? "District" : "Metro Heights"}
        </button>
      )}
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[14px] font-bold" style={{ color: "var(--foreground)" }}>{org.name}</span>
        {!compact && <span className="truncate text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{org.meta}</span>}
      </span>
    </div>
  );
}

/** The "Data definitions" button and its panel. */
export function DataDefinitionsButton({ role, iconOnly = false }: { role: "School Leader" | "District Leader"; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const schoolId = useLeaderSchoolId();
  const defs: DataDefinitionsModal = role === "District Leader" ? districtDataDefinitions(schoolId) : schoolDataDefinitions(schoolId);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Data definitions" className={`dm-quiet flex h-9 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] ${iconOnly ? "w-9 justify-center" : "border px-[12px]"} text-[13px] font-semibold`} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
        <BookOpen className="h-4 w-4" aria-hidden />
        {!iconOnly && "Data definitions"}
      </button>
      <SidePanel open={open} onClose={() => setOpen(false)} title={defs.title} subtitle={defs.subtitle}>
        <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{defs.outcomesHeading}</span>
        <div className="flex flex-col gap-[8px]">
          {defs.outcomes.map((o) => (
            <div key={o.id} className="flex flex-col gap-[4px] rounded-[var(--radius-md)] border p-[12px]" style={GLASS_INSET}>
              <span className="flex items-baseline justify-between gap-[10px]">
                <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{o.title}</span>
                <span className="flex-none text-[15px] font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{o.current}%</span>
              </span>
              <span className="text-[12.5px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{o.numerator} ÷ {o.denominator}</span>
              <span className="text-[12px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>Launch baseline {o.baseline}% · {o.deltaLabel}</span>
            </div>
          ))}
        </div>
        {defs.blocks.map((b) => (
          <div key={b.title} className="flex flex-col gap-[4px]">
            <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{b.title}</span>
            <p className="text-[12.5px] leading-[19px]" style={{ color: "var(--muted-foreground)" }}>{b.body}</p>
          </div>
        ))}
      </SidePanel>
    </>
  );
}
