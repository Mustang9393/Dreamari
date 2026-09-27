"use client";

// DEMO-ONLY: the Component Lab's own building blocks. Not part of the app.
// Every section file composes these so the whole lab reads as one system:
// a Specimen per component, a StateGrid of labelled cells per state, and
// the playbook's proposed defaults (docs/COMPONENT_STATES_PLAYBOOK.md) for
// any state the real component doesn't implement yet.

import { useState, type CSSProperties, type ReactNode } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { Working } from "@/components/app/Working";

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

/** One component: name, where it lives, what it's for, when to reach for it,
 *  then its states. `file` is relative to the repo root. */
export function Specimen({ name, file, purpose, when, children }: { name: string; file: string; purpose: string; when?: string; children: ReactNode }) {
  return (
    <article className="flex flex-col gap-[var(--space-3)]">
      <header className="flex flex-col gap-[4px]">
        <div className="flex flex-wrap items-baseline gap-x-[var(--space-3)] gap-y-[2px]">
          <h4 className="text-[16px] leading-[22px] font-bold">{name}</h4>
          <code className="min-w-0 text-[11.5px] leading-[16px] break-all" style={{ ...MONO, ...MUTED }}>
            {file}
          </code>
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
}

/** Responsive grid of state cells. `min` is each cell's minimum width. */
export function StateGrid({ children, min = 240 }: { children: ReactNode; min?: number }) {
  return (
    <div className="grid gap-[var(--space-3)]" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))` }}>
      {children}
    </div>
  );
}

export type CellKind = "built" | "proposed";

/** One state of one component. `kind="proposed"` marks a playbook default
 *  that is NOT implemented in the real component yet. */
export function StateCell({ label, kind = "built", note, children, pad = true, minH = 120, surface = "card" }: { label: string; kind?: CellKind; note?: ReactNode; children: ReactNode; pad?: boolean; minH?: number; surface?: "card" | "page" | "game" }) {
  const proposed = kind === "proposed";
  const bg = surface === "page" ? "var(--background)" : surface === "game" ? "#070914" : "color-mix(in srgb, var(--card) 70%, transparent)";
  return (
    <figure className="m-0 flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: proposed ? "color-mix(in srgb, var(--primary) 45%, transparent)" : "var(--border)", borderStyle: proposed ? "dashed" : "solid" }}>
      <figcaption className="flex flex-wrap items-center gap-[6px] border-b px-[var(--space-3)] py-[8px]" style={{ borderColor: "var(--border)" }}>
        <StateChip>{label}</StateChip>
        <KindBadge kind={kind} />
      </figcaption>
      <div className={`relative flex min-w-0 flex-1 items-center justify-center ${pad ? "p-[var(--space-4)]" : ""}`} style={{ minHeight: minH, background: bg }}>
        <div className="w-full min-w-0">{children}</div>
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
  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-md)] border" style={{ height, transform: "translateZ(0)", borderColor: "var(--border)", background: "var(--background)" }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Proposed defaults, straight from docs/COMPONENT_STATES_PLAYBOOK.md.
// Use these inside a StateCell kind="proposed".

/** Loading: the Working chip centred where the content will be (the
 *  playbook default), or a skeleton shape for card/list surfaces (flagged
 *  in the playbook as the long-term answer; no shared Skeleton exists). */
export function ProposedLoading({ label = "Loading", shape = "chip" }: { label?: string; shape?: "chip" | "cards" | "list" | "button" }) {
  if (shape === "button")
    return (
      <div className="flex justify-center">
        <button type="button" disabled className="dm-solid inline-flex cursor-not-allowed items-center gap-[6px] rounded-full px-[14px] py-[7px] text-[13px] font-bold opacity-80" style={{ background: "var(--primary)", color: "#fff" }}>
          <LoaderCircle className="h-[14px] w-[14px] motion-safe:animate-spin" aria-hidden />
          {label}…
        </button>
      </div>
    );
  if (shape === "cards" || shape === "list")
    return (
      <div role="status" aria-label={`${label}…`} className={shape === "cards" ? "grid grid-cols-3 gap-[8px]" : "flex flex-col gap-[8px]"}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="motion-safe:animate-pulse rounded-[var(--radius-md)]" style={{ height: shape === "cards" ? 88 : 18, width: shape === "list" ? `${92 - i * 18}%` : undefined, background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }} />
        ))}
      </div>
    );
  return (
    <div className="flex justify-center">
      <Working label={label} />
    </div>
  );
}

/** Error: inline "Couldn't [verb]. Try again[, or fallback]." (the codified
 *  voice), or the quiet retry pill for an ongoing header-level check. */
export function ProposedError({ verb = "load this", fallback, pill }: { verb?: string; fallback?: string; pill?: string }) {
  if (pill)
    return (
      <div className="flex justify-center">
        <button type="button" onClick={noop} className="dm-quiet inline-flex cursor-pointer items-center gap-[6px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-bold" style={{ borderColor: "var(--glass-border)", background: "color-mix(in srgb, var(--card) 88%, transparent)" }}>
          {pill} didn&apos;t finish · <RotateCcw className="h-3 w-3" aria-hidden /> Retry
        </button>
      </div>
    );
  return (
    <p role="alert" className="text-center text-[12.5px] leading-[18px] font-semibold" style={{ color: ERROR_INK }}>
      Couldn&apos;t {verb}. Try again{fallback ? `, or ${fallback}` : ""}.
    </p>
  );
}

/** Empty, by playbook tier. 1 whole tab, 2 one shelf, 3 dense panel,
 *  4 whole route, 5 search/filter, 6 not authored yet. */
export function ProposedEmpty({ tier, heading, line, cta, query }: { tier: 1 | 2 | 3 | 4 | 5 | 6; heading?: string; line?: string; cta?: string; query?: string }) {
  if (tier === 3)
    return (
      <p className="text-center text-[13px] leading-[19px]" style={MUTED}>
        {line ?? "Nothing here yet."}
      </p>
    );
  if (tier === 5)
    return (
      <p className="text-center text-[13px] leading-[19px]" style={MUTED}>
        Nothing matches &ldquo;{query ?? "welder"}&rdquo;. {line ?? "Try a shorter word, a city, or a company."}
      </p>
    );
  if (tier === 6)
    return (
      <p className="text-center text-[13px] leading-[19px] font-semibold" style={MUTED}>
        {line ?? "Coming soon"}
      </p>
    );
  if (tier === 2)
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed p-[var(--space-4)] text-center" style={{ borderColor: "var(--border)" }}>
        <p className="text-[13.5px] leading-[19px] font-bold">{heading ?? "Nothing saved here yet"}</p>
        {cta && (
          <button type="button" onClick={noop} className="dm-link mt-[4px] cursor-pointer text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
            {cta}
          </button>
        )}
      </div>
    );
  if (tier === 4)
    return (
      <div className="flex flex-col items-center gap-[var(--space-2)] text-center">
        <p className="text-[22px] leading-[1.1] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
          {heading ?? "Nothing to show yet"}
        </p>
        <p className="max-w-[38ch] text-[13px] leading-[19px]" style={MUTED}>
          {line ?? "Pick a few careers first and this page fills in."}
        </p>
        <button type="button" onClick={noop} className="dm-solid mt-[4px] cursor-pointer rounded-full px-[16px] py-[8px] text-[13px] font-bold" style={{ background: "var(--primary)", color: "#fff" }}>
          {cta ?? "Get started"}
        </button>
      </div>
    );
  return (
    <div className="rounded-[var(--radius-lg)] border p-[var(--space-6)] text-center" style={{ borderColor: "var(--border)" }}>
      <p className="text-[15px] leading-[21px] font-bold">{heading ?? "Nothing here yet"}</p>
      <p className="mt-[4px] text-[13px] leading-[19px]" style={MUTED}>
        {line ?? "Save a few careers and they show up here."}
      </p>
      <button type="button" onClick={noop} className="dm-solid mt-[var(--space-3)] cursor-pointer rounded-full px-[14px] py-[7px] text-[13px] font-bold" style={{ background: "var(--primary)", color: "#fff" }}>
        {cta ?? "Explore careers"}
      </button>
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
