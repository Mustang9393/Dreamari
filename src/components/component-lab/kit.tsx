"use client";

// DEMO-ONLY: the Component Lab's own building blocks. Not part of the app.
// Every section file composes these so the whole lab reads as one system:
// a Specimen per component, a StateGrid of labelled cells per state, and
// the playbook's proposed defaults (docs/COMPONENT_STATES_PLAYBOOK.md) for
// any state the real component doesn't implement yet.

import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";

export const noop = () => {};
export const MONO: CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const MUTED: CSSProperties = { color: "var(--muted-foreground)" };

/** One top-level lab section. `id` is the scroll-spy anchor. */
export function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-[128px] border-t pt-[var(--space-8)] pb-[var(--space-10)] first:border-t-0 first:pt-0 lg:scroll-mt-[88px]" style={{ borderColor: "var(--border)" }}>
      <h2 id={`${id}-title`} className="text-[26px] leading-[1.1] font-extrabold sm:text-[30px]" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h2>
      {intro && (
        <p className="mt-[var(--space-2)] max-w-[68ch] text-[14px] leading-[21px]" style={MUTED}>
          {intro}
        </p>
      )}
      <div className="mt-[var(--space-6)] flex flex-col gap-[var(--space-8)]">{children}</div>
    </section>
  );
}

/** A small sub-heading inside a section (e.g. "Profile" inside Feature modules). */
export function SubHead({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[18px] leading-[24px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
      {children}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Lab-wide view state. `grid` is the header's Adaptive / One per row choice.
// `solo` is set only inside the full-screen preview's iframe
// (/component-lab?solo=<id>): the whole lab tree renders hidden and the one
// Specimen or StateCell whose id matches portals itself into `soloRoot`, so
// the iframe's own width drives every media query exactly like a device.

//
// `scale` is the header's All / Core kit / Bespoke filter (9 Oct 2026,
// Chandu: "have flag on that component if its in the library and have a
// version of the ui components without those animations"). A Specimen or
// StateCell tagged with a different scale renders nothing; untagged ones
// (everything outside Game UI) always show. One exception: the Bespoke view
// keeps core cells, because a bespoke piece is shown BESIDE its core
// fallback and hiding the fallback would defeat the comparison.

/** Core: a data-driven piece that scales to every career by content
 *  alone. Bespoke: a hand-drawn instrument, animation or per-career art
 *  that one career gets and 900 can't (src/components/play/coreKit.ts). */
export type Scale = "core" | "bespoke";
export type ScaleFilter = "all" | Scale;

export type LabView = { grid: "auto" | "wide"; scale: ScaleFilter; solo: string | null; soloRoot: HTMLElement | null; openPreview: (id: string, title: string) => void };
export const LabViewContext = createContext<LabView>({ grid: "auto", scale: "all", solo: null, soloRoot: null, openPreview: noop });

/** True when the current filter hides something tagged `scale`. */
function filteredOut(view: LabView, scale?: Scale) {
  return view.scale !== "all" && !!scale && scale !== view.scale;
}

/** "Core kit" in the calm success tone, "Bespoke" in the warning tone. */
export function ScaleBadge({ scale }: { scale: Scale }) {
  const core = scale === "core";
  return (
    <span
      data-scale-badge={scale}
      className="inline-flex shrink-0 items-center rounded-full px-[7px] py-[1px] text-[10.5px] leading-[15px] font-bold whitespace-nowrap"
      style={{ color: core ? "var(--color-feedback-success)" : "var(--color-feedback-warning)", background: core ? "var(--color-feedback-success-subtle)" : "var(--color-feedback-warning-subtle)" }}
    >
      {core ? "Core kit" : "Bespoke"}
    </span>
  );
}
const ScopeContext = createContext<{ id: string; target: boolean }>({ id: "lab", target: false });

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Names the cells inside it for the full-screen preview, for groups of
 *  StateCells that aren't wrapped in a Specimen (the States gallery rows). */
export function LabScope({ name, children }: { name: string; children: ReactNode }) {
  const view = useContext(LabViewContext);
  const id = slug(name);
  if (view.solo && view.solo === id && view.soloRoot) return createPortal(<ScopeContext.Provider value={{ id, target: true }}>{children}</ScopeContext.Provider>, view.soloRoot);
  return <ScopeContext.Provider value={{ id, target: false }}>{children}</ScopeContext.Provider>;
}

function ExpandButton({ id, title }: { id: string; title: string }) {
  const { openPreview } = useContext(LabViewContext);
  return (
    <IconTip label="Full-screen preview">
      <button type="button" aria-label={`Full-screen preview: ${title}`} onClick={() => openPreview(id, title)} className="dm-quiet flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
        <Maximize2 className="h-[13px] w-[13px]" aria-hidden />
      </button>
    </IconTip>
  );
}

/** One component: name, where it lives, what it's for, when to reach for it,
 *  then its states. `file` is relative to the repo root. */
export function Specimen({ name, file, purpose, when, scale, fallback, children }: { name: string; file: string; purpose: string; when?: string; scale?: Scale; fallback?: ReactNode; children: ReactNode }) {
  const view = useContext(LabViewContext);
  const id = slug(name);
  if (filteredOut(view, scale)) return null;
  const article = (
    <article id={`spec-${id}`} data-spec={name} data-scale={scale} className="flex scroll-mt-[136px] flex-col gap-[var(--space-3)] lg:scroll-mt-[80px]">
      <header className="flex flex-col gap-[4px]">
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-[var(--space-3)] gap-y-[2px]">
            <h4 className="text-[16px] leading-[22px] font-bold">{name}</h4>
            <span className="flex min-w-0 items-center gap-[8px]">
              {scale && <ScaleBadge scale={scale} />}
              <code className="min-w-0 text-[11.5px] leading-[16px] break-all" style={{ ...MONO, ...MUTED }}>
                {file}
              </code>
            </span>
          </div>
          {!view.solo && <ExpandButton id={id} title={name} />}
        </div>
        <p className="max-w-[72ch] text-[13.5px] leading-[20px]">{purpose}</p>
        {scale === "bespoke" && fallback && (
          <p className="max-w-[72ch] text-[12.5px] leading-[18px]" style={MUTED}>
            <span className="font-semibold">Core fallback:</span> {fallback}
          </p>
        )}
        {when && (
          <p className="max-w-[72ch] text-[12.5px] leading-[18px]" style={MUTED}>
            <span className="font-semibold">When to use:</span> {when}
          </p>
        )}
      </header>
      {children}
    </article>
  );
  if (view.solo) {
    if (view.solo === id && view.soloRoot) return createPortal(<ScopeContext.Provider value={{ id, target: true }}>{article}</ScopeContext.Provider>, view.soloRoot);
    return <ScopeContext.Provider value={{ id, target: false }}>{children}</ScopeContext.Provider>;
  }
  return <ScopeContext.Provider value={{ id, target: false }}>{article}</ScopeContext.Provider>;
}

/** Responsive grid of state cells. `min` is each cell's minimum width;
 *  the header's "One per row" gives every cell the full column. */
export function StateGrid({ children, min = 240 }: { children: ReactNode; min?: number }) {
  const { grid } = useContext(LabViewContext);
  return (
    <div className="grid gap-[var(--space-3)]" style={{ gridAutoFlow: "row dense", gridTemplateColumns: grid === "wide" ? "minmax(0, 1fr)" : `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }}>
      {children}
    </div>
  );
}

export type CellKind = "built" | "proposed";

/** One state of one component. `kind="proposed"` marks a playbook default
 *  that is NOT implemented in the real component yet. */
/** A ClippedStage inside a cell calls this: full-screen layers (nav bars,
 *  docked panels, backdrops) always get the whole row. */
const CellFullContext = createContext<(() => void) | null>(null);

/** How many grid columns a cell needs. The content never renders narrower
 *  than its own min-content width, so if it overflows at one column that
 *  overflow IS its real minimum: span just enough columns to fit it, and
 *  let `grid-auto-flow: dense` backfill the gap with small cells. */
function useSmartSpan(enabled: boolean) {
  const figRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const need = useRef(0);
  const [full, setFull] = useState(false);
  const [span, setSpan] = useState(1);
  const requestFull = useCallback(() => setFull(true), []);
  useLayoutEffect(() => {
    const fig = figRef.current;
    const body = bodyRef.current;
    const grid = fig?.parentElement;
    if (!enabled || !fig || !body || !grid) return;
    const measure = () => {
      const cs = getComputedStyle(grid);
      const tracks = cs.gridTemplateColumns.split(" ").map(parseFloat).filter((n) => n > 0);
      const cols = tracks.length || 1;
      const track = tracks[0] || fig.clientWidth;
      const gap = parseFloat(cs.columnGap) || 0;
      if (body.scrollWidth > body.clientWidth + 1) need.current = Math.max(need.current, body.scrollWidth + 2);
      let n = 1;
      if (full) n = cols;
      else while (n < cols && n * track + (n - 1) * gap < need.current) n++;
      setSpan(n);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    ro.observe(body);
    if (body.firstElementChild) ro.observe(body.firstElementChild);
    return () => ro.disconnect();
  }, [enabled, full]);
  return { figRef, bodyRef, span, requestFull };
}

/** One state of one component. `kind="proposed"` marks a playbook default
 *  that is NOT implemented in the real component yet. */
export function StateCell({ label, kind = "built", scale, note, children, pad = true, minH = 120, surface = "card" }: { label: string; kind?: CellKind; scale?: Scale; note?: ReactNode; children: ReactNode; pad?: boolean; minH?: number; surface?: "card" | "page" | "game" }) {
  const view = useContext(LabViewContext);
  const scope = useContext(ScopeContext);
  const id = `${scope.id}--${slug(label)}`;
  const proposed = kind === "proposed";
  const bg = surface === "page" ? "var(--background)" : surface === "game" ? "#070914" : "color-mix(in srgb, var(--card) 70%, transparent)";
  const hidden = view.scale === "bespoke" ? false : filteredOut(view, scale);
  const soloHidden = !!view.solo && !scope.target;
  const { figRef, bodyRef, span, requestFull } = useSmartSpan(!soloHidden && !hidden);
  if (hidden) return null;
  if (soloHidden) {
    if (view.solo !== id || !view.soloRoot) return null;
    return createPortal(<div style={{ background: surface === "game" ? bg : undefined }}>{children}</div>, view.soloRoot);
  }
  return (
    <figure ref={figRef} className="m-0 flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ gridColumn: span > 1 ? `span ${span}` : undefined, borderColor: proposed ? "color-mix(in srgb, var(--primary) 45%, transparent)" : "var(--border)", borderStyle: proposed ? "dashed" : "solid" }}>
      <figcaption className="flex items-center gap-[6px] border-b px-[var(--space-3)] py-[6px]" style={{ borderColor: "var(--border)" }}>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[6px]">
          <StateChip>{label}</StateChip>
          <KindBadge kind={kind} />
          {scale && <ScaleBadge scale={scale} />}
        </div>
        {!view.solo && <ExpandButton id={id} title={`${scope.id.replace(/-/g, " ")} · ${label}`} />}
      </figcaption>
      {/* Scrolls sideways only as a last resort (a one-column phone grid):
          a component never renders narrower than its own min-content. */}
      <div ref={bodyRef} className={`dm-scroll relative flex min-w-0 flex-1 items-center overflow-x-auto ${pad ? "p-[var(--space-4)]" : ""}`} style={{ minHeight: minH, background: bg }}>
        <div className="w-full min-w-min">
          <CellFullContext.Provider value={requestFull}>{children}</CellFullContext.Provider>
        </div>
      </div>
      {note && (
        <p className="border-t px-[var(--space-3)] py-[8px] text-[12px] leading-[17px]" style={{ ...MUTED, borderColor: "var(--border)" }}>
          {note}
        </p>
      )}
    </figure>
  );
}

export function StateChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[var(--radius-sm)] border px-[8px] py-[2px] text-[12px] leading-[16px] font-semibold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
      {children}
    </span>
  );
}

export function KindBadge({ kind }: { kind: CellKind }) {
  return kind === "built" ? (
    <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--color-feedback-success, #3ecf8e)" }}>
      Built
    </span>
  ) : (
    <span className="text-[11px] leading-[14px] font-semibold" style={{ color: "var(--primary)" }}>
      Proposed default (not built yet)
    </span>
  );
}

/** Stands in for a live render that would be unsafe in the lab (writes a
 *  store, navigates, plays audio, calls the network). Says why and where. */
export function NotRendered({ reason, see }: { reason: string; see?: string }) {
  return (
    <div className="flex flex-col gap-[4px] text-center">
      <p className="text-[13px] leading-[19px] font-semibold">Not rendered live</p>
      <p className="text-[12px] leading-[17px]" style={MUTED}>
        {reason}
      </p>
      {see && (
        <p className="text-[11.5px] leading-[16px] break-all" style={{ ...MONO, ...MUTED }}>
          {see}
        </p>
      )}
    </div>
  );
}

/** Mounts its children only after a click. For overlays, canvases and
 *  anything fixed or heavy: one at a time, never on page load. */
export function Reveal({ label = "Open", closeLabel = "Close", children, clip = true, height = 360 }: { label?: string; closeLabel?: string; children: ReactNode; clip?: boolean; height?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full flex-col items-center gap-[var(--space-3)]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="dm-quiet cursor-pointer rounded-full border px-[14px] py-[6px] text-[12.5px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
        {open ? closeLabel : label}
      </button>
      {open && (clip ? <ClippedStage height={height}>{children}</ClippedStage> : children)}
    </div>
  );
}

/** A relative, clipped box. `transform` makes it the containing block for
 *  position:fixed descendants, so fixed layers (backdrops, bottom navs,
 *  toasts) stay inside it. Portals still escape to <body>. */
export function ClippedStage({ children, height = 360 }: { children: ReactNode; height?: number }) {
  const requestFull = useContext(CellFullContext);
  useLayoutEffect(() => requestFull?.(), [requestFull]);
  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-md)] border" style={{ height, transform: "translateZ(0)", borderColor: "var(--border)", background: "var(--background)" }}>
      {children}
    </div>
  );
}

// The state views are real app components now (src/components/app/states.tsx);
// the lab keeps its original names so every section renders the real thing.
export { LoadingView as ProposedLoading, ErrorView as ProposedError, EmptyView as ProposedEmpty, SlowView as ProposedSlow, OfflineView as ProposedOffline, NotFoundView as ProposedNotFound, LockedView as ProposedLocked, Shimmer } from "@/components/app/states";

/** Proposed disabled treatment for a component with no disabled prop:
 *  45% opacity, no pointer events, aria-disabled. Mirrors how the built
 *  disabled controls (Button, Listbox) already look. */
export function ProposedDisabled({ children }: { children: ReactNode }) {
  return (
    <div aria-disabled="true" className="pointer-events-none cursor-not-allowed opacity-45 select-none">
      {children}
    </div>
  );
}

/** A simulated keyboard-focus ring around a live component (:focus-visible
 *  can't be forced). The proposed app-wide ring: 2px primary, 2px offset.
 *  Almost nothing in the app styles focus-visible today. */
export function ForcedFocus({ children, radius = "var(--radius-md)" }: { children: ReactNode; radius?: string }) {
  return (
    <div className="inline-flex max-w-full" style={{ outline: "2px solid var(--primary)", outlineOffset: 2, borderRadius: radius }}>
      {children}
    </div>
  );
}

/** A live render that must not be interacted with: the component writes a
 *  real store or triggers a download on click, and has no prop to stop it.
 *  `inert` blocks clicks, focus and keyboard for the whole subtree. */
export function Inert({ children }: { children: ReactNode }) {
  return <div inert>{children}</div>;
}

/** The real app page, inside the lab: loads on click (so no page plays
 *  audio or runs in the background on its own), renders at a true desktop
 *  or phone width in an iframe scaled to the cell, and stays inert so a
 *  glance never writes the demo's stores. Replaces "not rendered live". */
export function LiveRoute({ href, device = "desktop", height = 420 }: { href: string; device?: "desktop" | "mobile"; height?: number }) {
  const [on, setOn] = useState(false);
  const [w, setW] = useState(0);
  const box = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vw = device === "mobile" ? 375 : 1280;
  const scale = w ? Math.min(1, w / vw) : 0.5;
  return (
    <div ref={box} className="relative w-full overflow-hidden rounded-[var(--radius-md)] border" style={{ height, borderColor: "var(--border)", background: "var(--background)" }}>
      {on ? (
        <div inert className="absolute top-0 left-0 origin-top-left" style={{ width: vw, height: height / scale, transform: `scale(${scale})` }}>
          <iframe src={href} title={`Live page ${href}`} className="block h-full w-full border-0" />
        </div>
      ) : (
        <button type="button" onClick={() => setOn(true)} className="dm-quiet absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-[6px]">
          <span className="rounded-full border px-[14px] py-[7px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
            Load the live page
          </span>
          <code className="text-[11.5px]" style={{ ...MONO, ...MUTED }}>
            {href}
          </code>
        </button>
      )}
    </div>
  );
}

/** Sample strings for edge cases, shared so every section tests the same. */
export const EDGE = {
  longTitle: "Industrial-Organizational Psychologist and Workplace Research Lead",
  longName: "Maximiliana Alexandra Oyelaran-Whitfield",
  longBody: "This is a deliberately long line of body copy that keeps going well past where a normal label would stop, so you can see exactly how the component clamps, wraps or truncates when real data is wordier than the demo.",
  brokenImage: "/component-lab/does-not-exist.jpg",
};
