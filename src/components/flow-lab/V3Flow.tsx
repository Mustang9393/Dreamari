"use client";

// DEMO-ONLY: v3 = the team's counter-proposal (Slack, 24 Sept 2026). Keep
// the three-stage shape students already rated easy and fix what the two
// surveys actually named: inputs too coarse (so Build asks one follow-up
// per world), matches feel scattered with no reason (so the six are built
// from the chosen worlds with a reason chip on every card), and no escape
// hatch (so "Show me six more" is a first-class row, not a dead end).
// BUILD ADD-ON -> MATCH -> MY PROFILE; picking up to 3 IS the Top 3.

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Sparkles, RefreshCw } from "lucide-react";
import {
  SUB_INTERESTS, WORLD_NEIGHBORS, browsableWorlds, buildSignals, careerById, careersForWorld, interestsFromBuild, rankForStudent, readLabState, subInterestFor, writeLabState, type LabCareer,
} from "./lab";
import { CARD, InterestPicker, LabCard, PrimaryButton, QuietButton, StepHeader, TopThreeScreen } from "./shared";

type Step = "interests" | "subs" | "match" | "top3";
type State = {
  step: Step;
  worlds: string[];
  subs: Record<string, string[]>;
  page: number;
  picks: string[];
  seen: string[];
};
const EMPTY: State = { step: "interests", worlds: [], subs: {}, page: 0, picks: [], seen: [] };
const STEPS = ["Build", "Match", "My Profile"];
const MAX_WORLDS = 3;
const MAX_PICKS = 3;

type Match = { career: LabCareer; reasons: string[]; stretch: boolean };

/** Rank a world's careers: ones that match a chosen sub-interest first,
 *  then the rest, each with its reason. Deterministic, so a page is stable. */
function rankWorld(world: string, subs: string[]): Match[] {
  // Sub-interest hits first; within each half, the real Build's subjects
  // and path (rankForStudent) break ties, so the same signals v2 uses
  // shape v3 too and the two stay comparable.
  const hit: Match[] = [];
  const miss: Match[] = [];
  for (const r of rankForStudent(world, buildSignals())) {
    const sub = subInterestFor(r.career.title, subs);
    if (sub) hit.push({ career: r.career, reasons: [sub, world], stretch: false });
    else miss.push({ career: r.career, reasons: r.reason ? [`Fits ${r.reason}`, world] : [world], stretch: false });
  }
  return [...hit, ...miss];
}

/** Six for this page: shared out across the chosen worlds, with the last
 *  slot a stretch pick from a neighbouring world when there are 2+ worlds. */
function buildSix(worlds: string[], subs: Record<string, string[]>, page: number): Match[] {
  if (worlds.length === 0) return [];
  const withStretch = worlds.length >= 2;
  const slots = withStretch ? 5 : 6;
  const per = worlds.map((_, i) => Math.floor(slots / worlds.length) + (i < slots % worlds.length ? 1 : 0));
  const out: Match[] = [];
  const used = new Set<string>();
  worlds.forEach((world, i) => {
    const ranked = rankWorld(world, subs[world] ?? []);
    const start = (page * per[i]) % Math.max(ranked.length, 1);
    for (let k = 0; k < per[i] && ranked.length > 0; k++) {
      const m = ranked[(start + k) % ranked.length];
      if (!used.has(m.career.id)) { used.add(m.career.id); out.push(m); }
    }
  });
  if (withStretch) {
    const neighbours = worlds.flatMap((w) => WORLD_NEIGHBORS[w] ?? []).filter((n) => !worlds.includes(n) && browsableWorlds().includes(n));
    const uniq = [...new Set(neighbours)];
    if (uniq.length > 0) {
      const world = uniq[page % uniq.length];
      const pool = careersForWorld(world);
      const career = pool[Math.floor(page / uniq.length) % pool.length];
      if (career && !used.has(career.id)) out.push({ career, reasons: ["Stretch pick", `Near ${worlds.find((w) => (WORLD_NEIGHBORS[w] ?? []).includes(world)) ?? worlds[0]}`], stretch: true });
    }
  }
  return out;
}

export function V3Flow() {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLabState<State>("v3", EMPTY);
    const fromBuild = interestsFromBuild();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read after mount, same pattern as the counselor version chip
    setState(stored.worlds.length > 0 ? stored : fromBuild.length > 0 ? { ...stored, worlds: fromBuild.slice(0, MAX_WORLDS) } : stored);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) writeLabState("v3", state);
  }, [state, hydrated]);

  const go = (step: Step) => setState((s) => ({ ...s, step }));
  const six = useMemo(() => buildSix(state.worlds, state.subs, state.page), [state.worlds, state.subs, state.page]);
  const top3 = useMemo(() => state.picks.map(careerById).filter((c): c is LabCareer => !!c), [state.picks]);
  const pool = useMemo(() => state.seen.map(careerById).filter((c): c is LabCareer => !!c), [state.seen]);

  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 2200);
  };
  const togglePick = (id: string) => {
    setState((s) => {
      if (s.picks.includes(id)) return { ...s, picks: s.picks.filter((x) => x !== id) };
      if (s.picks.length >= MAX_PICKS) {
        flash("That's your three. Unpick one to swap it.");
        return s;
      }
      return { ...s, picks: [...s.picks, id] };
    });
  };
  const rememberSeen = (ids: string[]) => setState((s) => ({ ...s, seen: [...new Set([...s.seen, ...ids])] }));

  if (!hydrated) return null;

  // ---- Build add-on, part 1: up to 3 worlds ----
  if (state.step === "interests") {
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        <StepHeader steps={STEPS} current={0} title="Pick up to 3 worlds" helper="Your Build picks are already here if you did one. A third world is optional; it widens the set without scattering it. This choice stays inside the lab." />
        <InterestPicker value={state.worlds} max={MAX_WORLDS} onChange={(worlds) => setState((s) => ({ ...s, worlds }))} />
        <div><PrimaryButton disabled={state.worlds.length === 0} onClick={() => go("subs")}>Next: what parts? <ChevronRight className="h-[16px] w-[16px]" aria-hidden /></PrimaryButton></div>
      </div>
    );
  }

  // ---- Build add-on, part 2: one follow-up per world ----
  if (state.step === "subs") {
    const answered = state.worlds.every((w) => (state.subs[w] ?? []).length > 0);
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        <StepHeader steps={STEPS} current={0} title="Which parts pull you in?" helper="One quick follow-up per world. This is what turns a broad world into six careers that actually feel like you." />
        <div className="flex flex-col gap-[var(--space-4)]">
          {state.worlds.map((world) => {
            const chosen = state.subs[world] ?? [];
            return (
              <section key={world} className="flex flex-col gap-[10px] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={CARD}>
                <h2 className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{world}</h2>
                <div className="flex flex-wrap gap-[8px]">
                  {(SUB_INTERESTS[world] ?? []).map((sub) => {
                    const on = chosen.includes(sub);
                    return (
                      <button key={sub} type="button" aria-pressed={on} onClick={() => setState((s) => ({ ...s, subs: { ...s.subs, [world]: on ? chosen.filter((x) => x !== sub) : [...chosen, sub] } }))} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[7px] text-[13px] font-bold" style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: "var(--foreground)" }}>
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <QuietButton onClick={() => go("interests")}>Back</QuietButton>
          <PrimaryButton disabled={!answered} onClick={() => { rememberSeen(buildSix(state.worlds, state.subs, state.page).map((m) => m.career.id)); go("match"); }}>
            <Sparkles className="h-[16px] w-[16px]" aria-hidden /> Show my six
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // ---- Match: six with reasons, pick up to 3 ----
  if (state.step === "match") {
    return (
      <div className="flex flex-col gap-[var(--space-5)] pb-[80px]">
        <StepHeader steps={STEPS} current={1} title="Six careers, and why each one is here" helper="Built from your worlds and the parts you picked, plus one stretch pick nearby. Pick up to three; that is your Top 3. Not feeling it? Six more, one tap." />
        <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3">
          {six.map((m) => {
            const pos = state.picks.indexOf(m.career.id);
            return (
              <LabCard key={m.career.id} career={m.career} control="pick" selected={pos >= 0} rank={pos >= 0 ? pos + 1 : undefined} onToggle={() => togglePick(m.career.id)} reasons={m.reasons} />
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <QuietButton onClick={() => { const next = state.page + 1; rememberSeen(buildSix(state.worlds, state.subs, next).map((m) => m.career.id)); setState((s) => ({ ...s, page: next })); }}>
            <RefreshCw className="h-[16px] w-[16px]" aria-hidden /> Show me six more
          </QuietButton>
          <QuietButton onClick={() => go("subs")}>Change my answers</QuietButton>
        </div>
        <PickBar count={state.picks.length} toast={toast} onConfirm={() => go("top3")} />
      </div>
    );
  }

  // ---- My Profile: the same Top 3 screen as v2 ----
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <StepHeader steps={STEPS} current={2} title="My Profile · Top 3" helper="Same screen as v2 on purpose: explore more, pull in one of your matches, or remove and replace any pick. The difference is how you got here." />
      <TopThreeScreen
        top3={top3}
        saved={pool}
        poolLabel="Your matches"
        onExploreMore={() => go("match")}
        onOpenSaved={() => go("match")}
        onRemove={(id) => setState((s) => ({ ...s, picks: s.picks.filter((x) => x !== id) }))}
        onReplace={(outId, inId) => setState((s) => ({ ...s, picks: s.picks.map((x) => (x === outId ? inId : x)) }))}
        replacing={replacing}
        setReplacing={setReplacing}
      />
    </div>
  );
}

function PickBar({ count, toast, onConfirm }: { count: number; toast: string | null; onConfirm: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[64px] z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-[12px] rounded-full border px-[16px] py-[8px] backdrop-blur-[12px]" style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", borderColor: "var(--glass-border)" }}>
        <span className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>Top 3: {count}/{MAX_PICKS}</span>
        {toast && <span className="text-[12px] font-semibold" style={{ color: "#F5A623" }}>{toast}</span>}
        <button type="button" onClick={onConfirm} disabled={count === 0} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[4px] rounded-full px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-40">
          {count === MAX_PICKS ? "Confirm Top 3" : "Done for now"} <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}
