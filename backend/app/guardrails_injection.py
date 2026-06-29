import re

INJECTION_PATTERNS = [
    r"ignore (all )?previous instructions",
    r"disregard (all )?(the )?(above|previous)",
    r"you are now",
    r"act as (a |an )?(dan|jailbroken|unrestricted)",
    r"pretend (you are|to be)",
    r"system prompt",
    r"reveal (your|the) (system )?prompt",
    r"forget (everything|all) (you|i) (said|told)",
    r"new instructions:",
    r"override your",
]

JAILBREAK_PATTERNS = [
    r"dan mode",
    r"do anything now",
    r"no (ethical|moral) (guidelines|restrictions)",
    r"without (any )?(restrictions|filters|limitations)",
    r"bypass (your |the )?(safety|content) (filter|policy|guidelines)",
    r"hypothetically,? if you (had no|could ignore)",
    r"as an ai with no (rules|restrictions)",
    r"developer mode",
    r"unlocked (version|mode)",
]

def detect_prompt_injection(text: str) -> float:
    text_lower = text.lower()
    matches = sum(1 for pattern in INJECTION_PATTERNS if re.search(pattern, text_lower))
    score = min(matches / 3, 1.0)
    return round(score, 2)

def detect_jailbreak(text: str) -> float:
    text_lower = text.lower()
    matches = sum(1 for pattern in JAILBREAK_PATTERNS if re.search(pattern, text_lower))
    score = min(matches / 2, 1.0)
    return round(score, 2)