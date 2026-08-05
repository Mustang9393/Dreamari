"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  BriefcaseIcon,
  CheckIcon,
  ChevronRightIcon,
  CompassIcon,
  GraduationCapIcon,
  LightbulbIcon,
  MapIcon,
  StarIcon,
  TargetIcon,
} from "@/components/flow/icons";
import { ThemeProvider, useTheme } from "@/components/flow/theme/ThemeProvider";
import { ThemeToggle } from "@/components/flow/theme/ThemeToggle";
import {
  CAREER_STAGES,
  CERTIFICATIONS,
  CLASSES,
  CONCLUSION,
  DIRECTION_SUMMARY,
  PROFILE,
  REPORT_NAV,
  SCHOOLS,
} from "./reportData";

type CareerReportExperienceProps = { prepare?: boolean };

function ReportShell({ children }: { children: ReactNode }) {
  return (
    <div className="career-report min-h-dvh bg-[var(--color-surface-page)] text-[var(--color-text-primary)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-56 left-[10%] size-[38rem] rounded-full bg-brand-600/15 blur-[130px]" />
        <div className="absolute top-[34rem] -right-60 size-[34rem] rounded-full bg-[var(--color-purple-500)]/12 blur-[140px]" />
      </div>
      {children}
    </div>
  );
}

function PreparingReport({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const progressTimer = window.setInterval(() => setProgress((value) => Math.min(value + 9, 92)), 160);
    const readyTimer = window.setTimeout(onReady, 1900);
    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(readyTimer);
    };
  }, [onReady]);

  return (
    <ReportShell>
      <main className="relative z-10 grid min-h-dvh place-items-center px-5 py-12">
        <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-7 text-center shadow-[0_28px_90px_var(--color-shadow-blue-10)] backdrop-blur sm:p-11 dark:shadow-[0_28px_100px_var(--color-shadow-black-40)]">
          <div className="relative mx-auto mb-4 h-44 w-64 sm:h-52 sm:w-80">
            <Image src="/images/dreamy-expressions/dreamy-problem-solving.webp" alt="Dreamy solving a puzzle while preparing your report" fill priority sizes="320px" className="object-contain" />
          </div>
          <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-600 uppercase">Build + Match complete</p>
          <h1 className="font-display text-3xl leading-tight font-extrabold tracking-[-0.035em] sm:text-5xl">Preparing Your Career Report</h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base dark:text-[var(--color-text-secondary)]">
            Dreamy is connecting your strengths, preferences and pathway choices into one clear next-step plan.
          </p>
          <div className="mt-8 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]" aria-label={`Report preparation ${progress}% complete`}>
            <div className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-[var(--color-purple-400)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] dark:text-[var(--color-text-secondary)]">
            <span className="size-4 text-[var(--color-feedback-success)]"><CheckIcon /></span>
            Analysing your latest Build + Match choices
          </div>
        </section>
      </main>
    </ReportShell>
  );
}

function SectionHeading({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description?: string; icon: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
        <span className="size-5">{icon}</span>
      </span>
      <div>
        <p className="text-[11px] font-bold tracking-[0.16em] text-brand-600 uppercase dark:text-brand-300">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">{description}</p>}
      </div>
    </div>
  );
}

const panel = "rounded-[1.75rem] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] shadow-[0_16px_50px_var(--color-shadow-blue-10)] dark:shadow-[0_18px_60px_var(--color-shadow-black-40)]";

function ReportHeader() {
  const { theme } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border-default)] bg-[var(--color-surface-page)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center rounded-xl px-1 text-lg font-extrabold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
          Dreamari
        </Link>
        <div className="flex items-center gap-2 pr-12">
          <span className="hidden text-xs font-semibold text-[var(--color-text-secondary)] sm:block dark:text-[var(--color-text-secondary)]">Career report</span>
          <span className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[var(--color-feedback-success)] uppercase dark:border-[var(--color-feedback-success)] dark:bg-[var(--color-surface-subtle)] dark:text-[var(--color-feedback-success)]">Updated today</span>
          <span className="sr-only">{theme} theme</span>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}

function CareerReport() {
  const [version, setVersion] = useState<"current" | "snapshot">("current");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const sections = REPORT_NAV.map(([id]) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-150px 0px -58%", threshold: [0.05, 0.25, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.querySelector<HTMLElement>(`[data-report-nav="${activeSection}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeSection]);

  async function shareReport() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = window.location.href;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
      setCopied(true);
    }
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <ReportShell>
      <ReportHeader />
      <main className="relative z-10 pb-24">
        <section id="overview" className="scroll-mt-32 px-4 pt-9 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-600/20 bg-brand-600/8 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-brand-600 uppercase dark:border-brand-400/25 dark:bg-brand-400/10 dark:text-brand-300">
                <span className="size-3.5"><StarIcon /></span> Dreamari Career Report
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-[clamp(2.65rem,7vw,6.25rem)] leading-[0.91] font-extrabold tracking-[-0.065em]">
                Computer Science <span className="text-brand-600 dark:text-brand-300">Career Report</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg dark:text-[var(--color-text-secondary)]">
                A clear view of where you fit, what the journey can look like and the next move that turns interest into momentum.
              </p>
            </div>
            <div className="relative mx-auto hidden h-72 w-full max-w-md lg:block">
              <Image src="/images/dreamy-expressions/dreamy-explore.webp" alt="Dreamy exploring your Computer Science career options" fill priority sizes="400px" className="object-contain object-bottom" />
            </div>
          </div>
        </section>

        <div className="sticky top-18 z-30 mt-9 border-y border-[var(--color-border-default)] bg-[var(--color-surface-page)] py-3 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:px-8" aria-label="Career report sections">
            {REPORT_NAV.map(([href, label]) => (
              <a key={href} href={`#${href}`} data-report-nav={href} aria-current={activeSection === href ? "location" : undefined} onClick={() => setActiveSection(href)} className={`min-h-11 shrink-0 rounded-full px-4 py-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 ${activeSection === href ? "bg-brand-600 text-[var(--color-white)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-card)]"}`}>{label}</a>
            ))}
          </nav>
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.55fr)] lg:px-8">
          <section className={`${panel} p-5 sm:p-7`}>
            <SectionHeading eyebrow="Start here" title="Current Direction Summary" description="The signal from your latest Build + Match activity, organised around the decisions that matter now." icon={<CompassIcon />} />
            <div className="grid gap-3 sm:grid-cols-2">
              {DIRECTION_SUMMARY.map(([label, value], index) => (
                <article key={label} className={`rounded-2xl border p-4 ${index === 3 ? "border-brand-600/25 bg-brand-600/[0.06] dark:border-brand-400/25 dark:bg-brand-400/10" : "border-[var(--color-border-default)] bg-[var(--color-surface-subtle)]"}`}>
                  <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--color-text-muted)] uppercase dark:text-[var(--color-text-muted)]">{label}</p>
                  <p className="mt-2 text-sm leading-5 font-bold sm:text-base">{value}</p>
                </article>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-[var(--color-brand-100)] p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-brand-600/12">
              <div>
                <p className="text-xs font-bold text-brand-600 dark:text-brand-300">Your highest-value next move</p>
                <p className="mt-1 text-sm font-semibold">Find transfer agreement colleges</p>
              </div>
              <Link href="#plan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-xs font-bold text-[var(--color-white)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
                Open My Plan <span className="size-4"><ChevronRightIcon /></span>
              </Link>
            </div>
          </section>

          <aside className={`${panel} overflow-hidden p-5 sm:p-7`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-[0.14em] text-[var(--color-text-muted)] uppercase dark:text-[var(--color-text-muted)]">Report view</p>
                <p className="mt-1 text-lg font-extrabold">{version === "current" ? "Current Report" : "Version 1 Snapshot"}</p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-feedback-success)] dark:bg-[var(--color-surface-subtle)] dark:text-[var(--color-feedback-success)]"><span className="size-5"><CheckIcon /></span></span>
            </div>
            <div className="mt-5 grid grid-cols-2 rounded-xl bg-[var(--color-surface-subtle)] p-1" role="group" aria-label="Report version">
              <button type="button" aria-pressed={version === "current"} onClick={() => setVersion("current")} className={`min-h-11 rounded-lg px-2 text-[10px] font-bold uppercase ${version === "current" ? "bg-[var(--color-surface-card)] text-brand-600 shadow-sm dark:text-brand-300" : "text-[var(--color-text-muted)]"}`}>Current Report</button>
              <button type="button" aria-pressed={version === "snapshot"} onClick={() => setVersion("snapshot")} className={`min-h-11 rounded-lg px-2 text-[10px] font-bold uppercase ${version === "snapshot" ? "bg-[var(--color-surface-card)] text-brand-600 shadow-sm dark:text-brand-300" : "text-[var(--color-text-muted)]"}`}>Version 1 Snapshot</button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">Post-Secondary Plan</dt><dd className="text-right font-bold">Not Started</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">Resume Status</dt><dd className="font-bold">0% complete</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">Last Updated</dt><dd className="font-bold">Updated today</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">Updated From</dt><dd className="font-bold">Build + Match</dd></div>
            </dl>
            <div className="mt-5 border-t border-[var(--color-border-default)] pt-5">
              <p className="text-xs font-bold">Why this updated</p>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">Your original Career Report was generated after Build + Match. It is saved as your baseline.</p>
            </div>
            <div className="mt-5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] p-4">
              <p className="text-xs font-bold">What Changed</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">Changes since your original Build + Match report.</p>
              <div className="mt-4 flex items-start justify-between gap-3 border-t border-[var(--color-border-default)] pt-4">
                <div><p className="text-xs font-bold">Build + Match</p><p className="mt-1 text-[11px] text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">Version 1 Snapshot created</p></div>
                <span className="shrink-0 text-[10px] font-bold text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">3 hr ago</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-12 max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <section id="profile" className="scroll-mt-36">
            <SectionHeading eyebrow="Your evidence" title="Student Profile" description="The inputs shaping the recommendations in this report." icon={<TargetIcon />} />
            <div className="grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
              <div className={`${panel} p-5 sm:p-7`}>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {PROFILE.map(([label, value]) => <div key={label} className="border-b border-[var(--color-border-default)] pb-4 last:border-0 last:pb-0"><dt className="text-[10px] font-bold tracking-[0.13em] text-[var(--color-text-muted)] uppercase">{label}</dt><dd className="mt-1.5 font-bold">{value}</dd></div>)}
                </dl>
              </div>
              <div className={`${panel} relative overflow-hidden p-5 sm:p-7`}>
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-lg font-extrabold">Academic Strengths</h3>
                  <p className="mt-2 inline-flex rounded-full bg-brand-600/10 px-3 py-2 text-xs font-bold text-brand-600 dark:bg-brand-400/12 dark:text-brand-300">Computer Science</p>
                  <h4 className="mt-6 text-xs font-bold tracking-[0.12em] text-[var(--color-text-muted)] uppercase dark:text-[var(--color-text-muted)]">Classes to Focus On:</h4>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {CLASSES.map((item) => <li key={item} className="flex gap-2.5 text-sm leading-5"><span className="mt-0.5 size-4 shrink-0 text-[var(--color-feedback-success)]"><CheckIcon /></span>{item}</li>)}
                  </ul>
                </div>
                <div className="relative mx-auto mt-4 h-40 w-52 sm:absolute sm:right-2 sm:bottom-0 sm:mt-0 sm:opacity-20 lg:hidden xl:block xl:opacity-100"><Image src="/images/dreamy-expressions/dreamy-idea.webp" alt="Dreamy has an idea about classes to focus on" fill sizes="208px" className="object-contain object-bottom" /></div>
              </div>
            </div>
          </section>

          <section id="career-path" className="scroll-mt-36">
            <SectionHeading eyebrow="See the runway" title="Career Path & Salaries" description="A realistic progression from first role to senior leadership, with salary bands preserved from your report." icon={<BriefcaseIcon />} />
            <div className="grid gap-4 lg:grid-cols-3">
              {CAREER_STAGES.map((stage, index) => (
                <article key={stage.label} className={`${panel} p-5 sm:p-6`}>
                  <div className="flex items-center justify-between gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-[var(--color-white)]">{index + 1}</span><span className="text-xs font-bold text-[var(--color-text-muted)]">{stage.years}</span></div>
                  <h3 className="mt-5 text-xl font-extrabold">{stage.label}</h3>
                  <div className="mt-4 space-y-3">
                    {stage.roles.map(([role, description, salary]) => <div key={role} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] p-4"><h4 className="font-bold">{role}</h4><p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{description}</p><p className="mt-3 text-sm font-extrabold text-[var(--color-feedback-success)]">{salary}</p></div>)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="plan" className="scroll-mt-36">
            <div className={`${panel} overflow-hidden p-5 sm:p-7 lg:p-9`}>
              <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
                <div>
                  <SectionHeading eyebrow="Move forward" title="My Plan" description="Community College Roadmap" icon={<MapIcon />} />
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div><p className="text-3xl font-extrabold tracking-[-0.04em]">0/21</p><p className="mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">tasks complete · 0%</p></div>
                    <Link href="#education" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-[var(--color-white)]">Open My Plan <span className="size-4"><ChevronRightIcon /></span></Link>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]"><div className="h-full w-0 bg-brand-600" /></div>
                  <div className="mt-5 rounded-2xl border border-brand-600/20 bg-brand-600/[0.06] p-4 dark:border-brand-400/20 dark:bg-brand-400/10"><p className="text-[10px] font-bold tracking-[0.12em] text-brand-600 uppercase dark:text-brand-300">Next up</p><p className="mt-1 font-bold">Find transfer agreement colleges</p></div>
                </div>
                <div className="relative mx-auto h-56 w-full max-w-xs"><Image src="/images/dreamy-expressions/dreamy-problem-solving.webp" alt="Dreamy planning the next steps in your roadmap" fill sizes="300px" className="object-contain" /></div>
              </div>
            </div>
          </section>

          <section id="education" className="scroll-mt-36">
            <SectionHeading eyebrow="Compare options" title="California University Options" description="Keep ambitious, good-fit and safe choices visible at the same time." icon={<GraduationCapIcon />} />
            <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
              <div className={`${panel} p-5 sm:p-7`}>
                <h3 className="text-lg font-extrabold">Top Choice Schools</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {SCHOOLS.map((school) => <article key={school.name} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] p-5"><h4 className="font-extrabold">{school.name}</h4><dl className="mt-4 space-y-3">{school.detail.map(([label, value]) => <div key={label}><dt className="text-[10px] font-bold tracking-wide text-[var(--color-text-muted)] uppercase">{label}</dt><dd className="mt-1 text-xs leading-5">{value}</dd></div>)}</dl></article>)}
                </div>
                <h3 className="mt-7 text-lg font-extrabold">Strong Options:</h3>
                <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <li><strong>Cal Poly SLO</strong> — Hands-on, learn-by-doing approach</li><li><strong>UC San Diego</strong> — Growing security program and research</li><li><strong>San Jose State</strong> — Close to Silicon Valley companies</li>
                </ul>
              </div>
              <aside className={`${panel} p-5 sm:p-7`}>
                <h3 className="text-lg font-extrabold">With Your 3.5 - 3.7 GPA:</h3>
                <div className="mt-5 space-y-3 text-sm"><p className="rounded-xl bg-[var(--color-amber-50)] p-4 text-[var(--color-amber-600)] dark:bg-[var(--color-surface-subtle)] dark:text-[var(--color-amber-400)]"><strong>Reach for:</strong> Stanford, UC Berkeley</p><p className="rounded-xl bg-[var(--color-brand-100)] p-4 text-[var(--color-brand-700)] dark:bg-[var(--color-surface-subtle)] dark:text-[var(--color-brand-300)]"><strong>Good fit:</strong> USC, UC San Diego</p><p className="rounded-xl bg-[var(--color-surface-subtle)] p-4 text-[var(--color-feedback-success)] dark:bg-[var(--color-surface-subtle)] dark:text-[var(--color-feedback-success)]"><strong>Safe choices:</strong> Cal Poly, San Jose State</p></div>
              </aside>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Build credibility" title="Certifications to Pursue" icon={<LightbulbIcon />} />
            <div className="grid gap-5 lg:grid-cols-2">{CERTIFICATIONS.map((group) => <article key={group.label} className={`${panel} p-5 sm:p-7`}><h3 className="font-extrabold">{group.label}</h3><div className="mt-5 space-y-4">{group.items.map(([name, detail]) => <div key={name} className="flex gap-3"><span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-600 dark:bg-brand-400/12 dark:text-brand-300"><span className="size-3.5"><CheckIcon /></span></span><div><h4 className="text-sm font-bold">{name}</h4><p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">{detail}</p></div></div>)}</div></article>)}</div>
          </section>

          <section className={`${panel} relative overflow-hidden p-6 sm:p-9`}>
            <div className="relative z-10 max-w-4xl"><p className="text-[11px] font-bold tracking-[0.16em] text-brand-600 uppercase dark:text-brand-300">Your report conclusion</p><p className="mt-4 text-base leading-8 font-semibold sm:text-xl">{CONCLUSION}</p></div>
            <div className="relative z-10 mt-8 flex flex-wrap gap-3">
              <Link href="/flow" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-[var(--color-white)]">Play Computer Science Games</Link>
              <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-bold">Explore</Link>
              <button type="button" onClick={() => window.print()} className="min-h-12 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-bold">Download Report</button>
              <button type="button" onClick={shareReport} className="min-h-12 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-bold">{copied ? "Link copied" : "Share"}</button>
            </div>
            <div className="relative mx-auto mt-6 h-44 w-64 sm:absolute sm:right-2 sm:bottom-0 sm:mt-0 sm:opacity-25 xl:opacity-100"><Image src="/images/dreamy-expressions/dreamy-celebrate.webp" alt="Dreamy celebrates your career direction" fill sizes="256px" className="object-contain object-bottom" /></div>
          </section>
        </div>
      </main>
    </ReportShell>
  );
}

export function CareerReportExperience({ prepare = false }: CareerReportExperienceProps) {
  const [ready, setReady] = useState(!prepare);
  return <ThemeProvider>{ready ? <CareerReport /> : <PreparingReport onReady={() => setReady(true)} />}</ThemeProvider>;
}
