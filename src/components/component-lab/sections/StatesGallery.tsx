"use client";

// DEMO-ONLY: Component Lab section, "States gallery". Every data-backed
// surface in the app (src/lib/surfaceStates.ts, from the inventory's gap
// analysis) with its loading, slow, error, empty and not-found state, each
// rendered by the same SurfaceStateView the real screen uses through
// <SurfaceState>. Surfaces that already had a distinct treatment keep it
// (the builtX reproductions below, with the real file and URL in the note).

import { useState } from "react";
import { PicksTray } from "@/components/flow-lab/shared";
import { LoadingState, ErrorState, EmptyState } from "@/components/counselor/v4/states";
import { Section, SubHead, Specimen, StateGrid, StateCell, ProposedLoading, ProposedError, ProposedEmpty, ProposedOffline, ProposedLocked, LabScope, LiveRoute, noop, MONO } from "../kit";
import { SurfaceStateView } from "@/components/app/SurfaceState";

const MUTED = { color: "var(--muted-foreground)" } as const;

import { SURFACES, type SurfaceRow } from "@/lib/surfaceStates";

const GROUPS: { label: string; from: number; to: number }[] = [
  { label: "Home and Explore", from: 1, to: 8 },
  { label: "Career", from: 9, to: 11 },
  { label: "Colleges", from: 12, to: 16 },
  { label: "Match", from: 17, to: 18 },
  { label: "Profile and report", from: 19, to: 31 },
  { label: "Resume", from: 32, to: 39 },
  { label: "Connect", from: 40, to: 51 },
  { label: "Play and glossary", from: 52, to: 55 },
  { label: "App chrome", from: 56, to: 57 },
  { label: "Counselor", from: 58, to: 62 },
];

// The six app-wide gaps the inventory found, and where each is now built.
const GLOBAL_PIECES = [
  { label: "Error boundary", file: "src/app/error.tsx", note: "A throw used to blank the screen; now any route shows Something went wrong with Try again." },
  { label: "Not found page", file: "src/app/not-found.tsx", note: "Any unknown URL, and every detail route with an unknown id." },
  { label: "Skeletons and state views", file: "src/components/app/states.tsx", note: "Loading, slow, error, empty (tiers 1 to 6), not found, offline, locked." },
  { label: "One wrapper per surface", file: "src/components/app/SurfaceState.tsx", note: "Real status in production; ?state= to review any state in the demo." },
  { label: "Offline banner", file: "src/components/app/SurfaceState.tsx (OfflineBanner, in the root layout)", note: "Live navigator.onLine; surfaces that can't load show the offline view." },
  { label: "Keyboard focus ring", file: "src/app/globals.css", note: "App-wide :focus-visible ring; components with their own still win." },
];

// ---------------------------------------------------------------------------
// Built-cell reproductions that don't fit a generic Proposed* call: the ones
// with distinctive real copy or a distinctive real shape. Everything else
// "built" reuses ProposedEmpty/ProposedLoading/ProposedError with kind="built"
// and the real copy, since those helpers already model the exact same
// playbook tiers the real components were built from.

function builtLoad(n: number): { node: React.ReactNode; note: string } | undefined {
  switch (n) {
    case 28:
      return { node: <ProposedLoading label="Loading" shape="chip" />, note: "Real treatment is a hand-built row skeleton (three pulsing bars per row); the Working chip stands in here. Live: /profile with ?prefs=loading." };
    case 34:
      return { node: <ProposedLoading label="Checking" shape="button" />, note: "Exact real behavior: the button's icon swaps to a spinning Loader2, disables, and its label becomes \"Checking…\". Live: Resume > ATS Check > Run ATS Check." };
    case 35:
      return { node: <ProposedLoading label="Finding matches" shape="button" />, note: "Exact real behavior, same button-swap pattern. Live: Resume > Job Match > Find Matching Skills." };
    case 36:
      return { node: <ProposedLoading label="Matching" shape="button" />, note: "Exact real behavior, same button-swap pattern. Live: Resume > Choose and Tailor > Match to a Job." };
    case 37:
      return { node: <ProposedLoading label="Generating" shape="button" />, note: "Exact real behavior, same button-swap pattern, plus an AI badge on the button. Live: Resume > an experience entry > Generate Lines." };
    case 38:
      return { node: <ProposedLoading label="Preparing" shape="button" />, note: "Exact real label; the download button reads \"Preparing…\" while disabled. Live: Resume > Export > Download .docx." };
    case 54:
      return {
        node: (
          <div className="flex flex-col items-center gap-[var(--space-2)] text-center">
            <p className="text-[15px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Checking Your Mastery</p>
          </div>
        ),
        note: "Real screen also shows a mascot illustration and a rotating fact card, omitted here. Live: Play > Glossary Game > finish a lesson.",
      };
    case 58:
      return { node: <LoadingState />, note: "The real, exported component, rendered live. See it in the app: any /counselor?view=… URL with ?state=loading." };
    default:
      return undefined;
  }
}

function builtError(n: number): { node: React.ReactNode; note: string } | undefined {
  switch (n) {
    case 28:
      return { node: <ProposedError variant="inline" message="Couldn't save your changes. Your edits are still here." />, note: "Exact real copy. Live: /profile with ?prefs=error, then edit any section and try to save." };
    case 34:
      return { node: <ProposedError variant="inline" message="Couldn't run the check right now. Try again in a moment." />, note: "Exact real copy from resume/ATSCheckPanel.tsx." };
    case 35:
      return { node: <ProposedError variant="inline" message="Couldn't match this job. Try again in a moment." />, note: "Exact real copy from resume/JobMatchPanel.tsx." };
    case 36:
      return { node: <ProposedError variant="inline" message="Couldn't read that job description. Try again in a moment." />, note: "Exact real copy from resume/TailorScreen.tsx." };
    case 37:
      return { node: <ProposedError variant="inline" verb="generate bullets" fallback="write your own" />, note: "Exact real copy from resume/ExperienceModal.tsx." };
    case 48:
      return {
        node: (
          <div className="flex flex-col items-center gap-[6px] text-center">
            <p className="text-[14px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>We couldn&apos;t find that</p>
            <p className="text-[12px] leading-[16px]" style={MUTED}>It may have been removed, or the link might be out of date.</p>
          </div>
        ),
        note: "Real component (ConnectNotFound) also shows an icon and a Back button, omitted here. Live: Connect, open a removed or invalid profile/thread link.",
      };
    case 58:
      return { node: <ErrorState onRetry={noop} />, note: "The real, exported component, rendered live. See it in the app: any /counselor?view=… URL with ?state=error." };
    default:
      return undefined;
  }
}

function builtEmpty(n: number): { node: React.ReactNode; note: string } | undefined {
  switch (n) {
    case 7:
      return { node: <ProposedEmpty tier={5} query="welder" />, note: "Exact real copy from app/GlobalSearch.tsx." };
    case 9:
      return { node: <ProposedEmpty tier={6} />, note: "Exact literal string from career/CareerDetailExperience.tsx, shown per-section for thin, catalog-only careers." };
    case 18:
      return { node: <PicksTray saved={[]} max={3} />, note: "The real, exported component, rendered live with nothing saved." };
    case 19:
      return { node: <ProposedEmpty tier={1} heading="Nothing saved yet" line="Add up to 3 careers, then pick one to start with." cta="Add a career" />, note: "Exact real copy from profile/ProfileExperience.tsx Top3Tab." };
    case 20:
      return { node: <ProposedEmpty tier={1} heading="Nothing saved yet" line="Browse some careers and save the ones you want to look at properly. Your profile builds itself from there." cta="Browse careers" />, note: "Real component (NothingSavedYet) also offers a second \"Open Saved\" shortcut, omitted here." };
    case 24:
      return { node: <ProposedEmpty tier={2} heading="No versions yet." />, note: "Real box uses a solid border, not dashed, and no CTA (a Save button sits above it instead). Live: Profile > Career Report > History." };
    case 25:
      return { node: <ProposedEmpty tier={3} line="Nothing added yet, log a job shadow, project, or conversation." />, note: "Exact real copy from profile/CareerExploration.tsx." };
    case 26:
      return { node: <ProposedEmpty tier={2} heading="No schools saved yet" cta="Browse schools" />, note: "Exact real copy from ProfileExperience.tsx (Locker's SchoolsShelf); the same tier applies to the other three shelves with different nouns." };
    case 29:
      return { node: <ProposedEmpty tier={2} heading="No stubs yet" cta="See events" />, note: "Exact real copy from profile/EventStubs.tsx." };
    case 31:
      return { node: <ProposedEmpty tier={4} heading="No matches yet" line="Save up to three careers in Match, and they show up here to choose from." cta="Go to Match" />, note: "Exact real copy from report/ReportChooser.tsx." };
    case 33:
      return { node: <ProposedEmpty tier={3} line="Nothing added yet" />, note: "Real hint (EmptyHint) is smaller and italic; this is the same wording in the gallery's plain tier 3 shape." };
    case 39:
      return {
        node: (
          <button type="button" onClick={noop} className="dm-tap flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-lg)] border py-[var(--space-4)] text-[13.5px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
            + Add Education
          </button>
        ),
        note: "Real pattern (EmptyStateAdd): the empty state IS the add button, not a separate message. Same shape used for Experience and Certifications.",
      };
    case 44:
      return { node: <ProposedEmpty tier={3} line="No answers yet." />, note: "Closest real pattern in connect/ProProfile.tsx (a pro's Ask Me answers list, which is what feeds New from following)." };
    case 46:
      return { node: <ProposedEmpty tier={3} line="No questions here yet. Yours could be the first." />, note: "Real card also lists 2 to 3 starter prompts under the line, omitted here. Exact copy from connect/ConnectExperience.tsx." };
    case 58:
      return { node: <EmptyState view="overview" />, note: "The real, exported component, rendered live for the Overview screen. See it in the app: /counselor?view=overview&state=empty." };
    case 60:
      return {
        node: (
          <div className="relative flex w-full flex-col gap-[8px] py-[4px]">
            {[92, 100, 88, 0, 96].map((w, i) => (w === 0 ? <span key={i} className="h-[6px]" /> : <span key={i} className="block h-[7px] rounded-full" style={{ width: `${w}%`, background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} />))}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border px-[10px] py-[4px] text-[11px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--card)", color: "var(--muted-foreground)" }}>Choose a student to begin</span>
            </span>
          </div>
        ),
        note: "Exact real copy and layout (Ghost placeholder lines with a centered hint) from counselor/v4/DocumentDesk.tsx.",
      };
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// Cells. Every state is built: a surface that had its own treatment before
// 27 Sept keeps it (the builtX reproductions above); every other state is
// the real SurfaceStateView with that surface's registry copy, exactly what
// the screen renders through <SurfaceState>.

// Detail routes that load one record by id get a not-found state.
const NOT_FOUND: Record<number, string> = { 9: "career", 15: "college", 23: "report", 44: "profile", 47: "question", 53: "simulation", 54: "lesson", 60: "document" };

/** Where to see a surface live, for the "?state=" review switch. */
function routeFor(row: SurfaceRow): string {
  const f = row.file;
  if (f.startsWith("career/")) return "/career/software-engineer";
  if (f.startsWith("colleges/")) return "/colleges";
  if (f.startsWith("profile/") || f.startsWith("report/")) return "/profile";
  if (f.startsWith("resume/")) return "/resume-builder";
  if (f.startsWith("connect/")) return "/connect";
  if (f.startsWith("play/") || f.startsWith("glossary/")) return "/play";
  if (f.startsWith("counselor/")) return "/counselor";
  if (f.startsWith("flow-lab/")) return "/flow-lab";
  if (f.includes("Explore")) return "/explore";
  return "/home";
}

type CellState = "loading" | "slow" | "error" | "empty" | "notfound";
const LABEL: Record<CellState, string> = { loading: "Loading", slow: "Slow connection", error: "Error", empty: "Empty", notfound: "Not found (404)" };

function Cell({ row, state }: { row: SurfaceRow; state: CellState }) {
  const key = state === "loading" || state === "slow" ? "load" : state === "error" ? "error" : state === "empty" ? "empty" : null;
  if (key && row[key] === "na")
    return (
      <StateCell label={`${LABEL[state]} · n/a`} minH={96}>
        <p className="text-center text-[12.5px] leading-[18px]" style={MUTED}>Not applicable</p>
      </StateCell>
    );
  const own = state === "loading" && row.load === "built" ? builtLoad(row.n) : state === "error" && row.error === "built" ? builtError(row.n) : state === "empty" && row.empty === "built" ? builtEmpty(row.n) : undefined;
  const live = `${routeFor(row)}?state=${state}&surface=${row.n}`;
  return (
    <StateCell label={LABEL[state]} minH={96} note={own?.note ?? <>Live: <code style={MONO}>{live}</code></>}>
      {own?.node ?? <SurfaceStateView id={row.n} state={state} what={NOT_FOUND[row.n]} />}
    </StateCell>
  );
}

function SurfaceBlock({ row }: { row: SurfaceRow }) {
  const states: CellState[] = ["loading", "slow", "error", "empty", ...(NOT_FOUND[row.n] ? (["notfound"] as const) : [])];
  return (
    <LabScope name={`${row.n} ${row.surface}`}>
      <article className="flex flex-col gap-[var(--space-2)]">
        <header className="flex flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[2px]">
          <h4 className="text-[14.5px] leading-[19px] font-bold">
            #{row.n} {row.surface}
          </h4>
          <code className="min-w-0 text-[11px] leading-[15px] break-all" style={{ ...MONO, ...MUTED }}>
            {row.file}
          </code>
        </header>
        <StateGrid min={220}>
          {states.map((st) => (
            <Cell key={st} row={row} state={st} />
          ))}
        </StateGrid>
      </article>
    </LabScope>
  );
}

// ---------------------------------------------------------------------------
// Headline: every state defined and built, against where it stood before.

function CountsTable() {
  const before = (key: "load" | "error" | "empty") => SURFACES.filter((r) => r[key] === "built").length;
  const applicable = (key: "load" | "error" | "empty") => SURFACES.filter((r) => r[key] !== "na").length;
  const rows = [
    { label: "Loading", now: applicable("load"), was: before("load") },
    { label: "Slow connection", now: applicable("load"), was: 0 },
    { label: "Error / retry", now: applicable("error"), was: before("error") },
    { label: "Empty", now: applicable("empty"), was: before("empty") },
    { label: "Not found", now: Object.keys(NOT_FOUND).length, was: 1 },
  ];
  return (
    <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 xl:grid-cols-5">
      {rows.map((r) => (
        <div key={r.label} className="rounded-[var(--radius-md)] border p-[var(--space-3)]" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--card) 70%, transparent)" }}>
          <p className="text-[11.5px] font-bold tracking-[0.04em] uppercase" style={MUTED}>
            {r.label}
          </p>
          <p className="mt-[4px] text-[22px] leading-[1] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            {r.now}
            <span className="text-[13px] font-semibold" style={MUTED}> / {r.now} built</span>
          </p>
          <div className="mt-[8px] h-[6px] overflow-hidden rounded-full" style={{ background: "var(--color-feedback-success, #3ecf8e)" }} aria-hidden />
          <p className="mt-[6px] text-[12px] leading-[17px]" style={MUTED}>
            {r.was} before 27 Sept
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatesGallerySection() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = SURFACES.filter((row) => q === "" || row.surface.toLowerCase().includes(q) || String(row.n) === q);
  const visibleIds = new Set(visible.map((r) => r.n));

  return (
    <Section id="states" title="States gallery" intro="Every data-backed surface in the app with its loading, slow connection, error, empty and (for detail routes) not found state, as the real screen renders it. Each screen wraps its content in SurfaceState, so any state can be seen live with the URL under its cell.">
      <div className="flex flex-col gap-[var(--space-5)]">
        <CountsTable />

        <Specimen name="App-wide pieces" file="src/app, src/components/app" purpose="The six app-wide gaps the inventory found, each now built once for every screen." when="Production wires real request status into SurfaceState; these pieces cover everything else.">
          <StateGrid min={260}>
            {GLOBAL_PIECES.map((g) => (
              <StateCell key={g.label} label={g.label} minH={72} note={<code style={MONO}>{g.file}</code>}>
                <p className="text-[13px] leading-[19px]">{g.note}</p>
              </StateCell>
            ))}
            <StateCell label="Offline banner" note="Shows app-wide while navigator.onLine is false. Live: any page with ?state=offline.">
              <ProposedOffline variant="banner" />
            </StateCell>
            <StateCell label="Something went wrong" note="src/app/error.tsx, the route error boundary.">
              <ProposedError message="Something went wrong." />
            </StateCell>
            <StateCell label="Page not found" note="src/app/not-found.tsx, rendered live.">
              <LiveRoute href="/this-page-does-not-exist" device="mobile" height={360} />
            </StateCell>
            <StateCell label="Locked" note="LockedView, for anything not unlocked yet.">
              <ProposedLocked cta="See what unlocks it" />
            </StateCell>
          </StateGrid>
        </Specimen>

        <label className="relative block max-w-[420px]">
          <span className="sr-only">Find a surface</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a surface by name or number"
            className="w-full rounded-full border px-[14px] py-[8px] text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}
          />
        </label>

        {GROUPS.map((g) => {
          const rows = SURFACES.filter((r) => r.n >= g.from && r.n <= g.to && visibleIds.has(r.n));
          if (!rows.length) return null;
          return (
            <div key={g.label} className="flex flex-col gap-[var(--space-5)]">
              <SubHead>{g.label}</SubHead>
              {rows.map((r) => (
                <SurfaceBlock key={r.n} row={r} />
              ))}
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-[13px]" style={MUTED}>
            Nothing matches &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </div>
    </Section>
  );
}
