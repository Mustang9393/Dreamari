"use client";

import { useState } from "react";

type Role = "student" | "enterprise";

const OPTIONS: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "enterprise", label: "Enterprise" },
];

export function RoleToggle() {
  const [role, setRole] = useState<Role>("student");

  return (
    <div
      role="tablist"
      aria-label="View Dreamari as"
      className="inline-flex rounded-full border border-brand-600 bg-brand-100 p-0.5"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === role;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => setRole(option.value)}
            className={`min-h-7 rounded-full px-3 py-0.5 text-[11px] font-bold transition-colors duration-150 sm:px-3.5 sm:py-1 sm:text-xs ${
              isActive
                ? "bg-gradient-to-r from-brand-500 to-accent-navy text-white"
                : "text-accent-deep"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
