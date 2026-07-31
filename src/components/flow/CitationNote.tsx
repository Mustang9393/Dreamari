"use client";

import { useEffect, useRef, useState } from "react";
import { InfoIcon } from "./icons";

type CitationNoteProps = {
  citation: string;
};

// "Only there if you need it" — a plain, low-contrast dot that reveals its source on
// click (not hover, so it works the same on touch as it does with a mouse), instead of
// the citation sitting as permanent text under every question.
export function CitationNote({ citation }: CitationNoteProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    // self-start + a small top offset: sits pinned to the right of the heading row and
    // top-aligned with its first line, regardless of how long the heading text is or
    // whether it wraps — the icon's position stays the same on every screen.
    <span ref={wrapperRef} className="relative inline-flex shrink-0 self-start">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Show source"
        aria-expanded={open}
        className="flex size-[18px] items-center justify-center rounded-full text-slate-400 opacity-50 transition-opacity hover:opacity-90 dark:text-slate-500"
      >
        <InfoIcon className="size-[14px]" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-full right-0 z-20 mt-2 w-52 rounded-lg bg-slate-900 px-3 py-2 text-[11px] leading-snug font-medium text-white shadow-lg dark:bg-slate-700"
        >
          {citation}
        </span>
      )}
    </span>
  );
}
