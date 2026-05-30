# NxtWave Academy Diagnostics

A working prototype of how I'd run **retention for NxtWave Academy** — built as a final-round interview artifact. It turns the retention thesis into a product: the Lead operating loop **Diagnose → Detect → Intervene**, over realistic synthetic Academy data, with a live LLM-generated regional-language parent report card.

> *"I didn't just write a retention strategy — I prototyped how I'd run it. Here, let me show you."*

---

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000
```

The parent report card works **with no setup** — it falls back to curated samples. For the *live* AI generation (the wow moment), add a key:

```bash
cp .env.example .env.local
# put your key in .env.local:  ANTHROPIC_API_KEY=sk-ant-...
```

With a key set, the "Generate report card" button calls Claude live and writes a personalized WhatsApp message in the student's language (Telugu / Hindi / Tamil / Malayalam). Without a key — or if the call ever fails — it returns a curated sample, so **a live demo never breaks**.

---

## The 60-second demo script

**Tab 1 — DIAGNOSE** ("retention isn't a blob")
1. *"First, I'd never read retention as one number."* Toggle the retention curve by **year-of-college** → the curves visibly diverge. *"1st-years bleed in the first 8 weeks; 3rd-years drop in the pre-placement stretch. Different problems, different fixes."*
2. Point at the **7-event dropout calendar** → *"Academy churn is calendar-driven and predictable. Watch it spike at internal exams — the single most underdiagnosed trigger."* Click the Internal-exams bar.
3. Point at the **5-stakeholder donut** → *"And every dropout is a collective decision. 88% originate with someone other than the student. No Western playbook addresses the other four."*

**Tab 2 — DETECT** ("who do we save this week")
4. *"So who's at risk right now?"* Show the **save queue** — sorted by a transparent, explainable risk score. Click a student → the drawer shows **exactly why** (the score is defensible, not a black box).
5. Point at the **peer-cluster signal** → *"This is the play no other dashboard has: when ≥2 batchmates from the same college pause, the rest are at high risk. Collectivist contagion — we flag the cluster for the mentor today."*

**Tab 3 — INTERVENE** ("the plays no competitor builds")
6. *"And here's my highest-conviction first bet."* Pick a student → **Generate report card** → a parent message appears live in Telugu in a WhatsApp bubble. *"The father paid ₹2L and can't see progress. This turns him from interrogator into accountability partner."* Toggle the English translation.
7. Flip to **Exam Mode** → *"And the highest-ROI Academy-only feature: pause the streak during college exams, drop to 10-min revision, re-onboard the day exams end. Goal: lift 'resumed after exams' from 31% to 60%+."*

**Tab 4 — INSIGHTS** ("validated, not asserted") — the data-panelist closer
8. *"Everything I just showed you, the tool also validates."* The engine **auto-mines ~10 candidate patterns** and runs each through a **statistical gate** (two-proportion z-test · p<0.05 · n≥30/group · ≥25% lift). *"7 validated, 2 directional."*
9. Point at a **directional** card: *"This one — first-6-weeks churn — looks significant, but n=10. The tool refuses to call it validated. That honesty is the point."*
10. Point at the **⚠ confound** flag on the Hindi card: *"Significant ≠ causal — this is really a tier-3 effect. The stat narrows where a human should look; it doesn't replace the judgment."* Open **Methodology** to show it validates against the *independent* churn outcome, never the tool's own risk score (no circularity).

**Tab 5 — ASK** ("chat with your retention data")
11. *"And anyone on the team can just ask it."* Open **Ask** → click a starter like *"Which cohort should I prioritize?"* → a Claude-powered answer streams in, **grounded in this tool's live numbers** (it cites the validated insights, not invented stats). Ask a follow-up — it keeps context. *"It's scoped to this tool and instructed never to invent a metric that isn't in the data."*

Close: *"This is the whole thesis as a product — diagnose precisely, detect the saves, ship the few bets that compound, validate every claim before acting, and let anyone interrogate it in plain language."*

---

## What it demonstrates (and how it maps to the interview)

| In the app | The point it proves |
|---|---|
| Segmentable retention curves | "Never read a blended curve" — cohort by year/tier/language |
| 7-event dropout calendar | Churn is calendar-driven & predictable (Exam Mode, sem-break) |
| 5-stakeholder attribution | The collectivist decision unit — Bharat fluency |
| Transparent risk score + drawer | Defensible to the data panelist — every point is attributable |
| Peer-cluster signal | The signature insight no competitor pitches |
| Maa-Baap Report Card (live LLM) | The high-conviction first bet; parent as accountability partner |
| Exam Mode | The highest-ROI Academy-only feature |
| Acquisition-source segment | Acquisition quality is upstream of retention (counselor-led churns worst) |
| **Insights/Evals engine** | **Validated, not asserted** — statistically gated observations; directional & confound flags = data maturity |
| Email login gate | A real product anyone can sign in to start using |

---

## Architecture

- **Next.js 14 (App Router) + TypeScript + Tailwind + Recharts.** No external database — all in-memory synthetic data, one `npm run dev`.
- **`lib/data/students.ts`** — seeded (deterministic) generator of ~300 believable Bharat students. The *independent* "left" (paused/churned) outcome is driven by upstream factors (parent disengagement, exam proximity, peer-cluster contagion, attendance, acquisition) so the risk score is a real predictor and the insight engine has honest signal.
- **`lib/risk.ts`** — transparent weighted churn-risk heuristic. Explainable on purpose; every point is attributable.
- **`lib/data/cohorts.ts`** — derived curves (segmentable by year/tier/language/acquisition), dropout calendar, stakeholder attribution, KPIs, save queue, peer clusters.
- **`lib/stats.ts` + `lib/insights.ts`** — the evals layer. Pure-TS two-proportion z-test; an engine that auto-mines candidate patterns and **gates each against the independent churn outcome** (never the risk score — no circularity) into *Validated* / *Directional*, with confound flags.
- **`lib/auth.ts` + `components/AuthGate.tsx` + `LoginScreen.tsx`** — lightweight client-side email login: gate + redirect-back (hash preserved), persisted session (localStorage), identity + sign-out, inline email validation. No password/DB.
- **`app/api/report-card/route.ts`** — server route → Claude (`claude-sonnet-4-6` by default) → regional-language report card, **with a curated fallback** for a bulletproof live demo.
- **`lib/chatContext.ts` + `app/api/chat/route.ts` + `components/ChatTab.tsx`** — the **Ask** tab: a grounded, tool-scoped Claude chat. Streams responses; injects a compact live-data snapshot so answers cite real numbers; graceful canned fallback if the model is unavailable.
- **`app/api/log-login/route.ts`** — logs each login (timestamp + email) to a Google Sheet (Apps Script webhook) and a local JSONL fallback.

## Login logging → Google Sheet
Every email sign-in is recorded (timestamp + email).
1. Open `google-apps-script.gs` and follow its 2-minute setup (create a Sheet → paste the script → Deploy as Web app → copy the `/exec` URL).
2. Set `SHEETS_WEBHOOK_URL` to that URL (`.env.local` locally; Vercel env in prod).
- Without it, logins still append to a local `.login-log.jsonl` (dev only).

## Deploy to Vercel
1. `npm i -g vercel` (once).
2. From this folder: `vercel --yes` (first run links/creates the project), then `vercel --prod`.
3. Set env vars in **Vercel → Project → Settings → Environment Variables**:
   - `ANTHROPIC_API_KEY` (needs credits for live chat + report card)
   - `SHEETS_WEBHOOK_URL` (optional, for Sheet logging)
   - Redeploy after adding env vars.
- Non-interactive (CI/token): `vercel --prod --token=$VERCEL_TOKEN --yes`.

## Notes
- All data is **synthetic and illustrative** — it's a prototype to show *how I think*, not real NxtWave numbers.
- Login is a demo gate (email only, stored in-browser) — not production auth.
- The live Claude features need an `ANTHROPIC_API_KEY` **with credits**; otherwise the app uses grounded fallbacks (it never hard-fails).

---
*Built grounded in the Academy retention prep: `../final-round-prep.md`, `../academy-tailored-prep.md`, `../summary.md`.*
