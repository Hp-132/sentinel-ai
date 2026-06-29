"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Activity, Shield, Zap, AlertTriangle } from "lucide-react";
import { fetchEvaluations } from "@/lib/api";
import { EvaluationRecord } from "@/lib/types";
import AnimatedNumber from "@/components/AnimatedNumber";
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid";

const MODEL_COLORS: Record<string, string> = {
  "llama-3.1-8b": "#10b981",
  "llama-3.3-70b": "#6366f1",
  "gpt-oss-20b-free": "#f59e0b",
  "llama-3.2-3b-free": "#ef4444",
};

function safetyColor(score: number) {
  if (score >= 0.8) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  if (score >= 0.5) return "text-amber-400 border-amber-400/30 bg-amber-400/10";
  return "text-red-400 border-red-400/30 bg-red-400/10";
}

export default function DashboardPage() {
  const [evals, setEvals] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluations(50)
      .then(setEvals)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading dashboard...</div>;
  }

  if (evals.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No evaluations yet. Head to Compare and run a prompt to populate the dashboard.
      </div>
    );
  }

  const total = evals.length;
  const avgSafety = evals.reduce((s, e) => s + e.safety_score, 0) / total;
  const avgLatency = evals.reduce((s, e) => s + e.latency_ms, 0) / total;
  const threatsDetected = evals.filter(
    (e) =>
      e.prompt_injection_score > 0.3 ||
      e.jailbreak_score > 0.3 ||
      e.toxicity_score > 0.3 ||
      e.pii_detected
  ).length;

  const kpis = [
    { label: "Total Evaluations", value: total.toString(), Icon: Activity, color: "#10b981" },
    { label: "Avg Safety Score", value: avgSafety.toFixed(2), Icon: Shield, color: "#10b981" },
    { label: "Avg Latency", value: `${Math.round(avgLatency)}ms`, Icon: Zap, color: "#6366f1" },
    { label: "Threats Detected", value: threatsDetected.toString(), Icon: AlertTriangle, color: "#ef4444" },
  ];

  const timelineData = [...evals].reverse().map((e) => ({
    time: new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    safety_score: e.safety_score,
  }));

  const riskCounts = [
    { name: "Injection", value: evals.filter((e) => e.prompt_injection_score > 0.3).length, color: "#ef4444" },
    { name: "Jailbreak", value: evals.filter((e) => e.jailbreak_score > 0.3).length, color: "#f59e0b" },
    { name: "Toxicity", value: evals.filter((e) => e.toxicity_score > 0.3).length, color: "#8b5cf6" },
    { name: "PII Leak", value: evals.filter((e) => e.pii_detected).length, color: "#3b82f6" },
    { name: "Hallucination", value: evals.filter((e) => e.hallucination_score > 0.5).length, color: "#6b7280" },
  ].filter((r) => r.value > 0);

  const uniqueModels = Array.from(new Set(evals.map((e) => e.model)));
  const leaderboard = uniqueModels
    .map((model) => {
      const modelEvals = evals.filter((e) => e.model === model);
      const avg = modelEvals.reduce((s, e) => s + e.safety_score, 0) / modelEvals.length;
      return { model, avg };
    })
    .sort((a, b) => b.avg - a.avg);

  const recent = evals.slice(0, 8);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-medium">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Safety & observability metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="glow-card glow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                <kpi.Icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                {kpi.label}
              </div>
              <div className="text-xl font-mono font-medium">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Safety Score Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis domain={[0, 1]} stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                <Line type="monotone" dataKey="safety_score" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {riskCounts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No threats detected yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={riskCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {riskCounts.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Safety Leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((entry, i) => (
              <div key={entry.model}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{i + 1}. {entry.model}</span>
                  <span className="font-mono">{entry.avg.toFixed(2)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${entry.avg * 100}%`, backgroundColor: MODEL_COLORS[entry.model] || "#10b981" }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Evaluations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                <span className="w-28 truncate font-medium">{e.model}</span>
                <span className="flex-1 truncate text-muted-foreground px-3">{e.prompt}</span>
                <Badge variant="outline" className={safetyColor(e.safety_score)}>
                  {e.safety_score.toFixed(2)}
                </Badge>
                <span className="w-16 text-right font-mono text-xs text-muted-foreground">{e.latency_ms}ms</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}