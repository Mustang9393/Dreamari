"use client";

// DEMO-ONLY: the Daily Leaderboard mockup (6 Oct 2026), rebuilt to Joshua's
// final direction (Slack, 6 Oct 2026):
//
// "League system. We're simplifying this into 4 semester-leagues based on
// relative rank: Bronze, Silver, Gold, Diamond. About 120 participating
// students, so roughly 30 students per league ... Standings update daily. As
// students earn points and pass others, they can move up or down leagues.
// The goal is for every student to have something visible to compete for,
// rather than only showing a Top 25. Eventually a student should clearly see
// something like: Silver League • #6 of 30 • 180 points to Gold."
//
// UI: "Keep New York vs New Jersey | ASE | Central as 3 equal-width,
// symmetrical tabs across the top ... When NY vs NJ is selected, make the
// rivalry the main section underneath. Simplify the rivalry significantly
// ... identify each side once, show the score, and only keep the
// donut/circle if it genuinely helps. Put My Rank underneath the rivalry,
// not beside it. Then show the leaderboard below My Rank. Remove the
// progress bars beside student points. Reduce metadata in each row ... Use
// NJ and NY instead of school name. Keep the student's own row highlighted
// and give the Top 3 slightly stronger recognition."
//
// Hierarchy, top to bottom: choose the view; see who is winning; see my
// rank; see everyone else. The Replit is the structure; this is the quieter
// version of it. Every name and number comes from data.ts.

import Image from "next/image";
import { motion } from "framer-motion";
import { Crown, Gem, Swords, School as SchoolIcon } from "lucide-react";
import { useState } from "react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { studentPortraitSrc } from "@/lib/avatar";
import { LEAGUES, LEAGUE_SIZE, STANDINGS, YOU, leagueFor, type League, type School, type Standing, type State } from "./data";

type Tab = "regional" | School;
type Ranked = Standing & { rank: number; league: League };

const TABS: { id: Tab; label: string; short: string; icon: typeof Swords }[] = [
  { id: "regional", label: "New York vs New Jersey", short: "NY vs NJ", icon: Swords },
  { id: "ASE", label: "ASE", short: "ASE", icon: SchoolIcon },
  { id: "Central", label: "Central", short: "Central", icon: SchoolIcon },
];

// The two state flags are the colour system (Chandu: "does NY and NJ have any
// kind of flag system we should use?"). New York's flag is the state arms on a
// dark blue field; New Jersey's is the arms on a buff field. The arms are far
// too detailed for 40px, so each state is its field colour: NY blue, NJ buff.
// `field` is the flag; `ink` is the same colour lifted so numbers read on dark.
const FLAG: Record<State, { field: string; shade: string; ink: string; text: string }> = {
  "New York": { field: "#2a52c4", shade: "#152b6e", ink: "#8fb3ff", text: "#ffffff" },
  "New Jersey": { field: "#edc98a", shade: "#b98d3e", ink: "#f1d394", text: "#1b1405" },
};
const STATE_COLOR: Record<State, string> = { "New York": FLAG["New York"].ink, "New Jersey": FLAG["New Jersey"].ink };
const STATE_SHORT: Record<State, string> = { "New York": "NY", "New Jersey": "NJ" };
// The schools' own marks, from asehs.org and nps.k12.nj.us/CTL (both busy, so
// they only appear on the school card, at a size where they read as identity).
const SCHOOL: Record<School, { src: string; ring: string; plate: string }> = {
  ASE: { src: "/images/schools/ase.webp", ring: "#8b1e2b", plate: "#f4efe3" },
  Central: { src: "/images/schools/central.webp", ring: "#0083b9", plate: "#e8e8e3" },
};
const LEAGUE_COLOR: Record<League, string> = {
  Diamond: "#7dd3fc",
  Gold: "var(--color-amber-400)",
  Silver: "var(--color-ink-200)",
  Bronze: "var(--color-amber-650)",
};
const METAL = [LEAGUE_COLOR.Gold, LEAGUE_COLOR.Silver, LEAGUE_COLOR.Bronze];
const EASE = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) => n.toLocaleString("en-US");
const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const PANEL: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.07), 0 24px 50px -30px rgba(0,0,0,0.9)",
};

const ALL: Ranked[] = STANDINGS.map((s, i) => ({ ...s, rank: i + 1, league: leagueFor(i + 1) }));

export function LeaderboardExperience() {
  const [tab, setTab] = useState<Tab>("regional");
  const me = ALL.find((s) => s.name === YOU)!;
  const [league, setLeague] = useState<League>(me.league);
  // The league's thirty, in league order; a school tab narrows it to that school.
  const inLeague = ALL.filter((s) => s.league === league);
  const list = tab === "regional" ? inLeague : inLeague.filter((s) => s.school === tab);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation />
      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[880px] flex-col gap-[16px] px-4 pt-3 pb-[140px] sm:gap-[20px] sm:px-[var(--space-10)] md:pt-8">
        {/* 0. Title: one line of context. */}
        <header className="flex items-center gap-[12px] px-[2px] sm:gap-[14px]">
          <span className="relative h-[44px] w-[44px] flex-none sm:h-[52px] sm:w-[52px]" aria-hidden>
            <Image src="/images/dreamy-expressions/dreamy-celebrate.webp" alt="" fill sizes="52px" className="object-contain" />
          </span>
          <div className="flex min-w-0 flex-col gap-[2px]">
            <h1 className="text-[22px] leading-[1.05] font-black tracking-[-0.01em] sm:text-[28px]" style={DISPLAY}>Daily Leaderboard</h1>
            <p className="text-[12.5px] leading-snug font-semibold sm:text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>Rankings update daily. Points accumulate and never reset.</p>
          </div>
        </header>

        {/* 1. Choose the view: three equal tabs, as in the Replit. */}
        <div role="tablist" aria-label="Leaderboard view" className="grid grid-cols-3 gap-[6px] rounded-[16px] p-[6px] sm:gap-[8px]" style={PANEL}>
          {TABS.map((t) => {
            const on = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                aria-label={t.label}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative flex min-h-[42px] cursor-pointer items-center justify-center gap-[7px] rounded-[11px] px-[8px] text-[12.5px] font-extrabold sm:min-h-[46px] sm:text-[14px]"
                style={{ color: on ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
              >
                {on && <motion.span layoutId="lb-tab" className="absolute inset-0 rounded-[11px]" style={{ background: "var(--primary)", boxShadow: "0 10px 24px -12px var(--primary)" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <Icon className="relative h-[15px] w-[15px] flex-none" aria-hidden />
                <span className="relative truncate">
                  <span className="md:hidden">{t.short}</span>
                  <span className="hidden md:inline">{t.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* 2. Who is winning. */}
        {tab === "regional" ? <Rivalry /> : <SchoolSummary school={tab} />}

        {/* 3. My rank: league, place, and what is in reach. */}
        <MyRank me={me} />

        {/* 4. Everyone else: the league's thirty. */}
        <section className="flex flex-col gap-[12px]" aria-label={`${league} League standings`}>
          <div className="flex flex-wrap items-center justify-between gap-[10px]">
            <h2 className="text-[16px] font-black sm:text-[18px]" style={DISPLAY}>
              {league} League{tab !== "regional" ? ` · ${tab}` : ""}
            </h2>
            <div role="tablist" aria-label="League" className="flex gap-[6px]">
              {LEAGUES.map((l) => {
                const on = l === league;
                return (
                  <button
                    key={l}
                    role="tab"
                    aria-selected={on}
                    type="button"
                    onClick={() => setLeague(l)}
                    className="flex cursor-pointer items-center gap-[5px] rounded-full px-[10px] py-[5px] text-[11.5px] font-extrabold"
                    style={{ background: on ? `color-mix(in srgb, ${LEAGUE_COLOR[l]} 22%, transparent)` : "rgba(255,255,255,0.05)", color: on ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: on ? `inset 0 0 0 1px ${LEAGUE_COLOR[l]}` : "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
                  >
                    <Gem className="h-[12px] w-[12px]" style={{ color: LEAGUE_COLOR[l] }} aria-hidden />
                    {l}
                    {l === me.league && <span className="sr-only">(your league)</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <ol className="flex flex-col gap-[6px]">
            {list.map((s, i) => (
              <Row key={`${league}-${tab}-${s.name}`} s={s} place={s.rank - (LEAGUES.indexOf(league) * LEAGUE_SIZE)} index={i} />
            ))}
          </ol>
          <p className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Ranks 1 to 30 play in Diamond, 31 to 60 in Gold, 61 to 90 in Silver, 91 to 120 in Bronze. Standings update daily, so students move up and down.
          </p>
        </section>
      </main>
      <MobileNav active="" />
    </div>
  );
}

/** New York vs New Jersey, once: each side named once beside its score
 *  (students in Diamond), the leader marked, one slim split bar. */
function Rivalry() {
  const diamond = ALL.filter((s) => s.league === "Diamond");
  const ny = diamond.filter((s) => s.state === "New York").length;
  const nj = diamond.length - ny;
  const nyPct = Math.round((ny / diamond.length) * 100);
  const leader: State = nj > ny ? "New Jersey" : "New York";
  const side = (state: State, count: number, align: "left" | "right") => (
    <div className={`flex items-center gap-[10px] sm:gap-[12px] ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <StateShield state={state} />
      <div className={`flex flex-col ${align === "right" ? "items-end" : "items-start"}`}>
        <span className="text-[36px] leading-none font-black tabular-nums sm:text-[44px]" style={{ ...DISPLAY, color: STATE_COLOR[state] }}>{count}</span>
        <span className="mt-[4px] text-[12px] font-extrabold whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>{state}</span>
        {/* The leader's tag sits under the name so the name never wraps on phones. */}
        {leader === state && <span className="mt-[4px] rounded-[4px] px-[5px] py-[1px] text-[9.5px] font-black tracking-[0.12em]" style={{ background: FLAG[state].field, color: FLAG[state].text }}>LEADS</span>}
      </div>
    </div>
  );
  return (
    <section className="flex flex-col gap-[14px] rounded-[18px] px-[16px] py-[16px] sm:px-[22px] sm:py-[20px]" style={PANEL} aria-label="New York vs New Jersey">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-[8px]">
        {side("New York", ny, "left")}
        <span className="self-center text-[11px] font-black tracking-[0.2em]" style={{ ...DISPLAY, color: "var(--muted-foreground)" }}>VS</span>
        {side("New Jersey", nj, "right")}
      </div>
      <div className="relative h-[8px] overflow-hidden rounded-full" style={{ background: FLAG["New Jersey"].field }} aria-hidden>
        <motion.span className="absolute inset-y-0 left-0" style={{ background: FLAG["New York"].field }} initial={{ width: "50%" }} animate={{ width: `${nyPct}%` }} transition={{ duration: 1, ease: EASE }} />
      </div>
      <p className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Students in Diamond League today.</p>
    </section>
  );
}

/** A school tab: that school's students per league, once. */
function SchoolSummary({ school }: { school: School }) {
  const mine = ALL.filter((s) => s.school === school);
  const state = mine[0]?.state ?? "New York";
  return (
    <section className="flex flex-col gap-[14px] rounded-[18px] px-[16px] py-[16px] sm:px-[22px] sm:py-[20px]" style={PANEL} aria-label={`${school} summary`}>
      <div className="flex items-center gap-[12px]">
        <SchoolMark school={school} />
        <div className="flex flex-col">
          <span className="text-[20px] leading-none font-black sm:text-[24px]" style={DISPLAY}>{school}</span>
          <span className="mt-[4px] text-[12px] font-extrabold" style={{ color: "var(--muted-foreground)" }}>{mine.length} students · {STATE_SHORT[state]}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-[8px]">
        {LEAGUES.map((l) => {
          const n = mine.filter((s) => s.league === l).length;
          return (
            <div key={l} className="flex flex-col items-center gap-[2px] rounded-[12px] py-[10px]" style={{ background: "rgba(255,255,255,0.04)", boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${LEAGUE_COLOR[l]} 35%, transparent)` }}>
              <span className="text-[22px] leading-none font-black tabular-nums" style={{ ...DISPLAY, color: LEAGUE_COLOR[l] }}>{n}</span>
              <span className="text-[10.5px] font-extrabold" style={{ color: "var(--muted-foreground)" }}>{l}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** My rank: "Diamond League • #8 of 30 • 1,000 points clear of Gold". */
function MyRank({ me }: { me: Ranked }) {
  const li = LEAGUES.indexOf(me.league);
  const place = me.rank - li * LEAGUE_SIZE;
  const color = LEAGUE_COLOR[me.league];
  // What is in reach: the points to the league above (its last place), or
  // in the top league the cushion over the first place of the league below.
  const above = li > 0 ? ALL[li * LEAGUE_SIZE - 1] : null;
  const below = ALL[(li + 1) * LEAGUE_SIZE];
  const reach = above
    ? { text: `${fmt(above.points - me.points + 10)} points to ${LEAGUES[li - 1]}`, tone: color }
    : below
      ? { text: `${fmt(me.points - below.points)} points clear of ${LEAGUES[li + 1]}`, tone: "var(--color-feedback-success)" }
      : null;
  return (
    <section className="relative overflow-hidden rounded-[18px] p-[1.5px]" style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 25%, transparent) 60%)` }} aria-label="My rank">
      <div className="relative flex items-center gap-[14px] rounded-[16.5px] px-[16px] py-[14px] sm:gap-[16px] sm:px-[20px] sm:py-[16px]" style={{ background: "linear-gradient(160deg, #141a33, #0b0d16)" }}>
        <span className="flex h-[48px] w-[48px] flex-none items-center justify-center rounded-[14px] sm:h-[56px] sm:w-[56px]" style={{ background: `color-mix(in srgb, ${color} 20%, transparent)`, boxShadow: `inset 0 0 0 1px ${color}` }} aria-hidden>
          <Gem className="h-[24px] w-[24px] sm:h-[28px] sm:w-[28px]" style={{ color }} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
          <span className="text-[10.5px] font-black tracking-[0.16em] uppercase" style={{ color }}>My rank</span>
          {/* One line on wide screens, Joshua's exact shape; on phones the
              reach drops to its own line and the dots go away. */}
          <span className="flex flex-col text-[17px] leading-[1.25] font-black md:flex-row md:flex-wrap md:items-center md:gap-x-[8px] md:text-[18px] md:whitespace-nowrap" style={DISPLAY}>
            <span>
              {me.league} League <span aria-hidden className="mx-[4px]" style={{ color: "var(--muted-foreground)" }}>•</span> #{place} of {LEAGUE_SIZE}
            </span>
            {reach && (
              <span style={{ color: reach.tone }}>
                <span aria-hidden className="mr-[8px] hidden md:inline" style={{ color: "var(--muted-foreground)" }}>•</span>
                {reach.text}
              </span>
            )}
          </span>
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
            {me.name} · {STATE_SHORT[me.state]} · <span className="tabular-nums" style={{ color: "var(--foreground)" }}>{fmt(me.points)}</span> points
          </span>
        </div>
      </div>
    </section>
  );
}

/** A state's shield in its flag colour: a heater shield with a lit top, a
 *  fine inner line, and the state's letters set on the shield's optical
 *  centre (Chandu: "Shields are fine. But better designed somehow"). */
function StateShield({ state }: { state: State }) {
  const f = FLAG[state];
  const id = `shield-${STATE_SHORT[state]}`;
  return (
    <svg viewBox="0 0 64 72" className="h-[46px] w-[41px] flex-none sm:h-[54px] sm:w-[48px]" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={f.field} stopOpacity="1" />
          <stop offset="1" stopColor={f.shade} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={SHIELD} />
        </clipPath>
      </defs>
      <path d={SHIELD} fill={`url(#${id})`} />
      {/* light across the top */}
      <path d="M0 0 H64 V22 Q32 30 0 22 Z" fill="rgba(255,255,255,0.14)" clipPath={`url(#${id}-clip)`} />
      <path d={SHIELD} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinejoin="round" />
      <path d={SHIELD} fill="none" stroke={f.text} strokeOpacity="0.35" strokeWidth="1.25" strokeLinejoin="round" transform="translate(32 36) scale(0.84) translate(-32 -36)" />
      <text x="32" y="43" textAnchor="middle" fontSize="21" fontWeight="900" letterSpacing="0.5" fill={f.text} style={DISPLAY}>{STATE_SHORT[state]}</text>
    </svg>
  );
}
const SHIELD = "M32 3 L59 10 L59 33 C59 51 47 63 32 70 C17 63 5 51 5 33 L5 10 Z";

/** A school's own mark on a round plate, ringed in the school's colour. */
function SchoolMark({ school }: { school: School }) {
  const m = SCHOOL[school];
  return (
    <span className="relative flex h-[52px] w-[52px] flex-none items-center justify-center overflow-hidden rounded-full sm:h-[56px] sm:w-[56px]" style={{ background: m.plate, boxShadow: `0 0 0 2px ${m.ring}, 0 8px 20px -10px rgba(0,0,0,0.8)` }} aria-hidden>
      <Image src={m.src} alt="" width={56} height={56} className="h-[78%] w-[78%] object-contain" />
    </span>
  );
}

/** One row: place, portrait, name, NY/NJ, points. The top three of the
 *  league wear a medal; you are highlighted. No bars, no school, no grade. */
function Row({ s, place, index }: { s: Ranked; place: number; index: number }) {
  const you = s.name === YOU;
  const metal = place <= 3 ? METAL[place - 1] : undefined;
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.03, duration: 0.3, ease: EASE }}
      className="grid grid-cols-[36px_auto_1fr_auto] items-center gap-[10px] rounded-[12px] py-[9px] pr-[12px] pl-[8px] sm:grid-cols-[44px_auto_1fr_auto] sm:gap-[12px] sm:py-[10px] sm:pr-[16px] sm:pl-[10px]"
      style={{
        background: you ? "linear-gradient(90deg, color-mix(in srgb, var(--primary) 30%, transparent), color-mix(in srgb, var(--primary) 8%, transparent))" : "rgba(255,255,255,0.035)",
        boxShadow: you ? "inset 0 0 0 1.5px var(--primary)" : metal ? `inset 0 0 0 1px color-mix(in srgb, ${metal} 40%, transparent)` : "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <span className="flex items-center justify-center">
        {metal ? <Medal place={place} metal={metal} /> : <span className="text-[14px] font-black tabular-nums sm:text-[15px]" style={{ ...DISPLAY, color: you ? "var(--foreground)" : "var(--muted-foreground)" }}>{place}</span>}
      </span>
      <Avatar s={s} size={34} ring={you ? "var(--primary)" : metal} />
      <span className="flex min-w-0 items-center gap-[8px]">
        <span className="truncate text-[14px] font-extrabold sm:text-[14.5px]">{s.name}</span>
        {you && <span className="flex-none rounded-[5px] px-[5px] py-[1px] text-[10px] font-black tracking-[0.1em]" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>YOU</span>}
        <span className="flex-none rounded-[5px] px-[6px] py-[1px] text-[10px] font-black" style={{ background: FLAG[s.state].field, color: FLAG[s.state].text }}>{STATE_SHORT[s.state]}</span>
      </span>
      <span className="text-[14px] font-black tabular-nums sm:text-[16px]" style={DISPLAY}>{fmt(s.points)}</span>
    </motion.li>
  );
}

/** The league's top three: a small medal in place of the number, a crown on first. */
function Medal({ place, metal }: { place: number; metal: string }) {
  return (
    <span className="relative flex h-[30px] w-[30px] items-center justify-center" aria-label={`Rank ${place}`}>
      <span className="absolute inset-0 rounded-full" style={{ background: `color-mix(in srgb, ${metal} 80%, #1b1e28)`, boxShadow: `inset 0 0 0 1.5px color-mix(in srgb, ${metal} 70%, white)` }} aria-hidden />
      <span className="relative text-[13px] leading-none font-black tabular-nums" style={{ ...DISPLAY, color: "#0b0d12" }}>{place}</span>
      {place === 1 && <Crown className="absolute -top-[9px] left-1/2 h-[12px] w-[12px] -translate-x-1/2" style={{ color: metal }} fill="currentColor" aria-hidden />}
    </span>
  );
}

/** The student's portrait, or their initials past the 80 portraits we have. */
function Avatar({ s, size, ring }: { s: Standing; size: number; ring?: string }) {
  const initials = s.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <span
      aria-hidden
      className="relative flex flex-none items-center justify-center overflow-hidden rounded-full text-[12px] font-black"
      style={{ width: size, height: size, background: s.avatar ? "#d9dbe0" : `color-mix(in srgb, ${STATE_COLOR[s.state]} 30%, #1b1e28)`, color: "var(--foreground)", boxShadow: ring ? `0 0 0 2px #0b0d12, 0 0 0 4px ${ring}` : "inset 0 0 0 1px rgba(255,255,255,0.12)" }}
    >
      {s.avatar ? <Image src={studentPortraitSrc(s.avatar)} alt="" fill sizes={`${size * 2}px`} className="object-cover object-top" /> : initials}
    </span>
  );
}
