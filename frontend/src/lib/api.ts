import { EvaluateRequest, EvaluateResponse } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function evaluatePrompt(
  req: EvaluateRequest
): Promise<EvaluateResponse> {
  const res = await fetch(`${API_URL}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

import { EvaluationRecord } from "./types";

export async function fetchEvaluations(limit = 50): Promise<EvaluationRecord[]> {
  const res = await fetch(`${API_URL}/evaluations?limit=${limit}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}