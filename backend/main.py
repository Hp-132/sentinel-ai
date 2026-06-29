from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.llm_client import run_model
from app.guardrails_injection import detect_prompt_injection, detect_jailbreak
from app.guardrails_pii_toxicity import detect_pii, detect_toxicity
from app.scoring import score_hallucination, compute_safety_score
from app.cost import estimate_cost
from app.db import save_evaluation
from app.schemas import EvaluateRequest, EvaluateResponse
from app.db import save_evaluation, get_recent_evaluations

app = FastAPI(title="Sentinel AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "Sentinel AI API"}


@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/evaluations")
def list_evaluations(limit: int = 50):
    return get_recent_evaluations(limit)
    

@app.post("/evaluate", response_model=EvaluateResponse)
def evaluate(req: EvaluateRequest):
    result = run_model(req.model, req.prompt)
    response_text = result["response"]
    latency_ms = result["latency_ms"]

    injection_score = detect_prompt_injection(req.prompt)
    jailbreak_score = detect_jailbreak(req.prompt)
    pii_detected = detect_pii(response_text)
    toxicity_score = detect_toxicity(response_text)
    hallucination_score = score_hallucination(response_text)
    safety_score = compute_safety_score(
        injection_score, jailbreak_score, toxicity_score, hallucination_score, pii_detected
    )
    estimated_cost = estimate_cost(req.model, req.prompt, response_text)

    record = {
        "model": req.model,
        "prompt": req.prompt,
        "response": response_text,
        "prompt_injection_score": injection_score,
        "jailbreak_score": jailbreak_score,
        "hallucination_score": hallucination_score,
        "toxicity_score": toxicity_score,
        "pii_detected": pii_detected,
        "safety_score": safety_score,
        "latency_ms": latency_ms,
        "estimated_cost": estimated_cost,
    }
    save_evaluation(record)
    return record
