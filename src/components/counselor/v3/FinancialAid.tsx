"use client";

// Counselor Dashboard v3 (29 Sept 2026): Financial Aid, new. The research's
// money gap: v2 tracked the FAFSA as one milestone ("Financial Aid",
// counted on Readiness for admins) with no way to see WHY a senior had not
// finished or to act on it. Here every senior is in one of the research's
// three states, each incomplete one says the one fix it needs (usually a
// parent contributor who has not signed), and every row has its one
// action: remind, confirm what the student reported, or record the opt-out
// form the state accepts instead.
//
// Layout follows the v2 budget: one hero (the ring), states as underline
// sub-tabs over one list, worst first, one line per row. The status words
// use the reserved colors because these states ARE the "needs you"
// signal; completed rows stay quiet.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Landmark } from "lucide-react";
import { SegmentedRing } from "@/components/connect/viz";
import { HoverBeam } from "@/components/app/HoverBeam";
import { useReviewedRoster } from "@/lib/counselorReviews";
import { confirmFafsa, FAFSA_LABEL, fafsaRows, meetsRequirement, remindFafsa, setOptOut, useFafsaOverrides, type FafsaRow, type FafsaState } from "@/lib/counselorFafsa";
import { addSend } from "@/lib/counselorCasefile";
import { logTime } from "@/lib/counselorTimeLog";
import { shortDate } from "@/lib/localRecord";
import { Avatar } from "../chips";
import { GLASS_CARD, GLASS_CARD_HERO, GLASS_INSET, glowBackdrop } from "../surfaces";
import { NEUTRAL_SLICE, PRIMARY } from "../palette";
import { SubTabs } from "./SubTabs";
import { ShowAll } from "./Disclosure";

const STATE_COLOR: Record<FafsaState, string> = {
  "not-submitted": "var(--cd-red)",
  incomplete: "var(--cd-amber)",
  completed: PRIMARY,
  "opted-out": NEUTRAL_SLICE,
};

type Tab = "attention" | FafsaState | "confirm";

export function FinancialAid() {
  const router = useRouter();
  const roster = useReviewedRoster();
  const o = useFafsaOverrides();
  const rows = useMemo(() => fafsaRows(roster, o), [roster, o]);
  const [tab, setTab] = useState<Tab>("attention");
  const [all, setAll] = useState(false);

  const count = (st: FafsaState) => rows.filter((r) => r.state === st).length;
  const confirm = rows.filter((r) => r.needsConfirm);
  const met = rows.filter(meetsRequirement).length;
  const pct = rows.length ? Math.round((met / rows.length) * 100) : 0;
  const open = rows.filter((r) => r.state === "not-submitted" || r.state === "incomplete");
  const list = tab === "attention" ? [...open, ...confirm] : tab === "confirm" ? confirm : rows.filter((r) => r.state === tab && (tab !== "completed" || !r.needsConfirm));
  const shown = all ? list : list.slice(0, 8);

  const remind = (targets: FafsaRow[]) => {
    const ids = targets.map((r) => r.student.id);
    remindFafsa(ids);
    addSend({ kind: "reminder", text: "Your FAFSA still needs a step. Open My Plan or book a Financial aid meeting.", studentIds: ids, audience: targets.length === 1 ? targets[0].student.name : "Seniors with an open FAFSA" });
    logTime({ activity: targets.length === 1 ? `FAFSA reminder, ${targets[0].student.name}` : `FAFSA reminders (${targets.length})`, minutes: targets.length === 1 ? 2 : 4, kind: "indirect", studentId: targets.length === 1 ? targets[0].student.id : undefined });
  };

  const btn = "dm-quiet flex h-8 flex-none cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] border px-[11px] text-[12.5px] font-bold";
  const verdict = open.length === 0 ? "Every senior has filed or opted out" : `${open.length} ${open.length === 1 ? "senior needs" : "seniors need"} help to finish`;

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <div className="@container">
        <div className="grid grid-cols-1 gap-[var(--space-4)] @[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* The one hero: where every senior stands. */}
          <HoverBeam strength={0.7} className="h-full">
            <div className="relative flex h-full flex-col gap-[var(--space-4)] overflow-hidden rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD_HERO}>
              <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glowBackdrop(PRIMARY, 0.28) }} />
              <div className="relative flex flex-wrap items-center justify-between gap-[8px]">
                <h2 className="text-[15px] leading-[1.3] font-bold" style={{ color: "var(--foreground)" }}>FAFSA <span className="ml-[6px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{rows.length} seniors</span></h2>
                {open.length > 0 && (
                  <button type="button" onClick={() => remind(open)} className="dm-solid flex h-9 cursor-pointer items-center gap-[6px] rounded-[var(--radius-sm)] bg-[var(--primary)] px-[12px] text-[12.5px] font-bold text-[var(--primary-foreground)]">Remind all {open.length}</button>
                )}
              </div>
              <div className="relative flex flex-col items-center gap-[var(--space-5)] sm:flex-row">
                <SegmentedRing segments={(["completed", "opted-out", "incomplete", "not-submitted"] as FafsaState[]).map((st) => ({ value: count(st), color: STATE_COLOR[st] }))} size={140} stroke={15}>
                  <span className="flex flex-col items-center">
                    <span className="text-[32px] leading-[1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pct}%</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>filed</span>
                  </span>
                </SegmentedRing>
                <div className="flex w-full min-w-0 flex-1 flex-col gap-[var(--space-3)]">
                  <p className="flex items-center gap-[8px] text-[13.5px] leading-[18px] font-bold" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: open.length ? "var(--cd-amber)" : "var(--cd-green)" }} />
                    {verdict}
                  </p>
                  <ul className="flex flex-col gap-[4px] text-[13px] font-semibold">
                    {(["not-submitted", "incomplete", "completed", "opted-out"] as FafsaState[]).map((st) => (
                      <li key={st} className="flex items-center justify-between gap-[8px]">
                        <span className="flex items-center gap-[8px]" style={{ color: "var(--muted-foreground)" }}><span aria-hidden className="size-[8px] rounded-full" style={{ background: STATE_COLOR[st] }} />{FAFSA_LABEL[st]}</span>
                        <span className="tabular-nums" style={{ color: "var(--foreground)" }}>{count(st)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </HoverBeam>

          {/* The rule that makes this urgent, stated once. */}
          <div className="flex h-full flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
            <span className="flex items-center gap-[10px]">
              <span className="flex size-[30px] items-center justify-center rounded-[8px]" style={{ background: "color-mix(in srgb, var(--primary) 16%, transparent)", color: "var(--primary)" }}><Landmark className="h-[15px] w-[15px]" aria-hidden /></span>
              <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Required to graduate</h2>
            </span>
            <p className="text-[13px] leading-[19px] font-medium" style={{ color: "var(--foreground)" }}>In Illinois every senior files the FAFSA, the state&apos;s alternative application, or an opt-out form signed by a parent (or by the student at 18).</p>
            <p className="text-[12.5px] leading-[18px] font-medium" style={{ color: "var(--muted-foreground)" }}>Status comes from what students report and what you confirm. A state data feed replaces it where one exists.</p>
            <div className="mt-auto flex flex-wrap gap-[8px] pt-[var(--space-2)]">
              <button type="button" onClick={() => router.push("/counselor?view=meetings")} className={btn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Financial aid meetings</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={GLASS_CARD}>
        <SubTabs
          ariaLabel="FAFSA status"
          value={tab}
          onChange={(k) => { setTab(k); setAll(false); }}
          options={[
            { key: "attention", label: "Needs you", count: open.length + confirm.length },
            { key: "not-submitted", label: "Not submitted", count: count("not-submitted") },
            { key: "incomplete", label: "Incomplete", count: count("incomplete") },
            { key: "confirm", label: "To confirm", count: confirm.length },
            { key: "completed", label: "Completed", count: count("completed") - confirm.length },
            { key: "opted-out", label: "Opted out", count: count("opted-out") },
          ]}
        />
        {list.length === 0 ? (
          <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{tab === "attention" ? "Nothing needs you here." : "No seniors in this group."}</p>
        ) : (
          <ul className="flex flex-col gap-[6px]">
            {shown.map((r) => (
              <li key={r.student.id} className="flex flex-wrap items-center gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border px-[12px] py-[8px]" style={GLASS_INSET}>
                <button type="button" onClick={() => router.push(`/counselor?view=students&studentId=${r.student.id}`)} className="dm-quiet flex min-w-0 flex-1 cursor-pointer items-center gap-[12px] rounded-[var(--radius-sm)] text-left">
                  <Avatar name={r.student.name} size={32} index={r.student.avatarIndex} />
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{r.student.name}</span>
                    <span className="truncate text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.note}{r.remindedAt ? ` · reminded ${shortDate(r.remindedAt.slice(0, 10))}` : ""}</span>
                  </span>
                </button>
                <span className="flex flex-none items-center gap-[6px] text-[12px] font-bold" style={{ color: "var(--foreground)" }}>
                  <span aria-hidden className="size-[8px] rounded-full" style={{ background: r.needsConfirm ? "var(--cd-amber)" : STATE_COLOR[r.state] }} />
                  {r.needsConfirm ? "To confirm" : FAFSA_LABEL[r.state]}
                </span>
                <span className="flex flex-none gap-[6px]">
                  {r.needsConfirm && <button type="button" onClick={() => { confirmFafsa(r.student.id); logTime({ activity: `FAFSA confirmed, ${r.student.name}`, minutes: 2, kind: "indirect", studentId: r.student.id }); }} className={btn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><Check className="h-[13px] w-[13px]" aria-hidden /> Confirm</button>}
                  {(r.state === "not-submitted" || r.state === "incomplete") && <button type="button" onClick={() => remind([r])} className={btn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>{r.remindedAt ? "Remind again" : "Remind"}</button>}
                  {r.state === "not-submitted" && <button type="button" onClick={() => setOptOut(r.student.id, true)} className={btn} style={{ borderColor: "transparent", color: "var(--muted-foreground)" }}>Opt-out on file</button>}
                  {r.state === "opted-out" && <button type="button" onClick={() => setOptOut(r.student.id, false)} className={btn} style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Undo</button>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {list.length > 8 && <ShowAll total={list.length} shown={8} open={all} onToggle={() => setAll((v) => !v)} />}
      </div>
    </div>
  );
}
