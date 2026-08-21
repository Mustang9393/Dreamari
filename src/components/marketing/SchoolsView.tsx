"use client";

import { ArrowRight } from "lucide-react";
import { AudienceToggle } from "./AudienceToggle";
import { MarketingButton } from "./Button";
import { SchoolsFinalCTA } from "./FinalCTAs";

type SchoolsViewProps = {
  view: "student" | "schools";
  onChangeView: (view: "student" | "schools") => void;
};

const FEAT_STUDENTS = [
  { title: "Career Discovery", body: "Explore careers aligned with interests and strengths." },
  { title: "Career Simulations", body: "Experience careers before choosing a pathway." },
  { title: "Career Success Roadmap", body: "Complete personalized milestones from Grades 9–12." },
  { title: "College & Career Planning", body: "Prepare for college, trade school, or the workforce." },
  { title: "Professional Networking", body: "Connect with professionals and build social capital." },
];

const FEAT_COUNSELORS = [
  { title: "Student Progress", body: "Monitor milestones, submissions, and completion." },
  { title: "Counselor Dashboard", body: "Track student progress across grades and pathways." },
  { title: "Communication", body: "Send announcements and communicate with students." },
  { title: "Reporting", body: "Generate school, district, and nonprofit reports." },
];

const METRICS = [
  "Career readiness",
  "College readiness",
  "Student engagement",
  "Postsecondary planning",
  "Resume completion",
  "Career exploration",
  "Professional networking",
];

const ORGS = [
  { title: "Schools", body: "Support every student with structured career planning." },
  { title: "School Districts", body: "Manage career readiness across multiple schools." },
  { title: "Nonprofits", body: "Deliver programming and measure participant outcomes." },
  { title: "Educational Organizations", body: "Expand career-connected learning at scale." },
];

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-end gap-6 px-6 pb-8 max-[800px]:items-start sm:gap-10 sm:pb-12 min-[801px]:grid-cols-2">
      <div>
        <div className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--primary-tint)" }}>
          {eyebrow}
        </div>
        <h2 className="mt-3 text-[30px] font-extrabold" style={{ color: "var(--foreground)" }}>
          {title}
        </h2>
      </div>
      <p style={{ color: "var(--muted-foreground)" }}>{body}</p>
    </div>
  );
}

function FeatCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-xl border p-[22px] transition-[transform,border-color] duration-200 hover:-translate-y-1"
      style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}
    >
      <h4 className="mb-2 text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
        {title}
      </h4>
      <p className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
        {body}
      </p>
    </div>
  );
}

export function SchoolsView({ view, onChangeView }: SchoolsViewProps) {
  return (
    <div>
      <section className="relative overflow-hidden px-6 pt-[76px]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-56 -right-40 h-[640px] w-[640px] rounded-full blur-[10px]"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(47,107,242,.35), rgba(122,45,226,.18) 45%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1200px] pt-6 pb-10 sm:pb-16">
          <div className="mb-[18px] flex justify-center">
            <AudienceToggle view={view} onChange={onChangeView} />
          </div>
          <div
            className="mb-3.5 inline-block rounded-md px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.08em] uppercase"
            style={{ background: "var(--glass-surface-1)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
          >
            FOR SCHOOLS · DISTRICTS · NONPROFITS
          </div>
          <h1 className="max-w-[760px] text-[48px] font-extrabold" style={{ lineHeight: 1.05, color: "var(--foreground)" }}>
            Prepare every student for what&apos;s next.
          </h1>
          <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Dreamari helps schools, nonprofits, and educational organizations deliver career exploration, college and
            career readiness, and measurable student outcomes, through one integrated platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <MarketingButton variant="primary" href="#">
              Request a demo
            </MarketingButton>
            <MarketingButton variant="ghost" href="#">
              Talk to our team
            </MarketingButton>
          </div>
        </div>
      </section>

      <section className="px-6 pt-8 pb-8 sm:pt-10 sm:pb-10 lg:pb-14">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 min-[801px]:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--primary-tint)" }}>
              One platform. Every student.
            </div>
            <h2 className="mt-3 text-[30px] font-extrabold" style={{ color: "var(--foreground)" }}>
              Stop stitching together five different tools.
            </h2>
          </div>
          <div>
            <p style={{ color: "var(--muted-foreground)" }}>
              Instead of managing multiple disconnected tools, Dreamari brings career exploration, counselor
              tracking, college planning, student engagement, and reporting into one platform.
            </p>
            <a href="#" className="mt-3.5 inline-flex items-center gap-[5px] text-[14px] font-semibold" style={{ color: "var(--foreground)", opacity: 0.75 }}>
              Learn more about the platform<ArrowRight size={14} strokeWidth={2.75} aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-8 sm:py-10 lg:py-14" style={{ background: "var(--card)" }}>
        <SectionHead eyebrow="For students" title="Everything students need." body="Students complete their entire college and career journey in one place." />
        <div className="mx-auto max-w-[1200px] rounded-[20px] border px-7 py-6" style={{ background: "linear-gradient(135deg, rgba(47,107,242,.09), rgba(229,72,77,.05))", borderColor: "var(--border)" }}>
          <div className="flex justify-center py-3">
            <div className="relative w-[270px] rounded-[32px] border p-[22px_20px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}>
              <div className="mx-auto mb-[18px] h-1.5 w-14 rounded-full" style={{ background: "var(--border)" }} />
              <div className="mb-3 text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>
                Your journey
              </div>
              <div className="mb-[18px] h-1.5 overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
                <div className="h-full rounded-full" style={{ width: "62%", background: "linear-gradient(90deg, var(--primary), #7aa2ff)" }} />
              </div>
              {[
                { label: "Explore 3 career worlds", done: true },
                { label: "Complete Build interests", done: true },
                { label: "Try a career simulation", active: true },
                { label: "Message a real professional" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2.5 border-b py-2.5 text-[13px] font-semibold" style={{ borderColor: "var(--border)", color: row.done || row.active ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  <span
                    className="h-4 w-4 flex-none rounded-full border-2"
                    style={
                      row.done
                        ? { background: "#3ddc84", borderColor: "#3ddc84" }
                        : row.active
                          ? { background: "var(--primary)", borderColor: "var(--primary)", boxShadow: "0 0 0 4px rgba(47,107,242,.25)" }
                          : { borderColor: "var(--border)" }
                    }
                  />
                  {row.label}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3.5 text-center text-[10px] font-semibold tracking-[0.06em] uppercase opacity-60" style={{ color: "var(--muted-foreground)" }}>
            [illustrative preview, not a Figma-sourced screen]
          </div>
        </div>
        <div className="mx-auto mt-9 grid max-w-[1200px] grid-cols-1 gap-[18px] min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
          {FEAT_STUDENTS.map((f) => (
            <FeatCard key={f.title} {...f} />
          ))}
        </div>
        <div className="mx-auto max-w-[1200px]">
          <a href="#" className="mt-[22px] inline-flex items-center gap-[5px] text-[14px] font-semibold" style={{ color: "var(--foreground)", opacity: 0.75 }}>
            Explore the student experience<ArrowRight size={14} strokeWidth={2.75} aria-hidden />
          </a>
        </div>
      </section>

      <section className="px-6 py-8 sm:py-10 lg:py-14">
        <SectionHead eyebrow="For counselors" title="Everything counselors need." body="Track every student's college and career readiness from one dashboard." />
        <div className="mx-auto max-w-[1200px] rounded-[20px] border px-7 py-6" style={{ background: "linear-gradient(135deg, rgba(47,107,242,.09), rgba(229,72,77,.05))", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5 border-b pb-4" style={{ borderColor: "var(--border)" }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-3.5 rounded-md px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.06em] uppercase" style={{ background: "var(--glass-surface-1)", color: "var(--muted-foreground)" }}>
              app.dreamari.com/counselor
            </span>
          </div>
          <div className="mt-[22px] grid grid-cols-[60px_1fr] gap-[22px] max-[600px]:grid-cols-1">
            <div className="flex flex-col gap-2.5 max-[600px]:flex-row">
              {[true, false, false, false].map((active, i) => (
                <div
                  key={i}
                  className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border"
                  style={active ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" } : { background: "var(--glass-surface-1)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                />
              ))}
            </div>
            <div>
              <div className="mb-[18px] flex flex-wrap gap-3.5">
                {[
                  { v: "312", l: "Students on track" },
                  { v: "87%", l: "Career readiness" },
                  { v: "1,204", l: "Simulations completed" },
                ].map((kpi) => (
                  <div key={kpi.l} className="min-w-[120px] flex-1 rounded-xl border px-4 py-3.5" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}>
                    <div className="font-display text-[22px] font-extrabold" style={{ color: "var(--foreground)" }}>
                      {kpi.v}
                    </div>
                    <div className="mt-0.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      {kpi.l}
                    </div>
                  </div>
                ))}
              </div>
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="h-[100px] w-full">
                {[42, 58, 30, 50, 20, 44, 12, 46, 34, 28].map((y, i) => (
                  <rect key={i} x={i * 38} y={y} width="26" height={100 - y} rx="4" fill="var(--primary-tint)" opacity={0.7 + (i % 3) * 0.1} />
                ))}
              </svg>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-9 grid max-w-[1200px] grid-cols-1 gap-[18px] min-[601px]:grid-cols-2 min-[901px]:grid-cols-3">
          {FEAT_COUNSELORS.map((f) => (
            <FeatCard key={f.title} {...f} />
          ))}
        </div>
        <div className="mx-auto max-w-[1200px]">
          <a href="#" className="mt-[22px] inline-flex items-center gap-[5px] text-[14px] font-semibold" style={{ color: "var(--foreground)", opacity: 0.75 }}>
            Explore the counselor dashboard<ArrowRight size={14} strokeWidth={2.75} aria-hidden />
          </a>
        </div>
      </section>

      <section className="px-6 py-8 sm:py-10 lg:py-14" style={{ background: "var(--card)" }}>
        <SectionHead eyebrow="Outcomes" title="Measure what matters." body="Monitor the outcomes that matter most to your organization." />
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3.5 min-[801px]:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m} className="flex items-center gap-3 rounded-xl border px-4 py-3.5 text-[13px] font-semibold" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)", color: "var(--foreground)" }}>
              <span className="h-8 w-8 flex-none rounded-[9px]" style={{ background: "var(--primary)" }} />
              {m}
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[1200px]">
          <a href="#" className="mt-[22px] inline-flex items-center gap-[5px] text-[14px] font-semibold" style={{ color: "var(--foreground)", opacity: 0.75 }}>
            Explore reporting<ArrowRight size={14} strokeWidth={2.75} aria-hidden />
          </a>
        </div>
      </section>

      <section className="px-6 py-8 sm:py-10 lg:py-14">
        <SectionHead eyebrow="Built to scale" title="Built for your organization." body="Whether you're supporting hundreds or thousands of students, Dreamari scales with your organization." />
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 min-[901px]:grid-cols-4">
          {ORGS.map((org) => (
            <div key={org.title} className="rounded-xl border p-5" style={{ background: "var(--glass-surface-1)", borderColor: "var(--border)" }}>
              <h4 className="mb-1.5 text-[14px] font-bold" style={{ color: "var(--foreground)" }}>
                {org.title}
              </h4>
              <p className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                {org.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-[1200px]">
          <a href="#" className="mt-[22px] inline-flex items-center gap-[5px] text-[14px] font-semibold" style={{ color: "var(--foreground)", opacity: 0.75 }}>
            Learn more about organization solutions<ArrowRight size={14} strokeWidth={2.75} aria-hidden />
          </a>
        </div>
      </section>

      <SchoolsFinalCTA />
    </div>
  );
}
