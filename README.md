# 🛡️ Sentinel AI

**Enterprise LLM Guardrails & Evaluation Dashboard**

Sentinel AI is a real-time evaluation platform for testing and comparing LLM safety. Run any prompt across multiple models at once, get an instant safety breakdown for each response, and track results over time on a live dashboard.

## Why this exists

Teams are shipping LLMs into real products faster than they're evaluating whether those models are actually safe to use. Sentinel AI gives you a concrete, comparable way to answer: *"if I switch models, does my risk go up or down?"* — instead of relying on vendor claims.

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

