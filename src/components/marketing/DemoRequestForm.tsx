"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { MarketingButton } from "./Button";

// Two steps (direct instruction, 11 Sept 2026): three priority fields, then
// "Request sent." with a short survey for the rest. Both steps post to
// /api/demo-request, which receives and sends; the visitor never opens a
// mail app. Field and option labels are the reference site's.
export const DEMO_REQUEST_TO = "product@dreamopportunity.org";

const ORG_TYPES = ["School", "School District", "Nonprofit", "Educational Organization / Institution"] as const;
const ROLES = ["Counselor", "Teacher", "Principal", "Program director", "Other"] as const;
const STUDENT_BANDS = ["Under 500", "500 to 2,000", "2,000 to 10,000", "More than 10,000"] as const;

const FIELD =
  "w-full rounded-[10px] border px-3.5 py-[11px] text-[15px] leading-snug outline-none transition-[box-shadow,border-color] duration-150 placeholder:[color:var(--muted-foreground)] placeholder:opacity-60 focus:[border-color:var(--primary)] focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]";
const FIELD_STYLE = { background: "#ffffff", borderColor: "rgba(5,7,15,0.16)", color: "var(--foreground)" } as const;

function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>
      {children}
    </label>
  );
}

function Choices({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? "" : o)}
              className="cursor-pointer rounded-[10px] border px-3.5 py-2 text-[14px] font-semibold transition-colors"
              style={on ? { background: "var(--primary)", borderColor: "var(--primary)", color: "#fff" } : { background: "#fff", borderColor: "rgba(5,7,15,0.16)", color: "var(--foreground)" }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

async function post(payload: Record<string, string>) {
  try {
    const res = await fetch("/api/demo-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return res.ok;
  } catch {
    return false;
  }
}

export function DemoRequestForm() {
  const [id] = useState(() => Math.random().toString(36).slice(2, 10));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("");
  const [orgType, setOrgType] = useState("");
  const [students, setStudents] = useState("");
  const [step, setStep] = useState<"request" | "survey" | "done">("request");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const ok = await post({ id, step: "request", name, email, organization, page: typeof window !== "undefined" ? window.location.href : "" });
    setBusy(false);
    if (!ok) {
      setError("That did not go through. Please try again.");
      return;
    }
    setStep("survey");
  }

  async function sendSurvey(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    await post({ id, step: "survey", organization, role, orgType, students });
    setBusy(false);
    setStep("done");
  }

  if (step === "request") {
    return (
      <form onSubmit={sendRequest} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="demo-name">Your name</Label>
          <input id="demo-name" name="name" required autoComplete="name" placeholder="Jane Doe" className={FIELD} style={FIELD_STYLE} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="demo-email">Work email</Label>
          <input id="demo-email" name="email" type="email" required autoComplete="email" placeholder="jane@school.edu" className={FIELD} style={FIELD_STYLE} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="demo-org">Organization name</Label>
          <input id="demo-org" name="organization" required autoComplete="organization" placeholder="Westfield High School" className={FIELD} style={FIELD_STYLE} value={organization} onChange={(e) => setOrganization(e.target.value)} />
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <MarketingButton variant="solid" size="lg" type="submit" className="w-full" disabled={busy}>
            {busy ? "Sending" : "Request a demo"}
          </MarketingButton>
          {error && <p role="alert" className="text-[13px] font-semibold" style={{ color: "#c2410c" }}>{error}</p>}
        </div>
      </form>
    );
  }

  const sent = (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}>
        <Check className="h-5 w-5" strokeWidth={2.75} aria-hidden />
      </span>
      <div>
        <p className="text-[20px] leading-tight font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>Request sent.</p>
        <p className="mt-1 text-[14.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>We will be in touch at {email} within one business day.</p>
      </div>
    </div>
  );

  if (step === "survey") {
    return (
      <form onSubmit={sendSurvey} className="flex flex-col gap-6" aria-live="polite">
        {sent}
        <p className="text-[15px] leading-relaxed" style={{ color: "var(--foreground)" }}>Three quick answers help us tailor your demo.</p>
        <Choices label="Your role" options={ROLES} value={role} onChange={setRole} />
        <Choices label="Organization type" options={ORG_TYPES} value={orgType} onChange={setOrgType} />
        <Choices label="Number of students served" options={STUDENT_BANDS} value={students} onChange={setStudents} />
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <MarketingButton variant="solid" size="md" type="submit" disabled={busy}>
            {busy ? "Sending" : "Send"}
          </MarketingButton>
          <button type="button" onClick={() => setStep("done")} className="cursor-pointer text-[14px] font-bold" style={{ color: "var(--muted-foreground)" }}>
            Skip
          </button>
        </div>
      </form>
    );
  }

  return (
    <div role="status" className="flex flex-col gap-4">
      {sent}
      <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>Thanks, {name.trim().split(" ")[0] || "there"}. Your request is with the Dreamari team.</p>
    </div>
  );
}
