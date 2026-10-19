"use client";

// v2 About Me: choosing a College Goal from the schools that fit (Chandu, 19
// Oct 2026: "when i click on an empty college goal card shouldn't it show me
// my recommended ones instead of taking me to explore schools? ... open a
// large modal like the build one and show the recommended (for you) colleges
// etc. Let them pick from there."). The same sheet, sky and side nav as Edit
// My Build (.myb-*), so the two read as one family. The lists are Explore
// Schools' For you, worked out the same way (pathway.ts): the schools for the
// Career Goal's usual route, sorted into Reach / Target / Likely by the
// student's GPA. Saved schools come first when there are any. The cards are
// Explore's own (SchoolCard), and a card opens the school's full page inside
// this sheet with a Back button (Chandu, same day: "Use the same card designs
// from explore here. Also make sure when they are clicked the whole
// thing/details page appears with a back button in the same large modal").
// The page's "Choose this school" makes it the College Goal.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, X } from "lucide-react";
import { InSheet } from "@/components/app/inSheet";
import { CollegeDetailExperience } from "@/components/colleges/CollegeDetailExperience";
import { useBackStep } from "@/lib/backStep";
import { IconTip } from "@/components/app/IconTip";
import { useLookV2 } from "@/components/app/look";
import { ThemeProvider } from "@/components/flow/theme/ThemeProvider";
import { BackgroundSpace } from "@/components/flow/aurora/BackgroundSpace";
import { AuroraBackground } from "@/components/flow/aurora/AuroraBackground";
import { STAGE_ACCENTS, STAGE_ACCENTS_V2 } from "@/components/build/types";
import type { College } from "@/components/colleges/data";
import { SchoolCard, useSaved as useSavedColleges } from "@/components/colleges/shared";
import { careerTitle, defaultRoute, pathwayFor, routesFor, schoolsForRoute, shortProgram, type SchoolMatch } from "@/components/colleges/pathway";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { ACADEMIC_RECORD } from "./report-data";

type ListId = "saved" | "target" | "reach" | "likely";
const LISTS: { id: ListId; label: string; note: string; color: string }[] = [
  { id: "saved", label: "Saved", note: "Schools you saved", color: "var(--accent-subtle)" },
  { id: "target", label: "Target", note: "A good match", color: "var(--pc-chip-path, #7db2ff)" },
  { id: "reach", label: "Reach", note: "Harder to get into", color: "var(--pc-chip-reach, #ffb35c)" },
  { id: "likely", label: "Likely", note: "Very likely to get in", color: "var(--pc-chip-safety, #5fd6a8)" },
];
// DEMO-ONLY: with no Career Goal that has school data, the demo's
// Investment Banking list (Explore Schools' For you leads with it too).
const FALLBACK_CAREER = "investment-banking";

export function CollegeGoalPicker({ careerIds, saved, onPick, onClose }: {
  /** the Career Goal first, then the rest of the Top 3 */
  careerIds: string[];
  /** saved schools, newest first */
  saved: College[];
  /** make this school the College Goal */
  onPick: (c: College, from: Element | null) => void;
  onClose: () => void;
}) {
  const lookV2 = useLookV2();
  const reduce = useReducedMotion();
  const stored = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot);
  const profile = useMemo(() => (stored.gpa ? stored : { ...stored, gpa: ACADEMIC_RECORD.gpa }), [stored]);
  const careerId = careerIds.find((id) => pathwayFor(id)) ?? FALLBACK_CAREER;
  const groups = useMemo(() => {
    const pathway = pathwayFor(careerId);
    const route = defaultRoute(routesFor(careerId), profile.path);
    if (!pathway || !route) return null;
    const r = schoolsForRoute(pathway, route, profile);
    // a 2-year or trade route has one list, not three: it reads as Target
    return r.fit ? { target: r.fit.target, reach: r.fit.reach, likely: [...r.fit.safety, ...r.fit.unplaced] } : { target: r.list, reach: [], likely: [] };
  }, [careerId, profile]);
  const lists = useMemo(() => {
    const out: Record<ListId, { college: College; line: string | null }[]> = { saved: saved.map((c) => ({ college: c, line: null })), target: [], reach: [], likely: [] };
    if (groups) for (const id of ["target", "reach", "likely"] as const) out[id] = groups[id].slice(0, 12).map((m: SchoolMatch) => ({ college: m.college, line: m.program }));
    return out;
  }, [groups, saved]);
  const shown = LISTS.filter((l) => lists[l.id].length > 0);
  const [list, setList] = useState<ListId>(shown[0]?.id ?? "target");
  const current = LISTS.find((l) => l.id === list) ?? LISTS[1];
  const [savedSet, toggleSaved] = useSavedColleges();
  // the school whose page is open in the sheet; Back (and the browser's
  // Back, one step) returns to the lists
  const [detail, setDetail] = useState<College | null>(null);
  useBackStep(detail !== null, () => setDetail(null));
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [detail]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key !== "Escape") return; if (detail) setDetail(null); else onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose, detail]);

  return createPortal(
    <ThemeProvider>
      <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} className="marketing-v2 themeable no-print fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--background) 72%, transparent)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }} onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-labelledby="college-goal-picker-title">
        <motion.div initial={reduce ? false : { opacity: 0, y: 18, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 360, damping: 32 }} className="myb-sheet"
          // larger than Edit My Build: school cards need the room (Chandu, 19
          // Oct 2026: "This modal can be larger")
          style={{ width: "min(1320px, calc(100% - 2rem))", height: "min(940px, calc(100dvh / var(--vz, 1) - 2rem))" }}>
          <div aria-hidden className="myb-sky">
            <BackgroundSpace />
            <AuroraBackground accent={(lookV2 ? STAGE_ACCENTS_V2 : STAGE_ACCENTS).education} visitedAccents={[]} lightning={false} />
          </div>
          <IconTip label="Close" className="absolute top-[14px] right-[14px] z-[3]">
            <button type="button" aria-label="Close" onClick={onClose} className="myb-x dm-quiet" style={{ position: "static" }}><X className="h-4 w-4" aria-hidden /></button>
          </IconTip>

          <aside className="myb-stage">
            <div className="flex flex-col gap-[6px] pr-[40px]">
              <h2 id="college-goal-picker-title" className="myb-title">Choose your college goal</h2>
              <p className="myb-lede">Schools for {careerTitle(careerId)}, sorted by your {profile.gpa} GPA. Pick one to make it your goal.</p>
            </div>
            <nav aria-label="School lists" role="tablist" className="myb-nav">
              {shown.map((l) => {
                const on = l.id === list;
                return (
                  <button key={l.id} type="button" role="tab" aria-selected={on} onClick={() => setList(l.id)} className="myb-nav-item">
                    <span className="flex items-center gap-[8px]">
                      <span aria-hidden className="size-[8px] flex-none rounded-full" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
                      <span className="myb-nav-title">{l.label}</span>
                    </span>
                    <span className="text-[12.5px] font-semibold tabular-nums" style={{ color: "var(--myb-mute)" }}>{lists[l.id].length}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="myb-pane">
            <div key={list} className="myb-scroll dm-rise" style={{ justifyContent: "flex-start" }}>
              <p className="pb-[var(--space-3)] text-[14px] leading-[19px]" style={{ color: "var(--myb-mute)" }}>{current.note}</p>
              {lists[list].length ? (
                // Three across (two on small tablets, one on phones), each card
                // scaled as a whole to its column so it keeps Explore's exact
                // shape (Chandu, 19 Oct 2026: "Can we not fit 3 in a row ...
                // make the cards uniformly and proportionately smaller"; before
                // that, "do not distort the school cards like this")
                <ul className="grid list-none grid-cols-1 gap-[var(--space-4)] p-0 min-[520px]:grid-cols-2 md:grid-cols-3">
                  {lists[list].map(({ college: c, line }) => (
                    <ScaledCard key={c.slug}>
                      <SchoolCard c={c} saved={savedSet.has(c.slug)} onSave={() => toggleSaved(c.slug)} compared={false} program={line ? shortProgram(line) : undefined} onOpen={() => setDetail(c)} />
                    </ScaledCard>
                  ))}
                </ul>
              ) : (
                <p className="py-[var(--space-6)] text-center text-[14px]" style={{ color: "var(--myb-mute)" }}>No schools here for this career yet.</p>
              )}
            </div>
          </div>

          {detail && (
            // the school's whole page, in the same sheet, over the lists
            <div className="absolute inset-0 z-[4] flex flex-col overflow-hidden rounded-[inherit]" style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <div className="flex flex-none items-center justify-between gap-[var(--space-3)] border-b px-[var(--space-4)] py-[var(--space-3)]" style={{ borderColor: "color-mix(in srgb, var(--myb-ink) 14%, transparent)" }}>
                <button type="button" onClick={() => setDetail(null)} className="dm-quiet flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[10px] text-[14px] font-bold" style={{ color: "var(--myb-ink)" }}>
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Back to schools
                </button>
                <span className="flex items-center gap-[var(--space-2)]">
                  <button type="button" onClick={(e) => onPick(detail, e.currentTarget)} className="dm-tap flex min-h-[40px] cursor-pointer items-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-4)] text-[14px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    <Check className="h-4 w-4" aria-hidden /> Choose this school
                  </button>
                  <IconTip label="Close">
                    <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-[40px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--myb-ink)" }}><X className="h-4 w-4" aria-hidden /></button>
                  </IconTip>
                </span>
              </div>
              <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                <InSheet.Provider value={true}>
                  <CollegeDetailExperience slug={detail.slug} />
                </InSheet.Provider>
              </div>
            </div>
          )}

          <div className="myb-foot">
            <Link href="/colleges" className="dm-quiet flex min-h-[40px] items-center gap-[2px] rounded-[var(--radius-md)] px-[12px] text-[14px] font-bold" style={{ color: "var(--myb-ink)" }}>
              See all schools <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </ThemeProvider>,
    document.body,
  );
}

// Explore's school card is designed at about 310 x 420 (SchoolCard is a fixed
// 420px tall). Laid out at that width and zoomed to the column, it shrinks or
// grows as one picture: photo, type, chips and stats keep their proportions.
const CARD_W = 310;

/** One grid cell that scales its card uniformly to the cell's width. */
function ScaledCard({ children }: { children: React.ReactNode }) {
  const cell = useRef<HTMLLIElement>(null);
  // null: one card per row (phones), which simply fills the row, as Explore does
  const [scale, setScale] = useState<number | null>(1);
  useEffect(() => {
    const el = cell.current;
    if (!el) return;
    const fit = () => {
      // layout widths (clientWidth), not screen ones: the app zooms the whole
      // page on wide screens, which getBoundingClientRect would count twice
      const w = el.clientWidth;
      const row = el.parentElement?.clientWidth ?? w;
      if (w <= 0) return;
      setScale(w > row * 0.9 ? null : w / CARD_W);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <li ref={cell} className="min-w-0">
      {scale === null ? children : <div style={{ width: CARD_W, zoom: scale }}>{children}</div>}
    </li>
  );
}
