"use client";

// DEMO-ONLY: the Daily Leaderboard mockup (6 Oct 2026). Joshua: "pls make a
// leaderboard mockup... i created a version in replit please replicate this
// vision" (https://dceeai.replit.app/leaderboard/regional); Chandu: "Put it in
// the hamburger menu to access. get creative with the designs", then "it can
// be way better designed. Make it look more like a game and think about
// sports leaderboards or global leaderboards with more visual elements", and
// "the first two tiles... side by side on tablet view too. So the nice graph
// looking things stay above the fold. And... above the fold on mobile too."
//
// Same content as the Replit (title and line, the three tabs, the state
// split of the Top 25, Your Rank, the Top 25 with grade, school and state;
// every name and number from data.ts). Dressed like a game:
// - the tabs are game modes;
// - New York vs New Jersey is a stadium scoreboard: team crests, jumbotron
//   digits, a LEADS tag on the leader, a momentum bar;
// - a school tab is that team's card: crest, roster count, share, its MVP;
// - Your Rank is a player card: rank shield, points, an XP bar to the next
//   place (the points to pass them, derived from the list);
// - everyone is one timing tower: rank tile, state stripe, points bar. The
//   top three wear a medal in place of the rank (gold, silver, bronze), a
//   metal ring on the portrait and a crown on #1, the way Duolingo marks its
//   top three. A separate podium was dropped after team feedback (6 Oct
//   2026): "too much to isolate and show them separately... want the
//   leaderboard to sit together with the others but have some sort of crown
//   or badge... like Duolingo".
// The scoreboard and the player card sit side by side from tablet up, and
// are compact on a phone, so both stay above the fold.

import Image from "next/image";
import { motion } from "framer-motion";
import { Coins, Crown, School as SchoolIcon, Swords } from "lucide-react";
import { useState } from "react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { studentPortraitSrc } from "@/lib/avatar";
import { STANDINGS, YOU, type School, type Standing, type State } from "./data";

type Tab = "regional" | School;
type Ranked = Standing & { rank: number };

const TABS: { id: Tab; label: string; short: string; icon: typeof Swords }[] = [
  { id: "regional", label: "New York vs New Jersey", short: "NY vs NJ", icon: Swords },
  { id: "ASE", label: "ASE", short: "ASE", icon: SchoolIcon },
  { id: "Central", label: "Central", short: "Central", icon: SchoolIcon },
];

const STATE_COLOR: Record<State, string> = { "New York": "var(--color-brand-400)", "New Jersey": "var(--color-amber-400)" };
const STATE_SHORT: Record<State, string> = { "New York": "NY", "New Jersey": "NJ" };
const GOLD = "var(--color-amber-400)";
const SILVER = "var(--color-ink-200)";
const BRONZE = "var(--color-amber-650)";
const METAL = [GOLD, SILVER, BRONZE];
const EASE = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) => n.toLocaleString("en-US");
const DISPLAY = { fontFamily: "var(--font-display)" } as const;
const PANEL: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.07), 0 24px 50px -30px rgba(0,0,0,0.9)",
};
const DARK = "linear-gradient(180deg, rgba(10,12,18,0.88), rgba(16,18,26,0.88))";

export function LeaderboardExperience() {
  const [tab, setTab] = useState<Tab>("regional");
  const all: Ranked[] = STANDINGS.map((s, i) => ({ ...s, rank: i + 1 }));
  const list: Ranked[] = tab === "regional" ? all : STANDINGS.filter((s) => s.school === tab).map((s, i) => ({ ...s, rank: i + 1 }));
  const inList = list.some((s) => s.name === YOU);
  const scopeList = inList ? list : all;
  const me = scopeList.find((s) => s.name === YOU)!;
  const top = list[0]?.points ?? 1;

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation />
      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1080px] flex-col gap-[14px] px-4 pt-2 pb-[140px] sm:gap-[20px] sm:px-[var(--space-10)] md:pt-8">
        {/* Arena header: Dreamy and the title under a stadium glow */}
        <header className="relative flex items-center gap-[12px] overflow-hidden rounded-[18px] px-[12px] py-[10px] sm:gap-[16px] sm:rounded-[22px] sm:px-[26px] sm:py-[22px]" style={{ ...PANEL, background: "radial-gradient(120% 140% at 15% 0%, color-mix(in srgb, var(--primary) 34%, transparent), transparent 60%), radial-gradient(90% 120% at 100% 100%, color-mix(in srgb, var(--color-amber-400) 16%, transparent), transparent 55%), rgba(255,255,255,0.03)" }}>
          <StadiumLights />
          <motion.span initial={{ y: 10, opacity: 0, rotate: -8 }} animate={{ y: [0, -4, 0], opacity: 1, rotate: 0 }} transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", stiffness: 240, damping: 16 } }} className="relative h-[46px] w-[46px] flex-none sm:h-[84px] sm:w-[84px]">
            <Image src="/images/dreamy-expressions/dreamy-celebrate.webp" alt="" fill sizes="84px" className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
          </motion.span>
          <div className="relative flex min-w-0 flex-col gap-[3px] sm:gap-[6px]">
            <h1 className="text-[22px] leading-[1] font-black tracking-[-0.01em] uppercase sm:text-[42px]" style={{ ...DISPLAY, textShadow: "0 0 24px color-mix(in srgb, var(--primary) 55%, transparent)" }}>
              Daily Leaderboard
            </h1>
            <p className="text-[12px] leading-snug font-semibold sm:text-[15px]" style={{ color: "color-mix(in srgb, var(--foreground) 72%, transparent)" }}>Rankings update daily. Points accumulate and never reset.</p>
          </div>
        </header>

        {/* Game modes */}
        <div role="tablist" aria-label="Leaderboard" className="grid grid-cols-3 gap-[6px] sm:flex sm:w-fit sm:gap-[8px]">
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
                className="relative flex cursor-pointer items-center justify-center gap-[6px] overflow-hidden rounded-[12px] px-[10px] py-[9px] text-[12px] font-extrabold tracking-[0.04em] uppercase sm:rounded-[14px] sm:px-[18px] sm:py-[11px] sm:text-[13.5px]"
                style={{
                  ...PANEL,
                  color: on ? "var(--foreground)" : "var(--muted-foreground)",
                  boxShadow: on ? "inset 0 0 0 2px var(--primary), 0 0 24px -6px var(--primary)" : PANEL.boxShadow,
                }}
              >
                {on && <motion.span layoutId="lb-mode" className="absolute inset-0" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--primary) 32%, transparent), color-mix(in srgb, var(--primary) 8%, transparent))" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <Icon className="relative h-4 w-4 flex-none" aria-hidden />
                <span className="relative truncate">
                  <span className="md:hidden">{t.short}</span>
                  <span className="hidden md:inline">{t.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Matchup or team card, and the player card: side by side from
            tablet up, compact and stacked on a phone, all above the fold. */}
        <section className="grid grid-cols-1 gap-[10px] sm:gap-[14px] md:grid-cols-2 lg:grid-cols-[1.4fr_1fr]">
          {tab === "regional" ? <Scoreboard key="sb" /> : <TeamCard key={tab} school={tab} list={list} />}
          <PlayerCard me={me} list={scopeList} scope={inList && tab !== "regional" ? tab : "regional"} />
        </section>

        {/* The tower: everyone in one list, medals on the top three */}
        <section className="flex flex-col gap-[12px] sm:gap-[16px]" aria-label={tab === "regional" ? "Top 25" : `${tab} rankings`}>
          <h2 className="text-[18px] font-black tracking-[0.02em] uppercase sm:text-[24px]" style={DISPLAY}>
            {tab === "regional" ? "Top 25" : `${tab} in the Top 25`}
          </h2>
          <ol className="flex flex-col gap-[6px]">
            {list.map((s, i) => (
              <TowerRow key={`${tab}-${s.name}`} s={s} top={top} index={i} />
            ))}
          </ol>
        </section>
      </main>
      <MobileNav active="" />
    </div>
  );
}

/** Two soft stadium light beams sweeping behind the header. */
function StadiumLights() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute -top-[40%] h-[180%] w-[120px]"
          style={{ left: i ? "70%" : "35%", background: "linear-gradient(180deg, rgba(255,255,255,0.14), transparent 70%)", filter: "blur(6px)", transformOrigin: "50% 0%" }}
          animate={{ rotate: i ? [18, 6, 18] : [-16, -4, -16] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

/** A team crest: a shield in the team colour with its short name. */
function Crest({ label, color, className }: { label: string; color: string; className?: string }) {
  const id = `crest-${label.replace(/\W/g, "")}`;
  return (
    <svg viewBox="0 0 64 72" className={`flex-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${className ?? "h-[54px] w-[48px]"}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${color} 85%, white)` }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${color} 55%, black)` }} />
        </linearGradient>
      </defs>
      <path d="M32 2 L60 12 L58 40 C56 54 44 64 32 70 C20 64 8 54 6 40 L4 12 Z" fill={`url(#${id})`} stroke="rgba(255,255,255,0.55)" strokeWidth="2" />
      <path d="M32 9 L53 16.5 L51.5 39 C50 50 41 58 32 63 C23 58 14 50 12.5 39 L11 16.5 Z" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
      <text x="32" y={label.length > 2 ? 44 : 46} textAnchor="middle" fontSize={label.length > 3 ? 13 : label.length > 2 ? 17 : 22} fontWeight="900" fill="#0b0d12" style={{ fontFamily: "var(--font-display)" }}>{label}</text>
    </svg>
  );
}

/** Jumbotron digits: each digit in its own dark lit cell. */
function Jumbo({ value, color }: { value: number; color: string }) {
  return (
    <span className="flex gap-[3px] sm:gap-[4px]" aria-label={String(value)}>
      {String(value).split("").map((d, i) => (
        <motion.span
          key={i}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.12, duration: 0.45, ease: EASE }}
          className="flex h-[46px] w-[34px] items-center justify-center rounded-[7px] text-[34px] leading-none font-black tabular-nums sm:h-[66px] sm:w-[48px] sm:text-[50px]"
          style={{ ...DISPLAY, color, background: "linear-gradient(180deg, #0c0e13, #05060a)", boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -18px 24px -18px ${color}`, textShadow: `0 0 18px ${color}` }}
          aria-hidden
        >
          {d}
        </motion.span>
      ))}
    </span>
  );
}

/** New York vs New Jersey: the stadium scoreboard. */
function Scoreboard() {
  const ny = STANDINGS.filter((s) => s.state === "New York").length;
  const nj = STANDINGS.filter((s) => s.state === "New Jersey").length;
  const nyPct = Math.round((ny / STANDINGS.length) * 100);
  const leader: State = nj > ny ? "New Jersey" : "New York";
  const side = (state: State, count: number, label: string, align: "left" | "right") => (
    <div className={`flex min-w-0 flex-col gap-[6px] sm:gap-[10px] ${align === "right" ? "items-end text-right" : "items-start"}`}>
      <div className={`flex items-center gap-[8px] ${align === "right" ? "flex-row-reverse" : ""}`}>
        <Crest label={STATE_SHORT[state]} color={STATE_COLOR[state]} className="h-[38px] w-[34px] sm:h-[52px] sm:w-[46px]" />
        <div className={`flex flex-col ${align === "right" ? "items-end" : ""}`}>
          <span className="text-[12.5px] font-black uppercase sm:text-[15px]" style={DISPLAY}>{state}</span>
          {leader === state && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: "spring", stiffness: 400, damping: 14 }} className="mt-[2px] w-fit rounded-[5px] px-[6px] py-[1px] text-[9.5px] font-black tracking-[0.12em]" style={{ background: STATE_COLOR[state], color: "#0b0d12" }}>
              LEADS
            </motion.span>
          )}
        </div>
      </div>
      <Jumbo value={count} color={STATE_COLOR[state]} />
      <span className="text-[11px] leading-tight font-bold sm:text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
  return (
    <div className="relative flex flex-col gap-[12px] overflow-hidden rounded-[18px] p-[12px] sm:gap-[16px] sm:rounded-[20px] sm:p-[20px]" style={{ ...PANEL, background: DARK }}>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${STATE_COLOR["New York"]}, transparent 45%, transparent 55%, ${STATE_COLOR["New Jersey"]})` }} />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-[6px]">
        {side("New York", ny, "New Yorkers in Top 25", "left")}
        <span className="flex flex-col items-center">
          <span className="text-[12px] font-black tracking-[0.18em]" style={{ ...DISPLAY, color: "var(--muted-foreground)" }}>VS</span>
        </span>
        {side("New Jersey", nj, "New Jerseyans in Top 25", "right")}
      </div>
      <div className="flex flex-col gap-[5px]">
        <div className="relative h-[12px] overflow-hidden rounded-full sm:h-[16px]" style={{ background: STATE_COLOR["New Jersey"], boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35)" }}>
          <motion.span className="absolute inset-y-0 left-0" style={{ background: STATE_COLOR["New York"] }} initial={{ width: "50%" }} animate={{ width: `${nyPct}%` }} transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}>
            <motion.span aria-hidden className="absolute top-1/2 right-0 h-[24px] w-[5px] -translate-y-1/2 translate-x-1/2 rounded-full" style={{ background: "white", boxShadow: "0 0 14px 4px rgba(255,255,255,0.7)" }} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.4, repeat: Infinity }} />
          </motion.span>
        </div>
        <div className="flex justify-between text-[11.5px] font-extrabold sm:text-[12.5px]">
          <span style={{ color: STATE_COLOR["New York"] }}>New York {nyPct}%</span>
          <span style={{ color: STATE_COLOR["New Jersey"] }}>New Jersey {100 - nyPct}%</span>
        </div>
      </div>
    </div>
  );
}

/** A school tab: that team's card. */
function TeamCard({ school, list }: { school: School; list: Ranked[] }) {
  const share = Math.round((list.length / STANDINGS.length) * 100);
  const mvp = list[0];
  const mvpOverall = mvp ? STANDINGS.findIndex((s) => s.name === mvp.name) + 1 : 0;
  return (
    <div className="relative flex flex-col gap-[12px] overflow-hidden rounded-[18px] p-[12px] sm:gap-[16px] sm:rounded-[20px] sm:p-[20px]" style={{ ...PANEL, background: `radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--primary) 26%, transparent), transparent 60%), ${DARK}` }}>
      <div className="flex items-center gap-[12px]">
        <Crest label={school.toUpperCase()} color="var(--primary)" className="h-[46px] w-[41px] sm:h-[60px] sm:w-[53px]" />
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className="text-[20px] font-black uppercase sm:text-[24px]" style={DISPLAY}>{school}</span>
          <span className="text-[11.5px] font-bold sm:text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{school} students in Top 25</span>
        </div>
        <span className="ml-auto"><Jumbo value={list.length} color="var(--color-brand-300)" /></span>
      </div>
      <div className="flex flex-col gap-[5px]">
        <div className="relative h-[10px] overflow-hidden rounded-full sm:h-[12px]" style={{ background: "rgba(255,255,255,0.08)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.35)" }}>
          <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg, var(--color-brand-500), var(--color-brand-300))" }} initial={{ width: 0 }} animate={{ width: `${share}%` }} transition={{ duration: 1, ease: EASE, delay: 0.2 }} />
        </div>
        <span className="text-[11.5px] font-extrabold sm:text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{share}% of the Top 25</span>
      </div>
      {mvp && (
        <div className="flex items-center gap-[10px] rounded-[12px] px-[10px] py-[7px]" style={{ background: "rgba(255,255,255,0.05)" }}>
          <span className="rounded-[5px] px-[6px] py-[2px] text-[10px] font-black tracking-[0.14em]" style={{ background: GOLD, color: "#0b0d12" }}>MVP</span>
          <Avatar s={mvp} size={28} metal={GOLD} />
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-extrabold">{mvp.name}</span>
          <span className="text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>#{mvpOverall} overall</span>
        </div>
      )}
    </div>
  );
}

/** Your rank as a player card: shield, points, XP bar to the next place. */
function PlayerCard({ me, list, scope }: { me: Ranked; list: Ranked[]; scope: "regional" | School }) {
  const ahead = list[me.rank - 2];
  const gap = ahead ? ahead.points - me.points : 0;
  const progress = ahead ? me.points / ahead.points : 1;
  return (
    <div className="relative overflow-hidden rounded-[18px] p-[2px] sm:rounded-[20px]" style={{ background: "linear-gradient(140deg, var(--color-brand-300), var(--primary) 40%, var(--color-accent-purple) 75%, var(--color-amber-400))" }}>
      <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 45%, transparent 60%)" }} initial={{ x: "-100%" }} animate={{ x: "120%" }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }} />
      <div className="relative flex h-full flex-col justify-between gap-[10px] rounded-[16px] p-[12px] sm:gap-[14px] sm:rounded-[18px] sm:p-[18px]" style={{ background: "linear-gradient(160deg, #141a33, #0b0d16 70%)" }}>
        <div className="flex items-center gap-[12px]">
          <RankShield rank={me.rank} />
          <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
            <span className="text-[10.5px] font-black tracking-[0.16em] uppercase" style={{ color: "var(--color-brand-300)" }}>Your rank{scope !== "regional" ? ` at ${scope}` : ""}</span>
            <span className="truncate text-[16px] font-black sm:text-[18px]" style={DISPLAY}>{me.name}</span>
            <span className="truncate text-[11.5px] font-semibold sm:text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>{me.school} · {me.state}</span>
          </div>
          <div className="flex flex-col items-end gap-[1px]">
            <span className="flex items-center gap-[5px] text-[18px] font-black tabular-nums sm:text-[22px]" style={DISPLAY}>
              <Coins className="h-[16px] w-[16px]" style={{ color: GOLD }} aria-hidden />
              {fmt(me.points)}
            </span>
            <span className="text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>total points</span>
          </div>
        </div>
        {ahead && (
          <div className="flex flex-col gap-[5px]">
            <div className="relative h-[9px] overflow-hidden rounded-full sm:h-[10px]" style={{ background: "rgba(255,255,255,0.08)" }}>
              <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: "linear-gradient(90deg, var(--color-brand-500), var(--color-brand-300))", boxShadow: "0 0 12px var(--color-brand-400)" }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress * 100)}%` }} transition={{ duration: 1.1, ease: EASE, delay: 0.4 }} />
            </div>
            <span className="text-[12.5px] font-bold sm:text-[13px]">
              <span style={{ color: "var(--color-brand-300)" }}>{fmt(gap)} points</span> to pass {ahead.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** A rank shield: the number big inside a metal-edged badge. */
function RankShield({ rank }: { rank: number }) {
  return (
    <span className="relative flex h-[54px] w-[48px] flex-none items-center justify-center sm:h-[66px] sm:w-[58px]">
      <svg viewBox="0 0 58 66" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="rank-shield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b4a8c" />
            <stop offset="1" stopColor="#141a33" />
          </linearGradient>
        </defs>
        <path d="M29 2 L55 11 L53 37 C51 50 40 59 29 64 C18 59 7 50 5 37 L3 11 Z" fill="url(#rank-shield)" stroke="var(--color-brand-300)" strokeWidth="2.5" />
      </svg>
      <span className="relative -mt-[4px] flex items-baseline">
        <span className="text-[12px] font-black" style={{ color: "var(--color-brand-300)" }}>#</span>
        <span className="text-[24px] leading-none font-black tabular-nums sm:text-[28px]" style={DISPLAY}>{rank}</span>
      </span>
    </span>
  );
}

/** A medal for the top three, in place of the rank number: a metal disc
 *  with the rank, two ribbon tails, and a crown over #1. */
function Medal({ rank }: { rank: number }) {
  const metal = METAL[rank - 1];
  return (
    <motion.span
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 0.25 + rank * 0.1, type: "spring", stiffness: 380, damping: 14 }}
      className="relative flex h-[34px] w-[30px] flex-none items-center justify-center sm:h-[40px] sm:w-[34px]"
      aria-label={`Rank ${rank}`}
    >
      <svg viewBox="0 0 34 40" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M10 22 L6 39 L12 35.5 L15 40 L17 24 Z" style={{ fill: `color-mix(in srgb, ${metal} 55%, #1b1e28)` }} />
        <path d="M24 22 L28 39 L22 35.5 L19 40 L17 24 Z" style={{ fill: `color-mix(in srgb, ${metal} 40%, #1b1e28)` }} />
        <circle cx="17" cy="15" r="13" style={{ fill: `color-mix(in srgb, ${metal} 80%, #1b1e28)` }} />
        <circle cx="17" cy="15" r="13" fill="none" style={{ stroke: `color-mix(in srgb, ${metal} 70%, white)` }} strokeWidth="1.5" />
        <circle cx="17" cy="15" r="9.5" fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="1.2" />
      </svg>
      <span className="relative -mt-[9px] text-[13px] leading-none font-black tabular-nums sm:-mt-[10px] sm:text-[15px]" style={{ ...DISPLAY, color: "#0b0d12" }}>{rank}</span>
      {rank === 1 && (
        <Crown className="absolute -top-[11px] left-1/2 h-[14px] w-[14px] -translate-x-1/2 sm:-top-[12px] sm:h-[16px] sm:w-[16px]" style={{ color: GOLD, filter: `drop-shadow(0 0 6px ${GOLD})` }} fill="currentColor" aria-hidden />
      )}
    </motion.span>
  );
}

/** One row of the timing tower. */
function TowerRow({ s, top, index }: { s: Ranked; top: number; index: number }) {
  const you = s.name === YOU;
  const metal = s.rank <= 3 ? METAL[s.rank - 1] : undefined;
  return (
    <motion.li
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index, 14) * 0.035, duration: 0.35, ease: EASE }}
      className="relative grid grid-cols-[40px_auto_1fr_auto] items-center gap-[10px] rounded-[12px] py-[8px] pr-[10px] sm:grid-cols-[52px_auto_1fr_auto] sm:gap-[12px] sm:py-[9px] sm:pr-[16px]"
      style={{
        background: you
          ? "linear-gradient(90deg, color-mix(in srgb, var(--primary) 34%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))"
          : metal
            ? `linear-gradient(90deg, color-mix(in srgb, ${metal} 16%, transparent), rgba(255,255,255,0.025) 60%)`
            : "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
        boxShadow: you ? "inset 0 0 0 2px var(--primary), 0 0 26px -10px var(--primary)" : metal ? `inset 0 0 0 1px color-mix(in srgb, ${metal} 35%, transparent)` : "inset 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      <span className="flex h-full items-center self-stretch">
        <span aria-hidden className="h-full w-[4px] self-stretch" style={{ background: STATE_COLOR[s.state] }} />
        <span className="flex flex-1 items-center justify-center text-[15px] font-black tabular-nums sm:text-[18px]" style={{ ...DISPLAY, color: you ? "var(--foreground)" : "var(--muted-foreground)" }}>
          {s.rank <= 3 ? <Medal rank={s.rank} /> : s.rank}
        </span>
      </span>
      <Avatar s={s} size={34} metal={you ? "var(--primary)" : metal} />
      <div className="flex min-w-0 flex-col gap-[3px]">
        <span className="flex min-w-0 items-center gap-[6px] text-[14px] font-extrabold sm:text-[14.5px]">
          <span className="truncate">{s.name}</span>
          {you && <span className="flex-none rounded-[5px] px-[5px] py-[1px] text-[10px] font-black tracking-[0.1em]" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>YOU</span>}
        </span>
        <span className="flex flex-wrap items-center gap-x-[8px] gap-y-[2px] text-[11px] font-semibold sm:text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
          Grade {s.grade}
          <span className="rounded-[5px] px-[6px] py-[1px] text-[10px] font-extrabold uppercase" style={{ background: "rgba(255,255,255,0.08)", color: "var(--foreground)" }}>{s.school}</span>
          <span className="flex items-center gap-[4px]">
            <span aria-hidden className="h-[6px] w-[6px] rounded-full" style={{ background: STATE_COLOR[s.state] }} />
            {s.state}
          </span>
        </span>
      </div>
      <div className="flex w-[78px] flex-col items-end gap-[5px] sm:w-[150px]">
        <span className="flex items-center gap-[4px] text-[14px] font-black tabular-nums sm:text-[17px]" style={DISPLAY}>
          <Coins className="h-[12px] w-[12px]" style={{ color: GOLD }} aria-hidden />
          {fmt(s.points)}
        </span>
        <span className="relative h-[5px] w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} aria-hidden>
          <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: you ? "var(--primary)" : `color-mix(in srgb, ${STATE_COLOR[s.state]} 70%, transparent)` }} initial={{ width: 0 }} animate={{ width: `${(s.points / top) * 100}%` }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 + Math.min(index, 14) * 0.03 }} />
        </span>
      </div>
    </motion.li>
  );
}

/** The student's own portrait in a ring: metal on the top three, the brand
 *  colour on you, a hairline of their state's colour otherwise. */
function Avatar({ s, size, metal }: { s: Standing; size: number; metal?: string }) {
  return (
    <span
      aria-hidden
      className="relative flex flex-none overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: "#d9dbe0",
        boxShadow: metal
          ? `0 0 0 3px #0b0d12, 0 0 0 ${size > 50 ? 6 : 5}px ${metal}`
          : `0 0 0 2px color-mix(in srgb, ${STATE_COLOR[s.state]} 70%, transparent)`,
      }}
    >
      <Image src={studentPortraitSrc(s.avatar)} alt="" fill sizes={`${size * 2}px`} className="object-cover object-top" />
    </span>
  );
}
