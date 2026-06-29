import os
import time
from groq import Groq
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

groq_client = Groq(api_key=GROQ_API_KEY)

GROQ_MODELS = {
    "gpt-oss-20b-groq": "openai/gpt-oss-20b",
    "gpt-oss-120b-groq": "openai/gpt-oss-120b",
}

CEREBRAS_MODELS = {
    "glm-4.7-cerebras": "zai-glm-4.7",
}

MISTRAL_MODELS = {
    "mistral-small": "mistral-small-latest",
}


def call_groq(model_key: str, prompt: str):
    start = time.time()
    model_name = GROQ_MODELS[model_key]
    response = groq_client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": prompt}],
    )
    latency_ms = int((time.time() - start) * 1000)
    text = response.choices[0].message.content
    return {
        "model": model_key,
        "response": text,
        "latency_ms": latency_ms,
    }


def call_cerebras(model_key: str, prompt: str):
    start = time.time()
    model_name = CEREBRAS_MODELS[model_key]
    headers = {
        "Authorization": f"Bearer {CEREBRAS_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
    }
    res = httpx.post(
        "https://api.cerebras.ai/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60,
    )
    res.raise_for_status()
    data = res.json()
    latency_ms = int((time.time() - start) * 1000)
    text = data["choices"][0]["message"]["content"]
    return {"model": model_key, "response": text, "latency_ms": latency_ms}


def call_mistral(model_key: str, prompt: str):
    start = time.time()
    model_name = MISTRAL_MODELS[model_key]
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": prompt}],
    }
    res = httpx.post(
        "https://api.mistral.ai/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60,
    )
    res.raise_for_status()
    data = res.json()
    latency_ms = int((time.time() - start) * 1000)
    text = data["choices"][0]["message"]["content"]
    return {"model": model_key, "response": text, "latency_ms": latency_ms}


def run_model(model_key: str, prompt: str):
    if model_key in GROQ_MODELS:
        return call_groq(model_key, prompt)
    elif model_key in CEREBRAS_MODELS:
        return call_cerebras(model_key, prompt)
    elif model_key in MISTRAL_MODELS:
        return call_mistral(model_key, prompt)
    else:
        raise ValueError(f"Unknown model key: {model_key}")
