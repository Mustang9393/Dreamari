"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { BorderBeam } from "border-beam";
import { writeCounselorAccount, readCounselorAccount, COUNSELOR_ROLES, type CounselorRole } from "@/lib/counselorAccount";
import { DEMO_SCHOOL } from "@/lib/counselorRoster";

// The counselor dashboard's own sign-up/sign-in -- a separate product from
// the student app, so a separate flow (not a variant of
// src/components/signup/SignupExperience.tsx). No backend here either (see
// counselorAccount.ts's own header comment): the password field below is
// cosmetic, exactly like the student signup's own password field -- local
// UI state, never checked against anything, never transmitted anywhere.

const CARD = { background: "var(--card)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -30px rgba(0,0,0,0.6)" } as const;

function fieldStyle(hasError: boolean): React.CSSProperties {
  return { background: "var(--glass-surface-1)", borderColor: hasError ? "var(--destructive)" : "var(--glass-border)", color: "var(--foreground)" };
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>{label}</span>
      {children}
      {error && <span className="text-[12px] font-semibold" style={{ color: "var(--destructive)" }}>{error}</span>}
    </label>
  );
}

function Shell({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="marketing-v2 themeable flex min-h-dvh w-full items-center justify-center px-5 py-10" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <div className="flex w-full max-w-[420px] flex-col gap-[var(--space-6)]">
        <div className="flex flex-col items-center gap-[10px] text-center">
          <span className="flex size-[44px] items-center justify-center rounded-[var(--radius-md)] text-[19px] font-extrabold" style={{ background: "var(--primary)", color: "#FFFFFF", fontFamily: "var(--font-display)" }}>D</span>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[13px] font-bold tracking-[0.04em] uppercase" style={{ color: "var(--primary)" }}>Dreamari Command Center</span>
            <h1 className="text-[24px] leading-[1.2] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Counselor Dashboard</h1>
          </div>
        </div>
        <BorderBeam size="md" colorVariant="colorful" theme="dark" duration={4} strength={0.7} active className="rounded-[var(--radius-lg)]">
          <div className="relative flex flex-col gap-[var(--space-5)] rounded-[var(--radius-lg)] border p-[var(--space-6)]" style={CARD}>
            {children}
          </div>
        </BorderBeam>
        <p className="text-center text-[13px]" style={{ color: "var(--muted-foreground)" }}>{footer}</p>
      </div>
    </div>
  );
}

export function CounselorSignup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState(DEMO_SCHOOL);
  const [role, setRole] = useState<CounselorRole | "">("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (school.trim().length < 2) next.school = "Enter your school name.";
    if (!role) next.role = "Choose a role.";
    if (password.length < 8) next.password = "At least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    writeCounselorAccount({ name: name.trim(), email: email.trim(), school: school.trim(), role: role as CounselorRole, isSignedIn: true });
    router.push("/counselor?view=overview");
  };

  return (
    <Shell footer={<>Already have an account? <Link href="/counselor/login" className="dm-link font-bold" style={{ color: "var(--primary)" }}>Sign in</Link></>}>
      <form onSubmit={submit} className="flex flex-col gap-[var(--space-4)]">
        <Field label="Full Name" error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sarah Chen" className="h-11 rounded-[var(--radius-md)] border px-[12px] text-[14px] outline-none" style={fieldStyle(!!errors.name)} />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className="h-11 rounded-[var(--radius-md)] border px-[12px] text-[14px] outline-none" style={fieldStyle(!!errors.email)} />
        </Field>
        <Field label="School" error={errors.school}>
          <input value={school} onChange={(e) => setSchool(e.target.value)} className="h-11 rounded-[var(--radius-md)] border px-[12px] text-[14px] outline-none" style={fieldStyle(!!errors.school)} />
        </Field>
        <Field label="Role" error={errors.role}>
          <select value={role} onChange={(e) => setRole(e.target.value as CounselorRole)} className="h-11 cursor-pointer rounded-[var(--radius-md)] border px-[12px] text-[14px] outline-none" style={fieldStyle(!!errors.role)}>
            <option value="" style={{ color: "#000" }}>Choose a role...</option>
            {COUNSELOR_ROLES.map((r) => (
              <option key={r} value={r} style={{ color: "#000" }}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Password" error={errors.password}>
          <span className="relative flex items-center">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="h-11 w-full rounded-[var(--radius-md)] border px-[12px] pr-10 text-[14px] outline-none" style={fieldStyle(!!errors.password)} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} className="dm-quiet absolute right-2 flex size-7 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </span>
        </Field>
        <button type="submit" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] mt-[6px] flex h-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[14px] font-bold">Create account</button>
      </form>
    </Shell>
  );
}

export function CounselorLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = readCounselorAccount();
    if (!existing.email) {
      setError("No counselor account found on this device yet. Create one below.");
      return;
    }
    if (password.length < 1) {
      setError("Enter your password.");
      return;
    }
    writeCounselorAccount({ isSignedIn: true, email: email.trim() || existing.email });
    router.push("/counselor?view=overview");
  };

  return (
    <Shell footer={<>New here? <Link href="/counselor/signup" className="dm-link font-bold" style={{ color: "var(--primary)" }}>Create a counselor account</Link></>}>
      <form onSubmit={submit} className="flex flex-col gap-[var(--space-4)]">
        <Field label="Email Address">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.edu" className="h-11 rounded-[var(--radius-md)] border px-[12px] text-[14px] outline-none" style={fieldStyle(false)} />
        </Field>
        <Field label="Password">
          <span className="relative flex items-center">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-[var(--radius-md)] border px-[12px] pr-10 text-[14px] outline-none" style={fieldStyle(false)} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} className="dm-quiet absolute right-2 flex size-7 cursor-pointer items-center justify-center rounded-full" style={{ color: "var(--muted-foreground)" }}>
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </span>
        </Field>
        {error && <p className="text-[13px] font-semibold" style={{ color: "var(--destructive)" }}>{error}</p>}
        <button type="submit" className="dm-solid bg-[var(--primary)] text-[var(--primary-foreground)] mt-[6px] flex h-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[14px] font-bold">Sign in</button>
      </form>
    </Shell>
  );
}
