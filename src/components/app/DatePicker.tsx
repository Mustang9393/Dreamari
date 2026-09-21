"use client";

// A bespoke date picker, same reasoning as Listbox (see
// docs/CROSS_BROWSER_GUARDRAILS.md): a native `<input type="date">`'s
// calendar popup -- and even its plain closed-state text segments, with
// their own spinner arrows -- render with real OS-native chrome that
// differs far more across Windows/ChromeOS/Mac than a <select> does. This
// is the app's own design everywhere instead, built on the same
// Portal + measured-rect + viewport-clamped pattern as Listbox.
//
// Value/onChange use plain "YYYY-MM-DD" strings, matching what
// `<input type="date">` already produced -- a drop-in replacement with no
// data-model change.

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Portal } from "@/components/profile/CareerReport";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function toISO(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}
function parseISO(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]) - 1;
  const d = Number(match[3]);
  const check = new Date(y, m, d);
  if (check.getFullYear() !== y || check.getMonth() !== m || check.getDate() !== d) return null;
  return { y, m, d };
}
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function formatDisplay(y: number, m: number, d: number) {
  return `${MONTH_NAMES[m].slice(0, 3)} ${d}, ${y}`;
}

export function DatePicker({
  id,
  value,
  onChange,
  ariaLabel,
  placeholder = "Select a date",
  className = "",
  style,
  disabled = false,
}: {
  id?: string;
  /** "YYYY-MM-DD", or "" for no date chosen. */
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const parsed = useMemo(() => parseISO(value), [value]);
  const today = new Date();
  const [viewY, setViewY] = useState(parsed?.y ?? today.getFullYear());
  const [viewM, setViewM] = useState(parsed?.m ?? today.getMonth());
  const [focusDay, setFocusDay] = useState(parsed?.d ?? today.getDate());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gridId = useId();

  const MARGIN = 8;
  const WIDTH = 288;
  const HEIGHT = 336;

  function computePos() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(WIDTH, vw - MARGIN * 2);
    let left = rect.left;
    if (left + width > vw - MARGIN) left = vw - MARGIN - width;
    if (left < MARGIN) left = MARGIN;
    const spaceBelow = vh - rect.bottom - MARGIN;
    const spaceAbove = rect.top - MARGIN;
    const openUp = spaceBelow < HEIGHT && spaceAbove > spaceBelow;
    return { top: openUp ? rect.top - 6 : rect.bottom + 6, left, width, openUp };
  }

  function openPicker() {
    if (disabled) return;
    const base = parsed ?? { y: today.getFullYear(), m: today.getMonth(), d: today.getDate() };
    setViewY(base.y);
    setViewM(base.m);
    setFocusDay(base.d);
    const next = computePos();
    if (next) setPos(next);
    setOpen(true);
  }
  function close() {
    setOpen(false);
  }
  function commit(y: number, m: number, d: number) {
    onChange(toISO(y, m, d));
    close();
    triggerRef.current?.focus();
  }
  function shiftMonth(delta: number) {
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) { m = 11; y -= 1; }
    else if (m > 11) { m = 0; y += 1; }
    setViewM(m);
    setViewY(y);
    setFocusDay((d) => Math.min(d, daysInMonth(y, m)));
  }

  // Same two-pass pattern as Listbox/IconTip: place from the trigger's
  // rect, then correct against the panel's own rendered box.
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
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
    function onResize() {
      const next = computePos();
      if (next) setPos(next);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const last = daysInMonth(viewY, viewM);
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (focusDay + 1 > last) shiftMonth(1);
        setFocusDay((d) => (d + 1 > last ? 1 : d + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (focusDay - 1 < 1) { shiftMonth(-1); setFocusDay(daysInMonth(viewM === 0 ? viewY - 1 : viewY, viewM === 0 ? 11 : viewM - 1)); }
        else setFocusDay(focusDay - 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusDay((d) => Math.min(last, d + 7));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusDay((d) => Math.max(1, d - 7));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        commit(viewY, viewM, focusDay);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, viewY, viewM, focusDay]);

  const firstWeekday = new Date(viewY, viewM, 1).getDay();
  const totalDays = daysInMonth(viewY, viewM);
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? close() : openPicker())}
        className={`flex cursor-pointer items-center justify-between gap-[8px] text-left disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        style={style}
      >
        <span className="min-w-0 flex-1 truncate" style={{ opacity: parsed ? 1 : 0.6 }}>
          {parsed ? formatDisplay(parsed.y, parsed.m, parsed.d) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 flex-none" aria-hidden />
      </button>
      {open && (
        <Portal>
          <button type="button" aria-label="Close" className="fixed inset-0 z-[120] cursor-default" onClick={close} />
          <div
            ref={panelRef}
            role="dialog"
            aria-label={ariaLabel ?? "Choose a date"}
            className="fixed z-[121] flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[10px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              transform: pos.openUp ? "translateY(-100%)" : undefined,
              background: "var(--card, var(--paper-raised, var(--background)))",
              borderColor: "var(--glass-border, var(--rule, var(--border)))",
              color: "var(--foreground, var(--ink))",
            }}
          >
            <div className="flex items-center justify-between gap-[8px]">
              <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)]">
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
              <span className="text-[14px] font-bold">{MONTH_NAMES[viewM]} {viewY}</span>
              <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} className="dm-quiet flex size-[30px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)]">
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div id={gridId} role="grid" className="grid grid-cols-7 gap-[2px]">
              {WEEKDAY_LABELS.map((w, i) => (
                <span key={i} className="flex h-[26px] items-center justify-center text-[11px] font-bold opacity-60">{w}</span>
              ))}
              {cells.map((day, i) => {
                if (day === null) return <span key={`blank-${i}`} aria-hidden />;
                const isSelected = !!parsed && parsed.y === viewY && parsed.m === viewM && parsed.d === day;
                const isToday = today.getFullYear() === viewY && today.getMonth() === viewM && today.getDate() === day;
                const isFocused = day === focusDay;
                return (
                  <button
                    key={day}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    tabIndex={isFocused ? 0 : -1}
                    onClick={() => commit(viewY, viewM, day)}
                    onMouseEnter={() => setFocusDay(day)}
                    className="flex h-[32px] cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[13px] font-semibold"
                    style={{
                      background: isSelected ? "var(--primary)" : isFocused ? "var(--glass-surface-2, var(--paper-sunken, rgba(255,255,255,0.08)))" : "transparent",
                      color: isSelected ? "#fff" : "inherit",
                      boxShadow: isToday && !isSelected ? "inset 0 0 0 1px var(--primary)" : undefined,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
