"use client";

// DEMO-ONLY: the Flow Lab's flow. Started as a straight port of Joshua's
// proposal (Slack, 24 Sept 2026): BUILD -> MINI EXPLORE -> SAVED -> RANK ->
// MY PROFILE. Reworked after his review of that build (Slack, 25 Sept
// 2026), point for point:
//
// "NO POP-UPS... the interface itself should make the next action obvious
// through copy, hierarchy, and placement" -- every coachmark is gone; the
// persistent hint line under each header carries the instruction instead.
//
// "REMOVE 'FOR YOU'... default directly to their strongest selected
// industry... with their other selected industry available as another
// tab. We can keep the small 'Fits...' labels" -- Mini Explore now opens on
// the student's first chosen world; a second chosen world is the next tab;
// the "Fits..." chip (rankForStudent's reason) stays on every card.
//
// "REMOVE 'SIX MORE'... make this work more like Netflix/YouTube. Show six
// at a time, and as they scroll, naturally bring in the next set" -- the
// carousel and its button are gone; RevealGrid (shared.tsx) grows the grid
// on scroll.
//
// "'EXPLORE MORE' -> 'EXPLORE ALL': this section is really allowing
// students to browse outside their selected industries" -- renamed, same
// job (a world picker for everything outside their two).

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { PATH_OPTIONS, SUBJECTS } from "@/components/build/types";
import { MAX_SAVED, buildSignals, careerById, exploreMoreWorlds, rankForStudent, readLabState, writeLabState, type BuildSignals, type LabCareer, type Ranked } from "./lab";
import { BottomBar, ChipRow, DetailModal, Field, InterestPicker, LabCard, LabScreen, QuietButton, RevealGrid, Toast, TopThreeScreen } from "./shared";

type Step = "interests" | "explore" | "saved" | "rank" | "top3";
type State = {
  step: Step;
  worlds: string[];
  subjects: string[];
  path: string;
  fromBuild: boolean;
  activeTab: string;
  moreWorld: string;
  saved: string[];
  rank: string[];
};
const EMPTY: State = { step: "interests", worlds: [], subjects: [], path: "", fromBuild: false, activeTab: "", moreWorld: "", saved: [], rank: [] };
const EXPLORE_ALL = "Explore all";

const NOTES = {
  build: { heading: "Build, standing in", bullets: [
    "Only shown when this browser has no Build answers. In the product these come from Build itself.",
    "Worlds are required; subjects and the college or trades answer sharpen the list.",
  ] },
  explore: { heading: "Mini Explore", bullets: [
    "Opens on your strongest world; your second world is the next tab. A chip on each card says why it's there.",
    "Explore all is for browsing outside your two worlds: pick any other industry and browse the same way.",
    "Tap a card for details. Tap the bookmark to save it, up to 7.",
    "Scroll for more. The next careers load in on their own.",
  ] },
  saved: { heading: "Saved", bullets: [
    "Everything you bookmarked, in one place. Tap the bookmark again to remove.",
    "Rank my top 3 when you're ready; the back arrow returns to Mini Explore.",
  ] },
  rank: { heading: "Rank your top 3", bullets: [
    "Tap + in the order you want them: first tap is #1. Tap again to undo.",
    "Confirm Top 3 sets them; you can still change them on the next screen.",
  ] },
  top3: { heading: "My Top 3 and what happens next", bullets: [
    "Next step: one recommended action for #1 (the Career Report). Start opens the real report page.",
    "The ladder under it is the same order of milestones the counselor dashboard tracks: Career Report, Pathway, Play a day, Colleges.",
    "The four icons under each card open the real pages for that career: Report, Pathway, Play, Colleges.",
    "Replace swaps a pick for anything in Saved; Remove clears the slot.",
    "Explore more and Saved go back to keep editing. Play again restarts the whole flow.",
  ] },
};

export function V2Flow({ onRestart }: { onRestart: () => void }) {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLabState<State>(EMPTY);
    const build = buildSignals();
    let next = stored;
    if (stored.worlds.length === 0 && build.worlds.length > 0) next = { ...stored, worlds: build.worlds, subjects: build.subjects, path: build.path, fromBuild: true, step: "explore" };
    // Default to the strongest (first chosen) world, never a leftover tab.
    if (!next.worlds.includes(next.activeTab) && next.activeTab !== EXPLORE_ALL) next = { ...next, activeTab: next.worlds[0] ?? "" };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read after mount, same pattern as the counselor version chip
    setState(next);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) writeLabState(state);
  }, [state, hydrated]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const go = (step: Step) => { setOpenId(null); setState((s) => ({ ...s, step })); };
  const signals: BuildSignals = useMemo(() => ({ worlds: state.worlds, subjects: state.subjects, path: state.path }), [state.worlds, state.subjects, state.path]);
  const savedCareers = useMemo(() => state.saved.map(careerById).filter((c): c is LabCareer => !!c), [state.saved]);
  const top3 = useMemo(() => state.rank.map(careerById).filter((c): c is LabCareer => !!c), [state.rank]);

  // Functional updates throughout: two quick taps must never double-add.
  const toggleSave = (id: string) => {
    if (!state.saved.includes(id) && state.saved.length >= MAX_SAVED) setToast("Remove one first to save this career.");
    setState((s) => s.saved.includes(id)
      ? { ...s, saved: s.saved.filter((x) => x !== id), rank: s.rank.filter((x) => x !== id) }
      : s.saved.length >= MAX_SAVED ? s : { ...s, saved: [...s.saved, id] });
  };
  const assign = (id: string) => {
    if (!state.rank.includes(id) && state.rank.length >= 3) setToast("Remove one first to rank this career.");
    setState((s) => s.rank.includes(id) ? { ...s, rank: s.rank.filter((x) => x !== id) } : s.rank.length >= 3 ? s : { ...s, rank: [...s.rank, id] });
  };

  if (!hydrated) return null;

  // ---- Build answers (asked only when this browser has no Build) ----
  if (state.step === "interests") {
    return (
      <>
        <LabScreen title="Build" note={NOTES.build}>
          <div className="flow-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 pt-2">
            <Field label="Worlds · up to 2"><InterestPicker value={state.worlds} max={2} onChange={(worlds) => setState((s) => ({ ...s, worlds, activeTab: worlds[0] ?? "" }))} /></Field>
            <Field label="Favourite subjects · up to 2"><ChipRow ariaLabel="Subjects" options={SUBJECTS.map((x) => ({ key: x, label: x }))} value={state.subjects} max={2} onChange={(subjects) => setState((s) => ({ ...s, subjects }))} /></Field>
            <Field label="After high school"><ChipRow ariaLabel="Path" options={PATH_OPTIONS.map((p) => ({ key: p.id, label: p.title }))} value={state.path ? [state.path as "college" | "trades" | "both"] : []} max={1} onChange={([path]) => setState((s) => ({ ...s, path: path ?? "" }))} /></Field>
          </div>
        </LabScreen>
        <BottomBar status="Pick at least one world." cta="Mini Explore" ctaDisabled={state.worlds.length === 0} onCta={() => go("explore")} />
      </>
    );
  }

  // ---- Mini Explore: strongest world first, continuous scroll ----
  if (state.step === "explore") {
    const tabs = [...state.worlds.map((w) => ({ key: w, label: w })), { key: EXPLORE_ALL, label: EXPLORE_ALL }];
    const others = exploreMoreWorlds(state.worlds);
    const isAll = state.activeTab === EXPLORE_ALL;
    const moreWorld = others.includes(state.moreWorld) ? state.moreWorld : others[0];
    const world = isAll ? moreWorld : state.activeTab;
    const ranked: Ranked[] = rankForStudent(world, signals);
    const open = openId ? ranked.find((r) => r.career.id === openId) : null;
    const openIdx = open ? ranked.indexOf(open) : -1;
    return (
      <>
        <LabScreen
          scrollable
          note={NOTES.explore}
          title="Mini Explore"
          status={`${state.saved.length} of ${MAX_SAVED}`}
          hint="Tap a card for details. Tap the bookmark to save it."
          controls={
            <div className="flex flex-col gap-2">
              <Segmented ariaLabel="World" value={state.activeTab} onChange={(key) => setState((s) => ({ ...s, activeTab: key }))} options={tabs} />
              {isAll && <ChipRow small ariaLabel="Any other industry" options={others.map((w) => ({ key: w, label: w }))} value={[moreWorld]} max={1} onChange={([w]) => setState((s) => ({ ...s, moreWorld: w ?? others[0] }))} />}
            </div>
          }
        >
          <RevealGrid
            items={ranked}
            resetKey={world}
            renderItem={(r) => (
              <LabCard
                key={r.career.id}
                career={r.career}
                control="save"
                selected={state.saved.includes(r.career.id)}
                reason={r.reason}
                onToggle={() => toggleSave(r.career.id)}
                onOpen={() => setOpenId(r.career.id)}
              />
            )}
          />
        </LabScreen>
        <BottomBar status={state.saved.length === 0 ? `Save up to ${MAX_SAVED}.` : `${state.saved.length} saved.`} cta="Continue" ctaDisabled={state.saved.length === 0} onCta={() => go("saved")} />
        <Toast text={toast} />
        <AnimatePresence>
          {open && (
            <DetailModal career={open.career} control="save" selected={state.saved.includes(open.career.id)} full={state.saved.length >= MAX_SAVED} onToggle={() => toggleSave(open.career.id)} onClose={() => setOpenId(null)} onPrev={openIdx > 0 ? () => setOpenId(ranked[openIdx - 1].career.id) : undefined} onNext={openIdx < ranked.length - 1 ? () => setOpenId(ranked[openIdx + 1].career.id) : undefined} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ---- Saved / Rank ----
  if (state.step === "saved" || state.step === "rank") {
    const ranking = state.step === "rank";
    const open = openId ? savedCareers.find((c) => c.id === openId) : null;
    const openIdx = open ? savedCareers.indexOf(open) : -1;
    return (
      <>
        <LabScreen note={ranking ? NOTES.rank : NOTES.saved} title={ranking ? "Rank your top 3" : "Saved"} status={ranking ? `${state.rank.length} of 3` : `${savedCareers.length} of ${MAX_SAVED}`} hint={ranking ? "Tap + in the order you want them." : "Tap a card for details. Tap the bookmark to remove it."}>
          {savedCareers.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed text-center" style={{ borderColor: "var(--glass-border)" }}>
              <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing saved yet</p>
            </div>
          ) : (
            <div className="flow-scroll min-h-0 flex-1 overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {savedCareers.map((c) => {
                  const pos = state.rank.indexOf(c.id);
                  return ranking ? (
                    <LabCard key={c.id} career={c} control="pick" selected={pos >= 0} rank={pos >= 0 ? pos + 1 : undefined} onToggle={() => assign(c.id)} onOpen={() => setOpenId(c.id)} />
                  ) : (
                    <LabCard key={c.id} career={c} control="save" selected onToggle={() => toggleSave(c.id)} onOpen={() => setOpenId(c.id)} />
                  );
                })}
              </div>
            </div>
          )}
        </LabScreen>
        <BottomBar
          left={<QuietButton ariaLabel={ranking ? "Back to Saved" : "Back to Mini Explore"} onClick={() => go(ranking ? "saved" : "explore")}><ChevronLeft className="h-4 w-4" aria-hidden /></QuietButton>}
          status={ranking ? (state.rank.length === 3 ? "Your Top 3 is set." : "Choose your #1, #2 and #3.") : "Rank when you're ready."}
          cta={ranking ? "Confirm Top 3" : "Rank my top 3"}
          ctaDisabled={ranking ? state.rank.length === 0 : savedCareers.length === 0}
          onCta={() => go(ranking ? "top3" : "rank")}
        />
        <Toast text={toast} />
        <AnimatePresence>
          {open && (
            <DetailModal career={open} control={ranking ? "pick" : "save"} selected={ranking ? state.rank.includes(open.id) : true} full={ranking ? state.rank.length >= 3 : false} onToggle={() => (ranking ? assign(open.id) : toggleSave(open.id))} onClose={() => setOpenId(null)} onPrev={openIdx > 0 ? () => setOpenId(savedCareers[openIdx - 1].id) : undefined} onNext={openIdx < savedCareers.length - 1 ? () => setOpenId(savedCareers[openIdx + 1].id) : undefined} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ---- My Profile: Top 3 ----
  return (
    <>
      <LabScreen title="My Top 3" note={NOTES.top3}>
        <TopThreeScreen
          top3={top3}
          pool={savedCareers}
          poolLabel="Saved"
          onExploreMore={() => go("explore")}
          onOpenPool={() => go("saved")}
          onRemove={(id) => setState((s) => ({ ...s, rank: s.rank.filter((x) => x !== id) }))}
          onReplace={(outId, inId) => setState((s) => ({ ...s, rank: s.rank.map((x) => (x === outId ? inId : x)) }))}
          replacing={replacing}
          setReplacing={setReplacing}
        />
      </LabScreen>
      <BottomBar status="You can change these anytime." cta="Play again" onCta={onRestart} />
    </>
  );
}
