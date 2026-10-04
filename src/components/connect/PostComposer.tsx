"use client";

// The volunteer's post composer, on Instagram's story-editor model (4 Oct
// 2026). Joshua: "too many controls, labels, and decisions visible at
// once... Instagram reveals tools progressively"; "a volunteer should be
// able to create something attractive in under a minute". Chandu: "use
// Instagram's UI, not a huge form and endless menus... keep our background
// and functionality, enable undo, keep the vector stuff, remove the emoji
// sticker", then "editing should be inline in the preview itself, just a
// hint to tap the preview to change text", and "pick a tab from the bottom
// > its menu opens as a side-scrollable strip overlaid at the bottom of the
// preview > select to make changes".
//
//   Header      Close · Text post | Graphic post · Share (or Next)
//   Text post   a title and the words; ideas fold under "Need an idea?"
//   Graphic     the preview is the screen and the words are typed on it.
//               Bottom tabs: Background, Text, Effects, Mark. A tab opens
//               its choices as horizontal strips over the bottom of the
//               preview (Text: the font strip, each name in its own face,
//               then alignment, position, text box, caps and colour; Mark:
//               the corners are also tappable on the preview). Undo, Redo
//               and a small shuffle sit on the preview. Next: the caption.
//   Caption     the picture small, the title and words, Share to (the
//               community it lands in: Joshua, "create the content once,
//               select the relevant community").
// Auto first, choice second: a photo's words sit in its calmest band and
// the Dreamari mark in its calmest corner (measured per photo). Kept: it
// opens over any page, closing keeps the draft, a title and 40 characters
// to post, every background, font and effect. Gone: emoji stickers, and
// the Paper and Scenes backgrounds from the picker.

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlignCenter, AlignLeft, AlignRight, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart,
  ArrowLeft, ChevronDown, ImageIcon, Lightbulb, Redo2, Shuffle, Sparkles, Stamp, Type, Undo2, X,
} from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { WORLD_COLORS } from "@/components/app/worlds";
import { COMMUNITIES, type Insight, type InsightGraphic, type Pro } from "./data";
import { EFFECTS, FONTS, GROUPS, GraphicGround, InsightGraphicView, TEMPLATES, boardForPro, resolvePlacement, templateById, type Template } from "./FeedBreathers";

const firstSentence = (s: string, max = 140): string => {
  const m = s.match(/^[^.!?]+[.!?]/);
  const first = (m ? m[0] : s).trim();
  return first.length > max ? first.slice(0, max - 1).trimEnd() + "…" : first;
};

type Tool = "bg" | "text" | "fx" | "mark";
const BLUE = "#3b82f6";
const STARTER: InsightGraphic = { text: "", bg: "p-peak-dawn", font: "classic" };

/** Undo and redo over the graphic. Typing is one step per pause. */
function useHistory() {
  const [stack, setStack] = useState<{ past: InsightGraphic[]; now: InsightGraphic | null; future: InsightGraphic[] }>({ past: [], now: null, future: [] });
  const lastTyping = useRef(0);
  const set = useCallback((next: InsightGraphic, typing = false) => {
    setStack((s) => {
      const t = Date.now();
      const coalesce = typing && t - lastTyping.current < 700 && s.past.length > 0;
      lastTyping.current = typing ? t : 0;
      if (!s.now) return { past: [], now: next, future: [] };
      return { past: coalesce ? s.past : [...s.past, s.now].slice(-60), now: next, future: [] };
    });
  }, []);
  const reset = useCallback((g: InsightGraphic | null) => setStack({ past: [], now: g, future: [] }), []);
  const undo = useCallback(() => setStack((s) => (s.past.length && s.now ? { past: s.past.slice(0, -1), now: s.past[s.past.length - 1], future: [s.now, ...s.future] } : s)), []);
  const redo = useCallback(() => setStack((s) => (s.future.length && s.now ? { past: [...s.past, s.now], now: s.future[0], future: s.future.slice(1) } : s)), []);
  return { g: stack.now, set, reset, undo, redo, canUndo: stack.past.length > 0, canRedo: stack.future.length > 0 };
}

export function PostComposer({ pro, open, onClose, prompts, onPublish }: {
  pro: Pro;
  open: boolean;
  onClose: () => void;
  prompts: string[];
  onPublish: (post: { title: string; body: string; graphic?: InsightGraphic; boardId: string }) => void;
}) {
  const [kind, setKind] = useState<"text" | "graphic">("text");
  const [stage, setStage] = useState<"edit" | "caption">("edit");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [boardId, setBoardId] = useState(() => boardForPro(pro));
  const [tool, setTool] = useState<Tool | null>(null);
  const { g, set, reset, undo, redo, canUndo, canRedo } = useHistory();
  const [typed, setTyped] = useState(false);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal target exists only after mount
  useEffect(() => setMounted(true), []);
  const editing = kind === "graphic" && stage === "edit";
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { if (tool) setTool(null); else onClose(); return; }
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
      if (editing && !typing && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, editing, tool, undo, redo]);
  if (!mounted || !open) return null;

  const color = WORLD_COLORS[pro.world] ?? "var(--primary)";
  const ready = title.trim().length > 0 && body.trim().length >= 40;
  const pickKind = (k: "text" | "graphic") => {
    setKind(k);
    setStage("edit");
    setTool(null);
    if (k === "graphic" && !g) reset({ ...STARTER, text: firstSentence(body || title) || "Your best line, in a few words." });
  };
  const publish = () => {
    if (!ready) return;
    onPublish({ title: title.trim(), body: body.trim(), graphic: kind === "graphic" && g && g.text.trim() ? g : undefined, boardId });
    setTitle(""); setBody(""); reset(null); setKind("text"); setStage("edit"); setTool(null);
    onClose();
  };
  const shuffle = () => {
    if (!g) return;
    const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
    const t = pick(TEMPLATES.filter((x) => GROUPS.includes(x.group)));
    set({ text: g.text, bg: t.id, font: pick(FONTS).id, surface: t.photo && t.group !== "Photos" ? "soft" : pick(["none", "none", "solid"] as const), effects: t.group === "Photos" ? [] : [pick(EFFECTS).id] });
  };
  const toggleTool = (k: Tool) => setTool((cur) => (cur === k ? null : k));
  const preview: Insight = { id: "preview", boardId, type: "insight", proId: pro.id, title: "", body, postedAgo: "", helpful: 0, replies: [] };

  const iconBtn = "dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full disabled:cursor-default disabled:opacity-35";
  const right = kind === "text" || stage === "caption"
    ? <button type="button" onClick={publish} disabled={!ready} className={`dm-quiet cursor-pointer text-[14.5px] font-bold disabled:cursor-default disabled:opacity-40`} style={{ color: BLUE }}>Share</button>
    : <button type="button" onClick={() => { setTool(null); setStage("caption"); }} className="dm-quiet cursor-pointer text-[14.5px] font-bold" style={{ color: BLUE }}>Next</button>;

  return createPortal(
    <div className="marketing-v2 themeable" style={{ background: "transparent" }}>
      <button type="button" aria-label="Close composer, keep draft" onClick={onClose} className="fixed inset-0 z-[94] cursor-default" style={{ background: "rgba(5,6,16,0.62)", backdropFilter: "blur(2px)" }} />
      <section role="dialog" aria-modal="true" aria-label="Create post"
        className={`fixed z-[95] flex flex-col overflow-hidden max-sm:inset-0 sm:top-1/2 sm:left-1/2 sm:w-[min(520px,calc(100vw-32px))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[16px] sm:border motion-safe:animate-[fade-slide-up_0.2s_ease-out_both] ${kind === "graphic" ? "sm:h-[min(880px,calc(100dvh-32px))]" : "sm:max-h-[calc(100dvh-32px)]"}`}
        style={{ background: "color-mix(in srgb, var(--background) 94%, #ffffff)", borderColor: "var(--glass-border)", boxShadow: "0 24px 64px -20px rgba(0,0,0,0.8)", color: "var(--foreground)" }}>

        {/* header: close or back, the one choice, the next action */}
        <header className="grid h-[52px] flex-none grid-cols-[64px_1fr_64px] items-center border-b px-[8px]" style={{ borderColor: "var(--glass-border)" }}>
          <span>
            {stage === "caption"
              ? <IconTip label="Back"><button type="button" onClick={() => setStage("edit")} aria-label="Back" className={iconBtn}><ArrowLeft className="h-5 w-5" aria-hidden /></button></IconTip>
              : <IconTip label="Close (draft is kept)"><button type="button" onClick={onClose} aria-label="Close" className={iconBtn}><X className="h-5 w-5" aria-hidden /></button></IconTip>}
          </span>
          {stage === "caption" ? <h2 className="text-center text-[15px] font-bold">New post</h2> : (
            <div role="radiogroup" aria-label="Post type" className="mx-auto flex rounded-full p-[3px]" style={{ background: "color-mix(in srgb, var(--foreground) 9%, transparent)" }}>
              {([["text", "Text post"], ["graphic", "Graphic post"]] as const).map(([k, label]) => (
                <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => pickKind(k)} className="dm-quiet h-[30px] cursor-pointer rounded-full px-[14px] text-[13px] font-bold whitespace-nowrap" style={kind === k ? { background: "color-mix(in srgb, var(--foreground) 16%, transparent)", color: "var(--foreground)" } : { color: "var(--muted-foreground)" }}>{label}</button>
              ))}
            </div>
          )}
          <span className="flex justify-end pr-[8px]">{right}</span>
        </header>

        {/* TEXT POST: a title and the words */}
        {kind === "text" && (
          <>
            <Writing title={title} setTitle={setTitle} body={body} setBody={setBody} prompts={prompts} rows={7} autoFocus />
            <ShareTo boardId={boardId} setBoardId={setBoardId} ready={ready} title={title} body={body} />
          </>
        )}

        {/* GRAPHIC: the preview is the screen; the words are typed on it */}
        {editing && g && (
          <>
            <div className="relative flex min-h-0 flex-1 items-center justify-center p-[16px]" style={{ background: "color-mix(in srgb, var(--background) 60%, #000)" }}>
              <div className="relative h-full max-h-full" style={{ aspectRatio: "4 / 5", maxWidth: "100%" }}>
                <InsightGraphicView insight={preview} graphic={g} editable={{ onText: (text) => { setTyped(true); set({ ...g, text }, true); } }} />
                {/* Mark: the corners are tappable right on the preview */}
                {tool === "mark" && (["tl", "tr", "bl", "br"] as const).map((c) => {
                  const on = resolvePlacement(g).mark === c;
                  return <IconTip key={c} label={{ tl: "Top left", tr: "Top right", bl: "Bottom left", br: "Bottom right" }[c]}><button type="button" aria-label={`Mark ${c}`} aria-pressed={g.mark === c} onClick={() => set({ ...g, mark: c })} className="dm-quiet absolute z-[3] h-[12%] w-[34%] cursor-pointer rounded-[10px] border-2 border-dashed" style={{ [c[0] === "t" ? "top" : "bottom"]: "2%", [c[1] === "l" ? "left" : "right"]: "2%", borderColor: on ? BLUE : "rgba(255,255,255,0.55)", background: on ? "color-mix(in srgb, #3b82f6 18%, transparent)" : "transparent" }} /></IconTip>;
                })}
              </div>
              {!typed && !tool && <span className="pointer-events-none absolute top-[14px] left-[14px] z-[4] rounded-full px-[12px] py-[6px] text-[12.5px] font-bold motion-safe:animate-pulse" style={{ background: "rgba(10,10,18,0.66)", color: "#fff" }}>Tap the words to edit</span>}
              <span className="absolute top-[12px] right-[12px] z-[4] flex gap-[6px]">
                {[
                  { label: "Undo", Icon: Undo2, on: undo, disabled: !canUndo },
                  { label: "Redo", Icon: Redo2, on: redo, disabled: !canRedo },
                  { label: "Surprise me", Icon: Shuffle, on: shuffle, disabled: false },
                ].map(({ label, Icon, on, disabled }) => (
                  <IconTip key={label} label={label}><button type="button" onClick={on} disabled={disabled} aria-label={label} className={iconBtn} style={{ background: "rgba(10,10,18,0.62)", color: "#fff" }}><Icon className="h-4 w-4" aria-hidden /></button></IconTip>
                ))}
              </span>
              {/* the chosen tab's choices: strips over the bottom of the preview */}
              {tool && (
                <div className="absolute inset-x-0 bottom-0 z-[4] flex flex-col gap-[8px] px-[16px] pt-[28px] pb-[14px] motion-safe:animate-[fade-slide-up_0.16s_ease-out_both]" style={{ background: "linear-gradient(to top, rgba(5,6,16,0.9) 0%, rgba(5,6,16,0.7) 60%, transparent 100%)" }}>
                  {tool === "bg" && <BackgroundStrips g={g} color={color} onPick={(t) => set({ ...g, bg: t.id, valign: undefined, mark: undefined, color: undefined, surface: t.photo && t.group !== "Photos" ? g.surface ?? "soft" : g.surface })} />}
                  {tool === "text" && <TextStrips g={g} onChange={(patch) => set({ ...g, ...patch })} />}
                  {tool === "fx" && (
                    <Strip label="Effects">
                      {EFFECTS.map((ef) => {
                        const on = !!g.effects?.includes(ef.id);
                        return <Chip key={ef.id} on={on} onClick={() => set({ ...g, effects: on ? (g.effects ?? []).filter((x) => x !== ef.id) : [...(g.effects ?? []), ef.id] })}>{ef.label}</Chip>;
                      })}
                    </Strip>
                  )}
                  {tool === "mark" && (
                    <Strip label="Mark corner">
                      <Chip on={!g.mark} onClick={() => set({ ...g, mark: undefined })}>Auto</Chip>
                      {(["tl", "tr", "bl", "br"] as const).map((c) => <Chip key={c} on={g.mark === c} onClick={() => set({ ...g, mark: c })}>{{ tl: "Top left", tr: "Top right", bl: "Bottom left", br: "Bottom right" }[c]}</Chip>)}
                    </Strip>
                  )}
                </div>
              )}
            </div>
            {/* the tabs */}
            <nav aria-label="Graphic tools" className="grid flex-none grid-cols-4 border-t" style={{ borderColor: "var(--glass-border)" }}>
              {([
                ["bg", "Background", ImageIcon],
                ["text", "Text", Type],
                ["fx", "Effects", Sparkles],
                ["mark", "Mark", Stamp],
              ] as const).map(([k, label, Icon]) => (
                <button key={k} type="button" aria-pressed={tool === k} onClick={() => toggleTool(k)} className="dm-quiet flex cursor-pointer flex-col items-center gap-[3px] py-[10px] text-[11.5px] font-bold" style={{ color: tool === k ? "var(--foreground)" : "var(--muted-foreground)" }}>
                  <span className="flex size-[30px] items-center justify-center rounded-full" style={{ background: tool === k ? "color-mix(in srgb, var(--foreground) 14%, transparent)" : "transparent" }}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
                  {label}
                </button>
              ))}
            </nav>
          </>
        )}

        {/* CAPTION: the picture small, the words, where it goes */}
        {kind === "graphic" && stage === "caption" && g && (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <div className="flex gap-[14px] px-[16px] pt-[14px]">
                <span className="block w-[92px] flex-none"><InsightGraphicView insight={preview} graphic={g} /></span>
                <span className="flex min-w-0 flex-1 flex-col"><Writing title={title} setTitle={setTitle} body={body} setBody={setBody} prompts={prompts} rows={5} bare /></span>
              </div>
            </div>
            <ShareTo boardId={boardId} setBoardId={setBoardId} ready={ready} title={title} body={body} />
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}

/** The title and the words, with ideas folded away. */
function Writing({ title, setTitle, body, setBody, prompts, rows, autoFocus = false, bare = false }: { title: string; setTitle: (s: string) => void; body: string; setBody: (s: string) => void; prompts: string[]; rows: number; autoFocus?: boolean; bare?: boolean }) {
  const [ideas, setIdeas] = useState(false);
  const pad = bare ? "" : "px-[18px]";
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${bare ? "" : "pt-[14px]"}`}>
      {/* a title wraps instead of scrolling sideways; Enter does not add a line */}
      <textarea autoFocus={autoFocus} value={title} onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))} onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} rows={2} maxLength={90} placeholder="Title" aria-label="Post title" className={`${pad} resize-none bg-transparent text-[18px] leading-[25px] font-bold placeholder:text-[color:var(--muted-foreground)]`} style={{ outline: "none" }} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={rows} maxLength={600} placeholder="What do you want students to know?" aria-label="Post" className={`${pad} mt-[8px] min-h-[96px] flex-1 resize-none bg-transparent text-[15px] leading-[22px] placeholder:text-[color:var(--muted-foreground)]`} style={{ outline: "none" }} />
      <div className={`${pad} flex items-center justify-between gap-[10px] pt-[6px] pb-[10px]`}>
        <button type="button" aria-expanded={ideas} onClick={() => setIdeas((v) => !v)} className="dm-quiet flex cursor-pointer items-center gap-[5px] text-[13px] font-bold" style={{ color: "var(--muted-foreground)" }}><Lightbulb className="h-4 w-4" aria-hidden />Need an idea?</button>
        <span className="text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{body.length}/600</span>
      </div>
      {ideas && (
        <span className={`${pad} flex flex-wrap gap-[6px] pb-[12px]`}>
          {prompts.slice(0, 4).map((p) => <button key={p} type="button" onClick={() => { setTitle(p); setIdeas(false); }} className="dm-quiet cursor-pointer rounded-full border px-[10px] py-[4px] text-left text-[12.5px] leading-[17px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{p}</button>)}
        </span>
      )}
    </div>
  );
}

/** Share to: one row, opens the communities (Instagram's Add location). */
function ShareTo({ boardId, setBoardId, ready, title, body }: { boardId: string; setBoardId: (id: string) => void; ready: boolean; title: string; body: string }) {
  const [open, setOpen] = useState(false);
  const board = COMMUNITIES.find((c) => c.id === boardId) ?? COMMUNITIES[0];
  return (
    <div className="flex-none border-t" style={{ borderColor: "var(--glass-border)" }}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="dm-quiet flex w-full cursor-pointer items-center justify-between gap-[10px] px-[18px] py-[12px] text-left">
        <span className="text-[14px]">Share to</span>
        <span className="flex min-w-0 items-center gap-[6px] text-[14px] font-bold"><span className="truncate">{board.name}</span><ChevronDown className="h-4 w-4 flex-none transition-transform" aria-hidden style={{ transform: open ? "rotate(180deg)" : "none" }} /></span>
      </button>
      {open && (
        <ul role="listbox" aria-label="Community" className="dm-scroll max-h-[180px] overflow-y-auto border-t py-[4px]" style={{ borderColor: "var(--glass-border)" }}>
          {COMMUNITIES.map((c) => <li key={c.id}><button type="button" role="option" aria-selected={c.id === boardId} onClick={() => { setBoardId(c.id); setOpen(false); }} className="dm-quiet flex w-full cursor-pointer items-center justify-between px-[18px] py-[9px] text-left text-[14px]" style={{ fontWeight: c.id === boardId ? 700 : 500 }}>{c.name}{c.id === boardId && <span aria-hidden style={{ color: BLUE }}>✓</span>}</button></li>)}
        </ul>
      )}
      <p className="px-[18px] pb-[12px] text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>
        {ready ? `Shows in ${board.name} and in students' Feeds.` : !title.trim() ? "Add a title to share." : `${Math.max(0, 40 - body.trim().length)} more characters to share.`}
      </p>
    </div>
  );
}

function Chip({ on, onClick, children, label }: { on: boolean; onClick: () => void; children: React.ReactNode; label?: string }) {
  return <button type="button" aria-pressed={on} aria-label={label} onClick={onClick} className="dm-quiet flex h-[34px] flex-none cursor-pointer items-center justify-center rounded-full border px-[12px] text-[12.5px] font-bold" style={chipStyle(on)}>{children}</button>;
}
/** One horizontal row of choices, Instagram's filter strip. */
function Strip({ label, children }: { label: string; children: React.ReactNode }) {
  return <div role="group" aria-label={label} className="-mx-[16px] flex gap-[8px] overflow-x-auto px-[16px] pb-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{children}</div>;
}

// The overlay strips: one or two horizontal rows over the bottom of the
// preview, white on a dark fade, like Instagram's story tools.
const chipStyle = (on: boolean): React.CSSProperties => ({
  borderColor: on ? "#ffffff" : "rgba(255,255,255,0.28)",
  background: on ? "rgba(255,255,255,0.22)" : "rgba(10,10,18,0.45)",
  color: "#ffffff",
});

function BackgroundStrips({ g, color, onPick }: { g: InsightGraphic; color: string; onPick: (t: Template) => void }) {
  const current = templateById(g.bg).group;
  const [group, setGroup] = useState<Template["group"]>(GROUPS.includes(current) ? current : "Photos");
  return (
    <>
      <Strip label="Background type">{GROUPS.map((gr) => <Chip key={gr} on={group === gr} onClick={() => setGroup(gr)}>{gr}</Chip>)}</Strip>
      <Strip label="Backgrounds">
        {TEMPLATES.filter((t) => t.group === group).map((t) => {
          const on = g.bg === t.id;
          return (
            <IconTip key={t.id} label={t.label}>
              <button type="button" aria-pressed={on} aria-label={t.label} onClick={() => onPick(t)} className="dm-tap relative h-[64px] w-[52px] flex-none cursor-pointer overflow-hidden rounded-[10px]" style={{ background: "#0e0c20", boxShadow: on ? "0 0 0 2px #fff" : "inset 0 0 0 1px rgba(255,255,255,0.18)" }}>
                <GraphicGround t={t} color={color} sizes="52px" />
              </button>
            </IconTip>
          );
        })}
      </Strip>
    </>
  );
}

const COLORS = ["#ffffff", "#1b1824", "#ffd23f", "#ff8a3d", "#ff5c8a", "#a78bfa", "#60a5fa", "#4ade80"];

/** Text, the way Instagram and TikTok keep it (4 Oct 2026, Chandu: "reduce
 *  the number of things at once for text... research the best and simplest
 *  UI"): one row of fonts, each name in its own face, and four small icons
 *  above it. Three of them cycle on each tap (alignment, position, the box
 *  behind the words), so they never open a menu; the fourth swaps the font
 *  row for colours. Auto is each cycle's first state. CAPS left the UI. */
function TextStrips({ g, onChange }: { g: InsightGraphic; onChange: (patch: Partial<InsightGraphic>) => void }) {
  const [colors, setColors] = useState(false);
  const placed = resolvePlacement(g);
  const surface = g.surface ?? (templateById(g.bg).photo && templateById(g.bg).group !== "Photos" ? "soft" : "none");
  const alignNext = { auto: "center", center: "right", right: "auto", left: "center" } as const;
  const posNext = { auto: "top", top: "middle", middle: "bottom", bottom: "auto" } as const;
  const boxNext = { none: "soft", soft: "solid", solid: "none" } as const;
  const alignNow = g.align ?? "auto";
  const posNow = g.valign ?? "auto";
  const AlignIcon = placed.align === "center" ? AlignCenter : placed.align === "right" ? AlignRight : AlignLeft;
  const PosIcon = placed.valign === "top" ? AlignVerticalJustifyStart : placed.valign === "bottom" ? AlignVerticalJustifyEnd : AlignVerticalJustifyCenter;
  const word = { auto: "Auto", left: "Left", center: "Centre", right: "Right", top: "Top", middle: "Middle", bottom: "Bottom" } as const;
  const tool = (label: string, onClick: () => void, children: React.ReactNode, on = false, badge?: string) => (
    <IconTip key={label} label={label}>
      <button type="button" aria-label={label} aria-pressed={on} onClick={onClick} className="dm-quiet relative flex size-[38px] cursor-pointer items-center justify-center rounded-full" style={{ background: on ? "rgba(255,255,255,0.24)" : "rgba(10,10,18,0.5)", color: "#fff" }}>
        {children}
        {badge && <span aria-hidden className="absolute -right-[2px] -bottom-[2px] rounded-full px-[4px] text-[9px] leading-[13px] font-extrabold" style={{ background: "#fff", color: "#1b1824" }}>{badge}</span>}
      </button>
    </IconTip>
  );
  return (
    <>
      <span className="flex justify-center gap-[12px]">
        {tool(`Alignment: ${word[alignNow]}`, () => { const n = alignNext[alignNow]; onChange({ align: n === "auto" ? undefined : n }); }, <AlignIcon className="h-[18px] w-[18px]" aria-hidden />, false, alignNow === "auto" ? "A" : undefined)}
        {tool(`Position: ${word[posNow]}`, () => { const n = posNext[posNow]; onChange({ valign: n === "auto" ? undefined : n }); }, <PosIcon className="h-[18px] w-[18px]" aria-hidden />, false, posNow === "auto" ? "A" : undefined)}
        {tool(`Text box: ${surface === "none" ? "none" : surface === "soft" ? "highlight" : "card"}`, () => onChange({ surface: boxNext[surface] }), <span className="flex size-[20px] items-center justify-center rounded-[5px] text-[12px] font-extrabold" style={surface === "none" ? { border: "1.5px solid #fff" } : surface === "soft" ? { background: "rgba(255,255,255,0.45)" } : { background: "#fff", color: "#1b1824" }}>A</span>, surface !== "none")}
        {tool(colors ? "Fonts" : "Colour", () => setColors((c) => !c), <span className="size-[20px] rounded-full" style={{ background: "conic-gradient(#ff5c8a, #ffd23f, #4ade80, #60a5fa, #a78bfa, #ff5c8a)", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.8)" }} />, colors)}
      </span>
      {colors ? (
        <Strip label="Text colour">
          <Chip on={!g.color} onClick={() => onChange({ color: undefined })}>Auto</Chip>
          {COLORS.map((c) => <button key={c} type="button" aria-pressed={g.color === c} aria-label={`Text colour ${c}`} onClick={() => onChange({ color: c })} className="dm-quiet size-[32px] flex-none cursor-pointer self-center rounded-full" style={{ background: c, boxShadow: g.color === c ? "0 0 0 2px rgba(10,10,18,0.9), 0 0 0 4px #fff" : "inset 0 0 0 1.5px rgba(255,255,255,0.5)" }} />)}
        </Strip>
      ) : (
        <Strip label="Font">
          {FONTS.map((ft) => <button key={ft.id} type="button" aria-pressed={g.font === ft.id} onClick={() => onChange({ font: ft.id })} className="dm-quiet flex h-[36px] flex-none cursor-pointer items-center rounded-[10px] border px-[14px] text-[15px] leading-none whitespace-nowrap" style={{ ...chipStyle(g.font === ft.id), ...ft.style }}>{ft.label}</button>)}
        </Strip>
      )}
    </>
  );
}
