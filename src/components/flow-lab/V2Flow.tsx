"use client";

// DEMO-ONLY: v2 = Joshua's proposal, as written (Slack, 24 Sept 2026):
// BUILD (unchanged) -> MINI EXPLORE -> SAVED CAREERS -> RANK -> MY PROFILE.
// Built faithfully so it can be compared live against v3; the reasoning for
// and against lives in the handoff, not here. Mini Explore is ordered by
// the real Build's answers via rankForStudent (direct feedback, 25 Sept
// 2026: "actually shows relevant options based on what I choose").

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { PATH_OPTIONS, SUBJECTS } from "@/components/build/types";
import { useFirstUseHint } from "@/components/flow/GestureSpotlight";
import { MAX_SAVED, buildSignals, careerById, exploreMoreWorlds, forYou, rankForStudent, readLabState, writeLabState, type BuildSignals, type LabCareer, type Ranked } from "./lab";
import { BottomBar, ChipRow, DetailModal, Field, InterestPicker, LabCard, LabScreen, PAGE, Pager, QuietButton, SixGrid, Toast, TopThreeScreen } from "./shared";

type Step = "interests" | "explore" | "saved" | "rank" | "top3";
type State = {
  step: Step;
  worlds: string[];
  subjects: string[];
  path: string;
  fromBuild: boolean;
  activeTab: string;
  moreWorld: string;
  page: Record<string, number>;
  saved: string[];
  rank: string[];
};
const EMPTY: State = { step: "interests", worlds: [], subjects: [], path: "", fromBuild: false, activeTab: "", moreWorld: "", page: {}, saved: [], rank: [] };
const FOR_YOU = "For you";
const EXPLORE_MORE = "Explore more";

export function V2Flow({ onRestart }: { onRestart: () => void }) {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [showSave, dismissSave] = useFirstUseHint("flowlab-v2-save");
  const [showMore, dismissMore] = useFirstUseHint("flowlab-v2-more");
  const [showRank, dismissRank] = useFirstUseHint("flowlab-v2-rank");
  const [showEdit, dismissEdit] = useFirstUseHint("flowlab-v2-edit");

  useEffect(() => {
    const stored = readLabState<State>("v2", EMPTY);
    const build = buildSignals();
    let next = stored;
    if (stored.worlds.length === 0 && build.worlds.length > 0) next = { ...stored, worlds: build.worlds, subjects: build.subjects, path: build.path, fromBuild: true, step: "explore" };
    // Land on For you: the six that fit the combination of every Build answer.
    if (!next.worlds.includes(next.activeTab) && next.activeTab !== EXPLORE_MORE && next.activeTab !== FOR_YOU) next = { ...next, activeTab: FOR_YOU };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read after mount, same pattern as the counselor version chip
    setState(next);
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) writeLabState("v2", state);
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
        <LabScreen title="Build">
          <div className="flow-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 pt-2">
            <Field label="Worlds · up to 2"><InterestPicker value={state.worlds} max={2} onChange={(worlds) => setState((s) => ({ ...s, worlds, activeTab: FOR_YOU }))} /></Field>
            <Field label="Favourite subjects · up to 2"><ChipRow ariaLabel="Subjects" options={SUBJECTS.map((x) => ({ key: x, label: x }))} value={state.subjects} max={2} onChange={(subjects) => setState((s) => ({ ...s, subjects }))} /></Field>
            <Field label="After high school"><ChipRow ariaLabel="Path" options={PATH_OPTIONS.map((p) => ({ key: p.id, label: p.title }))} value={state.path ? [state.path as "college" | "trades" | "both"] : []} max={1} onChange={([path]) => setState((s) => ({ ...s, path: path ?? "" }))} /></Field>
          </div>
        </LabScreen>
        <BottomBar status="Pick at least one world." cta="Mini Explore" ctaDisabled={state.worlds.length === 0} onCta={() => go("explore")} />
      </>
    );
  }

  // ---- Mini Explore: six at a time, paged like a carousel ----
  if (state.step === "explore") {
    const tabs = [{ key: FOR_YOU, label: FOR_YOU }, ...state.worlds.map((w) => ({ key: w, label: w })), { key: EXPLORE_MORE, label: EXPLORE_MORE }];
    const others = exploreMoreWorlds(state.worlds);
    const isMore = state.activeTab === EXPLORE_MORE;
    const moreWorld = others.includes(state.moreWorld) ? state.moreWorld : others[0];
    const isForYou = state.activeTab === FOR_YOU;
    const world = isMore ? moreWorld : isForYou ? FOR_YOU : state.activeTab;
    const ranked: Ranked[] = isForYou ? forYou(signals) : rankForStudent(world, signals);
    const total = Math.max(1, Math.ceil(ranked.length / PAGE));
    const index = Math.min(state.page[world] ?? 0, total - 1);
    const six = ranked.slice(index * PAGE, index * PAGE + PAGE);
    const setPage = (n: number, d: 1 | -1) => { setDir(d); setState((s) => ({ ...s, page: { ...s.page, [world]: ((n % total) + total) % total } })); };
    const open = openId ? six.find((r) => r.career.id === openId) : null;
    const openIdx = open ? six.indexOf(open) : -1;
    return (
      <>
        <LabScreen
          title="Mini Explore"
          status={`${state.saved.length} of ${MAX_SAVED}`}
          hint="Tap a card for details. Tap the bookmark to save it."
          controls={
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Segmented ariaLabel="World" value={state.activeTab} onChange={(key) => { setDir(1); setState((s) => ({ ...s, activeTab: key })); }} options={tabs} />
              <Pager index={index} total={total} onPrev={() => setPage(index - 1, -1)} onNext={() => setPage(index + 1, 1)} hint={{ active: showMore && !showSave && !openId, label: "Six more, any time. Move back and forth.", onDismiss: dismissMore }} />
              {isMore && <ChipRow small ariaLabel="More worlds" options={others.map((w) => ({ key: w, label: w }))} value={[moreWorld]} max={1} onChange={([w]) => { setDir(1); setState((s) => ({ ...s, moreWorld: w ?? others[0] })); }} />}
            </div>
          }
        >
          <SixGrid page={`${world}-${index}`} direction={dir}>
            {six.map((r, i) => (
              <LabCard
                key={r.career.id}
                career={r.career}
                fill
                control="save"
                selected={state.saved.includes(r.career.id)}
                reason={r.reason}
                onToggle={() => toggleSave(r.career.id)}
                onOpen={() => setOpenId(r.career.id)}
                hint={i === 0 ? { active: showSave && !openId && state.saved.length === 0, label: "Tap to save it. Save up to 7, then rank your top 3.", cta: "Next", onDismiss: dismissSave } : undefined}
              />
            ))}
          </SixGrid>
        </LabScreen>
        <BottomBar status={state.saved.length === 0 ? `Save up to ${MAX_SAVED}.` : `${state.saved.length} saved.`} cta="Continue" ctaDisabled={state.saved.length === 0} onCta={() => go("saved")} />
        <Toast text={toast} />
        <AnimatePresence>
          {open && (
            <DetailModal career={open.career} control="save" selected={state.saved.includes(open.career.id)} full={state.saved.length >= MAX_SAVED} onToggle={() => toggleSave(open.career.id)} onClose={() => setOpenId(null)} onPrev={openIdx > 0 ? () => setOpenId(six[openIdx - 1].career.id) : undefined} onNext={openIdx < six.length - 1 ? () => setOpenId(six[openIdx + 1].career.id) : undefined} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ---- Saved ----
  if (state.step === "saved" || state.step === "rank") {
    const ranking = state.step === "rank";
    const open = openId ? savedCareers.find((c) => c.id === openId) : null;
    const openIdx = open ? savedCareers.indexOf(open) : -1;
    return (
      <>
        <LabScreen title={ranking ? "Rank your top 3" : "Saved"} status={ranking ? `${state.rank.length} of 3` : `${savedCareers.length} of ${MAX_SAVED}`} hint={ranking ? "Tap + in the order you want them." : "Tap a card for details. Tap the bookmark to remove it."}>
          {savedCareers.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed text-center" style={{ borderColor: "var(--glass-border)" }}>
              <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing saved yet</p>
            </div>
          ) : (
            <div className="flow-scroll min-h-0 flex-1 overflow-y-auto px-1">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {savedCareers.map((c, i) => {
                  const pos = state.rank.indexOf(c.id);
                  return ranking ? (
                    <LabCard key={c.id} career={c} control="pick" selected={pos >= 0} rank={pos >= 0 ? pos + 1 : undefined} onToggle={() => assign(c.id)} onOpen={() => setOpenId(c.id)} hint={i === 0 ? { active: showRank && !openId && state.rank.length === 0, label: "Tap + in the order you want them. #1 first.", onDismiss: dismissRank } : undefined} />
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
      <LabScreen title="My Top 3">
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
          hint={{ active: showEdit, label: "Swap or remove any pick, any time.", onDismiss: dismissEdit }}
        />
      </LabScreen>
      <BottomBar status="You can change these anytime." cta="Play again" onCta={onRestart} />
    </>
  );
}
