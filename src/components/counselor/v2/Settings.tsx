"use client";

// DEMO-ONLY v2 fork of ../Settings.tsx (24 Sept 2026). v1 stays untouched so the
// two builds can be compared live via the bottom-center version chip
// (../version.tsx). Changes from the 24 Sept audit land here.

import { useState } from "react";
import Link from "next/link";
import { HoverBeam } from "@/components/app/HoverBeam";
import { Listbox } from "@/components/app/Listbox";
import { readCounselorAccount, writeCounselorAccount, COUNSELOR_ROLES, type CounselorRole } from "@/lib/counselorAccount";
import { useReviewedRoster } from "@/lib/counselorReviews";

import { GLASS_CARD as TINTED_CARD } from "../surfaces";

const PERMISSIONS: { role: CounselorRole; items: string[] }[] = [
  { role: "School Counselor", items: ["View and manage assigned student caseload", "Review and approve student submissions", "Send announcements to assigned students", "Generate reports for assigned students", "Access student engagement data"] },
  { role: "Lead Counselor", items: ["All School Counselor permissions", "View all students at assigned school", "Manage counselor assignments", "Generate school-wide reports"] },
  { role: "School Administrator", items: ["All Lead Counselor permissions", "Manage school settings and configurations", "Access administrative reports"] },
  { role: "District Administrator", items: ["All School Administrator permissions", "View all schools in the district", "Generate district-wide reports", "Manage district settings"] },
];

const NOTIFICATIONS = [
  { id: "submissions", label: "Student Submissions", desc: "Notify when students submit work for review" },
  { id: "overdue", label: "Overdue Milestones", desc: "Notify when students have overdue items" },
  { id: "questions", label: "Student Questions", desc: "Notify when students ask questions" },
  { id: "low-activity", label: "Low Activity Alerts", desc: "Notify when students haven't logged in for 7+ days" },
  { id: "weekly", label: "Weekly Summary", desc: "Receive weekly summary of student progress" },
];

function fieldStyle(): React.CSSProperties {
  return { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" };
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="dm-quiet relative flex h-[24px] w-[42px] flex-none cursor-pointer items-center rounded-full border transition-colors"
      style={{ background: on ? "var(--primary)" : "var(--glass-surface-1)", borderColor: on ? "var(--primary)" : "var(--glass-border)" }}
    >
      <span aria-hidden className="absolute size-[18px] rounded-full bg-white transition-[left]" style={{ left: on ? 21 : 3, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
    </button>
  );
}

export function Settings() {
  const [account, setAccount] = useState(() => readCounselorAccount());
  const [draft, setDraft] = useState(account);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(account);

  const [notifications, setNotifications] = useState<Record<string, boolean>>({ submissions: true, overdue: true, questions: true, "low-activity": true, weekly: false });

  const roster = useReviewedRoster();
  const avgCompletion = roster.length ? Math.round(roster.reduce((sum, s) => sum + s.roadmapPct, 0) / roster.length) : 0;
  const pendingReviews = roster.filter((s) => Object.values(s.milestones).includes("Pending Review")).length;

  const save = () => {
    writeCounselorAccount(draft);
    setAccount(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Profile Information</h2>
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Full Name</span>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle()} />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Email Address</span>
              <input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle()} />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>School</span>
              <input value={draft.school} onChange={(e) => setDraft({ ...draft, school: e.target.value })} className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle()} />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Role</span>
              <Listbox ariaLabel="Role" value={draft.role} onChange={(v) => setDraft({ ...draft, role: v as CounselorRole })} options={COUNSELOR_ROLES.map((r) => ({ value: r, label: r }))} className="flex h-10 w-full cursor-pointer items-center justify-between gap-[8px] rounded-[var(--radius-sm)] border px-[10px] text-left text-[13px] font-semibold" style={fieldStyle()} />
            </label>
          </div>
          <div className="flex items-center justify-end gap-[10px]">
            {saved && <span className="text-[12.5px] font-semibold" style={{ color: "#33C78C" }}>Saved.</span>}
            <button type="button" onClick={() => setDraft(account)} disabled={!dirty} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Cancel</button>
            <button type="button" onClick={save} disabled={!dirty} className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50">Save Changes</button>
          </div>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          {/* Only the chosen role's permissions: the reference listed all
             four roles' lists at once, three of which are not the reader's. */}
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>What {draft.role || "this role"} can do</h2>
          <ul className="flex flex-col gap-[6px]">
            {(PERMISSIONS.find((p) => p.role === draft.role)?.items ?? []).map((item) => (
              <li key={item} className="flex items-start gap-[8px] text-[13px] leading-[18px]" style={{ color: "var(--foreground)" }}>
                <span aria-hidden className="mt-[7px] size-[5px] flex-none rounded-full" style={{ background: "var(--primary)" }} />{item}
              </li>
            ))}
          </ul>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Notification Preferences</h2>
          <div className="flex flex-col gap-[2px]">
            {NOTIFICATIONS.map((n) => (
              <div key={n.id} className="flex items-center justify-between gap-[var(--space-4)] border-b py-[12px] last:border-b-0" style={{ borderColor: "var(--glass-border)" }}>
                <span className="flex flex-col gap-[2px]">
                  <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{n.label}</span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{n.desc}</span>
                </span>
                <Toggle on={notifications[n.id]} onChange={(v) => setNotifications((s) => ({ ...s, [n.id]: v }))} />
              </div>
            ))}
          </div>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>{draft.role === "School Counselor" || draft.role === "" ? "Caseload" : draft.role === "District Administrator" ? "District" : "School"}</h2>
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
            <div className="flex flex-col items-center gap-[2px] text-center">
              <span className="text-[24px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{roster.length}</span>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Students</span>
            </div>
            <div className="flex flex-col items-center gap-[2px] text-center">
              <span className="text-[24px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{avgCompletion}%</span>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Average Completion</span>
            </div>
            <div className="flex flex-col items-center gap-[2px] text-center">
              <span className="text-[24px] leading-[1.1] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{pendingReviews}</span>
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Pending Reviews</span>
            </div>
          </div>
          <Link href="/counselor?view=students" className="dm-quiet flex h-9 w-fit cursor-pointer items-center self-center rounded-[var(--radius-sm)] border px-[16px] text-[13px] font-bold" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>View All Students</Link>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Academic Year Settings</h2>
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-3">
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Current Academic Year</span>
              <input defaultValue="2026-2027" className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle()} />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>School Year Start Date</span>
              <input type="date" defaultValue="2026-08-11" className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle()} />
            </label>
            <label className="flex flex-col gap-[4px]">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>School Year End Date</span>
              <input type="date" defaultValue="2027-06-11" className="h-10 rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle()} />
            </label>
          </div>
        </div>
      </HoverBeam>
    </div>
  );
}
