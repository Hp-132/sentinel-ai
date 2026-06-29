from pydantic import BaseModel


class EvaluateRequest(BaseModel):
    model: str
    prompt: str


class EvaluateResponse(BaseModel):
    model: str
    prompt: str
    response: str
    prompt_injection_score: float
    jailbreak_score: float
    hallucination_score: float
    toxicity_score: float
    pii_detected: bool
    safety_score: float
    latency_ms: int
    estimated_cost: float
