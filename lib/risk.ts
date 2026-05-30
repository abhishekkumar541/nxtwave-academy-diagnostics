import type { AcquisitionSource, RiskFactor, Student } from "./types";

// Transparent, explainable churn-risk heuristic (0-100).
// Deliberately NOT a black box — every point is attributable to a factor,
// so it can be defended to a data/analytics interviewer.
//
// Weights reflect the Academy dropout calendar + 5-stakeholder thesis:
//   - exam proximity is the #1 predictable trigger
//   - a broken streak / inactivity signals the drift zone
//   - peer-cluster contagion is the signature collectivist signal
//   - parent disengagement removes the accountability partner
//   - low attendance compounds everything

export interface RiskInput {
  daysToExam: number;
  daysSinceActive: number;
  currentStreak: number;
  pausedBatchmates: number;
  parentReportOpened: boolean;
  parentResponded: boolean;
  attendanceRate: number;
  weeksEnrolled: number;
  acquisition: AcquisitionSource;
}

export function scoreRisk(s: RiskInput): { score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];

  // 1. Internal exam proximity (the #1 trigger). Within 14 days = hot zone.
  if (s.daysToExam >= 0 && s.daysToExam <= 7) {
    factors.push({ label: "Internal exams within 7 days", points: 26 });
  } else if (s.daysToExam > 7 && s.daysToExam <= 14) {
    factors.push({ label: "Internal exams within 2 weeks", points: 16 });
  }

  // 2. Inactivity / drift.
  if (s.daysSinceActive >= 10) {
    factors.push({ label: `Inactive ${s.daysSinceActive} days`, points: 24 });
  } else if (s.daysSinceActive >= 5) {
    factors.push({ label: `Inactive ${s.daysSinceActive} days`, points: 14 });
  } else if (s.daysSinceActive >= 3) {
    factors.push({ label: `Inactive ${s.daysSinceActive} days`, points: 7 });
  }

  // 3. Broken / fragile streak.
  if (s.currentStreak === 0) {
    factors.push({ label: "Streak broken", points: 12 });
  } else if (s.currentStreak < 3) {
    factors.push({ label: "Fragile streak (<3 days)", points: 6 });
  }

  // 4. Peer-cluster contagion (collectivist signal).
  if (s.pausedBatchmates >= 2) {
    factors.push({
      label: `${s.pausedBatchmates} batchmates paused recently`,
      points: 20,
    });
  } else if (s.pausedBatchmates === 1) {
    factors.push({ label: "1 batchmate paused recently", points: 8 });
  }

  // 5. Parent disengagement (lost the accountability partner).
  if (!s.parentReportOpened) {
    factors.push({ label: "Parent not opening reports", points: 12 });
  } else if (!s.parentResponded) {
    factors.push({ label: "Parent opens but never responds", points: 5 });
  }

  // 6. Low attendance compounds.
  if (s.attendanceRate < 0.4) {
    factors.push({ label: "Attendance below 40%", points: 14 });
  } else if (s.attendanceRate < 0.6) {
    factors.push({ label: "Attendance 40-60%", points: 7 });
  }

  // 7. Early-tenure fragility (first 6 weeks = onboarding cliff + drift).
  if (s.weeksEnrolled <= 6) {
    factors.push({ label: "Still in first 6 weeks (fragile)", points: 6 });
  }

  // 8. Acquisition / lead source — low-intent paid channels (InMobi, Instagram)
  // and counselor-pushed signups are the most fragile; organic/referral/student-led
  // are protective (no points).
  const acqPoints: Record<string, number> = {
    InMobi: 12,
    "College counselor": 10,
    "Instagram Ads": 8,
    "YouTube Ads": 4,
    "Parent-led": 4,
    "Google Ads": 2,
  };
  const acqPts = acqPoints[s.acquisition] ?? 0;
  if (acqPts > 0) {
    factors.push({ label: `Low-intent source: ${s.acquisition}`, points: acqPts });
  }

  const raw = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.min(100, raw);
  return { score, factors };
}

export function riskBand(score: number): "high" | "med" | "low" {
  if (score >= 55) return "high";
  if (score >= 30) return "med";
  return "low";
}

export function recommendedAction(s: Student): string {
  if (s.daysToExam >= 0 && s.daysToExam <= 14) {
    return "Turn on Exam Mode — pause streak, switch to 10-min revision, schedule re-onboarding for the day exams end.";
  }
  if (s.pausedBatchmates >= 2) {
    return "Peer-cluster save: mentor reaches out individually today — \"a few of your batchmates paused, I want to make sure you have what you need.\"";
  }
  if (!s.parentReportOpened) {
    return "Send a Maa-Baap report card in " + s.language + " — re-activate the parent as accountability partner.";
  }
  if (s.daysSinceActive >= 5) {
    return "Hot-state re-entry nudge + a 1-problem gentle restart; surface their best past project to rebuild confidence.";
  }
  return "Keep warm: implementation-intention nudge for the week + celebrate the next milestone publicly.";
}
