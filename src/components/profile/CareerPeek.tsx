"use client";

// Career Peek: a Top 3 card opens into this instead of leaving Profile
// (6 Oct 2026). The whole career on one sheet, with the student's other
// two a key press away, so comparing by flipping stays inside the page:
// the photo on the left, the world and name, one line of what it is, the
// two numbers that decide most (degree, pay), then five short tabs drawn
// from the career's own profile: Overview, Education, Career ladder, Pay,
// Software. Career Report opens that career's report; Full page leaves for
// its Career Detail. Everything here is read from data the app already
// has (career profiles and reports); nothing is invented for the sheet.

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { careerProfile } from "@/components/career/profiles";
import { IconTip } from "@/components/app/IconTip";
import { TextTabs } from "@/components/app/TextTabs";
import { posterTitleFont, WORLD_COLORS } from "@/components/app/worlds";
import { reportV2 } from "./report-data";
import { ALL_PROFILE_CAREERS, type ProfileCareer } from "./data";
import { top3PhotoFocus } from "./top3PhotoFocus";

type PeekTab = "overview" | "education" | "ladder" | "pay" | "software";
const TABS: { key: PeekTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "education", label: "Education" },
  { key: "ladder", label: "Career ladder" },
  { key: "pay", label: "Pay" },
  { key: "software", label: "Software" },
];
const EASE = [0.22, 1, 0.36, 1] as const;

export function CareerPeek({ ids, index, onIndex, onClose, onReport }: {
  /** the Top 3, in rank order */
  ids: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** opens the Report tab on this career */
  onReport: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const id = ids[index];
  const career = ALL_PROFILE_CAREERS.find((c) => c.id === id) ?? null;
  const profile = useMemo(() => (id ? careerProfile(id) : undefined), [id]);
  const report = useMemo(() => (id ? reportV2(id) : undefined), [id]);
  const [tab, setTab] = useState<PeekTab>("overview");
  const [dir, setDir] = useState<1 | -1>(1);
  const go = (delta: 1 | -1) => {
    const next = index + delta;
    if (next < 0 || next >= ids.length) return;
    setDir(delta);
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
  const fact = (label: string) => profile?.facts.find((f) => f.label === label)?.value;
  const degree = fact("Typical degree") ?? report?.education.find((r) => r.common)?.name ?? career.routes[0]?.program;
  const pay = fact("Typical pay") ?? report?.salary.median ?? career.routes[0]?.salary;
  const summary = report?.glance.simple ?? profile?.summary ?? "";
  const available: PeekTab[] = ["overview", ...(profile?.education.studies.length ? ["education" as const] : []), ...(profile?.ladder.length ? ["ladder" as const] : []), ...(profile?.payByState.best.length ? ["pay" as const] : []), ...(profile?.software.length ? ["software" as const] : [])];
  const activeTab = available.includes(tab) ? tab : "overview";

  return createPortal(
    <motion.div
      initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="marketing-v2 themeable no-print fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6"
      style={{ background: "color-mix(in srgb, var(--background) 78%, transparent)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)" }}
      onPointerUp={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="career-peek-title"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 32 }}
        className="relative grid h-[min(760px,94dvh)] w-full max-w-[1040px] grid-cols-1 overflow-hidden rounded-t-[var(--radius-xl)] border sm:rounded-[var(--radius-xl)] md:grid-cols-[42%_minmax(0,1fr)]"
        style={{ background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 40px 90px -30px rgba(0,0,0,0.85)" }}
      >
        {/* The photo: the Top 3 poster, full height, with the world's tint
            bleeding across the seam so the two halves read as one sheet. */}
        <div className="relative hidden overflow-hidden md:block">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={career.id} initial={reduce ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0">
              <Image src={career.photo} alt="" fill sizes="440px" className="object-cover" style={{ objectPosition: top3PhotoFocus(career) }} priority />
            </motion.div>
          </AnimatePresence>
          <span aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent 55%, color-mix(in srgb, var(--card) 70%, transparent) 88%, var(--card) 100%), linear-gradient(to top, color-mix(in srgb, ${accent} 30%, var(--card)) 0%, transparent 45%)` }} />
        </div>

        <div className="relative flex min-h-0 flex-col">
          {/* header: world, prev/next, close */}
          <div className="flex flex-none items-center justify-between gap-[var(--space-3)] px-[var(--space-5)] pt-[var(--space-5)] sm:px-[var(--space-6)]">
            <span className="flex items-center gap-[7px] rounded-full border px-[10px] py-[4px] text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`, color: accent, background: `color-mix(in srgb, ${accent} 10%, transparent)` }}>
              <span className="size-[6px] rounded-full" style={{ background: accent }} aria-hidden />{career.world}
            </span>
            <span className="flex items-center gap-[4px]">
              {ids.length > 1 && (
                <>
                  <IconTip label={index > 0 ? `Previous: #${index}` : "First of your Top 3"}>
                    <button type="button" aria-label="Previous career" disabled={index === 0} onClick={() => go(-1)} className="dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
                  </IconTip>
                  <span className="min-w-[40px] text-center text-[12px] font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>#{index + 1} of {ids.length}</span>
                  <IconTip label={index < ids.length - 1 ? `Next: #${index + 2}` : "Last of your Top 3"}>
                    <button type="button" aria-label="Next career" disabled={index === ids.length - 1} onClick={() => go(1)} className="dm-quiet flex size-[36px] cursor-pointer items-center justify-center rounded-full border disabled:cursor-default disabled:opacity-30" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><ChevronRight className="h-4 w-4" aria-hidden /></button>
                  </IconTip>
                </>
              )}
              <IconTip label="Close">
                <button type="button" aria-label="Close" onClick={onClose} className="dm-quiet ml-[4px] flex size-[36px] cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
              </IconTip>
            </span>
          </div>

          {/* the career, sliding in the direction of travel */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <AnimatePresence initial={false} mode="wait" custom={dir}>
              <motion.div
                key={career.id}
                custom={dir}
                initial={reduce ? false : { opacity: 0, x: dir * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: dir * -20, transition: { duration: 0.14 } }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex h-full min-h-0 flex-col"
              >
                <div className="flex flex-none flex-col gap-[10px] px-[var(--space-5)] pt-[var(--space-4)] sm:px-[var(--space-6)]">
                  <h2 id="career-peek-title" className="text-[30px] leading-[1.05] uppercase sm:text-[36px]" style={{ ...posterTitleFont(career.world), color: "var(--foreground)" }}>{career.title}</h2>
                  {summary && <p className="max-w-[52ch] text-[15px] leading-[22px] font-medium" style={{ color: "var(--foreground)" }}>{summary}</p>}
                  <div className="mt-[4px] grid grid-cols-2 gap-[10px]">
                    <Stat label="Typical degree" value={degree ?? "Coming soon"} accent={accent} />
                    <Stat label="Typical pay" value={pay ?? "Coming soon"} accent={accent} />
                  </div>
                  <TextTabs<PeekTab> ariaLabel="About this career" layoutId={`peek-tabs-${career.id}`} value={activeTab} onChange={setTab} items={TABS.filter((t) => available.includes(t.key))} className="mt-[4px]" />
                </div>
                <div className="dm-scroll min-h-0 flex-1 overflow-y-auto px-[var(--space-5)] pt-[var(--space-3)] pb-[var(--space-5)] sm:px-[var(--space-6)]">
                  {/* A plain keyed block with a CSS rise: a second AnimatePresence
                      nested in the career's own stalled a step behind the tabs. */}
                  <div key={activeTab} className="dm-rise flex flex-col gap-[var(--space-5)]">
                      {activeTab === "overview" && <Overview career={career} profile={profile} employers={report?.glance.employers ?? []} accent={accent} />}
                      {activeTab === "education" && profile && <Education profile={profile} accent={accent} />}
                      {activeTab === "ladder" && profile && <Ladder profile={profile} accent={accent} />}
                      {activeTab === "pay" && profile && <Pay profile={profile} accent={accent} />}
                      {activeTab === "software" && profile && <Chips title="Software you would use" items={profile.software} accent={accent} />}
                      {profile?.sources && <p className="text-[11.5px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{profile.sources}</p>}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* footer: the two ways on */}
          <div className="flex flex-none items-center gap-[10px] border-t px-[var(--space-5)] py-[var(--space-4)] sm:px-[var(--space-6)]" style={{ borderColor: "var(--glass-border)" }}>
            <button type="button" onClick={() => onReport(career.id)} className="dm-solid flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] text-[14.5px] font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              <FileText className="h-4 w-4" aria-hidden /> Career Report
            </button>
            <Link href={`/career/${career.id}`} className="dm-tap flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border px-[var(--space-4)] text-[14.5px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>
              Full page <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-[3px] rounded-[var(--radius-md)] border px-[14px] py-[11px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
      <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <span className="truncate text-[15px] leading-[20px] font-extrabold" style={{ color: accent }} title={value}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[10px]">
      <h3 className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h3>
      {children}
    </section>
  );
}

function Dots({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="flex flex-col gap-[7px]">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-[10px] text-[14px] leading-[20px]" style={{ color: "var(--foreground)" }}>
          <span aria-hidden className="mt-[7px] size-[6px] flex-none rounded-full" style={{ background: accent }} />{it}
        </li>
      ))}
    </ul>
  );
}

function Chips({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <Section title={title}>
      <div className="flex flex-wrap gap-[8px]">
        {items.map((it) => <span key={it} className="rounded-full border px-[12px] py-[6px] text-[13px] font-semibold" style={{ borderColor: `color-mix(in srgb, ${accent} 35%, var(--glass-border))`, color: "var(--foreground)", background: `color-mix(in srgb, ${accent} 8%, transparent)` }}>{it}</span>)}
      </div>
    </Section>
  );
}

function Overview({ career, profile, employers, accent }: { career: ProfileCareer; profile: ReturnType<typeof careerProfile>; employers: string[]; accent: string }) {
  if (!profile) {
    return (
      <Section title="What they actually do">
        <p className="text-[14px] leading-[21px]" style={{ color: "var(--foreground)" }}>The full picture for {career.title} is on its own page for now.</p>
      </Section>
    );
  }
  return (
    <>
      <Section title="What they actually do">
        <p className="text-[14.5px] leading-[22px]" style={{ color: "var(--foreground)" }}>{profile.scenario}</p>
      </Section>
      <div className="grid gap-[var(--space-5)] sm:grid-cols-2">
        <Section title="What you need to know about"><Dots items={profile.knowAbout} accent={accent} /></Section>
        <Section title="What you would need to be good at"><Dots items={profile.goodAt} accent={accent} /></Section>
      </div>
      {employers.length > 0 && (
        <Section title="Where people work">
          <div className="flex flex-wrap gap-[8px]">
            {employers.slice(0, 6).map((e) => <span key={e} className="rounded-full border px-[12px] py-[6px] text-[13px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)", background: "var(--glass-surface-1)" }}>{e}</span>)}
          </div>
          <p className="text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>Examples of places where people do this job. They are not job openings.</p>
        </Section>
      )}
    </>
  );
}

function Education({ profile, accent }: { profile: NonNullable<ReturnType<typeof careerProfile>>; accent: string }) {
  return (
    <>
      <Section title="What people study for it"><Dots items={profile.education.studies.map((s) => s.name)} accent={accent} /></Section>
      {profile.education.where.length > 0 && (
        <Section title="Where you would study it">
          <ul className="flex flex-col divide-y rounded-[var(--radius-md)] border" style={{ borderColor: "var(--glass-border)" }}>
            {profile.education.where.map((w) => (
              <li key={w.credential} className="flex items-center justify-between gap-[12px] px-[14px] py-[10px] text-[14px]" style={{ borderColor: "var(--glass-border)" }}>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>{w.credential}</span>
                <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{/^[\d,]+$/.test(w.count) ? `${w.count} colleges` : w.count}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

/** The rungs as a climb: three steps rising left to right, pay on each. */
function Ladder({ profile, accent }: { profile: NonNullable<ReturnType<typeof careerProfile>>; accent: string }) {
  const rungs = profile.ladder;
  return (
    <Section title="Career ladder">
      <ol className="grid gap-[10px] sm:grid-cols-3 sm:items-end">
        {rungs.map((r, i) => (
          <li key={r.number} className="dm-rise flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[14px]" style={{ animationDelay: `${80 + i * 80}ms`, borderColor: i === rungs.length - 1 ? `color-mix(in srgb, ${accent} 55%, var(--glass-border))` : "var(--glass-border)", background: `color-mix(in srgb, ${accent} ${4 + i * 4}%, var(--glass-surface-1))`, marginTop: `${(rungs.length - 1 - i) * 14}px` }}>
            <span className="flex items-center justify-between">
              <span className="flex size-[24px] items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: accent, color: "#0b0d12" }}>{r.number}</span>
              <span className="text-[15px] font-extrabold tabular-nums" style={{ color: accent }}>{r.pay}</span>
            </span>
            <span className="text-[14px] leading-[19px] font-bold" style={{ color: "var(--foreground)" }}>{r.jobTitle}</span>
            <span className="line-clamp-3 text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>{r.description}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const money = (s: string) => Number(s.replace(/[^0-9.]/g, "")) * (/k/i.test(s) ? 1000 : 1);

/** Pay by state as bars against the best state, your states first. */
function Pay({ profile, accent }: { profile: NonNullable<ReturnType<typeof careerProfile>>; accent: string }) {
  const yours = profile.payByState.yourStates ?? [];
  const best = profile.payByState.best;
  const max = Math.max(...[...yours, ...best].map((s) => money(s.pay)).filter((n) => Number.isFinite(n) && n > 0), 1);
  const row = (s: { state: string; pay: string }, i: number, mine: boolean) => {
    const n = money(s.pay);
    const pct = Number.isFinite(n) && n > 0 ? Math.max(6, Math.round((n / max) * 100)) : 0;
    return (
      <li key={`${s.state}-${mine}`} className="grid grid-cols-[120px_minmax(0,1fr)_64px] items-center gap-[12px] text-[13.5px]">
        <span className="truncate font-semibold" style={{ color: "var(--foreground)" }}>{s.state}</span>
        <span className="relative h-[8px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
          <span className="dm-grow-x absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, animationDelay: `${100 + i * 60}ms`, background: mine ? accent : `color-mix(in srgb, ${accent} 55%, transparent)` }} />
        </span>
        <span className="text-right font-extrabold tabular-nums" style={{ color: mine ? accent : "var(--foreground)" }}>{s.pay}</span>
      </li>
    );
  };
  return (
    <>
      {yours.length > 0 && <Section title="Your states"><ul className="flex flex-col gap-[10px]">{yours.map((s, i) => row(s, i, true))}</ul></Section>}
      <Section title="Best states"><ul className="flex flex-col gap-[10px]">{best.map((s, i) => row(s, i + yours.length, false))}</ul></Section>
    </>
  );
}
