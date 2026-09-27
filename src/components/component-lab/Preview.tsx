"use client";

// DEMO-ONLY: the Component Lab's full-screen preview. Opens one Specimen or
// one state cell alone in a real device-sized frame. It is an iframe of
// /component-lab?solo=<id> on purpose (feedback, 27 Sept 2026: "there's no
// way to see them in proper desktop, mobile, tablet sizes like a full
// screen preview"): only a real viewport makes the app's sm/lg breakpoints,
// fixed layers and 100vh behave as they do on that device. A narrow div on
// a desktop window would still get desktop styles.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import { IconTip } from "@/components/app/IconTip";
import { useGlobalTheme } from "@/components/app/theme";

const DEVICES = [
  { key: "mobile", label: "Mobile", w: 375, h: 812 },
  { key: "tablet", label: "Tablet", w: 768, h: 1024 },
  { key: "laptop", label: "Laptop", w: 1366, h: 768 },
  { key: "desktop", label: "Desktop", w: 1440, h: 900 },
] as const;
type DeviceKey = (typeof DEVICES)[number]["key"];

export function PreviewModal({ target, onClose }: { target: { id: string; title: string } | null; onClose: () => void }) {
  const { theme } = useGlobalTheme();
  const [device, setDevice] = useState<DeviceKey>("mobile");
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const open = !!target;

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setStage({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!target) return null;
  const d = DEVICES.find((x) => x.key === device)!;
  const scale = stage.w && stage.h ? Math.min(1, stage.w / d.w, stage.h / d.h) : 1;
  const src = `/component-lab?solo=${encodeURIComponent(target.id)}&theme=${theme}`;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`Preview: ${target.title}`} className="marketing-v2 themeable fixed inset-0 z-[90] flex flex-col" style={{ background: "color-mix(in srgb, var(--background) 96%, transparent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[8px] border-b px-4 py-[10px] sm:px-6" style={{ borderColor: "var(--border)" }}>
        <p className="min-w-0 flex-1 truncate text-[14px] font-bold capitalize">{target.title}</p>
        <div role="group" aria-label="Screen size" className="flex rounded-full border p-[3px]" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-1)" }}>
          {DEVICES.map((x) => (
            <button key={x.key} type="button" aria-pressed={device === x.key} onClick={() => setDevice(x.key)} className="cursor-pointer rounded-full px-[12px] py-[5px] text-[12.5px] font-semibold transition-colors" style={device === x.key ? { background: "var(--primary)", color: "#fff" } : { color: "var(--muted-foreground)" }}>
              {x.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>
          {d.w} x {d.h}
          {scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
        </span>
        <div className="flex items-center gap-2">
          <IconTip label="Open in a new tab">
            <a href={src} target="_blank" rel="noreferrer" aria-label="Open in a new tab" className="dm-quiet flex size-9 items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
              <ExternalLink className="h-[15px] w-[15px]" aria-hidden />
            </a>
          </IconTip>
          <IconTip label="Close preview">
            <button type="button" aria-label="Close preview" onClick={onClose} className="dm-quiet flex size-9 cursor-pointer items-center justify-center rounded-full border" style={{ borderColor: "var(--glass-border)", background: "var(--glass-surface-2)" }}>
              <X className="h-[16px] w-[16px]" aria-hidden />
            </button>
          </IconTip>
        </div>
      </div>
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden p-4 sm:p-6">
        {/* The frame keeps the device's true size; scaling only fits it on
            screen, so breakpoints still see 375 / 768 / 1366 / 1440. */}
        <div className="absolute top-1/2 left-1/2 overflow-hidden rounded-[var(--radius-xl)] shadow-2xl" style={{ width: d.w, height: d.h, transform: `translate(-50%, -50%) scale(${scale})`, outline: "1px solid var(--glass-border)", background: "var(--background)" }}>
          <iframe key={`${target.id}-${theme}`} src={src} title={`Preview: ${target.title}`} className="block h-full w-full border-0" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
