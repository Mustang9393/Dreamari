"use client";

// DEMO-ONLY: v2 = Joshua's proposal, as written (Slack, 24 Sept 2026):
// BUILD (unchanged) -> MINI EXPLORE -> SAVED CAREERS -> RANK -> MY PROFILE.
// Built faithfully so it can be compared live against v3; the reasoning for
// and against lives in the handoff, not here.

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Bookmark } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { MAX_SAVED, PAGE_SIZE, browsableWorlds, careerById, careersForWorld, interestsFromBuild, readLabState, writeLabState, type LabCareer } from "./lab";
import { CARD, InterestPicker, LabCard, PrimaryButton, QuietButton, StepHeader, TopThreeScreen } from "./shared";

type Step = "interests" | "explore" | "saved" | "rank" | "top3";
type State = {
  step: Step;
  worlds: string[];
  activeTab: string;
  shown: Record<string, number>;
  saved: string[];
  rank: string[];
};
const EMPTY: State = { step: "interests", worlds: [], activeTab: "", shown: {}, saved: [], rank: [] };
const STEPS = ["Build", "Mini Explore", "Saved", "Rank", "My Profile"];
const EXPLORE_MORE = "Explore more";

export function V2Flow() {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLabState<State>("v2", EMPTY);
    // Build stays the real Build: the lab picks up the interests it saved and
    // only asks when there are none, so it can be demoed cold.
    const fromBuild = interestsFromBuild();
    const next = stored.worlds.length > 0 ? stored : fromBuild.length > 0 ? { ...stored, worlds: fromBuild, step: "explore" as Step } : stored;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read after mount, same pattern as the counselor version chip
    setState(next.activeTab ? next : { ...next, activeTab: next.worlds[0] ?? "" });
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) writeLabState("v2", state);
  }, [state, hydrated]);

  const flash = (t: string) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 2200);
  };
  const go = (step: Step) => setState((s) => ({ ...s, step }));
  const savedCareers = useMemo(() => state.saved.map(careerById).filter((c): c is LabCareer => !!c), [state.saved]);
  const top3 = useMemo(() => state.rank.map(careerById).filter((c): c is LabCareer => !!c), [state.rank]);

  const toggleSave = (id: string) => {
    setState((s) => {
      if (s.saved.includes(id)) return { ...s, saved: s.saved.filter((x) => x !== id), rank: s.rank.filter((x) => x !== id) };
      if (s.saved.length >= MAX_SAVED) {
        flash(`You've saved ${MAX_SAVED}. Remove one to add another.`);
        return s;
      }
      return { ...s, saved: [...s.saved, id] };
    });
  };

  if (!hydrated) return null;

  // ---- Step: interests (only when Build hasn't saved any) ----
  if (state.step === "interests") {
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        <StepHeader steps={STEPS} current={0} title="Pick up to 2 worlds" helper="In the real flow these come from Build. Nothing was saved from a Build run on this browser, so pick them here to play the flow. This choice stays inside the lab." />
        <InterestPicker value={state.worlds} max={2} onChange={(worlds) => setState((s) => ({ ...s, worlds, activeTab: worlds[0] ?? "" }))} />
        <div><PrimaryButton disabled={state.worlds.length === 0} onClick={() => go("explore")}>Continue to Mini Explore <ChevronRight className="h-[16px] w-[16px]" aria-hidden /></PrimaryButton></div>
      </div>
    );
  }

  // ---- Step: mini explore ----
  if (state.step === "explore") {
    const tabs = [...state.worlds.map((w) => ({ key: w, label: w })), { key: EXPLORE_MORE, label: EXPLORE_MORE }];
    const others = browsableWorlds().filter((w) => !state.worlds.includes(w));
    const isMore = state.activeTab === EXPLORE_MORE;
    const moreWorld = state.shown["__moreWorld"] !== undefined ? others[state.shown["__moreWorld"]] ?? others[0] : others[0];
    const world = isMore ? moreWorld : state.activeTab;
    const all = careersForWorld(world);
    const count = Math.min(all.length, state.shown[world] ?? PAGE_SIZE);
    const visible = all.slice(0, count);
    return (
      <div className="flex flex-col gap-[var(--space-5)] pb-[80px]">
        <StepHeader steps={STEPS} current={1} title="Browse careers picked for your worlds" helper="Six at a time, more as you go. Save anything that interests you (up to 7 across all worlds). You're not choosing yet." />
        <Segmented ariaLabel="World" value={state.activeTab} onChange={(key) => setState((s) => ({ ...s, activeTab: key }))} options={tabs} />
        {isMore && (
          <div className="flex flex-wrap gap-[6px]">
            {others.map((w, i) => (
              <button key={w} type="button" aria-pressed={w === moreWorld} onClick={() => setState((s) => ({ ...s, shown: { ...s.shown, __moreWorld: i } }))} className="dm-quiet cursor-pointer rounded-full border px-[12px] py-[6px] text-[12.5px] font-bold" style={{ borderColor: w === moreWorld ? "var(--primary)" : "var(--glass-border)", background: w === moreWorld ? "color-mix(in srgb, var(--primary) 18%, transparent)" : "transparent", color: "var(--foreground)" }}>{w}</button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3">
          {visible.map((c) => (
            <LabCard key={c.id} career={c} selected={state.saved.includes(c.id)} selectLabel="Save" unselectLabel="Unsave" onToggle={() => toggleSave(c.id)} />
          ))}
        </div>
        {count < all.length ? (
          <div><QuietButton onClick={() => setState((s) => ({ ...s, shown: { ...s.shown, [world]: count + PAGE_SIZE } }))}>Show {Math.min(PAGE_SIZE, all.length - count)} more</QuietButton></div>
        ) : (
          <p className="text-[13px] font-semibold" style={{ color: "var(--muted-foreground)" }}>That{"'"}s every {world} career we have right now.</p>
        )}
        <SavedBar count={state.saved.length} onContinue={() => go("saved")} toast={toast} />
      </div>
    );
  }

  // ---- Step: saved ----
  if (state.step === "saved") {
    return (
      <div className="flex flex-col gap-[var(--space-5)]">
        <StepHeader steps={STEPS} current={2} title={`Saved careers (${savedCareers.length} of ${MAX_SAVED})`} helper="At this stage you're just saying &quot;I'm interested in these.&quot; When you're ready, rank your top three." />
        {savedCareers.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border px-[var(--space-5)] py-[var(--space-6)] text-center" style={CARD}>
            <p className="text-[14px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nothing saved yet. Head back to Mini Explore and save a few.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4">
            {savedCareers.map((c) => (
              <LabCard key={c.id} career={c} selected selectLabel="Save" unselectLabel="Remove from saved" onToggle={() => toggleSave(c.id)} />
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-[10px]">
          <QuietButton onClick={() => go("explore")}>Back to Mini Explore</QuietButton>
          <PrimaryButton disabled={savedCareers.length === 0} onClick={() => go("rank")}>Rank my top 3 <ChevronRight className="h-[16px] w-[16px]" aria-hidden /></PrimaryButton>
        </div>
      </div>
    );
  }

  // ---- Step: rank ----
  if (state.step === "rank") {
    const assign = (id: string) => setState((s) => {
      if (s.rank.includes(id)) return { ...s, rank: s.rank.filter((x) => x !== id) };
      if (s.rank.length >= 3) return s;
      return { ...s, rank: [...s.rank, id] };
    });
    return (
      <div className="flex flex-col gap-[var(--space-5)]">
        <StepHeader steps={STEPS} current={3} title="Choose your #1, #2 and #3" helper="Tap in the order you'd rank them. Tap again to undo. These become your Top 3 in My Profile." />
        <div className="flex gap-[10px]">
          {[0, 1, 2].map((i) => {
            const c = state.rank[i] ? careerById(state.rank[i]) : undefined;
            return (
              <div key={i} className="flex flex-1 items-center gap-[10px] rounded-[var(--radius-md)] border px-[12px] py-[10px]" style={{ ...CARD, borderColor: c ? "var(--primary)" : "var(--glass-border)" }}>
                <span className="flex size-7 flex-none items-center justify-center rounded-full text-[12px] font-extrabold" style={{ background: c ? "var(--primary)" : "var(--glass-surface-2)", color: c ? "#FFFFFF" : "var(--muted-foreground)" }}>#{i + 1}</span>
                <span className="truncate text-[13px] font-semibold" style={{ color: c ? "var(--foreground)" : "var(--muted-foreground)" }}>{c ? c.title : "Tap a career"}</span>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4">
          {savedCareers.map((c) => {
            const pos = state.rank.indexOf(c.id);
            return <LabCard key={c.id} career={c} selected={pos >= 0} selectLabel="Rank next" unselectLabel="Unrank" onToggle={() => assign(c.id)} badge={pos >= 0 ? `#${pos + 1}` : undefined} />;
          })}
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <QuietButton onClick={() => go("saved")}>Back to Saved</QuietButton>
          <PrimaryButton disabled={state.rank.length === 0} onClick={() => go("top3")}>Confirm Top 3 <ChevronRight className="h-[16px] w-[16px]" aria-hidden /></PrimaryButton>
        </div>
      </div>
    );
  }

  // ---- Step: my profile (top 3) ----
  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <StepHeader steps={STEPS} current={4} title="My Profile · Top 3" helper="Your Top 3, with editing made obvious: explore more, pull in a saved career, or remove and replace any pick." />
      <TopThreeScreen
        top3={top3}
        saved={savedCareers}
        onExploreMore={() => go("explore")}
        onOpenSaved={() => go("saved")}
        onRemove={(id) => setState((s) => ({ ...s, rank: s.rank.filter((x) => x !== id) }))}
        onReplace={(outId, inId) => setState((s) => ({ ...s, rank: s.rank.map((x) => (x === outId ? inId : x)) }))}
        replacing={replacing}
        setReplacing={setReplacing}
      />
    </div>
  );
}

function SavedBar({ count, onContinue, toast }: { count: number; onContinue: () => void; toast: string | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[64px] z-10 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-[12px] rounded-full border px-[16px] py-[8px] backdrop-blur-[12px]" style={{ background: "color-mix(in srgb, var(--background) 82%, transparent)", borderColor: "var(--glass-border)" }}>
        <span className="flex items-center gap-[6px] text-[13px] font-bold" style={{ color: "var(--foreground)" }}>
          <Bookmark className="h-[14px] w-[14px]" aria-hidden style={{ color: "var(--primary)" }} /> Saved {count}/{MAX_SAVED}
        </span>
        {toast && <span className="text-[12px] font-semibold" style={{ color: "#F5A623" }}>{toast}</span>}
        <button type="button" onClick={onContinue} disabled={count === 0} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center gap-[4px] rounded-full px-[14px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-40">
          Continue <ChevronRight className="h-[14px] w-[14px]" aria-hidden />
        </button>
      </div>
    </div>
  );
}
