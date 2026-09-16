"use client";

import { useState } from "react";
import { Check, Eye, X } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";
import { DreamyGuide } from "@/components/build/DreamyGuide";
import { RESUME_TEMPLATES, RESUME_TEMPLATE_GALLERY_DREAMY, SAMPLE_RESUME_DATA, type ResumeTemplateId } from "./data";
import { ResumeDocument } from "./ResumeDocument";
import { selectedRowStyle } from "./ui";

function UseTemplateButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dm-solid flex min-h-[44px] cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] px-[var(--space-5)] text-[14px] font-bold text-white"
      style={{ background: "var(--primary)" }}
    >
      Use This Template
    </button>
  );
}

// Name + swatch only -- the description used to sit here too, but with the
// live preview now large enough to actually judge (direct feedback, 14
// Sept 2026: "the preview should do the talking"), a text description of
// what a template looks like is redundant with a picture of it.
function TemplateRow({ template, active, onFocus }: { template: (typeof RESUME_TEMPLATES)[number]; active: boolean; onFocus: () => void }) {
  return (
    <button
      type="button"
      onClick={onFocus}
      className="dm-tap flex cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] border px-[var(--space-3)] py-[10px] text-left"
      style={selectedRowStyle(active)}
    >
      <span className="size-7 flex-none rounded-full border" style={{ background: template.accent, borderColor: "var(--glass-border)" }} aria-hidden />
      <span className="flex items-center gap-[6px] text-[14px] font-extrabold" style={{ color: "var(--foreground)" }}>
        {active && <Check className="h-3.5 w-3.5 flex-none" style={{ color: "var(--primary)" }} aria-hidden />}
        {template.label}
      </span>
    </button>
  );
}

// Small mini-preview cards were too small to actually judge a layout by
// (direct feedback, 14 Sept 2026). Desktop now shows a real, large preview
// beside the list as you pick; tablet/mobile gets an explicit "Preview"
// button per option that opens the same large view in a modal, since
// there's no room for a permanent side panel there.
export function TemplateGallery({ onSelect }: { onSelect: (id: ResumeTemplateId) => void }) {
  const [focused, setFocused] = useState<ResumeTemplateId>(RESUME_TEMPLATES[0].id);
  const [previewing, setPreviewing] = useState<ResumeTemplateId | null>(null);
  const previewTemplate = RESUME_TEMPLATES.find((t) => t.id === previewing);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      {/* Desktop: a narrow 30% picker beside a large, top-aligned live
         preview at 70% (direct feedback, 14 Sept 2026: "the preview should
         do the talking... keep the column on the left 30% and the preview
         70%... make the preview legible... why is it sitting so low" --
         Dreamy + heading used to sit full-width above this grid, pushing
         the preview down; both now live in the narrow column instead, so
         the preview starts at the very top of the section). */}
      <div className="hidden gap-[var(--space-6)] lg:grid lg:grid-cols-[30%_70%] lg:items-start">
        <div className="flex flex-col gap-[var(--space-4)]">
          <DreamyGuide sprite={RESUME_TEMPLATE_GALLERY_DREAMY.sprite} line={RESUME_TEMPLATE_GALLERY_DREAMY.line} />
          <h2 className="text-[19px] font-extrabold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>Choose a template</h2>
          <div className="flex flex-col gap-[var(--space-2)]">
            {RESUME_TEMPLATES.map((t) => (
              <TemplateRow key={t.id} template={t} active={focused === t.id} onFocus={() => setFocused(t.id)} />
            ))}
          </div>
          <UseTemplateButton onClick={() => onSelect(focused)} />
        </div>
        <div className="w-full">
          <ResumeDocument resume={SAMPLE_RESUME_DATA} templateId={focused} />
        </div>
      </div>

      {/* Tablet/mobile: heading up top, then cards with an explicit Preview
         button -- no room for a permanent side panel, so the big view opens
         as a modal. */}
      <div className="flex flex-col gap-[var(--space-4)] lg:hidden">
        <DreamyGuide sprite={RESUME_TEMPLATE_GALLERY_DREAMY.sprite} line={RESUME_TEMPLATE_GALLERY_DREAMY.line} />
        <h2 className="text-[19px] font-extrabold" style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}>Choose a template</h2>
      </div>
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:hidden">
        {RESUME_TEMPLATES.map((t) => (
          <div key={t.id} className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border p-[var(--space-4)]" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
            <div className="flex items-center gap-[var(--space-3)]">
              <span className="size-8 flex-none rounded-full border" style={{ background: t.accent, borderColor: "var(--glass-border)" }} aria-hidden />
              <span className="text-[14.5px] font-extrabold" style={{ color: "var(--foreground)" }}>{t.label}</span>
            </div>
            <div className="flex items-center gap-[var(--space-3)]">
              <button
                type="button"
                onClick={() => setPreviewing(t.id)}
                className="dm-tap flex min-h-[40px] flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] border text-[13.5px] font-bold"
                style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}
              >
                <Eye className="h-4 w-4" aria-hidden /> Preview
              </button>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className="dm-tap flex min-h-[40px] flex-1 cursor-pointer items-center justify-center gap-[6px] rounded-[var(--radius-md)] text-[13.5px] font-bold text-white"
                style={{ background: "var(--primary)" }}
              >
                Use This
              </button>
            </div>
          </div>
        ))}
      </div>

      {previewTemplate && (
        <Portal>
          <div className="fixed inset-0 z-[150] flex flex-col backdrop-blur-[18px]" style={{ background: "color-mix(in srgb, var(--color-night-background) 62%, transparent)" }} onPointerDown={(e) => { if (e.target === e.currentTarget) setPreviewing(null); }}>
            <div className="flex flex-none items-center justify-between px-5 py-4">
              <span className="text-[13px] font-bold tracking-[0.06em] text-white uppercase">{previewTemplate.label}</span>
              <button type="button" aria-label="Close" onClick={() => setPreviewing(null)} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white">
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 pb-5">
              <div className="mx-auto w-full max-w-[460px]">
                <ResumeDocument resume={SAMPLE_RESUME_DATA} templateId={previewTemplate.id} />
              </div>
            </div>
            <div className="flex flex-none justify-center px-5 pb-6">
              <button
                type="button"
                onClick={() => onSelect(previewTemplate.id)}
                className="dm-solid flex min-h-[48px] w-full max-w-[460px] cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[14.5px] font-bold text-white"
                style={{ background: "var(--primary)" }}
              >
                Use This Template
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
