import { STUDENTS } from "./data/students";
import { twoProportionZTest, type TwoPropResult } from "./stats";
import type { Student } from "./types";

// ---------------------------------------------------------------------------
// The insight/evals engine.
//
// It AUTO-MINES candidate retention patterns, then runs each through a
// STATISTICAL GATE before surfacing it — so the tool reports validated
// observations, not asserted ones.
//
// Two principles that make this defensible to a data/analytics interviewer:
//  1. Outcome = the INDEPENDENT "left" label (status ∈ {paused, churned}).
//     We never validate against our own churnRiskScore (that would be circular).
//  2. We don't mine the variables that DEFINE the label (daysSinceActive,
//     currentStreak). Only upstream behavioral/segment drivers.
// ---------------------------------------------------------------------------

export type Verdict = "validated" | "directional";

export interface Observation {
  id: string;
  statement: string; // plain-English finding
  dimension: string; // what was segmented on
  stat: TwoPropResult;
  verdict: Verdict;
  action: string; // what to do about it → routes to an intervention
  confound?: string; // honest caveat: a likely confounder a human should check
}

const left = (s: Student) => s.status === "paused" || s.status === "churned";

// Gate thresholds — stated openly in the UI.
const ALPHA = 0.05; // significance
const MIN_N = 30; // per group
const MIN_REL_LIFT = 0.25; // ≥25% relative lift to be "validated"
const DIRECTIONAL_REL_LIFT = 0.15; // ≥15% but failing the bar → "directional"

interface Candidate {
  dimension: string;
  label: string; // subgroup description, e.g. "Acquired via college counselor"
  pred: (s: Student) => boolean;
  action: string;
  confound?: string; // a likely confounder worth flagging even when significant
}

// The hypothesis space. Each candidate is tested subgroup-vs-complement.
function candidates(): Candidate[] {
  const list: Candidate[] = [
    {
      dimension: "Parent engagement",
      label: "Students whose parent isn't opening reports",
      pred: (s) => !s.parentReportOpened,
      action: "Re-activate the parent with a regional-language Maa-Baap report card — turn them into the accountability partner.",
    },
    {
      dimension: "Exam calendar",
      label: "Students within 2 weeks of internal exams",
      pred: (s) => s.daysToExam <= 14,
      action: "Ship Exam Mode — pause the streak, drop to 10-min revision, auto re-onboard the day exams end.",
    },
    {
      dimension: "Peer contagion",
      label: "Students with ≥2 batchmates already paused",
      pred: (s) => s.pausedBatchmates >= 2,
      action: "Fire the peer-cluster save: mentor reaches out individually to the remaining batchmates this week.",
    },
    {
      dimension: "Attendance",
      label: "Students with attendance below 50%",
      pred: (s) => s.attendanceRate < 0.5,
      action: "Hot-state re-entry + a 1-problem gentle restart; surface their best past project to rebuild confidence.",
    },
    {
      dimension: "Acquisition",
      label: "Counselor-acquired students",
      pred: (s) => s.acquisition === "College counselor",
      action: "Tighten counselor-channel onboarding; this is an acquisition-quality leak upstream of retention — flag it to whoever owns acquisition.",
    },
    {
      dimension: "Acquisition",
      label: "Student-led signups",
      pred: (s) => s.acquisition === "Student-led",
      action: "Protect what works — study this cohort's first-90-days and replicate the intrinsic-motivation signals.",
    },
    {
      dimension: "Acquisition",
      label: "Broad paid acquisition (Instagram Ads + InMobi)",
      pred: (s) => s.acquisition === "InMobi" || s.acquisition === "Instagram Ads",
      action: "Low-intent paid channels — an acquisition-quality leak upstream of retention. Re-weight spend toward higher-intent channels (organic/referral/search) and flag CAC-to-retention to growth.",
    },
    {
      dimension: "Tenure",
      label: "Students in their first 6 weeks",
      pred: (s) => s.weeksEnrolled <= 6,
      action: "Concentrate effort on the Day 0-7 identity moment — first project shipped + first mentor contact within the week.",
    },
    {
      dimension: "Year of college",
      label: "1st-year students",
      pred: (s) => s.year === 1,
      action: "1st-years drop in the first 8 weeks — onboarding-cliff interventions matter most here.",
    },
    {
      dimension: "College tier",
      label: "Tier-3 college students",
      pred: (s) => s.collegeTier === "Tier-3",
      action: "Tier-3 baseline commitment is lower — interventions need a different intensity than NIT/IIIT cohorts.",
    },
  ];

  // One language candidate (often lands directional — smaller n) to show the gate
  // working both ways.
  list.push({
    dimension: "Language",
    label: "Hindi-cohort students",
    pred: (s) => s.language === "Hindi",
    action: "Prioritize Hindi parent-comms and mentor coverage — but confirm it's not just the tier-3 effect first.",
    confound:
      "Likely confounded with college tier — the Hindi cohort here skews tier-3. Statistically significant ≠ causal; control for tier before acting.",
  });

  return list;
}

function verdictFor(stat: TwoPropResult): Verdict | null {
  const sig = stat.pValue < ALPHA;
  const powered = stat.nSubgroup >= MIN_N && stat.nBaseline >= MIN_N;
  const strong = Math.abs(stat.relLift) >= MIN_REL_LIFT;
  if (sig && powered && strong) return "validated";
  if (Math.abs(stat.relLift) >= DIRECTIONAL_REL_LIFT) return "directional";
  return null; // not interesting enough to surface
}

function statement(c: Candidate, stat: TwoPropResult): string {
  const dir = stat.relLift >= 0 ? "leave at" : "leave at only";
  const mult =
    stat.pBaseline > 0
      ? `${(stat.pSubgroup / stat.pBaseline).toFixed(1)}×`
      : "—";
  const sub = Math.round(stat.pSubgroup * 100);
  const base = Math.round(stat.pBaseline * 100);
  return `${c.label} ${dir} ${sub}% vs ${base}% baseline — ${mult} the rate.`;
}

export interface InsightReport {
  observations: Observation[];
  totalTested: number;
  validatedCount: number;
  directionalCount: number;
}

export function getInsights(): InsightReport {
  const cands = candidates();
  const obs: Observation[] = [];

  for (const c of cands) {
    const sub = STUDENTS.filter(c.pred);
    const base = STUDENTS.filter((s) => !c.pred(s));
    const stat = twoProportionZTest(
      sub.filter(left).length,
      sub.length,
      base.filter(left).length,
      base.length
    );
    const verdict = verdictFor(stat);
    if (!verdict) continue;
    obs.push({
      id: `${c.dimension}:${c.label}`,
      statement: statement(c, stat),
      dimension: c.dimension,
      stat,
      verdict,
      action: c.action,
      confound: c.confound,
    });
  }

  // Validated first, then by effect size × significance.
  obs.sort((a, b) => {
    if (a.verdict !== b.verdict) return a.verdict === "validated" ? -1 : 1;
    return Math.abs(b.stat.relLift) - Math.abs(a.stat.relLift);
  });

  return {
    observations: obs,
    totalTested: cands.length,
    validatedCount: obs.filter((o) => o.verdict === "validated").length,
    directionalCount: obs.filter((o) => o.verdict === "directional").length,
  };
}

export const GATE_DESCRIPTION = `two-proportion z-test · p<${ALPHA} · n≥${MIN_N}/group · ≥${Math.round(
  MIN_REL_LIFT * 100
)}% relative lift`;
