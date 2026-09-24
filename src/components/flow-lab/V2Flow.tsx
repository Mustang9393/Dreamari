"use client";

// DEMO-ONLY: v2 = Joshua's proposal, as written (Slack, 24 Sept 2026):
// BUILD (unchanged) -> MINI EXPLORE -> SAVED CAREERS -> RANK -> MY PROFILE.
// Built faithfully so it can be compared live against v3; the reasoning for
// and against lives in the handoff, not here.
//
// Mini Explore is ordered by the real Build's answers (worlds, subjects,
// college/trades) via rankForStudent, so what shows first is what the
// student said (direct feedback, 25 Sept 2026: "make it so the v2 build
// actually shows relevant options based on what I choose").

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Bookmark } from "lucide-react";
import { Segmented } from "@/components/connect/viz";
import { PATH_OPTIONS, SUBJECTS } from "@/components/build/types";
import { MAX_SAVED, PAGE_SIZE, buildSignals, careerById, exploreMoreWorlds, rankForStudent, readLabState, writeLabState, type BuildSignals, type LabCareer } from "./lab";
import { CARD, ChipRow, InterestPicker, LabCard, PrimaryButton, QuietButton, StepHeader, TopThreeScreen } from "./shared";

type Step = "interests" | "explore" | "saved" | "rank" | "top3";
type State = {
  step: Step;
  worlds: string[];
  subjects: string[];
  path: string;
  fromBuild: boolean;
  activeTab: string;
  moreWorld: string;
  shown: Record<string, number>;
  saved: string[];
  rank: string[];
};
const EMPTY: State = { step: "interests", worlds: [], subjects: [], path: "", fromBuild: false, activeTab: "", moreWorld: "", shown: {}, saved: [], rank: [] };
const STEPS = ["Build", "Mini Explore", "Saved", "Rank", "My Profile"];
const EXPLORE_MORE = "Explore more";

export function V2Flow() {
  const [state, setState] = useState<State>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [replacing, setReplacing] = useState<string | null>(null);

  useEffect(() => {
    const stored = readLabState<State>("v2", EMPTY);
    // Build stays the real Build: the lab picks up everything it saved and
    // only asks when there is nothing, so it can be demoed cold.
    const build = buildSignals();
    let next = stored;
    if (stored.worlds.length === 0 && build.worlds.length > 0) {
      next = { ...stored, worlds: build.worlds, subjects: build.subjects, path: build.path, fromBuild: true, step: "explore" };
    }
    // Always land on the student's own first world, never on a leftover tab.
    if (!next.worlds.includes(next.activeTab) && next.activeTab !== EXPLORE_MORE) next = { ...next, activeTab: next.worlds[0] ?? "" };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage read after mount, same pattern as the counselor version chip
    setState(next);
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
  const signals: BuildSignals = useMemo(() => ({ worlds: state.worlds, subjects: state.subjects, path: state.path }), [state.worlds, state.subjects, state.path]);
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

  // ---- Step: the Build answers (only asked when no Build was saved) ----
  if (state.step === "interests") {
    return (
      <div className="flex flex-col gap-[var(--space-6)]">
        <StepHeader steps={STEPS} current={0} title="What Build already knows" helper="In the real flow these come from Build. Nothing was saved from a Build run on this browser, so answer here to play the flow. Only the worlds are required; subjects and path make the list sharper. This stays inside the lab." />
        <Section title="Worlds" hint="Up to 2, like Build">
          <InterestPicker value={state.worlds} max={2} onChange={(worlds) => setState((s) => ({ ...s, worlds, activeTab: worlds[0] ?? "" }))} />
        </Section>
        <Section title="Favourite subjects" hint="Up to 2, optional">
          <ChipRow ariaLabel="Subjects" options={SUBJECTS.map((x) => ({ key: x, label: x }))} value={state.subjects} max={2} onChange={(subjects) => setState((s) => ({ ...s, subjects }))} />
        </Section>
        <Section title="After high school" hint="Optional">
          <ChipRow ariaLabel="Path" options={PATH_OPTIONS.map((p) => ({ key: p.id, label: p.title }))} value={state.path ? [state.path as "college" | "trades" | "both"] : []} max={1} onChange={([path]) => setState((s) => ({ ...s, path: path ?? "" }))} />
        </Section>
        <div><PrimaryButton disabled={state.worlds.length === 0} onClick={() => go("explore")}>Continue to Mini Explore <ChevronRight className="h-[16px] w-[16px]" aria-hidden /></PrimaryButton></div>
      </div>
    );
  }

  // ---- Step: mini explore ----
  if (state.step === "explore") {
    const tabs = [...state.worlds.map((w) => ({ key: w, label: w })), { key: EXPLORE_MORE, label: EXPLORE_MORE }];
    const others = exploreMoreWorlds(state.worlds);
    const isMore = state.activeTab === EXPLORE_MORE;
    const moreWorld = others.includes(state.moreWorld) ? state.moreWorld : others[0];
    const world = isMore ? moreWorld : state.activeTab;
    const ranked = rankForStudent(world, signals);
    const count = Math.min(ranked.length, state.shown[world] ?? PAGE_SIZE);
    const visible = ranked.slice(0, count);
    const used = [...state.subjects, state.path === "college" ? "College path" : state.path === "trades" ? "Trades path" : ""].filter(Boolean);
    return (
      <div className="flex flex-col gap-[var(--space-5)] pb-[80px]">
        <StepHeader steps={STEPS} current={1} title="Browse careers picked for your worlds" helper="Six at a time, more as you go. Save anything that interests you (up to 7 across all worlds). You're not choosing yet." />
        <div className="flex flex-col gap-[10px]">
          <Segmented ariaLabel="World" value={state.activeTab} onChange={(key) => setState((s) => ({ ...s, activeTab: key }))} options={tabs} />
          {!isMore && (
            <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
              {used.length > 0 ? (
                <>Ordered for you by what you told Build{state.fromBuild ? "" : " here"}: {used.join(" · ")}. Careers that fit those come first.</>
              ) : (
                <>Add subjects or a path in Build and this list reorders around them.</>
              )}
            </p>
          )}
        </div>
        {isMore && (
          <div className="flex flex-col gap-[8px]">
            <p className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Nearest to your worlds first.</p>
            <ChipRow ariaLabel="More worlds" options={others.map((w) => ({ key: w, label: w }))} value={[moreWorld]} max={1} onChange={([w]) => setState((s) => ({ ...s, moreWorld: w ?? others[0] }))} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3">
          {visible.map((r) => (
            <LabCard key={r.career.id} career={r.career} control="save" selected={state.saved.includes(r.career.id)} onToggle={() => toggleSave(r.career.id)} note={r.reason} />
          ))}
        </div>
        {count < ranked.length ? (
          <div><QuietButton onClick={() => setState((s) => ({ ...s, shown: { ...s.shown, [world]: count + PAGE_SIZE } }))}>Show {Math.min(PAGE_SIZE, ranked.length - count)} more</QuietButton></div>
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
              <LabCard key={c.id} career={c} control="save" selected onToggle={() => toggleSave(c.id)} />
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
        <StepHeader steps={STEPS} current={3} title="Choose your #1, #2 and #3" helper="Tap + in the order you'd rank them. Tap again to undo. These become your Top 3 in My Profile." />
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
            return <LabCard key={c.id} career={c} control="pick" selected={pos >= 0} rank={pos >= 0 ? pos + 1 : undefined} onToggle={() => assign(c.id)} />;
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

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[10px]">
      <div className="flex items-baseline gap-[8px]">
        <h2 className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{title}</h2>
        <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{hint}</span>
      </div>
      {children}
    </section>
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
