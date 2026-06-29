export interface EvaluateRequest {
  model: string;
  prompt: string;
}

export interface EvaluateResponse {
  model: string;
  prompt: string;
  response: string;
  prompt_injection_score: number;
  jailbreak_score: number;
  hallucination_score: number;
  toxicity_score: number;
  pii_detected: boolean;
  safety_score: number;
  latency_ms: number;
  estimated_cost: number;
}

export const AVAILABLE_MODELS = [
  { key: "gpt-oss-20b-groq", label: "GPT-OSS 20B (Groq)" },
  { key: "gpt-oss-120b-groq", label: "GPT-OSS 120B (Groq)" },
  { key: "glm-4.7-cerebras", label: "GLM-4.7 (Cerebras)" },
  { key: "mistral-small", label: "Mistral Small (Mistral)" },
];

export interface EvaluationRecord extends EvaluateResponse {
  id: string;
  created_at: string;
}