"use client";

// DEMO-ONLY: the Component Lab's own building blocks. Not part of the app.
// Every section file composes these so the whole lab reads as one system:
// a Specimen per component, a StateGrid of labelled cells per state, and
// the playbook's proposed defaults (docs/COMPONENT_STATES_PLAYBOOK.md) for
// any state the real component doesn't implement yet.

import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, ArrowLeft, ArrowRight, Clock3, CloudOff, Compass, LoaderCircle, Lock, Maximize2, Plus, RotateCcw, SearchX, Sparkles, WifiLow, WifiOff, type LucideIcon } from "lucide-react";
import { Working } from "@/components/app/Working";
import { IconTip } from "@/components/app/IconTip";

export const noop = () => {};
export const MONO: CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const MUTED: CSSProperties = { color: "var(--muted-foreground)" };
const ERROR_INK = "var(--color-feedback-danger, #ff6b6b)";

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

export type LabView = { grid: "auto" | "wide"; solo: string | null; soloRoot: HTMLElement | null; openPreview: (id: string, title: string) => void };
export const LabViewContext = createContext<LabView>({ grid: "auto", solo: null, soloRoot: null, openPreview: noop });
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
export function Specimen({ name, file, purpose, when, children }: { name: string; file: string; purpose: string; when?: string; children: ReactNode }) {
  const view = useContext(LabViewContext);
  const id = slug(name);
  const article = (
    <article id={`spec-${id}`} data-spec={name} className="flex scroll-mt-[136px] flex-col gap-[var(--space-3)] lg:scroll-mt-[80px]">
      <header className="flex flex-col gap-[4px]">
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-[var(--space-3)] gap-y-[2px]">
            <h4 className="text-[16px] leading-[22px] font-bold">{name}</h4>
            <code className="min-w-0 text-[11.5px] leading-[16px] break-all" style={{ ...MONO, ...MUTED }}>
              {file}
            </code>
          </div>
          {!view.solo && <ExpandButton id={id} title={name} />}
        </div>
        <p className="max-w-[72ch] text-[13.5px] leading-[20px]">{purpose}</p>
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
export function StateCell({ label, kind = "built", note, children, pad = true, minH = 120, surface = "card" }: { label: string; kind?: CellKind; note?: ReactNode; children: ReactNode; pad?: boolean; minH?: number; surface?: "card" | "page" | "game" }) {
  const view = useContext(LabViewContext);
  const scope = useContext(ScopeContext);
  const id = `${scope.id}--${slug(label)}`;
  const proposed = kind === "proposed";
  const bg = surface === "page" ? "var(--background)" : surface === "game" ? "#070914" : "color-mix(in srgb, var(--card) 70%, transparent)";
  const soloHidden = !!view.solo && !scope.target;
  const { figRef, bodyRef, span, requestFull } = useSmartSpan(!soloHidden);
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
    <span className="rounded-full border px-[8px] py-[2px] text-[10.5px] leading-[14px] font-bold tracking-[0.06em] uppercase" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
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

// ---------------------------------------------------------------------------
// Proposed defaults, from docs/COMPONENT_STATES_PLAYBOOK.md, designed in the
// app's own language (27 Sept 2026, direct feedback on the first pass:
// "error states is just a bunch of red text, loading is too basic... design
// to fit the design language of the app, make it all look good whatever the
// case"). What each one is built from:
// - Surfaces are the app's glass card (card at 70%, glass border, radius-lg),
//   the same shell the counselor v2 states use, so a state never looks like
//   a different product from the screen it replaces.
// - Loading is a skeleton in the content's own shape (posters, rows, a
//   document) with a slow light sweep, headed by the Working chip naming
//   what's on its way. Never a bare spinner in empty space.
// - Error keeps the codified voice ("Couldn't [verb]. Try again[, or
//   fallback].") but in normal ink: red is only the small icon badge, so a
//   failure reads calm and recoverable, with one clear Try again.
// - Empty tiers stay visually distinct (playbook rule) and each ends in the
//   action that fills it, primary blue for the whole-tab/route tiers.
// Use these inside a StateCell kind="proposed".

const GLASS_CARD: CSSProperties = { background: "color-mix(in srgb, var(--card) 70%, transparent)", borderColor: "var(--glass-border)" };
const PRIMARY_GLOW = "radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 62%)";
const SOLID_BTN = "dm-solid inline-flex cursor-pointer items-center gap-[6px] rounded-full px-[16px] py-[8px] text-[13px] leading-[18px] font-bold";
const QUIET_BTN = "dm-quiet inline-flex cursor-pointer items-center gap-[6px] rounded-full border px-[14px] py-[7px] text-[13px] leading-[18px] font-bold";
const QUIET_STYLE: CSSProperties = { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--foreground)" };

/** One skeleton bar with a slow light sweep (static under reduced motion). */
export function Shimmer({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`block motion-safe:animate-[dm-text-shimmer_2.4s_linear_infinite] ${className}`}
      style={{ backgroundImage: "linear-gradient(90deg, color-mix(in srgb, var(--foreground) 7%, transparent) 0%, color-mix(in srgb, var(--foreground) 7%, transparent) 38%, color-mix(in srgb, var(--foreground) 15%, transparent) 50%, color-mix(in srgb, var(--foreground) 7%, transparent) 62%, color-mix(in srgb, var(--foreground) 7%, transparent) 100%)", backgroundSize: "200% 100%", ...style }}
    />
  );
}

/** A round badge holding a state's icon, tinted by tone. */
function IconBadge({ Icon, tone = "primary", size = 40 }: { Icon: LucideIcon; tone?: "primary" | "danger" | "muted"; size?: number }) {
  const ink = tone === "danger" ? ERROR_INK : tone === "muted" ? "var(--muted-foreground)" : "var(--primary)";
  return (
    <span aria-hidden className="flex shrink-0 items-center justify-center rounded-full border" style={{ width: size, height: size, color: ink, background: `color-mix(in srgb, ${ink} 14%, transparent)`, borderColor: `color-mix(in srgb, ${ink} 28%, transparent)` }}>
      <Icon style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={2} />
    </span>
  );
}

/** Loading. `chip` for a panel or document, `cards` for rails and grids,
 *  `list` for feeds and rows, `document` for a page-shaped surface,
 *  `button` for an action tied to one button (the built pattern). */
export function ProposedLoading({ label = "Loading", shape = "chip" }: { label?: string; shape?: "chip" | "cards" | "list" | "document" | "button" }) {
  if (shape === "button")
    return (
      <div className="flex justify-center">
        <button type="button" disabled aria-busy="true" className="inline-flex cursor-not-allowed items-center gap-[6px] rounded-full px-[16px] py-[8px] text-[13px] leading-[18px] font-bold" style={{ background: "color-mix(in srgb, var(--primary) 72%, transparent)", color: "#fff" }}>
          <LoaderCircle className="h-[14px] w-[14px] motion-safe:animate-spin" style={{ animationDuration: "1.1s" }} aria-hidden />
          {label}…
        </button>
      </div>
    );
  const head = (
    <div className="flex justify-center">
      <Working label={label} />
    </div>
  );
  if (shape === "cards")
    return (
      <div aria-busy="true" className="flex flex-col gap-[var(--space-3)]">
        {head}
        <div className="grid grid-cols-3 gap-[8px]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-md)] border" style={GLASS_CARD}>
              <Shimmer className="absolute inset-0" style={{ animationDelay: `${i * 0.15}s` }} />
              <div className="absolute inset-x-[8px] bottom-[8px] flex flex-col gap-[5px]">
                <Shimmer className="h-[7px] w-[80%] rounded-full" />
                <Shimmer className="h-[6px] w-[50%] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  if (shape === "list")
    return (
      <div aria-busy="true" className="flex flex-col gap-[var(--space-3)]">
        {head}
        <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={GLASS_CARD}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-[10px] px-[12px] py-[10px]" style={{ borderTop: i ? "1px solid var(--glass-border)" : undefined }}>
              <Shimmer className="size-[26px] shrink-0 rounded-full" style={{ animationDelay: `${i * 0.15}s` }} />
              <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                <Shimmer className="h-[8px] rounded-full" style={{ width: `${78 - i * 14}%`, animationDelay: `${i * 0.15}s` }} />
                <Shimmer className="h-[6px] rounded-full" style={{ width: `${44 - i * 6}%`, animationDelay: `${i * 0.15}s` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  // chip / document: a glass panel whose ghost lines sit where the content lands.
  return (
    <div aria-busy="true" className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={GLASS_CARD}>
      {head}
      <div className="flex flex-col gap-[8px]">
        <Shimmer className="h-[10px] w-[46%] rounded-full" />
        <Shimmer className="h-[7px] w-[92%] rounded-full" />
        <Shimmer className="h-[7px] w-[84%] rounded-full" />
        {shape === "document" && <Shimmer className="h-[7px] w-[64%] rounded-full" />}
      </div>
    </div>
  );
}

/** Error. `card` (default) replaces a surface that failed to load;
 *  `inline` sits under the one control that failed (the built rule for a
 *  form or single action); `pill` replaces an ongoing check's Working chip.
 *  `message` overrides the composed copy with a surface's exact string. */
export function ProposedError({ verb = "load this", fallback, pill, variant = "card", message, icon = CloudOff }: { verb?: string; fallback?: string; pill?: string; variant?: "card" | "inline"; message?: string; icon?: LucideIcon }) {
  if (pill)
    return (
      <div className="flex justify-center">
        <button type="button" onClick={noop} className="dm-quiet inline-flex cursor-pointer items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 88%, transparent)" }}>
          <span aria-hidden className="size-[6px] rounded-full" style={{ background: ERROR_INK }} />
          {pill} didn&apos;t finish · <RotateCcw className="h-3 w-3" aria-hidden /> Retry
        </button>
      </div>
    );
  const line = message ?? `Couldn't ${verb}. Try again${fallback ? `, or ${fallback}` : ""}.`;
  if (variant === "inline")
    return (
      <p role="alert" className="flex items-start justify-center gap-[6px] text-[12.5px] leading-[18px] font-semibold" style={{ color: ERROR_INK }}>
        <AlertCircle className="mt-[2px] h-[14px] w-[14px] shrink-0" aria-hidden />
        <span>{line}</span>
      </p>
    );
  // The card's button already says "Try again", so the body carries the
  // fallback when there is one, otherwise the next thing to check.
  const title = message ?? `Couldn't ${verb}.`;
  const body = message ? "" : fallback ? `Or ${fallback}.` : "Check your connection, then try again.";
  return (
    <div role="alert" className="flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-5)] text-center" style={GLASS_CARD}>
      <IconBadge Icon={icon} tone="danger" size={36} />
      <p className="mt-[2px] text-[14px] leading-[20px] font-bold">{title}</p>
      <p className="max-w-[34ch] text-[12.5px] leading-[18px]" style={MUTED}>
        {body || "Check your connection, then try again."}
      </p>
      <button type="button" onClick={noop} className={`${QUIET_BTN} mt-[4px]`} style={QUIET_STYLE}>
        <RotateCcw className="h-[13px] w-[13px]" aria-hidden /> Try again
      </button>
    </div>
  );
}

/** Empty, by playbook tier. 1 whole tab, 2 one shelf, 3 dense panel,
 *  4 whole route, 5 search/filter, 6 not authored yet. */
export function ProposedEmpty({ tier, heading, line, cta, query, icon }: { tier: 1 | 2 | 3 | 4 | 5 | 6; heading?: string; line?: string; cta?: string; query?: string; icon?: LucideIcon }) {
  if (tier === 3)
    return (
      <p className="px-[var(--space-2)] py-[var(--space-3)] text-center text-[13px] leading-[19px]" style={MUTED}>
        {line ?? "Nothing here yet."}
      </p>
    );
  if (tier === 5)
    return (
      <div className="flex flex-col items-center gap-[var(--space-2)] text-center">
        <p className="text-[13.5px] leading-[20px]">
          Nothing matches{" "}
          <span className="rounded-full border px-[8px] py-[1px] font-semibold whitespace-nowrap" style={QUIET_STYLE}>
            {query ?? "welder"}
          </span>
        </p>
        <p className="max-w-[36ch] text-[12.5px] leading-[18px]" style={MUTED}>
          {line ?? "Try a shorter word, a city, or a company."}
        </p>
        <button type="button" onClick={noop} className="dm-link cursor-pointer text-[12.5px] font-semibold" style={{ color: "var(--primary)" }}>
          {cta ?? "Clear search"}
        </button>
      </div>
    );
  if (tier === 6)
    return (
      <div className="flex flex-col items-center gap-[6px] text-center">
        <span className="inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[11.5px] leading-[14px] font-bold tracking-[0.04em] uppercase" style={QUIET_STYLE}>
          <Clock3 className="h-[12px] w-[12px]" aria-hidden style={{ color: "var(--primary)" }} /> Coming soon
        </span>
        {line && line !== "Coming soon" && (
          <p className="max-w-[34ch] text-[12.5px] leading-[18px]" style={MUTED}>
            {line}
          </p>
        )}
      </div>
    );
  if (tier === 2)
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-[var(--space-3)] gap-y-[var(--space-2)] rounded-[var(--radius-lg)] border border-dashed px-[var(--space-4)] py-[var(--space-4)] text-center" style={{ borderColor: "color-mix(in srgb, var(--foreground) 22%, transparent)" }}>
        <IconBadge Icon={icon ?? Plus} tone="muted" size={30} />
        <div className="flex min-w-0 flex-col items-center gap-[2px] sm:items-start sm:text-left">
          <p className="text-[13.5px] leading-[19px] font-bold">{heading ?? "Nothing saved here yet"}</p>
          {cta && (
            <button type="button" onClick={noop} className="dm-link inline-flex cursor-pointer items-center gap-[4px] text-[12.5px] font-semibold" style={{ color: "var(--primary)" }}>
              {cta} <ArrowRight className="h-[12px] w-[12px]" aria-hidden />
            </button>
          )}
        </div>
      </div>
    );
  if (tier === 4)
    return (
      <div className="flex flex-col items-center gap-[var(--space-3)] rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-6)] text-center" style={{ backgroundImage: PRIMARY_GLOW }}>
        <IconBadge Icon={icon ?? Compass} size={52} />
        <p className="text-[24px] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
          {heading ?? "Nothing to show yet"}
        </p>
        <p className="max-w-[40ch] text-[13.5px] leading-[20px]" style={MUTED}>
          {line ?? "Pick a few careers first and this page fills in."}
        </p>
        <button type="button" onClick={noop} className={`${SOLID_BTN} mt-[2px]`} style={{ background: "var(--primary)", color: "#fff" }}>
          {cta ?? "Get started"} <ArrowRight className="h-[14px] w-[14px]" aria-hidden />
        </button>
      </div>
    );
  return (
    <div className="flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-6)] text-center" style={{ ...GLASS_CARD, backgroundImage: PRIMARY_GLOW }}>
      <IconBadge Icon={icon ?? Sparkles} />
      <p className="mt-[4px] text-[16px] leading-[22px] font-bold" style={{ fontFamily: "var(--font-display)" }}>
        {heading ?? "Nothing here yet"}
      </p>
      <p className="max-w-[36ch] text-[13px] leading-[19px]" style={MUTED}>
        {line ?? "Save a few careers and they show up here."}
      </p>
      <button type="button" onClick={noop} className={`${SOLID_BTN} mt-[var(--space-2)]`} style={{ background: "var(--primary)", color: "#fff" }}>
        {cta ?? "Explore careers"} <ArrowRight className="h-[14px] w-[14px]" aria-hidden />
      </button>
    </div>
  );
}


/** Slow connection: the loading skeleton stays, and after a few seconds a
 *  calm line admits it's slow and offers a retry, so a long wait never
 *  looks frozen. Same shapes as ProposedLoading. */
export function ProposedSlow({ label = "Loading", shape = "chip" }: { label?: string; shape?: "chip" | "cards" | "list" | "document" }) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <ProposedLoading label={label} shape={shape} />
      <p className="flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[2px] text-center text-[12px] leading-[17px]" style={MUTED}>
        <WifiLow className="h-[13px] w-[13px]" aria-hidden />
        Taking longer than usual.
        <button type="button" onClick={noop} className="dm-link cursor-pointer font-semibold" style={{ color: "var(--primary)" }}>
          Try again
        </button>
      </p>
    </div>
  );
}

/** Offline. `banner` is the app-wide strip under the header; `card`
 *  replaces a surface that can't work without a connection. */
export function ProposedOffline({ variant = "card" }: { variant?: "banner" | "card" }) {
  if (variant === "banner")
    return (
      <div role="status" className="flex items-center justify-center gap-[8px] rounded-full border px-[14px] py-[7px] text-[12.5px] leading-[17px] font-semibold" style={GLASS_CARD}>
        <WifiOff className="h-[14px] w-[14px] shrink-0" aria-hidden style={{ color: "var(--muted-foreground)" }} />
        <span>You&apos;re offline. Changes sync when you reconnect.</span>
      </div>
    );
  return (
    <div role="status" className="flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-5)] text-center" style={GLASS_CARD}>
      <IconBadge Icon={WifiOff} tone="muted" size={36} />
      <p className="mt-[2px] text-[14px] leading-[20px] font-bold">You&apos;re offline</p>
      <p className="max-w-[34ch] text-[12.5px] leading-[18px]" style={MUTED}>
        This needs a connection. Everything you saved is still here.
      </p>
      <button type="button" onClick={noop} className={`${QUIET_BTN} mt-[4px]`} style={QUIET_STYLE}>
        <RotateCcw className="h-[13px] w-[13px]" aria-hidden /> Try again
      </button>
    </div>
  );
}

/** Not found (404) for a detail route: a removed record or a stale link.
 *  Copy matches the one built 404, Connect's ConnectNotFound. */
export function ProposedNotFound({ what = "page", home = "Go home" }: { what?: string; home?: string }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-xl)] px-[var(--space-4)] py-[var(--space-5)] text-center" style={{ backgroundImage: PRIMARY_GLOW }}>
      <IconBadge Icon={SearchX} size={44} />
      <p className="mt-[4px] text-[19px] leading-[1.15] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
        We couldn&apos;t find that {what}
      </p>
      <p className="max-w-[34ch] text-[12.5px] leading-[18px]" style={MUTED}>
        It may have been removed, or the link might be out of date.
      </p>
      <div className="mt-[4px] flex flex-wrap justify-center gap-[8px]">
        <button type="button" onClick={noop} className={QUIET_BTN} style={QUIET_STYLE}>
          <ArrowLeft className="h-[13px] w-[13px]" aria-hidden /> Back
        </button>
        <button type="button" onClick={noop} className={SOLID_BTN} style={{ background: "var(--primary)", color: "#fff" }}>
          {home}
        </button>
      </div>
    </div>
  );
}

/** Locked or no access: something the student hasn't unlocked yet, or a
 *  role that can't see it. Lock badge language from PlayHub's CornerBadge. */
export function ProposedLocked({ heading = "Unlocks later", line = "Finish the step before this one to open it.", cta }: { heading?: string; line?: string; cta?: string }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-2)] rounded-[var(--radius-lg)] border px-[var(--space-4)] py-[var(--space-5)] text-center" style={GLASS_CARD}>
      <IconBadge Icon={Lock} tone="muted" size={36} />
      <p className="mt-[2px] text-[14px] leading-[20px] font-bold">{heading}</p>
      <p className="max-w-[34ch] text-[12.5px] leading-[18px]" style={MUTED}>
        {line}
      </p>
      {cta && (
        <button type="button" onClick={noop} className={`${QUIET_BTN} mt-[4px]`} style={QUIET_STYLE}>
          {cta}
        </button>
      )}
    </div>
  );
}

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

/** Sample strings for edge cases, shared so every section tests the same. */
export const EDGE = {
  longTitle: "Industrial-Organizational Psychologist and Workplace Research Lead",
  longName: "Maximiliana Alexandra Oyelaran-Whitfield",
  longBody: "This is a deliberately long line of body copy that keeps going well past where a normal label would stop, so you can see exactly how the component clamps, wraps or truncates when real data is wordier than the demo.",
  brokenImage: "/component-lab/does-not-exist.jpg",
};
