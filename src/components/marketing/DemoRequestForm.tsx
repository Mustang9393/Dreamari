"use client";

import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import { MarketingButton } from "./Button";

// Demo requests go to Chandu's inbox (direct instruction, 7 Sept 2026). There
// is no backend in this prototype (one client-error endpoint, nothing else),
// so the form composes a mailto: with the fields and hands off to the
// visitor's mail client.
export const DEMO_REQUEST_TO = "chandu.mp.14@gmail.com";

// Field set and option labels are the reference site's (dreamari-educator-website.replit.app).
const ORG_TYPES = ["School", "School District", "Nonprofit", "Educational Organization / Institution"] as const;

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  role: string;
  orgType: string;
  students: string;
};

const EMPTY: Fields = { firstName: "", lastName: "", email: "", organization: "", role: "", orgType: "School", students: "" };

const FIELD =
  "w-full rounded-[10px] border px-3.5 py-[11px] text-[15px] leading-snug outline-none transition-[box-shadow,border-color] duration-150 placeholder:[color:var(--muted-foreground)] placeholder:opacity-60 focus:[border-color:var(--primary)] focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]";
const FIELD_STYLE = { background: "#ffffff", borderColor: "rgba(5,7,15,0.16)", color: "var(--foreground)" } as const;

// Native <select> with the browser arrow replaced by one chevron (the same
// lucide ChevronDown the Disclosure uses), drawn as a background image so the
// control stays a real <select>. Repeat, position and size live in the inline
// style next to the image so the three cannot drift apart.
const SELECT = `${FIELD} appearance-none pr-11`;
const SELECT_STYLE = {
  ...FIELD_STYLE,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a4f6d' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  backgroundSize: "16px 16px",
} as const;

function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13.5px] font-semibold" style={{ color: "var(--foreground)" }}>
      {children}
    </label>
  );
}

export function DemoRequestForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [sent, setSent] = useState(false);

  const set = (key: keyof Fields) => (e: { target: { value: string } }) => setFields((f) => ({ ...f, [key]: e.target.value }));

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const subject = `Dreamari demo request: ${fields.organization}`;
    const body = [
      `Organization: ${fields.organization}`,
      `Organization type: ${fields.orgType}`,
      `Students served: ${fields.students}`,
      `Contact: ${fields.firstName} ${fields.lastName}`,
      `Role: ${fields.role}`,
      `Work email: ${fields.email}`,
      "",
      "Sent from the Dreamari for schools page.",
    ].join("\n");
    window.location.href = `mailto:${DEMO_REQUEST_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4"
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
        >
          <Check className="h-5 w-5" strokeWidth={2.75} aria-hidden />
        </span>
        <div>
          <h3 className="text-[20px] font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
            Thanks, {fields.firstName.trim() || "there"}.
          </h3>
          <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Your mail app should have opened with the request for {fields.organization} addressed to {DEMO_REQUEST_TO}. If it did not,
            send us a note at that address and we will take it from there.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFields(EMPTY);
            setSent(false);
          }}
          className="text-[14px] font-bold transition-colors hover:[color:var(--primary)]"
          style={{ color: "var(--foreground)" }}
        >
          Send another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
      <div>
        <Label htmlFor="demo-first">First name</Label>
        <input id="demo-first" name="firstName" required autoComplete="given-name" placeholder="Jane" className={FIELD} style={FIELD_STYLE} value={fields.firstName} onChange={set("firstName")} />
      </div>
      <div>
        <Label htmlFor="demo-last">Last name</Label>
        <input id="demo-last" name="lastName" required autoComplete="family-name" placeholder="Doe" className={FIELD} style={FIELD_STYLE} value={fields.lastName} onChange={set("lastName")} />
      </div>
      <div>
        <Label htmlFor="demo-email">Work email</Label>
        <input id="demo-email" name="email" type="email" required autoComplete="email" placeholder="jane@school.edu" className={FIELD} style={FIELD_STYLE} value={fields.email} onChange={set("email")} />
      </div>
      <div>
        <Label htmlFor="demo-org">Organization name</Label>
        <input id="demo-org" name="organization" required autoComplete="organization" placeholder="Westfield High School" className={FIELD} style={FIELD_STYLE} value={fields.organization} onChange={set("organization")} />
      </div>
      <div>
        <Label htmlFor="demo-role">Your role</Label>
        <input id="demo-role" name="role" required autoComplete="organization-title" placeholder="Counselor, principal, program director" className={FIELD} style={FIELD_STYLE} value={fields.role} onChange={set("role")} />
      </div>
      <div>
        <Label htmlFor="demo-type">Organization type</Label>
        <select id="demo-type" name="orgType" required className={SELECT} style={SELECT_STYLE} value={fields.orgType} onChange={set("orgType")}>
          {ORG_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="demo-students">Number of students served</Label>
        <input id="demo-students" name="students" inputMode="numeric" placeholder="e.g. 500" className={FIELD} style={FIELD_STYLE} value={fields.students} onChange={set("students")} />
      </div>
      <div className="flex flex-col gap-3 pt-2 sm:col-span-2">
        <MarketingButton variant="solid" size="lg" type="submit" className="w-full">
          Request a demo
        </MarketingButton>
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Opens your mail app with the request addressed to {DEMO_REQUEST_TO}.
        </p>
      </div>
    </form>
  );
}
