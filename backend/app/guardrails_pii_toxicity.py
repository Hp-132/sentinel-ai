import re

PII_PATTERNS = {
    "email": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    "phone": r"\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
    "credit_card": r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b",
    "ssn": r"\b\d{3}-\d{2}-\d{4}\b",
    "ip_address": r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",
}

TOXIC_WORDS = [
    "idiot", "stupid", "dumb", "moron", "hate you", "kill yourself",
    "shut up", "worthless", "pathetic", "loser", "trash", "garbage",
    "disgusting", "ugly", "retard", "scum",
]


def detect_pii(text: str) -> bool:
    for pattern in PII_PATTERNS.values():
        if re.search(pattern, text):
            return True
    return False


def detect_toxicity(text: str) -> float:
    text_lower = text.lower()
    matches = sum(1 for word in TOXIC_WORDS if word in text_lower)
    score = min(matches / 3, 1.0)
    return round(score, 2)
