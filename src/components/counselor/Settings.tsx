"use client";

import { useState } from "react";
import { HoverBeam } from "@/components/app/HoverBeam";
import { readCounselorAccount, writeCounselorAccount, COUNSELOR_ROLES, type CounselorRole } from "@/lib/counselorAccount";

import { GLASS_CARD as TINTED_CARD } from "./surfaces";

const PERMISSIONS: { role: CounselorRole; items: string[] }[] = [
  { role: "School Counselor", items: ["View and manage assigned student caseload", "Review and approve student submissions", "Send announcements to assigned students", "Generate reports for assigned students", "Access student engagement data"] },
  { role: "Lead Counselor", items: ["All School Counselor permissions", "View all students at assigned school", "Manage counselor assignments", "Generate school-wide reports"] },
  { role: "School Administrator", items: ["All Lead Counselor permissions", "View all schools in the district", "Manage counselor and lead counselor accounts", "Generate district-wide reports"] },
];

function fieldStyle(): React.CSSProperties {
  return { background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" };
}

export function Settings() {
  const [account, setAccount] = useState(() => readCounselorAccount());
  const [draft, setDraft] = useState(account);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(account);

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
              <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as CounselorRole })} className="h-10 cursor-pointer rounded-[var(--radius-sm)] border px-[10px] text-[13px] outline-none" style={fieldStyle()}>
                {COUNSELOR_ROLES.map((r) => <option key={r} value={r} style={{ color: "#000" }}>{r}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-end gap-[10px]">
            {saved && <span className="text-[12.5px] font-semibold" style={{ color: "#33C78C" }}>Saved.</span>}
            <button type="button" onClick={() => setDraft(account)} disabled={!dirty} className="dm-quiet flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] border px-[14px] text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50" style={{ borderColor: "var(--glass-border)", color: "var(--foreground)" }}>Cancel</button>
            <button type="button" onClick={save} disabled={!dirty} className="dm-solid flex h-9 cursor-pointer items-center rounded-[var(--radius-sm)] px-[16px] text-[13px] font-bold disabled:cursor-not-allowed disabled:opacity-50">Save Changes</button>
          </div>
        </div>
      </HoverBeam>

      <HoverBeam strength={0.6} className="h-full">
        <div className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-lg)] border p-[var(--space-5)]" style={TINTED_CARD}>
          <h2 className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>Role Permissions</h2>
          <div className="grid grid-cols-1 gap-[var(--space-4)] lg:grid-cols-3">
            {PERMISSIONS.map((p) => (
              <div key={p.role} className="flex flex-col gap-[8px] rounded-[var(--radius-md)] border p-[var(--space-4)]" style={{ borderColor: p.role === draft.role ? "var(--primary)" : "var(--glass-border)", background: "var(--glass-surface-1)" }}>
                <span className="text-[13.5px] font-bold" style={{ color: "var(--foreground)" }}>{p.role}</span>
                <ul className="flex flex-col gap-[4px]">
                  {p.items.map((item) => (
                    <li key={item} className="flex gap-[6px] text-[12.5px] leading-[17px]" style={{ color: "var(--muted-foreground)" }}>
                      <span aria-hidden style={{ color: "var(--primary)" }}>•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </HoverBeam>
    </div>
  );
}
