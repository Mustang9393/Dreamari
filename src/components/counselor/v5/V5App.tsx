"use client";

// Counselor v5 (7 Oct 2026): the counselor app on the student design system.
// Chandu: "lets add a v5 and start building. First go back to the type and
// tokens from the student app." Joshua's architecture (docs/reference/
// counselor-reimagine-notes-2026-10-07.md): Home | Students | Explore |
// Prepare | Workspace | Analytics, "Dreamari for adults, not another SIS".
// The plan and build order: docs/handoff/counselor-app-plan-2026-10-07.md.
//
// Same chrome, backdrop, page column and type as the student pages (Home,
// Explore, Play...), so it reads as the same world. Built phone first: the
// v4 dashboard broke down on phones and tablets (Chandu: "looks horrible on
// mobile and tablet with all the lines and things stacking").

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart3, Briefcase, ClipboardList, Compass, House, Users } from "lucide-react";
import { AppBackdrop } from "@/components/app/AppBackdrop";
import { DesktopNavigation, MobileHeaderShell, MobileNav, QuickLinksMenu, Wordmark, type MobileNavItem, type NavItem } from "@/components/app/chrome";
import { IconTip } from "@/components/app/IconTip";
import { LockedView } from "@/components/app/states";
import { V5Home } from "./Home";
import { V5Students } from "./Students";
import { V5Explore } from "./Explore";
import { V5Prepare, usePrepareMerged } from "./Prepare";
import { V5Workspace } from "./Workspace";
import { V5Analytics } from "./Analytics";
import { V5Profile } from "./Profile";
import { LogSheetHost } from "./LogSheet";
import "./v5.css";
import { setCounselorBase } from "@/lib/counselorBase";
import "../calm.css";

export const V5_VIEWS = ["home", "students", "explore", "prepare", "workspace", "analytics"] as const;
export type V5View = (typeof V5_VIEWS)[number];

const LABEL: Record<V5View, string> = { home: "Home", students: "Students", explore: "Explore", prepare: "Prepare", workspace: "Workspace", analytics: "Analytics" };
const href = (v: V5View) => `/counselor?v=5&view=${v}`;

// With Workspace inside Prepare (the prepare-ia A/B, Prepare.tsx) the nav
// drops it and old Workspace links open Prepare on that tab.
const navFor = (merged: boolean): NavItem[] => V5_VIEWS.filter((v) => !(merged && v === "workspace")).map((v) => ({ label: LABEL[v], href: href(v) }));
// Five destinations plus the profile slot fit a phone's bottom bar; Workspace
// (the operational tools) sits in the top bar there instead.
const MOBILE_NAV: MobileNavItem[] = [
  { label: "Home", href: href("home"), Icon: House },
  { label: "Students", href: href("students"), Icon: Users },
  { label: "Explore", href: href("explore"), Icon: Compass },
  { label: "Prepare", href: href("prepare"), Icon: ClipboardList },
  { label: "Analytics", href: href("analytics"), Icon: BarChart3 },
];

// DEMO-ONLY: the signed-in counselor. Production reads the user record.
const COUNSELOR = { name: "Sarah Chen", initials: "SC" };

/** Counselors are adults: their own photo (DEMO-ONLY pick, as Profile). */
function CounselorBadge({ size = 32 }: { size?: number }) {
  return <Image src="/images/connect/avatars/pro-tanaka.jpg" alt="" width={64} height={64} aria-hidden className="flex-none rounded-full object-cover" style={{ width: size, height: size, objectPosition: "50% 20%" }} />;
}

// What each area will hold, from the plan (section 4), shown until it is built.
const NEXT: Record<Exclude<V5View, "home">, string> = {
  students: "Caseload, milestones and reviews.",
  explore: "Careers, schools and jobs by state.",
  prepare: "Your week, who needs a meeting, and a brief per student.",
  workspace: "Messages, documents and Assist.",
  analytics: "Readiness, risk and outcomes.",
};

export function V5App({ view }: { view: string | undefined }) {
  const router = useRouter();
  setCounselorBase("/counselor?v=5");
  // the profile is reached from your badge, not a tab
  const onProfile = view === "profile";
  const active: V5View = V5_VIEWS.includes(view as V5View) ? (view as V5View) : "home";
  // The open student rides in the URL (the counselor page is dynamically
  // rendered, so no Suspense boundary is needed for this hook).
  const params = useSearchParams();
  const studentId = params.get("studentId") ?? undefined;
  const tab = params.get("tab") ?? undefined;
  const merged = usePrepareMerged();
  // Workspace links land on Prepare's matching tab when it lives there
  const shown: V5View = merged && active === "workspace" ? "prepare" : active;
  return (
    <div className="marketing-v2 themeable counselor-calm relative min-h-dvh w-full" style={{ background: "transparent", color: "var(--foreground)" }}>
      <AppBackdrop />
      <DesktopNavigation
        active={onProfile ? "Profile" : LABEL[shown]}
        items={navFor(merged)}
        right={
          <IconTip label={COUNSELOR.name}>
            <Link href="/counselor?v=5&view=profile" aria-label={`${COUNSELOR.name}, your profile`} className="dm-quiet flex items-center rounded-full">
              <CounselorBadge />
            </Link>
          </IconTip>
        }
      />
      <MobileHeaderShell>
        <Wordmark href={href("home")} />
        <div className="flex items-center gap-[var(--space-2)]">
          {!merged && <IconTip label="Workspace">
            <Link href={href("workspace")} aria-label="Workspace" aria-current={active === "workspace" ? "page" : undefined} className="dm-quiet flex size-9 items-center justify-center rounded-full" style={{ color: active === "workspace" ? "var(--foreground)" : "var(--muted-foreground)" }}>
              <Briefcase className="h-5 w-5" aria-hidden />
            </Link>
          </IconTip>}
          <QuickLinksMenu />
        </div>
      </MobileHeaderShell>

      {/* The student pages' column and rhythm (HomeExperience): 1440 max,
         20px phone gutter, 56px from sm, 22px between sections. */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-[22px] px-5 pt-3 pb-[120px] sm:px-[var(--space-14)] md:pt-8">
        {onProfile ? (
          <V5Profile />
        ) : active === "home" ? (
          <V5Home />
        ) : active === "students" ? (
          <V5Students studentId={studentId} />
        ) : active === "explore" ? (
          <V5Explore />
        ) : shown === "prepare" ? (
          <V5Prepare key={`${studentId ?? ""}-${active}-${tab ?? ""}`} studentId={studentId} initialTab={active === "workspace" ? tab ?? "reviews" : tab} />
        ) : active === "workspace" ? (
          <V5Workspace key={tab} initial={tab} />
        ) : active === "analytics" ? (
          <V5Analytics />
        ) : (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LockedView heading={`${LABEL[active]} is coming next`} line={NEXT[active]} cta="Back to Home" onAction={() => router.push(href("home"))} />
          </div>
        )}
      </main>
      <LogSheetHost />
      <MobileNav active={onProfile ? "Profile" : LABEL[shown]} items={MOBILE_NAV} profile={{ href: "/counselor?v=5&view=profile", label: COUNSELOR.name, node: <CounselorBadge size={28} /> }} />
    </div>
  );
}
