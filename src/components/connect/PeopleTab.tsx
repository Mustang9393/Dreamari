"use client";

import { useContext, useMemo, useState } from "react";
import { BadgeCheck, ChevronDown } from "lucide-react";
import { PROS, type Pro } from "./data";
import { Avatar, ConnectNav, SectionHead } from "./primitives";
import { FollowButton, rankPros, shortCount, useStudentWorlds, type Follows } from "./ProProfile";

// The People tab (Joshua Pierce, Slack, 6 Sept 2026: Connect has three tabs,
// Communities, Events, People; a place to search companies or careers and
// find people to follow, because the corporate network is the advantage).
// Built from his Replit reference: one search-and-filter panel, then three
// rows of professional cards, Recommended for You, Popular This Week, New
// Professionals. Every person is a verified professional from Connect's own
// data with their real portrait; nothing here ranks students.

const ALL = "all";
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Work email verified by Dreamari · Aug 2026" -> a sortable month index */
function verifiedAt(pro: Pro): number {
  const m = pro.verifiedBy.match(/([A-Z][a-z]{2})\w* (\d{4})/);
  if (!m) return 0;
  return Number(m[2]) * 12 + MONTHS.indexOf(m[1].toLowerCase());
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="relative flex min-h-[44px] min-w-0 flex-1 items-center rounded-[var(--radius-md)] border" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="dm-quiet min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-[36px] pl-[var(--space-4)] text-[14px] leading-[20px] font-semibold outline-none"
        style={{ color: value === ALL ? "var(--muted-foreground)" : "var(--foreground)", fontFamily: "var(--font-body)" }}
      >
        <option value={ALL}>All {label.toLowerCase()}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[12px] h-4 w-4" aria-hidden style={{ color: "var(--muted-foreground)" }} />
    </label>
  );
}

/** One professional: portrait, name with the verified mark, role, company,
 *  then View profile and Follow on one line, and the two public numbers. */
function PersonCard({ pro, following, onFollow }: { pro: Pro; following: boolean; onFollow: () => void }) {
  const nav = useContext(ConnectNav);
  return (
    <li className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      <div className="flex items-start gap-[var(--space-3)]">
        <button type="button" onClick={() => nav?.openPro(pro.id)} aria-label={`Open ${pro.name}'s profile`} className="dm-tap flex flex-none cursor-pointer rounded-full leading-none">
          <Avatar name={pro.name} size={52} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
          {/* three tiers: name, what they do, where */}
          <span className="flex items-center gap-[5px] text-[15px] leading-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            <span className="truncate">{pro.name}</span>
            <BadgeCheck className="h-[15px] w-[15px] flex-none" aria-label="Verified professional" style={{ color: "var(--accent-subtle)" }} />
          </span>
          <span className="truncate text-[13px] leading-[17px]" title={pro.role} style={{ color: "color-mix(in srgb, var(--foreground) 80%, transparent)" }}>{pro.role}</span>
          <span className="truncate text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.org}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link cursor-pointer text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>View profile</button>
        <FollowButton compact following={following} onToggle={onFollow} />
      </div>
      <span className="text-[12px] leading-[16px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
        {shortCount(pro.studentsReached)} students reached · {shortCount(pro.followers)} followers
      </span>
    </li>
  );
}

function Row({ title, aside, pros, follows, onFollow }: { title: string; aside?: string; pros: Pro[]; follows: Follows; onFollow: (id: string) => void }) {
  if (pros.length === 0) return null;
  return (
    <section className="flex flex-col gap-[var(--space-3)]" aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
        <SectionHead>{title}</SectionHead>
        {aside && <span className="text-[13px] leading-[18px]" style={{ color: "var(--muted-foreground)" }}>{aside}</span>}
      </div>
      <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-4">
        {pros.map((pro) => <PersonCard key={pro.id} pro={pro} following={!!follows[pro.id]} onFollow={() => onFollow(pro.id)} />)}
      </ul>
    </section>
  );
}

export function PeopleTab({ follows, onFollow, query }: { follows: Follows; onFollow: (id: string) => void; query: string }) {
  const worlds = useStudentWorlds();
  const [career, setCareer] = useState(ALL);
  const [industry, setIndustry] = useState(ALL);
  const [company, setCompany] = useState(ALL);

  const careers = useMemo(() => [...new Set(PROS.map((p) => p.field))].sort(), []);
  const industries = useMemo(() => [...new Set(PROS.map((p) => p.world))].sort(), []);
  const companies = useMemo(() => [...new Set(PROS.map((p) => p.org))].sort(), []);

  const q = query.trim().toLowerCase();
  const filtering = !!q || career !== ALL || industry !== ALL || company !== ALL;
  const matches = useMemo(() => {
    const hit = (p: Pro) => !q || [p.name, p.role, p.org, p.field, p.world, ...(p.topics ?? [])].some((v) => v.toLowerCase().includes(q));
    return PROS.filter((p) => hit(p) && (career === ALL || p.field === career) && (industry === ALL || p.world === industry) && (company === ALL || p.org === company));
  }, [q, career, industry, company]);

  // the three rows, the way the reference has them: relevance to the
  // student's own worlds, then reach this week, then the newest verifications
  const recommended = useMemo(() => rankPros(PROS, worlds).slice(0, 4), [worlds]);
  const popular = useMemo(() => [...PROS].sort((a, b) => b.followers - a.followers).slice(0, 4), []);
  const fresh = useMemo(() => [...PROS].sort((a, b) => verifiedAt(b) - verifiedAt(a)).slice(0, 4), []);

  return (
    <>
      {/* Filters sit under the shared search box: career, industry, company.
         On phones they stack; from 640px they share one row. */}
      <div className="flex flex-col gap-[var(--space-3)] sm:flex-row" aria-label="Filter professionals">
        <Select label="Careers" value={career} options={careers} onChange={setCareer} />
        <Select label="Industries" value={industry} options={industries} onChange={setIndustry} />
        <Select label="Companies" value={company} options={companies} onChange={setCompany} />
      </div>

      {filtering ? (
        <>
          <Row title={`${matches.length} ${matches.length === 1 ? "professional" : "professionals"}`} pros={matches} follows={follows} onFollow={onFollow} />
          {matches.length === 0 && <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>No professional matches that yet. Try a wider filter.</p>}
        </>
      ) : (
        <>
          <Row title="Recommended for You" aside="Based on your career interests" pros={recommended} follows={follows} onFollow={onFollow} />
          <Row title="Popular This Week" aside="Students are learning from them" pros={popular} follows={follows} onFollow={onFollow} />
          <Row title="New Professionals" aside="Recently verified" pros={fresh} follows={follows} onFollow={onFollow} />
        </>
      )}
    </>
  );
}
