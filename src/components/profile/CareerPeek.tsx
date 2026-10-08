"use client";

// Career Peek: a Top 3 card opens into this instead of leaving Profile
// (6 Oct 2026). The whole career on one sheet, with the student's other
// two a key press away, so comparing by flipping stays inside the page.
//
// 7 Oct 2026: rebuilt to match dreamonna's career sheet, read pixel by
// pixel in the browser (Chandu: "the career preview is better on it...
// Please match it. The glow is good too"). The world colour is the sheet's
// one accent: a radial glow in the top-right, the tinted border and shadow,
// the world chip, the rule under the title, the fact values, the CTA. The
// tabs are the page's own segmented bar; each tab is a plain stack with a
// ruled title and no boxes inside the box ("we don't need the additional
// boxes"). The scroll edge frosts progressively under the footer and the
// tabs, the way iOS frosts the strip under the clock ("the scroll thing
// from Apple"). Where people work shows the real company marks Connect
// already ships (brand rule: a mark only where the brand publishes a
// one-colour version; the rest stay as text chips).

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText, Play, X } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { heroFocus } from "@/components/career/heroFocus";
import { careerProfile } from "@/components/career/profiles";
import { PayRows, Rung } from "@/components/career/CareerDetailExperience";
import { PayMap } from "@/components/career/PayMap";
import { ModalActionFeedback } from "@/components/actions-lab/labUi";
import { CareerHeaderActions, careerButtonInk } from "@/components/actions-lab/CareerHeaderActions";
import { useRouter } from "next/navigation";
import { PosterCard } from "@/components/app/PosterCard";
import { openCareerPeek } from "@/components/app/peek";
import { simulationFor } from "@/components/play/games";
import { resolveCareer, similarCareers } from "@/components/career/data";
import { careerSlug } from "@/components/career/slug";
import { ConnectWithProfessionalsModal } from "@/components/career/ConnectWithProfessionalsModal";
import { FullPageLink, SheetGrabber, sheetMotion, sheetOverlayClass, useDragControls, useNarrowSheet } from "@/components/app/PeekSheet";
import { statePay } from "@/components/career/statePay";
import { serverStudentProfileSnapshot, studentProfileSnapshot, subscribeStudentProfile } from "@/lib/studentProfile";
import { IconTip } from "@/components/app/IconTip";
import { ScrollEdges } from "@/components/app/cardChrome";
import { Segmented } from "@/components/connect/viz";
import { CompanyChip } from "@/components/connect/primitives";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { reportV2 } from "./report-data";
import { ALL_PROFILE_CAREERS } from "./data";
import { top3PhotoFocus } from "./top3PhotoFocus";

type PeekTab = "overview" | "education" | "ladder" | "pay" | "software";
const TABS: { key: PeekTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "education", label: "Education" },
  { key: "ladder", label: "Career Ladder" },
  { key: "pay", label: "Pay" },
  { key: "software", label: "Software" },
];
const EASE = [0.22, 1, 0.36, 1] as const;
const PLACEHOLDER = "Coming soon";
/** Report employer names that Connect's mark table spells differently. */
const MARK_ALIAS: Record<string, string> = { JPMorgan: "JPMorgan Chase" };

export function CareerPeek({ ids, index, onIndex, onClose, onReport, variant = "detail" }: {
  /** the Top 3, in rank order */
  ids: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** Profile already owns ranking/removal; its popup offers Play and Report. */
  variant?: "detail" | "top3";
  onReport?: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const narrow = useNarrowSheet();
  const drag = useDragControls();
  const id = ids[index];
  const career = ALL_PROFILE_CAREERS.find((c) => c.id === id) ?? null;
  const profile = useMemo(() => (id ? careerProfile(id) : undefined), [id]);
  const report = useMemo(() => (id ? reportV2(id) : undefined), [id]);
  // Pay by state reads the student's Build states, the same way the page does.
  const pickedStates = useSyncExternalStore(subscribeStudentProfile, studentProfileSnapshot, serverStudentProfileSnapshot).states;
  const pay = useMemo(() => (id ? statePay(id, pickedStates, profile?.payByState) : undefined), [id, pickedStates, profile]);
  const [tab, setTab] = useState<PeekTab>("overview");
  const [payView, setPayView] = useState<"states" | "country">("states");
  const [connectOpen, setConnectOpen] = useState(false);
  const router = useRouter();
  const similar = useMemo(() => { const rc = id ? resolveCareer(id) : null; return rc ? similarCareers(rc).slice(0, 8) : []; }, [id]);
  const [openRung, setOpenRung] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const go = (delta: 1 | -1) => {
    const next = index + delta;
    if (next < 0 || next >= ids.length) return;
    setDir(delta);
    setOpenRung(null);
    onIndex(next);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, ids.length, onClose]);
  if (!career) return null;
  const accent = WORLD_COLORS[career.world] ?? "var(--primary)";
  const simulation = simulationFor(career.id);

  // The same view model the page builds: profile first, report and catalog
  // as fallbacks, and nothing rendered for a value that is not written yet.
  const summary = profile?.summary ?? report?.glance.simple ?? "";
  const scenario = profile?.scenario ?? report?.glance.example ?? "";
  const facts = (profile?.facts ?? [
    { label: "Typical degree", value: report?.education.find((r) => r.common)?.name ?? career.routes[0]?.program ?? "" },
    { label: "Typical pay", value: report?.salary.median ?? career.routes[0]?.salary ?? "" },
  ]).filter((f) => f.value && f.value !== PLACEHOLDER && f.value !== "See Career Detail" && !/people doing|jobs open|majors/i.test(f.label)).slice(0, 2);
  const knowAbout = profile?.knowAbout ?? [];
  const goodAt = profile?.goodAt ?? [];
  const employers = report?.glance.employers ?? [];
  const software = profile?.software ?? [];
  const ladder = profile?.ladder ?? [];
  const education = profile?.education;
  const hasPay = !!pay && ((pay.yourStates?.length ?? 0) > 0 || pay.best.length > 0);
  const available: PeekTab[] = [
    "overview",
    ...(education && (education.studies.length > 0 || education.where.length > 0) ? ["education" as const] : []),
    ...(ladder.length > 0 ? ["ladder" as const] : []),
    ...(hasPay ? ["pay" as const] : []),
    ...(software.length > 0 ? ["software" as const] : []),
  ];
  const activeTab = available.includes(tab) ? tab : "overview";
  const list = (items: string[]) => (
    <ul className="cpk-list">
      {items.filter((it) => it.trim()).map((it) => <li key={it} className="cpk-item"><span aria-hidden className="cpk-item-dot" />{it}</li>)}
    </ul>
  );

  return createPortal(
    <motion.div
      initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className={sheetOverlayClass(narrow)}
      style={{ background: "color-mix(in srgb, var(--background) 48%, transparent)", backdropFilter: "blur(16px) saturate(1.15)", WebkitBackdropFilter: "blur(16px) saturate(1.15)" }}
      onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="career-peek-title"
    >
      <motion.div
        {...sheetMotion(narrow, reduce, drag, onClose)}
        className={`cpk-sheet cpk-refined ${narrow ? "cpk-drawer" : ""}`}
        style={{ ["--cpk-world" as string]: accent, fontFamily: "var(--font-body)" }}
      >
        {narrow && <SheetGrabber controls={drag} />}
        {/* the photo: the poster, full height on desktop, the header band
           of the drawer on phones and tablets */}
        <div className="cpk-art">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={career.id} initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0">
              {/* the drawer's wide band uses the face-tracked header crop so the
                 face sits fully in view (Chandu, 8 Oct 2026); the tall
                 desktop panel keeps the poster crop */}
              <Image src={career.photo} alt="" fill sizes={narrow ? "100vw" : "420px"} className="object-cover" style={{ objectPosition: narrow ? (heroFocus(career.photo)?.desktop ?? top3PhotoFocus(career)) : top3PhotoFocus(career) }} priority />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* prev / next / close: no counter, it is always your Top 3 */}
        <div className="cpk-controls">
          {ids.length > 1 && (
            <>
              <IconTip label={index > 0 ? `Previous: #${index}` : "First of your Top 3"}>
                <button type="button" aria-label="Previous career" disabled={index === 0} onClick={() => go(-1)} className="cpk-ctl"><ChevronLeft className="h-4 w-4" aria-hidden /></button>
              </IconTip>
              <IconTip label={index < ids.length - 1 ? `Next: #${index + 2}` : "Last of your Top 3"}>
                <button type="button" aria-label="Next career" disabled={index === ids.length - 1} onClick={() => go(1)} className="cpk-ctl"><ChevronRight className="h-4 w-4" aria-hidden /></button>
              </IconTip>
            </>
          )}
          <FullPageLink href={`/career/${career.id}`} />
          <IconTip label="Close">
            <button type="button" aria-label="Close" onClick={onClose} className="cpk-ctl"><X className="h-4 w-4" aria-hidden /></button>
          </IconTip>
        </div>

        <div className="cpk-content">
          <AnimatePresence initial={false} mode="wait" custom={dir}>
            <motion.div
              key={career.id}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -16, transition: { duration: 0.14 } }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex min-h-0 flex-1 flex-col"
            >
              {/* header: the name, the world under it the way the browse
                 cards write it, the rule, one line */}
              <h2 id="career-peek-title" className="cpk-title cpk-title-first" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</h2>
              <span className="cpk-world">{career.world}</span>
              <span aria-hidden className="mt-[12px] block h-[4px] w-[48px] rounded-full" style={{ background: accent }} />
              {summary && <p className="cpk-lede">{summary}</p>}

              {/* quick facts: one strip, divided, label over the value in the world colour */}
              {facts.length > 0 && (
                <div className="cpk-facts" style={{ gap: 0, border: `1px solid color-mix(in srgb, ${accent} 30%, var(--glass-border))`, borderRadius: "var(--radius-md)", background: `color-mix(in srgb, ${accent} 9%, var(--glass-surface-1))`, overflow: "hidden" }}>
                  {facts.map((f, i) => (
                    <div key={f.label} className="cpk-fact" style={{ border: 0, borderRadius: 0, background: "transparent", borderLeft: i > 0 ? "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)" : undefined }}>
                      <span className="cpk-fact-label">{f.label}</span>
                      <span className="cpk-fact-value" >{f.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="cpk-tabs">
                <Segmented<PeekTab> ariaLabel="About this career" value={activeTab} onChange={setTab} options={TABS.filter((t) => available.includes(t.key))} grow />
              </div>

              {/* the tab, one stack of ruled sections; a keyed block with a CSS
                  rise (a second AnimatePresence nested here stalls a step behind) */}
              <div className="cpk-details relative min-h-0 flex-1">
                <div key={activeTab} tabIndex={0} className="cpk-scroll" style={{ position: "absolute", inset: 0 }}>
                  <div key={activeTab} className={`cpk-stack dm-rise ${activeTab === "overview" ? "cpk-overview" : ""}`}>
                    {activeTab === "overview" && (
                      <>
                        {scenario && (
                          <section className="cpk-section">
                            <h3 className="cpk-section-title">What they actually do</h3>
                            <p className="cpk-body">{scenario}</p>
                          </section>
                        )}
                        {knowAbout.length > 0 && <section className="cpk-section cpk-overview-half"><h3 className="cpk-section-title">What you need to know about</h3>{list(knowAbout)}</section>}
                        {goodAt.length > 0 && <section className="cpk-section cpk-overview-half"><h3 className="cpk-section-title">What you would need to be good at</h3>{list(goodAt)}</section>}
                        {employers.length > 0 && (
                          <section className="cpk-section">
                            <h3 className="cpk-section-title">Where people work</h3>
                            <div className="flex flex-wrap items-center gap-[8px]">
                              {employers.slice(0, 6).map((e) => <CompanyChip key={e} name={MARK_ALIAS[e] ?? e} tone="surface" size="md" />)}
                            </div>
                            <p className="cpk-note">Examples of places where people do this job. They are not job openings.</p>
                          </section>
                        )}
                        {!scenario && knowAbout.length === 0 && goodAt.length === 0 && <p className="cpk-body" style={{ color: "var(--muted-foreground)" }}>The full picture for {career.title} is on its own page for now.</p>}
                        {/* the page's "Careers like this one", so the sheet is
                           enough on its own (8 Oct 2026, team note: "can we
                           accommodate these in the modal so we don't use the
                           detail page at all"); a card opens that career here */}
                        {similar.length > 0 && (
                          <section className="cpk-section">
                            <h3 className="cpk-section-title">Careers like this one</h3>
                            <div className="poster-row -mx-[4px] flex gap-[var(--space-3)] overflow-x-auto px-[4px] pb-[4px] flow-scroll">
                              {similar.map((c) => <PosterCard key={c.title} career={c} onClick={() => { const slug = careerSlug(c.title); onClose(); if (!openCareerPeek(slug)) router.push(`/career/${slug}`); }} />)}
                            </div>
                          </section>
                        )}
                      </>
                    )}

                    {activeTab === "education" && education && (
                      <section className="cpk-section">
                        <h3 className="cpk-section-title">Education</h3>
                        {education.studies.length > 0 && (
                          <div className="flex flex-col gap-[10px]">
                            <h4 className="cpk-sub">What people study for it</h4>
                            {list(education.studies.map((s) => s.name))}
                          </div>
                        )}
                        {education.where.length > 0 && (
                          <div className="mt-[8px] flex flex-col gap-[10px]">
                            <h4 className="cpk-sub">Where you would study it</h4>
                            <ul className="cpk-list">
                              {education.where.map((w) => (
                                <li key={w.credential} className="cpk-item">
                                  <span aria-hidden className="cpk-item-dot" />
                                  <Link href={w.href ?? `/colleges?type=${/certif/i.test(w.credential) ? "trade" : /associate/i.test(w.credential) ? "2-year" : "4-year"}`} className="dm-link flex items-center gap-[4px]" style={{ color: "var(--foreground)" }}>
                                    {w.credential}{/^[\d,]+$/.test(w.count) ? <span style={{ color: "var(--muted-foreground)" }}> · {w.count} colleges</span> : null}
                                    <ChevronRight className="h-[14px] w-[14px] flex-none" aria-hidden style={{ color: accent }} />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </section>
                    )}

                    {activeTab === "ladder" && ladder.length > 0 && (
                      <section className="cpk-section">
                        <h3 className="cpk-section-title">Career ladder</h3>
                        <ol className="flex flex-col">
                          {ladder.map((rung) => (
                            <Rung key={rung.number} rung={rung} accent={accent} open={openRung === rung.number} onToggle={() => setOpenRung((v) => (v === rung.number ? null : rung.number))} />
                          ))}
                        </ol>
                      </section>
                    )}

                    {activeTab === "pay" && pay && (
                      <section className="cpk-section">
                        <div className="flex flex-wrap items-center justify-between gap-[10px] border-b pb-[10px]" style={{ borderColor: "var(--glass-border)" }}>
                          <h3 className="cpk-section-title" style={{ border: 0, padding: 0 }}>{pay.title ?? "Pay by state"}</h3>
                          <Segmented<"states" | "country"> ariaLabel="Pay by state view" value={payView} onChange={setPayView} options={[{ key: "states", label: "Your states" }, { key: "country", label: "Whole country" }]} />
                        </div>
                        {payView === "states" ? (
                          <div className="flex flex-col gap-[18px]">
                            {pay.yourStates && pay.yourStates.length > 0 && (
                              <div className="flex flex-col gap-[4px]">
                                <h4 className="cpk-sub">Your states</h4>
                                <PayRows rows={pay.yourStates} accent={accent} />
                              </div>
                            )}
                            <div className="flex flex-col gap-[4px]">
                              {pay.yourStates && pay.yourStates.length > 0 && <h4 className="cpk-sub">Best states</h4>}
                              <PayRows rows={pay.best} accent={accent} />
                            </div>
                          </div>
                        ) : (
                          <PayMap typical={facts.find((f) => /pay/i.test(f.label))?.value ?? ""} rows={pay.all ?? [...(pay.yourStates ?? []), ...pay.best]} complete={!!pay.all} yourState={pay.yourStates?.[0]?.state} accent={accent} seed={career.id} />
                        )}
                      </section>
                    )}

                    {activeTab === "software" && software.length > 0 && (
                      <section className="cpk-section"><h3 className="cpk-section-title">Software you would use</h3>{list(software)}</section>
                    )}

                    {profile?.sources && (
                      <p className="cpk-note"><span className="font-bold" style={{ color: "var(--foreground)" }}>Data sources.</span> {profile.sources}</p>
                    )}
                  </div>
                </div>
                {/* the scroll edges frost progressively, top and bottom */}
                <span aria-hidden className="pointer-events-none absolute cpk-scroll-edges"><ScrollEdges key={activeTab} top={28} bottom={44} /></span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* footer: the two ways on, in the world colour */}
        {/* Profile has already chosen these careers: Play leads, Report
           follows. Browse keeps the detail page's save/rank/connect actions.
           The full page remains the icon beside Close. */}
        <div className="cpk-footer cpk-career-footer">
          {variant === "top3" ? (
            <div role="group" aria-label="Play or get your career report" className="cpk-game-actions grid w-full grid-cols-2 gap-[var(--space-2)]">
              <Link href={simulation ? `/play/${simulation.id}` : `/play?focus=${encodeURIComponent(career.id)}`} className="dm-solid flex min-h-[46px] min-w-0 items-center justify-center gap-[7px] rounded-[var(--radius-md)] px-4 text-[14px] font-bold max-[480px]:px-2" style={{ background: accent, color: `var(--cpk-play-ink, ${careerButtonInk(career.world)})`, boxShadow: `0 12px 26px -12px color-mix(in srgb, ${accent} 85%, transparent)` }}>
                <Play className="h-[14px] w-[14px] shrink-0" fill="currentColor" aria-hidden /> Play
              </Link>
              <button type="button" onClick={() => { if (onReport) onReport(career.id); else { onClose(); router.push(`/career-report?picks=${encodeURIComponent(career.id)}`); } }} className="dm-quiet relative flex min-h-[46px] min-w-0 appearance-none cursor-pointer items-center justify-center gap-[7px] rounded-[var(--radius-md)] px-4 text-[14px] font-semibold max-[480px]:px-2" style={{ color: "var(--foreground)", background: "var(--glass-surface-1)" }}>
                <FileText className="h-5 w-5 shrink-0" aria-hidden /><span>Get Career Report</span>
              </button>
            </div>
          ) : <div className="min-w-0 w-full"><CareerHeaderActions career={{ slug: career.id, title: career.title, world: career.world }} onConnect={() => setConnectOpen(true)} surface="card" stack /></div>}
          <ModalActionFeedback />
        </div>
      </motion.div>
      {connectOpen && <ConnectWithProfessionalsModal world={career.world} onClose={() => setConnectOpen(false)} />}
    </motion.div>,
    document.body,
  );
}
