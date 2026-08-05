"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BriefcaseIcon,
  CheckIcon,
  ChevronRightIcon,
  CompassIcon,
  DownloadIcon,
  GraduationCapIcon,
  HomeIcon,
  LightbulbIcon,
  MapIcon,
  ShareIcon,
  StarIcon,
  TargetIcon,
  XIcon,
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

type CareerReportExperienceProps = { prepare?: boolean; simulateError?: boolean };

const BUILD_PHASES = [
  "Connecting your Build answers",
  "Comparing your Match signals",
  "Mapping education and career pathways",
  "Building your next-step plan",
] as const;

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

function PreparingReport({ onReady, simulateError = false }: { onReady: () => void; simulateError?: boolean }) {
  const [phase, setPhase] = useState(0);
  const [status, setStatus] = useState<"building" | "error" | "ready">("building");
  const [attempt, setAttempt] = useState(0);
  const progress = status === "ready" ? 100 : [18, 42, 68, 88][phase] ?? 88;

  useEffect(() => {
    if (status !== "building") return;
    const phaseDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 90 : 520;
    const phaseTimer = window.setTimeout(() => {
      if (simulateError && attempt === 0 && phase === 1) {
        setStatus("error");
        return;
      }
      if (phase < BUILD_PHASES.length - 1) {
        setPhase((current) => current + 1);
        return;
      }
      setStatus("ready");
    }, phaseDelay);
    return () => window.clearTimeout(phaseTimer);
  }, [attempt, onReady, phase, simulateError, status]);

  useEffect(() => {
    if (status !== "ready") return;
    const readyDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 90 : 520;
    const readyTimer = window.setTimeout(onReady, readyDelay);
    return () => {
      window.clearTimeout(readyTimer);
    };
  }, [onReady, status]);

  function retry() {
    setAttempt((current) => current + 1);
    setPhase(0);
    setStatus("building");
  }

  return (
    <ReportShell>
      <main className="relative z-10 grid min-h-dvh place-items-center px-5 py-12">
        <section className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-6 shadow-[0_28px_90px_var(--color-shadow-blue-10)] backdrop-blur sm:p-9 dark:shadow-[0_28px_100px_var(--color-shadow-black-40)]">
          {status === "error" ? (
            <div className="grid gap-6 text-center sm:grid-cols-[240px_1fr] sm:items-center sm:text-left">
              <div className="relative mx-auto h-44 w-56 sm:h-52 sm:w-60">
                <Image src="/images/dreamy-expressions/dreamy-nervous.webp" alt="Dreamy looks concerned after the report build was interrupted" fill priority sizes="240px" className="object-contain" />
              </div>
              <div role="alert">
                <p className="text-xs font-bold tracking-[0.18em] text-[var(--color-feedback-danger)] uppercase">Report build interrupted</p>
                <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-[-0.035em] sm:text-4xl">We hit a cloud in the road</h1>
                <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">Your Match choices are safe. Dreamy just needs another moment to finish building your report.</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={retry} className="min-h-12 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-[var(--color-white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">Try again</button>
                  <Link href="/flow" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">Return to Match</Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-7 lg:grid-cols-[300px_1fr] lg:items-center">
              <div className="text-center lg:text-left">
                <div className="relative mx-auto h-44 w-64 lg:mx-0 lg:h-52 lg:w-72">
                  <Image src="/images/dreamy-expressions/dreamy-problem-solving.webp" alt="Dreamy assembles your career report with puzzle pieces" fill priority sizes="288px" className="object-contain" />
                </div>
                <p className="mt-2 text-xs font-bold tracking-[0.18em] text-brand-600 uppercase dark:text-brand-300">Build + Match complete</p>
                <h1 className="mt-3 font-display text-3xl leading-tight font-extrabold tracking-[-0.035em] sm:text-4xl">Building Your Career Report</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">Dreamy is turning your signals into a clear, useful next-step plan.</p>
              </div>
              <div>
                <div className="space-y-2" aria-live="polite">
                  {BUILD_PHASES.map((label, index) => {
                    const complete = status === "ready" || index < phase;
                    const active = status === "building" && index === phase;
                    return (
                      <div key={label} className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${active ? "border-brand-600/30 bg-brand-600/8" : "border-[var(--color-border-default)] bg-[var(--color-surface-subtle)]"}`}>
                        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${complete ? "bg-[var(--color-feedback-success)] text-[var(--color-white)]" : active ? "bg-brand-600 text-[var(--color-white)]" : "border border-[var(--color-border-default)] text-[var(--color-text-muted)]"}`}>
                          {complete ? <span className="size-3.5"><CheckIcon /></span> : <span className="text-[10px] font-extrabold">{index + 1}</span>}
                        </span>
                        <span className={`text-sm font-semibold ${active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>{label}</span>
                        {active && <span className="ml-auto text-[10px] font-bold tracking-wide text-brand-600 uppercase dark:text-brand-300">Building</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]" role="progressbar" aria-label="Career report build progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-[var(--color-purple-400)] transition-[width] duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-3 text-right text-xs font-bold text-[var(--color-text-muted)]">{status === "ready" ? "Your report is ready" : `${progress}% assembled`}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </ReportShell>
  );
}

function ReportDialog({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      returnFocus?.focus();
    };
  }, [onClose]);

  return (
    <div data-report-modal className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-black)]/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="report-dialog-title" aria-describedby="report-dialog-description" className="w-full max-w-lg rounded-[1.75rem] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-5 shadow-[0_28px_100px_var(--color-shadow-black-40)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="report-dialog-title" className="font-display text-2xl font-extrabold tracking-[-0.025em]">{title}</h2>
            <p id="report-dialog-description" className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
          </div>
          <button data-autofocus type="button" onClick={onClose} aria-label="Close dialog" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"><span className="size-5"><XIcon /></span></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, icon }: { eyebrow: string; title: string; description?: string; icon: ReactNode }) {
  return (
    <div className="mb-6 flex items-start gap-3 sm:gap-4">
      <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
        <span className="size-5">{icon}</span>
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold tracking-[0.16em] text-brand-600 uppercase dark:text-brand-300">{eyebrow}</p>
        <h2 className="mt-1 max-w-3xl text-balance font-display text-[1.65rem] leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-pretty text-sm leading-6 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">{description}</p>}
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
        <div className="flex items-center gap-2">
          <Link href="/" className="flex min-h-11 items-center rounded-xl px-1 text-lg font-extrabold tracking-[-0.02em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">
            Dreamari
          </Link>
          <Link href="/home" aria-label="Go to Dreamari home" title="Home" className="flex size-11 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] transition-colors hover:border-brand-600/35 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:hover:text-brand-300">
            <span className="size-5"><HomeIcon /></span>
          </Link>
        </div>
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

function ReportActions({ onDownload, onShare, compact = false }: { onDownload: () => void; onShare: () => void; compact?: boolean }) {
  return (
    <div className={compact ? "flex flex-col" : "mt-8 flex flex-col"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/flow" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-[var(--color-white)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">Play Computer Science Games</Link>
          <Link href="#career-path" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-bold transition-colors hover:bg-[var(--color-surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500">Explore</Link>
          <Link href="/home" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-600/25 bg-brand-600/8 px-5 py-3 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-600/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:text-brand-300"><span className="size-4"><HomeIcon /></span>Go to Launchpad</Link>
        </div>
        <div className="flex items-center gap-2 border-t border-[var(--color-border-default)] pt-3 sm:ml-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4" aria-label="Report utilities">
          <button type="button" onClick={onDownload} aria-label="Download report" title="Download report" className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] transition-colors hover:border-brand-600/40 hover:bg-brand-600/8 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:hover:text-brand-300"><span className="size-5"><DownloadIcon /></span></button>
          <button type="button" onClick={onShare} aria-label="Share report" title="Share report" className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] transition-colors hover:border-brand-600/40 hover:bg-brand-600/8 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:hover:text-brand-300"><span className="size-5"><ShareIcon /></span></button>
        </div>
      </div>
    </div>
  );
}

function CareerReport() {
  const [version, setVersion] = useState<"current" | "snapshot">("current");
  const [activeSection, setActiveSection] = useState("overview");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "preparing" | "success" | "error">("idle");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copying" | "copied" | "sharing" | "error">("idle");
  const [shareError, setShareError] = useState("");
  const [shareUrl, setShareUrl] = useState("/career-report");
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false);

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

  const closeDownload = useCallback(() => setDownloadOpen(false), []);
  const closeShare = useCallback(() => setShareOpen(false), []);

  function openDownload() {
    setDownloadStatus("idle");
    setDownloadOpen(true);
  }

  function openShare() {
    setShareUrl(`${window.location.origin}/career-report`);
    setNativeShareAvailable(typeof navigator.share === "function");
    setShareStatus("idle");
    setShareError("");
    setShareOpen(true);
  }

  async function startDownload() {
    setDownloadStatus("preparing");
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    try {
      if (typeof window.print !== "function") throw new Error("Print is unavailable");
      window.print();
      setDownloadStatus("success");
    } catch {
      setDownloadStatus("error");
    }
  }

  async function copyShareLink() {
    setShareStatus("copying");
    setShareError("");
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
    } catch {
      const helper = document.createElement("textarea");
      helper.value = shareUrl;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      helper.remove();
      if (copied) setShareStatus("copied");
      else {
        setShareError("We couldn’t copy the link automatically. Select the link above and copy it manually.");
        setShareStatus("error");
      }
    }
  }

  async function openNativeShare() {
    if (!navigator.share) return;
    setShareStatus("sharing");
    setShareError("");
    try {
      await navigator.share({ title: "My Dreamari Career Report", text: "Here’s my Computer Science Career Report from Dreamari.", url: shareUrl });
      setShareStatus("idle");
      setShareOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setShareStatus("idle");
        return;
      }
      setShareError("The system share menu didn’t open. You can still copy the report link or share it by email.");
      setShareStatus("error");
    }
  }

  return (
    <ReportShell>
      <ReportHeader />
      <main className="relative z-10 pb-24">
        <section id="overview" className="scroll-mt-32 px-4 pt-9 sm:px-6 sm:pt-14 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-600/20 bg-brand-600/8 px-3 py-2 text-[10px] font-bold tracking-[0.16em] text-brand-600 uppercase dark:border-brand-400/25 dark:bg-brand-400/10 dark:text-brand-300">
                <span className="size-3.5"><StarIcon /></span> Dreamari Career Report
              </p>
              <h1 className="mt-5 max-w-4xl font-display text-[clamp(2rem,6.4vw,5.75rem)] leading-[0.92] font-extrabold tracking-[-0.055em]">
                <span className="block whitespace-nowrap">Computer Science</span>
                <span className="block whitespace-nowrap text-brand-600 dark:text-brand-300">Career Report</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg dark:text-[var(--color-text-secondary)]">
                A clear view of where you fit, what the journey can look like and the next move that turns interest into momentum.
              </p>
              <ReportActions onDownload={openDownload} onShare={openShare} />
              <p className="mt-4 text-xs font-semibold text-[var(--color-text-muted)]">Updated today · Generated from Build + Match</p>
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
                  <p className="text-[11px] font-bold tracking-[0.12em] text-[var(--color-text-muted)] uppercase dark:text-[var(--color-text-muted)]">{label}</p>
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
                <p className="text-[11px] font-bold tracking-[0.14em] text-[var(--color-text-muted)] uppercase dark:text-[var(--color-text-muted)]">Report view</p>
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
              <p className="text-sm font-bold">Why this updated</p>
              <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">Your original Career Report was generated after Build + Match. It is saved as your baseline.</p>
            </div>
            <div className="mt-5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] p-4">
              <p className="text-sm font-bold">What Changed</p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">Changes since your original Build + Match report.</p>
              <div className="mt-4 flex items-start justify-between gap-3 border-t border-[var(--color-border-default)] pt-4">
                <div><p className="text-sm font-bold">Build + Match</p><p className="mt-1 text-xs text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">Version 1 Snapshot created</p></div>
                <span className="shrink-0 text-[11px] font-bold text-[var(--color-text-muted)] dark:text-[var(--color-text-muted)]">3 hr ago</span>
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-12 max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
          <section id="profile" className="scroll-mt-36">
            <SectionHeading eyebrow="Your evidence" title="Student Profile" description="The inputs shaping the recommendations in this report." icon={<TargetIcon />} />
            <div className="grid items-start gap-5 lg:grid-cols-[.82fr_1.18fr]">
              <div className={`${panel} p-5 sm:p-7`}>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {PROFILE.map(([label, value]) => <div key={label} className="border-b border-[var(--color-border-default)] pb-4 last:border-0 last:pb-0"><dt className="text-[11px] font-bold tracking-[0.13em] text-[var(--color-text-muted)] uppercase">{label}</dt><dd className="mt-1.5 text-base leading-6 font-bold">{value}</dd></div>)}
                </dl>
              </div>
              <div className={`${panel} overflow-hidden p-5 sm:p-7`}>
                <div className="grid items-end gap-5 xl:grid-cols-[minmax(0,1fr)_190px]">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold">Academic Strengths</h3>
                  <p className="mt-2 inline-flex rounded-full bg-brand-600/10 px-3 py-2 text-xs font-bold text-brand-600 dark:bg-brand-400/12 dark:text-brand-300">Computer Science</p>
                  <h4 className="mt-6 text-xs font-bold tracking-[0.12em] text-[var(--color-text-muted)] uppercase dark:text-[var(--color-text-muted)]">Classes to Focus On:</h4>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {CLASSES.map((item) => <li key={item} className="flex gap-2.5 text-pretty text-sm leading-6"><span className="mt-1 size-4 shrink-0 text-[var(--color-feedback-success)]"><CheckIcon /></span>{item}</li>)}
                  </ul>
                </div>
                <div className="relative mx-auto h-32 w-44 sm:h-36 sm:w-48 xl:h-44 xl:w-full"><Image src="/images/dreamy-expressions/dreamy-idea.webp" alt="Dreamy has an idea about classes to focus on" fill sizes="(min-width: 1280px) 190px, 192px" className="object-contain object-bottom" /></div>
                </div>
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
                    {stage.roles.map(([role, description, salary]) => <div key={role} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] p-4"><h4 className="text-base leading-6 font-bold">{role}</h4><p className="mt-1 text-pretty text-[13px] leading-5 text-[var(--color-text-secondary)]">{description}</p><p className="mt-3 text-sm font-extrabold text-[var(--color-feedback-success)]">{salary}</p></div>)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="plan" className="scroll-mt-36">
            <div className={`${panel} overflow-hidden p-5 sm:p-7 lg:p-9`}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:items-stretch">
                <div className="flex min-w-0 flex-col justify-center">
                  <SectionHeading eyebrow="Move forward" title="My Plan" description="Community College Roadmap" icon={<MapIcon />} />
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-3xl font-extrabold tracking-[-0.04em]">0/21</p><p className="mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">tasks complete · 0%</p></div>
                    <Link href="#education" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-[var(--color-white)]">Open My Plan <span className="size-4"><ChevronRightIcon /></span></Link>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--color-surface-subtle)]"><div className="h-full w-0 bg-brand-600" /></div>
                  <div className="mt-5 rounded-2xl border border-brand-600/20 bg-brand-600/[0.06] p-4 dark:border-brand-400/20 dark:bg-brand-400/10"><p className="text-[10px] font-bold tracking-[0.12em] text-brand-600 uppercase dark:text-brand-300">Next up</p><p className="mt-1 font-bold">Find transfer agreement colleges</p></div>
                </div>
                <div className="flex min-h-52 items-center justify-center rounded-3xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-5 pt-4">
                  <div className="relative h-48 w-full max-w-[250px]"><Image src="/images/dreamy-expressions/dreamy-problem-solving.webp" alt="Dreamy planning the next steps in your roadmap" fill sizes="250px" className="object-contain object-bottom" /></div>
                </div>
              </div>
            </div>
          </section>

          <section id="education" className="scroll-mt-36">
            <SectionHeading eyebrow="Compare options" title="California University Options" description="Keep ambitious, good-fit and safe choices visible at the same time." icon={<GraduationCapIcon />} />
            <div className="grid items-start gap-5 lg:grid-cols-[1.15fr_.85fr]">
              <div className={`${panel} p-5 sm:p-7`}>
                <h3 className="text-lg font-extrabold">Top Choice Schools</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {SCHOOLS.map((school) => <article key={school.name} className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] p-5"><h4 className="text-base leading-6 font-extrabold">{school.name}</h4><dl className="mt-4 space-y-3.5">{school.detail.map(([label, value]) => <div key={label}><dt className="text-[11px] font-bold tracking-wide text-[var(--color-text-muted)] uppercase">{label}</dt><dd className="mt-1 text-pretty text-[13px] leading-5">{value}</dd></div>)}</dl></article>)}
                </div>
                <h3 className="mt-7 text-lg font-extrabold">Strong Options:</h3>
                <ul className="mt-4 grid gap-3 text-sm">
                  <li className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-4 py-3 leading-6"><strong>Cal Poly SLO</strong> — Hands-on, learn-by-doing approach</li><li className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-4 py-3 leading-6"><strong>UC San Diego</strong> — Growing security program and research</li><li className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-4 py-3 leading-6"><strong>San Jose State</strong> — Close to Silicon Valley companies</li>
                </ul>
              </div>
              <aside className={`${panel} p-5 sm:p-7`}>
                <h3 className="max-w-sm text-balance text-xl leading-7 font-extrabold">With Your 3.5 - 3.7 GPA:</h3>
                <div className="mt-5 grid gap-4">
                  <div className="rounded-2xl border border-[var(--color-amber-600)]/25 bg-[var(--color-amber-50)] p-5 dark:bg-[var(--color-surface-subtle)]"><p className="text-xs font-extrabold tracking-[0.12em] text-[var(--color-amber-600)] uppercase dark:text-[var(--color-amber-400)]">Reach for:</p><p className="mt-2 text-pretty text-base leading-6 font-bold">Stanford, UC Berkeley</p></div>
                  <div className="rounded-2xl border border-brand-600/25 bg-[var(--color-brand-100)] p-5 dark:bg-[var(--color-surface-subtle)]"><p className="text-xs font-extrabold tracking-[0.12em] text-brand-700 uppercase dark:text-brand-300">Good fit:</p><p className="mt-2 text-pretty text-base leading-6 font-bold">USC, UC San Diego</p></div>
                  <div className="rounded-2xl border border-[var(--color-feedback-success)]/30 bg-[var(--color-surface-subtle)] p-5"><p className="text-xs font-extrabold tracking-[0.12em] text-[var(--color-feedback-success)] uppercase">Safe choices:</p><p className="mt-2 text-pretty text-base leading-6 font-bold">Cal Poly, San Jose State</p></div>
                </div>
              </aside>
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="Build credibility" title="Certifications to Pursue" icon={<LightbulbIcon />} />
            <div className="grid gap-5 lg:grid-cols-2">{CERTIFICATIONS.map((group) => <article key={group.label} className={`${panel} p-5 sm:p-7`}><h3 className="text-lg leading-7 font-extrabold">{group.label}</h3><div className="mt-5 space-y-5">{group.items.map(([name, detail]) => <div key={name} className="flex gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-600 dark:bg-brand-400/12 dark:text-brand-300"><span className="size-3.5"><CheckIcon /></span></span><div className="min-w-0"><h4 className="text-sm leading-6 font-bold">{name}</h4><p className="mt-0.5 text-pretty text-[13px] leading-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">{detail}</p></div></div>)}</div></article>)}</div>
          </section>

          <section className={`${panel} overflow-hidden p-6 sm:p-9`}>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-end">
              <div className="min-w-0"><p className="text-[11px] font-bold tracking-[0.16em] text-brand-600 uppercase dark:text-brand-300">Your report conclusion</p><p className="mt-4 max-w-4xl text-pretty text-base leading-8 font-semibold sm:text-lg">{CONCLUSION}</p><div className="mt-8"><ReportActions compact onDownload={openDownload} onShare={openShare} /></div></div>
              <div className="flex min-h-48 items-end justify-center rounded-3xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-4 pt-4"><div className="relative h-44 w-full max-w-64"><Image src="/images/dreamy-expressions/dreamy-celebrate.webp" alt="Dreamy celebrates your career direction" fill sizes="256px" className="object-contain object-bottom" /></div></div>
            </div>
          </section>
        </div>
      </main>

      {downloadOpen && (
        <ReportDialog title="Download your Career Report" description="We’ll open a print-ready version of the complete report. Choose “Save as PDF” in the print dialog to download it." onClose={closeDownload}>
          <div className="mt-6 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] p-4">
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold">Computer Science Career Report</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">All sections · Updated today</p></div><span className="rounded-lg bg-brand-600/10 px-3 py-2 text-[10px] font-extrabold text-brand-600 uppercase dark:text-brand-300">PDF</span></div>
          </div>
          <div className="mt-5 min-h-12" aria-live="polite">
            {downloadStatus === "preparing" && <div role="status" className="rounded-xl bg-brand-600/8 p-4 text-sm font-semibold text-brand-600 dark:text-brand-300">Preparing the print-ready report…</div>}
            {downloadStatus === "success" && <div role="status" className="rounded-xl bg-[var(--color-surface-subtle)] p-4 text-sm leading-6 text-[var(--color-feedback-success)]"><strong>Report ready.</strong> In the print dialog, choose “Save as PDF” as the destination.</div>}
            {downloadStatus === "error" && <div role="alert" className="rounded-xl bg-[var(--color-surface-subtle)] p-4 text-sm leading-6 text-[var(--color-feedback-danger)]">The print-ready report couldn’t open. Check that pop-ups and print dialogs are allowed, then try again.</div>}
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeDownload} className="min-h-12 rounded-xl border border-[var(--color-border-default)] px-5 py-3 text-sm font-bold">{downloadStatus === "success" ? "Done" : "Cancel"}</button>
            <button type="button" disabled={downloadStatus === "preparing"} onClick={startDownload} className="min-h-12 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-[var(--color-white)] disabled:cursor-wait disabled:opacity-60">{downloadStatus === "preparing" ? "Preparing…" : downloadStatus === "error" ? "Try again" : downloadStatus === "success" ? "Open again" : "Open PDF download"}</button>
          </div>
        </ReportDialog>
      )}

      {shareOpen && (
        <ReportDialog title="Share your Career Report" description="Send a view-only report link to a parent, counsellor, mentor or someone helping with your next step." onClose={closeShare}>
          <label className="mt-6 block text-xs font-bold text-[var(--color-text-muted)]" htmlFor="career-report-share-link">REPORT LINK</label>
          <input id="career-report-share-link" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} className="mt-2 min-h-12 w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-4 text-sm text-[var(--color-text-primary)] outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20" />
          <div className="mt-4 min-h-6" aria-live="polite">
            {shareStatus === "copied" && <p role="status" className="text-sm font-semibold text-[var(--color-feedback-success)]">Link copied. It’s ready to share.</p>}
            {shareStatus === "error" && <p role="alert" className="text-sm leading-6 text-[var(--color-feedback-danger)]">{shareError}</p>}
            {(shareStatus === "copying" || shareStatus === "sharing") && <p role="status" className="text-sm font-semibold text-brand-600 dark:text-brand-300">{shareStatus === "copying" ? "Copying link…" : "Opening share options…"}</p>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={copyShareLink} disabled={shareStatus === "copying"} className="min-h-12 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-[var(--color-white)] disabled:opacity-60">{shareStatus === "copied" ? "Copied" : "Copy link"}</button>
            {nativeShareAvailable ? (
              <button type="button" onClick={openNativeShare} disabled={shareStatus === "sharing"} className="min-h-12 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-bold disabled:opacity-60">Share with an app</button>
            ) : (
              <a href={`mailto:?subject=${encodeURIComponent("My Dreamari Career Report")}&body=${encodeURIComponent(`Here’s my Computer Science Career Report: ${shareUrl}`)}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-bold">Share by email</a>
            )}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--color-text-muted)]">Anyone with this demo link can view the report. Production permissions will be connected by the application developer.</p>
        </ReportDialog>
      )}
    </ReportShell>
  );
}

export function CareerReportExperience({ prepare = false, simulateError = false }: CareerReportExperienceProps) {
  const [ready, setReady] = useState(!prepare);
  const showReport = useCallback(() => setReady(true), []);
  return <ThemeProvider>{ready ? <CareerReport /> : <PreparingReport onReady={showReport} simulateError={simulateError} />}</ThemeProvider>;
}
