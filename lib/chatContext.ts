import { STUDENTS } from "./data/students";
import {
  DROPOUT_CALENDAR,
  getCurves,
  getKpis,
  getPeerClusters,
  getSaveQueue,
  getStakeholderSlices,
} from "./data/cohorts";
import { getInsights } from "./insights";
import type { SegmentDimension } from "./types";

// Builds a COMPACT, token-lean JSON snapshot of the tool's live aggregates so the
// chat assistant can answer questions grounded in real numbers from THIS tool —
// never invented. Kept small on purpose (cost + latency for a live demo).

function curveFloors(dim: SegmentDimension) {
  return getCurves(dim).map((c) => ({
    seg: c.label,
    finalRetentionPct: c.data[c.data.length - 1].retained,
  }));
}

export function buildContext(): string {
  const kpis = getKpis().map((k) => ({ [k.label]: k.value }));
  const insights = getInsights();
  const counts = STUDENTS.reduce<Record<string, number>>((a, s) => {
    a[s.status] = (a[s.status] || 0) + 1;
    return a;
  }, {});

  const snapshot = {
    product:
      "NxtWave Academy Diagnostics — a retention command center for NxtWave's Academy program (a 2-3 year, ~4-hrs/week, parent-paid (~₹2L) coding program for tier 2/3 Indian college students). Loop: Diagnose → Detect → Intervene → validate (Insights).",
    dataNote: "All data is synthetic/illustrative, ~300 students.",
    counts,
    kpis,
    retentionFinalRetentionBySegment: {
      year: curveFloors("year"),
      tier: curveFloors("tier"),
      language: curveFloors("language"),
      acquisition: curveFloors("acquisition"),
    },
    dropoutCalendar: DROPOUT_CALENDAR.map((e) => ({
      event: e.event,
      approxMonth: e.month,
      churnIntensity: e.churnRate,
      note: e.note,
    })),
    stakeholderAttribution: getStakeholderSlices().map((s) => ({
      stakeholder: s.stakeholder,
      pct: s.pct,
    })),
    validatedInsights: insights.observations
      .filter((o) => o.verdict === "validated")
      .map((o) => ({
        finding: o.statement,
        dimension: o.dimension,
        relLiftPct: Math.round(o.stat.relLift * 100),
        pValue: Number(o.stat.pValue.toFixed(3)),
        nSubgroup: o.stat.nSubgroup,
        action: o.action,
        confound: o.confound,
      })),
    directionalInsights: insights.observations
      .filter((o) => o.verdict === "directional")
      .map((o) => ({
        finding: o.statement,
        whyNotValidated:
          o.stat.nSubgroup < 30
            ? `underpowered (n=${o.stat.nSubgroup})`
            : `weak/!significant (p=${o.stat.pValue.toFixed(2)})`,
      })),
    topAtRiskStudents: getSaveQueue()
      .slice(0, 8)
      .map((s) => ({
        name: s.name.split(" ")[0],
        college: s.college,
        year: s.year,
        language: s.language,
        acquisition: s.acquisition,
        riskScore: s.churnRiskScore,
        topFactor: s.riskFactors[0]?.label ?? "—",
      })),
    peerClusters: getPeerClusters()
      .slice(0, 4)
      .map((c) => ({
        college: c.college,
        paused: c.pausedCount,
        atRiskRemaining: c.atRiskStudents.length,
      })),
    interventionsAvailable: [
      "Exam Mode (pause streak + 10-min revision during college internals; re-onboard after) — targets the #1 trigger",
      "Maa-Baap Report Card (weekly regional-language WhatsApp update to the parent who paid)",
      "Dharma Cohorts (group streaks for collectivist peer accountability)",
      "Peer-cluster save (mentor outreach when ≥2 batchmates pause)",
    ],
  };

  return JSON.stringify(snapshot);
}
