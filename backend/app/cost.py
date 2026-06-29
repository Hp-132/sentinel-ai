COST_PER_1K_TOKENS = {
    "llama-3.1-8b": 0.0,
    "llama-3.3-70b": 0.0,
    "gpt-oss-20b-free": 0.0,
    "llama-3.2-3b-free": 0.0,
}


def estimate_cost(model_key: str, prompt: str, response: str) -> float:
    total_chars = len(prompt) + len(response)
    estimated_tokens = total_chars / 4
    rate = COST_PER_1K_TOKENS.get(model_key, 0.0)
    cost = (estimated_tokens / 1000) * rate
    return round(cost, 6)
