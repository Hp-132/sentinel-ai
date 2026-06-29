"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Play } from "lucide-react";
import { evaluatePrompt } from "@/lib/api";
import { AVAILABLE_MODELS, EvaluateResponse } from "@/lib/types";

function safetyColor(score: number) {
  if (score >= 0.8) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (score >= 0.5) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  return "text-red-400 border-red-400/30 bg-red-400/10";
}

export default function ComparePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([AVAILABLE_MODELS[0].key]);
  const [results, setResults] = useState<EvaluateResponse[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function toggleModel(key: string) {
    setSelectedModels((prev) => (prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]));
  }

  async function handleRun() {
    if (!prompt || selectedModels.length === 0) return;
    setLoading(true);
    setResults([]);
    setErrors({});

    const settled = await Promise.allSettled(
      selectedModels.map((model) => evaluatePrompt({ model, prompt }))
    );

    const ok: EvaluateResponse[] = [];
    const errs: Record<string, string> = {};
    settled.forEach((res, i) => {
      const key = selectedModels[i];
      if (res.status === "fulfilled") ok.push(res.value);
      else errs[key] = "Request failed (rate limit or network error)";
    });

    setResults(ok);
    setErrors(errs);
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-medium">Compare Models</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Run a prompt across multiple LLMs and compare safety, latency, and cost.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run a Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />

          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_MODELS.map((m) => (
              <Badge
                key={m.key}
                variant={selectedModels.includes(m.key) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleModel(m.key)}
              >
                {m.label}
              </Badge>
            ))}
          </div>

          <Button onClick={handleRun} disabled={loading || !prompt} className="glow-soft">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" /> Run
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(results.length > 0 || Object.keys(errors).length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{r.model}</CardTitle>
                <Badge className={`${safetyColor(r.safety_score)} glow-soft`} variant="outline">
                  {r.safety_score.toFixed(2)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{r.response}</p>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border font-mono text-xs">
                  <span>Latency: {r.latency_ms}ms</span>
                  <span>PII: {r.pii_detected ? "Yes" : "No"}</span>
                </div>

                <div className="space-y-2 pt-2">
                  {[
                    ["Injection", r.prompt_injection_score],
                    ["Jailbreak", r.jailbreak_score],
                    ["Hallucination", r.hallucination_score],
                    ["Toxicity", r.toxicity_score],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{label}</span>
                        <span>{(value as number).toFixed(2)}</span>
                      </div>
                      <Progress value={(value as number) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {Object.entries(errors).map(([key, msg]) => (
            <Card key={key} className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">{key}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{msg}</CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}