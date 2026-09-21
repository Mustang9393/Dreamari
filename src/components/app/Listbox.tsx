"use client";

// A bespoke dropdown for anywhere the app needs a single-choice picker.
// Native <select> popups render with the OS's own chrome -- no CSS can
// touch that, on any platform (confirmed, not a browser bug: see "Never
// restyle a native <select>" in docs/CROSS_BROWSER_GUARDRAILS.md). On Mac
// that OS chrome happens to look close enough to the app's own design that
// it went unnoticed; on Windows and Chromebooks it reads as an obviously
// foreign control -- a real design break, not a cross-browser illusion like
// the scrollbar/tooltip bugs elsewhere in that doc. This component is the
// fix: the trigger is the caller's own styled button (so it drops into any
// existing FIELD-style className/style), and the option list is a portalled,
// self-painted panel -- same DOM everywhere, same look on every platform.
//
// Drop-in replacement for `<select value onChange>`: pass `options` instead
// of `<option>` children. Keyboard behavior matches native <select> --
// Up/Down moves the highlight, Enter/Space commits, Escape closes and
// returns focus to the trigger, Home/End jump to the ends.

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";

export type ListboxOption = { value: string; label: ReactNode; disabled?: boolean };

export function Listbox({
  id,
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = "Select…",
  className = "",
  style,
  disabled = false,
  panelClassName = "",
  panelStyle,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ListboxOption[];
  ariaLabel?: string;
  placeholder?: string;
  /** Applied to the trigger button -- pass the same FIELD/input classes the old <select> used. */
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  /** Override the option panel's surface -- defaults to the app's own card/border tokens. */
  panelClassName?: string;
  panelStyle?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, maxHeight: 320, openUp: false });
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const selected = options.find((o) => o.value === value);

  // Bounds, not guesses: every device from a phone in landscape to an
  // ultrawide monitor gets a panel sized to what's actually there, never a
  // hardcoded height/width that happens to fit a typical dev display.
  const MARGIN = 8; // never flush against the viewport edge
  const MIN_WIDTH = 160; // a usable tap target even for a narrow icon-style trigger
  const MIN_HEIGHT = 120; // still scrollable and readable on a short viewport
  const MAX_HEIGHT = 320; // never balloons into a half-screen panel on a tall desktop
  const MAX_WIDTH = 480; // never balloons wider than a field reasonably should be

  // Bounds computed fresh from the trigger's CURRENT rect -- called on open
  // and again on resize/orientation change while open, so a rotated phone
  // or a resized window doesn't leave the panel stranded off in space at
  // dimensions computed for the previous viewport.
  function computePos() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // At least the trigger's own width (matches the field it replaces) and
    // at least MIN_WIDTH for a narrow trigger, but never past the viewport
    // or MAX_WIDTH, whichever is smaller.
    const width = Math.min(Math.max(rect.width, MIN_WIDTH), Math.min(MAX_WIDTH, vw - MARGIN * 2));
    let left = rect.left;
    if (left + width > vw - MARGIN) left = vw - MARGIN - width;
    if (left < MARGIN) left = MARGIN;
    const spaceBelow = vh - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    // Prefers opening down, same as a native <select>; flips up only when
    // there's genuinely more room that way.
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, openUp ? spaceAbove : spaceBelow));
    return { top: openUp ? rect.top - 6 : rect.bottom + 6, left, width, maxHeight, openUp };
  }
  function openMenu() {
    if (disabled) return;
    const next = computePos();
    if (next) setPos(next);
    const startIndex = options.findIndex((o) => o.value === value);
    setActiveIndex(startIndex >= 0 ? startIndex : 0);
    setOpen(true);
  }
  function close() {
    setOpen(false);
  }
  function commit(index: number) {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    close();
    triggerRef.current?.focus();
  }

  // Two-pass positioning, same pattern as IconTip's Tip: `openMenu` places
  // the panel from bounds computed at open time, then this corrects against
  // the panel's own real rendered box -- the estimate above already caps
  // maxHeight/width to available space, so this is a safety net for edge
  // cases (a resize mid-open, a scrollbar appearing) rather than the
  // primary mechanism.
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    let top = pos.top;
    let left = pos.left;
    if (pos.openUp) {
      if (rect.top < MARGIN) top += MARGIN - rect.top;
    } else if (rect.bottom > window.innerHeight - MARGIN) {
      top = Math.max(MARGIN, top - (rect.bottom - (window.innerHeight - MARGIN)));
    }
    if (rect.right > window.innerWidth - MARGIN) left -= rect.right - (window.innerWidth - MARGIN);
    if (left < MARGIN) left = MARGIN;
    if (top !== pos.top || left !== pos.left) setPos((p) => ({ ...p, top, left }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActiveIndex((i) => {
          commit(i);
          return i;
        });
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(options.length - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, options]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, open]);

  // A resized window or a rotated phone changes how much room there is,
  // which side has more of it, and where the trigger even sits -- recompute
  // rather than leave the panel positioned for a viewport that no longer
  // exists. Closing instead (the simpler option) would also work, but
  // Windows/Chromebook users are exactly the ones most likely to have this
  // fire mid-use (a snapped/resized browser window, a tablet rotation).
  useEffect(() => {
    if (!open) return;
    function onResize() {
      const next = computePos();
      if (next) setPos(next);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        className={`flex cursor-pointer items-center justify-between gap-[8px] text-left disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        style={style}
      >
        <span className="min-w-0 flex-1 truncate" style={{ opacity: selected ? 1 : 0.6 }}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className="h-4 w-4 flex-none transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} aria-hidden />
      </button>
      {open && (
        <Portal>
          <button type="button" aria-label="Close" className="fixed inset-0 z-[120] cursor-default" onClick={close} />
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className={`dm-scroll fixed z-[121] overflow-y-auto rounded-[var(--radius-md)] border p-[4px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] ${panelClassName}`}
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: pos.maxHeight,
              transform: pos.openUp ? "translateY(-100%)" : undefined,
              background: "var(--card, var(--paper-raised, var(--background)))",
              borderColor: "var(--glass-border, var(--rule, var(--border)))",
              color: "var(--foreground, var(--ink))",
              ...panelStyle,
            }}
          >
            {options.map((opt, i) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled || undefined}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(i)}
                className="flex min-h-[38px] cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] px-[10px] text-[14px] font-semibold"
                style={{
                  background: i === activeIndex ? "var(--glass-surface-2, var(--paper-sunken, rgba(255,255,255,0.06)))" : "transparent",
                  opacity: opt.disabled ? 0.5 : 1,
                  pointerEvents: opt.disabled ? "none" : "auto",
                }}
              >
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {opt.value === value && <Check className="h-3.5 w-3.5 flex-none" style={{ color: "var(--primary)" }} aria-hidden />}
              </li>
            ))}
          </ul>
        </Portal>
      )}
    </>
  );
}
