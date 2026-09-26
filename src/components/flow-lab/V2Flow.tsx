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
//
// 26 Sept 2026, "we can make things so intuitive without it being text
// heavy" (Joshua, on coachmarks: "maybe... as needed, case by case"). No
// coachmarks and no hint lines; the screens teach themselves:
// - Titles state the task ("Save careers you like", "Pick your top 3").
// - The card's Save control is a labeled pill, pulsing softly on the first
//   card until the first save.
// - The bottom bar's tray shows seven slots filling with each save: the
//   limit is visible, not stated.
// - The CTA says what it is waiting for: "Save 3 to rank", "Save 2 more",
//   then "Rank my top 3"; "Pick 2 more", then "See my Top 3".
// - Saved and Rank are one screen: three empty #1 #2 #3 slots above the
//   saved cards fill in tap order. One step fewer, and ranking shows how it
//   works.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { PATH_OPTIONS, SUBJECTS } from "@/components/build/types";
import { MAX_SAVED, buildSignals, careerById, exploreMoreWorlds, rankForStudent, readLabState, writeLabState, type BuildSignals, type LabCareer, type Ranked } from "./lab";
import { BottomBar, ChipRow, DetailModal, Field, InterestPicker, LabCard, LabScreen, PicksTray, ProfileTabs, QuietButton, RankSlots, RevealGrid, Toast, TopThreeScreen } from "./shared";

type Step = "interests" | "explore" | "rank" | "top3";
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
/** Saves needed before ranking: the next screen asks for #1, #2 and #3. */
const MIN_TO_RANK = 3;

const NOTES = {
  build: { heading: "Build, standing in", bullets: [
    "Shown when this browser has no Build answers, and after Restart (prefilled from Build) so a demo can try two worlds. In the product these come from Build itself; the lab never changes the real Build.",
    "Worlds are required; subjects and the college or trades answer sharpen the list.",
  ] },
  explore: { heading: "Save careers you like", bullets: [
    "Opens on your strongest world; your second world is the next tab. A chip on each card says why it's there.",
    "Explore all is for browsing outside your two worlds: pick any other industry and browse the same way.",
    "Tap a card for details. Save adds it to the tray at the bottom, up to 7; the empty slots show how many are left.",
    "Scroll for more. The next careers load in on their own.",
    "The button says what it needs: save 3 to rank your top 3.",
  ] },
  rank: { heading: "Your top 3, for now", bullets: [
    "Your saved careers, with three empty slots above them. Tap a card to fill the next slot: first tap is #1.",
    "Tap a filled slot to clear it. With all three full, tapping another career offers Swap in on each slot.",
    "The back arrow returns to browsing, where Save toggles a career.",
    "See my Top 3 sets them; they stay editable on the next screen.",
  ] },
  top3: { heading: "My Profile: Top Three", bullets: [
    "Ranking lands here, on the Top Three tab of My Profile, as in the real app. The tab row is shown, not wired: the lab never writes to the real profile.",
    "Change on a card swaps in any saved career or removes it; a removed pick leaves its numbered slot.",
    "Create my Career Report is the one next step: the first milestone of My Plan, and it works for every career (games exist for one career only). In the lab it says where it goes rather than opening the real app.",
    "Explore more (back to browsing) and Saved (back to ranking) sit beside it, quieter. Restart (top right) plays the flow again.",
  ] },
};

export function V2Flow({ askFirst = false }: { askFirst?: boolean }) {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLabState<State>(EMPTY);
    const build = buildSignals();
    // "saved" was its own step before 26 Sept 2026; it is part of Rank now.
    let next = (stored.step as string) === "saved" ? { ...stored, step: "rank" as Step } : stored;
    if (stored.worlds.length === 0 && build.worlds.length > 0) next = { ...stored, worlds: build.worlds, subjects: build.subjects, path: build.path, fromBuild: true, step: askFirst ? "interests" : "explore" };
    // Default to the strongest (first chosen) world, never a leftover tab.
    if (!next.worlds.includes(next.activeTab) && next.activeTab !== EXPLORE_ALL) next = { ...next, activeTab: next.worlds[0] ?? "" };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read after mount, same pattern as the counselor version chip
    setState(next);
    setHydrated(true);
    // Mount-only: askFirst is fixed for this instance (FlowLab remounts on Restart).
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // A fourth tap with all three slots full offers a swap, never a "remove
  // one first" wall (26 Sept 2026: ranking "should be obvious and
  // reassuring that this doesn't lock them in forever").
  const [incomingRank, setIncomingRank] = useState<string | null>(null);
  // Set only on the way in from ranking, so the one "change it anytime"
  // confirmation shows at that moment and not on later visits.
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    if (!arrived) return;
    const t = window.setTimeout(() => setArrived(false), 3500);
    return () => window.clearTimeout(t);
  }, [arrived]);
  const assign = (id: string) => {
    if (!state.rank.includes(id) && state.rank.length >= 3) { setIncomingRank((cur) => (cur === id ? null : id)); return; }
    setIncomingRank(null);
    setState((s) => s.rank.includes(id) ? { ...s, rank: s.rank.filter((x) => x !== id) } : s.rank.length >= 3 ? s : { ...s, rank: [...s.rank, id] });
  };
  const swapRank = (outId: string) => {
    const inId = incomingRank;
    if (!inId) return;
    setIncomingRank(null);
    setState((s) => ({ ...s, rank: s.rank.map((x) => (x === outId ? inId : x)) }));
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
    const open = openId ? (ranked.find((r) => r.career.id === openId) ?? (careerById(openId) ? { career: careerById(openId)!, reason: "", score: 0 } as Ranked : null)) : null;
    const openIdx = open ? ranked.indexOf(open) : -1;
    const setOpenIdFromTray = (id: string) => setOpenId(id);
    return (
      <>
        <LabScreen
          scrollable
          note={NOTES.explore}
          title="Save careers you like"
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
            renderItem={(r, i) => (
              <LabCard
                key={r.career.id}
                career={r.career}
                control="save"
                selected={state.saved.includes(r.career.id)}
                reason={r.reason}
                nudge={i === 0 && state.saved.length === 0}
                onToggle={() => toggleSave(r.career.id)}
                onOpen={() => setOpenId(r.career.id)}
              />
            )}
          />
        </LabScreen>
        <BottomBar
          status={<PicksTray saved={savedCareers} max={MAX_SAVED} onOpen={setOpenIdFromTray} />}
          cta={state.saved.length === 0 ? `Save ${MIN_TO_RANK} to rank` : state.saved.length < MIN_TO_RANK ? `Save ${MIN_TO_RANK - state.saved.length} more` : "Rank my top 3"}
          ctaDisabled={state.saved.length < MIN_TO_RANK}
          onCta={() => go("rank")}
        />
        <Toast text={toast} />
        <AnimatePresence>
          {open && (
            <DetailModal career={open.career} control="save" selected={state.saved.includes(open.career.id)} full={state.saved.length >= MAX_SAVED} onToggle={() => toggleSave(open.career.id)} onClose={() => setOpenId(null)} onPrev={openIdx > 0 ? () => setOpenId(ranked[openIdx - 1].career.id) : undefined} onNext={openIdx < ranked.length - 1 ? () => setOpenId(ranked[openIdx + 1].career.id) : undefined} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ---- Rank: saved careers and three slots, one screen ----
  if (state.step === "rank") {
    const open = openId ? savedCareers.find((c) => c.id === openId) : null;
    const openIdx = open ? savedCareers.indexOf(open) : -1;
    const need = Math.min(3, savedCareers.length);
    const left = need - state.rank.length;
    return (
      <>
        {/* "for now" in the heading: the reassurance lives in the line the
           student is already reading, not in an extra sentence. */}
        <LabScreen note={NOTES.rank} title="Your top 3, for now" controls={<RankSlots picks={top3} onClear={(id) => assign(id)} incoming={incomingRank ? careerById(incomingRank) ?? null : null} onSwap={swapRank} />}>
          {savedCareers.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed text-center" style={{ borderColor: "var(--glass-border)" }}>
              <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing saved yet</p>
            </div>
          ) : (
            <div className="flow-scroll min-h-0 flex-1 overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {savedCareers.map((c) => {
                  const pos = state.rank.indexOf(c.id);
                  return <LabCard key={c.id} career={c} control="pick" selected={pos >= 0} rank={pos >= 0 ? pos + 1 : undefined} onToggle={() => assign(c.id)} onOpen={() => setOpenId(c.id)} />;
                })}
              </div>
            </div>
          )}
        </LabScreen>
        <BottomBar
          left={<QuietButton ariaLabel="Back to browsing" onClick={() => go("explore")}><ChevronLeft className="h-4 w-4" aria-hidden /></QuietButton>}
          // "See", not "Confirm": a lower-stakes word for a choice that stays editable.
          cta={left > 0 ? `Pick ${left} more` : "See my Top 3"}
          ctaDisabled={left > 0 || need === 0}
          onCta={() => { setArrived(true); go("top3"); }}
        />
        <Toast text={toast} />
        <AnimatePresence>
          {open && (
            <DetailModal career={open} control="pick" selected={state.rank.includes(open.id)} full={state.rank.length >= 3} onToggle={() => assign(open.id)} onClose={() => setOpenId(null)} onPrev={openIdx > 0 ? () => setOpenId(savedCareers[openIdx - 1].id) : undefined} onNext={openIdx < savedCareers.length - 1 ? () => setOpenId(savedCareers[openIdx + 1].id) : undefined} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ---- My Profile: Top 3 ----
  return (
    <>
      <LabScreen title="My Profile" note={NOTES.top3} controls={<ProfileTabs />}>
        <TopThreeScreen
          top3={top3}
          pool={savedCareers}
          poolLabel="Saved"
          onExploreMore={() => go("explore")}
          onOpenPool={() => go("rank")}
          onRemove={(id) => setState((s) => ({ ...s, rank: s.rank.filter((x) => x !== id) }))}
          onReplace={(outId, inId) => setState((s) => ({ ...s, rank: s.rank.map((x) => (x === outId ? inId : x)) }))}
          // The lab never writes to the real app, and the real report page
          // saves picks on confirm, so the lab says where this goes instead
          // of opening it.
          onNext={() => setToast("In the app, this opens the Career Report for your Top 3.")}
        />
      </LabScreen>
      {/* "Change it anytime", said once, as a brief toast on arrival: the
          feedback for the action that just happened, gone in a few
          seconds. No bottom bar here: Restart is in the header. */}
      <Toast low text={toast ?? (arrived ? "Saved to My Profile. Change it anytime." : null)} />
    </>
  );
}
