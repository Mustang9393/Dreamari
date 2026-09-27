"use client";

// DEMO-ONLY: Component Lab section, "States gallery". A single data-driven
// sweep of every data-backed surface in the app (docs/handoff/COMPONENT_INVENTORY.md,
// section 1: the gap analysis) with its loading, error and empty state next
// to each other, so Usman can see what's built versus what's still the
// playbook default (docs/COMPONENT_STATES_PLAYBOOK.md) in one page instead
// of reading two docs. The 62 rows and their built/missing marks are copied
// from the inventory's table 1:1; only the copy for a "missing" cell (what
// the eventual empty/error text should say) is authored here, since the
// real code has none yet.
//
// Two rows use the real, safely-exported components: `PicksTray` (row 18)
// and the counselor v2 `LoadingState` / `ErrorState` / `EmptyState` (row 58,
// the one screen with all three states already built end-to-end). Every
// other "built" cell is a faithful static reproduction using the same
// Proposed* helpers the rest of the lab uses for playbook defaults, labelled
// kind="built" and noted with the real file and a query string to see it
// live, rather than exporting internal, file-local functions across a dozen
// feature files just for this gallery.

import { useState } from "react";
import { PicksTray } from "@/components/flow-lab/shared";
import { LoadingState, ErrorState, EmptyState } from "@/components/counselor/v2/states";
import { Section, SubHead, Specimen, StateGrid, StateCell, ProposedLoading, ProposedError, ProposedEmpty, ProposedSlow, ProposedOffline, ProposedNotFound, ProposedLocked, LabScope, noop, MONO } from "../kit";

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

const GLOBAL_GAPS = [
  "No error boundary anywhere. A component that throws blanks the screen.",
  "No shared skeleton component. Loading falls back to the Working chip.",
  "No route-level loading.tsx or error.tsx on any route.",
  "No offline handling. There is no navigator.onLine check and no banner.",
  "Toasts are success/undo only. There is no error toast pattern.",
  "Pluralisation is hand-branched per string, with no shared helper.",
];

const RECOMMENDED_ORDER = [
  "Global first: an error boundary with a route error.tsx, a shared Skeleton, and route loading.tsx files. These cover every surface at once.",
  "Surfaces that go blank with no data: #17 Match, #21 Routes, #23 Career Report, #55 Levels. Today these are silent blanks, the worst failure mode.",
  "Feeds that will be the first real network calls: Home rails, Explore feed, Connect feeds, Colleges.",
  "A ?state= switch per student screen, like the counselor one, so every state is reviewable in the demo without code.",
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
        note: "Exact real copy and layout (Ghost placeholder lines with a centered hint) from counselor/v2/DocumentDesk.tsx.",
      };
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// Generic cells for "missing" and "na" rows, and the block that ties one
// surface's three cells together.

function NaCell({ label }: { label: string }) {
  return (
    <StateCell label={`${label} · n/a`} kind="built" minH={96}>
      <p className="text-center text-[12.5px] leading-[18px]" style={MUTED}>Not applicable</p>
    </StateCell>
  );
}

function LoadCell({ row }: { row: SurfaceRow }) {
  if (row.load === "na") return <NaCell label="Loading" />;
  if (row.load === "missing")
    return (
      <StateCell label="Loading" kind="proposed" minH={96} note="Playbook default: no real loading state exists for this surface yet.">
        <ProposedLoading label={row.loadLabel ?? "Loading"} shape={row.loadShape ?? "chip"} />
      </StateCell>
    );
  const b = builtLoad(row.n);
  return (
    <StateCell label="Loading" kind="built" minH={96} note={b?.note}>
      {b?.node ?? <p className="text-center text-[12.5px]" style={MUTED}>See {row.file}.</p>}
    </StateCell>
  );
}

function ErrorCell({ row }: { row: SurfaceRow }) {
  if (row.error === "na") return <NaCell label="Error" />;
  if (row.error === "missing")
    return (
      <StateCell label="Error" kind="proposed" minH={96} note={"Playbook default: \"Couldn't [verb]. Try again[, or fallback].\""}>

        <ProposedError verb={row.errorVerb ?? "load this"} fallback={row.errorFallback} />
      </StateCell>
    );
  const b = builtError(row.n);
  return (
    <StateCell label="Error" kind="built" minH={96} note={b?.note}>
      {b?.node ?? <p className="text-center text-[12.5px]" style={MUTED}>See {row.file}.</p>}
    </StateCell>
  );
}

function EmptyCell({ row }: { row: SurfaceRow }) {
  if (row.empty === "na") return <NaCell label="Empty" />;
  if (row.empty === "missing") {
    const c = row.emptyCopy ?? {};
    return (
      <StateCell label="Empty" kind="proposed" minH={96} note={`Playbook tier ${row.emptyTier ?? 1}.`}>
        <ProposedEmpty tier={row.emptyTier ?? 1} heading={c.heading} line={c.line} cta={c.cta} query={c.query} />
      </StateCell>
    );
  }
  const b = builtEmpty(row.n);
  return (
    <StateCell label="Empty" kind="built" minH={96} note={b?.note}>
      {b?.node ?? <p className="text-center text-[12.5px]" style={MUTED}>See {row.file}.</p>}
    </StateCell>
  );
}

// Detail routes that load one record by id: each needs a 404 for a
// removed record or a stale link. Only Connect has one built (#48).
const NOT_FOUND: Record<number, string> = { 9: "career", 15: "college", 23: "report", 44: "profile", 47: "question", 53: "simulation", 54: "lesson", 60: "document" };

function SlowCell({ row }: { row: SurfaceRow }) {
  if (row.load === "na") return null;
  const shape = row.loadShape === "button" ? "chip" : (row.loadShape ?? "chip");
  return (
    <StateCell label="Slow connection" kind="proposed" minH={96} note="No slow-network treatment exists anywhere yet. After ~4s the skeleton stays and a retry appears.">
      <ProposedSlow label={row.loadLabel ?? "Loading"} shape={shape} />
    </StateCell>
  );
}

function NotFoundCell({ row }: { row: SurfaceRow }) {
  const what = NOT_FOUND[row.n];
  if (!what) return null;
  return (
    <StateCell label="Not found (404)" kind="proposed" minH={96} note="A removed record or an out-of-date link. Copy matches the built ConnectNotFound (#48).">
      <ProposedNotFound what={what} />
    </StateCell>
  );
}

function SurfaceBlock({ row }: { row: SurfaceRow }) {
  return (
    <LabScope name={`${row.n} ${row.surface}`}>
    <article className="flex flex-col gap-[var(--space-2)]">
      <header className="flex flex-col gap-[2px]">
        <div className="flex flex-wrap items-baseline gap-x-[var(--space-2)] gap-y-[2px]">
          <h4 className="text-[14.5px] leading-[19px] font-bold">
            #{row.n} {row.surface}
          </h4>
          <code className="min-w-0 text-[11px] leading-[15px] break-all" style={{ ...MONO, ...MUTED }}>
            {row.file}
          </code>
        </div>
        {row.note && (
          <p className="text-[12px] leading-[16px]" style={MUTED}>
            {row.note}
          </p>
        )}
      </header>
      <StateGrid min={200}>
        <LoadCell row={row} />
        <SlowCell row={row} />
        <ErrorCell row={row} />
        <EmptyCell row={row} />
        <NotFoundCell row={row} />
      </StateGrid>
    </article>
    </LabScope>
  );
}

// ---------------------------------------------------------------------------
// Counts, filter row, and the section itself.

function countStatus(rows: SurfaceRow[], key: "load" | "error" | "empty") {
  const built = rows.filter((r) => r[key] === "built").length;
  return { built, missing: rows.length - built };
}

function CountsTable() {
  const load = countStatus(SURFACES, "load");
  const error = countStatus(SURFACES, "error");
  const empty = countStatus(SURFACES, "empty");
  const allThree = SURFACES.filter((r) => r.load === "built" && r.error === "built" && r.empty === "built").length;
  const rows: { label: string; built: number; missing: number }[] = [
    { label: "Loading", built: load.built, missing: load.missing },
    { label: "Error / retry", built: error.built, missing: error.missing },
    { label: "Empty", built: empty.built, missing: empty.missing },
    { label: "All three", built: allThree, missing: SURFACES.length - allThree },
  ];
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <div className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4">
        {rows.map((r) => (
          <div key={r.label} className="rounded-[var(--radius-md)] border p-[var(--space-3)]" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--card) 70%, transparent)" }}>
            <p className="text-[11.5px] font-bold tracking-[0.04em] uppercase" style={MUTED}>
              {r.label}
            </p>
            <p className="mt-[4px] text-[22px] leading-[1] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              {SURFACES.length}
              <span className="text-[13px] font-semibold" style={MUTED}> / {SURFACES.length} defined</span>
            </p>
            <div className="mt-[8px] flex h-[6px] overflow-hidden rounded-full" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }} aria-hidden>
              <span style={{ width: `${(r.built / SURFACES.length) * 100}%`, background: "var(--color-feedback-success, #3ecf8e)" }} />
              <span style={{ width: `${(r.missing / SURFACES.length) * 100}%`, background: "color-mix(in srgb, var(--primary) 70%, transparent)" }} />
            </div>
            <p className="mt-[6px] text-[12px] leading-[17px]" style={MUTED}>
              <span className="font-semibold" style={{ color: "var(--color-feedback-success, #3ecf8e)" }}>{r.built} built in the app</span> · <span className="font-semibold" style={{ color: "var(--primary)" }}>{r.missing} designed here</span>
            </p>
          </div>
        ))}
      </div>
      <p className="text-[12px] leading-[17px]" style={MUTED}>
        Every state is now defined. &ldquo;Designed here&rdquo; states exist only in this lab so far: they are the spec for production to build, not yet wired into the prototype&apos;s screens.
      </p>
    </div>
  );
}

type FilterMode = "all" | "missingAny" | "full";

function matchesFilter(row: SurfaceRow, mode: FilterMode): boolean {
  if (mode === "all") return true;
  const hasMissing = row.load === "missing" || row.error === "missing" || row.empty === "missing";
  return mode === "missingAny" ? hasMissing : !hasMissing;
}

export function StatesGallerySection() {
  const [mode, setMode] = useState<FilterMode>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = SURFACES.filter((row) => matchesFilter(row, mode) && (q === "" || row.surface.toLowerCase().includes(q)));
  const visibleIds = new Set(visible.map((r) => r.n));

  return (
    <Section
      id="states"
      title="States gallery"
      intro="Every data-backed surface in the app (docs/handoff/COMPONENT_INVENTORY.md), with its loading, slow connection, error, empty and (for detail routes) not found state side by side. Built states are the real thing or a faithful reproduction of it; proposed states are the playbook default (docs/COMPONENT_STATES_PLAYBOOK.md), not built yet."
    >
      <div className="flex flex-col gap-[var(--space-4)]">
        <CountsTable />

        <div className="flex flex-col gap-[6px]">
          <p className="text-[12.5px] font-bold" style={MUTED}>
            Global gaps (nothing exists anywhere for these yet)
          </p>
          <ul className="flex flex-col gap-[4px] pl-[18px] text-[12.5px] leading-[18px]" style={{ listStyleType: "disc" }}>
            {GLOBAL_GAPS.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>

        <Specimen name="App-wide system states" file="(none built yet)" purpose="States that belong to the whole app, not one surface: no connection, a slow network, a route that doesn't exist, something locked, and a render that throws." when="Build these once, globally, before per-surface states: they cover every screen at the same time.">
          <StateGrid min={240}>
            <StateCell label="Offline banner" kind="proposed" note="Sits under the header app-wide while navigator.onLine is false."><ProposedOffline variant="banner" /></StateCell>
            <StateCell label="Offline, whole surface" kind="proposed" note="For a surface that can't work at all without a connection."><ProposedOffline /></StateCell>
            <StateCell label="Slow connection" kind="proposed" note="After ~4s of loading. The skeleton stays; the retry is optional."><ProposedSlow label="Loading" shape="document" /></StateCell>
            <StateCell label="Page not found (404)" kind="proposed" note="Route-level not-found.tsx; same copy as ConnectNotFound."><ProposedNotFound /></StateCell>
            <StateCell label="Something went wrong" kind="proposed" note="Error boundary fallback (route error.tsx). Today a thrown render blanks the screen."><ProposedError message="Something went wrong." verb="" icon={undefined} /></StateCell>
            <StateCell label="Locked / no access" kind="proposed" note="Not unlocked yet, or a role that can't see it. Same lock language as PlayHub's CornerBadge."><ProposedLocked cta="See what unlocks it" /></StateCell>
          </StateGrid>
        </Specimen>

        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <div role="group" aria-label="Filter surfaces" className="flex flex-wrap gap-[6px]">
            {([
              { key: "all", label: "All" },
              { key: "missingAny", label: "Missing any state" },
              { key: "full", label: "Fully covered" },
            ] as const).map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={mode === f.key}
                onClick={() => setMode(f.key)}
                className="dm-tap cursor-pointer rounded-full border px-[12px] py-[6px] text-[12.5px] font-bold"
                style={{
                  borderColor: mode === f.key ? "var(--primary)" : "var(--glass-border)",
                  background: mode === f.key ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "var(--glass-surface-2)",
                  color: mode === f.key ? "var(--primary)" : "var(--foreground)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <label className="flex min-w-[180px] flex-1 items-center gap-[6px]">
            <span className="sr-only">Search surfaces</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search surface name…"
              className="w-full rounded-[var(--radius-md)] border px-[10px] py-[6px] text-[13px] outline-none focus:border-[var(--primary)]"
              style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }}
            />
          </label>
          <span className="text-[12px]" style={MUTED}>
            {visible.length} of {SURFACES.length}
          </span>
        </div>

        {GROUPS.map((g) => {
          const rows = SURFACES.filter((r) => r.n >= g.from && r.n <= g.to && visibleIds.has(r.n));
          if (rows.length === 0) return null;
          return (
            <div key={g.label} className="flex flex-col gap-[var(--space-4)]">
              <SubHead>{g.label}</SubHead>
              {rows.map((row) => (
                <SurfaceBlock key={row.n} row={row} />
              ))}
            </div>
          );
        })}

        <div className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: "var(--border)" }}>
          <p className="text-[13.5px] font-bold">Recommended order to close the gaps</p>
          <ol className="flex flex-col gap-[6px] pl-[20px] text-[12.5px] leading-[18px]" style={{ listStyleType: "decimal" }}>
            {RECOMMENDED_ORDER.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
