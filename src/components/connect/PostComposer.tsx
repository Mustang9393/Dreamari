"use client";

// The volunteer's post composer, as a panel over whatever page they are on
// (2 Oct 2026; Chandu: "Create post should be accessible from everywhere;
// it doesn't have to sit under the header and tab bars, or in the bottom
// surface. So much scrolling. Make it easier to access, compose and post
// without navigating and scrolling."). A side panel on desktop, a sheet
// from the bottom on phones; not blocking: closing keeps the draft. Text or
// graphic is the first choice under the title ("the Add graphic toggle is
// not prominent").

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ImageIcon, PenLine, Type, X } from "lucide-react";
import { BorderBeam } from "border-beam";
import { IconTip } from "@/components/app/IconTip";
import { type InsightGraphic, type Pro } from "./data";
import { GraphicDesigner } from "./FeedBreathers";
import { PrimaryCta } from "./primitives";

const firstSentence = (s: string, max = 140): string => {
  const m = s.match(/^[^.!?]+[.!?]/);
  const first = (m ? m[0] : s).trim();
  return first.length > max ? first.slice(0, max - 1).trimEnd() + "…" : first;
};

export function PostComposer({ pro, open, onClose, prompts, onPublish }: {
  pro: Pro;
  open: boolean;
  onClose: () => void;
  prompts: string[];
  onPublish: (post: { title: string; body: string; graphic?: InsightGraphic }) => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"text" | "graphic">("text");
  const [graphic, setGraphic] = useState<InsightGraphic | null>(null);
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the portal target exists only after mount
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted || !open) return null;
  const ready = title.trim().length > 0 && body.trim().length >= 40;
  const pickMode = (m: "text" | "graphic") => {
    setMode(m);
    if (m === "graphic" && !graphic) setGraphic({ text: firstSentence(body || title), bg: "aurora", font: "display", align: "center", effects: ["orbs", "grain"] });
  };
  const publish = () => {
    if (!ready) return;
    onPublish({ title: title.trim(), body: body.trim(), graphic: mode === "graphic" && graphic && graphic.text.trim() ? graphic : undefined });
    setTitle(""); setBody(""); setGraphic(null); setMode("text");
    onClose();
  };
  const field = "dm-beam-input w-full rounded-[var(--radius-md)] border px-[12px] py-[10px] text-[15px] leading-[22px] outline-none placeholder:text-[color:var(--muted-foreground)]";
  const fieldStyle = { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" } as const;
  return createPortal(
    <div className="marketing-v2 themeable" style={{ background: "transparent" }}>
      <button type="button" aria-label="Close composer, keep draft" onClick={onClose} className="fixed inset-0 z-[94] cursor-default" style={{ background: "rgba(5,6,16,0.35)" }} />
      <section role="dialog" aria-modal="false" aria-label="Create post"
        className="fixed z-[95] flex flex-col overflow-hidden border max-sm:inset-x-0 max-sm:bottom-0 max-sm:h-[92dvh] max-sm:rounded-t-[20px] sm:top-[12px] sm:right-[12px] sm:bottom-[12px] sm:w-[min(620px,calc(100vw-24px))] sm:rounded-[18px] motion-safe:animate-[fade-slide-up_0.22s_ease-out_both]"
        style={{ background: "color-mix(in srgb, var(--background) 94%, #ffffff)", borderColor: "var(--glass-border)", boxShadow: "0 24px 64px -20px rgba(0,0,0,0.8)", color: "var(--foreground)" }}>
        <header className="flex flex-none items-center gap-[10px] border-b px-[16px] py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
          <PenLine className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--accent-subtle)" }} />
          <h2 className="flex-1 text-[16px] leading-[20px] font-extrabold" style={{ fontFamily: "var(--font-display)" }}>Create post</h2>
          <IconTip label="Close (draft is kept)">
            <button type="button" onClick={onClose} aria-label="Close" className="dm-quiet flex size-8 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}><X className="h-4 w-4" aria-hidden /></button>
          </IconTip>
        </header>
        <div className="dm-scroll flex min-h-0 flex-1 flex-col gap-[12px] overflow-y-auto px-[16px] py-[14px]">
          <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}>
            <label className="block">
              <span className="sr-only">Post title</span>
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} placeholder="Title" className={`${field} font-semibold`} style={fieldStyle} />
            </label>
          </BorderBeam>
          {!title && (
            <div className="flex flex-wrap gap-[6px]">
              {prompts.slice(0, 3).map((p) => (
                <button key={p} type="button" onClick={() => setTitle(p)} className="dm-quiet cursor-pointer rounded-[var(--radius-sm)] border px-[10px] py-[5px] text-left text-[12.5px] leading-[17px] font-semibold" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>{p}</button>
              ))}
            </div>
          )}
          {/* the first real choice, as big as the title */}
          <div role="radiogroup" aria-label="Post type" className="grid grid-cols-2 gap-[8px]">
            {([
              { key: "text" as const, label: "Text post", sub: "Your words in the feed", Icon: Type },
              { key: "graphic" as const, label: "Graphic post", sub: "Your best line as a picture", Icon: ImageIcon },
            ]).map((o) => {
              const on = mode === o.key;
              return (
                <button key={o.key} type="button" role="radio" aria-checked={on} onClick={() => pickMode(o.key)} className="dm-tap flex cursor-pointer items-center gap-[10px] rounded-[12px] border px-[12px] py-[10px] text-left" style={{ borderColor: on ? "var(--primary)" : "var(--glass-border)", background: on ? "color-mix(in srgb, var(--primary) 14%, transparent)" : "var(--glass-surface-1)" }}>
                  <span className="flex size-[34px] flex-none items-center justify-center rounded-full" style={{ background: on ? "var(--primary)" : "color-mix(in srgb, var(--foreground) 8%, transparent)", color: on ? "#fff" : "var(--muted-foreground)" }}><o.Icon className="h-4 w-4" aria-hidden /></span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[14px] leading-[18px] font-bold">{o.label}</span>
                    <span className="truncate text-[12px] leading-[16px]" style={{ color: "var(--muted-foreground)" }}>{o.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={3.5} strength={0.85}>
            <label className="block">
              <span className="sr-only">Post body</span>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={mode === "graphic" ? 3 : 6} maxLength={600} placeholder="Three to five sentences. Plain words, one idea each." className={`${field} resize-none`} style={fieldStyle} />
            </label>
          </BorderBeam>
          {mode === "graphic" && graphic && <GraphicDesigner pro={pro} body={body} value={graphic} onChange={(g) => { if (g) setGraphic(g); else pickMode("text"); }} stacked hideSwitch />}
        </div>
        <footer className="flex flex-none items-center gap-[10px] border-t px-[16px] py-[12px]" style={{ borderColor: "var(--glass-border)" }}>
          <span className="flex-1 text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{ready ? "Ready to post" : body.trim().length < 40 ? `A title and ${Math.max(0, 40 - body.trim().length)} more characters` : "Add a title"}</span>
          <PrimaryCta className={`min-h-[40px] px-[var(--space-5)] text-[14px] ${ready ? "" : "pointer-events-none opacity-50"}`} onClick={publish}>Post</PrimaryCta>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
