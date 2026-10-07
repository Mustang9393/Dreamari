"use client";

// Find any student by typing (Chandu, 7 Oct 2026: "a dropdown for student
// name is too hard to work with, it's going to be a list of hundreds of
// students"). Name or student ID, results as you type, arrow keys and Enter
// work, Escape closes.

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { StudentFace } from "./StudentFace";

export function StudentSearch({ students, hrefFor, onPick, placeholder = "Find a student by name or ID", compact = false, wide = false }: { students: CounselorStudent[]; hrefFor?: (id: string) => string; /** instead of navigating */ onPick?: (s: CounselorStudent) => void; placeholder?: string; compact?: boolean; /** fill the container (forms) */ wide?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return students.filter((s) => s.name.toLowerCase().includes(t) || s.tag.toLowerCase().includes(t)).slice(0, 8);
  }, [q, students]);
  const go = (id: string) => { setOpen(false); setQ(""); const s = students.find((x) => x.id === id); if (onPick && s) onPick(s); else if (hrefFor) router.push(hrefFor(id)); };

  return (
    <div ref={box} className={`relative w-full ${wide ? "" : compact ? "max-w-[320px]" : "max-w-[560px]"}`} onBlur={(e) => { if (!box.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <label className={`flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-lg)] border px-[var(--space-4)] ${compact ? "h-10" : "h-14"}`} style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}>
        <Search className="h-4 w-4 flex-none" style={{ color: "var(--muted-foreground)" }} aria-hidden />
        <span className="sr-only">{placeholder}</span>
        <input
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          value={q}
          placeholder={placeholder}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active].id); }
            else if (e.key === "Escape") setOpen(false);
          }}
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-[color:var(--muted-foreground)] ${compact ? "text-[14px]" : "text-[16px]"}`}
        />
        {q && <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="dm-quiet flex size-7 items-center justify-center rounded-full"><X className="h-4 w-4" aria-hidden /></button>}
      </label>
      {open && q.trim() && (
        <ul id={listId} role="listbox" className="absolute top-[calc(100%+6px)] right-0 left-0 z-30 flex max-h-[360px] flex-col overflow-y-auto rounded-[var(--radius-lg)] border p-[6px] shadow-[0_24px_60px_-28px_rgba(20,30,70,0.5)]" style={{ background: "color-mix(in srgb, var(--background) 94%, var(--foreground))", borderColor: "var(--glass-border)" }}>
          {results.length ? results.map((s, i) => (
            <li key={s.id} role="option" aria-selected={i === active}>
              <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(s.id)} className="flex w-full cursor-pointer items-center gap-[var(--space-3)] rounded-[var(--radius-md)] px-[var(--space-3)] py-[8px] text-left" style={i === active ? { background: "color-mix(in srgb, var(--primary) 12%, transparent)" } : undefined}>
                <StudentFace s={s} size={32} />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold">{s.name}</span>
                  <span className="text-[12.5px] font-medium" style={{ color: "var(--muted-foreground)" }}>Grade {s.grade} · {s.tag}</span>
                </span>
              </button>
            </li>
          )) : <li className="px-[var(--space-3)] py-[10px] text-[14px]" style={{ color: "var(--muted-foreground)" }}>No student matches “{q.trim()}”.</li>}
        </ul>
      )}
    </div>
  );
}
