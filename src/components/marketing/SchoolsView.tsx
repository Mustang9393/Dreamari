"use client";

import Link from "next/link";
import { ArrowUpRight, LineChart, Map, MessageSquare, Sparkles, Target, Zap } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { AudienceToggle } from "./AudienceToggle";
import { MarketingButton } from "./Button";
import { DemoRequestForm } from "./DemoRequestForm";
import { DO_COPY, DOMark } from "./DreamOpportunity";
import { PartnerLogoGrid } from "./PartnerTicker";
import { AudienceIllustration, BuildIllustration, ConnectIllustration, DashboardIllustration, ExploreIllustration, Grad, HERO_CAREERS, HeroIllustration, ImmerseIllustration, MatchIllustration, SkillsTicker, type HeroCareerSlug } from "./SchoolsIllustrations";
import { useRevealOnScroll } from "./scrollHooks";
import { TrustLine } from "./TrustLine";

type SchoolsViewProps = {
  view: "student" | "schools";
  onChangeView: (view: "student" | "schools") => void;
  theme?: "light" | "dark";
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

// Icon badges as on the reference (direct feedback, 11 Sept 2026: they
// make the hierarchy clearer here).
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

// The reference's eyebrows and pill, as one designed chip (direct feedback,
// 11 Sept 2026: include them, design them better than mono caps).
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 8%, var(--surface))", borderColor: "color-mix(in srgb, var(--primary) 22%, transparent)", color: "var(--primary)" }}>
      <span aria-hidden className="size-1.5 rounded-full" style={{ background: "var(--primary)" }} />
      {children}
    </span>
  );
}

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

// A row of chips that pick one item, the reference product pages' tabnav:
// the highlight slides between chips, the panel they drive follows.
function Chips({ items, value, onChange, label, id }: { items: string[]; value: string; onChange: (v: string) => void; label: string; id: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex max-w-full flex-wrap gap-1 rounded-[14px] border p-1 backdrop-blur-[16px]" style={{ background: "color-mix(in srgb, var(--surface) 72%, transparent)", borderColor: "var(--border)", width: "fit-content" }}>
      {items.map((item) => {
        const selected = value === item;
        return (
          <button key={item} type="button" role="tab" aria-selected={selected} onClick={() => onChange(item)} className="relative cursor-pointer rounded-[10px] px-3.5 py-2 text-[14px] font-semibold transition-colors duration-300" style={{ color: selected ? "var(--primary)" : "var(--foreground)" }}>
            {selected && <motion.span layoutId={id} aria-hidden className="absolute inset-0 rounded-[10px]" style={{ background: "color-mix(in srgb, var(--primary) 12%, var(--surface))" }} transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            <span className="relative">{item}</span>
          </button>
        );
      })}
    </div>
  );
}

// The five stages as one chip-driven gallery (the reference product pages'
// pattern, direct feedback 11 Sept 2026): chips smooth-scroll a snap track,
// scrolling the track moves the chip. Each slide carries the stage's line,
// its three detail points, the link into the app and its illustration.
function StageGallery() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== active) setActive(Math.max(0, Math.min(STAGES.length - 1, i)));
  }
  function go(i: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    setActive(i);
  }
  return (
    <div>
      <Chips id="stage-chip" label="Stage" items={STAGES.map((st) => `${st.n} ${st.title}`)} value={`${STAGES[active].n} ${STAGES[active].title}`} onChange={(v) => go(STAGES.findIndex((st) => `${st.n} ${st.title}` === v))} />
      <ul ref={trackRef} onScroll={onScroll} className="mkt-track mt-6 flex snap-x snap-mandatory overflow-x-auto scroll-smooth" aria-label="Five steps">
        {STAGES.map((stage, i) => (
          <li key={stage.n} aria-hidden={active !== i} className="w-full flex-none snap-center">
            <div className="grid grid-cols-1 items-center gap-8 rounded-[24px] border p-6 backdrop-blur-[18px] lg:grid-cols-12 lg:gap-12 lg:p-10" style={{ background: "color-mix(in srgb, var(--surface) 84%, transparent)", borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
              <div className="lg:col-span-5">
                <h3 className="flex items-baseline gap-2.5 text-[clamp(24px,2.2vw,30px)] leading-tight font-extrabold tracking-[-0.015em]" style={{ color: "var(--foreground)" }}>
                  <span className="tabular-nums" style={{ color: "var(--primary)" }}>{stage.n}</span>
                  {stage.title}
                </h3>
                <p className="mt-4 text-[17px] leading-relaxed" style={{ color: "var(--foreground)", textWrap: "pretty" }}>{stage.line}</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {stage.detail.map((d) => (
                    <li key={d} className="flex gap-3 text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      <span aria-hidden className="mt-[10px] h-1.5 w-1.5 flex-none rounded-full" style={{ background: "var(--primary)" }} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <Link href={stage.href} tabIndex={active === i ? 0 : -1} className="mt-5 inline-flex items-center gap-1 text-[14px] font-bold transition-colors hover:[color:var(--primary)]" style={{ color: "var(--foreground)" }}>
                  {stage.linkLabel}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </Link>
              </div>
              <div className="mx-auto w-full max-w-[560px] lg:col-span-7">{stage.art}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-center gap-2" aria-hidden>
        {STAGES.map((st, i) => <span key={st.n} className="h-1.5 rounded-full transition-all duration-300" style={{ width: active === i ? 22 : 8, background: active === i ? "var(--foreground)" : "color-mix(in srgb, var(--foreground) 22%, transparent)" }} />)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The view
// ---------------------------------------------------------------------------

export function SchoolsView({ view, onChangeView, theme = "light" }: SchoolsViewProps) {
  const [heroCareer, setHeroCareer] = useState<HeroCareerSlug>("investment-banking");
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
            <motion.div variants={RISE} className="mb-5"><Eyebrow>College &amp; career readiness</Eyebrow></motion.div>
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
            <HeroIllustration career={heroCareer} />
            <div className="mt-8 flex justify-center">
              <Chips id="hero-career" label="Career shown" items={HERO_CAREERS.map((c) => c.title)} value={HERO_CAREERS.find((c) => c.slug === heroCareer)?.title ?? ""} onChange={(v) => { const c = HERO_CAREERS.find((x) => x.title === v); if (c) setHeroCareer(c.slug); }} />
            </div>
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
                <div className="mb-5"><Chips id="audience-tab" label="Who Dreamari is built for" items={AUDIENCES} value={audience} onChange={setAudience} /></div>
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
            <div className="mb-5"><Eyebrow>Build. Match. Explore. Immerse. Connect.</Eyebrow></div>
            <SectionHead title="Five steps toward a clearer future." />
          </Reveal>
          <Reveal>
            <div className="mt-12 sm:mt-14">
              <StageGallery />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- 4. Educators ---------------------------------------------------- */}
      <section className="border-y px-6 py-24 sm:py-32" style={{ borderColor: "color-mix(in srgb, var(--primary) 12%, transparent)", background: "color-mix(in srgb, var(--primary) 5%, var(--background))" }}>
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className="mb-5"><Eyebrow>For educators</Eyebrow></div>
            <SectionHead title="Know where students are. See where to help." lede="Bring student interests, activity, and progress into one dashboard to support more informed guidance." wide />
          </Reveal>
          <Reveal>
            <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-16">
              <ul className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-y-7">
                {EDUCATOR_FEATURES.map((f) => (
                  <li key={f.title} className="flex gap-4">
                    <span className="flex size-11 flex-none items-center justify-center rounded-[12px]" style={{ background: "color-mix(in srgb, var(--primary) 12%, var(--surface))", color: "var(--primary)" }}>
                      <f.Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-[18px] leading-snug font-bold" style={{ color: "var(--foreground)" }}>{f.title}</h3>
                      <p className="mt-1 max-w-[38ch] text-[15.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="lg:col-span-7">
                <DashboardIllustration />
              </div>
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
          {/* Research: the three sources, visible, one tile each, under the
             reference's own label. */}
          <Reveal>
            <h3 className="mt-12 text-[clamp(22px,2vw,26px)] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>Explore our sources</h3>
            <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {SOURCES.map((src) => (
                <li key={src.what} className="flex flex-col gap-2 rounded-[20px] border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
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
            <div className="mt-6 rounded-[24px] border p-6 sm:p-10" style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "0 2px 6px -2px rgba(5,7,15,0.08)" }}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
                <DOMark className="h-16 w-16 flex-none sm:h-20 sm:w-20" />
                <div>
                  <h3 className="text-[clamp(22px,2vw,26px)] leading-tight font-extrabold tracking-[-0.01em]" style={{ color: "var(--foreground)" }}>Built by the team behind Dream Opportunity</h3>
                  <p className="mt-1.5 max-w-[56ch] text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>A global nonprofit connecting students with professionals at leading companies.</p>
                </div>
              </div>
              <div className="mt-8 border-t pt-8" style={{ borderColor: "var(--border)" }}>
                <PartnerLogoGrid tone={theme === "dark" ? "dark" : "light"} />
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
              {/* the reference's two setup points as glass cards (direct
                 feedback: they blended in with no prominence) */}
              <ul className="mt-8 grid grid-cols-2 gap-3 sm:max-w-[440px]">
                {[
                  { Icon: Zap, label: "Quick setup", tone: "#f0b429" },
                  { Icon: Sparkles, label: "Custom onboarding", tone: "#22d3ee" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3 rounded-[16px] border p-4 backdrop-blur-[14px]" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)" }}>
                    <span className="flex size-10 flex-none items-center justify-center rounded-[12px]" style={{ background: `color-mix(in srgb, ${item.tone} 18%, transparent)`, color: item.tone }}>
                      <item.Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                    </span>
                    <span className="text-[15px] leading-snug font-bold text-white">{item.label}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-7">
            <div className="rounded-[24px] border p-6 sm:p-8" style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "0 40px 90px -40px rgba(0,0,0,0.7)" }}>
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
