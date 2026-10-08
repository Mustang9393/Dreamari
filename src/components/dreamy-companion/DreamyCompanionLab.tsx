"use client";

// DEMO-ONLY: the Dreamy companion lab (/dreamy-companion). Mounts the
// companion over a stand-in Home so we can tune his timing and restraint
// before he touches the real app (9 Oct 2026, Chandu: "lets think about
// how we can incorporate dreamy more? right now its a just a sticker in
// random places with no real engagement or presence"). Agreed direction:
// Dreamy is your scout. He goes ahead, finds things, brings them back, and
// reacts. Every button here is one of those three moments; the Rules card
// is the contract the real app signs.
//
// Desktop: the fake Home sits in a stage box with the companion anchored
// inside it, the controls in a column on the right. Phone: the fake Home is
// the page, the companion is fixed above the tab bar, and the controls open
// as a sheet from a button bottom-left.

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { ArrowLeft, Moon, Play, SlidersHorizontal, Square, Sun, X } from "lucide-react";
import { QuickLinksMenu, Wordmark } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { useGlobalTheme } from "@/components/app/theme";
import { DEFAULT_CONFIG, dreamyConfigure, dreamyReset, dreamySay, dreamyScreenMounted, dreamySetMood, dreamySetQuiet, holdWaitMs, unpromptedWaitMs, useDreamy, type DreamyAction, type DreamyActionIcon, type DreamyEvent, type DreamyMood } from "@/lib/dreamyCompanion";
import { DreamyCompanion, DreamyReducedMotion } from "./DreamyCompanion";
import { FakeHome, FakeTabBar } from "./FakeHome";

const glass: CSSProperties = { background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", color: "var(--foreground)" };
const card: CSSProperties = { background: "var(--card)", borderColor: "var(--glass-border)", color: "var(--foreground)" };

const MOODS: { mood: DreamyMood; label: string }[] = [
  { mood: "idle", label: "Idle" },
  { mood: "scouting", label: "Scouting" },
  { mood: "waiting", label: "Waiting" },
  { mood: "proud", label: "Proud" },
  { mood: "puzzled", label: "Puzzled" },
];

type LabLog = (text: string) => void;

/** The moments we care about. Each has its own event id, so pressing a
 *  button twice shows the no-repeat rule working (the readout says why).
 *  The actions log to the lab instead of navigating, so the page stays. */
function labEvents(log: LabLog): { key: string; label: string; note: string; event: DreamyEvent }[] {
  const act = (id: string, label: string, hint: string, icon: DreamyActionIcon): DreamyAction => ({ id, label, hint, icon, onSelect: () => log(`Chose "${label}"`) });
  return [
    {
      key: "greeting",
      label: "Morning greeting",
      note: "idle, one line",
      event: {
        id: "greeting:2026-10-08",
        mood: "idle",
        line: "Morning, Maya. Your resume review came back. Want to look?",
        actions: [act("open-review", "Open the review", "One note from Ms. Diaz", "review"), act("fix-note", "Fix the note", "About 2 minutes", "open"), act("later", "Remind me after school", "Around 3:30", "start")],
      },
    },
    {
      key: "top3",
      label: "Scout: Top 3 match",
      note: "scouting, brings a poster",
      event: {
        id: "scout:top3:uiux-designer",
        mood: "scouting",
        line: "Found one. UI/UX Designer fits your Top 3.",
        payload: { kind: "poster", title: "UI/UX Designer", subtitle: "Tech & Engineering. 92% match", image: "/images/app/poster-uiux-designer.webp", accent: "var(--world-tech-engineering-design)", action: { label: "Look", onSelect: () => log("Opened UI/UX Designer") } },
        actions: [act("look-uiux", "Look at UI/UX Designer", "A 2 minute peek", "look"), act("save-uiux", "Save it to your locker", "Keep it for later", "save"), act("more-like", "See more like it", "Tech & Engineering", "open")],
      },
    },
    {
      key: "opportunity",
      label: "Scout: opportunity near you",
      note: "scouting, brings a row",
      event: {
        id: "scout:opp:all-star-code-2026",
        mood: "scouting",
        line: "Found one. A free coding summer program, 2 miles away.",
        payload: { kind: "row", title: "All Star Code Summer Intensive", subtitle: "Free. 2 miles away. Apply by Nov 1", image: "/images/opportunities/official/all-star-code-summer-intensive-786430.webp", accent: "var(--world-tech-engineering-design)", action: { label: "Open", onSelect: () => log("Opened All Star Code") } },
        actions: [act("open-opp", "Open it", "What you need to apply", "open"), act("save-opp", "Save it", "Keep it in Opportunities", "save"), act("remind-opp", "Remind me a week before", "Oct 25", "start")],
      },
    },
    {
      key: "review",
      label: "Review came back",
      note: "waiting, one line",
      event: {
        id: "review:resume:2026-10-08",
        mood: "waiting",
        line: "Ms. Diaz left one note on your resume. Want to see it?",
        actions: [act("open-review-2", "Open the review", "One note", "review"), act("fix-note-2", "Fix the note", "About 2 minutes", "open"), act("thank", "Thank Ms. Diaz", "A quick message", "start")],
      },
    },
    {
      key: "sim",
      label: "You finished a sim",
      note: "proud, burst",
      event: {
        id: "sim:done:registered-nurse",
        mood: "proud",
        line: "You finished the nurse sim. Nice work.",
        actions: [act("next-sim", "Play the next sim", "Emergency Medicine, 12 minutes", "play"), act("score", "See your score", "Level 2 of 4 done", "look"), act("share", "Share it with your counselor", "One tap", "start")],
      },
    },
    {
      key: "stuck",
      label: "Stuck 60s",
      note: "puzzled, one line",
      event: {
        id: "stuck:explore:60s",
        mood: "puzzled",
        line: "Stuck? Tap me.",
        actions: [act("show-career", "Show me a career I might like", "From your Top 3", "look"), act("go-home", "Go back to Home", "Start over", "open"), act("ask", "Ask a question", "About this page", "start")],
      },
    },
    {
      key: "milestone",
      label: "Milestone due in 3 days",
      note: "waiting, one line",
      event: {
        id: "milestone:fafsa:3d",
        mood: "waiting",
        line: "FAFSA is due in 3 days. Want to start it?",
        actions: [act("start-fafsa", "Start FAFSA", "Step 3 of 5", "start"), act("need", "See what you need", "Your list", "look"), act("remind-fafsa", "Remind me tomorrow", "Same time", "open")],
      },
    },
  ];
}

/** The 60 second script: realistic gaps, and the restraint showing. The
 *  first find fires at 1s and waits out the screen warm-up; the second
 *  waits behind the first bubble's hold; the rest land on their gaps. The
 *  cooldown drops to 6s for the run (90s would allow one moment per demo)
 *  and goes back when it ends. */
const DEMO: { at: number; key: string }[] = [
  { at: 1, key: "greeting" },
  { at: 16, key: "top3" },
  { at: 28, key: "review" },
  { at: 38, key: "opportunity" },
  { at: 47, key: "sim" },
  { at: 54, key: "stuck" },
  { at: 60, key: "milestone" },
];
const DEMO_COOLDOWN_MS = 6000;

const NARROW = "(max-width: 1023.98px)";
const subscribeNarrow = (cb: () => void) => { const m = window.matchMedia(NARROW); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); };
function useNarrow(): boolean | null {
  return useSyncExternalStore(subscribeNarrow, () => window.matchMedia(NARROW).matches, () => null);
}

function Switch({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-md)] px-[12px] py-[10px] text-left">
      <span className="min-w-0">
        <span className="block text-[13.5px] leading-[18px] font-semibold">{label}</span>
        <span className="block text-[12px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>{hint}</span>
      </span>
      <span aria-hidden className="relative h-[22px] w-[38px] flex-none rounded-full transition-colors duration-200" style={{ background: on ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 22%, transparent)" }}>
        <span className="absolute top-[3px] left-[3px] size-[16px] rounded-full bg-white transition-transform duration-200" style={{ transform: on ? "translateX(16px)" : "none", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </span>
    </button>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[6px] text-[12.5px] font-semibold" style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "var(--primary-foreground)" } : glass}>
      {children}
    </button>
  );
}

function PanelHead({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[11px] leading-[14px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--muted-foreground)" }}>{children}</h3>;
}

const secs = (ms: number) => `${Math.ceil(ms / 1000)}s`;

/** The controls and the readout. Shared by the desktop column and the
 *  phone sheet. */
function ControlPanel({ reducedPreview, setReducedPreview, log, entries }: { reducedPreview: boolean; setReducedPreview: (v: boolean) => void; log: LabLog; entries: string[] }) {
  const s = useDreamy();
  const [say, setSay] = useState("");
  const [demo, setDemo] = useState<{ step: string; t: number } | null>(null);
  const demoTimers = useRef<number[]>([]);
  const events = labEvents(log);
  // the countdowns tick while anything is waiting
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 250);
    return () => window.clearInterval(id);
  }, []);

  const stopDemo = useCallback(() => {
    demoTimers.current.forEach((t) => window.clearTimeout(t));
    demoTimers.current = [];
    setDemo(null);
    dreamyConfigure({ cooldownMs: DEFAULT_CONFIG.cooldownMs });
  }, []);
  useEffect(() => () => { demoTimers.current.forEach((t) => window.clearTimeout(t)); }, []);

  const runDemo = () => {
    stopDemo();
    dreamyReset({ cooldownMs: DEMO_COOLDOWN_MS });
    log("Demo started. Cooldown is 6s for the run.");
    setDemo({ step: "Screen opened. Warm-up.", t: 0 });
    const list = labEvents(log);
    for (const step of DEMO) {
      const ev = list.find((e) => e.key === step.key)!;
      demoTimers.current.push(window.setTimeout(() => {
        setDemo({ step: ev.label, t: step.at });
        dreamySay(ev.event);
      }, step.at * 1000));
    }
    demoTimers.current.push(window.setTimeout(() => { setDemo(null); dreamyConfigure({ cooldownMs: DEFAULT_CONFIG.cooldownMs }); log("Demo done. Cooldown back to 90s."); }, 72_000));
  };

  const wait = unpromptedWaitMs(s);
  const hold = holdWaitMs(s);
  const fire = (ev: DreamyEvent, label: string) => {
    const r = dreamySay(ev);
    if (r === "repeat") log(`${label}: skipped, already shown.`);
  };

  return (
    <div className="flex flex-col gap-[18px]" style={{ fontFamily: "var(--font-body)" }}>
      <section className="flex flex-col gap-[10px]">
        <PanelHead>Mood</PanelHead>
        <div className="flex flex-wrap gap-[8px]">
          {MOODS.map((m) => <Chip key={m.mood} on={s.mood === m.mood} onClick={() => dreamySetMood(m.mood)}>{m.label}</Chip>)}
        </div>
      </section>

      <section className="flex flex-col gap-[10px]">
        <PanelHead>Say</PanelHead>
        <form className="flex gap-[8px]" onSubmit={(e) => { e.preventDefault(); const line = say.trim(); if (!line) return; dreamySay({ id: `say:${Date.now()}`, mood: s.mood, line, prompted: true }); setSay(""); }}>
          <input value={say} onChange={(e) => setSay(e.target.value)} maxLength={90} placeholder="One line, 90 characters or fewer" aria-label="A line for Dreamy to say" className="dm-beam-input min-w-0 flex-1 rounded-[var(--radius-md)] border px-[12px] py-[8px] text-[13.5px] font-medium outline-none" style={{ ...card, background: "var(--glass-surface-1)" }} />
          <button type="submit" className="dm-solid cursor-pointer rounded-[var(--radius-md)] px-[14px] py-[8px] text-[13px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>Say</button>
        </form>
      </section>

      <section className="flex flex-col gap-[10px]">
        <PanelHead>Moments</PanelHead>
        <div className="grid grid-cols-1 gap-[6px]">
          {events.map((e) => {
            const seen = s.seen.includes(e.event.id);
            return (
              <button key={e.key} type="button" onClick={() => fire(e.event, e.label)} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[12px] py-[9px] text-left" style={glass}>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] leading-[18px] font-semibold">{e.label}</span>
                  <span className="block truncate text-[11.5px] leading-[15px] font-medium" style={{ color: "var(--muted-foreground)" }}>{e.note}</span>
                </span>
                <span className="flex-none rounded-full px-[8px] py-[2px] text-[10.5px] font-bold tracking-[0.06em] uppercase" style={{ background: seen ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "var(--glass-surface-2)", color: seen ? "var(--primary)" : "var(--muted-foreground)" }}>{seen ? "seen" : "new"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-[6px]">
        <PanelHead>Restraint</PanelHead>
        <Switch on={s.quiet} onChange={dreamySetQuiet} label="Quiet mode" hint="Dock only. Finds wait behind the badge." />
        <Switch on={reducedPreview} onChange={setReducedPreview} label="Reduced motion preview" hint="What a student with reduced motion sees." />
        <div className="flex items-center justify-between gap-[12px] px-[12px] py-[6px]">
          <span className="text-[13.5px] font-semibold">Cooldown</span>
          <div className="flex gap-[6px]">
            {[90_000, 10_000, 0].map((ms) => <Chip key={ms} on={s.config.cooldownMs === ms} onClick={() => dreamyConfigure({ cooldownMs: ms })}>{ms === 0 ? "Off" : `${ms / 1000}s`}</Chip>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-[8px] px-[12px] pt-[4px]">
          <Chip on={false} onClick={() => { dreamyScreenMounted(); log("New screen. Warm-up restarted."); }}>New screen</Chip>
          <Chip on={false} onClick={() => { stopDemo(); dreamyReset(); log("Session reset."); }}>Reset session</Chip>
        </div>
      </section>

      <section className="flex flex-col gap-[10px]">
        <PanelHead>Demo</PanelHead>
        {demo ? (
          <button type="button" onClick={() => { stopDemo(); log("Demo stopped."); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[12px] rounded-[var(--radius-md)] border px-[12px] py-[10px] text-left" style={glass}>
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] leading-[18px] font-semibold">Running: {demo.step}</span>
              <span className="block text-[11.5px] leading-[15px] font-medium" style={{ color: "var(--muted-foreground)" }}>at {demo.t}s of 60. Tap to stop.</span>
            </span>
            <Square className="h-[14px] w-[14px] flex-none" aria-hidden />
          </button>
        ) : (
          <button type="button" onClick={runDemo} className="dm-solid flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-md)] px-[14px] py-[10px] text-[13.5px] font-semibold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Play className="h-[14px] w-[14px]" aria-hidden />Run the 60 second demo
          </button>
        )}
      </section>

      <section className="flex flex-col gap-[10px]">
        <PanelHead>Store</PanelHead>
        <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-[12px] gap-y-[6px] rounded-[var(--radius-md)] border p-[12px] text-[12px] leading-[16px]" style={{ ...card, background: "var(--glass-surface-1)", fontFamily: "'Space Mono', monospace" }}>
          <Row k="mood" v={s.mood} />
          <Row k="line" v={s.line ?? "null"} />
          <Row k="payload" v={s.payload ? `${s.payload.kind}: ${s.payload.title}` : "null"} />
          <Row k="actions" v={s.actions.length ? s.actions.map((a) => a.label).join(" / ") : "none"} />
          <Row k="event" v={s.current?.id ?? "null"} />
          <Row k="queue" v={s.queue.length ? s.queue.map((q) => q.id).join(", ") : "empty"} />
          <Row k="seen" v={s.seen.length ? s.seen.join(", ") : "none"} />
          <Row k="quiet" v={String(s.quiet)} />
          <Row k="warm-up" v={wait.why === "warmup" ? `${secs(wait.ms)} left` : "clear"} />
          <Row k="cooldown" v={s.config.cooldownMs === 0 ? "off" : wait.why === "cooldown" ? `${secs(wait.ms)} left of ${s.config.cooldownMs / 1000}s` : `clear (${s.config.cooldownMs / 1000}s)`} />
          <Row k="hold" v={s.current ? (hold > 0 ? `${secs(hold)} until a queued one may replace this` : "open to the next") : "no bubble"} />
          <Row k="last skip" v={s.lastRefusal ? `${s.lastRefusal.id}: ${s.lastRefusal.detail}` : "none"} accent={!!s.lastRefusal} />
        </dl>
        {entries.length > 0 && (
          <ul className="flex flex-col gap-[4px] px-[4px] text-[12px] leading-[16px] font-medium" style={{ color: "var(--muted-foreground)" }}>
            {entries.map((e, i) => <li key={`${i}:${e}`}>{e}</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <>
      <dt className="truncate" style={{ color: "var(--muted-foreground)" }}>{k}</dt>
      <dd className="min-w-0 break-words" style={{ color: accent ? "var(--primary)" : "var(--foreground)" }}>{v}</dd>
    </>
  );
}

const RULES = [
  { title: "One job", body: "He scouts, brings something back, or reacts. If a moment is none of those, he is not there." },
  { title: "One home", body: "The dock, bottom right. Never a second Dreamy. Never over content. A bubble is one line, 90 characters at most." },
  { title: "One at a time", body: "A new find waits in line until the student closes the bubble, or 8 seconds pass." },
  { title: "Never twice", body: "Each moment has an id. Once shown, it is never shown again, even if the page asks." },
  { title: "Not right away", body: "Nothing unprompted in the first 10 seconds on a screen." },
  { title: "Not often", body: "One unprompted appearance per 90 seconds. Tapping him is a prompt; that is always allowed." },
  { title: "Quiet mode", body: "Dock only. Finds still line up behind the badge. He speaks when the student taps him." },
  { title: "Reduced motion", body: "He holds still. The line appears whole. No burst." },
];

function RulesCard() {
  return (
    <section className="rounded-[var(--radius-xl)] border p-[20px] sm:p-[24px]" style={card} aria-labelledby="dc-rules">
      <h2 id="dc-rules" className="text-[18px] leading-[24px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>The rules he keeps</h2>
      <p className="mt-[4px] text-[13.5px] leading-[19px] font-medium" style={{ color: "var(--muted-foreground)" }}>Built into the store, not into pages. A page can ask; it cannot make him break one.</p>
      <ol className="mt-[16px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
        {RULES.map((r, i) => (
          <li key={r.title} className="flex gap-[12px] rounded-[var(--radius-md)] border p-[12px]" style={{ ...glass, background: "var(--glass-surface-1)" }}>
            <span className="flex size-[26px] flex-none items-center justify-center rounded-full text-[12px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}>{i + 1}</span>
            <span className="min-w-0">
              <span className="block text-[14px] leading-[18px] font-semibold">{r.title}</span>
              <span className="block pt-[2px] text-[12.5px] leading-[17px] font-medium" style={{ color: "var(--muted-foreground)" }}>{r.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function DreamyCompanionLab() {
  const narrow = useNarrow();
  const { theme, toggle } = useGlobalTheme();
  const reduced = useReducedMotion();
  const [reducedPreview, setReducedPreview] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [entries, setEntries] = useState<string[]>([]);
  const log = useCallback<LabLog>((text) => setEntries((e) => [text, ...e].slice(0, 5)), []);
  // The readout prints countdowns from the clock, so it renders only on
  // the client (the server's clock would never match and hydration would
  // complain).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    dreamyScreenMounted();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount flag
    setMounted(true);
  }, []);
  // Escape closes the phone controls sheet
  useEffect(() => {
    if (!controlsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setControlsOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [controlsOpen]);

  const companion = (
    <MotionConfig reducedMotion={reducedPreview ? "always" : "user"}>
      <DreamyReducedMotion.Provider value={reducedPreview}>
        <DreamyCompanion anchor={narrow ? "fixed" : "stage"} />
      </DreamyReducedMotion.Provider>
    </MotionConfig>
  );

  return (
    <div className="marketing-v2 themeable relative min-h-dvh w-full" style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex h-16 items-center justify-between px-4 sm:px-6" style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--background) 92%, transparent) 0%, color-mix(in srgb, var(--background) 60%, transparent) 70%, transparent 100%)" }}>
        <div className="pointer-events-auto flex items-center gap-3">
          <IconTip label="Back to the app">
            <Link href="/home" aria-label="Back to the app" className="dm-quiet flex size-9 items-center justify-center rounded-full border backdrop-blur-[10px]" style={glass}>
              <ArrowLeft className="h-[16px] w-[16px]" aria-hidden />
            </Link>
          </IconTip>
          <Wordmark href="/home" />
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="hidden text-[10.5px] font-bold tracking-[0.1em] uppercase sm:block" style={{ color: "var(--primary)" }}>Dreamy companion · not the demo</span>
          <IconTip label={theme === "dark" ? "Switch to light" : "Switch to dark"}>
            <button type="button" aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"} onClick={toggle} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border backdrop-blur-[10px]" style={glass}>
              {theme === "dark" ? <Sun className="h-[16px] w-[16px]" aria-hidden /> : <Moon className="h-[16px] w-[16px]" aria-hidden />}
            </button>
          </IconTip>
          <QuickLinksMenu />
        </div>
      </header>

      <main className="relative z-[1] mx-auto flex w-full max-w-[1440px] flex-col gap-[20px] px-4 pt-[84px] pb-[120px] sm:px-6 lg:pb-[48px]">
        <section className="flex max-w-[760px] flex-col gap-[6px]">
          <h1 className="text-[26px] leading-[30px] font-extrabold tracking-tight sm:text-[32px] sm:leading-[36px]" style={{ fontFamily: "var(--font-display)" }}>Dreamy, your scout</h1>
          <p className="text-[14.5px] leading-[21px] font-medium" style={{ color: "var(--muted-foreground)" }}>
            He goes ahead of you, finds things, brings them back, and reacts to what you do. One dock, one line at a time, never the same find twice. This page mounts him over a stand-in Home so we can tune his timing before he goes in the real app.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-[20px] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-[20px]">
            {/* desktop: the stage; the companion is anchored inside it */}
            {/* sized to the window, so the dock is above the fold on a 900px
                display and not somewhere below it */}
            <div className="relative hidden h-[clamp(520px,calc(100dvh-236px),760px)] overflow-hidden rounded-[var(--radius-xl)] border lg:block" style={{ ...card, background: "var(--background)" }} aria-label="The stand-in Home with Dreamy over it">
              <div className="dm-scroll absolute inset-0 overflow-y-auto">
                <FakeHome />
              </div>
              {narrow === false && companion}
            </div>
            {/* phone: the page is the stage */}
            <div className="lg:hidden">
              <FakeHome />
            </div>
            <RulesCard />
          </div>
          <aside className="hidden self-start lg:sticky lg:top-[84px] lg:block">
            <div className="dm-scroll max-h-[calc(100dvh-108px)] overflow-y-auto rounded-[var(--radius-xl)] border p-[16px]" style={card}>
              {mounted && <ControlPanel reducedPreview={reducedPreview} setReducedPreview={setReducedPreview} log={log} entries={entries} />}
            </div>
          </aside>
        </div>
      </main>

      {narrow && companion}
      <FakeTabBar />

      {/* phone: the controls open as a sheet from this button */}
      {narrow && (
        <button type="button" onClick={() => setControlsOpen(true)} aria-haspopup="dialog" aria-expanded={controlsOpen} className="dm-solid fixed left-[16px] z-[65] flex h-[44px] cursor-pointer items-center gap-[8px] rounded-full border px-[16px] text-[13.5px] font-semibold backdrop-blur-[12px] lg:hidden" style={{ ...glass, background: "color-mix(in srgb, var(--card) 88%, transparent)", bottom: "calc(50px + env(safe-area-inset-bottom, 0px) + 16px)", boxShadow: "0 12px 30px -16px rgba(0,0,0,0.6)" }}>
          <SlidersHorizontal className="h-[15px] w-[15px]" aria-hidden />Controls
        </button>
      )}
      <AnimatePresence>
        {controlsOpen && (
          <motion.div key="controls" role="dialog" aria-modal="true" aria-labelledby="dc-controls-title" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.14 } }} className="fixed inset-0 z-[120] flex items-end justify-center" style={{ background: "color-mix(in srgb, var(--background) 60%, transparent)" }} onPointerUp={(e) => { if (e.target === e.currentTarget) setControlsOpen(false); }}>
            <motion.div initial={reduced ? false : { y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="flex max-h-[86dvh] w-full flex-col rounded-t-[var(--radius-xl)] border" style={card}>
              <div className="flex items-center justify-between gap-[12px] px-[20px] pt-[16px] pb-[8px]">
                <h2 id="dc-controls-title" className="text-[16px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Controls</h2>
                <IconTip label="Close">
                  <button type="button" aria-label="Close" onClick={() => setControlsOpen(false)} className="dm-quiet flex size-[32px] cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
                    <X className="h-[16px] w-[16px]" aria-hidden />
                  </button>
                </IconTip>
              </div>
              <div className="dm-scroll min-h-0 flex-1 overflow-y-auto px-[16px] pb-[calc(env(safe-area-inset-bottom,0px)+20px)]">
                <ControlPanel reducedPreview={reducedPreview} setReducedPreview={setReducedPreview} log={log} entries={entries} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
