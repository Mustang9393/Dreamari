"use client";

// DEMO-ONLY: internal tool, not the demo. The scene review (29 Sept 2026):
// an automatic, read-only contact sheet for career simulation art. Every
// location in a career's art manifest, at five real screen sizes, rendered
// with the player's own placement math (src/components/play/scenePlacement.ts),
// with computed flags so a reviewer only looks at the exceptions. Why
// automatic and not an editor: "drag to position seems like a manual
// process... I want it to be automated so we don't have to manually do
// anything. We have 900+ careers." scripts/play-art computes focal points and
// slots; this page is the second line of defence that checks the result.
//
// Nothing here writes a store or calls /api/*. Loaded files stay in memory
// as object URLs and are released when replaced or when the page closes.

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronDown, ClipboardCopy, FileJson, ImagePlus, X } from "lucide-react";
import { QuickLinksMenu } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { Listbox } from "@/components/app/Listbox";
import { ErrorView, LoadingView } from "@/components/app/states";
import { Portal } from "@/components/profile/CareerReport";
import { FONT_STYLESHEET_HREF } from "@/components/marketing/fonts";
import { CAREER_ART, type CareerArt } from "@/components/play/art";
import { SIMULATIONS } from "@/components/play/games";
import { SceneFrame, type FrameSprite, type Guides } from "./SceneFrame";
import {
  buildRows,
  careerFlags,
  dialogueZone,
  faceOffsetFor,
  FRAME_ASPECT_SUM,
  FRAMES,
  manifestProblem,
  normalizeManifest,
  probeTargets,
  reportText,
  rowFlags,
  spriteGeometry,
  STANDARD_ALPHA,
  type Flag,
  type FrameSpec,
  type LocationRow,
  type Probe,
} from "./sceneReviewModel";
import { useImageProbes } from "./useImageProbes";

const MUTED = { color: "var(--muted-foreground)" } as const;
const CARD = { borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" } as const;
const QUIET_BTN =
  "dm-quiet inline-flex cursor-pointer items-center justify-center gap-[6px] rounded-full border px-[12px] py-[6px] text-[12.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
const QUIET_STYLE = { borderColor: "var(--glass-border)", background: "var(--glass-surface-2)", color: "var(--foreground)" } as const;
const FIELD =
  "flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
const ROW_GAP = 8;
/** A row card's own padding and border, left and right (p-[12px] + 1px). */
const ROW_CHROME = 26;

const noopSubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
function useCareerParam() {
  return useSyncExternalStore(noopSubscribe, () => new URLSearchParams(location.search).get("career"), () => null);
}

const basename = (src: string) => src.split("?")[0].split("/").pop() ?? src;

type Source = { key: string; art: CareerArt; fromFile: boolean };

/** The row's frame height that fits all five frames on one line, or a
 *  wrapped layout on a narrow screen where one line would be unreadable. */
function useFrameHeight() {
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);
  const ref = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!node) return;
    observer.current = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0));
    observer.current.observe(node);
  }, []);
  const inner = width - ROW_CHROME;
  const fit = (inner - ROW_GAP * (FRAMES.length - 1)) / FRAME_ASPECT_SUM;
  const wrap = fit < 110;
  const height = width === 0 ? 120 : wrap ? Math.min(170, inner / (2560 / 1080)) : Math.min(240, fit);
  return { ref, height: Math.floor(height), wrap };
}

/** The sprites a frame renders, with their estimated face point and whether
 *  that face passes (upper third, uncropped, clear of the dialogue box). */
function frameSprites(row: LocationRow, frame: FrameSpec, art: CareerArt, probes: Record<string, Probe | undefined>, resolve: (src: string) => string): FrameSprite[] {
  const offset = faceOffsetFor(art.spriteStandard);
  return row.sprites.map((sprite) => {
    const probe = probes[resolve(sprite.src)];
    const ok = probe?.status === "ok" ? probe : null;
    const ratio = ok ? ok.w / ok.h : art.portraitRatios[sprite.src];
    const g = spriteGeometry(sprite.slot, frame, ratio, ok?.alpha ?? STANDARD_ALPHA, offset);
    const zone = dialogueZone(frame.w, frame.h);
    const underBox = g.face.x >= zone.left && g.face.x <= zone.left + zone.width && g.face.y >= zone.top && g.face.y <= zone.top + zone.height;
    const faceBad = g.figureTop < 0 || g.face.y > frame.h / 3 || underBox || g.face.x < 0 || g.face.x > frame.w;
    return {
      src: resolve(sprite.src),
      slot: sprite.slot,
      ratio,
      face: probe?.status === "error" ? undefined : g.face,
      faceBad,
      // Mirrors SimulationPlayer's two-character call site: Christina stands
      // in front when the reception shows her with Jordan.
      zIndex: row.sprites.length > 1 ? (sprite.name === "Christina" ? 2 : 1) : undefined,
    };
  });
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] px-[8px] py-[6px] text-left text-[13px] font-semibold outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
    >
      <span>{label}</span>
      <span aria-hidden className="relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors" style={{ background: on ? "var(--primary)" : "var(--glass-surface-2)", border: "1px solid var(--glass-border)" }}>
        <span className="absolute top-[1px] size-[14px] rounded-full bg-white transition-[left]" style={{ left: on ? 15 : 1 }} />
      </span>
    </button>
  );
}

function FlagList({ flags }: { flags: Flag[] }) {
  return (
    <ul className="flex flex-col gap-[3px]">
      {flags.map((flag, i) => (
        <li key={`${flag.code}-${i}`} className="flex items-start gap-[6px] text-[12.5px] leading-[18px]">
          <AlertTriangle className="mt-[2px] h-[13px] w-[13px] shrink-0" style={{ color: "var(--color-feedback-danger)" }} aria-hidden />
          <span className="min-w-0 break-words">{flag.message}</span>
        </li>
      ))}
    </ul>
  );
}

function StatusChip({ count, checking }: { count: number; checking: boolean }) {
  if (count > 0)
    return (
      <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full border px-[9px] py-[2px] text-[11.5px] font-bold" style={{ borderColor: "var(--color-feedback-danger)", color: "var(--color-feedback-danger)" }}>
        <AlertTriangle className="h-[12px] w-[12px]" aria-hidden />
        {count} {count === 1 ? "flag" : "flags"}
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full border px-[9px] py-[2px] text-[11.5px] font-bold" style={checking ? { borderColor: "var(--glass-border)", color: "var(--muted-foreground)" } : { borderColor: "var(--color-feedback-success)", color: "var(--color-feedback-success)" }}>
      {checking ? "Checking" : (
        <>
          <Check className="h-[12px] w-[12px]" aria-hidden /> Clear
        </>
      )}
    </span>
  );
}

function EnlargedFrame({
  row,
  frameKey,
  art,
  probes,
  resolve,
  guides,
  onPick,
  onClose,
}: {
  row: LocationRow;
  frameKey: string;
  art: CareerArt;
  probes: Record<string, Probe | undefined>;
  resolve: (src: string) => string;
  guides: Guides;
  onPick: (key: string) => void;
  onClose: () => void;
}) {
  const frame = FRAMES.find((f) => f.key === frameKey) ?? FRAMES[0];
  const [viewport, setViewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = FRAMES.findIndex((f) => f.key === frameKey);
        const next = FRAMES[(i + (e.key === "ArrowRight" ? 1 : FRAMES.length - 1)) % FRAMES.length];
        onPick(next.key);
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [frameKey, onClose, onPick]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  const height = Math.max(120, Math.min(viewport.h - 150, ((viewport.w - 32) * frame.h) / frame.w));
  const plateProbe = probes[resolve(row.location.src)];
  return (
    <Portal>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" style={{ background: "color-mix(in srgb, var(--background) 88%, transparent)" }}>
        <button type="button" aria-label="Close" tabIndex={-1} className="absolute inset-0 cursor-default" onClick={onClose} />
        <div role="dialog" aria-modal="true" aria-label={`${row.id} at ${frame.label}`} className="relative flex max-w-full flex-col items-center gap-[10px]">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div role="group" aria-label="Screen size" className="flex flex-wrap gap-[4px]">
              {FRAMES.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={f.key === frame.key}
                  onClick={() => onPick(f.key)}
                  className="cursor-pointer rounded-full border px-[10px] py-[4px] text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  style={f.key === frame.key ? { borderColor: "var(--primary)", background: "var(--primary)", color: "#fff" } : QUIET_STYLE}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <IconTip label="Close">
              <button ref={closeRef} type="button" aria-label="Close" onClick={onClose} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" style={QUIET_STYLE}>
                <X className="h-[16px] w-[16px]" aria-hidden />
              </button>
            </IconTip>
          </div>
          <SceneFrame frame={frame} displayHeight={Math.floor(height)} plateSrc={resolve(row.location.src)} plateAlt={row.location.alt} plateMissing={plateProbe?.status === "error"} location={row.location} sprites={frameSprites(row, frame, art, probes, resolve)} guides={guides} />
          <p className="text-[12.5px]" style={MUTED}>
            {row.id} · {frame.label} {frame.w}x{frame.h} · arrow keys switch size, Escape closes
          </p>
        </div>
      </div>
    </Portal>
  );
}

export function SceneReview() {
  const param = useCareerParam();
  // The career comes from ?career=, which the server cannot see: rows wait
  // for the client so the wrong career's art never starts loading first.
  const mounted = useMounted();
  const [loaded, setLoaded] = useState<CareerArt[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [assets, setAssets] = useState<Record<string, string>>({});
  const [guides, setGuides] = useState<Guides>({ dialogue: true, thirds: true, centre: false });
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [enlarged, setEnlarged] = useState<{ row: string; frame: string } | null>(null);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const { ref: listRef, height: frameHeight, wrap } = useFrameHeight();

  const sources: Source[] = useMemo(
    () => [...loaded.map((art) => ({ key: `file:${art.career}`, art, fromFile: true })), ...CAREER_ART.map((art) => ({ key: art.career, art, fromFile: false }))],
    [loaded],
  );
  const wanted = picked ?? param;
  const source = sources.find((s) => s.key === wanted) ?? sources.find((s) => s.art.career === wanted) ?? sources[0];
  const art = source.art;
  const simulation = SIMULATIONS.find((s) => s.careerId === art.career || s.id === art.career);

  // Object URLs for loaded art: released when replaced and when the page closes.
  const assetsRef = useRef(assets);
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);
  useEffect(() => () => Object.values(assetsRef.current).forEach((url) => URL.revokeObjectURL(url)), []);

  const resolve = useCallback((src: string) => assets[basename(src)] ?? src, [assets]);
  const rows = useMemo(() => buildRows(art, simulation), [art, simulation]);
  const targets = useMemo(() => (mounted ? probeTargets(rows, art) : { plates: [], sprites: [] }), [rows, art, mounted]);
  const resolvedPlates = useMemo(() => targets.plates.map(resolve), [targets, resolve]);
  const resolvedSprites = useMemo(() => targets.sprites.map(resolve), [targets, resolve]);
  const probes = useImageProbes(resolvedPlates, resolvedSprites);
  const pending = [...resolvedPlates, ...resolvedSprites].filter((src) => !probes[src]).length;
  const checking = !mounted || pending > 0;
  const evaluated = useMemo(() => rows.map((row) => ({ row, flags: rowFlags(row, art, probes, resolve) })), [rows, art, probes, resolve]);
  const global = useMemo(() => careerFlags(art, simulation, probes, resolve), [art, simulation, probes, resolve]);
  const total = global.length + evaluated.reduce((n, r) => n + r.flags.length, 0);
  const flaggedRows = evaluated.filter((r) => r.flags.length > 0).length;
  const visible = flaggedOnly ? evaluated.filter((r) => r.flags.length > 0) : evaluated;
  const mappedHere = [...targets.plates, ...targets.sprites].filter((src) => assets[basename(src)]).length;

  const pick = (key: string) => {
    setPicked(key);
    setEnlarged(null);
    const found = sources.find((s) => s.key === key);
    if (found && !found.fromFile) history.replaceState(null, "", `?career=${encodeURIComponent(found.art.career)}`);
  };

  const onManifest = async (file: File | undefined) => {
    if (!file) return;
    setManifestError(null);
    try {
      const value: unknown = JSON.parse(await file.text());
      const problem = manifestProblem(value);
      if (problem) {
        setManifestError(`Couldn't read ${file.name}. ${problem}`);
        return;
      }
      const art = normalizeManifest(value as CareerArt);
      setLoaded((prev) => [art, ...prev.filter((a) => a.career !== art.career)]);
      setPicked(`file:${art.career}`);
      setEnlarged(null);
    } catch {
      setManifestError(`Couldn't read ${file.name}. It is not valid JSON.`);
    }
  };

  const onAssets = (files: FileList | null) => {
    if (!files?.length) return;
    setAssets((prev) => {
      const next = { ...prev };
      for (const file of Array.from(files)) {
        if (next[file.name]) URL.revokeObjectURL(next[file.name]);
        next[file.name] = URL.createObjectURL(file);
      }
      return next;
    });
  };

  const clearAssets = () => {
    Object.values(assets).forEach((url) => URL.revokeObjectURL(url));
    setAssets({});
  };

  const copyReport = async () => {
    const ok = await copyText(reportText(art.career, evaluated, global));
    setCopied(ok ? "done" : "failed");
    window.setTimeout(() => setCopied("idle"), 2200);
  };

  const enlargedRow = enlarged ? rows.find((r) => r.id === enlarged.row) : undefined;
  const closeEnlarged = useCallback(() => setEnlarged(null), []);
  const pickEnlarged = useCallback((frame: string) => setEnlarged((prev) => (prev ? { ...prev, frame } : prev)), []);
  const careerLabel = (s: Source) => `${SIMULATIONS.find((sim) => sim.careerId === s.art.career)?.title ?? s.art.career}${s.fromFile ? " (loaded file)" : ""}`;

  return (
    <div className="marketing-v2 themeable min-h-screen" style={{ color: "var(--foreground)", background: "var(--background)", fontFamily: "var(--font-body)" }}>
      <link rel="stylesheet" href={FONT_STYLESHEET_HREF} precedence="default" />

      <header className="sticky top-0 z-30 border-b backdrop-blur-[14px]" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--background) 82%, transparent)" }}>
        <div className="flex h-[56px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <IconTip label="Back to the app">
              <Link href="/home" aria-label="Back to the app" className="dm-quiet flex size-9 shrink-0 items-center justify-center rounded-full border outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" style={QUIET_STYLE}>
                <ArrowLeft className="h-[16px] w-[16px]" aria-hidden />
              </Link>
            </IconTip>
            <p className="min-w-0 truncate text-[10.5px] font-bold tracking-[0.1em] uppercase" style={{ color: "var(--primary)" }}>
              Scene review · internal tool
            </p>
          </div>
          <QuickLinksMenu />
        </div>
      </header>

      <div className="grid gap-[var(--space-6)] px-4 py-[var(--space-5)] sm:px-6 min-[1000px]:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="dm-scroll flex flex-col gap-[var(--space-4)] min-[1000px]:sticky min-[1000px]:top-[76px] min-[1000px]:max-h-[calc(calc(100vh/var(--vz,1))-96px)] min-[1000px]:self-start min-[1000px]:overflow-y-auto min-[1000px]:pr-[4px]">
          <div className="flex flex-col gap-[4px]">
            <h1 className="text-[22px] leading-[28px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              Scene review
            </h1>
            <p className="text-[13px] leading-[19px]" style={MUTED}>
              Every room in a career at five screen sizes, drawn with the player&rsquo;s own math, checked automatically. Read only.
            </p>
          </div>

          <div className="flex flex-col gap-[6px]">
            <span className="text-[12px] font-bold" style={MUTED}>
              Career
            </span>
            <Listbox value={source.key} onChange={pick} ariaLabel="Career" options={sources.map((s) => ({ value: s.key, label: careerLabel(s) }))} className={FIELD} style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)", color: "var(--foreground)" }} />
          </div>

          <section aria-live="polite" className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[12px]" style={CARD}>
            <p className="flex items-center gap-[8px] text-[16px] leading-[22px] font-bold">
              {total === 0 && !checking ? <CheckCircle2 className="h-[18px] w-[18px] shrink-0" style={{ color: "var(--color-feedback-success)" }} aria-hidden /> : total > 0 ? <AlertTriangle className="h-[18px] w-[18px] shrink-0" style={{ color: "var(--color-feedback-danger)" }} aria-hidden /> : null}
              {rows.length} {rows.length === 1 ? "location" : "locations"}, {total} {total === 1 ? "flag" : "flags"}
            </p>
            <p className="text-[12.5px] leading-[18px]" style={MUTED}>
              {!mounted ? "Checking images…" : pending > 0 ? `Checking ${pending} ${pending === 1 ? "image" : "images"}…` : `${flaggedRows} of ${rows.length} rooms flagged${global.length ? `, plus ${global.length} for the career` : ""}.`}
            </p>
            <div className="flex flex-wrap gap-[6px] pt-[2px]">
              <button type="button" onClick={copyReport} className={QUIET_BTN} style={QUIET_STYLE}>
                {copied === "done" ? <Check className="h-[14px] w-[14px]" aria-hidden /> : <ClipboardCopy className="h-[14px] w-[14px]" aria-hidden />}
                {copied === "done" ? "Copied" : copied === "failed" ? "Couldn't copy" : "Copy report"}
              </button>
            </div>
          </section>

          <Toggle label="Flagged only" on={flaggedOnly} onChange={setFlaggedOnly} />

          {/* Narrow screens: guides and file loading fold away so the rows
             start on the first screen, not after a full page of controls. */}
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls="scene-review-options"
            onClick={() => setMoreOpen((o) => !o)}
            className={`${QUIET_BTN} self-start min-[1000px]:hidden`}
            style={QUIET_STYLE}
          >
            <ChevronDown className="h-[14px] w-[14px] transition-transform" style={{ transform: moreOpen ? "rotate(180deg)" : "none" }} aria-hidden />
            Guides and files
          </button>

          <div id="scene-review-options" className={`${moreOpen ? "flex" : "hidden"} flex-col gap-[var(--space-4)] min-[1000px]:flex`}>
            <div className="flex flex-col gap-[2px]">
              <span className="px-[8px] pb-[2px] text-[12px] font-bold" style={MUTED}>
                Guides
              </span>
              <Toggle label="Dialogue box" on={guides.dialogue} onChange={(v) => setGuides((g) => ({ ...g, dialogue: v }))} />
              <Toggle label="Upper third" on={guides.thirds} onChange={(v) => setGuides((g) => ({ ...g, thirds: v }))} />
              <Toggle label="Frame centre" on={guides.centre} onChange={(v) => setGuides((g) => ({ ...g, centre: v }))} />
              <p className="flex items-center gap-[6px] px-[8px] pt-[4px] text-[12px] leading-[17px]" style={MUTED}>
                <span aria-hidden className="size-[9px] shrink-0 rounded-full border-2" style={{ borderColor: "var(--color-feedback-success)" }} />
                Ring: estimated face centre
              </p>
            </div>

            <div className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[12px]" style={CARD}>
              <span className="text-[12px] font-bold" style={MUTED}>
                Preview files not in the repo yet
              </span>
              <label className={`${QUIET_BTN} focus-within:ring-2 focus-within:ring-[var(--primary)]`} style={QUIET_STYLE}>
                <FileJson className="h-[14px] w-[14px]" aria-hidden />
                Load a manifest
                <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => { void onManifest(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {manifestError && <ErrorView variant="inline" message={manifestError} />}
              <label className={`${QUIET_BTN} focus-within:ring-2 focus-within:ring-[var(--primary)]`} style={QUIET_STYLE}>
                <ImagePlus className="h-[14px] w-[14px]" aria-hidden />
                Load plates and sprites
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { onAssets(e.target.files); e.target.value = ""; }} />
              </label>
              <p className="text-[12px] leading-[17px]" style={MUTED}>
                {Object.keys(assets).length === 0
                  ? "Files replace the manifest path with the same file name."
                  : `${Object.keys(assets).length} local ${Object.keys(assets).length === 1 ? "file" : "files"} loaded, ${mappedHere} used by this career.`}
              </p>
              {Object.keys(assets).length > 0 && (
                <button type="button" onClick={clearAssets} className={`${QUIET_BTN} self-start`} style={QUIET_STYLE}>
                  Clear loaded files
                </button>
              )}
            </div>

            <p className="text-[12px] leading-[17px]" style={MUTED}>
              Fixes go in the art or in src/components/play/art/{art.career}.json (the backend&rsquo;s per-career record); scripts/play-art computes focal points and slots.
            </p>
          </div>
        </aside>

        <main ref={listRef} className="flex min-w-0 flex-col gap-[var(--space-4)]">
          {global.length > 0 && (
            <section className="flex flex-col gap-[6px] rounded-[var(--radius-md)] border p-[12px]" style={{ ...CARD, borderColor: "color-mix(in srgb, var(--color-feedback-danger) 55%, transparent)" }}>
              <h2 className="text-[14px] font-bold">Career</h2>
              <FlagList flags={global} />
            </section>
          )}
          {mounted && visible.length === 0 && (
            <p className="rounded-[var(--radius-md)] border p-[16px] text-[13px]" style={{ ...CARD, ...MUTED }}>
              {pending > 0 ? "Still checking images. Flagged rooms appear here as their checks finish." : "Nothing flagged. Every room in this career passes."}
            </p>
          )}
          {!mounted && <LoadingView label="Loading rooms" shape="cards" />}
          {mounted && visible.map(({ row, flags }) => (
            <article key={row.id} data-location={row.id} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[12px]" style={flags.length ? { ...CARD, borderColor: "color-mix(in srgb, var(--color-feedback-danger) 45%, transparent)" } : CARD}>
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="min-w-0">
                  <h2 className="truncate text-[14px] leading-[20px] font-bold">{row.id}</h2>
                  <p className="text-[12px] leading-[17px]" style={MUTED}>
                    {row.beats.length} {row.beats.length === 1 ? "beat" : "beats"} ·{" "}
                    {row.sprites.length === 0 ? "nobody stands here" : row.sprites.map((s) => `${s.name}${s.source === "fallback" ? (simulation ? " (stand-in, no cast member routed here)" : " (stand-in, no level data yet)") : ""}`).join(" and ")}
                    {mappedHere > 0 && (assets[basename(row.location.src)] || row.sprites.some((s) => assets[basename(s.src)])) ? " · local file" : ""}
                  </p>
                </div>
                <StatusChip count={flags.length} checking={checking} />
              </div>
              <div className={`flex ${wrap ? "flex-wrap" : ""}`} style={{ gap: ROW_GAP }}>
                {FRAMES.map((frame) => (
                  <button
                    key={frame.key}
                    type="button"
                    onClick={() => setEnlarged({ row: row.id, frame: frame.key })}
                    aria-label={`Open ${row.id} at ${frame.label}, ${frame.w} by ${frame.h}, larger`}
                    className="group flex shrink-0 cursor-zoom-in flex-col items-start gap-[3px] rounded-[7px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    style={{ width: (frame.w / frame.h) * frameHeight }}
                  >
                    <SceneFrame
                      frame={frame}
                      displayHeight={frameHeight}
                      plateSrc={resolve(row.location.src)}
                      plateAlt={row.location.alt}
                      plateMissing={probes[resolve(row.location.src)]?.status === "error"}
                      location={row.location}
                      sprites={frameSprites(row, frame, art, probes, resolve)}
                      guides={guides}
                    />
                    <span className="w-full text-[11px] leading-[14px] font-semibold break-words group-hover:underline" style={MUTED}>
                      {frame.label} {frame.w}x{frame.h}
                    </span>
                  </button>
                ))}
              </div>
              {flags.length > 0 && <FlagList flags={flags} />}
            </article>
          ))}
        </main>
      </div>

      {enlarged && enlargedRow && (
        <EnlargedFrame row={enlargedRow} frameKey={enlarged.frame} art={art} probes={probes} resolve={resolve} guides={guides} onPick={pickEnlarged} onClose={closeEnlarged} />
      )}
    </div>
  );
}
