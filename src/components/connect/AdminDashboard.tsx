"use client";

import { useContext, useMemo, useState } from "react";
import { ArrowLeft, Building2, CheckCircle2, Flag, GraduationCap, MessagesSquare, School, ShieldCheck, Trash2, Users, XCircle } from "lucide-react";
import { dispatchAuroraPulse } from "@/components/flow/aurora/pulse";
import { WORLD_COLORS } from "@/components/app/worlds";
import { COMMUNITIES, PROS, THREADS } from "./data";
import { Avatar, CompanyChip, ConnectNav, PrimaryCta, QuietCta, formatCount } from "./primitives";
import { Panel, PanelRow, RULE } from "./ProProfile";
import { AreaChart, Meter, MetricTile, Ring, Segmented, demoSeries } from "./viz";

// Dreamari staff view (demo): what is happening across the whole app, who is
// on it, what needs a human. Four tabs, one job each:
//   Overview    the numbers that say whether the loop is working
//   Moderation  the queue: reports, answers awaiting review, blocked posts
//   People      students, volunteers (with the private activity tiers), partners
//   Features    which parts of the app students actually use this week
// Every figure is demo data. Reached through the demo role switch or the menu.

type Tab = "overview" | "moderation" | "people" | "features";

const ACCENT = "var(--primary)";

type Report = { id: string; kind: "answer" | "comment" | "question"; reason: string; excerpt: string; by: string; where: string; ago: string };
const REPORTS: Report[] = [
  { id: "rp1", kind: "comment", reason: "Shares personal contact details", excerpt: "dm me on snap for the full list, its @…", by: "a Junior", where: "Finance Careers", ago: "12m" },
  { id: "rp2", kind: "comment", reason: "Unkind or bullying", excerpt: "this is a dumb question honestly", by: "a Sophomore", where: "Technology Careers", ago: "1h" },
  { id: "rp3", kind: "question", reason: "Not about careers or school", excerpt: "does anyone here play valorant", by: "a Freshman", where: "General Professional Development", ago: "3h" },
];
const PENDING: { id: string; proId: string; question: string; ago: string }[] = [
  { id: "pa1", proId: "pro-gallagher", question: "Is accounting actually boring, or is that just a stereotype?", ago: "25m" },
  { id: "pa2", proId: "pro-haddad", question: "Can I work in healthcare if I hate blood?", ago: "2h" },
];

const TIERS = [
  { name: "Diamond", note: "daily", count: 21, color: "#7dd3fc" },
  { name: "Gold", note: "weekly", count: 64, color: "#f5c04e" },
  { name: "Silver", note: "monthly", count: 47, color: "#c0c4cc" },
  { name: "Inactive", note: "less than monthly", count: 18, color: "var(--muted-foreground)" },
];

const FEATURES = [
  { name: "Build", users: 6120, of: 12480, delta: 6 },
  { name: "Match", users: 5480, of: 12480, delta: 9 },
  { name: "Explore", users: 8930, of: 12480, delta: 4 },
  { name: "Play", users: 4210, of: 12480, delta: 14 },
  { name: "Connect", users: 3970, of: 12480, delta: 22 },
];

export function AdminDashboardView({ onBack }: { onBack: () => void }) {
  const nav = useContext(ConnectNav);
  const [tab, setTab] = useState<Tab>("overview");
  const [decided, setDecided] = useState<Record<string, "kept" | "removed" | "approved">>({});
  const series = useMemo(() => demoSeries("admin-questions", 30, 98), []);
  const openReports = REPORTS.filter((r) => !decided[r.id]).length + PENDING.filter((p) => !decided[p.id]).length;
  const partners = Array.from(new Set(PROS.map((p) => p.org)));

  const decide = (id: string, what: "kept" | "removed" | "approved") => {
    dispatchAuroraPulse(what === "removed" ? "select" : "cta");
    setDecided((d) => ({ ...d, [id]: what }));
  };

  return (
    <>
      <button type="button" onClick={onBack} className="dm-link flex min-h-[44px] w-fit cursor-pointer items-center gap-[6px] text-[12.5px] font-bold" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back
      </button>

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-4)]">
        <div className="flex items-center gap-[12px]">
          <span className="flex size-[52px] flex-none items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--primary) 20%, transparent)", color: "var(--accent-subtle)" }}>
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-[22px] leading-[27px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Dreamari staff</h1>
            <p className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>Sitewide · this week</p>
          </div>
        </div>
        <Segmented<Tab>
          ariaLabel="Admin section"
          value={tab}
          onChange={setTab}
          options={[
            { key: "overview", label: "Overview" },
            { key: "moderation", label: openReports > 0 ? `Moderation · ${openReports}` : "Moderation" },
            { key: "people", label: "People" },
            { key: "features", label: "Features" },
          ]}
        />
      </div>

      {tab === "overview" && (
        <>
          <Panel id="site-title" title="Right now">
            <dl className="grid grid-cols-2 gap-x-[var(--space-5)] gap-y-[var(--space-3)] sm:grid-cols-4">
              {[
                { icon: GraduationCap, value: formatCount(12480), label: "Students", delta: 8 },
                { icon: ShieldCheck, value: "150", label: "Volunteers", delta: 12 },
                { icon: Building2, value: String(partners.length), label: "Partner companies", delta: 0 },
                { icon: School, value: "214", label: "Schools", delta: 5 },
              ].map((m, i) => (
                <div key={m.label} className={`py-[var(--space-3)] ${i >= 2 ? "border-t sm:border-t-0" : ""}`} style={{ borderColor: RULE }}>
                  <MetricTile icon={m.icon} value={m.value} label={m.label} delta={m.delta} accent={ACCENT} />
                </div>
              ))}
            </dl>
          </Panel>

          {/* the loop, measured: asked, answered, how fast */}
          <Panel id="loop-title" title="Questions" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>last 30 days</span>}>
            <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-[1fr_auto]">
              <AreaChart points={series} accent={ACCENT} labels={["30 days ago", "15 days ago", "Today"]} />
              <div className="flex flex-row flex-wrap gap-[var(--space-5)] sm:flex-col sm:border-l sm:pl-[var(--space-5)]" style={{ borderColor: RULE }}>
                {[
                  { pct: 92, value: "92%", label: "answered" },
                  { pct: 61, value: "19h", label: "median wait" },
                  { pct: 57, value: "85", label: "active volunteers" },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-[12px]">
                    <Ring pct={r.pct} accent={ACCENT} size={64} stroke={6}>
                      <span className="text-[14px] leading-[16px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{r.value}</span>
                    </Ring>
                    <span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel id="communities-title" title="Communities">
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {COMMUNITIES.map((c) => {
                const accent = WORLD_COLORS[c.world] ?? ACCENT;
                const asked = THREADS.filter((t) => t.boardId === c.id).length;
                return (
                  <PanelRow key={c.id} onClick={() => nav?.openBoard(c.id)}>
                    <span className="flex w-full flex-wrap items-center justify-between gap-x-[var(--space-4)] gap-y-[6px]">
                      <span className="flex min-w-0 items-center gap-[10px]">
                        <span aria-hidden className="size-[10px] flex-none rounded-[3px]" style={{ background: accent }} />
                        <span className="truncate text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{c.name}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-x-[var(--space-4)] text-[12.5px] leading-[16px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                        <span><strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{c.students}</strong> students</span>
                        <span><strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{c.activePros}</strong> pros</span>
                        <span><strong className="font-extrabold" style={{ color: "var(--foreground)" }}>{asked + c.posts}</strong> posts</span>
                        <Meter value={c.activePros} max={90} accent={accent} />
                      </span>
                    </span>
                  </PanelRow>
                );
              })}
            </ul>
          </Panel>
        </>
      )}

      {tab === "moderation" && (
        <>
          <Panel id="reports-title" title="Reports" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{REPORTS.filter((r) => !decided[r.id]).length} open</span>}>
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {REPORTS.map((r) => {
                const done = decided[r.id];
                return (
                  <li key={r.id} className="flex flex-col gap-[8px] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
                    <span className="flex flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[4px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                      <span className="flex items-center gap-[6px]"><Flag className="h-3 w-3" aria-hidden style={{ color: "var(--world-business-money-office)" }} /> {r.reason} · {r.kind} · {r.where}</span>
                      <span>reported by {r.by} · {r.ago}</span>
                    </span>
                    <span className="text-[15px] leading-[21px]" style={{ color: "var(--foreground)", textDecoration: done === "removed" ? "line-through" : undefined, opacity: done ? 0.6 : 1 }}>&ldquo;{r.excerpt}&rdquo;</span>
                    {done ? (
                      <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: done === "removed" ? "var(--muted-foreground)" : "var(--world-food-farming-nature)" }}>
                        {done === "removed" ? <Trash2 className="h-4 w-4" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />} {done === "removed" ? "Removed. The student was told why." : "Kept."}
                      </span>
                    ) : (
                      <span className="flex flex-wrap gap-[var(--space-2)]">
                        <PrimaryCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => decide(r.id, "removed")}>Remove</PrimaryCta>
                        <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => decide(r.id, "kept")}>Keep</QuietCta>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel id="pending-title" title="Answers awaiting review" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{PENDING.filter((p) => !decided[p.id]).length} waiting</span>}>
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {PENDING.map((p) => {
                const pro = PROS.find((x) => x.id === p.proId)!;
                const done = decided[p.id];
                return (
                  <li key={p.id} className="flex flex-col gap-[8px] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
                    <span className="flex flex-wrap items-center justify-between gap-x-[var(--space-3)] gap-y-[4px]">
                      <span className="flex items-center gap-[8px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        <Avatar name={pro.name} verified size={24} /> <strong className="font-bold" style={{ color: "var(--foreground)" }}>{pro.name}</strong> <CompanyChip name={pro.org} tone="surface" size="sm" />
                      </span>
                      <span className="text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{p.ago}</span>
                    </span>
                    <span className="text-[15px] leading-[21px] font-semibold" style={{ color: "var(--foreground)" }}>&ldquo;{p.question}&rdquo;</span>
                    {done ? (
                      <span className="flex items-center gap-[6px] text-[13px] leading-[18px] font-semibold" style={{ color: done === "approved" ? "var(--world-food-farming-nature)" : "var(--muted-foreground)" }}>
                        {done === "approved" ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />} {done === "approved" ? "Published." : "Sent back with a note."}
                      </span>
                    ) : (
                      <span className="flex flex-wrap gap-[var(--space-2)]">
                        <PrimaryCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => decide(p.id, "approved")}>Publish</PrimaryCta>
                        <QuietCta className="min-h-[36px] px-[var(--space-4)] text-[13px]" onClick={() => decide(p.id, "removed")}>Send back</QuietCta>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel id="safety-title" title="Blocked before posting" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>this week</span>}>
            <dl className="grid grid-cols-3 gap-[var(--space-3)]">
              {[["38", "contact details"], ["7", "off topic"], ["0", "adult to student messages"]].map(([v, l]) => (
                <div key={l} className="flex flex-col"><dd className="order-1 text-[24px] leading-[28px] font-extrabold tabular-nums" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{v}</dd><dt className="order-2 text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{l}</dt></div>
              ))}
            </dl>
          </Panel>
        </>
      )}

      {tab === "people" && (
        <>
          <Panel id="roles-title" title="By role">
            <dl className="grid grid-cols-2 gap-x-[var(--space-5)] gap-y-[var(--space-3)] sm:grid-cols-4">
              {[
                { icon: GraduationCap, value: formatCount(12480), label: "Students", delta: 8 },
                { icon: ShieldCheck, value: "150", label: "Volunteers", delta: 12 },
                { icon: Building2, value: String(partners.length), label: "Partners", delta: 0 },
                { icon: Users, value: "9", label: "Staff", delta: 0 },
              ].map((m, i) => (
                <div key={m.label} className={`py-[var(--space-3)] ${i >= 2 ? "border-t sm:border-t-0" : ""}`} style={{ borderColor: RULE }}>
                  <MetricTile icon={m.icon} value={m.value} label={m.label} delta={m.delta} accent={ACCENT} />
                </div>
              ))}
            </dl>
          </Panel>

          {/* the private tiers, visible only here and to each volunteer about themselves */}
          <Panel id="tiers-title" title="Volunteer activity" aside={<span className="text-[13px] leading-[18px] font-semibold" style={{ color: "var(--muted-foreground)" }}>private to staff and each volunteer</span>}>
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {TIERS.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-[var(--space-4)] border-t py-[var(--space-3)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
                  <span className="flex items-center gap-[10px] text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>
                    <span aria-hidden className="size-[10px] rounded-full" style={{ background: t.color }} /> {t.name} <span className="text-[12.5px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{t.note}</span>
                  </span>
                  <Meter value={t.count} max={150} accent={t.color} label="volunteers" />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel id="volunteers-title" title="Volunteers" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>{PROS.length} of 150 shown</span>}>
            <ul className="-mt-[var(--space-2)] flex flex-col">
              {PROS.map((p) => {
                const tier = p.activeDaysAgo <= 1 ? TIERS[0] : p.activeDaysAgo <= 7 ? TIERS[1] : p.activeDaysAgo <= 30 ? TIERS[2] : TIERS[3];
                return (
                  <PanelRow key={p.id} onClick={() => nav?.openPro(p.id)}>
                    <span className="flex w-full items-center gap-[10px]">
                      <Avatar name={p.name} verified size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-[8px] gap-y-[2px]">
                          <span className="truncate text-[15px] leading-[20px] font-bold" style={{ color: "var(--foreground)" }}>{p.name}</span>
                          <CompanyChip name={p.org} tone="surface" size="sm" />
                        </span>
                        <span className="block truncate text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>{p.role} · {p.questionsAnswered} answered · {formatCount(p.studentsReached)} reached</span>
                      </span>
                      <span className="flex flex-none items-center gap-[6px] text-[12px] leading-[16px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        <span aria-hidden className="size-[8px] rounded-full" style={{ background: tier.color }} /> {tier.name}
                      </span>
                    </span>
                  </PanelRow>
                );
              })}
            </ul>
          </Panel>

          <Panel id="partners-title" title="Partners">
            <div className="flex flex-wrap gap-[8px]">
              {partners.map((org) => <CompanyChip key={org} name={org} tone="surface" />)}
            </div>
          </Panel>
        </>
      )}

      {tab === "features" && (
        <Panel id="features-title" title="Used this week" aside={<span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>of {formatCount(12480)} students</span>}>
          <ul className="-mt-[var(--space-2)] flex flex-col">
            {FEATURES.map((f) => {
              const pct = Math.round((f.users / f.of) * 100);
              return (
                <li key={f.name} className="flex flex-col gap-[8px] border-t py-[var(--space-4)] first:border-t-0 last:pb-0" style={{ borderColor: RULE }}>
                  <span className="flex items-baseline justify-between gap-[var(--space-3)]">
                    <span className="text-[15px] leading-[20px] font-semibold" style={{ color: "var(--foreground)" }}>{f.name}</span>
                    <span className="text-[13px] leading-[18px] font-semibold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                      <strong className="text-[18px] leading-[22px] font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>{formatCount(f.users)}</strong> · {pct}% <span style={{ color: "var(--world-food-farming-nature)" }}>+{f.delta}%</span>
                    </span>
                  </span>
                  <span className="relative block h-[6px] w-full overflow-hidden rounded-[3px]" style={{ background: "rgba(255,255,255,0.12)" }} aria-hidden>
                    <span className="absolute inset-y-0 left-0 rounded-[3px]" style={{ width: `${pct}%`, background: ACCENT }} />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="flex items-center gap-[6px] border-t pt-[var(--space-4)] text-[13px] leading-[18px] font-semibold" style={{ borderColor: RULE, color: "var(--muted-foreground)" }}>
            <MessagesSquare className="h-[14px] w-[14px]" aria-hidden style={{ color: ACCENT }} /> Connect is the fastest-growing feature this month.
          </p>
        </Panel>
      )}
    </>
  );
}
