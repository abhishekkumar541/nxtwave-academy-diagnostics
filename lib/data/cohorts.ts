import { STUDENTS } from "./students";
import { riskBand } from "../risk";
import type {
  CalendarEventBar,
  Kpi,
  PeerCluster,
  SegmentDimension,
  SegmentedCurve,
  StakeholderSlice,
  Student,
} from "../types";

// ---------------------------------------------------------------------------
// Retention curves, segmentable. Curves are SHAPED to tell the core story:
// 1st-years and final-years have completely different retention shapes, and
// tier-3 / regional cohorts retain worse than NIT-IIIT — never read blended.
// ---------------------------------------------------------------------------

// Each segment gets a (start, week-8 dip, long-run floor) profile.
// Numbers are illustrative cohort survival %, anchored to the doc thesis.
type Profile = { floor: number; dipWeek: number; dipDepth: number; decay: number };

const YEAR_PROFILES: Record<string, { label: string; color: string; p: Profile }> = {
  "1": { label: "1st-year", color: "#3366ff", p: { floor: 36, dipWeek: 6, dipDepth: 22, decay: 0.95 } },
  "2": { label: "2nd-year", color: "#f59e0b", p: { floor: 46, dipWeek: 10, dipDepth: 16, decay: 0.72 } },
  "3": { label: "3rd-year", color: "#8b5cf6", p: { floor: 54, dipWeek: 16, dipDepth: 13, decay: 0.55 } },
  "4": { label: "4th-year (final)", color: "#16a34a", p: { floor: 62, dipWeek: 22, dipDepth: 11, decay: 0.45 } },
};

const TIER_PROFILES: Record<string, { label: string; color: string; p: Profile }> = {
  "NIT/IIIT": { label: "NIT/IIIT", color: "#16a34a", p: { floor: 62, dipWeek: 8, dipDepth: 12, decay: 0.5 } },
  "Tier-2": { label: "Tier-2", color: "#f59e0b", p: { floor: 49, dipWeek: 8, dipDepth: 17, decay: 0.7 } },
  "Tier-3": { label: "Tier-3", color: "#dc2626", p: { floor: 36, dipWeek: 6, dipDepth: 24, decay: 0.95 } },
};

const LANG_PROFILES: Record<string, { label: string; color: string; p: Profile }> = {
  Telugu: { label: "Telugu", color: "#3366ff", p: { floor: 46, dipWeek: 8, dipDepth: 18, decay: 0.7 } },
  Hindi: { label: "Hindi", color: "#f59e0b", p: { floor: 41, dipWeek: 7, dipDepth: 20, decay: 0.8 } },
  Tamil: { label: "Tamil", color: "#16a34a", p: { floor: 50, dipWeek: 9, dipDepth: 16, decay: 0.65 } },
  Malayalam: { label: "Malayalam", color: "#8b5cf6", p: { floor: 52, dipWeek: 9, dipDepth: 15, decay: 0.6 } },
};

// Acquisition source is one of the most predictive segments: student-led signups
// carry intrinsic motivation and retain best; counselor-led (college tie-up,
// often without the student's own buy-in) is the most fragile. Parent-led starts
// strong then drifts once the student's own motivation has to carry it.
// Blended lead-source curves — high-intent (organic/referral/student-led) flatten
// high; broad paid (Instagram/InMobi) and counselor decay to a low floor.
const ACQ_PROFILES: Record<string, { label: string; color: string; p: Profile }> = {
  Referral: { label: "Referral", color: "#16a34a", p: { floor: 60, dipWeek: 9, dipDepth: 11, decay: 0.5 } },
  Organic: { label: "Organic", color: "#0ea5e9", p: { floor: 57, dipWeek: 9, dipDepth: 12, decay: 0.5 } },
  "Student-led": { label: "Student-led", color: "#3366ff", p: { floor: 56, dipWeek: 9, dipDepth: 12, decay: 0.55 } },
  "Google Ads": { label: "Google Ads", color: "#8b5cf6", p: { floor: 48, dipWeek: 8, dipDepth: 16, decay: 0.7 } },
  "YouTube Ads": { label: "YouTube Ads", color: "#f59e0b", p: { floor: 44, dipWeek: 8, dipDepth: 18, decay: 0.75 } },
  "Parent-led": { label: "Parent-led", color: "#eab308", p: { floor: 43, dipWeek: 8, dipDepth: 18, decay: 0.78 } },
  "Instagram Ads": { label: "Instagram Ads", color: "#ec4899", p: { floor: 38, dipWeek: 6, dipDepth: 22, decay: 0.9 } },
  "College counselor": { label: "Counselor", color: "#dc2626", p: { floor: 33, dipWeek: 5, dipDepth: 25, decay: 1.0 } },
  InMobi: { label: "InMobi", color: "#78716c", p: { floor: 30, dipWeek: 5, dipDepth: 27, decay: 1.05 } },
};

function buildCurve(p: Profile): { week: number; retained: number }[] {
  const pts = [];
  const weeks = [0, 1, 2, 4, 6, 8, 12, 16, 20, 26, 39, 52];
  for (const w of weeks) {
    // Start at 100, dip around dipWeek, then settle toward floor.
    const dip = p.dipDepth * Math.exp(-Math.pow(w - p.dipWeek, 2) / 40);
    const settle = p.floor + (100 - p.floor) * Math.exp(-w * 0.045 * p.decay);
    const retained = Math.max(p.floor, Math.round(settle - dip));
    pts.push({ week: w, retained: Math.min(100, retained) });
  }
  return pts;
}

export function getCurves(dim: SegmentDimension): SegmentedCurve[] {
  const profiles =
    dim === "year"
      ? YEAR_PROFILES
      : dim === "tier"
      ? TIER_PROFILES
      : dim === "acquisition"
      ? ACQ_PROFILES
      : LANG_PROFILES;
  return Object.values(profiles).map((v) => ({
    label: v.label,
    color: v.color,
    data: buildCurve(v.p),
  }));
}

// ---------------------------------------------------------------------------
// 7-event dropout calendar — churn intensity by event, on the Academy timeline.
// Visibly spikes at internal exams + semester break (the underdiagnosed ones).
// ---------------------------------------------------------------------------
export const DROPOUT_CALENDAR: CalendarEventBar[] = [
  { event: "Onboarding cliff", month: 0, churnRate: 64, note: "First 7 days: IDE/GitHub setup friction. Loss aversion hasn't kicked in." },
  { event: "Drift zone", month: 1, churnRate: 48, note: "Weeks 2-6: novelty wears off, '4 hrs/week' becomes 'this Sunday'." },
  { event: "Internal exams", month: 2, churnRate: 82, note: "College internals eat 2-3 weeks. Most who pause never resume. #1 trigger." },
  { event: "Semester break", month: 6, churnRate: 71, note: "They go home; routine collapses. No college rhythm = no NxtWave habit." },
  { event: "Internship season", month: 9, churnRate: 54, note: "2-month internship feels like 'making it'. NxtWave feels redundant." },
  { event: "Peer contagion", month: 11, churnRate: 60, note: "A college friend quits. Collectivist instinct: group identity breaks." },
  { event: "Pre-placement nerves", month: 20, churnRate: 57, note: "Mock-interview failures crush confidence. Quiet disappearance." },
];

// ---------------------------------------------------------------------------
// 5-stakeholder attribution (from churned students).
// ---------------------------------------------------------------------------
export function getStakeholderSlices(): StakeholderSlice[] {
  // Attribute over everyone who has left or is mid-leaving (paused + churned).
  const leaving = STUDENTS.filter(
    (s) => (s.status === "churned" || s.status === "paused") && s.dropoutStakeholder
  );
  const counts: Record<string, number> = {};
  for (const s of leaving) {
    counts[s.dropoutStakeholder!] = (counts[s.dropoutStakeholder!] || 0) + 1;
  }
  const total = leaving.length || 1;
  const order = ["student", "parents", "family WhatsApp", "college peers"] as const;
  return order.map((st) => ({
    stakeholder: st,
    count: counts[st] || 0,
    pct: Math.round(((counts[st] || 0) / total) * 100),
  }));
}

// ---------------------------------------------------------------------------
// KPI bar.
// ---------------------------------------------------------------------------
export function getKpis(): Kpi[] {
  const total = STUDENTS.length;
  const active = STUDENTS.filter((s) => s.status === "active").length;
  const atRisk = STUDENTS.filter((s) => s.status === "at-risk").length;
  const churned = STUDENTS.filter((s) => s.status === "churned").length;
  const paused = STUDENTS.filter((s) => s.status === "paused").length;

  // % resumed after exams — the highest-ROI Academy metric (synthetic baseline).
  const resumedAfterExams = 31;
  // Parent trust score: % of students whose parent opened AND responded.
  const parentTrust = Math.round(
    (STUDENTS.filter((s) => s.parentReportOpened && s.parentResponded).length / total) * 100
  );
  // CURR-Academy proxy: active-and-not-drifting share.
  const curr = Math.round((active / total) * 100);

  return [
    { label: "CURR-Academy", value: `${curr}%`, sub: "D-N → D-N+1 active return", tone: "neutral" },
    { label: "W4 retention", value: "47%", sub: "blended — read by cohort →", tone: "warn" },
    { label: "% resumed after exams", value: `${resumedAfterExams}%`, sub: "highest-ROI leading metric", tone: "bad" },
    { label: "Parent Trust Score", value: `${parentTrust}%`, sub: "opened + responded to report", tone: "warn" },
    { label: "At-risk now", value: `${atRisk}`, sub: `of ${total} students`, tone: "bad" },
    { label: "Paused / churned", value: `${paused + churned}`, sub: `${paused} paused · ${churned} churned`, tone: "bad" },
  ];
}

// ---------------------------------------------------------------------------
// Detect: save queue + peer clusters.
// ---------------------------------------------------------------------------
export function getSaveQueue(): Student[] {
  return STUDENTS
    .filter((s) => s.status === "active" || s.status === "at-risk")
    .filter((s) => s.churnRiskScore >= 30)
    .sort((a, b) => b.churnRiskScore - a.churnRiskScore);
}

export function getPeerClusters(): PeerCluster[] {
  const byCollege: Record<string, Student[]> = {};
  for (const s of STUDENTS) {
    (byCollege[s.college] ||= []).push(s);
  }
  const clusters: PeerCluster[] = [];
  for (const [college, list] of Object.entries(byCollege)) {
    const paused = list.filter((s) => s.status === "paused" || s.status === "churned");
    if (paused.length >= 2) {
      const atRisk = list
        .filter((s) => (s.status === "active" || s.status === "at-risk") && s.churnRiskScore >= 30)
        .sort((a, b) => b.churnRiskScore - a.churnRiskScore);
      if (atRisk.length > 0) {
        clusters.push({
          college,
          state: list[0].state,
          pausedCount: paused.length,
          atRiskStudents: atRisk.slice(0, 5),
        });
      }
    }
  }
  return clusters.sort((a, b) => b.pausedCount - a.pausedCount);
}

export function bandOf(score: number) {
  return riskBand(score);
}
