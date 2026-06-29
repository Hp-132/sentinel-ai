# 🛡️ Sentinel AI

**Enterprise LLM Guardrails & Evaluation Dashboard**

Sentinel AI is a real-time evaluation platform for testing and comparing LLM safety. Run any prompt across multiple models at once, get an instant safety breakdown for each response, and track results over time on a live dashboard.

## Why this exists

Teams are shipping LLM-powered features into production faster than they can properly evaluate safety and reliability. This creates real uncertainty around whether models behave safely under real-world conditions.

- If a model is swapped, does it introduce new security or compliance risks?
- How do we reliably detect jailbreaks or prompt injection attempts?
- Are guardrails genuinely working, or just giving a false sense of safety?
- How do we compare models objectively beyond vendor claims and static benchmarks?
- What happens to latency and performance trade-offs when scaling in production?

Sentinel AI turns these questions into measurable evaluations by running identical prompts across multiple models and analyzing their responses in a consistent, repeatable way.

## What it does

- **Compare multiple LLMs** side-by-side on the same prompt
- Scores every response for:
  - Prompt Injection
  - Jailbreak attempts
  - PII leakage
  - Toxicity
  - Hallucination risk
- Rolls all signals into a single **Safety Score** per response
- Tracks **latency** for every model call
- **Dashboard** — safety trends, risk breakdown, model leaderboard
- **History** — full searchable, filterable evaluation log with expandable detail
- Every evaluation is persisted to Supabase, building a real audit trail over time

## LLM Providers

- **Groq** — GPT-OSS 20B, GPT-OSS 120B
- **Cerebras** — GLM-4.7
- **Mistral AI** — Mistral Small

## Tech stack

**Frontend:** Next.js, Tailwind CSS, shadcn/ui, Recharts, Motion
**Backend:** FastAPI, Pydantic
**Database:** Supabase
**Deployment:** Vercel (frontend) + Render (backend)

