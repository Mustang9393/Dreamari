"use client";

// DEMO-ONLY: v3 = the team's counter-proposal (Slack, 24 Sept 2026). Keep
// the three-stage shape students already rated easy and fix what the two
// surveys actually named: inputs too coarse (so Build asks one follow-up
// per world), matches feel scattered with no reason (so the six are built
// from the chosen worlds with a reason on every card), and no escape hatch
// (so "Six more" is a first-class control). BUILD ADD-ON -> MATCH -> MY
// PROFILE; picking up to 3 IS the Top 3.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useFirstUseHint } from "@/components/flow/GestureSpotlight";
import { SUB_INTERESTS, WORLD_NEIGHBORS, browsableWorlds, buildSignals, careerById, careersForWorld, interestsFromBuild, rankForStudent, readLabState, subInterestFor, writeLabState, type LabCareer } from "./lab";
import { BottomBar, ChipRow, DetailModal, Field, InterestPicker, LabCard, LabScreen, Pager, QuietButton, SixGrid, Toast, TopThreeScreen } from "./shared";

type Step = "interests" | "subs" | "match" | "top3";
type State = { step: Step; worlds: string[]; subs: Record<string, string[]>; page: number; picks: string[]; seen: string[] };
const EMPTY: State = { step: "interests", worlds: [], subs: {}, page: 0, picks: [], seen: [] };
const MAX_WORLDS = 3;
const MAX_PICKS = 3;

type Match = { career: LabCareer; reason: string; stretch: boolean };

/** A world's careers: sub-interest hits first, then the rest; within each
 *  half the real Build's subjects and path (rankForStudent) break ties, so
 *  v2 and v3 draw on the same signals and stay comparable. */
function rankWorld(world: string, subs: string[]): Match[] {
  const hit: Match[] = [];
  const miss: Match[] = [];
  for (const r of rankForStudent(world, buildSignals())) {
    const sub = subInterestFor(r.career.title, subs);
    if (sub) hit.push({ career: r.career, reason: sub, stretch: false });
    else miss.push({ career: r.career, reason: r.reason ?? world, stretch: false });
  }
  return [...hit, ...miss];
}

/** Six for a page: shared out across the chosen worlds, the last slot a
 *  stretch pick from a neighbouring world when there are 2+ worlds. */
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
    const uniq = [...new Set(worlds.flatMap((w) => WORLD_NEIGHBORS[w] ?? []).filter((n) => !worlds.includes(n) && browsableWorlds().includes(n)))];
    if (uniq.length > 0) {
      const world = uniq[page % uniq.length];
      const pool = careersForWorld(world);
      const career = pool[Math.floor(page / uniq.length) % pool.length];
      if (career && !used.has(career.id)) out.push({ career, reason: "Stretch pick", stretch: true });
    }
  }
  return out;
}

export function V3Flow({ onRestart }: { onRestart: () => void }) {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [showPick, dismissPick] = useFirstUseHint("flowlab-v3-pick");
  const [showMore, dismissMore] = useFirstUseHint("flowlab-v3-more");
  const [showEdit, dismissEdit] = useFirstUseHint("flowlab-v3-edit");

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
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const go = (step: Step) => { setOpenId(null); setState((s) => ({ ...s, step })); };
  const six = useMemo(() => buildSix(state.worlds, state.subs, state.page), [state.worlds, state.subs, state.page]);
  const top3 = useMemo(() => state.picks.map(careerById).filter((c): c is LabCareer => !!c), [state.picks]);
  const pool = useMemo(() => state.seen.map(careerById).filter((c): c is LabCareer => !!c), [state.seen]);

  // Functional update: two quick taps must never double-add.
  const togglePick = (id: string) => {
    if (!state.picks.includes(id) && state.picks.length >= MAX_PICKS) setToast("Remove one first to pick this career.");
    setState((s) => s.picks.includes(id) ? { ...s, picks: s.picks.filter((x) => x !== id) } : s.picks.length >= MAX_PICKS ? s : { ...s, picks: [...s.picks, id] });
  };
  const remember = (ids: string[]) => setState((s) => ({ ...s, seen: [...new Set([...s.seen, ...ids])] }));
  const setPage = (n: number, d: 1 | -1) => {
    const next = Math.max(0, n);
    setDir(d);
    remember(buildSix(state.worlds, state.subs, next).map((m) => m.career.id));
    setState((s) => ({ ...s, page: next }));
  };

  if (!hydrated) return null;

  // ---- Build add-on, part 1: up to 3 worlds ----
  if (state.step === "interests") {
    return (
      <>
        <LabScreen title="Build">
          <div className="flow-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 pt-2">
            <Field label="Worlds · up to 3"><InterestPicker value={state.worlds} max={MAX_WORLDS} onChange={(worlds) => setState((s) => ({ ...s, worlds }))} /></Field>
          </div>
        </LabScreen>
        <BottomBar status="Pick at least one world." cta="Next" ctaDisabled={state.worlds.length === 0} onCta={() => go("subs")} />
      </>
    );
  }

  // ---- Build add-on, part 2: one follow-up per world ----
  if (state.step === "subs") {
    const answered = state.worlds.every((w) => (state.subs[w] ?? []).length > 0);
    return (
      <>
        <LabScreen title="Which parts?">
          <div className="flow-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 pt-2">
            {state.worlds.map((world) => (
              <Field key={world} label={world}>
                <ChipRow ariaLabel={world} options={(SUB_INTERESTS[world] ?? []).map((x) => ({ key: x, label: x }))} value={state.subs[world] ?? []} max={99} onChange={(v) => setState((s) => ({ ...s, subs: { ...s.subs, [world]: v } }))} />
              </Field>
            ))}
          </div>
        </LabScreen>
        <BottomBar left={<QuietButton ariaLabel="Back" onClick={() => go("interests")}><ChevronLeft className="h-4 w-4" aria-hidden /></QuietButton>} status="One or more per world." cta="Show my six" ctaDisabled={!answered} onCta={() => { remember(six.map((m) => m.career.id)); go("match"); }} />
      </>
    );
  }

  // ---- Match: six with a reason each, pick up to 3 ----
  if (state.step === "match") {
    const open = openId ? six.find((m) => m.career.id === openId) : null;
    const openIdx = open ? six.indexOf(open) : -1;
    return (
      <>
        <LabScreen
          title="Match"
          status={`${state.picks.length} of ${MAX_PICKS}`}
          hint="Tap a card for details. Tap + to pick it."
          controls={
            <div className="flex flex-wrap items-center justify-between gap-2">
              <QuietButton onClick={() => go("subs")}><ChevronLeft className="h-4 w-4" aria-hidden /> Change answers</QuietButton>
              <Pager index={state.page} onPrev={() => setPage(state.page - 1, -1)} onNext={() => setPage(state.page + 1, 1)} hint={{ active: showMore && !showPick && !openId, label: "Not feeling these? Six more, one tap.", onDismiss: dismissMore }} />
            </div>
          }
        >
          <SixGrid page={state.page} direction={dir}>
            {six.map((m, i) => {
              const pos = state.picks.indexOf(m.career.id);
              return (
                <LabCard
                  key={m.career.id}
                  career={m.career}
                  fill
                  control="pick"
                  selected={pos >= 0}
                  rank={pos >= 0 ? pos + 1 : undefined}
                  reason={m.reason}
                  onToggle={() => togglePick(m.career.id)}
                  onOpen={() => setOpenId(m.career.id)}
                  hint={i === 0 ? { active: showPick && !openId && state.picks.length === 0, label: "Tap + to pick it. Three picks make your Top 3.", cta: "Next", onDismiss: dismissPick } : undefined}
                />
              );
            })}
          </SixGrid>
        </LabScreen>
        <BottomBar status={state.picks.length === 0 ? `Pick up to ${MAX_PICKS}.` : state.picks.length < MAX_PICKS ? `${state.picks.length} picked.` : "Your Top 3 is set."} cta={state.picks.length === MAX_PICKS ? "Confirm Top 3" : "Continue"} ctaDisabled={state.picks.length === 0} onCta={() => go("top3")} />
        <Toast text={toast} />
        <AnimatePresence>
          {open && (
            <DetailModal career={open.career} control="pick" selected={state.picks.includes(open.career.id)} full={state.picks.length >= MAX_PICKS} onToggle={() => togglePick(open.career.id)} onClose={() => setOpenId(null)} onPrev={openIdx > 0 ? () => setOpenId(six[openIdx - 1].career.id) : undefined} onNext={openIdx < six.length - 1 ? () => setOpenId(six[openIdx + 1].career.id) : undefined} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ---- My Profile: the same Top 3 screen as v2 ----
  return (
    <>
      <LabScreen title="My Top 3">
        <TopThreeScreen
          top3={top3}
          pool={pool}
          poolLabel="Matches"
          onExploreMore={() => go("match")}
          onOpenPool={() => go("match")}
          onRemove={(id) => setState((s) => ({ ...s, picks: s.picks.filter((x) => x !== id) }))}
          onReplace={(outId, inId) => setState((s) => ({ ...s, picks: s.picks.map((x) => (x === outId ? inId : x)) }))}
          replacing={replacing}
          setReplacing={setReplacing}
          hint={{ active: showEdit, label: "Swap or remove any pick, any time.", onDismiss: dismissEdit }}
        />
      </LabScreen>
      <BottomBar status="You can change these anytime." cta="Play again" onCta={onRestart} />
    </>
  );
}
