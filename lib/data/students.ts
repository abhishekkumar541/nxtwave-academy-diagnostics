import { scoreRisk, riskBand } from "../risk";
import type {
  AcquisitionSource,
  CollegeTier,
  Language,
  Stakeholder,
  Student,
  StudentStatus,
  YearOfCollege,
} from "../types";

// ---------------------------------------------------------------------------
// Deterministic seeded RNG (mulberry32) so the demo is IDENTICAL every run.
// A rehearsed demo must never reshuffle its numbers.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260529);
const rand = () => rng();
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randint = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
const chance = (p: number) => rand() < p;
// Weighted pick: pairs of [value, weight]. Weights need not sum to 1.
function pickWeighted<T>(pairs: [T, number][]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}

// ---------------------------------------------------------------------------
// Acquisition / lead-source model. One blended list (initiator + channel) the
// way an edtech CRM tracks it. Retention correlations baked in: high-intent
// sources (organic/referral/student-led) retain best; broad paid (Instagram /
// InMobi) and counselor-pushed signups churn most.
// ---------------------------------------------------------------------------
// Realistic paid-heavy volume mix (weights need not sum to 1).
const ACQ_WEIGHTS: [AcquisitionSource, number][] = [
  ["Instagram Ads", 0.18],
  ["Google Ads", 0.16],
  ["InMobi", 0.12],
  ["YouTube Ads", 0.1],
  ["Organic", 0.1],
  ["Referral", 0.1],
  ["College counselor", 0.1],
  ["Parent-led", 0.08],
  ["Student-led", 0.06],
];
// Attendance lift/drag (added to the 0.45 baseline).
const ACQ_ATTENDANCE_LIFT: Record<AcquisitionSource, number> = {
  Referral: 0.1,
  Organic: 0.1,
  "Student-led": 0.1,
  "Google Ads": 0.03,
  "YouTube Ads": 0,
  "Parent-led": 0,
  "Instagram Ads": -0.06,
  "College counselor": -0.1,
  InMobi: -0.12,
};
// Leaving-propensity contribution (added to the base churn probability L).
const ACQ_LEAVE_DRAG: Record<AcquisitionSource, number> = {
  Organic: -0.06,
  Referral: -0.06,
  "Student-led": -0.05,
  "Google Ads": 0.0,
  "YouTube Ads": 0.03,
  "Parent-led": 0.02,
  "Instagram Ads": 0.12,
  "College counselor": 0.13,
  InMobi: 0.17,
};
// Parent-engagement base rate by source (parent-led highest; student-led/organic lowest).
const ACQ_PARENT_BASE: Record<AcquisitionSource, number> = {
  "Parent-led": 0.7,
  Referral: 0.6,
  "College counselor": 0.55,
  "Google Ads": 0.52,
  "Instagram Ads": 0.5,
  "YouTube Ads": 0.5,
  InMobi: 0.5,
  Organic: 0.45,
  "Student-led": 0.42,
};

// ---------------------------------------------------------------------------
// Believable Bharat data pools.
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Rakesh", "Ravi", "Sai", "Praveen", "Naveen", "Karthik", "Vivek", "Aravind",
  "Manoj", "Sandeep", "Harish", "Suresh", "Ganesh", "Vamsi", "Teja", "Yashwanth",
  "Sneha", "Divya", "Lakshmi", "Priya", "Anjali", "Swathi", "Keerthi", "Bhavana",
  "Deepak", "Rahul", "Aakash", "Mahesh", "Nikhil", "Charan", "Pavan", "Dinesh",
];
const LAST_NAMES = [
  "Reddy", "Naidu", "Kumar", "Rao", "Goud", "Yadav", "Sharma", "Verma",
  "Patnaik", "Chowdary", "Babu", "Krishna", "Murthy", "Prasad", "Singh", "Das",
];

interface CollegeSeed {
  name: string;
  tier: CollegeTier;
  state: string;
  lang: Language;
}
const COLLEGES: CollegeSeed[] = [
  { name: "Vignan Institute, Guntur", tier: "Tier-3", state: "Andhra Pradesh", lang: "Telugu" },
  { name: "Sasi Engg College, Tanuku", tier: "Tier-3", state: "Andhra Pradesh", lang: "Telugu" },
  { name: "CVR College, Hyderabad", tier: "Tier-2", state: "Telangana", lang: "Telugu" },
  { name: "Vasavi College, Hyderabad", tier: "Tier-2", state: "Telangana", lang: "Telugu" },
  { name: "IIIT Nuzvid", tier: "NIT/IIIT", state: "Andhra Pradesh", lang: "Telugu" },
  { name: "Kongu Engg, Erode", tier: "Tier-3", state: "Tamil Nadu", lang: "Tamil" },
  { name: "PSG Tech, Coimbatore", tier: "Tier-2", state: "Tamil Nadu", lang: "Tamil" },
  { name: "NIT Trichy", tier: "NIT/IIIT", state: "Tamil Nadu", lang: "Tamil" },
  { name: "Govt Engg College, Patna", tier: "Tier-3", state: "Bihar", lang: "Hindi" },
  { name: "MMMUT, Gorakhpur", tier: "Tier-3", state: "Uttar Pradesh", lang: "Hindi" },
  { name: "KIET Ghaziabad", tier: "Tier-2", state: "Uttar Pradesh", lang: "Hindi" },
  { name: "TKM College, Kollam", tier: "Tier-2", state: "Kerala", lang: "Malayalam" },
];

const PROJECTS = [
  "a calculator app", "a tic-tac-toe game", "a weather app", "a to-do list",
  "a portfolio website", "a quiz app", "a tip calculator", "a notes app",
  "a number-guessing game", "a unit converter", "a digital clock", "a expense tracker",
];

const MENTOR_PODS = ["Pod-Arjuna", "Pod-Bheema", "Pod-Karna", "Pod-Drona", "Pod-Eklavya", "Pod-Surya"];

const STAKEHOLDERS: Stakeholder[] = [
  "student", "parents", "family WhatsApp", "college peers",
];

// ---------------------------------------------------------------------------
// Generate the cohort. ~300 students, with realistic correlations baked in so
// the dashboards tell the right story (exams/inactivity/peer-cluster drive risk).
// ---------------------------------------------------------------------------
function generate(): Student[] {
  const students: Student[] = [];
  const TOTAL = 300;

  // Track leavers per BATCH (college + year) so peer-cluster contagion is a
  // meaningful subgroup (~8-12 students), not the whole college.
  const batchPauses: Record<string, number> = {};
  const batchKey = (college: string, year: number) => `${college}::${year}`;

  // Each college gets a deterministic "fragility" shock so leavers CLUSTER in
  // certain colleges — that's what makes the peer-contagion signal real and the
  // "≥2 batchmates paused" insight statistically validatable (not random noise).
  const collegeFragility: Record<string, number> = {};
  for (const c of COLLEGES) {
    collegeFragility[c.name] = pickWeighted<number>([
      [0, 0.58], // most colleges: no contagion shock
      [0.16, 0.25],
      [0.34, 0.17], // a few highly fragile colleges concentrate the leavers
    ]);
  }

  for (let i = 0; i < TOTAL; i++) {
    const col = pick(COLLEGES);
    const year = pick<YearOfCollege>([1, 2, 2, 3, 3, 4]); // 2nd/3rd-years over-represented (Academy reality)
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const weeksEnrolled = randint(1, 130);

    // Exam proximity: ~1 in 4 students near an internal exam window.
    const nearExam = chance(0.26);
    const daysToExam = nearExam ? randint(0, 14) : randint(20, 90);

    // Acquisition / lead source (blended initiator + channel). Drives retention
    // via the maps above: high-intent sources retain; broad paid + counselor churn.
    const acquisition = pickWeighted<AcquisitionSource>(ACQ_WEIGHTS);
    const acqLift = ACQ_ATTENDANCE_LIFT[acquisition];

    // Baseline engagement skewed by tier (NIT/IIIT students slightly more self-driven).
    const tierLift =
      col.tier === "NIT/IIIT" ? 0.12 : col.tier === "Tier-2" ? 0.04 : 0;

    const attendanceRate = Math.max(
      0.1,
      Math.min(0.98, 0.45 + tierLift + acqLift + (rand() - 0.5) * 0.5)
    );

    // Parent engagement: the accountability lever, varies by source.
    const parentBase = ACQ_PARENT_BASE[acquisition];
    const parentReportOpened = chance(parentBase + tierLift);
    const parentResponded = parentReportOpened && chance(0.45);

    const projectsCompleted = Math.max(
      0,
      Math.round((weeksEnrolled / 2) * attendanceRate + (rand() - 0.5) * 4)
    );

    const collegeCohortSize = randint(8, 34);
    const rankInCollege = randint(1, collegeCohortSize);

    students.push({
      id: `NW-${1000 + i}`,
      name,
      college: col.name,
      collegeTier: col.tier,
      state: col.state,
      language: col.lang,
      year,
      acquisition,
      weeksEnrolled,
      mentorPod: pick(MENTOR_PODS),
      projectsCompleted,
      lastProject: pick(PROJECTS),
      rankInCollege,
      collegeCohortSize,
      attendanceRate,
      daysToExam,
      examModeOn: false,
      parentReportOpened,
      parentResponded,
      status: "active", // set in the propensity pass below
      churnRiskScore: 0, // set in the final pass
      riskFactors: [],
      daysSinceActive: 0, // set after status (status drives inactivity)
      currentStreak: 0, // set after status
      pausedBatchmates: 0, // set after status
    });
  }

  // Leaving-propensity pass: decide who has left (paused|churned) from UPSTREAM
  // behavioral/segment factors — independent of the displayed churnRiskScore, so
  // validating insights against this outcome is non-circular. These same factors
  // are what the insight engine will re-discover and statistically confirm.
  for (const s of students) {
    let L = 0.04;
    if (!s.parentReportOpened) L += 0.13; // lost accountability partner
    if (s.daysToExam <= 14) L += 0.16; // internal-exam pause that never resumes (#1 trigger)
    if (s.attendanceRate < 0.5) L += 0.11;
    L += ACQ_LEAVE_DRAG[s.acquisition]; // lead-source intent → churn propensity
    if (s.weeksEnrolled <= 6) L += 0.05; // onboarding-cliff fragility
    L += collegeFragility[s.college]; // contagion shock → clusters
    L += (rand() - 0.5) * 0.04; // noise
    L = Math.max(0.01, Math.min(0.75, L));

    if (chance(L)) {
      s.status = chance(0.4) ? "churned" : "paused";
      const k = batchKey(s.college, s.year);
      batchPauses[k] = (batchPauses[k] || 0) + 1;
    }
  }

  // Attribute the dropout decision across the 4-stakeholder unit for everyone who
  // has left or is mid-leaving (paused + churned). We deal from a fixed-proportion
  // deck so the collectivist story (3 of 4 are NOT the student) always reads
  // cleanly regardless of sample size — student ~17%, the other three dominate.
  const DECK: Stakeholder[] = [
    "parents", "parents", "parents", "parents", "parents",
    "college peers", "college peers", "college peers",
    "family WhatsApp", "family WhatsApp",
    "student", "student",
  ];
  const leaving = students.filter((s) => s.status === "paused" || s.status === "churned");
  leaving.forEach((s, idx) => {
    s.dropoutStakeholder = DECK[idx % DECK.length];
  });

  // Peer-cluster exposure for EVERY student = OTHER leavers in their batch
  // (college + year). Computed for all (not just survivors) so the contagion
  // correlation is honest: leavers in fragile batches also carry high exposure →
  // the "≥2 batchmates paused" insight validates against the real leaving outcome.
  for (const s of students) {
    const left = s.status === "paused" || s.status === "churned";
    const othersGone = (batchPauses[batchKey(s.college, s.year)] || 0) - (left ? 1 : 0);
    s.pausedBatchmates = Math.max(0, Math.min(6, othersGone));
  }

  // Status drives inactivity (keeps daysSinceActive coherent with status).
  for (const s of students) {
    if (s.status === "churned") s.daysSinceActive = randint(30, 70);
    else if (s.status === "paused") s.daysSinceActive = randint(14, 28);
    else {
      // Active: mild behavioral drift, capped below the pause threshold.
      if (s.attendanceRate < 0.5 && chance(0.4)) s.daysSinceActive = randint(2, 8);
      else if (s.daysToExam <= 14 && chance(0.4)) s.daysSinceActive = randint(2, 7);
      else s.daysSinceActive = chance(0.7) ? 0 : randint(1, 3);
    }
    s.currentStreak =
      s.daysSinceActive > 1 ? 0 : randint(0, Math.min(60, s.weeksEnrolled * 3));
  }

  // Final pass: score risk + set at-risk status for active students.
  for (const s of students) {
    const { score, factors } = scoreRisk({
      daysToExam: s.daysToExam,
      daysSinceActive: s.daysSinceActive,
      currentStreak: s.currentStreak,
      pausedBatchmates: s.pausedBatchmates,
      parentReportOpened: s.parentReportOpened,
      parentResponded: s.parentResponded,
      attendanceRate: s.attendanceRate,
      weeksEnrolled: s.weeksEnrolled,
      acquisition: s.acquisition,
    });
    s.churnRiskScore = score;
    s.riskFactors = factors.sort((a, b) => b.points - a.points);

    if (s.status === "active" && riskBand(score) === "high") {
      s.status = "at-risk";
    }
  }

  return students;
}

// Generate once at module load (deterministic).
export const STUDENTS: Student[] = generate();

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}
