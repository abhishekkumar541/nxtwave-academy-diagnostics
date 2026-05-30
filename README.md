# NxtWave Academy Diagnostics

A retention command center for a long-horizon, parent-paid coding program (modeled on NxtWave's Academy: a 2–3 year, ~4-hours/week program for tier 2/3 college students, years 1–4). It turns retention into an operating loop — **Diagnose → Detect → Intervene → Validate** — over realistic synthetic data, with live LLM-generated, regional-language outreach.

**▶ Live demo:** https://nxtwave-academy-diagnostics.vercel.app

All data is **synthetic and illustrative** — this is a working prototype, not real figures.

---

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

The LLM features (parent report card, Nudge Composer, Ask chat) work **with no setup** — they fall back to curated, grounded responses. For live generation, add a free provider key:

```bash
cp .env.example .env.local
# Free, no credit card (add one or both — they form a fallback chain):
#   GEMINI_API_KEY=...   # https://aistudio.google.com → "Get API key" (recommended)
#   GROQ_API_KEY=...     # https://console.groq.com/keys
# Paid alternatives also slot into the chain: OPENAI_API_KEY, PERPLEXITY_API_KEY
```

With a key set, the report card and Nudge Composer write personalized WhatsApp-style messages in the student's language (Telugu / Hindi / Tamil / Malayalam) and the Ask tab streams live answers. Without a key — or if every provider errors — the app uses grounded fallbacks, so it **never hard-fails**.

---

## What's inside

A single-page, tabbed command center (`#diagnose · #detect · #intervene · #insights · #ask`):

**Diagnose — "retention isn't a blob"**
- Segmentable retention curves by **year-of-college / college tier / lead source**, with a **clickable legend** (toggle any series, All/None) to de-clutter.
- A **7-event dropout calendar** showing churn is calendar-driven (spikes at internal exams, semester breaks).
- A **4-stakeholder attribution** view — who really drove the dropout: **student / parents / family WhatsApp / college peers**.

**Detect — "who's at risk this week"**
- A **save queue** ranked by a transparent, explainable churn-risk score — click any student to see exactly which factors drove the number.
- A **peer-cluster signal**: when ≥2 batchmates from the same college pause, the rest are flagged (collectivist contagion).

**Intervene — "live tools + an expert playbook"**
- **Maa-Baap Report Card** — a weekly, regional-language parent update (project + rank + trajectory) as a WhatsApp message with an English-translation toggle.
- **Nudge Composer** — pick an at-risk student + a trigger moment (stuck-at-midnight · drifting · exam approaching · batchmate dropped · post-mock-failure · parent disengaged) → an AI coach drafts the *actual* nudge in their language, grounded in their data, using the right behavioral mechanic.
- **Exam Mode** — pause the streak during college exams, drop to short revision, re-onboard the day exams end.
- **Intervention Playbook** — 12 expert-attributed plays (filterable by layer), each with its named behavioral mechanic, the dropout moment it targets, expected impact, and build effort. Synthesized from a 5-expert panel (Berman · Eyal · Shah · Shuttleworth · Gridley).

**Insights — "validated, not asserted"**
- An engine that **auto-mines candidate patterns** and runs each through a **statistical gate** (two-proportion z-test · p<0.05 · n≥30/group · ≥25% relative lift), labelling each **Validated** or **Directional**.
- Validates against the **independent churn outcome** (never the tool's own risk score — no circularity) and flags likely **confounds** (significant ≠ causal).

**Ask**
- A grounded, tool-scoped chat: it answers questions about the live data, cites real numbers from the dashboard, and is instructed never to invent a metric that isn't in the data.

Plus a lightweight **email login gate** in front of the app (logins are logged — see below).

---

## What it shows

| Feature | The point |
|---|---|
| Segmentable retention curves (clickable legend) | Never read a blended curve — cohort by year / tier / lead source |
| 7-event dropout calendar | Churn is calendar-driven & predictable |
| 4-stakeholder attribution | The collectivist decision unit (parents, not just the student) |
| Transparent risk score + drawer | Explainable — every point is attributable |
| Peer-cluster signal | Collectivist contagion as an early-warning |
| Lead-source segment | Acquisition quality is an upstream retention lever |
| Maa-Baap Report Card (LLM) | The parent as accountability partner |
| Nudge Composer (LLM) | The right message, for the right moment, in the right language |
| Intervention Playbook (12 plays) | Expert-backed, behaviorally-grounded, mapped to the dropout calendar |
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
- **`lib/stats.ts` + `lib/insights.ts`** — the evals layer: a pure-TS two-proportion z-test + an engine that gates auto-mined patterns into Validated / Directional with confound flags.
- **`lib/interventions.ts` + `components/InterventionLibrary.tsx`** — the expert-attributed intervention playbook.
- **`lib/llm.ts`** — provider-agnostic LLM layer (OpenAI-compatible) with a **fallback chain**: tries **Gemini → Groq → OpenAI → Perplexity** in order (each only if its key is set), so a rate-limit on one transparently retries the next; curated fallbacks if the whole chain fails.
- **`lib/auth.ts` + `components/AuthGate.tsx` + `LoginScreen.tsx`** — lightweight client-side email login: gate + redirect-back, persisted session (localStorage), identity + sign-out, inline validation. No password/DB.
- **`app/api/report-card` · `app/api/nudge` · `app/api/chat`** — the three LLM routes (report card + Nudge Composer use `llmComplete`; Ask uses streaming `llmStream`), all with grounded fallbacks.
- **`app/api/log-login/route.ts`** — logs each login (IST timestamp + email) to a Google Sheet (Apps Script webhook) + a local JSONL fallback.

## Login logging → Google Sheet
Every email sign-in is recorded (IST timestamp + email).
1. Open `google-apps-script.gs` and follow its 2-minute setup (create a Sheet → paste the script → deploy as a Web app → copy the `/exec` URL).
2. Set `SHEETS_WEBHOOK_URL` to that URL (`.env.local` locally; Vercel env in prod).
- Without it, logins still append to a local `.login-log.jsonl` (dev only).

## Deploy to Vercel
1. `npm i -g vercel` (once).
2. From this folder: `vercel --yes` (first run links/creates the project), then `vercel --prod`.
3. Set env vars in **Vercel → Project → Settings → Environment Variables**:
   - `GEMINI_API_KEY` and/or `GROQ_API_KEY` (free, no card) — and optionally `OPENAI_API_KEY` / `PERPLEXITY_API_KEY` — for live LLM features (they form the fallback chain).
   - `SHEETS_WEBHOOK_URL` (optional, for Sheet logging).
   - Redeploy after adding env vars.
- Non-interactive: `vercel --prod --token=$VERCEL_TOKEN --yes`.

## Notes
- All data is **synthetic and illustrative** — not real figures.
- Login is a lightweight email gate (stored in-browser) — not production auth.
- Live LLM features use free tiers (Gemini/Groq); stacking both raises the effective ceiling. With no key (or all rate-limited) the app uses grounded fallbacks and never hard-fails.
