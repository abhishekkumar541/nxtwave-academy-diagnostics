import type { DropoutEvent } from "./types";

// The intervention playbook — synthesized from a 5-expert panel (Kristen Berman,
// Nir Eyal, Kunal Shah, Jackson Shuttleworth, Hilary Gridley). Each play is
// grounded in a named behavioral mechanic and mapped to the dropout-calendar
// moment it targets, so the Intervene tab reads as a real operating playbook.

export type InterventionLayer =
  | "Habit"
  | "Product"
  | "Peer"
  | "Parent"
  | "Identity"
  | "AI Coach";

export type Effort = "Low" | "Medium" | "High";

export interface Intervention {
  id: string;
  name: string;
  tagline: string;
  layer: InterventionLayer;
  insight: string;
  mechanic: string; // the named behavioral mechanic
  inProduct: string; // how it literally appears
  targets: DropoutEvent[];
  expectedImpact: string;
  effort: Effort;
  novel: boolean; // NOVEL vs sharpened-existing
  expert: string; // attribution
}

export const INTERVENTIONS: Intervention[] = [
  {
    id: "daily-micro-hook",
    name: "Daily Micro-Hook — “Roj ka Code”",
    tagline: "A <2-min daily puzzle so a weekly class becomes a daily habit",
    layer: "Habit",
    insight:
      "A 4-hr/week cadence is a routine, not a habit — you can't wire automaticity weekly. Manufacture a daily sub-2-minute loop so the product earns a slot in everyday life between classes.",
    mechanic: "Hook Model (daily internal trigger → tiny action → variable reward → investment)",
    inProduct:
      "A daily push at the student's own phone-pickup time delivers one bite-sized puzzle / 1-question recall, doable on a low-end phone. Variable difficulty + a personal streak.",
    targets: ["Drift zone", "Onboarding cliff", "Semester break"],
    expectedImpact: "Daily active touch is the leading indicator of weekly-class attendance",
    effort: "Medium",
    novel: true,
    expert: "Nir Eyal",
  },
  {
    id: "week-streak",
    name: "Week Streak (“Weeks”)",
    tagline: "A weekly streak sized to real usage; loss aversion locks in at week 4–6",
    layer: "Habit",
    insight:
      "Loss aversion doesn't need daily cadence — it needs a consistent unit on a consistent cadence with a clear loss point. The threshold lands at week 4–6 — exactly the drift zone.",
    mechanic: "Loss aversion + goal-gradient (unit = 1 problem solved/week)",
    inProduct:
      "Full-screen “Week N” celebration after the week's first solved problem (number-led, not a flame — India UXR). Home-screen widget + icon badge. Localized 8-word rule.",
    targets: ["Drift zone", "Onboarding cliff"],
    expectedImpact: "Largest single lever on weekly-active retention through week 6",
    effort: "High",
    novel: false,
    expert: "Jackson Shuttleworth (Duolingo)",
  },
  {
    id: "stuck-at-midnight",
    name: "Stuck-at-Midnight Save",
    tagline: "Catch peak frustration with a tiered hint — the one thing free YouTube can't do",
    layer: "AI Coach",
    insight:
      "A student stuck on a bug at 11pm is at peak negative state — the exact instant they conclude “this isn't for me” and reach for Instagram. Intercept at the second of friction, never before/after.",
    mechanic: "Hot-state interception + “deadliest-bite” + “this is what getting better feels like”",
    inProduct:
      "Detect stuck (same problem >15 min, repeated failed runs, after 10pm) → tiered hint ladder (nudge → pseudocode → peer who solved it in 24h → mentor), never the answer. “90% of students get stuck here.”",
    targets: ["Drift zone", "Onboarding cliff", "Pre-placement nerves"],
    expectedImpact: "+30–40% same-session recovery from stuck-states; attacks the “I'm not cut out for this” exit",
    effort: "Medium",
    novel: false,
    expert: "All five (consensus #1)",
  },
  {
    id: "apna-mentor",
    name: "Apna Mentor — AI coach",
    tagline: "A regional-language coach that gives hints (not answers) and knows your history",
    layer: "AI Coach",
    insight:
      "An LLM that “thinks like a NxtWave mentor” gives feedback 80% as good as a human, on demand, infinitely — the reassurance no human mentor can give at 11pm to 100k students. The unlock is reps.",
    mechanic: "Loop-shrinking (reps at scale) + counter-programming the “I'm too dumb” narrative",
    inProduct:
      "A named, warm, regional-language coach loaded with the student's history (last win, error patterns). Gives hints not answers (preserves reps); never grades or shames; ends on one tiny next step.",
    targets: ["Drift zone", "Pre-placement nerves", "Internal exams"],
    expectedImpact: "Session-completion after stuck events; 11pm-gap recovery; confidence",
    effort: "Medium",
    novel: true,
    expert: "Hilary Gridley (Whoop)",
  },
  {
    id: "recovery-score",
    name: "Coding Recovery Score",
    tagline: "Render effort as a felt red/yellow/green state, not a progress bar",
    layer: "Habit",
    insight:
      "Students already know they're drifting — information changes nothing. A colored state that feels good/bad in the moment changes behavior (Whoop's red-recovery thesis). The green does the heavy lifting.",
    mechanic: "Immediate emotional reward loop — render state, not a grade; over-index on green",
    inProduct:
      "A morning ring: green if you did your ~35 min yesterday, yellow if light, red if zero. Tap → one 2-min “green action” that flips today. A state (recharged/coasting/stalled), never a score-out-of-100.",
    targets: ["Drift zone", "Onboarding cliff"],
    expectedImpact: "Cuts 3+ day silent gaps before they harden into churn",
    effort: "Medium",
    novel: true,
    expert: "Hilary Gridley (Whoop)",
  },
  {
    id: "exam-mode",
    name: "Exam-Mode Pact",
    tagline: "Don't just pause the streak — pre-book the dated comeback (a witnessed pact)",
    layer: "Product",
    insight:
      "Internal exams are the cleanest dropout cliff: the student “pauses” and the pause silently becomes a quit. You can't out-argue a college exam — so ritualize the return and lock it in before the pause.",
    mechanic: "Pre-commitment + bend-not-break + “deadline-as-gift” (2 Exam Freezes/sem, capped)",
    inProduct:
      "Tap Exam Mode → next screen forces one tap: “Exams end ___; your comeback session is auto-booked for [end+1], 7pm — one 10-min module.” Streak shows “Frozen, resumes [date]”, not broken. Return ping fires on the date.",
    targets: ["Internal exams", "Semester break"],
    expectedImpact: "+25–30% post-exam reactivation vs a silent pause",
    effort: "Low",
    novel: false,
    expert: "Kristen / Nir / Jackson / Kunal",
  },
  {
    id: "maa-baap",
    name: "Maa-Baap Green Report Card",
    tagline: "Status object for the payer-parent, in their language, timed to their hot state",
    layer: "Parent",
    insight:
      "The parent paid ₹2L and is the real churn decision-maker but can't see a coding curriculum. Hand them a status-bearing artifact — led with the win, not a grade — fired at the point of doubt.",
    mechanic: "Status transfer to payer + reward loop (lead with green) + point-of-decision timing",
    inProduct:
      "WhatsApp card in Telugu/Hindi/Tamil, designed like a certificate, auto-sent 3 days before fee installments + within 24h of exam season ending. Leads with effort (“18 days coding this month”) + a line the parent can say to the child. Goes quieter (not punitive) on lapses. Gated on activity.",
    targets: ["Drift zone", "Semester break", "Internal exams"],
    expectedImpact: "Installment-default reduction; +10–15% parent-initiated re-engagement",
    effort: "Low",
    novel: false,
    expert: "Kunal / Hilary / Kristen",
  },
  {
    id: "dharma-cohort",
    name: "Dharma Cohort — Group Weeks",
    tagline: "A shared streak among same-college batchmates; missing lets the group down",
    layer: "Peer",
    insight:
      "Individual streaks are a Western (Duolingo) mechanic. In a collectivist society the stronger lever is not letting your group down — which converts peer contagion from a dropout risk into peer pressure to stay.",
    mechanic: "Collectivist loss aversion / dharma (duty to the group) + social accountability",
    inProduct:
      "Geography-clustered cohorts of ~6–12 with a shared “Group Weeks” streak. A lagging member can be “saved” by a teammate (capped, so it doesn't train absence). Cohort-vs-next-town leaderboard.",
    targets: ["Peer contagion", "Drift zone"],
    expectedImpact: "Direct attack on peer-contagion churn; weekly-active lift via mutual accountability",
    effort: "High",
    novel: false,
    expert: "Kunal + Jackson",
  },
  {
    id: "hyperlocal-wall",
    name: "Hyperlocal Senior Wall",
    tagline: "“Someone from YOUR college did this” — envy is hyperlocal",
    layer: "Peer",
    insight:
      "Generic “placed at Amazon” testimonials are too far away to move a tier-3 student. The motivating comparison is the senior from their own college/town/batch+1 — “he was just like me 18 months ago.”",
    mechanic: "Hyperlocal envy (signal strength decays with social distance — minimize it)",
    inProduct:
      "A feed that surfaces, by the student's own college/town, a placed senior with the concrete artifact (project, timeline) and the delta: “He was at your exact module 14 months ago.” Connect/DM for a trust bridge.",
    targets: ["Onboarding cliff", "Drift zone", "Pre-placement nerves"],
    expectedImpact: "Strong drift-zone re-engagement; pre-placement confidence lift",
    effort: "Medium",
    novel: false,
    expert: "Kunal Shah (CRED)",
  },
  {
    id: "ghost-racer",
    name: "Past-You Ghost Racer",
    tagline: "Race your previous-best self on mocks — self-competition, not peer shame",
    layer: "Identity",
    insight:
      "Peer comparison crushes the anxious student. Competing against your own past self is achievable and feels great — and sidesteps the shame that Hyperlocal Envy can trigger for fragile students.",
    mechanic: "Self-referential competition + loss-reframe (“the dip makes the comeback feel earned”)",
    inProduct:
      "Every mock replays your previous attempt as a live “ghost” pace/score. After a bad mock: suppress the bare number, show trajectory + the next attempt animating Past-You falling behind.",
    targets: ["Internal exams", "Pre-placement nerves"],
    expectedImpact: "Higher mock-retake rate; better 7-day retention in the highest-churn window",
    effort: "Medium",
    novel: true,
    expert: "Hilary Gridley (Zwift-inspired)",
  },
  {
    id: "identity-artifact",
    name: "Decaying Identity Artifact",
    tagline: "A public builder profile that visibly stalls if you stop — quitting = status loss",
    layer: "Identity",
    insight:
      "Every action should store value, making leaving costly. A static certificate has no pull; a public, verified builder rank that visibly decays on inactivity turns continued enrollment into status maintenance.",
    mechanic: "Investment / stored value + status maintenance / costly signaling",
    inProduct:
      "A shareable verified profile (LinkedIn/Insta/college groups) that auto-compiles every project, solved problem and endorsement into a momentum-based rank. Inactivity visibly grays it — peers and family see the decay.",
    targets: ["Peer contagion", "Internship season", "Pre-placement nerves"],
    expectedImpact: "Sustained engagement via sunk-status; share-driven low-CAC referral bonus",
    effort: "High",
    novel: true,
    expert: "Nir Eyal + Kunal Shah",
  },
  {
    id: "sunday-commit",
    name: "Sunday Commit Ritual",
    tagline: "A 30-sec when/where/what plan with a “Commit” button and an opt-out",
    layer: "Habit",
    insight:
      "Goals don't change behavior — pre-committed plans + environment do. “Continue” → “Commit to my goal” was a massive Duolingo win; adding an explicit opt-out was nearly as big — the act of choosing drives engagement.",
    mechanic: "Implementation intention + active-choice commitment (never pre-select)",
    inProduct:
      "Sunday 7pm: pick (no default) next week's goal — “1 problem (keep streak) / 3 (level up) / can't this week” via dropdowns (not open text). Button reads “Commit”. Defaults the week's calendar to those slots.",
    targets: ["Drift zone", "Semester break"],
    expectedImpact: "+15% weekly-active consistency; highest ROI-per-effort (copy change)",
    effort: "Low",
    novel: false,
    expert: "Kristen / Nir / Jackson",
  },
];

export const LAYERS: InterventionLayer[] = [
  "Habit",
  "Product",
  "AI Coach",
  "Peer",
  "Parent",
  "Identity",
];
