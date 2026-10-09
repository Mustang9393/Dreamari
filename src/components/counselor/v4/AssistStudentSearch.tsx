"use client";

// WHY (10 Oct 2026, Chandu on Prepare > Assist: "the assist one shouldnt
// have a drop down for students, rather a search bar"). A caseload is
// hundreds of names; a dropdown makes the counselor scroll through all of
// them. Type a name or a grade ("12", "grade 11"); on focus, before typing,
// the students the counselor opened last. Arrow keys move, Enter picks,
// Escape closes. The list is a plain absolutely positioned panel under the
// box (no getBoundingClientRect math to clamp), capped to half the screen
// and scrolled with dm-scroll.

import { useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { IconTip } from "@/components/app/IconTip";
import { StudentFace } from "../v5/StudentFace";

function matches(s: CounselorStudent, q: string): boolean {
  const words = q.toLowerCase().replace(/\bgrade\b|\bgr\b/g, " ").split(/\s+/).filter(Boolean);
  return words.every((w) => (/^\d+$/.test(w) ? String(s.grade) === w : s.name.toLowerCase().includes(w) || s.tag.toLowerCase().includes(w)));
}

export function AssistStudentSearch({ students, recent, onPick, size = "md" }: { students: CounselorStudent[]; /** shown on focus, before typing */ recent: CounselorStudent[]; onPick: (s: CounselorStudent) => void; /** "lg" on phones (16px text, so iOS does not zoom) */ size?: "md" | "lg" }) {
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const typed = q.trim();
  const results = useMemo(() => (typed ? students.filter((s) => matches(s, typed)).slice(0, 8) : recent.slice(0, 6)), [typed, students, recent]);
  const pick = (s: CounselorStudent) => { onPick(s); setQ(""); setOpen(false); input.current?.blur(); };
  const showList = open && (results.length > 0 || !!typed);

  return (
    <div ref={box} className={`as-search is-${size}`} onBlur={(e) => { if (!box.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <label className="as-search-box">
        <Search className="h-4 w-4 flex-none" aria-hidden style={{ color: "var(--muted-foreground)" }} />
        <span className="sr-only">Find a student</span>
        <input
          ref={input}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
          value={q}
          placeholder="Find a student by name or grade"
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => { setOpen(true); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && open && results[active]) { e.preventDefault(); pick(results[active]); }
            else if (e.key === "Escape") { e.preventDefault(); if (open) setOpen(false); else setQ(""); }
          }}
        />
        {q && (
          <IconTip label="Clear">
            <button type="button" aria-label="Clear" onClick={() => { setQ(""); input.current?.focus(); }} className="as-search-clear dm-quiet"><X className="h-[14px] w-[14px]" aria-hidden /></button>
          </IconTip>
        )}
      </label>
      {showList && (
        <div className="as-search-panel">
          {!typed && <span className="as-search-label" aria-hidden>Recent</span>}
          <ul id={listId} role="listbox" aria-label={typed ? "Students" : "Recent students"} className="as-search-list dm-scroll">
            {results.map((s, i) => (
              <li key={s.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setActive(i)} onClick={() => pick(s)} className="as-search-row" data-on={i === active ? "true" : undefined}>
                  <StudentFace s={s} size={30} />
                  <span className="flex min-w-0 flex-col">
                    <span className="as-search-name">{s.name}</span>
                    <span className="as-search-meta">Grade {s.grade} · {s.status}</span>
                  </span>
                </button>
              </li>
            ))}
            {typed && !results.length && <li className="as-search-none">No student matches “{typed}”.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
