"use client";

// The Productivity Suite's page (26 Sept 2026, direct feedback: "I want
// the previews to look better designed like in a proper a4, letter format
// properly formatted, document or premium letterhead... maybe there can be
// a full screen view option to see the actual document as it would get
// printed. Better fonts, official fonts, standard US letter formats...
// Better margins, paddings, more of an editorial style").
//
// One page component, drawn at real US Letter size (8.5 x 11 in at 96 px
// per inch: 816 x 1056, one-inch side margins) and SCALED to fit, never
// reflowed: the page on the desk, the full-screen view and the printout
// are the same layout at different zoom, so what the counselor edits is
// what prints. Source Serif 4 for the document text (an editorial serif
// built for reading at small sizes), Inter for the letterhead's small
// print, Dancing Script for the auto-signature.
//
// Printing clones the page into a hidden iframe carrying the app's own
// stylesheets, with each textarea swapped for its text, so the printout is
// the page alone on a Letter sheet, not the dashboard around it.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDialogFocus } from "./useDialogFocus";
import { Maximize2, Minus, Plus, Printer, Share2, X, Pencil } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { IconTip } from "@/components/app/IconTip";
import { type CounselorStudent } from "@/lib/counselorRoster";
import { SignatureInk } from "./Signature";
import { usePublicationStyle } from "./SchoolPublication";
import { PAPER_VARS } from "./DocumentPreview";

export const PAGE_W = 816;
export const PAGE_H = 1056;
export const SERIF = "'Source Serif 4', Georgia, 'Times New Roman', serif";
export const SANS = "var(--font-body), Inter, ui-sans-serif, system-ui, sans-serif";
export const BRAND = "#3F4DD6";

export type DocKind = "recommendation-letter" | "student-brief" | "parent-brief" | "success-plan" | "brag-sheet" | "family-questionnaire" | "meeting-summary";

export const DOC_TITLES: Record<DocKind, string> = {
  "recommendation-letter": "Recommendation Letter",
  "student-brief": "Student Meeting Brief",
  "parent-brief": "Parent Meeting Brief",
  "success-plan": "Student Success Plan",
  // more counselor templates (8 Oct 2026: "add more templates like brag sheet")
  "brag-sheet": "Student Brag Sheet",
  "family-questionnaire": "Family Questionnaire",
  "meeting-summary": "Meeting Summary",
};

function fmtToday(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function schoolInitials(name: string): string {
  return name.split(" ").filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).join("").slice(0, 3) || name.slice(0, 2).toUpperCase();
}

/** A shield monogram: reads as "school crest", not a company logo. */
export function Crest({ size = 46 }: { size?: number }) {
  const { style } = usePublicationStyle();
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="flex-none">
      <path d="M20 2 L36 8 V19 C36 29 29 35 20 38 C11 35 4 29 4 19 V8 Z" fill={style.accent} />
      <path d="M20 5.2 L33 10.1 V19 C33 27.3 27.4 32.3 20 34.8 C12.6 32.3 7 27.3 7 19 V10.1 Z" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.8" />
      <text x="20" y="24.2" textAnchor="middle" fontSize="12.5" fontWeight="700" fontFamily={SERIF} fill="#fff" letterSpacing="0.5">{schoolInitials(style.school)}</text>
    </svg>
  );
}

/** The letterhead: crest and school on the left, contact small print on
 *  the right, a double rule under both. */
export function Letterhead() {
  const { style } = usePublicationStyle();
  return <header className={`publication-masthead ${style.layout}`} style={{ borderColor: style.accent, color: style.accent }}>
    <div className="publication-school"><Crest size={style.layout === "classic" ? 48 : 34}/><div><strong>{style.school}</strong><span>{style.office}</span></div></div>
    {style.contact && <p>{style.contact}</p>}
  </header>;
}

/** The drafts' light markup as plain text (for Copy and notes). */
export function plainText(src: string): string {
  return src.split("\n").map((l) => l.replace(/^#\s+/, "").replace(/\*\*(.+?)\*\*/g, "$1")).join("\n");
}

/** **bold** spans, and a [bracketed gap] marked as the one thing still to
 *  write, the way a mail-merge field shows in a word processor. */
function inline(text: string): React.ReactNode[] {
  return text.split(/(\*\*.+?\*\*|\[[^\]]+\])/g).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("[") && part.endsWith("]")) return <mark key={i} className="rounded-[3px] px-[4px]" style={{ background: "#FFF1C2", color: "#7A5300", fontStyle: "italic" }}>{part.slice(1, -1)}</mark>;
    return <span key={i}>{part}</span>;
  });
}

/** The markup rendered as a document: section headings as small tracked
 *  labels over a hairline, bullets and numbered steps in the serif. */
function RichText({ src, letter }: { src: string; letter: boolean }) {
  const lines = src.split("\n");
  const out: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((t, i) => (
      <li key={i} className="flex gap-[10px]">
        <span className="flex-none tabular-nums" style={{ color: BRAND, fontWeight: 700, minWidth: list!.ordered ? 16 : 8 }}>{list!.ordered ? `${i + 1}.` : "•"}</span>
        <span>{inline(t)}</span>
      </li>
    ));
    out.push(<ul key={`l${out.length}`} className="flex flex-col gap-[5px]">{items}</ul>);
    list = null;
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    const bullet = /^-\s+(.*)$/.exec(line);
    const num = /^\d+\.\s+(.*)$/.exec(line);
    if (bullet || num) {
      const ordered = Boolean(num);
      if (list && list.ordered !== ordered) flush();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet ?? num)![1]);
      return;
    }
    flush();
    if (line.startsWith("# ")) {
      out.push(
        <h2 key={i} className="border-b pb-[5px]" style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink)", borderColor: "var(--rule)", marginTop: out.length ? 22 : 0, marginBottom: 2 }}>{line.slice(2)}</h2>,
      );
    } else if (line === "") {
      out.push(<span key={i} aria-hidden className="block" style={{ height: letter ? 12 : 4 }} />);
    } else {
      out.push(<p key={i}>{inline(line)}</p>);
    }
  });
  flush();
  return <div className="flex flex-col gap-[6px]" style={{ fontFamily: SERIF, fontSize: letter ? 15 : 14.5, lineHeight: 1.65, color: "var(--ink)" }}>{out}</div>;
}

/** The document's body: the formatted document at rest, its text to edit
 *  on click (a textarea cannot show bold or bullets), formatted again on
 *  blur. Printing always gets the formatted version. */
function BodyText({ value, onChange, letter, minRows = 6 }: { value: string; onChange: (v: string) => void; letter: boolean; minRows?: number }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fitHeight = () => {
    const el = ref.current;
    if (!el || !el.isConnected) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useLayoutEffect(fitHeight, [value, editing]);
  useEffect(() => {
    if (!editing) return;
    const el = ref.current;
    el?.focus();
    const id = requestAnimationFrame(fitHeight);
    return () => cancelAnimationFrame(id);
  }, [editing]);
  const frame = "block w-full rounded-[4px] border border-dashed px-[10px] py-[8px]";
  return (
    <div className="group/edit relative -mx-[10px]">
      {editing ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          rows={minRows}
          aria-label="Document text"
          spellCheck
          className={`${frame} resize-none overflow-hidden outline-none`}
          style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.6, color: "var(--ink)", background: "color-mix(in srgb, #3F4DD6 4%, transparent)", borderColor: "color-mix(in srgb, #3F4DD6 45%, transparent)" }}
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Edit document text"
          onClick={() => setEditing(true)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setEditing(true); } }}
          className={`${frame} cursor-text text-left transition-colors hover:bg-[color-mix(in_srgb,#3F4DD6_3%,transparent)]`}
          style={{ borderColor: "color-mix(in srgb, var(--ink-faint) 28%, transparent)" }}
        >
          <RichText src={value} letter={letter} />
        </div>
      )}
      <span data-print-hide className="pointer-events-none absolute top-[-11px] right-[12px] flex items-center gap-[4px] rounded-full px-[9px] py-[3px] shadow-sm" style={{ fontFamily: SANS, fontSize: 10.5, fontWeight: 700, color: "#fff", background: BRAND }}>
        <Pencil className="h-[10px] w-[10px]" aria-hidden /> {editing ? "Editing · # heading · - bullet · **bold**" : "Click to edit"}
      </span>
    </div>
  );
}

function Footer({ right }: { right: string }) {
  const { style } = usePublicationStyle();
  return (
    <footer className="mt-auto flex items-center justify-between border-t pt-[10px]" style={{ borderColor: "var(--rule)", fontFamily: SANS, fontSize: 9, letterSpacing: "0.04em", color: "var(--ink-faint)" }}>
      <span>{style.school} · {style.office}</span>
      <span>{right}</span>
    </footer>
  );
}

/** Placeholder lines on an empty page: the document's shape before there
 *  is any text, so the desk never shows a blank sheet. */
function Ghost({ hint }: { hint: string }) {
  return (
    <div className="relative flex flex-col gap-[12px] py-[6px]" aria-hidden>
      {[92, 100, 96, 88, 0, 100, 94, 97, 70].map((w, i) => (
        w === 0 ? <span key={i} className="h-[10px]" /> : <span key={i} className="block h-[9px] rounded-full" style={{ width: `${w}%`, background: "var(--paper-sunken)" }} />
      ))}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-full border px-[14px] py-[6px]" style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", borderColor: "var(--rule)", background: "var(--paper)" }}>{hint}</span>
      </span>
    </div>
  );
}

export type Signer = { name: string; role: string; signatureDataUrl?: string };

/** One US Letter page at real size (816 x 1056). */
export function DocumentPage({ kind, title, student, letterType, signer, draft, onDraft, pageRef }: {
  kind: DocKind; /** the heading, when a host names the kind its own way (v4 Assist's "Action Plan", 9 Oct 2026) */ title?: string; student?: CounselorStudent; letterType: string; signer: Signer;
  draft: string | null; onDraft: (v: string) => void; pageRef?: React.Ref<HTMLDivElement>;
}) {
  const { style: publication } = usePublicationStyle();
  const hint = student ? "Generate a draft, or write your own" : "Choose a student to begin";
  // The demo counselor when the account has no name saved, the same fallback
  // the rest of the dashboard uses (My Impact, the shell): "Your Counselor"
  // printed on a letter, and drawn as its signature, read as broken
  // (direct report, 26 Sept 2026).
  const signerName = signer.name.trim() || "Sarah Chen";
  return (
    <div
      ref={pageRef}
      data-doc-page
      className="publication-document flex flex-col"
      style={{ ...PAPER_VARS, width: PAGE_W, minHeight: PAGE_H, padding: "60px 76px 48px", background: "var(--paper)", color: "var(--ink)" }}
    >
      {kind === "recommendation-letter" ? (
        <>
          <Letterhead />
          <div className="mt-[38px] flex flex-col gap-[22px]" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.65 }}>
            <span style={{ fontFamily: SANS, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{fmtToday()} · Recommendation</span>
            <span style={{ fontWeight: 500, fontSize: 34, lineHeight: 1.1, letterSpacing: "-.02em" }}>
              {student ? student.name : "Letter of recommendation"}{letterType && <small style={{ display: "block", fontFamily: SANS, fontWeight: 400, fontSize: 11, color: "var(--ink-faint)", marginTop: 8 }}>{letterType === "College Application" ? "School Application" : letterType}</small>}
            </span>
            {draft === null ? <Ghost hint={hint} /> : <BodyText value={draft} onChange={onDraft} letter minRows={8} />}
            <div className="mt-[8px] flex flex-col">
              <span>Sincerely,</span>
              <SignatureInk name={signerName} image={signer.signatureDataUrl}/>
              <span style={{ fontWeight: 600 }}>{signerName}</span>
              <span style={{ fontFamily: SANS, fontSize: 11.5, color: "var(--ink-faint)" }}>{signer.role || "School Counselor"} · {publication.school}</span>
            </div>
          </div>
          <div className="mt-[48px] flex flex-1 flex-col"><Footer right="Page 1 of 1" /></div>
        </>
      ) : (
        <>
          {/* A memo, not a letter: these are working documents for a
             meeting or a plan, so they open with what and who, not a date
             and a salutation. */}
          <Letterhead />
          <span style={{fontFamily: SANS, fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: publication.accent, marginTop: 26}}>Counseling record · Confidential</span>
          <h1 className="mt-[12px]" style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{title ?? DOC_TITLES[kind]}</h1>
          <dl className="mt-[22px] grid grid-cols-3 gap-x-[24px] gap-y-[12px] border-y py-[14px]" style={{ borderColor: "var(--rule)" }}>
            {[
              [kind === "parent-brief" || kind === "family-questionnaire" ? "Family of" : "Student", student?.name ?? "Not chosen"],
              ["Grade", student ? String(student.grade) : "–"],
              ["Pathway", student?.careerTrack ?? "–"],
              ["Prepared by", signerName],
              ["Date", fmtToday()],
              ["Status", student?.status ?? "–"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-[2px]">
                <dt style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{k}</dt>
                <dd style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600 }}>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-[30px]">
            {draft === null ? <Ghost hint={hint} /> : <BodyText value={draft} onChange={onDraft} letter={false} minRows={10} />}
          </div>
          <div className="mt-[48px] flex flex-1 flex-col"><Footer right="For counseling use · Page 1 of 1" /></div>
        </>
      )}
    </div>
  );
}

/** Scales a real-size page down to its container's width (never up), and,
 *  with `fitHeight`, also down to that height so the whole page shows. */
export function FitPage({ children, max = 1, fitHeight, shadow = "0 1px 2px rgba(0,0,0,0.25), 0 24px 60px -20px rgba(0,0,0,0.6)" }: { children: React.ReactNode; max?: number; fitHeight?: number; shadow?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const [h, setH] = useState(PAGE_H);
  useLayoutEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i) return;
    const ro = new ResizeObserver(() => {
      setScale(Math.min(max, w.clientWidth / PAGE_W, fitHeight ? fitHeight / Math.max(1, i.offsetHeight) : Infinity));
      setH(i.offsetHeight);
    });
    ro.observe(w);
    ro.observe(i);
    return () => ro.disconnect();
  }, [max, fitHeight]);
  return (
    <div ref={wrap} className="w-full" style={{ height: h * scale }}>
      <div ref={inner} style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: "top left", boxShadow: shadow }}>
        {children}
      </div>
    </div>
  );
}

export { printDocumentPage } from "./documentPrint";

const ZOOMS = [0.5, 0.75, 1, 1.25];

/** Full screen: the page as it prints, at a chosen zoom, still editable. */
export function FullScreenDocument({ open, onClose, title, onPrint, share, children }: { open: boolean; onClose: () => void; title: string; onPrint: () => void; /** optional Share menu: each option closes the menu and runs */ share?: { label: string; icon: typeof Printer; onClick: () => void }[]; children: React.ReactNode }) {
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [shareOpen, setShareOpen] = useState(false);
  const surface = useRef<HTMLDivElement>(null);
  const pageBox = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [pageH, setPageH] = useState(PAGE_H);
  const dialogRef=useRef<HTMLDivElement>(null);
  useDialogFocus(open,dialogRef,onClose);
  useLayoutEffect(() => {
    const el = surface.current;
    if (!open || !el) return;
    const ro = new ResizeObserver(() => {
      setFit(Math.min(1.25, (el.clientWidth - 64) / PAGE_W, (el.clientHeight - 64) / PAGE_H));
      if (pageBox.current) setPageH(pageBox.current.offsetHeight);
    });
    ro.observe(el);
    if (pageBox.current) ro.observe(pageBox.current);
    return () => ro.disconnect();
  }, [open]);
  if (!open) return null;
  const scale = zoom === "fit" ? fit : zoom;
  const stepZoom = (dir: 1 | -1) => {
    const cur = scale;
    const next = dir > 0 ? ZOOMS.find((z) => z > cur + 0.01) : [...ZOOMS].reverse().find((z) => z < cur - 0.01);
    if (next) setZoom(next);
  };
  const btn = "dm-quiet flex h-[32px] cursor-pointer items-center justify-center gap-[6px] rounded-[6px] px-[8px] text-[12.5px] font-semibold";
  return (
    <Portal>
      <div ref={dialogRef} tabIndex={-1} className="v4-full-document v4-popover fixed inset-0 z-[130] flex flex-col" role="dialog" aria-modal="true" aria-label={`${title}, full screen`} style={{ background: "#1c1d20" }}>
        <div className="flex flex-none items-center justify-between gap-[12px] border-b px-[16px] py-[8px]" style={{ background: "#26272b", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)" }}>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{title}</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>US Letter · 8.5 × 11 in · as it prints</span>
          </span>
          <span className="flex flex-none items-center gap-[2px]">
            <IconTip label="Zoom out"><button type="button" onClick={() => stepZoom(-1)} className={btn}><Minus className="h-[14px] w-[14px]" aria-hidden /></button></IconTip>
            <button type="button" onClick={() => setZoom(zoom === "fit" ? 1 : "fit")} className={`${btn} min-w-[64px] tabular-nums`}>{zoom === "fit" ? "Fit" : `${Math.round(scale * 100)}%`}</button>
            <IconTip label="Zoom in"><button type="button" onClick={() => stepZoom(1)} className={btn}><Plus className="h-[14px] w-[14px]" aria-hidden /></button></IconTip>
            <span className="mx-[6px] h-[18px] w-px" style={{ background: "rgba(255,255,255,0.15)" }} />
            <button type="button" onClick={onPrint} className={btn}><Printer className="h-[14px] w-[14px]" aria-hidden />Print or save PDF</button>
            {share && share.length > 0 && (
              <span className="relative">
                <button type="button" onClick={() => setShareOpen((v) => !v)} aria-expanded={shareOpen} aria-haspopup="menu" className={btn}><Share2 className="h-[14px] w-[14px]" aria-hidden />Share</button>
                {shareOpen && (
                  <span role="menu" className="absolute top-[calc(100%+6px)] right-0 z-10 flex min-w-[200px] flex-col rounded-[8px] border p-[4px]" style={{ background: "#2f3035", borderColor: "rgba(255,255,255,0.12)", boxShadow: "0 16px 40px -12px rgba(0,0,0,0.6)" }}>
                    {share.map((o) => (
                      <button key={o.label} type="button" role="menuitem" onClick={() => { setShareOpen(false); o.onClick(); }} className="dm-quiet flex cursor-pointer items-center gap-[8px] rounded-[6px] px-[10px] py-[8px] text-left text-[12.5px] font-semibold" style={{ color: "var(--foreground)" }}>
                        <o.icon className="h-[14px] w-[14px]" aria-hidden />{o.label}
                      </button>
                    ))}
                  </span>
                )}
              </span>
            )}
            <IconTip label="Close"><button type="button" aria-label="Close" onClick={onClose} className={btn}><X className="h-[16px] w-[16px]" aria-hidden /></button></IconTip>
          </span>
        </div>
        <div ref={surface} className="flex-1 dm-scroll overflow-auto p-[32px]">
          {/* The scaled page's own box: transform does not move layout, so
             the wrapper takes the scaled size itself. */}
          <div className="mx-auto" style={{ width: PAGE_W * scale, height: pageH * scale }}>
            <div ref={pageBox} style={{ width: PAGE_W, transform: `scale(${scale})`, transformOrigin: "top left", boxShadow: "0 24px 80px -20px rgba(0,0,0,0.7)" }}>{children}</div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export function FullScreenButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="dm-quiet flex h-8 cursor-pointer items-center gap-[6px] rounded-full border px-[11px] text-[12px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>
      <Maximize2 className="h-[12px] w-[12px]" aria-hidden /> Full screen
    </button>
  );
}
