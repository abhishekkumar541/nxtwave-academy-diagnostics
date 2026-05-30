# NxtWave Academy Diagnostics

A retention command center for a long-horizon, parent-paid coding program (modeled on NxtWave's Academy: a 2–3 year, ~4-hours/week program for tier 2/3 college students). It turns retention into an operating loop — **Diagnose → Detect → Intervene → Validate** — over realistic synthetic data, with an LLM-generated, regional-language parent report card.

All data is **synthetic and illustrative** — this is a working prototype, not real figures.

---

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

The LLM features (parent report card + the Ask chat) work **with no setup** — they fall back to curated, grounded responses. For live generation, add a provider key:

```bash
cp .env.example .env.local
# set ONE provider key in .env.local. Free, no credit card:
#   GEMINI_API_KEY=...     # https://aistudio.google.com → "Get API key" (recommended)
#   # or GROQ_API_KEY=...  # https://console.groq.com/keys
# Paid alternatives also work: PERPLEXITY_API_KEY, OPENAI_API_KEY.
```

With a key set, "Generate report card" writes a personalized WhatsApp-style message in the student's language (Telugu / Hindi / Tamil / Malayalam), and the Ask tab streams live answers. Without a key — or on any error — the app uses grounded fallbacks, so it never hard-fails.

---

## What's inside

The app is a single-page, tabbed command center:

**Diagnose — "retention isn't a blob"**
- Segmentable retention curves by **year-of-college / college tier / language / lead source** (the cohorts diverge).
- A **7-event dropout calendar** showing churn is calendar-driven (spikes at internal exams, semester breaks).
- A **5-stakeholder attribution** view (student / father / mother / family WhatsApp / college peers).

**Detect — "who's at risk this week"**
- A **save queue** ranked by a transparent, explainable churn-risk score — click any student to see exactly which factors drove the number.
- A **peer-cluster signal**: when ≥2 batchmates from the same college pause, the rest are flagged (collectivist contagion).

**Intervene**
- **Maa-Baap Report Card** — a weekly, regional-language parent update (project + rank + trajectory), rendered as a WhatsApp message with an English-translation toggle.
- **Exam Mode** — pause the streak during college exams, drop to short daily revision, re-onboard the day exams end.

**Insights — "validated, not asserted"**
- An engine that **auto-mines candidate patterns** and runs each through a **statistical gate** (two-proportion z-test · p<0.05 · n≥30/group · ≥25% relative lift), labelling each **Validated** or **Directional**.
- Validates against the **independent churn outcome** (never the tool's own risk score — no circularity), and flags likely **confounds** (significant ≠ causal).

**Ask**
- A grounded, tool-scoped chat: it answers questions about the live data, citing real numbers from the dashboard, and is instructed never to invent a metric that isn't in the data.

---

## What it shows

| Feature | The point |
|---|---|
| Segmentable retention curves | Never read a blended curve — cohort by year/tier/language/source |
| 7-event dropout calendar | Churn is calendar-driven & predictable |
| 5-stakeholder attribution | The collectivist decision unit |
| Transparent risk score + drawer | Explainable — every point is attributable |
| Peer-cluster signal | Collectivist contagion as an early-warning |
| Lead-source segment | Acquisition quality is an upstream retention lever |
| Maa-Baap Report Card (LLM) | The parent as accountability partner |
| Exam Mode | Targets the #1 predictable dropout trigger |
| Insights / evals engine | Statistically gated observations; directional + confound flags |
| Email login gate | A real product anyone can sign in to use |

See **[METHODOLOGY.md](METHODOLOGY.md)** for the risk-scoring and evals logic in detail.

---

## Architecture

- **Next.js 14 (App Router) + TypeScript + Tailwind + Recharts.** No external database — all in-memory synthetic data.
- **`lib/data/students.ts`** — seeded (deterministic) generator of ~300 students. The independent "left" (paused/churned) outcome is driven by upstream factors (parent disengagement, exam proximity, peer-cluster contagion, attendance, lead source) so the risk score is a real predictor and the insight engine has honest signal.
- **`lib/risk.ts`** — transparent weighted churn-risk heuristic; every point is attributable.
- **`lib/data/cohorts.ts`** — derived curves, dropout calendar, stakeholder attribution, KPIs, save queue, peer clusters.
- **`lib/stats.ts` + `lib/insights.ts`** — the evals layer: a pure-TS two-proportion z-test and an engine that gates auto-mined patterns into Validated / Directional with confound flags.
- **`lib/llm.ts`** — provider-agnostic LLM layer (OpenAI-compatible). Auto-detects **Perplexity → OpenAI** from env; graceful fallbacks when no key.
- **`lib/auth.ts` + `components/AuthGate.tsx` + `LoginScreen.tsx`** — lightweight client-side email login: gate + redirect-back, persisted session (localStorage), identity + sign-out, inline validation. No password/DB.
- **`app/api/report-card/route.ts`** — regional-language report card via the LLM layer, with a curated fallback.
- **`lib/chatContext.ts` + `app/api/chat/route.ts` + `components/ChatTab.tsx`** — the Ask tab: a grounded, streaming, tool-scoped chat over a compact live-data snapshot.
- **`app/api/log-login/route.ts`** — logs each login (timestamp + email) to a Google Sheet (Apps Script webhook) and a local JSONL fallback.

## Login logging → Google Sheet
Every email sign-in is recorded (timestamp in IST + email).
1. Open `google-apps-script.gs` and follow its 2-minute setup (create a Sheet → paste the script → deploy as a Web app → copy the `/exec` URL).
2. Set `SHEETS_WEBHOOK_URL` to that URL (`.env.local` locally; Vercel env in prod).
- Without it, logins still append to a local `.login-log.jsonl` (dev only).

## Deploy to Vercel
1. `npm i -g vercel` (once).
2. From this folder: `vercel --yes` (first run links/creates the project), then `vercel --prod`.
3. Set env vars in **Vercel → Project → Settings → Environment Variables**:
   - `GEMINI_API_KEY` (free, no card — recommended) or `GROQ_API_KEY` / `PERPLEXITY_API_KEY` / `OPENAI_API_KEY` — for live chat + report card
   - `SHEETS_WEBHOOK_URL` (optional, for Sheet logging)
   - Redeploy after adding env vars.
- Non-interactive: `vercel --prod --token=$VERCEL_TOKEN --yes`.

## Notes
- All data is **synthetic and illustrative** — not real figures.
- Login is a lightweight email gate (stored in-browser) — not production auth.
- Live LLM features need a provider key with credits; otherwise the app uses grounded fallbacks and never hard-fails.
