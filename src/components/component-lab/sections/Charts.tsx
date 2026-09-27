"use client";

// DEMO-ONLY: Component Lab section, "Charts". Every chart primitive in the
// app, all pure props (no store, no context, no navigation) -- see
// docs/handoff/COMPONENT_INVENTORY.md lines 220-226. Realistic mock data
// alongside sparse, all-zero, and proposed empty/loading cells wherever
// those make sense for the shape.

import { Section, Specimen, StateGrid, StateCell, ProposedLoading, ProposedEmpty } from "../kit";

import { AreaChart, BarChart as ConnectBarChart, Ring, SegmentedRing, Meter, MetricTile } from "@/components/connect/viz";
import { Donut, SplitBar, RangeBar, Ladder } from "@/components/colleges/viz";
import { BarChart as MentorshipBarChart, Sparkline as MentorshipSparkline, GoalTrack, Histogram, ShareBar } from "@/components/connect/mentorship/charts";
import { PayMap } from "@/components/career/PayMap";
import { Ring as PlanMapRing } from "@/components/counselor/v2/PlanMap";
import { RankBar } from "@/components/counselor/v2/overviewShared";
import { RankedBars } from "@/components/counselor/v2/CareerCollegeInsights";
import { Sparkline as EngagementSparkline, LoginsChart, SiteBars } from "@/components/counselor/v2/PlatformEngagement";
import { BarRow } from "@/components/counselor/v2/MyImpact";
import { DrillBar } from "@/components/counselor/v2/Drill";
import { Users } from "lucide-react";

export function ChartsSection() {
  return (
    <Section
      id="charts"
      title="Charts"
      intro="Every chart in the app: all pure props, no store reads, no navigation, safe to drop anywhere. Realistic mock data, plus sparse and all-zero cells and the playbook's proposed empty/loading defaults where a chart doesn't have its own yet."
    >
      <Specimen name="AreaChart" file="src/components/connect/viz.tsx" purpose="A filled trend line over time, e.g. a volunteer's monthly reach." when="Connect's volunteer and partner dashboards.">
        <StateGrid>
          <StateCell label="Default"><AreaChart points={[12, 18, 14, 22, 30, 26, 34, 40, 38, 45, 50, 58]} accent="var(--primary)" labels={["Jan", "Jun", "Dec"]} /></StateCell>
          <StateCell label="Sparse data"><AreaChart points={[10, 24]} accent="var(--primary)" labels={["Jan", "", "Feb"]} /></StateCell>
          <StateCell label="All zeros"><AreaChart points={[0, 0, 0, 0, 0, 0]} accent="var(--primary)" labels={["Jan", "Mar", "Jun"]} /></StateCell>
          <StateCell label="Empty" kind="proposed"><ProposedEmpty tier={3} line="No activity for this period yet." /></StateCell>
          <StateCell label="Loading" kind="proposed"><ProposedLoading shape="list" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BarChart (Connect)" file="src/components/connect/viz.tsx" purpose="Grouped bars for comparing a metric across categories or over time, segmented or solid, with an optional target band." when="Connect's volunteer/partner dashboards and any district-benchmark comparison.">
        <StateGrid min={280}>
          <StateCell label="Default">
            <ConnectBarChart groups={["Sep", "Oct", "Nov", "Dec"]} series={[{ label: "Answered", accent: "var(--primary)", values: [62, 74, 68, 81] }]} />
          </StateCell>
          <StateCell label="With target line">
            <ConnectBarChart groups={["Sep", "Oct", "Nov", "Dec"]} series={[{ label: "Answered", accent: "var(--primary)", values: [62, 74, 68, 81] }]} targetLine={{ value: 75, label: "District goal" }} />
          </StateCell>
          <StateCell label="Sparse data">
            <ConnectBarChart groups={["Nov"]} series={[{ label: "Answered", accent: "var(--primary)", values: [68] }]} />
          </StateCell>
          <StateCell label="All zeros">
            <ConnectBarChart groups={["Sep", "Oct", "Nov"]} series={[{ label: "Answered", accent: "var(--primary)", values: [0, 0, 0] }]} />
          </StateCell>
          <StateCell label="Empty" kind="proposed"><ProposedEmpty tier={3} line="No data for this period yet." /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Ring, SegmentedRing, Meter, MetricTile" file="src/components/connect/viz.tsx" purpose="A single-value ring, a multi-segment ring for a breakdown, a compact inline meter, and a labelled metric tile with a trend arrow." when="Any dashboard summary card.">
        <StateGrid>
          <StateCell label="Ring"><Ring pct={72} accent="var(--primary)"><span className="text-[15px] font-extrabold">72%</span></Ring></StateCell>
          <StateCell label="Ring, all zero"><Ring pct={0} accent="var(--primary)"><span className="text-[15px] font-extrabold">0%</span></Ring></StateCell>
          <StateCell label="SegmentedRing"><SegmentedRing segments={[{ value: 62, color: "var(--primary)" }, { value: 24, color: "#7dd3fc" }, { value: 14, color: "#f5c04e" }]}><span className="text-[13px] font-bold">100</span></SegmentedRing></StateCell>
          <StateCell label="Meter"><Meter value={7} max={10} accent="var(--primary)" label="Check-ins" /></StateCell>
          <StateCell label="Meter, all zero"><Meter value={0} max={10} accent="var(--primary)" label="Check-ins" /></StateCell>
          <StateCell label="MetricTile"><MetricTile icon={Users} value="1,286" label="Students reached" delta={12} accent="var(--primary)" /></StateCell>
          <StateCell label="MetricTile, negative delta"><MetricTile icon={Users} value="640" label="Students reached" delta={-6} accent="var(--primary)" /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Donut, SplitBar, RangeBar, Ladder" file="src/components/colleges/viz.tsx" purpose="College detail's own chart language: a ring of who is there, a two-way split bar, a range strip for a test-score band, and a pay ladder." when="College detail pages only.">
        <StateGrid>
          <StateCell label="Donut"><Donut parts={[{ label: "Women", pct: 54 }, { label: "Men", pct: 44 }, { label: "Nonbinary", pct: 2 }]} /></StateCell>
          <StateCell label="Donut, folded" note="Groups under `fold`% collapse into Other."><Donut parts={[{ label: "White", pct: 40 }, { label: "Asian", pct: 30 }, { label: "Hispanic", pct: 20 }, { label: "Black", pct: 5 }, { label: "Two or more", pct: 3 }, { label: "International", pct: 2 }]} /></StateCell>
          <StateCell label="SplitBar"><SplitBar title="Full-time vs part-time" a={{ label: "Full-time", value: 82 }} b={{ label: "Part-time", value: 18 }} /></StateCell>
          <StateCell label="RangeBar"><RangeBar label="SAT (middle 50%)" lo={1180} hi={1380} max={1600} note="of students who submitted scores" /></StateCell>
          <StateCell label="Ladder"><Ladder rows={[{ label: "Under $30,000", value: 16343 }, { label: "$30,000 to $48,000", value: 16210, top: true }, { label: "Over $110,000", value: 35016 }]} ceiling={40000} format={(n) => `$${n.toLocaleString("en-US")}`} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BarChart, Sparkline, GoalTrack, Histogram, ShareBar" file="src/components/connect/mentorship/charts.tsx" purpose="The mentorship dashboard's hand-drawn chart set: a labelled bar chart, a compact trend line, a goal-vs-pace track, a distribution histogram, and a stacked share bar." when="Connect's mentorship pairing dashboard only.">
        <StateGrid min={280}>
          <StateCell label="BarChart"><MentorshipBarChart values={[3, 5, 4, 6]} labels={["Sep", "Oct", "Nov", "Dec"]} accent="var(--primary)" unit="hours" ariaLabel="Hours logged by month" /></StateCell>
          <StateCell label="BarChart, all zero"><MentorshipBarChart values={[0, 0, 0]} labels={["Sep", "Oct", "Nov"]} accent="var(--primary)" unit="hours" ariaLabel="Hours logged by month" /></StateCell>
          <StateCell label="Sparkline"><MentorshipSparkline values={[3, 5, 4, 6, 7, 6, 8]} accent="var(--primary)" /></StateCell>
          <StateCell label="GoalTrack"><GoalTrack logged={7} target={10} pace={6} accent="var(--primary)" unit="hours" /></StateCell>
          <StateCell label="Histogram"><Histogram values={[2, 5, 8, 3]} labels={["0-1", "2-3", "4-5", "6+"]} accent="var(--primary)" ariaLabel="Meetings completed distribution" /></StateCell>
          <StateCell label="ShareBar"><ShareBar parts={[{ label: "On track", value: 62 }, { label: "Needs attention", value: 24 }, { label: "At risk", value: 14 }]} accent="var(--primary)" /></StateCell>
          <StateCell label="Empty" kind="proposed"><ProposedEmpty tier={3} line="No pairs logged yet." /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="PayMap" file="src/components/career/PayMap.tsx" purpose="Whole-country pay by state for a career, shaded in the career's world accent, hover/focus/tap a state for its figure." when="Career detail's Pay tab.">
        <StateGrid min={320}>
          <StateCell label="Default" pad={false} minH={220}>
            <PayMap typical="$96,000/year" rows={[{ state: "California", pay: "$118,000" }, { state: "Texas", pay: "$91,000" }, { state: "New York", pay: "$112,000" }]} yourState="New Jersey" accent="var(--primary)" seed="software-engineer" />
          </StateCell>
          <StateCell label="Sparse data" note="One real figure; every other state falls back to the typical pay with a small seeded spread." pad={false} minH={220}>
            <PayMap typical="$52,000/year" rows={[{ state: "Ohio", pay: "$54,000" }]} accent="var(--primary)" seed="welder" />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Ring (counselor Plan Map)" file="src/components/counselor/v2/PlanMap.tsx" purpose="A small percent-complete ring, the roadmap's own scale (no children slot)." when="Counselor v2's Plan Map only.">
        <StateGrid>
          <StateCell label="Default"><PlanMapRing pct={64} /></StateCell>
          <StateCell label="Complete"><PlanMapRing pct={100} /></StateCell>
          <StateCell label="All zero"><PlanMapRing pct={0} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="RankBar, RankedBars, DrillBar" file="src/components/counselor/v2/overviewShared.tsx, src/components/counselor/v2/CareerCollegeInsights.tsx, src/components/counselor/v2/Drill.tsx" purpose="Counselor Overview's row bars: a single value-vs-target bar, a ranked list of bars for top careers/colleges, and the plain animated bar Drill panels use." when="Counselor Dashboard v2's Overview and Drill panels.">
        <StateGrid>
          <StateCell label="RankBar, on target"><RankBar value={82} target={80} /></StateCell>
          <StateCell label="RankBar, below target" note="Colors only when a target is missed or near."><RankBar value={58} target={80} /></StateCell>
          <StateCell label="RankedBars"><RankedBars items={[{ name: "Software Engineer", count: 42 }, { name: "Registered Nurse", count: 31 }, { name: "Business Analyst", count: 19 }]} /></StateCell>
          <StateCell label="DrillBar"><DrillBar pct={70} /></StateCell>
          <StateCell label="DrillBar, all zero"><DrillBar pct={0} /></StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="Sparkline, LoginsChart, SiteBars" file="src/components/counselor/v2/PlatformEngagement.tsx" purpose="Platform Engagement's own chart set: a tiny inline trend line, the full logins-over-time chart with a hover tooltip, and a per-site login comparison." when="Counselor v2's Platform Engagement screen only.">
        <StateGrid min={280}>
          <StateCell label="Sparkline"><EngagementSparkline values={[420, 460, 505, 480, 560, 610, 591]} /></StateCell>
          <StateCell label="LoginsChart" pad={false} minH={280}>
            <div style={{ width: "100%", padding: "var(--space-4)" }}>
              <LoginsChart data={[
                { label: "Jul", total: 512, unique: 92, avg: 5.57 },
                { label: "Aug", total: 589, unique: 101, avg: 5.83 },
                { label: "Sep", total: 623, unique: 98, avg: 6.36 },
              ]} />
            </div>
          </StateCell>
          <StateCell label="SiteBars">
            <SiteBars sites={[{ site: "Career Explorer", total: 623, unique: 98 }, { site: "Academic Planner", total: 389, unique: 84 }, { site: "College Finder", total: 241, unique: 61 }]} />
          </StateCell>
        </StateGrid>
      </Specimen>

      <Specimen name="BarRow (My Impact)" file="src/components/counselor/v2/MyImpact.tsx" purpose="One labelled progress row with an optional benchmark tick, My Impact's own bar shape." when="Counselor v2's My Impact screen only.">
        <StateGrid>
          <StateCell label="Default"><BarRow label="Academic plans submitted" value="86%" pct={86} tick={80} /></StateCell>
          <StateCell label="Muted"><BarRow label="Career reports viewed" value="n/a" pct={0} muted /></StateCell>
        </StateGrid>
      </Specimen>
    </Section>
  );
}
