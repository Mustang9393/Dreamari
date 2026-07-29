"use client";

import { useState } from "react";

type Role = "student" | "teacher";

const OPTIONS: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
];

export function RoleToggle() {
  const [role, setRole] = useState<Role>("student");

  return (
    <div
      role="tablist"
      aria-label="View Dreamari as"
      className="inline-flex rounded-full border border-brand-600 bg-brand-100 p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === role;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => setRole(option.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-150 sm:px-5 sm:py-2 sm:text-sm ${
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
