"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, ChevronRight, Sparkles, type LucideIcon, Landmark, Code2, Stethoscope, Palette, FlaskConical, GraduationCap, HardHat, Scale, UtensilsCrossed, Leaf, HeartHandshake, Plane, Factory, Wrench, Scissors } from "lucide-react";
import { WORLD_COLORS } from "@/components/app/worlds";
import { DECK } from "@/components/match-lab/data";
import { readPicks } from "@/lib/picks";
import { PROS, type Pro } from "./data";
import { Avatar, ConnectNav, SectionHead } from "./primitives";
import { FollowButton, NewFromFollowing, answersBy, rankPros, shortCount, useStudentWorlds, type Follows } from "./ProProfile";

// The People tab, built from Joshua's reference (Slack, 6 and 7 Sept 2026):
// two views, For you and Browse industries. For you: Find a professional
// (the student's own careers as chips, a way into every industry), For you
// today (one verified professional per Top 3 career, each with a question
// they answered), Browse by industry (every world with its professional
// count; tap one to browse its profiles), then New from people you follow.
// Browse industries: choose an industry to meet people who actually do the
// work. Everything is drawn from Connect's own verified professionals; nothing
// here ranks students.

const WORLD_ICON: Record<string, LucideIcon> = {
  "Business & Money": Landmark,
  "Tech & Engineering": Code2,
  "Health & Medicine": Stethoscope,
  "Arts, Media & Sport": Palette,
  "Science & Research": FlaskConical,
  "Teaching & Education": GraduationCap,
  "Building & Construction": HardHat,
  "Law, Safety & Justice": Scale,
  "Food & Cooking": UtensilsCrossed,
  "Farming, Animals & Nature": Leaf,
  "Counseling & Social Work": HeartHandshake,
  "Driving, Flying & Shipping": Plane,
  "Factories & Making Things": Factory,
  "Fixing Machines & Engines": Wrench,
  "Personal Care & Community Services": Scissors,
};
const WORLDS = Object.keys(WORLD_COLORS);

type View = "for-you" | "browse";

/** The student's Top 3 career titles, in order, from their saved picks. */
function useStudentCareers(): { title: string; world: string }[] {
  const [careers, setCareers] = useState<{ title: string; world: string }[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const ids = readPicks().ids;
      setCareers(ids.map((id) => DECK.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c)).map((c) => ({ title: c.title, world: c.world })));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return careers;
}

function Segmented({ view, onView }: { view: View; onView: (view: View) => void }) {
  const items: { key: View; label: string }[] = [{ key: "for-you", label: "For you" }, { key: "browse", label: "Browse industries" }];
  return (
    <div role="tablist" aria-label="People views" className="flex w-fit gap-[2px] rounded-[var(--radius-md)] border p-[3px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      {items.map((item) => {
        const on = item.key === view;
        return (
          <button key={item.key} type="button" role="tab" aria-selected={on} onClick={() => onView(item.key)} className="dm-quiet flex min-h-[34px] cursor-pointer items-center rounded-[var(--radius-sm)] px-[14px] text-[12.5px] leading-[16px] font-bold tracking-[0.04em] uppercase" style={on ? { background: "var(--primary)", color: "#FFFFFF" } : { color: "var(--muted-foreground)" }}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function WorldTile({ world, count, unit, onOpen }: { world: string; count: number; unit: string; onOpen: () => void }) {
  const Icon = WORLD_ICON[world] ?? Sparkles;
  const accent = WORLD_COLORS[world] ?? "var(--primary)";
  return (
    <li>
      <button type="button" onClick={onOpen} className="dm-quiet flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)] text-left" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 14%, var(--glass-surface-1)), var(--glass-surface-1))`, borderColor: "var(--glass-border)" }}>
        <span aria-hidden className="flex size-[40px] flex-none items-center justify-center rounded-[var(--radius-sm)]" style={{ background: accent, color: "#05070f" }}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="truncate text-[15px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{world}</span>
          <span className="text-[12.5px] leading-[17px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{count === 0 ? "Coming soon" : `${count} ${count === 1 ? unit : `${unit}s`}`}</span>
        </span>
        <ChevronRight className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
      </button>
    </li>
  );
}

/** One professional: portrait, name with the verified mark, role, company,
 *  View profile and Follow, the two public numbers. */
function PersonCard({ pro, following, onFollow, badge, quote }: { pro: Pro; following: boolean; onFollow: () => void; badge?: string; quote?: string }) {
  const nav = useContext(ConnectNav);
  return (
    <li className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      {badge && (
        <span className="flex w-fit items-center gap-[5px] rounded-full px-[10px] py-[3px] text-[11px] leading-[15px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 18%, transparent)", color: "var(--accent-subtle)" }}>
          <Sparkles className="h-3 w-3" aria-hidden /> {badge}
        </span>
      )}
      <div className="flex items-start gap-[var(--space-3)]">
        <button type="button" onClick={() => nav?.openPro(pro.id)} aria-label={`Open ${pro.name}'s profile`} className="dm-tap flex flex-none cursor-pointer rounded-full leading-none">
          <Avatar name={pro.name} size={52} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-[1px]">
          <span className="flex items-center gap-[5px] text-[15px] leading-[19px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            <span className="truncate">{pro.name}</span>
            <BadgeCheck className="h-[15px] w-[15px] flex-none" aria-label="Verified professional" style={{ color: "var(--accent-subtle)" }} />
          </span>
          <span className="truncate text-[13px] leading-[17px]" title={pro.role} style={{ color: "color-mix(in srgb, var(--foreground) 80%, transparent)" }}>{pro.role}</span>
          <span className="truncate text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>{pro.org}</span>
        </div>
      </div>
      {quote && (
        <p className="rounded-[var(--radius-md)] px-[var(--space-3)] py-[10px] text-[13.5px] leading-[19px] font-semibold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>&ldquo;{quote}&rdquo;</p>
      )}
      <div className="flex items-center justify-between gap-[var(--space-3)]">
        <button type="button" onClick={() => nav?.openPro(pro.id)} className="dm-link cursor-pointer text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>View profile</button>
        <FollowButton compact following={following} onToggle={onFollow} />
      </div>
      {!quote && (
        <span className="text-[12px] leading-[16px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          {shortCount(pro.studentsReached)} students reached · {shortCount(pro.followers)} followers
        </span>
      )}
    </li>
  );
}

function Grid({ pros, follows, onFollow }: { pros: Pro[]; follows: Follows; onFollow: (id: string) => void }) {
  return (
    <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
      {pros.map((pro) => <PersonCard key={pro.id} pro={pro} following={!!follows[pro.id]} onFollow={() => onFollow(pro.id)} />)}
    </ul>
  );
}

const ordinal = (n: number) => `#${n}`;

export function PeopleTab({ follows, onFollow, query }: { follows: Follows; onFollow: (id: string) => void; query: string }) {
  const worlds = useStudentWorlds();
  const careers = useStudentCareers();
  const [view, setView] = useState<View>("for-you");
  const [industry, setIndustry] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => PROS.filter((p) => !q || [p.name, p.role, p.org, p.field, p.world, ...(p.topics ?? [])].some((v) => v.toLowerCase().includes(q))), [q]);
  const countIn = (world: string) => PROS.filter((p) => p.world === world).length;
  const pathsIn = (world: string) => new Set(DECK.filter((c) => c.world === world).map((c) => c.title)).size || new Set(PROS.filter((p) => p.world === world).map((p) => p.field)).size;

  // For you today: the top-ranked professional in each of the Top 3 worlds,
  // no repeats, filled from the overall ranking when a world has nobody yet
  const today = useMemo(() => {
    const ranked = rankPros(PROS, worlds);
    const picked: { pro: Pro; badge: string }[] = [];
    careers.slice(0, 3).forEach((career, index) => {
      const pro = ranked.find((p) => p.world === career.world && !picked.some((x) => x.pro.id === p.id));
      if (pro) picked.push({ pro, badge: `Matches your ${ordinal(index + 1)} career` });
    });
    for (const pro of ranked) { if (picked.length >= 3) break; if (!picked.some((x) => x.pro.id === pro.id)) picked.push({ pro, badge: "Recommended for you" }); }
    return picked;
  }, [worlds, careers]);

  // a search from the shared box wins over every view
  if (q) {
    return (
      <section className="flex flex-col gap-[var(--space-3)]" aria-label="Search results">
        <SectionHead>{matches.length} {matches.length === 1 ? "professional" : "professionals"}</SectionHead>
        {matches.length > 0 ? <Grid pros={matches} follows={follows} onFollow={onFollow} /> : <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>No professional matches that yet. Try a career, a company or a name.</p>}
      </section>
    );
  }

  // one industry, its people
  if (industry) {
    const people = rankPros(PROS.filter((p) => p.world === industry), worlds);
    return (
      <section className="flex flex-col gap-[var(--space-4)]" aria-label={industry}>
        <button type="button" onClick={() => setIndustry(null)} className="dm-link flex min-h-[40px] w-fit cursor-pointer items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> All industries
        </button>
        <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-3)]">
          <SectionHead>{industry}</SectionHead>
          <span className="text-[13px] leading-[18px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{people.length} {people.length === 1 ? "professional" : "professionals"}</span>
        </div>
        {people.length > 0 ? <Grid pros={people} follows={follows} onFollow={onFollow} /> : <p className="text-[15px] leading-[22px]" style={{ color: "var(--muted-foreground)" }}>No verified professionals in this world yet. Follow a community to hear when one joins.</p>}
      </section>
    );
  }

  return (
    <>
      <Segmented view={view} onView={setView} />

      {view === "for-you" && (
        <>
          {/* Find a professional: the student's own careers as the first
             filters, and the way into every industry */}
          <section className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }} aria-label="Find a professional">
            <SectionHead>Find a professional</SectionHead>
            {careers.length === 0 && <p className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Save your Top 3 in Match and the people who do those jobs appear here.</p>}
            <div className="flex flex-wrap items-center gap-[8px]">
              {careers.length > 0 && <span className="text-[11px] leading-[15px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your careers</span>}
              {careers.slice(0, 3).map((career) => (
                <button key={career.title} type="button" onClick={() => setIndustry(career.world)} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[5px] text-[13px] leading-[17px] font-semibold" style={{ borderColor: "color-mix(in srgb, var(--primary) 45%, var(--glass-border))", color: "var(--accent-subtle)", background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}>{career.title}</button>
              ))}
              <button type="button" onClick={() => setView("browse")} className="dm-link flex min-h-[28px] cursor-pointer items-center gap-[4px] text-[13px] leading-[17px] font-bold" style={{ color: "var(--foreground)" }}>Explore all industries <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>
            </div>
          </section>

          <section className="flex flex-col gap-[var(--space-3)]" aria-label="For you today">
            <div className="flex flex-col gap-[2px]">
              <SectionHead>For you today</SectionHead>
              <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>{today.length} people selected for your career interests.</span>
            </div>
            <ul className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
              {(() => {
                // each card quotes a different question, even when two people
                // answered the same thread
                const used = new Set<string>();
                return today.map(({ pro, badge }) => {
                  const quote = answersBy(pro.id).map((t) => t.title).find((t) => !used.has(t));
                  if (quote) used.add(quote);
                  return <PersonCard key={pro.id} pro={pro} badge={badge} quote={quote} following={!!follows[pro.id]} onFollow={() => onFollow(pro.id)} />;
                });
              })()}
            </ul>
          </section>

          <section className="flex flex-col gap-[var(--space-3)]" aria-label="Browse by industry">
            <div className="flex flex-wrap items-end justify-between gap-[var(--space-3)]">
              <div className="flex flex-col gap-[2px]">
                <SectionHead>Browse by industry</SectionHead>
                <span className="text-[14px] leading-[20px]" style={{ color: "var(--muted-foreground)" }}>Find people who actually do the work.</span>
              </div>
              <button type="button" onClick={() => setView("browse")} className="dm-link flex min-h-[32px] cursor-pointer items-center gap-[4px] text-[13px] leading-[18px] font-bold" style={{ color: "var(--accent-subtle)" }}>Explore all industries <ChevronRight className="h-3.5 w-3.5" aria-hidden /></button>
            </div>
            <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
              {WORLDS.filter((w) => countIn(w) > 0).map((world) => <WorldTile key={world} world={world} count={countIn(world)} unit="professional" onOpen={() => setIndustry(world)} />)}
            </ul>
          </section>

          <NewFromFollowing follows={follows} />
        </>
      )}

      {view === "browse" && (
        <section className="flex flex-col gap-[var(--space-4)]" aria-label="Browse industries">
          <div className="flex flex-col gap-[4px]">
            <span className="text-[11px] leading-[15px] font-bold tracking-[0.12em] uppercase" style={{ color: "var(--accent-subtle)" }}>Browse by industry</span>
            <h2 className="max-w-[640px] text-[24px] leading-[29px] font-extrabold text-balance sm:text-[28px] sm:leading-[33px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Choose an industry to meet people who actually do the work.</h2>
          </div>
          <ul className="grid grid-cols-1 gap-[var(--space-3)] sm:grid-cols-2 lg:grid-cols-3">
            {WORLDS.map((world) => <WorldTile key={world} world={world} count={pathsIn(world)} unit="career path" onOpen={() => setIndustry(world)} />)}
          </ul>
        </section>
      )}
    </>
  );
}
