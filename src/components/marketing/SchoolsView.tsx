"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useState, type ReactNode } from "react";
import { AudienceToggle } from "./AudienceToggle";
import { MarketingButton } from "./Button";
import { DemoRequestForm } from "./DemoRequestForm";
import { DO_COPY, DOMark } from "./DreamOpportunity";
import { PartnerLogoGrid } from "./PartnerTicker";
import { AudienceIllustration, BuildIllustration, ConnectIllustration, DashboardIllustration, ExploreIllustration, Grad, HeroIllustration, ImmerseIllustration, MatchIllustration, SkillsTicker } from "./SchoolsIllustrations";
import { useRevealOnScroll } from "./scrollHooks";
import { TrustLine } from "./TrustLine";

type SchoolsViewProps = {
  view: "student" | "schools";
  onChangeView: (view: "student" | "schools") => void;
};

// ---------------------------------------------------------------------------
// Structure, order and copy are the reference site's, verbatim
// (dreamari-educator-website.replit.app; direct feedback 11 Sept 2026: "keep
// the copy and order of content of the replit"). The one edit is the house
// rule against em dashes: the reference's two dashes are commas here. Every
// graphic is drawn from scratch for this page (SchoolsIllustrations.tsx).
// ---------------------------------------------------------------------------

const AUDIENCES = ["Schools", "School Districts", "Nonprofits", "Educational Institutions"];

type Stage = { n: string; title: string; line: string; detail: string[]; href: string; linkLabel: string; art: ReactNode };

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
    art: <BuildIllustration />,
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
    art: <MatchIllustration />,
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
    art: <ExploreIllustration />,
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
    art: <ImmerseIllustration />,
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
    art: <ConnectIllustration />,
  },
];

const EDUCATOR_FEATURES = [
  { title: "Understand their direction", body: "See the careers and pathways students are exploring." },
  { title: "Follow their progress", body: "Track milestones, submissions, and completed activities." },
  { title: "Keep students moving", body: "Share announcements and communicate about next steps." },
  { title: "Show your progress", body: "Report on engagement, career exploration, and planning milestones." },
];

const SOURCES = [
  { what: "Job descriptions and skills", from: "O*NET OnLine (USDOL/ETA)" },
  { what: "Pay and growth", from: "U.S. Bureau of Labor Statistics" },
  { what: "Interest profile", from: "Harvard FAS Mignone and the O*NET Interest Profiler" },
];

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

const RISE: Variants = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } };

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [ref, revealed] = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={`transition-[opacity,transform] duration-700 ease-out ${className}`} style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(20px)" }}>
      {children}
    </div>
  );
}

function SectionHead({ id, title, lede, align = "left", wide = false }: { id?: string; title: string; lede?: string; align?: "left" | "center"; wide?: boolean }) {
  const centered = align === "center";
  return (
    <div className={`${wide ? "max-w-[980px]" : "max-w-[760px]"} ${centered ? "mx-auto text-center" : ""}`}>
      <h2 id={id} className="text-[clamp(32px,4vw,52px)] leading-[1.08] font-extrabold tracking-[-0.015em]" style={{ color: "var(--foreground)", textWrap: "balance" }}>
        {title}
      </h2>
      {lede && (
        <p className={`mt-4 text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed ${centered ? "mx-auto max-w-[640px]" : "max-w-[620px]"}`} style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
          {lede}
        </p>
      )}
    </div>
  );
}

// One stage card, the reference's: tile, STAGE 01 over the name, the line,
// Learn more. Learn more opens the stage's illustration with three detail
// lines and the link into the app.
function StageCard({ stage, open, onToggle }: { stage: Stage; open: boolean; onToggle: () => void }) {
  const panelId = `stage-${stage.n}-more`;
  return (
    <li className="rounded-[20px] border bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:[box-shadow:0_18px_40px_-24px_rgba(5,7,15,0.25)]" style={{ borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
      <div className="grid gap-5 p-6 sm:grid-cols-[140px_1fr] sm:items-start sm:gap-8 sm:p-8">
        <h3 className="flex items-baseline gap-2.5 text-[22px] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>
          <span className="tabular-nums" style={{ color: "var(--primary)" }}>{stage.n}</span>
          {stage.title}
        </h3>
        <div>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--foreground)", textWrap: "pretty" }}>{stage.line}</p>
          <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="mt-4 inline-flex cursor-pointer items-center gap-1 text-[14px] font-bold" style={{ color: "var(--primary)" }}>
            Learn more
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={panelId} key="panel" className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="grid grid-cols-1 items-center gap-8 border-t px-6 pt-6 pb-6 sm:px-8 sm:pb-8 lg:grid-cols-12 lg:gap-12" style={{ borderColor: "var(--border)" }}>
            <ul className="flex flex-col gap-3 lg:col-span-5">
              {stage.detail.map((d) => (
                <li key={d} className="flex gap-3 text-[15px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                  <span aria-hidden className="mt-[10px] h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--primary)" }} />
                  <span>{d}</span>
                </li>
              ))}
              <li className="pt-1">
                <Link href={stage.href} className="inline-flex items-center gap-1 text-[14px] font-bold transition-colors hover:[color:var(--primary)]" style={{ color: "var(--foreground)" }}>
                  {stage.linkLabel}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </Link>
              </li>
            </ul>
            <div className="mx-auto w-full max-w-[560px] lg:col-span-7">{stage.art}</div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

// ---------------------------------------------------------------------------
// The view
// ---------------------------------------------------------------------------

export function SchoolsView({ view, onChangeView }: SchoolsViewProps) {
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [audience, setAudience] = useState(AUDIENCES[0]);

  return (
    <div>
      {/* ---- 1. Hero ------------------------------------------------------- */}
      <section className="relative overflow-hidden px-6 pt-[clamp(104px,13vh,150px)]">
        {/* aurora: two slow blobs behind the glass; the same blue and violet
           the headline gradient uses, so the page has one light source */}
        <div aria-hidden className="mkt-drift-a pointer-events-none absolute -top-40 right-[-10%] h-[680px] w-[680px] rounded-full blur-[90px]" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent), transparent 70%)" }} />
        <div aria-hidden className="mkt-drift-b pointer-events-none absolute top-[38%] left-[-12%] h-[620px] w-[620px] rounded-full blur-[90px]" style={{ background: "radial-gradient(circle, rgba(125,92,255,0.22), transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1100px]">
          <motion.div className="mb-10 flex justify-center sm:mb-12" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <AudienceToggle view={view} onChange={onChangeView} />
          </motion.div>
          <motion.div className="max-w-[820px]" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}>
            <motion.h1 variants={RISE} className="text-[clamp(38px,4.6vw,60px)] leading-[1.04] font-extrabold tracking-[-0.025em]" style={{ color: "var(--foreground)", textWrap: "balance" }}>
              Help students discover their direction, <Grad>and build the skills to pursue it.</Grad>
            </motion.h1>
            <motion.p variants={RISE} className="mt-6 max-w-[620px] text-[clamp(17px,0.7vw+13px,20px)] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
              Bring personalized career exploration, day-in-the-life simulations, and professional connections to your students. Give educators the insights to guide their next steps.
            </motion.p>
            <motion.div variants={RISE} className="mt-8 flex flex-wrap gap-3">
              <MarketingButton variant="solid" size="lg" href="#demo">
                Request a demo
              </MarketingButton>
              <MarketingButton variant="outline" size="lg" href="#student-experience">
                Explore the platform
              </MarketingButton>
            </motion.div>
            <motion.p variants={RISE} className="mt-6 text-[13.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              For schools, districts, nonprofits, and educational institutions.
            </motion.p>
          </motion.div>
          <div className="mt-14 sm:mt-20">
            <HeroIllustration />
          </div>
        </div>
        <div className="mt-16 sm:mt-24">
          <SkillsTicker />
        </div>
      </section>

      {/* ---- 2. Audiences --------------------------------------------------- */}
      <section id="organization" className="scroll-mt-24 border-b px-6 py-24 sm:py-32" style={{ borderColor: "var(--border)", background: "var(--hero-mid)" }}>
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <SectionHead title="Built for the students you serve." wide />
          </Reveal>
          <Reveal>
            {/* Locked layout: both columns start at the same top edge and the
               graphic column has one fixed height, so switching tabs never
               moves the copy (direct feedback, 11 Sept 2026). */}
            <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5 lg:pt-[68px]">
                <h3 className="text-[clamp(24px,2.2vw,30px)] leading-[1.15] font-extrabold tracking-[-0.015em]" style={{ color: "var(--foreground)", textWrap: "balance" }}>
                  Give every student a clearer path forward.
                </h3>
                <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
                  Help students explore their options, connect learning to careers, and plan their next steps, with visibility for the educators guiding them.
                </p>
              </div>
              <div className="lg:col-span-7">
                <div role="tablist" aria-label="Who Dreamari is built for" className="mb-5 flex max-w-full flex-wrap gap-1 rounded-[14px] border bg-white p-1" style={{ borderColor: "var(--border)", width: "fit-content" }}>
                  {AUDIENCES.map((a) => {
                    const selected = audience === a;
                    return (
                      <button
                        key={a}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setAudience(a)}
                        className="relative cursor-pointer rounded-[10px] px-3.5 py-2 text-[14px] font-semibold transition-colors duration-300"
                        style={{ color: selected ? "var(--primary)" : "var(--foreground)" }}
                      >
                        {selected && <motion.span layoutId="audience-tab" aria-hidden className="absolute inset-0 rounded-[10px]" style={{ background: "color-mix(in srgb, var(--primary) 10%, white)" }} transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                        <span className="relative">{a}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="relative lg:h-[600px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={audience} className="lg:absolute lg:inset-x-0 lg:top-0" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                      <AudienceIllustration audience={audience} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 3. Five stages -------------------------------------------------- */}
      <section id="student-experience" className="scroll-mt-24 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <SectionHead title="Five steps toward a clearer future." />
          </Reveal>
          <ol className="mt-12 flex flex-col gap-4 sm:mt-16">
            {STAGES.map((stage) => (
              <Reveal key={stage.n}>
                <StageCard stage={stage} open={openStage === stage.n} onToggle={() => setOpenStage(openStage === stage.n ? null : stage.n)} />
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- 4. Educators ---------------------------------------------------- */}
      <section className="border-y px-6 py-24 sm:py-32" style={{ borderColor: "color-mix(in srgb, var(--primary) 12%, transparent)", background: "color-mix(in srgb, var(--primary) 4%, white)" }}>
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <SectionHead title="Know where students are. See where to help." lede="Bring student interests, activity, and progress into one dashboard to support more informed guidance." />
          </Reveal>
          <Reveal>
            <ul className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 lg:max-w-[880px]">
              {EDUCATOR_FEATURES.map((f) => (
                <li key={f.title} className="border-t pt-5" style={{ borderColor: "var(--border)" }}>
                  <h3 className="text-[19px] font-bold" style={{ color: "var(--foreground)" }}>{f.title}</h3>
                  <p className="mt-1.5 max-w-[40ch] text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <div className="mt-14 sm:mt-20">
              <DashboardIllustration />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 5. Sources + Dream Opportunity ----------------------------------- */}
      <section id="why-dreamari" className="scroll-mt-24 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <SectionHead title="Grounded in career research. Connected to industry." lede="Career exploration informed by established resources, public occupational data, and insights from professionals at leading companies." />
          </Reveal>
          {/* Research: the three sources, visible, one tile each. */}
          <Reveal>
            <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {SOURCES.map((src) => (
                <li key={src.what} className="flex flex-col gap-2 rounded-[20px] border bg-white p-6" style={{ borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
                  <span className="text-[17px] font-bold" style={{ color: "var(--foreground)" }}>{src.what}</span>
                  <span className="text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{src.from}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          {/* Industry: Dream Opportunity and its partners, one block. The one
             partner display on this page, marks in full brand colour (Joshua
             Pierce, 6 Sept 2026). */}
          <Reveal>
            <div className="mt-6 rounded-[24px] border bg-white p-6 sm:p-10" style={{ borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
                <DOMark className="h-16 w-16 flex-none sm:h-20 sm:w-20" />
                <div>
                  <h3 className="text-[clamp(22px,2vw,26px)] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>Built by the team behind Dream Opportunity</h3>
                  <p className="mt-1.5 max-w-[56ch] text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>A global nonprofit connecting students with professionals at leading companies.</p>
                </div>
              </div>
              <div className="mt-8 border-t pt-8" style={{ borderColor: "var(--border)" }}>
                <PartnerLogoGrid tone="light" />
              </div>
              <p className="mt-8 max-w-[720px] text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
                {DO_COPY.close}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 6. Demo ----------------------------------------------------------- */}
      <TrustLine className="pt-4 pb-4" />
      <section id="demo" className="relative scroll-mt-24 overflow-hidden px-6 py-24 sm:py-32" style={{ background: "#05070f" }}>
        <div aria-hidden className="pointer-events-none absolute -top-40 left-[-10%] h-[620px] w-[620px] rounded-full blur-[100px]" style={{ background: "radial-gradient(circle, rgba(47,107,242,0.35), transparent 70%)" }} />
        <div className="relative mx-auto grid max-w-[1100px] grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <Reveal>
              <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.08] font-extrabold tracking-[-0.015em]" style={{ color: "#ffffff", textWrap: "balance" }}>
                A clearer direction. Skills for what comes next.
              </h2>
              <p className="mt-5 max-w-[560px] text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)", textWrap: "pretty" }}>
                See how Dreamari can support career exploration, skill development, and student guidance in your school or organization.
              </p>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7">
            <div className="rounded-[24px] bg-white p-6 sm:p-8" style={{ boxShadow: "0 40px 90px -40px rgba(0,0,0,0.7)" }}>
              <h3 className="text-[24px] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>
                See Dreamari in action.
              </h3>
              <p className="mt-2 mb-7 text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Tell us a little about your organization so we can tailor your demo.
              </p>
              <DemoRequestForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
