// Core domain types for the Academy Retention Command Center.

export type YearOfCollege = 1 | 2 | 3 | 4;

export type CollegeTier = "NIT/IIIT" | "Tier-2" | "Tier-3";

export type Language = "Telugu" | "Hindi" | "Tamil" | "Malayalam";

// Blended "lead source" (initiator + marketing channel, as a real edtech CRM
// tracks it). Acquisition source predicts retention: high-intent sources
// (organic/referral/student-led) retain best; broad paid (Instagram/InMobi) and
// counselor-pushed signups are the most fragile.
export type AcquisitionSource =
  | "Organic"
  | "Referral"
  | "Student-led"
  | "Google Ads"
  | "YouTube Ads"
  | "Parent-led"
  | "Instagram Ads"
  | "College counselor"
  | "InMobi";

// All sources, ordered high-intent → low-intent (used for iteration + ordering).
export const ACQUISITION_SOURCES: AcquisitionSource[] = [
  "Referral",
  "Organic",
  "Student-led",
  "Google Ads",
  "YouTube Ads",
  "Parent-led",
  "Instagram Ads",
  "College counselor",
  "InMobi",
];

export type StudentStatus = "active" | "at-risk" | "paused" | "churned";

// The stakeholder decision unit (Kunal framing). Who actually drove a dropout.
export type Stakeholder =
  | "student"
  | "parents"
  | "family WhatsApp"
  | "college peers";

// The 7-event Academy dropout calendar.
export type DropoutEvent =
  | "Onboarding cliff"
  | "Drift zone"
  | "Internal exams"
  | "Semester break"
  | "Internship season"
  | "Peer contagion"
  | "Pre-placement nerves";

export interface RiskFactor {
  label: string;
  // points contributed to the 0-100 churn-risk score
  points: number;
}

export interface Student {
  id: string;
  name: string;
  college: string;
  collegeTier: CollegeTier;
  state: string;
  language: Language;
  year: YearOfCollege;
  acquisition: AcquisitionSource;
  // weeks since enrollment (0 = just joined)
  weeksEnrolled: number;
  mentorPod: string;
  currentStreak: number;
  // days since last active (0 = active today)
  daysSinceActive: number;
  projectsCompleted: number;
  lastProject: string;
  rankInCollege: number;
  collegeCohortSize: number;
  attendanceRate: number; // 0-1
  // days until this student's next college internal exam (negative = none soon)
  daysToExam: number;
  examModeOn: boolean;
  parentReportOpened: boolean;
  parentResponded: boolean;
  status: StudentStatus;
  churnRiskScore: number; // 0-100
  riskFactors: RiskFactor[];
  // for churned students only: who originated the decision
  dropoutStakeholder?: Stakeholder;
  // peer-cluster: ids of same-college batchmates who recently paused
  pausedBatchmates: number;
}

export interface RetentionPoint {
  week: number;
  retained: number; // 0-100 (%)
}

export interface SegmentedCurve {
  label: string;
  color: string;
  data: RetentionPoint[];
}

export type SegmentDimension = "year" | "tier" | "language" | "acquisition";

export interface CalendarEventBar {
  event: DropoutEvent;
  // approximate month on the Academy timeline where it bites
  month: number;
  churnRate: number; // 0-100 relative intensity
  note: string;
}

export interface StakeholderSlice {
  stakeholder: Stakeholder;
  count: number;
  pct: number;
}

export interface PeerCluster {
  college: string;
  state: string;
  pausedCount: number;
  atRiskStudents: Student[];
}

export interface Kpi {
  label: string;
  value: string;
  sub: string;
  tone: "good" | "warn" | "bad" | "neutral";
}

// Shape returned by /api/report-card
export interface ReportCard {
  language: Language;
  message: string; // regional-language WhatsApp message
  translation: string; // English translation
  source: "llm" | "fallback";
}
