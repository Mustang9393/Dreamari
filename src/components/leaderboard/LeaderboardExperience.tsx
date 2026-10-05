"use client";

// DEMO-ONLY: the Daily Leaderboard mockup (6 Oct 2026). Joshua: "pls make a
// leaderboard mockup... i created a version in replit please replicate this
// vision" (https://dceeai.replit.app/leaderboard/regional); Chandu: "Put it in
// the hamburger menu to access. get creative with the designs."
//
// Same content as the Replit: the title and its line, the three tabs (New
// York vs New Jersey, ASE, Central), the state split of the Top 25, Your
// Rank, and the Top 25 with grade, school and state. Made ours:
// - the state split is a head-to-head scoreboard with a tug-of-war bar
//   instead of a donut (10 vs 15, 40% vs 60%);
// - the top three stand on a podium;
// - Your Rank says how far it is to the next place (derived from the list);
// - every row carries a slim bar of its points against #1;
// - ASE and Central actually filter (the Replit's two tabs showed the
//   regional list): each school's own ranking, re-ranked within it.
// Every name and number is the Replit's (data.ts).

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, PAGE_TITLE_CLASS, PAGE_TITLE_STYLE } from "@/components/app/chrome";
import { HeaderActions } from "@/components/app/Inbox";
import { STANDINGS, YOU, type School, type Standing, type State } from "./data";

type Tab = "regional" | School;
const TABS: { id: Tab; label: string }[] = [
  { id: "regional", label: "New York vs New Jersey" },
  { id: "ASE", label: "ASE" },
  { id: "Central", label: "Central" },
];

const STATE_COLOR: Record<State, string> = { "New York": "var(--color-brand-400)", "New Jersey": "var(--color-amber-400)" };
const MEDAL = ["var(--color-amber-400)", "var(--color-ink-200)", "var(--color-amber-650)"];
const EASE = [0.16, 1, 0.3, 1] as const;
const fmt = (n: number) => n.toLocaleString("en-US");
const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

type Ranked = Standing & { rank: number };

export function LeaderboardExperience() {
  const [tab, setTab] = useState<Tab>("regional");
  const list: Ranked[] = (tab === "regional" ? STANDINGS : STANDINGS.filter((s) => s.school === tab)).map((s, i) => ({ ...s, rank: i + 1 }));
  const top = list[0]?.points ?? 1;
  const me = list.find((s) => s.name === YOU) ?? STANDINGS.map((s, i) => ({ ...s, rank: i + 1 })).find((s) => s.name === YOU)!;
  const meInList = list.some((s) => s.name === YOU);

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <AppBackdrop />
      <DesktopNavigation />
      <MobileHeaderShell>
        <Wordmark />
        <HeaderActions><QuickLinksMenu /></HeaderActions>
      </MobileHeaderShell>

      <main className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col gap-[22px] px-5 pt-3 pb-[140px] sm:px-[var(--space-10)] md:pt-8">
        {/* Title */}
        <header className="flex items-center gap-[14px]">
          <motion.span initial={{ y: 8, opacity: 0, rotate: -6 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} className="relative h-[64px] w-[64px] flex-none sm:h-[76px] sm:w-[76px]">
            <Image src="/images/dreamy-expressions/dreamy-celebrate.webp" alt="" fill sizes="76px" className="object-contain" />
          </motion.span>
          <div className="flex min-w-0 flex-col gap-[4px]">
            <h1 className={PAGE_TITLE_CLASS} style={PAGE_TITLE_STYLE}>Daily Leaderboard</h1>
            <p className="text-[14px] font-semibold sm:text-[15px]" style={{ color: "var(--muted-foreground)" }}>Rankings update daily. Points accumulate and never reset.</p>
          </div>
        </header>

        {/* Tabs */}
        <div role="tablist" aria-label="Leaderboard" className="flex w-full gap-[4px] rounded-full border p-[4px] sm:w-fit" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setTab(t.id)}
                className="relative flex-1 cursor-pointer rounded-full px-[14px] py-[8px] text-[13px] font-bold whitespace-nowrap sm:flex-none sm:px-[18px] sm:text-[14px]"
                style={{ color: on ? "var(--primary-foreground)" : "var(--muted-foreground)" }}
              >
                {on && <motion.span layoutId="lb-tab" className="absolute inset-0 rounded-full" style={{ background: "var(--primary)" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* The split, and you */}
        <section className="grid grid-cols-1 gap-[14px] lg:grid-cols-[1.35fr_1fr]">
          {tab === "regional" ? <Versus /> : <SchoolSplit school={tab} list={list} />}
          <YourRank me={me} list={meInList ? list : STANDINGS.map((s, i) => ({ ...s, rank: i + 1 }))} scope={meInList && tab !== "regional" ? tab : "regional"} />
        </section>

        {/* Top 25 */}
        <section className="flex flex-col gap-[14px]" aria-label={tab === "regional" ? "Top 25" : `${tab} rankings`}>
          <h2 className="text-[20px] font-extrabold sm:text-[22px]" style={{ fontFamily: "var(--font-display)" }}>
            {tab === "regional" ? "Top 25" : `${tab} in the Top 25`}
          </h2>
          <Podium key={`podium-${tab}`} three={list.slice(0, 3)} />
          <ol className="flex flex-col gap-[8px]">
            {list.slice(3).map((s, i) => (
              <Row key={`${tab}-${s.name}`} s={s} top={top} index={i} />
            ))}
          </ol>
        </section>
      </main>
      <MobileNav active="" />
    </div>
  );
}

/** New York vs New Jersey as a scoreboard: each side's count of the Top 25,
 *  and a tug-of-war bar split at their share. */
function Versus() {
  const ny = STANDINGS.filter((s) => s.state === "New York").length;
  const nj = STANDINGS.filter((s) => s.state === "New Jersey").length;
  const nyPct = Math.round((ny / STANDINGS.length) * 100);
  return (
    <div className="flex flex-col gap-[16px] rounded-[var(--radius-lg)] border p-[18px] sm:p-[22px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-[10px]">
        <Side label="New Yorkers in Top 25" count={ny} color={STATE_COLOR["New York"]} align="left" />
        <span className="mb-[10px] rounded-full px-[10px] py-[4px] text-[12px] font-black tracking-[0.1em]" style={{ background: "var(--glass-surface-2)", color: "var(--muted-foreground)" }}>VS</span>
        <Side label="New Jerseyans in Top 25" count={nj} color={STATE_COLOR["New Jersey"]} align="right" />
      </div>
      <div className="relative h-[14px] overflow-hidden rounded-full" style={{ background: STATE_COLOR["New Jersey"] }}>
        <motion.span
          className="absolute inset-y-0 left-0 rounded-l-full"
          style={{ background: STATE_COLOR["New York"], boxShadow: `4px 0 14px ${STATE_COLOR["New York"]}` }}
          initial={{ width: "50%" }}
          animate={{ width: `${nyPct}%` }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
        />
      </div>
      <div className="flex justify-between text-[13px] font-bold">
        <span style={{ color: STATE_COLOR["New York"] }}>New York {nyPct}%</span>
        <span style={{ color: STATE_COLOR["New Jersey"] }}>New Jersey {100 - nyPct}%</span>
      </div>
    </div>
  );
}

function Side({ label, count, color, align }: { label: string; count: number; color: string; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-col gap-[2px] ${align === "right" ? "items-end text-right" : ""}`}>
      <span className="text-[12px] leading-tight font-bold sm:text-[13px]" style={{ color: "var(--muted-foreground)" }}>{label}</span>
      <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }} className="text-[44px] leading-none font-black tabular-nums sm:text-[52px]" style={{ color, fontFamily: "var(--font-display)" }}>
        {count}
      </motion.span>
    </div>
  );
}

/** A school tab: how many of the Top 25 are from that school, and its top
 *  student. */
function SchoolSplit({ school, list }: { school: School; list: Ranked[] }) {
  const share = Math.round((list.length / STANDINGS.length) * 100);
  const best = list[0];
  const bestOverall = STANDINGS.findIndex((s) => s.name === best?.name) + 1;
  return (
    <div className="flex flex-col justify-between gap-[16px] rounded-[var(--radius-lg)] border p-[18px] sm:p-[22px]" style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
      <div className="flex items-end justify-between gap-[10px]">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}>{school} students in Top 25</span>
          <span className="text-[52px] leading-none font-black tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>{list.length}</span>
        </div>
        {best && (
          <div className="flex flex-col items-end gap-[2px] text-right">
            <span className="text-[12px] font-bold" style={{ color: "var(--muted-foreground)" }}>Highest ranked</span>
            <span className="text-[15px] font-extrabold">{best.name}</span>
            <span className="text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>#{bestOverall} overall</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-[6px]">
        <div className="relative h-[10px] overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
          <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--primary)" }} initial={{ width: 0 }} animate={{ width: `${share}%` }} transition={{ duration: 0.9, ease: EASE }} />
        </div>
        <span className="text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>{share}% of the Top 25</span>
      </div>
    </div>
  );
}

/** Your rank, your points, and how far to the next place up. */
function YourRank({ me, list, scope }: { me: Ranked; list: Ranked[]; scope: "regional" | School }) {
  const mine = list.find((s) => s.name === me.name) ?? me;
  const ahead = list[mine.rank - 2];
  const gap = ahead ? ahead.points - mine.points : 0;
  // How close you are to the next place: your points against theirs.
  const progress = ahead ? mine.points / ahead.points : 1;
  return (
    <div
      className="relative flex flex-col justify-between gap-[14px] overflow-hidden rounded-[var(--radius-lg)] border-2 p-[18px] sm:p-[22px]"
      style={{ background: "linear-gradient(150deg, color-mix(in srgb, var(--primary) 26%, var(--glass-surface-1)), var(--glass-surface-1) 70%)", borderColor: "color-mix(in srgb, var(--primary) 60%, transparent)" }}
    >
      <div className="flex items-start justify-between gap-[10px]">
        <div className="flex flex-col gap-[2px]">
          <span className="text-[12px] font-extrabold tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>Your rank{scope !== "regional" ? ` at ${scope}` : ""}</span>
          <span className="flex items-baseline gap-[6px] leading-none">
            <span className="text-[20px] font-black" style={{ color: "var(--muted-foreground)" }}>#</span>
            <motion.span key={`${scope}-${mine.rank}`} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[56px] font-black tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
              {mine.rank}
            </motion.span>
          </span>
          <span className="text-[14px] font-bold">{fmt(mine.points)} total points</span>
        </div>
        <div className="flex flex-col items-end gap-[6px] text-right">
          <Avatar name={mine.name} state={mine.state} size={44} ring />
          <span className="text-[14px] font-extrabold">{mine.name}</span>
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{mine.school} · {mine.state}</span>
        </div>
      </div>
      {ahead && (
        <div className="flex flex-col gap-[6px]">
          <div className="relative h-[8px] overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }}>
            <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--primary)" }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress * 100)}%` }} transition={{ duration: 0.9, ease: EASE, delay: 0.3 }} />
          </div>
          <span className="text-[13px] font-bold">
            <span style={{ color: "var(--primary)" }}>{fmt(gap)} points</span> to pass {ahead.name}
          </span>
        </div>
      )}
    </div>
  );
}

/** The top three on a podium: second, first, third. */
function Podium({ three }: { three: Ranked[] }) {
  const order = [three[1], three[0], three[2]].filter(Boolean) as Ranked[];
  const height = (rank: number) => (rank === 1 ? 118 : rank === 2 ? 88 : 70);
  return (
    <div className="grid grid-cols-3 items-end gap-[8px] sm:gap-[14px]">
      {order.map((s, i) => (
        <motion.div
          key={s.name}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 20, delay: [0.15, 0, 0.3][i] }}
          className="flex min-w-0 flex-col items-center gap-[8px]"
        >
          <div className="relative">
            <Avatar name={s.name} state={s.state} size={s.rank === 1 ? 68 : 54} ring={s.name === YOU} />
            <Medal rank={s.rank} />
          </div>
          <div className="flex min-w-0 flex-col items-center text-center">
            <span className="w-full truncate text-[13.5px] font-extrabold sm:text-[15px]">{s.name}{s.name === YOU ? " (You)" : ""}</span>
            <span className="text-[11.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.school}</span>
          </div>
          <div
            className="flex w-full flex-col items-center justify-start rounded-t-[14px] border border-b-0 pt-[10px]"
            style={{
              height: height(s.rank),
              background: `linear-gradient(180deg, color-mix(in srgb, ${MEDAL[s.rank - 1]} 30%, var(--glass-surface-2)), var(--glass-surface-1))`,
              borderColor: `color-mix(in srgb, ${MEDAL[s.rank - 1]} 45%, transparent)`,
            }}
          >
            <span className="text-[17px] font-black tabular-nums sm:text-[19px]" style={{ fontFamily: "var(--font-display)" }}>{fmt(s.points)}</span>
            <span className="text-[11px] font-bold" style={{ color: "var(--muted-foreground)" }}>total points</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** A rank medal on its ribbon, in gold, silver or bronze. */
function Medal({ rank }: { rank: number }) {
  const c = MEDAL[rank - 1];
  return (
    <svg viewBox="0 0 32 40" className="absolute -right-[8px] -bottom-[6px] h-[30px] w-[24px]" aria-label={`Rank ${rank}`}>
      <path d="M8 0 L16 12 L24 0 Z" fill="color-mix(in srgb, var(--primary) 70%, black)" />
      <circle cx="16" cy="25" r="13" fill={c} stroke="rgba(0,0,0,0.45)" strokeWidth="1.5" />
      <circle cx="16" cy="25" r="9.5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
      <text x="16" y="29.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#1a1205">{rank}</text>
    </svg>
  );
}

function Row({ s, top, index }: { s: Ranked; top: number; index: number }) {
  const you = s.name === YOU;
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.03, duration: 0.3 }}
      className="relative grid grid-cols-[36px_auto_1fr_auto] items-center gap-[12px] overflow-hidden rounded-[14px] border px-[12px] py-[10px] sm:grid-cols-[44px_auto_1fr_auto] sm:px-[16px]"
      style={{
        background: you ? "color-mix(in srgb, var(--primary) 16%, var(--glass-surface-1))" : "var(--glass-surface-1)",
        borderColor: you ? "var(--primary)" : "var(--glass-border)",
      }}
    >
      <span className="text-[15px] font-black tabular-nums sm:text-[17px]" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-display)" }}>#{s.rank}</span>
      <Avatar name={s.name} state={s.state} size={36} />
      <div className="flex min-w-0 flex-col gap-[3px]">
        <span className="truncate text-[14.5px] font-extrabold">
          {s.name}
          {you && <span className="ml-[6px] text-[12px] font-bold" style={{ color: "var(--primary)" }}>(You)</span>}
        </span>
        <span className="flex flex-wrap items-center gap-x-[8px] gap-y-[2px] text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
          Grade {s.grade}
          <span className="rounded-[6px] px-[6px] py-[1px] text-[11px] font-bold" style={{ background: "var(--glass-surface-2)", color: "var(--foreground)" }}>{s.school}</span>
          <span className="flex items-center gap-[4px]">
            <span aria-hidden className="h-[6px] w-[6px] rounded-full" style={{ background: STATE_COLOR[s.state] }} />
            {s.state}
          </span>
        </span>
      </div>
      <div className="flex w-[84px] flex-col items-end gap-[4px] sm:w-[120px]">
        <span className="text-[15px] font-black tabular-nums sm:text-[16px]">{fmt(s.points)}</span>
        <span className="relative h-[4px] w-full overflow-hidden rounded-full" style={{ background: "var(--glass-surface-2)" }} aria-hidden>
          <span className="absolute inset-y-0 right-0 rounded-full" style={{ width: `${(s.points / top) * 100}%`, background: you ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 35%, transparent)" }} />
        </span>
      </div>
    </motion.li>
  );
}

function Avatar({ name, state, size, ring = false }: { name: string; state: State; size: number; ring?: boolean }) {
  const c = STATE_COLOR[state];
  return (
    <span
      aria-hidden
      className="flex flex-none items-center justify-center rounded-full font-extrabold"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `linear-gradient(140deg, color-mix(in srgb, ${c} 55%, var(--glass-surface-2)), color-mix(in srgb, ${c} 18%, var(--glass-surface-1)))`,
        color: "var(--foreground)",
        boxShadow: ring ? "0 0 0 2px var(--background), 0 0 0 4px var(--primary)" : "inset 0 0 0 1px rgba(255,255,255,0.12)",
      }}
    >
      {initials(name)}
    </span>
  );
}
