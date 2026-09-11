"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Briefcase, ChevronDown, Compass, LineChart, Map, MessageSquare, Target, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AudienceToggle } from "./AudienceToggle";
import { MarketingButton } from "./Button";
import { DemoRequestForm } from "./DemoRequestForm";
import { DO_COPY, DOMark } from "./DreamOpportunity";
import { PartnerLogoGrid } from "./PartnerTicker";
import { Grad, HeroShowcase, SchoolsPreview, SkillsTicker } from "./SchoolsShowcase";
import { BuildArt, ConnectArt, DataArt, ExploreArt, Frame, ImmerseArt, MatchArt, ProgressArt } from "./SchoolsVisuals";
import { useRevealOnScroll } from "./scrollHooks";
import { TrustLine } from "./TrustLine";

type SchoolsViewProps = {
  view: "student" | "schools";
  onChangeView: (view: "student" | "schools") => void;
};

// ---------------------------------------------------------------------------
// Structure and copy follow the reference site section for section
// (dreamari-educator-website.replit.app, the named copy source; re-confirmed
// 11 Sept 2026: "follow the structure and content from this"). Seven
// sections: hero with the skills ticker, audiences, five stages, educators,
// sources with the Dream Opportunity row, demo. Nothing else. Every visual is
// a composition of the product's own components (SchoolsVisuals /
// SchoolsShowcase), never a cropped screenshot.
// ---------------------------------------------------------------------------

const AUDIENCES = ["Schools", "School Districts", "Nonprofits", "Educational Institutions"];

type Stage = {
  n: string;
  title: string;
  Icon: typeof Compass;
  line: string;
  detail: string[];
  href: string;
  linkLabel: string;
  art: ReactNode;
  bare?: boolean;
};

const STAGES: Stage[] = [
  {
    n: "01",
    title: "Build",
    Icon: Compass,
    line: "Students build their profile through a short academic and personality assessment.",
    detail: [
      "Fifteen career worlds, from Health & Medicine to Driving, Flying & Shipping, chosen with a tap.",
      "Grounded in the Harvard FAS Mignone and O*NET Interest Profiler.",
      "Ends with the student's first Dream Score, the XP that tracks progress through the rest of the app.",
    ],
    href: "/flow",
    linkLabel: "See Build in the app",
    art: <BuildArt />,
  },
  {
    n: "02",
    title: "Match",
    Icon: Target,
    line: "Discover college majors, schools, and careers aligned with each student's profile.",
    detail: [
      "Each card carries the employers who hire for it and the median salary.",
      "The back of the card shows the college major and pay, so a swipe is an informed one.",
      "The saved Top 3 lands in the student's Profile and drives everything that follows.",
    ],
    href: "/match-lab",
    linkLabel: "See Match in the app",
    art: <MatchArt />,
  },
  {
    n: "03",
    title: "Explore",
    Icon: Map,
    line: "Expand students' horizons with careers they may never have considered.",
    detail: [
      "Career worlds and poster cards a student actually wants to open.",
      "Pay and growth from the U.S. Bureau of Labor Statistics; tasks and skills from O*NET.",
      "Videos inside leading companies, including Chase, EY, AT&T and Kellogg's.",
    ],
    href: "/explore",
    linkLabel: "See Explore in the app",
    art: <ExploreArt />,
  },
  {
    n: "04",
    title: "Immerse",
    Icon: Briefcase,
    line: "Experience a day on the job while practicing skills for postsecondary education and the workforce.",
    detail: [
      "Investment Banking is the first simulation; more careers follow.",
      "Students start as an intern and earn their way up through levels.",
      "Every choice is scored, so the simulation teaches the job rather than describing it.",
    ],
    href: "/play/investment-banking",
    linkLabel: "See the simulation in the app",
    art: <ImmerseArt />,
  },
  {
    n: "05",
    title: "Connect",
    Icon: Users,
    line: "Connect directly with professionals at some of the world's leading companies.",
    detail: [
      "Communities by industry, each with students, professionals and companies.",
      "Verified professionals from firms such as JPMorgan Chase, Goldman Sachs and EY.",
      "Students ask questions in moderated boards, follow professionals, and join events.",
    ],
    href: "/connect",
    linkLabel: "See Connect in the app",
    art: <ConnectArt />,
    bare: true,
  },
];

const EDUCATOR_FEATURES = [
  { Icon: Map, title: "Understand their direction", body: "See the careers and pathways students are exploring." },
  { Icon: LineChart, title: "Follow their progress", body: "Track milestones, submissions, and completed activities." },
  { Icon: MessageSquare, title: "Keep students moving", body: "Share announcements and communicate about next steps." },
  { Icon: Target, title: "Show your progress", body: "Report on engagement, career exploration, and planning milestones." },
];

const SOURCES = [
  { what: "Job descriptions and skills", from: "O*NET OnLine (USDOL/ETA)" },
  { what: "Pay and growth", from: "U.S. Bureau of Labor Statistics" },
  { what: "Interest profile", from: "Harvard FAS Mignone and the O*NET Interest Profiler" },
];

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [ref, revealed] = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={`transition-[opacity,transform] duration-700 ease-out ${className}`} style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(20px)" }}>
      {children}
    </div>
  );
}

// The reference's small mono caps line above a heading.
function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[12.5px] font-semibold tracking-[0.14em] uppercase ${className}`} style={{ fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)", color: "var(--primary)" }}>
      {children}
    </p>
  );
}

// Strict hierarchy: the h2 is the biggest thing in the section, the lede under it.
function SectionHead({ id, title, lede, align = "left", size = "md" }: { id?: string; title: string; lede?: string; align?: "left" | "center"; size?: "md" | "lg" }) {
  const centered = align === "center";
  return (
    <div className={`max-w-[760px] ${centered ? "mx-auto text-center" : ""}`}>
      <h2 id={id} className={`${size === "lg" ? "text-[clamp(32px,4vw,52px)]" : "text-[clamp(28px,3.2vw,40px)]"} leading-[1.08] font-extrabold tracking-[-0.015em]`} style={{ color: "var(--foreground)", textWrap: "balance" }}>
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

// A soft icon tile, the reference's visual for stages, features and sources.
function IconTile({ Icon, size = 48 }: { Icon: typeof Compass; size?: number }) {
  return (
    <span className="flex flex-none items-center justify-center rounded-[14px]" style={{ width: size, height: size, background: "color-mix(in srgb, var(--primary) 9%, white)", color: "var(--primary)" }}>
      <Icon style={{ width: size * 0.42, height: size * 0.42 }} strokeWidth={2} aria-hidden />
    </span>
  );
}

// One stage card: tile, "01 Build" (number and name at equal weight, one line,
// direct feedback 7 Sept 2026), the line, and Learn more. Learn more opens the
// stage's composition with its three detail lines and the link into the app,
// so the graphics live where a reader asked for them instead of repeating
// down the page.
function StageCard({ stage, open, onToggle }: { stage: Stage; open: boolean; onToggle: () => void }) {
  const panelId = `stage-${stage.n}-more`;
  return (
    <li className="rounded-[20px] border bg-white" style={{ borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
      <div className="grid gap-5 p-6 sm:grid-cols-[auto_150px_1fr] sm:items-start sm:gap-8 sm:p-8">
        <IconTile Icon={stage.Icon} />
        <h3 className="flex items-baseline gap-2 text-[20px] leading-tight font-extrabold tracking-[-0.01em] uppercase" style={{ color: "var(--foreground)" }}>
          <span className="tabular-nums" style={{ color: "var(--primary)" }}>{stage.n}</span>
          {stage.title}
        </h3>
        <div>
          <p className="text-[clamp(17px,1.2vw,20px)] leading-snug" style={{ color: "var(--foreground)", textWrap: "pretty" }}>{stage.line}</p>
          <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="mt-4 inline-flex cursor-pointer items-center gap-1 text-[14px] font-bold" style={{ color: "var(--primary)" }}>
            Learn more
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>
      <div id={panelId} hidden={!open} className="border-t px-6 pt-6 pb-6 sm:px-8 sm:pb-8" style={{ borderColor: "var(--border)" }}>
        {open && (
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
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
            <div className="flex justify-center lg:col-span-7">
              {stage.bare ? stage.art : <Frame className="aspect-[4/5] w-full max-w-[420px] sm:aspect-[5/4] sm:max-w-[560px]">{stage.art}</Frame>}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// The view
// ---------------------------------------------------------------------------

export function SchoolsView({ view, onChangeView }: SchoolsViewProps) {
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div>
      {/* ---- 1. Hero ------------------------------------------------------- */}
      <section className="relative overflow-hidden px-6 pt-[clamp(104px,13vh,150px)]">
        <div aria-hidden className="pointer-events-none absolute -top-64 -right-48 h-[720px] w-[720px] rounded-full blur-[16px]" style={{ background: "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 16%, transparent), color-mix(in srgb, var(--hero-accent-purple) 55%, transparent) 45%, transparent 70%)" }} />
        <div className="relative mx-auto max-w-[1240px]">
          <div className="mb-10 flex justify-center sm:mb-12">
            <AudienceToggle view={view} onChange={onChangeView} />
          </div>
          <div className="max-w-[880px]">
            <Eyebrow>College &amp; career readiness</Eyebrow>
            <h1 className="mt-4 text-[clamp(40px,5vw,68px)] leading-[1.02] font-extrabold tracking-[-0.025em]" style={{ color: "var(--foreground)", textWrap: "balance" }}>
              Help students discover their direction, <Grad>and build the skills to pursue it.</Grad>
            </h1>
            <p className="mt-6 max-w-[640px] text-[clamp(17px,0.7vw+13px,21px)] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
              Bring personalized career exploration, day-in-the-life simulations, and professional connections to your students. Give educators the insights to guide their next steps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MarketingButton variant="primary" size="lg" href="#demo">
                Request a demo
              </MarketingButton>
              <MarketingButton variant="ghost" size="lg" href="#student-experience">
                Explore the platform
              </MarketingButton>
            </div>
            <p className="mt-6 text-[13.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              For schools, districts, nonprofits, and educational institutions.
            </p>
          </div>
          <div className="mt-14 sm:mt-20">
            <HeroShowcase />
          </div>
        </div>
        <div className="mt-16 sm:mt-24">
          <SkillsTicker />
        </div>
      </section>

      {/* ---- 2. Audiences --------------------------------------------------- */}
      <section id="organization" className="scroll-mt-24 border-b px-6 py-20 sm:py-28" style={{ borderColor: "var(--border)", background: "var(--hero-mid)" }}>
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <SectionHead align="center" size="lg" title="Built for the students you serve." />
            <ul className="mx-auto mt-10 flex max-w-full flex-wrap justify-center gap-1 rounded-[16px] border bg-white p-1.5" style={{ borderColor: "var(--border)", width: "fit-content" }}>
              {AUDIENCES.map((a, i) => (
                <li key={a} className="rounded-[11px] px-4 py-2 text-[15px] font-semibold sm:px-5" style={i === 0 ? { background: "color-mix(in srgb, var(--primary) 10%, white)", color: "var(--primary)" } : { color: "var(--foreground)" }}>
                  {a}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <h3 className="text-[clamp(26px,2.6vw,36px)] leading-[1.1] font-extrabold tracking-[-0.015em]" style={{ color: "var(--foreground)", textWrap: "balance" }}>
                  Give every student a clearer path forward.
                </h3>
                <p className="mt-5 max-w-[46ch] text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
                  Help students explore their options, connect learning to careers, and plan their next steps, with visibility for the educators guiding them.
                </p>
              </div>
              <div className="lg:col-span-7">
                <SchoolsPreview />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 3. Five stages -------------------------------------------------- */}
      <section id="student-experience" className="scroll-mt-24 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <Eyebrow>Build. Match. Explore. Immerse. Connect.</Eyebrow>
            <div className="mt-4">
              <SectionHead size="lg" title="Five steps toward a clearer future." />
            </div>
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
      <section className="border-y px-6 py-20 sm:py-28" style={{ borderColor: "color-mix(in srgb, var(--primary) 12%, transparent)", background: "color-mix(in srgb, var(--primary) 4%, white)" }}>
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <span className="inline-flex rounded-full border px-3.5 py-1.5 text-[13px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)", color: "var(--primary)", background: "white" }}>
              For educators
            </span>
            <div className="mt-6">
              <SectionHead size="lg" title="Know where students are. See where to help." lede="Bring student interests, activity, and progress into one dashboard to support more informed guidance." />
            </div>
          </Reveal>
          <Reveal>
            <ul className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:max-w-[880px]">
              {EDUCATOR_FEATURES.map((f) => (
                <li key={f.title}>
                  <IconTile Icon={f.Icon} size={44} />
                  <h3 className="mt-4 text-[18px] font-bold" style={{ color: "var(--foreground)" }}>{f.title}</h3>
                  <p className="mt-1.5 max-w-[40ch] text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal>
            <div className="mt-14 sm:mt-20">
              <ProgressArt />
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Shown: a student&apos;s own progress (Top 3, plan, Career Report) as it ships today. The educator dashboard that reads this across a caseload is in development.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 5. Sources + Dream Opportunity ----------------------------------- */}
      <section id="why-dreamari" className="scroll-mt-24 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <div className="flex justify-center">
              <IconTile Icon={BookOpen} size={56} />
            </div>
            <div className="mt-6">
              <SectionHead align="center" size="lg" title="Grounded in career research. Connected to industry." lede="Career exploration informed by established resources, public occupational data, and insights from professionals at leading companies." />
            </div>
          </Reveal>
          <Reveal>
            <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="rounded-[24px] border bg-white p-6 sm:p-8 lg:col-span-6" style={{ borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
                <div className="flex justify-center">
                  <button type="button" aria-expanded={sourcesOpen} aria-controls="sources-list" onClick={() => setSourcesOpen((o) => !o)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-[12px] border px-4 py-2.5 text-[14px] font-bold" style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "white" }}>
                    Explore our sources
                    <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${sourcesOpen ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
                <ul id="sources-list" hidden={!sourcesOpen} className="mt-6">
                  {SOURCES.map((s, i) => (
                    <li key={s.what} className={`flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "var(--border)" }}>
                      <span className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{s.what}</span>
                      <span className="text-[14px] sm:text-right" style={{ color: "var(--muted-foreground)" }}>{s.from}</span>
                    </li>
                  ))}
                  <li className="pt-3 text-[13.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    A Career Report supports a conversation with a counselor; it is not a decision or a prediction.
                  </li>
                </ul>
                <div className="mt-8 flex flex-col gap-5 border-t pt-8 sm:flex-row sm:items-center sm:gap-7" style={{ borderColor: "var(--border)" }}>
                  <DOMark className="h-16 w-16 flex-none sm:h-20 sm:w-20" />
                  <div>
                    <h3 className="text-[19px] font-bold" style={{ color: "var(--foreground)" }}>Built by the team behind Dream Opportunity</h3>
                    <p className="mt-1 max-w-[46ch] text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>A global nonprofit connecting students with professionals at leading companies.</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6">
                <DataArt />
              </div>
            </div>
          </Reveal>
          {/* One partner display on this page, inside the Dream Opportunity
             section, marks in full brand colour (Joshua Pierce, 6 Sept 2026). */}
          <Reveal>
            <div className="mx-auto mt-12 max-w-[1100px] rounded-[24px] border bg-white p-6 sm:p-10 lg:p-12" style={{ borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
              <PartnerLogoGrid tone="light" />
            </div>
            <p className="mx-auto mt-8 max-w-[720px] text-center text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)", textWrap: "pretty" }}>
              {DO_COPY.close}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- 6. Demo ----------------------------------------------------------- */}
      <TrustLine className="pt-4 pb-4" />
      <section id="demo" className="scroll-mt-24 px-6 py-20 sm:py-28" style={{ background: "#05070f" }}>
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[760px]">
            <Reveal>
              <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.08] font-extrabold tracking-[-0.015em]" style={{ color: "#ffffff", textWrap: "balance" }}>
                A clearer direction. Skills for what comes next.
              </h2>
              <p className="mt-5 max-w-[560px] text-[clamp(16px,0.6vw+13px,18px)] leading-relaxed" style={{ color: "rgba(255,255,255,0.72)", textWrap: "pretty" }}>
                See how Dreamari can support career exploration, skill development, and student guidance in your school or organization.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
                {[
                  { label: "Quick setup", dot: "var(--world-business-money-office)" },
                  { label: "Custom onboarding", dot: "#22d3ee" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-[14.5px] font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: item.dot }} />
                    {item.label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal>
            <div className="mx-auto mt-14 max-w-[640px] rounded-[24px] bg-white p-6 sm:p-8" style={{ boxShadow: "0 40px 90px -40px rgba(0,0,0,0.7)" }}>
              <h3 className="text-[clamp(22px,2vw,28px)] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>
                See Dreamari in action.
              </h3>
              <p className="mt-2 mb-6 text-[15.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
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
