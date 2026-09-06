"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AudienceToggle } from "./AudienceToggle";
import { MarketingButton } from "./Button";
import { DemoRequestForm } from "./DemoRequestForm";
import { Disclosure } from "./Disclosure";
import { DO_COPY, DOMark, PartnerLogoWall } from "./DreamOpportunity";
import { BuildScreen, ConnectScreen, ExploreScreen, HeroLaptop, ImmerseScreen, LadderScreen, MatchScreen, ProgressScreen, Tile } from "./SchoolsVisuals";
import { useRevealOnScroll } from "./scrollHooks";
import { TrustLine } from "./TrustLine";

type SchoolsViewProps = {
  view: "student" | "schools";
  onChangeView: (view: "student" | "schools") => void;
};

// ---------------------------------------------------------------------------
// Content. Every visual below is a composition of the product's own pieces
// (SchoolsVisuals.tsx): whole components set in a frame with deliberate
// padding, never a cropped screenshot (rule since 7 Sept 2026). The copy in
// each composition is the app's real copy and data. Where a screen does not
// exist yet (the educator dashboard) the caption says so.
// ---------------------------------------------------------------------------

// Copy is the reference site's, verbatim (dreamari-educator-website.replit.app,
// named as the copy source, 6 Sept 2026). The tabs carry titles only there.
const AUDIENCES = ["Schools", "School Districts", "Nonprofits", "Educational Institutions"];

type Stage = {
  n: string;
  title: string;
  line: string;
  detail: string[];
  href: string;
  linkLabel: string;
  // The stage's colour (a world token), used only as the faint wash behind
  // its composition, and the composition itself.
  accent: string;
  graphic: ReactNode;
};

const STAGES: Stage[] = [
  {
    n: "01",
    title: "Build",
    line: "Students build their profile through a short academic and personality assessment.",
    detail: [
      "Fifteen career worlds, from Health & Medicine to Driving, Flying & Shipping, chosen with a tap.",
      "Grounded in the Harvard FAS Mignone and O*NET Interest Profiler.",
      "Ends with the student's first Dream Score, the XP that tracks progress through the rest of the app.",
    ],
    href: "/flow",
    linkLabel: "See Build in the app",
    accent: "var(--world-tech-engineering-design)",
    graphic: <BuildScreen />,
  },
  {
    n: "02",
    title: "Match",
    line: "Discover college majors, schools, and careers aligned with each student's profile.",
    detail: [
      "Each card carries the employers who hire for it and the median salary.",
      "The back of the card shows the college major and pay, so a swipe is an informed one.",
      "The saved Top 3 lands in the student's Profile and drives everything that follows.",
    ],
    href: "/match-lab",
    linkLabel: "See Match in the app",
    accent: "var(--world-business-money-office)",
    graphic: <MatchScreen />,
  },
  {
    n: "03",
    title: "Explore",
    line: "Expand students' horizons with careers they may never have considered.",
    detail: [
      "Career worlds and poster cards a student actually wants to open.",
      "Pay and growth from the U.S. Bureau of Labor Statistics; tasks and skills from O*NET.",
      "Videos inside leading companies, including Chase, EY, AT&T and Kellogg's.",
    ],
    href: "/explore",
    linkLabel: "See Explore in the app",
    accent: "var(--world-food-farming-nature)",
    graphic: <ExploreScreen />,
  },
  {
    n: "04",
    title: "Immerse",
    line: "Experience a day on the job while practicing skills for postsecondary education and the workforce.",
    detail: [
      "Investment Banking is the first simulation; more careers follow.",
      "Students start as an intern and earn their way up through levels.",
      "Every choice is scored, so the simulation teaches the job rather than describing it.",
    ],
    href: "/play/investment-banking",
    linkLabel: "See the simulation in the app",
    accent: "var(--world-driving-flying-shipping)",
    graphic: <ImmerseScreen />,
  },
  {
    n: "05",
    title: "Connect",
    line: "Connect directly with professionals at some of the world's leading companies.",
    detail: [
      "Communities by industry, each with students, professionals and companies.",
      "Verified professionals from firms such as JPMorgan Chase, Goldman Sachs and EY.",
      "Students ask questions in moderated boards, follow professionals, and join events.",
    ],
    href: "/connect",
    linkLabel: "See Connect in the app",
    accent: "var(--world-science-research)",
    graphic: <ConnectScreen />,
  },
];

const EDUCATOR_FEATURES = [
  { title: "Understand their direction", body: "See the careers and pathways students are exploring." },
  { title: "Follow their progress", body: "Track milestones, submissions, and completed activities." },
  { title: "Keep students moving", body: "Share announcements and communicate about next steps." },
  { title: "Show your progress", body: "Report on engagement, career exploration, and planning milestones." },
];

const OUTCOMES = ["Career readiness", "College readiness", "Student engagement", "Postsecondary planning", "Resume completion", "Career exploration", "Professional networking"];

const SOURCES = [
  { what: "Job descriptions and skills", from: "O*NET OnLine (USDOL/ETA)" },
  { what: "Pay and growth", from: "U.S. Bureau of Labor Statistics" },
  { what: "Interest profile", from: "Harvard FAS Mignone and the O*NET Interest Profiler" },
];

const FAQ = [
  {
    q: "How do we roll Dreamari out to students?",
    a: "Dreamari runs in the browser on any device, so there is nothing to install. We work with your team on how students sign in and how classes or cohorts are set up. Rostering integrations are on the roadmap; tell us what your district uses when you request a demo.",
  },
  {
    q: "How is student data handled? Most of our students are minors.",
    a: "Dreamari is designed for students in grades 9 to 12, so FERPA and COPPA shape how it is built. We collect only what the product needs, and student information is not used for advertising. Your privacy and legal teams can review the details with us during evaluation, and the data terms are agreed with each organization.",
  },
  {
    q: "How is this different from a career-interest quiz?",
    a: "A quiz ends with a list. Dreamari starts with one, then lets students look at real pay and pathway data, work a day in the job in a simulation, and talk to people who do it. What comes out is a saved Top 3, a plan and a Career Report a counselor can act on.",
  },
  {
    q: "What does onboarding look like for staff?",
    a: "Counselors and teachers use the same app students do, so there is little to learn. We provide a walkthrough for your team and materials you can hand to students. The educator dashboard adds caseload and reporting views as it ships.",
  },
  {
    q: "How long does it take to launch?",
    a: "Most of the work is on your side: deciding which grades or cohorts start, and how students sign in. Because there is nothing to install, a pilot can begin as soon as those decisions are made. We scope a timeline with you during the demo.",
  },
  {
    q: "What does it cost?",
    a: "Pricing depends on the size of your organization and the number of students served. We do not publish a rate card. Request a demo and we will put together a proposal for your organization.",
  },
];

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

// One fade-and-rise per section, fired once. The student site's chapters do
// the same, so the two audiences share a motion vocabulary.
function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [ref, revealed] = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${className}`}
      style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(20px)" }}
    >
      {children}
    </div>
  );
}

// Section heading pair. Strict hierarchy: the h2 is the biggest thing in the
// section, the lede sits under it at body-plus size, and there is no eyebrow.
function SectionHead({ id, title, lede, align = "left" }: { id?: string; title: string; lede?: string; align?: "left" | "center" }) {
  const centered = align === "center";
  return (
    <div className={`max-w-[760px] ${centered ? "mx-auto text-center" : ""}`}>
      <h2 id={id} className="text-[clamp(28px,3.2vw,40px)] leading-[1.08] font-extrabold tracking-[-0.015em]" style={{ color: "var(--foreground)", textWrap: "balance" }}>
        {title}
      </h2>
      {lede && (
        <p className={`mt-4 text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed ${centered ? "mx-auto max-w-[620px]" : "max-w-[620px]"}`} style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
          {lede}
        </p>
      )}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
      {children}
    </p>
  );
}

function StageRow({ stage, flip, open, onToggle }: { stage: Stage; flip: boolean; open: boolean; onToggle: () => void }) {
  return (
    <Reveal>
      <li className="grid grid-cols-1 items-center gap-8 py-10 sm:py-12 lg:grid-cols-12 lg:gap-14 lg:py-14">
        <div className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
          {/* The one eyebrow on the page. Sequence is information here: the
             five stages happen in this order, and the number says so. */}
          <div className="text-[12px] font-bold tracking-[0.16em] tabular-nums" style={{ color: "var(--primary)" }}>
            STAGE {stage.n}
          </div>
          <h3 className="mt-2 text-[clamp(24px,2.2vw,30px)] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>
            {stage.title}
          </h3>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
            {stage.line}
          </p>
          <div className="mt-5 max-w-[520px]">
            <Disclosure id={`stage-${stage.n}`} title="What students do" size="sm" open={open} onToggle={onToggle}>
              <ul className="flex flex-col gap-2.5">
                {stage.detail.map((d) => (
                  <li key={d} className="flex gap-3 text-[14px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--primary)" }} />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
              <Link href={stage.href} className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold transition-colors hover:[color:var(--primary)]" style={{ color: "var(--foreground)" }}>
                {stage.linkLabel}
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              </Link>
            </Disclosure>
          </div>
        </div>
        <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
          {/* Same tile, same padding, same 5:4 focal card for all five stages,
             so the set reads as one. */}
          <Tile accent={stage.accent}>{stage.graphic}</Tile>
        </div>
      </li>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------
// The view
// ---------------------------------------------------------------------------

export function SchoolsView({ view, onChangeView }: SchoolsViewProps) {
  const [openStages, setOpenStages] = useState<Set<string>>(() => new Set());
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [outcomesOpen, setOutcomesOpen] = useState(false);

  const toggleStage = (n: string) =>
    setOpenStages((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  return (
    <div>
      {/* ---- Hero ---------------------------------------------------------- */}
      <section id="why" className="relative scroll-mt-24 overflow-hidden px-6 pt-[clamp(112px,14vh,160px)]">
        {/* Same soft blue glow the student hero carries, kept faint on the light
           ground so the page reads as one family, not a template swap. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-64 -right-48 h-[720px] w-[720px] rounded-full blur-[16px]"
          style={{ background: "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 16%, transparent), color-mix(in srgb, var(--hero-accent-purple) 55%, transparent) 45%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1200px] pb-14 sm:pb-20">
          <div className="mb-10 flex justify-center sm:mb-14">
            <AudienceToggle view={view} onChange={onChangeView} />
          </div>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-6">
              <h1
                className="text-[clamp(40px,4.6vw,64px)] leading-[1.02] font-extrabold tracking-[-0.02em]"
                style={{ color: "var(--foreground)", textWrap: "balance" }}
              >
                Help students discover their direction&mdash;and build the skills to pursue it.
              </h1>
              <p className="mt-5 max-w-[540px] text-[clamp(17px,0.7vw+13px,20px)] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
                Bring personalized career exploration, day-in-the-life simulations, and professional connections to your students.
                Give educators the insights to guide their next steps.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <MarketingButton variant="primary" size="lg" href="#demo">
                  Request a demo
                </MarketingButton>
                <MarketingButton variant="ghost" size="lg" href="#student-experience">
                  Explore the platform
                </MarketingButton>
              </div>
              <p className="mt-8 text-[13.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                For schools, districts, nonprofits, and educational institutions.
              </p>
            </div>
            <div className="lg:col-span-6 lg:pl-4">
              <HeroLaptop />
              <Caption>Career Detail for Investment Banking, as it ships in the app today.</Caption>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Audience strip ------------------------------------------------- */}
      <section aria-labelledby="audience-heading" className="px-6 pt-4 sm:pt-8">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHead id="audience-heading" align="center" title="Built for the students you serve." />
          </Reveal>
          <ul className="mx-auto mt-8 grid max-w-[960px] grid-cols-2 border-y sm:mt-10 lg:grid-cols-4" style={{ borderColor: "var(--border)" }}>
            {AUDIENCES.map((a, i) => (
              <li
                key={a}
                className={`py-5 text-center text-[16px] font-bold sm:py-6 sm:text-[17px] ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {a}
              </li>
            ))}
          </ul>
          <Reveal>
            <div className="mx-auto mt-10 max-w-[720px] text-center sm:mt-12">
              <h3 className="text-[clamp(22px,2vw,28px)] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)", textWrap: "balance" }}>
                Give every student a clearer path forward.
              </h3>
              <p className="mt-3 text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
                Help students explore their options, connect learning to careers, and plan their next steps&mdash;with visibility for the educators guiding them.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Five stages ---------------------------------------------------- */}
      <section id="student-experience" className="scroll-mt-24 px-6 pt-20 pb-6 sm:pt-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHead title="Five steps toward a clearer future." />
          </Reveal>
          <ol className="mt-4 divide-y sm:mt-8" style={{ borderColor: "var(--border)" }}>
            {STAGES.map((s, i) => (
              <StageRow key={s.n} stage={s} flip={i % 2 === 1} open={openStages.has(s.n)} onToggle={() => toggleStage(s.n)} />
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Educators ------------------------------------------------------ */}
      <section className="px-6 py-20 sm:py-28" style={{ background: "var(--hero-mid)" }}>
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHead title="Know where students are. See where to help." lede="Bring student interests, activity, and progress into one dashboard to support more informed guidance." />
          </Reveal>
          <Reveal>
            <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
              <ul className="lg:col-span-5">
                {EDUCATOR_FEATURES.map((f, i) => (
                  <li key={f.title} className={`py-5 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "color-mix(in srgb, var(--foreground) 14%, transparent)" }}>
                    <h3 className="text-[17px] font-bold" style={{ color: "var(--foreground)" }}>
                      {f.title}
                    </h3>
                    <p className="mt-1 text-[14.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      {f.body}
                    </p>
                  </li>
                ))}
                <li className="pt-5">
                  <Disclosure id="outcomes" title="Outcomes you will be able to report on" size="sm" open={outcomesOpen} onToggle={() => setOutcomesOpen((o) => !o)}>
                    <ul className="flex flex-wrap gap-2">
                      {OUTCOMES.map((o) => (
                        <li key={o} className="rounded-full border px-3 py-1.5 text-[13px] font-semibold" style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "#ffffff" }}>
                          {o}
                        </li>
                      ))}
                    </ul>
                  </Disclosure>
                </li>
              </ul>
              <div className="lg:col-span-7">
                <Tile accent="var(--primary)">
                  <ProgressScreen />
                </Tile>
                <Caption>
                  Shown: a student&apos;s own progress (Top 3, plan, Career Report) as it ships today. The educator dashboard that reads this across a caseload is in development.
                </Caption>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Data credibility ----------------------------------------------- */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-6">
                <SectionHead
                  title="Grounded in career research. Connected to industry."
                  lede="Career exploration informed by established resources, public occupational data, and insights from professionals at leading companies."
                />
                <ul className="mt-8 max-w-[560px]">
                  {SOURCES.map((s, i) => (
                    <li key={s.what} className={`flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "var(--border)" }}>
                      <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
                        {s.what}
                      </span>
                      <span className="text-[14px] sm:text-right" style={{ color: "var(--muted-foreground)" }}>
                        {s.from}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 max-w-[56ch] text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  A Career Report supports a conversation with a counselor; it is not a decision or a prediction.
                </p>
              </div>
              <div className="lg:col-span-6">
                <Tile accent="var(--world-business-money-office)">
                  <LadderScreen />
                </Tile>
                <Caption>Career ladder from the Investment Banking detail page.</Caption>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Built by Dream Opportunity ------------------------------------- */}
      <section id="organization" className="scroll-mt-24 border-t px-6 py-20 sm:py-28" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="mb-6 flex justify-center sm:mb-8">
              <DOMark className="h-16 w-16 sm:h-20 sm:w-20" />
            </div>
            <SectionHead align="center" title={DO_COPY.heading} lede={DO_COPY.lead} />
          </Reveal>
          <Reveal>
            <PartnerLogoWall size="full" className="mx-auto mt-10 max-w-[960px] sm:mt-12" />
          </Reveal>
          <Reveal>
            <p className="mx-auto mt-10 max-w-[720px] text-center text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed sm:mt-12" style={{ color: "var(--foreground)", textWrap: "pretty" }}>
              {DO_COPY.close}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- FAQ ------------------------------------------------------------ */}
      <section className="px-6 py-20 sm:py-28" style={{ background: "var(--hero-mid)" }}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Reveal>
              <SectionHead title="Questions schools ask." lede="Short answers here. Longer ones in the demo." />
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <Reveal>
              <div className="border-b" style={{ borderColor: "var(--border)" }}>
                {FAQ.map((f, i) => (
                  <Disclosure key={f.q} id={`faq-${i}`} title={f.q} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)}>
                    <p className="max-w-[64ch] text-[15.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      {f.a}
                    </p>
                  </Disclosure>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Testimonials (shell) ------------------------------------------- */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHead title="Results from partner schools." />
          </Reveal>
          <Reveal>
            <div
              className="mt-10 flex flex-col items-start gap-2 rounded-2xl border border-dashed p-8 sm:p-10"
              style={{ borderColor: "var(--border)", background: "var(--glass-surface-1)" }}
            >
              <h3 className="text-[19px] font-bold" style={{ color: "var(--foreground)" }}>
                Case studies coming soon.
              </h3>
              <p className="max-w-[52ch] text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Ask for references when you request a demo.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- Demo request --------------------------------------------------- */}
      {/* Credibility lines before the closing CTA, with the partner logo row
         under them, as asked (Joshua Pierce, Slack, 6 Sept 2026). The row was
         held until the partner list was confirmed; it is now the real set. */}
      <TrustLine />
      <div className="px-6 pb-8 sm:pb-10">
        <Reveal>
          <PartnerLogoWall size="compact" className="mx-auto mt-6 w-full max-w-[720px]" />
        </Reveal>
      </div>

      <section id="demo" className="scroll-mt-24 border-t px-6 py-20 sm:py-28" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHead
                title="A clearer direction. Skills for what comes next."
                lede="See how Dreamari can support career exploration, skill development, and student guidance in your school or organization."
              />
              <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                {["Quick setup", "Custom onboarding"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal>
              <h3 className="text-[clamp(22px,2vw,28px)] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>
                See Dreamari in action.
              </h3>
              <p className="mt-2 mb-6 text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Tell us a little about your organization so we can tailor your demo.
              </p>
              <DemoRequestForm />
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
