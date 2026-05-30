# Methodology — Risk Scoring & Evals

How the two "thinking" parts of **NxtWave Academy Diagnostics** work. Written to be defended to a data/analytics panelist. *(All data is synthetic/illustrative.)*

---

## 1. Churn-risk score (`lib/risk.ts`)

A **transparent, additive 0–100 heuristic** — not a black box. Each factor contributes points; `score = min(100, Σ points)`. Every contributing factor is shown in the student drawer, so the number is always explainable.

| # | Factor | Condition → points |
|---|---|---|
| 1 | **Internal-exam proximity** (the #1 trigger) | ≤7 days **+26** · 8–14 days **+16** |
| 2 | **Inactivity / drift** | ≥10d **+24** · 5–9d **+14** · 3–4d **+7** |
| 3 | **Streak fragility** | broken **+12** · <3 days **+6** |
| 4 | **Peer-cluster contagion** | ≥2 batchmates paused **+20** · 1 **+8** |
| 5 | **Parent disengagement** | not opening reports **+12** · opens-but-never-responds **+5** |
| 6 | **Low attendance** | <40% **+14** · 40–60% **+7** |
| 7 | **Early tenure** | ≤6 weeks **+6** |
| 8 | **Lead-source intent** | InMobi **+12** · Counselor **+10** · Instagram **+8** · YouTube/Parent-led **+4** · Google **+2** · Organic/Referral/Student-led **0** |

**Bands:** ≥55 High · 30–54 Medium · <30 Low.

**Why it's defensible**
- **Explainable** — the drawer lists exactly which factors fired and their points.
- **Honest** — the UI says the weights are a *hypothesis*, to be **backtested against actual churn on Day 1** and recalibrated.
- **Theory-driven** — weights follow the retention thesis (exam calendar, 5-stakeholder unit, peer contagion, acquisition quality), the right starting point before there's data to train a model.
- **Not circular** — the score is computed from upstream behaviour and is **never** used to validate insights (see §2).

---

## 2. Evals / insight validation (`lib/insights.ts` + `lib/stats.ts`)

The **Insights** tab auto-mines patterns and **statistically gates each one** before showing it — "validated, not asserted."

**Step 1 — Outcome (anti-circularity).**
Outcome = the **independent `left` label** (`status ∈ {paused, churned}`), generated from upstream behaviour. We **never** validate against `churnRiskScore` (we authored it → circular), and we **don't mine the variables that *define* the label** (`daysSinceActive`, `currentStreak`).

**Step 2 — Candidates (hypothesis space).** Each subgroup is tested vs its complement: parent-not-opening · exam ≤14d · ≥2 batchmates paused · attendance <50% · counselor-acquired · student-led · broad-paid (Instagram+InMobi) · first 6 weeks · 1st-year · tier-3 · Hindi cohort.

**Step 3 — Two-proportion z-test** (`lib/stats.ts`, zero deps):
for subgroup rate `p₁` (n₁) vs complement `p₂` (n₂):
- pooled `p = (x₁+x₂)/(n₁+n₂)`
- `SE = √[ p(1−p)(1/n₁ + 1/n₂) ]`, `z = (p₁−p₂)/SE`
- two-tailed **p-value** via the normal CDF (Abramowitz–Stegun `erf` approximation)
- **relative lift** `(p₁−p₂)/p₂`; **confidence** `(1−p)·100`

**Step 4 — The gate (verdict):**
- **Validated** ✅ — `p < 0.05` **AND** `n ≥ 30` per group **AND** `|relLift| ≥ 25%`
- **Directional** ⚠ — `|relLift| ≥ 15%` but fails significance or is underpowered
- **Dropped** — weaker

**Step 5 — Honesty layer:** verdict badge + two-bar comparison + raw stats (lift · p · n); **confound flags** (e.g. Hindi ≈ tier-3 → "significant ≠ causal"); directional cards stated as such (e.g. "looks significant but n=10 — won't bet on it").

**Current seeded result:** ~7 validated, ~3 directional — the mix proves the gate rejects weak claims, not just rubber-stamps strong ones.

**One-liner:** *"It validates observations against the actual churn outcome — not its own risk score — and refuses to call anything 'validated' that's underpowered or confounded."*

---

## 3. Acquisition / lead source

Modeled as a real edtech CRM would — one blended field mixing initiator + marketing channel, ordered by intent:

`Referral · Organic · Student-led · Google Ads · YouTube Ads · Parent-led · Instagram Ads · College counselor · InMobi`

High-intent sources (organic/referral/student-led) retain best; broad paid (Instagram, InMobi) and counselor-pushed signups churn most. This feeds the segmented retention curve, the risk score (factor #8), and the evals engine — so **acquisition quality shows up as an upstream retention lever**, not just a marketing metric.
