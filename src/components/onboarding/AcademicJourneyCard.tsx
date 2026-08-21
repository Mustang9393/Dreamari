"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { SubjectChip } from "./SubjectChip";

const GPA_RANGES = [
  "3.5 - 4.0 (A- / A)",
  "3.0 - 3.49 (B / B+)",
  "2.5 - 2.99 (C+ / B-)",
  "Below 2.5",
];

const SUBJECTS = ["Art", "Math", "English", "History", "Technology", "Music", "Sports", "Business"];

export function AcademicJourneyCard() {
  const [gpaRange, setGpaRange] = useState(GPA_RANGES[0]);
  const [selected, setSelected] = useState<string[]>(["Technology", "Business"]);

  function toggleSubject(subject: string) {
    setSelected((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  }

  return (
    <div className="relative flex w-full max-w-4xl flex-col gap-7 rounded-3xl bg-white px-8 py-8 shadow-[0_0_10px_rgba(242,176,30,0.1)]">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold tracking-wide text-amber-600">ACADEMIC PATH</p>
        <p className="text-xl font-bold text-slate-900">Academic journey</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="gpa-range" className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          GPA range
        </label>
        <div className="relative">
          <select
            id="gpa-range"
            value={gpaRange}
            onChange={(event) => setGpaRange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900"
          >
            {GPA_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          <Image
            src="/images/chevron-down.svg"
            alt=""
            width={14}
            height={14}
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
          Subjects that excite you
        </p>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => {
            const index = selected.indexOf(subject);
            return (
              <SubjectChip
                key={subject}
                label={subject}
                selected={index !== -1}
                order={index !== -1 ? index + 1 : null}
                onClick={() => toggleSubject(subject)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-tertiary p-3.5">
        <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">So far</p>
        <p className="text-sm font-semibold text-slate-600">
          High School • 11th Grade
          {selected.length > 0 && <> • {selected.join(", ")}</>}
        </p>
      </div>

      <button
        type="button"
        className="w-full rounded-xl bg-gradient-to-r from-gold-400 to-orange-500 py-3.5 text-sm font-bold text-white"
      >
        <span className="inline-flex items-center justify-center gap-[6px]">Continue<ArrowRight size={15} strokeWidth={2.75} aria-hidden /></span>
      </button>

      <p className="text-center text-xs text-slate-500/70">
        Based on Holland&apos;s RIASEC framework (Johns Hopkins University)
      </p>
    </div>
  );
}
