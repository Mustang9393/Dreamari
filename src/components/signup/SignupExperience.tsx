"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Check, Eye, EyeOff, GraduationCap, Heart, PartyPopper } from "lucide-react";
import { playMilestoneChime } from "@/components/build/sound";
import { Wordmark } from "@/components/app/chrome";
import { InkText } from "@/components/build/ui";

// Signup — a from-scratch build (Figma 3645:5759 was a useful skeleton: role
// picker -> birthdate -> account, but plain dark cards with a stock
// illustration and full-pill inputs). This version leans on the app's own
// language instead: the hero radial-glow background every app screen shares,
// glass-surface cards, and Dreamy standing in for the placeholder art -- he
// reacts to what's actually happening (curious at the door, thoughtful on
// the age question, delighted when you're in) rather than sitting there as
// static decoration.
//
// Structure differs from the Figma file on purpose: role and age together
// decide ONE account step's copy/fields (name+email+password for an adult or
// a 13+ student; first name + a guardian's email for under 13, no password
// collected from a child) instead of four near-duplicate screens. Fewer
// screens to maintain, and it reads as one continuous flow rather than a
// maze of forks.

type Role = "student" | "parent" | "teacher";
type Step = "role" | "birthdate" | "account" | "success";

const ROLES: {
  id: Role;
  label: string;
  blurb: string;
  Icon: typeof GraduationCap;
  from: string;
  to: string;
}[] = [
  { id: "student", label: "Student", blurb: "Finding out what I could do", Icon: GraduationCap, from: "var(--primary)", to: "var(--world-teaching-learning)" },
  { id: "parent", label: "Parent", blurb: "Supporting my kid's choices", Icon: Heart, from: "var(--world-business-money-office)", to: "color-mix(in srgb, var(--world-business-money-office) 55%, white)" },
  { id: "teacher", label: "Teacher", blurb: "Bringing this to my classroom", Icon: BookOpen, from: "var(--world-health-medicine)", to: "color-mix(in srgb, var(--world-health-medicine) 55%, white)" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => THIS_YEAR - i);

function ageFrom(monthIndex: number, year: number) {
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() < monthIndex) age -= 1;
  return age;
}

function roleAccent(role: Role | null) {
  const found = ROLES.find((r) => r.id === role);
  return found ? found.from : "var(--primary)";
}

// -----------------------------------------------------------------------
// Dreamy — the mascot as a live guide rather than corner decoration. Floats,
// leans toward the cursor (fine pointers only), pops to a new expression
// when the step's mood changes, and throws a small local confetti burst on
// real moments (age accepted, account created) -- never a screen-wide effect.
// The shared global cloud-float keyframe bobs 24px, which drifted Dreamy
// visibly away from his own speech bubble sitting fixed beside him -- this
// local, shorter-range variant keeps him close to his anchor.
// -----------------------------------------------------------------------

const SIGNUP_DREAMY_CSS = `
@keyframes signup-dreamy-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
`;

const BURST_PARTICLES = Array.from({ length: 10 }, (_, i) => {
  const angle = (-95 + i * 21) * (Math.PI / 180);
  const distance = 44 + (i % 3) * 15;
  return {
    bx: `${Math.round(Math.cos(angle) * distance)}px`,
    by: `${Math.round(Math.sin(angle) * distance)}px`,
    br: `${i % 2 === 0 ? 200 : -160}deg`,
    delay: `${(i % 4) * 0.03}s`,
  };
});

function DreamyBurst({ nonce, color }: { nonce: number; color: string }) {
  if (nonce === 0) return null;
  return (
    <div key={nonce} aria-hidden className="pointer-events-none absolute inset-0">
      {BURST_PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute top-1/3 left-1/2 h-1.5 w-1.5 rounded-[2px] motion-safe:animate-[dreamy-burst_0.7s_ease-out_forwards]"
          style={{ background: color, ["--bx" as string]: p.bx, ["--by" as string]: p.by, ["--br" as string]: p.br, animationDelay: p.delay }}
        />
      ))}
    </div>
  );
}

function SignupDreamy({ sprite, line, reactionNonce = 0, accent }: { sprite: string; line: string; reactionNonce?: number; accent: string }) {
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const [wiggling, setWiggling] = useState(false);

  useEffect(() => {
    const tilt = tiltRef.current;
    if (!tilt || !window.matchMedia("(pointer:fine)").matches) return;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = 0;
    let curY = 0;
    let rafId = 0;
    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
    function tick() {
      rafId = requestAnimationFrame(tick);
      if (!tilt) return;
      const r = tilt.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const tx = Math.max(-1, Math.min(1, (mouseX - cx) / 320));
      const ty = Math.max(-1, Math.min(1, (mouseY - cy) / 320));
      curX += (tx - curX) * 0.12;
      curY += (ty - curY) * 0.12;
      tilt.style.transform = `translate(${curX * 6}px, ${curY * 4}px) rotateX(${-curY * 10}deg) rotateY(${curX * 12}deg) rotateZ(${curX * 2.5}deg)`;
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative flex items-center gap-4">
      <div
        className="relative h-[76px] w-[76px] flex-none [perspective:600px] sm:h-[96px] sm:w-[96px]"
        onMouseEnter={() => {
          setWiggling(true);
          setTimeout(() => setWiggling(false), 650);
        }}
      >
        <div aria-hidden className="absolute inset-[-70%] rounded-full" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${accent} 30%, transparent) 0%, transparent 62%)` }} />
        <div className={`absolute inset-0 ${wiggling ? "motion-safe:[animation:dreamy-wiggle_0.6s_ease-in-out]" : "motion-safe:animate-[signup-dreamy-float_5.5s_ease-in-out_infinite]"}`}>
          <div ref={tiltRef} className="relative h-full w-full [transition:transform_.06s_linear] [will-change:transform]">
            <Image key={sprite} src={sprite} alt="Dreamy" fill sizes="96px" className="object-contain motion-safe:animate-[dreamy-pop_0.45s_cubic-bezier(0.34,1.56,0.64,1)]" priority />
          </div>
        </div>
        <DreamyBurst nonce={reactionNonce} color={accent} />
      </div>
      <div key={line} className="relative w-fit max-w-[260px] min-w-0 sm:max-w-[300px]">
        <div aria-hidden className="absolute top-1/2 -left-[6px] h-3 w-3 -translate-y-1/2 rotate-45 rounded-[2px] backdrop-blur-md" style={{ background: "var(--glass-surface-3)", borderLeft: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }} />
        <p className="relative rounded-2xl px-4 py-3 text-[14px] leading-snug font-semibold backdrop-blur-md sm:text-[15px]" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)", background: "var(--glass-surface-3)", border: "1px solid var(--glass-border)", boxShadow: `0 12px 32px -18px color-mix(in srgb, ${accent} 45%, transparent)` }}>
          <InkText text={line} delay={0.1} />
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Shared field chrome. Taller and less round than the Figma spec on
// purpose (52px / var(--radius-lg) = 16px, not a pill) per direct feedback
// that the reference's inputs read short and over-rounded; weight floors at
// medium/semibold throughout since thin Montserrat reads weak against the
// app's usual bold display type.
// -----------------------------------------------------------------------

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex w-full flex-col gap-[7px]">
      <span className="text-[14px] leading-[18px] font-semibold" style={{ fontFamily: "var(--font-body)", color: "var(--foreground)" }}>
        {label}
      </span>
      {children}
      {error && (
        <span className="text-[12px] leading-[16px] font-medium" style={{ color: "var(--destructive)" }}>
          {error}
        </span>
      )}
    </label>
  );
}

const INPUT_CLASS = "h-[52px] w-full rounded-[var(--radius-lg)] border px-[16px] text-[14px] font-medium outline-none transition-colors focus-visible:ring-2";

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--font-body)",
    background: "var(--glass-surface-1)",
    borderColor: hasError ? "var(--destructive)" : "var(--glass-border)",
    color: "var(--foreground)",
  };
}

// -----------------------------------------------------------------------
// Progress — three wordless dots, never "Step 2 of 3": a counter is the one
// thing proven (elsewhere in this app) to make a short flow feel long.
// -----------------------------------------------------------------------

function ProgressDots({ total, index, accent }: { total: number; index: number; accent: string }) {
  return (
    <div className="flex items-center gap-[6px]" role="presentation">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-[6px] rounded-full transition-all duration-500"
          style={{ width: i === index ? "22px" : "6px", background: i <= index ? accent : "var(--glass-surface-2)" }}
        />
      ))}
    </div>
  );
}

export function SignupExperience() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthdateError, setBirthdateError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reactionNonce, setReactionNonce] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const accent = roleAccent(role);
  const isStudent = role === "student";
  const underAge = isStudent && birthMonth !== "" && birthYear !== "" ? ageFrom(MONTHS.indexOf(birthMonth), Number(birthYear)) < 13 : false;

  // Dots: adults skip the birthdate step, so their flow is shorter.
  const sequence: Step[] = isStudent ? ["role", "birthdate", "account", "success"] : ["role", "account", "success"];
  const dotTotal = sequence.length - 1; // success isn't a counted dot
  const dotIndex = Math.min(sequence.indexOf(step), dotTotal - 1);

  const bump = useCallback(() => setReactionNonce((n) => n + 1), []);

  // "You're in!" arrived silently with a static party-popper. The same 3-note
  // milestone chime the Build flow uses at its landmarks, plus Dreamy's own
  // burst (bump), so signing up lands as the celebration it is. Skipped for the
  // under-age "check that inbox" hand-off, which isn't a finish line yet.
  useEffect(() => {
    if (step !== "success" || (isStudent && underAge)) return;
    // Deferred a tick: bump() sets state, and a synchronous setState inside an
    // effect body is what react-hooks/set-state-in-effect flags.
    const timer = window.setTimeout(() => {
      playMilestoneChime();
      bump();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [step, isStudent, underAge, bump]);

  const dreamySprite = useMemo(() => {
    if (step === "role") return "/images/dreamy/v2/dreamy-curious.png";
    if (step === "birthdate") return "/images/dreamy/v2/dreamy-idea.png";
    if (step === "success") return "/images/dreamy/v2/dreamy-party.png";
    return "/images/dreamy/v2/dreamy-heart.png";
  }, [step]);

  const dreamyLine = useMemo(() => {
    if (step === "role") return "Hi! Who's joining us today?";
    if (step === "birthdate") return "Just so we ask age-appropriate questions along the way.";
    if (step === "account") {
      if (isStudent && underAge) return "One more thing, then we'll loop in a parent.";
      return role === "parent" ? "Let's set up your account." : role === "teacher" ? "Let's set up your classroom." : "Let's create your account.";
    }
    if (isStudent && underAge) return `Sent to ${guardianEmail || "your parent"}!`;
    return `Welcome to Dreamari${name ? `, ${name.split(" ")[0]}` : ""}!`;
  }, [step, isStudent, underAge, role, name, guardianEmail]);

  function pickRole(next: Role) {
    setRole(next);
    bump();
    setStep(next === "student" ? "birthdate" : "account");
  }

  function submitBirthdate() {
    if (!birthMonth || !birthYear) {
      setBirthdateError("Pick both a month and a year to continue.");
      return;
    }
    setBirthdateError("");
    bump();
    setStep("account");
  }

  function validateAccount() {
    const next: Record<string, string> = {};
    if (isStudent && underAge) {
      if (!name.trim()) next.name = "What should we call you?";
      if (!/^\S+@\S+\.\S+$/.test(guardianEmail)) next.guardianEmail = "Enter a parent or guardian's email.";
    } else {
      if (!name.trim()) next.name = "Enter your name.";
      if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email.";
      if (password.length < 8) next.password = "At least 8 characters.";
      if (!agreed) next.agreed = "Agree to the Terms to continue.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submitAccount() {
    if (!validateAccount()) return;
    setSubmitting(true);
    // Prototype only — no backend. A brief pause keeps the CTA from feeling
    // like a dead click before the celebration lands.
    setTimeout(() => {
      setSubmitting(false);
      bump();
      setStep("success");
    }, 550);
  }

  function goBack() {
    if (step === "birthdate") setStep("role");
    else if (step === "account") setStep(isStudent ? "birthdate" : "role");
  }

  return (
    <div
      className="marketing-v2 themeable relative flex min-h-dvh w-full flex-col"
      style={{
        background:
          "radial-gradient(120% 85% at 85% -10%, color-mix(in srgb, var(--hero-accent-purple) 55%, transparent), transparent 60%), radial-gradient(95% 70% at -12% 30%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 60%), radial-gradient(110% 80% at 75% 115%, color-mix(in srgb, var(--hero-accent-teal) 45%, transparent), transparent 62%), linear-gradient(160deg, color-mix(in srgb, var(--hero-accent-purple) 26%, var(--background)) 0%, var(--background) 48%, color-mix(in srgb, var(--hero-accent-teal) 20%, var(--background)) 100%)",
        color: "var(--foreground)",
      }}
    >
      <style>{SIGNUP_DREAMY_CSS}</style>
      <header className="flex w-full items-center justify-between px-[var(--space-6)] py-[var(--space-5)] sm:px-[var(--space-10)]">
        <Wordmark href="/" />
        {step !== "role" && step !== "success" && (
          <button
            type="button"
            onClick={goBack}
            className="dm-quiet flex items-center gap-[6px] rounded-full border px-[14px] py-[8px] text-[13px] font-semibold"
            style={{ fontFamily: "var(--font-body)", background: "var(--glass-surface-1)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </button>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center gap-[var(--space-10)] px-[var(--space-6)] pb-[var(--space-10)] lg:flex-row lg:items-center lg:gap-[var(--space-14)]">
        {/* Left: Dreamy, hero line, dots — the "illustration" the Figma file
           reserved for a stock people-on-stairs image. Hidden on phones
           (SignupDreamy already rides inside the card there) so mobile
           doesn't scroll past a full screen of hero before reaching the form. */}
        <div className="hidden w-full max-w-[440px] flex-col gap-[var(--space-8)] lg:flex">
          <div className="flex flex-col gap-[10px]">
            <h1 className="text-[40px] leading-[46px] font-extrabold tracking-[0.01em] text-balance uppercase" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
              Join Dreamari
            </h1>
            <p className="text-[16px] leading-[24px] font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
              Explore careers and find what fits you.
            </p>
          </div>
          <SignupDreamy sprite={dreamySprite} line={dreamyLine} reactionNonce={reactionNonce} accent={accent} />
          {step !== "success" && (
            <div className="mt-[var(--space-2)]">
              <ProgressDots total={dotTotal} index={dotIndex} accent={accent} />
            </div>
          )}
        </div>

        {/* Right: the active step, in a glass card that keeps its size stable
           across steps so nothing jumps as content swaps. */}
        <div className="flex w-full max-w-[480px] flex-none flex-col gap-[var(--space-5)]">
          <div className="flex flex-col gap-[var(--space-6)] lg:hidden">
            <SignupDreamy sprite={dreamySprite} line={dreamyLine} reactionNonce={reactionNonce} accent={accent} />
            {step !== "success" && <ProgressDots total={dotTotal} index={dotIndex} accent={accent} />}
          </div>

          <div
            key={step}
            className="motion-safe:animate-[fade-slide-up_0.32s_cubic-bezier(0.16,1,0.3,1)] flex w-full flex-col gap-[var(--space-5)] rounded-[28px] border p-[var(--space-8)] backdrop-blur-[16px]"
            style={{ background: "var(--glass-surface-2)", borderColor: "var(--glass-border)", boxShadow: "0 24px 60px -28px rgba(0,0,0,0.6)" }}
          >
            {step === "role" && (
              <>
                <h2 className="text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  Choose your role
                </h2>
                <div className="flex flex-col gap-[12px]">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => pickRole(r.id)}
                      className="dm-tap flex w-full cursor-pointer items-center gap-[14px] rounded-[20px] border p-[16px] text-left"
                      style={{ background: "var(--glass-surface-1)", borderColor: "var(--glass-border)" }}
                    >
                      <span className="flex h-[48px] w-[48px] flex-none items-center justify-center rounded-[16px]" style={{ background: `color-mix(in srgb, ${r.from} 20%, transparent)` }}>
                        <r.Icon className="h-[22px] w-[22px]" aria-hidden style={{ color: r.from }} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
                        <span className="text-[16px] leading-[21px] font-bold" style={{ color: "var(--foreground)" }}>
                          {r.label}
                        </span>
                        <span className="text-[13px] leading-[18px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                          {r.blurb}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <LoginPrompt />
              </>
            )}

            {step === "birthdate" && (
              <>
                <h2 className="text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  When were you born?
                </h2>
                <div className="flex gap-[12px]">
                  <Field label="Month">
                    <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className={`${INPUT_CLASS} cursor-pointer appearance-none`} style={inputStyle()}>
                      <option value="" disabled>
                        Month
                      </option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Year">
                    <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className={`${INPUT_CLASS} cursor-pointer appearance-none`} style={inputStyle()}>
                      <option value="" disabled>
                        Year
                      </option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                {birthdateError && (
                  <p className="text-[12px] leading-[16px] font-medium" style={{ color: "var(--destructive)" }}>
                    {birthdateError}
                  </p>
                )}
                <PrimaryButton onClick={submitBirthdate} accent={accent}>
                  Continue
                </PrimaryButton>
              </>
            )}

            {step === "account" && (
              <>
                <h2 className="text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  {isStudent && underAge ? "Almost set up" : "Create your account"}
                </h2>

                <Field label={isStudent && underAge ? "Your first name" : "Your name"} error={errors.name}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isStudent && underAge ? "First name" : "Full name"}
                    className={INPUT_CLASS}
                    style={inputStyle(!!errors.name)}
                  />
                </Field>

                {isStudent && underAge ? (
                  <Field label="A parent or guardian's email" error={errors.guardianEmail}>
                    <input
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className={INPUT_CLASS}
                      style={inputStyle(!!errors.guardianEmail)}
                    />
                  </Field>
                ) : (
                  <>
                    <Field label="Email" error={errors.email}>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={INPUT_CLASS} style={inputStyle(!!errors.email)} />
                    </Field>
                    <Field label="Password" error={errors.password}>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className={`${INPUT_CLASS} pr-[64px]`}
                          style={inputStyle(!!errors.password)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="dm-quiet absolute top-1/2 right-[10px] flex h-[34px] -translate-y-1/2 items-center gap-[5px] rounded-full px-[10px] text-[12px] font-semibold"
                          style={{ fontFamily: "var(--font-body)", color: "var(--primary)" }}
                        >
                          {showPassword ? <EyeOff className="h-[15px] w-[15px]" aria-hidden /> : <Eye className="h-[15px] w-[15px]" aria-hidden />}
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </Field>
                    <label className="flex cursor-pointer items-start gap-[10px]">
                      <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
                      <span
                        aria-hidden
                        className="mt-[1px] flex h-[20px] w-[20px] flex-none items-center justify-center rounded-[6px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2"
                        style={{ background: agreed ? accent : "var(--glass-surface-1)", borderColor: agreed ? accent : "var(--glass-border)" }}
                      >
                        {agreed && <Check className="h-[13px] w-[13px]" aria-hidden style={{ color: "#ffffff" }} strokeWidth={3} />}
                      </span>
                      <span className="text-[12px] leading-[17px] font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
                        I agree to the Terms of Service and Privacy Policy.
                      </span>
                    </label>
                    {errors.agreed && (
                      <p className="-mt-[8px] text-[12px] leading-[16px] font-medium" style={{ color: "var(--destructive)" }}>
                        {errors.agreed}
                      </p>
                    )}
                  </>
                )}

                <PrimaryButton onClick={submitAccount} accent={accent} loading={submitting}>
                  {isStudent && underAge ? "Send to my parent" : "Sign up"}
                </PrimaryButton>
                {!(isStudent && underAge) && <LoginPrompt />}
              </>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center gap-[var(--space-5)] py-[var(--space-4)] text-center">
                <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${accent} 22%, transparent)` }}>
                  <PartyPopper className="h-[30px] w-[30px]" aria-hidden style={{ color: accent }} />
                </span>
                <h2 className="text-[24px] leading-[30px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
                  {isStudent && underAge ? "Check that inbox" : "You're in!"}
                </h2>
                {!(isStudent && underAge) && (
                  <PrimaryButton onClick={() => router.push("/home")} accent={accent}>
                    Start exploring
                  </PrimaryButton>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LoginPrompt() {
  return (
    <p className="flex items-center justify-center gap-[6px] text-[13px] leading-[18px] font-medium" style={{ fontFamily: "var(--font-body)", color: "var(--muted-foreground)" }}>
      Already have an account?
      <a href="/home" className="dm-link font-bold" style={{ color: "var(--primary)" }}>
        Log in
      </a>
    </p>
  );
}

function PrimaryButton({ children, onClick, accent, loading }: { children: React.ReactNode; onClick: () => void; accent: string; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="dm-solid flex h-[52px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[var(--radius-lg)] text-[16px] font-bold text-white disabled:cursor-default disabled:opacity-70"
      style={{ fontFamily: "var(--font-display)", background: `linear-gradient(120deg, ${accent}, color-mix(in srgb, ${accent} 65%, white))`, boxShadow: `0 16px 32px -16px color-mix(in srgb, ${accent} 65%, transparent)` }}
    >
      {loading ? "One sec…" : children}
    </button>
  );
}
